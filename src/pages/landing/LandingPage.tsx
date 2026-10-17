import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  Play,
  Pause,
  ArrowRight,
  Check,
  Globe2,
  ShieldCheck,
  Workflow,
  FlaskConical,
  Rocket,
  Layers,
  HeartPulse,
  Landmark,
  ShoppingBag,
  Plane,
  Clock,
  Volume2,
  BarChart3,
  Plug,
  Sparkles,
  Calendar,
  Package,
  User,
  GraduationCap,
  Building2,
  ChevronDown,
  Users
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getOnboardingRoute } from '../../utils/navigation';
import { LANDING_HOW_IT_WORKS, LANDING_TIMELINE } from '../../utils/constants';

/* ──────────────────────────────────────────────────────────────────────── */
/*  DATA                                                                    */
/* ──────────────────────────────────────────────────────────────────────── */

const INDUSTRIES = [
  {
    icon: <ShoppingBag className="w-4 h-4 text-pink-600" />,
    label: 'E-commerce & Retail',
    image: '/images/ecommerce.png',
    agentName: 'Maya',
    agentRole: 'Retail Concierge',
    agentAvatar: '/images/maya_avatar.jpg',
    accent: '#db2777',
    badgeBg: 'bg-pink-50',
    callerPrompt: 'Can I track the delivery status of order #94821?',
    agentReply: 'Your order is currently out for delivery and will arrive by 3:30 PM today. Would you like SMS updates?'
  },
  {
    icon: <Landmark className="w-4 h-4 text-blue-600" />,
    label: 'Banking & Financial Services',
    image: '/images/bank.png',
    agentName: 'Daniel',
    agentRole: 'Wealth Specialist',
    agentAvatar: '/images/daniel_avatar.jpg',
    accent: '#2563eb',
    badgeBg: 'bg-blue-50',
    callerPrompt: 'What is my current available balance on checking?',
    agentReply: 'Your checking balance is $4,820.50 after the recent deposit. Can I assist with a transfer or wire?'
  },
  {
    icon: <HeartPulse className="w-4 h-4 text-emerald-600" />,
    label: 'Healthcare',
    image: '/images/hospital.png',
    agentName: 'Dr. Priya',
    agentRole: 'Clinical Assistant',
    agentAvatar: '/images/priya_avatar.jpg',
    accent: '#059669',
    badgeBg: 'bg-emerald-50',
    callerPrompt: 'Can I schedule an appointment with Dr. Rao?',
    agentReply: 'I have an opening with Dr. Rao tomorrow at 10:15 AM or Thursday at 2:00 PM. Which works best for you?'
  },
  {
    icon: <Plane className="w-4 h-4 text-indigo-600" />,
    label: 'Travel & Hospitality',
    image: '/images/travel.png',
    agentName: 'Rohan',
    agentRole: 'Travel Concierge',
    agentAvatar: '/images/rohan_avatar.jpg',
    accent: '#4f46e5',
    badgeBg: 'bg-indigo-50',
    callerPrompt: 'My connecting flight was just delayed. Can I rebook?',
    agentReply: 'I have secured seat 12B on direct connection 618 departing in 45 minutes at gate B22. Mobile pass sent.'
  },
  {
    icon: <GraduationCap className="w-4 h-4 text-amber-600" />,
    label: 'Education',
    image: '/images/education.jpg',
    agentName: 'Sarah',
    agentRole: 'Campus Advisor',
    agentAvatar: '/images/hero_agent.jpg',
    accent: '#d97706',
    badgeBg: 'bg-amber-50',
    callerPrompt: 'When is the deadline for semester registration?',
    agentReply: 'Fall term registration closes this Friday at 5:00 PM. I can help verify your prerequisite credits.'
  },
  {
    icon: <Building2 className="w-4 h-4 text-sky-600" />,
    label: 'Real Estate',
    image: '/images/realestate.jpg',
    agentName: 'Daniel',
    agentRole: 'Property Consultant',
    agentAvatar: '/images/daniel_avatar.jpg',
    accent: '#0284c7',
    badgeBg: 'bg-sky-50',
    callerPrompt: 'Is the commercial penthouse suite still open for a tour?',
    agentReply: 'Yes, suite 4200 is available. I can book an exclusive walkthrough tomorrow at 11:00 AM or 3:00 PM.'
  }
];

const HOW_IT_WORKS_ICONS = [
  <Layers className="w-6 h-6" />,
  <FlaskConical className="w-6 h-6" />,
  <Rocket className="w-6 h-6" />
];

const HOW_IT_WORKS = LANDING_HOW_IT_WORKS.map((item, idx) => ({
  ...item,
  icon: HOW_IT_WORKS_ICONS[idx],
}));

const TIMELINE = LANDING_TIMELINE;

/* ──────────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                               */
/* ──────────────────────────────────────────────────────────────────────── */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [activeTimelineIdx, setActiveTimelineIdx] = useState(0);
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [isHeroSlideHovered, setIsHeroSlideHovered] = useState(false);
  const [isCallingAgent, setIsCallingAgent] = useState(false);

  // Auto-rotate hero curved rectangle images every 4.5 seconds
  useEffect(() => {
    if (isHeroSlideHovered || isCallingAgent) return;
    const interval = setInterval(() => {
      setHeroSlideIdx(prev => (prev + 1) % INDUSTRIES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHeroSlideHovered, isCallingAgent]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Audio Playback
  const speakText = (text: string, onFinish?: () => void) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.0;
    u.pitch = 1.05;
    u.onend = () => {
      if (onFinish) onFinish();
    };
    u.onerror = () => {
      if (onFinish) onFinish();
    };
    window.speechSynthesis.speak(u);
  };

  const currentAgent = INDUSTRIES[heroSlideIdx];

  const handleCallAgent = () => {
    if (isCallingAgent) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsCallingAgent(false);
      return;
    }

    setIsCallingAgent(true);
    speakText(
      `Hello! I am ${currentAgent.agentName} from Samvada voice intelligence. How can I assist you with ${currentAgent.label.split('&')[0].trim()} today?`,
      () => {
        setIsCallingAgent(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>

      {/* ─────────────── HEADER / NAVIGATION ─────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-18 bg-white/85 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo with Waveform Bars */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-[3px]">
              <span className="w-1 h-3.5 bg-blue-500 rounded-full group-hover:scale-y-125 transition-transform" />
              <span className="w-1 h-6 bg-indigo-600 rounded-full group-hover:scale-y-110 transition-transform" />
              <span className="w-1 h-4 bg-purple-500 rounded-full group-hover:scale-y-125 transition-transform" />
              <span className="w-1 h-7 bg-indigo-500 rounded-full group-hover:scale-y-110 transition-transform" />
              <span className="w-1 h-3 bg-blue-400 rounded-full group-hover:scale-y-125 transition-transform" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-950">Samvada</span>
          </Link>

          {/* Navigation Links with Chevrons */}
          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Product <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </a>
            <a href="#features" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Solutions <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Developers <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Resources <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </a>
            <a href="#footer" className="hover:text-gray-900 transition-colors flex items-center gap-1">
              Company <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <button
                onClick={() => navigate(getOnboardingRoute(user))}
                className="px-5 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-[#1e293b] transition-all shadow-sm"
              >
                Console →
              </button>
            ) : (
              <>
                
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-[#1e293b] flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Get started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────── HERO SECTION ─────────────── */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Copy & Actions (Col 7) */}
            <div className="lg:col-span-7 max-w-xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-[0.16em] mb-6 shadow-2xs">
                <span>AI VOICE AGENTS FOR MODERN BUSINESSES</span>
              </div>

              {/* Headline */}
              <h1 className="text-[46px] sm:text-[56px] lg:text-[62px] font-extrabold tracking-[-0.035em] text-[#0f172a] leading-[1.05]">
                Human-like<br />
                conversations.<br />
                <span className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent">
                  Real business impact.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-[16px] sm:text-[17px] text-gray-500 leading-relaxed max-w-lg">
                Samvada helps businesses deploy AI voice agents that speak naturally, understand intent, take actions across your tools, and seamlessly handoff to humans when needed.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/login"
                  className="px-7 py-3.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <span>Build your voice agent</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#pricing"
                  className="px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold border border-gray-200/90 shadow-2xs transition-all"
                >
                  Talk to us
                </a>
              </div>

              {/* Trust Checkmarks */}
              <div className="mt-8 pt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Natural, human-like conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Integrates with your tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Production ready</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with Clean Curved Rectangle & Dynamic Calling Pill Button (Col 5) */}
            <div className="lg:col-span-5 relative flex items-center justify-center select-none pt-4 lg:pt-0">
              <div className="relative w-full max-w-[540px]">

                {/* Curved Rectangle Display Container */}
                <div
                  className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group"
                  onMouseEnter={() => setIsHeroSlideHovered(true)}
                  onMouseLeave={() => setIsHeroSlideHovered(false)}
                >
                  {/* Cycling images from public/images */}
                  {INDUSTRIES.map((ind, i) => (
                    <img
                      key={i}
                      src={ind.image}
                      alt={ind.label}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                        i === heroSlideIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                      }`}
                    />
                  ))}

                  {/* Gradient Overlay for rich contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35 pointer-events-none" />

                  {/* Slide Indicator Pill (Top Left of image) */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                    <div className="flex items-center gap-1.5">
                      {INDUSTRIES.map((ind, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroSlideIdx(i)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === heroSlideIdx ? 'w-5 bg-indigo-400' : 'w-1.5 bg-white/40 hover:bg-white/80'
                          }`}
                          title={`${ind.label} (${ind.agentName})`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-medium text-white/90 pl-1 border-l border-white/20">
                      {INDUSTRIES[heroSlideIdx].label}
                    </span>
                  </div>

                  {/* Dynamic Agent Calling Pill Button (Bottom Right) */}
                  <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20">
                    <div className="bg-stone-900/65 hover:bg-stone-900/80 backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5)] rounded-full pl-3 pr-2 py-1.5 sm:pl-3.5 sm:pr-2.5 sm:py-2 flex items-center gap-3 transition-all">
                      {/* Current Agent Avatar */}
                      <div className="relative">
                        <img
                          src={INDUSTRIES[heroSlideIdx].agentAvatar}
                          alt={INDUSTRIES[heroSlideIdx].agentName}
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white/40 shadow-sm shrink-0 transition-all duration-500"
                        />
                        {isCallingAgent && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900 animate-pulse" />
                        )}
                      </div>

                      {/* Dynamic Agent Name & Role */}
                      <div className="text-left pr-1 sm:pr-2 select-none">
                        <div className="text-[13px] sm:text-[14px] font-semibold text-white leading-tight transition-all">
                          {isCallingAgent ? `Speaking to ${INDUSTRIES[heroSlideIdx].agentName}` : `Talk to ${INDUSTRIES[heroSlideIdx].agentName}`}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-stone-300 font-normal leading-tight mt-0.5">
                          {INDUSTRIES[heroSlideIdx].agentRole}
                        </div>
                      </div>

                      {/* Phone Call / Hangup Button */}
                      <button
                        onClick={handleCallAgent}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 shrink-0 ${
                          isCallingAgent ? 'bg-red-500 text-white' : 'bg-white text-slate-950'
                        }`}
                        title={isCallingAgent ? `End call with ${INDUSTRIES[heroSlideIdx].agentName}` : `Call ${INDUSTRIES[heroSlideIdx].agentName}`}
                      >
                        <Phone className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ${isCallingAgent ? 'rotate-[135deg]' : ''} transition-transform`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ─────────────── 4-COLUMN FEATURE HIGHLIGHT STRIP ─────────────── */}
      <section id="features" className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

            {/* Col 1: Natural Conversations */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4 first:pl-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <div className="flex items-center gap-[2.5px]">
                  <span className="w-[2.5px] h-3 bg-indigo-600 rounded-full" />
                  <span className="w-[2.5px] h-6 bg-indigo-500 rounded-full" />
                  <span className="w-[2.5px] h-4 bg-indigo-600 rounded-full" />
                  <span className="w-[2.5px] h-2 bg-indigo-400 rounded-full" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Natural Conversations</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Human-like, multilingual voice with low latency.
                </p>
              </div>
            </div>

            {/* Col 2: Takes Real Actions */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Workflow className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Takes Real Actions</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Integrates with your tools, APIs and workflows.
                </p>
              </div>
            </div>

            {/* Col 3: Human Handoff */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Human Handoff</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Seamless transfer to your team when needed.
                </p>
              </div>
            </div>

            {/* Col 4: Analytics & Insights */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Analytics & Insights</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Monitor performance and improve over time.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS: 3-STEP FLOW ─────────────── */}
      <section id="how-it-works" className="py-24 bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-600 font-bold mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#0f172a]">
              Three steps to your first live agent
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item, idx) => (
              <div
                key={idx}
                className="group relative p-8 rounded-2xl bg-white border border-gray-200/90 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-[80px] font-black text-gray-100 leading-none absolute top-4 right-6 select-none group-hover:text-indigo-50 transition-colors">
                  {item.step}
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center mb-5 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── BENTO GRID: CAPABILITIES ─────────────── */}
      <section id="platform" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-600 font-bold mb-3">Platform</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#0f172a]">
              Built for production enterprise scale
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Large Card: Low Latency */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0f172a] text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <Clock className="w-4 h-4" />
                  Conversational voice experiences
                </div>
                <h3 className="text-2xl font-bold mb-2">Natural, responsive conversations</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                  Response times depend on your model, provider, network, and configuration. Tune each agent for your workflow.
                </p>
              </div>
            </div>

            {/* Small Card: Multilingual */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/90 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0f172a] mb-1">Multiple languages and voices</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Choose from the languages and voices supported by your connected providers.
              </p>
            </div>

            {/* Small Card: Accuracy */}
            <div className="p-6 rounded-3xl bg-white border border-gray-200/90 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0f172a] mb-1">Configure agent safeguards</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set clear instructions and review agent behavior before using it with customers.
              </p>
            </div>

            {/* Large Card: Integrations */}
            <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-gray-200/90 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Plug className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">Connects to your existing stack</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    Works seamlessly with Salesforce, HubSpot, Twilio, Slack, Google Workspace, Epic, and 50+ business systems out of the box.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Salesforce', 'HubSpot', 'Twilio', 'Slack', 'Zapier', 'Google Workspace', 'Shopify', 'Zendesk'].map((name) => (
                      <span key={name} className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── DEPLOYMENT TIMELINE ─────────────── */}
      <section className="py-24 bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="lg:sticky lg:top-32">
              <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-600 font-bold mb-3">Deployment</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#0f172a] mb-4">
                Live in 30 days.<br />
                Not 6 months.
              </h2>
              <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                Our platform and enterprise engineers handle discovery, configuration, test simulations, and launch.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Start your deployment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative pl-8">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />
              <div className="space-y-6">
                {TIMELINE.map((step, idx) => {
                  const isActive = idx === activeTimelineIdx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTimelineIdx(idx)}
                      className={`relative w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? 'bg-white border border-indigo-200 shadow-md ring-1 ring-indigo-500/10'
                          : 'hover:bg-white/60'
                      }`}
                    >
                      <div
                        className={`absolute -left-5 top-6 w-3 h-3 rounded-full border-2 transition-colors ${
                          isActive ? 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">{step.day}</div>
                      <h3 className={`text-base font-bold mb-1 transition-colors ${isActive ? 'text-[#0f172a]' : 'text-gray-700'}`}>
                        {step.title}
                      </h3>
                      {isActive && (
                        <p className="text-sm text-gray-500 leading-relaxed mt-1 animate-in fade-in">
                          {step.desc}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── PRICING ─────────────── */}
      <section id="pricing" className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-600 font-bold mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#0f172a]">
              Start free, scale with confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Tier */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200/90 hover:shadow-xl transition-shadow">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Starter</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-[#0f172a]">$0</span>
                <span className="text-sm text-gray-400">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">$10 in free test credits. No card required.</p>

              <Link
                to="/login"
                className="block w-full py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#0f172a] text-sm font-semibold text-center transition-colors mb-6"
              >
                Get started free
              </Link>

              <ul className="space-y-3 text-sm text-gray-600">
                {['Full visual agent designer', 'Call analytics & transcripts', 'Simulation testing harness', '20 concurrent calls', '10 knowledge base documents'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-3xl bg-[#0f172a] text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2">Enterprise</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">Dedicated cloud infrastructure & white-glove onboarding.</p>

                <a
                  href="#footer"
                  className="block w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold text-center transition-colors mb-6 shadow-md"
                >
                  Talk to sales
                </a>

                <ul className="space-y-3 text-sm text-gray-300">
                  {['Deployment and capacity planning', 'API and webhook requirements review', 'Security and privacy review', 'Contract, SLA, and support options discussed with sales'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer id="footer" className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-[3px]">
                  <span className="w-1 h-3 bg-blue-500 rounded-full" />
                  <span className="w-1 h-5 bg-indigo-600 rounded-full" />
                  <span className="w-1 h-3.5 bg-purple-500 rounded-full" />
                  <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                  <span className="w-1 h-2.5 bg-blue-400 rounded-full" />
                </div>
                <span className="text-base font-bold text-[#0f172a]">Samvada</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Autonomous voice intelligence for modern businesses and customer operations.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div><a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a></div>
                <div><a href="#platform" className="hover:text-indigo-600 transition-colors">Features</a></div>
                <div><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></div>
                <div><a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Solutions</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div><a href="#features" className="hover:text-indigo-600 transition-colors">E-commerce & Retail</a></div>
                <div><a href="#features" className="hover:text-indigo-600 transition-colors">Banking & Finance</a></div>
                <div><a href="#features" className="hover:text-indigo-600 transition-colors">Healthcare</a></div>
                <div><a href="#features" className="hover:text-indigo-600 transition-colors">Travel & Hospitality</a></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Company</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div><Link to="/login" className="hover:text-indigo-600 transition-colors">Get started</Link></div>
                <div><a href="#pricing" className="hover:text-indigo-600 transition-colors">Contact sales</a></div>
                <div><a href="#" className="hover:text-indigo-600 transition-colors">Privacy policy</a></div>
                <div><a href="#" className="hover:text-indigo-600 transition-colors">Terms of service</a></div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <span>&copy; {new Date().getFullYear()} Samvada AI Technologies, Inc. All rights reserved.</span>
            <div className="flex items-center gap-5">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">𝕏</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">LinkedIn</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">YouTube</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
