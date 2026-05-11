import tensorflow as tf
from tensorflow.keras import layers, Model


class L2Normalise(layers.Layer):
    def call(self, inputs):
        return tf.math.l2_normalize(inputs, axis=1)
    def get_config(self):
        return super().get_config()


def build_tester_tower(input_dim=47, embedding_dim=64):
    inputs = tf.keras.Input(shape=(input_dim,), name='tester_input')

    x = layers.Dense(256, activation='relu')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)

    residual = layers.Dense(128)(x)
    x = layers.Dense(128)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(128)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Add()([x, residual])
    x = layers.Activation('relu')(x)

    x = layers.Dense(embedding_dim, activation=None)(x)  # linear — no ReLU before L2
    outputs = L2Normalise(name='tester_embedding')(x)
    return Model(inputs, outputs, name='tester_tower')


def build_project_tower(input_dim=39, embedding_dim=64):  # 39 after removing hardcoded 1.0
    inputs = tf.keras.Input(shape=(input_dim,), name='project_input')

    x = layers.Dense(256, activation='relu')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x) # was 0.3

    residual = layers.Dense(128)(x)
    x = layers.Dense(128)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(128)(x)
    x = layers.BatchNormalization()(x)
    x = layers.Add()([x, residual])
    x = layers.Activation('relu')(x)

    x = layers.Dense(embedding_dim, activation=None)(x)  # linear — no ReLU before L2
    outputs = L2Normalise(name='project_embedding')(x)
    return Model(inputs, outputs, name='project_tower')


def build_two_tower_model(tester_input_dim=47, project_input_dim=39, embedding_dim=64):
    tester_tower  = build_tester_tower(tester_input_dim, embedding_dim)
    project_tower = build_project_tower(project_input_dim, embedding_dim)

    tester_input  = tf.keras.Input(shape=(tester_input_dim,),  name='tester')
    project_input = tf.keras.Input(shape=(project_input_dim,), name='project')

    tester_emb  = tester_tower(tester_input)
    project_emb = project_tower(project_input)

    similarity = layers.Dot(axes=1, normalize=False, name='similarity')(
        [tester_emb, project_emb]
    )

    model = Model(
        inputs=[tester_input, project_input],
        outputs=similarity,
        name='two_tower_model'
    )
    return model, tester_tower, project_tower