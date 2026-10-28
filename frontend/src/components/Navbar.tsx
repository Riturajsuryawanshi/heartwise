import React from 'react';
import { Heart, Moon, Sun, PhoneCall, Globe2 } from 'lucide-react';
import type { Language } from '../i18n';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onEmergencyClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleDark,
  onEmergencyClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-borderLight shadow-sm transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-heart shadow-sm">
            <Heart className="w-5 h-5 fill-heart animate-pulse" />
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-primaryText">
              HeartWise<span className="text-heart ml-0.5">India</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              AI Screening
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Emergency 112 Badge */}
          <button
            onClick={onEmergencyClick}
            type="button"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 transition-colors"
            title="Emergency helpline 112"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Emergency</span>
            <span>112</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            type="button"
            aria-label="Toggle language between English and Hindi"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-borderLight hover:bg-surfaceHover text-xs font-medium text-secondaryText hover:text-primaryText transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-secondaryText" />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDark}
            type="button"
            aria-label="Toggle light and dark mode"
            className="p-2 rounded-xl border border-borderLight hover:bg-surfaceHover text-secondaryText hover:text-primaryText transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
