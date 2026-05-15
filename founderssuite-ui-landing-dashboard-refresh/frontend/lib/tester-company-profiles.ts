/**
 * Rich company marketing pages for the tester-side demo (View company profile).
 * Keyed by validation form id from mockForms.
 */

export interface TesterCompanyTeamMember {
  id: string;
  name: string;
  title: string;
  dept: string;
  avatarImg: number;
}

export interface TesterCompanyProfile {
  formId: string;
  displayName: string;
  logoLabel: string;
  logoEmoji: string;
  tags: { label: string; style: "orange" | "pink" }[];
  description: string;
  heroStats: { icon: "users" | "dollar" | "check"; headline: string; sub: string }[];
  demoTitle: string;
  demoSubtitle: string;
  surveyBrand: string;
  surveyQuestion: string;
  surveyOptions: string[];
  selectedOptionIndex: number;
  demoPills: string[];
  demoBody: string;
  team: TesterCompanyTeamMember[];
  employeeTotal: number;
  moreFaces: number;
}

const team = (
  rows: [string, string, string, string, number][],
): TesterCompanyTeamMember[] =>
  rows.map(([name, title, dept, id, img]) => ({
    id,
    name,
    title,
    dept,
    avatarImg: img,
  }));

export const TESTER_COMPANY_PROFILES: Record<string, TesterCompanyProfile> = {
  form_1: {
    formId: "form_1",
    displayName: "FreshBasket",
    logoLabel: "FB",
    logoEmoji: "🧺",
    tags: [
      { label: "B2B SaaS", style: "orange" },
      { label: "AI Powered", style: "pink" },
    ],
    description:
      "FreshBasket is a smart, user-friendly platform designed to transform the way people approach grocery shopping — from discovery to checkout — with transparent inventory and faster fulfillment for busy households.",
    heroStats: [
      { icon: "users", headline: "42", sub: "Active testers" },
      { icon: "dollar", headline: "$32", sub: "Flat rate" },
      { icon: "check", headline: "88%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "Help our product evolve by testing our platform.",
    surveyBrand: "FreshBasket",
    surveyQuestion: "How difficult is it for you to find fresh, organic produce locally?",
    surveyOptions: [
      "Very easy — I always find what I need nearby",
      "Somewhat difficult — selection is limited",
      "Very difficult — I rarely find organic options",
      "I mostly shop online for produce",
    ],
    selectedOptionIndex: 1,
    demoPills: ["142 responses", "2 min avg time", "89% completion"],
    demoBody:
      "This walkthrough mirrors the live tester flow: short guided prompts, neutral wording, and a clear path to completion. Your feedback shapes roadmap priorities and copy experiments for the next release.",
    team: team([
      ["Diana Wu", "Co-Founder & CEO", "Leadership", "fb_1", 32],
      ["Marcus Chen", "Head of Product", "Product", "fb_2", 45],
      ["Priya Nair", "Engineering Lead", "Engineering", "fb_3", 12],
      ["Jordan Lee", "Growth Marketing", "Marketing", "fb_4", 22],
      ["Sam Okonkwo", "Design Systems", "Design", "fb_5", 51],
      ["Elena Rossi", "Customer Research", "Research", "fb_6", 28],
    ]),
    employeeTotal: 24,
    moreFaces: 18,
  },
  form_2: {
    formId: "form_2",
    displayName: "MedFlow Clinical",
    logoLabel: "MF",
    logoEmoji: "🩺",
    tags: [
      { label: "MedTech", style: "orange" },
      { label: "HIPAA-aware", style: "pink" },
    ],
    description:
      "MedFlow Clinical streamlines pre-visit intake and care-team handoffs so clinicians spend less time on paperwork and more time with patients — without sacrificing auditability.",
    heroStats: [
      { icon: "users", headline: "36", sub: "Active testers" },
      { icon: "dollar", headline: "$75", sub: "Flat rate" },
      { icon: "check", headline: "91%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "See how testers evaluate real clinical workflows in under 3 minutes.",
    surveyBrand: "MedFlow Clinical",
    surveyQuestion: "How often do redundant intake questions frustrate your staff before a visit?",
    surveyOptions: [
      "Rarely — our forms are already lean",
      "Sometimes — a few repeats per week",
      "Often — it slows triage every day",
      "Unsure — we haven’t measured it",
    ],
    selectedOptionIndex: 2,
    demoPills: ["98 responses", "2.4 min avg", "92% completion"],
    demoBody:
      "This preview shows the tone, pacing, and branching we use for clinician-facing studies. Feedback rolls into a structured report for the product council each sprint.",
    team: team([
      ["Amelia Hart", "CEO", "Leadership", "mf_1", 15],
      ["Noah Patel", "Clinical Advisor", "Clinical", "mf_2", 33],
      ["Riley Kim", "Backend Lead", "Engineering", "mf_3", 44],
      ["Taylor Brooks", "Compliance", "Risk", "mf_4", 19],
      ["Casey Nguyen", "UX Research", "Research", "mf_5", 27],
      ["Jamie Fox", "Customer Success", "CS", "mf_6", 38],
    ]),
    employeeTotal: 31,
    moreFaces: 22,
  },
  form_3: {
    formId: "form_3",
    displayName: "Ledgerly",
    logoLabel: "LG",
    logoEmoji: "📒",
    tags: [
      { label: "FinTech", style: "orange" },
      { label: "Onboarding", style: "pink" },
    ],
    description:
      "Ledgerly helps small finance teams reconcile faster with explainable automation, clearer audit trails, and guardrails that keep humans in the loop for every sensitive change.",
    heroStats: [
      { icon: "users", headline: "28", sub: "Active testers" },
      { icon: "dollar", headline: "$100", sub: "Flat rate" },
      { icon: "check", headline: "85%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "Preview the onboarding study testers complete before payout.",
    surveyBrand: "Ledgerly",
    surveyQuestion: "Where do you lose the most trust during a first-week bank connection flow?",
    surveyOptions: [
      "Microcopy feels vague on permissions",
      "Loading states and error recovery",
      "Pricing or limits surfaced too late",
      "Security badges are hard to find",
    ],
    selectedOptionIndex: 0,
    demoPills: ["201 responses", "1.8 min avg", "87% completion"],
    demoBody:
      "Testers walk a sandboxed flow with production-identical UI. Your session feeds directly into the onboarding backlog and experiment backlog.",
    team: team([
      ["Vivian Cho", "Co-Founder", "Leadership", "lg_1", 41],
      ["Omar Haddad", "Head of Risk", "Risk", "lg_2", 52],
      ["Quinn Avery", "Product Design", "Design", "lg_3", 16],
      ["Blake Turner", "Payments Eng", "Engineering", "lg_4", 29],
      ["Morgan Ellis", "Lifecycle Marketing", "Marketing", "lg_5", 35],
      ["Ravi Singh", "Data Platform", "Engineering", "lg_6", 47],
    ]),
    employeeTotal: 19,
    moreFaces: 12,
  },
  form_4: {
    formId: "form_4",
    displayName: "ClassLoop",
    logoLabel: "CL",
    logoEmoji: "📚",
    tags: [
      { label: "EdTech", style: "orange" },
      { label: "Classroom-first", style: "pink" },
    ],
    description:
      "ClassLoop is a lightweight LMS companion for teachers who need fast assignments, clearer visibility into student progress, and fewer context switches during the school day.",
    heroStats: [
      { icon: "users", headline: "51", sub: "Active testers" },
      { icon: "dollar", headline: "$60", sub: "Flat rate" },
      { icon: "check", headline: "90%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "Experience the teacher usability study that ships every month.",
    surveyBrand: "ClassLoop",
    surveyQuestion: "How disruptive is it to switch between gradebook and assignment tools mid-class?",
    surveyOptions: [
      "Barely — we stay in one surface",
      "Somewhat — a few hops per lesson",
      "Very — it breaks classroom flow",
      "Depends on the device",
    ],
    selectedOptionIndex: 1,
    demoPills: ["167 responses", "2.1 min avg", "90% completion"],
    demoBody:
      "Sessions mirror real classroom constraints: short windows, partial attention, and mixed devices. Comments are clustered for curriculum and platform teams.",
    team: team([
      ["Harper Diaz", "CEO", "Leadership", "cl_1", 24],
      ["Alex Rivera", "Pedagogy Lead", "Education", "cl_2", 31],
      ["Sam Green", "Mobile Engineering", "Engineering", "cl_3", 42],
      ["Jordan Blake", "District Partnerships", "GTM", "cl_4", 18],
      ["Chris Park", "Accessibility", "Design", "cl_5", 53],
      ["Pat Lee", "Analytics", "Data", "cl_6", 26],
    ]),
    employeeTotal: 27,
    moreFaces: 15,
  },
  form_5: {
    formId: "form_5",
    displayName: "FleetAtlas",
    logoLabel: "FA",
    logoEmoji: "🚚",
    tags: [
      { label: "Logistics", style: "orange" },
      { label: "Field ops", style: "pink" },
    ],
    description:
      "FleetAtlas connects dispatch, drivers, and maintenance in one pane so fleets reduce downtime, predict failures earlier, and keep compliance paperwork from living in spreadsheets.",
    heroStats: [
      { icon: "users", headline: "33", sub: "Active testers" },
      { icon: "dollar", headline: "$80", sub: "Flat rate" },
      { icon: "check", headline: "86%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "Preview the discovery prompts operators see in the field.",
    surveyBrand: "FleetAtlas",
    surveyQuestion: "What breaks first when a vehicle goes out of service unexpectedly?",
    surveyOptions: [
      "Rerouting and customer comms",
      "Parts sourcing and vendor SLAs",
      "Compliance documentation",
      "Driver morale and scheduling",
    ],
    selectedOptionIndex: 0,
    demoPills: ["124 responses", "2.6 min avg", "86% completion"],
    demoBody:
      "We combine structured multiple choice with optional voice notes. Your answers inform the dispatch roadmap and the next maintenance automation release.",
    team: team([
      ["Indira Shah", "COO", "Leadership", "fa_1", 36],
      ["Luis Ortega", "Field Programs", "Operations", "fa_2", 14],
      ["Nina Kwon", "Maps & Routing", "Engineering", "fa_3", 48],
      ["Drew Collins", "Hardware Partnerships", "BD", "fa_4", 21],
      ["Avery Cole", "Safety & Compliance", "Risk", "fa_5", 39],
      ["Reese Morgan", "Driver Experience", "Product", "fa_6", 17],
    ]),
    employeeTotal: 22,
    moreFaces: 14,
  },
  form_6: {
    formId: "form_6",
    displayName: "Northwind Insights",
    logoLabel: "NW",
    logoEmoji: "🧭",
    tags: [
      { label: "Research", style: "orange" },
      { label: "B2B", style: "pink" },
    ],
    description:
      "Northwind Insights helps lean teams run fast validation cycles — neutral surveys, tight screener logic, and exports that founders can share with investors without reformatting.",
    heroStats: [
      { icon: "users", headline: "19", sub: "Active testers" },
      { icon: "dollar", headline: "$40", sub: "Flat rate" },
      { icon: "check", headline: "83%", sub: "Task completion" },
    ],
    demoTitle: "Demo video",
    demoSubtitle: "Walk through the baseline market validation survey.",
    surveyBrand: "Northwind Insights",
    surveyQuestion: "How confident are you that your last survey avoided leading questions?",
    surveyOptions: [
      "Very — we reviewed with legal",
      "Somewhat — we spot-check",
      "Not very — we move fast",
      "We outsource research entirely",
    ],
    selectedOptionIndex: 1,
    demoPills: ["88 responses", "1.9 min avg", "83% completion"],
    demoBody:
      "This clip shows how testers experience pacing, progress, and completion states. Copy and question order iterate weekly from cohort feedback.",
    team: team([
      ["Skyler Monroe", "Founder", "Leadership", "nw_1", 55],
      ["Charlie Adams", "Research Ops", "Research", "nw_2", 23],
      ["Frankie Wu", "Platform Engineering", "Engineering", "nw_3", 34],
      ["Sid Harper", "Brand & Comms", "Marketing", "nw_4", 46],
      ["Jo Avery", "Customer Education", "CS", "nw_5", 11],
      ["Em Blair", "Data Science", "Data", "nw_6", 37],
    ]),
    employeeTotal: 16,
    moreFaces: 9,
  },
};

export function getTesterCompanyProfile(formId: string): TesterCompanyProfile | undefined {
  return TESTER_COMPANY_PROFILES[formId];
}

export function listTesterCompanyFormIds(): string[] {
  return Object.keys(TESTER_COMPANY_PROFILES);
}
