# FoundersSuite

A two-sided marketplace connecting founders with domain-matched testers for product validation — combining AI-powered matching, real-time interview intelligence, and a collaborative community.

## Architecture

| Service | Port | Stack | Description |
|---|---|---|---|
| **Next.js Dashboard** | 3000 | Next.js 16, Tailwind CSS | Founder & tester UI |
| **Express API** | 3001 | Node.js, TypeScript, tsx | Core business logic, matching, forms |
| **Interview Intelligence API** | 8000 | FastAPI, Python | Live interview coaching, transcripts, memory graph |
| **ML Matching API** | 8001 | FastAPI, Keras/TensorFlow | Neural-network form–tester matching |

## Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.11+ with pip
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com/api-keys)
- **LiveKit account** (free tier) — [livekit.io](https://livekit.io) *(only needed for live video interviews)*

## Quick Start

### 1. Clone and enter the repo

```bash
git clone https://github.com/AaravGarg16/founderssuite.git
cd founderssuite
```

### 2. Configure environment variables

**Express API** (`archive/`):
```bash
cp archive/.env.example archive/.env
# Edit archive/.env — set OPENAI_API_KEY
```

**Interview Intelligence API** (`founderssuite-feature-sanjay/api/`):
```bash
cp founderssuite-feature-sanjay/api/.env.example founderssuite-feature-sanjay/api/.env
# Edit .env — set OPENAI_API_KEY, LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
```

**Frontend** (`founderssuite-ui-landing-dashboard-refresh/frontend/`):
```bash
cp founderssuite-ui-landing-dashboard-refresh/frontend/.env.local.example \
   founderssuite-ui-landing-dashboard-refresh/frontend/.env.local
# Default values work for local development — no edits needed
```

### 3. Install dependencies

**Express API:**
```bash
cd archive
npm install
cd ..
```

**Frontend:**
```bash
cd founderssuite-ui-landing-dashboard-refresh/frontend
npm install
cd ../..
```

**Interview Intelligence API:**
```bash
cd founderssuite-feature-sanjay/api
python3 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ../..
```

**ML Matching API:**
```bash
cd backend-ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
deactivate
cd ..
```

### 4. Build the frontend

```bash
cd founderssuite-ui-landing-dashboard-refresh/frontend
npm run build
cd ../..
```

### 5. Start all services

```bash
chmod +x start.sh
./start.sh
```

This starts all four services and waits until the dashboard is reachable. Press **Ctrl+C** to stop everything cleanly.

| URL | Description |
|---|---|
| http://localhost:3000 | Dashboard (founder & tester UI) |
| http://localhost:3001 | Express API |
| http://localhost:3001/docs | Swagger API docs |
| http://localhost:8000 | Interview Intelligence API |
| http://localhost:8001 | ML Matching API |

**Service logs:**
```bash
tail -f /tmp/fs-express.log
tail -f /tmp/fs-interview.log
tail -f /tmp/fs-ml.log
tail -f /tmp/fs-nextjs.log
```

---

## Feature Walkthrough

### Founder flow

1. **Sign up** at `/login` — select **Founder**, enter email, click Sign In.
2. **Create a validation form** — My Forms → New Form. Fill title, target profile, and questions.
3. **Create an AI agent** — AI Agents → New Agent. Your agent auto-fills your own forms and invites real testers.
4. **Review submissions** — My Forms → click a form → Submissions tab. Grouped by AI agents and human testers.
5. **Invite human testers** — Invite Testers tab on the form detail page. Swipe right to invite, left to skip.
6. **Run a live interview** — Interview Suite → Live Meeting. The AI coach gives real-time bias flags and recommended follow-ups.
7. **Simulate an interview** — Interview Suite → Simulator. Choose an AI persona and practice before a real session.
8. **Review insights** — Interview Suite → Insights. Summary, hypothesis validations, bias flags, and a knowledge memory graph — all scoped to your account.

### Tester flow

1. **Sign up** at `/login` — select **Tester**, enter email, click Sign In.
2. **Browse the feed** — see open validation forms from founders.
3. **Check matches** — Matches page shows forms you've been invited to by founders. Accept and fill inline.
4. **Community** — read and engage with posts from other testers.
5. **Profile** — your experiences, tags, and agent stats.

---

## Development

### Run services individually

**Express API (hot-reload):**
```bash
cd archive
npm run dev
```

**Interview Intelligence API:**
```bash
cd founderssuite-feature-sanjay/api
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**ML Matching API:**
```bash
cd backend-ml/API
source ../.venv/bin/activate
PYTHONPATH=$(pwd)/.. uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend (dev mode with hot-reload):**
```bash
cd founderssuite-ui-landing-dashboard-refresh/frontend
npm run dev
```
> Note: `npm run dev` uses Turbopack. For a production-equivalent build use `npm run build && npm run start`.

### Rebuild the frontend after code changes

```bash
cd founderssuite-ui-landing-dashboard-refresh/frontend
rm -rf .next
npm run build
```
Then restart `start.sh` (or just kill and restart the Next.js process).

---

## Project Structure

```
founderssuite/
├── start.sh                                      # One-command startup for all services
├── archive/                                      # Express API (port 3001)
│   ├── src/
│   │   ├── index.ts                              # Server entry point
│   │   ├── seed.ts                               # Tester pool seed data
│   │   ├── routes/                               # REST endpoints (users, forms, agents, matches)
│   │   ├── services/                             # Business logic (matching, form filling, agents)
│   │   ├── ml/                                   # DQN policy network for agent training
│   │   └── types/                                # Shared TypeScript types
│   └── .env.example
├── founderssuite-feature-sanjay/                 # Interview Intelligence (port 8000)
│   └── api/
│       ├── server.py                             # FastAPI server — transcripts, intelligence, memory graph
│       ├── requirements.txt
│       └── .env.example
├── founderssuite-ui-landing-dashboard-refresh/   # Next.js dashboard (port 3000)
│   └── frontend/
│       ├── app/                                  # Next.js App Router pages
│       │   ├── (auth)/login/                     # Login with role toggle (Founder / Tester)
│       │   ├── (dashboard)/founder/              # Founder dashboard, forms, commission
│       │   ├── (dashboard)/tester/               # Tester feed, matches, profile
│       │   ├── (dashboard)/agents/               # AI agent creation
│       │   ├── (dashboard)/insights/             # Interview insights + memory graph
│       │   ├── (dashboard)/meeting/              # Live interview room
│       │   └── (dashboard)/simulator/            # AI-persona interview simulator
│       ├── components/                           # Shared UI components
│       ├── hooks/                                # React hooks (useAuth, useAgents, useForms, …)
│       ├── lib/                                  # API clients (api.ts, interviewApi.ts, auth.tsx)
│       └── .env.local.example
└── backend-ml/                                   # ML Matching API (port 8001)
    ├── API/app.py                                # FastAPI server
    ├── model/                                    # Two-tower neural network
    └── models/                                   # Trained model weights
```

---

## Key Design Decisions

- **Role-based nav** — Founders see Dashboard, Forms, AI Agents, Commission, Interview Suite. Testers see Feed, Matches, Community, Profile.
- **Agent scope** — Founder-created agents (`scope: "self"`) fill only their own forms. Tester agents (`scope: "public"`) fill any matching form globally.
- **Interview isolation** — Meeting rooms and memory graphs are scoped by `user_id` so each account sees only its own interview data.
- **In-memory storage** — The Express API and Interview API default to in-memory Maps/dicts (zero setup). Data resets on server restart. Swap in Supabase via environment variables for persistence.
