import React, { useState } from 'react';
import { Smartphone, Clock, Apple, HelpCircle, ArrowRight, Check } from 'lucide-react';

interface DigitalWellbeingHelperProps {
  currentMinutes: number | '';
  onChangeMinutes: (mins: number) => void;
}

export const DigitalWellbeingHelper: React.FC<DigitalWellbeingHelperProps> = ({
  currentMinutes,
  onChangeMinutes,
}) => {
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [hoursInput, setHoursInput] = useState<number>(() => {
    if (typeof currentMinutes === 'number' && currentMinutes > 0) {
      return Math.floor(currentMinutes / 60);
    }
    return 4;
  });
  const [minutesInput, setMinutesInput] = useState<number>(() => {
    if (typeof currentMinutes === 'number' && currentMinutes > 0) {
      return currentMinutes % 60;
    }
    return 15;
  });

  const handleApplyHoursMinutes = (h: number, m: number) => {
    setHoursInput(h);
    setMinutesInput(m);
    const total = h * 60 + m;
    onChangeMinutes(total);
  };

  const presetTimes = [
    { label: '2h 30m', mins: 150 },
    { label: '3h 45m', mins: 225 },
    { label: '4h 15m', mins: 255 },
    { label: '5h 30m', mins: 330 },
    { label: '6h 45m', mins: 405 },
    { label: '8h 00m', mins: 480 },
  ];

  return (
    <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Screen Time Lookup & Conversion Assistant
            </h4>
            <p className="text-xs text-slate-400">
              Check your 7-day average on your device and convert hours & minutes into minutes.
            </p>
          </div>
        </div>

        {/* Platform tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              platform === 'android'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Android (Digital Wellbeing)</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              platform === 'ios'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="h-3.5 w-3.5" />
            <span>iOS (Screen Time)</span>
          </button>
        </div>
      </div>

      {/* Guide steps */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {platform === 'android' ? (
          <>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 1: Open Settings</span>
              <span className="text-slate-300">Open Settings app and scroll down to</span>
              <span className="block mt-1 font-mono text-[11px] text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                Digital Wellbeing &amp; parental controls
              </span>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 2: Tap Dashboard</span>
              <span className="text-slate-300">Tap the central circle or &quot;Dashboard&quot; to inspect daily breakdown for the past 7 days.</span>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 3: Read Daily Average</span>
              <span className="text-slate-300">Note your average screen time (e.g. 4 hrs 15 mins) and use the converter below.</span>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 1: Open Settings</span>
              <span className="text-slate-300">Go to iPhone Settings and select</span>
              <span className="block mt-1 font-mono text-[11px] text-sky-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                Screen Time
              </span>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 2: See All Activity</span>
              <span className="text-slate-300">Tap &quot;See All App &amp; Website Activity&quot; and switch to the &quot;Week&quot; tab.</span>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/80 text-xs">
              <span className="font-semibold text-sky-400 block mb-1">Step 3: Daily Average</span>
              <span className="text-slate-300">Read &quot;Daily Average&quot; at the top (e.g. 5h 20m) and enter it below.</span>
            </div>
          </>
        )}
      </div>

      {/* Converter tool */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Hours:</label>
            <input
              type="number"
              min="0"
              max="24"
              value={hoursInput}
              onChange={(e) => handleApplyHoursMinutes(Math.max(0, parseInt(e.target.value) || 0), minutesInput)}
              className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm font-semibold text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
          <span className="text-slate-500 font-bold">+</span>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-400 font-medium">Minutes:</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutesInput}
              onChange={(e) => handleApplyHoursMinutes(hoursInput, Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-center text-sm font-semibold text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
          <ArrowRight className="h-4 w-4 text-sky-400 shrink-0" />
          <div className="rounded-lg bg-sky-950/40 border border-sky-500/30 px-3 py-1 text-center">
            <span className="text-[10px] uppercase font-mono text-sky-400 block">Total</span>
            <span className="text-base font-mono font-bold text-sky-200">
              {hoursInput * 60 + minutesInput} min
            </span>
          </div>
        </div>

        {/* Quick presets */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Quick Picks:</span>
          {presetTimes.map((p) => {
            const isSelected = currentMinutes === p.mins;
            return (
              <button
                key={p.mins}
                type="button"
                onClick={() => {
                  setHoursInput(Math.floor(p.mins / 60));
                  setMinutesInput(p.mins % 60);
                  onChangeMinutes(p.mins);
                }}
                className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                  isSelected
                    ? 'bg-sky-500 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
