# HeartWise India 🫀

**Personalized Cardiovascular Disease Risk Screening & Awareness for Indian Adults**

HeartWise India is a modern, calibrated cardiac disease screening web application tailored to the epidemiological patterns, dietary traditions, and metabolic risk profiles of adult populations across 24 Indian states.

> **IMPORTANT CLINICAL DISCLAIMER:**
> HeartWise India is an educational risk-awareness and screening aid, **NOT a medical diagnosis**. Predicted outputs represent an estimated statistical probability of cardiovascular disease based on population-calibrated models. Always consult a certified physician or cardiologist for clinical assessment and diagnostic evaluations.

---

## 📸 Key Screen Walkthroughs & Descriptions

### 1. Landing Screen & Safety Onboarding
- **Visual Design:** Warm ivory background (`#fbfaf6`), soft rose ambient gradient, and an animated electrocardiogram (ECG) sinus rhythm line rendered in deep crimson (`#e11d48`).
- **Safety Banner:** Prominent disclaimer badge emphasizing that this is a non-diagnostic awareness aid.
- **Header Actions:** Quick-dial button for India's National Emergency Services (**112**), Hindi/English bilingual toggle (हिन्दी / English), and dark mode toggle.
- **Privacy Assurance:** High-visibility badge guaranteeing zero persistence or logging of user inputs.

### 2. Single-Question-Per-Screen Lifestyle Assessment
- **Smooth Flow:** 15 focused steps arranged across three phases:
  1. **Priority Safety Check:** Explicit red-flag screening ("*Do you have severe chest pain, shortness of breath at rest, or fainting right now?*"). Answering "Yes" skips all statistical calculation and immediately transitions to a high-urgency Emergency Assistance card directing the user to dial 112 or seek immediate hospitalization.
  2. **Demographics ("About You"):** Age slider (18–90), biological sex cards, Indian state selector (24 states), urban/rural living toggle, and interactive height/weight sliders with a live BMI calculator.
  3. **Habits & Health History:** Bidi/cigarette smoking, smokeless tobacco (gutkha/khaini), alcohol, weekly physical activity, diet quality (fried/refined vs. cardio-protective), chronic stress, sleep duration, family history of early CAD, diabetes, and hypertension.
- **Accessibility:** Touch targets $\ge 44\text{ px}$, keyboard navigation (`Enter` to advance, back navigation), and live progress bar.

### 3. Interactive Result Dashboard & Vitals Refinement (Model B)
- **Calibrated Risk Gauge:** A circular radial gauge animating up to the exact estimated percentage, categorized into clinical risk bands:
  - **Low Risk ($< 5\%$):** Forest teal (`#0d9488`), celebratory micro-interaction.
  - **Moderate Risk ($5\% - 15\%$):** Warm amber (`#d97706`).
  - **Elevated Risk ($> 15\%$):** Crimson rose (`#e11d48`).
- **Attributable Factor Breakdown:** Horizontal contribution bars decomposing the top 5 factors that either raise or protect/lower risk, derived from logistic coefficients standardized against population distributions.
- **Personalized Recommendations:** Three tailored lifestyle suggestions tied directly to the user's top elevating factors.
- **Regional Perspective:** Interactive chart contrasting the user's state baseline risk with the national Indian average ($15.5\%$).
- **Vitals & ECG Refinement (Model B):** Interactive modal allowing users with recent clinical checks to input blood pressure, resting heart rate, $\text{SpO}_2$, and an ECG pattern picker (`normal`, `st_t_changes`, `arrhythmia`, `lvh`, `q_waves`), rendering a side-by-side Before/After comparison.
- **Export & Portability:** One-click print/PDF report generation formatted for sharing with a doctor.

---

## 🏗️ Architecture & Project Structure

```
ECG project/
├── data/
│   └── synthetic_cardiac_india.csv       # 300,000 records across 24 Indian states
├── ml/
│   ├── generate_synthetic_cardiac_india.py # Population-level data generator
│   ├── generate.py                       # CLI entrypoint for generation
│   ├── train_baseline.py                 # Calibrated Model A & B trainer & evaluator
│   ├── train.py                          # CLI entrypoint for training
│   ├── models/
│   │   ├── model_a_lifestyle.joblib      # Calibrated Model A pipeline
│   │   ├── model_b_vitals.joblib         # Calibrated Model B pipeline
│   │   ├── pipe_a_base.joblib            # Base preprocessor & logistic regressor A
│   │   ├── pipe_b_base.joblib            # Base preprocessor & logistic regressor B
│   │   ├── metadata.json                 # Coefficients, medians, feature names
│   │   └── state_risks.json              # State-wise epidemiological baselines
│   └── reports/
│       ├── metrics.json                  # AUC, Brier scores, subpopulation stats
│       └── calibration_plot.png          # Reliability curves & calibration visual
├── backend/
│   ├── app/
│   │   ├── main.py                       # FastAPI application & zero-logging API
│   │   ├── schemas.py                    # Strict Pydantic validation & error rules
│   │   └── predictor.py                  # Inference, imputation, & factor attribution
│   ├── tests/
│   │   └── test_api.py                   # Pytest test suite (100% pass)
│   ├── requirements.txt                  # Python dependencies
│   └── Dockerfile                        # Backend container spec
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts                 # Type-safe API client & interfaces
│   │   ├── components/
│   │   │   ├── Navbar.tsx                # Navigation, 112 helpline, language, theme
│   │   │   ├── LandingHero.tsx           # Value proposition & animated ECG wave
│   │   │   ├── EcgHeartbeat.tsx          # Real-time animated ECG SVG component
│   │   │   ├── Questionnaire.tsx         # Single-screen assessment flow
│   │   │   ├── EmergencyCard.tsx         # Urgent red-flag emergency handler
│   │   │   ├── ResultScreen.tsx          # Animated gauge, factor bars, state comparison
│   │   │   └── VitalsModal.tsx           # Step 2 Vitals & ECG refinement modal
│   │   ├── i18n/
│   │   │   └── index.ts                  # English & Hindi (हिंदी) translation dictionaries
│   │   ├── App.tsx                       # Root view state machine
│   │   ├── main.tsx                      # DOM entrypoint
│   │   └── index.css                     # Tailwind CSS & theme variables
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile                        # Frontend container spec
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📊 Machine Learning Pipeline & Metrics

### 1. Dual Model Architecture
- **Model A (Lifestyle Model):** Age, biological sex, state (24 Indian states), urban/rural setting, BMI (height/weight), tobacco smoking, smokeless tobacco, alcohol, weekly exercise minutes, diet quality, stress level, sleep duration, family history, self-reported diabetes, and hypertension.
- **Model B (Vitals + ECG Model):** Model A features + systolic/diastolic blood pressure, resting heart rate, $\text{SpO}_2$, ECG finding (`normal`, `st_t_changes`, `arrhythmia`, `lvh`, `q_waves`), and optional lab values (LDL cholesterol, $\text{HbA}_{1c}$).
- **Core Algorithm:** L2-regularized Logistic Regression calibrated via Platt scaling (`method='sigmoid'`), evaluated alongside a `HistGradientBoostingClassifier` benchmark.
- **Split & Seed:** Stratified 80/20 train-test split ($240,000$ train / $60,000$ test), random seed `42`.

### 2. Test Set Performance Summary (`ml/reports/metrics.json`)

| Model | Algorithm | ROC AUC | Brier Score | Log Loss |
| :--- | :--- | :---: | :---: | :---: |
| **Model A (Lifestyle)** | **Logistic Regression (Calibrated)** | **0.8963** | **0.0813** | **0.2677** |
| Model A (Lifestyle) | HistGradientBoosting (Benchmark) | 0.8946 | 0.0819 | 0.2697 |
| **Model B (Vitals + ECG)** | **Logistic Regression (Calibrated)** | **0.9054** | **0.0784** | **0.2578** |
| Model B (Vitals + ECG) | HistGradientBoosting (Benchmark) | 0.9034 | 0.0791 | 0.2603 |

### 3. Subpopulation Fairness & Robustness
- **By Sex:**
  - Male ($N = 30,553$): Model A AUC = `0.8912` | Model B AUC = `0.9011`
  - Female ($N = 29,447$): Model A AUC = `0.8969` | Model B AUC = `0.9056`
- **Across 24 Indian States:**
  - High concordance across diverse states, ranging from `0.8722` (Punjab) to `0.9272` (Assam).
- **Calibration Curves:**
  - Evaluated across 10 deciles; both models closely track ideal 45-degree calibration with Brier scores $< 0.082$. The calibration plot is stored at `ml/reports/calibration_plot.png`.

### 4. Explainability & Missing Data Imputation
- Feature contributions decompose the model's standardized log-odds: $\text{impact} = w_j \cdot (x_j - \mu_j) / \sigma_j$.
- If optional parameters (physical activity, sleep, BP, $\text{SpO}_2$, LDL, $\text{HbA}_{1c}$) are omitted, they are automatically imputed with training medians, and the UI explicitly lists which inputs were assumed.

---

## ⚠️ Assumptions & Known Limitations

1. **Synthetic Training Data Disclaimer:**
   > **CRITICAL:** All models were trained and calibrated on a 300,000-row synthetic dataset generated according to epidemiological parameters reported by ICMR (Indian Council of Medical Research), the Lancet India State-Level Disease Burden study, and NFHS-5. **The reported accuracy metrics reflect synthetic distribution fidelity and must be clinically re-validated against prospectively enrolled real-world patient cohorts.**
2. **Simplified ECG Categories:** Clinical electrocardiography evaluates 12 leads for nuanced rhythm, bundle branch blocks, axis deviations, and acute STEMI patterns. HeartWise categorizes findings into 5 representative screening classes (`normal`, `st_t_changes`, `arrhythmia`, `lvh`, `q_waves`).
3. **No Direct Longitudinal Follow-up:** Predictions represent an estimated 10-year risk probability based on cross-sectional clinical risk associations rather than a prospective continuous cohort follow-up.
4. **Zero-Logging Privacy:** Inputs are processed strictly in-memory during HTTP requests and are never written to databases, log files, or remote analytics.

---

## 🚀 Quick Start Guide (Run with Two Commands)

### Prerequisites
- Python 3.10+ (tested on Python 3.11 & 3.13)
- Node.js 18+ (tested on Node 20)

### Option A: Local Development (2 Terminals)

**Terminal 1 — Backend API:**
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend App:**
```bash
cd frontend && npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Docker Compose (Single Command)

```bash
docker compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Automated Tests

To run the backend test suite:
```bash
python -m pytest backend/tests -v
```

The 9 automated tests verify:
- Health check and model startup (`/health`)
- 24 Indian states and regional baselines retrieval (`/states`)
- Lifestyle model inference with probability bounded in $[0, 1]$ (`/predict/lifestyle`)
- Automatic median imputation when optional habit metrics are omitted
- Vitals and ECG refinement model execution (`/predict/vitals`)
- Red-flag emergency interception and guidance
- Strict range validation (age $18-90$, systolic $70-260$, recognized states, ECG findings) returning clear `422 Unprocessable Entity` responses.

---

## 🔌 API Reference

### 1. `POST /predict/lifestyle`
Calculates cardiovascular disease probability based on lifestyle factors.

**Request Body:**
```json
{
  "age": 45,
  "sex": "male",
  "state": "Maharashtra",
  "urban_rural": "urban",
  "height_cm": 170.0,
  "weight_kg": 72.0,
  "tobacco_smoking": 2,
  "smokeless_tobacco": 0,
  "alcohol": 1,
  "physical_activity_min_per_week": 60,
  "diet_quality": 1,
  "stress_level": 3,
  "sleep_hours": 6.0,
  "family_history_cardiac": 1,
  "diabetes": 0,
  "hypertension": 1,
  "has_red_flags": false
}
```

**Response Body (Excerpt):**
```json
{
  "risk_probability": 0.384,
  "risk_percentage": 38.4,
  "risk_band": "high",
  "band_color": "#e11d48",
  "top_factors": [
    {
      "feature": "hypertension_1",
      "label": "History of Hypertension",
      "direction": "raises",
      "impact_score": 1.519,
      "percentage_contribution": 29.4,
      "tip": "Monitor blood pressure regularly at home and adopt the low-sodium DASH eating plan."
    }
  ],
  "assumed_inputs": [],
  "practical_tips": [
    "Monitor blood pressure regularly at home and adopt the low-sodium DASH eating plan.",
    "Quitting smoking is the single fastest way to cut your cardiac event risk in half within 1 year.",
    "Incorporate 10-15 minutes of daily pranayama or yoga to reduce autonomic stress."
  ],
  "model_version": "1.0.0",
  "state_comparison": {
    "state": "Maharashtra",
    "state_average_risk": 17.3,
    "national_average_risk": 15.5,
    "difference_percentage": 1.8,
    "comparison_text": "In Maharashtra, estimated adult cardiac disease prevalence is 17.3%, which is 1.8% higher than the national Indian average (15.5%)."
  },
  "urgent_care_needed": false,
  "disclaimer": "This tool is for awareness, educational, and risk-screening purposes only. It is NOT a medical diagnosis..."
}
```

### 2. `POST /predict/vitals`
Accepts lifestyle inputs plus optional blood pressure (`systolic_bp`, `diastolic_bp`), `resting_heart_rate`, `spo2`, `ecg_finding`, `ldl_cholesterol`, and `hba1c`.

### 3. `GET /states`
Returns epidemiological cardiovascular disease baseline risk data for all 24 Indian states.

### 4. `GET /health`
Returns health check status and confirms loaded model pipelines.
# SYSDAG report integration

The landing page now offers two paths: the existing HeartWise assessment and a report/ECG upload screen. The latter calls HeartWise's own `/api/model/*` routes, which proxy the trained SYSDAG analysis service. Set `SYSDAG_MODEL_API_URL` on the backend to the trusted HTTPS origin of that service (without `/api/analysis`). When unset or unreachable, the screen shows that prediction is unavailable and disables the analyse action. Do not use an ephemeral tunnel for patient data.

Supported SYSDAG predictions depend on the connected service: a calibrated raw 12-lead CSV scores five ECG pattern groups; structured first-24-hour inpatient data produce an inpatient outcome score. Text PDF extraction and ECG image review require a service with those capabilities; image documents cannot be fed directly into the waveform model. Results are research findings for clinical review, not a general disease diagnosis.

