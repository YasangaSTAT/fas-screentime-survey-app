import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  SurveyResponse,
  SurveySection,
  VisualThemeMode,
} from '../types/survey';
import {
  saveFormDraft,
  loadFormDraft,
  clearFormDraft,
} from '../utils/storage';
import { DigitalWellbeingHelper } from './DigitalWellbeingHelper';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RotateCcw,
  AlertCircle,
  FileText,
  User,
  GraduationCap,
  Smartphone,
  Moon,
  Clock,
  Send,
  HelpCircle,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Settings,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { EmailModal } from './EmailModal';
import {
  loadEmailTemplate,
  renderEmailForParticipant,
  MALE_CERTIFICATE_IMAGE,
  FEMALE_CERTIFICATE_IMAGE,
} from '../utils/emailTemplate';

interface SurveyFormProps {
  onSubmitSuccess: (response: SurveyResponse) => void;
  onScreenTimeChange?: (minutes: number) => void;
  onNavigateToData?: () => void;
  isResearcher?: boolean;
  initialRegistrationNumber?: string;
  onLockPhone?: () => void;
  themeMode?: VisualThemeMode;
  onChangeThemeMode?: (mode: VisualThemeMode) => void;
  totalResponses?: number;
}

const INITIAL_FORM: Omit<SurveyResponse, 'id' | 'timestamp' | 'createdAtFormatted'> = {
  fullName: '',
  registrationNumber: '',
  contactNumber: '',
  email: '',
  gender: '',
  age: '',
  degreeProgramme: '',
  academicYear: '',
  accommodationType: '',
  accommodationOtherText: '',
  dailyScreenTimeMinutes: '',
  primaryPurpose: '',
  bedtimeUsageMinutes: '',
  connectionType: '',
  monthlyDataSpendLKR: '',
  independentStudyHours: '',
  sleepDurationHours: '',
  commutingTimeMinutes: '',
};

export const SurveyForm: React.FC<SurveyFormProps> = ({
  onSubmitSuccess,
  onScreenTimeChange,
  onNavigateToData,
  isResearcher = false,
  initialRegistrationNumber,
  onLockPhone,
  themeMode = 'blueLight',
  onChangeThemeMode,
  totalResponses,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [currentStep, setCurrentStep] = useState<SurveySection>(1);
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<SurveyResponse | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Sync initial registration number from lock screen if provided
  useEffect(() => {
    if (initialRegistrationNumber) {
      setFormData((prev) => ({
        ...prev,
        registrationNumber: initialRegistrationNumber,
      }));
    }
  }, [initialRegistrationNumber]);

  // Restore draft if available
  useEffect(() => {
    const draft = loadFormDraft();
    if (draft && Object.keys(draft).length > 0) {
      setHasDraft(true);
    }
  }, []);

  const restoreDraft = () => {
    const draft = loadFormDraft();
    if (draft) {
      setFormData((prev) => ({ ...prev, ...draft }));
      if (typeof draft.dailyScreenTimeMinutes === 'number' && onScreenTimeChange) {
        onScreenTimeChange(draft.dailyScreenTimeMinutes);
      }
    }
    setHasDraft(false);
  };

  const dismissDraft = () => {
    clearFormDraft();
    setHasDraft(false);
  };

  // Update field and auto-save draft
  const updateField = <K extends keyof typeof INITIAL_FORM>(field: K, value: typeof INITIAL_FORM[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveFormDraft(next);
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === 'dailyScreenTimeMinutes' && typeof value === 'number' && onScreenTimeChange) {
      onScreenTimeChange(value);
    }
  };

  // Quick fill sample data for fast testing
  const handleFillSample = () => {
    const sample = {
      fullName: 'Chamari Gunawardana',
      registrationNumber: 'AS114038',
      contactNumber: '0714455889',
      email: 'chamari.gunaw@gmail.com',
      gender: 'Female' as const,
      age: 22,
      degreeProgramme: 'Physical Science' as const,
      academicYear: '2nd year' as const,
      accommodationType: 'University accommodation (Hostel)' as const,
      accommodationOtherText: '',
      dailyScreenTimeMinutes: 285, // 4h 45m
      primaryPurpose: 'Social Communication (WhatsApp, Telegram, Calls)' as const,
      bedtimeUsageMinutes: 45,
      connectionType: 'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)' as const,
      monthlyDataSpendLKR: 1500,
      independentStudyHours: 4.0,
      sleepDurationHours: 6.5,
      commutingTimeMinutes: 15,
    };
    setFormData(sample);
    saveFormDraft(sample);
    if (onScreenTimeChange) onScreenTimeChange(sample.dailyScreenTimeMinutes);
    setErrors({});
  };

  // Validation routines per step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 || viewMode === 'all') {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'University Registration Number is required (e.g. AS114038).';
      if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required.';
      if (!formData.email.trim()) {
        newErrors.email = 'Personal E-mail Address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (step === 2 || viewMode === 'all') {
      if (!formData.gender) newErrors.gender = 'Gender selection is required.';
      if (formData.age === '' || Number(formData.age) < 16 || Number(formData.age) > 80) {
        newErrors.age = 'Please enter a valid completed age (16–80).';
      }
      if (!formData.degreeProgramme) newErrors.degreeProgramme = 'Degree Programme selection is required.';
      if (!formData.academicYear) newErrors.academicYear = 'Academic Year is required.';
      if (!formData.accommodationType) newErrors.accommodationType = 'Accommodation Type is required.';
      if (formData.accommodationType === 'Other' && !formData.accommodationOtherText?.trim()) {
        newErrors.accommodationOtherText = 'Please specify your accommodation type.';
      }
    }

    if (step === 3 || viewMode === 'all') {
      if (formData.dailyScreenTimeMinutes === '' || Number(formData.dailyScreenTimeMinutes) < 0 || Number(formData.dailyScreenTimeMinutes) > 1440) {
        newErrors.dailyScreenTimeMinutes = 'Average daily screen time (in minutes) is required (0–1440).';
      }
      if (!formData.primaryPurpose) newErrors.primaryPurpose = 'Primary Purpose selection is required.';
      if (formData.bedtimeUsageMinutes === '' || Number(formData.bedtimeUsageMinutes) < 0 || Number(formData.bedtimeUsageMinutes) > 600) {
        newErrors.bedtimeUsageMinutes = 'Bedtime smartphone usage in minutes is required.';
      }
      if (!formData.connectionType) newErrors.connectionType = 'Connection Type is required.';
      if (formData.monthlyDataSpendLKR === '' || Number(formData.monthlyDataSpendLKR) < 0) {
        newErrors.monthlyDataSpendLKR = 'Monthly data expenditure in LKR is required.';
      }
    }

    if (step === 4 || viewMode === 'all') {
      if (formData.independentStudyHours === '' || Number(formData.independentStudyHours) < 0 || Number(formData.independentStudyHours) > 24) {
        newErrors.independentStudyHours = 'Daily study time in hours is required (0–24).';
      }
      if (formData.sleepDurationHours === '' || Number(formData.sleepDurationHours) < 1 || Number(formData.sleepDurationHours) > 20) {
        newErrors.sleepDurationHours = 'Average sleep duration in hours is required (1–20).';
      }
      if (formData.commutingTimeMinutes === '' || Number(formData.commutingTimeMinutes) < 0 || Number(formData.commutingTimeMinutes) > 720) {
        newErrors.commutingTimeMinutes = 'Daily commuting time in minutes is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5) as SurveySection);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as SurveySection);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setViewMode('all');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const uniqueId = `RESP-USJ-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    const newResponse: SurveyResponse = {
      ...formData,
      id: uniqueId,
      timestamp: now.toISOString(),
      createdAtFormatted: formattedDate,
      // emailSentAt is NOT set automatically because auto-send is turned off; status is accurately Pending until researcher dispatches
      age: Number(formData.age),
      dailyScreenTimeMinutes: Number(formData.dailyScreenTimeMinutes),
      bedtimeUsageMinutes: Number(formData.bedtimeUsageMinutes),
      monthlyDataSpendLKR: Number(formData.monthlyDataSpendLKR),
      independentStudyHours: Number(formData.independentStudyHours),
      sleepDurationHours: Number(formData.sleepDurationHours),
      commutingTimeMinutes: Number(formData.commutingTimeMinutes),
    };

    setTimeout(() => {
      onSubmitSuccess(newResponse);
      clearFormDraft();
      setSubmittedResponse(newResponse);
      setIsSubmitting(false);

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#0ea5e9', '#34d399', '#f59e0b'],
        });
      } catch {
        // ignore
      }
    }, 450);
  };

  const handleResetForm = () => {
    setFormData(INITIAL_FORM);
    clearFormDraft();
    setSubmittedResponse(null);
    setCurrentStep(1);
    setErrors({});
  };

  if (submittedResponse) {
    return (
      <div className="mx-auto max-w-2xl py-8">
        <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <h2 className="mt-5 text-2xl font-bold text-slate-100">
            Response Submitted Successfully!
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Thank you for contributing to the STA 330 2.0 Academic Research Project at the Department of Statistics, University of Sri Jayewardenepura.
          </p>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Response ID:</span>
              <span className="text-emerald-400 font-bold">{submittedResponse.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-200">{submittedResponse.createdAtFormatted}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Respondent:</span>
              <span className="text-slate-200">{submittedResponse.fullName} ({submittedResponse.registrationNumber})</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Degree Programme:</span>
              <span className="text-slate-200">{submittedResponse.degreeProgramme} · {submittedResponse.academicYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Daily Screen Time:</span>
              <span className="text-sky-300 font-bold">
                {submittedResponse.dailyScreenTimeMinutes} min ({Math.floor(Number(submittedResponse.dailyScreenTimeMinutes) / 60)}h {Number(submittedResponse.dailyScreenTimeMinutes) % 60}m)
              </span>
            </div>
          </div>

          {/* Suitable Appreciation Certificate Card (Directly Downloadable) */}
          {(() => {
            const isFemale = submittedResponse.gender?.trim().toLowerCase() === 'female';
            const certImage = isFemale ? FEMALE_CERTIFICATE_IMAGE : MALE_CERTIFICATE_IMAGE;
            const certGenderLabel = isFemale
              ? 'Appreciation Certificate — "you\'re such a wonderful girl" (Female Edition)'
              : 'Appreciation Certificate — "you\'re such a wonderful boy" (Male Edition)';

            return (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/90 p-5 text-left shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">
                        Appreciation Certificate
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        STA 330 2.0 · Faculty of Applied Sciences, University of Sri Jayewardenepura
                      </p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                    isFemale
                      ? 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300'
                      : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300'
                  }`}>
                    {isFemale ? 'Wonderful Girl Edition' : 'Wonderful Boy Edition'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group overflow-hidden rounded-xl border border-slate-700/80 bg-black/40 w-44 h-44 shrink-0 shadow-lg mx-auto sm:mx-0">
                    <img
                      src={certImage}
                      alt={certGenderLabel}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <a
                      href={certImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
                    >
                      Preview Full Size
                    </a>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-sm font-semibold text-white">
                      {certGenderLabel}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This official commemorative certificate card has been generated in recognition of your valuable contribution to our STA 330 2.0 research study on undergraduate smartphone screen time.
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Presented to: <span className="text-sky-300 font-semibold">{submittedResponse.fullName}</span> ({submittedResponse.academicYear} Undergraduate · {submittedResponse.registrationNumber})
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <a
                        href={certImage}
                        download={`USJ_FAS_Certificate_${isFemale ? 'Girl' : 'Boy'}_${submittedResponse.fullName.replace(/\s+/g, '_')}.jpg`}
                        className="inline-flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-lg shadow-sky-500/20"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Certificate Card</span>
                      </a>
                      <a
                        href={certImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View Full Size</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Live Confirmation of Stored Dataset Record */}
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-left shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-emerald-300">
                  Response Successfully Recorded in Dataset
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {submittedResponse.id}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
              <p>
                Your response has been permanently stored in the survey database and integrated into the research dataset.
              </p>
              {typeof totalResponses === 'number' && (
                <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap">
                  Total Verified Responses: <strong className="text-white">{totalResponses}</strong>
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Submit Another Response</span>
            </button>
            {onLockPhone && (
              <button
                type="button"
                onClick={onLockPhone}
                className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-sky-300 hover:bg-slate-700 hover:text-sky-200 transition-colors cursor-pointer"
                title="Lock phone screen for next respondent"
              >
                <Lock className="h-4 w-4" />
                <span>Lock Device for Next Respondent</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Draft restoration banner */}
      {hasDraft && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-950/40 p-3.5 backdrop-blur-md text-xs">
          <div className="flex items-center gap-2.5 text-sky-200">
            <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
            <span>You have an unsaved draft from a previous session. Would you like to restore it?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-md bg-sky-500 px-3 py-1 font-semibold text-white hover:bg-sky-400 transition-colors"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={dismissDraft}
              className="rounded-md bg-slate-800 px-2.5 py-1 text-slate-400 hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/85 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Research Banner Header */}
        <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950/80 via-slate-900/90 to-slate-950/80 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-medium text-sky-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Department of Statistics · Faculty of Applied Sciences</span>
            </div>
            <div className="flex items-center gap-2">
              {isResearcher && (
                <button
                  type="button"
                  onClick={handleFillSample}
                  className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  title="Fill sample student details for testing (Researcher only)"
                >
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span>Auto-fill Sample</span>
                </button>
              )}
              <div className="flex items-center rounded-lg bg-slate-950/70 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('step')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'step'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Step Flow
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    viewMode === 'all'
                      ? 'bg-sky-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Questions
                </button>
              </div>

              {onLockPhone && (
                <button
                  type="button"
                  onClick={onLockPhone}
                  className="flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                  title="Lock phone screen (Return to lock view)"
                >
                  <Lock className="h-3 w-3 text-sky-400" />
                  <span className="hidden sm:inline">Lock Screen</span>
                </button>
              )}
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
            Demographic, Academic, and Lifestyle Factors Associated with Daily Smartphone Screen Time
          </h1>

          <div className="mt-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs leading-relaxed text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Academic Research Notice (STA 330 2.0: Data Analysis &amp; Preparation of Reports)</span>
            </div>
            <p>
              This questionnaire is designed for third-year research at the University of Sri Jayewardenepura.
              Your responses are strictly confidential, anonymized, and used exclusively for academic research purposes.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-400 font-mono text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-sky-400" /> Estimated time: 3–5 minutes
              </span>
              <span>• Have your phone ready to check Screen Time or Digital Wellbeing</span>
            </div>
          </div>

          {/* Mobile Phone User Display Options: Daylight, Night Shift, OLED */}
          {onChangeThemeMode && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    Phone Screen Display Option
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {themeMode === 'blueLight'
                      ? 'Daylight Blue (450nm standard phone light)'
                      : themeMode === 'amberShield'
                      ? 'Night Shift (Amber bedtime warm filter)'
                      : 'OLED (Pure Black minimal energy-saving)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-slate-900/90 p-1 border border-slate-800 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => onChangeThemeMode('blueLight')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    themeMode === 'blueLight'
                      ? 'bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Daylight Screen Mode (Standard daytime blue light)"
                >
                  <span>☀️ Daylight</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeThemeMode('amberShield')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    themeMode === 'amberShield'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Night Shift Screen Mode (Amber warm circadian filter)"
                >
                  <span>🌙 Night Shift</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeThemeMode('obsidianOled')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                    themeMode === 'obsidianOled'
                      ? 'bg-slate-700 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="OLED Screen Mode (True black minimal dark mode)"
                >
                  <span>📱 OLED</span>
                </button>
              </div>
            </div>
          )}

          {/* Stepper progress (when in step mode) */}
          {viewMode === 'step' && (
            <div className="mt-6">
              <div className="grid grid-cols-5 gap-2">
                {[
                  { step: 1, title: 'Personal', icon: User },
                  { step: 2, title: 'Academic', icon: GraduationCap },
                  { step: 3, title: 'Screen Time', icon: Smartphone },
                  { step: 4, title: 'Lifestyle', icon: Moon },
                  { step: 5, title: 'Review', icon: FileText },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = currentStep === s.step;
                  const isDone = currentStep > s.step;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        if (s.step < currentStep || validateStep(currentStep)) {
                          setCurrentStep(s.step as SurveySection);
                        }
                      }}
                      className={`flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-all ${
                        isActive
                          ? 'bg-sky-500/10 border border-sky-500/40 text-sky-300'
                          : isDone
                          ? 'text-emerald-400 hover:bg-slate-800/40'
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          isActive
                            ? 'bg-sky-500 text-white'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.step}
                      </div>
                      <span className="text-[11px] font-medium hidden sm:inline">{s.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* SECTION 1: Personal Information */}
          {(viewMode === 'all' || currentStep === 1) && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-sky-400">
                  Section 1 of 4
                </span>
                <h3 className="text-lg font-bold text-slate-100">Personal Information</h3>
                <p className="text-xs text-slate-400">Student identification details</p>
              </div>

              {/* Q1: Full Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  1. Full Name <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">Ex: Amal Perera</p>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.fullName ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.fullName}
                  </p>
                )}
              </div>

              {/* Q2: University Registration Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  2. University Registration Number <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">Ex: AS114038</p>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => updateField('registrationNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. AS114038"
                  className={`w-full rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.registrationNumber ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                {errors.registrationNumber && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.registrationNumber}
                  </p>
                )}
              </div>

              {/* Q3: Contact Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  3. Contact Number <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">Ex: 0712345678</p>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => updateField('contactNumber', e.target.value)}
                  placeholder="07XXXXXXXX"
                  className={`w-full rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.contactNumber ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                {errors.contactNumber && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.contactNumber}
                  </p>
                )}
              </div>

              {/* Q4: Personal E-mail Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  4. Personal E-mail Address <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">Ex: amal.perera99@gmail.com (Please avoid using university e-mail)</p>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="your.email@gmail.com"
                  className={`w-full rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: Demographic & Academic Background */}
          {(viewMode === 'all' || currentStep === 2) && (
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-sky-400">
                  Section 2 of 4
                </span>
                <h3 className="text-lg font-bold text-slate-100">Demographic &amp; Academic Background</h3>
              </div>

              {/* Q5: Gender */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  5. Gender <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Male', 'Female'] as const).map((gender) => {
                    const isSelected = formData.gender === gender;
                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => updateField('gender', gender)}
                        className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </div>
                        <span>{gender}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.gender && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.gender}
                  </p>
                )}
              </div>

              {/* Q6: Age */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  6. Age (in completed years) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">Ex: 23</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="16"
                    max="80"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="23"
                    className={`w-32 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.age ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">years old</span>
                </div>
                {errors.age && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.age}
                  </p>
                )}
              </div>

              {/* Q7: Degree Programme */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  7. Degree Programme <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Physical Science',
                    'Biological Science',
                    'Food Science & Technology',
                    'Sports Science & Management',
                  ].map((prog) => {
                    const isSelected = formData.degreeProgramme === prog;
                    return (
                      <button
                        key={prog}
                        type="button"
                        onClick={() => updateField('degreeProgramme', prog as any)}
                        className={`flex items-center justify-start gap-2.5 rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold shadow-sm'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </div>
                        <span>{prog}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.degreeProgramme && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.degreeProgramme}
                  </p>
                )}
              </div>

              {/* Q8: Academic Year */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  8. Academic Year <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['1st year', '2nd year', '3rd year'].map((year) => {
                    const isSelected = formData.academicYear === year;
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => updateField('academicYear', year as any)}
                        className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{year}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.academicYear && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.academicYear}
                  </p>
                )}
              </div>

              {/* Q9: Accommodation Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  9. Accommodation Type <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    'Family home',
                    'University accommodation (Hostel)',
                    'Rented accommodation (Boarding/Annex)',
                    'Other',
                  ].map((acc) => {
                    const isSelected = formData.accommodationType === acc;
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => updateField('accommodationType', acc as any)}
                        className={`w-full flex items-center justify-start gap-2.5 rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </div>
                        <span>{acc === 'Other' ? 'Other (Please specify)' : acc}</span>
                      </button>
                    );
                  })}
                </div>

                {formData.accommodationType === 'Other' && (
                  <input
                    type="text"
                    value={formData.accommodationOtherText || ''}
                    onChange={(e) => updateField('accommodationOtherText', e.target.value)}
                    placeholder="Specify your accommodation..."
                    className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                )}
                {errors.accommodationType && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.accommodationType}
                  </p>
                )}
                {errors.accommodationOtherText && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.accommodationOtherText}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: Smartphone Usage & Digital Habits */}
          {(viewMode === 'all' || currentStep === 3) && (
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-sky-400">
                  Section 3 of 4
                </span>
                <h3 className="text-lg font-bold text-slate-100">Smartphone Usage &amp; Digital Habits</h3>
              </div>

              {/* Digital Wellbeing Assistant */}
              <DigitalWellbeingHelper
                currentMinutes={formData.dailyScreenTimeMinutes}
                onChangeMinutes={(mins) => updateField('dailyScreenTimeMinutes', mins)}
              />

              {/* Q10: Average Daily Smartphone Screen Time */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  10. Average Daily Smartphone Screen Time (in MINUTES per day) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 255 (i.e., 4 hours and 15 minutes per day averaged over the past 7 days)
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="1440"
                    value={formData.dailyScreenTimeMinutes}
                    onChange={(e) => updateField('dailyScreenTimeMinutes', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="255"
                    className={`w-36 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono font-bold text-sky-300 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.dailyScreenTimeMinutes ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs font-mono text-slate-400">minutes per day</span>
                  {typeof formData.dailyScreenTimeMinutes === 'number' && formData.dailyScreenTimeMinutes > 0 && (
                    <span className="text-xs text-sky-400 font-mono">
                      ≈ {Math.floor(formData.dailyScreenTimeMinutes / 60)} hrs {formData.dailyScreenTimeMinutes % 60} mins
                    </span>
                  )}
                </div>
                {errors.dailyScreenTimeMinutes && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.dailyScreenTimeMinutes}
                  </p>
                )}
              </div>

              {/* Q11: Primary Purpose of Smartphone Use */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  11. Primary Purpose of Smartphone Use <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    'Academic (LMS, reading lecture notes, research apps)',
                    'Social Communication (WhatsApp, Telegram, Calls)',
                    'Entertainment & Leisure (Social Media, YouTube, Gaming, Movies)',
                    'Mixed (Equal combination of multiple purposes)',
                  ].map((purpose) => {
                    const isSelected = formData.primaryPurpose === purpose;
                    return (
                      <button
                        key={purpose}
                        type="button"
                        onClick={() => updateField('primaryPurpose', purpose as any)}
                        className={`w-full flex items-center justify-start gap-2.5 rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </div>
                        <span>{purpose}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.primaryPurpose && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.primaryPurpose}
                  </p>
                )}
              </div>

              {/* Q12: Smartphone Use Before Sleeping */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  12. Smartphone Use Before Sleeping (in MINUTES per night) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 45 (Usage time while in bed immediately before falling asleep)
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="480"
                    value={formData.bedtimeUsageMinutes}
                    onChange={(e) => updateField('bedtimeUsageMinutes', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="45"
                    className={`w-32 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.bedtimeUsageMinutes ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">minutes</span>
                  <div className="flex items-center gap-1.5">
                    {[0, 15, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateField('bedtimeUsageMinutes', mins)}
                        className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                          formData.bedtimeUsageMinutes === mins
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
                {errors.bedtimeUsageMinutes && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.bedtimeUsageMinutes}
                  </p>
                )}
              </div>

              {/* Q13: Mobile Internet Connection Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">
                  13. Mobile Internet Connection Type <span className="text-rose-400">*</span>
                </label>
                <div className="space-y-2">
                  {[
                    'Mobile Data (Dialog, Mobitel, Hutch, Airtel)',
                    'Wi-Fi (Hostel Wi-Fi, Home Fibre/ADSL, Campus Wi-Fi)',
                    'Both (Used almost equally)',
                  ].map((conn) => {
                    const isSelected = formData.connectionType === conn;
                    return (
                      <button
                        key={conn}
                        type="button"
                        onClick={() => updateField('connectionType', conn as any)}
                        className={`w-full flex items-center justify-start gap-2.5 rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                          isSelected
                            ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-semibold'
                            : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-sky-400 bg-sky-400' : 'border-slate-500'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </div>
                        <span>{conn}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.connectionType && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.connectionType}
                  </p>
                )}
              </div>

              {/* Q14: Monthly Mobile Data Expenditure */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  14. Monthly Mobile Data Expenditure (in LKR) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 1500 (Approximate amount spent per month on internet packages/cards)
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={formData.monthlyDataSpendLKR}
                      onChange={(e) => updateField('monthlyDataSpendLKR', e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="1500"
                      className={`w-36 rounded-lg border bg-slate-950/70 pl-9 pr-3 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                        errors.monthlyDataSpendLKR ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[500, 1000, 1500, 2000, 2500, 3000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => updateField('monthlyDataSpendLKR', amt)}
                        className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                          formData.monthlyDataSpendLKR === amt
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.monthlyDataSpendLKR && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.monthlyDataSpendLKR}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: Lifestyle & Academic Factors */}
          {(viewMode === 'all' || currentStep === 4) && (
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-sky-400">
                  Section 4 of 4
                </span>
                <h3 className="text-lg font-bold text-slate-100">Lifestyle &amp; Academic Factors</h3>
              </div>

              {/* Q15: Daily Independent Study Time */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  15. Daily Independent Study Time (in HOURS per day) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 3.5 (Average study time outside of lectures &amp; lab classes)
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={formData.independentStudyHours}
                    onChange={(e) => updateField('independentStudyHours', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3.5"
                    className={`w-32 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.independentStudyHours ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">hours / day</span>
                  <div className="flex items-center gap-1.5">
                    {[1.5, 2.5, 3.5, 4.5, 6].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => updateField('independentStudyHours', hrs)}
                        className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                          formData.independentStudyHours === hrs
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>
                {errors.independentStudyHours && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.independentStudyHours}
                  </p>
                )}
              </div>

              {/* Q16: Average Sleep Duration */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  16. Average Sleep Duration (in HOURS per night) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 6.5 hours
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="18"
                    step="0.5"
                    value={formData.sleepDurationHours}
                    onChange={(e) => updateField('sleepDurationHours', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="6.5"
                    className={`w-32 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.sleepDurationHours ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">hours / night</span>
                  <div className="flex items-center gap-1.5">
                    {[5, 6, 6.5, 7, 7.5, 8].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => updateField('sleepDurationHours', hrs)}
                        className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                          formData.sleepDurationHours === hrs
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>
                </div>
                {errors.sleepDurationHours && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.sleepDurationHours}
                  </p>
                )}
              </div>

              {/* Q17: Daily Commuting Time */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-200">
                  17. Daily Commuting Time (in MINUTES per university day) <span className="text-rose-400">*</span>
                </label>
                <p className="text-xs text-slate-400">
                  Ex: 90 (Total time spent traveling to and from the university)
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={formData.commutingTimeMinutes}
                    onChange={(e) => updateField('commutingTimeMinutes', e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="90"
                    className={`w-32 rounded-lg border bg-slate-950/70 px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.commutingTimeMinutes ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-sky-500'
                    }`}
                  />
                  <span className="text-xs text-slate-400">minutes / day</span>
                  <div className="flex items-center gap-1.5">
                    {[15, 30, 45, 60, 90, 120].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => updateField('commutingTimeMinutes', mins)}
                        className={`rounded px-2 py-1 text-xs font-mono transition-colors ${
                          formData.commutingTimeMinutes === mins
                            ? 'bg-sky-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
                {errors.commutingTimeMinutes && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {errors.commutingTimeMinutes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Review & Confirmation */}
          {viewMode === 'step' && currentStep === 5 && (
            <div className="space-y-6 pt-2">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs uppercase font-mono font-semibold tracking-wider text-emerald-400">
                  Step 5 of 5
                </span>
                <h3 className="text-lg font-bold text-slate-100">Review Your Responses</h3>
                <p className="text-xs text-slate-400">
                  Please verify your details before submitting to the STA 330 Research database.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & Demographic */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 text-xs">
                  <span className="font-semibold text-sky-400 block border-b border-slate-800 pb-1.5">
                    Personal &amp; Demographic
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="text-slate-200 font-medium">{formData.fullName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reg No:</span>
                    <span className="font-mono text-slate-200">{formData.registrationNumber || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 truncate max-w-[180px]">{formData.email || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gender / Age:</span>
                    <span className="text-slate-200">{formData.gender || '—'} · {formData.age ? `${formData.age} yrs` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Programme:</span>
                    <span className="text-slate-200">{formData.degreeProgramme || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Year:</span>
                    <span className="text-slate-200">{formData.academicYear || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accommodation:</span>
                    <span className="text-slate-200 truncate max-w-[160px]">
                      {formData.accommodationType === 'Other' ? formData.accommodationOtherText : formData.accommodationType || '—'}
                    </span>
                  </div>
                </div>

                {/* Digital & Lifestyle */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 text-xs">
                  <span className="font-semibold text-sky-400 block border-b border-slate-800 pb-1.5">
                    Digital Habits &amp; Lifestyle
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Screen Time:</span>
                    <span className="font-mono font-bold text-sky-300">
                      {formData.dailyScreenTimeMinutes ? `${formData.dailyScreenTimeMinutes} min` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Purpose:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">{formData.primaryPurpose || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bedtime Usage:</span>
                    <span className="font-mono text-slate-200">{formData.bedtimeUsageMinutes ? `${formData.bedtimeUsageMinutes} min` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connection:</span>
                    <span className="text-slate-200 truncate max-w-[170px]">{formData.connectionType || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Spend:</span>
                    <span className="font-mono text-slate-200">{formData.monthlyDataSpendLKR ? `Rs. ${formData.monthlyDataSpendLKR}` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Study Time:</span>
                    <span className="font-mono text-slate-200">{formData.independentStudyHours ? `${formData.independentStudyHours} hrs` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Sleep:</span>
                    <span className="font-mono text-slate-200">{formData.sleepDurationHours ? `${formData.sleepDurationHours} hrs` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Commute:</span>
                    <span className="font-mono text-slate-200">{formData.commutingTimeMinutes ? `${formData.commutingTimeMinutes} min` : '—'}</span>
                  </div>
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>Some questions still require attention. Please click previous steps to verify.</span>
                </div>
              )}
            </div>
          )}

          {/* Action Navigation Footer */}
          <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4">
            {viewMode === 'step' ? (
              <>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                    currentStep === 1
                      ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmitting ? 'Recording Response...' : 'Submit Questionnaire'}</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Reset Form
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? 'Recording Response...' : 'Submit All Responses'}</span>
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
