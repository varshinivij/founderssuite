import { useEffect, useState } from 'react';
import { fetchIcpAgents } from '../lib/api';
import type { IcpAgentProfile } from '../lib/api';

export default function AIMarketplace() {
  const [agents, setAgents] = useState<IcpAgentProfile[]>([]);

  useEffect(() => {
    fetchIcpAgents().then(({ agents: loaded }) => setAgents(loaded));
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ background: '#faf9fd', padding: 24 }}>
      <div className="flex items-center justify-between" style={{ minHeight: 72, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: '20px 20px 0 0', padding: '12px 24px', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#210b2c' }}>ICP Agents</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>USER-CREATED TARGET CUSTOMER MODELS</div>
        </div>
        <span className="fs-badge fs-badge-purple">{agents.length} agents</span>
      </div>

      <main className="flex-1 overflow-y-auto" style={{ background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 20px 20px', padding: 24 }}>
        {agents.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center" style={{ color: 'rgba(88,77,102,0.72)' }}>
            Analyze real customer meetings to generate customer agents.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {agents.map(agent => (
              <article key={agent.id} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 16, background: '#faf9fd', padding: 18 }}>
                <div className="flex items-start justify-between" style={{ marginBottom: 14 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 17 }}>{agent.name}</div>
                    <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 12, marginTop: 4 }}>{agent.target_customer}</div>
                  </div>
                  <span className="fs-badge fs-badge-neutral">{agent.reinforcement_count} updates</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    ['Market', agent.market],
                    ['Pains', agent.pains],
                    ['Buying triggers', agent.buying_triggers],
                    ['Objections', agent.objections],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="fs-label" style={{ marginBottom: 4 }}>{label}</p>
                      <p style={{ color: '#0a0a0f', fontSize: 13, lineHeight: 1.45 }}>{value || 'Not configured'}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
