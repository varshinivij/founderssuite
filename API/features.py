"""
Maps real Supabase rows to the numpy feature vectors the model expects.

Tester vector: 51 dims  (47 base + 4 interaction, when pair context available)
Project vector: 43 dims (39 base + 4 interaction, when pair context available)

Standalone (no pair context):
  Tester: 47 dims
  Project: 39 dims
"""

import numpy as np
from typing import Any

INDUSTRIES = [
    'fintech', 'healthtech', 'edtech', 'developer_tools', 'consumer_apps',
    'enterprise_saas', 'ecommerce', 'marketplace', 'social', 'gaming',
    'security', 'infrastructure', 'data_analytics', 'climate', 'legaltech'
]

TASK_TYPES = [
    'ux_review', 'bug_hunting', 'api_testing', 'performance_testing',
    'accessibility_review', 'onboarding_flow', 'competitive_analysis',
    'security_review'
]

EXP_TYPES = ['student', 'professional', 'freelance', 'other']
TECH_TAGS = ['react', 'python', 'ios', 'android', 'web', 'api', 'ml', 'blockchain']
STAGES    = ['idea', 'mvp', 'beta', 'launched']


def extract_tester_features(
    tester_profile: dict[str, Any],
    tester_stats:   dict[str, Any] | None,
    industry_rows:  list[dict[str, Any]],
) -> np.ndarray:
    """
    tester_profile  — row from tester_profiles
    tester_stats    — row from tester_stats (may be None)
    industry_rows   — rows from tester_industry_weights for this tester
    Returns: float32 array of shape (47,)

    Schema mapping:
      quality_score     tester_stats.task_completion_rate (best real proxy)
      products_tested   tester_stats.active_engagements
      is_student        not in DB yet; default False
      days_since_last   tester_stats.refreshed_at delta
      self_industries   tester_industry_weights where weight > 0.5
      behavioural       tester_industry_weights.weight (soft scores)
      exp_diversity     not in DB yet; default zeros
      task_strengths    not in DB yet; default zeros
      avg_rating        mean of feedback ratings received
    """
    stats = tester_stats or {}

    # ── scalar features ──────────────────────────────────────────
    quality_score   = float(stats.get("task_completion_rate", 0.5))
    products_tested = int(stats.get("active_engagements", 0))
    is_student      = False  # extend when profile has exp_type field

    from datetime import datetime, timezone
    refreshed = stats.get("refreshed_at")
    if refreshed:
        if isinstance(refreshed, str):
            refreshed = datetime.fromisoformat(refreshed.replace("Z", "+00:00"))
        days_since = (datetime.now(timezone.utc) - refreshed).days
    else:
        days_since = 180

    avg_rating = float(tester_profile.get("avg_rating", 0.0))

    # ── industry vectors from tester_industry_weights ─────────────
    # weight > 0.5 → self-reported interest; raw weight → behavioural
    self_industries = np.zeros(len(INDUSTRIES), dtype=np.float32)
    behavioural     = np.zeros(len(INDUSTRIES), dtype=np.float32)

    for row in industry_rows:
        tag    = row.get("industry", "").lower().replace(" ", "_").replace("-", "_")
        weight = float(row.get("weight", 0.0))
        if tag in INDUSTRIES:
            idx = INDUSTRIES.index(tag)
            behavioural[idx]     = weight
            self_industries[idx] = 1.0 if weight > 0.5 else 0.0

    # ── placeholders — extend when DB has these fields ───────────
    exp_diversity  = np.zeros(len(EXP_TYPES),  dtype=np.float32)
    task_strengths = np.zeros(len(TASK_TYPES), dtype=np.float32)

    features = np.concatenate([
        [quality_score],
        [min(products_tested / 20.0, 1.0)],
        [float(is_student)],
        [min(days_since / 365.0, 1.0)],
        self_industries,        # 15
        behavioural,            # 15
        exp_diversity,          # 4
        task_strengths,         # 8
        [avg_rating],
    ]).astype(np.float32)       # total: 47

    assert features.shape == (47,), f"Tester feature shape mismatch: {features.shape}"
    return features


def extract_project_features(
    project:     dict[str, Any],
    tags:        list[dict[str, Any]],
    proj_stats:  dict[str, Any] | None,
) -> np.ndarray:
    """
    project    — row from projects
    tags       — rows from project_tags for this project
    proj_stats — row from project_stats (may be None)
    Returns: float32 array of shape (39,)

    Schema mapping:
      stage_ordinal       projects.stage
      task_count          count of tasks (passed in via tags/stats)
      has_demo            projects.demo_video_url is not null
      desc_length         len(projects.description)
      industry_tags       project_tags where tag_type = 'industry'
      tech_tags           project_tags where tag_type = 'tech'
      task_reqs           project_tags where tag_type = 'task_type'
      n_industries        count of industry tags
      project_age         days since projects.created_at
      active_engagements  project_stats.active_testers
    """
    stats = proj_stats or {}

    stage_str = (project.get("stage") or "mvp").lower()
    stage_idx = STAGES.index(stage_str) if stage_str in STAGES else 1
    stage_ordinal = stage_idx / 3.0

    has_demo    = bool(project.get("demo_video_url"))
    desc        = project.get("description") or ""
    desc_length = len(desc)

    from datetime import datetime, timezone
    created = project.get("created_at")
    if created:
        if isinstance(created, str):
            created = datetime.fromisoformat(created.replace("Z", "+00:00"))
        project_age = (datetime.now(timezone.utc) - created).days
    else:
        project_age = 30

    active_engagements = int(stats.get("active_testers", 0))

    # ── tag vectors ───────────────────────────────────────────────
    industry_tags = np.zeros(len(INDUSTRIES), dtype=np.float32)
    tech_tags_vec = np.zeros(len(TECH_TAGS),  dtype=np.float32)
    task_reqs_vec = np.zeros(len(TASK_TYPES), dtype=np.float32)

    for tag_row in tags:
        tag      = (tag_row.get("tag") or "").lower().replace(" ", "_").replace("-", "_")
        tag_type = (tag_row.get("tag_type") or "").lower()

        if tag_type == "industry" and tag in INDUSTRIES:
            industry_tags[INDUSTRIES.index(tag)] = 1.0
        elif tag_type == "tech" and tag in TECH_TAGS:
            tech_tags_vec[TECH_TAGS.index(tag)] = 1.0
        elif tag_type == "task_type" and tag in TASK_TYPES:
            task_reqs_vec[TASK_TYPES.index(tag)] = 1.0

    n_industries = float(np.sum(industry_tags))
    task_count   = float(np.sum(task_reqs_vec)) + stage_idx

    features = np.concatenate([
        [stage_ordinal],
        [min(task_count / 20.0, 1.0)],
        [float(has_demo)],
        [min(desc_length / 1000.0, 1.0)],
        industry_tags,          # 15
        tech_tags_vec,          # 8
        task_reqs_vec,          # 8
        [min(n_industries / len(INDUSTRIES), 1.0)],
        [min(project_age / 365.0, 1.0)],
        [min(active_engagements / 10.0, 1.0)],
    ]).astype(np.float32)       # total: 39

    assert features.shape == (39,), f"Project feature shape mismatch: {features.shape}"
    return features


def compute_interaction_features(
    tester_vec: np.ndarray,
    project_vec: np.ndarray,
) -> np.ndarray:
    """
    Compute the 4 explicit overlap features from raw feature vectors.
    Expects tester_vec (47,) and project_vec (39,).
    Returns float32 array of shape (4,).
    """
    # Slice out the relevant parts from each vector
    # tester: [0]=quality, [1]=products_tested, [2]=student, [3]=days,
    #         [4:19]=self_industries, [19:34]=behavioural, [34:38]=exp, [38:46]=task_strengths
    # project: [4:19]=industry_tags, [27:35]=task_reqs
    self_industries = tester_vec[4:19]
    behavioural     = tester_vec[19:34]
    task_strengths  = tester_vec[38:46]
    stage_exp_level = tester_vec[1]   # products_tested normalized ≈ stage exp

    industry_tags = project_vec[4:19]
    task_reqs     = project_vec[27:35]
    stage_target  = project_vec[0]    # stage_ordinal

    # behavioural jaccard
    beh_overlap  = np.dot(behavioural, industry_tags)
    beh_union    = np.sum(np.clip(behavioural + industry_tags, 0, 1))
    beh_jaccard  = beh_overlap / beh_union if beh_union > 0 else 0.0

    # self-reported jaccard
    self_overlap = np.dot(self_industries, industry_tags)
    self_union   = np.sum(np.clip(self_industries + industry_tags, 0, 1))
    self_jaccard = self_overlap / self_union if self_union > 0 else 0.0

    # task alignment
    task_dot   = np.dot(task_strengths, task_reqs)
    task_max   = np.sum(task_reqs)
    task_align = task_dot / task_max if task_max > 0 else 0.0

    # stage fit
    stage_delta = abs(stage_exp_level - stage_target)
    stage_fit   = max(0.0, 1.0 - stage_delta * 2.0)

    return np.array([beh_jaccard, self_jaccard, task_align, stage_fit], dtype=np.float32)