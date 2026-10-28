import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Stethoscope, Sparkles } from 'lucide-react';
import type { Language } from '../i18n';
import { translations } from '../i18n';
import type { VitalsPayload } from '../api/client';

interface VitalsModalProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vitals: Partial<VitalsPayload>) => void;
  initialVitals?: Partial<VitalsPayload>;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({
  lang,
  isOpen,
  onClose,
  onSubmit,
  initialVitals,
}) => {
  const t = translations[lang];

  const [sbp, setSbp] = useState<number | ''>(initialVitals?.systolic_bp ?? 125);
  const [dbp, setDbp] = useState<number | ''>(initialVitals?.diastolic_bp ?? 82);
  const [hr, setHr] = useState<number | ''>(initialVitals?.resting_heart_rate ?? 74);
  const [spo2, setSpo2] = useState<number | ''>(initialVitals?.spo2 ?? 98);
  const [ecg, setEcg] = useState<string>(initialVitals?.ecg_finding ?? 'normal');
  const [ldl, setLdl] = useState<number | ''>(initialVitals?.ldl_cholesterol ?? '');
  const [hba1c, setHba1c] = useState<number | ''>(initialVitals?.hba1c ?? '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      systolic_bp: sbp === '' ? null : Number(sbp),
      diastolic_bp: dbp === '' ? null : Number(dbp),
      resting_heart_rate: hr === '' ? null : Number(hr),
      spo2: spo2 === '' ? null : Number(spo2),
      ecg_finding: ecg,
      ldl_cholesterol: ldl === '' ? null : Number(ldl),
      hba1c: hba1c === '' ? null : Number(hba1c),
    });
  };

  const ecgChoices = [
    { id: 'normal', label: t.vitalsModal.ecgOptions.normal, desc: 'Regular rhythm, no repolarization or conduction abnormalities' },
    { id: 'st_t_changes', label: t.vitalsModal.ecgOptions.st_t_changes, desc: 'ST depression/elevation or inverted T-waves indicating myocardial strain/ischemia' },
    { id: 'arrhythmia', label: t.vitalsModal.ecgOptions.arrhythmia, desc: 'Atrial fibrillation, frequent PVCs, or irregular conduction' },
    { id: 'lvh', label: t.vitalsModal.ecgOptions.lvh, desc: 'Voltage criteria met for left ventricular wall thickening' },
    { id: 'q_waves', label: t.vitalsModal.ecgOptions.q_waves, desc: 'Wide/deep Q waves indicating prior localized myocardial scar or infarct' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-surface border border-borderLight rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-primaryText"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-secondaryText hover:text-primaryText hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-heart flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-primaryText">
                {t.vitalsModal.title}
              </h2>
            </div>
          </div>
          <p className="text-sm text-secondaryText mb-6 ml-13">
            {t.vitalsModal.subtitle}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Pressure and Pulse Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.sbp}
                </label>
                <input
                  type="number"
                  min="70"
                  max="260"
                  placeholder="120"
                  value={sbp}
                  onChange={(e) => setSbp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-borderLight bg-surface text-primaryText font-medium focus:border-heart focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.dbp}
                </label>
                <input
                  type="number"
                  min="40"
                  max="160"
                  placeholder="80"
                  value={dbp}
                  onChange={(e) => setDbp(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-borderLight bg-surface text-primaryText font-medium focus:border-heart focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.hr}
                </label>
                <input
                  type="number"
                  min="40"
                  max="180"
                  placeholder="72"
                  value={hr}
                  onChange={(e) => setHr(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-borderLight bg-surface text-primaryText font-medium focus:border-heart focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.spo2}
                </label>
                <input
                  type="number"
                  min="70"
                  max="100"
                  placeholder="98"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-borderLight bg-surface text-primaryText font-medium focus:border-heart focus:outline-none"
                />
              </div>
            </div>

            {/* ECG Finding Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase text-secondaryText mb-2">
                {t.vitalsModal.ecg}
              </label>
              <div className="space-y-2">
                {ecgChoices.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEcg(c.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all text-sm flex items-start justify-between ${
                      ecg === c.id
                        ? 'border-heart bg-rose-50/70 dark:bg-rose-950/50 text-heart shadow-sm font-semibold'
                        : 'border-borderLight hover:bg-surfaceHover text-primaryText'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{c.label}</div>
                      <div className="text-xs text-secondaryText font-normal mt-0.5">{c.desc}</div>
                    </div>
                    {ecg === c.id && <Sparkles className="w-4 h-4 text-heart shrink-0 mt-0.5 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Lab Markers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-borderLight">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.ldl}
                </label>
                <input
                  type="number"
                  min="30"
                  max="350"
                  step="0.1"
                  placeholder="e.g. 110 (optional)"
                  value={ldl}
                  onChange={(e) => setLdl(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-borderLight bg-surface text-primaryText text-sm focus:border-heart focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-secondaryText mb-1.5">
                  {t.vitalsModal.hba1c}
                </label>
                <input
                  type="number"
                  min="4"
                  max="16"
                  step="0.1"
                  placeholder="e.g. 5.8 (optional)"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-borderLight bg-surface text-primaryText text-sm focus:border-heart focus:outline-none"
                />
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-borderLight">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-borderLight text-secondaryText hover:text-primaryText font-medium text-sm transition-colors"
              >
                {t.vitalsModal.cancel}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-heart text-white font-semibold text-sm shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all"
              >
                {t.vitalsModal.calculateRefined}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
