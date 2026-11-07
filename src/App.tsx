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
import { Header, WebsiteView } from './components/Header';
import { SurveyForm } from './components/SurveyForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DataTable } from './components/DataTable';
import { AboutStudy } from './components/AboutStudy';
import { AppLoadingScreen } from './components/AppLoadingScreen';
import { PhoneLockScreen } from './components/PhoneLockScreen';
import { EmailDispatcher } from './components/EmailDispatcher';
import {
  Smartphone,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Activity,
  Sliders,
  Shield,
  Lock,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
  BookOpen,
  FileText,
  Mail,
  Heart,
} from 'lucide-react';

export default function App() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [currentView, setCurrentView] = useState<WebsiteView>('form');
  const [themeMode, setThemeMode] = useState<VisualThemeMode>('blueLight');
  const [activeScreenTimeMinutes, setActiveScreenTimeMinutes] = useState<number>(270);
  const [showAuraControls, setShowAuraControls] = useState(false);
  const [isInteractiveBackground, setIsInteractiveBackground] = useState(true);

  // Begin website with phone mockup mode as requested
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(false);
  const [isPhoneLocked, setIsPhoneLocked] = useState<boolean>(true);
  const [unlockedRegNo, setUnlockedRegNo] = useState<string>('');

  // Researcher administrative access state
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

  // Load responses from storage on mount & keep in sync with local storage & custom events
  useEffect(() => {
    const syncResponses = () => {
      const loaded = loadStoredResponses();
      setResponses(loaded);
    };

    syncResponses();

    const handleSync = () => syncResponses();
    window.addEventListener('storage', handleSync);
    window.addEventListener('sta330_responses_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('sta330_responses_updated', handleSync);
    };
  }, []);

  // Ensure restricted administrative views (analytics and email dispatcher) are for researchers,
  // but allow table view so submitted responses can be verified.
  useEffect(() => {
    if (!isResearcher && (currentView === 'analytics' || currentView === 'emails')) {
      setCurrentView('form');
    }
  }, [isResearcher, currentView]);

  const handleLoadingComplete = () => {
    setIsInitialLoading(false);
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
          setCurrentView('analytics');
        }, 500);
      } else {
        setIsAuthenticating(false);
        setLoginError('Incorrect password. Access denied.');
      }
    }, 600);
  };

  const handleExitResearcher = () => {
    setIsResearcher(false);
    try {
      localStorage.removeItem('sta330_is_researcher');
    } catch {}
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Optional App Initial Calibration */}
      {isInitialLoading && (
        <AppLoadingScreen
          onComplete={handleLoadingComplete}
          themeMode={themeMode}
        />
      )}

      {/* Optional Interactive Phone Lock Screen Simulation */}
      {isPhoneLocked && (
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

      {/* Main Website Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Website Header & Navigation */}
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
          onOpenMobileSimulation={() => setIsPhoneLocked(true)}
        />

        {/* Researcher Mode Administrative Notice */}
        {isResearcher && (
          <div className="border-b border-sky-500/30 bg-sky-950/70 px-4 py-2 backdrop-blur-md text-xs">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sky-200">
                <Shield className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="font-semibold text-white">Researcher Administrator Active:</span>
                <span className="text-sky-300">
                  Full dataset management, individual response deletion, email configuration, and raw CSV export unlocked.
                </span>
              </div>
              <button
                type="button"
                onClick={handleExitResearcher}
                className="flex items-center gap-1.5 rounded-md bg-slate-900 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
              >
                <Lock className="h-3 w-3 text-rose-400" />
                <span>Exit Administrator Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* Website Sub-bar: Theme photon reactive indicator & Aura FX controls */}
        <div className="border-b border-slate-800/40 bg-slate-950/50 px-4 py-2 backdrop-blur-sm text-xs">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                <Activity className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                <span>Screen Aura:</span>
                <span className="font-semibold text-slate-200">
                  {themeMode === 'blueLight'
                    ? 'Daylight Blue (450nm)'
                    : themeMode === 'amberShield'
                    ? 'Night Shift (Amber 590nm)'
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAuraControls(!showAuraControls)}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                <Sliders className="h-3 w-3" />
                <span>{showAuraControls ? 'Hide Visual FX' : 'Aura FX Controls'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPhoneLocked(true)}
                className="hidden md:flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                title="Preview what respondent sees in smartphone mockup mode"
              >
                <Smartphone className="h-3 w-3 text-sky-400" />
                <span>Phone Mockup Mode</span>
              </button>
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
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
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

        {/* Main Website View Container */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
          <div className="mx-auto max-w-7xl">
            {currentView === 'about' && (
              <AboutStudy
                onNavigateToForm={() => setCurrentView('form')}
                onNavigateToAnalytics={() => setCurrentView('analytics')}
                onNavigateToTable={() => setCurrentView('table')}
                totalResponses={responses.length}
                themeMode={themeMode}
                isResearcher={isResearcher}
                onOpenResearcherLogin={() => setShowLoginModal(true)}
              />
            )}

            {currentView === 'form' && (
              <SurveyForm
                onSubmitSuccess={handleSurveySubmit}
                onScreenTimeChange={(mins) => setActiveScreenTimeMinutes(mins)}
                onNavigateToData={() => setCurrentView('table')}
                isResearcher={isResearcher}
                initialRegistrationNumber={unlockedRegNo}
                themeMode={themeMode}
                onChangeThemeMode={setThemeMode}
                totalResponses={responses.length}
                onLockPhone={() => setIsPhoneLocked(true)}
              />
            )}

            {currentView === 'analytics' && (
              <AnalyticsDashboard
                responses={responses}
                onNavigateToForm={() => setCurrentView('form')}
                onNavigateToTable={() => setCurrentView('table')}
              />
            )}

            {currentView === 'table' && (
              <DataTable
                responses={responses}
                onDeleteResponse={handleDeleteResponse}
                onResetData={handleResetData}
                onNavigateToForm={() => setCurrentView('form')}
                onUpdateResponseEmailSent={handleUpdateEmailSent}
                isResearcher={isResearcher}
                onOpenResearcherLogin={() => setShowLoginModal(true)}
              />
            )}

            {currentView === 'emails' && (
              <EmailDispatcher
                responses={responses}
                onUpdateResponseEmailSent={handleUpdateEmailSent}
                onResetAllEmailStatuses={handleResetAllEmailStatuses}
                onNavigateToForm={() => setCurrentView('form')}
              />
            )}
          </div>
        </main>

        {/* Academic Research Website Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 px-4 sm:px-6 backdrop-blur-md text-xs text-slate-400">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <GraduationCap className="h-4 w-4 text-sky-400" />
                  <span>University of Sri Jayewardenepura · Faculty of Applied Sciences</span>
                </div>
                <p className="text-slate-400 text-xs">
                  Department of Statistics · STA 330 2.0 (Data Analysis and Preparation of Reports)
                </p>
                <p className="text-[11px] text-slate-500">
                  Research Title: Demographic, Academic, and Lifestyle Factors Associated with Daily Smartphone Screen Time
                </p>
              </div>

              {/* Website Navigation Links in Footer */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCurrentView('form')}
                  className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
                >
                  Questionnaire
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('about')}
                  className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
                >
                  About Research
                </button>
                {isResearcher && (
                  <>
                    <button
                      type="button"
                      onClick={() => setCurrentView('analytics')}
                      className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
                    >
                      Live Analytics
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView('table')}
                      className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
                    >
                      Responses ({responses.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentView('emails')}
                      className="text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
                    >
                      Certificates
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>🔒 Strictly Confidential Academic Research</span>
                <span>·</span>
                <span>All respondent data is anonymized for statistical analysis</span>
              </div>

              <div className="flex items-center gap-4">
                {isResearcher && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      Download Master CSV
                    </button>
                    <span>·</span>
                  </>
                )}
                {isResearcher ? (
                  <button
                    type="button"
                    onClick={handleExitResearcher}
                    className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    Exit Researcher Mode
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(true)}
                    className="text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    Researcher Login
                  </button>
                )}
                <span>·</span>
                <button
                  type="button"
                  onClick={() => setIsPhoneLocked(true)}
                  className="text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                >
                  Phone Mockup Mode
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Researcher Authentication Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Researcher Portal</h3>
                  <p className="text-[11px] text-slate-400">Department staff and study supervisor access</p>
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
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 cursor-pointer"
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
                    <p className="text-xs text-slate-400 font-mono">Unlocking Administrative Dashboard...</p>
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
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-sm cursor-pointer"
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
