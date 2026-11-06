import React from 'react';
import { VisualThemeMode } from '../types/survey';
import { Download, Shield, LogOut, Lock, Unlock } from 'lucide-react';

interface HeaderProps {
  currentView: 'form' | 'analytics' | 'table' | 'emails';
  onChangeView: (view: 'form' | 'analytics' | 'table' | 'emails') => void;
  onExportCSV: () => void;
  themeMode: VisualThemeMode;
  onChangeThemeMode: (mode: VisualThemeMode) => void;
  totalResponses: number;
  isResearcher: boolean;
  onOpenResearcherLogin: () => void;
  onExitResearcher: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onChangeView,
  onExportCSV,
  themeMode,
  onChangeThemeMode,
  totalResponses,
  isResearcher,
  onOpenResearcherLogin,
  onExitResearcher,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand title, one line */}
        <button
          type="button"
          onClick={() => onChangeView('form')}
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 text-left hover:text-sky-300 transition-colors"
        >
          STA 330 Screen Time Lab
        </button>

        {/* Zone 2: Nav links (ONLY for Researcher/Designer) or Academic label for respondents */}
        {isResearcher ? (
          <nav className="flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => onChangeView('form')}
              className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                currentView === 'form'
                  ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Questionnaire
            </button>

            <button
              type="button"
              onClick={() => onChangeView('analytics')}
              className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                currentView === 'analytics'
                  ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Analytics
            </button>

            <button
              type="button"
              onClick={() => onChangeView('table')}
              className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                currentView === 'table'
                  ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Responses ({totalResponses})
            </button>

            <button
              type="button"
              onClick={() => onChangeView('emails')}
              className={`whitespace-nowrap shrink-0 transition-colors pb-0.5 ${
                currentView === 'emails'
                  ? 'text-sky-400 border-b-2 border-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              Email Dispatcher
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
            <span>Faculty of Applied Sciences · University of Sri Jayewardenepura</span>
          </div>
        )}

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Visual Aura Mode selector: Daylight, Night Shift, OLED for mobile phone users & desktop */}
          <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg bg-slate-900/90 p-0.5 sm:p-1 border border-slate-800 text-[10px] sm:text-[11px] font-mono">
            <button
              type="button"
              onClick={() => onChangeThemeMode('blueLight')}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-0.5 rounded transition-all ${
                themeMode === 'blueLight'
                  ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Daylight Screen Mode (450nm standard daytime emission)"
            >
              <span>☀️</span>
              <span className="inline">Daylight</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeThemeMode('amberShield')}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-0.5 rounded transition-all ${
                themeMode === 'amberShield'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Night Shift Screen Mode (Amber bedtime warm circadian filter)"
            >
              <span>🌙</span>
              <span className="inline">Night Shift</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeThemeMode('obsidianOled')}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 sm:py-0.5 rounded transition-all ${
                themeMode === 'obsidianOled'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OLED Screen Mode (True black minimal dark mode)"
            >
              <span>📱</span>
              <span className="inline">OLED</span>
            </button>
          </div>

          {/* Action button: Export CSV if Researcher, or Researcher Access if Respondent */}
          {isResearcher ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={onExitResearcher}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:text-rose-400 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
                title="Lock & Exit to Respondent View"
              >
                <Lock className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Exit Researcher</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenResearcherLogin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              <Shield className="h-3.5 w-3.5 text-sky-400" />
              <span>Researcher Access</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
