import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { db } from "../db.js";
import { createAgent } from "../services/agentService.js";
import type { UserStory } from "../types/index.js";

const router = Router();

// ── Create user ──────────────────────────────────────────────────────────────
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

router.post("/", (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = {
    id: uuidv4(),
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  db.users.set(user.id, user);
  return res.status(201).json(user);
});

// ── Get user by ID ────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

// ── Look up or create user by email (used for demo login) ─────────────────────
router.post("/login", (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email) return res.status(400).json({ error: "email required" });
  const existing = [...db.users.values()].find((u) => u.email === email);
  if (existing) return res.json(existing);
  // Auto-create if not found
  const user = { id: uuidv4(), email, name: name ?? email.split("@")[0], createdAt: new Date().toISOString() };
  db.users.set(user.id, user);
  return res.status(201).json(user);
});

// ── Add story / experience / problem ─────────────────────────────────────────
// This is the trigger: adding a story automatically spawns an agent.
// Agent creation is gated by x402 payment (applied at the router level in index.ts).
const AddStorySchema = z.object({
  type: z.enum(["experience", "problem", "story"]),
  title: z.string().min(1),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
  // "self" = founder agent (fills own forms only); "public" = tester agent (fills any matching form)
  agentScope: z.enum(["self", "public"]).default("public"),
});

router.post("/:id/stories", (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const parsed = AddStorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { agentScope, ...storyData } = parsed.data;
  const story: UserStory = {
    id: uuidv4(),
    userId: user.id,
    ...storyData,
    createdAt: new Date().toISOString(),
  };
  db.stories.set(story.id, story);

  // "self" scope agents are AI type; "public" scope defaults to human (testers override to ai in seed)
  const agentType = agentScope === "self" ? "ai" : "human";
  const agent = createAgent(story, agentType, agentScope);

  return res.status(201).json({ story, agent });
});

// ── List stories ──────────────────────────────────────────────────────────────
router.get("/:id/stories", (req, res) => {
  const stories = [...db.stories.values()].filter(
    (s) => s.userId === req.params.id
  );
  return res.json(stories);
});

// ── Delete story ──────────────────────────────────────────────────────────────
router.delete("/:id/stories/:storyId", (req, res) => {
  const story = db.stories.get(req.params.storyId);
  if (!story || story.userId !== req.params.id)
    return res.status(404).json({ error: "Story not found" });
  db.stories.delete(story.id);
  return res.status(204).send();
});

export default router;
