/**
 * RL training loop.
 *
 * Called in two scenarios:
 *  1. Online: immediately after a founder records an outcome for a submission
 *  2. Batch:  periodically replays the buffer to train on past experiences
 *
 * Each agent trains independently — one user's 10 agents each develop their
 * own specialised policy based on which types of forms they succeed with.
 */
import { sampleBatch, recordExperience, buildStateVector, type Experience } from "./agentMemory.js";
import { trainStep, selectAction, actionIndex, type Action } from "./policyNet.js";
import { computeReward, type Outcome } from "./rewardSignal.js";

const BATCH_SIZE = 32;

/**
 * Called when a founder marks a submission as accepted/rejected/etc.
 * Records the experience and runs one online training step.
 */
export function onOutcome(params: {
  agentId: string;
  matchId: string;
  relevanceScore: number;
  action: Action;
  outcome: Outcome;
}): void {
  const { agentId, matchId, relevanceScore, action, outcome } = params;
  const reward = computeReward(outcome);

  const state = buildStateVector(relevanceScore, agentId);
  const nextState = buildStateVector(relevanceScore, agentId); // simplification; real impl tracks post-update state

  const exp: Experience = {
    agentId,
    matchId,
    state,
    action: action,
    reward,
    nextState,
    timestamp: new Date().toISOString(),
  };

  recordExperience(exp);
  trainStep(agentId, state, actionIndex(action), reward, nextState);
}

/**
 * Batch training from replay buffer — call this on a schedule (e.g. every hour)
 * to ensure agents continue learning even on outcomes that arrived late.
 */
export function batchTrain(agentId: string): void {
  const batch = sampleBatch(agentId, BATCH_SIZE);
  for (const exp of batch) {
    trainStep(
      exp.agentId,
      exp.state,
      actionIndex(exp.action as Action),
      exp.reward,
      exp.nextState
    );
  }
}

/**
 * Decide whether an agent should submit, skip, or request more context
 * for a given match before the actual LLM form-fill runs.
 * This is the RL policy in action.
 */
export function agentDecide(agentId: string, relevanceScore: number): Action {
  const state = buildStateVector(relevanceScore, agentId);
  return selectAction(agentId, state);
}
