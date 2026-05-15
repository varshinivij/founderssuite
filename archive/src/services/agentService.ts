/**
 * agentService — creates and manages AI agents derived from user stories.
 *
 * Each agent:
 *  - Holds a natural-language match criteria built from the user's story
 *  - Monitors open ValidationForms for relevance
 *  - Auto-fills and submits forms on behalf of the user when a match is found
 */
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import type { Agent, UserStory } from "../types/index.js";

/**
 * Spin up a new agent for a given story.
 * Called after x402 payment is confirmed.
 */
export function createAgent(
  story: UserStory,
  type: "ai" | "human" = "human",
  scope: "self" | "public" = "public"
): Agent {
  const agent: Agent = {
    id: uuidv4(),
    userId: story.userId,
    storyId: story.id,
    name: `Agent for "${story.title}"`,
    status: "active",
    type,
    scope,
    matchCriteria: buildMatchCriteria(story),
    filledForms: 0,
    successRate: 0,
    policy: { trained: false, steps: 0, epsilon: 1.0 },
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  db.agents.set(agent.id, agent);
  return agent;
}

export function computeSuccessRate(agentId: string): number {
  const matches = [...db.matches.values()].filter((m) => m.agentId === agentId);
  if (matches.length === 0) return 0;
  const accepted = matches.filter((m) => m.status === "submitted").length;
  return accepted / matches.length;
}

/**
 * Derive a plain-text match criteria string from the user's story.
 * In production this would call an LLM to distil the story into
 * structured intent — kept simple here.
 */
function buildMatchCriteria(story: UserStory): string {
  return [
    `Type: ${story.type}`,
    `Title: ${story.title}`,
    `Context: ${story.description}`,
    story.tags.length ? `Tags: ${story.tags.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

export function getAgentsByUser(userId: string): Agent[] {
  return [...db.agents.values()].filter((a) => a.userId === userId);
}

export function getAgent(agentId: string): Agent | undefined {
  return db.agents.get(agentId);
}

export function setAgentStatus(
  agentId: string,
  status: Agent["status"]
): Agent | null {
  const agent = db.agents.get(agentId);
  if (!agent) return null;
  agent.status = status;
  agent.lastActiveAt = new Date().toISOString();
  db.agents.set(agentId, agent);
  return agent;
}

export function deleteAgent(agentId: string): boolean {
  return db.agents.delete(agentId);
}
