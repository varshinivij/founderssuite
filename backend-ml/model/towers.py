import math
import tensorflow as tf
import keras
from keras import layers, Model


# ---------------------------------------------------------------------------
# Custom layers
# ---------------------------------------------------------------------------

@keras.saving.register_keras_serializable(package='towers')
class L2Normalise(layers.Layer):
    """L2-normalise along the embedding axis so dot product == cosine similarity."""

    def call(self, inputs):
        return tf.math.l2_normalize(inputs, axis=1)

    def get_config(self):
        return super().get_config()


@keras.saving.register_keras_serializable(package='towers')
class TemperatureScale(layers.Layer):
    """Learnable temperature applied to cosine similarity before BCE loss.

    Dividing by a small temperature sharpens the similarity distribution and
    makes the output act like an unbounded logit, so BinaryCrossentropy with
    from_logits=True is correct in train.py.

    Stored as log(T) to keep T strictly positive during gradient updates.
    """

    def __init__(self, init_temp: float = 0.07, **kwargs):
        super().__init__(**kwargs)
        self.init_temp = init_temp

    def build(self, input_shape):
        self.log_temp = self.add_weight(
            name='log_temperature',
            shape=(),
            initializer=keras.initializers.Constant(
                math.log(float(self.init_temp))
            ),
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        return inputs / tf.math.exp(self.log_temp)

    def get_config(self):
        return {**super().get_config(), 'init_temp': self.init_temp}


# ---------------------------------------------------------------------------
# Residual block
# ---------------------------------------------------------------------------

def _residual_block(x, units: int, dropout_rate: float = 0.2):
    """Pre-activation residual block: BN -> ReLU -> Dense -> Dropout (x2) + skip.

    Pre-activation ordering (He et al., 2016) avoids the double-BN problem in
    the original code where BN was applied to x both before and after Add.
    Dropout is placed after each activation, not before Dense, so the batch
    statistics seen by BN are not corrupted by dropped units.
    """
    residual = layers.Dense(units, use_bias=False)(x)

    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dense(units, use_bias=False)(x)
    x = layers.Dropout(dropout_rate)(x)

    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dense(units, use_bias=False)(x)
    x = layers.Dropout(dropout_rate)(x)

    return layers.Add()([x, residual])


# ---------------------------------------------------------------------------
# Shared tower builder
# ---------------------------------------------------------------------------

def _build_tower(
    input_dim: int,
    embedding_dim: int,
    name: str,
    l2: float = 1e-4,
) -> Model:
    reg = keras.regularizers.l2(l2)
    inputs = keras.Input(shape=(input_dim,), name=f'{name}_input')

    x = layers.Dense(256, kernel_regularizer=reg)(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.4)(x)

    x = _residual_block(x, units=128, dropout_rate=0.2)

    x = layers.Dense(embedding_dim, activation=None, kernel_regularizer=reg)(x)
    outputs = L2Normalise(name=f'{name}_embedding')(x)

    return Model(inputs, outputs, name=name)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_tester_tower(input_dim: int = 47, embedding_dim: int = 64) -> Model:
    return _build_tower(input_dim, embedding_dim, name='tester_tower')


def build_project_tower(input_dim: int = 39, embedding_dim: int = 64) -> Model:
    return _build_tower(input_dim, embedding_dim, name='project_tower')


def build_two_tower_model(
    tester_input_dim: int = 47,
    project_input_dim: int = 39,
    embedding_dim: int = 64,
) -> tuple[Model, Model, Model]:
    """Build the full two-tower model and return the individual towers too.

    Output pipeline:
        L2-normed embeddings
        -> Dot product (== cosine similarity, in [-1, 1])
        -> TemperatureScale  (output is unbounded -> use from_logits=True in train.py)

    Returns:
        (two_tower_model, tester_tower, project_tower)
    """
    tester_tower = build_tester_tower(tester_input_dim,  embedding_dim)
    project_tower = build_project_tower(project_input_dim, embedding_dim)

    tester_input = keras.Input(shape=(tester_input_dim,),  name='tester')
    project_input = keras.Input(shape=(project_input_dim,), name='project')

    tester_emb = tester_tower(tester_input)
    project_emb = project_tower(project_input)

    # normalize=False: L2 normalisation already happened inside each tower
    cosine_sim = layers.Dot(axes=1, normalize=False, name='cosine_similarity')(
        [tester_emb, project_emb]
    )

    # Temperature scaling renders the output unbounded, making it a valid logit
    output = TemperatureScale(init_temp=0.07, name='temperature')(cosine_sim)

    model = Model(
        inputs=[tester_input, project_input],
        outputs=output,
        name='two_tower_model',
    )
    return model, tester_tower, project_tower
