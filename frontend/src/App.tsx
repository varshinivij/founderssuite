import { Component, lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import Navbar from './components/layout/Navbar';
import TesterNav from './components/layout/TesterNav';
import TesterThreads from './pages/TesterThreads';
import IncomingCallOverlay from './components/layout/IncomingCallOverlay';
import Dashboard from './pages/Dashboard';
import MeetingRoom from './pages/MeetingRoom';
import AIMarketplace from './pages/AIMarketplace';
import Simulator from './pages/Simulator';
import IcpAgent from './pages/IcpAgent';
import MeetingSummary from './pages/MeetingSummary';
import KnowledgeBase from './pages/KnowledgeBase';
import Matches from './pages/Matches';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupFounder from './pages/SignupFounder';
import SignupTester from './pages/SignupTester';
import AuthCallback from './pages/AuthCallback';
import Community from './pages/Community';
import NewForm from './pages/NewForm';
import FounderDashboard from './pages/FounderDashboard';
import FounderMatches from './pages/FounderMatches';
import FounderMatchDetail from './pages/FounderMatchDetail';
import FounderFeedback from './pages/FounderFeedback';
import FounderProfile from './pages/FounderProfile';
import FounderSettings from './pages/FounderSettings';
import TesterFeed from './pages/TesterFeed';
import TesterMatches from './pages/TesterMatches';
import TesterMatchDetail from './pages/TesterMatchDetail';
import TesterCompanyView from './pages/TesterCompanyView';
import TesterProfile from './pages/TesterProfile';
import TesterSettings from './pages/TesterSettings';
import Agents from './pages/Agents';
import BrowserUse from './pages/BrowserUse';
import AgentNew from './pages/AgentNew';
import AgentDetail from './pages/AgentDetail';
import CommunityDomain from './pages/CommunityDomain';
import CommunityPost from './pages/CommunityPost';
import { AuthProvider, useAuth } from './lib/auth';

const KnowledgeGraph3D = lazy(() => import('./pages/KnowledgeGraph3D'));

class GraphErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex items-center justify-center" style={{ height: '100vh', background: '#faf9fd', color: '#210b2c', padding: 24 }}>
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Full-page public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup/founder" element={<SignupFounder />} />
          <Route path="/signup/tester" element={<SignupTester />} />

          {/* All platform routes inside the sidebar shell — require auth */}
          <Route path="*" element={<RequireAuth><PlatformShell /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9fd]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'tester') return <TesterShell />;

  return <>{children}</>;
}

function TesterShell() {
  return (
    <div className="app-shell">
      <TesterNav />
      <main className="app-main">
        <Routes>
          <Route path="/tester/threads" element={<TesterThreads />} />
          <Route path="/meeting/:roomId?" element={<MeetingRoom />} />
          <Route path="*" element={<Navigate to="/tester/threads" replace />} />
        </Routes>
      </main>
      <IncomingCallOverlay />
    </div>
  );
}

function PlatformShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/dashboard" element={<Matches />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/meeting/:roomId?" element={<MeetingRoom />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/icp-agent" element={<IcpAgent />} />
          <Route path="/analysis/:roomName?" element={<MeetingSummary />} />
          <Route path="/summary/:roomName?" element={<MeetingSummary />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/community" element={<Community />} />
          <Route path="/forms/new" element={<NewForm />} />
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
          <Route path="/ai-tools" element={<Dashboard />} />

          {/* Founder routes */}
          <Route path="/founder/dashboard" element={<FounderDashboard />} />
          <Route path="/founder/matches" element={<FounderMatches />} />
          <Route path="/founder/matches/:matchId" element={<FounderMatchDetail />} />
          <Route path="/founder/feedback" element={<FounderFeedback />} />
          <Route path="/founder/profile" element={<FounderProfile />} />
          <Route path="/founder/settings" element={<FounderSettings />} />

          {/* Browser Use */}
          <Route path="/browser-use" element={<BrowserUse />} />

          {/* Agent routes */}
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/new" element={<AgentNew />} />
          <Route path="/agents/:agentId" element={<AgentDetail />} />

          {/* Community sub-routes */}
          <Route path="/community/:domain" element={<CommunityDomain />} />
          <Route path="/community/post/:postId" element={<CommunityPost />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
