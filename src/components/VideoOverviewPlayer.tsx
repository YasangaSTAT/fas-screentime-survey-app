import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Captions,
  Clock,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Smartphone,
  Moon,
  BookOpen,
  Award,
  ChevronRight,
  ExternalLink,
  Layers,
  Settings,
  Tv,
} from 'lucide-react';

interface Scene {
  id: number;
  startTime: number; // in seconds
  endTime: number; // in seconds
  title: string;
  badge: string;
  subtitle: string;
  narrationText: string;
  icon: React.ReactNode;
  accentColor: string;
  highlights: string[];
}

const VIDEO_DURATION = 135; // 2 minutes 15 seconds

const SCENES: Scene[] = [
  {
    id: 1,
    startTime: 0,
    endTime: 30,
    title: 'Academic Context & Institutional Background',
    badge: 'Introduction · USJ Statistics',
    subtitle: 'STA 330 2.0 Special Topics in Statistics Research Initiative',
    narrationText:
      'Welcome to the Smartphone Screen Time Research Study conducted by the Department of Statistics, Faculty of Applied Sciences, University of Sri Jayewardenepura. Under course unit STA 330 2.0, this study evaluates the digital habits and lifestyle metrics of undergraduate science students.',
    icon: <GraduationCap className="h-6 w-6 text-sky-400" />,
    accentColor: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
    highlights: [
      'University of Sri Jayewardenepura',
      'Faculty of Applied Sciences (FAS)',
      'Department of Statistics · STA 330 2.0',
      'Lead Researcher: as2023554@sci.sjp.ac.lk',
    ],
  },
  {
    id: 2,
    startTime: 30,
    endTime: 65,
    title: 'Research Rationale & Digital Habits',
    badge: 'Problem Rationale · Screen Time',
    subtitle: 'The Impact of Mobile Computing on Academic Life & Health',
    narrationText:
      'Over the past decade, smartphones have evolved from simple communication gadgets into central hubs for lecture material, social networks, and multimedia. However, excessive exposure has raised questions regarding student attention span, circadian rhythms, and study discipline.',
    icon: <Smartphone className="h-6 w-6 text-indigo-400" />,
    accentColor: 'from-indigo-500/20 to-purple-600/10 border-indigo-500/30',
    highlights: [
      'Exponential rise in mobile LMS & revision app usage',
      'Constant social notifications and multitasking',
      'Balancing lecture study with entertainment screen hours',
      'Identifying healthy vs. disruptive digital thresholds',
    ],
  },
  {
    id: 3,
    startTime: 65,
    endTime: 95,
    title: 'The Four Core Statistical Investigations',
    badge: 'Study Objectives · Hypotheses',
    subtitle: 'Correlating Screen Exposure with Sleep, Study, and Accommodation',
    narrationText:
      'Our primary inquiry examines four key dimensions: First, variance across disciplines such as Physical, Biological, Food Science, and Sports Science. Second, late-night bedtime usage and its correlation with sleep duration. Third, independent self-study hours. And fourth, the influence of student living arrangements.',
    icon: <Layers className="h-6 w-6 text-emerald-400" />,
    accentColor: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30',
    highlights: [
      '1. Cross-discipline variance (Physical, Biological, Food, Sports Science)',
      '2. In-bed nocturnal screen time vs. sleep deprivation (r correlation)',
      '3. Self-directed study hours vs. primary app usage purpose',
      '4. Living arrangements (Hostel vs Boarding vs Home) & Wi-Fi spend',
    ],
  },
  {
    id: 4,
    startTime: 95,
    endTime: 115,
    title: 'Methodology, Target Sample & Precision Guidance',
    badge: 'Sampling Method · N = 300',
    subtitle: 'Empirical Verification via iOS Screen Time & Android Digital Wellbeing',
    narrationText:
      'To achieve statistical power, we are gathering responses from 300 science undergraduates. To ensure accuracy, students are guided to inspect their actual 7-day average from Apple Screen Time or Android Digital Wellbeing rather than relying on guesswork.',
    icon: <ShieldCheck className="h-6 w-6 text-amber-400" />,
    accentColor: 'from-amber-500/20 to-orange-600/10 border-amber-500/30',
    highlights: [
      'Target Sample Size: N = 300 verified undergraduate respondents',
      'Apple iOS: Settings → Screen Time → See All Activity',
      'Android OS: Settings → Digital Wellbeing & Parental Controls',
      '100% Academic Confidentiality & Anonymized Aggregation',
    ],
  },
  {
    id: 5,
    startTime: 115,
    endTime: 135,
    title: 'Student Participation & Certificate Dispatch',
    badge: 'Incentives · Certificate',
    subtitle: 'Fast 3-Minute Questionnaire with Personalized Recognition',
    narrationText:
      'Participating takes only three to four minutes. Upon verified submission, students receive an immediate personalized Digital Wellbeing report along with an official academic Certificate of Survey Contribution dispatched to their email address.',
    icon: <Award className="h-6 w-6 text-rose-400" />,
    accentColor: 'from-rose-500/20 to-pink-600/10 border-rose-500/30',
    highlights: [
      'Quick 3–4 minute mobile-friendly questionnaire',
      'Instant interactive Digital Wellbeing score and personalized aura',
      'Personalized Academic Certificate of Survey Contribution',
      'Contribute directly to statistics research at University of Sri Jayewardenepura',
    ],
  },
];

interface VideoOverviewPlayerProps {
  onStartSurvey?: () => void;
}

export const VideoOverviewPlayer: React.FC<VideoOverviewPlayerProps> = ({ onStartSurvey }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Determine current scene based on time
  const currentScene =
    SCENES.find((s) => currentTime >= s.startTime && currentTime < s.endTime) || SCENES[0];

  // Timer loop for interactive video simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= VIDEO_DURATION) {
            setIsPlaying(false);
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            return 0;
          }
          return Math.min(VIDEO_DURATION, prev + 0.5 * playbackSpeed);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Voice narration synchronization using Web Speech API
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    if (!isPlaying || !isVoiceEnabled) {
      window.speechSynthesis.cancel();
      return;
    }

    // Cancel prior speech and narrate current scene text
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentScene.narrationText);
    utterance.rate = playbackSpeed * 0.98;
    utterance.pitch = 1.0;
    speechUtteranceRef.current = utterance;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && !v.name.includes('Bad'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [currentScene.id, isPlaying, isVoiceEnabled, playbackSpeed]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
  };

  const handleJumpToScene = (startTime: number) => {
    setCurrentTime(startTime);
    setIsPlaying(true);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-mono font-semibold text-sky-400 border border-sky-500/20">
            <Tv className="h-3.5 w-3.5" />
            <span>Interactive Media &amp; Video Presentation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
            Research Study Video Overview
          </h2>
          <p className="text-xs text-slate-400">
            Watch the comprehensive 2-minute academic briefing on study objectives, methodologies, and participant certificates.
          </p>
        </div>
      </div>

      {/* Main Video Frame Container */}
      <div
        ref={containerRef}
        className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl transition-all"
      >
        {/* Interactive Animated Video Experience */}
        <div className="relative aspect-video w-full select-none overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Ambient Animated Glow Backdrop */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className={`absolute -top-1/3 -right-1/4 h-[500px] w-[500px] rounded-full blur-[140px] opacity-25 transition-all duration-1000 ${
                  currentScene.id === 1
                    ? 'bg-sky-500'
                    : currentScene.id === 2
                    ? 'bg-indigo-500'
                    : currentScene.id === 3
                    ? 'bg-emerald-500'
                    : currentScene.id === 4
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
              <div className="absolute -bottom-1/3 -left-1/4 h-[400px] w-[400px] rounded-full bg-sky-500/15 blur-[120px]" />
              {/* Subtle Grid overlay for high-tech academic feel */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            {/* University Branding Overlay Watermark */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center gap-2.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/80 shadow-md">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] font-bold text-white tracking-wide">
                  University of Sri Jayewardenepura
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  STA 330 2.0 · Faculty of Applied Sciences
                </div>
              </div>
            </div>

            {/* Scene Badge & Counter */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-slate-800 px-3 py-1 text-[11px] font-mono text-slate-300 backdrop-blur-md shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>Chapter {currentScene.id} / 5</span>
              </div>
            </div>

            {/* Active Scene Content Presentation */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-12 md:p-16 pb-20 sm:pb-24">
              <div className="mt-8 sm:mt-10 max-w-2xl space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-sky-400 border border-sky-500/20">
                  {currentScene.badge}
                </div>

                <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {currentScene.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                  {currentScene.subtitle}
                </p>

                {/* Key Bullet Visual Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {currentScene.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg bg-slate-900/60 border border-slate-800/80 px-3 py-2 text-[11px] sm:text-xs text-slate-200 backdrop-blur-sm"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtitles Overlay Bar */}
              {showSubtitles && (
                <div className="mx-auto max-w-2xl w-full text-center">
                  <div className="inline-block rounded-xl bg-slate-950/90 border border-slate-800/80 px-4 py-2 text-xs sm:text-sm text-slate-200 backdrop-blur-md shadow-xl leading-relaxed">
                    <span className="text-sky-400 font-mono text-[11px] mr-1.5 font-bold">[CC]</span>
                    {currentScene.narrationText}
                  </div>
                </div>
              )}
            </div>

            {/* Center Big Play/Pause Overlay Button when paused */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all cursor-pointer group/overlay"
                title="Play Video Overview"
              >
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-sky-500 text-white shadow-2xl shadow-sky-500/50 group-hover/overlay:scale-110 transition-transform">
                  <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1 fill-white" />
                </div>
              </button>
            )}

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-4 sm:px-6 pt-6 pb-3 space-y-2">
              {/* Scrub Timeline */}
              <div className="relative flex items-center group/scrub">
                <input
                  type="range"
                  min="0"
                  max={VIDEO_DURATION}
                  value={currentTime}
                  onChange={handleSeek}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-sky-400 group-hover/scrub:h-2.5 transition-all"
                />

                {/* Chapter Boundary Ticks */}
                <div className="pointer-events-none absolute inset-x-0 flex justify-between px-1">
                  {SCENES.map((s) => (
                    <div
                      key={s.id}
                      className="h-2 w-0.5 rounded bg-slate-600/50"
                      style={{
                        left: `${(s.startTime / VIDEO_DURATION) * 100}%`,
                      }}
                      title={s.title}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Buttons Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-sky-500 transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestart}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>

                  <div className="font-mono text-[11px] text-slate-400 pl-1">
                    <span className="text-white font-semibold">{formatTime(currentTime)}</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span>{formatTime(VIDEO_DURATION)}</span>
                  </div>

                  {/* Audio equalizer animation when playing with voice */}
                  {isPlaying && isVoiceEnabled && (
                    <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                      <div className="h-2 w-0.5 bg-emerald-400 animate-pulse" />
                      <div className="h-3.5 w-0.5 bg-emerald-400 animate-pulse delay-75" />
                      <div className="h-2.5 w-0.5 bg-emerald-400 animate-pulse delay-150" />
                      <div className="h-1.5 w-0.5 bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-emerald-400 ml-1">Voice Active</span>
                    </div>
                  )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Voice Narration toggle */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                      isVoiceEnabled
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                    title={isVoiceEnabled ? 'Turn voice narration off' : 'Turn voice narration on'}
                  >
                    {isVoiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span className="hidden md:inline">Narration</span>
                  </button>

                  {/* Captions toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSubtitles(!showSubtitles)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                      showSubtitles
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-300 font-semibold'
                        : 'border-slate-800 bg-slate-900 text-slate-400'
                    }`}
                    title="Toggle Subtitles [CC]"
                  >
                    <Captions className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px]">CC</span>
                  </button>

                  {/* Speed toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const speeds = [1, 1.25, 1.5];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                    }}
                    className="px-2 py-1 rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-mono text-slate-300 hover:text-white cursor-pointer"
                    title="Playback Speed"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Fullscreen toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Chapter Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {SCENES.map((scene) => {
          const isActive = currentScene.id === scene.id;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => handleJumpToScene(scene.startTime)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-sky-500/50 bg-sky-500/10 shadow-md shadow-sky-500/10'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className={isActive ? 'text-sky-400 font-bold' : 'text-slate-500'}>
                  Part {scene.id}
                </span>
                <span className="text-slate-500">{formatTime(scene.startTime)}</span>
              </div>
              <div className="text-xs font-semibold text-slate-200 line-clamp-1">{scene.title}</div>
              <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{scene.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Call to Action Banner right below video */}
      {onStartSurvey && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Inspired by the research briefing?</div>
              <div className="text-[11px] text-slate-400">
                Join your fellow USJ undergraduates and record your screen time data in under 4 minutes.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartSurvey}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-sky-500/25 hover:bg-sky-400 transition-all whitespace-nowrap cursor-pointer"
          >
            <span>Begin Questionnaire</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
