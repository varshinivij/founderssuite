"""
POST /feedback

Records the outcome of a recommendation — applied, rejected, ignored.
This is your real training data accumulator.

Also used to record application status changes:
  applications.status changes → call this endpoint
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal
from datetime import datetime, timezone

from app.db import get_supabase

router = APIRouter()

OutcomeType = Literal["applied", "rejected", "ignored", "completed", "dropped"]


class FeedbackRequest(BaseModel):
    tester_profile_id: str
    project_id:        str
    outcome:           OutcomeType
    rank:              int | None = None
    similarity:        float | None = None
    note:              str | None = None


class FeedbackResponse(BaseModel):
    logged: bool
    pairs_available_for_training: int


@router.post("/", response_model=FeedbackResponse)
async def log_feedback(body: FeedbackRequest):
    sb  = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # ── Upsert outcome into recommendation_log ───────────────────
    # If a "shown" row exists for this pair, update it.
    # Otherwise insert fresh (e.g. direct application with no prior recommendation).
    existing = (
        sb.table("recommendation_log")
        .select("id")
        .eq("tester_profile_id", body.tester_profile_id)
        .eq("project_id", body.project_id)
        .eq("outcome", "shown")
        .maybe_single()
        .execute()
    )

    if existing.data:
        sb.table("recommendation_log").update({
            "outcome":    body.outcome,
            "updated_at": now,
        }).eq("id", existing.data["id"]).execute()
    else:
        sb.table("recommendation_log").insert({
            "tester_profile_id": body.tester_profile_id,
            "project_id":        body.project_id,
            "similarity":        body.similarity,
            "rank":              body.rank,
            "outcome":           body.outcome,
            "created_at":        now,
        }).execute()

    # ── Count real labeled pairs available for retraining ────────
    count_res = (
        sb.table("recommendation_log")
        .select("id", count="exact")
        .in_("outcome", ["applied", "rejected", "ignored"])
        .execute()
    )
    pairs_count = count_res.count or 0

    return FeedbackResponse(
        logged=True,
        pairs_available_for_training=pairs_count,
    )


@router.get("/stats")
async def feedback_stats():
    """How much real training data do we have?"""
    sb = get_supabase()

    res = (
        sb.table("recommendation_log")
        .select("outcome")
        .in_("outcome", ["applied", "rejected", "ignored", "completed", "dropped"])
        .execute()
    )

    rows = res.data or []
    counts = {}
    for row in rows:
        o = row["outcome"]
        counts[o] = counts.get(o, 0) + 1

    total    = sum(counts.values())
    positive = counts.get("applied", 0) + counts.get("completed", 0)
    negative = counts.get("rejected", 0) + counts.get("ignored", 0) + counts.get("dropped", 0)

    return {
        "total_labeled_pairs": total,
        "positive":            positive,
        "negative":            negative,
        "positive_rate":       round(positive / total, 3) if total > 0 else 0,
        "ready_to_retrain":    total >= 500,
        "breakdown":           counts,
    }