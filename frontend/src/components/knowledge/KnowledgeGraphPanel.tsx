import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { fetchGraph, searchMemory } from '../../lib/api';
import type { GraphEdge, GraphNode, MemoryChunk } from '../../lib/api';

const NODE_COLORS: Record<string, string> = {
  customer: '#2f8f67',
  stakeholder: '#2563eb',
  call: '#f2a58e',
  pain_point: '#b95465',
  requirement: '#6b2d8b',
  workflow: '#3d1454',
  integration: '#0ea5e9',
  document: '#8b5cf6',
  form: '#f59e0b',
  memory: '#f7d9c4',
};

type Graph3DNode = GraphNode & { color: string; val: number };
type Graph3DEdge = Omit<GraphEdge, 'source' | 'target'> & { source: string; target: string };

export default function KnowledgeGraphPanel({
  workspaceId = 'default',
  activeNodeId,
  compact = false,
  title = 'Knowledge Graph',
}: {
  workspaceId?: string;
  activeNodeId?: string | null;
  compact?: boolean;
  title?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<{ cameraPosition?: (pos: { x: number; y: number; z: number }, lookAt: object, ms: number) => void } | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemoryChunk[]>([]);
  const [status, setStatus] = useState('Loading graph memory...');
  const [size, setSize] = useState({ width: 720, height: 420 });

  const refresh = useCallback(async (nextWorkspaceId = workspaceId) => {
    const { nodes: graphNodes, edges: graphEdges } = await fetchGraph(nextWorkspaceId);
    setNodes(graphNodes);
    setEdges(graphEdges);
    setStatus(graphNodes.length ? '' : 'No graph memory yet.');
  }, [workspaceId]);

  useEffect(() => {
    Promise.resolve()
      .then(() => refresh(workspaceId))
      .catch(() => setStatus('Could not load the knowledge graph.'));
  }, [refresh, workspaceId]);

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
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [compact]);

  useEffect(() => {
    if (!activeNodeId) return;
    const node = nodes.find(item => item.id === activeNodeId || item.id.includes(activeNodeId));
    if (!node) return;
    window.requestAnimationFrame(() => {
      setSelectedNode(node);
      graphRef.current?.cameraPosition?.({ x: 80, y: 80, z: 120 }, node, 900);
    });
  }, [activeNodeId, nodes]);

  async function handleSearch() {
    const { results: found } = await searchMemory(query, workspaceId);
    setResults(found);
  }

  const graphData = useMemo(() => ({
    nodes: nodes.map(node => ({
      ...node,
      color: activeNodeId && (node.id === activeNodeId || node.id.includes(activeNodeId))
        ? '#f2a58e'
        : NODE_COLORS[node.type] ?? '#584d66',
      val: activeNodeId && (node.id === activeNodeId || node.id.includes(activeNodeId))
        ? 12
        : node.type === 'customer' ? 9 : node.type === 'call' ? 7 : node.type === 'memory' ? 4 : 5,
    })) as Graph3DNode[],
    links: edges.map(edge => ({ ...edge })) as Graph3DEdge[],
  }), [activeNodeId, edges, nodes]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id);
  }, [edges, selectedNode]);

  return (
    <section className="flex flex-col overflow-hidden" style={{ height: '100%', minHeight: compact ? 320 : 520, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderRadius: 16 }}>
      <div className="flex items-center justify-between" style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,184,216,0.72)', flexShrink: 0 }}>
        <div>
          <p className="fs-label">{title}</p>
          <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 4 }}>{nodes.length} nodes · {edges.length} links</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter') handleSearch(); }}
            placeholder="Search memory"
            style={{ width: compact ? 150 : 220, border: '1px solid rgba(201,184,216,0.9)', borderRadius: 10, padding: '8px 10px', fontSize: 12, color: '#0a0a0f', background: '#faf9fd' }}
          />
          <button onClick={handleSearch} className="fs-btn-ghost" style={{ padding: '8px 10px' }}>Search</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        <main ref={containerRef} className="flex-1 overflow-hidden" style={{ position: 'relative', background: '#0f0a14' }}>
          {nodes.length > 0 ? (
            <ForceGraph3D
              ref={graphRef as never}
              graphData={graphData}
              width={size.width}
              height={size.height}
              backgroundColor="#0f0a14"
              nodeLabel={(node: object) => `${(node as Graph3DNode).name} (${(node as Graph3DNode).type.replace(/_/g, ' ')})`}
              nodeColor={(node: object) => (node as Graph3DNode).color}
              nodeVal={(node: object) => (node as Graph3DNode).val}
              linkColor={() => 'rgba(247,217,196,0.38)'}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkOpacity={0.42}
              onNodeClick={(node: object) => setSelectedNode(node as GraphNode)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center" style={{ color: '#f7f1fb', padding: 24 }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f2a58e', fontSize: 11, marginBottom: 10 }}>GRAPH EMPTY</div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>No knowledge graph data</div>
                <p style={{ color: 'rgba(247,241,251,0.72)', maxWidth: 360, lineHeight: 1.5 }}>{status}</p>
              </div>
            </div>
          )}
        </main>

        {!compact && (
          <aside className="flex flex-col overflow-hidden" style={{ width: 300, minWidth: 300, borderLeft: '1px solid rgba(201,184,216,0.8)', background: '#ffffff' }}>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(201,184,216,0.72)' }}>
              <p className="fs-label" style={{ marginBottom: 8 }}>Context</p>
              {selectedNode ? (
                <>
                  <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 15 }}>{selectedNode.name}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginTop: 5 }}>{selectedNode.type.replace(/_/g, ' ')}</div>
                  {typeof selectedNode.metadata?.text === 'string' && (
                    <p style={{ color: 'rgba(88,77,102,0.86)', fontSize: 12, lineHeight: 1.45, marginTop: 10 }}>{selectedNode.metadata.text.slice(0, 260)}{selectedNode.metadata.text.length > 260 ? '...' : ''}</p>
                  )}
                </>
              ) : (
                <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>Click a node or search memory to inspect the agent context.</p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="fs-label" style={{ marginBottom: 10 }}>{results.length ? 'Search Results' : 'Relationships'}</p>
              {results.length ? results.slice(0, 6).map(result => (
                <div key={result.id} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 10, background: '#faf9fd', marginBottom: 8 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 5 }}>{result.topic || result.source}</div>
                  <div style={{ color: '#210b2c', fontSize: 12, lineHeight: 1.45 }}>{result.text}</div>
                </div>
              )) : connectedEdges.slice(0, 8).map(edge => {
                const otherId = edge.source === selectedNode?.id ? edge.target : edge.source;
                const otherNode = nodes.find(node => node.id === otherId);
                return (
                  <div key={edge.id} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 10, background: '#faf9fd', marginBottom: 8 }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 5 }}>{edge.type.replace(/_/g, ' ')}</div>
                    <div style={{ color: '#210b2c', fontWeight: 700, fontSize: 13 }}>{otherNode?.name ?? otherId}</div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
