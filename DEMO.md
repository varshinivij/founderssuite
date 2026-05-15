# FoundersSuite — Demo Testing Workflow

A step-by-step walkthrough of every feature using fixed sample inputs. Run through this top to bottom for a complete demo.

**Start the app first:**
```bash
./start.sh
```
Then open http://localhost:3000

---

## Part 1 — Founder signs up and creates a form

### Step 1 · Sign in as a founder

Go to http://localhost:3000/login

| Field | Value |
|---|---|
| Role toggle | **Founder** |
| Email | `brady@demo.com` |

Click **Sign In**.

You land on the Founder Dashboard. It shows empty states — no data yet.

---

### Step 2 · Create a validation form

Click **My Forms** in the nav → **+ New Form**.

Fill in:

| Field | Value |
|---|---|
| Title | `Looking for B2B SaaS ops managers` |
| Description | `We're building a tool to automate customer handoff between CS and sales. Looking for people who have lived this pain.` |
| Target profile | `Operations managers or CS leads at B2B SaaS companies with 10–200 employees` |
| Stage | `Pre-Seed` |
| Compensation | `75` |

Add two questions:

| # | Question | Type |
|---|---|---|
| 1 | `How do you currently track handoffs between your CS and sales teams?` | Text |
| 2 | `How likely are you to pay for a tool that automates this?` | Rating (1–5) |

Click **Create Form**. You're redirected to the form detail page.

---

### Step 3 · Create an AI agent

Click **AI Agents** in the nav → **+ New Agent**.

Fill in:

| Field | Value |
|---|---|
| Type | `Experience` |
| Title | `5 years running CS ops at B2B SaaS startups` |
| Description | `Led customer success and built handoff playbooks across three early-stage SaaS companies. Know exactly where deals fall through the cracks.` |
| Tags | `CS Ops, B2B, SaaS, Handoffs` |
| Agent scope | `My forms only` *(auto-selected for founders)* |

Click **Create Agent**.

The agent is created and immediately starts auto-filling your open forms in the background.

---

### Step 4 · Watch AI submissions arrive

Go back to **My Forms** → click your form → **Submissions** tab.

Within a few seconds you should see:

- Your own agent's submission (dark purple **AI Agent** badge)
- Submissions from the public tester pool — Devon, Maya, Aisha, Kenji (violet **AI Agent** badges)

Each card shows the tester's domain, lived experience, match score, and their answers.

> If submissions haven't appeared yet, wait 10–15 seconds and refresh the tab.

---

### Step 5 · Invite a human tester

Stay on the form detail page → click the **Invite Testers** tab.

You'll see tester cards ranked by match score. The top card will be a SaaS or CS-domain tester.

- Swipe **right (✓)** or click the green checkmark to invite them.
- Swipe **left (✗)** or click the red X to skip.

Invite the top two testers.

---

## Part 2 — Tester receives invite and fills the form

### Step 6 · Sign in as a tester

Open a **new incognito / private window** and go to http://localhost:3000/login

| Field | Value |
|---|---|
| Role toggle | **Tester** |
| Email | `devon@demo.com` |

Click **Sign In**.

You land on the Tester Feed showing open founder forms.

---

### Step 7 · Check the Matches page

Click **Matches** in the nav.

You'll see a section at the top: **Invited by a founder** — your invitation from Brady's form appears here.

Click **Accept & Fill** on the invite.

An inline form expands. Fill it in:

| Question | Answer |
|---|---|
| How do you currently track handoffs? | `We use a mix of Slack messages and a shared Google Sheet. It breaks constantly — deals get lost when the AE hands off to CS without context.` |
| How likely are you to pay for a tool? | `5` |

Click **Submit**. The card updates to show your response was submitted.

---

### Step 8 · Browse the Community

Click **Community** in the nav.

Browse the feed of posts from domain experts. Click any post to read the full thread.

---

### Step 9 · View the Tester Profile

Click **Profile** in the nav.

Your profile shows:
- Your experience ("5 years running CS ops...") as a card with tags
- Agent stats — forms filled, success rate
- Empty states for anything not yet added

---

## Part 3 — Founder reviews results

### Step 10 · Switch back to founder

Return to your original (non-incognito) window or open http://localhost:3000/login and sign in as `brady@demo.com` (Founder).

Go to **My Forms** → click your form → **Submissions** tab.

Devon's human submission now appears at the top under **Human Testers** with a dark purple badge, alongside the AI submissions below it.

---

### Step 11 · Founder Dashboard

Click **Dashboard** in the nav.

Now that you have agents and form submissions, the dashboard shows:
- KPI tiles: Total Agents, Active Agents, Open Forms, Forms Filled
- Engagement Growth bar chart (derived from agent activity)
- Schedule section listing your open forms by creation date
- Workflow Automation metrics: task completion, tester retention, target audience compatibility

---

## Part 4 — Interview Suite

### Step 12 · Run a simulated interview

Click **Interview Suite** → **Simulator**.

Choose a persona — pick **"Skeptical Ops Manager"** or any available AI persona.

Set up the interview context:

| Field | Value |
|---|---|
| Objective | `Validate whether ops managers manually track customer handoffs` |
| Target customer | `Operations managers at early-stage B2B SaaS companies` |
| Hypothesis | `Manual handoffs between CS and sales cause revenue leakage` |
| Success criteria | `Customer describes a real incident caused by a missed handoff` |
| Avoid topics | `Pricing, competitor names` |

Click **Start Simulation**.

Ask these questions in order:

1. `Can you walk me through how your team hands off a customer from sales to CS?`
2. `What happens when something falls through the cracks between your CS team and sales?`
3. `How much time does your team spend on that workaround each week?`
4. `Have you ever lost a deal or a customer because of a missed handoff?`

After each message, watch the right panel update with:
- **Intent phase** — rapport → discovery → validation
- **Bias flags** if a question is leading
- **Recommended follow-ups**
- **Live quotes** extracted from the AI's responses

After 4 questions click **Generate Summary** to produce the full report.

---

### Step 13 · Run a live meeting (optional — requires LiveKit)

Click **Interview Suite** → **Live Meeting**.

Fill the pre-meeting context (same values as Step 12), then click **Join Meeting**.

Speak into your microphone — your words are transcribed in real time and the AI coach panel updates live.

> Skip this step if LiveKit is not configured. The simulator in Step 12 demonstrates the same intelligence pipeline without video.

---

### Step 14 · Review Interview Insights

Click **Interview Suite** → **Insights**.

Your simulated interview appears in the left sidebar. Click it.

The **Summary** tab shows:
- Scores: bias score, question quality, insight density, validation strength
- Key findings from the conversation
- Hypothesis validation result (validated / invalidated / unclear) with evidence
- Bias flags with suggested rewrites
- Next steps

Switch to **Memory graph** tab:
- Type `handoffs` in the search box → click **Search** to find relevant memory chunks
- Click **Build memory** to extract entities and relationships from the transcript
- The knowledge graph populates with nodes (customers, pain points, workflows) and edges between them
- Click any node to see its detail

---

## Summary of features covered

| # | Feature | Where |
|---|---|---|
| 1 | Founder signup with role toggle | `/login` |
| 2 | Create validation form with questions | `/founder/forms/new` |
| 3 | Create AI agent with scope | `/agents/new` |
| 4 | AI agents auto-fill forms | `/founder/forms/[formId]` → Submissions |
| 5 | Invite human testers by swipe | `/founder/forms/[formId]` → Invite Testers |
| 6 | Tester signup with role toggle | `/login` (incognito) |
| 7 | Tester sees invite and fills form inline | `/tester/matches` |
| 8 | Community feed | `/community` |
| 9 | Tester profile from real data | `/tester/profile` |
| 10 | Founder sees human + AI submissions | `/founder/forms/[formId]` → Submissions |
| 11 | Founder Dashboard with live metrics | `/founder/dashboard` |
| 12 | AI persona simulator with live coaching | `/simulator` |
| 13 | Live interview room (LiveKit) | `/meeting` |
| 14 | Interview insights — summary + memory graph | `/insights` |
