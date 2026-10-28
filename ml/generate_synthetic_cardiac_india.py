"""
Synthetic Indian Cardiac Risk Dataset Generator
Generates realistic population-level synthetic data for 300,000 Indian adults
across 24 states with lifestyle, vitals, ECG findings, and cardiac disease outcomes.
"""

import os
import numpy as np
import pandas as pd

def generate_data(num_samples: int = 300_000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    print(f"Generating {num_samples:,} synthetic records...")

    # 24 Indian States
    states = [
        "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
        "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
        "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ]

    # Population weighting (approximate relative demographic distribution)
    state_weights = [
        0.045, 0.025, 0.085, 0.020, 0.020,
        0.005, 0.050, 0.025, 0.010, 0.010,
        0.028, 0.055, 0.030, 0.060, 0.088,
        0.035, 0.025, 0.058, 0.058, 0.035,
        0.005, 0.155, 0.012, 0.069
    ]
    state_weights = np.array(state_weights) / sum(state_weights)

    assigned_states = np.random.choice(states, size=num_samples, p=state_weights)

    # State baseline risk offset (e.g. Kerala, Punjab, Tamil Nadu, Delhi have higher CVD prevalence in ICMR studies)
    state_risk_modifier = {
        "Kerala": 0.40,
        "Punjab": 0.35,
        "Tamil Nadu": 0.30,
        "Delhi": 0.28,
        "Goa": 0.25,
        "Andhra Pradesh": 0.20,
        "Telangana": 0.20,
        "Maharashtra": 0.18,
        "Gujarat": 0.15,
        "Haryana": 0.15,
        "West Bengal": 0.12,
        "Karnataka": 0.10,
        "Himachal Pradesh": 0.05,
        "Uttarakhand": 0.02,
        "Jammu and Kashmir": 0.00,
        "Odisha": -0.05,
        "Madhya Pradesh": -0.05,
        "Rajasthan": -0.08,
        "Chhattisgarh": -0.10,
        "Assam": -0.10,
        "Tripura": -0.12,
        "Uttar Pradesh": -0.12,
        "Jharkhand": -0.15,
        "Bihar": -0.18,
    }

    # Demographics
    age = np.random.triangular(left=18, mode=42, right=88, size=num_samples).astype(int)
    sex = np.random.choice(["male", "female"], size=num_samples, p=[0.51, 0.49])
    
    # Urban / Rural split (approx 36% urban in India overall, higher in Delhi/Goa)
    urban_prob = np.where(np.isin(assigned_states, ["Delhi", "Goa"]), 0.85,
                 np.where(np.isin(assigned_states, ["Maharashtra", "Tamil Nadu", "Gujarat", "Karnataka"]), 0.48, 0.30))
    urban_rural = np.where(np.random.rand(num_samples) < urban_prob, "urban", "rural")

    # Anthropometry: height & weight (Indian adult distributions)
    male_mask = (sex == "male")
    height_cm = np.empty(num_samples)
    height_cm[male_mask] = np.random.normal(loc=168.0, scale=7.0, size=male_mask.sum())
    height_cm[~male_mask] = np.random.normal(loc=154.0, scale=6.5, size=(~male_mask).sum())
    height_cm = np.clip(np.round(height_cm, 1), 130, 205)

    # Base BMI with urban shift and age influence
    base_bmi = np.random.normal(loc=23.5, scale=4.0, size=num_samples)
    base_bmi += (urban_rural == "urban") * 1.5
    base_bmi += (age - 30) * 0.05
    base_bmi = np.clip(base_bmi, 15.0, 48.0)

    # Weight derived from BMI
    weight_kg = np.round(base_bmi * ((height_cm / 100.0) ** 2), 1)
    weight_kg = np.clip(weight_kg, 35.0, 145.0)
    # Recalculate exact BMI
    bmi = np.round(weight_kg / ((height_cm / 100.0) ** 2), 1)

    # Lifestyle Habits
    # Tobacco smoking: 0=never, 1=former, 2=current (higher among males in India)
    tobacco_smoking = np.zeros(num_samples, dtype=int)
    smoking_prob_male = [0.65, 0.12, 0.23]
    smoking_prob_female = [0.95, 0.03, 0.02]
    tobacco_smoking[male_mask] = np.random.choice([0, 1, 2], size=male_mask.sum(), p=smoking_prob_male)
    tobacco_smoking[~male_mask] = np.random.choice([0, 1, 2], size=(~male_mask).sum(), p=smoking_prob_female)

    # Smokeless tobacco: 0=no, 1=yes (gutkha, khaini, paan masala - common across genders and rural areas)
    smokeless_base_prob = np.where(urban_rural == "rural", 0.22, 0.12)
    smokeless_prob = np.where(male_mask, smokeless_base_prob * 1.5, smokeless_base_prob * 0.6)
    smokeless_tobacco = (np.random.rand(num_samples) < smokeless_prob).astype(int)

    # Alcohol: 0=never, 1=moderate, 2=heavy
    alcohol = np.zeros(num_samples, dtype=int)
    alc_p_male = [0.65, 0.25, 0.10]
    alc_p_female = [0.96, 0.035, 0.005]
    alcohol[male_mask] = np.random.choice([0, 1, 2], size=male_mask.sum(), p=alc_p_male)
    alcohol[~male_mask] = np.random.choice([0, 1, 2], size=(~male_mask).sum(), p=alc_p_female)

    # Physical activity minutes / week (0 - 600+)
    act_mean = np.where(urban_rural == "rural", 220, 130)
    physical_activity_min_per_week = np.clip(
        np.random.exponential(scale=act_mean, size=num_samples).astype(int), 0, 720
    )

    # Diet Quality: 1=poor (high ultra-processed/fried/sugar), 2=average, 3=healthy (vegetables/millets/pulses/fruits)
    diet_quality = np.random.choice([1, 2, 3], size=num_samples, p=[0.32, 0.48, 0.20])

    # Stress level: 1=low, 2=moderate, 3=high (urban tends higher)
    stress_p_urban = [0.20, 0.45, 0.35]
    stress_p_rural = [0.35, 0.45, 0.20]
    stress_level = np.empty(num_samples, dtype=int)
    stress_level[urban_rural == "urban"] = np.random.choice([1, 2, 3], size=(urban_rural == "urban").sum(), p=stress_p_urban)
    stress_level[urban_rural == "rural"] = np.random.choice([1, 2, 3], size=(urban_rural == "rural").sum(), p=stress_p_rural)

    # Sleep hours: 4 to 10
    sleep_hours = np.clip(np.round(np.random.normal(loc=6.8, scale=1.1, size=num_samples), 1), 4.0, 10.0)

    # Family history of cardiac disease: 0=no, 1=yes
    family_history_prob = 0.18 + (urban_rural == "urban") * 0.05
    family_history_cardiac = (np.random.rand(num_samples) < family_history_prob).astype(int)

    # Self-reported diabetes & hypertension
    # Strongly age and BMI dependent
    diabetes_logit = -4.5 + (age * 0.045) + ((bmi - 22) * 0.09) + (family_history_cardiac * 0.5)
    diabetes_prob = 1.0 / (1.0 + np.exp(-diabetes_logit))
    diabetes = (np.random.rand(num_samples) < diabetes_prob).astype(int)

    htn_logit = -4.0 + (age * 0.052) + ((bmi - 22) * 0.08) + (tobacco_smoking * 0.2) + (family_history_cardiac * 0.4)
    htn_prob = 1.0 / (1.0 + np.exp(-htn_logit))
    hypertension = (np.random.rand(num_samples) < htn_prob).astype(int)

    # --- Vitals and ECG Findings ---
    # Systolic and Diastolic Blood Pressure
    base_sbp = 114 + (age * 0.35) + ((bmi - 22) * 0.7) + (hypertension * 22) + (stress_level * 2.5)
    systolic_bp = np.clip(np.round(np.random.normal(loc=base_sbp, scale=9.0)), 70, 240).astype(int)

    base_dbp = 72 + (age * 0.15) + ((bmi - 22) * 0.4) + (hypertension * 12) + (stress_level * 1.5)
    diastolic_bp = np.clip(np.round(np.random.normal(loc=base_dbp, scale=7.0)), 45, 140).astype(int)
    # Ensure SBP > DBP
    systolic_bp = np.maximum(systolic_bp, diastolic_bp + 15)

    # Resting Heart Rate (bpm): normal 60-100, influenced by stress, activity, smoking
    base_hr = 74 - (physical_activity_min_per_week / 150.0) * 3 + (tobacco_smoking * 4) + (stress_level * 3) + (diabetes * 3)
    resting_heart_rate = np.clip(np.round(np.random.normal(loc=base_hr, scale=9.0)), 45, 135).astype(int)

    # SpO2 (%): normal 95-99, lower with smoking, severe obesity, lung/cardiac strain
    base_spo2 = 98.2 - (tobacco_smoking * 1.1) - (np.maximum(0, bmi - 28) * 0.15) - (age * 0.015)
    spo2 = np.clip(np.round(np.random.normal(loc=base_spo2, scale=1.2)), 84, 100).astype(int)

    # ECG findings: normal, st_t_changes, arrhythmia, lvh, q_waves
    # Probabilities driven by age, hypertension, diabetes, smoking
    ecg_abnormal_score = (
        (age - 40) * 0.04 +
        hypertension * 0.7 +
        diabetes * 0.6 +
        (tobacco_smoking == 2) * 0.5 +
        (systolic_bp > 140) * 0.5
    )
    # Base multinomial logits
    # Categories: normal (0), st_t_changes (1), arrhythmia (2), lvh (3), q_waves (4)
    logits_normal = 2.4 - ecg_abnormal_score
    logits_st_t = 0.2 + 0.4 * ecg_abnormal_score
    logits_arrhythmia = 0.1 + 0.35 * ecg_abnormal_score + (resting_heart_rate > 95) * 0.6
    logits_lvh = -0.5 + 0.55 * ecg_abnormal_score + (hypertension * 0.8)
    logits_q_waves = -1.2 + 0.6 * ecg_abnormal_score + (family_history_cardiac * 0.5)

    ecg_logits = np.stack([logits_normal, logits_st_t, logits_arrhythmia, logits_lvh, logits_q_waves], axis=1)
    # Softmax
    ecg_exp = np.exp(ecg_logits - np.max(ecg_logits, axis=1, keepdims=True))
    ecg_probs = ecg_exp / np.sum(ecg_exp, axis=1, keepdims=True)

    ecg_choices = ["normal", "st_t_changes", "arrhythmia", "lvh", "q_waves"]
    # Efficient multinomial choice
    cum_probs = np.cumsum(ecg_probs, axis=1)
    uniform_draws = np.random.rand(num_samples, 1)
    ecg_idx = (uniform_draws > cum_probs).sum(axis=1)
    ecg_idx = np.clip(ecg_idx, 0, 4)
    ecg_finding = np.array(ecg_choices)[ecg_idx]

    # Optional clinical lab markers: LDL cholesterol (mg/dL) & HbA1c (%)
    base_ldl = 115 + (diet_quality == 1) * 18 - (diet_quality == 3) * 15 + ((bmi - 22) * 1.5) + (diabetes * 15)
    ldl_cholesterol = np.clip(np.round(np.random.normal(loc=base_ldl, scale=28.0), 1), 50.0, 290.0)

    base_hba1c = 5.3 + (diabetes * 2.3) + ((bmi - 22) * 0.05) + (age * 0.01)
    hba1c = np.clip(np.round(np.random.normal(loc=base_hba1c, scale=0.6), 1), 4.2, 14.0)

    # --- Target: Cardiac Disease (Outcome) ---
    # Log-odds calculation with clinical weighting
    state_arr_offset = np.array([state_risk_modifier.get(s, 0.0) for s in assigned_states])

    log_odds = -5.8  # Baseline intercept giving ~9-11% prevalence
    log_odds += (age - 45) * 0.058
    log_odds += (male_mask) * 0.45
    log_odds += state_arr_offset
    log_odds += (urban_rural == "urban") * 0.20
    log_odds += np.maximum(0, bmi - 23.0) * 0.065
    log_odds += (tobacco_smoking == 1) * 0.35 + (tobacco_smoking == 2) * 0.85
    log_odds += smokeless_tobacco * 0.40
    log_odds += (alcohol == 2) * 0.40 + (alcohol == 1) * 0.08
    log_odds -= (physical_activity_min_per_week / 150.0) * 0.32
    log_odds += (diet_quality == 1) * 0.35 - (diet_quality == 3) * 0.30
    log_odds += (stress_level == 3) * 0.45 + (stress_level == 2) * 0.15
    log_odds += (sleep_hours < 6.0) * 0.30 + (sleep_hours > 9.0) * 0.15
    log_odds += family_history_cardiac * 0.75
    log_odds += diabetes * 0.80
    log_odds += hypertension * 0.70

    # Vitals and ECG effects
    log_odds += np.maximum(0, systolic_bp - 120) * 0.022
    log_odds += np.maximum(0, diastolic_bp - 80) * 0.015
    log_odds += np.maximum(0, resting_heart_rate - 80) * 0.025
    log_odds += np.maximum(0, 95 - spo2) * 0.12

    # ECG finding effects
    ecg_odds_map = {
        "normal": 0.0,
        "st_t_changes": 0.85,
        "arrhythmia": 0.75,
        "lvh": 0.95,
        "q_waves": 1.45,
    }
    ecg_effect = np.array([ecg_odds_map[e] for e in ecg_finding])
    log_odds += ecg_effect

    # Lab effects
    log_odds += np.maximum(0, ldl_cholesterol - 100) * 0.005
    log_odds += np.maximum(0, hba1c - 5.7) * 0.18

    # Final Probability & Binary Target
    prob_disease = 1.0 / (1.0 + np.exp(-log_odds))
    cardiac_disease = (np.random.rand(num_samples) < prob_disease).astype(int)

    df = pd.DataFrame({
        "age": age,
        "sex": sex,
        "state": assigned_states,
        "urban_rural": urban_rural,
        "height_cm": height_cm,
        "weight_kg": weight_kg,
        "bmi": bmi,
        "tobacco_smoking": tobacco_smoking,
        "smokeless_tobacco": smokeless_tobacco,
        "alcohol": alcohol,
        "physical_activity_min_per_week": physical_activity_min_per_week,
        "diet_quality": diet_quality,
        "stress_level": stress_level,
        "sleep_hours": sleep_hours,
        "family_history_cardiac": family_history_cardiac,
        "diabetes": diabetes,
        "hypertension": hypertension,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "resting_heart_rate": resting_heart_rate,
        "spo2": spo2,
        "ecg_finding": ecg_finding,
        "ldl_cholesterol": ldl_cholesterol,
        "hba1c": hba1c,
        "cardiac_disease": cardiac_disease
    })

    print(f"Data generated successfully!")
    print(f"Total rows: {len(df):,}")
    print(f"Cardiac Disease Prevalence: {df['cardiac_disease'].mean():.2%}")
    print(f"States count: {df['state'].nunique()}")
    print(f"ECG findings breakdown:\n{df['ecg_finding'].value_counts(normalize=True)}")
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_csv = os.path.join(out_dir, "synthetic_cardiac_india.csv")

    df = generate_data(num_samples=300_000, random_seed=42)
    print(f"Saving to {out_csv}...")
    df.to_csv(out_csv, index=False)
    print("CSV saved successfully.")
