import type { AIAgent } from '../../lib/personas';

export type { AIAgent };

interface Props {
  agent: AIAgent;
  onView: (agent: AIAgent) => void;
  onToggle: (id: string) => void;
}

const STATUS = {
  available: { label: 'Invite ready', color: '#3d1454', bg: 'rgba(247,217,196,0.42)', border: '#f2a58e' },
  in_survey:  { label: 'In review',  color: '#3d1454', bg: 'rgba(107,45,139,0.12)', border: '#6b2d8b' },
  idle:       { label: 'Standby',       color: 'rgba(88,77,102,0.8)', bg: 'rgba(201,184,216,0.24)', border: '#c9b8d8' },
};

export default function AgentCard({ agent, onView, onToggle }: Props) {
  const status = STATUS[agent.status];
  return (
    <div
      className="flex flex-col transition-all"
      style={{
        background: 'rgba(201,184,216,0.2)',
        border: '1px solid #c9b8d8',
        borderRadius: 20,
        padding: 24,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl text-lg"
            style={{ width: 52, height: 52, background: '#c9b8d8', color: '#210b2c', borderRadius: 999, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16 }}
          >
            {agent.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: '#0a0a0f', marginBottom: 4 }}>
              {agent.name}
            </div>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                color: status.color, background: status.bg,
                border: `1px solid ${status.border}`, borderRadius: 99,
                padding: '2px 8px',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Match score */}
        <div
          className="flex flex-col items-center justify-center rounded-xl"
          style={{ width: 76, height: 76, background: '#3d1454', border: '4px solid #f7d9c4', borderRadius: 999 }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 800, fontSize: 20, color: '#ffffff', lineHeight: 1 }}>
            {agent.matchScore}%
          </span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
            Match
          </span>
        </div>
      </div>

      {/* Domain tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {agent.domains.map(d => (
          <span key={d} className="fs-pill" style={{ fontSize: 11, padding: '3px 10px', color: '#3d1454', borderColor: '#6b2d8b', background: 'rgba(107,45,139,0.12)' }}>{d}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-5 mb-5 px-1">
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 800, fontSize: 26, color: '#0a0a0f', lineHeight: 1 }}>
            {agent.surveysCompleted}
          </div>
          <div style={{ color: '#0a0a0f', fontSize: 12, marginTop: 4 }}>Products tested</div>
        </div>
        <div style={{ width: 1, background: 'rgba(88,77,102,0.18)' }} />
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 800, color: '#0a0a0f', lineHeight: 1 }}>
            {agent.lastActive}
          </div>
          <div style={{ color: 'rgba(88,77,102,0.76)', fontSize: 12, marginTop: 4 }}>Last active</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(88,77,102,0.16)' }}>
        <div className="flex items-center gap-2.5">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'rgba(88,77,102,0.72)' }}>AUTO INVITE</span>
          <button
            onClick={() => onToggle(agent.id)}
            className="relative rounded-full"
            style={{
              width: 34, height: 18,
              background: agent.autonomousEnabled ? '#6b2d8b' : 'rgba(88,77,102,0.18)',
              border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <span
              className="absolute top-0.5 rounded-full"
              style={{
                width: 14, height: 14,
                background: '#ffffff',
                left: agent.autonomousEnabled ? 18 : 2,
                transition: 'left 0.15s',
              }}
            />
          </button>
        </div>
        <button onClick={() => onView(agent)} className="fs-btn-ghost" style={{ fontSize: 12, padding: '8px 16px', color: '#584d66', borderColor: '#6b2d8b', borderRadius: 20 }}>
          View Profile
        </button>
      </div>
    </div>
  );
}
