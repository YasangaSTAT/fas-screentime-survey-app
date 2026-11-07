import React, { useMemo, useState } from 'react';
import { SurveyResponse } from '../types/survey';
import { downloadCSVFile, copyCSVToClipboard, generateCSVContent } from '../utils/csv';
import {
  Download,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Clock,
  Moon,
  BookOpen,
  Wifi,
  Sparkles,
  PieChart,
  BarChart3,
  Layers,
  FileSpreadsheet,
  Maximize2,
  X,
  Smartphone,
} from 'lucide-react';

interface AnalyticsDashboardProps {
  responses: SurveyResponse[];
  onNavigateToForm?: () => void;
  onNavigateToTable?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  responses,
  onNavigateToForm,
  onNavigateToTable,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  // Compute stats
  const stats = useMemo(() => {
    const n = responses.length;
    if (n === 0) return null;

    const screenTimes = responses.map((r) => Number(r.dailyScreenTimeMinutes) || 0);
    const sleepHours = responses.map((r) => Number(r.sleepDurationHours) || 0);
    const studyHours = responses.map((r) => Number(r.independentStudyHours) || 0);
    const bedtimeTimes = responses.map((r) => Number(r.bedtimeUsageMinutes) || 0);
    const spends = responses.map((r) => Number(r.monthlyDataSpendLKR) || 0);

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const median = (arr: number[]) => {
      const s = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    };

    const meanScreen = mean(screenTimes);
    const medianScreen = median(screenTimes);
    const meanSleep = mean(sleepHours);
    const meanStudy = mean(studyHours);
    const meanBedtime = mean(bedtimeTimes);
    const meanSpend = mean(spends);

    // Pearson correlation coefficient r
    const calcPearsonR = (x: number[], y: number[]) => {
      const meanX = mean(x);
      const meanY = mean(y);
      let num = 0;
      let denX = 0;
      let denY = 0;
      for (let i = 0; i < x.length; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      const den = Math.sqrt(denX * denY);
      return den === 0 ? 0 : num / den;
    };

    const rScreenSleep = calcPearsonR(screenTimes, sleepHours);
    const rScreenStudy = calcPearsonR(screenTimes, studyHours);

    // Screen time histogram brackets
    const brackets = [
      { label: '< 3 hrs (< 180m)', count: 0, min: 0, max: 179 },
      { label: '3–5 hrs (180–300m)', count: 0, min: 180, max: 300 },
      { label: '5–7 hrs (301–420m)', count: 0, min: 301, max: 420 },
      { label: '7–9 hrs (421–540m)', count: 0, min: 421, max: 540 },
      { label: '≥ 9 hrs (≥ 541m)', count: 0, min: 541, max: 9999 },
    ];
    screenTimes.forEach((m) => {
      const b = brackets.find((br) => m >= br.min && m <= br.max);
      if (b) b.count++;
    });

    // Degree breakdown
    const degrees = [
      'Physical Science',
      'Biological Science',
      'Food Science & Technology',
      'Sports Science & Management',
    ];
    const degreeStats = degrees.map((d) => {
      const matching = responses.filter((r) => r.degreeProgramme === d);
      const count = matching.length;
      const avgScreen = count > 0 ? mean(matching.map((r) => Number(r.dailyScreenTimeMinutes) || 0)) : 0;
      return { degree: d, count, avgScreen };
    });

    // Purpose breakdown
    const purposeCounts: Record<string, number> = {};
    responses.forEach((r) => {
      const p = r.primaryPurpose || 'Unspecified';
      purposeCounts[p] = (purposeCounts[p] || 0) + 1;
    });

    // Connection breakdown
    const connCounts: Record<string, { count: number; totalSpend: number }> = {};
    responses.forEach((r) => {
      const c = r.connectionType || 'Unspecified';
      if (!connCounts[c]) connCounts[c] = { count: 0, totalSpend: 0 };
      connCounts[c].count++;
      connCounts[c].totalSpend += Number(r.monthlyDataSpendLKR) || 0;
    });

    return {
      n,
      meanScreen,
      medianScreen,
      meanSleep,
      meanStudy,
      meanBedtime,
      meanSpend,
      rScreenSleep,
      rScreenStudy,
      brackets,
      degreeStats,
      purposeCounts,
      connCounts,
    };
  }, [responses]);

  const handleCopy = async () => {
    const ok = await copyCSVToClipboard(responses);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    downloadCSVFile(responses);
  };

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center backdrop-blur-xl shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4">
            <BarChart3 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            STA 330 2.0 Academic Research Analytics
          </h2>
          <p className="mt-1.5 text-xs text-slate-400 max-w-lg mx-auto">
            Faculty of Applied Sciences, University of Sri Jayewardenepura.
            Statistical analysis will compute automatically once survey responses are submitted.
          </p>

          {/* Sample Size Target Progress */}
          <div className="mt-6 mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-left">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                Target Sample Size Progress
              </span>
              <span className="font-mono text-sky-400 font-bold">0 / 300 (0.0%)</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 w-0" />
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              300 undergraduate survey responses needed for parametric and correlation analysis.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {onNavigateToForm && (
              <button
                type="button"
                onClick={onNavigateToForm}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Smartphone className="h-4 w-4" />
                <span>Fill Questionnaire</span>
              </button>
            )}
            {onNavigateToTable && (
              <button
                type="button"
                onClick={onNavigateToTable}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>View Responses Table</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const csvPreview = generateCSVContent(responses);

  return (
    <div className="space-y-6">
      {/* Top Header Strip & Export Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800/80 bg-slate-900/90 p-5 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-sky-400 font-semibold">
              STA 330 2.0 Empirical Analytics
            </span>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">Sample Size: N = {stats.n}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-0.5">
            Statistical Analysis &amp; Data Export Suite
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-sky-400" />
            <span>Preview CSV</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
            <span>{copied ? 'Copied CSV!' : 'Copy CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV (N={stats.n})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Mean Screen Time */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-mono tracking-wider">Daily Screen Time</span>
            <Smartphone className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-sky-300 tabular-nums">
              {Math.round(stats.meanScreen)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">min/day</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            ≈ {Math.floor(stats.meanScreen / 60)}h {Math.round(stats.meanScreen % 60)}m (Median: {Math.round(stats.medianScreen)}m)
          </p>
        </div>

        {/* Average Sleep Duration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-mono tracking-wider">Average Sleep</span>
            <Moon className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">
              {stats.meanSleep.toFixed(1)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">hours/night</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Bedtime screen: {Math.round(stats.meanBedtime)} min avg
          </p>
        </div>

        {/* Study Time */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-mono tracking-wider">Independent Study</span>
            <BookOpen className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300 tabular-nums">
              {stats.meanStudy.toFixed(1)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">hours/day</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Outside lecture &amp; lab hours
          </p>
        </div>

        {/* Monthly Data Spend */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-mono tracking-wider">Mobile Data Spend</span>
            <Wifi className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
              Rs. {Math.round(stats.meanSpend)}
            </span>
            <span className="text-xs uppercase font-mono text-slate-400">/month</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Internet packages &amp; top-ups
          </p>
        </div>
      </div>

      {/* Correlation Rigor Cards for STA 330 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Screen vs Sleep correlation */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs uppercase font-mono text-sky-400 font-semibold">
                Pearson Correlation (r)
              </span>
              <h3 className="text-sm font-semibold text-slate-100">
                Screen Time vs. Sleep Duration
              </h3>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-sky-300 border border-slate-800">
              {stats.rScreenSleep < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>r = {stats.rScreenSleep.toFixed(3)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            {stats.rScreenSleep < -0.3
              ? `A moderate negative correlation (r = ${stats.rScreenSleep.toFixed(3)}) exists. Students with higher daily smartphone screen time experience systematically reduced sleep duration.`
              : stats.rScreenSleep < 0
              ? `A slight negative correlation (r = ${stats.rScreenSleep.toFixed(3)}) is observed between smartphone screen exposure and nocturnal sleep.`
              : `A weak non-negative association (r = ${stats.rScreenSleep.toFixed(3)}) in the sample.`}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Hypothesis Test: H0: ρ = 0</span>
            <span>Sample size n = {stats.n}</span>
          </div>
        </div>

        {/* Screen vs Study correlation */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs uppercase font-mono text-emerald-400 font-semibold">
                Pearson Correlation (r)
              </span>
              <h3 className="text-sm font-semibold text-slate-100">
                Screen Time vs. Independent Study
              </h3>
            </div>
            <div className="flex items-center gap-1 rounded-md bg-slate-950 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300 border border-slate-800">
              {stats.rScreenStudy < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span>r = {stats.rScreenStudy.toFixed(3)}</span>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">
            {stats.rScreenStudy < -0.2
              ? `Empirical inverse association (r = ${stats.rScreenStudy.toFixed(3)}) indicates higher smartphone usage tends to compete with autonomous study hours.`
              : `Observed correlation of r = ${stats.rScreenStudy.toFixed(3)} across degree faculties in the sample.`}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Regression metric</span>
            <span>Sample size n = {stats.n}</span>
          </div>
        </div>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Screen time histogram */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-sky-400" />
              <span>Screen Time Distribution</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Frequency (Count)</span>
          </div>

          <div className="mt-4 space-y-3">
            {stats.brackets.map((b) => {
              const pct = stats.n > 0 ? (b.count / stats.n) * 100 : 0;
              return (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300">{b.label}</span>
                    <span className="font-mono text-sky-300">
                      {b.count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Degree Programme Averages */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Average Daily Screen Time by Degree</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Minutes</span>
          </div>

          <div className="mt-4 space-y-3">
            {stats.degreeStats.map((d) => {
              const maxScale = 480; // 8 hours reference
              const pct = Math.min((d.avgScreen / maxScale) * 100, 100);
              return (
                <div key={d.degree} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 truncate max-w-[200px]">{d.degree}</span>
                    <span className="font-mono text-indigo-300">
                      {Math.round(d.avgScreen)} min ({d.count} resp.)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Purpose & Connection Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Primary Purpose */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-emerald-400" />
              <span>Primary Purpose of Smartphone Use</span>
            </h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {Object.entries(stats.purposeCounts).map(([purpose, count]) => {
              const pct = ((count / stats.n) * 100).toFixed(0);
              return (
                <div
                  key={purpose}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-300 truncate max-w-[240px]">{purpose}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{count}</span>
                    <span className="text-emerald-400 font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Type & Spending */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-amber-400" />
              <span>Connection Type &amp; Monthly Spend</span>
            </h3>
          </div>
          <div className="mt-4 space-y-2.5">
            {Object.entries(stats.connCounts).map(([conn, val]) => {
              const avg = val.count > 0 ? Math.round(val.totalSpend / val.count) : 0;
              return (
                <div
                  key={conn}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 p-2.5 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-300 truncate max-w-[220px]">{conn}</span>
                  <div className="text-right font-mono">
                    <span className="text-amber-300 font-semibold block">Rs. {avg} avg</span>
                    <span className="text-[10px] text-slate-500">{val.count} students</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSV Preview Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Live CSV Data Stream (RFC 4180 Compliant)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formatted for R, Python (pandas), SPSS, and Microsoft Excel analysis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCSVModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-auto rounded-lg bg-slate-950 p-4 border border-slate-800">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed">
                {csvPreview}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                {stats.n} rows · {csvPreview.length} bytes
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .csv File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
