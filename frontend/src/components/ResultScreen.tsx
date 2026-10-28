import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  MapPin,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import type { PredictionResponse } from '../api/client';

interface ResultScreenProps {
  lang: Language;
  lifestyleResult: PredictionResponse;
  vitalsResult?: PredictionResponse | null;
  onRefineClick: () => void;
  onStartOver: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  lang,
  lifestyleResult,
  vitalsResult,
  onRefineClick,
  onStartOver,
}) => {
  const t = translations[lang];

  // Active result displayed (Vitals if available, else Lifestyle)
  const activeResult = vitalsResult || lifestyleResult;
  const isRefined = !!vitalsResult;

  // Animated number counter for gauge
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = activeResult.risk_percentage;
    const duration = 1200; // ms
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayPercentage(end);
        clearInterval(timer);
      } else {
        setDisplayPercentage(Number(start.toFixed(1)));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [activeResult.risk_percentage]);

  const handlePrint = () => {
    window.print();
  };

  // State comparison chart data
  const stateComp = activeResult.state_comparison;
  const stateChartData = stateComp
    ? [
        {
          name: t.results.nationalAvg,
          value: stateComp.national_average_risk,
          fill: '#64748b',
        },
        {
          name: `${stateComp.state} (${t.results.stateAvg})`,
          value: stateComp.state_average_risk,
          fill: stateComp.difference_percentage > 0 ? '#e11d48' : '#0d9488',
        },
      ]
    : [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 print-page">
      {/* Top Banner & Disclaimer */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-secondaryText mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{isRefined ? 'Model B (Vitals + ECG Calibrated)' : 'Model A (Lifestyle Calibrated)'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-primaryText mb-2">
          {t.results.title}
        </h1>
        <p className="text-xs sm:text-sm text-secondaryText font-medium">
          {t.results.consultDoctor}
        </p>
      </div>

      {/* Hero Circular Risk Gauge & Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-8 sm:p-10 rounded-3xl glass-panel shadow-md text-center relative overflow-hidden"
      >
        <div className="flex flex-col items-center justify-center">
          {/* Animated Circular Gauge SVG */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center my-4">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="8"
              />
              {/* Animated Progress Arc */}
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={activeResult.band_color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{
                  strokeDashoffset: 251.2 - (251.2 * Math.min(activeResult.risk_percentage, 100)) / 100,
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>

            {/* Centered Number Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-serif font-extrabold text-primaryText tracking-tight">
                {displayPercentage}%
              </span>
              <span className="text-xs uppercase font-semibold text-secondaryText tracking-wider mt-0.5">
                Estimated Chance
              </span>
            </div>
          </div>

          {/* Risk Band Badge */}
          <div
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-3 text-white shadow-sm"
            style={{ backgroundColor: activeResult.band_color }}
          >
            <Heart className="w-4 h-4 fill-white animate-pulse" />
            <span>
              {activeResult.risk_band === 'low'
                ? t.results.bands.low
                : activeResult.risk_band === 'moderate'
                ? t.results.bands.moderate
                : t.results.bands.high}
            </span>
          </div>

          {/* Plain language summary description */}
          <p className="max-w-xl text-sm sm:text-base text-secondaryText leading-relaxed">
            {activeResult.risk_band === 'low'
              ? t.results.bandDescriptions.low
              : activeResult.risk_band === 'moderate'
              ? t.results.bandDescriptions.moderate
              : t.results.bandDescriptions.high}
          </p>
        </div>

        {/* Refine with Vitals Callout Button (if not already refined) */}
        {!isRefined && (
          <div className="mt-8 pt-6 border-t border-borderLight no-print">
            <button
              onClick={onRefineClick}
              type="button"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Stethoscope className="w-4 h-4 text-heart" />
              <span>{t.refineBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-secondaryText mt-2">
              Have your blood pressure, pulse, or ECG results? Click above for an enhanced assessment.
            </p>
          </div>
        )}

        {/* Before / After Comparison Badge (if refined) */}
        {isRefined && (
          <div className="mt-6 pt-6 border-t border-borderLight grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-borderLight">
              <div className="text-xs text-secondaryText font-medium">
                {t.vitalsModal.lifestyleRisk}
              </div>
              <div className="text-xl font-serif font-bold text-primaryText">
                {lifestyleResult.risk_percentage}%
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
              <div className="text-xs text-heart font-semibold">
                {t.vitalsModal.vitalsRisk}
              </div>
              <div className="text-xl font-serif font-bold text-heart">
                {vitalsResult.risk_percentage}%
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Top 5 Factors Explanations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm"
      >
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-1">
            {t.results.topFactorsTitle}
          </h2>
          <p className="text-sm text-secondaryText">
            {t.results.topFactorsSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {activeResult.top_factors.map((factor, idx) => {
            const isRaises = factor.direction === 'raises';
            return (
              <motion.div
                key={factor.feature + idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * idx }}
                className="p-4 rounded-2xl border border-borderLight bg-surfaceHover/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Left: Label & Direction */}
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isRaises
                        ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400'
                        : 'bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {isRaises ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm sm:text-base text-primaryText flex items-center space-x-2">
                      <span>{factor.label}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          isRaises
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                        }`}
                      >
                        {isRaises ? t.results.raisesRisk : t.results.lowersRisk}
                      </span>
                    </div>
                    <p className="text-xs text-secondaryText mt-1">
                      {factor.tip}
                    </p>
                  </div>
                </div>

                {/* Right: Relative share bar */}
                <div className="sm:w-36 shrink-0 flex flex-col items-end">
                  <div className="text-xs font-semibold text-secondaryText mb-1">
                    {factor.percentage_contribution}% impact
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isRaises ? 'bg-rose-500' : 'bg-teal-500'}`}
                      style={{ width: `${Math.min(100, factor.percentage_contribution)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Practical Action Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm"
      >
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>{t.results.recommendationsTitle}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeResult.practical_tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs sm:text-sm text-secondaryText leading-relaxed flex items-start space-x-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* State Insight Comparison Card */}
      {stateComp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-heart" />
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText">
              {t.results.stateComparisonTitle}
            </h2>
          </div>
          <p className="text-sm text-secondaryText mb-6">
            {stateComp.comparison_text}
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                <XAxis type="number" domain={[0, 30]} unit="%" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Prevalence']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {stateChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Assumed Inputs Notice (if optional inputs were omitted) */}
      {activeResult.assumed_inputs && activeResult.assumed_inputs.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-borderLight text-xs text-secondaryText">
          <div className="flex items-center space-x-2 font-semibold text-primaryText mb-1.5">
            <Info className="w-4 h-4 text-sky-500" />
            <span>{t.results.assumedTitle}</span>
          </div>
          <p className="mb-2">{t.results.assumedSubtitle}</p>
          <ul className="list-disc list-inside space-y-1">
            {activeResult.assumed_inputs.map((assumed, i) => (
              <li key={i}>{assumed}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Full Medical Disclaimer Alert */}
      <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200 leading-relaxed text-center">
        {activeResult.disclaimer}
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-borderLight no-print">
        <button
          onClick={onStartOver}
          type="button"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl border border-borderLight hover:bg-surfaceHover text-secondaryText hover:text-primaryText font-semibold text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.startOverBtn}</span>
        </button>

        <button
          onClick={handlePrint}
          type="button"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-semibold text-sm shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>{t.downloadBtn}</span>
        </button>
      </div>
    </div>
  );
};
