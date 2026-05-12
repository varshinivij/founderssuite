import os
import sys

# Must come before local imports so the model package is on the path
ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
MODEL_DIR = os.path.join(ROOT, 'models')
sys.path.insert(0, ROOT)

import keras
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    precision_recall_curve,
    roc_auc_score,
    classification_report,
    confusion_matrix,
)

# Importing towers registers L2Normalise and TemperatureScale via
# @keras.saving.register_keras_serializable — required before load_model.
from model.towers import L2Normalise, TemperatureScale  # noqa: F401


def evaluate():
    # ------------------------------------------------------------------
    # Load data
    # ------------------------------------------------------------------
    required = {
        'tester_features.npy':  os.path.join(DATA_DIR, 'tester_features.npy'),
        'project_features.npy': os.path.join(DATA_DIR, 'project_features.npy'),
        'pairs.csv':            os.path.join(DATA_DIR, 'pairs.csv'),
        'best_model.keras':     os.path.join(MODEL_DIR, 'best_model.keras'),
    }
    missing = [name for name, path in required.items() if not os.path.exists(path)]
    if missing:
        raise FileNotFoundError(
            f"Missing files: {', '.join(missing)}\n"
            "Run generate.py then train.py first."
        )

    tester_features  = np.load(required['tester_features.npy'])
    project_features = np.load(required['project_features.npy'])
    pairs_df         = pd.read_csv(required['pairs.csv'])

    # ------------------------------------------------------------------
    # Load model
    # ------------------------------------------------------------------
    # custom_objects is not needed here because both custom layers are
    # already registered via @keras.saving.register_keras_serializable.
    # Keeping it would also require passing TemperatureScale, so drop it.
    model = keras.saving.load_model(required['best_model.keras'])

    # ------------------------------------------------------------------
    # Build inputs
    # ------------------------------------------------------------------
    t_idx = pairs_df['tester_idx'].values
    p_idx = pairs_df['project_idx'].values
    X_t   = tester_features[t_idx].astype(np.float32)
    X_p   = project_features[p_idx].astype(np.float32)
    y     = pairs_df['label'].values

    # ------------------------------------------------------------------
    # Predict
    # ------------------------------------------------------------------
    # Model outputs temperature-scaled logits; apply sigmoid to get
    # probabilities before threshold search.
    logits = model.predict(
        {'tester': X_t, 'project': X_p},
        batch_size=512,
        verbose=0,
    ).flatten()
    probs = 1.0 / (1.0 + np.exp(-logits))   # sigmoid

    # ------------------------------------------------------------------
    # Metrics
    # ------------------------------------------------------------------
    auc = roc_auc_score(y, probs)
    print(f"\nROC AUC: {auc:.4f}")

    precision, recall, thresholds = precision_recall_curve(y, probs)
    mask = recall[:-1] >= 0.30

    if mask.any():
        best_idx       = np.argmax(precision[:-1][mask])
        best_threshold = float(thresholds[mask][best_idx])
        best_precision = float(precision[:-1][mask][best_idx])
        best_recall    = float(recall[:-1][mask][best_idx])
    else:
        print("Warning: no threshold achieves recall >= 0.30; defaulting to 0.5")
        best_threshold = 0.5
        best_precision = 0.0
        best_recall    = 0.0

    print(f"Optimal threshold: {best_threshold:.4f}")
    print(f"Precision at threshold: {best_precision:.4f}")
    print(f"Recall at threshold:    {best_recall:.4f}")

    preds = (probs >= best_threshold).astype(int)
    print("\nClassification report:")
    print(classification_report(y, preds, target_names=['bad match', 'good match']))

    # ------------------------------------------------------------------
    # Plots
    # ------------------------------------------------------------------
    fig, axes = plt.subplots(1, 2, figsize=(10, 4))

    axes[0].plot(recall, precision, color='steelblue', lw=1.5)
    axes[0].axvline(
        best_recall, color='coral', linestyle='--',
        label=f'threshold={best_threshold:.2f}',
    )
    axes[0].set_xlabel('Recall')
    axes[0].set_ylabel('Precision')
    axes[0].set_title('Precision-recall curve')
    axes[0].legend()

    cm = confusion_matrix(y, preds)
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues', ax=axes[1],
        xticklabels=['bad', 'good'],
        yticklabels=['bad', 'good'],
    )
    axes[1].set_xlabel('Predicted')
    axes[1].set_ylabel('Actual')
    axes[1].set_title('Confusion matrix')

    plt.tight_layout()
    out_path = os.path.join(MODEL_DIR, 'evaluation.png')
    plt.savefig(out_path, dpi=150)
    plt.close(fig)   # don't block if running non-interactively
    print(f"\nPlot saved to {out_path}")

    print(f"Save this threshold to your scorer: {best_threshold:.4f}")
    return best_threshold


if __name__ == '__main__':
    evaluate()