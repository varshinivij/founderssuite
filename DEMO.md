# FoundersSuite — Demo Testing Workflow

Complete end-to-end walkthrough with exact inputs. Follow the steps in order — each step depends on the ones before it.

**Before you start — launch all services:**
```bash
./start.sh
```
Wait for `All services running!` then open http://localhost:3000

> **Tip:** Keep browser DevTools → Network open to watch API calls in real time.

---

## Part 1 — Founder account setup

### Step 1 · Sign in as a founder

Go to → http://localhost:3000/login

| Field | Input |
|---|---|
| Role toggle (top of form) | Click **Founder** (turns purple) |
| Email | `brady@founderssuite.com` |
| Password | `demo1234` |

Click **Sign in**.

You land on the **Founder Dashboard** — empty state with a "No data yet" message and a chart placeholder. This is correct for a fresh account.

---

## Part 2 — Create an AI agent first

> Agent must exist before the form so it can be matched when the form is created.

### Step 2 · Create an AI agent

Click **AI Agents** in the top nav → click **+ New Agent** (or go to http://localhost:3000/agents/new)

Fill in exactly:

| Field | Input |
|---|---|
| Story type | **Experience** (pill button, should be default) |
| Title | `3 years running CS and sales ops at a B2B SaaS startup` |
| Description | `Led the revenue ops function at an early-stage SaaS company. Owned the handoff process between sales and customer success — built the playbooks, found all the failure points, lost a few deals because of missed context.` |
| Tags | `b2b, saas, cs ops, revenue ops, handoffs` |

> **Note:** As a founder, scope is automatically set to "self" — your agent fills your own forms only. The notice at the bottom of the form confirms this.

Click **Create agent**.

You are redirected to the **AI Agents** list page. Your new agent appears with status **Active**.

---

## Part 3 — Create a validation form

### Step 3 · Create a form

Click **My Forms** in the top nav → click **+ New Form** (or go to http://localhost:3000/founder/forms/new)

Fill in exactly:

| Field | Input |
|---|---|
| Title | `Looking for B2B SaaS ops managers to validate our CS handoff tool` |
| Description | `We're building a tool that automates context handoff between sales and CS when a deal closes. We want feedback from people who have owned or lived this problem firsthand.` |
| Target profile | `Operations managers, CS leads, or RevOps people at B2B SaaS companies with 10–500 employees` |
| Stage | Click **Pre-Seed** |
| Compensation (USD) | `75` |

The form comes with one pre-filled question. Replace it and add a second:

| # | Question text | Type |
|---|---|---|
| 1 | `How does your team currently hand off context when a deal closes from sales to CS?` | **Text** |
| 2 | `How often does a missed handoff cause a real problem — lost deal, churned customer, or delayed onboarding?` | **Rating** |

Click **+ Add question** to add the second row.

Click **Create form & match agents**.

You see a green banner: `✓ Form created! Matching triggered for N agent(s)`

> The number depends on how many seeded tester agents matched. Expect 2–4 on a B2B SaaS form.

---

## Part 4 — Watch AI submissions arrive

### Step 4 · Review the Submissions tab

You are on the form detail page. Click the **Submissions** tab (should be default).

The page polls every 5 seconds. Within 10–15 seconds you should see:

- **Your own agent** — "3 years running CS and sales ops..." with a dark purple **AI Agent** badge
- **Devon K.** — SaaS/RevOps tester, violet AI Agent badge
- Possibly **Kenji S.** (FinTech) or **Maya R.** (MedTech) depending on keyword overlap scores

Click **View answers** on any card to open a modal showing the full Q&A.

> If the Submissions tab is empty after 30 seconds, hard-refresh the page. The polling continues automatically.

---

### Step 5 · Invite a human tester

Click the **Invite Testers** tab.

You should see a card for **Jamie Lee** — a SaaS/B2B human tester who matched your form but is waiting for your invite.

The card shows:
- Name, domain, match score %
- Bio excerpt and skills tags

Click **✓ Send Invite**.

The card disappears from the queue. Jamie Lee's status moves from `pending` → `invited`.

> If the queue is empty, the seeded human agent (agent_h1) didn't score above the match threshold. Try refreshing — the Express backend processes matches asynchronously.

---

## Part 5 — Tester accepts and fills the form

### Step 6 · Sign in as a tester

Open a **new incognito / private window** → http://localhost:3000/login

| Field | Input |
|---|---|
| Role toggle | Click **Tester** (turns purple) |
| Email | `jamie@test.com` |
| Password | `demo1234` |

Click **Sign in**.

You land on the **Tester Feed** — a list of open founder forms.

---

### Step 7 · Accept the invite and fill the form

Click **Matches** in the top nav.

You see two sections:

**Invited by a founder** — Brady's form appears here with an **Invited** badge and an **Accept & Fill** button.

Click **Accept & Fill**. An inline form expands with your form's two questions.

Fill in:

| Question | Answer |
|---|---|
| How does your team currently hand off context...? | `We use a Slack channel and a shared Notion doc that nobody keeps up to date. Realistically the AE sends one Slack message and the CS manager picks it up cold.` |
| How often does a missed handoff cause a real problem? | Click **4** (star rating) |

Click **Submit feedback**.

The card updates — the Invited badge changes to **Submitted** and a confirmation message appears.

The second section **AI-matched opportunities** shows pending matches your agent found automatically (waiting for founder invites from other founders).

---

## Part 6 — Tester profile and community

### Step 8 · View your tester profile

Click **Profile** in the top nav.

You see:
- Your name and email from login
- Stats grid: Forms Filled, Quality Score, Experiences, Active Agents
- **About Me** — pulled from your first story/experience
- **My Agents** — your public AI agent cards with fill counts and success rates
- **Experiences & Stories** — the experience card you created with tags

---

### Step 9 · Browse Community

Click **Community** in the top nav.

You see a feed of posts from domain experts. Try filtering:
- Use the domain dropdown — select **SaaS** to filter to SaaS posts
- Use the search bar — type `handoff` or `discovery`

Click any post title to open the full thread view.

---

## Part 7 — Founder reviews results

### Step 10 · Switch back to the founder window

Return to your original (non-incognito) browser window (still logged in as Brady).

Go to **My Forms** → click your form → **Submissions** tab.

You now see:

- **Human Testers** section at the top — Jamie Lee's submission with a dark purple badge and timestamp
- **AI Agents** section below — Devon, your own agent, and any others that matched

Click **View answers** on Jamie's card to read their full responses.

---

### Step 11 · Founder Dashboard

Click **Dashboard** in the top nav.

Now that you have an agent and submissions, the dashboard is populated:

- **Summary KPIs** — Total Agents (1), Active Agents (1), Open Forms (1), Forms Filled (sum)
- **Engagement Growth** — 10-bar chart with values derived from agent activity
- **Schedule** — Your open form listed with its creation date
- **Workflow Automation** — 5 progress bars: Task Completion, Tester Retention, Target Audience Compatibility, Open Forms, Total Agents

---

## Part 8 — Interview Suite: Simulator

### Step 12 · Run an AI-persona interview

Click **Interview Suite** in the top nav → click **Simulator** from the dropdown (or go to http://localhost:3000/simulator)

**Choose a persona:** Click **Sam-v3** — VP Ops at a mid-market logistics company, ROI/implementation focused. Best match for a B2B SaaS ops problem.

Before starting, set the interview context in the right panel:

| Field | Input |
|---|---|
| Objective | `Validate whether ops managers manually track customer handoffs and would pay to automate it` |
| Target customer | `Revenue ops or CS leads at B2B SaaS companies with a dedicated sales team` |
| Hypothesis | `Manual handoffs between sales and CS cause measurable revenue leakage` |
| Success criteria | `Interviewee describes a real incident where a missed handoff lost a deal or churned a customer` |
| Avoid topics | `Pricing, competitor tool names` |

Click **Start with Sam-v3**.

Ask these questions one at a time — paste each into the input field and press Enter or click Send:

1. `Walk me through what happens the day a deal closes at your company — specifically how sales hands it off to CS.`
2. `Has your team ever lost a customer or had a delayed onboarding because something fell through the cracks in that handoff?`
3. `What does your team do today to work around the problem?`
4. `If you had a tool that automatically packaged deal context and sent it to the CS team the moment a deal closed, what would make you trust it enough to actually use it?`

**Watch the right panel update after each question:**
- **Question quality score** — bar fills up (aim for 70+)
- **Bias pressure** — spikes if a question is leading (question 1 should be clean, question 2 may flag)
- **Suggested follow-ups** — two auto-generated next questions
- **Pinned quotes** — strong signal phrases extracted from Sam's answers

After all 4 questions, click **Generate insights** (bottom of the page).

You are redirected to `/insights?room=[roomName]` automatically.

---

## Part 9 — Interview Suite: Insights

### Step 13 · Read the summary

You land on the **Insights** page with your simulation automatically selected in the left sidebar (labeled with its room name and date + **SIMULATED** tag).

The **Summary** tab shows:
- **4 KPI scores** — bias score, question quality, insight density, validation strength
- **Key findings** — bullet points extracted from the transcript
- **Hypothesis validations** — your hypothesis marked as Validated / Invalidated / Unclear with evidence quote
- **Bias flags** — any leading questions flagged with the exact quote, the issue, and a suggested rewrite
- **Next steps** — numbered action items

---

### Step 14 · Explore the Memory graph

Click **Memory graph** (tab in the top right of the page header).

**Build the memory first:**
1. Make sure your simulation room is still selected in the left sidebar
2. Click **Build memory** (blue button, top right of main panel)
3. Wait a few seconds — status text updates to "Memory graph refreshed."

The **Knowledge Graph** on the left now shows:
- Up to 12 node tiles — customer, pain_point, workflow, requirement, call, integration types
- Colored dots indicate node type
- Relationships listed below the grid

**Search the memory:**
- Clear the search box (default says `spreadsheet onboarding SOC2`)
- Type `handoff` and click **Search**
- Results panel on the right fills with memory chunks from the transcript that mention handoffs

**Click any node** to open its detail panel showing name and type.

---

## Part 10 — Live meeting (optional)

### Step 15 · Join a live interview room

> Requires LiveKit credentials in `founderssuite-feature-sanjay/api/.env`. Skip if not configured.

Click **Interview Suite** → **Live Meeting** (or http://localhost:3000/meeting)

Fill the pre-meeting context (same values as Step 12), then click **Join Meeting**.

Speak into your microphone. Your speech is transcribed in real time and the AI coaching panel updates live — same intelligence as the simulator but with actual voice.

After the session, click **Generate summary** to save the report to Insights.

---

## Full feature checklist

| # | Feature | Route | Status after this walkthrough |
|---|---|---|---|
| 1 | Role toggle on login | `/login` | ✓ Tested (Founder + Tester) |
| 2 | Create AI agent (founder scope) | `/agents/new` | ✓ Agent created, scope=self |
| 3 | Create validation form with questions | `/founder/forms/new` | ✓ Form created, matching triggered |
| 4 | AI auto-submissions (5s polling) | `/founder/forms/[id]` → Submissions | ✓ Devon + own agent submitted |
| 5 | Invite tester by swipe | `/founder/forms/[id]` → Invite Testers | ✓ Jamie Lee invited |
| 6 | Tester login | `/login` (incognito) | ✓ Logged in as jamie@test.com |
| 7 | Tester accepts invite + fills inline | `/tester/matches` | ✓ Form submitted |
| 8 | Tester profile (real data) | `/tester/profile` | ✓ Shows experiences + agent stats |
| 9 | Community feed + domain filter | `/community` | ✓ Filter by SaaS |
| 10 | Founder sees human + AI submissions | `/founder/forms/[id]` → Submissions | ✓ Jamie + AI agents visible |
| 11 | Founder Dashboard with live metrics | `/founder/dashboard` | ✓ Chart + KPIs populated |
| 12 | AI simulator with live coaching | `/simulator` | ✓ Sam-v3, 4 questions |
| 13 | Interview summary + bias flags | `/insights` | ✓ Auto-loaded from simulator |
| 14 | Memory graph + semantic search | `/insights` → Memory graph | ✓ Built + searched |
| 15 | Live meeting room (optional) | `/meeting` | ⚠ Requires LiveKit config |

---

## Seeded tester pool (for reference)

These AI agents are always running and will auto-submit if they match your form:

| Name | Email | Domain | Best form match |
|---|---|---|---|
| Devon K. | devon@example.com | SaaS, B2B, RevOps | B2B SaaS, sales ops, GTM |
| Maya R. | maya@example.com | MedTech, Clinical | Medical devices, clinical workflows |
| Aisha T. | aisha@example.com | EdTech, K-12 | Education, LMS, curriculum |
| Kenji S. | kenji@example.com | FinTech, Payments | Payments, fraud, compliance |
| Jamie Lee | jamie@test.com | SaaS, B2B | Human tester — waits for founder invite |

## Troubleshooting

| Symptom | Fix |
|---|---|
| Submissions tab is empty after 30s | Hard-refresh; check Express API is running: `curl http://localhost:3001/health` |
| Invite Testers tab is empty | Jamie Lee's score didn't exceed threshold; try adding more SaaS/ops keywords to the form's target profile |
| Insights page shows no interviews | FastAPI server may have restarted (in-memory); re-run the simulator to generate a new session |
| Memory graph shows 0 nodes | Click "Build memory" first — graph is only populated after you trigger the extraction |
| Login redirects to wrong dashboard | Clear localStorage (`localStorage.clear()` in console) and log in again with the correct role selected |
| `./start.sh` fails on Python venv | Run `cd founderssuite-feature-sanjay/api && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` then retry |
