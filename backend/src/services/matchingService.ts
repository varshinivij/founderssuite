/**
 * matchingService — scans open ValidationForms against all active agents.
 *
 * Flow:
 *  1. A founder posts a ValidationForm
 *  2. matchingService runs (on form creation + on a polling interval)
 *  3. For each active agent, a relevance score is computed
 *  4. Matches above threshold are handed to formFillerService
 */
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { fillAndSubmitForm } from "./formFillerService.js";
import type { Match, ValidationForm, Agent } from "../types/index.js";

const MATCH_THRESHOLD = 0.55;

/**
 * Run matching for a single form against all active agents.
 * Call this whenever a new form is created.
 */
export async function matchFormToAgents(form: ValidationForm): Promise<Match[]> {
  const activeAgents = [...db.agents.values()].filter(
    (a) => a.status === "active"
  );
  const created: Match[] = [];

  for (const agent of activeAgents) {
    const score = scoreRelevance(agent, form);
    if (score < MATCH_THRESHOLD) continue;

    // Avoid duplicate matches
    const alreadyMatched = [...db.matches.values()].some(
      (m) => m.agentId === agent.id && m.formId === form.id
    );
    if (alreadyMatched) continue;

    const match: Match = {
      id: uuidv4(),
      agentId: agent.id,
      userId: agent.userId,
      formId: form.id,
      score,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.matches.set(match.id, match);
    created.push(match);

    // Fire-and-forget: let the agent fill the form
    fillAndSubmitForm(match, agent, form).catch(console.error);
  }

  return created;
}

/**
 * Simple keyword overlap score — replace with an LLM embedding
 * similarity call (e.g. text-embedding-3-small cosine distance) in prod.
 */
function scoreRelevance(agent: Agent, form: ValidationForm): number {
  const agentTokens = tokenize(agent.matchCriteria);
  const formTokens = tokenize(`${form.title} ${form.description} ${form.targetProfile}`);

  const overlap = agentTokens.filter((t) => formTokens.includes(t)).length;
  if (agentTokens.length === 0) return 0;
  return Math.min(overlap / agentTokens.length, 1);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 3);
}
