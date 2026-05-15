// ─── Users ─────────────────────────────────────────

export type UserRole = "founder" | "tester";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

export interface FounderProfile extends User {
  role: "founder";
  companyName: string;
  companyLogo?: string;
  companyDescription: string;
  industryTags: string[];
  teamSize: number;
  productDemoUrl?: string;
  lookingFor: string;
  timeCommitment: string;
  feedbackStyle: string;
}

export interface TesterProfile extends User {
  role: "tester";
  domain: string;
  livedExperience: string;
  skills: string[];
  hourlyRate: number;
  availability: string;
  timezone: string;
  testingTypes: string[];
  platformPreferences: string[];
  industryInterests: string[];
  qualityScore: number;
  projectsTested: number;
  bio: string;
  previousCompany?: string | null;
  isTopVoice?: boolean;
  tags?: string[];
}

// ─── Stories & Agents ──────────────────────────────

export type StoryType = "experience" | "problem" | "story";

export interface UserStory {
  id: string;
  userId: string;
  type: StoryType;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

export type AgentStatus = "active" | "paused" | "stopped";

export interface Agent {
  id: string;
  userId: string;
  storyId: string;
  name: string;
  status: AgentStatus;
  type: "ai" | "human";
  scope: "self" | "public";
  matchCriteria: string;
  filledForms: number;
  successRate: number;
  createdAt: string;
  lastActiveAt: string;
  policy: {
    trained: boolean;
    steps: number;
    epsilon: number;
  };
}

// ─── Forms & Validation ────────────────────────────

export type FormQuestionType = "text" | "multiChoice" | "rating";

export interface FormQuestion {
  id: string;
  question: string;
  type: FormQuestionType;
  options?: string[];
  required: boolean;
}

export type FormStatus = "open" | "closed";

export interface ValidationForm {
  id: string;
  founderId: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  targetProfile: string;
  status: FormStatus;
  createdAt: string;
  stage?: string;
  compensation?: number;
  founder?: {
    id: string;
    name: string;
    companyName: string;
    companyLogo?: string;
  };
}

// ─── Matches ───────────────────────────────────────

export type MatchStatus = "pending" | "invited" | "submitted" | "rejected" | "accepted";

export interface Match {
  id: string;
  agentId: string;
  userId: string;
  formId: string;
  score: number;
  status: MatchStatus;
  agentAnswers?: Record<string, string>;
  submittedAt?: string;
  createdAt: string;
  tester?: TesterProfile;
  form?: ValidationForm;
}

// ─── Community ─────────────────────────────────────

export type Domain =
  | "MedTech"
  | "SaaS"
  | "EdTech"
  | "FinTech"
  | "VehicleTech"
  | "Other";

export type CommunityPostImageLayout = "single" | "double" | "triple";

export interface CommunityPost {
  id: string;
  userId: string;
  domain: Domain;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
  };
  /** e.g. "Peer @ Bullish" */
  peerLine?: string;
  likes: number;
  replies: number;
  isTopVoice?: boolean;
  imageUrls?: string[];
  imageLayout?: CommunityPostImageLayout;
}

export interface PostReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
}

// ─── Feedback & Insights ───────────────────────────

export type FeedbackOutcome = "accepted" | "rejected" | "opened" | "no_response";

export interface Feedback {
  matchId: string;
  outcome: FeedbackOutcome;
  notes?: string;
  createdAt: string;
}

export interface InsightReport {
  id: string;
  formId: string;
  founderId: string;
  generatedAt: string;
  keyFindings: string[];
  painPoints: string[];
  willingnessToPay: string;
  featurePriorities: string[];
  actionableSteps: string[];
  biasFlags: {
    questionId: string;
    question: string;
    issue: string;
  }[];
}

// ─── Payments (x402) ───────────────────────────────

export interface PaymentRecord {
  id: string;
  userId: string;
  resource: string;
  amountUsdc: number;
  txHash: string;
  network: string;
  createdAt: string;
}

// ─── API Wrappers ──────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

