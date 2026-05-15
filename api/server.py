import os
import uuid
import json
import logging
import math
import re
import importlib.util
from datetime import datetime
from typing import Literal, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from livekit import api as livekit_api
from pydantic import BaseModel
from supabase import create_client, Client

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

logger = logging.getLogger("foundersuite-api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="FounderSuite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Optional[Client] = None
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    or ""
)
if SUPABASE_URL and SUPABASE_URL != "PLACEHOLDER":
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# In-memory fallback when Supabase isn't configured
_meetings: dict = {}
_transcripts: dict[str, list] = {}
_summaries: dict[str, dict] = {}
_intelligence_cache: dict[str, dict] = {}
_simulation_sessions: dict[str, dict] = {}
_meeting_contexts: dict[str, dict] = {}
_icp_agents: dict[str, dict] = {}
_memory_chunks: list[dict] = []
_entities: dict[str, dict] = {}
_relationships: list[dict] = []
_browser_sessions: dict[str, dict] = {}
_embedding_model = None
_biased_corpus_embeddings: Optional[dict[str, list]] = None

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
BROWSER_USE_API_KEY = os.getenv("BROWSER_USE_API_KEY", "")
BROWSER_USE_BASE_URL = os.getenv("BROWSER_USE_BASE_URL", "https://api.browser-use.com/api/v3").rstrip("/")
BROWSER_USE_MODEL = os.getenv("BROWSER_USE_MODEL", "bu-mini")
BROWSER_USE_BROWSER_PROFILE_ID = os.getenv("BROWSER_USE_BROWSER_PROFILE_ID", "")


# ── Models ──────────────────────────────────────────────────────────────────

class TokenRequest(BaseModel):
    room_name: Optional[str] = None
    participant_name: Optional[str] = "user"


class TranscriptSegment(BaseModel):
    room_name: str
    speaker: str
    text: str
    timestamp_ms: Optional[int] = None


class MeetingContext(BaseModel):
    objective: str = ""
    target_customer: str = ""
    hypothesis: str = ""
    success_criteria: str = ""
    avoid_topics: str = ""
    notes: str = ""


class MeetingContextRequest(MeetingContext):
    room_name: str


class SimulationPersona(BaseModel):
    id: str
    name: str
    domains: list[str]
    profile: str
    role: Optional[str] = None
    companyContext: Optional[str] = None
    buyingCriteria: Optional[list[str]] = None
    skepticism: Optional[str] = None
    responseStyle: Optional[str] = None


class IcpAgentInput(BaseModel):
    name: str
    target_customer: str
    market: str
    pains: str
    buying_triggers: str
    objections: str
    voice_id: Optional[str] = None


class IcpAgentProfile(IcpAgentInput):
    id: str
    workspace_id: str = "default"
    created_at: str
    updated_at: str
    reinforcement_count: int = 0


class AgentFeedbackInput(BaseModel):
    signal: Literal["positive", "negative", "correction"]
    note: str


class SimulationStartRequest(BaseModel):
    persona: Optional[SimulationPersona] = None
    agent_id: Optional[str] = None


class SimulationTurnRequest(BaseModel):
    question: str


class BrowserSessionStartRequest(BaseModel):
    target_url: str = "about:blank"
    task: str = "Fill a generic operational form using workspace memory."
    workspace_id: str = "default"
    room_name: Optional[str] = None
    agent_id: Optional[str] = None
    survey_goal: Optional[str] = None


class SurveyAutomationStartRequest(BaseModel):
    target_url: str = "about:blank"
    survey_goal: str = ""
    workspace_id: str = "default"
    agent_id: str


class IntentState(BaseModel):
    phase: Literal["rapport", "problem_exploration", "solution_validation", "pricing", "closing"]
    confidence: float
    intent_signal: str
    recommended_questions: list[str]
    momentum: Literal["opening", "deepening", "drifting", "closing"]


class BiasEvent(BaseModel):
    severity: Literal["low", "medium", "high"]
    bias_type: Literal[
        "confirmation",
        "leading",
        "anchoring",
        "assumption",
        "social_desirability",
        "false_dichotomy",
        "double_barreled",
        "sycophantic",
    ]
    flagged_text: str
    context_reason: str
    alternative_phrasings: list[str]
    confidence: float
    source: Optional[str] = "heuristic"


class QuoteEvent(BaseModel):
    text: str
    speaker: str
    signal_type: Literal["pain", "workaround", "willingness_to_pay", "objection", "validation"]
    confidence: float


class TalkTimeState(BaseModel):
    founder_ratio: float
    user_ratio: float
    alert: Optional[str] = None


class TopicDriftState(BaseModel):
    drifting: bool
    current_topic: Optional[str] = None
    redirect_question: Optional[str] = None


class LiveIntelligenceState(BaseModel):
    intent: IntentState
    bias_events: list[BiasEvent]
    bias_pressure_score: float
    quality_score: float
    talk_time: TalkTimeState
    topic_drift: TopicDriftState
    quotes: list[QuoteEvent]
    analyzed_segment_count: int
    generated_at: str
    degraded: Optional[list[str]] = None


# ── Helpers ──────────────────────────────────────────────────────────────────

def _use_supabase() -> bool:
    return supabase is not None


def _openai_complete(prompt: str, max_tokens: int = 1200, json_mode: bool = False) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    payload = {
        "model": OPENAI_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=45) as client:
        response = client.post(
            f"{OPENAI_API_BASE.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"].strip()


BIAS_PATTERNS = {
    "leading": [
        re.compile(r"\b(?:don't you think|wouldn't you agree|isn't it true|obviously|clearly)\b", re.I),
        re.compile(r"\b(?:how much better|how useful|how valuable) (?:would|is)\b", re.I),
    ],
    "assumption": [
        re.compile(r"\bwhen you (?:use|switch|buy|adopt|start using)\b", re.I),
        re.compile(r"\bwhat (?:will|would) you do (?:after|once) you\b", re.I),
    ],
    "double_barreled": [
        re.compile(r"\b(?:and|or)\b.*\?", re.I),
    ],
    "anchoring": [
        re.compile(r"\b\$\s?\d+|\b\d+\s?(?:dollars|bucks|per month|/mo|%)\b", re.I),
        re.compile(r"\b(?:cheap|expensive|reasonable price|only costs)\b", re.I),
    ],
    "confirmation": [
        re.compile(r"\b(?:does that confirm|so you would|so this solves|you'd buy|you would pay)\b", re.I),
        re.compile(r"\b(?:right\?|correct\?|is that fair\?)", re.I),
    ],
    "social_desirability": [
        re.compile(r"\b(?:wouldn't a good|responsible|smart|successful) (?:founder|team|person|user)\b", re.I),
        re.compile(r"\b(?:most people|everyone|best teams) (?:would|do|care)\b", re.I),
    ],
    "sycophantic": [
        re.compile(r"\b(?:that's great|exactly|perfect|love that).*\?", re.I),
    ],
    "false_dichotomy": [
        re.compile(r"\b(?:would you rather|is it more|which is better).*\b(?:or)\b", re.I),
        re.compile(r"\b(?:only two options|either .* or)\b", re.I),
    ],
}

BIAS_CORPUS = {
    "leading": [
        "Wouldn't this feature save you a lot of time?",
        "Don't you think this is much easier than your current workflow?",
    ],
    "confirmation": [
        "So this validates that you need our product, right?",
        "That means you would definitely use this, correct?",
    ],
    "anchoring": [
        "Would you pay $99 per month for this?",
        "If it only cost twenty dollars, would you buy it?",
    ],
    "assumption": [
        "When you switch to our platform, who will approve it?",
        "What will you do once you start using this?",
    ],
    "social_desirability": [
        "Wouldn't a responsible manager want better reporting?",
        "Most successful teams track this, don't they?",
    ],
    "false_dichotomy": [
        "Would you rather have speed or quality?",
        "Is price or security more important?",
    ],
}

STOPWORDS = {
    "about", "after", "again", "also", "because", "before", "being", "could", "their",
    "there", "these", "thing", "think", "those", "through", "using", "would", "what",
    "when", "where", "which", "while", "your", "youre", "they", "them", "that", "this",
    "with", "have", "from", "just", "like", "really", "into", "were", "been",
}

def _clamp(value: float, minimum: float = 0, maximum: float = 1) -> float:
    return max(minimum, min(maximum, value))


def _segment_text(seg: dict) -> str:
    return str(seg.get("text", "")).strip()


def _is_question(text: str) -> bool:
    lowered = text.lower().strip()
    starters = ("what", "why", "how", "when", "where", "who", "which", "do ", "does ", "did ", "can ", "could ", "would ", "will ", "is ", "are ")
    return "?" in text or lowered.startswith(starters)


def _parse_json_object(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    start = raw.find("{")
    end = raw.rfind("}")
    if start >= 0 and end > start:
        raw = raw[start:end + 1]
    return json.loads(raw)


def _fallback_intent(segments: list[dict]) -> IntentState:
    text = " ".join(_segment_text(s).lower() for s in segments[-5:])
    phase: Literal["rapport", "problem_exploration", "solution_validation", "pricing", "closing"] = "rapport"
    momentum: Literal["opening", "deepening", "drifting", "closing"] = "opening"
    signal = "Conversation is still establishing context."

    if any(word in text for word in ["price", "cost", "budget", "pay", "pricing"]):
        phase, momentum, signal = "pricing", "deepening", "Pricing or willingness-to-pay is now active."
    elif any(word in text for word in ["solution", "feature", "prototype", "product", "would you use"]):
        phase, momentum, signal = "solution_validation", "deepening", "Conversation is validating a possible solution."
    elif any(word in text for word in ["problem", "pain", "hard", "frustrating", "workflow", "workaround"]):
        phase, momentum, signal = "problem_exploration", "deepening", "The interview is exploring pain points and current workflow."
    elif any(word in text for word in ["wrap", "next steps", "anything else", "thank"]):
        phase, momentum, signal = "closing", "closing", "The conversation is moving toward close."

    return IntentState(
        phase=phase,
        confidence=0.45 if segments else 0.2,
        intent_signal=signal,
        recommended_questions=[
            "Can you walk me through the last time that happened?",
            "What made that moment difficult?",
            "What did you try before settling on that workaround?",
        ][:2],
        momentum=momentum,
    )


def _heuristic_bias_events(segments: list[dict]) -> list[BiasEvent]:
    events: list[BiasEvent] = []
    for seg in segments:
        text = _segment_text(seg)
        if not text or not _is_question(text):
            continue
        for bias_type, patterns in BIAS_PATTERNS.items():
            if not any(pattern.search(text) for pattern in patterns):
                continue
            confidence = 0.72
            severity: Literal["low", "medium", "high"] = "medium"
            if bias_type in {"leading", "confirmation", "anchoring"}:
                confidence = 0.82
            if bias_type == "double_barreled" and len(re.findall(r"\?", text)) < 2 and not re.search(r"\b(and|or)\b.+\b(and|or)\b", text, re.I):
                continue
            if confidence >= 0.8:
                severity = "high"
            events.append(BiasEvent(
                severity=severity,
                bias_type=bias_type,  # type: ignore[arg-type]
                flagged_text=text,
                context_reason=f"Matched a {bias_type.replace('_', ' ')} question pattern.",
                alternative_phrasings=[
                    "What happened the last time you ran into this?",
                    "How do you think about this problem today?",
                    "What options have you considered so far?",
                ],
                confidence=confidence,
                source="heuristic",
            ))
            break
    return events


def _talk_time(segments: list[dict]) -> TalkTimeState:
    totals = {"founder": 0, "user": 0}
    for seg in segments:
        speaker = str(seg.get("speaker", "")).lower()
        words = len(re.findall(r"\w+", _segment_text(seg)))
        if speaker in {"founder", "user"}:
            totals[speaker] += words
        elif speaker == "agent":
            continue
        else:
            totals["founder"] += words
    total = max(1, totals["founder"] + totals["user"])
    founder_ratio = round(totals["founder"] / total, 2)
    user_ratio = round(totals["user"] / total, 2)
    alert = "Founder is dominating talk time in the recent transcript." if founder_ratio > 0.6 and total > 40 else None
    return TalkTimeState(founder_ratio=founder_ratio, user_ratio=user_ratio, alert=alert)


def _quality_score(segments: list[dict], bias_events: list[BiasEvent]) -> float:
    questions = [_segment_text(s) for s in segments if _is_question(_segment_text(s))]
    if not questions:
        return 50
    openers = sum(1 for q in questions if q.lower().strip().startswith(("what", "how", "why", "walk me through", "tell me about")))
    followups = sum(1 for q in questions if re.search(r"\b(last time|example|specifically|what happened|why)\b", q, re.I))
    score = 45 + (openers / len(questions)) * 30 + (followups / len(questions)) * 20 - min(25, len(bias_events) * 6)
    return round(_clamp(score, 0, 100), 1)


def _bias_pressure(events: list[BiasEvent], segments: list[dict]) -> float:
    if not segments:
        return 0
    severity_points = {"low": 8, "medium": 15, "high": 25}
    score = sum(severity_points[e.severity] for e in events)
    repeated = max((sum(1 for e in events if e.bias_type == bias_type) for bias_type in BIAS_PATTERNS), default=0)
    if repeated >= 3:
        score += 15
    return round(_clamp(score, 0, 100), 1)


def _topic_drift(segments: list[dict]) -> TopicDriftState:
    words: list[str] = []
    for seg in segments[-8:]:
        words.extend(w.lower() for w in re.findall(r"[a-zA-Z]{4,}", _segment_text(seg)) if w.lower() not in STOPWORDS)
    if not words:
        return TopicDriftState(drifting=False)
    counts = {word: words.count(word) for word in set(words)}
    topic = max(counts, key=counts.get)
    early_words = set(
        w.lower()
        for seg in segments[:5]
        for w in re.findall(r"[a-zA-Z]{4,}", _segment_text(seg))
        if w.lower() not in STOPWORDS
    )
    recent_words = set(words[-30:])
    overlap = len(early_words & recent_words)
    drifting = len(segments) >= 8 and overlap <= 1 and len(recent_words) >= 8
    return TopicDriftState(
        drifting=drifting,
        current_topic=topic,
        redirect_question=f"Can we connect this back to your original workflow around {topic}?" if drifting else None,
    )


def _heuristic_quotes(segments: list[dict]) -> list[QuoteEvent]:
    quote_patterns = [
        ("pain", re.compile(r"\b(?:pain|frustrat|hard|annoying|waste|struggle|blocked|problem)\b", re.I)),
        ("workaround", re.compile(r"\b(?:workaround|spreadsheet|manual|hack|we just|currently use)\b", re.I)),
        ("willingness_to_pay", re.compile(r"\b(?:pay|budget|cost|price|worth|purchase)\b", re.I)),
        ("objection", re.compile(r"\b(?:concern|worried|but|however|not sure|risk)\b", re.I)),
        ("validation", re.compile(r"\b(?:definitely|absolutely|need|valuable|would use)\b", re.I)),
    ]
    quotes: list[QuoteEvent] = []
    for seg in segments[-12:]:
        text = _segment_text(seg)
        if len(text.split()) < 5:
            continue
        for signal_type, pattern in quote_patterns:
            if pattern.search(text):
                quotes.append(QuoteEvent(
                    text=text[:240],
                    speaker=str(seg.get("speaker", "unknown")),
                    signal_type=signal_type,  # type: ignore[arg-type]
                    confidence=0.68,
                ))
                break
        if len(quotes) >= 4:
            break
    return quotes


def _load_embedding_model():
    global _embedding_model
    if _embedding_model is not None:
        return _embedding_model
    from sentence_transformers import SentenceTransformer
    _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def _cosine(a, b) -> float:
    numerator = sum(float(x) * float(y) for x, y in zip(a, b))
    left = math.sqrt(sum(float(x) * float(x) for x in a))
    right = math.sqrt(sum(float(y) * float(y) for y in b))
    if left == 0 or right == 0:
        return 0
    return numerator / (left * right)


def _embedding_bias_events(segments: list[dict], degraded: list[str]) -> list[BiasEvent]:
    global _biased_corpus_embeddings
    questions = [_segment_text(s) for s in segments[-8:] if _is_question(_segment_text(s))]
    if not questions:
        return []
    try:
        model = _load_embedding_model()
        if _biased_corpus_embeddings is None:
            _biased_corpus_embeddings = {
                bias_type: model.encode(examples).tolist()
                for bias_type, examples in BIAS_CORPUS.items()
            }
        question_embeddings = model.encode(questions).tolist()
    except Exception as exc:
        logger.warning("Embedding analysis degraded: %s", exc)
        degraded.append("embedding_model_unavailable")
        return []

    events: list[BiasEvent] = []
    for question, embedding in zip(questions, question_embeddings):
        best_type = None
        best_score = 0.0
        for bias_type, corpus_vectors in _biased_corpus_embeddings.items():
            for corpus_vector in corpus_vectors:
                score = _cosine(embedding, corpus_vector)
                if score > best_score:
                    best_score = score
                    best_type = bias_type
        if best_type and best_score > 0.72:
            events.append(BiasEvent(
                severity="medium" if best_score < 0.84 else "high",
                bias_type=best_type,  # type: ignore[arg-type]
                flagged_text=question,
                context_reason=f"Similar to known {best_type.replace('_', ' ')} interview-question patterns.",
                alternative_phrasings=[
                    "What are you doing today when this comes up?",
                    "Can you describe the last real example?",
                    "What tradeoffs mattered most in that situation?",
                ],
                confidence=round(float(best_score), 2),
                source="embedding",
            ))
    return events


def _dedupe_bias_events(events: list[BiasEvent]) -> list[BiasEvent]:
    deduped: list[BiasEvent] = []
    seen: set[tuple[str, str]] = set()
    for event in sorted(events, key=lambda e: {"high": 0, "medium": 1, "low": 2}[e.severity]):
        key = (event.bias_type, event.flagged_text.lower()[:80])
        if key in seen:
            continue
        seen.add(key)
        deduped.append(event)
    return deduped[:8]


def _merge_ai_state(base: LiveIntelligenceState, payload: dict) -> LiveIntelligenceState:
    if isinstance(payload.get("intent"), dict):
        try:
            base.intent = IntentState(**payload["intent"])
        except Exception:
            pass
    if isinstance(payload.get("bias_events"), list):
        ai_events = []
        for item in payload["bias_events"]:
            try:
                item.setdefault("source", "openai")
                ai_events.append(BiasEvent(**item))
            except Exception:
                continue
        base.bias_events = _dedupe_bias_events(base.bias_events + ai_events)
    if isinstance(payload.get("topic_drift"), dict):
        try:
            base.topic_drift = TopicDriftState(**payload["topic_drift"])
        except Exception:
            pass
    if isinstance(payload.get("quotes"), list):
        quotes = []
        for item in payload["quotes"]:
            try:
                quotes.append(QuoteEvent(**item))
            except Exception:
                continue
        if quotes:
            base.quotes = quotes[:5]
    return base


def _base_intelligence_state(segments: list[dict], degraded: Optional[list[str]] = None) -> LiveIntelligenceState:
    events = _heuristic_bias_events(segments)
    return LiveIntelligenceState(
        intent=_fallback_intent(segments),
        bias_events=_dedupe_bias_events(events),
        bias_pressure_score=_bias_pressure(events, segments),
        quality_score=_quality_score(segments, events),
        talk_time=_talk_time(segments),
        topic_drift=_topic_drift(segments),
        quotes=_heuristic_quotes(segments),
        analyzed_segment_count=len(segments),
        generated_at=datetime.now().isoformat(),
        degraded=degraded or [],
    )


def _context_lines(context: Optional[dict]) -> str:
    if not context:
        return "No interview setup context was provided."
    labels = {
        "objective": "Objective",
        "target_customer": "Target customer",
        "hypothesis": "Hypothesis",
        "success_criteria": "Success criteria",
        "avoid_topics": "Avoid topics",
        "notes": "Notes",
    }
    lines = [
        f"{label}: {str(context.get(key, '')).strip()}"
        for key, label in labels.items()
        if str(context.get(key, "")).strip()
    ]
    return "\n".join(lines) if lines else "No interview setup context was provided."


def _fallback_summary_report(segments: list[dict], context: Optional[dict] = None, error: Optional[str] = None) -> dict:
    texts = [_segment_text(seg) for seg in segments if _segment_text(seg)]
    questions = [text for text in texts if _is_question(text)]
    quotes = _heuristic_quotes(segments)
    bias_events = _heuristic_bias_events(segments)
    intelligence = _base_intelligence_state(segments)
    hypothesis = str((context or {}).get("hypothesis", "")).strip()
    objective = str((context or {}).get("objective", "")).strip()

    findings = []
    if objective:
        findings.append(f"Interview objective: {objective}")
    if quotes:
        findings.extend(f"{quote.signal_type.replace('_', ' ').title()}: {quote.text}" for quote in quotes[:3])
    if not findings and texts:
        findings.append(texts[-1][:220])
    if len(texts) < 3:
        findings.append("Transcript is still short; collect more customer detail before treating this as a strong signal.")

    validations = [{
        "hypothesis": hypothesis or "The interview contains enough evidence to validate the founder's core assumption.",
        "status": "unclear",
        "evidence": "The current transcript is limited, so the evidence is directional rather than conclusive.",
    }]
    if any(re.search(r"\b(definitely|need|would use|valuable|pay|budget|purchase)\b", text, re.I) for text in texts):
        validations[0] = {
            "hypothesis": "The problem or proposed solution has meaningful customer pull.",
            "status": "validated",
            "evidence": "The transcript includes validation or willingness-to-pay language.",
        }
    elif any(re.search(r"\b(not sure|concern|worried|risk|but|however)\b", text, re.I) for text in texts):
        validations[0] = {
            "hypothesis": "The customer is ready to adopt the proposed solution.",
            "status": "unclear",
            "evidence": "The transcript includes objections or hesitation that need follow-up.",
        }

    report = {
        "findings": findings[:4],
        "validations": validations,
        "bias_flags": [
            {
                "question": event.flagged_text,
                "issue": event.bias_type.replace("_", "-"),
                "suggestion": event.alternative_phrasings[0] if event.alternative_phrasings else "Ask for a recent concrete example.",
            }
            for event in bias_events[:4]
        ],
        "next_steps": [
            "Ask for the last real example and capture the exact workflow.",
            "Probe the current workaround, cost, and who else is involved.",
            "Run another interview before making a product decision." if len(segments) < 6 else "Compare these signals against other recent interviews.",
        ],
        "scores": {
            "bias_score": max(0, round(100 - intelligence.bias_pressure_score)),
            "question_quality": round(intelligence.quality_score),
            "insight_density": min(100, max(25, len(quotes) * 18 + len(texts) * 4)),
            "validation_strength": 35 if validations[0]["status"] == "unclear" else 70,
        },
    }
    if error:
        report["error"] = error
    return report


def _fallback_meeting_title(segments: list[dict], context: Optional[dict] = None) -> str:
    context = context or {}
    for key in ("target_customer", "objective", "hypothesis"):
        value = str(context.get(key, "")).strip()
        if value:
            return value[:80]
    for seg in segments:
        text = _segment_text(seg)
        if text:
            return text[:80]
    return "Customer Interview"


def _generate_meeting_title(segments: list[dict], context: Optional[dict] = None) -> str:
    fallback = _fallback_meeting_title(segments, context)
    if not OPENAI_API_KEY or not segments:
        return fallback
    transcript_excerpt = "\n".join(
        f"[{s.get('speaker', 'unknown').upper()}]: {_segment_text(s)}" for s in segments[:10]
    )[:3200]
    prompt = f"""Create a concise title for this customer discovery interview.

Rules:
- 4 to 9 words.
- Use the actual topic or customer problem.
- Do not include quotation marks.
- Do not use generic titles like "Customer Interview".

Interview setup:
{_context_lines(context)}

Transcript excerpt:
{transcript_excerpt}

Return only the title."""
    try:
        title = _openai_complete(prompt, max_tokens=60).strip().strip('"').strip("'")
        title = re.sub(r"\s+", " ", title)
        return title[:90] or fallback
    except Exception as exc:
        logger.warning("Meeting title generation degraded: %s", exc)
        return fallback


def _agent_to_persona(agent: dict) -> dict:
    return {
        "id": agent["id"],
        "name": agent["name"],
        "domains": [part.strip() for part in str(agent.get("market", "")).split(",") if part.strip()],
        "profile": (
            f"Target customer: {agent.get('target_customer', '')}\n"
            f"Market: {agent.get('market', '')}\n"
            f"Known pains: {agent.get('pains', '')}\n"
            f"Buying triggers: {agent.get('buying_triggers', '')}\n"
            f"Objections: {agent.get('objections', '')}"
        ),
        "role": agent.get("target_customer"),
        "companyContext": agent.get("market"),
        "buyingCriteria": [part.strip() for part in str(agent.get("buying_triggers", "")).split(",") if part.strip()],
        "skepticism": agent.get("objections"),
        "responseStyle": "Concise, specific, realistic, and grounded in the configured ICP.",
    }


def _agent_from_meeting(room_name: str, segments: list[dict], report: dict, title: str, workspace_id: str = "default") -> Optional[dict]:
    context = _meeting_contexts.get(room_name, {})
    customer_name = str(context.get("target_customer", "")).strip()
    if not customer_name:
        return None

    findings = [item for item in (report or {}).get("findings", []) if isinstance(item, str)]
    validations = [
        item for item in (report or {}).get("validations", [])
        if isinstance(item, dict)
    ]
    next_steps = [item for item in (report or {}).get("next_steps", []) if isinstance(item, str)]
    objections = [
        item.get("evidence", "")
        for item in validations
        if str(item.get("status", "")).lower() in {"unclear", "invalidated"}
    ]
    now = datetime.now().isoformat()
    agent_id = f"customer_{_slug(customer_name)}"
    existing = _icp_agents.get(agent_id, {})
    existing_metadata = existing.get("metadata", {}) if isinstance(existing.get("metadata"), dict) else {}
    source_rooms = list(dict.fromkeys([*existing_metadata.get("source_rooms", []), room_name]))
    agent = {
        **existing,
        "id": agent_id,
        "workspace_id": workspace_id,
        "name": customer_name,
        "target_customer": customer_name,
        "market": str(context.get("objective") or title or "").strip(),
        "pains": "; ".join(findings[:4]),
        "buying_triggers": "; ".join(
            str(item.get("hypothesis") or item.get("evidence") or "")
            for item in validations[:4]
            if item.get("hypothesis") or item.get("evidence")
        ),
        "objections": "; ".join(item for item in objections[:3] if item),
        "voice_id": existing.get("voice_id"),
        "reinforcement_count": int(existing.get("reinforcement_count", 0) or 0),
        "metadata": {
            **existing_metadata,
            "source": "real_meetings",
            "source_rooms": source_rooms,
            "latest_room_name": room_name,
            "latest_title": title,
            "segment_count": len(segments),
        },
        "created_at": existing.get("created_at") or now,
        "updated_at": now,
    }
    _icp_agents[agent_id] = agent
    _upsert_entity("customer", customer_name, workspace_id, source="real_meetings", agent_id=agent_id, room_name=room_name)
    if _use_supabase():
        try:
            supabase.table("icp_agents").upsert(agent).execute()
        except Exception as exc:
            logger.warning("Real customer agent upsert degraded: %s", exc)
    return agent


def _generate_simulation_answer(persona: dict, question: str, segments: list[dict]) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is required for ICP simulation responses")

    recent_context = "\n".join(
        f"[{s.get('speaker', 'unknown').upper()}]: {_segment_text(s)}" for s in segments[-8:]
    )
    prompt = f"""You are roleplaying a realistic customer discovery interview participant.

Persona:
- Name: {persona["name"]}
- Domains: {", ".join(persona["domains"])}
- Role: {persona.get("role") or "Not specified"}
- Context: {persona.get("companyContext") or "Not specified"}
- Buying criteria: {", ".join(persona.get("buyingCriteria") or []) or "Not specified"}
- Skepticism: {persona.get("skepticism") or "Not specified"}
- Response style: {persona.get("responseStyle") or "Natural, realistic, and specific"}
- Background: {persona["profile"]}

Rules:
- Answer as the participant, not as an assistant.
- Be concise: 2-4 sentences.
- Stay tightly in this persona. Do not answer like a generic software buyer unless the persona is actually a software buyer.
- Be specific about real workflows, tradeoffs, objections, and buying criteria.
- Be occasionally skeptical when the founder's question assumes too much.
- If the question is broad, answer through this persona's role, domain, and lived workflow.
- Do not mention that this is a simulation.

Recent conversation:
{recent_context}

Founder question:
{question}

    Participant answer:"""
    try:
        answer = _openai_complete(prompt, max_tokens=420)
        if not answer:
            raise RuntimeError("OpenAI returned an empty ICP simulation answer")
        return answer
    except Exception as exc:
        logger.warning("Simulation answer generation degraded: %s", exc)
        raise


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")[:80] or "unknown"


def _entity_id(entity_type: str, name: str) -> str:
    return f"{entity_type}:{_slug(name)}"


def _upsert_entity(entity_type: str, name: str, workspace_id: str = "default", **metadata) -> dict:
    clean_name = name.strip() or entity_type.title()
    entity_id = _entity_id(entity_type, clean_name)
    existing = _entities.get(entity_id, {})
    entity = {
        **existing,
        "id": entity_id,
        "type": entity_type,
        "name": clean_name,
        "workspace_id": workspace_id,
        "metadata": {**existing.get("metadata", {}), **metadata},
        "updated_at": datetime.now().isoformat(),
    }
    _entities[entity_id] = entity
    return entity


def _add_relationship(source: str, target: str, rel_type: str, workspace_id: str = "default", room_name: Optional[str] = None, confidence: float = 0.72) -> dict:
    relationship_id = f"{source}->{rel_type}->{target}"
    relationship = {
        "id": relationship_id,
        "source": source,
        "target": target,
        "type": rel_type,
        "workspace_id": workspace_id,
        "room_name": room_name,
        "confidence": confidence,
        "updated_at": datetime.now().isoformat(),
    }
    for index, existing in enumerate(_relationships):
        if existing["id"] == relationship_id:
            _relationships[index] = relationship
            return relationship
    _relationships.append(relationship)
    return relationship


def _memory_vector(text: str, dimensions: int = 384) -> list[float]:
    vector = [0.0] * dimensions
    tokens = re.findall(r"[a-zA-Z0-9]{2,}", text.lower())
    for token in tokens:
        bucket = sum(ord(char) for char in token) % dimensions
        vector[bucket] += 1.0
    magnitude = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / magnitude for value in vector]


def _pinecone_upsert(chunks: list[dict], workspace_id: str) -> bool:
    api_key = os.getenv("PINECONE_API_KEY", "")
    index_name = os.getenv("PINECONE_INDEX", "")
    if not api_key or not index_name:
        return False
    try:
        from pinecone import Pinecone
        pc = Pinecone(api_key=api_key)
        index = pc.Index(index_name)
        namespace = f"{os.getenv('PINECONE_NAMESPACE_PREFIX', 'workspace')}/{workspace_id}"
        vectors = [
            {
                "id": chunk["id"],
                "values": _memory_vector(chunk["text"]),
                "metadata": {
                    "text": chunk["text"][:1000],
                    "source": chunk["source"],
                    "room_name": chunk.get("room_name", ""),
                    "speaker": chunk.get("speaker", ""),
                    "topic": chunk.get("topic", ""),
                    "confidence": chunk.get("confidence", 0.0),
                },
            }
            for chunk in chunks
        ]
        if vectors:
            index.upsert(vectors=vectors, namespace=namespace)
        return True
    except Exception as exc:
        logger.warning("Pinecone memory upsert degraded: %s", exc)
        return False


def _pinecone_namespace(workspace_id: str) -> str:
    return f"{os.getenv('PINECONE_NAMESPACE_PREFIX', 'workspace')}/{workspace_id}"


def _pinecone_index():
    api_key = os.getenv("PINECONE_API_KEY", "")
    index_name = os.getenv("PINECONE_INDEX", "")
    if not api_key or not index_name:
        return None
    from pinecone import Pinecone
    return Pinecone(api_key=api_key).Index(index_name)


def _pinecone_fetch_memory_chunks(workspace_id: str, limit: int = 120) -> list[dict]:
    try:
        index = _pinecone_index()
        if index is None:
            return []
        namespace = _pinecone_namespace(workspace_id)
        ids: list[str] = []
        if hasattr(index, "list"):
            for page in index.list(namespace=namespace):
                ids.extend(list(page))
                if len(ids) >= limit:
                    break
        elif hasattr(index, "list_paginated"):
            page = index.list_paginated(namespace=namespace, limit=limit)
            ids.extend(list(page.get("vectors", [])))
        if not ids:
            return []
        fetched = index.fetch(ids=ids[:limit], namespace=namespace)
        vectors = getattr(fetched, "vectors", None) or fetched.get("vectors", {})
        chunks = []
        for vector_id, vector in vectors.items():
            metadata = getattr(vector, "metadata", None) or vector.get("metadata", {})
            text = str(metadata.get("text", "")).strip()
            if not text:
                continue
            chunks.append({
                "id": vector_id,
                "workspace_id": workspace_id,
                "room_name": metadata.get("room_name", ""),
                "source": metadata.get("source", "pinecone"),
                "speaker": metadata.get("speaker", "unknown"),
                "text": text,
                "topic": metadata.get("topic", "memory"),
                "entity_ids": [],
                "timestamp_ms": None,
                "confidence": float(metadata.get("confidence", 0.72) or 0.72),
                "created_at": metadata.get("created_at", datetime.now().isoformat()),
            })
        return chunks
    except Exception as exc:
        logger.warning("Pinecone graph fetch degraded: %s", exc)
        return []


def _similarity_edges_for_chunks(chunks: list[dict], workspace_id: str, max_edges: int = 80) -> list[dict]:
    vectors = {chunk["id"]: _memory_vector(chunk.get("text", "")) for chunk in chunks}
    edges: list[dict] = []
    for left_index, left in enumerate(chunks):
        for right in chunks[left_index + 1:]:
            score = _cosine(vectors[left["id"]], vectors[right["id"]])
            if score < 0.28:
                continue
            source = f"memory:{left['id']}"
            target = f"memory:{right['id']}"
            edges.append({
                "id": f"{source}->similar_to->{target}",
                "source": source,
                "target": target,
                "type": "similar_to",
                "workspace_id": workspace_id,
                "room_name": left.get("room_name") or right.get("room_name"),
                "confidence": round(score, 3),
                "updated_at": datetime.now().isoformat(),
            })
    return sorted(edges, key=lambda edge: edge["confidence"], reverse=True)[:max_edges]


def _extract_memory(room_name: str, segments: list[dict], report: Optional[dict] = None, workspace_id: str = "default") -> dict:
    context = _meeting_contexts.get(room_name, {})
    built_at = datetime.now().isoformat()
    call = _upsert_entity("call", room_name, workspace_id, room_name=room_name)
    customer_name = context.get("target_customer") or (_simulation_sessions.get(room_name, {}).get("persona", {}) or {}).get("name") or room_name
    customer = _upsert_entity("customer", customer_name, workspace_id, source_room=room_name)
    _add_relationship(customer["id"], call["id"], "participated_in", workspace_id, room_name)

    detected_entities: list[dict] = [call, customer]
    chunks: list[dict] = []
    patterns = [
        ("requirement", r"\b(SOC2|SOC 2|SSO|SAML|GDPR|HIPAA|CAIQ|SIG)\b", "requested"),
        ("integration", r"\b(Salesforce|HubSpot|Pipedrive|Okta|Slack|Google Workspace|AWS|Azure|GCP)\b", "uses"),
        ("workflow", r"\b(onboarding|procurement|security review|vendor review|customer discovery|handoff|approval)\b", "has_workflow"),
        ("pain_point", r"\b(frustrating|slow|blocked|waste|manual|spreadsheet|pain|hard|annoying|bottleneck)\b", "complained_about"),
    ]

    for index, seg in enumerate(segments):
        text = _segment_text(seg)
        if not text:
            continue
        topic = "general"
        chunk_entities = [call["id"], customer["id"]]
        for entity_type, pattern, rel_type in patterns:
            match = re.search(pattern, text, re.I)
            if not match:
                continue
            name = match.group(1)
            if entity_type == "pain_point":
                name = "Manual workflow pain" if re.search(r"\b(manual|spreadsheet|waste)\b", text, re.I) else "Workflow friction"
            entity = _upsert_entity(entity_type, name, workspace_id, source_room=room_name)
            _add_relationship(customer["id"], entity["id"], rel_type, workspace_id, room_name)
            _add_relationship(call["id"], entity["id"], "mentioned", workspace_id, room_name)
            detected_entities.append(entity)
            chunk_entities.append(entity["id"])
            topic = entity_type
        chunk = {
            "id": f"{room_name}:segment:{index}",
            "workspace_id": workspace_id,
            "room_name": room_name,
            "source": "customer_call",
            "speaker": seg.get("speaker", "unknown"),
            "text": text,
            "topic": topic,
            "entity_ids": list(dict.fromkeys(chunk_entities)),
            "timestamp_ms": seg.get("timestamp_ms"),
            "confidence": 0.72,
            "created_at": built_at,
        }
        chunks.append(chunk)

    for index, finding in enumerate((report or {}).get("findings", [])[:8]):
        if not isinstance(finding, str) or not finding.strip():
            continue
        chunks.append({
            "id": f"{room_name}:finding:{index}",
            "workspace_id": workspace_id,
            "room_name": room_name,
            "source": "summary",
            "speaker": "system",
            "text": finding.strip(),
            "topic": "finding",
            "entity_ids": [call["id"], customer["id"]],
            "timestamp_ms": None,
            "confidence": 0.78,
            "created_at": built_at,
        })

    existing_ids = {chunk["id"] for chunk in chunks}
    _memory_chunks[:] = [chunk for chunk in _memory_chunks if chunk["id"] not in existing_ids] + chunks
    pinecone_used = _pinecone_upsert(chunks, workspace_id)
    return {
        "workspace_id": workspace_id,
        "room_name": room_name,
        "chunks": chunks,
        "entities": list({entity["id"]: entity for entity in detected_entities}.values()),
        "relationships": [rel for rel in _relationships if rel.get("room_name") == room_name],
        "degraded": [] if pinecone_used else ["pinecone_unconfigured_or_unavailable"],
    }


def _search_memory(query: str, workspace_id: str = "default") -> list[dict]:
    query_terms = set(re.findall(r"[a-zA-Z0-9]{3,}", query.lower()))
    results = []
    for chunk in _memory_chunks:
        if chunk.get("workspace_id") != workspace_id:
            continue
        text_terms = set(re.findall(r"[a-zA-Z0-9]{3,}", chunk["text"].lower()))
        overlap = len(query_terms & text_terms)
        if query and overlap == 0 and query.lower() not in chunk["text"].lower():
            continue
        score = min(1.0, 0.25 + overlap * 0.18) if query else chunk.get("confidence", 0.5)
        results.append({**chunk, "score": round(score, 2)})
    return sorted(results, key=lambda item: item["score"], reverse=True)[:12]


def _browser_event(session: dict, event_type: str, message: str, **extra) -> dict:
    event = {
        "id": f"{session['id']}:event:{len(session['events']) + 1}",
        "session_id": session["id"],
        "type": event_type,
        "message": message,
        "created_at": datetime.now().isoformat(),
        **extra,
    }
    session["events"].append(event)
    session["action_log"].append(event)
    return event


def _serialize_browser_session(session: dict) -> dict:
    return {
        "id": session["id"],
        "workspace_id": session["workspace_id"],
        "target_url": session["target_url"],
        "task": session["task"],
        "status": session["status"],
        "current_url": session["current_url"],
        "screenshot_url": session.get("screenshot_url"),
        "dom_snapshot_ref": session.get("dom_snapshot_ref"),
        "requires_approval": session.get("requires_approval", False),
        "action_log": session["action_log"],
        "created_at": session["created_at"],
        "updated_at": session["updated_at"],
        "agent_id": session.get("agent_id"),
        "survey_goal": session.get("survey_goal"),
        "runner": session.get("runner"),
        "degraded": session.get("degraded", []),
        "cloud_session_id": session.get("cloud_session_id"),
        "browser_use_task_id": session.get("browser_use_task_id"),
        "live_url": session.get("live_url"),
        "cloud_status": session.get("cloud_status"),
        "label": session.get("label"),
    }


def _browser_runner_status() -> tuple[str, Optional[str]]:
    if BROWSER_USE_API_KEY:
        return "browser_use_cloud", None
    if importlib.util.find_spec("browser_use"):
        return "browser_use", None
    if importlib.util.find_spec("playwright"):
        return "playwright", "browser_use_unavailable"
    return "staged", "browser_runner_unavailable"


def _browser_use_headers() -> dict:
    return {
        "X-Browser-Use-API-Key": BROWSER_USE_API_KEY,
        "Content-Type": "application/json",
    }


def _browser_use_create_cloud_task(session: dict) -> dict:
    if not BROWSER_USE_API_KEY:
        return {}

    target_url = session.get("target_url") or "about:blank"
    task_prompt = (
        f"Open this survey or questionnaire URL: {target_url}\n\n"
        f"Goal and role:\n{session['task']}\n\n"
        "Act as a customer-research browser agent. Use the customer evidence in the task, fill only fields you can support, "
        "leave uncertain fields blank or note uncertainty, and stop before any final submission. Do not enter credentials, "
        "make purchases, upload files, or submit the form without explicit human approval."
    )
    session_payload = {
        "task": task_prompt,
        "model": BROWSER_USE_MODEL,
        "keepAlive": True,
        "maxCostUsd": 1,
        "enableRecording": False,
        "agentmail": False,
    }
    if BROWSER_USE_BROWSER_PROFILE_ID:
        session_payload["profileId"] = BROWSER_USE_BROWSER_PROFILE_ID

    with httpx.Client(timeout=30) as client:
        session_response = client.post(
            f"{BROWSER_USE_BASE_URL}/sessions",
            headers=_browser_use_headers(),
            json=session_payload,
        )
        session_response.raise_for_status()
        cloud_session = session_response.json()
        cloud_session_id = cloud_session.get("id") or cloud_session.get("sessionId") or cloud_session.get("session_id")
        if not cloud_session_id:
            raise ValueError("Browser Use did not return a session id")

    return {
        "cloud_session_id": cloud_session_id,
        "browser_use_task_id": cloud_session_id,
        "live_url": cloud_session.get("liveUrl") or cloud_session.get("live_url"),
        "cloud_status": cloud_session.get("status") or "running",
    }


def _new_browser_session(req: BrowserSessionStartRequest, label: Optional[str] = None) -> dict:
    session_id = f"browser_{uuid.uuid4().hex[:10]}"
    now = datetime.now().isoformat()
    runner, degraded = _browser_runner_status()
    agent = _icp_agents.get(req.agent_id or "") if req.agent_id else None
    session = {
        "id": session_id,
        "workspace_id": req.workspace_id,
        "target_url": req.target_url,
        "task": req.task,
        "room_name": req.room_name,
        "agent_id": req.agent_id,
        "agent": agent,
        "label": label,
        "survey_goal": req.survey_goal,
        "status": "running",
        "current_url": req.target_url,
        "screenshot_url": None,
        "dom_snapshot_ref": f"{session_id}:dom:initial",
        "requires_approval": False,
        "runner": runner,
        "degraded": [degraded] if degraded else [],
        "cloud_session_id": None,
        "browser_use_task_id": None,
        "live_url": None,
        "cloud_status": None,
        "events": [],
        "action_log": [],
        "created_at": now,
        "updated_at": now,
    }
    _browser_sessions[session_id] = session
    _browser_event(session, "session_started", f"{label or 'Survey agent'} started.", confidence=1.0, degraded=session["degraded"])
    if BROWSER_USE_API_KEY:
        try:
            cloud = _browser_use_create_cloud_task(session)
            session.update(cloud)
            if cloud.get("live_url"):
                session["current_url"] = cloud["live_url"]
            _browser_event(
                session,
                "browser_use_connected",
                "Live browser session is available.",
                confidence=0.92,
                live_url=cloud.get("live_url"),
                cloud_session_id=cloud.get("cloud_session_id"),
            )
        except Exception as exc:
            logger.warning("Browser Use cloud session degraded: %s", exc)
            session["degraded"].append("browser_use_cloud_unavailable")
            _browser_event(
                session,
                "browser_use_degraded",
                "Live browser session could not be created; using local staged execution.",
                confidence=0.45,
                degraded=session["degraded"],
            )
    _browser_event(session, "survey_loaded", "Opened the survey and prepared field mapping.", confidence=0.82, dom_snapshot_ref=session["dom_snapshot_ref"])
    _browser_event(session, "memory_grounded", "Grounded candidate responses in customer memory.", confidence=0.74)
    session["status"] = "waiting_for_approval"
    session["requires_approval"] = True
    session["updated_at"] = datetime.now().isoformat()
    _browser_event(session, "approval_required", "Review generated survey responses before final submission.", confidence=0.66, requires_approval=True)
    return session


def _survey_agent_chat(agent: dict, goal: str, sessions: list[dict]) -> list[dict]:
    langchain_available = importlib.util.find_spec("langchain") is not None
    coordinator = "LangChain coordinator" if langchain_available else "Coordinator"
    customer = agent.get("name", "Customer agent")
    goal_text = goal.strip() or "collect market feedback"
    messages = [
        {"speaker": coordinator, "message": f"Planning a three-agent survey run for {customer}: {goal_text}.", "created_at": datetime.now().isoformat()},
        {"speaker": "Agent 1", "message": "I will map the survey questions to known customer pains and buying triggers.", "created_at": datetime.now().isoformat()},
        {"speaker": "Agent 2", "message": "I will cross-check answers against objections and avoid unsupported claims.", "created_at": datetime.now().isoformat()},
        {"speaker": "Agent 3", "message": "I will prepare final responses and pause before submission for approval.", "created_at": datetime.now().isoformat()},
        {"speaker": coordinator, "message": f"{len(sessions)} browser agents are running in parallel and sharing state through the coordinator.", "created_at": datetime.now().isoformat()},
    ]
    return messages


async def _ensure_meeting(room_name: str) -> str:
    """Return meeting_id, creating the meeting row if needed."""
    if _use_supabase():
        result = supabase.table("meetings").select("id").eq("room_name", room_name).execute()
        if result.data:
            return result.data[0]["id"]
        inserted = supabase.table("meetings").insert({"room_name": room_name, "title": room_name}).execute()
        return inserted.data[0]["id"]
    else:
        if room_name not in _meetings:
            _meetings[room_name] = {"id": room_name, "room_name": room_name, "created_at": datetime.now().isoformat()}
            _transcripts[room_name] = []
        return room_name


# ── Routes ───────────────────────────────────────────────────────────────────

@app.post("/token")
async def create_token(req: TokenRequest):
    lk_url = os.getenv("LIVEKIT_URL", "")
    api_key = os.getenv("LIVEKIT_API_KEY", "")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "")

    room_name = req.room_name or f"room_{uuid.uuid4().hex[:8]}"
    participant_name = req.participant_name or "user"

    token = (
        livekit_api.AccessToken(api_key, api_secret)
        .with_identity(participant_name)
        .with_name(participant_name)
        .with_grants(livekit_api.VideoGrants(room_join=True, room=room_name))
        .to_jwt()
    )

    await _ensure_meeting(room_name)

    return {
        "serverUrl": lk_url,
        "roomName": room_name,
        "participantName": participant_name,
        "participantToken": token,
    }


@app.post("/transcript")
async def store_transcript(seg: TranscriptSegment):
    meeting_id = await _ensure_meeting(seg.room_name)

    record = {
        "meeting_id": meeting_id,
        "speaker": seg.speaker,
        "text": seg.text,
        "timestamp_ms": seg.timestamp_ms or int(datetime.now().timestamp() * 1000),
    }

    if _use_supabase():
        supabase.table("transcripts").insert(record).execute()
    else:
        _transcripts.setdefault(seg.room_name, []).append(record)

    return {"status": "stored"}


@app.post("/meeting-context")
async def save_meeting_context(ctx: MeetingContextRequest):
    room_name = ctx.room_name.strip()
    if not room_name:
        raise HTTPException(status_code=400, detail="room_name is required")
    await _ensure_meeting(room_name)
    payload = ctx.model_dump()
    payload.pop("room_name", None)
    _meeting_contexts[room_name] = payload
    if not _use_supabase() and room_name in _meetings:
        _meetings[room_name].update({"context": payload})
    return {"context": payload}


@app.get("/meeting-context/{room_name}")
async def get_meeting_context(room_name: str):
    if not _use_supabase() and room_name in _meetings and _meetings[room_name].get("context"):
        return {"context": _meetings[room_name]["context"]}
    return {"context": _meeting_contexts.get(room_name)}


@app.get("/transcript/{room_name}")
async def get_transcript(room_name: str):
    if _use_supabase():
        meetings = supabase.table("meetings").select("id").eq("room_name", room_name).execute()
        if not meetings.data:
            return {"segments": []}
        meeting_id = meetings.data[0]["id"]
        result = (
            supabase.table("transcripts")
            .select("*")
            .eq("meeting_id", meeting_id)
            .order("timestamp_ms")
            .execute()
        )
        return {"segments": result.data}
    else:
        return {"segments": _transcripts.get(room_name, [])}


@app.post("/intelligence/{room_name}")
async def analyze_intelligence(room_name: str):
    transcript_data = await get_transcript(room_name)
    segments = transcript_data["segments"]
    context = _meeting_contexts.get(room_name)
    transcript_version = "|".join(
        f"{s.get('timestamp_ms', '')}:{_segment_text(s)[:40]}" for s in segments
    ) + "|" + json.dumps(context or {}, sort_keys=True)

    cached = _intelligence_cache.get(room_name)
    if cached and cached.get("version") == transcript_version:
        return cached["state"]

    degraded: list[str] = []
    state = _base_intelligence_state(segments, degraded)

    if not segments:
        response = state.model_dump()
        _intelligence_cache[room_name] = {"version": transcript_version, "state": response}
        return response

    embedding_events = _embedding_bias_events(segments, degraded)
    state.bias_events = _dedupe_bias_events(state.bias_events + embedding_events)

    if len(segments) >= 3 and OPENAI_API_KEY:
        recent_context = "\n".join(
            f"[{s.get('speaker', 'unknown').upper()}]: {_segment_text(s)}" for s in segments[-12:]
        )
        rolling_intent = "\n".join(
            f"[{s.get('speaker', 'unknown').upper()}]: {_segment_text(s)}" for s in segments[-5:]
        )
        recent_turns = "\n".join(
            f"[{s.get('speaker', 'unknown').upper()}]: {_segment_text(s)}" for s in segments[-3:]
        )
        prompt = f"""Analyze this customer discovery interview in real time.

Return only JSON with this exact shape:
{{
  "intent": {{
    "phase": "rapport|problem_exploration|solution_validation|pricing|closing",
    "confidence": 0.0,
    "intent_signal": "short concrete signal",
    "recommended_questions": ["question 1", "question 2"],
    "momentum": "opening|deepening|drifting|closing"
  }},
  "bias_events": [
    {{
      "severity": "low|medium|high",
      "bias_type": "confirmation|leading|anchoring|assumption|social_desirability|false_dichotomy|double_barreled|sycophantic",
      "flagged_text": "exact biased question",
      "context_reason": "why it is biased in context",
      "alternative_phrasings": ["neutral rewrite 1", "neutral rewrite 2", "neutral rewrite 3"],
      "confidence": 0.0
    }}
  ],
  "topic_drift": {{
    "drifting": false,
    "current_topic": "topic or null",
    "redirect_question": "question or null"
  }},
  "quotes": [
    {{
      "text": "exact high-signal quote",
      "speaker": "speaker",
      "signal_type": "pain|workaround|willingness_to_pay|objection|validation",
      "confidence": 0.0
    }}
  ]
}}

Intent window:
{rolling_intent}

Contextual bias window:
{recent_turns}

Interview setup:
{_context_lines(context)}

        Recent transcript:
{recent_context}"""
        try:
            payload = _parse_json_object(_openai_complete(prompt, max_tokens=1800, json_mode=True))
            state = _merge_ai_state(state, payload)
        except Exception as exc:
            logger.warning("OpenAI intelligence analysis degraded: %s", exc)
            degraded.append("openai_analysis_unavailable")
    elif len(segments) >= 3:
        degraded.append("openai_api_key_missing")

    state.bias_pressure_score = _bias_pressure(state.bias_events, segments)
    state.quality_score = _quality_score(segments, state.bias_events)
    state.degraded = degraded
    response = state.model_dump()
    _intelligence_cache[room_name] = {"version": transcript_version, "state": response}
    return response


@app.get("/icp-agents")
async def list_icp_agents(workspace_id: str = "default"):
    if _use_supabase():
        try:
            result = (
                supabase.table("icp_agents")
                .select("*")
                .eq("workspace_id", workspace_id)
                .order("created_at", desc=True)
                .execute()
            )
            agents = [
                agent for agent in (result.data or [])
                if isinstance(agent.get("metadata"), dict) and agent["metadata"].get("source") == "real_meetings"
            ]
            return {"agents": agents}
        except Exception as exc:
            logger.warning("ICP agent Supabase list degraded: %s", exc)
    agents = [
        agent for agent in _icp_agents.values()
        if agent.get("workspace_id") == workspace_id
        and isinstance(agent.get("metadata"), dict)
        and agent["metadata"].get("source") == "real_meetings"
    ]
    agents.sort(key=lambda item: item.get("created_at", ""), reverse=True)
    return {"agents": agents}


@app.post("/icp-agents")
async def create_icp_agent(req: IcpAgentInput, workspace_id: str = "default"):
    raise HTTPException(
        status_code=405,
        detail="ICP agents are derived from analyzed real meetings. Analyze a meeting with a target customer to create one.",
    )


@app.post("/icp-agents/{agent_id}/feedback")
async def reinforce_icp_agent(agent_id: str, req: AgentFeedbackInput):
    agent = _icp_agents.get(agent_id)
    if not agent and _use_supabase():
        result = supabase.table("icp_agents").select("*").eq("id", agent_id).execute()
        agent = result.data[0] if result.data else None
    if not agent:
        raise HTTPException(status_code=404, detail="ICP agent not found")
    note = req.note.strip()
    if not note:
        raise HTTPException(status_code=400, detail="Feedback note is required")
    agent["reinforcement_count"] = int(agent.get("reinforcement_count", 0)) + 1
    agent["updated_at"] = datetime.now().isoformat()
    if _use_supabase():
        try:
            supabase.table("icp_agents").update({
                "reinforcement_count": agent["reinforcement_count"],
                "updated_at": agent["updated_at"],
            }).eq("id", agent_id).execute()
            supabase.table("agent_feedback").insert({
                "agent_id": agent_id,
                "workspace_id": agent.get("workspace_id", "default"),
                "signal": req.signal,
                "note": note,
            }).execute()
        except Exception as exc:
            logger.warning("ICP agent feedback update degraded: %s", exc)
    _icp_agents[agent_id] = agent

    room_name = f"agent_feedback_{agent_id}"
    await _ensure_meeting(room_name)
    await store_transcript(TranscriptSegment(
        room_name=room_name,
        speaker="founder",
        text=f"Feedback signal: {req.signal}. {note}",
    ))
    memory = _extract_memory(room_name, (await get_transcript(room_name))["segments"], {
        "findings": [note],
    }, agent.get("workspace_id", "default"))
    return {"agent": agent, "memory": memory}


@app.post("/simulation/start")
async def start_simulation(req: SimulationStartRequest):
    agent = None
    if req.agent_id:
        agent = _icp_agents.get(req.agent_id)
        if not agent and _use_supabase():
            result = supabase.table("icp_agents").select("*").eq("id", req.agent_id).execute()
            agent = result.data[0] if result.data else None
        if not agent:
            raise HTTPException(status_code=404, detail="ICP agent not found")
        _icp_agents[agent["id"]] = agent
        persona = _agent_to_persona(agent)
    elif req.persona:
        persona = req.persona.model_dump()
    else:
        raise HTTPException(status_code=400, detail="agent_id is required")
    persona_id = re.sub(r"[^a-zA-Z0-9]+", "_", persona["id"]).strip("_")[:24] or "persona"
    if not persona["name"].strip() or not persona["profile"].strip():
        raise HTTPException(status_code=400, detail="Persona is incomplete")

    room_name = f"sim_{persona_id}_{uuid.uuid4().hex[:8]}"
    meeting_id = await _ensure_meeting(room_name)
    session = {
        "room_name": room_name,
        "meeting_id": meeting_id,
        "is_simulated": True,
        "persona": persona,
        "agent": agent,
        "created_at": datetime.now().isoformat(),
    }
    _simulation_sessions[room_name] = session
    if not _use_supabase():
        _meetings[room_name].update({
            "title": f"Simulation with {persona['name']}",
            "is_simulated": True,
            "persona": persona,
            "agent": agent,
        })

    intelligence = await analyze_intelligence(room_name)
    return {
        "room_name": room_name,
        "agent": agent,
        "persona": persona,
        "segments": [],
        "intelligence": intelligence,
    }


@app.post("/simulation/{room_name}/turn")
async def simulation_turn(room_name: str, req: SimulationTurnRequest):
    session = _simulation_sessions.get(room_name)
    if not session:
        raise HTTPException(status_code=404, detail="Simulation not found")

    question = req.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    await store_transcript(TranscriptSegment(room_name=room_name, speaker="founder", text=question))
    transcript_data = await get_transcript(room_name)
    persona = session["persona"]
    try:
        answer = _generate_simulation_answer(persona, question, transcript_data["segments"])
    except Exception:
        raise HTTPException(status_code=503, detail="ICP simulation response generation is unavailable")
    await store_transcript(TranscriptSegment(room_name=room_name, speaker="icp_agent", text=answer))

    updated = await get_transcript(room_name)
    intelligence = await analyze_intelligence(room_name)
    return {
        "room_name": room_name,
        "segments": updated["segments"],
        "intelligence": intelligence,
        "answer": answer,
    }


@app.post("/summary/{room_name}")
async def generate_summary(room_name: str):
    transcript_data = await get_transcript(room_name)
    segments = transcript_data["segments"]

    if not segments:
        raise HTTPException(status_code=404, detail="No transcript found for this room")
    context = _meeting_contexts.get(room_name)

    transcript_text = "\n".join(
        f"[{s['speaker'].upper()}]: {s['text']}" for s in segments
    )

    prompt = f"""Analyze this customer discovery interview transcript and return a JSON object with this exact structure:
{{
  "findings": ["finding 1", "finding 2", ...],
  "validations": [
    {{"hypothesis": "...", "status": "validated|invalidated|unclear", "evidence": "..."}}
  ],
  "bias_flags": [
    {{"question": "exact question text", "issue": "leading|biased|double-barreled", "suggestion": "better version"}}
  ],
  "next_steps": ["action 1", "action 2", ...],
  "scores": {{
    "bias_score": <0-100, higher = less bias>,
    "question_quality": <0-100>,
    "insight_density": <0-100>,
    "validation_strength": <0-100>
  }}
}}

INTERVIEW SETUP:
{_context_lines(context)}

TRANSCRIPT:
{transcript_text}

    Return only the JSON object, no other text."""

    try:
        raw = _openai_complete(prompt, max_tokens=2048, json_mode=True)
        try:
            report = _parse_json_object(raw)
        except json.JSONDecodeError:
            report = _fallback_summary_report(segments, context, "Could not parse AI summary response.")
            report["raw"] = raw[:1000]
    except Exception as exc:
        logger.warning("Summary generation degraded: %s", exc)
        report = _fallback_summary_report(segments, context, "AI summary unavailable; generated deterministic fallback.")

    meeting_id = await _ensure_meeting(room_name)
    title = _generate_meeting_title(segments, context)

    if _use_supabase():
        supabase.table("meetings").update({"title": title}).eq("id", meeting_id).execute()
        existing = supabase.table("summaries").select("id").eq("meeting_id", meeting_id).execute()
        summary_payload = {
            "report": report,
            "status": "ready",
            "model": OPENAI_MODEL if OPENAI_API_KEY else "deterministic_fallback",
            "generated_by": "api",
            "generated_at": datetime.now().isoformat(),
        }
        if existing.data:
            supabase.table("summaries").update(summary_payload).eq("meeting_id", meeting_id).execute()
        else:
            supabase.table("summaries").insert({"meeting_id": meeting_id, **summary_payload}).execute()
    else:
        _summaries[room_name] = report
        _meetings.setdefault(room_name, {"id": room_name, "room_name": room_name, "created_at": datetime.now().isoformat()})
        _meetings[room_name]["title"] = title

    try:
        _extract_memory(room_name, segments, report)
    except Exception as exc:
        logger.warning("Memory build after summary degraded: %s", exc)
    agent = _agent_from_meeting(room_name, segments, report, title)

    return {"report": report, "title": title, "agent": agent}


@app.get("/summary/{room_name}")
async def get_summary(room_name: str):
    if _use_supabase():
        meetings = supabase.table("meetings").select("id,title").eq("room_name", room_name).execute()
        if not meetings.data:
            return {"report": None, "title": None}
        meeting_id = meetings.data[0]["id"]
        result = supabase.table("summaries").select("report").eq("meeting_id", meeting_id).execute()
        return {"report": result.data[0]["report"] if result.data else None, "title": meetings.data[0].get("title")}
    else:
        return {"report": _summaries.get(room_name), "title": _meetings.get(room_name, {}).get("title")}


@app.post("/memory/build/{room_name}")
async def build_memory(room_name: str, workspace_id: str = "default"):
    transcript_data = await get_transcript(room_name)
    segments = transcript_data["segments"]
    if not segments:
        raise HTTPException(status_code=404, detail="No transcript found for this room")
    summary = await get_summary(room_name)
    report = summary.get("report")
    return _extract_memory(room_name, segments, report, workspace_id)


@app.get("/memory/search")
async def memory_search(query: str = "", workspace_id: str = "default"):
    return {"results": _search_memory(query, workspace_id), "degraded": ["pinecone_search_fallback"]}


@app.get("/memory/timeline")
async def memory_timeline(workspace_id: str = "default"):
    chunks = [chunk for chunk in _memory_chunks if chunk.get("workspace_id") == workspace_id]
    chunks.sort(key=lambda chunk: chunk.get("created_at", ""), reverse=True)
    return {"events": chunks[:50]}


@app.get("/graph/workspace/{workspace_id}")
async def workspace_graph(workspace_id: str):
    chunks_by_id = {
        chunk["id"]: chunk
        for chunk in _memory_chunks
        if chunk.get("workspace_id") == workspace_id
    }
    for chunk in _pinecone_fetch_memory_chunks(workspace_id):
        chunks_by_id.setdefault(chunk["id"], chunk)
    chunks = list(chunks_by_id.values())

    entity_nodes = [
        {
            "id": entity["id"],
            "name": entity["name"],
            "type": entity["type"],
            "metadata": entity.get("metadata", {}),
        }
        for entity in _entities.values()
        if entity.get("workspace_id") == workspace_id
    ]
    memory_nodes = [
        {
            "id": f"memory:{chunk['id']}",
            "name": (chunk.get("topic") or chunk.get("source") or "memory").replace("_", " ").title(),
            "type": "memory",
            "metadata": {
                "text": chunk.get("text", ""),
                "speaker": chunk.get("speaker", "unknown"),
                "room_name": chunk.get("room_name", ""),
                "source": chunk.get("source", "memory"),
                "confidence": chunk.get("confidence", 0.0),
            },
        }
        for chunk in chunks[:160]
    ]
    nodes = entity_nodes + memory_nodes
    node_ids = {node["id"] for node in nodes}
    relationship_edges = [
        {
            "id": rel["id"],
            "source": rel["source"],
            "target": rel["target"],
            "type": rel["type"],
            "confidence": rel.get("confidence", 0.0),
            "room_name": rel.get("room_name"),
        }
        for rel in _relationships
        if rel.get("workspace_id") == workspace_id and rel["source"] in node_ids and rel["target"] in node_ids
    ]
    memory_entity_edges = []
    for chunk in chunks:
        memory_id = f"memory:{chunk['id']}"
        if memory_id not in node_ids:
            continue
        for entity_id in chunk.get("entity_ids", []):
            if entity_id not in node_ids:
                continue
            memory_entity_edges.append({
                "id": f"{memory_id}->mentions->{entity_id}",
                "source": memory_id,
                "target": entity_id,
                "type": "mentions",
                "confidence": chunk.get("confidence", 0.72),
                "room_name": chunk.get("room_name"),
            })
    similarity_edges = [
        {
            "id": edge["id"],
            "source": edge["source"],
            "target": edge["target"],
            "type": edge["type"],
            "confidence": edge.get("confidence", 0.0),
            "room_name": edge.get("room_name"),
        }
        for edge in _similarity_edges_for_chunks(chunks[:160], workspace_id)
        if edge["source"] in node_ids and edge["target"] in node_ids
    ]
    edges = relationship_edges + memory_entity_edges + similarity_edges
    return {"nodes": nodes, "edges": edges}


class BrowserSessionIngestRequest(BaseModel):
    session_id: str
    tester_id: str
    tester_name: str
    target_url: str
    output: Optional[str] = None
    last_step_summary: Optional[str] = None
    step_count: int = 0
    is_task_successful: Optional[bool] = None
    workspace_id: str = "default"


@app.post("/graph/browser-session")
async def ingest_browser_session(req: BrowserSessionIngestRequest):
    """Inject a completed browser-use session into the knowledge graph."""
    from urllib.parse import urlparse
    domain = urlparse(req.target_url).netloc or req.target_url

    # Website node
    website = _upsert_entity("website", domain, req.workspace_id,
                             url=req.target_url)

    # Persona node (the tester)
    persona = _upsert_entity("persona", req.tester_name, req.workspace_id,
                             tester_id=req.tester_id)

    # Browser test node
    test_name = f"Test: {req.tester_name} → {domain}"
    test = _upsert_entity(
        "browser_test", test_name, req.workspace_id,
        session_id=req.session_id,
        step_count=req.step_count,
        is_successful=req.is_task_successful,
        output=req.output or "",
        summary=req.last_step_summary or "",
        target_url=req.target_url,
    )

    # Edges
    _add_relationship(persona["id"], test["id"], "ran_test", req.workspace_id, confidence=1.0)
    _add_relationship(test["id"], website["id"], "tested", req.workspace_id, confidence=1.0)
    if req.is_task_successful:
        _add_relationship(persona["id"], website["id"], "navigated_successfully", req.workspace_id, confidence=0.95)

    # Store output as a memory chunk so it appears in search
    if req.output:
        chunk = {
            "id": f"browser_test:{req.session_id}",
            "workspace_id": req.workspace_id,
            "text": req.output,
            "topic": f"browser_test_{domain}",
            "source": "browser_use",
            "speaker": req.tester_name,
            "room_name": req.session_id,
            "confidence": 0.9,
            "entity_ids": [persona["id"], website["id"], test["id"]],
        }
        _memory_chunks.append(chunk)

    return {
        "ok": True,
        "nodes": [website, persona, test],
        "relationships": 2 + (1 if req.is_task_successful else 0),
    }


@app.get("/entities/{entity_id}")
async def entity_detail(entity_id: str):
    entity = _entities.get(entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    related_relationships = [
        rel for rel in _relationships
        if rel["source"] == entity_id or rel["target"] == entity_id
    ]
    related_memories = [
        chunk for chunk in _memory_chunks
        if entity_id in chunk.get("entity_ids", [])
    ][:20]
    return {"entity": entity, "relationships": related_relationships, "memories": related_memories}


@app.post("/browser/session/start")
async def start_browser_session(req: BrowserSessionStartRequest):
    session = _new_browser_session(req, "Survey agent")
    return {"session": _serialize_browser_session(session)}


@app.post("/browser/survey/start")
async def start_survey_automation(req: SurveyAutomationStartRequest):
    agent = _icp_agents.get(req.agent_id)
    if not agent and _use_supabase():
        result = supabase.table("icp_agents").select("*").eq("id", req.agent_id).execute()
        agent = result.data[0] if result.data else None
    if not agent:
        raise HTTPException(status_code=404, detail="Customer agent not found")
    if not isinstance(agent.get("metadata"), dict) or agent["metadata"].get("source") != "real_meetings":
        raise HTTPException(status_code=400, detail="Survey automation requires a customer agent derived from real meetings")
    _icp_agents[agent["id"]] = agent

    roles = [
        ("Agent 1", "Map survey questions to real customer pains and workflow evidence."),
        ("Agent 2", "Check answers against objections, uncertainty, and unsupported assumptions."),
        ("Agent 3", "Draft final survey responses and hold submission for human approval."),
    ]
    sessions = [
        _new_browser_session(BrowserSessionStartRequest(
            target_url=req.target_url,
            task=f"{role_task} Customer: {agent['name']}. Goal: {req.survey_goal or 'Collect market feedback.'}",
            workspace_id=req.workspace_id,
            agent_id=req.agent_id,
            survey_goal=req.survey_goal,
        ), label)
        for label, role_task in roles
    ]
    chat = _survey_agent_chat(agent, req.survey_goal, sessions)
    return {
        "sessions": [_serialize_browser_session(session) for session in sessions],
        "chat": chat,
        "orchestrator": "langchain" if importlib.util.find_spec("langchain") else "staged",
    }


@app.get("/browser/session/{session_id}")
async def get_browser_session(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    return {"session": _serialize_browser_session(session)}


@app.get("/browser/session/{session_id}/events")
async def get_browser_session_events(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    return {"events": session["events"]}


@app.post("/browser/session/{session_id}/pause")
async def pause_browser_session(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    session["status"] = "paused"
    session["updated_at"] = datetime.now().isoformat()
    _browser_event(session, "paused", "User paused browser automation.", confidence=1.0)
    return {"session": _serialize_browser_session(session)}


@app.post("/browser/session/{session_id}/resume")
async def resume_browser_session(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    session["status"] = "waiting_for_approval" if session.get("requires_approval") else "running"
    session["updated_at"] = datetime.now().isoformat()
    _browser_event(session, "resumed", "User resumed browser automation.", confidence=1.0)
    return {"session": _serialize_browser_session(session)}


@app.post("/browser/session/{session_id}/takeover")
async def takeover_browser_session(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    session["status"] = "paused"
    session["updated_at"] = datetime.now().isoformat()
    _browser_event(session, "takeover", "User took manual control of the browser session.", confidence=1.0)
    return {"session": _serialize_browser_session(session)}


@app.post("/browser/session/{session_id}/approve-submission")
async def approve_browser_submission(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Browser session not found")
    if not session.get("requires_approval"):
        raise HTTPException(status_code=400, detail="No approval is pending for this session")
    session["requires_approval"] = False
    session["status"] = "completed"
    session["updated_at"] = datetime.now().isoformat()
    _browser_event(session, "submission_approved", "User approved final submission. Session completed.", confidence=1.0)
    return {"session": _serialize_browser_session(session)}


class PersonaTestRequest(BaseModel):
    target_url: str
    tester_id: str
    founder_id: str
    objective: str = ""


def _build_persona_task(tester: dict, profile: dict, form: dict | None, objective: str = "") -> str:
    name = tester.get("name", "Unknown tester")
    headline = profile.get("professional_headline") or ""
    domain = profile.get("domain") or ""
    experience = profile.get("lived_experience") or ""
    skills = ", ".join(profile.get("skills") or [])
    methodology = profile.get("methodology") or ""
    testing_types = ", ".join(profile.get("testing_types") or [])
    availability = profile.get("availability") or ""
    form_title = (form or {}).get("title", "")
    form_desc = (form or {}).get("description", "")
    target_profile = (form or {}).get("target_profile", "")

    primary_task = objective.strip() if objective.strip() else (
        f"Explore the site as {name} would and try to complete a key workflow relevant to your background."
    )

    return f"""You are simulating {name}, a real user with the following background:

PERSONA
Name: {name}
Role: {headline}
Domain expertise: {domain}
Skills: {skills}
Testing approach: {methodology or testing_types}
Availability context: {availability}

LIVED EXPERIENCE
{experience}

STUDY CONTEXT
The founder is running: "{form_title}"
Study description: {form_desc}
Target profile they described: {target_profile}

YOUR PRIMARY OBJECTIVE — complete this exactly as {name} would:
{primary_task}

ADDITIONAL INSTRUCTIONS
- Stay fully in character as {name} throughout
- Note any friction, confusion, or missing features you encounter along the way
- Do NOT submit forms with personal data, enter real credentials, or make purchases
- After completing the objective, briefly summarize: what worked, what was confusing, and one thing you'd change

Be specific about every element you see and interact with."""


@app.get("/browser/tester-personas")
async def list_tester_personas(founder_id: str):
    """Return testers who have accepted matches with this founder, enriched with profile data."""
    if not _use_supabase():
        return {"personas": []}
    try:
        # Get all accepted/pending matches for this founder's forms
        forms_res = supabase.table("validation_forms").select("id,title,description,target_profile").eq("founder_id", founder_id).execute()
        form_ids = [f["id"] for f in (forms_res.data or [])]
        form_map = {f["id"]: f for f in (forms_res.data or [])}
        if not form_ids:
            return {"personas": []}

        matches_res = supabase.table("matches").select("id,tester_id,form_id,score,status").in_("form_id", form_ids).in_("status", ["accepted", "pending"]).execute()
        tester_ids = list({m["tester_id"] for m in (matches_res.data or [])})
        if not tester_ids:
            return {"personas": []}

        match_by_tester = {}
        for m in (matches_res.data or []):
            if m["tester_id"] not in match_by_tester:
                match_by_tester[m["tester_id"]] = m

        users_res = supabase.table("users").select("id,name").in_("id", tester_ids).execute()
        profiles_res = supabase.table("tester_profiles").select(
            "id,domain,lived_experience,skills,professional_headline,methodology,testing_types,availability,quality_score,projects_tested"
        ).in_("id", tester_ids).execute()

        user_map = {u["id"]: u for u in (users_res.data or [])}
        profile_map = {p["id"]: p for p in (profiles_res.data or [])}

        personas = []
        for tid in tester_ids:
            u = user_map.get(tid, {})
            p = profile_map.get(tid, {})
            m = match_by_tester.get(tid, {})
            form = form_map.get(m.get("form_id", ""), {})
            personas.append({
                "tester_id": tid,
                "name": u.get("name", "Tester"),
                "domain": p.get("domain"),
                "headline": p.get("professional_headline"),
                "skills": p.get("skills") or [],
                "quality_score": p.get("quality_score", 0),
                "match_score": round((m.get("score") or 0) * 100),
                "form_title": form.get("title", ""),
                "match_id": m.get("id"),
            })

        return {"personas": sorted(personas, key=lambda x: -x["match_score"])}
    except Exception as exc:
        logger.warning("list_tester_personas failed: %s", exc)
        return {"personas": []}


@app.post("/browser/persona-test")
async def start_persona_test(req: PersonaTestRequest):
    """Launch a browser-use cloud session using a tester's persona."""
    if not BROWSER_USE_API_KEY:
        raise HTTPException(status_code=503, detail="BROWSER_USE_API_KEY not configured")
    if not _use_supabase():
        raise HTTPException(status_code=503, detail="Supabase not configured")

    # Fetch tester + profile
    try:
        user_res = supabase.table("users").select("id,name").eq("id", req.tester_id).limit(1).execute()
        profile_res = supabase.table("tester_profiles").select(
            "id,domain,lived_experience,skills,professional_headline,methodology,testing_types,availability"
        ).eq("id", req.tester_id).limit(1).execute()
        # Find the match to get the form context
        forms_res = supabase.table("validation_forms").select("id,title,description,target_profile").eq("founder_id", req.founder_id).execute()
        form_ids = [f["id"] for f in (forms_res.data or [])]
        form = None
        if form_ids:
            match_res = supabase.table("matches").select("form_id").eq("tester_id", req.tester_id).in_("form_id", form_ids).limit(1).execute()
            if match_res.data:
                fid = match_res.data[0]["form_id"]
                form_obj = supabase.table("validation_forms").select("id,title,description,target_profile").eq("id", fid).limit(1).execute()
                form = form_obj.data[0] if form_obj.data else None
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB lookup failed: {exc}")

    tester = user_res.data[0] if user_res.data else {}
    profile = profile_res.data[0] if profile_res.data else {}
    task = _build_persona_task(tester, profile, form, objective=req.objective)

    # Build and fire the browser-use session
    session_id = f"persona_{uuid.uuid4().hex[:10]}"
    now = datetime.now().isoformat()
    session = {
        "id": session_id,
        "target_url": req.target_url,
        "task": task,
        "tester_id": req.tester_id,
        "tester_name": tester.get("name", "Tester"),
        "status": "running",
        "live_url": None,
        "cloud_session_id": None,
        "screenshot_url": None,
        "last_step_summary": None,
        "step_count": 0,
        "output": None,
        "is_task_successful": None,
        "recording_urls": [],
        "events": [],
        "created_at": now,
        "updated_at": now,
    }

    try:
        task_prompt = (
            f"Visit this URL: {req.target_url}\n\n"
            f"{task}"
        )
        with httpx.Client(timeout=30) as client:
            resp = client.post(
                f"{BROWSER_USE_BASE_URL}/sessions",
                headers=_browser_use_headers(),
                json={
                    "task": task_prompt,
                    "model": BROWSER_USE_MODEL,
                    "keepAlive": True,
                    "maxCostUsd": 2,
                    "enableRecording": True,
                },
            )
            resp.raise_for_status()
            cloud = resp.json()
            session["cloud_session_id"] = cloud.get("id") or cloud.get("sessionId")
            session["live_url"] = cloud.get("liveUrl") or cloud.get("live_url")
            session["status"] = "running"
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Browser Use API error: {exc}")

    _browser_sessions[session_id] = session
    return {"session": session}


@app.get("/browser/persona-test/{session_id}")
async def get_persona_test(session_id: str):
    session = _browser_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    cloud_id = session.get("cloud_session_id")
    if cloud_id and BROWSER_USE_API_KEY:
        try:
            with httpx.Client(timeout=10) as client:
                r = client.get(f"{BROWSER_USE_BASE_URL}/sessions/{cloud_id}", headers=_browser_use_headers())
                if r.status_code == 200:
                    data = r.json()
                    session["status"] = data.get("status", session["status"])
                    session["live_url"] = data.get("liveUrl") or data.get("live_url") or session["live_url"]
                    session["screenshot_url"] = data.get("screenshotUrl")
                    session["last_step_summary"] = data.get("lastStepSummary")
                    session["step_count"] = data.get("stepCount", 0)
                    session["output"] = data.get("output")
                    session["is_task_successful"] = data.get("isTaskSuccessful")
                    session["recording_urls"] = data.get("recordingUrls") or []
        except Exception:
            pass
    return {"session": session}


@app.get("/meetings")
async def list_meetings():
    if _use_supabase():
        result = supabase.table("meetings").select("*").order("created_at", desc=True).limit(20).execute()
        return {"meetings": result.data}
    else:
        return {"meetings": list(_meetings.values())}


@app.get("/health")
async def health():
    return {"status": "ok", "supabase": _use_supabase()}
