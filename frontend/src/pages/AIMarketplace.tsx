import { type CSSProperties, useState } from 'react';
import AgentCard from '../components/marketplace/AgentCard';
import { SIMULATION_PERSONAS, type AIAgent } from '../lib/personas';

const pageTheme = {
  '--bg': '#faf9fd',
  '--surface-0': '#ffffff',
  '--surface-1': '#faf9fd',
  '--surface-2': '#f3edf7',
  '--border-subtle': 'rgba(201,184,216,0.72)',
  '--border-mid': 'rgba(201,184,216,0.9)',
  '--border-strong': '#6b2d8b',
  '--purple': '#6b2d8b',
  '--purple-dim': 'rgba(107,45,139,0.1)',
  '--gold': '#f2a58e',
  '--gold-dim': 'rgba(247,217,196,0.45)',
  '--red': '#b95465',
  '--green': '#2f8f67',
  '--text-1': '#210b2c',
  '--text-dim': '#0a0a0f',
  '--text-muted': 'rgba(88,77,102,0.72)',
} as CSSProperties;

const DOMAIN_FILTERS = ['All', 'Biotech', 'Hardware', 'B2B SaaS', 'HealthTech', 'EdTech', 'Climate'];
const STATUS_FILTERS = [
  { value: 'All', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'in_survey', label: 'In Survey' },
  { value: 'idle', label: 'Idle' },
];

export default function AIMarketplace() {
  const [agents, setAgents] = useState<AIAgent[]>(SIMULATION_PERSONAS);
  const [filterDomain, setFilterDomain] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  const handleToggle = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, autonomousEnabled: !a.autonomousEnabled } : a));
    setSelectedAgent(prev => prev?.id === id ? { ...prev, autonomousEnabled: !prev.autonomousEnabled } : prev);
  };

  const filtered = agents
    .filter(a => filterDomain === 'All' || a.domains.some(d => d.toLowerCase().includes(filterDomain.toLowerCase())))
    .filter(a => filterStatus === 'All' || a.status === filterStatus)
    .sort((a, b) => b.matchScore - a.matchScore);

  const autonomousCount = agents.filter(a => a.autonomousEnabled).length;
  const availableCount = agents.filter(a => a.status === 'available').length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ ...pageTheme, background: '#faf9fd' }}>
      {/* Hero */}
      <div
        className="px-16 py-14"
        style={{
          background: '#faf9fd',
          borderBottom: '1px solid rgba(201,184,216,0.44)',
        }}
      >
        <div className="flex items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="fs-label">Tester Matches</span>
            </div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 38,
              color: '#0a0a0f',
              lineHeight: 1.2,
              marginBottom: 14,
            }}>
              Your tester matches
            </h1>
            <p style={{ color: '#584d66', fontSize: 18, maxWidth: 720, lineHeight: 1.5 }}>
              Connect with qualified testers whose experience lines up with the interviews and product feedback you need next.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-stretch gap-3 shrink-0">
            {[
              { value: agents.length, label: 'Total matches', color: '#210b2c' },
              { value: availableCount, label: 'Ready now', color: '#3d1454' },
              { value: autonomousCount, label: 'Auto-invite', color: '#6b2d8b' },
            ].map(({ value, label, color }) => (
              <div
                key={label}
                className="text-center px-6 py-4"
                style={{ background: 'rgba(88,77,102,0.08)', border: '1px solid rgba(201,184,216,0.75)', minWidth: 104, borderRadius: 20 }}
              >
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 28, color, lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ color: '#584d66', fontSize: 11, marginTop: 4 }}>{label}</div>
              </div>
            ))}
            <button className="fs-btn-primary" style={{ fontSize: 13, alignSelf: 'center', marginLeft: 8 }}>
              Invite tester
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-4 px-16 py-7 overflow-x-auto"
        style={{ borderBottom: '1px solid rgba(201,184,216,0.44)', background: '#faf9fd' }}
      >
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#0a0a0f', marginRight: 2, whiteSpace: 'nowrap' }}>
          DOMAIN
        </span>
        {DOMAIN_FILTERS.map(d => (
          <button key={d} onClick={() => setFilterDomain(d)} className={`fs-pill ${filterDomain === d ? 'active' : ''}`} style={{ borderRadius: 40, padding: '8px 14px' }}>
            {d}
          </button>
        ))}
        <div style={{ width: 1, height: 28, background: 'rgba(88,77,102,0.18)', margin: '0 8px', flexShrink: 0 }} />
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#0a0a0f', marginRight: 2, whiteSpace: 'nowrap' }}>
          STATUS
        </span>
        {STATUS_FILTERS.map(s => (
          <button key={s.value} onClick={() => setFilterStatus(s.value)} className={`fs-pill ${filterStatus === s.value ? 'active' : ''}`} style={{ borderRadius: 40, padding: '8px 14px' }}>
            {s.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#3d1454', whiteSpace: 'nowrap' }}>
          {filtered.length} MATCHES IN QUEUE
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-16 py-10">
        {filtered.length === 0 ? (
          <div className="text-center mt-20" style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            No testers match the current filters
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
            {filtered.map(agent => (
              <AgentCard key={agent.id} agent={agent} onView={setSelectedAgent} onToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedAgent && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ background: 'rgba(33,11,44,0.42)', backdropFilter: 'blur(16px)' }}
          onClick={() => setSelectedAgent(null)}
        >
          <div
            className="rounded-2xl w-full max-w-lg fade-in"
            style={{
              background: '#ffffff',
              border: '1px solid rgba(201,184,216,0.9)',
              padding: 32,
              boxShadow: '0 24px 64px rgba(33,11,44,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl flex items-center justify-center text-3xl"
                  style={{ width: 56, height: 56, background: `${selectedAgent.color}12`, border: `1px solid ${selectedAgent.color}30` }}>
                  {selectedAgent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text-1)' }}>
                    {selectedAgent.name}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedAgent.domains.map(d => (
                      <span key={d} className="fs-pill" style={{ fontSize: 10, padding: '3px 9px' }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="fs-btn-icon" style={{ flexShrink: 0 }}>✕</button>
            </div>

            <div className="mb-6">
              <p className="fs-label" style={{ marginBottom: 8 }}>Experience Profile</p>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.65 }}>{selectedAgent.profile}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Match', value: `${selectedAgent.matchScore}%`, color: 'var(--gold)' },
                { label: 'Surveys', value: String(selectedAgent.surveysCompleted), color: 'var(--text-1)' },
                { label: 'Last Active', value: selectedAgent.lastActive, color: 'var(--text-dim)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center rounded-xl py-4" style={{ background: 'rgba(107,45,139,0.04)', border: '1px solid rgba(201,184,216,0.8)' }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 17, color }}>{value}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-4 px-5 rounded-xl" style={{ background: 'rgba(247,217,196,0.24)', border: '1px solid rgba(242,165,142,0.55)' }}>
              <div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>Auto Invite</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Send an invite when the fit is strong</div>
              </div>
              <button
                onClick={() => handleToggle(selectedAgent.id)}
                className="relative rounded-full"
                style={{ width: 44, height: 22, background: selectedAgent.autonomousEnabled ? '#6b2d8b' : 'rgba(88,77,102,0.18)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <span className="absolute top-1 rounded-full" style={{ width: 14, height: 14, background: selectedAgent.autonomousEnabled ? 'var(--surface-0)' : 'rgba(255,255,255,0.5)', left: selectedAgent.autonomousEnabled ? 26 : 4, transition: 'left 0.15s' }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
