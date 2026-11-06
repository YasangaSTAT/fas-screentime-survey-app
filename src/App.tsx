import React, { useState, useEffect } from 'react';
import { SurveyResponse, VisualThemeMode } from './types/survey';
import {
  loadStoredResponses,
  addSurveyResponse,
  deleteSurveyResponse,
  resetToSeedData,
  updateSurveyResponseEmailSent,
  resetAllEmailStatusesToPending,
} from './utils/storage';
import { downloadCSVFile } from './utils/csv';
import { InteractiveScreenAura } from './components/InteractiveScreenAura';
import { Header } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DataTable } from './components/DataTable';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { PhoneLockScreen } from './components/PhoneLockScreen';
import { EmailDispatcher } from './components/EmailDispatcher';
import {
  Smartphone,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Layers,
  Activity,
  Sliders,
  Shield,
  Lock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function App() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [currentView, setCurrentView] = useState<'form' | 'analytics' | 'table' | 'emails'>('form');
  const [themeMode, setThemeMode] = useState<VisualThemeMode>('blueLight');
  const [activeScreenTimeMinutes, setActiveScreenTimeMinutes] = useState<number>(270);
  const [showAuraControls, setShowAuraControls] = useState(false);
  const [isInteractiveBackground, setIsInteractiveBackground] = useState(true);

  // Initial App loading screen state (run once per browser session)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sta330_has_loaded') !== 'true';
    } catch {
      return true;
    }
  });

  // Phone lock screen state (respondent login view)
  const [isPhoneLocked, setIsPhoneLocked] = useState<boolean>(true);
  const [unlockedRegNo, setUnlockedRegNo] = useState<string>('');

  // Researcher access state
  const [isResearcher, setIsResearcher] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sta330_is_researcher') === 'true';
    } catch {
      return false;
    }
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Load responses from storage on mount
  useEffect(() => {
    const loaded = loadStoredResponses();
    setResponses(loaded);
  }, []);

  // Ensure respondents cannot access analytics or table views
  useEffect(() => {
    if (!isResearcher && currentView !== 'form') {
      setCurrentView('form');
    }
  }, [isResearcher, currentView]);

  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
    try {
      sessionStorage.setItem('sta330_has_loaded', 'true');
    } catch {}
  };

  const handlePhoneUnlock = (regNo?: string) => {
    if (regNo) {
      setUnlockedRegNo(regNo);
    }
    setIsPhoneLocked(false);
  };

  const handleSurveySubmit = (newResponse: SurveyResponse) => {
    const updated = addSurveyResponse(newResponse);
    setResponses(updated);
    if (typeof newResponse.dailyScreenTimeMinutes === 'number') {
      setActiveScreenTimeMinutes(newResponse.dailyScreenTimeMinutes);
    }
  };

  const handleDeleteResponse = (id: string) => {
    const updated = deleteSurveyResponse(id);
    setResponses(updated);
  };

  const handleResetData = () => {
    const reset = resetToSeedData();
    setResponses(reset);
  };

  const handleExportCSV = () => {
    downloadCSVFile(responses);
  };

  const handleUpdateEmailSent = (id: string, sentAt?: string) => {
    const updated = updateSurveyResponseEmailSent(id, sentAt);
    setResponses(updated);
  };

  const handleResetAllEmailStatuses = () => {
    const updated = resetAllEmailStatusesToPending();
    setResponses(updated);
  };

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginPasscode) {
      setLoginError('Please enter the researcher password.');
      return;
    }

    setIsAuthenticating(true);
    setLoginError('');

    // Simulate authenticating verification flow with loading interface
    setTimeout(() => {
      if (loginPasscode === 'Yas@2003') {
        setAuthSuccess(true);
        setTimeout(() => {
          setIsResearcher(true);
          try {
            localStorage.setItem('sta330_is_researcher', 'true');
          } catch {}
          setIsAuthenticating(false);
          setAuthSuccess(false);
          setShowLoginModal(false);
          setLoginPasscode('');
          setLoginError('');
          setIsPhoneLocked(false);
          setCurrentView('analytics');
        }, 500);
      } else {
        setIsAuthenticating(false);
        setLoginError('Incorrect password. Access denied.');
      }
    }, 700);
  };

  const handleExitResearcher = () => {
    setIsResearcher(false);
    try {
      localStorage.removeItem('sta330_is_researcher');
    } catch {}
    setCurrentView('form');
    setIsPhoneLocked(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* App Initial Calibration & Loading Interface */}
      {isInitialLoading && (
        <AppLoadingScreen
          onComplete={handleLoadingComplete}
          themeMode={themeMode}
        />
      )}

      {/* Respondent Phone Lock Screen & Unlocking Interface */}
      {!isInitialLoading && isPhoneLocked && (
        <PhoneLockScreen
          onUnlock={handlePhoneUnlock}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
        />
      )}

      {/* Interactive Background Canvas simulating smartphone screen light & digital wellbeing aura */}
      <InteractiveScreenAura
        themeMode={themeMode}
        screenTimeMinutes={activeScreenTimeMinutes}
        interactive={isInteractiveBackground}
      />

      {/* Main Content Layer (Z-10 above canvas) */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation Top Bar complying with Top Bar Contract */}
        <Header
          currentView={currentView}
          onChangeView={setCurrentView}
          onExportCSV={handleExportCSV}
          themeMode={themeMode}
          onChangeThemeMode={setThemeMode}
          totalResponses={responses.length}
          isResearcher={isResearcher}
          onOpenResearcherLogin={() => setShowLoginModal(true)}
          onExitResearcher={handleExitResearcher}
        />

        {/* Researcher Mode Banner (when active) */}
        {isResearcher && (
          <div className="border-b border-sky-500/30 bg-sky-950/60 px-4 py-2 backdrop-blur-md text-xs">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sky-200">
                <Shield className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-white">Researcher / Designer Mode Active:</span>
                <span className="text-sky-300">
                  Analytics, Responses Table, and CSV Export are unlocked. Standard respondents only see the questionnaire.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExitResearcher}
                className="flex items-center gap-1.5 rounded-md bg-slate-900 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
              >
                <Lock className="h-3 w-3 text-rose-400" />
                <span>Switch to Respondent View (Lock Phone)</span>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Background Telemetry Ribbon & Quick Switcher */}
        <div className="border-b border-slate-800/40 bg-slate-950/40 px-4 py-2 backdrop-blur-sm text-xs">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Activity className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span>Screen Aura:</span>
                <span className="font-semibold text-slate-200">
                  {themeMode === 'blueLight'
                    ? 'Daylight Blue (450nm)'
                    : themeMode === 'amberShield'
                    ? 'Night Shift (Amber)'
                    : 'Obsidian Minimal'}
                </span>
              </div>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <span>Photons reacting to:</span>
                <span className="font-semibold text-sky-300 tabular-nums">
                  {activeScreenTimeMinutes} min/day ({Math.floor(activeScreenTimeMinutes / 60)}h {activeScreenTimeMinutes % 60}m)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAuraControls(!showAuraControls)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-sky-300 transition-colors"
              >
                <Sliders className="h-3 w-3" />
                <span>{showAuraControls ? 'Hide Visual FX' : 'Aura Effects'}</span>
              </button>
            </div>

            {/* Mobile Phone User Display Mode Bar (Daylight, Night Shift, OLED) */}
            <div className="flex sm:hidden w-full items-center justify-between gap-1 pt-1.5 border-t border-slate-800/60 mt-1">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-sky-400" />
                <span>Mobile Display:</span>
              </span>
              <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-0.5 border border-slate-800 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setThemeMode('blueLight')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    themeMode === 'blueLight'
                      ? 'bg-sky-500 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ☀️ Daylight
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('amberShield')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    themeMode === 'amberShield'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🌙 Night Shift
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('obsidianOled')}
                  className={`px-2 py-0.5 rounded transition-all ${
                    themeMode === 'obsidianOled'
                      ? 'bg-slate-700 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📱 OLED
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Visual FX Controls */}
          {showAuraControls && (
            <div className="mx-auto max-w-7xl pt-2 pb-1 border-t border-slate-800/50 mt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="text-slate-400 text-[11px]">Simulate Screen Exposure:</label>
                <input
                  type="range"
                  min="60"
                  max="720"
                  step="15"
                  value={activeScreenTimeMinutes}
                  onChange={(e) => setActiveScreenTimeMinutes(Number(e.target.value))}
                  className="w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <span className="font-mono text-xs text-sky-400 font-bold tabular-nums">
                  {Math.floor(activeScreenTimeMinutes / 60)}h {activeScreenTimeMinutes % 60}m
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsInteractiveBackground(!isInteractiveBackground)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    isInteractiveBackground
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Mouse Ripple: {isInteractiveBackground ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <div className="mx-auto max-w-7xl">
            {currentView === 'form' && (
              <SurveyForm
                onSubmitSuccess={handleSurveySubmit}
                onScreenTimeChange={(mins) => setActiveScreenTimeMinutes(mins)}
                onNavigateToData={() => setCurrentView('analytics')}
                isResearcher={isResearcher}
                initialRegistrationNumber={unlockedRegNo}
                onLockPhone={() => setIsPhoneLocked(true)}
                themeMode={themeMode}
                onChangeThemeMode={setThemeMode}
              />
            )}

            {isResearcher && currentView === 'analytics' && (
              <AnalyticsDashboard
                responses={responses}
                onNavigateToForm={() => setCurrentView('form')}
                onNavigateToTable={() => setCurrentView('table')}
              />
            )}

            {isResearcher && currentView === 'table' && (
              <DataTable
                responses={responses}
                onDeleteResponse={handleDeleteResponse}
                onResetData={handleResetData}
                onNavigateToForm={() => setCurrentView('form')}
                onUpdateResponseEmailSent={handleUpdateEmailSent}
              />
            )}

            {isResearcher && currentView === 'emails' && (
              <EmailDispatcher
                responses={responses}
                onUpdateResponseEmailSent={handleUpdateEmailSent}
                onResetAllEmailStatuses={handleResetAllEmailStatuses}
                onNavigateToForm={() => setCurrentView('form')}
              />
            )}
          </div>
        </main>

        {/* Academic Research Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-4 backdrop-blur-md text-xs text-slate-400">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-medium text-slate-300">
                STA 330 2.0: Data Analysis and Preparation of Reports
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Department of Statistics · Faculty of Applied Sciences · University of Sri Jayewardenepura
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
              {isResearcher ? (
                <>
                  <span>N = {responses.length} responses</span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Download Master CSV
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    🔒 Strictly Confidential Academic Survey Session
                  </span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setIsPhoneLocked(true)}
                    className="text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Lock Device
                  </button>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>

      {/* Researcher Authentication Modal with Loading Interface */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Researcher &amp; Designer Portal</h3>
                  <p className="text-[11px] text-slate-400">Staff access to analytical charts and raw CSV exports</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isAuthenticating}
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError('');
                  setLoginPasscode('');
                  setIsAuthenticating(false);
                  setAuthSuccess(false);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Authenticating Loading State */}
            {isAuthenticating ? (
              <div className="py-8 text-center space-y-3">
                {authSuccess ? (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-300">Credentials Verified</p>
                    <p className="text-xs text-slate-400 font-mono">Unlocking STA 330 Analytics Suite...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Authenticating Researcher...</p>
                    <p className="text-xs text-slate-400 font-mono">Verifying authorization with STA 330 registry</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-200">
                    Enter Researcher Password
                  </label>
                  <input
                    type="password"
                    value={loginPasscode}
                    onChange={(e) => {
                      setLoginPasscode(e.target.value);
                      if (loginError) setLoginError('');
                    }}
                    placeholder="Enter password..."
                    autoFocus
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                  {loginError && (
                    <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 shrink-0" /> {loginError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginError('');
                      setLoginPasscode('');
                    }}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-sm"
                  >
                    Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
