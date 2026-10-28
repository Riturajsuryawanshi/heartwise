export interface FactorContribution {
  feature: string;
  label: string;
  direction: 'raises' | 'lowers';
  impact_score: number;
  percentage_contribution: number;
  tip: string;
}

export interface StateComparison {
  state: string;
  state_average_risk: number;
  national_average_risk: number;
  difference_percentage: number;
  comparison_text: string;
}

export interface PredictionResponse {
  risk_probability: number;
  risk_percentage: number;
  risk_band: 'low' | 'moderate' | 'high';
  band_color: string;
  top_factors: FactorContribution[];
  assumed_inputs: string[];
  practical_tips: string[];
  model_version: string;
  state_comparison?: StateComparison;
  urgent_care_needed: boolean;
  disclaimer: string;
}

export interface LifestylePayload {
  age: number;
  sex: string;
  state: string;
  urban_rural: string;
  height_cm: number;
  weight_kg: number;
  tobacco_smoking: number;
  smokeless_tobacco: number;
  alcohol: number;
  physical_activity_min_per_week?: number | null;
  diet_quality: number;
  stress_level: number;
  sleep_hours?: number | null;
  family_history_cardiac: number;
  diabetes: number;
  hypertension: number;
  has_red_flags?: boolean;
}

export interface VitalsPayload extends LifestylePayload {
  systolic_bp?: number | null;
  diastolic_bp?: number | null;
  resting_heart_rate?: number | null;
  spo2?: number | null;
  ecg_finding?: string | null;
  ldl_cholesterol?: number | null;
  hba1c?: number | null;
}

export interface StatesResponse {
  national_average_risk: number;
  state_risks: Record<string, {
    count: number;
    mean_risk: number;
    relative_to_national: number;
  }>;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function fetchStates(): Promise<StatesResponse> {
  const res = await fetch(`${API_BASE_URL}/states`);
  if (!res.ok) {
    throw new Error(`Failed to fetch states list: ${res.statusText}`);
  }
  return res.json();
}

export async function predictLifestyle(payload: LifestylePayload): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict/lifestyle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail 
      ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      : `Prediction failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}

export async function predictVitals(payload: VitalsPayload): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/predict/vitals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail 
      ? (typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail))
      : `Refined prediction failed with status ${res.status}`;
    throw new Error(message);
  }
  return res.json();
}
