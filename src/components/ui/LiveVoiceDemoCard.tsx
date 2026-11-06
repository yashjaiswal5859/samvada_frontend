import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface ConversationTurn {
  id: number;
  customerText: string;
  aiText: string;
}

const CONVERSATION_TURNS: ConversationTurn[] = [
  {
    id: 0,
    customerText: 'Can you check if my appointment is confirmed for tomorrow?',
    aiText: 'Yes, your appointment is confirmed for tomorrow at 10:00 AM. Is there anything else I can help you with?'
  },
  {
    id: 1,
    customerText: 'Can I reschedule my consultation to Friday at 3:00 PM?',
    aiText: 'Done! I have updated your booking to Friday at 3:00 PM. A calendar invite has been sent to your email.'
  },
  {
    id: 2,
    customerText: 'Can your voice agent sync call logs directly into Salesforce?',
    aiText: 'Absolutely! Full call recordings, transcription, and structured notes sync bi-directionally in under a second.'
  }
];

export const LiveVoiceDemoCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeTurn, setActiveTurn] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto-cycle through the 3 conversation turns
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTurn((prev) => (prev + 1) % CONVERSATION_TURNS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // 60 FPS Living Wave Canvas Engine
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
      canvas.height = 70 * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const render = () => {
      t += 0.025;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = 70;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 2. Gradients for Left (Precision Cyan) and Right (Cobalt/Royal Blue)
      const gradFull = ctx.createLinearGradient(0, 0, width, 0);
      gradFull.addColorStop(0, 'rgba(99, 102, 241, 0)');
      gradFull.addColorStop(0.12, 'rgba(79, 70, 229, 0.8)');
      gradFull.addColorStop(0.38, 'rgba(37, 99, 235, 1)');
      gradFull.addColorStop(0.48, 'rgba(56, 189, 248, 1)');
      gradFull.addColorStop(0.52, 'rgba(99, 102, 241, 1)');
      gradFull.addColorStop(0.72, 'rgba(79, 70, 229, 1)');
      gradFull.addColorStop(0.88, 'rgba(59, 130, 246, 0.75)');
      gradFull.addColorStop(1, 'rgba(99, 102, 241, 0)');

      const gradSecondary = ctx.createLinearGradient(0, 0, width, 0);
      gradSecondary.addColorStop(0, 'rgba(99, 102, 241, 0)');
      gradSecondary.addColorStop(0.2, 'rgba(139, 92, 246, 0.55)');
      gradSecondary.addColorStop(0.5, 'rgba(79, 70, 229, 0.6)');
      gradSecondary.addColorStop(0.8, 'rgba(59, 130, 246, 0.55)');
      gradSecondary.addColorStop(1, 'rgba(99, 102, 241, 0)');

      // 3. Helper to draw smooth undulating wave
      const drawSineWave = (
        fn: (u: number) => number,
        strokeGradient: CanvasGradient,
        lineWidth: number,
        shadowBlur: number,
        shadowColor: string
      ) => {
        ctx.save();
        ctx.beginPath();
        const step = 2.5;
        let first = true;

        for (let x = 0; x <= width; x += step) {
          const u = x / width; // 0 to 1
          // Sinusoidal envelope to taper both ends to 0
          const envelope = Math.pow(Math.sin(Math.PI * u), 1.2);
          const y = midY + fn(u) * envelope;

          if (first) {
            ctx.moveTo(x, y);
            first = false;
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = strokeGradient;
        ctx.lineWidth = lineWidth;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.restore();
      };

      // Background subtle ribbon
      drawSineWave(
        (u) => 14 * Math.sin(u * 2.8 * Math.PI - t * 1.4) + 4 * Math.cos(u * 5.6 * Math.PI + t * 0.9),
        gradSecondary,
        2.0,
        8,
        'rgba(139, 92, 246, 0.5)'
      );

      // Hero Primary Glowing Wave
      drawSineWave(
        (u) => 18 * Math.sin(u * 2.2 * Math.PI - t * 1.8) + 6 * Math.sin(u * 4.4 * Math.PI + t * 1.2),
        gradFull,
        3.2,
        14,
        'rgba(79, 70, 229, 0.9)'
      );

      // 4. Center Audio Equalizer Bars (Exact match to reference image!)
      const centerX = width / 2;
      const barCount = 7;
      const barWidth = 3;
      const barSpacing = 4.5;
      const startX = centerX - ((barCount - 1) * (barWidth + barSpacing)) / 2;

      for (let i = 0; i < barCount; i++) {
        const bx = startX + i * (barWidth + barSpacing);
        // Distribute heights with organic pulsating rhythm
        const distFromCenter = Math.abs(i - Math.floor(barCount / 2));
        const maxH = 26 - distFromCenter * 3.5;
        const barHeight = Math.max(6, maxH * (0.6 + 0.4 * Math.sin(t * 3.5 + i * 0.8)));

        ctx.save();
        ctx.beginPath();
        const topY = midY - barHeight / 2;
        const bottomY = midY + barHeight / 2;

        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = barWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 8;

        ctx.moveTo(bx, topY);
        ctx.lineTo(bx, bottomY);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const current = CONVERSATION_TURNS[activeTurn];

  return (
    <div className={`w-full max-w-xl ${className}`}>
      {/* Outer Card — clean graphite/slate surface with crisp hairline */}
      <div className="relative rounded-xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-sm overflow-hidden">
        
        {/* --- TOP ROW: CUSTOMER MESSAGE + "INTERACTIVE VOICE STREAM" PILL --- */}
        <div className="flex items-start justify-between gap-4">
          
          {/* Customer Avatar & Speech Bubble */}
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
              <User className="w-4 h-4 text-slate-100" />
            </div>

            {/* Bubble with Customer label */}
            <div className="flex flex-col items-start">
              <span className="text-[11px] font-medium text-slate-500 mb-1">
                Inbound Caller
              </span>
              <div className="bg-slate-50 border border-slate-200 rounded-lg rounded-tl-none px-3.5 py-2.5 shadow-2xs">
                <p className="text-xs sm:text-[13px] text-slate-800 font-normal leading-relaxed">
                  {current.customerText}
                </p>
              </div>
            </div>
          </div>

          {/* Top Right: Telephony Status badge */}
          <div className="flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>180ms p95 · Opus 48kHz</span>
            </div>
          </div>
        </div>

        {/* --- MIDDLE ROW: 60FPS LIVING SOUNDWAVE CANVAS --- */}
        <div className="relative my-2 w-full">
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ height: '70px' }}
          />
        </div>

        {/* --- BOTTOM ROW: SAMVADA AI MESSAGE (ALIGNED TO RIGHT) --- */}
        <div className="flex items-end justify-end gap-3 w-full">
          {/* Bubble with Samvada AI label */}
          <div className="flex flex-col items-end max-w-[78%]">
            <span className="text-[11px] font-medium text-emerald-700 mb-1 pr-1">
              Samvada Agent
            </span>
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg rounded-tr-none px-3.5 py-2.5 shadow-2xs text-left">
              <p className="text-xs sm:text-[13px] text-slate-800 font-normal leading-relaxed">
                {current.aiText}
              </p>
            </div>
          </div>

          {/* Right Avatar */}
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0 text-white shadow-2xs mb-0.5">
            <div className="flex items-center gap-0.5 h-3.5">
              <span className="w-0.5 h-2 bg-emerald-100 rounded-full" />
              <span className="w-0.5 h-3 bg-white rounded-full" />
              <span className="w-0.5 h-2.5 bg-emerald-100 rounded-full" />
              <span className="w-0.5 h-1.5 bg-emerald-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* --- BOTTOM LEFT: CAROUSEL PAGINATION DOTS --- */}
        <div className="mt-4 flex items-center gap-1.5 pl-1">
          {CONVERSATION_TURNS.map((turn) => (
            <button
              key={turn.id}
              type="button"
              onClick={() => setActiveTurn(turn.id)}
              aria-label={`Switch to scenario ${turn.id + 1}`}
              className={`rounded-full transition-all duration-200 ${
                activeTurn === turn.id
                  ? 'w-2 h-2 bg-slate-900'
                  : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
