/**
 * matchingService — scans open ValidationForms against all active agents.
 */
import { v4 as uuidv4 } from "uuid";
import { db } from "../db.js";
import { fillAndSubmitForm } from "./formFillerService.js";
import { agentDecide } from "../ml/rlTrainer.js";
import type { Match, ValidationForm, Agent } from "../types/index.js";

const MATCH_THRESHOLD = 0.30; // agent-coverage score: must cover ≥30% of agent's criteria tokens

export async function matchFormToAgents(form: ValidationForm): Promise<Match[]> {
  const activeAgents = [...db.agents.values()].filter((a) => a.status === "active");
  const created: Match[] = [];

  for (const agent of activeAgents) {
    // "self" scope agents only fill their own founder's forms
    if (agent.scope === "self" && agent.userId !== form.founderId) continue;

    const score = scoreRelevance(agent, form);
    if (score < MATCH_THRESHOLD) continue;

    const alreadyMatched = [...db.matches.values()].some(
      (m) => m.agentId === agent.id && m.formId === form.id
    );
    if (alreadyMatched) continue;

    // Human agents surface as pending matches for the founder to review — no auto-fill
    if (agent.type === "human") {
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
      continue;
    }

    // AI agents: matches above 0.33 always submit — DQN Q-values are random on fresh start
    const decision = score >= 0.33 ? "SUBMIT" : agentDecide(agent.id, score);
    if (decision === "SKIP") continue;

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

    if (decision === "SUBMIT") {
      fillAndSubmitForm(match, agent, form).catch(console.error);
    }
  }

  return created;
}

/**
 * Agent-coverage score: fraction of agent criteria tokens found in form text.
 * Applies basic suffix-stripping so "teachers"/"teacher", "students"/"student" match.
 */
function scoreRelevance(agent: Agent, form: ValidationForm): number {
  const agentTokens = tokenize(agent.matchCriteria).map(stem);
  if (agentTokens.length === 0) return 0;

  const formText = `${form.title} ${form.description} ${form.targetProfile} ${
    form.questions.map((q) => q.question).join(" ")
  }`;
  const formTokens = new Set(tokenize(formText).map(stem));

  const overlap = agentTokens.filter((t) => formTokens.has(t)).length;
  return overlap / agentTokens.length;
}

/** Strip trailing "s" so plural/singular forms match (teachers↔teacher, students↔student). */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

const STOPWORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can",
  "had", "her", "was", "one", "our", "out", "day", "get", "has", "him",
  "his", "how", "its", "may", "new", "now", "old", "see", "two", "who",
  "did", "she", "use", "way", "will", "with", "this", "that", "from",
  "have", "been", "what", "your", "they", "more", "very", "when", "come",
  "here", "just", "know", "like", "make", "over", "such", "take", "than",
  "them", "then", "time", "well", "were", "about", "their", "there",
  "would", "could", "which", "also", "some", "into", "most", "other",
  "people", "years", "first", "last", "long", "great", "little", "own",
  "right", "look", "going", "being", "doing", "early", "stage",
]);
