import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  Mail,
  Building,
  Phone,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  Play,
  Pause,
  Volume2,
  Check,
  CheckCircle2,
  TrendingUp,
  Headphones,
  Calendar,
  PhoneCall,
  ClipboardList,
  Users,
  Pencil,
  Globe,
  Sparkles,
  Zap,
  ShieldCheck,
  Activity,
  LogOut
} from 'lucide-react';

export const OnboardingWizardPage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  // Wizard current step: 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [phone, setPhone] = useState('');

  // Step 2: Use Case
  const [selectedUseCase, setSelectedUseCase] = useState('sales');
  const [useCaseNotes, setUseCaseNotes] = useState('');

  // Step 3: Voice & Language
  const [language, setLanguage] = useState('en-IN');
  const [selectedVoice, setSelectedVoice] = useState('aarav');
  const [speakingStyle, setSpeakingStyle] = useState('balanced');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Step 4: Integrations (optional)
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(['webhooks']);

  const stepsList = [
    { num: 1, title: 'Get started', desc: 'Basic information' },
    { num: 2, title: 'Set up workspace', desc: 'Tell us about your use case' },
    { num: 3, title: 'Choose voice', desc: 'Select language and voice' },
    { num: 4, title: 'Integrate (optional)', desc: 'Connect your tools' },
    { num: 5, title: 'Launch', desc: "You're all set!" },
  ];

  const useCases = [
    {
      id: 'sales',
      title: 'Sales & Lead Generation',
      desc: 'Qualify leads, book meetings and drive revenue.',
      icon: TrendingUp,
    },
    {
      id: 'support',
      title: 'Customer Support',
      desc: 'Handle customer queries, resolve issues and improve CSAT.',
      icon: Headphones,
    },
    {
      id: 'appointment',
      title: 'Appointment Booking',
      desc: 'Schedule appointments, reminders and follow-ups.',
      icon: Calendar,
    },
    {
      id: 'inbound',
      title: 'Inbound Call Handling',
      desc: 'Answer calls, route enquiries and capture information.',
      icon: PhoneCall,
    },
    {
      id: 'surveys',
      title: 'Surveys & Feedback',
      desc: 'Collect feedback, run surveys and analyze insights.',
      icon: ClipboardList,
    },
    {
      id: 'operations',
      title: 'Internal Operations',
      desc: 'Automate internal calls and workflows.',
      icon: Users,
    },
  ];

  const languages = [
    { id: 'en-IN', name: '🇮🇳 English (India)', desc: 'Indian accent & nuances' },
    { id: 'hi-IN', name: '🇮🇳 Hindi (हिन्दी)', desc: 'Pure conversational Hindi' },
    { id: 'hinglish', name: '🇮🇳 Hinglish', desc: 'Bilingual Hindi-English mix' },
    { id: 'en-US', name: '🇺🇸 English (US)', desc: 'Standard North American' },
    { id: 'ta-IN', name: '🇮🇳 Tamil (தமிழ்)', desc: 'Regional South Indian' },
  ];

  const voices = [
    { id: 'aarav', name: 'Aarav', gender: 'Male', tone: 'Natural' },
    { id: 'diya', name: 'Diya', gender: 'Female', tone: 'Warm' },
    { id: 'kabir', name: 'Kabir', gender: 'Male', tone: 'Professional' },
    { id: 'meera', name: 'Meera', gender: 'Female', tone: 'Friendly' },
    { id: 'rohan', name: 'Rohan', gender: 'Male', tone: 'Energetic' },
    { id: 'priya', name: 'Priya', gender: 'Female', tone: 'Calm' },
  ];

  const styles = [
    { id: 'balanced', name: 'Balanced', desc: 'Natural and versatile' },
    { id: 'professional', name: 'Professional', desc: 'Formal and clear' },
    { id: 'friendly', name: 'Friendly', desc: 'Warm and engaging' },
    { id: 'energetic', name: 'Energetic', desc: 'Upbeat and lively' },
  ];

  const playVoiceSample = (targetVoiceId?: string) => {
    const vId = targetVoiceId || selectedVoice;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingAudio(!isPlayingAudio);
      return;
    }

    window.speechSynthesis.cancel();
    if (isPlayingAudio && !targetVoiceId) {
      setIsPlayingAudio(false);
      return;
    }

    const currentVoiceObj = voices.find((v) => v.id === vId);
    let sampleText = `Hello! I am ${currentVoiceObj?.name || 'Aarav'}. I can handle customer calls with sub-second latency for ${companyName || 'your enterprise'}.`;
    if (language === 'hi-IN') {
      sampleText = `Namaste! Main ${currentVoiceObj?.name || 'Aarav'} hoon. Main aapke grahako ki sahayata karne ke liye taiyaar hoon.`;
    }

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = speakingStyle === 'energetic' ? 1.05 : 0.95;
    utterance.pitch = currentVoiceObj?.gender === 'Female' ? 1.15 : 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleFinish = async () => {
    const primaryUseCase = useCases.find((u) => u.id === selectedUseCase);
    const selectedVoiceObj = voices.find((v) => v.id === selectedVoice);
    const selectedStyleObj = styles.find((s) => s.id === speakingStyle);
    const selectedLangObj = languages.find((l) => l.id === language);

    const starterAgent = {
      id: `agent-custom-${Date.now()}`,
      workspaceId: 'ws-consumer-care',
      name: `${companyName || 'Enterprise'} ${primaryUseCase?.title.split(' ')[0] || 'AI'} Specialist`,
      isPrimary: true,
      avatar: selectedVoiceObj?.gender === 'Female'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      description: primaryUseCase?.desc || 'AI Voice Agent customized during onboarding.',
      tags: [primaryUseCase?.title.split(' ')[0] || 'AI', 'Voice', 'Inbound'],
      language: selectedLangObj?.name.replace(/^[^\s]+\s/, '') || 'English (India)',
      voice: `${selectedVoiceObj?.name || 'Aarav'} (${selectedStyleObj?.name || 'Natural'})`,
      calls: '0',
      conversion: '0%',
      avgDuration: '0s',
      isActive: true,
      model: 'GPT-4o Voice Engine',
      kb: 'Connected Workspace Knowledge',
      integrations: selectedIntegrations.join(', '),
      createdAt: 'Just now by ' + (fullName || 'You'),
      updatedAt: 'Just now',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('samvada_custom_agents') || '[]');
      localStorage.setItem('samvada_custom_agents', JSON.stringify([starterAgent, ...existing]));
    } catch (e) {
      console.error(e);
    }

    await refreshUser();
    navigate('/agents');
  };

  const toggleAudio = () => {
    playVoiceSample();
  };

  const toggleIntegration = (id: string) => {
    if (selectedIntegrations.includes(id)) {
      setSelectedIntegrations(selectedIntegrations.filter((i) => i !== id));
    } else {
      setSelectedIntegrations([...selectedIntegrations, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between px-6 lg:px-14 py-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header */}
      <header className="flex items-center justify-between z-20 mb-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center gap-1 shadow-lg shadow-blue-500/10">
            <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-1 h-6 bg-blue-400 rounded-full" />
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            <div className="w-1 h-2 bg-blue-600 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">Samvada</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-none mt-0.5">Voice AI for a more human world</p>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-white transition-colors">
            <span>Need help?</span>
            <MessageSquare className="w-4 h-4" />
          </div>

          {/* Profile Dropdown Container */}
          <div className="relative pl-3 border-l border-zinc-800" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 cursor-pointer group focus:outline-none select-none"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                {(fullName || user?.displayName || 'User').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight group-hover:text-blue-400 transition-colors">
                  {fullName || user?.displayName || 'New User'}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {companyName || user?.companyName || 'My Workspace'}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform duration-200 ${
                  isProfileOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#0c101b] border border-zinc-800/90 rounded-2xl p-2.5 shadow-2xl space-y-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
                {/* User Identity Header */}
                <div className="px-3 py-2.5 border-b border-zinc-800/80 mb-1 bg-zinc-950/40 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white text-xs truncate">
                      {fullName || user?.displayName || 'User'}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Step {currentStep} of 5
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono truncate">
                    {user?.email || email || 'user@samvada.ai'}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="px-3 py-2 text-[11px] text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Onboarding in progress</span>
                </div>

                {/* Logout Button */}
                <div className="border-t border-zinc-800/80 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 z-10 max-w-7xl mx-auto w-full py-2">
        {/* Left Column: 5-Step Stepper & Graphic */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-2">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => step.num < currentStep && setCurrentStep(step.num)}
                  className={`flex items-start gap-3.5 p-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-950/40 border border-blue-500/30 text-white'
                      : isCompleted
                      ? 'opacity-80 hover:opacity-100 text-zinc-300'
                      : 'opacity-40 text-zinc-500'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : isCompleted
                        ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Wave Graphic & Tagline */}
          <div className="pt-6 hidden lg:block">
            <div className="h-14 w-full relative overflow-hidden flex items-center">
              <svg className="w-full h-12 text-blue-500/50" viewBox="0 0 300 60" fill="none">
                <path
                  d="M0,30 Q30,5 60,30 T120,30 T180,30 T240,30 T300,30"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M0,30 Q45,55 90,30 T180,30 T270,30 T300,30"
                  stroke="#38bdf8"
                  strokeWidth="1"
                  opacity="0.6"
                  fill="none"
                />
              </svg>
            </div>
            <p className="font-serif italic text-blue-300 text-xs tracking-wide">
              "More conversations, A brighter tomorrow"
            </p>
          </div>
        </div>

        {/* Center Column: Step Content Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="w-full bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Step Progress bar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-zinc-400 font-medium">Step {currentStep} of 5</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`w-6 h-1 rounded-full transition-all ${
                      s <= currentStep ? 'bg-blue-600' : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Let's get started</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Tell us a few details to set up your Samvada workspace.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Full name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Work email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Company name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Health"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Phone number <span className="text-zinc-500">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 shrink-0">
                        <span>🇮🇳 +91</span>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-4 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  By continuing, you agree to our{' '}
                  <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and{' '}
                  <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
                </p>
              </div>
            )}

            {/* STEP 2: Workspace / Use Case */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">What will you use Samvada for?</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Choose the primary use case for your voice agents.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {useCases.map((uc) => {
                    const isSel = selectedUseCase === uc.id;
                    const Icon = uc.icon;

                    return (
                      <div
                        key={uc.id}
                        onClick={() => setSelectedUseCase(uc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSel
                            ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50'
                            : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSel ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <input
                            type="radio"
                            name="onboardingUseCase"
                            checked={isSel}
                            readOnly
                            className="radio-white pointer-events-none"
                          />
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-tight">{uc.title}</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">{uc.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Tell us more <span className="text-zinc-500">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={useCaseNotes}
                    onChange={(e) => setUseCaseNotes(e.target.value.slice(0, 300))}
                    placeholder="e.g. We want to use Samvada to qualify real estate leads and book site visits..."
                    className="w-full p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                  <span className="text-[10px] text-zinc-500 text-right block">{useCaseNotes.length}/300</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Choose Voice & Style */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Choose your agent's voice</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Select the language, voice and style that fits your use case.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Language</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {languages.map((l) => {
                        const isSel = language === l.id;
                        return (
                          <div
                            key={l.id}
                            onClick={() => setLanguage(l.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isSel
                                ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/50'
                                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <h5 className="text-xs font-semibold text-white">{l.name}</h5>
                            <p className="text-[10px] text-zinc-400 mt-0.5">{l.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-zinc-300">Voice</label>
                      <button
                        type="button"
                        onClick={toggleAudio}
                        className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        <Volume2 className="w-3 h-3 text-blue-400" /> Preview all
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {voices.map((v) => {
                        const isSel = selectedVoice === v.id;

                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                              isSel
                                ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/50'
                                : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVoice(v.id);
                                  toggleAudio();
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isSel ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                              </button>
                              <input
                                type="radio"
                                name="onboardingVoice"
                                checked={isSel}
                                readOnly
                                className="radio-white pointer-events-none"
                              />
                            </div>
                            <h4 className="text-xs font-semibold text-white">{v.name}</h4>
                            <p className="text-[10px] text-zinc-400">{v.gender} • {v.tone}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">Speaking style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {styles.map((s) => {
                        const isSel = speakingStyle === s.id;

                        return (
                          <div
                            key={s.id}
                            onClick={() => setSpeakingStyle(s.id)}
                            className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                              isSel
                                ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/50'
                                : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mb-1 opacity-80" />
                            <h5 className="text-[11px] font-semibold text-white">{s.name}</h5>
                            <p className="text-[9px] text-zinc-400 mt-0.5">{s.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Integrate (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Connect your tools</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Connect Samvada with your CRM or telephony provider (can be configured later).
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { id: 'hubspot', name: 'HubSpot CRM', desc: 'Sync contacts and call logs' },
                    { id: 'salesforce', name: 'Salesforce', desc: 'Enterprise lead & opportunity sync' },
                    { id: 'webhooks', name: 'Custom Webhooks', desc: 'Real-time JSON event notifications' },
                    { id: 'telephony', name: 'Twilio / Exotel', desc: 'Bring your own phone numbers' },
                  ].map((int) => {
                    const isChecked = selectedIntegrations.includes(int.id);

                    return (
                      <div
                        key={int.id}
                        onClick={() => toggleIntegration(int.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/40'
                            : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-semibold text-white">{int.name}</h4>
                          <p className="text-[10px] text-zinc-400 mt-0.5">{int.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="flex-[2] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/25 transition-all"
                  >
                    <span>Continue to Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Launch / All Set */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    You're all set! 🎉
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Your Samvada workspace is ready. Here's a quick summary of your setup.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">Workspace</p>
                        <h4 className="text-xs font-semibold text-white">{companyName || 'My Workspace'}</h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">Primary use case</p>
                        <h4 className="text-xs font-semibold text-white">
                          {useCases.find((u) => u.id === selectedUseCase)?.title || 'Sales & Lead Generation'}
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">Language</p>
                        <h4 className="text-xs font-semibold text-white">
                          {languages.find((l) => l.id === language)?.name || '🇮🇳 English (India)'}
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-400">Voice</p>
                        <h4 className="text-xs font-semibold text-white">
                          {voices.find((v) => v.id === selectedVoice)?.name} ({voices.find((v) => v.id === selectedVoice)?.gender}) • {styles.find((s) => s.id === speakingStyle)?.name}
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <span>Launch Agent & Open Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  You can always change these settings later from your workspace settings.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Showcase / Preview Card matching designs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-5">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                {currentStep === 1
                  ? 'BUILD. DEPLOY. SCALE.'
                  : currentStep === 2
                  ? 'TURN CONVERSATIONS INTO OPPORTUNITIES'
                  : currentStep === 3
                  ? 'LISTEN TO THE DIFFERENCE'
                  : 'WELCOME TO Samvada'}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-1">
                {currentStep === 1
                  ? 'Your AI voice workforce in minutes.'
                  : currentStep === 2
                  ? 'More than calls. Real outcomes.'
                  : currentStep === 3
                  ? 'Same message. Different voices.'
                  : 'Your AI voice agents are ready to make an impact.'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                {currentStep === 1
                  ? 'Automate calls, engage customers and drive real business outcomes — all with the power of voice AI.'
                  : currentStep === 2
                  ? 'Samvada helps businesses automate conversations, engage customers and drive measurable results.'
                  : currentStep === 3
                  ? 'Find the voice that feels right for your brand.'
                  : 'Create and deploy voice agents in minutes, engage customers across calls, and scale outreach effortlessly.'}
              </p>
            </div>

            {/* Audio Wave preview player */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-xs text-zinc-300 italic">
                "Hello! I'm your AI assistant from Samvada. How can I help you today?"
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 transition-all"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 flex-1 h-8 px-2 justify-center">
                  {[8, 14, 24, 18, 10, 28, 20, 16, 26, 12, 18, 22, 15, 25, 10].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: isPlayingAudio ? `${(h * 1.2) % 28 + 6}px` : `${h}px` }}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlayingAudio ? 'bg-blue-400 animate-pulse' : 'bg-blue-600/60'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-white">Aarav</p>
                  <p className="text-[10px] text-zinc-400">English (India)</p>
                </div>
              </div>
            </div>

            {/* Metrics & Reassurance */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900 text-center">
              <div>
                <p className="text-xs font-bold text-white">10+</p>
                <p className="text-[10px] text-zinc-500">Languages</p>
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400">99.9%</p>
                <p className="text-[10px] text-zinc-500">Reliability</p>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400">Enterprise</p>
                <p className="text-[10px] text-zinc-500">Ready</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
