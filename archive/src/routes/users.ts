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

// ── Get user ──────────────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

// ── Add story / experience / problem ─────────────────────────────────────────
// This is the trigger: adding a story automatically spawns an agent.
// Agent creation is gated by x402 payment (applied at the router level in index.ts).
const AddStorySchema = z.object({
  type: z.enum(["experience", "problem", "story"]),
  title: z.string().min(1),
  description: z.string().min(10),
  tags: z.array(z.string()).default([]),
});

router.post("/:id/stories", (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const parsed = AddStorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const story: UserStory = {
    id: uuidv4(),
    userId: user.id,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };
  db.stories.set(story.id, story);

  // Auto-create agent for this story (payment already verified by x402 middleware)
  const agent = createAgent(story);

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
