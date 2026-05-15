import { useEffect, useMemo, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';
import { fetchBrowserEvents, fetchIcpAgents, sendAgentFeedback, startSurveyAutomation, updateBrowserSession } from '../lib/api';
import type { AgentChatMessage, BrowserEvent, BrowserSession, IcpAgentProfile } from '../lib/api';

function sessionLabel(session: BrowserSession, index: number) {
  return session.label || session.action_log.find(event => event.type === 'session_started')?.message.replace(' started.', '') || `Agent ${index + 1}`;
}

export default function IcpAgent() {
  const [agents, setAgents] = useState<IcpAgentProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [surveyGoal, setSurveyGoal] = useState('');
  const [sessions, setSessions] = useState<BrowserSession[]>([]);
  const [eventsBySession, setEventsBySession] = useState<Record<string, BrowserEvent[]>>({});
  const [chat, setChat] = useState<AgentChatMessage[]>([]);
  const [feedback, setFeedback] = useState('');
  const [graphOpen, setGraphOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const selectedAgent = useMemo(
    () => agents.find(agent => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  useEffect(() => {
    fetchIcpAgents().then(({ agents: loaded }) => {
      setAgents(loaded);
      if (loaded[0]) setSelectedAgentId(loaded[0].id);
    });
  }, []);

  async function beginSurveyAutomation() {
    if (!selectedAgent) {
      setStatus('Analyze a real meeting with a target customer before running a customer agent.');
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const response = await startSurveyAutomation({
        target_url: targetUrl || 'about:blank',
        survey_goal: surveyGoal,
        workspace_id: 'default',
        agent_id: selectedAgent.id,
      });
      setSessions(response.sessions);
      setEventsBySession(Object.fromEntries(response.sessions.map(session => [session.id, session.action_log])));
      setChat(response.chat);
      setStatus(response.orchestrator === 'langchain' ? 'Survey agents are coordinating.' : 'Survey agents are running.');
    } catch {
      setStatus('Could not start survey automation.');
    } finally {
      setBusy(false);
    }
  }

  async function applyAction(action: 'pause' | 'resume' | 'takeover' | 'approve-submission') {
    if (!sessions.length) return;
    setBusy(true);
    try {
      const updatedSessions: BrowserSession[] = [];
      const nextEvents: Record<string, BrowserEvent[]> = {};
      for (const session of sessions) {
        if (action === 'approve-submission' && !session.requires_approval) {
          updatedSessions.push(session);
          nextEvents[session.id] = eventsBySession[session.id] ?? session.action_log;
          continue;
        }
        const { session: updated } = await updateBrowserSession(session.id, action);
        const { events } = await fetchBrowserEvents(session.id);
        updatedSessions.push(updated);
        nextEvents[session.id] = events;
      }
      setSessions(updatedSessions);
      setEventsBySession(nextEvents);
      setChat(current => [
        ...current,
        { speaker: 'Coordinator', message: `Applied ${action.replace(/-/g, ' ')} across active browser agents.`, created_at: new Date().toISOString() },
      ]);
    } catch {
      setStatus('Could not update the browser agents.');
    } finally {
      setBusy(false);
    }
  }

  async function applyFeedback(signal: 'positive' | 'negative' | 'correction') {
    if (!selectedAgent || !feedback.trim()) return;
    setBusy(true);
    try {
      const { agent } = await sendAgentFeedback(selectedAgent.id, { signal, note: feedback.trim() });
      setAgents(current => current.map(item => item.id === agent.id ? agent : item));
      setChat(current => [
        ...current,
        { speaker: 'Coordinator', message: `Feedback saved to ${agent.name}'s memory.`, created_at: new Date().toISOString() },
      ]);
      setFeedback('');
    } catch {
      setStatus('Could not apply feedback.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: '100vh', background: '#faf9fd', padding: 18 }}>
      <div className="flex items-center justify-between" style={{ minHeight: 70, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: '18px 18px 0 0', padding: '10px 18px', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#210b2c' }}>Customer Agent Survey Automation</div>
        </div>
        <div className="flex items-center gap-2">
          <div style={{ position: 'relative' }}>
            <select
              value={selectedAgentId}
              onChange={event => setSelectedAgentId(event.target.value)}
              style={{
                appearance: 'none',
                minWidth: 260,
                border: '1px solid rgba(201,184,216,0.9)',
                borderRadius: 12,
                padding: '10px 38px 10px 12px',
                color: '#210b2c',
                background: '#ffffff',
                fontWeight: 800,
              }}
            >
              <option value="">Select customer agent</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
            <KeyboardArrowDownRoundedIcon fontSize="small" style={{ position: 'absolute', right: 10, top: 10, pointerEvents: 'none', color: '#6b2d8b' }} />
          </div>
          <button type="button" onClick={() => setGraphOpen(current => !current)} className="fs-btn-ghost">
            <AccountTreeRoundedIcon fontSize="small" />
            {graphOpen ? 'Hide graph' : 'Show graph'}
          </button>
        </div>
      </div>

      {status && <div style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)', color: 'rgba(88,77,102,0.86)', padding: '9px 18px', fontSize: 12 }}>{status}</div>}

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) 380px', alignItems: 'start', background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
        <main className="flex flex-col" style={{ padding: 14, gap: 12 }}>
          {agents.length === 0 && (
            <div style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14, padding: 14, background: '#faf9fd', color: 'rgba(88,77,102,0.8)', lineHeight: 1.45 }}>
              No customer agents yet. Analyze a real meeting with a target customer to generate one.
            </div>
          )}

          <div className="grid" style={{ gridTemplateColumns: '1.2fr 1.2fr auto', gap: 10, flexShrink: 0 }}>
            <input value={targetUrl} onChange={event => setTargetUrl(event.target.value)} placeholder="Survey or questionnaire URL" style={{ border: '1px solid rgba(201,184,216,0.9)', borderRadius: 12, padding: '10px 12px', color: '#0a0a0f', background: '#faf9fd' }} />
            <input value={surveyGoal} onChange={event => setSurveyGoal(event.target.value)} placeholder="Survey goal" style={{ border: '1px solid rgba(201,184,216,0.9)', borderRadius: 12, padding: '10px 12px', color: '#0a0a0f', background: '#faf9fd' }} />
            <button onClick={beginSurveyAutomation} disabled={busy || !selectedAgent} className="fs-btn-primary">Start 3 agents</button>
          </div>

          {graphOpen && (
            <div style={{ height: 360, flexShrink: 0 }}>
              <KnowledgeGraphPanel compact title="Customer Memory Graph" activeNodeId={selectedAgent?.name} />
            </div>
          )}

          <section className="flex flex-col" style={{ gap: 14 }}>
            {[0, 1, 2].map(index => {
              const session = sessions[index];
              const events = session ? (eventsBySession[session.id] ?? session.action_log) : [];
              return (
                <article key={session?.id ?? index} className="flex flex-col overflow-hidden" style={{ minHeight: session?.live_url ? 480 : 330, border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#faf9fd' }}>
                  <div className="flex items-center justify-between" style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,184,216,0.72)', background: '#ffffff', flexShrink: 0 }}>
                    <p className="fs-label">{session ? sessionLabel(session, index) : `Agent ${index + 1}`}</p>
                    <span className="fs-badge fs-badge-neutral">{session?.status ?? 'idle'}</span>
                  </div>
                  <div className="flex-1 flex items-center justify-center text-center" style={{ minHeight: session?.live_url ? 330 : 190, padding: session?.live_url ? 12 : 22 }}>
                    {session?.live_url ? (
                      <iframe
                        src={session.live_url}
                        title={`${sessionLabel(session, index)} live browser`}
                        style={{ width: '100%', height: 330, border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, background: '#ffffff' }}
                      />
                    ) : (
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#6b2d8b', marginBottom: 8 }}>{session?.current_url || 'Waiting'}</div>
                        <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 22, marginBottom: 8 }}>{session ? 'Browser agent running' : 'Ready'}</div>
                        <p style={{ color: 'rgba(88,77,102,0.78)', lineHeight: 1.45, fontSize: 13, maxWidth: 620 }}>{session ? session.task : 'Start a run to launch this browser agent.'}</p>
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(201,184,216,0.72)', padding: 12, background: '#ffffff' }}>
                    {events.length === 0 ? <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 12 }}>Events will appear here.</p> : events.slice(-4).map(event => (
                      <div key={event.id} style={{ marginBottom: 8 }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#6b2d8b', textTransform: 'uppercase' }}>{event.type}</div>
                        <div style={{ color: '#0a0a0f', fontSize: 12, lineHeight: 1.35 }}>{event.message}</div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>

          <div className="flex gap-2" style={{ flexShrink: 0 }}>
            <button onClick={() => applyAction('pause')} disabled={!sessions.length || busy} className="fs-btn-ghost">Pause all</button>
            <button onClick={() => applyAction('resume')} disabled={!sessions.length || busy} className="fs-btn-ghost">Resume all</button>
            <button onClick={() => applyAction('takeover')} disabled={!sessions.length || busy} className="fs-btn-ghost">Take over</button>
            <button onClick={() => applyAction('approve-submission')} disabled={!sessions.some(session => session.requires_approval) || busy} className="fs-btn-primary">Approve all</button>
          </div>
        </main>

        <aside className="flex flex-col" style={{ position: 'sticky', top: 18, maxHeight: 'calc(100vh - 36px)', borderLeft: '1px solid rgba(201,184,216,0.72)', padding: 14, gap: 12, background: '#ffffff' }}>
          <section className="flex flex-col overflow-hidden" style={{ minHeight: 0, flex: 1, border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14 }}>
            <div style={{ padding: 12, borderBottom: '1px solid rgba(201,184,216,0.72)' }}>
              <p className="fs-label">Agent Chat</p>
            </div>
            <div className="flex-1 overflow-y-auto" style={{ padding: 12 }}>
              {chat.length === 0 ? (
                <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>Start a run to see the browser agents coordinate.</p>
              ) : chat.map((message, index) => (
                <div key={`${message.created_at}-${index}`} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 10, background: message.speaker.includes('Coordinator') ? 'rgba(107,45,139,0.06)' : '#faf9fd', marginBottom: 8 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 5 }}>{message.speaker}</div>
                  <div style={{ color: '#0a0a0f', fontSize: 13, lineHeight: 1.4 }}>{message.message}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-2" style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14, padding: 12 }}>
            <p className="fs-label">Feedback</p>
            <textarea value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Correct or reinforce the customer agent" rows={3} style={{ resize: 'none', border: '1px solid rgba(201,184,216,0.82)', borderRadius: 10, padding: 10, fontSize: 12, color: '#0a0a0f', background: '#faf9fd' }} />
            <div className="flex gap-2">
              <button onClick={() => applyFeedback('positive')} disabled={!selectedAgent || !feedback.trim() || busy} className="fs-btn-ghost">Useful</button>
              <button onClick={() => applyFeedback('correction')} disabled={!selectedAgent || !feedback.trim() || busy} className="fs-btn-ghost">Correct</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
