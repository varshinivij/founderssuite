/**
 * seed — populates the tester pool only.
 * Founders sign up fresh and start with an empty dashboard.
 * When a founder creates a form, the seeded tester agents auto-match and fill it.
 */
import { db } from "./db.js";
import { seedAgentPolicy } from "./ml/policyNet.js";
import type { User, UserStory, Agent } from "./types/index.js";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function seedDb() {
  if (db.users.size > 0) return; // already seeded

  // ── AI tester users ───────────────────────────────────────────────────────
  const testers: User[] = [
    { id: "user_tester_1", email: "maya@example.com",  name: "Maya R.",  createdAt: daysAgo(200) },
    { id: "user_tester_2", email: "devon@example.com", name: "Devon K.", createdAt: daysAgo(140) },
    { id: "user_tester_3", email: "aisha@example.com", name: "Aisha T.", createdAt: daysAgo(90)  },
    { id: "user_tester_4", email: "kenji@example.com", name: "Kenji S.", createdAt: daysAgo(365) },
  ];
  for (const t of testers) db.users.set(t.id, t);

  // ── AI tester stories ─────────────────────────────────────────────────────
  const testerStories: UserStory[] = [
    {
      id: "story_t1", userId: "user_tester_1",
      type: "experience", title: "5 years in MedTech clinical ops",
      description: "Led device trials, IRB workflows, and clinical validation studies. Expert in regulated product launches, clinical data review, and compliance gate-keeping in MedTech and HealthTech contexts.",
      tags: ["medtech", "clinical", "regulatory", "validation", "healthcare"],
      createdAt: daysAgo(120),
    },
    {
      id: "story_t2", userId: "user_tester_2",
      type: "experience", title: "Built RevOps for 3 B2B SaaS startups",
      description: "Led outbound, built CRM pipelines, refined pricing models, and ran discovery calls for early B2B SaaS companies. Deep knowledge of sales motions, GTM strategy, and founder-market fit in SaaS.",
      tags: ["saas", "b2b", "sales", "gtm", "pricing", "discovery"],
      createdAt: daysAgo(80),
    },
    {
      id: "story_t3", userId: "user_tester_3",
      type: "experience", title: "Former teacher, district-wide LMS rollout",
      description: "Implemented district-wide learning management systems, curriculum design tools, and procured EdTech software for K-12 schools. Deep understanding of teacher workflows, procurement, and usability constraints in education.",
      tags: ["edtech", "education", "curriculum", "procurement", "k12", "lms"],
      createdAt: daysAgo(60),
    },
    {
      id: "story_t4", userId: "user_tester_4",
      type: "experience", title: "Payments PM — fraud and risk tooling",
      description: "Shipped fraud detection, risk scoring, and compliance workflows at a major FinTech. Expert in payments infrastructure, regulatory compliance, and risk management for financial products.",
      tags: ["fintech", "payments", "fraud", "risk", "compliance", "regulatory"],
      createdAt: daysAgo(200),
    },
  ];
  for (const s of testerStories) db.stories.set(s.id, s);

  // ── AI tester agents ──────────────────────────────────────────────────────
  const testerAgents: Agent[] = [
    {
      id: "agent_t1", userId: "user_tester_1", storyId: "story_t1",
      name: 'Agent for "MedTech clinical ops"',
      status: "active", type: "ai", scope: "public",
      matchCriteria: "medtech clinical regulatory validation healthcare trials device",
      filledForms: 5, successRate: 0.80,
      policy: { trained: true, steps: 200, epsilon: 0.32 },
      createdAt: daysAgo(110), lastActiveAt: daysAgo(1),
    },
    {
      id: "agent_t2", userId: "user_tester_2", storyId: "story_t2",
      name: 'Agent for "B2B SaaS RevOps"',
      status: "active", type: "ai", scope: "public",
      matchCriteria: "saas b2b sales gtm pricing discovery startup founders operators",
      filledForms: 8, successRate: 0.75,
      policy: { trained: true, steps: 320, epsilon: 0.25 },
      createdAt: daysAgo(75), lastActiveAt: daysAgo(0),
    },
    {
      id: "agent_t3", userId: "user_tester_3", storyId: "story_t3",
      name: 'Agent for "EdTech LMS rollout"',
      status: "active", type: "ai", scope: "public",
      matchCriteria: "edtech education curriculum procurement teacher student learning school",
      filledForms: 3, successRate: 0.67,
      policy: { trained: true, steps: 120, epsilon: 0.45 },
      createdAt: daysAgo(55), lastActiveAt: daysAgo(2),
    },
    {
      id: "agent_t4", userId: "user_tester_4", storyId: "story_t4",
      name: 'Agent for "FinTech payments risk"',
      status: "active", type: "ai", scope: "public",
      matchCriteria: "fintech payments fraud risk compliance regulatory banking financial",
      filledForms: 6, successRate: 0.83,
      policy: { trained: true, steps: 280, epsilon: 0.28 },
      createdAt: daysAgo(180), lastActiveAt: daysAgo(1),
    },
  ];
  for (const a of testerAgents) {
    db.agents.set(a.id, a);
    seedAgentPolicy(a.id, a.policy.epsilon, a.policy.steps);
  }

  // ── Human tester (waits for founder invite before filling) ───────────────
  const humanTester: User = {
    id: "user_human_1", email: "jamie@test.com", name: "Jamie Lee",
    createdAt: daysAgo(5),
  };
  db.users.set(humanTester.id, humanTester);

  const humanStory: UserStory = {
    id: "story_h1", userId: humanTester.id,
    type: "experience", title: "5 years in B2B SaaS sales",
    description: "I ran outbound sales and GTM at two early-stage SaaS startups. Used HubSpot and Salesforce, built CRM pipelines, ran discovery calls, and helped founders refine their pricing and positioning.",
    tags: ["saas", "b2b", "sales", "crm", "gtm", "outbound"],
    createdAt: daysAgo(4),
  };
  db.stories.set(humanStory.id, humanStory);

  const humanAgent: Agent = {
    id: "agent_h1", userId: humanTester.id, storyId: humanStory.id,
    name: 'Agent for "5 years in B2B SaaS sales"',
    status: "active", type: "human", scope: "public",
    matchCriteria: "saas b2b sales crm gtm outbound discovery startup founders",
    filledForms: 0, successRate: 0,
    policy: { trained: false, steps: 0, epsilon: 1.0 },
    createdAt: daysAgo(4), lastActiveAt: daysAgo(1),
  };
  db.agents.set(humanAgent.id, humanAgent);

  console.log("✓ Tester pool seeded: 5 testers, 5 stories, 5 agents — founders start fresh");
}
