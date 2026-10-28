import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, AlertCircle, ArrowRight, MapPin, Activity } from 'lucide-react';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import { EcgHeartbeat } from './EcgHeartbeat';

interface LandingHeroProps {
  lang: Language;
  onStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ lang, onStart }) => {
  const t = translations[lang];

  return (
    <div className="relative py-12 md:py-20 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center text-center">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-200/30 dark:bg-rose-900/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Safety Disclaimer Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-medium mb-6 shadow-sm"
      >
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{t.disclaimerShort}</span>
      </motion.div>

      {/* Main Title & Value Prop */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight text-primaryText leading-[1.15] max-w-3xl"
      >
        Know Your Heart's Story, <br className="hidden sm:inline" />
        <span className="text-heart italic font-normal">Before</span> It Writes Its Next Chapter.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-5 text-base sm:text-xl text-secondaryText max-w-2xl font-normal leading-relaxed"
      >
        {t.tagline}
      </motion.p>

      {/* ECG Animated Graphic Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="w-full max-w-xl my-6 p-4 rounded-2xl glass-panel shadow-inner"
      >
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-secondaryText mb-1 uppercase tracking-wider">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>Cardiovascular Rhythm</span>
          </span>
          <span>Normal Sinus Rhythm</span>
        </div>
        <EcgHeartbeat className="h-20 w-full" strokeColor="#e11d48" />
      </motion.div>

      {/* Call to Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4 mt-2"
      >
        <button
          onClick={onStart}
          type="button"
          className="group relative inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-heart text-white text-base sm:text-lg font-semibold shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <span>{t.startBtn}</span>
          <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </motion.div>

      {/* Privacy Guarantee Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 flex items-center space-x-2 text-xs sm:text-sm text-secondaryText font-medium"
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>{t.privacyBadge}</span>
      </motion.div>

      {/* Key Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
      >
        <div className="p-6 rounded-2xl glass-panel shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-heart flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-bold text-lg text-primaryText mb-1.5">
            Calibrated for India
          </h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            Models benchmarked across 24 Indian states, capturing dietary patterns, smokeless tobacco, and urban-rural lifestyle nuances.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-bold text-lg text-primaryText mb-1.5">
            Explainable Insights
          </h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            Transparent attribution decomposing which habits protect you versus what raises your risk, with tailored preventative steps.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel shadow-sm hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="font-serif font-bold text-lg text-primaryText mb-1.5">
            Vitals & ECG Refinement
          </h2>
          <p className="text-sm text-secondaryText leading-relaxed">
            Optionally integrate your blood pressure, pulse, SpO2, and ECG findings for a high-precision dual-model comparison.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
