/**
 * /payments routes
 *
 * x402 handles the actual payment flow automatically via middleware.
 * These routes expose payment history for display in the dashboard.
 */
import { Router } from "express";
import { db } from "../db.js";

const router = Router();

// ── List payment records for a user ──────────────────────────────────────────
router.get("/user/:userId", (req, res) => {
  const records = [...db.payments.values()].filter(
    (p) => p.userId === req.params.userId
  );
  return res.json(records);
});

// ── Get single payment record ─────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const record = db.payments.get(req.params.id);
  if (!record) return res.status(404).json({ error: "Payment not found" });
  return res.json(record);
});

export default router;
