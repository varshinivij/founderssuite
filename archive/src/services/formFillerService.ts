/**
 * formFillerService — the agent's core capability.
 *
 * Generates contextually accurate answers for each form question using the
 * agent's story. Uses OpenAI when available; falls back to a smart heuristic
 * that detects question intent and produces domain-aware responses.
 */
import { db } from "../db.js";
import type { Match, Agent, ValidationForm, FormQuestion } from "../types/index.js";

export async function fillAndSubmitForm(
  match: Match,
  agent: Agent,
  form: ValidationForm
): Promise<void> {
  const story = db.stories.get(agent.storyId);
  if (!story) return;

  const answers: Record<string, string> = {};
  for (const q of form.questions) {
    answers[q.id] = await generateAnswer(q, story.description, story.tags, story.title, agent.id);
  }

  match.agentAnswers = answers;
  match.status = "submitted";
  match.submittedAt = new Date().toISOString();
  db.matches.set(match.id, match);

  const agentRecord = db.agents.get(agent.id);
  if (agentRecord) {
    agentRecord.filledForms += 1;
    agentRecord.lastActiveAt = new Date().toISOString();
    const agentMatches = [...db.matches.values()].filter((m) => m.agentId === agent.id);
    const submitted = agentMatches.filter((m) => m.status === "submitted").length;
    agentRecord.successRate = agentMatches.length > 0 ? submitted / agentMatches.length : 0;
    db.agents.set(agentRecord.id, agentRecord);
  }
}

async function generateAnswer(
  q: FormQuestion,
  storyDescription: string,
  tags: string[],
  storyTitle: string,
  agentId: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      return await openAiAnswer(apiKey, q, storyDescription, storyTitle, tags);
    } catch (e) {
      console.error("OpenAI answer failed, falling back to heuristic:", e);
    }
  }
  return heuristicAnswer(q, storyDescription, tags, storyTitle, agentId + q.id);
}

// ── OpenAI path ───────────────────────────────────────────────────────────────

async function openAiAnswer(
  apiKey: string,
  q: FormQuestion,
  story: string,
  storyTitle: string,
  tags: string[],
): Promise<string> {
  const typeInstructions =
    q.type === "rating"
      ? "Reply with a single integer from 1 (low) to 5 (high). Nothing else."
      : q.type === "multiChoice"
      ? `Reply with exactly one of these options, word-for-word: ${q.options?.join(" | ")}. Nothing else.`
      : "Reply in 2–3 sentences from the first-person perspective. Be specific and concrete. No fluff.";

  const system = [
    "You are an AI agent filling out a product validation form on behalf of a real person.",
    `Their background: "${storyTitle}". ${story}`,
    `Their domain tags: ${tags.join(", ")}.`,
    "Your answer must be grounded in this person's real experience — not generic advice.",
    typeInstructions,
  ].join(" ");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Question: ${q.question}` },
      ],
      max_tokens: 200,
      temperature: 0.65,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content?.trim() ?? "";
}

// ── Heuristic path ────────────────────────────────────────────────────────────

type Domain = "saas" | "medtech" | "edtech" | "fintech" | "hardware" | "general";
type Intent =
  | "pain_challenge"
  | "tools_stack"
  | "time_effort"
  | "willingness_to_pay"
  | "process_approach"
  | "outcome_result"
  | "recommendation"
  | "general";

function detectDomain(tags: string[]): Domain {
  const t = tags.map((x) => x.toLowerCase()).join(" ");
  if (/saas|b2b|sales|gtm|startup|crm|outbound|pipeline|founder/.test(t)) return "saas";
  if (/fintech|payment|fraud|kyc|aml|banking|neobank|finance/.test(t)) return "fintech";
  if (/medtech|clinical|healthcare|device|trial|ehr|irb/.test(t)) return "medtech";
  if (/edtech|education|teacher|school|curriculum|lms|k12|student/.test(t)) return "edtech";
  if (/hardware|field|installation|fleet|device|deployment|iot/.test(t)) return "hardware";
  return "general";
}

function detectIntent(question: string): Intent {
  const q = question.toLowerCase();
  // Check switch/replace/migrate FIRST — before tools_stack, since "stack" appears in both
  if (/switch|replac|instead of|move away|migrat|change (from|away)|stop using|would (make|convince)/.test(q))
    return "recommendation";
  if (/hard(est)?|biggest|pain|challeng|difficult|frustrat|struggl|barrier|obstacle|problem/.test(q))
    return "pain_challenge";
  if (/tool|software|platform|technology|system|app|use most|rely on|current(ly use)/.test(q))
    return "tools_stack";
  if (/how (many|much|often|long)|hour|time per|week|day|spend|frequency|how frequent/.test(q))
    return "time_effort";
  if (/pay|price|cost|worth|budget|purchas|buy|subscri|invest|afford/.test(q))
    return "willingness_to_pay";
  if (/how (do|did|would)|process|approach|method|strateg|workflow|step|handl|manag/.test(q))
    return "process_approach";
  if (/result|outcome|success|work(ed)?|effective|impact|improv|achiev|accomplish/.test(q))
    return "outcome_result";
  if (/recommend|suggest|advice|would you|should|next step|tip/.test(q))
    return "recommendation";
  return "general";
}

// Domain-specific knowledge for constructing realistic answers
const DOMAIN_CONTEXT: Record<Domain, {
  tools: string[];
  pains: string[];
  processes: string[];
  outcomes: string[];
  payThreshold: string;
  timeSpent: string;
  switchTriggers: string[];
}> = {
  saas: {
    tools: ["LinkedIn Sales Navigator", "Apollo.io", "HubSpot CRM", "Outreach", "Gong", "Clearbit", "ZoomInfo"],
    pains: [
      "qualifying leads at scale without a clear ICP — we talked to everyone who would take a meeting and wasted months before tightening our criteria",
      "cold outbound response rates were under 2% until we shifted to referral-led pipeline and hyper-personalized sequences",
      "building trust with zero brand recognition — prospects didn't return calls until we had a few recognizable logos as social proof",
      "getting decision-maker access without a warm intro — gatekeepers blocked almost every cold approach at mid-market accounts",
    ],
    processes: [
      "We defined a tight ICP first — company size, tech stack signals, growth stage — then built targeted lists in Apollo before touching outreach",
      "We ran a weekly pipeline review to kill stalled deals early and reinvest time into high-intent signals",
      "Sequenced outbound: cold email first, LinkedIn connection request on day three, voicemail on day seven — only personalize if they open twice",
    ],
    outcomes: [
      "Tightening ICP dropped our sales cycle from 90 days to 45 and improved close rate from 12% to 28%",
      "Switching to referral-first pipeline increased response rates 6x and cut CAC by 40%",
    ],
    payThreshold: "We'd pay up to $300/month per seat for intent data that's actually accurate — most vendors oversell and underdeliver",
    timeSpent: "4–6 hours",
    switchTriggers: [
      "real buying-intent signals, not just job-change notifications — I need to know who is actively evaluating a solution in my category right now",
      "native CRM sync that doesn't require a middleware layer — every extra integration step kills adoption on the sales team",
      "proof it works at my stage and deal size, not just enterprise case studies",
    ],
  },
  medtech: {
    tools: ["Veeva Vault", "Medidata Rave", "OpenClinica", "REDCap", "Salesforce Health Cloud", "MasterControl"],
    pains: [
      "paper-based source documents that get transcribed manually into the EDC — every transcription is an audit risk",
      "IRB amendment cycles adding 3–6 weeks to protocol changes that should take days",
      "reconciling site data across multiple EDC instances before database lock — discrepancy resolution alone takes two weeks per study",
      "keeping 21 CFR Part 11 audit trails complete when sites use mixed paper and digital workflows",
    ],
    processes: [
      "We run a pre-submission review checklist six weeks before the deadline to catch CRF design issues before data collection starts",
      "Site qualification visits use standardized scoring rubrics — any site below 70% on readiness doesn't get activated",
      "We do an interim data review at 50% enrollment to catch protocol deviations early enough to remediate",
    ],
    outcomes: [
      "Moving to eSource cut transcription errors by 80% and reduced database lock time from four weeks to six days",
      "Standardized site training cut protocol deviations per patient by 60% in our last Phase II",
    ],
    payThreshold: "Regulatory software is a cost-of-doing-business — teams will pay $50K–$200K/year if it demonstrably reduces audit findings",
    timeSpent: "8–12 hours on reporting prep alone each week",
    switchTriggers: [
      "a validated audit trail that satisfies 21 CFR Part 11 out of the box — I can't build compliance on top of a general-purpose tool",
      "eSource capability that eliminates the manual transcription step between paper source documents and the EDC",
      "a vendor with actual regulatory affairs experience on the team, not just engineers who read the guidance documents",
    ],
  },
  edtech: {
    tools: ["Canvas", "Google Classroom", "Schoology", "PowerSchool", "Clever", "ClassLink", "Zoom"],
    pains: [
      "procurement cycles that take 12–18 months — by the time a tool is approved, the pilot teachers have moved on",
      "single sign-on integration failures breaking access for entire grade levels the morning of a rollout",
      "data privacy reviews that block useful tools because vendors can't produce a signed DPA in time",
      "getting teacher buy-in when they already feel overloaded — any new tool competes with everything else on their plate",
    ],
    processes: [
      "We run a small pilot in one grade level first, document the wins, then use teacher champions to present to the curriculum committee",
      "Any new tool has to pass our FERPA checklist and get IT sign-off before it goes to teachers — no exceptions",
      "We pair every rollout with a one-page quick-start guide and a 20-minute PD session — longer than that and adoption drops sharply",
    ],
    outcomes: [
      "Piloting with three champion teachers before district rollout reduced implementation issues by 70%",
      "Requiring SSO compliance upfront eliminated our biggest support ticket category",
    ],
    payThreshold: "K–12 budgets are tight — under $5/student/year is the sweet spot for quick approval; above that needs board sign-off",
    timeSpent: "5–8 hours per week on vendor evaluation and procurement paperwork alone",
    switchTriggers: [
      "a signed DPA and FERPA compliance documentation ready before I even ask — anything that makes the privacy review faster gets serious attention",
      "SSO integration that works with Clever or ClassLink on day one — broken logins the morning of a rollout are career-limiting events",
      "proof of classroom outcomes from a comparable district, not just a feature list",
    ],
  },
  fintech: {
    tools: ["Stripe", "Plaid", "Sardine", "Alloy", "Socure", "Unit21", "Persona", "Middesk"],
    pains: [
      "identity verification latency killing conversion — we lose 35–40% of applicants at the document upload step",
      "false positive rates on fraud models blocking legitimate customers and generating angry support tickets",
      "keeping KYC workflows current as FINCEN guidance changes — we re-paper customers three times in two years",
      "reconciling transaction monitoring alerts with actual risk — analysts spend 4 hours per SAR on data gathering that should be automated",
    ],
    processes: [
      "We tier our KYC requirements by risk score — low-risk accounts get instant approval, high-risk go through enhanced due diligence manually",
      "Fraud rules are reviewed weekly; any rule with a false positive rate above 3% gets tuned or retired immediately",
      "We run tabletop exercises quarterly to walk through breach and fraud scenarios before they happen",
    ],
    outcomes: [
      "Moving to risk-tiered onboarding cut drop-off at KYC from 42% to 18% without changing our risk profile",
      "Switching IDV vendors reduced false rejections by 55% and decreased identity-related support tickets by 60%",
    ],
    payThreshold: "Compliance tooling is non-negotiable — we budget $80–$150K/year for the stack and would pay a premium for anything that reduces regulatory risk",
    timeSpent: "10–15 hours per week across the compliance team on manual review and reporting",
    switchTriggers: [
      "a false positive rate under 1% on identity verification — every bad rejection is a support ticket and a lost customer we'll never get back",
      "real-time risk scoring with an API response under 200ms — anything that adds latency at the onboarding funnel kills conversion",
      "built-in SAR workflow automation — the current manual data-gathering process before filing takes four hours that should take twenty minutes",
    ],
  },
  hardware: {
    tools: ["Jira", "Confluence", "Notion", "TestRail", "PTC Windchill", "Salesforce Field Service"],
    pains: [
      "last-mile installation variance — every site has different power, mounting, and connectivity constraints that the spec didn't anticipate",
      "firmware update rollouts bricking 2–5% of deployed units because field conditions weren't replicated in the lab",
      "spare parts logistics — a single failed sensor can take three weeks to replace because of single-source component constraints",
      "getting field technicians to log defects consistently — half the issues go undocumented because reporting feels like overhead",
    ],
    processes: [
      "We do a site survey checklist before any installation — power draw, mounting surface, ambient temperature, and connectivity all get measured",
      "Beta hardware goes to internal dog-food users for 90 days before any customer deployment — this catches 80% of real-world failure modes",
      "Field service tickets get triaged in under 2 hours; anything hardware-blocking gets a replacement unit shipped same day",
    ],
    outcomes: [
      "Adding a pre-installation checklist dropped our first-visit fix rate from 60% to 91%",
      "Requiring field techs to photograph all cable runs before closing a ticket reduced re-work calls by 45%",
    ],
    payThreshold: "Hardware teams will pay for reliability data — $500–$2K/month for predictive maintenance signals that prevent field failures",
    timeSpent: "6–10 hours per week on incident triage and field coordination",
    switchTriggers: [
      "field-condition simulation in the test environment — I need to know it will survive real-world temperature, vibration, and connectivity variance before deployment",
      "firmware OTA updates with automatic rollback on failure — a bad update that bricks 2% of fleet is unacceptable",
      "a vendor who has actually shipped hardware at scale, not just prototype-level experience",
    ],
  },
  general: {
    tools: ["Notion", "Slack", "Jira", "Airtable", "Google Workspace", "Zoom", "Loom"],
    pains: [
      "coordinating across teams without a single source of truth — decisions get made in Slack and never documented",
      "context switching between too many tools killing deep work time",
      "onboarding new team members taking 4–6 weeks before they're productive",
    ],
    processes: [
      "We do a weekly async status update in Notion to reduce the number of sync meetings",
      "Any process that happens more than twice gets documented — we use Loom for anything visual",
    ],
    outcomes: [
      "Standardizing on Notion for documentation cut onboarding time from six weeks to two",
      "Async-first communication reduced meeting hours by 40% without slowing down decisions",
    ],
    payThreshold: "We evaluate tools on ROI within 90 days — if it can't show a clear time or cost saving, it gets cut",
    timeSpent: "3–5 hours",
    switchTriggers: [
      "a single source of truth that the whole team actually uses — I'll switch from anything if adoption is real",
      "async-first workflows built into the product, not bolted on — I'm done with tools that require synchronous meetings to work",
      "an implementation time under one week with no professional services required",
    ],
  },
};

/** Deterministic hash over a seed string — different agents + question combos pick different items. */
function pickIndex(seed: string, len: number): number {
  if (len <= 1) return 0;
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  return h % len;
}

// Keep legacy name for existing call sites
function agentOffset(agentId: string, len: number): number {
  return pickIndex(agentId, len);
}

function heuristicAnswer(
  q: FormQuestion,
  storyDescription: string,
  tags: string[],
  storyTitle: string,
  agentId: string,
): string {
  const domain = detectDomain(tags);
  const intent = detectIntent(q.question);
  const ctx = DOMAIN_CONTEXT[domain];

  // ── Multiple choice ───────────────────────────────────────────────────────
  if (q.type === "multiChoice" && q.options?.length) {
    if (intent === "willingness_to_pay" || intent === "recommendation") {
      // Pick "Yes" variant if available, then "Maybe", then first option
      return (
        q.options.find((o) => /^yes.{0,15}immed/i.test(o)) ??
        q.options.find((o) => /^yes/i.test(o)) ??
        q.options.find((o) => /maybe/i.test(o)) ??
        q.options[0]
      );
    }
    // For other multi-choice, pick the option most aligned with the story
    const storyLower = (storyDescription + " " + tags.join(" ")).toLowerCase();
    const scored = q.options.map((opt) => {
      const words = opt.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const score = words.reduce((s, w) => s + (storyLower.includes(w) ? 1 : 0), 0);
      return { opt, score };
    });
    scored.sort((a, b) => b.score - a.score);
    // Use seed (agent+question) to break ties so different agents pick different options
    const topScore = scored[0].score;
    const tied = scored.filter((s) => s.score === topScore);
    return tied[pickIndex(agentId + q.id, tied.length)].opt;
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  if (q.type === "rating") {
    const ql = q.question.toLowerCase();
    if (/pain|frustrat|hard|challeng|difficult|problem|issue|disruptive|disrupt/.test(ql)) return "5";
    if (/need|demand|importan|critical|essen|urgent|how (much|badly)|how (big|large|severe)/.test(ql)) return "5";
    if (/confident|likely|would you|recommend/.test(ql)) return "4";
    if (/satisfied|happy|pleased|current solution|existing/.test(ql)) return "2";
    if (/often|frequency|how (many|much)/.test(ql)) return "4";
    return "4";
  }

  // ── Text answers by intent — use agentId+questionId for variety across agents ──
  const seed = agentId; // agentId already includes q.id (appended by caller)
  const pOff = pickIndex(seed + "pain", ctx.pains.length);
  const prOff = pickIndex(seed + "proc", ctx.processes.length);
  const oOff = pickIndex(seed + "out", ctx.outcomes.length);
  const pain = ctx.pains[pOff];
  const process = ctx.processes[prOff];
  const outcome = ctx.outcomes[oOff];
  const toolList = ctx.tools.slice(0, 3).join(", ");
  const background = `my background in ${storyTitle}`;

  switch (intent) {
    case "pain_challenge":
      return `${pain}. In ${background}, I ran into this constantly. It's the kind of friction that compounds — you don't notice the real cost until you're months in and realize how much time never went toward customers.`;

    case "tools_stack":
      return `We relied primarily on ${toolList}. ${process} The gap that persisted was that none of them surfaced the signals I actually needed without significant manual effort to stitch them together.`;

    case "time_effort":
      return `Conservatively ${ctx.timeSpent} per week — and that's before counting rework when something slipped through. In ${background}, the real cost was opportunity cost: that time should go toward talking to customers.`;

    case "willingness_to_pay":
      return `${ctx.payThreshold}. My calculus is straightforward: if it saves two or more hours per week and reduces risk of a bad decision, it pays for itself at $150–300/month without much debate.`;

    case "process_approach":
      return `${process} It took a few failed attempts to get there — the instinct is to add more steps, but the real win came from cutting the ones that don't add signal or accountability.`;

    case "outcome_result":
      return `${outcome} The key was establishing a baseline before changing anything — without that, you can't distinguish what moved the needle from what you got lucky with.`;

    case "recommendation": {
      const swOff = pickIndex(seed + "sw", ctx.switchTriggers.length);
      const trigger = ctx.switchTriggers[swOff];
      return `The thing that would actually move me: ${trigger}. Generic feature lists and AI buzzwords don't move me — I need to see it working on a use case close to mine before I put it in front of my team.`;
    }

    default:
      return `In ${background}: ${pain}. Happy to go deeper on any specific part — there's a lot of nuance depending on team size and stage.`;
  }
}
