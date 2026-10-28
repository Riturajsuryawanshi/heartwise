import React from 'react';

interface EcgHeartbeatProps {
  className?: string;
  strokeColor?: string;
}

export const EcgHeartbeat: React.FC<EcgHeartbeatProps> = ({
  className = "w-full h-24",
  strokeColor = "currentColor",
}) => {
  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 600 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-heart"
        preserveAspectRatio="none"
      >
        {/* Background grid line */}
        <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="4 4" />

        {/* ECG Continuous waveform path */}
        <path
          d="M0 60 L60 60 L80 60 L90 52 L100 60 L115 60 L125 75 L135 15 L145 95 L155 60 L170 60 L185 45 L200 60 L230 60 
             L290 60 L310 60 L320 52 L330 60 L345 60 L355 75 L365 15 L375 95 L385 60 L400 60 L415 45 L430 60 L460 60
             L520 60 L540 60 L550 52 L560 60 L575 60 L585 75 L595 15 L600 60"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-ecg drop-shadow-[0_2px_8px_rgba(225,29,72,0.4)]"
        />
      </svg>
    </div>
  );
};
