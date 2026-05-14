# FounderSuite

Customer discovery platform with LiveKit + Deepgram transcription, Claude AI insights, and an AI agent marketplace.

## Setup

### 1. Fill in API keys

Edit these files and replace `PLACEHOLDER` values:
- `agent/.env`
- `api/.env`
- `frontend/.env`

Required keys:
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` — from livekit.io
- `DEEPGRAM_API_KEY` — from deepgram.com
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` — from supabase.com

### 2. Set up Supabase

Run `supabase_schema.sql` in your Supabase project's SQL editor.

### 3. Run the API server

```bash
cd api
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

### 4. Run the LiveKit agent

```bash
cd agent
pip install -r requirements.txt
python agent.py dev
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — Spectra-style 3-column insights view |
| `/meeting` | Meeting Room — LiveKit room with live Deepgram transcription |
| `/marketplace` | AI Marketplace — autonomous AI agent testers |

## Architecture

```
Browser ──► React App (Vite, React Router, Tailwind)
              │
              ├── /token, /transcript, /summary ──► FastAPI (api/server.py)
              │                                        │
              │                                        ├── Supabase (storage)
              │                                        └── Claude API (summaries)
              │
              └── LiveKit WebRTC Room
                    │
                    └── LiveKit Cloud Agent (agent/agent.py)
                          └── Deepgram STT
```
