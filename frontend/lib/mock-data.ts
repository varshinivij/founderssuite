import type {
  Agent,
  CommunityPost,
  Domain,
  FounderProfile,
  InsightReport,
  Match,
  PaymentRecord,
  TesterProfile,
  User,
  UserStory,
  ValidationForm,
} from "@/types";

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const mockUser: User = {
  id: "user_founder_1",
  email: "brady@example.com",
  name: "Brady",
  role: "founder",
  createdAt: isoDaysAgo(12),
};

export const mockFounderProfile: FounderProfile = {
  ...mockUser,
  role: "founder",
  companyName: "FoundersSuite",
  companyDescription:
    "A two-sided marketplace connecting founders with domain-matched testers for validation interviews and surveys.",
  industryTags: ["SaaS", "B2B", "Market Research"],
  teamSize: 4,
  productDemoUrl: "https://example.com/demo",
  lookingFor:
    "Experienced operators who have lived the pain and can give direct, actionable feedback.",
  timeCommitment: "30 min interview or 5 min survey",
  feedbackStyle: "Blunt, specific, and outcome-oriented",
};

export const mockTesterProfiles: TesterProfile[] = [
  {
    id: "tester_1",
    email: "maya@example.com",
    name: "Maya R.",
    role: "tester",
    createdAt: isoDaysAgo(200),
    domain: "MedTech",
    livedExperience: "Former clinical ops lead; led device trials and IRB workflows.",
    skills: ["Clinical Ops", "Regulatory", "User Research"],
    hourlyRate: 85,
    availability: "Weeknights (after 6pm PT) · ~6 hrs/week for structured sessions",
    timezone: "PT",
    testingTypes: ["interview", "survey"],
    platformPreferences: ["web"],
    industryInterests: ["MedTech", "Health"],
    qualityScore: 4.9,
    projectsTested: 11,
    previousCompany: "AudioNova",
    isTopVoice: true,
    tags: ["Clinical Ops", "Regulatory", "User Research"],
    pravatarImgId: 27,
    pronouns: "She/Her",
    professionalHeadline: "Clinical ops · HIPAA-aware · EHR-adjacent workflows",
    tooling: [
      "Figma",
      "Maze",
      "Postman",
      "Lookback",
      "Metabase",
      "Google Docs / Sheets",
      "Loom",
    ],
    methodology:
      "I run scenario-based walkthroughs with think-aloud, then tighten into repro steps with severity and impact. For regulated products I map controls (permissions, audit trails, PHI boundaries) to what founders actually ship—not checklist theater. I always leave founders with a prioritized punch list: blockers vs polish.",
    certifications: [
      "HIPAA awareness (annual, org)",
      "GCP — Social & Behavioral (NIH, renewing)",
    ],
    bio: "I help teams validate workflows under real clinical constraints—not slide-deck hypotheticals. Recent focus: onboarding clinicians to revenue-cycle tools, consent flows for patient-facing apps, and admin tooling where a wrong click becomes a compliance incident.\n\nBefore consulting I owned release readiness for a Class II adjacent SaaS pilot: IRB packets, training decks, and field notes from 40+ moderated sessions. I care about defensible evidence for PMs and design partners.",
  },
  {
    id: "tester_2",
    email: "devon@example.com",
    name: "Devon K.",
    role: "tester",
    createdAt: isoDaysAgo(140),
    domain: "SaaS",
    livedExperience: "Built RevOps systems for 3 B2B SaaS startups.",
    skills: ["Sales Ops", "GTM", "Pricing"],
    hourlyRate: 75,
    availability: "Weekends",
    timezone: "ET",
    testingTypes: ["interview", "beta test"],
    platformPreferences: ["web"],
    industryInterests: ["SaaS", "FinTech"],
    qualityScore: 4.7,
    projectsTested: 28,
    previousCompany: "BrightApps",
    isTopVoice: false,
    tags: ["Sales Ops", "GTM", "Pricing"],
    bio: "I focus on clarity, packaging, and sales motion fit.",
    pravatarImgId: 12,
    pronouns: "They/Them",
    professionalHeadline: "RevOps · CPQ & CRM hygiene · PLG + sales-led",
    tooling: ["Salesforce", "HubSpot", "Notion", "Figma", "Sheets"],
    methodology:
      "I stress-test positioning and packaging against how reps actually explain the product on calls. Beta sessions include scripted tasks plus open exploration of pricing pages and upgrade paths.",
  },
  {
    id: "tester_3",
    email: "aisha@example.com",
    name: "Aisha T.",
    role: "tester",
    createdAt: isoDaysAgo(90),
    domain: "EdTech",
    livedExperience: "Former teacher; implemented district-wide LMS.",
    skills: ["Curriculum", "Procurement", "UX Feedback"],
    hourlyRate: 60,
    availability: "Weeknights",
    timezone: "CT",
    testingTypes: ["interview", "survey"],
    platformPreferences: ["web", "mobile"],
    industryInterests: ["EdTech"],
    qualityScore: 4.8,
    projectsTested: 15,
    previousCompany: null,
    isTopVoice: true,
    tags: ["Curriculum", "Procurement", "UX Feedback"],
    bio: "I love stress-testing flows against real classroom realities.",
    pravatarImgId: 32,
    pronouns: "She/Her",
    professionalHeadline: "District LMS rollouts · procurement realities",
    tooling: ["Google Classroom", "Canvas", "Miro", "Zoom"],
    methodology:
      "Sessions mirror school-day interruptions: partial attention, shared devices, and admin vs teacher mental models. I document where flows assume ideal conditions.",
  },
  {
    id: "tester_4",
    email: "kenji@example.com",
    name: "Kenji S.",
    role: "tester",
    createdAt: isoDaysAgo(365),
    domain: "FinTech",
    livedExperience: "Payments PM; shipped fraud + risk tooling.",
    skills: ["Payments", "Risk", "Compliance"],
    hourlyRate: 110,
    availability: "Weekdays",
    timezone: "PT",
    testingTypes: ["interview"],
    platformPreferences: ["web"],
    industryInterests: ["FinTech", "SaaS"],
    qualityScore: 4.6,
    projectsTested: 22,
    previousCompany: null,
    isTopVoice: false,
    tags: ["Payments", "Risk", "Compliance"],
    bio: "I’ll call out hidden compliance + risk gotchas early.",
    pravatarImgId: 45,
    pronouns: "He/Him",
    professionalHeadline: "Payments · fraud signals · ledger edge cases",
    tooling: ["Postman", "Datadog", "dbt docs", "Notion"],
    methodology:
      "I combine API-level checks with user journeys: money movement, idempotency, and disclosure copy. I flag where UX masks risk the compliance team will care about later.",
  },
  {
    id: "tester_5",
    email: "sofia@example.com",
    name: "Sofia L.",
    role: "tester",
    createdAt: isoDaysAgo(60),
    domain: "VehicleTech",
    livedExperience: "Worked in fleet maintenance; hardware deployments at scale.",
    skills: ["Field Ops", "Hardware", "Installation"],
    hourlyRate: 70,
    availability: "Weekends",
    timezone: "MT",
    testingTypes: ["beta test", "survey"],
    platformPreferences: ["hardware", "mobile"],
    industryInterests: ["VehicleTech"],
    qualityScore: 4.6,
    projectsTested: 9,
    previousCompany: null,
    isTopVoice: false,
    tags: ["Field Ops", "Hardware", "Installation"],
    bio: "I’m great at finding edge cases in the real world.",
    pravatarImgId: 16,
    pronouns: "She/Her",
    professionalHeadline: "Fleet deployments · field reliability",
    tooling: ["Android", "TestFlight", "Sheets", "Loom"],
    methodology:
      "Hardware + app pairing tests with weak network and glove-on interactions. I log environmental failure modes (vibration, sunlight, mount positions).",
  },
  // 7 more testers (shorter)
  ...Array.from({ length: 7 }).map((_, i) => {
    const idx = i + 6;
    const domains: Domain[] = ["SaaS", "MedTech", "EdTech", "FinTech", "Other"];
    const pinIds = [12, 32, 45, 16, 27, 68, 11, 59, 33] as const;
    return {
      id: `tester_${idx}`,
      email: `tester${idx}@example.com`,
      name: `Tester ${idx}`,
      role: "tester" as const,
      createdAt: isoDaysAgo(20 + i * 11),
      domain: domains[i % domains.length],
      livedExperience: "Hands-on experience relevant to early-stage validation.",
      skills: ["Research", "Communication", "Domain Knowledge"],
      hourlyRate: 40 + i * 5,
      availability: "Flexible",
      timezone: "PT",
      testingTypes: ["survey", "interview"],
      platformPreferences: ["web"],
      industryInterests: ["SaaS", "Other"],
      qualityScore: 4.2 + (i % 4) * 0.2,
      projectsTested: 5 + i * 2,
      previousCompany: null,
      isTopVoice: i % 5 === 0,
      tags: ["Research", "Communication", "Domain Knowledge"],
      bio: "I give crisp, structured feedback.",
      pravatarImgId: pinIds[i % pinIds.length],
    } satisfies TesterProfile;
  }),
];

export const mockStories: UserStory[] = [
  {
    id: "story_1",
    userId: mockUser.id,
    type: "experience",
    title: "5 years in B2B SaaS sales",
    description:
      "Led outbound at early-stage startups; built pipelines, refined positioning, and ran discovery calls weekly.",
    tags: ["sales", "b2b", "saas"],
    createdAt: isoDaysAgo(10),
  },
];

export const mockAgents: Agent[] = [
  {
    id: "agent_1",
    userId: mockUser.id,
    storyId: "story_1",
    name: 'Agent for "5 years in B2B SaaS sales"',
    status: "active",
    matchCriteria: "Type: experience | Title: ... | Context: ... | Tags: sales, b2b, saas",
    filledForms: 3,
    successRate: 0.71,
    createdAt: isoDaysAgo(10),
    lastActiveAt: isoDaysAgo(1),
    policy: { trained: true, steps: 120, epsilon: 0.51 },
  },
  {
    id: "agent_2",
    userId: mockUser.id,
    storyId: "story_1",
    name: 'Agent for "Operator experience"',
    status: "paused",
    matchCriteria: "Type: story | Title: ... | Context: ...",
    filledForms: 1,
    successRate: 0.5,
    createdAt: isoDaysAgo(20),
    lastActiveAt: isoDaysAgo(7),
    policy: { trained: true, steps: 42, epsilon: 0.73 },
  },
  {
    id: "agent_3",
    userId: mockUser.id,
    storyId: "story_1",
    name: 'Agent for "Hardware deployments"',
    status: "stopped",
    matchCriteria: "Type: problem | Title: ... | Context: ...",
    filledForms: 0,
    successRate: 0,
    createdAt: isoDaysAgo(30),
    lastActiveAt: isoDaysAgo(30),
    policy: { trained: false, steps: 0, epsilon: 1.0 },
  },
];

export const mockForms: ValidationForm[] = Array.from({ length: 6 }).map(
  (_, i) => ({
    id: `form_${i + 1}`,
    founderId: "founder_1",
    title: [
      "Looking for early B2B SaaS advisors",
      "Need MedTech workflow feedback",
      "FinTech onboarding teardown",
      "EdTech teacher usability review",
      "Fleet operations discovery",
      "General market validation survey",
    ][i],
    description:
      "Seeking hands-on feedback from people who have lived this problem. Short form, direct questions.",
    targetProfile:
      "Relevant experience in the domain, able to articulate constraints and trade-offs.",
    questions: [
      {
        id: `q_${i + 1}_1`,
        question: "What stands out as the biggest risk?",
        type: "text",
        required: true,
      },
      {
        id: `q_${i + 1}_2`,
        question: "How likely are you to try this?",
        type: "rating",
        required: true,
      },
    ],
    status: i % 3 === 0 ? "closed" : "open",
    createdAt: isoDaysAgo(2 + i),
    stage: ["Pre-Seed", "Seed", "Seed", "Series A", "Pre-Seed", "Seed"][i],
    compensation: [50, 75, 100, 60, 80, 40][i],
  })
);

export const mockMatches: Match[] = Array.from({ length: 9 }).map((_, i) => {
  const tester = mockTesterProfiles[i % mockTesterProfiles.length];
  const form = mockForms[i % mockForms.length];
  const score = [0.97, 0.91, 0.86, 0.82, 0.78, 0.74, 0.69, 0.63, 0.6][i];
  return {
    id: `match_${i + 1}`,
    agentId: mockAgents[0].id,
    userId: mockUser.id,
    formId: form.id,
    score,
    status: i % 4 === 0 ? "accepted" : i % 4 === 1 ? "pending" : "submitted",
    createdAt: isoDaysAgo(1 + i),
    submittedAt: isoDaysAgo(i),
    tester,
    form,
  } satisfies Match;
});

const communityTitles = [
  "Onboarding flow had me lost within 2 minutes of testing — here's what broke down",
  "What founders get wrong about discovery (and how to fix it fast)",
  "A framework for better questions that actually gets signal",
  "How I evaluate pricing in a 15-minute walkthrough",
  "Avoid leading questions in interviews — examples from real sessions",
  "Hardware pilots: what breaks first when testers are honest",
  "What “good” usability feels like on day one vs. day thirty",
  "The hidden cost of compliance that shows up in user tests",
] as const;

const communityBodies = [
  "I kept hitting dead ends where the product assumed I already knew the vocabulary. Here’s the exact sequence that confused me, and a few neutral prompts that would have surfaced the same issues faster.",
  "After dozens of validations, the same pattern shows up: founders anchor on the solution before the constraint surface is clear. Here’s a lightweight checklist I use.",
  "Short, neutral stems beat clever copy in early discovery. I break down two transcripts and what I’d change on the founder side.",
  "Pricing pages are where anxiety spikes. I walk through what I scan for first, second, and third — and where I bounce.",
  "Leading questions feel helpful but they collapse variance. Examples from recent tests and rewrites that preserve signal.",
  "Shipping hardware to testers changes failure modes. Batteries, pairing, and “first hour” rituals dominate feedback.",
  "Usability isn’t aesthetics — it’s whether I can predict what happens next. Concrete markers I use when scoring sessions.",
  "Compliance anxiety shows up as hesitation, not rage. How I document it so founders can prioritize fixes.",
] as const;

export const mockCommunityPosts: CommunityPost[] = Array.from({ length: 8 }).map((_, i) => {
  const domains: Domain[] = ["MedTech", "SaaS", "EdTech", "FinTech", "VehicleTech", "Other"];
  const domain = domains[i % domains.length];
  const tester = mockTesterProfiles[i % mockTesterProfiles.length]!;
  const layouts = ["double", "single", "triple", "double", "single", "triple", "double", "single"] as const;
  const layout = layouts[i] ?? "single";
  const seed = `fscomm${i}`;
  const peerLine = tester.previousCompany
    ? `Peer @ ${tester.previousCompany}`
    : "Peer @ Meridian";

  const imageUrls =
    layout === "single"
      ? [`https://picsum.photos/seed/${seed}/880/520`]
      : layout === "double"
        ? [
            `https://picsum.photos/seed/${seed}a/640/560`,
            `https://picsum.photos/seed/${seed}b/640/560`,
          ]
        : [
            `https://picsum.photos/seed/${seed}1/280/520`,
            `https://picsum.photos/seed/${seed}2/280/520`,
            `https://picsum.photos/seed/${seed}3/280/520`,
          ];

  return {
    id: `post_${i + 1}`,
    userId: tester.id,
    domain,
    title: communityTitles[i] ?? communityTitles[0],
    content: communityBodies[i] ?? communityBodies[0],
    createdAt: isoDaysAgo(i),
    peerLine,
    author: {
      id: tester.id,
      name: tester.name,
      role: "tester",
      avatar: `https://i.pravatar.cc/128?img=${12 + i}`,
    },
    likes: 48 + i * 23,
    replies: 2 + (i % 4),
    isTopVoice: i % 3 === 0,
    imageUrls,
    imageLayout: layout,
  } satisfies CommunityPost;
});

export const mockInsightReports: InsightReport[] = [
  {
    id: "insight_1",
    formId: mockForms[0].id,
    founderId: "founder_1",
    generatedAt: isoDaysAgo(1),
    keyFindings: ["Messaging clarity drives response rate.", "Early objections cluster around switching costs."],
    painPoints: ["Setup complexity", "Unclear ROI in week one"],
    willingnessToPay: "Moderate (budget exists, needs proof quickly)",
    featurePriorities: ["Faster onboarding", "Templates", "Integrations"],
    actionableSteps: ["Rewrite the first question to be neutral.", "Add 2 proof points above the CTA."],
    biasFlags: [
      {
        questionId: "q_1_1",
        question: "You’d pay for this, right?",
        issue: "Leading phrasing biases responses toward agreement.",
      },
    ],
  },
  {
    id: "insight_2",
    formId: mockForms[2].id,
    founderId: "founder_1",
    generatedAt: isoDaysAgo(3),
    keyFindings: ["Trust signals matter more than feature breadth."],
    painPoints: ["Security review time", "Vendor risk"],
    willingnessToPay: "High (if compliance posture is clear)",
    featurePriorities: ["SOC2-ready story", "Audit logs"],
    actionableSteps: ["Add security FAQ.", "Clarify data retention."],
    biasFlags: [],
  },
];

export const mockPaymentRecord: PaymentRecord = {
  id: "pay_1",
  userId: mockUser.id,
  resource: "agent_creation",
  amountUsdc: 1.0,
  txHash: "0xDEMO_TX_HASH",
  network: "base-sepolia",
  createdAt: isoDaysAgo(10),
};

