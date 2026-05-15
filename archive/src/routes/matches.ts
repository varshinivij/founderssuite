import { Router } from "express";
import { db } from "../db.js";
import { getWeightsSummary } from "../ml/policyNet.js";

const router = Router();

function enrichMatch(match: ReturnType<typeof db.matches.get>) {
  if (!match) return null;
  const agent = db.agents.get(match.agentId);
  const user = agent ? db.users.get(agent.userId) : undefined;
  const form = db.forms.get(match.formId);
  const policy = getWeightsSummary(match.agentId);

  return {
    ...match,
    // Minimal tester profile derived from the agent's user record
    tester: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "tester",
          createdAt: user.createdAt,
          domain: agent?.matchCriteria.split(" ")[0] ?? "Other",
          livedExperience: db.stories.get(agent?.storyId ?? "")?.description ?? "",
          skills: (db.stories.get(agent?.storyId ?? "")?.tags ?? []).map(
            (t) => t.charAt(0).toUpperCase() + t.slice(1)
          ),
          qualityScore: Math.round((match.score * 5 + Number.EPSILON) * 10) / 10,
          projectsTested: agent?.filledForms ?? 0,
          bio: db.stories.get(agent?.storyId ?? "")?.description?.slice(0, 120) ?? "",
        }
      : undefined,
    form,
    agentPolicy: policy
      ? { trained: true, ...policy }
      : { trained: false, steps: 0, epsilon: 1.0 },
  };
}

// ── List matches for a user (across all their agents) ────────────────────────
router.get("/user/:userId", (req, res) => {
  const matches = [...db.matches.values()]
    .filter((m) => m.userId === req.params.userId)
    .map(enrichMatch)
    .filter(Boolean);
  return res.json(matches);
});

// ── Get single match ──────────────────────────────────────────────────────────
router.get("/:id", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  return res.json(enrichMatch(match));
});

// ── Founder invites a human tester (pending → invited) ────────────────────────
router.post("/:id/invite", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status !== "pending") return res.status(400).json({ error: "Match is not pending" });
  match.status = "invited";
  db.matches.set(match.id, match);
  return res.json(enrichMatch(match));
});

// ── Founder declines a human tester (pending → rejected) ─────────────────────
router.post("/:id/decline", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  match.status = "rejected";
  db.matches.set(match.id, match);
  return res.json(enrichMatch(match));
});

// ── Tester submits their feedback after accepting an invite ───────────────────
// Body: { answers: Record<questionId, answer> }
router.post("/:id/submit", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  if (match.status !== "invited") return res.status(400).json({ error: "Match is not invited" });
  match.status = "submitted";
  match.agentAnswers = req.body.answers ?? {};
  match.submittedAt = new Date().toISOString();
  db.matches.set(match.id, match);
  const agent = db.agents.get(match.agentId);
  if (agent) { agent.filledForms += 1; db.agents.set(agent.id, agent); }
  return res.json(enrichMatch(match));
});

// ── Feedback on a match (accepted/rejected outcome after submission) ──────────
router.post("/:id/feedback", (req, res) => {
  const match = db.matches.get(req.params.id);
  if (!match) return res.status(404).json({ error: "Match not found" });
  const { outcome } = req.body as { outcome: "accepted" | "rejected" };
  if (outcome !== "accepted" && outcome !== "rejected")
    return res.status(400).json({ error: "outcome must be accepted or rejected" });
  match.status = outcome;
  db.matches.set(match.id, match);
  return res.json(enrichMatch(match));
});

export default router;
