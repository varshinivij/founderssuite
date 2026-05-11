import os
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import recommend, feedback, embed
from app.models import towers

ML = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    model_dir = os.getenv("MODEL_DIR", "./data")
    try:
        ML["tester_tower"] = tf.keras.models.load_model(
            os.path.join(model_dir, "tester_tower.keras"),
            custom_objects={"L2Normalise": towers.L2Normalise}
        )
        ML["project_tower"] = tf.keras.models.load_model(
            os.path.join(model_dir, "project_tower.keras"),
            custom_objects={"L2Normalise": towers.L2Normalise}
        )
        print("Models loaded OK")
    except Exception as e:
        print(f"Model load failed: {e}")
    yield
    ML.clear()

app = FastAPI(
    title="FounderSuite Recommendation API",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recommend.router, prefix="/recommend", tags=["recommend"])
app.include_router(feedback.router,  prefix="/feedback",  tags=["feedback"])
app.include_router(embed.router,     prefix="/embed",     tags=["embed"])


@app.get("/health")
def health():
    return {
        "status": "ok",
        "tester_tower_loaded":  "tester_tower" in ML,
        "project_tower_loaded": "project_tower" in ML,
    }


def get_ml():
    return ML
