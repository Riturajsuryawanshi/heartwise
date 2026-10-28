"""
Training Pipeline for HeartWise India Cardiac Risk Models
Trains calibrated Model A (Lifestyle) and Model B (Vitals + ECG),
evaluates against Gradient Boosting, calculates subpopulation metrics,
generates calibration curves, and exports models and reports.
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import roc_auc_score, brier_score_loss, log_loss
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

# Define Feature Sets
LIFESTYLE_NUMERIC = ["age", "bmi", "physical_activity_min_per_week", "sleep_hours"]
LIFESTYLE_CATEGORICAL = [
    "sex", "urban_rural", "state",
    "tobacco_smoking", "smokeless_tobacco", "alcohol",
    "diet_quality", "stress_level",
    "family_history_cardiac", "diabetes", "hypertension"
]

VITALS_NUMERIC = [
    "systolic_bp", "diastolic_bp", "resting_heart_rate", "spo2",
    "ldl_cholesterol", "hba1c"
]
VITALS_CATEGORICAL = ["ecg_finding"]

def train_and_evaluate(data_path: str, models_dir: str, reports_dir: str):
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    print(f"Loading dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")

    # Calculate national & state statistics for insights card
    national_mean_risk = float(df["cardiac_disease"].mean())
    state_stats = df.groupby("state")["cardiac_disease"].agg(["count", "mean"]).reset_index()
    state_risks = {
        row["state"]: {
            "count": int(row["count"]),
            "mean_risk": round(float(row["mean"]), 4),
            "relative_to_national": round(float(row["mean"] - national_mean_risk) * 100, 1)
        }
        for _, row in state_stats.iterrows()
    }

    # Save state risks to JSON for API and frontend
    state_risks_path = os.path.join(models_dir, "state_risks.json")
    with open(state_risks_path, "w") as f:
        json.dump({
            "national_average_risk": round(national_mean_risk, 4),
            "state_risks": state_risks
        }, f, indent=2)
    print(f"Saved state risks to {state_risks_path}")

    # Compute training medians for optional/missing imputations
    medians_a = {col: float(df[col].median()) for col in LIFESTYLE_NUMERIC}
    medians_b = {col: float(df[col].median()) for col in VITALS_NUMERIC}
    overall_medians = {**medians_a, **medians_b}

    # Stratified Train/Test Split (80/20) with fixed seed
    train_df, test_df = train_test_split(
        df, test_size=0.20, random_state=42, stratify=df["cardiac_disease"]
    )
    print(f"Train samples: {len(train_df):,}, Test samples: {len(test_df):,}")

    y_train = train_df["cardiac_disease"].values
    y_test = test_df["cardiac_disease"].values

    # -------------------------------------------------------------
    # MODEL A: Lifestyle Model
    # -------------------------------------------------------------
    print("\n--- Training Model A (Lifestyle) ---")
    feat_a_num = LIFESTYLE_NUMERIC
    feat_a_cat = LIFESTYLE_CATEGORICAL
    X_train_a = train_df[feat_a_num + feat_a_cat]
    X_test_a = test_df[feat_a_num + feat_a_cat]

    preprocessor_a = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), feat_a_num),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), feat_a_cat),
        ]
    )

    # Base Logistic Regression
    base_lr_a = LogisticRegression(max_iter=1000, C=0.5, random_state=42)
    pipe_a_base = Pipeline([
        ("preprocessor", preprocessor_a),
        ("classifier", base_lr_a)
    ])
    pipe_a_base.fit(X_train_a, y_train)

    # Calibrate using Platt scaling (sigmoid)
    model_a_calibrated = CalibratedClassifierCV(estimator=pipe_a_base, method="sigmoid", cv=5)
    model_a_calibrated.fit(X_train_a, y_train)

    # Gradient Boosting comparison for Model A
    print("Training Gradient Boosting comparison for Model A...")
    X_train_a_proc = preprocessor_a.fit_transform(X_train_a)
    X_test_a_proc = preprocessor_a.transform(X_test_a)
    gb_a = HistGradientBoostingClassifier(max_iter=150, random_state=42)
    gb_a.fit(X_train_a_proc, y_train)

    # -------------------------------------------------------------
    # MODEL B: Vitals + ECG Model
    # -------------------------------------------------------------
    print("\n--- Training Model B (Vitals + ECG) ---")
    feat_b_num = LIFESTYLE_NUMERIC + VITALS_NUMERIC
    feat_b_cat = LIFESTYLE_CATEGORICAL + VITALS_CATEGORICAL
    X_train_b = train_df[feat_b_num + feat_b_cat]
    X_test_b = test_df[feat_b_num + feat_b_cat]

    preprocessor_b = ColumnTransformer(
        transformers=[
            ("num", Pipeline([("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]), feat_b_num),
            ("cat", OneHotEncoder(drop="first", sparse_output=False, handle_unknown="ignore"), feat_b_cat),
        ]
    )

    base_lr_b = LogisticRegression(max_iter=1000, C=0.5, random_state=42)
    pipe_b_base = Pipeline([
        ("preprocessor", preprocessor_b),
        ("classifier", base_lr_b)
    ])
    pipe_b_base.fit(X_train_b, y_train)

    # Calibrate using Platt scaling
    model_b_calibrated = CalibratedClassifierCV(estimator=pipe_b_base, method="sigmoid", cv=5)
    model_b_calibrated.fit(X_train_b, y_train)

    # Gradient Boosting comparison for Model B
    print("Training Gradient Boosting comparison for Model B...")
    X_train_b_proc = preprocessor_b.fit_transform(X_train_b)
    X_test_b_proc = preprocessor_b.transform(X_test_b)
    gb_b = HistGradientBoostingClassifier(max_iter=150, random_state=42)
    gb_b.fit(X_train_b_proc, y_train)

    # -------------------------------------------------------------
    # EVALUATION & METRICS
    # -------------------------------------------------------------
    print("\n--- Evaluating Models on Test Set ---")
    # Predictions
    pred_prob_a_base = pipe_a_base.predict_proba(X_test_a)[:, 1]
    pred_prob_a_cal = model_a_calibrated.predict_proba(X_test_a)[:, 1]
    pred_prob_a_gb = gb_a.predict_proba(X_test_a_proc)[:, 1]

    pred_prob_b_base = pipe_b_base.predict_proba(X_test_b)[:, 1]
    pred_prob_b_cal = model_b_calibrated.predict_proba(X_test_b)[:, 1]
    pred_prob_b_gb = gb_b.predict_proba(X_test_b_proc)[:, 1]

    metrics = {
        "model_version": "1.0.0",
        "dataset_size": len(df),
        "test_size": len(test_df),
        "national_mean_prevalence": round(national_mean_risk, 4),
        "medians": overall_medians,
        "model_a_lifestyle": {
            "logistic_regression_uncalibrated": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_a_base)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_a_base)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_a_base)), 4),
            },
            "logistic_regression_calibrated": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_a_cal)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_a_cal)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_a_cal)), 4),
            },
            "gradient_boosting_comparison": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_a_gb)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_a_gb)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_a_gb)), 4),
            }
        },
        "model_b_vitals_ecg": {
            "logistic_regression_uncalibrated": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_b_base)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_b_base)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_b_base)), 4),
            },
            "logistic_regression_calibrated": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_b_cal)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_b_cal)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_b_cal)), 4),
            },
            "gradient_boosting_comparison": {
                "auc": round(float(roc_auc_score(y_test, pred_prob_b_gb)), 4),
                "brier_score": round(float(brier_score_loss(y_test, pred_prob_b_gb)), 4),
                "log_loss": round(float(log_loss(y_test, pred_prob_b_gb)), 4),
            }
        }
    }

    # Subpopulation Breakdown: AUC per sex
    auc_by_sex = {}
    for s in ["male", "female"]:
        mask = (test_df["sex"].values == s)
        auc_a = float(roc_auc_score(y_test[mask], pred_prob_a_cal[mask]))
        auc_b = float(roc_auc_score(y_test[mask], pred_prob_b_cal[mask]))
        auc_by_sex[s] = {
            "model_a_auc": round(auc_a, 4),
            "model_b_auc": round(auc_b, 4),
            "samples": int(mask.sum())
        }
    metrics["auc_by_sex"] = auc_by_sex

    # Subpopulation Breakdown: AUC per state
    auc_by_state = {}
    for st in sorted(test_df["state"].unique()):
        mask = (test_df["state"].values == st)
        if len(np.unique(y_test[mask])) > 1:
            auc_a = float(roc_auc_score(y_test[mask], pred_prob_a_cal[mask]))
            auc_b = float(roc_auc_score(y_test[mask], pred_prob_b_cal[mask]))
        else:
            auc_a, auc_b = 0.5, 0.5
        auc_by_state[st] = {
            "model_a_auc": round(auc_a, 4),
            "model_b_auc": round(auc_b, 4),
            "samples": int(mask.sum())
        }
    metrics["auc_by_state"] = auc_by_state

    # Calibration curves (10 bins)
    prob_true_a, prob_pred_a = calibration_curve(y_test, pred_prob_a_cal, n_bins=10)
    prob_true_b, prob_pred_b = calibration_curve(y_test, pred_prob_b_cal, n_bins=10)

    metrics["calibration_curve"] = {
        "model_a": {
            "prob_pred": [round(float(p), 4) for p in prob_pred_a],
            "prob_true": [round(float(p), 4) for p in prob_true_a]
        },
        "model_b": {
            "prob_pred": [round(float(p), 4) for p in prob_pred_b],
            "prob_true": [round(float(p), 4) for p in prob_true_b]
        }
    }

    # Save metrics JSON
    metrics_path = os.path.join(reports_dir, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_path}")

    # Generate Calibration Curve Plot PNG
    plt.figure(figsize=(10, 6), dpi=150)
    plt.plot([0, 1], [0, 1], "k--", label="Perfect Calibration (Ideal)", alpha=0.7)
    plt.plot(prob_pred_a, prob_true_a, "s-", color="#0284c7", lw=2, label=f"Model A (Lifestyle) - Brier: {metrics['model_a_lifestyle']['logistic_regression_calibrated']['brier_score']}")
    plt.plot(prob_pred_b, prob_true_b, "o-", color="#e11d48", lw=2, label=f"Model B (Vitals+ECG) - Brier: {metrics['model_b_vitals_ecg']['logistic_regression_calibrated']['brier_score']}")
    plt.xlabel("Mean Predicted Probability", fontsize=12, fontweight="medium")
    plt.ylabel("Fraction of Positives (Observed Frequency)", fontsize=12, fontweight="medium")
    plt.title("HeartWise India - Model Calibration Reliability Curves (Platt Scaled)", fontsize=14, fontweight="bold", pad=12)
    plt.grid(True, linestyle=":", alpha=0.6)
    plt.legend(loc="lower right", fontsize=11, frameon=True)
    plt.tight_layout()

    plot_path = os.path.join(reports_dir, "calibration_plot.png")
    plt.savefig(plot_path)
    plt.close()
    print(f"Calibration plot saved to {plot_path}")

    # Extract feature names & coefficients for fast, explainable inference
    ohe_a = pipe_a_base.named_steps["preprocessor"].named_transformers_["cat"]
    feat_names_a = list(feat_a_num) + list(ohe_a.get_feature_names_out(feat_a_cat))
    coefs_a = pipe_a_base.named_steps["classifier"].coef_[0]

    ohe_b = pipe_b_base.named_steps["preprocessor"].named_transformers_["cat"]
    feat_names_b = list(feat_b_num) + list(ohe_b.get_feature_names_out(feat_b_cat))
    coefs_b = pipe_b_base.named_steps["classifier"].coef_[0]

    metadata = {
        "version": "1.0.0",
        "medians": overall_medians,
        "model_a": {
            "feature_names": feat_names_a,
            "coefficients": {name: round(float(c), 5) for name, c in zip(feat_names_a, coefs_a)},
            "intercept": round(float(pipe_a_base.named_steps["classifier"].intercept_[0]), 5)
        },
        "model_b": {
            "feature_names": feat_names_b,
            "coefficients": {name: round(float(c), 5) for name, c in zip(feat_names_b, coefs_b)},
            "intercept": round(float(pipe_b_base.named_steps["classifier"].intercept_[0]), 5)
        }
    }
    with open(os.path.join(models_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    # Save joblib models
    joblib.dump(model_a_calibrated, os.path.join(models_dir, "model_a_lifestyle.joblib"))
    joblib.dump(model_b_calibrated, os.path.join(models_dir, "model_b_vitals.joblib"))
    joblib.dump(pipe_a_base, os.path.join(models_dir, "pipe_a_base.joblib"))
    joblib.dump(pipe_b_base, os.path.join(models_dir, "pipe_b_base.joblib"))
    print("All models and metadata successfully exported to ml/models/")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_csv = os.path.join(base_dir, "..", "data", "synthetic_cardiac_india.csv")
    models_dir = os.path.join(base_dir, "models")
    reports_dir = os.path.join(base_dir, "reports")

    train_and_evaluate(data_csv, models_dir, reports_dir)
