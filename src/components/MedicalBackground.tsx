import React from 'react';

export const MedicalBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-slate-50">
      {/* Soft health-themed radial ambient lighting in calming cyan/blue & emerald */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-100/60 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-100/50 rounded-full blur-3xl" />

      {/* Subtle Geometric medical grid */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: `
            linear-gradient(to right, #cbd5e1 1px, transparent 1px),
            linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Medical Motif 1: DNA Double Helix (Top Right) */}
      <svg
        className="absolute top-12 right-6 w-32 h-44 text-blue-500/15"
        viewBox="0 0 100 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M20,10 C50,30 50,50 20,70 C-10,90 -10,110 20,130 C50,150 50,170 20,190" />
        <path d="M80,10 C50,30 50,50 80,70 C110,90 110,110 80,130 C50,150 50,170 80,190" />
        <line x1="26" y1="20" x2="74" y2="20" strokeWidth="1.5" />
        <line x1="38" y1="40" x2="62" y2="40" strokeWidth="1.5" />
        <line x1="20" y1="70" x2="80" y2="70" strokeWidth="1.5" />
        <line x1="38" y1="100" x2="62" y2="100" strokeWidth="1.5" />
        <line x1="26" y1="120" x2="74" y2="120" strokeWidth="1.5" />
        <line x1="20" y1="140" x2="80" y2="140" strokeWidth="1.5" />
      </svg>

      {/* Medical Motif 2: Lungs / Respiratory Wellness (Left Upper-Mid) */}
      <svg
        className="absolute top-1/4 left-6 w-28 h-28 text-emerald-500/15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Trachea */}
        <path d="M50 15 L50 40" strokeWidth="2" />
        <path d="M50 40 L40 50" />
        <path d="M50 40 L60 50" />
        {/* Left Lung */}
        <path d="M40 50 C25 50 15 62 18 80 C20 90 35 92 42 85 C46 80 44 65 40 50 Z" />
        {/* Right Lung */}
        <path d="M60 50 C75 50 85 62 82 80 C80 90 65 92 58 85 C54 80 56 65 60 50 Z" />
      </svg>

      {/* Medical Motif 3: Anatomical Heart Beat & Cardiology (Bottom Right) */}
      <svg
        className="absolute bottom-28 right-8 w-28 h-28 text-blue-600/15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M50 85 C50 85 20 62 18 42 C16 28 28 20 38 24 C44 26 48 32 50 35 C52 32 56 26 62 24 C72 20 84 28 82 42 C80 62 50 85 50 85 Z" />
        {/* Internal Pulse */}
        <path d="M30 46 L40 46 L45 38 L48 54 L52 42 L55 46 L70 46" strokeWidth="1.8" />
      </svg>

      {/* Medical Motif 4: Capsule & Tablet Formulation (Bottom Left) */}
      <svg
        className="absolute bottom-20 left-10 w-24 h-24 text-teal-600/15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <rect x="25" y="30" width="50" height="24" rx="12" transform="rotate(-30 50 42)" />
        <line x1="42" y1="26" x2="54" y2="46" strokeWidth="1.8" />
      </svg>

      {/* Animated Subtle ECG Heartbeat Wave across bottom */}
      <svg
        className="absolute bottom-12 left-0 right-0 w-full h-16 opacity-25"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,60 L250,60 L270,40 L280,80 L290,15 L305,105 L320,60 L350,60 L370,50 L385,60 L600,60 L850,60 L870,40 L880,80 L890,15 L905,105 L920,60 L950,60 L970,50 L985,60 L1200,60"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
        />
      </svg>

      {/* Floating subtle medical crosses */}
      <div className="absolute top-16 right-1/3 text-blue-300/30 text-2xl select-none font-bold">✚</div>
      <div className="absolute top-2/3 left-1/4 text-emerald-300/30 text-2xl select-none font-bold">✚</div>
    </div>
  );
};

