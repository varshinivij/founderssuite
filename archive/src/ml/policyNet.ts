/**
 * Policy network — lightweight neural net for agent decision-making.
 *
 * Architecture: 4-input → 16 hidden → 3 output (Q-values)
 *   Inputs:  [relevanceScore, agentAge, successRate, formsFilled]
 *   Outputs: Q-values for actions [SUBMIT, SKIP, REQUEST_MORE_CONTEXT]
 *
 * Training: Deep Q-Network (DQN) with experience replay.
 *   - We use a simple hand-rolled forward pass (no external ML lib dependency)
 *     so the backend stays lightweight.
 *   - For production, swap this for an ONNX model or call a Python microservice
 *     (FastAPI + PyTorch) via HTTP.
 *
 * The network weights are per-agent and persist in agentWeights map.
 * Over time, as the founder gives feedback, each agent's policy improves
 * independently — one user can have many specialised agents.
 */

export type Action = "SUBMIT" | "SKIP" | "REQUEST_MORE_CONTEXT";
const ACTIONS: Action[] = ["SUBMIT", "SKIP", "REQUEST_MORE_CONTEXT"];

const INPUT_SIZE = 4;
const HIDDEN_SIZE = 16;
const OUTPUT_SIZE = 3;
const LEARNING_RATE = 0.01;
const DISCOUNT_FACTOR = 0.95; // γ
const EPSILON_INITIAL = 1.0;
const EPSILON_MIN = 0.1;
const EPSILON_DECAY = 0.995;

export interface NetworkWeights {
  w1: number[][];  // INPUT_SIZE × HIDDEN_SIZE
  b1: number[];    // HIDDEN_SIZE
  w2: number[][];  // HIDDEN_SIZE × OUTPUT_SIZE
  b2: number[];    // OUTPUT_SIZE
  epsilon: number; // exploration rate
  steps: number;
}

// Per-agent weights store
const agentWeights = new Map<string, NetworkWeights>();

function initWeights(): NetworkWeights {
  const rand = () => (Math.random() * 2 - 1) * 0.1;
  return {
    w1: Array.from({ length: INPUT_SIZE }, () =>
      Array.from({ length: HIDDEN_SIZE }, rand)
    ),
    b1: Array.from({ length: HIDDEN_SIZE }, rand),
    w2: Array.from({ length: HIDDEN_SIZE }, () =>
      Array.from({ length: OUTPUT_SIZE }, rand)
    ),
    b2: Array.from({ length: OUTPUT_SIZE }, rand),
    epsilon: EPSILON_INITIAL,
    steps: 0,
  };
}

function relu(x: number): number {
  return Math.max(0, x);
}

function matMulVec(mat: number[][], vec: number[]): number[] {
  return mat.map((row) => row.reduce((sum, w, i) => sum + w * vec[i], 0));
}

function addVec(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i]);
}

/** Forward pass — returns Q-values for each action */
function forward(weights: NetworkWeights, state: number[]): number[] {
  const hidden = addVec(matMulVec(transpose(weights.w1), state), weights.b1).map(relu);
  const output = addVec(matMulVec(transpose(weights.w2), hidden), weights.b2);
  return output;
}

function transpose(mat: number[][]): number[][] {
  if (mat.length === 0) return [];
  return mat[0].map((_, colIdx) => mat.map((row) => row[colIdx]));
}

/** ε-greedy action selection */
export function selectAction(agentId: string, state: number[]): Action {
  const w = agentWeights.get(agentId) ?? initWeights();
  agentWeights.set(agentId, w);

  if (Math.random() < w.epsilon) {
    // Explore: random action
    return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  }
  // Exploit: greedy best Q
  const qValues = forward(w, state);
  const bestIdx = qValues.indexOf(Math.max(...qValues));
  return ACTIONS[bestIdx];
}

/**
 * DQN update step.
 * Called after an outcome (reward) is observed.
 *
 * TD target = reward + γ * max_a Q(nextState, a)
 * Loss      = (TD target - Q(state, action))²
 * Gradient  = backprop through the two-layer net
 */
export function trainStep(
  agentId: string,
  state: number[],
  actionIdx: number,
  reward: number,
  nextState: number[]
): void {
  const w = agentWeights.get(agentId) ?? initWeights();

  // Forward pass for state
  const hiddenRaw = addVec(matMulVec(transpose(w.w1), state), w.b1);
  const hidden = hiddenRaw.map(relu);
  const qValues = addVec(matMulVec(transpose(w.w2), hidden), w.b2);

  // TD target
  const nextQ = forward(w, nextState);
  const tdTarget = reward + DISCOUNT_FACTOR * Math.max(...nextQ);
  const tdError = tdTarget - qValues[actionIdx];

  // Backprop — output layer
  const dOutput = new Array(OUTPUT_SIZE).fill(0);
  dOutput[actionIdx] = -2 * tdError; // dLoss/dQ

  // w2 gradient
  for (let h = 0; h < HIDDEN_SIZE; h++) {
    for (let o = 0; o < OUTPUT_SIZE; o++) {
      w.w2[h][o] -= LEARNING_RATE * dOutput[o] * hidden[h];
    }
  }
  for (let o = 0; o < OUTPUT_SIZE; o++) {
    w.b2[o] -= LEARNING_RATE * dOutput[o];
  }

  // Hidden layer gradient
  const dHidden = w.w2.map((row) =>
    row.reduce((sum, wVal, o) => sum + wVal * dOutput[o], 0)
  );
  const dHiddenRelu = dHidden.map((d, i) => (hiddenRaw[i] > 0 ? d : 0));

  // w1 gradient
  for (let inp = 0; inp < INPUT_SIZE; inp++) {
    for (let h = 0; h < HIDDEN_SIZE; h++) {
      w.w1[inp][h] -= LEARNING_RATE * dHiddenRelu[h] * state[inp];
    }
  }
  for (let h = 0; h < HIDDEN_SIZE; h++) {
    w.b1[h] -= LEARNING_RATE * dHiddenRelu[h];
  }

  // Decay epsilon
  w.epsilon = Math.max(EPSILON_MIN, w.epsilon * EPSILON_DECAY);
  w.steps += 1;
  agentWeights.set(agentId, w);
}

export function getWeightsSummary(agentId: string) {
  const w = agentWeights.get(agentId);
  if (!w) return null;
  return { steps: w.steps, epsilon: w.epsilon };
}

export function actionIndex(action: Action): number {
  return ACTIONS.indexOf(action);
}
