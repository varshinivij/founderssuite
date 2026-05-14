import { Component, lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import AIMarketplace from './pages/AIMarketplace';
import Simulator from './pages/Simulator';

const KnowledgeGraph3D = lazy(() => import('./pages/KnowledgeGraph3D'));

class GraphErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 72px)', background: '#faf9fd', color: '#210b2c', padding: 24 }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#6b2d8b', fontSize: 11, marginBottom: 10 }}>GRAPH RENDERING UNAVAILABLE</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>The 3D graph could not start in this browser.</h1>
            <p style={{ color: 'rgba(88,77,102,0.82)', lineHeight: 1.5 }}>Memory data is still available through the dashboard graph and search. Try reloading after the dev server rebuilds.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meeting/:roomId?" element={<MeetingRoom />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route
          path="/graph"
          element={(
            <GraphErrorBoundary>
              <Suspense fallback={<div style={{ padding: 24, color: '#210b2c' }}>Loading graph...</div>}>
                <KnowledgeGraph3D />
              </Suspense>
            </GraphErrorBoundary>
          )}
        />
        <Route path="/marketplace" element={<AIMarketplace />} />
      </Routes>
    </BrowserRouter>
  );
}
