"""
HeartWise India - API Test Suite
Tests validation constraints, prediction score ranges (0 to 1),
red-flag emergency handling, optional field imputation, and state endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HeartWise India API"

def test_get_states(client):
    response = client.get("/states")
    assert response.status_code == 200
    data = response.json()
    assert "national_average_risk" in data
    assert "state_risks" in data
    assert len(data["state_risks"]) == 24
    assert "Maharashtra" in data["state_risks"]
    assert "Kerala" in data["state_risks"]

def test_predict_lifestyle_valid(client):
    payload = {
        "age": 45,
        "sex": "male",
        "state": "Maharashtra",
        "urban_rural": "urban",
        "height_cm": 172.0,
        "weight_kg": 76.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 1,
        "physical_activity_min_per_week": 180,
        "diet_quality": 2,
        "stress_level": 2,
        "sleep_hours": 7.0,
        "family_history_cardiac": 0,
        "diabetes": 0,
        "hypertension": 0,
        "has_red_flags": False
    }
    response = client.post("/predict/lifestyle", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert 0.0 <= res["risk_probability"] <= 1.0
    assert 0.0 <= res["risk_percentage"] <= 100.0
    assert res["risk_band"] in ["low", "moderate", "high"]
    assert len(res["top_factors"]) > 0
    assert len(res["top_factors"]) <= 5
    for factor in res["top_factors"]:
        assert factor["direction"] in ["raises", "lowers"]
        assert "label" in factor
        assert factor["impact_score"] >= 0
    assert res["model_version"] == "1.0.0"
    assert res["urgent_care_needed"] is False
    assert "consult a doctor" in res["disclaimer"].lower() or "clinical evaluation" in res["disclaimer"].lower()

def test_predict_lifestyle_optional_imputation(client):
    # Omit optional physical_activity and sleep_hours
    payload = {
        "age": 52,
        "sex": "female",
        "state": "Kerala",
        "urban_rural": "rural",
        "height_cm": 158.0,
        "weight_kg": 62.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 0,
        "diet_quality": 3,
        "stress_level": 1,
        "family_history_cardiac": 1,
        "diabetes": 0,
        "hypertension": 1
    }
    response = client.post("/predict/lifestyle", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert 0.0 <= res["risk_probability"] <= 1.0
    assert len(res["assumed_inputs"]) >= 2
    assert any("activity" in a.lower() for a in res["assumed_inputs"])
    assert any("sleep" in a.lower() for a in res["assumed_inputs"])

def test_predict_vitals_valid(client):
    payload = {
        "age": 58,
        "sex": "male",
        "state": "Tamil Nadu",
        "urban_rural": "urban",
        "height_cm": 168.0,
        "weight_kg": 82.0,
        "tobacco_smoking": 2,
        "smokeless_tobacco": 1,
        "alcohol": 2,
        "physical_activity_min_per_week": 30,
        "diet_quality": 1,
        "stress_level": 3,
        "sleep_hours": 5.5,
        "family_history_cardiac": 1,
        "diabetes": 1,
        "hypertension": 1,
        "systolic_bp": 165,
        "diastolic_bp": 98,
        "resting_heart_rate": 88,
        "spo2": 94,
        "ecg_finding": "st_t_changes",
        "ldl_cholesterol": 160.0,
        "hba1c": 8.2
    }
    response = client.post("/predict/vitals", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert 0.0 <= res["risk_probability"] <= 1.0
    assert res["risk_band"] in ["low", "moderate", "high"]
    assert res["risk_band"] == "high"  # multiple high risk factors
    assert len(res["top_factors"]) > 0

def test_red_flag_emergency_handling(client):
    payload = {
        "age": 50,
        "sex": "male",
        "state": "Delhi",
        "urban_rural": "urban",
        "height_cm": 170.0,
        "weight_kg": 70.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 0,
        "diet_quality": 2,
        "stress_level": 2,
        "family_history_cardiac": 0,
        "diabetes": 0,
        "hypertension": 0,
        "has_red_flags": True  # emergency active symptoms!
    }
    response = client.post("/predict/lifestyle", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["urgent_care_needed"] is True
    assert any("112" in tip for tip in res["practical_tips"])
    assert "emergency" in res["disclaimer"].lower()

def test_validation_error_age_out_of_range(client):
    payload = {
        "age": 12,  # Invalid: below 18
        "sex": "male",
        "state": "Delhi",
        "urban_rural": "urban",
        "height_cm": 170.0,
        "weight_kg": 70.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 0,
        "diet_quality": 2,
        "stress_level": 2,
        "family_history_cardiac": 0,
        "diabetes": 0,
        "hypertension": 0
    }
    response = client.post("/predict/lifestyle", json=payload)
    assert response.status_code == 422
    assert "age" in response.text.lower()

def test_validation_error_systolic_out_of_range(client):
    payload = {
        "age": 45,
        "sex": "male",
        "state": "Delhi",
        "urban_rural": "urban",
        "height_cm": 170.0,
        "weight_kg": 70.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 0,
        "diet_quality": 2,
        "stress_level": 2,
        "family_history_cardiac": 0,
        "diabetes": 0,
        "hypertension": 0,
        "systolic_bp": 350  # Invalid: > 260
    }
    response = client.post("/predict/vitals", json=payload)
    assert response.status_code == 422
    assert "systolic_bp" in response.text.lower()

def test_validation_error_invalid_state(client):
    payload = {
        "age": 45,
        "sex": "male",
        "state": "InvalidStateLand",
        "urban_rural": "urban",
        "height_cm": 170.0,
        "weight_kg": 70.0,
        "tobacco_smoking": 0,
        "smokeless_tobacco": 0,
        "alcohol": 0,
        "diet_quality": 2,
        "stress_level": 2,
        "family_history_cardiac": 0,
        "diabetes": 0,
        "hypertension": 0
    }
    response = client.post("/predict/lifestyle", json=payload)
    assert response.status_code == 422
    assert "state" in response.text.lower()
