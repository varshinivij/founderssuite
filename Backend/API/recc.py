"""
GET /recommend/{project_id}?top_k=20

1. Load project from Supabase
2. Extract project features → run project tower → get 39-dim embedding
3. Fetch all tester embeddings from tester_embeddings table
4. Dot product → rank → return top_k
5. Log to recommendation_log
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime, timezone
import numpy as np

from app.db import get_supabase
from app.features import (
    extract_project_features,
    extract_tester_features,
    compute_interaction_features,
)
from app.main import get_ml

router = APIRouter()


class TesterMatch(BaseModel):
    tester_profile_id: str
    similarity:        float
    rank:              int


class RecommendResponse(BaseModel):
    project_id: str
    matches:    list[TesterMatch]
    generated_at: str


@router.get("/{project_id}", response_model=RecommendResponse)
async def recommend(
    project_id: str,
    top_k: int = Query(default=20, ge=1, le=100),
):
    sb = get_supabase()
    ml = get_ml()

    if "project_tower" not in ml or "tester_tower" not in ml:
        raise HTTPException(503, "Models not loaded")

    # ── 1. Fetch project ─────────────────────────────────────────
    proj_res = sb.table("projects").select(
        "*").eq("id", project_id).single().execute()
    if not proj_res.data:
        raise HTTPException(404, f"Project {project_id} not found")
    project = proj_res.data

    tags_res = sb.table("project_tags").select(
        "*").eq("project_id", project_id).execute()
    stats_res = sb.table("project_stats").select(
        "*").eq("project_id", project_id).maybe_single().execute()

    project_vec = extract_project_features(
        project=project,
        tags=tags_res.data or [],
        proj_stats=stats_res.data,
    )

    # ── 2. Get project embedding ──────────────────────────────────
    project_emb = ml["project_tower"].predict(
        project_vec.reshape(1, -1), verbose=0
    )[0]  # shape (64,)

    # ── 3. Fetch all tester embeddings ────────────────────────────
    emb_res = sb.table("tester_embeddings").select(
        "tester_profile_id, embedding, feature_vec"
    ).execute()

    if not emb_res.data:
        raise HTTPException(
            404, "No tester embeddings found — run /embed/all first")

    tester_ids = []
    embeddings = []

    for row in emb_res.data:
        emb = row.get("embedding")
        if emb and len(emb) == 64:
            tester_ids.append(row["tester_profile_id"])
            embeddings.append(emb)

    if not embeddings:
        raise HTTPException(404, "No valid tester embeddings")

    emb_matrix = np.array(embeddings, dtype=np.float32)  # (N, 64)

    # ── 4. Cosine similarity via dot product (embeddings are L2-normed) ──
    scores = emb_matrix @ project_emb  # (N,)

    top_indices = np.argsort(scores)[::-1][:top_k]
    matches = [
        TesterMatch(
            tester_profile_id=tester_ids[i],
            similarity=round(float(scores[i]), 4),
            rank=rank + 1,
        )
        for rank, i in enumerate(top_indices)
    ]

    # ── 5. Log recommendations ───────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()
    log_rows = [
        {
            "tester_profile_id": m.tester_profile_id,
            "project_id":        project_id,
            "similarity":        m.similarity,
            "rank":              m.rank,
            "outcome":           "shown",
            "created_at":        now,
        }
        for m in matches
    ]
    sb.table("recommendation_log").insert(log_rows).execute()

    return RecommendResponse(
        project_id=project_id,
        matches=matches,
        generated_at=now,
    )
