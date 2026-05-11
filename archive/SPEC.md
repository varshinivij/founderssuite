# FoundersSuite Backend — Endpoint Spec

## Overview

When a user adds their **experience, problem, or story**, the backend automatically
spawns one or more **AI agents** on their behalf. Each agent monitors open founder
**ValidationForms**, scores relevance, and auto-fills + submits the form whenever
a match is found — no manual effort required.

Agent creation is gated behind an **x402 USDC micropayment** (configurable,
default $1.00 on Base). This lets users create many agents cheaply while
generating sustainable revenue per agent.

```
User adds story
      │
      ▼ (x402 payment verified)
Agent created (status: active)
      │
      ▼ (background monitoring)
Founder posts ValidationForm
      │
      ▼ (matchingService scores relevance)
Match found (score ≥ 0.55)
      │
      ▼ (formFillerService)
Agent auto-fills & submits form
      │
      ▼
User notified — form already done ✓
```

---

## Base URL

```
http://localhost:3001
```

---

## Authentication

> Not yet implemented — add JWT / API key middleware before going to prod.

---

## Endpoints

### Health

| Method | Path      | Description        |
|--------|-----------|--------------------|
| GET    | /health   | Liveness check     |

---

### Users

| Method | Path                          | Auth  | x402 | Description                          |
|--------|-------------------------------|-------|------|--------------------------------------|
| POST   | /users                        | —     | —    | Create a new user                    |
| GET    | /users/:id                    | —     | —    | Get user profile                     |
| POST   | /users/:id/stories            | —     | ✓    | Add story → auto-creates agent       |
| GET    | /users/:id/stories            | —     | —    | List all stories for a user          |
| DELETE | /users/:id/stories/:storyId   | —     | —    | Delete a story                       |

#### POST /users
```json
// Request
{
  "email": "alice@example.com",
  "name": "Alice"
}

// Response 201
{
  "id": "uuid",
  "email": "alice@example.com",
  "name": "Alice",
  "createdAt": "ISO8601"
}
```

#### POST /users/:id/stories  ← x402 payment required
```json
// Request
{
  "type": "experience" | "problem" | "story",
  "title": "5 years in B2B SaaS sales",
  "description": "I led outbound sales at three early-stage startups...",
  "tags": ["sales", "b2b", "saas"]
}

// Response 201
{
  "story": { "id": "...", "userId": "...", "type": "experience", ... },
  "agent": {
    "id": "...",
    "name": "Agent for \"5 years in B2B SaaS sales\"",
    "status": "active",
    "matchCriteria": "Type: experience | Title: ... | Context: ...",
    "filledForms": 0,
    "createdAt": "ISO8601"
  }
}
```

---

### Agents

| Method | Path                    | Description                              |
|--------|-------------------------|------------------------------------------|
| GET    | /agents/user/:userId    | List all agents for a user               |
| GET    | /agents/:id             | Get agent detail + stats                 |
| GET    | /agents/:id/matches     | List all matches/submissions for agent   |
| POST   | /agents/:id/activate    | Resume a paused agent                    |
| POST   | /agents/:id/pause       | Pause agent monitoring                   |
| POST   | /agents/:id/stop        | Permanently stop agent                   |
| DELETE | /agents/:id             | Delete agent                             |

#### GET /agents/:id
```json
{
  "id": "uuid",
  "userId": "uuid",
  "storyId": "uuid",
  "name": "Agent for \"B2B SaaS sales\"",
  "status": "active",
  "matchCriteria": "Type: experience | ...",
  "filledForms": 3,
  "createdAt": "ISO8601",
  "lastActiveAt": "ISO8601"
}
```

---

### Validation Forms (Founder side)

| Method | Path                      | Description                                   |
|--------|---------------------------|-----------------------------------------------|
| POST   | /forms                    | Create form — immediately triggers matching   |
| GET    | /forms                    | List all open forms                           |
| GET    | /forms/:id                | Get form details                              |
| GET    | /forms/:id/submissions    | List all agent-submitted answers              |
| POST   | /forms/:id/close          | Close form (stop accepting submissions)       |

#### POST /forms
```json
// Request
{
  "founderId": "uuid",
  "title": "Looking for early B2B SaaS advisors",
  "description": "Seeking people with hands-on sales experience at early-stage startups",
  "targetProfile": "B2B SaaS sales experience, startup background",
  "questions": [
    {
      "question": "Describe your B2B sales experience",
      "type": "text",
      "required": true
    },
    {
      "question": "How many deals have you closed?",
      "type": "multiChoice",
      "options": ["1–5", "5–20", "20+"],
      "required": true
    }
  ]
}

// Response 201
{
  "form": { "id": "...", "status": "open", ... },
  "matchesTriggered": 2   // number of agents that matched and began filling
}
```

#### GET /forms/:id/submissions
```json
[
  {
    "id": "match-uuid",
    "agentId": "agent-uuid",
    "userId": "user-uuid",
    "formId": "form-uuid",
    "score": 0.82,
    "status": "submitted",
    "agentAnswers": {
      "question-id-1": "I led outbound sales for 3 SaaS startups...",
      "question-id-2": "20+"
    },
    "submittedAt": "ISO8601"
  }
]
```

---

### Matches

| Method | Path                    | Description                            |
|--------|-------------------------|----------------------------------------|
| GET    | /matches/user/:userId   | All matches across all user's agents   |
| GET    | /matches/:id            | Single match detail                    |

---

### Payments

| Method | Path                      | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | /payments/user/:userId    | List payment records for a user      |
| GET    | /payments/:id             | Get single payment record            |

---

## x402 Payment Flow

Agent creation costs **$1.00 USDC** per story (configurable via `AGENT_CREATION_PRICE_USDC`).

```
Client                          Server
  │                                │
  ├──POST /users/:id/stories ──────►│
  │                                │ x402 middleware: no payment header
  │◄── 402 Payment Required ───────┤
  │    { accepts: [{ network,      │
  │      asset: "USDC",            │
  │      amount: "1.00",           │
  │      payTo: "0x..." }] }       │
  │                                │
  ├── [user pays on-chain] ────────►│ (wallet signs tx on Base)
  │                                │
  ├──POST /users/:id/stories ──────►│
  │   X-Payment: <proof>           │ x402 middleware: validates proof
  │                                │
  │◄── 201 { story, agent } ───────┤
```

Library: [`x402-express`](https://www.npmjs.com/package/x402-express)
Network: Base (mainnet) / Base Sepolia (testnet)
Asset: USDC

---

### Feedback (RL training signal)

| Method | Path                              | Description                                      |
|--------|-----------------------------------|--------------------------------------------------|
| POST   | /feedback/:matchId                | Founder records outcome → trains agent's policy  |
| GET    | /feedback/agent/:agentId/policy   | Get agent's current RL policy stats              |

#### POST /feedback/:matchId
```json
// Request
{ "outcome": "accepted" | "rejected" | "opened" | "no_response" }

// Response
{
  "message": "Feedback recorded — agent trained",
  "outcome": "accepted",
  "agentPolicy": { "steps": 42, "epsilon": 0.73 }
}
```

---

## Machine Learning — Reinforcement Learning Agent

Each AI agent runs a **Deep Q-Network (DQN)** policy that improves with every
founder feedback signal. Agents train independently, so a user with 5 agents
develops 5 specialised policies.

### Architecture

```
State (4 features)           Hidden (16, ReLU)     Q-values (3 actions)
  relevanceScore    ──┐
  agentAge (norm)   ──┤── W1 (4×16) + b1 ──ReLU──── W2 (16×3) + b2 ──► SUBMIT
  successRate       ──┤                                                 ► SKIP
  formsFilled       ──┘                                             ► REQUEST_MORE_CONTEXT
```

### Actions
| Action                | Meaning                                                          |
|-----------------------|------------------------------------------------------------------|
| SUBMIT                | Fill and submit the form on the user's behalf                    |
| SKIP                  | Relevance too low — ignore this form                             |
| REQUEST_MORE_CONTEXT  | Match is borderline — notify user to enrich their story          |

### Training (DQN)
- **Reward signal**: +1 accepted, +0.3 opened, 0 no-response, -1 rejected
- **TD update**: `Q(s,a) ← reward + γ * max_a Q(s', a)`, γ = 0.95
- **Experience replay**: up to 500 transitions per agent, sampled in batches of 32
- **Exploration**: ε-greedy starting at ε=1.0, decaying by 0.995 per step → min 0.1

### Flow

```
Founder posts outcome (accepted/rejected)
          │
          ▼
POST /feedback/:matchId
          │
          ▼
onOutcome() → recordExperience() → trainStep() (online backprop)
          │
          ▼
Agent epsilon decays: explores less, exploits learned policy more
          │
          ▼ (next form appears)
agentDecide() → ε-greedy action selection
```

### Production upgrade path
- Replace hand-rolled net with ONNX model served via FastAPI + PyTorch
- Add embedding-based relevance scoring (cosine similarity on text embeddings)
- Federated policy — share a base policy across agents, fine-tune per-agent

---

## Running locally

```bash
cd backend
cp .env.example .env   # fill in wallet address + AI key
npm install
npm run dev            # tsx watch, hot reload
```
