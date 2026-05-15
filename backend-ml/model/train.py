from towers import build_two_tower_model
from sklearn.model_selection import train_test_split
import tensorflow as tf
import pandas as pd
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
MODEL_DIR = os.path.join(ROOT, 'models')


def load_data():
    required = {
        'tester_features.npy':  os.path.join(DATA_DIR, 'tester_features.npy'),
        'project_features.npy': os.path.join(DATA_DIR, 'project_features.npy'),
        'pairs.csv':            os.path.join(DATA_DIR, 'pairs.csv'),
    }
    missing = [name for name, path in required.items()
               if not os.path.exists(path)]
    if missing:
        raise FileNotFoundError(
            f"Missing data files in {DATA_DIR}: {', '.join(missing)}\n"
            "Run generate.py first."
        )

    tester_features = np.load(required['tester_features.npy'])
    project_features = np.load(required['project_features.npy'])
    pairs_df = pd.read_csv(required['pairs.csv'])
    return tester_features, project_features, pairs_df


def prepare_inputs(tester_features, project_features, pairs_df):
    t_idx = pairs_df['tester_idx'].values
    p_idx = pairs_df['project_idx'].values
    X_t = tester_features[t_idx].astype(np.float32)
    X_p = project_features[p_idx].astype(np.float32)
    y = pairs_df['label'].values.astype(np.float32)
    return X_t, X_p, y


def make_sample_weights(y: np.ndarray) -> np.ndarray:
    """Balanced per-sample weights (replaces class_weight= to avoid silent Keras override)."""
    n_pos = y.sum()
    n_neg = len(y) - n_pos
    w_pos = len(y) / (2.0 * n_pos) if n_pos > 0 else 1.0
    w_neg = len(y) / (2.0 * n_neg) if n_neg > 0 else 1.0
    weights = np.where(y == 1, w_pos, w_neg).astype(np.float32)
    print(f"Sample weights  — positive: {w_pos:.4f}, negative: {w_neg:.4f}")
    return weights


def train(verbose: int = 1):
    os.makedirs(MODEL_DIR, exist_ok=True)

    tester_features, project_features, pairs_df = load_data()
    X_t, X_p, y = prepare_inputs(tester_features, project_features, pairs_df)

    tester_dim = X_t.shape[1]
    project_dim = X_p.shape[1]
    print(f"Tester feature dim:  {tester_dim}")
    print(f"Project feature dim: {project_dim}")

    idx = np.arange(len(y))
    train_idx, val_idx = train_test_split(
        idx, test_size=0.2, stratify=y, random_state=42
    )

    X_t_train, X_t_val = X_t[train_idx], X_t[val_idx]
    X_p_train, X_p_val = X_p[train_idx], X_p[val_idx]
    y_train,   y_val = y[train_idx],   y[val_idx]
    sample_weights_train = make_sample_weights(y_train)

    model, tester_tower, project_tower = build_two_tower_model(
        tester_input_dim=tester_dim,
        project_input_dim=project_dim,
    )


    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
        metrics=[
            tf.keras.metrics.AUC(name='auc'),
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
        ],
    )

    best_model_path = os.path.join(MODEL_DIR, 'best_model.keras')

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_auc',
            patience=10,
            mode='max',
            restore_best_weights=True,
        ),

        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_auc',
            mode='max',
            factor=0.5,
            patience=4,
            min_lr=1e-6,
        ),
        tf.keras.callbacks.ModelCheckpoint(
            best_model_path,
            monitor='val_auc',
            save_best_only=True,
            mode='max',
        ),
    ]

    history = model.fit(
        {'tester': X_t_train, 'project': X_p_train},
        y_train,
        validation_data=(
            {'tester': X_t_val, 'project': X_p_val},
            y_val,
        ),
        epochs=50,
        batch_size=128,
        # class_weight= NOT passed (would be silently overridden)
        sample_weight=sample_weights_train,
        callbacks=callbacks,
        verbose=verbose,
    )

    model = tf.keras.models.load_model(best_model_path)
    tester_tower = model.get_layer('tester_tower')
    project_tower = model.get_layer('project_tower')

    tester_tower.save(os.path.join(MODEL_DIR,  'tester_tower.keras'))
    project_tower.save(os.path.join(MODEL_DIR, 'project_tower.keras'))

    best_auc = max(history.history['val_auc'])
    print(f"\nTraining complete.  Best val AUC: {best_auc:.4f}")
    print(f"Models saved to {MODEL_DIR}")

    return history


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--quiet', action='store_true',
                        help='Suppress per-epoch output')
    args = parser.parse_args()
    train(verbose=0 if args.quiet else 1)
