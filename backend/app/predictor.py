"""
HeartWise India - ML Inference & Factor Explanation Engine
Loads calibrated models, computes predictions, performs feature attribution
via logistic coefficient decomposition, imputes optional values, and produces
patient-friendly explanations and lifestyle recommendations.
"""

import os
import json
import numpy as np
import pandas as pd
import joblib

from .schemas import (
    LifestyleInput,
    VitalsInput,
    PredictionResponse,
    FactorContribution,
    StateComparison
)

# Thresholds for risk bands (configurable)
RISK_BAND_LOW_MAX = 0.05      # < 5%
RISK_BAND_MODERATE_MAX = 0.15  # 5% - 15%, > 15% is high

BAND_COLORS = {
    "low": "#0d9488",       # Teal (healthy/lower risk)
    "moderate": "#d97706",  # Warm Amber
    "high": "#e11d48",      # Crimson Rose
}

DISCLAIMER_TEXT = (
    "This tool is for awareness, educational, and risk-screening purposes only. "
    "It is NOT a medical diagnosis. Individual biology varies. "
    "Please consult a certified cardiologist or general physician for comprehensive clinical evaluation."
)

class RiskPredictor:
    def __init__(self, models_dir: str):
        self.models_dir = models_dir
        self._load_artifacts()

    def _load_artifacts(self):
        metadata_path = os.path.join(self.models_dir, "metadata.json")
        state_risks_path = os.path.join(self.models_dir, "state_risks.json")
        model_a_path = os.path.join(self.models_dir, "model_a_lifestyle.joblib")
        model_b_path = os.path.join(self.models_dir, "model_b_vitals.joblib")
        pipe_a_path = os.path.join(self.models_dir, "pipe_a_base.joblib")
        pipe_b_path = os.path.join(self.models_dir, "pipe_b_base.joblib")

        with open(metadata_path, "r") as f:
            self.metadata = json.load(f)
        with open(state_risks_path, "r") as f:
            self.state_data = json.load(f)

        self.medians = self.metadata["medians"]
        self.model_version = self.metadata.get("version", "1.0.0")

        self.model_a = joblib.load(model_a_path)
        self.model_b = joblib.load(model_b_path)
        self.pipe_a = joblib.load(pipe_a_path)
        self.pipe_b = joblib.load(pipe_b_path)

    def get_states(self) -> dict:
        return self.state_data

    def _make_state_comparison(self, state_name: str) -> StateComparison:
        national_avg = self.state_data.get("national_average_risk", 0.1548)
        state_stats = self.state_data.get("state_risks", {}).get(state_name, {})
        state_avg = state_stats.get("mean_risk", national_avg)
        diff_pct = round((state_avg - national_avg) * 100, 1)

        if diff_pct > 0.5:
            text = f"In {state_name}, estimated adult cardiac disease prevalence is {round(state_avg * 100, 1)}%, which is {abs(diff_pct)}% higher than the national Indian average ({round(national_avg * 100, 1)}%)."
        elif diff_pct < -0.5:
            text = f"In {state_name}, estimated adult cardiac disease prevalence is {round(state_avg * 100, 1)}%, which is {abs(diff_pct)}% lower than the national Indian average ({round(national_avg * 100, 1)}%)."
        else:
            text = f"In {state_name}, estimated adult cardiac disease prevalence is {round(state_avg * 100, 1)}%, closely matching the national Indian average ({round(national_avg * 100, 1)}%)."

        return StateComparison(
            state=state_name,
            state_average_risk=round(state_avg * 100, 1),
            national_average_risk=round(national_avg * 100, 1),
            difference_percentage=diff_pct,
            comparison_text=text
        )

    def _get_band(self, prob: float) -> tuple[str, str]:
        if prob < RISK_BAND_LOW_MAX:
            return "low", BAND_COLORS["low"]
        elif prob <= RISK_BAND_MODERATE_MAX:
            return "moderate", BAND_COLORS["moderate"]
        else:
            return "high", BAND_COLORS["high"]

    def _explain_prediction(
        self,
        pipe,
        input_df: pd.DataFrame,
        is_model_b: bool = False
    ) -> list[FactorContribution]:
        """
        Decomposes logistic model log-odds into attributable feature contributions.
        """
        preprocessor = pipe.named_steps["preprocessor"]
        classifier = pipe.named_steps["classifier"]

        # Transform single row into scaled/encoded array
        transformed_row = preprocessor.transform(input_df)[0]
        coefs = classifier.coef_[0]

        # Get feature names from transformer
        feat_names = (
            self.metadata["model_b"]["feature_names"]
            if is_model_b
            else self.metadata["model_a"]["feature_names"]
        )

        contributions = []
        for name, val, coef in zip(feat_names, transformed_row, coefs):
            # contribution = coef * standardized_value
            score = float(coef * val)
            if abs(score) < 0.005:
                continue

            # Map raw feature names to human-readable labels, direction, and tips
            label, direction, tip = self._map_feature_attribution(name, val, score, input_df)
            contributions.append({
                "feature": name,
                "label": label,
                "direction": direction,
                "impact_score": abs(score),
                "raw_score": score,
                "tip": tip
            })

        # Sort by impact score descending
        contributions.sort(key=lambda x: x["impact_score"], reverse=True)
        top5 = contributions[:5]
        total_impact = sum(c["impact_score"] for c in top5) or 1.0

        result = []
        for c in top5:
            pct = round((c["impact_score"] / total_impact) * 100, 1)
            result.append(
                FactorContribution(
                    feature=c["feature"],
                    label=c["label"],
                    direction=c["direction"],
                    impact_score=round(c["impact_score"], 3),
                    percentage_contribution=pct,
                    tip=c["tip"]
                )
            )
        return result

    def _map_feature_attribution(self, name: str, val: float, score: float, input_df: pd.DataFrame):
        direction = "raises" if score > 0 else "lowers"

        # Categorize by feature group
        if "age" in name:
            age_val = int(input_df["age"].iloc[0])
            label = f"Age ({age_val} years)"
            tip = "Maintain regular cardiovascular health check-ups every 6 to 12 months."
        elif "bmi" in name:
            bmi_val = float(input_df["bmi"].iloc[0])
            if bmi_val >= 25.0:
                label = f"Elevated BMI ({bmi_val} kg/m²)"
                tip = "A 5-10% gradual weight loss significantly reduces cardiac and vascular workload."
            else:
                label = f"Healthy BMI ({bmi_val} kg/m²)"
                tip = "Continue balanced caloric intake to sustain normal body mass index."
        elif "tobacco_smoking" in name:
            smk = int(input_df["tobacco_smoking"].iloc[0])
            if smk == 2:
                label = "Active tobacco smoking"
                tip = "Quitting smoking is the single fastest way to cut your cardiac event risk in half within 1 year."
            elif smk == 1:
                label = "Past smoking history"
                tip = "Staying smoke-free protects your endothelial vessels from further arterial damage."
            else:
                label = "Non-smoker status"
                tip = "Avoiding second-hand smoke preserves your healthy arterial lining."
        elif "smokeless_tobacco" in name:
            label = "Smokeless tobacco usage (gutkha/khaini)"
            tip = "Nicotine and heavy chemical agents in gutkha trigger vasoconstriction; cessation counseling is strongly recommended."
        elif "alcohol" in name:
            alc = int(input_df["alcohol"].iloc[0])
            if alc == 2:
                label = "Heavy alcohol consumption"
                tip = "Reducing alcohol intake eases blood pressure and lowers risk of cardiomyopathy."
            else:
                label = "Low or no alcohol consumption"
                tip = "Maintaining moderation prevents elevation of resting heart rate and blood pressure."
        elif "physical_activity" in name:
            act = int(input_df["physical_activity_min_per_week"].iloc[0])
            if act >= 150:
                label = f"Regular physical activity ({act} min/wk)"
                tip = "Keep up at least 150-300 mins of weekly brisk walking or aerobic exercise."
            else:
                label = f"Low physical activity ({act} min/wk)"
                tip = "Aim for at least 30 minutes of brisk walking 5 days a week to condition heart muscle."
        elif "diet_quality" in name:
            dq = int(input_df["diet_quality"].iloc[0])
            if dq == 3:
                label = "Cardio-protective diet"
                tip = "Continue emphasizing whole grains, pulses, green leafy vegetables, and unrefined oils."
            else:
                label = "Refined / high-fat diet"
                tip = "Swap deep-fried street foods and sugary beverages with fiber-rich millets, oats, and fresh salads."
        elif "stress_level" in name:
            st = int(input_df["stress_level"].iloc[0])
            if st == 3:
                label = "High chronic stress"
                tip = "Incorporate 10-15 minutes of daily pranayama (deep breathing), yoga, or mindfulness meditation."
            else:
                label = "Controlled stress level"
                tip = "Adequate rest and mindfulness keep autonomic nervous stress responses balanced."
        elif "sleep_hours" in name:
            sh = float(input_df["sleep_hours"].iloc[0])
            label = f"Sleep duration ({sh} hrs/night)"
            tip = "Target 7 to 8 hours of consistent, uninterrupted sleep to support vascular repair."
        elif "family_history" in name:
            label = "Family history of early heart disease"
            tip = "Early hereditary predisposition can be strongly mitigated by strict control of lifestyle factors."
        elif "diabetes" in name:
            label = "History of Diabetes"
            tip = "Maintain tight glycemic control (HbA1c < 6.5-7.0%) to prevent micro- and macro-vascular injury."
        elif "hypertension" in name:
            label = "History of Hypertension"
            tip = "Monitor blood pressure regularly at home and adopt the low-sodium DASH eating plan."
        elif "systolic_bp" in name:
            sbp = int(input_df["systolic_bp"].iloc[0])
            label = f"Systolic Blood Pressure ({sbp} mmHg)"
            tip = "Target systolic BP below 120-130 mmHg through reduced dietary salt and stress management."
        elif "diastolic_bp" in name:
            dbp = int(input_df["diastolic_bp"].iloc[0])
            label = f"Diastolic Blood Pressure ({dbp} mmHg)"
            tip = "Maintaining diastolic BP below 80 mmHg reduces arterial stiffness and cardiac afterload."
        elif "resting_heart_rate" in name:
            hr = int(input_df["resting_heart_rate"].iloc[0])
            label = f"Resting Heart Rate ({hr} bpm)"
            tip = "Regular aerobic conditioning and reducing stimulants (caffeine/nicotine) helps lower resting pulse."
        elif "spo2" in name:
            ox = int(input_df["spo2"].iloc[0])
            label = f"Oxygen Saturation SpO2 ({ox}%)"
            tip = "Ensure good ventilation, treat any obstructive sleep apnea, and avoid smoking."
        elif "ecg_finding" in name:
            ecg = str(input_df["ecg_finding"].iloc[0])
            ecg_labels = {
                "normal": "Normal ECG pattern",
                "st_t_changes": "ECG ST-T Wave Changes (possible ischemia)",
                "arrhythmia": "ECG Cardiac Arrhythmia detected",
                "lvh": "ECG Left Ventricular Hypertrophy (LVH)",
                "q_waves": "ECG Pathological Q-Waves (possible prior infarction)",
            }
            label = ecg_labels.get(ecg, f"ECG Finding ({ecg})")
            tip = "Share this ECG report with a cardiologist for a 12-lead ECG review and echocardiogram."
        elif "ldl" in name:
            ldl = float(input_df["ldl_cholesterol"].iloc[0])
            label = f"LDL Cholesterol ({ldl} mg/dL)"
            tip = "Reduce saturated fats and trans-fats; discuss lipid-lowering therapy with your doctor."
        elif "hba1c" in name:
            a1c = float(input_df["hba1c"].iloc[0])
            label = f"HbA1c Blood Sugar ({a1c}%)"
            tip = "Follow a low-glycemic Indian meal plan and consult a physician for metabolic optimization."
        elif "state" in name:
            st_name = str(input_df["state"].iloc[0])
            label = f"Regional baseline factor ({st_name})"
            tip = "Regional dietary habits and epidemiological trends influence community risk."
        else:
            label = name.replace("_", " ").title()
            tip = "Adopt wholesome lifestyle habits and schedule regular preventative check-ups."

        return label, direction, tip

    def predict_lifestyle(self, data: LifestyleInput) -> PredictionResponse:
        # Check emergency red-flags
        if data.has_red_flags:
            return PredictionResponse(
                risk_probability=1.0,
                risk_percentage=100.0,
                risk_band="high",
                band_color=BAND_COLORS["high"],
                top_factors=[],
                assumed_inputs=[],
                practical_tips=[
                    "Seek immediate emergency medical care now. Call 112 (National Emergency Number, India).",
                    "Do not drive yourself to the hospital; have someone drive you or wait for an ambulance.",
                    "Rest comfortably while emergency medical help is on the way."
                ],
                model_version=self.model_version,
                state_comparison=self._make_state_comparison(data.state),
                urgent_care_needed=True,
                disclaimer="EMERGENCY ALERT: Immediate clinical medical evaluation required."
            )

        assumed = []
        # Compute BMI
        bmi = round(data.weight_kg / ((data.height_cm / 100.0) ** 2), 1)

        # Impute optional lifestyle inputs
        activity = data.physical_activity_min_per_week
        if activity is None:
            activity = int(self.medians.get("physical_activity_min_per_week", 125))
            assumed.append("Weekly physical activity (assumed national average: 125 min/wk)")

        sleep = data.sleep_hours
        if sleep is None:
            sleep = float(self.medians.get("sleep_hours", 6.8))
            assumed.append("Sleep duration (assumed average: 6.8 hrs/night)")

        # Prepare DataFrame matching training schema
        row_dict = {
            "age": [data.age],
            "bmi": [bmi],
            "physical_activity_min_per_week": [activity],
            "sleep_hours": [sleep],
            "sex": [data.sex],
            "urban_rural": [data.urban_rural],
            "state": [data.state],
            "tobacco_smoking": [data.tobacco_smoking],
            "smokeless_tobacco": [data.smokeless_tobacco],
            "alcohol": [data.alcohol],
            "diet_quality": [data.diet_quality],
            "stress_level": [data.stress_level],
            "family_history_cardiac": [data.family_history_cardiac],
            "diabetes": [data.diabetes],
            "hypertension": [data.hypertension],
        }
        df_row = pd.DataFrame(row_dict)

        # Calibrated probability
        prob = float(self.model_a.predict_proba(df_row)[0, 1])
        prob_clamped = max(0.001, min(0.999, prob))
        band, color = self._get_band(prob_clamped)

        # Explain top factors
        top_factors = self._explain_prediction(self.pipe_a, df_row, is_model_b=False)

        # Extract top practical tips from the top factors
        practical_tips = [f.tip for f in top_factors if f.direction == "raises"][:3]
        if len(practical_tips) < 3:
            for f in top_factors:
                if f.tip not in practical_tips:
                    practical_tips.append(f.tip)
                if len(practical_tips) == 3:
                    break

        return PredictionResponse(
            risk_probability=round(prob_clamped, 4),
            risk_percentage=round(prob_clamped * 100.0, 1),
            risk_band=band,
            band_color=color,
            top_factors=top_factors,
            assumed_inputs=assumed,
            practical_tips=practical_tips,
            model_version=self.model_version,
            state_comparison=self._make_state_comparison(data.state),
            urgent_care_needed=False,
            disclaimer=DISCLAIMER_TEXT
        )

    def predict_vitals(self, data: VitalsInput) -> PredictionResponse:
        # Check emergency red-flags
        if data.has_red_flags:
            return PredictionResponse(
                risk_probability=1.0,
                risk_percentage=100.0,
                risk_band="high",
                band_color=BAND_COLORS["high"],
                top_factors=[],
                assumed_inputs=[],
                practical_tips=[
                    "Seek immediate emergency medical care now. Call 112 (National Emergency Number, India).",
                    "Do not drive yourself to the hospital; call for an ambulance immediately.",
                    "Rest quietly while emergency services are en route."
                ],
                model_version=self.model_version,
                state_comparison=self._make_state_comparison(data.state),
                urgent_care_needed=True,
                disclaimer="EMERGENCY ALERT: Immediate clinical medical evaluation required."
            )

        assumed = []
        bmi = round(data.weight_kg / ((data.height_cm / 100.0) ** 2), 1)

        # Impute optional lifestyle inputs
        activity = data.physical_activity_min_per_week
        if activity is None:
            activity = int(self.medians.get("physical_activity_min_per_week", 125))
            assumed.append("Weekly physical activity (assumed: 125 min/wk)")

        sleep = data.sleep_hours
        if sleep is None:
            sleep = float(self.medians.get("sleep_hours", 6.8))
            assumed.append("Sleep duration (assumed: 6.8 hrs/night)")

        # Impute optional vitals inputs
        sbp = data.systolic_bp
        if sbp is None:
            sbp = int(self.medians.get("systolic_bp", 140))
            assumed.append("Systolic Blood Pressure (assumed median: 140 mmHg)")

        dbp = data.diastolic_bp
        if dbp is None:
            dbp = int(self.medians.get("diastolic_bp", 85))
            assumed.append("Diastolic Blood Pressure (assumed median: 85 mmHg)")

        hr = data.resting_heart_rate
        if hr is None:
            hr = int(self.medians.get("resting_heart_rate", 78))
            assumed.append("Resting Heart Rate (assumed median: 78 bpm)")

        spo2 = data.spo2
        if spo2 is None:
            spo2 = int(self.medians.get("spo2", 97))
            assumed.append("SpO2 Blood Oxygen (assumed median: 97%)")

        ecg = data.ecg_finding or "normal"

        ldl = data.ldl_cholesterol
        if ldl is None:
            ldl = float(self.medians.get("ldl_cholesterol", 124.0))
            assumed.append("LDL Cholesterol (assumed standard: 124 mg/dL)")

        hba1c = data.hba1c
        if hba1c is None:
            hba1c = float(self.medians.get("hba1c", 6.0))
            assumed.append("HbA1c Blood Sugar (assumed standard: 6.0%)")

        row_dict = {
            "age": [data.age],
            "bmi": [bmi],
            "physical_activity_min_per_week": [activity],
            "sleep_hours": [sleep],
            "systolic_bp": [sbp],
            "diastolic_bp": [dbp],
            "resting_heart_rate": [hr],
            "spo2": [spo2],
            "ldl_cholesterol": [ldl],
            "hba1c": [hba1c],
            "sex": [data.sex],
            "urban_rural": [data.urban_rural],
            "state": [data.state],
            "tobacco_smoking": [data.tobacco_smoking],
            "smokeless_tobacco": [data.smokeless_tobacco],
            "alcohol": [data.alcohol],
            "diet_quality": [data.diet_quality],
            "stress_level": [data.stress_level],
            "family_history_cardiac": [data.family_history_cardiac],
            "diabetes": [data.diabetes],
            "hypertension": [data.hypertension],
            "ecg_finding": [ecg]
        }
        df_row = pd.DataFrame(row_dict)

        prob = float(self.model_b.predict_proba(df_row)[0, 1])
        prob_clamped = max(0.001, min(0.999, prob))
        band, color = self._get_band(prob_clamped)

        top_factors = self._explain_prediction(self.pipe_b, df_row, is_model_b=True)

        practical_tips = [f.tip for f in top_factors if f.direction == "raises"][:3]
        if len(practical_tips) < 3:
            for f in top_factors:
                if f.tip not in practical_tips:
                    practical_tips.append(f.tip)
                if len(practical_tips) == 3:
                    break

        return PredictionResponse(
            risk_probability=round(prob_clamped, 4),
            risk_percentage=round(prob_clamped * 100.0, 1),
            risk_band=band,
            band_color=color,
            top_factors=top_factors,
            assumed_inputs=assumed,
            practical_tips=practical_tips,
            model_version=self.model_version,
            state_comparison=self._make_state_comparison(data.state),
            urgent_care_needed=False,
            disclaimer=DISCLAIMER_TEXT
        )
