/**
 * formFillerService — the agent's core capability.
 *
 * Given a Match, the owning Agent, and the target ValidationForm, this
 * service constructs answers for every form question using the user's
 * story as context, then marks the match as submitted.
 *
 * In production swap `generateAnswer` for a real LLM call with the
 * user's full story + the question as prompt.
 */
import { db } from "../db.js";
import type { Match, Agent, ValidationForm } from "../types/index.js";

export async function fillAndSubmitForm(
  match: Match,
  agent: Agent,
  form: ValidationForm
): Promise<void> {
  const story = db.stories.get(agent.storyId);
  if (!story) return;

  const answers: Record<string, string> = {};

  for (const q of form.questions) {
    answers[q.id] = await generateAnswer(q.question, story.description, q.type, q.options);
  }

  // Persist filled answers and mark submitted
  match.agentAnswers = answers;
  match.status = "submitted";
  match.submittedAt = new Date().toISOString();
  db.matches.set(match.id, match);

  // Increment agent stats
  const agentRecord = db.agents.get(agent.id);
  if (agentRecord) {
    agentRecord.filledForms += 1;
    agentRecord.lastActiveAt = new Date().toISOString();
    db.agents.set(agent.id, agentRecord);
  }
}

/**
 * Stub — replace with an actual LLM call in production.
 *
 * Example prod implementation:
 *   const resp = await anthropic.messages.create({
 *     model: process.env.AI_MODEL,
 *     messages: [{ role: "user", content: buildPrompt(question, userStory) }],
 *   });
 *   return resp.content[0].text;
 */
async function generateAnswer(
  question: string,
  userStory: string,
  type: string,
  options?: string[]
): Promise<string> {
  if (type === "multiChoice" && options?.length) {
    return options[0]; // pick first option as placeholder
  }
  if (type === "rating") {
    return "4";
  }
  // text — would be LLM-generated from userStory + question
  return `[Agent answer based on: "${userStory.slice(0, 80)}..."]`;
}
