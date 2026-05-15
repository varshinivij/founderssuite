import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { fetchGraph } from '../lib/api';
import type { GraphEdge, GraphNode } from '../lib/api';

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

type Graph3DNode = GraphNode & {
  color: string;
  val: number;
};

type Graph3DEdge = Omit<GraphEdge, 'source' | 'target'> & {
  source: string;
  target: string;
};

function nodeLabel(node: Graph3DNode) {
  return `${node.name} (${node.type.replace(/_/g, ' ')})`;
}

export default function KnowledgeGraph3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [status, setStatus] = useState('Loading graph memory...');
  const [size, setSize] = useState({ width: 960, height: 640 });

  useEffect(() => {
    let cancelled = false;
    fetchGraph('default')
      .then(({ nodes: graphNodes, edges: graphEdges }) => {
        if (cancelled) return;
        setNodes(graphNodes);
        setEdges(graphEdges);
        setStatus(graphNodes.length ? '' : 'No graph memory yet. Build memory from a meeting first.');
      })
      .catch(() => {
        if (!cancelled) setStatus('Could not load the knowledge graph.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function measure() {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setSize({
        width: Math.max(360, Math.floor(rect.width)),
        height: Math.max(420, Math.floor(rect.height)),
      });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const graphData = useMemo(() => ({
    nodes: nodes.map(node => ({
      ...node,
      color: NODE_COLORS[node.type] ?? '#584d66',
      val: node.type === 'customer' ? 9 : node.type === 'call' ? 7 : node.type === 'memory' ? 4 : 5,
    })) as Graph3DNode[],
    links: edges.map(edge => ({ ...edge })) as Graph3DEdge[],
  }), [edges, nodes]);

  const connectedEdges = useMemo(() => {
    if (!selectedNode) return [];
    return edges.filter(edge => edge.source === selectedNode.id || edge.target === selectedNode.id);
  }, [edges, selectedNode]);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 72px)', background: '#faf9fd', padding: 18 }}>
      <div
        className="flex items-center justify-between"
        style={{
          minHeight: 62,
          background: '#ffffff',
          border: '1px solid rgba(201,184,216,0.8)',
          borderRadius: '18px 18px 0 0',
          padding: '10px 18px',
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#210b2c' }}>3D Knowledge Graph</div>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(88,77,102,0.72)', marginTop: 3 }}>
            CUSTOMER MEMORY · ENTITIES · RELATIONSHIPS
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="fs-badge fs-badge-purple">{nodes.length} nodes</span>
          <span className="fs-badge fs-badge-neutral">{edges.length} links</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0, background: '#ffffff', borderLeft: '1px solid rgba(201,184,216,0.8)', borderRight: '1px solid rgba(201,184,216,0.8)' }}>
        <main ref={containerRef} className="flex-1 overflow-hidden" style={{ position: 'relative', background: '#0f0a14' }}>
          {nodes.length > 0 ? (
            <ForceGraph3D
              graphData={graphData}
              width={size.width}
              height={size.height}
              backgroundColor="#0f0a14"
              nodeLabel={(node: object) => nodeLabel(node as Graph3DNode)}
              nodeColor={(node: object) => (node as Graph3DNode).color}
              nodeVal={(node: object) => (node as Graph3DNode).val}
              linkColor={() => 'rgba(247,217,196,0.38)'}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              linkOpacity={0.42}
              onNodeClick={(node: object) => setSelectedNode(node as GraphNode)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-center" style={{ color: '#f7f1fb', padding: 32 }}>
              <div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#f2a58e', fontSize: 11, marginBottom: 10 }}>GRAPH EMPTY</div>
                <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>No knowledge graph data yet</div>
                <p style={{ color: 'rgba(247,241,251,0.72)', maxWidth: 460, lineHeight: 1.5 }}>{status}</p>
              </div>
            </div>
          )}
        </main>

        <aside className="flex flex-col overflow-hidden" style={{ width: 320, minWidth: 320, borderLeft: '1px solid rgba(201,184,216,0.8)', background: '#ffffff' }}>
          <div className="px-4 py-4" style={{ borderBottom: '1px solid rgba(201,184,216,0.72)' }}>
            <p className="fs-label" style={{ marginBottom: 8 }}>Node detail</p>
            {selectedNode ? (
              <div>
                <div style={{ fontWeight: 800, color: '#210b2c', fontSize: 16 }}>{selectedNode.name}</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginTop: 5 }}>
                  {selectedNode.type.replace(/_/g, ' ')}
                </div>
                {typeof selectedNode.metadata?.text === 'string' && (
                  <p style={{ color: 'rgba(88,77,102,0.86)', fontSize: 12, lineHeight: 1.45, marginTop: 10 }}>
                    {selectedNode.metadata.text.slice(0, 260)}{selectedNode.metadata.text.length > 260 ? '...' : ''}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13, lineHeight: 1.45 }}>Click a graph node to inspect connected memory relationships.</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <p className="fs-label" style={{ marginBottom: 10 }}>Relationships</p>
            {!selectedNode ? (
              <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13 }}>No node selected.</p>
            ) : connectedEdges.length === 0 ? (
              <p style={{ color: 'rgba(88,77,102,0.72)', fontSize: 13 }}>No linked relationships for this node.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {connectedEdges.map(edge => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
                  const otherNode = nodes.find(node => node.id === otherId);
                  return (
                    <div key={edge.id} style={{ border: '1px solid rgba(201,184,216,0.72)', borderRadius: 12, padding: 10, background: '#faf9fd' }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b2d8b', textTransform: 'uppercase', marginBottom: 5 }}>
                        {edge.type.replace(/_/g, ' ')}
                      </div>
                      <div style={{ color: '#210b2c', fontWeight: 700, fontSize: 13 }}>{otherNode?.name ?? otherId}</div>
                      <div style={{ color: 'rgba(88,77,102,0.72)', fontSize: 11, marginTop: 5 }}>
                        Confidence {Math.round((edge.confidence ?? 0) * 100)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div style={{ height: 8, background: '#ffffff', border: '1px solid rgba(201,184,216,0.8)', borderTop: 'none', borderRadius: '0 0 18px 18px', flexShrink: 0 }} />
    </div>
  );
}
