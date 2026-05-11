from sklearn.utils.class_weight import compute_class_weight
from sklearn.model_selection import train_test_split
from towers import build_two_tower_model
import numpy as np
import pandas as pd
import tensorflow as tf
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')


def load_data():
    tester_features = np.load(os.path.join(DATA_DIR, 'tester_features.npy'))
    project_features = np.load(os.path.join(DATA_DIR, 'project_features.npy'))
    pairs_df = pd.read_csv(os.path.join(DATA_DIR, 'pairs.csv'))
    return tester_features, project_features, pairs_df


def prepare_inputs(tester_features, project_features, pairs_df):
    t_idx = pairs_df['tester_idx'].values
    p_idx = pairs_df['project_idx'].values
    X_t = tester_features[t_idx].astype(np.float32)
    X_p = project_features[p_idx].astype(np.float32)
    y = pairs_df['label'].values.astype(np.float32)
    return X_t, X_p, y


def train():
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
    y_train, y_val = y[train_idx],   y[val_idx]

    classes = np.unique(y_train)
    class_weights = compute_class_weight(
        'balanced', classes=classes, y=y_train)
    class_weight_dict = dict(zip(classes.astype(int), class_weights))
    print(f"Class weights: {class_weight_dict}")

    model, tester_tower, project_tower = build_two_tower_model(
        tester_input_dim=tester_dim,
        project_input_dim=project_dim
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),        metrics=[
            tf.keras.metrics.AUC(name='auc'),
            tf.keras.metrics.Precision(name='precision'),
            tf.keras.metrics.Recall(name='recall'),
        ]
    )

    callbacks = [
        tf.keras.callbacks.EarlyStopping(
            monitor='val_auc',
            patience=5,
            mode='max',
            restore_best_weights=True
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_auc', mode="max",
            factor=0.5,
            patience=3,
            min_lr=1e-6
        ),
        tf.keras.callbacks.ModelCheckpoint(
            os.path.join(DATA_DIR, 'best_model.keras'),
            monitor='val_auc',
            save_best_only=True,
            mode='max'
        )
    ]

    history = model.fit(
        {'tester': X_t_train, 'project': X_p_train},
        y_train,
        validation_data=(
            {'tester': X_t_val, 'project': X_p_val},
            y_val
        ),
        epochs=50,
        batch_size=128,
        sample_weight=np.where(

            y_train == 1,

            class_weight_dict[1],

            class_weight_dict[0]),
        callbacks=callbacks,
        verbose=1
    )

    tester_tower.save(os.path.join(DATA_DIR,  'tester_tower.keras'))
    project_tower.save(os.path.join(DATA_DIR, 'project_tower.keras'))

    print("\nTraining complete.")
    print(f"Best val AUC: {max(history.history['val_auc']):.4f}")

    return history


if __name__ == '__main__':
    train()
