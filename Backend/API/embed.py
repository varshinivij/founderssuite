"""
POST /embed/tester/{tester_profile_id}   — encode one tester, write to tester_embeddings
POST /embed/project/{project_id}         — encode one project, write to project_embeddings
POST /embed/all                          — re-encode every tester and project (run after retrain)
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import numpy as np
from datetime import datetime, timezone

from app.db import get_supabase
from app.features import extract_tester_features, extract_project_features
from app.main import get_ml

router = APIRouter()


class EmbedResponse(BaseModel):
    id:          str
    embedding_dim: int
    updated_at:  str


class BulkEmbedResponse(BaseModel):
    testers_embedded:  int
    projects_embedded: int
    errors:            list[str]


def _embed_tester(tester_profile_id: str, ml: dict, sb) -> np.ndarray:
    profile_res = (
        sb.table("tester_profiles")
        .select("*")
        .eq("id", tester_profile_id)
        .single()
        .execute()
    )
    if not profile_res.data:
        raise ValueError(f"Tester {tester_profile_id} not found")

    stats_res = (
        sb.table("tester_stats")
        .select("*")
        .eq("tester_profile_id", tester_profile_id)
        .maybe_single()
        .execute()
    )
    industry_res = (
        sb.table("tester_industry_weights")
        .select("*")
        .eq("tester_profile_id", tester_profile_id)
        .execute()
    )

    feature_vec = extract_tester_features(
        tester_profile=profile_res.data,
        tester_stats=stats_res.data,
        industry_rows=industry_res.data or [],
    )
    embedding = ml["tester_tower"].predict(
        feature_vec.reshape(1, -1), verbose=0
    )[0]
    return feature_vec, embedding


def _embed_project(project_id: str, ml: dict, sb) -> np.ndarray:
    proj_res = (
        sb.table("projects")
        .select("*")
        .eq("id", project_id)
        .single()
        .execute()
    )
    if not proj_res.data:
        raise ValueError(f"Project {project_id} not found")

    tags_res  = sb.table("project_tags").select("*").eq("project_id", project_id).execute()
    stats_res = (
        sb.table("project_stats")
        .select("*")
        .eq("project_id", project_id)
        .maybe_single()
        .execute()
    )

    feature_vec = extract_project_features(
        project=proj_res.data,
        tags=tags_res.data or [],
        proj_stats=stats_res.data,
    )
    embedding = ml["project_tower"].predict(
        feature_vec.reshape(1, -1), verbose=0
    )[0]
    return feature_vec, embedding


@router.post("/tester/{tester_profile_id}", response_model=EmbedResponse)
async def embed_tester(tester_profile_id: str):
    sb = get_supabase()
    ml = get_ml()

    if "tester_tower" not in ml:
        raise HTTPException(503, "Tester tower not loaded")

    try:
        feature_vec, embedding = _embed_tester(tester_profile_id, ml, sb)
    except ValueError as e:
        raise HTTPException(404, str(e))

    now = datetime.now(timezone.utc).isoformat()
    sb.table("tester_embeddings").upsert({
        "tester_profile_id": tester_profile_id,
        "embedding":         embedding.tolist(),
        "feature_vec":       feature_vec.tolist(),
        "updated_at":        now,
    }, on_conflict="tester_profile_id").execute()

    return EmbedResponse(
        id=tester_profile_id,
        embedding_dim=len(embedding),
        updated_at=now,
    )


@router.post("/project/{project_id}", response_model=EmbedResponse)
async def embed_project(project_id: str):
    sb = get_supabase()
    ml = get_ml()

    if "project_tower" not in ml:
        raise HTTPException(503, "Project tower not loaded")

    try:
        feature_vec, embedding = _embed_project(project_id, ml, sb)
    except ValueError as e:
        raise HTTPException(404, str(e))

    now = datetime.now(timezone.utc).isoformat()
    sb.table("project_embeddings").upsert({
        "project_id":  project_id,
        "embedding":   embedding.tolist(),
        "feature_vec": feature_vec.tolist(),
        "updated_at":  now,
    }, on_conflict="project_id").execute()

    return EmbedResponse(
        id=project_id,
        embedding_dim=len(embedding),
        updated_at=now,
    )


@router.post("/all", response_model=BulkEmbedResponse)
async def embed_all(background_tasks: BackgroundTasks):
    """
    Re-encode every tester and project. Run this after retraining.
    Runs synchronously for now — move to a background job for production.
    """
    sb = get_supabase()
    ml = get_ml()

    if "tester_tower" not in ml or "project_tower" not in ml:
        raise HTTPException(503, "Models not loaded")

    errors           = []
    testers_embedded = 0
    projects_embedded = 0
    now = datetime.now(timezone.utc).isoformat()

    # ── Testers ──────────────────────────────────────────────────
    all_testers = sb.table("tester_profiles").select("id").execute()
    for row in (all_testers.data or []):
        tid = row["id"]
        try:
            feature_vec, embedding = _embed_tester(tid, ml, sb)
            sb.table("tester_embeddings").upsert({
                "tester_profile_id": tid,
                "embedding":         embedding.tolist(),
                "feature_vec":       feature_vec.tolist(),
                "updated_at":        now,
            }, on_conflict="tester_profile_id").execute()
            testers_embedded += 1
        except Exception as e:
            errors.append(f"tester {tid}: {e}")

    # ── Projects ─────────────────────────────────────────────────
    all_projects = sb.table("projects").select("id").execute()
    for row in (all_projects.data or []):
        pid = row["id"]
        try:
            feature_vec, embedding = _embed_project(pid, ml, sb)
            sb.table("project_embeddings").upsert({
                "project_id":  pid,
                "embedding":   embedding.tolist(),
                "feature_vec": feature_vec.tolist(),
                "updated_at":  now,
            }, on_conflict="project_id").execute()
            projects_embedded += 1
        except Exception as e:
            errors.append(f"project {pid}: {e}")

    return BulkEmbedResponse(
        testers_embedded=testers_embedded,
        projects_embedded=projects_embedded,
        errors=errors,
    )