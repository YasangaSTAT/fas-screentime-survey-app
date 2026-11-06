import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Settings,
  RotateCcw,
  Send,
  User,
  GraduationCap,
  Sparkles,
  Info,
  Download,
  Image as ImageIcon,
  Clock,
} from 'lucide-react';
import { EmailTemplateConfig, SurveyResponse } from '../types/survey';
import {
  loadEmailTemplate,
  saveEmailTemplate,
  resetEmailTemplateToDefault,
  renderEmailForParticipant,
} from '../utils/emailTemplate';

interface EmailModalProps {
  participant: Partial<SurveyResponse>;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsSent?: (id: string, sentAt?: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  participant,
  isOpen,
  onClose,
  onMarkAsSent,
}) => {
  const [template, setTemplate] = useState<EmailTemplateConfig>(loadEmailTemplate());
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [tempSubject, setTempSubject] = useState(template.subject);
  const [tempBody, setTempBody] = useState(template.body);
  const [copied, setCopied] = useState(false);
  const [markedSent, setMarkedSent] = useState(false);

  useEffect(() => {
    const current = loadEmailTemplate();
    setTemplate(current);
    setTempSubject(current.subject);
    setTempBody(current.body);
    setMarkedSent(!!participant.emailSentAt);
  }, [participant, isOpen]);

  if (!isOpen) return null;

  const rendered = renderEmailForParticipant(template, {
    fullName: participant.fullName,
    academicYear: participant.academicYear,
    email: participant.email,
    gender: participant.gender,
  });

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
    if (window.confirm('Reset email template to original STA 330 Group 09 default?')) {
      const def = resetEmailTemplateToDefault();
      setTemplate(def);
      setTempSubject(def.subject);
      setTempBody(def.body);
      setIsEditingTemplate(false);
    }
  };

  const handleCopy = async () => {
    const fullText = `To: ${rendered.recipientEmail}\nFrom: ${rendered.senderEmail}\nSubject: ${rendered.subject}\n\n${rendered.body}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenGmail = () => {
    window.open(rendered.gmailComposeUrl, '_blank', 'noopener,noreferrer');
    if (participant.id && onMarkAsSent) {
      const nowIso = new Date().toISOString();
      onMarkAsSent(participant.id, nowIso);
      setMarkedSent(true);
    }
  };

  const handleOpenMailto = () => {
    window.location.href = rendered.mailtoUrl;
    if (participant.id && onMarkAsSent) {
      const nowIso = new Date().toISOString();
      onMarkAsSent(participant.id, nowIso);
      setMarkedSent(true);
    }
  };

  const handleToggleSent = () => {
    if (!participant.id || !onMarkAsSent) return;
    if (markedSent) {
      onMarkAsSent(participant.id, '');
      setMarkedSent(false);
    } else {
      const nowIso = new Date().toISOString();
      onMarkAsSent(participant.id, nowIso);
      setMarkedSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Participant Email Dispatcher</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                From: <span className="text-sky-300 font-semibold">{rendered.senderEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingTemplate(!isEditingTemplate)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                isEditingTemplate
                  ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Customize master template text"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>{isEditingTemplate ? 'Preview Mode' : 'Customize Template'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recipient Metadata Strip */}
        <div className="border-b border-slate-800/80 bg-slate-950/40 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono">Recipient:</span>
            <span className="font-semibold text-slate-200">{participant.fullName || 'Student'}</span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-sky-400">{participant.email || 'No email provided'}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className={`rounded px-2 py-0.5 font-mono font-semibold ${
              rendered.certificateGender === 'Female'
                ? 'bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-300'
                : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
            }`}>
              Gender: {rendered.certificateGender}
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300 font-mono">
              {participant.academicYear || 'Undergraduate'}
            </span>
            {markedSent ? (
              <span className="flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-emerald-400 font-mono">
                <Check className="h-3 w-3" /> Status: Sent
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-amber-400 font-mono">
                <Clock className="h-3 w-3" /> Status: Pending (Not Sent)
              </span>
            )}
          </div>
        </div>

        {/* Body Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isEditingTemplate ? (
            /* Template Editing View */
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-sky-500/30 bg-sky-950/30 p-3 text-sky-300 flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Dynamic Placeholders Available:</p>
                  <p className="text-[11px] text-sky-200">
                    Use <code className="bg-sky-900/60 px-1 py-0.5 rounded font-mono">[Participant&apos;s Name]</code> to insert the student&apos;s full name (e.g. Amal Perera).
                    <br />
                    Use <code className="bg-sky-900/60 px-1 py-0.5 rounded font-mono">[Academic Year]</code> to insert the academic year (e.g. 3rd year).
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-200">Email Subject Line</label>
                <input
                  type="text"
                  value={tempSubject}
                  onChange={(e) => setTempSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-200">Email Body Template</label>
                <textarea
                  rows={12}
                  value={tempBody}
                  onChange={(e) => setTempBody(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs font-mono text-slate-200 leading-relaxed focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetTemplate}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset to Default Template</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTemplate(false)}
                    className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    className="rounded-lg bg-sky-500 px-4 py-1.5 font-semibold text-white hover:bg-sky-400 shadow-sm"
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Rendered Live Preview */
            <div className="space-y-3.5">
              {/* Official Email Header Banner */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/90 shadow-md">
                <div className="relative w-full aspect-[4.8/1] overflow-hidden bg-slate-950">
                  <img
                    src={rendered.headerImageUrl}
                    alt="DEMOGRAPHIC, ACADEMIC, AND LIFESTYLE FACTORS ASSOCIATED WITH DAILY SMARTPHONE SCREEN TIME - USJ FAS Header"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                </div>
                <div className="px-3 py-1.5 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    USJ Faculty of Applied Sciences Research Header
                  </span>
                  <a
                    href={rendered.headerImageUrl}
                    download="USJ_FAS_Research_Email_Header.jpg"
                    className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 font-sans"
                    title="Download high-resolution header banner"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download Header</span>
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-0.5">
                    Subject
                  </span>
                  <div className="font-semibold text-slate-100 text-sm">
                    {rendered.subject}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1.5">
                    Message Body (Customized for {participant.fullName || 'Participant'})
                  </span>
                  <div className="whitespace-pre-wrap font-sans text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/60">
                    {rendered.body}
                  </div>
                </div>
              </div>

              {/* Attached Certificate Section based on Participant Gender */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-200">Attached Appreciation Certificate</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                      rendered.certificateGender === 'Female'
                        ? 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300'
                        : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                    }`}>
                      {rendered.certificateGender === 'Female' ? 'Female: "you\'re such a wonderful girl"' : 'Male: "you\'re such a wonderful boy"'}
                    </span>
                  </div>

                  <a
                    href={rendered.certificateImageUrl}
                    download={`USJ_FAS_Certificate_${rendered.certificateGender}_${(participant.fullName || 'Student').replace(/\s+/g, '_')}.jpg`}
                    className="flex items-center gap-1.5 rounded-md bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-200 transition-colors border border-slate-700"
                    title="Download high-resolution certificate card"
                  >
                    <Download className="h-3.5 w-3.5 text-sky-400" />
                    <span>Download Image</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="relative group overflow-hidden rounded-lg border border-slate-700/80 bg-black/40 aspect-square max-w-[140px] mx-auto sm:mx-0">
                    <img
                      src={rendered.certificateImageUrl}
                      alt={rendered.certificateLabel}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <a
                      href={rendered.certificateImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity"
                    >
                      View Full Size
                    </a>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-200">
                      {rendered.certificateLabel}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This commemorative USJ Faculty of Applied Sciences certificate card is automatically selected based on participant&apos;s recorded gender ({rendered.certificateGender}). Attach or share it with the participant alongside the thank-you email.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={rendered.certificateImageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open image in new tab</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 p-4 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-400" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenMailto}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              title="Open in your computer's default mail application"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>Default Mail App</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {participant.id && onMarkAsSent && (
              <button
                type="button"
                onClick={handleToggleSent}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                  markedSent
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                }`}
                title={
                  markedSent
                    ? 'Currently marked as Sent. Click to revert back to Pending.'
                    : 'Currently Pending (Not Sent). Click to mark as Sent.'
                }
              >
                {markedSent ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Status: Sent (Click to revert)</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Status: Pending · Click to Mark Sent</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenGmail}
              className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send via Gmail ({rendered.senderEmail})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
