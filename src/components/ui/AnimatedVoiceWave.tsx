import React, { useEffect, useRef } from 'react';

interface AnimatedVoiceWaveProps {
  className?: string;
  quote?: string;
  height?: number;
}

export const AnimatedVoiceWave: React.FC<AnimatedVoiceWaveProps> = ({
  className = '',
  quote = '“More conversations, a brighter tomorrow”',
  height = 90
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = (height || 90) * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const render = () => {
      t += 0.022; // Smooth animation speed
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const h = height || 90;
      const midY = h / 2;

      ctx.clearRect(0, 0, width, h);

      // Subtle breathing amplitude modulation
      const breathe = 1 + 0.12 * Math.sin(t * 0.8);

      // Gradient 1: Neon Cyan -> Sky Blue -> Violet -> Soft Purple
      const grad1 = ctx.createLinearGradient(0, 0, width, 0);
      grad1.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad1.addColorStop(0.18, 'rgba(37, 99, 235, 0.7)');
      grad1.addColorStop(0.42, 'rgba(56, 189, 248, 1)');
      grad1.addColorStop(0.72, 'rgba(129, 140, 248, 0.95)');
      grad1.addColorStop(0.92, 'rgba(192, 132, 252, 0.6)');
      grad1.addColorStop(1, 'rgba(168, 85, 247, 0)');

      // Gradient 2: Deep Blue -> Electric Cyan -> Magenta Purple -> Indigo
      const grad2 = ctx.createLinearGradient(0, 0, width, 0);
      grad2.addColorStop(0, 'rgba(29, 78, 216, 0)');
      grad2.addColorStop(0.25, 'rgba(6, 182, 212, 0.85)');
      grad2.addColorStop(0.65, 'rgba(168, 85, 247, 0.95)');
      grad2.addColorStop(0.88, 'rgba(99, 102, 241, 0.7)');
      grad2.addColorStop(1, 'rgba(79, 70, 229, 0)');

      // Gradient 3: Faint Accent Filament
      const grad3 = ctx.createLinearGradient(0, 0, width, 0);
      grad3.addColorStop(0, 'rgba(14, 165, 233, 0)');
      grad3.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
      grad3.addColorStop(0.7, 'rgba(168, 85, 247, 0.45)');
      grad3.addColorStop(1, 'rgba(99, 102, 241, 0)');

      // Helper function to draw a single wave with envelope tapering
      const drawWave = (
        fn: (u: number) => number,
        gradient: CanvasGradient,
        lineWidth: number,
        shadowBlur: number,
        shadowColor: string
      ) => {
        ctx.save();
        ctx.beginPath();

        const step = 3; // Step in pixels for high smoothness
        let first = true;

        for (let x = 0; x <= width; x += step) {
          const u = x / width; // 0 to 1
          // Sinusoidal envelope to taper ends to exactly 0
          const envelope = Math.pow(Math.sin(Math.PI * u), 1.25);
          const y = midY + fn(u) * envelope * breathe;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      };

      // 1. Background subtle harmonic filament (thinner, ambient)
      drawWave(
        (u) => 13 * Math.sin(u * 2.8 * Math.PI + t * 1.3) + 5 * Math.cos(u * 5.6 * Math.PI - t * 0.9),
        grad3,
        1.2,
        4,
        'rgba(56, 189, 248, 0.4)'
      );

      // 2. Secondary crossover wave (Magenta / Purple / Indigo)
      drawWave(
        (u) => -24 * Math.sin(u * 2.3 * Math.PI - t * 1.5 + 0.7) + 7 * Math.sin(u * 4.6 * Math.PI - t * 2.1),
        grad2,
        2.6,
        10,
        'rgba(168, 85, 247, 0.75)'
      );

      // 3. Primary foreground hero wave (Cyan / Blue / Violet)
      drawWave(
        (u) => 26 * Math.sin(u * 2.1 * Math.PI - t * 1.7) + 8 * Math.cos(u * 4.2 * Math.PI + t * 1.1),
        grad1,
        3.4,
        14,
        'rgba(56, 189, 248, 0.9)'
      );

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [height]);

  return (
    <div className={`relative w-full max-w-lg pt-4 pb-2 ${className}`}>
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* 60fps Animated Voice Wave Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full block"
        style={{ height: `${height}px` }}
      />

      {quote && (
        <p className="text-xs sm:text-sm text-zinc-400 text-center font-normal pt-2 italic tracking-wide select-none">
          {quote}
        </p>
      )}
    </div>
  );
};
