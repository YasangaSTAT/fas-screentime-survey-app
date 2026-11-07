import React, { useState, useMemo } from 'react';
import { SurveyResponse } from '../types/survey';
import { downloadCSVFile, copyCSVToClipboard } from '../utils/csv';
import {
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Trash2,
  Eye,
  X,
  RotateCcw,
  ArrowUpDown,
  Smartphone,
  GraduationCap,
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { EmailModal } from './EmailModal';

interface DataTableProps {
  responses: SurveyResponse[];
  onDeleteResponse: (id: string) => void;
  onResetData: () => void;
  onNavigateToForm?: () => void;
  onUpdateResponseEmailSent?: (id: string, sentAt?: string) => void;
  isResearcher?: boolean;
  onOpenResearcherLogin?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  responses,
  onDeleteResponse,
  onResetData,
  onNavigateToForm,
  onUpdateResponseEmailSent,
  isResearcher = true,
  onOpenResearcherLogin,
}) => {
  const [search, setSearch] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof SurveyResponse>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50); // 25, 50, 100, 300 (all)
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [emailModalParticipant, setEmailModalParticipant] = useState<SurveyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SurveyResponse | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredResponses = useMemo(() => {
    return responses
      .filter((r) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          q === '' ||
          (r.fullName || '').toLowerCase().includes(q) ||
          (r.registrationNumber || '').toLowerCase().includes(q) ||
          (r.email || '').toLowerCase().includes(q) ||
          (r.id || '').toLowerCase().includes(q);

        const matchDegree = degreeFilter === 'all' || r.degreeProgramme === degreeFilter;
        const matchYear = yearFilter === 'all' || r.academicYear === yearFilter;

        return matchSearch && matchDegree && matchYear;
      })
      .sort((a, b) => {
        // High-precision timestamp sorting: newest submissions first by default
        if (sortField === 'timestamp') {
          const timeA = new Date(a.timestamp || 0).getTime();
          const timeB = new Date(b.timestamp || 0).getTime();
          if (timeA !== timeB) {
            return sortAsc ? timeA - timeB : timeB - timeA;
          }
        }

        let valA = a[sortField];
        let valB = b[sortField];

        // Numeric sorting for screen time, sleep hours, study hours, budget, age
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }

        const strA = String(valA ?? '').toLowerCase();
        const strB = String(valB ?? '').toLowerCase();

        if (strA < strB) return sortAsc ? -1 : 1;
        if (strA > strB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [responses, search, degreeFilter, yearFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedResponses = useMemo(() => {
    if (pageSize >= filteredResponses.length) return filteredResponses;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredResponses.slice(startIndex, startIndex + pageSize);
  }, [filteredResponses, safeCurrentPage, pageSize]);

  const handleSort = (field: keyof SurveyResponse) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCopyFiltered = async () => {
    const ok = await copyCSVToClipboard(filteredResponses);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportFiltered = () => {
    downloadCSVFile(filteredResponses);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, reg no, email..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Degree Filter */}
          <select
            value={degreeFilter}
            onChange={(e) => {
              setDegreeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
          >
            <option value="all">All Programmes</option>
            <option value="Physical Science">Physical Science</option>
            <option value="Biological Science">Biological Science</option>
            <option value="Food Science & Technology">Food Science & Tech</option>
            <option value="Sports Science & Management">Sports Science & Mgmt</option>
          </select>

          {/* Year Filter */}
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 focus:border-sky-500 focus:outline-none"
          >
            <option value="all">All Academic Years</option>
            <option value="1st year">1st Year</option>
            <option value="2nd year">2nd Year</option>
            <option value="3rd year">3rd Year</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyFiltered}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            title="Copy displayed rows as CSV to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportFiltered}
            className="flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV ({filteredResponses.length})</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5 font-mono">ID</th>
                <th
                  onClick={() => handleSort('fullName')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Student</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('degreeProgramme')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Degree &amp; Year</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('dailyScreenTimeMinutes')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Screen Time</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bedtimeUsageMinutes')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Bedtime</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sleepDurationHours')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Sleep</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('independentStudyHours')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Study</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('monthlyDataSpendLKR')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Spend (LKR)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedResponses.map((r) => {
                  const isNewlySubmitted =
                    !r.id.startsWith('RESP-USJ-100') && !r.id.startsWith('RESP-USJ-1010');
                  return (
                    <tr
                      key={r.id}
                      className={`transition-colors group ${
                        isNewlySubmitted
                          ? 'bg-emerald-950/25 hover:bg-emerald-950/40 border-l-2 border-emerald-400'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-3.5 text-sky-400 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{r.id}</span>
                          {isNewlySubmitted && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                    <td className="py-3 px-3.5 font-sans">
                      <div className="font-medium text-slate-100">{r.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{r.registrationNumber}</div>
                    </td>
                    <td className="py-3 px-3.5 font-sans">
                      <div className="text-slate-200">{r.degreeProgramme}</div>
                      <div className="text-[11px] text-slate-400">{r.academicYear}</div>
                    </td>
                    <td className="py-3 px-3.5 tabular-nums">
                      <span className="font-bold text-sky-300">
                        {r.dailyScreenTimeMinutes} min
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ({Math.floor(Number(r.dailyScreenTimeMinutes) / 60)}h {Number(r.dailyScreenTimeMinutes) % 60}m)
                      </span>
                    </td>
                    <td className="py-3 px-3.5 tabular-nums text-slate-300">
                      {r.bedtimeUsageMinutes} min
                    </td>
                    <td className="py-3 px-3.5 tabular-nums text-indigo-300">
                      {r.sleepDurationHours} hrs
                    </td>
                    <td className="py-3 px-3.5 tabular-nums text-emerald-300">
                      {r.independentStudyHours} hrs
                    </td>
                    <td className="py-3 px-3.5 tabular-nums text-amber-300">
                      Rs. {r.monthlyDataSpendLKR}
                    </td>
                    <td className="py-3 px-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEmailModalParticipant(r)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-sky-300 transition-colors"
                          title="Send Thank-You Email via Gmail"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedResponse(r)}
                          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-sky-300 transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {isResearcher ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                            title={`Delete Response for ${r.fullName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          onOpenResearcherLogin && (
                            <button
                              type="button"
                              onClick={onOpenResearcherLogin}
                              className="rounded p-1 text-slate-600 hover:text-slate-400 transition-colors"
                              title="Researcher credentials required to delete records"
                            >
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>

        {/* Footer info, Pagination & Reset option */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 p-4 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              Showing <span className="font-mono text-slate-200">{filteredResponses.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}</span>–<span className="font-mono text-slate-200">{Math.min(safeCurrentPage * pageSize, filteredResponses.length)}</span> of{' '}
              <span className="font-mono text-slate-200 font-bold">{filteredResponses.length}</span> records
              <span className="text-slate-500 ml-1.5 hidden sm:inline">(Target Sample: 300 · Total Verified: {responses.length})</span>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-1 sm:ml-3">
              <span className="text-slate-500 text-[11px]">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs text-slate-300 focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={300}>All (300)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <span className="px-2 font-mono text-[11px] text-slate-300">
                  <span className="text-sky-400 font-bold">{safeCurrentPage}</span> / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {isResearcher && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Reset dataset back to academic 300 benchmark responses"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Reset 300 Benchmarks</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Response Inspection Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs uppercase font-mono text-sky-400 font-semibold">
                  Response Record: {selectedResponse.id}
                </span>
                <h3 className="text-base font-bold text-slate-100">
                  {selectedResponse.fullName} ({selectedResponse.registrationNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-2">
                <span className="font-semibold text-sky-400 block">Personal &amp; Academic</span>
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <span className="text-slate-200 font-mono">{selectedResponse.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Number</span>
                  <span className="text-slate-200 font-mono">{selectedResponse.contactNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Gender &amp; Age</span>
                  <span className="text-slate-200">{selectedResponse.gender} · {selectedResponse.age} years</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Degree &amp; Year</span>
                  <span className="text-slate-200">{selectedResponse.degreeProgramme} ({selectedResponse.academicYear})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Accommodation</span>
                  <span className="text-slate-200">
                    {selectedResponse.accommodationType === 'Other'
                      ? selectedResponse.accommodationOtherText
                      : selectedResponse.accommodationType}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 space-y-2">
                <span className="font-semibold text-sky-400 block">Screen Time &amp; Lifestyle</span>
                <div>
                  <span className="text-slate-400 block text-[11px]">Average Daily Screen Time</span>
                  <span className="text-sky-300 font-mono font-bold">
                    {selectedResponse.dailyScreenTimeMinutes} min ({Math.floor(Number(selectedResponse.dailyScreenTimeMinutes) / 60)}h {Number(selectedResponse.dailyScreenTimeMinutes) % 60}m)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Primary Purpose</span>
                  <span className="text-slate-200">{selectedResponse.primaryPurpose}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bedtime Screen Usage</span>
                  <span className="text-slate-200 font-mono">{selectedResponse.bedtimeUsageMinutes} min / night</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Connection &amp; Spend</span>
                  <span className="text-slate-200">
                    {selectedResponse.connectionType} (Rs. {selectedResponse.monthlyDataSpendLKR})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Study / Sleep / Commute</span>
                  <span className="text-slate-200 font-mono">
                    Study: {selectedResponse.independentStudyHours}h · Sleep: {selectedResponse.sleepDurationHours}h · Commute: {selectedResponse.commutingTimeMinutes}m
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedResponse(null)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {emailModalParticipant && (
        <EmailModal
          participant={responses.find((r) => r.id === emailModalParticipant.id) || emailModalParticipant}
          isOpen={!!emailModalParticipant}
          onClose={() => setEmailModalParticipant(null)}
          onMarkAsSent={(id, sentAt) => onUpdateResponseEmailSent && onUpdateResponseEmailSent(id, sentAt)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete Response Record</h3>
                  <p className="text-xs text-slate-400 font-mono">ID: {deleteTarget.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-semibold text-slate-200">{deleteTarget.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Registration Number:</span>
                <span className="font-mono text-slate-200">{deleteTarget.registrationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                <span className="text-slate-400">Programme &amp; Year:</span>
                <span className="text-slate-200">{deleteTarget.degreeProgramme} · {deleteTarget.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Daily Screen Time:</span>
                <span className="text-sky-300 font-mono font-semibold">{deleteTarget.dailyScreenTimeMinutes} min/day</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this response? This action will remove the record from the database and refresh all statistics.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteResponse(deleteTarget.id);
                  if (selectedResponse?.id === deleteTarget.id) {
                    setSelectedResponse(null);
                  }
                  setDeleteTarget(null);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Response</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Benchmark Data</h3>
                  <p className="text-xs text-slate-400">Restore academic seed dataset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reset dataset back to academic research sample benchmark (300 responses)? Any newly submitted responses will be replaced with the initial 300 benchmarks.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400"
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
