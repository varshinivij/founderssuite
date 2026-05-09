/**
 * /feedback — founder records outcome for an agent submission.
 *
 * This is the primary RL training signal. When a founder marks a submission
 * as accepted or rejected, the relevant agent trains on that outcome immediately.
 */
import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { onOutcome } from "../ml/rlTrainer.js";
import type { Outcome } from "../ml/rewardSignal.js";
import { getWeightsSummary } from "../ml/policyNet.js";

const router = Router();

const FeedbackSchema = z.object({
  outcome: z.enum(["accepted", "rejected", "opened", "no_response"]),
});

/**
 * POST /feedback/:matchId
 * Body: { outcome: "accepted" | "rejected" | "opened" | "no_response" }
 *
 * Records founder feedback and triggers one RL training step for the agent
 * that submitted this match.
 */
router.post("/:matchId", (req, res) => {
  const match = db.matches.get(req.params.matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });

  const parsed = FeedbackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const outcome = parsed.data.outcome as Outcome;
  const agent = db.agents.get(match.agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  // Train the agent on this outcome
  onOutcome({
    agentId: agent.id,
    matchId: match.id,
    relevanceScore: match.score,
    action: "SUBMIT", // the agent chose to submit
    outcome,
  });

  // Optionally update match status based on outcome
  if (outcome === "accepted") match.status = "submitted";
  if (outcome === "rejected") match.status = "rejected";
  db.matches.set(match.id, match);

  const weights = getWeightsSummary(agent.id);
  return res.json({
    message: "Feedback recorded — agent trained",
    outcome,
    agentPolicy: weights,
  });
});

/**
 * GET /feedback/agent/:agentId/policy
 * Returns current RL policy stats for an agent (epsilon, training steps).
 */
router.get("/agent/:agentId/policy", (req, res) => {
  const agent = db.agents.get(req.params.agentId);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const weights = getWeightsSummary(req.params.agentId);
  if (!weights) return res.json({ trained: false, steps: 0, epsilon: 1.0 });

  return res.json({ trained: true, ...weights });
});

export default router;
