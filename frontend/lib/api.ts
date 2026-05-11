import type {
  Agent,
  CommunityPost,
  Match,
  User,
  UserStory,
  ValidationForm,
} from "@/types";
import {
  API_BASE_URL,
  USE_MOCK,
  USE_MOCK_AGENTS,
  USE_MOCK_FORMS,
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

export async function getUser(id: string): Promise<User> {
  if (USE_MOCK || USE_MOCK_USERS) return mockData.mockUser;
  const res = await fetch(`${API_BASE_URL}/users/${id}`);
  return jsonOrThrow<User>(res);
}

// ─── Stories & Agents ──────────────────────────────

export async function addStory(
  userId: string,
  story: Pick<UserStory, "type" | "title" | "description" | "tags">
): Promise<{ story: UserStory; agent: Agent }> {
  if (USE_MOCK || USE_MOCK_AGENTS)
    return { story: mockData.mockStories[0], agent: mockData.mockAgents[0] };
  const res = await fetch(`${API_BASE_URL}/users/${userId}/stories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(story),
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

export async function getForms(): Promise<ValidationForm[]> {
  if (USE_MOCK || USE_MOCK_FORMS) return mockData.mockForms;
  const res = await fetch(`${API_BASE_URL}/forms`);
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

