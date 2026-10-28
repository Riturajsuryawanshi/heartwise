import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertTriangle,
  User,
  ChevronRight
} from 'lucide-react';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import type { LifestylePayload } from '../api/client';

export const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface QuestionnaireProps {
  lang: Language;
  onComplete: (data: LifestylePayload) => void;
  onRedFlagTriggered: () => void;
  onCancel: () => void;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  lang,
  onComplete,
  onRedFlagTriggered,
  onCancel,
}) => {
  const t = translations[lang];

  // Current Step Index (0 to 14)
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState<LifestylePayload>({
    age: 42,
    sex: 'male',
    state: 'Maharashtra',
    urban_rural: 'urban',
    height_cm: 168.0,
    weight_kg: 68.0,
    tobacco_smoking: 0,
    smokeless_tobacco: 0,
    alcohol: 0,
    physical_activity_min_per_week: 120,
    diet_quality: 2,
    stress_level: 2,
    sleep_hours: 7.0,
    family_history_cardiac: 0,
    diabetes: 0,
    hypertension: 0,
    has_red_flags: false,
  });

  const totalSteps = 15;

  // Live BMI calculation
  const bmi = Number(
    (formData.weight_kg / Math.pow(formData.height_cm / 100, 2)).toFixed(1)
  );

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
    if (val < 23.0) return { label: 'Normal (Indian standards)', color: 'text-teal-600 dark:text-teal-400' };
    if (val < 27.5) return { label: 'Overweight', color: 'text-amber-600 dark:text-amber-400' };
    return { label: 'Obese', color: 'text-rose-600 dark:text-rose-400' };
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, formData]);

  const handleNext = () => {
    if (currentStep === 0 && formData.has_red_flags) {
      onRedFlagTriggered();
      return;
    }
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  // Category determination
  const getCategoryName = () => {
    if (currentStep === 0) return "Safety Priority";
    if (currentStep <= 5) return t.categories.demographics;
    if (currentStep <= 11) return t.categories.habits;
    return t.categories.health;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      {/* Progress & Category Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-secondaryText mb-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800/80 text-primaryText font-semibold">
            {getCategoryName()}
          </span>
          <span>
            {t.stepOf.replace('{current}', String(currentStep + 1)).replace('{total}', String(totalSteps))}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-heart rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Animated Step Container */}
      <div className="min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
            className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm"
          >
            {/* Step 0: Emergency Red-Flag Question */}
            {currentStep === 0 && (
              <div>
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 mb-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span className="text-xs uppercase font-bold tracking-wider">Priority Safety Check</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.redFlag.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.redFlag.subtitle}
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, has_red_flags: true });
                      onRedFlagTriggered();
                    }}
                    className={`w-full p-4 rounded-2xl text-left border-2 flex items-center justify-between transition-all min-h-[56px] ${
                      formData.has_red_flags
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 font-semibold text-rose-900 dark:text-rose-100 shadow-sm'
                        : 'border-borderLight hover:border-rose-300 hover:bg-surfaceHover text-primaryText'
                    }`}
                  >
                    <span>{t.questions.redFlag.yes}</span>
                    <ChevronRight className="w-5 h-5 text-rose-500 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, has_red_flags: false });
                      handleNext();
                    }}
                    className={`w-full p-4 rounded-2xl text-left border-2 flex items-center justify-between transition-all min-h-[56px] ${
                      !formData.has_red_flags
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 font-semibold text-emerald-900 dark:text-emerald-100 shadow-sm'
                        : 'border-borderLight hover:border-emerald-300 hover:bg-surfaceHover text-primaryText'
                    }`}
                  >
                    <span>{t.questions.redFlag.no}</span>
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: Age */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.age.title}
                </h2>
                <p className="text-sm text-secondaryText mb-8">
                  {t.questions.age.subtitle}
                </p>

                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-5xl sm:text-6xl font-serif font-bold text-heart">
                    {formData.age} <span className="text-lg font-sans text-secondaryText font-normal">years</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="90"
                    step="1"
                    aria-label="Age slider"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-heart"
                  />
                  <div className="w-full flex justify-between text-xs text-secondaryText font-medium">
                    <span>18 years</span>
                    <span>50 years</span>
                    <span>90 years</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Biological Sex */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.sex.title}
                </h2>
                <p className="text-sm text-secondaryText mb-8">
                  {t.questions.sex.subtitle}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {(['male', 'female'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, sex: s })}
                      className={`p-6 rounded-2xl border-2 text-center transition-all min-h-[100px] flex flex-col items-center justify-center space-y-2 ${
                        formData.sex === s
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-md font-bold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <User className="w-8 h-8" />
                      <span className="text-base font-semibold capitalize">
                        {s === 'male' ? t.questions.sex.male : t.questions.sex.female}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: State */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.state.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.state.subtitle}
                </p>

                <div className="relative">
                  <select
                    aria-label="Select state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-4 rounded-2xl border-2 border-borderLight bg-surface text-primaryText font-medium text-base focus:border-heart focus:outline-none transition-colors"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 4: Urban / Rural */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.urbanRural.title}
                </h2>
                <p className="text-sm text-secondaryText mb-8">
                  {t.questions.urbanRural.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['urban', 'rural'] as const).map((ur) => (
                    <button
                      key={ur}
                      type="button"
                      onClick={() => setFormData({ ...formData, urban_rural: ur })}
                      className={`p-6 rounded-2xl border-2 text-left transition-all min-h-[90px] ${
                        formData.urban_rural === ur
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-md font-bold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">
                        {ur === 'urban' ? t.questions.urbanRural.urban : t.questions.urbanRural.rural}
                      </div>
                      <div className="text-xs text-secondaryText font-normal">
                        {ur === 'urban' ? 'Metro or municipal city area' : 'Village, tehsil, or agricultural belt'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Height & Weight (Computed BMI) */}
            {currentStep === 5 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-1">
                  {t.questions.heightWeight.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.heightWeight.subtitle}
                </p>

                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{t.questions.heightWeight.height}</span>
                      <span className="text-heart">{formData.height_cm} cm</span>
                    </div>
                    <input
                      type="range"
                      min="130"
                      max="205"
                      step="1"
                      aria-label="Height slider"
                      value={formData.height_cm}
                      onChange={(e) => setFormData({ ...formData, height_cm: Number(e.target.value) })}
                      className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-heart"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{t.questions.heightWeight.weight}</span>
                      <span className="text-heart">{formData.weight_kg} kg</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="150"
                      step="0.5"
                      aria-label="Weight slider"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({ ...formData, weight_kg: Number(e.target.value) })}
                      className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-heart"
                    />
                  </div>

                  {/* Computed BMI Badge */}
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-borderLight flex items-center justify-between">
                    <div>
                      <div className="text-xs text-secondaryText font-medium">
                        {t.questions.heightWeight.computedBmi}
                      </div>
                      <div className="text-2xl font-serif font-bold text-primaryText">
                        {bmi} <span className="text-xs font-sans text-secondaryText font-normal">kg/m²</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-surface ${getBmiCategory(bmi).color}`}>
                      {getBmiCategory(bmi).label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Tobacco Smoking */}
            {currentStep === 6 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.smoking.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.smoking.subtitle}
                </p>

                <div className="space-y-3">
                  {[
                    { val: 0, label: t.questions.smoking.never, sub: 'Zero exposure to inhaled bidi / cigarette' },
                    { val: 1, label: t.questions.smoking.former, sub: 'Successfully stopped smoking for > 12 months' },
                    { val: 2, label: t.questions.smoking.current, sub: 'Active cigarette or bidi smoker' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, tobacco_smoking: opt.val })}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all min-h-[64px] ${
                        formData.tobacco_smoking === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-base font-bold">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 7: Smokeless Tobacco */}
            {currentStep === 7 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.smokeless.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.smokeless.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 0, label: t.questions.smokeless.no, sub: 'No use of gutkha, khaini or tobacco masala' },
                    { val: 1, label: t.questions.smokeless.yes, sub: 'Regular chewable tobacco consumption' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, smokeless_tobacco: opt.val })}
                      className={`p-6 rounded-2xl border-2 text-left transition-all min-h-[90px] ${
                        formData.smokeless_tobacco === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 8: Alcohol */}
            {currentStep === 8 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.alcohol.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.alcohol.subtitle}
                </p>

                <div className="space-y-3">
                  {[
                    { val: 0, label: t.questions.alcohol.never, sub: 'Teetotaler or rarely a social drink' },
                    { val: 1, label: t.questions.alcohol.moderate, sub: 'Occasional light drinking (1-2 drinks/week)' },
                    { val: 2, label: t.questions.alcohol.heavy, sub: 'Frequent or heavy binge drinking' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, alcohol: opt.val })}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all min-h-[64px] ${
                        formData.alcohol === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-base font-bold">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 9: Physical Activity */}
            {currentStep === 9 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.activity.title}
                </h2>
                <p className="text-sm text-secondaryText mb-8">
                  {t.questions.activity.subtitle}
                </p>

                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="text-5xl sm:text-6xl font-serif font-bold text-heart">
                    {formData.physical_activity_min_per_week}{' '}
                    <span className="text-lg font-sans text-secondaryText font-normal">mins / week</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="450"
                    step="15"
                    aria-label="Physical activity slider"
                    value={formData.physical_activity_min_per_week ?? 120}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        physical_activity_min_per_week: Number(e.target.value),
                      })
                    }
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-heart"
                  />
                  <div className="w-full flex justify-between text-xs text-secondaryText font-medium">
                    <span>Sedentary (0)</span>
                    <span>150 mins (Target)</span>
                    <span>300+ mins (Active)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 10: Diet Quality */}
            {currentStep === 10 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.diet.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.diet.subtitle}
                </p>

                <div className="space-y-3">
                  {[
                    { val: 1, label: 'High Fried & Refined', sub: t.questions.diet.poor },
                    { val: 2, label: 'Average Balanced Diet', sub: t.questions.diet.average },
                    { val: 3, label: 'Cardio-Protective (Whole food)', sub: t.questions.diet.healthy },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, diet_quality: opt.val })}
                      className={`w-full p-4 rounded-2xl text-left border-2 transition-all min-h-[70px] ${
                        formData.diet_quality === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-base font-bold">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 11: Stress Level & Sleep Hours */}
            {currentStep === 11 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-1">
                  Daily Stress & Rest
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  Chronic stress and insufficient sleep compound vascular inflammation.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-secondaryText mb-2">
                      Stress Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 1, label: t.questions.stress.low },
                        { val: 2, label: t.questions.stress.moderate },
                        { val: 3, label: t.questions.stress.high },
                      ].map((s) => (
                        <button
                          key={s.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, stress_level: s.val })}
                          className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                            formData.stress_level === s.val
                              ? 'border-heart bg-rose-500 text-white shadow-sm'
                              : 'border-borderLight hover:bg-surfaceHover text-primaryText'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold uppercase text-secondaryText mb-1">
                      <span>Sleep Duration</span>
                      <span className="text-heart font-bold">{formData.sleep_hours} hrs / night</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="10"
                      step="0.5"
                      aria-label="Sleep duration slider"
                      value={formData.sleep_hours ?? 7.0}
                      onChange={(e) => setFormData({ ...formData, sleep_hours: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-heart"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 12: Family History */}
            {currentStep === 12 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.familyHistory.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.familyHistory.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 0, label: t.questions.familyHistory.no, sub: 'No known heart disease before age 60 in parents/siblings' },
                    { val: 1, label: t.questions.familyHistory.yes, sub: 'Immediate relative had heart attack, stent, or bypass' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, family_history_cardiac: opt.val })}
                      className={`p-6 rounded-2xl border-2 text-left transition-all min-h-[90px] ${
                        formData.family_history_cardiac === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 13: Diabetes */}
            {currentStep === 13 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.diabetes.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.diabetes.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 0, label: t.questions.diabetes.no, sub: 'Fasting blood sugars always within normal range' },
                    { val: 1, label: t.questions.diabetes.yes, sub: 'Diagnosed with Type 2 Diabetes or taking medication' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, diabetes: opt.val })}
                      className={`p-6 rounded-2xl border-2 text-left transition-all min-h-[90px] ${
                        formData.diabetes === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 14: Hypertension */}
            {currentStep === 14 && (
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-2">
                  {t.questions.hypertension.title}
                </h2>
                <p className="text-sm text-secondaryText mb-6">
                  {t.questions.hypertension.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: 0, label: t.questions.hypertension.no, sub: 'Normal blood pressure readings (< 120/80 mmHg)' },
                    { val: 1, label: t.questions.hypertension.yes, sub: 'Diagnosed hypertension or taking daily BP medication' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, hypertension: opt.val })}
                      className={`p-6 rounded-2xl border-2 text-left transition-all min-h-[90px] ${
                        formData.hypertension === opt.val
                          ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                          : 'border-borderLight hover:border-slate-300 dark:hover:border-slate-600 hover:bg-surfaceHover text-primaryText'
                      }`}
                    >
                      <div className="text-lg font-bold mb-1">{opt.label}</div>
                      <div className="text-xs text-secondaryText">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-borderLight">
          <button
            type="button"
            onClick={handlePrev}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl border border-borderLight hover:bg-surfaceHover text-secondaryText hover:text-primaryText font-medium text-sm transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-heart text-white font-semibold text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all min-h-[44px]"
          >
            <span>{currentStep === totalSteps - 1 ? t.submitBtn : t.nextBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
