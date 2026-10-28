"""
HeartWise India - Pydantic Request and Response Schemas
Provides strict validation, descriptive error messages, and type safety.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

VALID_STATES = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

ECG_FINDINGS = ["normal", "st_t_changes", "arrhythmia", "lvh", "q_waves"]

class LifestyleInput(BaseModel):
    # Demographics
    age: int = Field(..., ge=18, le=90, description="Age in completed years (18-90)")
    sex: str = Field(..., description="Biological sex ('male' or 'female')")
    state: str = Field(..., description="Indian state of residence")
    urban_rural: str = Field(..., description="'urban' or 'rural'")
    
    # Body measurements
    height_cm: float = Field(..., ge=120.0, le=220.0, description="Height in centimeters (120-220)")
    weight_kg: float = Field(..., ge=30.0, le=180.0, description="Weight in kilograms (30-180)")

    # Habits
    tobacco_smoking: int = Field(..., ge=0, le=2, description="0=Never, 1=Former, 2=Current")
    smokeless_tobacco: int = Field(..., ge=0, le=1, description="0=No, 1=Yes (Gutkha, khaini, paan masala)")
    alcohol: int = Field(..., ge=0, le=2, description="0=Never, 1=Moderate, 2=Heavy")
    
    # Optional habits (will impute with median if omitted/null)
    physical_activity_min_per_week: Optional[int] = Field(
        None, ge=0, le=1440, description="Active moderate-to-vigorous exercise mins/week"
    )
    diet_quality: int = Field(..., ge=1, le=3, description="1=Poor, 2=Average, 3=Healthy")
    stress_level: int = Field(..., ge=1, le=3, description="1=Low, 2=Moderate, 3=High")
    sleep_hours: Optional[float] = Field(
        None, ge=3.0, le=16.0, description="Average sleep per night in hours"
    )

    # Health History
    family_history_cardiac: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    diabetes: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")
    hypertension: int = Field(..., ge=0, le=1, description="0=No, 1=Yes")

    # Safety red-flag
    has_red_flags: Optional[bool] = Field(
        False, description="Emergency symptoms (chest pain, breathlessness at rest, fainting)"
    )

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ["male", "female"]:
            raise ValueError("Sex must be either 'male' or 'female'")
        return clean

    @field_validator("urban_rural")
    @classmethod
    def validate_urban_rural(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ["urban", "rural"]:
            raise ValueError("urban_rural must be 'urban' or 'rural'")
        return clean

    @field_validator("state")
    @classmethod
    def validate_state(cls, v: str) -> str:
        clean = v.strip()
        if clean not in VALID_STATES:
            raise ValueError(f"State '{clean}' is not recognized. Please choose from standard 24 states.")
        return clean


class VitalsInput(LifestyleInput):
    # Model B features (vitals and clinical lab markers)
    systolic_bp: Optional[int] = Field(
        None, ge=70, le=260, description="Systolic Blood Pressure (mmHg) (70-260)"
    )
    diastolic_bp: Optional[int] = Field(
        None, ge=40, le=160, description="Diastolic Blood Pressure (mmHg) (40-160)"
    )
    resting_heart_rate: Optional[int] = Field(
        None, ge=40, le=180, description="Resting Heart Rate (bpm) (40-180)"
    )
    spo2: Optional[int] = Field(
        None, ge=70, le=100, description="Blood Oxygen Saturation (%) (70-100)"
    )
    ecg_finding: Optional[str] = Field(
        "normal", description="ECG finding category (normal, st_t_changes, arrhythmia, lvh, q_waves)"
    )
    ldl_cholesterol: Optional[float] = Field(
        None, ge=30.0, le=350.0, description="LDL Cholesterol (mg/dL) (optional)"
    )
    hba1c: Optional[float] = Field(
        None, ge=4.0, le=16.0, description="Glycated Hemoglobin HbA1c (%) (optional)"
    )

    @field_validator("ecg_finding")
    @classmethod
    def validate_ecg(cls, v: Optional[str]) -> str:
        if v is None:
            return "normal"
        clean = v.strip().lower()
        if clean not in ECG_FINDINGS:
            raise ValueError(f"ecg_finding must be one of {ECG_FINDINGS}")
        return clean


class FactorContribution(BaseModel):
    feature: str
    label: str
    direction: str  # 'raises' or 'lowers'
    impact_score: float
    percentage_contribution: float
    tip: str


class StateComparison(BaseModel):
    state: str
    state_average_risk: float
    national_average_risk: float
    difference_percentage: float
    comparison_text: str


class PredictionResponse(BaseModel):
    risk_probability: float = Field(..., ge=0.0, le=1.0)
    risk_percentage: float = Field(..., ge=0.0, le=100.0)
    risk_band: str  # 'low' | 'moderate' | 'high'
    band_color: str  # hex color code
    top_factors: List[FactorContribution]
    assumed_inputs: List[str]
    practical_tips: List[str]
    model_version: str
    state_comparison: Optional[StateComparison] = None
    urgent_care_needed: bool = False
    disclaimer: str


class StateInfo(BaseModel):
    name: str
    mean_risk: float
    relative_to_national: float
