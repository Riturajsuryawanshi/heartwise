"""
HeartWise India - FastAPI Cardiac Risk Prediction API
Implements zero-logging privacy, strict range validation, model serving,
and safety disclaimers for adult cardiac risk screening in India.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .schemas import (
    LifestyleInput,
    VitalsInput,
    PredictionResponse,
    VALID_STATES
)
from .predictor import RiskPredictor

# Locate models relative to this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "ml", "models"))

predictor: RiskPredictor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global predictor
    print(f"Initializing HeartWise RiskPredictor from {MODELS_DIR}...")
    predictor = RiskPredictor(models_dir=MODELS_DIR)
    yield
    print("HeartWise India API shutting down.")

app = FastAPI(
    title="HeartWise India API",
    description="Calibrated Cardiac Disease Risk Screening and Factor Attribution Service for Indian Adults",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    """Health status and service availability."""
    return {
        "status": "healthy",
        "service": "HeartWise India API",
        "version": "1.0.0",
        "models_loaded": predictor is not None
    }

@app.get("/states", tags=["Epidemiological Reference"])
def get_states():
    """Returns available Indian states with their estimated population cardiac baseline data."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    return predictor.get_states()

@app.post(
    "/predict/lifestyle",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"]
)
def predict_lifestyle(payload: LifestyleInput):
    """
    Predicts cardiac risk using Model A (Lifestyle factors).
    Zero-logging enforced: user personal input is processed in memory and never persisted.
    """
    if not predictor:
        raise HTTPException(status_code=503, detail="Prediction engine unavailable")
    try:
        response = predictor.predict_lifestyle(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post(
    "/predict/vitals",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    tags=["Prediction"]
)
def predict_vitals(payload: VitalsInput):
    """
    Predicts refined cardiac risk using Model B (Lifestyle + Vitals + ECG findings).
    Zero-logging enforced: user personal input is processed in memory and never persisted.
    """
    if not predictor:
        raise HTTPException(status_code=503, detail="Prediction engine unavailable")
    try:
        response = predictor.predict_vitals(payload)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
