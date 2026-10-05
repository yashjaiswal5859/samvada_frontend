import React, { useState, useEffect, useRef } from 'react';
import { User, Bot, Mic, Volume2, Headphones, Sparkles, Zap } from 'lucide-react';

interface DialogueTurn {
  id: string;
  topic: string;
  human: string;
  ai: string;
}

const DIALOGUES: DialogueTurn[] = [
  {
    id: 'reschedule',
    topic: 'Appointment Scheduling',
    human: '“Hi, I need to reschedule my consultation to this Friday afternoon.”',
    ai: '“I’d be happy to help! Dr. Sharma has an opening on Friday at 3:00 PM. Shall I lock that in for you?”'
  },
  {
    id: 'confirmation',
    topic: 'Instant Confirmation',
    human: '“Yes, 3:00 PM works great! Will you send me an SMS reminder?”',
    ai: '“Confirmed! I’ve sent the calendar invite and SMS reminder to your number. Anything else I can do?”'
  },
  {
    id: 'crm',
    topic: 'CRM & Enterprise Integration',
    human: '“Can your voice agent sync this call directly into our Salesforce CRM?”',
    ai: '“Absolutely! Call recordings, transcripts, and structured notes sync bi-directionally in under a second.”'
  }
];

type SpeakerState = 'human' | 'latency' | 'ai';

export const VoiceConversationWave: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [speakerState, setSpeakerState] = useState<SpeakerState>('human');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cycle speech states: Human speaks -> AI latency pause -> AI speaks -> next dialogue
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (speakerState === 'human') {
      // Human speaks for 4 seconds
      timer = setTimeout(() => {
        setSpeakerState('latency');
      }, 4000);
    } else if (speakerState === 'latency') {
      // 400ms ultra-low latency transition
      timer = setTimeout(() => {
        setSpeakerState('ai');
      }, 450);
    } else if (speakerState === 'ai') {
      // AI speaks for 4.8 seconds
      timer = setTimeout(() => {
        setActiveDialogueIndex((prev) => (prev + 1) % DIALOGUES.length);
        setSpeakerState('human');
      }, 4800);
    }

    return () => clearTimeout(timer);
  }, [speakerState, activeDialogueIndex]);

  // Canvas Wave Animation Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let t = 0;

    // Particle streams representing audio photons traveling between Human and AI
    interface AudioParticle {
      u: number; // position from 0 to 1
      speed: number;
      size: number;
      alpha: number;
      offsetY: number;
    }

    const particles: AudioParticle[] = Array.from({ length: 14 }, () => ({
      u: Math.random(),
      speed: 0.004 + Math.random() * 0.007,
      size: 1.5 + Math.random() * 2.2,
      alpha: 0.3 + Math.random() * 0.7,
      offsetY: (Math.random() - 0.5) * 8
    }));

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = 100 * dpr;
      ctx.scale(dpr, dpr);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const render = () => {
      t += 0.024;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = 100;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine current speaker modulation
      const isHumanSpeaking = speakerState === 'human';
      const isAISpeaking = speakerState === 'ai';
      const isLatency = speakerState === 'latency';

      const breathe = isLatency
        ? 0.4
        : isHumanSpeaking
        ? 1.15 + 0.2 * Math.sin(t * 3.2)
        : 1.25 + 0.25 * Math.sin(t * 3.5);

      // --- GRADIENTS ---
      // Primary Wave Gradient
      const gradHero = ctx.createLinearGradient(0, 0, width, 0);
      if (isHumanSpeaking) {
        // Cyan & Sky energy shooting from Human (left) to right
        gradHero.addColorStop(0, 'rgba(56, 189, 248, 0)');
        gradHero.addColorStop(0.15, 'rgba(56, 189, 248, 0.95)');
        gradHero.addColorStop(0.4, 'rgba(14, 165, 233, 0.9)');
        gradHero.addColorStop(0.7, 'rgba(99, 102, 241, 0.7)');
        gradHero.addColorStop(1, 'rgba(168, 85, 247, 0)');
      } else if (isAISpeaking) {
        // Electric Violet, Magenta & Neon Blue shooting from AI (right) to left
        gradHero.addColorStop(0, 'rgba(56, 189, 248, 0)');
        gradHero.addColorStop(0.3, 'rgba(129, 140, 248, 0.7)');
        gradHero.addColorStop(0.65, 'rgba(168, 85, 247, 0.95)');
        gradHero.addColorStop(0.9, 'rgba(217, 70, 239, 0.95)');
        gradHero.addColorStop(1, 'rgba(217, 70, 239, 0)');
      } else {
        // Latency transition shimmer
        gradHero.addColorStop(0, 'rgba(56, 189, 248, 0)');
        gradHero.addColorStop(0.5, 'rgba(129, 140, 248, 0.5)');
        gradHero.addColorStop(1, 'rgba(168, 85, 247, 0)');
      }

      // Secondary Wave Gradient
      const gradSecondary = ctx.createLinearGradient(0, 0, width, 0);
      gradSecondary.addColorStop(0, 'rgba(6, 182, 212, 0)');
      gradSecondary.addColorStop(0.2, 'rgba(6, 182, 212, 0.6)');
      gradSecondary.addColorStop(0.6, 'rgba(147, 51, 234, 0.7)');
      gradSecondary.addColorStop(0.9, 'rgba(99, 102, 241, 0.6)');
      gradSecondary.addColorStop(1, 'rgba(99, 102, 241, 0)');

      // Draw Wave Path Helper with tapering envelope
      const drawWavePath = (
        fn: (u: number) => number,
        strokeGradient: CanvasGradient,
        lineWidth: number,
        shadowBlur: number,
        shadowColor: string,
        speakerBias: number // -1 = bias left (human), 1 = bias right (ai), 0 = balanced
      ) => {
        ctx.save();
        ctx.beginPath();
        const step = 2.5;
        let first = true;

        for (let x = 0; x <= width; x += step) {
          const u = x / width; // 0 (human side) to 1 (AI side)
          // Envelope: tapers smoothly to 0 at both tips
          const envelope = Math.pow(Math.sin(Math.PI * u), 1.25);
          
          // Bias amplitude towards active speaker
          let biasMultiplier = 1;
          if (speakerBias < 0) {
            // Amplified near left (human)
            biasMultiplier = 1.35 - 0.7 * u;
          } else if (speakerBias > 0) {
            // Amplified near right (ai)
            biasMultiplier = 0.65 + 0.7 * u;
          }

          const y = midY + fn(u) * envelope * breathe * biasMultiplier;

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

      const speakerBias = isHumanSpeaking ? -0.8 : isAISpeaking ? 0.8 : 0;
      const speedMult = isLatency ? 0.4 : 1;

      // 1. Ambient Harmonic Filament
      drawWavePath(
        (u) => 12 * Math.sin(u * 2.6 * Math.PI + t * 1.2 * speedMult) + 5 * Math.cos(u * 5.2 * Math.PI - t * 0.9),
        gradSecondary,
        1.5,
        6,
        isHumanSpeaking ? 'rgba(56, 189, 248, 0.4)' : 'rgba(168, 85, 247, 0.4)',
        speakerBias * 0.5
      );

      // 2. Secondary Crossing Sine Ribbon
      drawWavePath(
        (u) => -24 * Math.sin(u * 2.2 * Math.PI - t * 1.6 * speedMult + 0.5) + 7 * Math.sin(u * 4.4 * Math.PI - t * 2.1),
        gradSecondary,
        2.5,
        10,
        isHumanSpeaking ? 'rgba(14, 165, 233, 0.6)' : 'rgba(217, 70, 239, 0.7)',
        speakerBias
      );

      // 3. Hero Foreground Glowing Wave
      drawWavePath(
        (u) => 28 * Math.sin(u * 2.1 * Math.PI - t * 1.8 * speedMult) + 9 * Math.cos(u * 4.2 * Math.PI + t * 1.3),
        gradHero,
        3.5,
        16,
        isHumanSpeaking ? 'rgba(56, 189, 248, 0.95)' : 'rgba(168, 85, 247, 0.95)',
        speakerBias
      );

      // 4. Photons / Particle Stream traveling between speakers
      particles.forEach((p) => {
        // Move in direction of current speaker:
        // Human speaks -> particles travel left-to-right (u increases)
        // AI speaks -> particles travel right-to-left (u decreases)
        if (isHumanSpeaking) {
          p.u += p.speed * 1.2;
          if (p.u > 0.98) p.u = 0.02;
        } else if (isAISpeaking) {
          p.u -= p.speed * 1.2;
          if (p.u < 0.02) p.u = 0.98;
        } else {
          // Subtle drift during latency
          p.u += p.speed * 0.3;
          if (p.u > 0.98) p.u = 0.02;
        }

        const envelope = Math.pow(Math.sin(Math.PI * p.u), 1.2);
        const waveY = midY + (28 * Math.sin(p.u * 2.1 * Math.PI - t * 1.8) * envelope * breathe) + p.offsetY * envelope;
        const px = p.u * width;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, waveY, p.size * envelope, 0, Math.PI * 2);
        ctx.fillStyle = isHumanSpeaking
          ? `rgba(56, 189, 248, ${p.alpha * envelope})`
          : `rgba(217, 70, 239, ${p.alpha * envelope})`;
        ctx.shadowColor = isHumanSpeaking ? '#38bdf8' : '#e879f9';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
    };
  }, [speakerState]);

  const currentDialogue = DIALOGUES[activeDialogueIndex];

  return (
    <div className={`w-full max-w-xl flex flex-col space-y-3 ${className}`}>
      
      {/* Container Box with subtle ambient glow */}
      <div className="relative rounded-2xl bg-[#090f1d]/90 border border-zinc-800/80 p-5 shadow-2xl backdrop-blur-xl overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-12 inset-x-12 h-24 blur-3xl rounded-full transition-all duration-700 pointer-events-none ${
            speakerState === 'human'
              ? 'bg-cyan-500/15'
              : speakerState === 'ai'
              ? 'bg-purple-500/20'
              : 'bg-blue-500/10'
          }`}
        />

        {/* --- TOP ROW: SPEAKERS HEADER --- */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-zinc-800/60">
          
          {/* LEFT: HUMAN SPEAKER */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  speakerState === 'human'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#090f1d]'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <User className="w-5 h-5" />
              </div>

              {/* Pulsing indicator when Human is speaking */}
              {speakerState === 'human' && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-zinc-200">Customer</span>
              {speakerState === 'human' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-cyan-400">
                  <Mic className="w-3 h-3 animate-pulse" /> Speaking...
                  {/* Equalizer animation bars */}
                  <span className="flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-3 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-normal">
                  <Headphones className="w-3 h-3" /> Listening
                </span>
              )}
            </div>
          </div>

          {/* CENTER: REAL-TIME LATENCY / STREAM BADGE */}
          <div className="flex flex-col items-center">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all duration-300 ${
                speakerState === 'latency'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse'
                  : speakerState === 'human'
                  ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                  : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
              {speakerState === 'human' && 'Voice Stream ──▶'}
              {speakerState === 'latency' && '⚡ 280ms Latency'}
              {speakerState === 'ai' && '◀── AI Audio Stream'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
              {speakerState === 'latency' ? 'Speech Synthesis' : 'Bi-directional'}
            </span>
          </div>

          {/* RIGHT: AI AGENT SPEAKER */}
          <div className="flex items-center gap-3 flex-row-reverse text-right">
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  speakerState === 'ai'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 ring-2 ring-purple-400 ring-offset-2 ring-offset-[#090f1d]'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>

              {/* Pulsing indicator when AI is speaking */}
              {speakerState === 'ai' && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1">
                Samvada AI <Sparkles className="w-3 h-3 text-purple-400" />
              </span>
              {speakerState === 'ai' ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-purple-400">
                  {/* Equalizer animation bars */}
                  <span className="flex items-end gap-0.5 h-3 mr-0.5">
                    <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
                  </span>
                  Speaking... <Volume2 className="w-3 h-3 animate-pulse" />
                </span>
              ) : speakerState === 'latency' ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                  Processing...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 font-normal">
                  Listening <Headphones className="w-3 h-3" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- HUMAN SPEECH BUBBLE (SHOWN ON HUMAN TURN) --- */}
        <div className="pt-3">
          <div
            className={`transition-all duration-500 rounded-xl p-3 border ${
              speakerState === 'human'
                ? 'bg-cyan-950/20 border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'bg-zinc-900/40 border-zinc-800/40 opacity-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 pt-0.5">
                Human:
              </span>
              <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed">
                {currentDialogue.human}
              </p>
            </div>
          </div>
        </div>

        {/* --- CENTER 60FPS ANIMATED AUDIO SINE WAVE --- */}
        <div className="relative py-1">
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ height: '90px' }}
          />

          {/* Direction indicator dots */}
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-4 pointer-events-none text-[9px] text-zinc-500 font-mono">
            <span className={speakerState === 'human' ? 'text-cyan-400 font-medium' : 'text-zinc-600'}>
              Mic In
            </span>
            <span className="text-zinc-600 italic">
              {speakerState === 'human' && 'Transmitting human speech...'}
              {speakerState === 'latency' && '⚡ 280ms AI Turn-Taking'}
              {speakerState === 'ai' && 'AI voice synthesizing...'}
            </span>
            <span className={speakerState === 'ai' ? 'text-purple-400 font-medium' : 'text-zinc-600'}>
              Audio Out
            </span>
          </div>
        </div>

        {/* --- AI AGENT SPEECH BUBBLE (SHOWN ON AI TURN) --- */}
        <div className="pt-2">
          <div
            className={`transition-all duration-500 rounded-xl p-3 border ${
              speakerState === 'ai'
                ? 'bg-purple-950/25 border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'bg-zinc-900/40 border-zinc-800/40 opacity-50'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-purple-400 pt-0.5">
                Samvada AI:
              </span>
              <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed">
                {currentDialogue.ai}
              </p>
            </div>
          </div>
        </div>

        {/* --- BOTTOM QUICK TOPIC SWITCHER --- */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            Demo Scenario:
          </span>
          <div className="flex items-center gap-1.5">
            {DIALOGUES.map((d, idx) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActiveDialogueIndex(idx);
                  setSpeakerState('human');
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] transition-all font-medium ${
                  activeDialogueIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60'
                }`}
              >
                {d.topic}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Slogan under the container */}
      <p className="text-xs text-zinc-400 text-center font-normal italic select-none pt-1">
        &ldquo;More conversations, a brighter tomorrow&rdquo;
      </p>
    </div>
  );
};
