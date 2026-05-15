import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';
import { fetchIcpAgents, sendAgentFeedback, sendSimulationTurn, startIcpSimulation } from '../lib/api';
import type { IcpAgentProfile, LiveIntelligenceState, Segment } from '../lib/api';

const EMPTY_INTELLIGENCE: LiveIntelligenceState = {
  intent: {
    phase: 'rapport',
    confidence: 0.2,
    intent_signal: 'Select a customer agent derived from a real meeting to start.',
    recommended_questions: ['Can you walk me through the last time this problem came up?', 'What are you doing today to work around it?'],
    momentum: 'opening',
  },
  bias_events: [],
  bias_pressure_score: 0,
  quality_score: 50,
  talk_time: { founder_ratio: 0, user_ratio: 0, alert: null },
  topic_drift: { drifting: false, current_topic: null, redirect_question: null },
  quotes: [],
  analyzed_segment_count: 0,
  generated_at: new Date().toISOString(),
  degraded: [],
};

export default function Simulator() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<IcpAgentProfile[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [roomName, setRoomName] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [intelligence, setIntelligence] = useState<LiveIntelligenceState>(EMPTY_INTELLIGENCE);
  const [question, setQuestion] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAgent = useMemo(() => agents.find(agent => agent.id === selectedAgentId) ?? null, [agents, selectedAgentId]);
  const active = !!roomName;

  useEffect(() => {
    fetchIcpAgents().then(({ agents: loaded }) => {
      setAgents(loaded);
      if (loaded[0]) setSelectedAgentId(loaded[0].id);
    });
  }, []);

  async function handleStart() {
    if (!selectedAgent) {
      setError('Analyze a real meeting with a target customer before starting a simulation.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await startIcpSimulation(selectedAgent.id);
      setRoomName(session.room_name);
      setSegments(session.segments);
      setIntelligence(session.intelligence);
    } catch {
      setError('Could not start the ICP interview simulation.');
    } finally {
      setBusy(false);
    }
  }

  async function handleAsk(event: FormEvent) {
    event.preventDefault();
    if (!roomName || !question.trim()) return;
    const nextQuestion = question.trim();
    setQuestion('');
    setBusy(true);
    setError(null);
    try {
      const response = await sendSimulationTurn(roomName, nextQuestion);
      setSegments(response.segments);
      setIntelligence(response.intelligence);
    } catch {
      setError('The ICP agent could not answer. Check the model key and try again.');
      setQuestion(nextQuestion);
    } finally {
      setBusy(false);
    }
  }

  async function handleFeedback(signal: 'positive' | 'negative' | 'correction') {
    if (!selectedAgent || !feedback.trim()) return;
    setBusy(true);
    try {
      const { agent } = await sendAgentFeedback(selectedAgent.id, { signal, note: feedback.trim() });
      setAgents(current => current.map(item => item.id === agent.id ? agent : item));
      setFeedback('');
    } catch {
      setError('Could not apply feedback to the ICP agent.');
    } finally {
      setBusy(false);
    }
  }

  function handleOpenAnalysis() {
    if (!roomName) return;
    navigate(`/analysis/${roomName}`);
  }

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: '#faf9fd', padding: 14, height: '100vh' }}>
      <div className="flex items-center justify-between" style={{ minHeight: 56, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: '18px 18px 0 0', padding: '8px 18px', gap: 18, flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#210b2c' }}>Customer Agent Interview Simulator</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>{active ? `ACTIVE · ${selectedAgent?.name ?? 'customer agent'}` : 'REAL-MEETING CUSTOMER MEMORY'}</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="fs-badge fs-badge-purple">{selectedAgent?.name ?? 'No agent'}</span>
          {active && <button onClick={handleOpenAnalysis} disabled={segments.length === 0} className="fs-btn-primary">Open analysis</button>}
        </div>
      </div>

      {error && <div style={{ background: 'rgba(185,84,101,0.08)', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)', color: 'var(--red)', padding: '9px 18px', fontSize: 12, flexShrink: 0 }}>{error}</div>}

      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '300px minmax(0, 1fr) 360px', minHeight: 0, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
        <aside className="flex flex-col overflow-y-auto" style={{ borderRight: '1px solid rgba(201,184,216,0.72)', padding: 12, gap: 10 }}>
          <div className="flex flex-col gap-2">
            <p className="fs-label">Real Customer Agents</p>
            {agents.length === 0 ? (
              <div style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14, padding: 12, background: '#faf9fd' }}>
                <div style={{ color: '#210b2c', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>No customer agents yet</div>
                <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>
                  Analyze a real meeting with a target customer. The simulator will use that customer's memory once the agent exists.
                </p>
              </div>
            ) : agents.map(agent => (
              <button key={agent.id} disabled={active} onClick={() => setSelectedAgentId(agent.id)} style={{ textAlign: 'left', border: `1px solid ${selectedAgentId === agent.id ? '#6b2d8b' : 'rgba(201,184,216,0.72)'}`, borderRadius: 12, padding: 11, background: selectedAgentId === agent.id ? 'rgba(107,45,139,0.08)' : '#ffffff', cursor: active ? 'default' : 'pointer' }}>
                <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 13 }}>{agent.name}</div>
                <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 4 }}>{agent.target_customer}</div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {!active ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h1 style={{ fontWeight: 800, fontSize: 26, color: '#0a0a0f', marginBottom: 8 }}>Talk to a real customer agent</h1>
                <p style={{ color: '#584d66', fontSize: 13, lineHeight: 1.5, maxWidth: 500, marginBottom: 18 }}>Customer agents come from analyzed real meetings. They are reinforced by feedback and grounded in the customer's transcript graph.</p>
                <button onClick={handleStart} disabled={busy || !selectedAgent} className="fs-btn-primary" style={{ padding: '10px 22px' }}>{busy ? 'Starting...' : `Start with ${selectedAgent?.name ?? 'agent'}`}</button>
              </div>
            ) : segments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 style={{ fontWeight: 800, fontSize: 22, color: '#0a0a0f', marginBottom: 8 }}>Ask your first question</h2>
                <p style={{ color: '#584d66', fontSize: 14 }}>The knowledge graph will highlight context as the agent answers.</p>
              </div>
            ) : segments.map((segment, i) => {
              const founder = segment.speaker === 'founder';
              return (
                <div key={`${segment.timestamp_ms}-${i}`} className="fade-in" style={{ alignSelf: founder ? 'flex-end' : 'flex-start', maxWidth: '74%' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', marginBottom: 5, textAlign: founder ? 'right' : 'left' }}>{founder ? 'FOUNDER' : (selectedAgent?.name ?? 'ICP AGENT').toUpperCase()}</div>
                  <div style={{ background: founder ? '#3d1454' : 'rgba(201,184,216,0.26)', color: founder ? '#ffffff' : '#0a0a0f', border: founder ? '1px solid #3d1454' : '1px solid rgba(201,184,216,0.8)', borderRadius: 18, padding: '13px 16px', fontSize: 14, lineHeight: 1.55 }}>{segment.text}</div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleAsk} className="flex items-center gap-3" style={{ borderTop: '1px solid var(--border-subtle)', padding: 12, background: '#ffffff', flexShrink: 0 }}>
            <input value={question} onChange={event => setQuestion(event.target.value)} disabled={!active || busy} placeholder={active ? 'Ask your next interview question...' : 'Start a simulation to ask questions'} style={{ flex: 1, border: '1px solid rgba(201,184,216,0.9)', borderRadius: 999, padding: '10px 16px', fontSize: 14, color: '#0a0a0f', background: '#faf9fd' }} />
            <button type="submit" disabled={!active || busy || !question.trim()} className="fs-btn-primary">{busy ? 'Sending...' : 'Ask'}</button>
          </form>
        </main>

        <aside className="flex flex-col overflow-hidden" style={{ borderLeft: '1px solid rgba(201,184,216,0.72)', padding: 12, gap: 10 }}>
          <KnowledgeGraphPanel compact title="Speaking Context" activeNodeId={selectedAgent?.name} />
          <section style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14, padding: 12, background: '#ffffff' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <p className="fs-label">Live Coaching</p>
              <span className="fs-badge fs-badge-neutral">{intelligence.intent.momentum}</span>
            </div>
            <div style={{ color: '#210b2c', fontWeight: 800, fontSize: 13, marginBottom: 5 }}>{intelligence.intent.phase.replace(/_/g, ' ')}</div>
            <p style={{ color: 'rgba(88,77,102,0.78)', fontSize: 12, lineHeight: 1.45 }}>{intelligence.intent.intent_signal}</p>
            <div style={{ marginTop: 12 }}>
              <p className="fs-label" style={{ marginBottom: 6 }}>Next Questions</p>
              {intelligence.intent.recommended_questions.slice(0, 2).map((item, index) => <div key={`${item}-${index}`} style={{ background: 'rgba(107,45,139,0.06)', border: '1px solid rgba(107,45,139,0.14)', borderRadius: 10, padding: 9, color: '#0a0a0f', fontSize: 11, lineHeight: 1.35, marginBottom: 6 }}>{item}</div>)}
            </div>
          </section>
          <section className="flex flex-col gap-2" style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 14, padding: 12, background: '#ffffff' }}>
            <p className="fs-label">Reinforcement</p>
            <textarea value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Add feedback to update the ICP graph" rows={3} style={{ resize: 'none', border: '1px solid rgba(201,184,216,0.82)', borderRadius: 10, padding: 10, fontSize: 12, color: '#0a0a0f', background: '#faf9fd' }} />
            <div className="flex gap-2">
              <button onClick={() => handleFeedback('positive')} disabled={!selectedAgent || !feedback.trim() || busy} className="fs-btn-ghost">Useful</button>
              <button onClick={() => handleFeedback('correction')} disabled={!selectedAgent || !feedback.trim() || busy} className="fs-btn-ghost">Correct</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
