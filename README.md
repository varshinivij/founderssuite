# FoundersSuite

Web app for founders and testers: landing, auth, dashboards, matching, and community UI.

## Project layout

All application code lives in **`frontend/`** (Next.js 16, React 19, Tailwind).

Legacy backend snapshots and other non-UI trees have been removed from this branch so the repository matches a frontend-focused workflow.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Optional: create `frontend/.env.local` and set `NEXT_PUBLIC_API_BASE_URL` if the app should talk to a deployed API instead of the default `http://localhost:3001`.

## Scripts

| Command            | Description        |
| ------------------ | ------------------ |
| `npm run dev`      | Development server |
| `npm run build`    | Production build   |
| `npm run start`    | Serve production   |
| `npm run lint`     | ESLint             |
| `npm run screenshots` | Playwright screenshots (see `frontend/scripts/`) |
