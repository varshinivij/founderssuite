import { Router } from "express";
import {
  getAgent,
  getAgentsByUser,
  setAgentStatus,
  deleteAgent,
} from "../services/agentService.js";
import { db } from "../db.js";

const router = Router();

// ── List all agents for a user ────────────────────────────────────────────────
router.get("/user/:userId", (req, res) => {
  return res.json(getAgentsByUser(req.params.userId));
});

// ── Get single agent ──────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(agent);
});

// ── Activate agent ────────────────────────────────────────────────────────────
router.post("/:id/activate", (req, res) => {
  const agent = setAgentStatus(req.params.id, "active");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(agent);
});

// ── Pause agent ───────────────────────────────────────────────────────────────
router.post("/:id/pause", (req, res) => {
  const agent = setAgentStatus(req.params.id, "paused");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(agent);
});

// ── Stop agent ────────────────────────────────────────────────────────────────
router.post("/:id/stop", (req, res) => {
  const agent = setAgentStatus(req.params.id, "stopped");
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  return res.json(agent);
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
