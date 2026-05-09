/**
 * Agent memory / experience replay buffer.
 *
 * Each agent accumulates (state, action, reward, nextState) tuples — the
 * standard RL experience replay format. The policy learner samples from
 * this buffer to update the agent's matching and answer-generation strategy.
 *
 * State  = feature vector describing the match context
 * Action = the answers the agent chose to submit
 * Reward = outcome signal from the founder
 */

import { db } from "../db.js";

export interface Experience {
  agentId: string;
  matchId: string;
  /** Numeric feature vector: [relevanceScore, storyAge, agentSuccessRate, formResponseRate] */
  state: number[];
  /** The answers submitted (serialised as a string for storage simplicity) */
  action: string;
  reward: number;
  /** State after the outcome was observed */
  nextState: number[];
  timestamp: string;
}

// In-memory replay buffer per agent — swap for Redis / Postgres in prod
const replayBuffers = new Map<string, Experience[]>();
const MAX_BUFFER_SIZE = 500;

export function recordExperience(exp: Experience): void {
  const buf = replayBuffers.get(exp.agentId) ?? [];
  buf.push(exp);
  // Fixed-size circular buffer — evict oldest
  if (buf.length > MAX_BUFFER_SIZE) buf.shift();
  replayBuffers.set(exp.agentId, buf);
}

export function sampleBatch(agentId: string, batchSize: number): Experience[] {
  const buf = replayBuffers.get(agentId) ?? [];
  if (buf.length <= batchSize) return [...buf];
  // Random sample without replacement
  const shuffled = [...buf].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, batchSize);
}

export function getBuffer(agentId: string): Experience[] {
  return replayBuffers.get(agentId) ?? [];
}

/** Build state vector for a match context */
export function buildStateVector(
  relevanceScore: number,
  agentId: string
): number[] {
  const agent = db.agents.get(agentId);
  if (!agent) return [relevanceScore, 0, 0, 0];

  const allMatches = [...db.matches.values()].filter((m) => m.agentId === agentId);
  const submitted = allMatches.filter((m) => m.status === "submitted").length;
  const successRate = allMatches.length > 0 ? submitted / allMatches.length : 0;
  const ageHours =
    (Date.now() - new Date(agent.createdAt).getTime()) / 3_600_000;

  return [
    relevanceScore,          // how well the story matched the form
    Math.min(ageHours / 720, 1), // normalised agent age (cap at 30 days)
    successRate,             // historical submission success rate
    agent.filledForms / 100, // normalised forms filled (cap at 100)
  ];
}
