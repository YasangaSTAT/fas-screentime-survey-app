import React from 'react';
import { VisualThemeMode } from '../types/survey';
import {
  Download,
  Shield,
  Lock,
  GraduationCap,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Mail,
  Info,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

export type WebsiteView = 'about' | 'form' | 'analytics' | 'table' | 'emails';

interface HeaderProps {
  currentView: WebsiteView;
  onChangeView: (view: WebsiteView) => void;
  onExportCSV: () => void;
  themeMode: VisualThemeMode;
  onChangeThemeMode: (mode: VisualThemeMode) => void;
  totalResponses: number;
  isResearcher: boolean;
  onOpenResearcherLogin: () => void;
  onExitResearcher: () => void;
  onOpenMobileSimulation?: () => void;
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
  onOpenMobileSimulation,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      {/* Top Academic Ribbon */}
      <div className="hidden sm:block border-b border-slate-800/50 bg-slate-900/40 px-4 py-1 text-[11px] text-slate-400">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-medium text-slate-300">University of Sri Jayewardenepura</span>
            <span className="text-slate-600">·</span>
            <span>Faculty of Applied Sciences</span>
            <span className="text-slate-600">·</span>
            <span>Department of Statistics (STA 330 2.0)</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Academic Study</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">
              Sample: <strong className="text-emerald-400 font-bold">{totalResponses}</strong> / 300 Students {totalResponses >= 300 ? '(Target Achieved)' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeView('about')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors">
                USJ Screen Time Study
              </div>
              <div className="text-[10px] text-slate-400 font-mono hidden sm:block">
                STA 330 · Science Undergraduates
              </div>
            </div>
          </button>
        </div>

        {/* Website Navigation Bar - Accessible to all website visitors */}
        <nav className="order-3 sm:order-2 flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 max-w-full text-xs font-medium">
          <button
            type="button"
            onClick={() => onChangeView('form')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              currentView === 'form'
                ? 'bg-sky-500 text-white font-semibold shadow-sm shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Questionnaire</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeView('about')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              currentView === 'about'
                ? 'bg-sky-500 text-white font-semibold shadow-sm shadow-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>About Study</span>
          </button>

          {/* Only show Analytics, Responses, and Certificates navigation for Researcher */}
          {isResearcher && (
            <>
              <button
                type="button"
                onClick={() => onChangeView('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'analytics'
                    ? 'bg-sky-500 text-white font-semibold shadow-sm shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'table'
                    ? 'bg-sky-500 text-white font-semibold shadow-sm shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Responses ({totalResponses})</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeView('emails')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  currentView === 'emails'
                    ? 'bg-sky-500 text-white font-semibold shadow-sm shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Certificates</span>
              </button>
            </>
          )}
        </nav>

        {/* Action Controls & Researcher Badge */}
        <div className="order-2 sm:order-3 flex items-center gap-2 shrink-0">
          {/* Display Mode Theme: Daylight, Night Shift, OLED */}
          <div className="flex items-center gap-0.5 rounded-lg bg-slate-900/90 p-0.5 border border-slate-800 text-[10px] sm:text-[11px] font-mono">
            <button
              type="button"
              onClick={() => onChangeThemeMode('blueLight')}
              className={`px-1.5 sm:px-2 py-1 rounded transition-all cursor-pointer ${
                themeMode === 'blueLight'
                  ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Daylight Screen Mode (450nm standard daytime emission)"
            >
              ☀️ <span className="hidden sm:inline">Daylight</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeThemeMode('amberShield')}
              className={`px-1.5 sm:px-2 py-1 rounded transition-all cursor-pointer ${
                themeMode === 'amberShield'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Night Shift Screen Mode (Amber bedtime warm circadian filter)"
            >
              🌙 <span className="hidden sm:inline">Night Shift</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeThemeMode('obsidianOled')}
              className={`px-1.5 sm:px-2 py-1 rounded transition-all cursor-pointer ${
                themeMode === 'obsidianOled'
                  ? 'bg-slate-700 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="OLED Screen Mode (True black minimal dark mode)"
            >
              📱 <span className="hidden sm:inline">OLED</span>
            </button>
          </div>

          {/* Phone Mockup Mode Toggle */}
          {onOpenMobileSimulation && (
            <button
              type="button"
              onClick={onOpenMobileSimulation}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-700 rounded-lg hover:text-sky-300 hover:border-sky-500/50 transition-colors cursor-pointer"
              title="Lock device / Switch to Phone Mockup Mode"
            >
              <Smartphone className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Phone Mode</span>
            </button>
          )}

          {/* Export CSV Button - Only for Researcher */}
          {isResearcher && (
            <button
              type="button"
              onClick={onExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
              title="Download complete research responses as CSV"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>CSV</span>
            </button>
          )}

          {/* Researcher Access Toggle */}
          {isResearcher ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden md:inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-[10px] font-mono text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                <span>Admin Active</span>
              </span>
              <button
                type="button"
                onClick={onExitResearcher}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:text-rose-400 hover:border-slate-700 transition-colors cursor-pointer"
                title="Exit Researcher Mode"
              >
                <Lock className="h-3 w-3" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenResearcherLogin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 text-sky-400" />
              <span>Researcher</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
