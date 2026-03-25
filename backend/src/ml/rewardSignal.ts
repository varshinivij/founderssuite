/**
 * Reward signal definitions for agent RL training.
 *
 * The agent receives a reward after each form submission based on
 * founder feedback (accepted / rejected / no-response).
 *
 * reward ∈ [-1, +1]
 *   +1.0 → founder accepted the submission / booked a call
 *   +0.3 → founder opened but gave no response (partial signal)
 *   -1.0 → founder explicitly rejected the submission
 *    0.0 → no response after TTL window (neutral)
 */

export type Outcome = "accepted" | "rejected" | "opened" | "no_response";

export const REWARD: Record<Outcome, number> = {
  accepted: 1.0,
  opened: 0.3,
  no_response: 0.0,
  rejected: -1.0,
};

export function computeReward(outcome: Outcome): number {
  return REWARD[outcome];
}
