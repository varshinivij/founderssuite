import numpy as np
import pandas as pd
import os

np.random.seed(42)

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
STAGES    = ['idea', 'mvp', 'beta', 'launched']
TECH_TAGS = ['react', 'python', 'ios', 'android', 'web', 'api', 'ml', 'blockchain']

N_TESTERS  = 2000
N_PROJECTS = 1000
N_PAIRS    = 15000


def generate_tester():
    is_student      = np.random.random() < 0.25
    quality_score   = np.random.beta(5, 2) * 5 if not is_student else np.random.beta(2, 3) * 5
    products_tested = int(np.random.poisson(10)) if not is_student else int(np.random.poisson(2))
    days_since_last = np.random.exponential(45)

    n_self = np.random.randint(1, 4)
    self_industries = np.zeros(len(INDUSTRIES))
    chosen = np.random.choice(len(INDUSTRIES), n_self, replace=False)
    self_industries[chosen] = 1

    behavioural = np.zeros(len(INDUSTRIES))
    for idx in chosen:
        if products_tested > 0:
            behavioural[idx] = np.clip(np.random.beta(5, 1.5), 0.3, 1.0)
    if np.random.random() < 0.2:
        drift = np.random.choice(len(INDUSTRIES))
        behavioural[drift] = max(behavioural[drift], np.random.uniform(0.1, 0.4))

    exp_diversity = np.zeros(len(EXP_TYPES))
    n_exp = np.random.randint(1, len(EXP_TYPES))
    exp_chosen = np.random.choice(len(EXP_TYPES), n_exp, replace=False)
    exp_diversity[exp_chosen] = 1
    if is_student:
        exp_diversity[0] = 1

    task_strengths = np.zeros(len(TASK_TYPES))
    n_strong = np.random.randint(2, 5)
    task_chosen = np.random.choice(len(TASK_TYPES), n_strong, replace=False)
    for t in task_chosen:
        task_strengths[t] = np.random.beta(5, 1.5)

    avg_rating = np.random.beta(4, 1.5) * 5 if products_tested > 0 else 0.0

    features = np.concatenate([
        [quality_score / 5.0],
        [min(products_tested / 20.0, 1.0)],
        [float(is_student)],
        [min(days_since_last / 365.0, 1.0)],
        self_industries,
        behavioural,
        exp_diversity,
        task_strengths,
        [avg_rating / 5.0],
    ])

    meta = {
        'quality_score':   quality_score,
        'self_industries': self_industries,
        'behavioural':     behavioural,
        'task_strengths':  task_strengths,
        'products_tested': products_tested,
        'stage_exp_level': min(products_tested / 10.0, 1.0),
        'is_student':      is_student,
    }

    return features, meta


def generate_project():
    stage_idx     = np.random.choice(len(STAGES), p=[0.2, 0.4, 0.3, 0.1])
    stage_ordinal = stage_idx / 3.0
    task_count    = np.random.randint(3, 10) + stage_idx
    has_demo      = np.random.random() < (0.3 + stage_idx * 0.2)
    desc_length   = np.random.randint(100, 600)

    n_industries  = np.random.randint(1, 3)
    industry_tags = np.zeros(len(INDUSTRIES))
    chosen        = np.random.choice(len(INDUSTRIES), n_industries, replace=False)
    industry_tags[chosen] = 1

    n_tech      = np.random.randint(1, 4)
    tech_tags   = np.zeros(len(TECH_TAGS))
    tech_chosen = np.random.choice(len(TECH_TAGS), n_tech, replace=False)
    tech_tags[tech_chosen] = 1

    n_task_types = np.random.randint(2, 5)
    task_reqs    = np.zeros(len(TASK_TYPES))
    task_chosen  = np.random.choice(len(TASK_TYPES), n_task_types, replace=False)
    task_reqs[task_chosen] = 1

    active_engagements = np.random.poisson(2)
    project_age        = np.random.exponential(60)

    features = np.concatenate([
        [stage_ordinal],
        [min(task_count / 20.0, 1.0)],
        [float(has_demo)],
        [min(desc_length / 1000.0, 1.0)],
        industry_tags,
        tech_tags,
        task_reqs,
        [min(n_industries / len(INDUSTRIES), 1.0)],
        [min(project_age / 365.0, 1.0)],
        [min(active_engagements / 10.0, 1.0)],
    ])

    meta = {
        'stage_idx':        stage_idx,
        'industry_tags':    industry_tags,
        'task_reqs':        task_reqs,
        'stage_exp_target': stage_idx / 3.0,
    }

    return features, meta


def compute_interaction_features(tester_meta, project_meta):
    # behavioural industry overlap
    beh_overlap = np.dot(tester_meta['behavioural'], project_meta['industry_tags'])
    beh_union   = np.sum(np.clip(tester_meta['behavioural'] + project_meta['industry_tags'], 0, 1))
    beh_jaccard = beh_overlap / beh_union if beh_union > 0 else 0.0

    # self-reported industry overlap
    self_overlap = np.dot(tester_meta['self_industries'], project_meta['industry_tags'])
    self_union   = np.sum(np.clip(tester_meta['self_industries'] + project_meta['industry_tags'], 0, 1))
    self_jaccard = self_overlap / self_union if self_union > 0 else 0.0

    # task alignment
    task_dot   = np.dot(tester_meta['task_strengths'], project_meta['task_reqs'])
    task_max   = np.sum(project_meta['task_reqs'])
    task_align = task_dot / task_max if task_max > 0 else 0.0

    # stage fit
    stage_delta = abs(tester_meta['stage_exp_level'] - project_meta['stage_exp_target'])
    stage_fit   = max(0.0, 1.0 - stage_delta * 2.0)

    return np.array([beh_jaccard, self_jaccard, task_align, stage_fit], dtype=np.float32)


def compute_match_probability(tester_meta, project_meta):
    if tester_meta['quality_score'] < 2.0:
        return np.random.uniform(0.01, 0.08)
    if tester_meta['products_tested'] == 0:
        return np.random.uniform(0.01, 0.08)

    beh_overlap = np.dot(tester_meta['behavioural'], project_meta['industry_tags'])
    beh_union   = np.sum(np.clip(tester_meta['behavioural'] + project_meta['industry_tags'], 0, 1))
    beh_jaccard = beh_overlap / beh_union if beh_union > 0 else 0.0

    self_overlap = np.dot(tester_meta['self_industries'], project_meta['industry_tags'])
    self_union   = np.sum(np.clip(tester_meta['self_industries'] + project_meta['industry_tags'], 0, 1))
    self_jaccard = self_overlap / self_union if self_union > 0 else 0.0

    if beh_jaccard == 0.0 and self_jaccard == 0.0:
        return np.random.uniform(0.01, 0.06)

    industry_score = 0.45 * beh_jaccard + 0.10 * self_jaccard
    quality_score  = (tester_meta['quality_score'] / 5.0) * 0.25
    stage_delta    = abs(tester_meta['stage_exp_level'] - project_meta['stage_exp_target'])
    stage_score    = max(0.0, (1.0 - stage_delta * 2.0)) * 0.10
    task_alignment = np.dot(tester_meta['task_strengths'], project_meta['task_reqs'])
    task_max       = np.sum(project_meta['task_reqs'])
    task_score     = (task_alignment / task_max if task_max > 0 else 0.0) * 0.20

    raw   = industry_score + quality_score + stage_score + task_score
    noise = np.random.normal(0, 0.025)
    return float(np.clip(raw + noise, 0.0, 1.0))


def generate_dataset(n_pairs=N_PAIRS):
    print("Generating testers...")
    testers  = [generate_tester()  for _ in range(N_TESTERS)]
    print("Generating projects...")
    projects = [generate_project() for _ in range(N_PROJECTS)]

    tester_features  = np.array([t[0] for t in testers])
    project_features = np.array([p[0] for p in projects])
    tester_metas     = [t[1] for t in testers]
    project_metas    = [p[1] for p in projects]

    print("Generating pairs...")
    rows         = []
    interactions = []
    good_target  = int(n_pairs * 0.30)
    bad_target   = n_pairs - good_target
    good_count   = 0
    bad_count    = 0
    max_attempts = n_pairs * 20

    for _ in range(max_attempts):
        if good_count >= good_target and bad_count >= bad_target:
            break

        t_idx = np.random.randint(N_TESTERS)
        p_idx = np.random.randint(N_PROJECTS)
        prob  = compute_match_probability(tester_metas[t_idx], project_metas[p_idx])
        label = int(np.random.random() < prob)

        if label == 1 and good_count < good_target:
            rows.append({'tester_idx': t_idx, 'project_idx': p_idx,
                         'label': label, 'match_prob': prob})
            interactions.append(compute_interaction_features(
                tester_metas[t_idx], project_metas[p_idx]))
            good_count += 1
        elif label == 0 and bad_count < bad_target:
            rows.append({'tester_idx': t_idx, 'project_idx': p_idx,
                         'label': label, 'match_prob': prob})
            interactions.append(compute_interaction_features(
                tester_metas[t_idx], project_metas[p_idx]))
            bad_count += 1

    pairs_df             = pd.DataFrame(rows)
    interaction_features = np.array(interactions, dtype=np.float32)

    print(f"Generated {len(pairs_df)} pairs")
    print(f"Positive rate: {pairs_df['label'].mean():.2%}")
    print(f"Mean match prob (good): {pairs_df[pairs_df.label==1]['match_prob'].mean():.3f}")
    print(f"Mean match prob (bad):  {pairs_df[pairs_df.label==0]['match_prob'].mean():.3f}")

    return tester_features, project_features, pairs_df, interaction_features


if __name__ == '__main__':
    tester_features, project_features, pairs_df, interaction_features = generate_dataset()

    save_dir = os.path.dirname(os.path.abspath(__file__))
    np.save(os.path.join(save_dir, 'tester_features.npy'),       tester_features)
    np.save(os.path.join(save_dir, 'project_features.npy'),      project_features)
    np.save(os.path.join(save_dir, 'interaction_features.npy'),  interaction_features)
    pairs_df.to_csv(os.path.join(save_dir, 'pairs.csv'), index=False)
    print("Saved to data/")