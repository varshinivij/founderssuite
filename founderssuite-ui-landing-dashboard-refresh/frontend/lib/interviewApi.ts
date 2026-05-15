// Interview Intelligence API client — wraps the FastAPI server on INTERVIEW_API_URL (port 8000)
import type { LiveIntelligenceState, Segment } from "./interviewIntelligence";

const BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_INTERVIEW_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000";

async function ok<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ── Token / LiveKit ─────────────────────────────────────────────────────────

export interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export async function fetchToken(roomName?: string, participantName = "user", userId?: string): Promise<ConnectionDetails> {
  const res = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_name: roomName, participant_name: participantName, user_id: userId }),
  });
  return ok<ConnectionDetails>(res);
}

// ── Meeting context ─────────────────────────────────────────────────────────

export interface MeetingContext {
  objective: string;
  target_customer: string;
  hypothesis: string;
  success_criteria: string;
  avoid_topics: string;
  notes: string;
}

export async function saveMeetingContext(roomName: string, ctx: MeetingContext) {
  const res = await fetch(`${BASE}/meeting-context`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_name: roomName, ...ctx }),
  });
  return ok<{ context: MeetingContext }>(res);
}

// ── Transcript ──────────────────────────────────────────────────────────────

export async function fetchTranscript(roomName: string): Promise<{ segments: Segment[] }> {
  const res = await fetch(`${BASE}/transcript/${encodeURIComponent(roomName)}`);
  if (!res.ok) return { segments: [] };
  return res.json() as Promise<{ segments: Segment[] }>;
}

export async function storeTranscript(roomName: string, speaker: string, text: string) {
  const res = await fetch(`${BASE}/transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_name: roomName, speaker, text, timestamp_ms: Date.now() }),
  });
  return ok<{ status: string }>(res);
}

// ── Intelligence ────────────────────────────────────────────────────────────

export async function analyzeLiveIntelligence(roomName: string): Promise<LiveIntelligenceState> {
  const res = await fetch(`${BASE}/intelligence/${encodeURIComponent(roomName)}`, { method: "POST" });
  return ok<LiveIntelligenceState>(res);
}

// ── Meetings ────────────────────────────────────────────────────────────────

export interface Meeting {
  id: string;
  room_name: string;
  title?: string;
  created_at: string;
  is_simulated?: boolean;
}

export async function fetchMeetings(userId?: string): Promise<{ meetings: Meeting[] }> {
  const params = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  const res = await fetch(`${BASE}/meetings${params}`);
  if (!res.ok) return { meetings: [] };
  return res.json() as Promise<{ meetings: Meeting[] }>;
}

// ── Summary ─────────────────────────────────────────────────────────────────

export interface SummaryReport {
  findings: string[];
  validations: Array<{ hypothesis: string; status: "validated" | "invalidated" | "unclear"; evidence: string }>;
  bias_flags: Array<{ question: string; issue: string; suggestion: string }>;
  next_steps: string[];
  scores: { bias_score: number; question_quality: number; insight_density: number; validation_strength: number };
  raw?: string;
  error?: string;
}

export async function generateSummary(roomName: string): Promise<{ report: SummaryReport }> {
  const res = await fetch(`${BASE}/summary/${encodeURIComponent(roomName)}`, { method: "POST" });
  return ok<{ report: SummaryReport }>(res);
}

export async function fetchSummary(roomName: string): Promise<{ report: SummaryReport | null }> {
  const res = await fetch(`${BASE}/summary/${encodeURIComponent(roomName)}`);
  if (!res.ok) return { report: null };
  return res.json() as Promise<{ report: SummaryReport | null }>;
}

// ── Simulation ──────────────────────────────────────────────────────────────

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

export async function startSimulation(persona: SimulationPersona): Promise<SimulationSession> {
  const res = await fetch(`${BASE}/simulation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ persona }),
  });
  return ok<SimulationSession>(res);
}

export async function sendSimulationTurn(roomName: string, question: string) {
  const res = await fetch(`${BASE}/simulation/${encodeURIComponent(roomName)}/turn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return ok<{ room_name: string; segments: Segment[]; intelligence: LiveIntelligenceState; answer: string }>(res);
}

// ── Memory ──────────────────────────────────────────────────────────────────

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

export async function buildMemory(roomName: string, workspaceId = "default") {
  const res = await fetch(`${BASE}/memory/build/${encodeURIComponent(roomName)}?workspace_id=${encodeURIComponent(workspaceId)}`, { method: "POST" });
  return ok<{ workspace_id: string; room_name: string; chunks: MemoryChunk[]; entities: GraphNode[]; relationships: GraphEdge[]; degraded?: string[] }>(res);
}

export async function searchMemory(query: string, workspaceId = "default") {
  const params = new URLSearchParams({ query, workspace_id: workspaceId });
  const res = await fetch(`${BASE}/memory/search?${params}`);
  if (!res.ok) return { results: [] as MemoryChunk[], degraded: [] };
  return res.json() as Promise<{ results: MemoryChunk[]; degraded?: string[] }>;
}

export async function fetchMemoryTimeline(workspaceId = "default") {
  const res = await fetch(`${BASE}/memory/timeline?workspace_id=${encodeURIComponent(workspaceId)}`);
  if (!res.ok) return { events: [] as MemoryChunk[] };
  return res.json() as Promise<{ events: MemoryChunk[] }>;
}

export async function fetchGraph(workspaceId = "default") {
  const res = await fetch(`${BASE}/graph/workspace/${encodeURIComponent(workspaceId)}`);
  if (!res.ok) return { nodes: [] as GraphNode[], edges: [] as GraphEdge[] };
  return res.json() as Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
}

// ── Browser session ─────────────────────────────────────────────────────────

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
  status: "starting" | "running" | "paused" | "waiting_for_approval" | "completed" | "failed";
  current_url: string;
  screenshot_url: string | null;
  dom_snapshot_ref: string | null;
  requires_approval: boolean;
  action_log: BrowserEvent[];
  created_at: string;
  updated_at: string;
}

export async function startBrowserSession(input: { target_url: string; task: string; workspace_id?: string; room_name?: string | null }) {
  const res = await fetch(`${BASE}/browser/session/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return ok<{ session: BrowserSession }>(res);
}

export async function fetchBrowserEvents(sessionId: string) {
  const res = await fetch(`${BASE}/browser/session/${sessionId}/events`);
  if (!res.ok) return { events: [] as BrowserEvent[] };
  return res.json() as Promise<{ events: BrowserEvent[] }>;
}

export async function updateBrowserSession(sessionId: string, action: "pause" | "resume" | "takeover" | "approve-submission") {
  const res = await fetch(`${BASE}/browser/session/${sessionId}/${action}`, { method: "POST" });
  return ok<{ session: BrowserSession }>(res);
}
