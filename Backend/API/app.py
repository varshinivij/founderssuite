"""
FounderSuite Matching API
=========================

Endpoints:
  GET /recommendations/projects?n=10
      Top N projects for the calling tester

  GET /recommendations/testers?project_id=<uuid>&n=10
      Top N testers for a project (founder only)

Auth:
  Supabase JWT in Authorization: Bearer <token> header.
  Supabase now issues ES256 (asymmetric) tokens — verified via JWKS endpoint.
"""

import logging
import os
from contextlib import asynccontextmanager
from typing import Annotated, Optional

import keras
import numpy as np
import requests as http_requests
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from postgrest.exceptions import APIError
from pydantic import BaseModel
from supabase import Client, create_client

from model.towers import L2Normalise, TemperatureScale  # noqa: F401

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, '..', 'models')

load_dotenv(os.path.join(BASE_DIR, ".env"))

required_env = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
]

for env_var in required_env:
    if not os.getenv(env_var):
        raise RuntimeError(f"Missing required env var: {env_var}")

SUPABASE_URL  = os.environ["SUPABASE_URL"]
SUPABASE_KEY  = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
MODEL_VERSION = os.getenv("MODEL_VERSION", "v1")

# JWKS endpoint — Supabase issues ES256 tokens verified via public keys
JWKS_URL    = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwks_cache = None


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        resp = http_requests.get(JWKS_URL, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


# ---------------------------------------------------------------------------
# App State
# ---------------------------------------------------------------------------

class AppState:
    model:    Optional[keras.Model] = None
    supabase: Optional[Client]      = None

app_state = AppState()

# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        model_path = os.path.join(MODEL_DIR, "best_model.keras")
        if os.path.exists(model_path):
            log.info("Loading model...")
            app_state.model = keras.saving.load_model(model_path)
            log.info("Model loaded.")
        else:
            log.warning(f"Model not found at {model_path}. Continuing without model.")

        app_state.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        log.info("Supabase client ready.")

        # Pre-fetch JWKS so the first request isn't slow
        _get_jwks()
        log.info("JWKS fetched.")

        yield

    except Exception as e:
        log.exception("Startup failed.")
        raise RuntimeError(f"Application startup failed: {e}") from e


app = FastAPI(
    title="FounderSuite Matching API",
    version=MODEL_VERSION,
    lifespan=lifespan,
)

bearer_scheme = HTTPBearer()

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class CallerIdentity(BaseModel):
    user_id: str
    role:    str


def get_caller(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)]
) -> CallerIdentity:
    """Validate Supabase ES256 JWT via JWKS and return caller identity."""
    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
        kid    = header.get("kid")
        alg    = header.get("alg", "ES256")

        jwks  = _get_jwks()
        key   = next((k for k in jwks["keys"] if k["kid"] == kid), None)

        if key is None:
            raise HTTPException(status_code=401, detail="Unknown token key ID")

        public_key = jwk.construct(key, algorithm=alg)

        payload = jwt.decode(
            token,
            public_key,
            algorithms=[alg],
            options={"verify_aud": False},
        )

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim")

    # Role lives in public.users, not the JWT — looked up per request.
    # Supabase JWT only carries role="authenticated" which isn't useful here.
    role = _fetch_user_role(app_state.supabase, user_id)

    return CallerIdentity(user_id=user_id, role=role)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_supabase() -> Client:
    if app_state.supabase is None:
        raise HTTPException(status_code=503, detail="Supabase client unavailable")
    return app_state.supabase


def _normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    return vec if norm == 0 else vec / norm


def _cosine_similarities(query: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    query  = np.asarray(query,  dtype=np.float32).reshape(-1)
    matrix = np.asarray(matrix, dtype=np.float32)
    return matrix @ query


def _fetch_user_role(supabase: Client, user_id: str) -> str:
    try:
        resp = (
            supabase.table("users")
            .select("role")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return resp.data.get("role", "unknown")
    except APIError:
        return "unknown"


def _fetch_tester_profile_id(supabase: Client, user_id: str) -> str:
    try:
        resp = (
            supabase.table("tester_profiles")
            .select("id")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
    except APIError:
        raise HTTPException(status_code=404, detail="Tester profile not found")
    return resp.data["id"]


def _fetch_project_owner(supabase: Client, project_id: str) -> str:
    try:
        resp = (
            supabase.table("projects")
            .select("owner_id")
            .eq("id", project_id)
            .single()
            .execute()
        )
    except APIError:
        raise HTTPException(status_code=404, detail="Project not found")
    return resp.data["owner_id"]


def _fetch_tester_embedding(supabase: Client, tester_profile_id: str) -> np.ndarray:
    try:
        resp = (
            supabase.table("tester_embeddings")
            .select("embedding")
            .eq("tester_profile_id", tester_profile_id)
            .single()
            .execute()
        )
    except APIError:
        raise HTTPException(
            status_code=404,
            detail=f"No embedding found for tester {tester_profile_id}",
        )
    return _normalize(np.asarray(resp.data["embedding"], dtype=np.float32))


def _fetch_project_embedding(supabase: Client, project_id: str) -> np.ndarray:
    try:
        resp = (
            supabase.table("project_embeddings")
            .select("embedding")
            .eq("project_id", project_id)
            .single()
            .execute()
        )
    except APIError:
        raise HTTPException(
            status_code=404,
            detail=f"No embedding found for project {project_id}",
        )
    return _normalize(np.asarray(resp.data["embedding"], dtype=np.float32))


def _fetch_all_project_embeddings(supabase: Client) -> tuple[list[str], np.ndarray]:
    resp = (
        supabase.table("project_embeddings")
        .select("project_id, embedding")
        .execute()
    )
    if not resp.data:
        return [], np.empty((0, 0), dtype=np.float32)

    ids    = [row["project_id"] for row in resp.data]
    matrix = np.vstack([np.asarray(row["embedding"], dtype=np.float32) for row in resp.data])
    norms  = np.linalg.norm(matrix, axis=1, keepdims=True)
    matrix = matrix / np.where(norms == 0, 1, norms)
    return ids, matrix


def _fetch_all_tester_embeddings(supabase: Client) -> tuple[list[str], np.ndarray]:
    resp = (
        supabase.table("tester_embeddings")
        .select("tester_profile_id, embedding")
        .execute()
    )
    if not resp.data:
        return [], np.empty((0, 0), dtype=np.float32)

    ids    = [row["tester_profile_id"] for row in resp.data]
    matrix = np.vstack([np.asarray(row["embedding"], dtype=np.float32) for row in resp.data])
    norms  = np.linalg.norm(matrix, axis=1, keepdims=True)
    matrix = matrix / np.where(norms == 0, 1, norms)
    return ids, matrix


def _log_recommendations(
    supabase: Client,
    tester_profile_id: Optional[str],
    project_id: Optional[str],
    ranked_ids: list[str],
    scores: list[float],
    target_type: str,   # 'project' | 'tester'
):
    rows = [
        {
            "tester_profile_id": tester_profile_id,
            "project_id":        rid if target_type == "project" else project_id,
            "similarity":        float(score),
            "rank":              rank,
            "outcome":           "shown",
        }
        for rank, (rid, score) in enumerate(zip(ranked_ids, scores), start=1)
    ]
    if rows:
        supabase.table("recommendation_log").insert(rows).execute()


def _rank_top_n(scores: np.ndarray, ids: list[str], n: int):
    top_n   = min(n, len(ids))
    top_idx = np.argpartition(scores, kth=len(scores) - top_n)[-top_n:]
    top_idx = top_idx[np.argsort(scores[top_idx])[::-1]]
    return [ids[i] for i in top_idx], [float(scores[i]) for i in top_idx]


# ---------------------------------------------------------------------------
# Response Models
# ---------------------------------------------------------------------------

class ProjectRecommendation(BaseModel):
    project_id: str
    similarity: float
    rank:       int


class TesterRecommendation(BaseModel):
    tester_profile_id: str
    similarity:        float
    rank:              int


class ProjectRecommendationsResponse(BaseModel):
    tester_profile_id: str
    recommendations:   list[ProjectRecommendation]


class TesterRecommendationsResponse(BaseModel):
    project_id:      str
    recommendations: list[TesterRecommendation]


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get(
    "/recommendations/projects",
    response_model=ProjectRecommendationsResponse,
    summary="Top N projects for the calling tester",
)
def recommend_projects(
    n:      Annotated[int, Query(ge=1, le=100)] = 10,
    caller: CallerIdentity = Depends(get_caller),
    supabase: Client       = Depends(_get_supabase),
):
    if caller.role != "tester":
        raise HTTPException(status_code=403, detail="Only testers can call this endpoint")

    tester_profile_id            = _fetch_tester_profile_id(supabase, caller.user_id)
    tester_emb                   = _fetch_tester_embedding(supabase, tester_profile_id)
    project_ids, project_matrix  = _fetch_all_project_embeddings(supabase)

    if not project_ids:
        return ProjectRecommendationsResponse(tester_profile_id=tester_profile_id, recommendations=[])

    scores                  = _cosine_similarities(tester_emb, project_matrix)
    ranked_ids, ranked_scores = _rank_top_n(scores, project_ids, n)

    _log_recommendations(supabase, tester_profile_id, None, ranked_ids, ranked_scores, "project")

    return ProjectRecommendationsResponse(
        tester_profile_id=tester_profile_id,
        recommendations=[
            ProjectRecommendation(project_id=pid, similarity=score, rank=rank)
            for rank, (pid, score) in enumerate(zip(ranked_ids, ranked_scores), start=1)
        ],
    )


@app.get(
    "/recommendations/testers",
    response_model=TesterRecommendationsResponse,
    summary="Top N testers for a project (founder only)",
)
def recommend_testers(
    project_id: Annotated[str, Query(description="Project UUID")],
    n:          Annotated[int, Query(ge=1, le=100)] = 10,
    caller:     CallerIdentity = Depends(get_caller),
    supabase:   Client         = Depends(_get_supabase),
):
    owner_id = _fetch_project_owner(supabase, project_id)
    if owner_id != caller.user_id:
        raise HTTPException(status_code=403, detail="You do not own this project")

    project_emb                 = _fetch_project_embedding(supabase, project_id)
    tester_ids, tester_matrix   = _fetch_all_tester_embeddings(supabase)

    if not tester_ids:
        return TesterRecommendationsResponse(project_id=project_id, recommendations=[])

    scores                    = _cosine_similarities(project_emb, tester_matrix)
    ranked_ids, ranked_scores = _rank_top_n(scores, tester_ids, n)

    _log_recommendations(supabase, None, project_id, ranked_ids, ranked_scores, "tester")

    return TesterRecommendationsResponse(
        project_id=project_id,
        recommendations=[
            TesterRecommendation(tester_profile_id=tid, similarity=score, rank=rank)
            for rank, (tid, score) in enumerate(zip(ranked_ids, ranked_scores), start=1)
        ],
    )


# ---------------------------------------------------------------------------
# Health / Readiness
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {
        "status":       "ok",
        "model_loaded": app_state.model is not None,
        "model_version": MODEL_VERSION,
    }


@app.get("/ready")
def ready():
    if app_state.supabase is None:
        raise HTTPException(status_code=503, detail="Supabase unavailable")
    return {"ready": True}