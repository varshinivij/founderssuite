import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db } from "../db.js";
import { matchFormToAgents } from "../services/matchingService.js";
import type { ValidationForm } from "../types/index.js";

const router = Router();

const QuestionSchema = z.object({
  question: z.string().min(1),
  type: z.enum(["text", "multiChoice", "rating"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(true),
});

const CreateFormSchema = z.object({
  founderId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(10),
  questions: z.array(QuestionSchema).min(1),
  targetProfile: z.string().min(1),
});

// ── Create form — triggers agent matching ─────────────────────────────────────
router.post("/", async (req, res) => {
  const parsed = CreateFormSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const form: ValidationForm = {
    id: uuidv4(),
    ...parsed.data,
    questions: parsed.data.questions.map((q) => ({ id: uuidv4(), ...q })),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  db.forms.set(form.id, form);

  // Kick off agent matching asynchronously
  const matches = await matchFormToAgents(form);

  return res.status(201).json({ form, matchesTriggered: matches.length });
});

// ── List open forms ───────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  const forms = [...db.forms.values()].filter((f) => f.status === "open");
  return res.json(forms);
});

// ── Get form ──────────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const form = db.forms.get(req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });
  return res.json(form);
});

// ── Close form ────────────────────────────────────────────────────────────────
router.post("/:id/close", (req, res) => {
  const form = db.forms.get(req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });
  form.status = "closed";
  db.forms.set(form.id, form);
  return res.json(form);
});

// ── Get all submissions for a form ────────────────────────────────────────────
router.get("/:id/submissions", (req, res) => {
  const submissions = [...db.matches.values()].filter(
    (m) => m.formId === req.params.id && m.status === "submitted"
  );
  return res.json(submissions);
});

export default router;
