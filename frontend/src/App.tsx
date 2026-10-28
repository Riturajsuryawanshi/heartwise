import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { Questionnaire } from './components/Questionnaire';
import { EmergencyCard } from './components/EmergencyCard';
import { ResultScreen } from './components/ResultScreen';
import { VitalsModal } from './components/VitalsModal';
import type { Language } from './i18n';
import type {
  LifestylePayload,
  VitalsPayload,
  PredictionResponse,
} from './api/client';
import { predictLifestyle, predictVitals } from './api/client';
import { AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [view, setView] = useState<'landing' | 'questionnaire' | 'emergency' | 'result'>('landing');

  // Payload & Prediction states
  const [lastLifestylePayload, setLastLifestylePayload] = useState<LifestylePayload | null>(null);
  const [lifestyleResult, setLifestyleResult] = useState<PredictionResponse | null>(null);
  const [vitalsResult, setVitalsResult] = useState<PredictionResponse | null>(null);

  // Vitals Modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState<boolean>(false);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const handleToggleDark = () => {
    setIsDark((prev) => !prev);
  };

  // Lifestyle submission handler
  const handleLifestyleComplete = async (formData: LifestylePayload) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLastLifestylePayload(formData);

    try {
      const res = await predictLifestyle(formData);
      if (res.urgent_care_needed) {
        setView('emergency');
      } else {
        setLifestyleResult(res);
        setVitalsResult(null); // Reset any prior vitals refinement
        setView('result');

        // Low risk celebratory confetti
        if (res.risk_band === 'low') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while calculating your risk.');
    } finally {
      setIsLoading(false);
    }
  };

  // Vitals & ECG refinement submission handler
  const handleVitalsSubmit = async (vitalsData: Partial<VitalsPayload>) => {
    if (!lastLifestylePayload) return;

    setIsLoading(true);
    setErrorMessage(null);

    const mergedPayload: VitalsPayload = {
      ...lastLifestylePayload,
      ...vitalsData,
    };

    try {
      const res = await predictVitals(mergedPayload);
      if (res.urgent_care_needed) {
        setIsVitalsModalOpen(false);
        setView('emergency');
      } else {
        setVitalsResult(res);
        setIsVitalsModalOpen(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to refine risk with clinical vitals.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setLifestyleResult(null);
    setVitalsResult(null);
    setLastLifestylePayload(null);
    setErrorMessage(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-primaryText transition-colors duration-300">
      {/* Top Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        isDark={isDark}
        onToggleDark={handleToggleDark}
        onEmergencyClick={() => setView('emergency')}
      />

      {/* Main Body View */}
      <main className="flex-1">
        {/* Global Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm">
            <div className="p-6 rounded-3xl glass-panel shadow-2xl flex flex-col items-center space-y-4">
              <Loader2 className="w-10 h-10 text-heart animate-spin" />
              <p className="font-serif font-bold text-base text-primaryText">
                Analyzing Cardiovascular Biomarkers...
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto my-4 px-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Error:</span> {errorMessage}
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs uppercase font-bold text-rose-700 dark:text-rose-300 hover:underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* View Routing */}
        {view === 'landing' && (
          <LandingHero lang={lang} onStart={() => setView('questionnaire')} />
        )}

        {view === 'questionnaire' && (
          <Questionnaire
            lang={lang}
            onComplete={handleLifestyleComplete}
            onRedFlagTriggered={() => setView('emergency')}
            onCancel={() => setView('landing')}
          />
        )}

        {view === 'emergency' && (
          <EmergencyCard lang={lang} onReset={handleStartOver} />
        )}

        {view === 'result' && lifestyleResult && (
          <ResultScreen
            lang={lang}
            lifestyleResult={lifestyleResult}
            vitalsResult={vitalsResult}
            onRefineClick={() => setIsVitalsModalOpen(true)}
            onStartOver={handleStartOver}
          />
        )}

        {/* Vitals & ECG Refinement Modal */}
        <VitalsModal
          lang={lang}
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          onSubmit={handleVitalsSubmit}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-borderLight py-6 px-4 text-center text-xs text-secondaryText no-print">
        <p className="max-w-xl mx-auto leading-relaxed">
          HeartWise India — AI-Powered Cardiovascular Risk Screening & Prevention Platform.
          <br />
          Built for awareness only. Never substitute digital risk screening for certified clinical diagnosis.
        </p>
      </footer>
    </div>
  );
}

export default App;
