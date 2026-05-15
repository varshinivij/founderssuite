import { useCallback, useEffect, useState } from 'react';
import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';
import { fetchIcpAgents } from '../lib/api';
import type { IcpAgentProfile } from '../lib/api';

export default function KnowledgeBase() {
  const [agents, setAgents] = useState<IcpAgentProfile[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<IcpAgentProfile | null>(null);
  const [newNodeFlash, setNewNodeFlash] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchIcpAgents().then(({ agents: loaded }) => {
      setAgents(loaded);
      setSelectedAgent(loaded[0] ?? null);
    });
  }, []);

  const handleNewNodes = useCallback((count: number) => {
    setNewNodeFlash(count);
    setTimeout(() => setNewNodeFlash(0), 3500);
    // Force re-render so the panel reloads when navigated back to
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh', background: '#faf9fd', padding: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        minHeight: 62, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)',
        borderRadius: '18px 18px 0 0', padding: '10px 18px', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#210b2c' }}>Knowledge Base</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>
            ICP AGENTS · MEMORY · GRAPH SEARCH · BROWSER TESTS
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {newNodeFlash > 0 && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: '#06b6d4',
              background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)',
              borderRadius: 8, padding: '5px 12px',
              animation: 'fadeSlideIn 0.3s ease',
            }}>
              <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
              +{newNodeFlash} new node{newNodeFlash > 1 ? 's' : ''} from browser test
            </div>
          )}
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700,
            color: '#6b2d8b', background: 'rgba(107,45,139,0.06)',
            border: '1px solid rgba(107,45,139,0.2)', borderRadius: 8, padding: '4px 12px',
          }}>
            {selectedAgent?.name ?? 'Workspace graph'}
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid', flex: 1, overflow: 'hidden',
        gridTemplateColumns: '268px minmax(0, 1fr)', minHeight: 0,
        background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)',
        borderTop: 'none', borderRadius: '0 0 18px 18px',
      }}>
        <aside style={{ overflowY: 'auto', borderRight: '1px solid rgba(201,184,216,0.72)', padding: 14 }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700, color: 'rgba(88,77,102,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            ICP Agents
          </div>
          {agents.length === 0 ? (
            <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>
              Analyze a real meeting with a target customer to generate a customer agent and scope the graph.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {agents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    textAlign: 'left',
                    border: `1px solid ${selectedAgent?.id === agent.id ? '#6b2d8b' : 'rgba(201,184,216,0.72)'}`,
                    borderRadius: 12, padding: 12,
                    background: selectedAgent?.id === agent.id ? 'rgba(107,45,139,0.08)' : '#ffffff',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 13 }}>{agent.name}</div>
                  <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 4 }}>
                    {agent.market || agent.target_customer}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#6b2d8b', fontSize: 10, marginTop: 7 }}>
                    {agent.reinforcement_count} feedback updates
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Node type legend */}
          <div style={{ marginTop: 20, borderTop: '1px solid rgba(201,184,216,0.5)', paddingTop: 14 }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700, color: 'rgba(88,77,102,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Node Types
            </div>
            {[
              { color: '#06b6d4', label: 'Browser Test', new: true },
              { color: '#f97316', label: 'Persona' },
              { color: '#6366f1', label: 'Website' },
              { color: '#2f8f67', label: 'Customer' },
              { color: '#f2a58e', label: 'Call' },
              { color: '#b95465', label: 'Pain Point' },
              { color: '#64748b', label: 'Memory' },
            ].map(({ color, label, new: isNew }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#584d66' }}>{label}</span>
                {isNew && (
                  <span style={{
                    fontSize: 8, fontWeight: 700, color: '#06b6d4',
                    background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
                    borderRadius: 4, padding: '1px 5px',
                  }}>NEW</span>
                )}
              </div>
            ))}
          </div>
        </aside>

        <main style={{ padding: 14, minHeight: 0, overflow: 'hidden' }}>
          <KnowledgeGraphPanel
            key={refreshKey}
            activeNodeId={selectedAgent?.name}
            title={selectedAgent ? `${selectedAgent.name} Graph` : 'Workspace Graph'}
            onNewNodes={handleNewNodes}
          />
        </main>
      </div>
    </div>
  );
}
