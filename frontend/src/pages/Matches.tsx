import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchMatches, setMatchStatus } from '../lib/matches';
import type { TesterMatch, MatchStatus } from '../lib/matches';
import { useAuth } from '../lib/auth';

const DEMO_FOUNDER_ID = import.meta.env.VITE_DEMO_FOUNDER_ID as string | undefined;

const DOMAIN_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  MedTech:     { bg: 'rgba(47,143,103,0.08)',  text: '#2f8f67', border: 'rgba(47,143,103,0.22)' },
  SaaS:        { bg: 'rgba(107,45,139,0.08)',  text: '#6b2d8b', border: 'rgba(107,45,139,0.22)' },
  EdTech:      { bg: 'rgba(242,165,142,0.12)', text: '#b95465', border: 'rgba(242,165,142,0.35)' },
  FinTech:     { bg: 'rgba(59,130,246,0.08)',  text: '#1d4ed8', border: 'rgba(59,130,246,0.22)' },
  VehicleTech: { bg: 'rgba(245,158,11,0.08)',  text: '#b45309', border: 'rgba(245,158,11,0.22)' },
};

function ScoreDial({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 85 ? '#2f8f67' : score >= 70 ? '#f2a58e' : '#b95465';
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width={72} height={72} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
        <circle cx={36} cy={36} r={r} fill="none" stroke="rgba(201,184,216,0.35)" strokeWidth={5} />
        <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#210b2c', lineHeight: 1 }}>{score}%</div>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: 'rgba(88,77,102,0.6)', marginTop: 2 }}>MATCH</div>
      </div>
    </div>
  );
}

function TesterAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(107,45,139,0.14), rgba(242,165,142,0.18))',
      border: '1px solid rgba(201,184,216,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: 14, color: '#6b2d8b',
    }}>
      {initials}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid rgba(201,184,216,0.5)', borderRadius: 16, padding: '16px 20px', background: '#faf9fd', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(201,184,216,0.25)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'rgba(201,184,216,0.3)' }} />
        <div style={{ width: '65%', height: 10, borderRadius: 6, background: 'rgba(201,184,216,0.2)' }} />
      </div>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(201,184,216,0.2)' }} />
    </div>
  );
}

export default function Matches() {
  const { user, isLoading: authLoading } = useAuth();
  const [matches, setMatches] = useState<TesterMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [domainFilter, setDomainFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'match' | 'quality' | 'hours'>('match');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until auth finishes initializing
    if (authLoading) return;

    const founderId = user?.id;
    if (!founderId) {
      // Auth done, no user logged in — stop skeleton
      setLoading(false);
      return;
    }

    setLoading(true);
    setUsingDemo(false);
    setError(null);

    fetchMatches(founderId)
      .then(async (result) => {
        if (result.length === 0 && DEMO_FOUNDER_ID && founderId !== DEMO_FOUNDER_ID) {
          const demo = await fetchMatches(DEMO_FOUNDER_ID);
          setUsingDemo(demo.length > 0);
          setMatches(demo);
        } else {
          setMatches(result);
        }
      })
      .catch(e => setError(String(e?.message ?? e)))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  async function act(id: string, status: MatchStatus) {
    setActing(id);
    try {
      await setMatchStatus(id, status);
      setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  }

  const domains = useMemo(() => {
    const d = [...new Set(matches.map(m => m.domain).filter(Boolean))] as string[];
    return ['All', ...d.sort()];
  }, [matches]);

  const rows = useMemo(() => {
    let list = [...matches];
    if (filter !== 'all') list = list.filter(m => m.status === filter);
    if (domainFilter !== 'All') list = list.filter(m => m.domain === domainFilter);
    list.sort((a, b) => {
      if (sortBy === 'quality') return b.qualityScore - a.qualityScore;
      if (sortBy === 'hours') return b.totalHours - a.totalHours;
      return b.matchScore - a.matchScore;
    });
    return list;
  }, [matches, filter, domainFilter, sortBy]);

  const counts = useMemo(() => ({
    pending: matches.filter(m => m.status === 'pending').length,
    accepted: matches.filter(m => m.status === 'accepted').length,
  }), [matches]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#faf9fd', padding: 24 }}>

      {/* Header */}
      <div className="flex items-center justify-between" style={{
        minHeight: 72, background: '#ffffff',
        border: '1px solid rgba(201,184,216,0.8)', borderRadius: '20px 20px 0 0',
        padding: '12px 24px', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#210b2c' }}>Tester Matches</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>
            DOMAIN-MATCHED BETA TESTERS FOR YOUR STUDY
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.5)' }}>Loading…</span>
          ) : (
            <>
              <span className="fs-badge fs-badge-purple">{counts.pending} pending</span>
              <span className="fs-badge fs-badge-gold">{counts.accepted} accepted</span>
            </>
          )}
        </div>
      </div>

      {/* Demo data banner */}
      {usingDemo && (
        <div style={{
          background: 'rgba(242,165,142,0.10)', border: '1px solid rgba(242,165,142,0.4)',
          borderTop: 'none', padding: '8px 24px',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#b95465',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700 }}>DEMO</span>
          Showing seeded testers — post a validation form to see matches for your study.
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        borderLeft: '1px solid rgba(201,184,216,0.8)',
        borderRight: '1px solid rgba(201,184,216,0.8)',
        borderBottom: '1px solid rgba(201,184,216,0.45)',
        padding: '10px 24px',
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flexShrink: 0,
      }}>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'accepted', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              height: 30, padding: '0 12px', borderRadius: 8, cursor: 'pointer',
              border: filter === f ? '1px solid rgba(107,45,139,0.4)' : '1px solid rgba(201,184,216,0.6)',
              background: filter === f ? 'rgba(107,45,139,0.08)' : 'transparent',
              color: filter === f ? '#6b2d8b' : 'rgba(88,77,102,0.72)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
              textTransform: 'capitalize',
            }}>{f}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(201,184,216,0.6)' }} />

        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(88,77,102,0.55)', letterSpacing: '0.08em' }}>DOMAIN</span>
          <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} style={{
            height: 30, padding: '0 8px', borderRadius: 8,
            border: '1px solid rgba(201,184,216,0.6)', background: '#faf9fd', color: '#210b2c',
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 12, outline: 'none',
          }}>
            {domains.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(201,184,216,0.6)' }} />

        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(88,77,102,0.55)', letterSpacing: '0.08em' }}>SORT</span>
          {([['match', 'Match %'], ['quality', 'Quality'], ['hours', 'Hours']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setSortBy(val)} style={{
              height: 30, padding: '0 10px', borderRadius: 8, cursor: 'pointer',
              border: sortBy === val ? '1px solid rgba(242,165,142,0.5)' : '1px solid rgba(201,184,216,0.6)',
              background: sortBy === val ? 'rgba(242,165,142,0.1)' : 'transparent',
              color: sortBy === val ? '#b95465' : 'rgba(88,77,102,0.72)',
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
            }}>{label}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.45)' }}>
          {!loading && `${rows.length} testers`}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto" style={{
        background: '#ffffff',
        border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none',
        borderRadius: '0 0 20px 20px',
        padding: 20, display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {error && (
          <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(185,84,101,0.06)', border: '1px solid rgba(185,84,101,0.2)', color: '#b95465', fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading && !error && [0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}

        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-1 items-center justify-center" style={{ color: 'rgba(88,77,102,0.5)', fontSize: 13 }}>
            No matches in this filter.
          </div>
        )}

        {rows.map(m => {
          const domainColor = DOMAIN_COLORS[m.domain ?? ''] ?? { bg: 'rgba(107,45,139,0.06)', text: '#6b2d8b', border: 'rgba(107,45,139,0.2)' };
          const isExpanded = expanded === m.id;
          const isActing = acting === m.id;

          return (
            <div key={m.id} style={{
              border: m.status === 'accepted'
                ? '1px solid rgba(47,143,103,0.3)'
                : m.status === 'rejected'
                ? '1px solid rgba(201,184,216,0.35)'
                : '1px solid rgba(201,184,216,0.72)',
              borderRadius: 16,
              background: m.status === 'accepted' ? 'rgba(47,143,103,0.025)' : m.status === 'rejected' ? 'rgba(201,184,216,0.05)' : '#faf9fd',
              opacity: m.status === 'rejected' ? 0.52 : 1,
              transition: 'all 0.2s',
            }}>
              <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>

                <TesterAvatar name={m.name} />

                {/* Identity */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#210b2c' }}>{m.name}</span>
                    {m.pronouns && <span style={{ fontSize: 11, color: 'rgba(88,77,102,0.5)' }}>{m.pronouns}</span>}
                    {m.isTopVoice && (
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700,
                        background: 'rgba(242,165,142,0.12)', border: '1px solid rgba(242,165,142,0.4)',
                        color: '#b95465', borderRadius: 6, padding: '2px 7px',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>Top Voice</span>
                    )}
                    {m.domain && (
                      <span style={{
                        fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '2px 8px',
                        background: domainColor.bg, color: domainColor.text, border: `1px solid ${domainColor.border}`,
                      }}>{m.domain}</span>
                    )}
                  </div>
                  {m.headline && <div style={{ fontSize: 12, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>{m.headline}</div>}
                  <div style={{ fontSize: 12, color: 'rgba(88,77,102,0.5)', marginTop: 2 }}>
                    Study: <span style={{ fontWeight: 600, color: '#6b2d8b' }}>{m.formTitle}</span>
                    {m.testingTypes.length > 0 && <> · {m.testingTypes.join(', ')}</>}
                    {m.timezone && <> · {m.timezone}</>}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                  {[
                    { label: 'Quality', value: m.qualityScore.toFixed(1), accent: true },
                    { label: 'Tested', value: String(m.projectsTested), accent: false },
                    { label: 'Hours', value: String(m.totalHours), accent: false },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', minWidth: 40 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#210b2c', lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(88,77,102,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <ScoreDial score={m.matchScore} />

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  {m.status === 'pending' ? (
                    <>
                      <button onClick={() => navigate(`/meeting/${m.id}`)} disabled={isActing} style={{
                        height: 32, padding: '0 16px', borderRadius: 8, cursor: isActing ? 'default' : 'pointer',
                        background: 'rgba(47,143,103,0.08)', border: '1px solid rgba(47,143,103,0.35)',
                        color: '#2f8f67', fontWeight: 700, fontSize: 12,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: isActing ? 0.6 : 1,
                      }}>✓ Invite</button>
                      <button onClick={() => act(m.id, 'rejected')} disabled={isActing} style={{
                        height: 32, padding: '0 16px', borderRadius: 8, cursor: isActing ? 'default' : 'pointer',
                        background: 'transparent', border: '1px solid rgba(201,184,216,0.6)',
                        color: 'rgba(88,77,102,0.72)', fontWeight: 600, fontSize: 12,
                        fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: isActing ? 0.6 : 1,
                      }}>✕ Pass</button>
                    </>
                  ) : m.status === 'accepted' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#2f8f67', fontWeight: 700 }}>INVITED</div>
                      <button onClick={() => act(m.id, 'pending')} style={{ fontSize: 10, color: 'rgba(88,77,102,0.45)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>undo</button>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.45)', fontWeight: 700 }}>PASSED</div>
                      <button onClick={() => act(m.id, 'pending')} style={{ fontSize: 10, color: 'rgba(88,77,102,0.45)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>undo</button>
                    </div>
                  )}
                </div>

                {/* Expand */}
                <button onClick={() => setExpanded(isExpanded ? null : m.id)} style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  border: '1px solid rgba(201,184,216,0.6)',
                  background: isExpanded ? 'rgba(107,45,139,0.06)' : 'transparent',
                  color: 'rgba(88,77,102,0.6)', cursor: 'pointer', fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s',
                }}>▾</button>
              </div>

              {isExpanded && (
                <div className="fade-in" style={{
                  borderTop: '1px solid rgba(201,184,216,0.4)',
                  padding: '14px 20px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16,
                  background: 'rgba(250,249,253,0.7)',
                }}>
                  <div>
                    <p className="fs-label" style={{ marginBottom: 6 }}>Experience</p>
                    <p style={{ fontSize: 13, color: '#0a0a0f', lineHeight: 1.5 }}>{m.livedExperience ?? '—'}</p>
                  </div>
                  <div>
                    <p className="fs-label" style={{ marginBottom: 6 }}>Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {m.skills.length ? m.skills.map(s => (
                        <span key={s} style={{
                          fontSize: 11, fontWeight: 600, borderRadius: 6, padding: '3px 9px',
                          background: 'rgba(107,45,139,0.06)', border: '1px solid rgba(107,45,139,0.18)', color: '#6b2d8b',
                        }}>{s}</span>
                      )) : <span style={{ fontSize: 12, color: 'rgba(88,77,102,0.5)' }}>—</span>}
                    </div>
                  </div>
                  <div>
                    <p className="fs-label" style={{ marginBottom: 6 }}>Availability</p>
                    <p style={{ fontSize: 13, color: '#0a0a0f' }}>{m.availability ?? '—'}</p>
                    <p className="fs-label" style={{ marginTop: 10, marginBottom: 6 }}>Testing types</p>
                    <p style={{ fontSize: 13, color: '#0a0a0f' }}>{m.testingTypes.join(' · ') || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
