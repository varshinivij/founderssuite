# FounderSuite Interview Intelligence PRD

## Summary

FounderSuite is an interview-first AI product for founders running customer discovery. The app should help founders prepare better questions, run live interviews, reduce bias, capture evidence, simulate target-customer conversations, and generate actionable post-interview insights.

This product is not a generic agent marketplace. All AI tools should serve the interview workflow.

## Primary User

Early-stage founders validating a market, workflow, pain point, pricing assumption, or product direction through customer interviews.

## Product Goals

- Make live customer interviews easier to run.
- Turn spoken conversations into reliable transcript evidence.
- Detect founder question bias in real time.
- Coach founders toward better follow-up questions.
- Extract high-signal quotes, objections, workarounds, and willingness-to-pay signals.
- Let founders rehearse interviews against a realistic mock target customer.
- Preserve enough interview context to generate useful summaries and next steps.

## Core Capabilities

### 1. Voice Transcriber

The meeting room must transcribe founder and participant speech during LiveKit sessions.

Requirements:
- Capture transcript segments with speaker, text, and timestamp.
- Display segments live in the meeting room.
- Persist transcript segments through the existing transcript API.
- Show visible transcription state, including fallback state.
- Use Deepgram for production transcription.
- Use browser captions as a backup when the agent is unavailable.

Acceptance:
- A founder can join a meeting, speak, and see transcript text appear.
- Summary generation works from the transcript.
- Transcription failures are visible and do not silently break the page.

### 2. Bias Detector Agent

The bias detector should be the most sophisticated live coaching system in the app.

Detection layers:
- Local syntactic detection for leading, confirmation, assumption-loaded, double-barreled, anchoring, social-desirability, sycophantic, and false-dichotomy questions.
- Semantic similarity against known biased-question examples.
- Contextual AI analysis across recent turns.
- Session-level accumulation to identify repeated patterns and confirmation spirals.

Bias event shape:
- Severity
- Bias type
- Flagged text
- Context reason
- Alternative phrasings
- Confidence
- Source

Acceptance:
- Obvious biased questions appear immediately.
- Contextual bias appears after enough transcript exists.
- High-severity bias is visually prominent without interrupting the interview.
- The transcript highlights flagged text.

### 3. Live Interview Tools

The live intelligence layer should include:
- Meeting phase detection: rapport, problem exploration, solution validation, pricing, closing.
- Question quality score.
- Talk-time balance.
- Topic drift detection against the interview goal.
- Key quote extraction.
- Suggested next questions.

Acceptance:
- The right panel updates as transcripts arrive.
- The panel remains useful when AI providers fail.
- Interview context improves suggestions and summary quality.

### 4. Mock Interview Simulator

Founders should simulate interviews against a mock target customer without creating separate agents.

Requirements:
- Founder can select a matched respondent persona.
- Founder can create a custom ideal-customer persona.
- Founder asks freeform interview or survey questions.
- Mock respondent answers in character.
- Simulated turns are stored as transcript segments.
- Live intelligence and summaries work on simulated sessions.

Acceptance:
- A simulation can run without LiveKit.
- Founder and mock-user turns appear in transcript order.
- Generated insights work for simulated sessions.

## Current Gaps

- Production transcription depends on correct Deepgram and agent runtime setup.
- Speaker attribution is still approximate.
- Interview goal setup must be captured before the meeting starts.
- Simulator needs custom persona authoring.
- Session persistence is still limited when Supabase is not configured.
- Dashboard should become more evidence-centric.
- Planned question review is missing.
- Consent and recording UX is missing.
- Summary quality depends on provider availability, so deterministic fallback must remain.

## Build Priority

1. Make transcription and fallback behavior visible and reliable.
2. Add interview goal setup before live meetings.
3. Use interview context in intelligence and summaries.
4. Add custom simulator personas.
5. Improve post-interview evidence organization.
6. Add consent and recording UX before production use.
