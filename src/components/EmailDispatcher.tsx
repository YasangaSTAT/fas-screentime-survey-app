import React, { useState } from 'react';
import {
  Mail,
  Send,
  Check,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Settings,
  Sparkles,
  RotateCcw,
  User,
  Clock,
  ArrowRight,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { SurveyResponse, EmailTemplateConfig } from '../types/survey';
import {
  loadEmailTemplate,
  saveEmailTemplate,
  resetEmailTemplateToDefault,
  renderEmailForParticipant,
  EMAIL_HEADER_BANNER,
  MALE_CERTIFICATE_IMAGE,
  FEMALE_CERTIFICATE_IMAGE,
} from '../utils/emailTemplate';
import { EmailModal } from './EmailModal';

interface EmailDispatcherProps {
  responses: SurveyResponse[];
  onUpdateResponseEmailSent: (id: string, sentAt?: string) => void;
  onNavigateToForm?: () => void;
  onResetAllEmailStatuses?: () => void;
}

export const EmailDispatcher: React.FC<EmailDispatcherProps> = ({
  responses,
  onUpdateResponseEmailSent,
  onNavigateToForm,
  onResetAllEmailStatuses,
}) => {
  const [template, setTemplate] = useState<EmailTemplateConfig>(loadEmailTemplate());
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [tempSubject, setTempSubject] = useState(template.subject);
  const [tempBody, setTempBody] = useState(template.body);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent'>('all');
  const [selectedParticipantForModal, setSelectedParticipantForModal] = useState<SurveyResponse | null>(null);
  const [copiedBCC, setCopiedBCC] = useState(false);

  const handleSaveTemplate = () => {
    const updated = {
      ...template,
      subject: tempSubject,
      body: tempBody,
    };
    saveEmailTemplate(updated);
    setTemplate(updated);
    setIsEditingTemplate(false);
  };

  const handleResetTemplate = () => {
    if (window.confirm('Reset template to STA 330 Group 09 default format?')) {
      const def = resetEmailTemplateToDefault();
      setTemplate(def);
      setTempSubject(def.subject);
      setTempBody(def.body);
      setIsEditingTemplate(false);
    }
  };

  const filteredResponses = responses.filter((r) => {
    const matchSearch =
      search === '' ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.registrationNumber.toLowerCase().includes(search.toLowerCase());

    const isSent = !!r.emailSentAt;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'sent' && isSent) ||
      (statusFilter === 'pending' && !isSent);

    return matchSearch && matchStatus;
  });

  const sentCount = responses.filter((r) => !!r.emailSentAt).length;
  const pendingCount = responses.length - sentCount;

  const handleCopyAllBCC = async () => {
    const validEmails = responses
      .map((r) => r.email?.trim())
      .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    const unique = Array.from(new Set(validEmails)).join(', ');
    try {
      await navigator.clipboard.writeText(unique);
      setCopiedBCC(true);
      setTimeout(() => setCopiedBCC(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendIndividual = (r: SurveyResponse) => {
    const rendered = renderEmailForParticipant(template, {
      fullName: r.fullName,
      academicYear: r.academicYear,
      email: r.email,
      gender: r.gender,
    });
    window.open(rendered.gmailComposeUrl, '_blank', 'noopener,noreferrer');
    onUpdateResponseEmailSent(r.id, new Date().toISOString());
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold uppercase tracking-wider">
              <Mail className="h-4 w-4" />
              <span>Participant Email Dispatch Center</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Customizable Participant Thank-You Emails
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated personalized emails sent from{' '}
              <span className="text-sky-300 font-mono font-semibold">{template.senderEmail}</span> to all survey respondents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditingTemplate(!isEditingTemplate)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Settings className="h-4 w-4 text-sky-400" />
              <span>{isEditingTemplate ? 'Hide Template Editor' : 'Edit Email Template'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyAllBCC}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              title="Copy all participant emails as comma-separated list for BCC mailing"
            >
              {copiedBCC ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copiedBCC ? 'Copied All Emails!' : 'Copy All Emails (BCC)'}</span>
            </button>

            {sentCount > 0 && onResetAllEmailStatuses && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all participant email statuses back to Pending?')) {
                    onResetAllEmailStatuses();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
                title="Reset all statuses back to Pending (Not Sent)"
              >
                <RotateCcw className="h-4 w-4 text-amber-400" />
                <span>Reset All to Pending</span>
              </button>
            )}
          </div>
        </div>

        {/* Counter strip */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Total Participants</span>
            <span className="text-lg font-bold font-mono text-slate-100">{responses.length}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block">Emails Sent</span>
            <span className="text-lg font-bold font-mono text-emerald-300">{sentCount}</span>
          </div>
          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase text-amber-400 block">Pending Dispatch</span>
            <span className="text-lg font-bold font-mono text-amber-300">{pendingCount}</span>
          </div>
        </div>
      </div>

      {/* Master Template Customizer (Expandable) */}
      {isEditingTemplate && (
        <div className="rounded-xl border border-sky-500/40 bg-slate-900/95 p-5 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Customize Master Template</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetTemplate}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-300 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Official Email Header Banner Preview */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 shadow-md">
            <div className="relative w-full aspect-[4.8/1] overflow-hidden bg-slate-950">
              <img
                src={EMAIL_HEADER_BANNER}
                alt="USJ Faculty of Applied Sciences Research Header"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Email Header Banner (USJ Faculty of Applied Sciences)
              </span>
              <a
                href={EMAIL_HEADER_BANNER}
                download="USJ_FAS_Research_Email_Header.jpg"
                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-sans"
              >
                <Download className="h-3 w-3" />
                <span>Download Banner</span>
              </a>
            </div>
          </div>

          <div className="text-xs text-sky-200 bg-sky-950/40 p-3 rounded-lg border border-sky-500/20">
            Placeholders <code className="bg-sky-900/60 px-1 py-0.5 rounded font-mono">[Participant&apos;s Name]</code> and <code className="bg-sky-900/60 px-1 py-0.5 rounded font-mono">[Academic Year]</code> are automatically replaced with each student&apos;s real survey response!
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">Email Subject Line</label>
            <input
              type="text"
              value={tempSubject}
              onChange={(e) => setTempSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">Email Body Template</label>
            <textarea
              rows={11}
              value={tempBody}
              onChange={(e) => setTempBody(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 leading-relaxed focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditingTemplate(false)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="rounded-lg bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-400 shadow-sm"
            >
              Save Master Template
            </button>
          </div>
        </div>
      )}

      {/* Participants Queue & Search Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[260px]">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search participant name, email, reg no..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center rounded-lg bg-slate-950/80 p-0.5 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-sky-500 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({responses.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('sent')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === 'sent'
                    ? 'bg-emerald-500 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sent ({sentCount})
              </button>
            </div>
          </div>
        </div>

        {/* Participants Table */}
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead className="bg-slate-950/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3.5">Participant</th>
                  <th className="py-3 px-3.5">Email Address</th>
                  <th className="py-3 px-3.5">Academic Year</th>
                  <th className="py-3 px-3.5">Attached Certificate</th>
                  <th className="py-3 px-3.5">Personalized Greeting</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredResponses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      No matching participants found.
                    </td>
                  </tr>
                ) : (
                  filteredResponses.map((r) => {
                    const isSent = !!r.emailSentAt;
                    const isFemale = r.gender?.trim().toLowerCase() === 'female';
                    const certImage = isFemale ? FEMALE_CERTIFICATE_IMAGE : MALE_CERTIFICATE_IMAGE;
                    const certTitle = isFemale ? 'Female ("wonderful girl")' : 'Male ("wonderful boy")';
                    return (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3.5 font-sans">
                          <div className="font-semibold text-slate-100">{r.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{r.registrationNumber}</div>
                        </td>
                        <td className="py-3 px-3.5 text-sky-400 font-mono">
                          {r.email}
                        </td>
                        <td className="py-3 px-3.5 text-slate-300 font-sans">
                          <div>{r.academicYear || 'Undergraduate'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{r.gender || 'Not specified'}</div>
                        </td>
                        <td className="py-2.5 px-3.5 font-sans">
                          <div className="flex items-center gap-2">
                            <div className="relative group w-10 h-10 rounded-md overflow-hidden border border-slate-700 bg-black/40 shrink-0">
                              <img
                                src={certImage}
                                alt={certTitle}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                              <a
                                href={certImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-mono"
                              >
                                View
                              </a>
                            </div>
                            <div className="text-[11px] leading-tight">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                isFemale
                                  ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30'
                                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                              }`}>
                                {isFemale ? 'Girl Edition' : 'Boy Edition'}
                              </span>
                              <div className="text-[10px] text-slate-400 mt-0.5 max-w-[120px] truncate" title={certTitle}>
                                {isFemale ? 'wonderful girl' : 'wonderful boy'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-sans text-slate-300">
                          <span className="text-slate-200 font-medium">Dear {r.fullName},</span>
                          <span className="text-[11px] text-slate-400 block font-mono">...contribution as a {r.academicYear} undergraduate</span>
                        </td>
                        <td className="py-3 px-3.5 font-sans">
                          {isSent ? (
                            <button
                              type="button"
                              onClick={() => onUpdateResponseEmailSent(r.id, '')}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              title="Status: Sent. Click to change back to Pending"
                            >
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" /> Sent
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onUpdateResponseEmailSent(r.id, new Date().toISOString())}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer"
                              title="Status: Pending (Not Sent). Click to mark as Sent"
                            >
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Pending
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedParticipantForModal(r)}
                              className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700"
                            >
                              Preview
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSendIndividual(r)}
                              className="flex items-center gap-1.5 rounded bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-sm"
                              title="Compose & Send via Gmail"
                            >
                              <Send className="h-3 w-3" />
                              <span>Send Gmail</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Individual Email Modal */}
      {selectedParticipantForModal && (
        <EmailModal
          participant={
            responses.find((r) => r.id === selectedParticipantForModal.id) || selectedParticipantForModal
          }
          isOpen={!!selectedParticipantForModal}
          onClose={() => setSelectedParticipantForModal(null)}
          onMarkAsSent={(id, sentAt) => onUpdateResponseEmailSent(id, sentAt)}
        />
      )}
    </div>
  );
};
