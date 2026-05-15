import { type CSSProperties, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  buildMemory,
  fetchGraph,
  fetchMeetings,
  fetchMemoryTimeline,
  fetchSummary,
  searchMemory,
} from '../lib/api';
import type { GraphEdge, GraphNode, Meeting, MemoryChunk, SummaryReport } from '../lib/api';
import PipelinePanel from '../components/dashboard/PipelinePanel';
import MetricsPanel from '../components/dashboard/MetricsPanel';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const dashboardTheme = {
  '--bg': '#faf9fd',
  '--surface-0': '#ffffff',
  '--surface-1': '#faf9fd',
  '--surface-2': '#f7f1fb',
  '--surface-3': '#efe4f6',
  '--border-subtle': 'rgba(201,184,216,0.72)',
  '--border-mid': 'rgba(201,184,216,0.9)',
  '--border-strong': '#6b2d8b',
  '--purple': '#6b2d8b',
  '--purple-dim': 'rgba(107,45,139,0.08)',
  '--gold': '#f2a58e',
  '--gold-dim': 'rgba(247,217,196,0.45)',
  '--red': '#b95465',
  '--green': '#2f8f67',
  '--text-1': '#210b2c',
  '--text-dim': '#0a0a0f',
  '--text-muted': 'rgba(88,77,102,0.72)',
} as CSSProperties;

type DashboardTab = 'overview' | 'memory';

const NODE_COLORS: Record<string, string> = {
  customer: '#6b2d8b',
  call: '#f2a58e',
  pain_point: '#b95465',
  requirement: '#2f8f67',
  workflow: '#3d1454',
  integration: '#7c3aed',
};
const DEFAULT_MEMORY_QUERY = 'spreadsheet onboarding SOC2';

function GraphPreview({
  nodes,
  edges,
  onSelect,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelect: (node: GraphNode) => void;
}) {
  const visibleNodes = nodes.slice(0, 12);
  const visibleEdges = edges.slice(0, 6);

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: 420, padding: 18, background: '#ffffff' }}>
      <div
        style={{
          position: 'absolute',
          inset: 18,
          borderRadius: 16,
          border: '1px dashed rgba(201,184,216,0.9)',
          background: 'linear-gradient(135deg, rgba(250,249,253,0.95) 0%, rgba(247,241,251,0.72) 100%)',
        }}
      />
      <div className="grid" style={{ position: 'relative', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, zIndex: 1 }}>
        {visibleNodes.map(node => (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node)}
            style={{
              minHeight: 78,
              border: '1px solid rgba(201,184,216,0.86)',
              borderRadius: 14,
              background: '#ffffff',
              padding: 12,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: '0 10px 24px rgba(33,11,44,0.04)',
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 99,
                  background: NODE_COLORS[node.type] ?? '#584d66',
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase' }}>
                {node.type.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ color: 'var(--text-1)', fontWeight: 800, fontSize: 13, lineHeight: 1.25 }}>{node.name}</div>
          </button>
        ))}
      </div>
      {visibleEdges.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          style={{
            position: 'absolute',
            left: 34,
            right: 34,
            bottom: 34,
            zIndex: 1,
            maxHeight: 92,
            overflow: 'auto',
          }}
        >
          {visibleEdges.map(edge => {
            const source = nodes.find(node => node.id === edge.source)?.name ?? edge.source;
            const target = nodes.find(node => node.id === edge.target)?.name ?? edge.target;
            return (
              <span key={edge.id} className="fs-badge fs-badge-neutral" style={{ textTransform: 'none', letterSpacing: 0 }}>
                {source} {'->'} {edge.type.replace(/_/g, ' ')} {'->'} {target}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemoryGraphView({ selectedRoom }: { selectedRoom: string | null }) {
  const [query, setQuery] = useState(DEFAULT_MEMORY_QUERY);
  const [results, setResults] = useState<MemoryChunk[]>([]);
  const [timeline, setTimeline] = useState<MemoryChunk[]>([]);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function refreshMemory() {
    const [{ nodes: graphNodes, edges: graphEdges }, { events }, { results: found }] = await Promise.all([
      fetchGraph('default'),
      fetchMemoryTimeline('default'),
      searchMemory(query, 'default'),
    ]);
    setNodes(graphNodes);
    setEdges(graphEdges);
    setTimeline(events);
    setResults(found);
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchGraph('default')
        .then(({ nodes: graphNodes, edges: graphEdges }) => {
          setNodes(graphNodes);
          setEdges(graphEdges);
        })
        .catch(() => setStatus('Memory data is not available yet.'));
      fetchMemoryTimeline('default').then(({ events }) => setTimeline(events));
      searchMemory(DEFAULT_MEMORY_QUERY, 'default').then(({ results: found }) => setResults(found));
    });
  }, []);

  async function handleBuildMemory() {
    if (!selectedRoom) {
      setStatus('Select or create an interview before building memory.');
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await buildMemory(selectedRoom);
      await refreshMemory();
      setStatus('Memory graph refreshed.');
    } catch {
      setStatus('Could not build memory for the selected interview.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSearch() {
    setBusy(true);
    try {
      const { results: found } = await searchMemory(query, 'default');
      setResults(found);
    } catch {
      setStatus('Memory search failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)' }}>
      <main className="flex-1 flex flex-col overflow-hidden" style={{ padding: 20 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search memory: customers mentioning SOC2"
            style={{ flex: 1, border: '1px solid var(--border-mid)', borderRadius: 12, padding: '10px 12px', background: '#faf9fd', color: 'var(--text-dim)' }}
          />
          <button onClick={handleSearch} disabled={busy} className="fs-btn-ghost">Search</button>
          <button onClick={handleBuildMemory} disabled={busy || !selectedRoom} className="fs-btn-primary">
            {busy ? 'Working...' : 'Build memory'}
          </button>
        </div>

        {status && <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 10 }}>{status}</div>}

        <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)', gap: 16 }}>
          <section style={{ border: '1px solid var(--border-subtle)', borderRadius: 16, overflow: 'hidden', background: '#faf9fd', minHeight: 0 }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)', background: '#ffffff' }}>
              <span className="fs-label">Knowledge Graph</span>
              <span className="fs-badge fs-badge-purple">{nodes.length} nodes</span>
            </div>
            {nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                Build memory from an interview to populate the graph.
              </div>
            ) : (
              <GraphPreview nodes={nodes} edges={edges} onSelect={setSelectedNode} />
            )}
          </section>

          <aside className="flex flex-col overflow-hidden" style={{ border: '1px solid var(--border-subtle)', borderRadius: 16, background: '#ffffff' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="fs-label">Memory Search</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {selectedNode && (
                <div style={{ background: 'rgba(107,45,139,0.05)', border: '1px solid rgba(107,45,139,0.14)', borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>{selectedNode.name}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--purple)', textTransform: 'uppercase' }}>{selectedNode.type.replace(/_/g, ' ')}</div>
                </div>
              )}
              {results.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No memory chunks match yet.</p>
              ) : results.map(result => (
                <div key={result.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 12, background: '#faf9fd' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <span className="fs-label">{result.topic || result.source}</span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'var(--purple)' }}>{Math.round((result.score ?? result.confidence) * 100)}%</span>
                  </div>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.5 }}>{result.text}</p>
                  <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 7 }}>{result.room_name} · {result.speaker}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <aside className="overflow-y-auto" style={{ width: 280, borderLeft: '1px solid var(--border-subtle)', padding: 18 }}>
        <p className="fs-label" style={{ marginBottom: 12 }}>Memory Timeline</p>
        <div className="flex flex-col gap-3">
          {timeline.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No memory events yet.</p>
          ) : timeline.slice(0, 12).map(event => (
            <div key={event.id} style={{ borderLeft: '2px solid var(--purple)', paddingLeft: 10 }}>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.4 }}>{event.text.slice(0, 110)}{event.text.length > 110 ? '...' : ''}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10, marginTop: 4 }}>{event.source} · {event.topic}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  useEffect(() => {
    fetchMeetings().then(({ meetings: m }) => {
      setMeetings(m);
      if (m.length && !selectedRoom) setSelectedRoom(m[0].room_name);
    });
  }, [selectedRoom]);

  useEffect(() => {
    if (!selectedRoom) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setReport(null);
      setIsGenerating(true);
    });

    fetchSummary(selectedRoom).then(({ report: r }) => {
      if (cancelled) return;
      setReport(r);
      setIsGenerating(false);
    });

    fetch(`${API}/transcript/${selectedRoom}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        const text = (data.segments ?? [])
          .map((s: { speaker: string; text: string }) => `[${s.speaker.toUpperCase()}]: ${s.text}`)
          .join('\n\n');
        setTranscript(text);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRoom]);

  const statusColor = report ? 'var(--green)' : isGenerating ? 'var(--purple)' : 'var(--text-muted)';
  const statusLabel = report ? 'Insights ready' : isGenerating ? 'Loading' : 'Awaiting interview';
  const latestMeeting = meetings.find(m => m.room_name === selectedRoom);
  const reviewCount = report?.findings?.length ?? 0;

  return (
    <div className="flex flex-col flex-1 overflow-hidden" style={{ ...dashboardTheme, background: '#faf9fd', padding: 24 }}>
      <div
        className="flex items-center justify-between"
        style={{
          minHeight: 72,
          background: '#ffffff',
          border: '1px solid rgba(201,184,216,0.8)',
          borderRadius: '20px 20px 0 0',
          flexShrink: 0,
          padding: '11px 24px',
          gap: 24,
        }}
      >
        <div className="flex items-center" style={{ gap: 12, minWidth: 0, overflowX: 'auto', paddingRight: 8 }}>
          {[
            { id: 'overview' as const, label: 'Overview', count: null },
            { id: 'memory' as const, label: 'Memory Graph', count: reviewCount },
          ].map(item => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className="flex items-center gap-2"
                style={{
                  height: 48,
                  border: 'none',
                  borderRadius: 10,
                  background: active ? '#3d1454' : 'transparent',
                  color: active ? '#ffffff' : '#210b2c',
                  padding: active ? '0 20px' : '0 10px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {item.label}
                {typeof item.count === 'number' && (
                  <span style={{ borderRadius: 20, background: active ? 'rgba(255,255,255,0.18)' : 'rgba(107,45,139,0.12)', color: active ? '#ffffff' : '#3d1454', fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: '2px 8px' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3" style={{ flexShrink: 0, marginLeft: 'auto' }}>
          <div style={{ minWidth: 150 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 14, color: '#210b2c', textAlign: 'right' }}>
              Discovery Intelligence
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 2, textAlign: 'right' }}>
              {latestMeeting ? `UPDATED ${new Date(latestMeeting.created_at).toLocaleDateString()}` : 'NO INTERVIEW SELECTED'}
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(107,45,139,0.06)', border: '1px solid rgba(201,184,216,0.8)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <button onClick={() => selectedRoom && navigate(`/analysis/${selectedRoom}`)} disabled={!selectedRoom} className="fs-btn-primary">
            Open analysis
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="flex flex-1 overflow-hidden" style={{ background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)' }}>
            <PipelinePanel report={report} isGenerating={isGenerating} />
            <MetricsPanel report={report} />
          </div>

          {(transcript || report) && (
            <div style={{ height: 220, border: '1px solid rgba(201,184,216,0.8)', borderRadius: '0 0 20px 20px', background: 'var(--surface-0)', flexShrink: 0, overflow: 'hidden' }}>
              <div className="flex h-full">
                <div className="flex-1 flex flex-col" style={{ borderRight: '1px solid rgba(201,184,216,0.72)' }}>
                  <div className="px-5 py-2.5 flex items-center" style={{ borderBottom: '1px solid rgba(201,184,216,0.72)', flexShrink: 0 }}>
                    <span className="fs-label-gold">Transcript</span>
                  </div>
                  <pre className="flex-1 overflow-y-auto px-5 py-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {transcript || 'No transcript available.'}
                  </pre>
                </div>
                {report && (
                  <div className="flex-1 flex flex-col">
                    <div className="px-5 py-2.5" style={{ borderBottom: '1px solid rgba(201,184,216,0.72)', flexShrink: 0 }}>
                      <span className="fs-label-gold">Summary Report</span>
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-4">
                      {report.findings?.length > 0 && (
                        <div>
                          <p className="fs-label" style={{ marginBottom: 6 }}>Findings</p>
                          {report.findings.map((f, i) => (
                            <div key={i} className="flex gap-2 mb-1.5" style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                              <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}>▸</span>{f}
                            </div>
                          ))}
                        </div>
                      )}
                      {report.next_steps?.length > 0 && (
                        <div>
                          <p className="fs-label" style={{ marginBottom: 6, color: 'var(--purple)' }}>Next Steps</p>
                          {report.next_steps.map((s, i) => (
                            <div key={i} className="flex gap-2 mb-1.5" style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                              <span style={{ color: 'var(--text-muted)', fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0 }}>{i + 1}.</span>{s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'memory' && <MemoryGraphView selectedRoom={selectedRoom} />}
    </div>
  );
}
