import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// ── List matches for a user (across all their agents) ────────────────────────
router.get("/user/:userId", (req, res) => {
  const matches = [...db.matches.values()].filter(
    (m) => m.userId === req.params.userId
  );
  return res.json(matches);
});

// ── Get single match ──────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  return res.json(match);
});

export default router;
