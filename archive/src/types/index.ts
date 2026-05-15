export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserStory {
  id: string;
  userId: string;
  type: "experience" | "problem" | "story";
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

// One agent is spun up per story/experience a user adds
export interface Agent {
  id: string;
  userId: string;
  storyId: string;
  name: string;
  status: "active" | "paused" | "stopped";
  // "ai" agents auto-fill forms; "human" agents wait for founder invite
  type: "ai" | "human";
  // "self" = founder agent, fills only their own forms; "public" = tester agent, fills any matching form
  scope: "self" | "public";
  matchCriteria: string;
  filledForms: number;
  successRate: number;
  policy: { trained: boolean; steps: number; epsilon: number };
  createdAt: string;
  lastActiveAt: string;
}

// A founder's validation / interview request form
export interface ValidationForm {
  id: string;
  founderId: string;
  title: string;
  description: string;
  questions: FormQuestion[];
  targetProfile: string; // plain-text description of ideal respondent
  status: "open" | "closed";
  createdAt: string;
}

export interface FormQuestion {
  id: string;
  question: string;
  type: "text" | "multiChoice" | "rating";
  options?: string[]; // for multiChoice
  required: boolean;
}

// Created when an agent's match criteria aligns with a ValidationForm
export interface Match {
  id: string;
  agentId: string;
  userId: string;
  formId: string;
  score: number; // 0–1 relevance score
  // pending = awaiting founder review (human agents only)
  // invited = founder accepted, waiting for tester to fill
  // submitted = tester filled and submitted
  // rejected = declined by founder or tester
  status: "pending" | "invited" | "submitted" | "rejected";
  agentAnswers?: Record<string, string>; // questionId -> answer
  submittedAt?: string;
  createdAt: string;
}

// x402 payment record
export interface PaymentRecord {
  id: string;
  userId: string;
  resource: string; // e.g. "agent_creation"
  amountUsdc: number;
  txHash: string;
  network: string;
  createdAt: string;
}
