import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, PhoneCall, ArrowLeft, ShieldAlert } from 'lucide-react';
import type { Language } from '../i18n';
import { translations } from '../i18n';

interface EmergencyCardProps {
  lang: Language;
  onReset: () => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ lang, onReset }) => {
  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto my-12 p-6 sm:p-10 rounded-3xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-500 shadow-2xl text-center"
    >
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 animate-bounce">
        <AlertOctagon className="w-9 h-9" />
      </div>

      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-100 mb-3">
        URGENT RED-FLAG ALERT
      </span>

      <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-rose-950 dark:text-rose-100 mb-4">
        {t.emergencyTitle}
      </h2>

      <p className="text-base sm:text-lg text-rose-900 dark:text-rose-200 leading-relaxed max-w-xl mx-auto mb-8 font-medium">
        {t.emergencyAdvice}
      </p>

      {/* Immediate Call Helpline */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 shadow-sm max-w-md mx-auto mb-8">
        <p className="text-xs text-secondaryText font-medium uppercase mb-2 tracking-wide">
          India National Emergency Services
        </p>
        <a
          href="tel:112"
          className="inline-flex items-center justify-center space-x-3 w-full py-3.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
        >
          <PhoneCall className="w-5 h-5 animate-pulse" />
          <span>{t.emergencyCall}</span>
        </a>
      </div>

      {/* Critical Immediate Actions */}
      <div className="text-left bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-rose-200 dark:border-rose-900 mb-8 space-y-2.5 text-xs sm:text-sm text-secondaryText">
        <div className="flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span><strong>Do not drive yourself:</strong> Ask a family member, neighbor, or ambulance to transport you.</span>
        </div>
        <div className="flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span><strong>Rest quietly:</strong> Sit or recline in a comfortable upright position to reduce cardiac workload.</span>
        </div>
        <div className="flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span><strong>Loosen tight clothing:</strong> Ensure adequate room airflow while awaiting medical team arrival.</span>
        </div>
      </div>

      <button
        onClick={onReset}
        type="button"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-secondaryText hover:text-primaryText transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home Screen</span>
      </button>
    </motion.div>
  );
};
