import type {
  Agent,
  CommunityPost,
  Match,
  PaymentRecord,
  User,
  UserStory,
  ValidationForm,
} from "@/types";
import {
  API_BASE_URL,
  INTERVIEW_API_URL,
  ML_API_URL,
  USE_MOCK,
  USE_MOCK_AGENTS,
  USE_MOCK_FORMS,
  USE_MOCK_INTERVIEW,
  USE_MOCK_ML,
  USE_MOCK_USERS,
} from "@/lib/constants";
import * as mockData from "@/lib/mock-data";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

// ─── Users ─────────────────────────────────────────

export async function createUser(data: {
  email: string;
  name: string;
  role?: User["role"];
}): Promise<User> {
  if (USE_MOCK || USE_MOCK_USERS)
    return { ...mockData.mockUser, ...data, role: data.role ?? "founder" };

  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, name: data.name }),
  });
  const user = await jsonOrThrow<User>(res);
  return { ...user, role: data.role ?? "founder" };
}

export async function loginUser(email: string, name?: string, role: User["role"] = "founder"): Promise<User> {
  if (USE_MOCK || USE_MOCK_USERS)
    return { ...mockData.mockUser, email, name: name ?? mockData.mockUser.name, role };

  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  const user = await jsonOrThrow<User>(res);
  return { ...user, role };
}

export async function getUser(id: string): Promise<User> {
  if (USE_MOCK || USE_MOCK_USERS) return mockData.mockUser;
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  return jsonOrThrow<User>(res);
}

// ─── Stories & Agents ──────────────────────────────

export async function addStory(
  userId: string,
  story: Pick<UserStory, "type" | "title" | "description" | "tags">,
  agentScope: "self" | "public" = "public"
): Promise<{ story: UserStory; agent: Agent }> {
  if (USE_MOCK || USE_MOCK_AGENTS)
    return { story: mockData.mockStories[0], agent: mockData.mockAgents[0] };
  const res = await fetch(`${API_BASE_URL}/users/${userId}/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...story, agentScope }),
  });
  return jsonOrThrow<{ story: UserStory; agent: Agent }>(res);
}

export async function getAgents(userId: string): Promise<Agent[]> {
  if (USE_MOCK || USE_MOCK_AGENTS) return mockData.mockAgents;
  const res = await fetch(`${API_BASE_URL}/agents/user/${userId}`);
  return jsonOrThrow<Agent[]>(res);
}

export async function getAgentMatches(agentId: string): Promise<Match[]> {
  if (USE_MOCK || USE_MOCK_AGENTS) return mockData.mockMatches;
  const res = await fetch(`${API_BASE_URL}/agents/${agentId}/matches`);
  return jsonOrThrow<Match[]>(res);
}

export async function updateAgentStatus(
  agentId: string,
  action: "activate" | "pause" | "stop"
): Promise<Agent> {
  if (USE_MOCK || USE_MOCK_AGENTS) return mockData.mockAgents[0];
  const res = await fetch(`${API_BASE_URL}/agents/${agentId}/${action}`, {
    method: "POST",
  });
  return jsonOrThrow<Agent>(res);
}

// ─── Forms ─────────────────────────────────────────

export async function getForms(founderId?: string): Promise<ValidationForm[]> {
  if (USE_MOCK || USE_MOCK_FORMS) return mockData.mockForms;
  const url = founderId
    ? `${API_BASE_URL}/forms?founderId=${encodeURIComponent(founderId)}`
    : `${API_BASE_URL}/forms`;
  const res = await fetch(url);
  return jsonOrThrow<ValidationForm[]>(res);
}

export async function createForm(form: {
  founderId: string;
  title: string;
  description: string;
  targetProfile: string;
  questions: Array<{
    question: string;
    type: "text" | "multiChoice" | "rating";
    options?: string[];
    required?: boolean;
  }>;
}): Promise<{ form: ValidationForm; matchesTriggered: number }> {
  if (USE_MOCK || USE_MOCK_FORMS)
    return { form: mockData.mockForms[0], matchesTriggered: 3 };
  const res = await fetch(`${API_BASE_URL}/forms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  return jsonOrThrow<{ form: ValidationForm; matchesTriggered: number }>(res);
}

// ─── Feedback ──────────────────────────────────────

export async function submitFeedback(
  matchId: string,
  outcome: "accepted" | "rejected" | "opened" | "no_response"
): Promise<unknown> {
  if (USE_MOCK) return { success: true };
  const res = await fetch(`${API_BASE_URL}/feedback/${matchId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outcome }),
  });
  return jsonOrThrow(res);
}

// ─── Community (mock-only for now) ─────────────────

export async function getCommunityPosts(): Promise<CommunityPost[]> {
  return mockData.mockCommunityPosts;
}

// ─── ML Recommendation API (port 8001) ─────────────
// Requires a valid Supabase Bearer token from the calling user's session.

type ProjectRecommendation = {
  project_id: string;
  similarity: number;
  rank: number;
};
type TesterRecommendation = {
  tester_profile_id: string;
  similarity: number;
  rank: number;
};
export type ProjectRecommendationsResponse = {
  tester_profile_id: string;
  recommendations: ProjectRecommendation[];
};
export type TesterRecommendationsResponse = {
  project_id: string;
  recommendations: TesterRecommendation[];
};

export async function getProjectRecommendations(
  token: string,
  n = 10
): Promise<ProjectRecommendationsResponse> {
  if (USE_MOCK_ML) return { tester_profile_id: "", recommendations: [] };
  const res = await fetch(`${ML_API_URL}/recommendations/projects?n=${n}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return jsonOrThrow<ProjectRecommendationsResponse>(res);
}

export async function getTesterRecommendations(
  token: string,
  projectId: string,
  n = 10
): Promise<TesterRecommendationsResponse> {
  if (USE_MOCK_ML) return { project_id: projectId, recommendations: [] };
  const res = await fetch(
    `${ML_API_URL}/recommendations/testers?project_id=${encodeURIComponent(projectId)}&n=${n}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return jsonOrThrow<TesterRecommendationsResponse>(res);
}

// ─── Interview Intelligence API (port 8000) ─────────
// Sanjay's API — no auth required on those endpoints.

type BiasEvent = {
  severity: "low" | "medium" | "high";
  bias_type: string;
  flagged_text: string;
  context_reason: string;
  alternative_phrasings: string[];
  confidence: number;
};
export type InterviewIntelligence = {
  bias_events: BiasEvent[];
  bias_pressure_score: number;
  quality_score: number;
  analyzed_segment_count: number;
  generated_at: string;
};
export type InterviewSummaryReport = {
  findings: string[];
  validations: string[];
  bias_flags: string[];
  next_steps: string[];
  scores: {
    bias_score: number;
    question_quality: number;
    insight_density: number;
    validation_strength: number;
  };
};

export async function getInterviewIntelligence(
  roomName: string
): Promise<InterviewIntelligence> {
  if (USE_MOCK_INTERVIEW)
    return {
      bias_events: [],
      bias_pressure_score: 0,
      quality_score: 0,
      analyzed_segment_count: 0,
      generated_at: new Date().toISOString(),
    };
  const res = await fetch(
    `${INTERVIEW_API_URL}/intelligence/${encodeURIComponent(roomName)}`,
    { method: "POST" }
  );
  return jsonOrThrow<InterviewIntelligence>(res);
}

export async function getInterviewSummary(
  roomName: string
): Promise<InterviewSummaryReport | null> {
  if (USE_MOCK_INTERVIEW) return null;
  const res = await fetch(
    `${INTERVIEW_API_URL}/summary/${encodeURIComponent(roomName)}`
  );
  const data = await jsonOrThrow<{ report: InterviewSummaryReport | null }>(res);
  return data.report;
}

// ─── Stories ───────────────────────────────────────

export async function getStories(userId: string): Promise<UserStory[]> {
  if (USE_MOCK || USE_MOCK_AGENTS) return mockData.mockStories;
  const res = await fetch(`${API_BASE_URL}/users/${userId}/stories`);
  return jsonOrThrow<UserStory[]>(res);
}

export async function deleteStory(
  userId: string,
  storyId: string
): Promise<void> {
  if (USE_MOCK || USE_MOCK_AGENTS) return;
  await fetch(`${API_BASE_URL}/users/${userId}/stories/${storyId}`, {
    method: "DELETE",
  });
}

// ─── Form management ───────────────────────────────

export async function closeForm(formId: string): Promise<ValidationForm> {
  if (USE_MOCK || USE_MOCK_FORMS) return { ...mockData.mockForms[0], status: "closed" };
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/close`, {
    method: "POST",
  });
  return jsonOrThrow<ValidationForm>(res);
}

export async function getFormSubmissions(formId: string): Promise<Match[]> {
  if (USE_MOCK || USE_MOCK_FORMS)
    return mockData.mockMatches.filter((m) => m.formId === formId);
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/submissions`);
  return jsonOrThrow<Match[]>(res);
}

export interface PendingTester {
  matchId: string;
  score: number;
  createdAt: string;
  tester?: {
    id: string;
    name: string;
    email: string;
    domain: string;
    skills: string[];
    bio: string;
    qualityScore: number;
    projectsTested: number;
  };
}

export async function getPendingTesters(formId: string): Promise<PendingTester[]> {
  if (USE_MOCK || USE_MOCK_FORMS) return [];
  const res = await fetch(`${API_BASE_URL}/forms/${formId}/pending-testers`);
  return jsonOrThrow<PendingTester[]>(res);
}

export async function inviteTester(matchId: string): Promise<unknown> {
  if (USE_MOCK) return { success: true };
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}/invite`, { method: "POST" });
  return jsonOrThrow(res);
}

export async function declineTester(matchId: string): Promise<unknown> {
  if (USE_MOCK) return { success: true };
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}/decline`, { method: "POST" });
  return jsonOrThrow(res);
}

export async function submitTesterAnswers(
  matchId: string,
  answers: Record<string, string>
): Promise<unknown> {
  if (USE_MOCK) return { success: true };
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  return jsonOrThrow(res);
}

// ─── Matches ───────────────────────────────────────

export async function getMatchesByUser(userId: string): Promise<Match[]> {
  if (USE_MOCK || USE_MOCK_AGENTS)
    return mockData.mockMatches.filter((m) => m.userId === userId);
  const res = await fetch(`${API_BASE_URL}/matches/user/${userId}`);
  return jsonOrThrow<Match[]>(res);
}

export async function getMatch(matchId: string): Promise<Match> {
  if (USE_MOCK || USE_MOCK_AGENTS)
    return (
      mockData.mockMatches.find((m) => m.id === matchId) ??
      mockData.mockMatches[0]
    );
  const res = await fetch(`${API_BASE_URL}/matches/${matchId}`);
  return jsonOrThrow<Match>(res);
}

// ─── Agent policy ──────────────────────────────────

export async function getAgentPolicy(
  agentId: string
): Promise<{ trained: boolean; steps: number; epsilon: number }> {
  if (USE_MOCK || USE_MOCK_AGENTS)
    return (
      mockData.mockAgents.find((a) => a.id === agentId)?.policy ?? {
        trained: false,
        steps: 0,
        epsilon: 1.0,
      }
    );
  const res = await fetch(`${API_BASE_URL}/feedback/agent/${agentId}/policy`);
  return jsonOrThrow<{ trained: boolean; steps: number; epsilon: number }>(res);
}

// ─── Payments ──────────────────────────────────────

export async function getPayments(userId: string): Promise<PaymentRecord[]> {
  if (USE_MOCK) return [];
  const res = await fetch(`${API_BASE_URL}/payments/user/${userId}`);
  return jsonOrThrow<PaymentRecord[]>(res);
}

