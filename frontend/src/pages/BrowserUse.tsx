import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth';
import { ingestBrowserSession } from '../lib/api';

const API = import.meta.env.VITE_API_URL as string ?? 'http://localhost:8000';
const MAX_SESSIONS = 3;

interface Persona {
  tester_id: string;
  name: string;
  domain: string | null;
  headline: string | null;
  skills: string[];
  quality_score: number;
  match_score: number;
  form_title: string;
  match_id: string | null;
}

interface RunSession {
  id: string;
  tester_name: string;
  tester_id: string;
  target_url: string;
  status: string;
  live_url: string | null;
  cloud_session_id: string | null;
  screenshot_url: string | null;
  last_step_summary: string | null;
  step_count: number;
  output: string | null;
  is_task_successful: boolean | null;
  recording_urls: string[];
  created_at: string;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const SLOT_COLORS = [
  { grad: 'linear-gradient(135deg, #3d1454, #6b2d8b)', dot: '#a855f7', ring: 'rgba(168,85,247,0.25)' },
  { grad: 'linear-gradient(135deg, #0f4c75, #1b6ca8)', dot: '#38bdf8', ring: 'rgba(56,189,248,0.25)' },
  { grad: 'linear-gradient(135deg, #1a3a1a, #2f8f67)', dot: '#34d399', ring: 'rgba(52,211,153,0.25)' },
];

const STATUS_COLOR: Record<string, string> = {
  running: '#2f8f67',
  completed: '#6b2d8b',
  failed: '#b95465',
  paused: '#f2a58e',
};

// Unique key for each session slot (not session id, which changes on launch)
type SlotIndex = 0 | 1 | 2;

interface Slot {
  persona: Persona | null;
  session: RunSession | null;
  launching: boolean;
  error: string | null;
}

const emptySlot = (): Slot => ({ persona: null, session: null, launching: false, error: null });

export default function BrowserUse() {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(true);
  const [url, setUrl] = useState('');
  const objective = 'Use the search bar to find an AP Calculus tutor or subject and click on a relevant result.';
  const [slots, setSlots] = useState<[Slot, Slot, Slot]>([emptySlot(), emptySlot(), emptySlot()]);

  // Map of session_id → interval id for independent polling
  const pollRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  // Track which sessions have already been ingested into the graph
  const ingestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/browser/tester-personas?founder_id=${user.id}`)
      .then(r => r.json())
      .then(d => setPersonas(d.personas ?? []))
      .catch(() => {})
      .finally(() => setPersonasLoading(false));
  }, [user?.id]);

  // Start polling for a specific slot/session
  const startPoll = useCallback((slotIdx: SlotIndex, sessionId: string) => {
    if (pollRefs.current.has(sessionId)) return;
    const iv = setInterval(() => {
      fetch(`${API}/browser/persona-test/${sessionId}`)
        .then(r => r.json())
        .then(d => {
          if (!d.session) return;
          const updated: RunSession = d.session;
          setSlots(prev => {
            const next = [...prev] as [Slot, Slot, Slot];
            next[slotIdx] = { ...next[slotIdx], session: updated };
            return next;
          });
          if (updated.status === 'completed' || updated.status === 'failed') {
            clearInterval(pollRefs.current.get(sessionId));
            pollRefs.current.delete(sessionId);
            // Ingest into knowledge graph once on completion
            if (!ingestedRef.current.has(sessionId) && updated.status === 'completed') {
              ingestedRef.current.add(sessionId);
              ingestBrowserSession({
                sessionId: updated.id,
                testerId: updated.tester_id,
                testerName: updated.tester_name,
                targetUrl: updated.target_url,
                output: updated.output,
                lastStepSummary: updated.last_step_summary,
                stepCount: updated.step_count,
                isTaskSuccessful: updated.is_task_successful,
              }).catch(() => {});
            }
          }
        })
        .catch(() => {});
    }, 3500);
    pollRefs.current.set(sessionId, iv);
  }, []);

  // Clean up all polls on unmount
  useEffect(() => {
    return () => { pollRefs.current.forEach(iv => clearInterval(iv)); };
  }, []);

  function setSlotPersona(idx: SlotIndex, persona: Persona | null) {
    setSlots(prev => {
      const next = [...prev] as [Slot, Slot, Slot];
      next[idx] = { ...next[idx], persona };
      return next;
    });
  }

  async function launchSlot(idx: SlotIndex) {
    const slot = slots[idx];
    if (!slot.persona || !url.trim() || !user?.id || slot.launching) return;
    setSlots(prev => {
      const next = [...prev] as [Slot, Slot, Slot];
      next[idx] = { ...next[idx], launching: true, error: null };
      return next;
    });
    try {
      const r = await fetch(`${API}/browser/persona-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_url: url.trim(),
          tester_id: slot.persona.tester_id,
          founder_id: user.id,
          objective: objective.trim(),
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${r.status}`);
      }
      const data = await r.json();
      const s = data.session as RunSession;
      setSlots(prev => {
        const next = [...prev] as [Slot, Slot, Slot];
        next[idx] = { ...next[idx], session: s, launching: false };
        return next;
      });
      startPoll(idx, s.id);
    } catch (e) {
      setSlots(prev => {
        const next = [...prev] as [Slot, Slot, Slot];
        next[idx] = { ...next[idx], launching: false, error: String((e as Error).message ?? e) };
        return next;
      });
    }
  }

  async function launchAll() {
    const runnable = ([0, 1, 2] as SlotIndex[]).filter(i => slots[i].persona && !slots[i].session && !slots[i].launching);
    await Promise.all(runnable.map(i => launchSlot(i)));
  }

  function clearSlot(idx: SlotIndex) {
    const s = slots[idx].session;
    if (s) {
      const iv = pollRefs.current.get(s.id);
      if (iv) { clearInterval(iv); pollRefs.current.delete(s.id); }
    }
    setSlots(prev => {
      const next = [...prev] as [Slot, Slot, Slot];
      next[idx] = emptySlot();
      return next;
    });
  }

  const anyPersonaSet = slots.some(s => s.persona !== null);
  const anyRunning = slots.some(s => s.session?.status === 'running');
  const allDone = slots.filter(s => s.session).every(s => s.session!.status !== 'running');
  const canLaunchAll = anyPersonaSet && slots.some(s => s.persona && !s.session && !s.launching);

  const activeSlotsCount = slots.filter(s => s.session).length;

  return (
    <div style={{ display: 'flex', height: '100%', background: '#0a0611', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse-dot { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes fade-in { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Left panel ── */}
      <div style={{
        width: 300, flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.03)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#f0ebff' }}>Browser Use</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'rgba(168,85,247,0.5)', marginTop: 3, letterSpacing: '0.12em' }}>
            PARALLEL PERSONA TESTING
          </div>
        </div>

        {/* URL */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'rgba(168,85,247,0.45)', letterSpacing: '0.1em', marginBottom: 7 }}>
            TARGET URL
          </div>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://yourapp.com"
            style={{
              width: '100%', height: 36, padding: '0 11px',
              borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 12, color: '#f0ebff', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 3 slot pickers */}
        {([0, 1, 2] as SlotIndex[]).map(idx => {
          const slot = slots[idx];
          const color = SLOT_COLORS[idx];
          const hasSession = !!slot.session;

          return (
            <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Slot label */}
              <div style={{ padding: '12px 18px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: color.grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700, color: '#fff',
                }}>
                  {idx + 1}
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
                  AGENT {idx + 1}
                </div>
                {hasSession && (
                  <button
                    onClick={() => clearSlot(idx)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 2 }}
                    title="Clear slot"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Persona picker or session status */}
              <div style={{ padding: '0 18px 12px' }}>
                {hasSession ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 9,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: color.grad,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: '#fff',
                    }}>
                      {initials(slot.session!.tester_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#f0ebff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slot.session!.tester_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <div style={{
                          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                          background: STATUS_COLOR[slot.session!.status] ?? 'rgba(255,255,255,0.3)',
                          animation: slot.session!.status === 'running' ? 'pulse-dot 1.4s ease infinite' : 'none',
                        }} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: STATUS_COLOR[slot.session!.status] ?? 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                          {slot.session!.status}{slot.session!.step_count > 0 ? ` · step ${slot.session!.step_count}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {personasLoading ? (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: '6px 0' }}>Loading…</div>
                    ) : personas.length === 0 ? (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', lineHeight: 1.5 }}>
                        No personas yet. Run an interview first.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {personas.map(p => {
                          const selected = slot.persona?.tester_id === p.tester_id;
                          return (
                            <button
                              key={p.tester_id}
                              onClick={() => setSlotPersona(idx, selected ? null : p)}
                              style={{
                                width: '100%', textAlign: 'left',
                                padding: '7px 10px', borderRadius: 8,
                                border: selected ? `1px solid ${color.dot}50` : '1px solid rgba(255,255,255,0.07)',
                                background: selected ? `${color.ring}` : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.1s',
                              }}
                            >
                              <div style={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                background: selected ? color.grad : 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 9, fontWeight: 800, color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
                              }}>
                                {initials(p.name)}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: selected ? '#f0ebff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.name}
                                </div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.domain ?? 'General'} · {p.match_score}%
                                </div>
                              </div>
                              {selected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color.dot, flexShrink: 0 }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {slot.persona && !hasSession && (
                      <button
                        onClick={() => launchSlot(idx)}
                        disabled={!url.trim() || slot.launching}
                        style={{
                          width: '100%', height: 34, borderRadius: 9, marginTop: 8,
                          background: url.trim() && !slot.launching ? color.grad : 'rgba(255,255,255,0.06)',
                          border: 'none',
                          color: url.trim() ? '#fff' : 'rgba(255,255,255,0.25)',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 12, cursor: url.trim() && !slot.launching ? 'pointer' : 'default',
                          transition: 'all 0.12s',
                        }}
                      >
                        {slot.launching ? 'Launching…' : `▶ Launch Agent ${idx + 1}`}
                      </button>
                    )}

                    {slot.error && (
                      <div style={{ fontSize: 10, color: '#f87171', marginTop: 6, lineHeight: 1.4 }}>{slot.error}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Launch All button */}
        <div style={{ padding: '14px 18px' }}>
          <button
            onClick={launchAll}
            disabled={!canLaunchAll || !url.trim()}
            style={{
              width: '100%', height: 42, borderRadius: 11,
              background: canLaunchAll && url.trim()
                ? 'linear-gradient(135deg, #3d1454 0%, #6b2d8b 50%, #1b6ca8 100%)'
                : 'rgba(255,255,255,0.05)',
              border: canLaunchAll && url.trim() ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: canLaunchAll && url.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 13,
              cursor: canLaunchAll && url.trim() ? 'pointer' : 'default',
              transition: 'all 0.15s',
              letterSpacing: '0.02em',
            }}
          >
            ⚡ Launch All Agents
          </button>
        </div>
      </div>

      {/* ── Right panel: vertically stacked sessions ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {activeSlotsCount === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 16, padding: 40, textAlign: 'center',
          }}>
            <div style={{ fontSize: 52, filter: 'grayscale(0.3)' }}>🤖</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: 'rgba(240,235,255,0.9)' }}>
              3 agents. 1 URL. All at once.
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', maxWidth: 380, lineHeight: 1.7 }}>
              Assign a persona to each agent slot, enter your URL, and launch all three in parallel to see how different users navigate your product simultaneously.
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {SLOT_COLORS.map((c, i) => (
                <div key={i} style={{
                  width: 40, height: 40, borderRadius: '50%', background: c.grad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff',
                }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        ) : (
          ([0, 1, 2] as SlotIndex[])
            .filter(i => slots[i].session)
            .map(idx => <SessionRow key={slots[idx].session!.id} slot={slots[idx]} slotIdx={idx} objective={objective} />)
        )}
      </div>
    </div>
  );
}

/* ── Session Row (one per active agent) ── */
function SessionRow({ slot, slotIdx, objective }: { slot: Slot; slotIdx: SlotIndex; objective: string }) {
  const session = slot.session!;
  const color = SLOT_COLORS[slotIdx];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      minHeight: 320,
      animation: 'fade-in 0.25s ease',
    }}>
      {/* Row header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: color.grad,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 11, color: '#fff',
        }}>
          {initials(session.tester_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#f0ebff', display: 'flex', alignItems: 'center', gap: 8 }}>
            {session.tester_name}
            <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
              {session.target_url}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: STATUS_COLOR[session.status] ?? 'rgba(255,255,255,0.3)',
              animation: session.status === 'running' ? 'pulse-dot 1.2s ease infinite' : 'none',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: STATUS_COLOR[session.status] ?? 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {session.status}
            </span>
            {session.step_count > 0 && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
                · step {session.step_count}
              </span>
            )}
            {session.last_step_summary && (
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.4)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500,
                marginLeft: 4,
              }}>
                {session.last_step_summary}
              </span>
            )}
          </div>
        </div>

        {/* Objective pill */}
        <div style={{
          fontSize: 10, color: `${color.dot}99`,
          background: `${color.ring}`,
          border: `1px solid ${color.dot}30`,
          borderRadius: 7, padding: '3px 9px',
          flexShrink: 0, maxWidth: 280,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          🎯 {objective}
        </div>

        {/* Live view link */}
        {session.live_url && (
          <a
            href={session.live_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0, fontSize: 11, fontWeight: 700,
              color: color.dot, textDecoration: 'none',
              padding: '4px 10px', borderRadius: 7,
              border: `1px solid ${color.dot}30`,
              background: `${color.ring}`,
            }}
          >
            ↗ Live
          </a>
        )}
      </div>

      {/* Screenshot + result */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Screenshot */}
        <div style={{ flex: 1, background: '#08050f', position: 'relative', overflow: 'hidden', minHeight: 280 }}>
          {session.screenshot_url ? (
            <img
              key={session.screenshot_url}
              src={session.screenshot_url}
              alt="agent screenshot"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ position: 'relative', width: 44, height: 44 }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `2px solid ${color.dot}20`,
                }} />
                <div style={{
                  position: 'absolute', inset: 6, borderRadius: '50%',
                  border: `2px solid ${color.dot}20`,
                  borderTop: `2px solid ${color.dot}`,
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: `${color.dot}60`, letterSpacing: '0.06em' }}>
                {session.status === 'running' ? 'STARTING…' : 'NO SCREENSHOT'}
              </div>
            </div>
          )}

          {/* Step badge overlay */}
          {session.step_count > 0 && (
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
              borderRadius: 7, padding: '3px 9px',
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: color.dot, display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color.dot, animation: session.status === 'running' ? 'pulse-dot 1.2s ease infinite' : 'none' }} />
              Step {session.step_count}
            </div>
          )}
        </div>

        {/* Compact result sidebar */}
        {(session.status === 'completed' || session.status === 'failed' || session.last_step_summary) && (
          <div style={{
            width: 240, flexShrink: 0,
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            padding: '14px 14px',
            overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {session.status === 'completed' && (
              <>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 7,
                  background: session.is_task_successful ? 'rgba(47,143,103,0.12)' : 'rgba(185,84,101,0.12)',
                  border: `1px solid ${session.is_task_successful ? 'rgba(47,143,103,0.3)' : 'rgba(185,84,101,0.3)'}`,
                  fontSize: 11, fontWeight: 700,
                  color: session.is_task_successful ? '#34d399' : '#f87171',
                  alignSelf: 'flex-start',
                }}>
                  {session.is_task_successful ? '✓ Done' : '✗ Failed'}
                </div>
                {session.output && (
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6,
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    padding: '10px 11px', border: '1px solid rgba(255,255,255,0.06)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {session.output}
                  </div>
                )}
              </>
            )}

            {session.status === 'failed' && session.output && (
              <div style={{
                fontSize: 11, color: '#f87171', lineHeight: 1.5,
                background: 'rgba(185,84,101,0.07)', borderRadius: 8,
                padding: '10px 11px', border: '1px solid rgba(185,84,101,0.2)',
              }}>
                {session.output}
              </div>
            )}

            {session.status === 'running' && session.last_step_summary && (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {session.last_step_summary}
              </div>
            )}

            {session.recording_urls.length > 0 && (
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', marginBottom: 6 }}>
                  RECORDINGS
                </div>
                {session.recording_urls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', fontSize: 11, color: color.dot, fontWeight: 600, marginBottom: 3, textDecoration: 'none' }}
                  >
                    ▶ Recording {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
