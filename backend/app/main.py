"""
HeartWise India - FastAPI Cardiac Risk Prediction API
Implements zero-logging privacy, strict range validation, model serving,
and safety disclaimers for adult cardiac risk screening in India.
"""

import os
import json
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Body
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

@app.get('/model/status', tags=['SYSDAG'])
async def sysdag_status():
    endpoint = os.getenv('SYSDAG_MODEL_API_URL', '').rstrip('/')
    if not endpoint:
        return {'available': False, 'message': 'SYSDAG model service is not configured.'}
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(f'{endpoint}/api/analysis/status')
            response.raise_for_status()
            data = response.json()
        return {'available': data.get('available') is True, 'formats': data.get('formats', [])}
    except (httpx.HTTPError, ValueError):
        return {'available': False, 'message': 'SYSDAG model service is unavailable.'}

@app.post('/model/analyze', tags=['SYSDAG'])
async def sysdag_analyze(payload: dict = Body(...)):
    endpoint = os.getenv('SYSDAG_MODEL_API_URL', '').rstrip('/')
    if not endpoint:
        raise HTTPException(status_code=503, detail='SYSDAG model service is not configured.')
    kind, content = payload.get('kind'), payload.get('content')
    if kind not in ('ecg', 'ehr', 'pdf', 'ecg-image') or not isinstance(content, str) or len(content.encode('utf-8')) > 4_100_000:
        raise HTTPException(status_code=400, detail='Choose a supported report under 3 MB.')
    try:
        async with httpx.AsyncClient(timeout=65.0) as client:
            response = await client.post(f'{endpoint}/api/analysis', json={'kind': kind, 'content': content})
            data = response.json()
            if kind == 'pdf' and response.is_success and data.get('success') and isinstance(data.get('result', {}).get('values'), dict):
                extraction = data['result']
                response = await client.post(f'{endpoint}/api/analysis', json={'kind': 'ehr', 'content': json.dumps(extraction['values'])})
                data = response.json()
                if response.is_success and data.get('success'):
                    data['result']['extraction'] = {'coverage': extraction.get('coverage'), 'missing_fields': extraction.get('missing_fields')}
        return JSONResponse(status_code=response.status_code, content=data, headers={'Cache-Control': 'no-store'})
    except (httpx.HTTPError, ValueError):
        raise HTTPException(status_code=503, detail='SYSDAG model service is unavailable.')

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
