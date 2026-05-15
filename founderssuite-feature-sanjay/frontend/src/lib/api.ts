const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function fetchToken(roomName?: string, participantName = 'user') {
  const res = await fetch(`${BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_name: roomName, participant_name: participantName }),
  });
  if (!res.ok) throw new Error('Failed to fetch token');
  return res.json() as Promise<{
    serverUrl: string;
    roomName: string;
    participantName: string;
    participantToken: string;
  }>;
}

export async function saveMeetingContext(roomName: string, context: MeetingContext) {
  const res = await fetch(`${BASE}/meeting-context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_name: roomName, ...context }),
  });
  if (!res.ok) throw new Error('Failed to save meeting context');
  return res.json() as Promise<{ context: MeetingContext }>;
}

export async function fetchTranscript(roomName: string) {
  const res = await fetch(`${BASE}/transcript/${roomName}`);
  if (!res.ok) return { segments: [] };
  return res.json() as Promise<{ segments: Array<{ speaker: string; text: string; timestamp_ms: number }> }>;
}

export async function storeTranscript(roomName: string, speaker: string, text: string) {
  const res = await fetch(`${BASE}/transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      room_name: roomName,
      speaker,
      text,
      timestamp_ms: Date.now(),
    }),
  });
  if (!res.ok) throw new Error('Failed to store transcript');
  return res.json() as Promise<{ status: string }>;
}

export async function analyzeLiveIntelligence(roomName: string) {
  const res = await fetch(`${BASE}/intelligence/${roomName}`, { method: 'POST' });
  if (!res.ok) throw new Error('Live intelligence analysis failed');
  return res.json() as Promise<LiveIntelligenceState>;
}

export async function startSimulation(persona: SimulationPersona) {
  const res = await fetch(`${BASE}/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona }),
  });
  if (!res.ok) throw new Error('Failed to start simulation');
  return res.json() as Promise<SimulationSession>;
}

export async function sendSimulationTurn(roomName: string, question: string) {
  const res = await fetch(`${BASE}/simulation/${roomName}/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error('Failed to send simulation turn');
  return res.json() as Promise<SimulationTurnResponse>;
}

export async function generateSummary(roomName: string) {
  const res = await fetch(`${BASE}/summary/${roomName}`, { method: 'POST' });
  if (!res.ok) throw new Error('Summary generation failed');
  return res.json() as Promise<{ report: SummaryReport }>;
}

export async function fetchSummary(roomName: string) {
  const res = await fetch(`${BASE}/summary/${roomName}`);
  if (!res.ok) return { report: null };
  return res.json() as Promise<{ report: SummaryReport | null }>;
}

export async function fetchMeetings() {
  const res = await fetch(`${BASE}/meetings`);
  if (!res.ok) return { meetings: [] };
  return res.json() as Promise<{ meetings: Meeting[] }>;
}

export async function buildMemory(roomName: string, workspaceId = 'default') {
  const res = await fetch(`${BASE}/memory/build/${roomName}?workspace_id=${encodeURIComponent(workspaceId)}`, { method: 'POST' });
  if (!res.ok) throw new Error('Memory build failed');
  return res.json() as Promise<MemoryBuildResponse>;
}

export async function searchMemory(query: string, workspaceId = 'default') {
  const params = new URLSearchParams({ query, workspace_id: workspaceId });
  const res = await fetch(`${BASE}/memory/search?${params.toString()}`);
  if (!res.ok) throw new Error('Memory search failed');
  return res.json() as Promise<{ results: MemoryChunk[]; degraded?: string[] }>;
}

export async function fetchMemoryTimeline(workspaceId = 'default') {
  const res = await fetch(`${BASE}/memory/timeline?workspace_id=${encodeURIComponent(workspaceId)}`);
  if (!res.ok) return { events: [] };
  return res.json() as Promise<{ events: MemoryChunk[] }>;
}

export async function fetchGraph(workspaceId = 'default') {
  const res = await fetch(`${BASE}/graph/workspace/${encodeURIComponent(workspaceId)}`);
  if (!res.ok) return { nodes: [], edges: [] };
  return res.json() as Promise<GraphResponse>;
}

export async function fetchEntity(entityId: string) {
  const res = await fetch(`${BASE}/entities/${encodeURIComponent(entityId)}`);
  if (!res.ok) throw new Error('Entity lookup failed');
  return res.json() as Promise<{ entity: GraphNode; relationships: GraphEdge[]; memories: MemoryChunk[] }>;
}

export async function startBrowserSession(input: BrowserSessionStartInput) {
  const res = await fetch(`${BASE}/browser/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Browser session start failed');
  return res.json() as Promise<{ session: BrowserSession }>;
}

export async function fetchBrowserSession(sessionId: string) {
  const res = await fetch(`${BASE}/browser/session/${sessionId}`);
  if (!res.ok) throw new Error('Browser session lookup failed');
  return res.json() as Promise<{ session: BrowserSession }>;
}

export async function fetchBrowserEvents(sessionId: string) {
  const res = await fetch(`${BASE}/browser/session/${sessionId}/events`);
  if (!res.ok) return { events: [] };
  return res.json() as Promise<{ events: BrowserEvent[] }>;
}

export async function updateBrowserSession(sessionId: string, action: 'pause' | 'resume' | 'takeover' | 'approve-submission') {
  const res = await fetch(`${BASE}/browser/session/${sessionId}/${action}`, { method: 'POST' });
  if (!res.ok) throw new Error('Browser session update failed');
  return res.json() as Promise<{ session: BrowserSession }>;
}

export interface Meeting {
  id: string;
  room_name: string;
  title?: string;
  created_at: string;
}

export interface Segment {
  speaker: string;
  text: string;
  timestamp_ms: number;
}

export interface MeetingContext {
  objective: string;
  target_customer: string;
  hypothesis: string;
  success_criteria: string;
  avoid_topics: string;
  notes: string;
}

export interface IntentState {
  phase: 'rapport' | 'problem_exploration' | 'solution_validation' | 'pricing' | 'closing';
  confidence: number;
  intent_signal: string;
  recommended_questions: string[];
  momentum: 'opening' | 'deepening' | 'drifting' | 'closing';
}

export interface BiasEvent {
  severity: 'low' | 'medium' | 'high';
  bias_type:
    | 'confirmation'
    | 'leading'
    | 'anchoring'
    | 'assumption'
    | 'social_desirability'
    | 'false_dichotomy'
    | 'double_barreled'
    | 'sycophantic';
  flagged_text: string;
  context_reason: string;
  alternative_phrasings: string[];
  confidence: number;
  source?: 'heuristic' | 'embedding' | 'openai' | 'local';
}

export interface QuoteEvent {
  text: string;
  speaker: string;
  signal_type: 'pain' | 'workaround' | 'willingness_to_pay' | 'objection' | 'validation';
  confidence: number;
}

export interface LiveIntelligenceState {
  intent: IntentState;
  bias_events: BiasEvent[];
  bias_pressure_score: number;
  quality_score: number;
  talk_time: {
    founder_ratio: number;
    user_ratio: number;
    alert: string | null;
  };
  topic_drift: {
    drifting: boolean;
    current_topic: string | null;
    redirect_question: string | null;
  };
  quotes: QuoteEvent[];
  analyzed_segment_count: number;
  generated_at: string;
  degraded?: string[];
}

export interface SimulationPersona {
  id: string;
  name: string;
  domains: string[];
  profile: string;
  role?: string;
  companyContext?: string;
  buyingCriteria?: string[];
  skepticism?: string;
  responseStyle?: string;
}

export interface SimulationSession {
  room_name: string;
  persona: SimulationPersona;
  segments: Segment[];
  intelligence: LiveIntelligenceState;
}

export interface SimulationTurnResponse {
  room_name: string;
  segments: Segment[];
  intelligence: LiveIntelligenceState;
  answer: string;
}

export interface SummaryReport {
  findings: string[];
  validations: Array<{ hypothesis: string; status: 'validated' | 'invalidated' | 'unclear'; evidence: string }>;
  bias_flags: Array<{ question: string; issue: string; suggestion: string }>;
  next_steps: string[];
  scores: {
    bias_score: number;
    question_quality: number;
    insight_density: number;
    validation_strength: number;
  };
  raw?: string;
  error?: string;
}

export interface MemoryChunk {
  id: string;
  workspace_id: string;
  room_name: string;
  source: string;
  speaker: string;
  text: string;
  topic: string;
  entity_ids: string[];
  timestamp_ms: number | null;
  confidence: number;
  created_at: string;
  score?: number;
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  confidence: number;
  room_name?: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MemoryBuildResponse {
  workspace_id: string;
  room_name: string;
  chunks: MemoryChunk[];
  entities: GraphNode[];
  relationships: GraphEdge[];
  degraded?: string[];
}

export interface BrowserEvent {
  id: string;
  session_id: string;
  type: string;
  message: string;
  created_at: string;
  confidence?: number;
  requires_approval?: boolean;
}

export interface BrowserSession {
  id: string;
  workspace_id: string;
  target_url: string;
  task: string;
  status: 'starting' | 'running' | 'paused' | 'waiting_for_approval' | 'completed' | 'failed';
  current_url: string;
  screenshot_url: string | null;
  dom_snapshot_ref: string | null;
  requires_approval: boolean;
  action_log: BrowserEvent[];
  created_at: string;
  updated_at: string;
}

export interface BrowserSessionStartInput {
  target_url: string;
  task: string;
  workspace_id?: string;
  room_name?: string | null;
}
