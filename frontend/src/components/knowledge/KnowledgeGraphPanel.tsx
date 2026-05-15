import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { fetchGraph, searchMemory } from '../../lib/api';
import type { GraphEdge, GraphNode, MemoryChunk } from '../../lib/api';

// Node type → { sphere color, label color, size multiplier }
const NODE_STYLE: Record<string, { color: string; label: string; val: number }> = {
  customer:     { color: '#2f8f67', label: '#6effc4', val: 9 },
  stakeholder:  { color: '#2563eb', label: '#93c5fd', val: 7 },
  call:         { color: '#f2a58e', label: '#ffd4c2', val: 7 },
  pain_point:   { color: '#b95465', label: '#fda4af', val: 5 },
  requirement:  { color: '#7c3aed', label: '#c4b5fd', val: 5 },
  workflow:     { color: '#3d1454', label: '#a78bfa', val: 5 },
  integration:  { color: '#0ea5e9', label: '#7dd3fc', val: 5 },
  document:     { color: '#8b5cf6', label: '#ddd6fe', val: 5 },
  form:         { color: '#f59e0b', label: '#fcd34d', val: 5 },
  memory:       { color: '#64748b', label: '#cbd5e1', val: 3 },
  // New types from browser use
  browser_test: { color: '#06b6d4', label: '#67e8f9', val: 11 },
  persona:      { color: '#f97316', label: '#fdba74', val: 10 },
  website:      { color: '#6366f1', label: '#a5b4fc', val: 8 },
};

const FALLBACK = { color: '#584d66', label: '#cbb8d9', val: 4 };

type Graph3DNode = GraphNode & { color: string; val: number; __style: typeof FALLBACK };
type Graph3DEdge = Omit<GraphEdge, 'source' | 'target'> & { source: string; target: string };

function nodestyle(node: GraphNode, isActive: boolean) {
  const s = NODE_STYLE[node.type] ?? FALLBACK;
  if (isActive) return { color: '#f2a58e', label: '#fff', val: s.val + 4 };
  return s;
}

export default function KnowledgeGraphPanel({
  workspaceId = 'default',
  activeNodeId,
  compact = false,
  title = 'Knowledge Graph',
  onNewNodes,
}: {
  workspaceId?: string;
  activeNodeId?: string | null;
  compact?: boolean;
  title?: string;
  onNewNodes?: (count: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<{
    cameraPosition?: (pos: { x: number; y: number; z: number }, lookAt: object, ms: number) => void;
  } | null>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryChunk[]>([]);
  const [status, setStatus] = useState('Loading graph…');
  const [size, setSize] = useState({ width: 720, height: 420 });
  const prevNodeCount = useRef(0);

  const refresh = useCallback(async (id = workspaceId) => {
    const { nodes: n, edges: e } = await fetchGraph(id);
    setNodes(n);
    setEdges(e);
    setStatus(n.length ? '' : 'No graph data yet.');
    if (n.length > prevNodeCount.current) {
      onNewNodes?.(n.length - prevNodeCount.current);
    }
    prevNodeCount.current = n.length;
  }, [workspaceId, onNewNodes]);

  useEffect(() => {
    refresh(workspaceId).catch(() => setStatus('Could not load graph.'));
  }, [refresh, workspaceId]);

  // Measure container
  useEffect(() => {
    function measure() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(compact ? 280 : 380, Math.floor(rect.height)),
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [compact]);

  // Camera focus on active node
  useEffect(() => {
    if (!activeNodeId) return;
    const node = nodes.find(n => n.id === activeNodeId || n.id.includes(activeNodeId));
    if (!node) return;
    requestAnimationFrame(() => {
      setSelectedNode(node);
      graphRef.current?.cameraPosition?.({ x: 80, y: 80, z: 120 }, node, 900);
    });
  }, [activeNodeId, nodes]);

  async function handleSearch() {
    if (!query.trim()) return;
    const { results: found } = await searchMemory(query, workspaceId);
    setResults(found);
  }

  // Build graph data with per-node THREE objects
  const graphData = useMemo(() => {
    const nodeList: Graph3DNode[] = nodes.map(node => {
      const isActive = !!activeNodeId && (node.id === activeNodeId || node.id.includes(activeNodeId));
      const style = nodestyle(node, isActive);
      return { ...node, color: style.color, val: style.val, __style: style };
    });
    const links: Graph3DEdge[] = edges.map(e => ({ ...e }));
    return { nodes: nodeList, links };
  }, [nodes, edges, activeNodeId]);

  // Click-to-focus from context7 docs: distRatio formula
  const handleNodeClick = useCallback((raw: object) => {
    const node = raw as Graph3DNode & { x?: number; y?: number; z?: number };
    setSelectedNode(node);
    const dist = 60;
    const mag = Math.hypot(node.x ?? 0, node.y ?? 0, node.z ?? 0) || 1;
    const ratio = 1 + dist / mag;
    graphRef.current?.cameraPosition?.(
      { x: (node.x ?? 0) * ratio, y: (node.y ?? 0) * ratio, z: (node.z ?? 0) * ratio },
      node,
      800,
    );
  }, []);

  // nodeThreeObject: sphere + floating SpriteText label (extend=true keeps default sphere)
  const nodeThreeObject = useCallback((raw: object) => {
    const node = raw as Graph3DNode;
    const style = NODE_STYLE[node.type] ?? FALLBACK;
    const sprite = new SpriteText(node.name.length > 22 ? node.name.slice(0, 20) + '…' : node.name);
    sprite.color = style.label;
    sprite.textHeight = node.type === 'browser_test' || node.type === 'persona' ? 4.5 : 3.2;
    sprite.backgroundColor = 'rgba(10,5,20,0.55)';
    sprite.padding = 1.5;
    sprite.borderRadius = 2;
    (sprite as THREE.Sprite & { center: { y: number } }).center.y = -1.4;
    return sprite;
  }, []);

  // Edges from browser_test sessions get particles
  const linkParticles = useCallback((link: object) => {
    const l = link as Graph3DEdge;
    return l.type === 'ran_test' || l.type === 'tested' || l.type === 'navigated_successfully' ? 4 : 0;
  }, []);

  const linkParticleColor = useCallback((link: object) => {
    const l = link as Graph3DEdge;
    if (l.type === 'navigated_successfully') return '#34d399';
    if (l.type === 'ran_test') return '#fdba74';
    if (l.type === 'tested') return '#67e8f9';
    return '#f7d9c4';
  }, []);

  const linkColor = useCallback((link: object) => {
    const l = link as Graph3DEdge;
    if (l.type === 'ran_test' || l.type === 'tested') return 'rgba(6,182,212,0.45)';
    if (l.type === 'navigated_successfully') return 'rgba(52,211,153,0.45)';
    return 'rgba(247,217,196,0.22)';
  }, []);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
  }, [edges, selectedNode]);

  // Count browser_test nodes
  const browserTestCount = nodes.filter(n => n.type === 'browser_test').length;

  return (
    <section style={{
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      height: '100%', minHeight: compact ? 320 : 520,
      background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderBottom: '1px solid rgba(201,184,216,0.72)', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, color: '#6b2d8b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {title}
          </div>
          <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 3, display: 'flex', gap: 10 }}>
            <span>{nodes.length} nodes · {edges.length} links</span>
            {browserTestCount > 0 && (
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, fontWeight: 700,
                color: '#06b6d4', background: 'rgba(6,182,212,0.08)',
                border: '1px solid rgba(6,182,212,0.25)',
                borderRadius: 5, padding: '1px 7px',
              }}>
                {browserTestCount} browser test{browserTestCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => refresh(workspaceId)}
            style={{
              background: 'none', border: '1px solid rgba(201,184,216,0.72)', borderRadius: 8,
              padding: '6px 10px', fontSize: 11, color: '#584d66', cursor: 'pointer',
            }}
            title="Refresh graph"
          >
            ↻
          </button>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            placeholder="Search memory"
            style={{
              width: compact ? 150 : 200, border: '1px solid rgba(201,184,216,0.9)',
              borderRadius: 10, padding: '7px 10px', fontSize: 12, color: '#0a0a0f', background: '#faf9fd',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: 'rgba(107,45,139,0.08)', border: '1px solid rgba(107,45,139,0.3)',
              borderRadius: 8, padding: '7px 12px', fontSize: 12, color: '#6b2d8b',
              cursor: 'pointer', fontWeight: 700,
            }}
          >
            Search
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Graph canvas */}
        <main ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative', background: '#0a050f' }}>
          {nodes.length > 0 ? (
            <ForceGraph3D
              ref={graphRef as never}
              graphData={graphData}
              width={size.width}
              height={size.height}
              backgroundColor="#0a050f"
              // Sphere color
              nodeColor={(n: object) => (n as Graph3DNode).color}
              nodeVal={(n: object) => (n as Graph3DNode).val}
              // SpriteText label above each sphere
              nodeThreeObject={nodeThreeObject}
              nodeThreeObjectExtend={true}
              // Tooltip on hover
              nodeLabel={(n: object) => {
                const node = n as Graph3DNode;
                return `<div style="font-family:monospace;font-size:11px;background:rgba(10,5,20,0.85);color:#f0ebff;padding:5px 9px;border-radius:7px;border:1px solid rgba(168,85,247,0.3)">${node.name}<br/><span style="color:rgba(168,85,247,0.7);font-size:9px">${node.type.replace(/_/g, ' ').toUpperCase()}</span></div>`;
              }}
              // Edge styling
              linkColor={linkColor}
              linkOpacity={0.55}
              linkWidth={0.8}
              linkDirectionalArrowLength={5}
              linkDirectionalArrowRelPos={1}
              // Particles on browser_test edges
              linkDirectionalParticles={linkParticles}
              linkDirectionalParticleWidth={2.5}
              linkDirectionalParticleColor={linkParticleColor}
              linkDirectionalParticleSpeed={0.006}
              // Click to zoom
              onNodeClick={handleNodeClick}
            />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
            }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f2a58e', fontSize: 11, marginBottom: 10 }}>GRAPH EMPTY</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#f7f1fb', marginBottom: 8 }}>No knowledge graph data</div>
              <p style={{ color: 'rgba(247,241,251,0.6)', maxWidth: 340, lineHeight: 1.5, fontSize: 13 }}>{status}</p>
            </div>
          )}

          {/* Legend */}
          {!compact && nodes.length > 0 && (
            <div style={{
              position: 'absolute', bottom: 14, left: 14,
              background: 'rgba(10,5,20,0.75)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px 12px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              {(['browser_test', 'persona', 'website', 'customer', 'call', 'pain_point', 'memory'] as const).map(type => {
                const s = NODE_STYLE[type];
                const count = nodes.filter(n => n.type === type).length;
                if (count === 0) return null;
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' }}>
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Context sidebar */}
        {!compact && (
          <aside style={{
            width: 290, minWidth: 290, flexShrink: 0,
            borderLeft: '1px solid rgba(201,184,216,0.8)',
            background: '#ffffff',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid rgba(201,184,216,0.72)', flexShrink: 0 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, color: '#6b2d8b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Context
              </div>
              {selectedNode ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: (NODE_STYLE[selectedNode.type] ?? FALLBACK).color,
                    }} />
                    <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 14, lineHeight: 1.3 }}>
                      {selectedNode.name}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#6b2d8b',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                  }}>
                    {selectedNode.type.replace(/_/g, ' ')}
                  </div>

                  {/* Browser test specific fields */}
                  {selectedNode.type === 'browser_test' && selectedNode.metadata && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: selectedNode.metadata.is_successful ? 'rgba(47,143,103,0.1)' : 'rgba(185,84,101,0.1)',
                          color: selectedNode.metadata.is_successful ? '#2f8f67' : '#b95465',
                          border: `1px solid ${selectedNode.metadata.is_successful ? 'rgba(47,143,103,0.3)' : 'rgba(185,84,101,0.3)'}`,
                        }}>
                          {selectedNode.metadata.is_successful ? '✓ Successful' : '✗ Failed'}
                        </span>
                        <span style={{ fontSize: 10, color: 'rgba(88,77,102,0.5)' }}>
                          {selectedNode.metadata.step_count as number} steps
                        </span>
                      </div>
                      {selectedNode.metadata.output && (
                        <div style={{
                          fontSize: 11, color: '#210b2c', lineHeight: 1.55,
                          background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)',
                          borderRadius: 8, padding: '8px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          maxHeight: 140, overflowY: 'auto',
                        }}>
                          {selectedNode.metadata.output as string}
                        </div>
                      )}
                    </div>
                  )}

                  {typeof selectedNode.metadata?.text === 'string' && (
                    <p style={{ color: 'rgba(88,77,102,0.86)', fontSize: 12, lineHeight: 1.45, marginTop: 6 }}>
                      {(selectedNode.metadata.text as string).slice(0, 280)}
                      {(selectedNode.metadata.text as string).length > 280 ? '…' : ''}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>
                  Click a node to inspect its context.
                </p>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, color: 'rgba(88,77,102,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                {results.length ? 'Search Results' : 'Relationships'}
              </div>

              {results.length > 0
                ? results.slice(0, 8).map(r => (
                    <div key={r.id} style={{
                      border: '1px solid rgba(201,184,216,0.72)', borderRadius: 10, padding: '9px 11px',
                      background: '#faf9fd', marginBottom: 7,
                    }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 4 }}>
                        {r.topic || r.source}
                      </div>
                      <div style={{ color: '#210b2c', fontSize: 12, lineHeight: 1.4 }}>{r.text}</div>
                    </div>
                  ))
                : connectedEdges.slice(0, 10).map(edge => {
                    const otherId = edge.source === selectedNode?.id ? edge.target : edge.source;
                    const other = nodes.find(n => n.id === otherId);
                    const s = NODE_STYLE[other?.type ?? ''] ?? FALLBACK;
                    return (
                      <div key={edge.id} style={{
                        border: '1px solid rgba(201,184,216,0.72)', borderRadius: 10, padding: '9px 11px',
                        background: '#faf9fd', marginBottom: 7,
                        display: 'flex', alignItems: 'flex-start', gap: 8,
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 3 }} />
                        <div>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 3 }}>
                            {edge.type.replace(/_/g, ' ')}
                          </div>
                          <div style={{ color: '#210b2c', fontWeight: 700, fontSize: 12 }}>
                            {other?.name ?? otherId}
                          </div>
                        </div>
                      </div>
                    );
                  })
              }

              {!selectedNode && results.length === 0 && (
                <p style={{ color: 'rgba(88,77,102,0.5)', fontSize: 12, lineHeight: 1.5 }}>
                  Select a node or search to explore the graph.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
