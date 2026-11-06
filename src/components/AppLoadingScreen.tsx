import React, { useEffect, useState } from 'react';
import { Smartphone, Shield, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { VisualThemeMode } from '../types/survey';

interface AppLoadingScreenProps {
  onComplete: () => void;
  themeMode?: VisualThemeMode;
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onComplete,
  themeMode = 'blueLight',
}) => {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState('Initializing research environment...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const intervals = [
      { at: 20, text: 'Loading STA 330 2.0 Survey Instrument...' },
      { at: 55, text: 'Calibrating Digital Wellbeing & Screen Time metrics...' },
      { at: 85, text: 'Establishing Confidential Academic Session...' },
      { at: 100, text: 'Research Environment Ready' },
    ];

    let current = 0;
    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 5;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        setPhaseText('Research Environment Ready');
        clearInterval(timer);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(onComplete, 450);
        }, 300);
      } else {
        setProgress(current);
        const match = [...intervals].reverse().find((i) => current >= i.at);
        if (match) setPhaseText(match.text);
      }
    }, 60);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onComplete, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4 text-slate-100 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[90px]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Smartphone Silhouette Graphic with dynamic screen glow */}
        <div className="mx-auto relative flex h-24 w-14 items-center justify-center rounded-2xl border-2 border-slate-700 bg-slate-900/90 shadow-2xl shadow-sky-500/20">
          {/* Top speaker notch */}
          <div className="absolute top-2 h-1 w-4 rounded-full bg-slate-700" />
          
          {/* Inner glowing screen pulse */}
          <div className="h-16 w-10 rounded-lg bg-gradient-to-b from-sky-500/30 to-indigo-600/30 border border-sky-400/40 flex items-center justify-center overflow-hidden">
            <Activity className="h-5 w-5 text-sky-300 animate-pulse" />
          </div>

          {/* Bottom home indicator */}
          <div className="absolute bottom-1.5 h-0.5 w-4 rounded-full bg-slate-700" />
        </div>

        {/* Academic Institution Title */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-sky-400">
          <Shield className="h-4 w-4" />
          <span>Department of Statistics · USJ</span>
        </div>

        <h1 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-white">
          Demographic, Academic, and Lifestyle Factors
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Associated with Daily Smartphone Screen Time (STA 330 2.0)
        </p>

        {/* Progress Bar & Phase Text */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 truncate max-w-[260px] text-left">{phaseText}</span>
            <span className="text-sky-400 font-bold tabular-nums">{progress}%</span>
          </div>

          <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-400 rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick entry button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-sky-300 transition-colors"
          >
            <span>Enter Questionnaire</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
