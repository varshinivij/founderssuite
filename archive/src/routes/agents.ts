import { Router } from "express";
import {
  getAgent,
  getAgentsByUser,
  setAgentStatus,
  deleteAgent,
  computeSuccessRate,
} from "../services/agentService.js";
import { db } from "../db.js";
import { getWeightsSummary } from "../ml/policyNet.js";

const router = Router();

function enrichAgent(agent: ReturnType<typeof getAgent>) {
  if (!agent) return null;
  const policy = getWeightsSummary(agent.id);
  const successRate = computeSuccessRate(agent.id) || agent.successRate;
  return {
    ...agent,
    successRate,
    policy: policy
      ? { trained: true, steps: policy.steps, epsilon: policy.epsilon }
      : agent.policy,
  };
}

// ── List all agents for a user ────────────────────────────────────────────────
router.get("/user/:userId", (req, res) => {
  const agents = getAgentsByUser(req.params.userId).map(enrichAgent).filter(Boolean);
  return res.json(agents);
});

// ── Get single agent ──────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(enrichAgent(agent));
});

// ── Activate agent ────────────────────────────────────────────────────────────
router.post("/:id/activate", (req, res) => {
  const agent = setAgentStatus(req.params.id, "active");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(enrichAgent(agent));
});

// ── Pause agent ───────────────────────────────────────────────────────────────
router.post("/:id/pause", (req, res) => {
  const agent = setAgentStatus(req.params.id, "paused");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(enrichAgent(agent));
});

// ── Stop agent ────────────────────────────────────────────────────────────────
router.post("/:id/stop", (req, res) => {
  const agent = setAgentStatus(req.params.id, "stopped");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(enrichAgent(agent));
});

// ── Get matches for an agent ──────────────────────────────────────────────────
router.get("/:id/matches", (req, res) => {
  const matches = [...db.matches.values()].filter(
    (m) => m.agentId === req.params.id
  );
  return res.json(matches);
});

// ── Delete agent ──────────────────────────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const deleted = deleteAgent(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Agent not found" });
  return res.status(204).send();
});

export default router;
