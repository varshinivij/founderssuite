import KnowledgeGraphPanel from '../components/knowledge/KnowledgeGraphPanel';

export default function KnowledgeGraph3D() {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100vh', background: '#faf9fd', padding: 18 }}>
      <KnowledgeGraphPanel title="3D Knowledge Graph" />
    </div>
  );
}
