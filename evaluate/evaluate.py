import seaborn as sns
from sklearn.metrics import (
    precision_recall_curve,
    roc_auc_score,
    classification_report,
    confusion_matrix
)
from towers import L2Normalise
import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))), 'model'))


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')


def evaluate():
    tester_features = np.load(os.path.join(DATA_DIR, 'tester_features.npy'))
    project_features = np.load(os.path.join(DATA_DIR, 'project_features.npy'))
    pairs_df = pd.read_csv(os.path.join(DATA_DIR, 'pairs.csv'))

    model = tf.keras.models.load_model(
        os.path.join(DATA_DIR, 'best_model.keras'),
        custom_objects={'L2Normalise': L2Normalise}
    )

    t_idx = pairs_df['tester_idx'].values
    p_idx = pairs_df['project_idx'].values
    X_t = tester_features[t_idx].astype(np.float32)
    X_p = project_features[p_idx].astype(np.float32)
    y = pairs_df['label'].values

    probs = model.predict(
        {'tester': X_t, 'project': X_p},
        batch_size=512,
        verbose=0
    ).flatten()

    auc = roc_auc_score(y, probs)
    print(f"\nROC AUC: {auc:.4f}")

    precision, recall, thresholds = precision_recall_curve(y, probs)
    mask = recall[:-1] >= 0.30

    if mask.any():
        best_idx = np.argmax(precision[:-1][mask])
        best_threshold = thresholds[mask][best_idx]
        best_precision = precision[:-1][mask][best_idx]
        best_recall = recall[:-1][mask][best_idx]
    else:
        best_threshold = 0.5
        best_precision = 0.0
        best_recall = 0.0

    print(f"Optimal threshold: {best_threshold:.4f}")
    print(f"Precision at threshold: {best_precision:.4f}")
    print(f"Recall at threshold:    {best_recall:.4f}")

    preds = (probs >= best_threshold).astype(int)
    print("\nClassification report:")
    print(classification_report(
        y, preds, target_names=['bad match', 'good match']))

    plt.figure(figsize=(10, 4))

    plt.subplot(1, 2, 1)
    plt.plot(recall, precision, color='steelblue', lw=1.5)
    plt.axvline(best_recall, color='coral', linestyle='--',
                label=f'threshold={best_threshold:.2f}')
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-recall curve')
    plt.legend()

    plt.subplot(1, 2, 2)
    cm = confusion_matrix(y, preds)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['bad', 'good'],
                yticklabels=['bad', 'good'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion matrix')

    plt.tight_layout()
    plt.savefig(os.path.join(DATA_DIR, 'evaluation.png'), dpi=150)
    plt.show()

    print(f"\nSave this threshold to your scorer: {best_threshold:.4f}")
    return best_threshold


if __name__ == '__main__':
    evaluate()
