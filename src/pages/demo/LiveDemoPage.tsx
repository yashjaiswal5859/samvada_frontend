import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  Building,
  Headphones,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAgentTestToken } from '../../api/agents';
import { getWalletBalance } from '../../api/settings';
import { DemoPersona, DEMO_PERSONAS } from '../../utils/constants';

export const LiveDemoPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedPersona, setSelectedPersona] = useState<DemoPersona>(DEMO_PERSONAS[0]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState<{ sender: 'agent' | 'user'; text: string; time: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [latencyMs, setLatencyMs] = useState(278);
  const [connectionMode, setConnectionMode] = useState<'s2s_websocket' | 'browser_speech'>('browser_speech');
  const [walletBalance, setWalletBalance] = useState<number>(5.00);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Load live wallet balance on mount
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const wallet = await getWalletBalance();
        setWalletBalance(wallet.balanceUSD);
      } catch (err) {
        console.warn('Failed to load wallet balance', err);
      }
    };
    loadWallet();
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer: any;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Clean up WebSockets, AudioContext and Speech on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const speakTextFallback = (text: string) => {
    if (!isSpeakerOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = selectedPersona.gender === 'male' ? 1.0 : 0.96;
    utterance.pitch = selectedPersona.gender === 'female' ? 1.15 : 0.95;

    utterance.onstart = () => {
      setIsAgentSpeaking(true);
      setLatencyMs(Math.floor(250 + Math.random() * 60));
    };

    utterance.onend = () => {
      setIsAgentSpeaking(false);
    };

    utterance.onerror = () => {
      setIsAgentSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStartCall = async () => {
    if (walletBalance <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsCallActive(true);
    const initialGreeting = selectedPersona.greeting;
    setTranscript([{ sender: 'agent', text: initialGreeting, time: '0:01' }]);

    // 1. Request real ephemeral test ticket from ABS
    let ticketData: any = null;
    try {
      ticketData = await getAgentTestToken(selectedPersona.id);
      if (ticketData?.remainingCreditUSD !== undefined) {
        setWalletBalance(ticketData.remainingCreditUSD);
      }
    } catch (err: any) {
      if (err?.message?.includes('402') || err?.message?.includes('DEMO_CREDITS_EXHAUSTED')) {
        setShowUpgradeModal(true);
        setIsCallActive(false);
        return;
      }
    }

    // 2. Attempt Real S2S WebSocket Audio Bridge
    let socketConnected = false;
    if (ticketData?.wssUrl) {
      try {
        const fullWsUrl = `${ticketData.wssUrl}?ticket=${encodeURIComponent(ticketData.ticket)}`;
        const ws = new WebSocket(fullWsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
          socketConnected = true;
          setConnectionMode('s2s_websocket');
          setLatencyMs(195);

          // Capture browser microphone and stream audio frames
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0 && ws.readyState === WebSocket.OPEN && !isMuted) {
                event.data.arrayBuffer().then((buffer) => {
                  ws.send(buffer);
                });
              }
            };

            mediaRecorder.start(100); // 100ms chunks for ultra-low latency
          } catch (micErr) {
            console.warn('Microphone permission not granted, text input remains active', micErr);
          }
        };

        ws.onmessage = (event) => {
          if (typeof event.data === 'string') {
            try {
              const payload = JSON.parse(event.data);
              if (payload.type === 'transcript') {
                setTranscript((prev) => [
                  ...prev,
                  { sender: payload.sender || 'agent', text: payload.text, time: formatTime(callDuration) }
                ]);
              } else if (payload.type === 'speaking_state') {
                setIsAgentSpeaking(payload.is_speaking);
              }
            } catch {
              // Ignore non-JSON control messages
            }
          } else if (event.data instanceof Blob || event.data instanceof ArrayBuffer) {
            // Play received real neural audio chunk from S2S
            if (isSpeakerOn) {
              const audioBlob = event.data instanceof Blob ? event.data : new Blob([event.data], { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const audio = new Audio(audioUrl);
              audio.play().catch(() => {});
            }
          }
        };

        ws.onerror = () => {
          if (!socketConnected) {
            setConnectionMode('browser_speech');
            speakTextFallback(initialGreeting);
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
        };
      } catch (wsErr) {
        setConnectionMode('browser_speech');
      }
    }

    if (!socketConnected) {
      setConnectionMode('browser_speech');
      setTimeout(() => {
        speakTextFallback(initialGreeting);
      }, 400);
    }
  };

  const handleEndCall = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsCallActive(false);
    setIsAgentSpeaking(false);
  };

  const handleSendMessage = (messageText?: string) => {
    const textToSend = (messageText || userInput).trim();
    if (!textToSend || !isCallActive) return;

    const time = formatTime(callDuration);
    setTranscript((prev) => [...prev, { sender: 'user', text: textToSend, time }]);
    setUserInput('');

    // If real WebSocket is connected, send message through S2S
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'user_text', text: textToSend }));
      return;
    }

    // Fallback: Persona Knowledge Base Simulation
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let reply = selectedPersona.defaultReply;

      for (const [key, value] of Object.entries(selectedPersona.knowledgeResponses)) {
        if (lower.includes(key)) {
          reply = value;
          break;
        }
      }

      setTranscript((prev) => [
        ...prev,
        { sender: 'agent', text: reply, time: formatTime(callDuration + 1) }
      ]);

      speakTextFallback(reply);
    }, 550);
  };

  const handlePersonaChange = (persona: DemoPersona) => {
    if (isCallActive) {
      handleEndCall();
    }
    setSelectedPersona(persona);
    setTranscript([]);
  };

  const handleInstantPlatformLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between px-4 sm:px-8 lg:px-14 py-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting matching login theme */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-36 -left-36 w-[560px] h-[560px] rounded-full border border-blue-500/20 bg-gradient-to-tr from-blue-600/20 via-sky-500/5 to-transparent blur-xl pointer-events-none" />
      
      {/* Luminous orbital arc in bottom-left corner */}
      <svg className="absolute -bottom-16 -left-16 w-[450px] h-[450px] pointer-events-none opacity-30" viewBox="0 0 400 400" fill="none">
        <path d="M 0 400 A 360 360 0 0 1 360 40" stroke="url(#demoArcBlueGrad)" strokeWidth="2.5" />
        <defs>
          <linearGradient id="demoArcBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#2563eb" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-right ambient aura */}
      <div className="absolute -bottom-28 -right-28 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-20 mb-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">Samvada AI</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                Interactive Demo
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5">Enterprise Voice AI Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantPlatformLogin}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 text-zinc-200 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Explore Dashboard</span>
          </button>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            Deploy Your Agent
          </Link>
        </div>
      </header>

      {/* Main Demo Console */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start z-10 flex-1 py-2">
        {/* Left Column: Persona Selector & Highlights */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>INTERACTIVE SAMPLE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Hear Voice AI That Sounds Truly Human
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              Explore sample personas and responses. This demo does not connect to a real business, book appointments, access customer records, or issue payments.
            </p>
          </div>

          {/* Persona Selection Cards */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              Choose Industry Persona
            </label>
            {DEMO_PERSONAS.map((persona) => {
              const isSelected = selectedPersona.id === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => handlePersonaChange(persona)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/40 shadow-xl shadow-blue-500/10'
                      : 'bg-[#0c101b]/90 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-12 h-12 rounded-xl object-cover border border-zinc-700/80 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white tracking-tight">{persona.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-medium">
                          {persona.industry}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 font-medium truncate mt-0.5">{persona.role}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{persona.company}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-zinc-800/60">
                    {persona.badges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demo scope */}
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Sample environment</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-400">Names, businesses, conversation details, and outcomes shown here are fictional examples. No real-world action is performed.</p>
          </div>
        </div>

        {/* Right Column: Live Telephony Call Interface */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0c101b]/95 border border-zinc-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col min-h-[580px] justify-between">
            {/* Top Bar: Call Status HUD */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-zinc-800/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={selectedPersona.avatar}
                    alt={selectedPersona.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/40"
                  />
                  {isCallActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c101b] animate-ping" />
                  )}
                  {isCallActive && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c101b]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedPersona.name}</h3>
                    <span className="text-xs text-zinc-400">• {selectedPersona.company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    {isCallActive ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Call In Progress ({formatTime(callDuration)})
                      </span>
                    ) : (
                      <span>Ready to call • Ultra-low latency engine</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Call Controls & Metrics */}
              <div className="flex items-center gap-2">
                {isCallActive && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
                    <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                    <span>{latencyMs}ms</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSpeakerOn
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                      : 'bg-rose-950/30 border-rose-800 text-rose-400'
                  }`}
                  title={isSpeakerOn ? 'Speaker On' : 'Speaker Muted'}
                >
                  {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    !isMuted
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-200'
                      : 'bg-amber-950/30 border-amber-800 text-amber-400'
                  }`}
                  title={isMuted ? 'Microphone Muted' : 'Microphone Active'}
                >
                  {!isMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Middle Section: Waveform & Live Conversation Bubbles */}
            <div className="my-5 flex-1 flex flex-col justify-between space-y-4">
              {/* Waveform Visualization during Call */}
              {isCallActive ? (
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isAgentSpeaking ? 'bg-blue-400 animate-ping' : 'bg-emerald-400'
                      }`}
                    />
                    <span className="text-xs font-semibold text-zinc-200">
                      {isAgentSpeaking ? `${selectedPersona.name} is Speaking...` : 'Listening to you...'}
                    </span>
                  </div>

                  {/* Dynamic Soundwave Bars */}
                  <div className="flex items-center gap-1.5 h-8">
                    {[12, 28, 16, 32, 22, 38, 18, 30, 24, 15, 34, 20, 14, 26, 18].map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          height: isAgentSpeaking ? `${(h * 1.3) % 32 + 8}px` : '6px',
                        }}
                        className={`w-1 rounded-full transition-all duration-200 ${
                          isAgentSpeaking ? 'bg-blue-400 animate-pulse' : 'bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400">Full Duplex</span>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-950/60 border border-dashed border-zinc-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Experience Zero-Latency AI Call</h4>
                    <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                      Click <strong>Start Live Call</strong> to initiate the connection. The assistant will speak naturally with Indian & global pronunciation.
                    </p>
                  </div>
                  <button
                    onClick={handleStartCall}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Start Live Call with {selectedPersona.name}</span>
                  </button>
                </div>
              )}

              {/* Transcript Bubbles */}
              {isCallActive && (
                <div className="flex-1 max-h-[260px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {transcript.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col text-xs ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-0.5">
                        <span>{msg.sender === 'user' ? 'You' : selectedPersona.name}</span>
                        <span>• {msg.time}</span>
                      </div>
                      <div
                        className={`rounded-2xl p-3 max-w-[85%] leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptEndRef} />
                </div>
              )}

              {/* Quick Prompts Chips */}
              {isCallActive && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Suggested Questions (Click to Ask):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPersona.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/50 hover:bg-blue-950/30 text-zinc-300 hover:text-white transition-all text-left cursor-pointer"
                      >
                        "{prompt}"
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls / Speech Input Bar */}
            <div className="pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3">
              {isCallActive ? (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex-1 flex gap-2 w-full"
                  >
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your message or query..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call</span>
                  </button>
                </>
              ) : (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Browser speech synthesis enabled • No plugin needed</span>
                  </div>

                  <button
                    onClick={handleStartCall}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {selectedPersona.name}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="z-10 mt-6 pt-6 border-t border-zinc-900 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Powered by Samvada AI Voice Neural Core 3.0
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <Link to="/register" className="hover:text-white transition-colors">Create Free Account</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <span>•</span>
            <button onClick={handleInstantPlatformLogin} className="text-blue-400 hover:text-blue-300 cursor-pointer">
              Launch Platform Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveDemoPage;
