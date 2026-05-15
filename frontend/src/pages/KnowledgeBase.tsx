import { useEffect, useState } from 'react';
import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';
import { fetchIcpAgents } from '../lib/api';
import type { IcpAgentProfile } from '../lib/api';

export default function KnowledgeBase() {
  const [agents, setAgents] = useState<IcpAgentProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<IcpAgentProfile | null>(null);

  useEffect(() => {
    fetchIcpAgents().then(({ agents: loaded }) => {
      setAgents(loaded);
      setSelectedAgent(loaded[0] ?? null);
    });
  }, []);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100vh', background: '#faf9fd', padding: 18 }}>
      <div className="flex items-center justify-between" style={{ minHeight: 62, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: '18px 18px 0 0', padding: '10px 18px', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#210b2c' }}>Knowledge Base</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>ICP AGENTS · MEMORY · GRAPH SEARCH</div>
        </div>
        <span className="fs-badge fs-badge-purple">{selectedAgent?.name ?? 'Workspace graph'}</span>
      </div>

      <div className="grid flex-1 overflow-hidden" style={{ gridTemplateColumns: '280px minmax(0, 1fr)', minHeight: 0, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 18px 18px' }}>
        <aside className="overflow-y-auto" style={{ borderRight: '1px solid rgba(201,184,216,0.72)', padding: 14 }}>
          <p className="fs-label" style={{ marginBottom: 10 }}>ICP Agents</p>
          {agents.length === 0 ? (
            <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>Analyze a real meeting with a target customer to generate a customer agent and scope the graph.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {agents.map(agent => (
                <button key={agent.id} onClick={() => setSelectedAgent(agent)} style={{ textAlign: 'left', border: `1px solid ${selectedAgent?.id === agent.id ? '#6b2d8b' : 'rgba(201,184,216,0.72)'}`, borderRadius: 12, padding: 12, background: selectedAgent?.id === agent.id ? 'rgba(107,45,139,0.08)' : '#ffffff', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 13 }}>{agent.name}</div>
                  <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 4 }}>{agent.market || agent.target_customer}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#6b2d8b', fontSize: 10, marginTop: 7 }}>{agent.reinforcement_count} feedback updates</div>
                </button>
              ))}
            </div>
          )}
        </aside>
        <main style={{ padding: 14, minHeight: 0 }}>
          <KnowledgeGraphPanel activeNodeId={selectedAgent?.name} title={selectedAgent ? `${selectedAgent.name} Graph` : 'Workspace Graph'} />
        </main>
      </div>
    </div>
  );
}
