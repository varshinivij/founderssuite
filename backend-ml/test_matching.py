import keras
import numpy as np
from model.towers import L2Normalise, TemperatureScale
TESTER_GROUPS = {
    "quality_score":   slice(0, 1),
    "products_tested": slice(1, 2),
    "is_student":      slice(2, 3),
    "recency":         slice(3, 4),
    "self_industries": slice(4, 19),   # 15 industries
    "behavioural":     slice(19, 34),  # 15 industries
    "exp_diversity":   slice(34, 38),  # 4 exp types
    "task_strengths":  slice(38, 46),  # 8 task types
    "avg_rating":      slice(46, 47),
}

PROJECT_GROUPS = {
    "stage":           slice(0, 1),
    "task_count":      slice(1, 2),
    "has_demo":        slice(2, 3),
    "desc_length":     slice(3, 4),
    "industry_tags":   slice(4, 19),   # 15 industries
    "tech_tags":       slice(19, 27),  # 8 tech tags
    "task_reqs":       slice(27, 35),  # 8 task types
    "n_industries":    slice(35, 36),
    "project_age":     slice(36, 37),
    "active_engages":  slice(37, 38),  # wait, that's only 38 — check your project_dim
}


def explain_match(tester_tower, project_tower, t_vec, p_vec):
    """
    For each feature group, zero it out and measure the drop in similarity.
    Larger drop = that group was more responsible for the match.
    """
    def similarity(t, p):
        t_emb = tester_tower(t[None]).numpy()[0]
        p_emb = project_tower(p[None]).numpy()[0]
        return float(np.dot(t_emb, p_emb))

    baseline = similarity(t_vec, p_vec)
    print(f"Baseline similarity: {baseline:.4f}\n")

    contributions = {}

    print("Tester feature group contributions:")
    for name, sl in TESTER_GROUPS.items():
        t_ablated = t_vec.copy()
        t_ablated[sl] = 0.0
        drop = baseline - similarity(t_ablated, p_vec)
        contributions[f"tester.{name}"] = drop
        bar = "█" * int(max(0, drop) * 200)
        print(f"  {name:<20} drop={drop:+.4f}  {bar}")

    print("\nProject feature group contributions:")
    for name, sl in PROJECT_GROUPS.items():
        p_ablated = p_vec.copy()
        p_ablated[sl] = 0.0
        drop = baseline - similarity(t_vec, p_ablated)
        contributions[f"project.{name}"] = drop
        bar = "█" * int(max(0, drop) * 200)
        print(f"  {name:<20} drop={drop:+.4f}  {bar}")

    return contributions


# --- run it ---
model         = keras.saving.load_model("models/best_model.keras")
tester_tower  = model.get_layer("tester_tower")
project_tower = model.get_layer("project_tower")

testers  = np.load("data/tester_features.npy").astype(np.float32)
projects = np.load("data/project_features.npy").astype(np.float32)

# Pick a specific pair to explain
t_idx, p_idx = 0, 3
explain_match(tester_tower, project_tower, testers[t_idx], projects[p_idx])