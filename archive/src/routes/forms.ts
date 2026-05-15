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

// ── List forms — optionally filtered by founderId ────────────────────────────
// GET /forms              → all open forms (marketplace view)
// GET /forms?founderId=xx → only this founder's forms
router.get("/", (req, res) => {
  const { founderId } = req.query;
  const forms = [...db.forms.values()].filter((f) =>
    founderId ? f.founderId === founderId : f.status === "open"
  );
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

// ── Pending human-tester matches for a form (founder tinder queue) ────────────
router.get("/:id/pending-testers", (req, res) => {
  const form = db.forms.get(req.params.id);
  if (!form) return res.status(404).json({ error: "Form not found" });

  const pending = [...db.matches.values()]
    .filter((m) => m.formId === req.params.id && m.status === "pending")
    .map((m) => {
      const agent = db.agents.get(m.agentId);
      if (!agent || agent.type !== "human") return null;
      const user = db.users.get(agent.userId);
      const story = db.stories.get(agent.storyId);
      return {
        matchId: m.id,
        score: m.score,
        createdAt: m.createdAt,
        tester: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          domain: story?.tags?.[0] ?? "general",
          skills: (story?.tags ?? []).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
          bio: story?.description?.slice(0, 160) ?? "",
          qualityScore: Math.round((m.score * 5 + Number.EPSILON) * 10) / 10,
          projectsTested: agent.filledForms,
        } : undefined,
      };
    })
    .filter(Boolean);

  return res.json(pending);
});

// ── Get all submissions for a form (enriched with tester profile + form) ──────
router.get("/:id/submissions", (req, res) => {
  const form = db.forms.get(req.params.id);
  const submissions = [...db.matches.values()]
    .filter((m) => m.formId === req.params.id && m.status === "submitted")
    .map((m) => {
      const agent = db.agents.get(m.agentId);
      const user = agent ? db.users.get(agent.userId) : undefined;
      const story = agent ? db.stories.get(agent.storyId) : undefined;
      return {
        ...m,
        form,
        tester: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              role: "tester" as const,
              createdAt: user.createdAt,
              domain: story?.tags?.[0] ?? "general",
              livedExperience: story?.description ?? "",
              skills: (story?.tags ?? []).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
              qualityScore: Math.round((m.score * 5 + Number.EPSILON) * 10) / 10,
              projectsTested: agent?.filledForms ?? 0,
              bio: story?.description?.slice(0, 140) ?? "",
            }
          : undefined,
      };
    });
  return res.json(submissions);
});

export default router;
