import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Fingerprint,
  Wifi,
  Battery,
  ShieldCheck,
  ChevronUp,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { VisualThemeMode } from '../types/survey';

interface PhoneLockScreenProps {
  onUnlock: (regNo?: string) => void;
  themeMode: VisualThemeMode;
  onChangeThemeMode?: (mode: VisualThemeMode) => void;
}

export const PhoneLockScreen: React.FC<PhoneLockScreenProps> = ({
  onUnlock,
  themeMode,
  onChangeThemeMode,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [pinCode, setPinCode] = useState<string[]>([]);
  const [pinError, setPinError] = useState(false);

  // Live real clock updates
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);

    // Visual unlock settling duration
    setTimeout(() => {
      onUnlock();
    }, 750);
  };

  const handleKeypadPress = (digit: string) => {
    if (pinCode.length < 4) {
      const newPin = [...pinCode, digit];
      setPinCode(newPin);
      if (newPin.length === 4) {
        // Any 4 digits unlock the phone to begin respondent session
        setTimeout(() => {
          triggerUnlock();
        }, 200);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPinCode((prev) => prev.slice(0, -1));
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isUnlocking ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}
    >
      {/* Quick Website Entry Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={triggerUnlock}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-sky-500 transition-colors shadow-lg cursor-pointer"
        >
          <span>Enter Website</span>
          <ArrowRight className="h-3.5 w-3.5 text-sky-400" />
        </button>
      </div>
      {/* Dynamic ambient screen glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] transition-colors duration-700 ${
            themeMode === 'amberShield'
              ? 'bg-amber-500/15'
              : themeMode === 'obsidianOled'
              ? 'bg-slate-700/10'
              : 'bg-sky-500/18'
          }`}
        />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Realistic Smartphone Shell & Lock Screen Interface */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] rounded-[44px] border-[5px] border-slate-700/80 bg-slate-900/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between p-6 select-none backdrop-blur-2xl">
        {/* Dynamic Island / Top Camera Speaker Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-between px-3 h-6 w-28 rounded-full bg-black/90 border border-slate-800 shadow-md">
          <div className="h-2 w-2 rounded-full bg-slate-900 border border-slate-700" />
          <div className="h-1.5 w-1.5 rounded-full bg-sky-500/80 animate-pulse" />
        </div>

        {/* Top Status Bar */}
        <div className="relative z-10 flex items-center justify-between text-xs font-medium text-slate-300 pt-1 px-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-tight">
            <span>{currentTime || '10:00'}</span>
            <span className="text-[10px] text-slate-400">· USJ 5G</span>
          </div>

          {/* Animated Lock Icon */}
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ${
              isUnlocking
                ? 'bg-emerald-500/20 text-emerald-400 scale-110'
                : 'text-slate-400'
            }`}
          >
            {isUnlocking ? (
              <Unlock className="h-3.5 w-3.5 animate-bounce" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5" />
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <span>88%</span>
              <Battery className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Lock Screen Center: Digital Clock & Date */}
        <div className="relative z-10 text-center pt-8 sm:pt-12">
          <h1 className="text-6xl sm:text-7xl font-bold font-mono tracking-tighter text-white drop-shadow-lg">
            {currentTime || '10:00'}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-300 capitalize drop-shadow">
            {currentDate || 'Tuesday, November 3'}
          </p>

          {/* Mobile Phone User Display Mode Widget (Daylight, Night Shift, OLED) */}
          {onChangeThemeMode && (
            <div className="mt-4 mx-auto inline-flex flex-col items-center rounded-2xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 backdrop-blur-md shadow-lg max-w-[320px] w-full">
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400 mb-1.5 px-0.5">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <Smartphone className="h-3 w-3 text-sky-400" />
                  <span>Phone Display:</span>
                </span>
                <span className="text-sky-300 font-mono font-medium">
                  {themeMode === 'blueLight'
                    ? 'Daylight'
                    : themeMode === 'amberShield'
                    ? 'Night Shift'
                    : 'OLED Dark'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 w-full text-[10px] font-mono">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeThemeMode('blueLight');
                  }}
                  className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    themeMode === 'blueLight'
                      ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30 ring-1 ring-white/20'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Daylight: Standard daytime 450nm blue light"
                >
                  <span>☀️ Daylight</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeThemeMode('amberShield');
                  }}
                  className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    themeMode === 'amberShield'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 ring-1 ring-amber-300/40'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Night Shift: Warm amber circadian filter for sleep"
                >
                  <span>🌙 Night Shift</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeThemeMode('obsidianOled');
                  }}
                  className={`py-1.5 px-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${
                    themeMode === 'obsidianOled'
                      ? 'bg-slate-700 text-white font-bold shadow-md ring-1 ring-slate-500/40'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="OLED: True black minimal energy-saving dark mode"
                >
                  <span>📱 OLED</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Card: Survey Research Prompt */}
        <div className="relative z-10 my-auto">
          {!showKeypad ? (
            <div
              onClick={() => triggerUnlock()}
              className="group cursor-pointer rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-950/85 hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-sky-400">
                    <Smartphone className="h-3 w-3" />
                  </div>
                  <span className="font-semibold text-slate-300 uppercase tracking-wider font-mono text-[10px]">
                    STA 330 Research Study
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Now</span>
              </div>

              <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                Smartphone Screen Time &amp; Lifestyle Survey
              </h4>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed line-clamp-2">
                Tap to unlock phone and record your daily screen time, sleep, and digital habits for the academic survey.
              </p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-sky-400 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Tap notification or sensor to unlock
                </span>
                <span className="text-slate-400 font-mono">3–5 min</span>
              </div>
            </div>
          ) : (
            /* Passcode entry screen */
            <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-5 backdrop-blur-md text-center">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block mb-3">
                Enter Passcode or Reg No.
              </span>

              {/* Pin dots */}
              <div className="flex justify-center items-center gap-3 mb-5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-3 w-3 rounded-full border transition-all ${
                      pinCode.length > idx
                        ? 'bg-sky-400 border-sky-400 scale-125'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Numeric Pad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto text-sm font-mono font-semibold">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-full border border-slate-800 bg-slate-900/80 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center text-base"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowKeypad(false)}
                  className="h-12 rounded-full text-xs text-slate-400 hover:text-white flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-full border border-slate-800 bg-slate-900/80 text-white hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center text-base"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadDelete}
                  className="h-12 rounded-full text-xs text-slate-400 hover:text-white flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lock Screen Bottom Section: Biometric Fingerprint & Swipe Bar */}
        <div className="relative z-10 pt-4 pb-1 text-center space-y-4">
          {/* Biometric Fingerprint Sensor */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => triggerUnlock()}
              disabled={isUnlocking}
              className={`group relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 ${
                isUnlocking
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/30'
                  : 'border-sky-500/40 bg-sky-500/10 text-sky-400 hover:border-sky-400 hover:bg-sky-500/20 hover:scale-105 shadow-md shadow-sky-500/10 active:scale-95'
              }`}
              title="Touch sensor to unlock phone"
            >
              {/* Animated glowing scanning rings */}
              <div className="absolute inset-0 rounded-full border border-sky-400/30 animate-ping opacity-30" />
              {isUnlocking ? (
                <CheckCircle2 className="h-8 w-8 animate-pulse text-emerald-400" />
              ) : (
                <Fingerprint className="h-8 w-8 group-hover:scale-110 transition-transform" />
              )}
            </button>
            <span className="mt-2 text-[11px] font-medium text-slate-400">
              {isUnlocking ? 'Unlocking phone...' : 'Touch sensor to unlock'}
            </span>
          </div>

          {/* Swipe Up Bar */}
          <div
            onClick={() => triggerUnlock()}
            className="group cursor-pointer flex flex-col items-center justify-center pt-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
              <ChevronUp className="h-3.5 w-3.5 animate-bounce text-sky-400" />
              <span>Swipe up to open survey</span>
            </div>
            {/* iOS style home bar line */}
            <div className="mt-2 h-1 w-32 rounded-full bg-slate-600/70 group-hover:bg-slate-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
