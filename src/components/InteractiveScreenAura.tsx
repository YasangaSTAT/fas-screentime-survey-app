import React, { useEffect, useRef, useState } from 'react';
import { VisualThemeMode } from '../types/survey';

interface InteractiveScreenAuraProps {
  themeMode: VisualThemeMode;
  screenTimeMinutes?: number;
  interactive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  alpha: number;
  pulsePhase: number;
  color: string;
}

export const InteractiveScreenAura: React.FC<InteractiveScreenAuraProps> = ({
  themeMode,
  screenTimeMinutes = 240,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; radius: number }>({
    x: -1000,
    y: -1000,
    radius: 120,
  });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Color definitions based on topic theme
    const getThemeColors = () => {
      switch (themeMode) {
        case 'amberShield':
          return {
            bgGradient: ['#120c06', '#1a1107', '#080502'],
            particles: ['#f59e0b', '#fbbf24', '#f97316', '#d97706'],
            meshLine: 'rgba(245, 158, 11, 0.12)',
            glowCenter: 'rgba(245, 158, 11, 0.15)',
          };
        case 'obsidianOled':
          return {
            bgGradient: ['#05070a', '#0a0d14', '#020305'],
            particles: ['#60a5fa', '#94a3b8', '#38bdf8', '#cbd5e1'],
            meshLine: 'rgba(148, 163, 184, 0.08)',
            glowCenter: 'rgba(56, 189, 248, 0.08)',
          };
        case 'blueLight':
        default:
          return {
            bgGradient: ['#060e1f', '#091834', '#040813'],
            particles: ['#38bdf8', '#0ea5e9', '#6366f1', '#818cf8', '#06b6d4'],
            meshLine: 'rgba(56, 189, 248, 0.14)',
            glowCenter: 'rgba(14, 165, 233, 0.20)',
          };
      }
    };

    // Calculate dynamic activity level from screen time
    // Baseline 120m -> 1.0; 480m -> 2.2
    const screenFactor = Math.min(Math.max((screenTimeMinutes || 240) / 200, 0.7), 2.5);
    const particleCount = Math.min(Math.floor((width * height) / 16000), 90);
    let particles: Particle[] = [];

    const initParticles = () => {
      const colors = getThemeColors();
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const baseRadius = Math.random() * 2.2 + 1;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.7 * screenFactor,
          vy: (Math.random() - 0.5) * 0.7 * screenFactor,
          baseRadius,
          radius: baseRadius,
          alpha: Math.random() * 0.5 + 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
          color: colors.particles[Math.floor(Math.random() * colors.particles.length)],
        });
      }
    };

    initParticles();

    // Mouse movement listeners
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let time = 0;

    const render = () => {
      time += 0.015 * screenFactor;
      const colors = getThemeColors();

      // Deep canvas background gradient
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.35,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, colors.bgGradient[1]);
      bgGrad.addColorStop(0.5, colors.bgGradient[0]);
      bgGrad.addColorStop(1, colors.bgGradient[2]);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle dynamic screen aura glow at top center (simulating the emitted screen illumination)
      const screenGlow = ctx.createRadialGradient(
        width * 0.5,
        0,
        10,
        width * 0.5,
        height * 0.4,
        width * 0.7
      );
      screenGlow.addColorStop(0, colors.glowCenter);
      screenGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = screenGlow;
      ctx.fillRect(0, 0, width, height);

      // Subtle cursor light aura
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const cursorGlow = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          180
        );
        cursorGlow.addColorStop(0, colors.glowCenter);
        cursorGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p = particles[i];

        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap around edges
          if (p.x < -20) p.x = width + 20;
          else if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          else if (p.y > height + 20) p.y = -20;

          // Mouse repulse/attract interaction
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - dist) / mouseRef.current.radius;
            p.x -= (dx / dist) * force * 3;
            p.y -= (dy / dist) * force * 3;
          }

          // Pulsing radius
          p.radius = p.baseRadius + Math.sin(time + p.pulsePhase) * 0.6;
        }

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(p.radius, 0.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Connect nearby particles with digital telemetry lines
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const distDx = p.x - p2.x;
          const distDy = p.y - p2.y;
          const distance = Math.sqrt(distDx * distDx + distDy * distDy);
          const maxConnectDist = 110;

          if (distance < maxConnectDist) {
            ctx.strokeStyle = colors.meshLine;
            ctx.lineWidth = (1 - distance / maxConnectDist) * 0.9;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [themeMode, screenTimeMinutes, interactive, isReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
};
