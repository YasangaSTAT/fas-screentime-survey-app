import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  BarChart3,
  Smartphone,
  Moon,
  Clock,
  ArrowRight,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Award,
  Sparkles,
} from 'lucide-react';
import { VisualThemeMode } from '../types/survey';

interface AboutStudyProps {
  onNavigateToForm: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToTable: () => void;
  totalResponses: number;
  themeMode?: VisualThemeMode;
  isResearcher?: boolean;
  onOpenResearcherLogin?: () => void;
}

export const AboutStudy: React.FC<AboutStudyProps> = ({
  onNavigateToForm,
  onNavigateToAnalytics,
  onNavigateToTable,
  totalResponses,
  isResearcher = false,
  onOpenResearcherLogin,
}) => {
  return (
    <div className="space-y-10 py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono">
            <span>Faculty of Applied Sciences</span>
            <span className="text-slate-600">·</span>
            <span>Department of Statistics</span>
            <span className="text-slate-600">·</span>
            <span>USJ · STA 330 2.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smartphone Screen Time Research Study
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            An academic research instrument investigating the demographic, academic, and lifestyle factors
            associated with daily smartphone screen time among undergraduate students at the Faculty of Applied Sciences,
            University of Sri Jayewardenepura.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onNavigateToForm}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition-all cursor-pointer"
            >
              <span>Participate in Survey</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {isResearcher ? (
              <>
                <button
                  type="button"
                  onClick={onNavigateToAnalytics}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white transition-all cursor-pointer"
                >
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                  <span>Explore Live Analytics ({totalResponses} records)</span>
                </button>

                <button
                  type="button"
                  onClick={onNavigateToTable}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Dataset &amp; CSV Export</span>
                </button>
              </>
            ) : (
              onOpenResearcherLogin && (
                <button
                  type="button"
                  onClick={onOpenResearcherLogin}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all cursor-pointer"
                >
                  <span>Researcher Portal</span>
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Institutional Metadata & Academic Integrity Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Academic Framework</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conducted under Course Unit <strong>STA 330 2.0 (Special Topics in Statistics)</strong> within the Department of Statistics, Faculty of Applied Sciences, University of Sri Jayewardenepura.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Ethics &amp; Confidentiality</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            All survey data is collected strictly for academic and statistical modeling. Personal records are kept confidential, anonymized in reporting, and securely processed.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-white">Student Recognition</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Upon verified questionnaire completion, participating students receive an immediate academic Certificate of Survey Contribution and a Digital Wellbeing analysis.
          </p>
        </div>
      </section>

      {/* Research Objectives & Questions */}
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-400" />
            <span>Research Objectives &amp; Inquiries</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Core statistical questions investigated across the science undergraduate population:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Smartphone className="h-4 w-4" />
              <span>1. Screen Time Across Disciplines</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assessing whether daily smartphone screen duration differs significantly between Physical Science, Biological Science, Food Science &amp; Technology, and Sports Science students.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <Moon className="h-4 w-4" />
              <span>2. Nocturnal Use &amp; Sleep Disruption</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluating the statistical correlation between late-night (in-bed) smartphone usage and overall sleep duration, sleep quality, and circadian fatigue.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Clock className="h-4 w-4" />
              <span>3. Independent Study Hours vs. Digital Habit</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Investigating the relationship between self-directed academic revision hours and primary screen time purpose (academic LMS vs. entertainment vs. social communication).
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Users className="h-4 w-4" />
              <span>4. Accommodation &amp; Connectivity Influence</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Analyzing how living arrangements (Hostel vs Boarding annex vs Family home) and connection type (Wi-Fi vs Mobile Data packages) impact screen exposure and expenditure.
            </p>
          </div>
        </div>
      </section>

      {/* Target Population & Measurement Methodology */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Target Population &amp; Eligibility</h3>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Target Sample Size: <strong className="text-white">300 Undergraduate Students</strong> representing all 4 academic years.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Currently registered undergraduate students in the <strong>Faculty of Applied Sciences (USJ)</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Disciplines: Physical Science, Biological Science, Food Science &amp; Technology, and Sports Science &amp; Management.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <span>Active smartphone users (Android or iOS) utilizing mobile apps for academic or personal communication.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Screen Time Verification Guidance</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To ensure high measurement accuracy, respondents are encouraged to verify their daily average screen time directly from device system utilities:
          </p>
          <div className="space-y-2 text-xs text-slate-400 font-mono">
            <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
              <span className="text-sky-300 font-bold">iOS / Apple:</span> Settings → Screen Time → See All App &amp; Website Activity
            </div>
            <div className="rounded-lg bg-slate-950/80 p-2.5 border border-slate-800">
              <span className="text-emerald-300 font-bold">Android:</span> Settings → Digital Wellbeing &amp; Parental Controls → Dashboard
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call-to-Action Banner */}
      <section className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to Contribute Your Data?</h3>
          <p className="text-xs text-slate-300 mt-1">
            Takes approximately 3–4 minutes to complete. All responses are encrypted and strictly confidential.
          </p>
        </div>
        <button
          type="button"
          onClick={onNavigateToForm}
          className="rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 transition-colors whitespace-nowrap cursor-pointer"
        >
          Begin Questionnaire
        </button>
      </section>
    </div>
  );
};
