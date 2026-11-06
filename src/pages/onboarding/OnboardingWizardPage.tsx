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
  ChevronDown,
  Play,
  Pause,
  Volume2,
  Check,
  TrendingUp,
  Headphones,
  Calendar,
  PhoneCall,
  ClipboardList,
  Users,
  Pencil,
  Globe,
  Radio,
  LogOut
} from 'lucide-react';
import {
  ONBOARDING_STEPS,
  ONBOARDING_USE_CASES,
  ONBOARDING_LANGUAGES,
  ONBOARDING_VOICES,
  ONBOARDING_STYLES,
} from '../../utils/constants';

const USE_CASE_ICONS: Record<string, React.ElementType> = {
  sales: TrendingUp,
  support: Headphones,
  appointment: Calendar,
  inbound: PhoneCall,
  surveys: ClipboardList,
  operations: Users,
};

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

  const stepsList = ONBOARDING_STEPS;
  const useCases = ONBOARDING_USE_CASES.map((uc) => ({
    ...uc,
    icon: USE_CASE_ICONS[uc.id] || Users,
  }));
  const languages = ONBOARDING_LANGUAGES;
  const voices = ONBOARDING_VOICES;
  const styles = ONBOARDING_STYLES;

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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col justify-between px-6 lg:px-12 py-6 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 max-w-7xl mx-auto w-full border-b border-slate-200/90 pb-4 bg-white/70 backdrop-blur-sm px-4 rounded-xl">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center gap-[3px]">
            <div className="w-[3px] h-3 bg-white/70 rounded-full" />
            <div className="w-[3px] h-5 bg-white rounded-full" />
            <div className="w-[3px] h-3.5 bg-white/70 rounded-full" />
            <div className="w-[3px] h-2 bg-white/50 rounded-full" />
          </div>
          <div>
            <span className="text-base font-semibold text-slate-900 tracking-tight">Samvada</span>
            <p className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">Workspace Setup</p>
          </div>
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Telephony Trunk Ready</span>
          </div>

          {/* Profile Dropdown Container */}
          <div className="relative pl-3 border-l border-slate-200" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 cursor-pointer group focus:outline-none select-none"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-xs font-medium text-white">
                {(fullName || user?.displayName || 'User').charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-slate-900 leading-tight">
                  {fullName || user?.displayName || 'New User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                  {companyName || user?.companyName || 'My Workspace'}
                </p>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-150 ${
                  isProfileOpen ? 'rotate-180 text-slate-900' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-lg p-2 shadow-lg space-y-1 text-xs z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1 bg-slate-50 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900 text-xs truncate">
                      {fullName || user?.displayName || 'User'}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-600 bg-white border border-slate-200">
                      Step {currentStep}/5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {user?.email || email || 'user@samvada.ai'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 max-w-7xl mx-auto w-full py-2">
        {/* Left Column: 5-Step Stepper & Telemetry */}
        <div className="lg:col-span-3 space-y-6 flex flex-col justify-between h-full">
          <div className="space-y-1.5">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <div
                  key={step.num}
                  onClick={() => step.num < currentStep && setCurrentStep(step.num)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white border border-slate-200 text-slate-900 shadow-2xs'
                      : isCompleted
                      ? 'hover:bg-white/60 text-slate-600'
                      : 'opacity-50 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-medium shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : isCompleted
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <div>
                    <h4 className={`text-xs font-medium leading-tight ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Technical Telephony Status Box */}
          <div className="pt-6 hidden lg:block border-t border-slate-200/80">
            <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-800">Telephony Provisioning</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Workspace audio routed via low-latency WebRTC edge nodes (p95 &lt; 200ms).
              </p>
            </div>
          </div>
        </div>

        {/* Center Column: Step Content Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="w-full bg-white border border-slate-200/90 rounded-xl p-6 sm:p-7 shadow-sm">
            {/* Step Progress indicator */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Step {currentStep} of 5</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`w-6 h-1 rounded-full transition-colors ${
                      s <= currentStep ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Workspace details</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Set up your organization and administrator contact for telephony dispatch.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Full name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Work email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Company name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Health"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Direct phone number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-700 shrink-0">
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full mt-4 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  By continuing, you accept our{' '}
                  <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{' '}
                  <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
                </p>
              </div>
            )}

            {/* STEP 2: Workspace / Use Case */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Primary use case</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select the main telephony workflow for your voice agent.
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
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSel
                            ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/15'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            isSel ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-slate-900' : 'bg-slate-200'}`} />
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">{uc.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{uc.desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Workflow details <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={useCaseNotes}
                    onChange={(e) => setUseCaseNotes(e.target.value.slice(0, 300))}
                    placeholder="e.g. Inbound appointment confirmation and rescheduling..."
                    className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors resize-none"
                  />
                  <span className="text-[10px] text-slate-400 text-right block">{useCaseNotes.length}/300</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="flex-[2] py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Choose Voice & Style */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Voice and language model</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure dialect, voice persona, and pacing.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Language</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {languages.map((l) => {
                        const isSel = language === l.id;
                        return (
                          <div
                            key={l.id}
                            onClick={() => setLanguage(l.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isSel
                                ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/15'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <h5 className="text-xs font-medium text-slate-900">{l.name}</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">{l.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-700">Voice Persona</label>
                      <button
                        type="button"
                        onClick={toggleAudio}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                      >
                        <Volume2 className="w-3 h-3 text-slate-700" /> Preview audio
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {voices.map((v) => {
                        const isSel = selectedVoice === v.id;

                        return (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                              isSel
                                ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/15'
                                : 'bg-white border-slate-200 hover:border-slate-300'
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
                                className={`w-5 h-5 rounded-md flex items-center justify-center ${
                                  isSel ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                              </button>
                              <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-slate-900' : 'bg-slate-200'}`} />
                            </div>
                            <h4 className="text-xs font-medium text-slate-900">{v.name}</h4>
                            <p className="text-[10px] text-slate-500">{v.gender} • {v.tone}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Speaking style</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {styles.map((s) => {
                        const isSel = speakingStyle === s.id;

                        return (
                          <div
                            key={s.id}
                            onClick={() => setSpeakingStyle(s.id)}
                            className={`p-2 rounded-lg border text-center cursor-pointer transition-colors ${
                              isSel
                                ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/15'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <h5 className="text-[11px] font-medium text-slate-900">{s.name}</h5>
                            <p className="text-[9px] text-slate-500 mt-0.5">{s.desc}</p>
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
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex-[2] py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Integrate (Optional) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Telephony and CRM endpoints</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Connect external numbers, CRM contacts, or webhook dispatchers.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { id: 'hubspot', name: 'HubSpot CRM', desc: 'Sync contacts and call logs bi-directionally' },
                    { id: 'salesforce', name: 'Salesforce', desc: 'Enterprise lead and opportunity tracking' },
                    { id: 'webhooks', name: 'Custom Webhooks', desc: 'Real-time JSON event notification stream' },
                    { id: 'telephony', name: 'Twilio / SIP Trunk', desc: 'Bring your own phone numbers or SIP carrier' },
                  ].map((int) => {
                    const isChecked = selectedIntegrations.includes(int.id);

                    return (
                      <div
                        key={int.id}
                        onClick={() => toggleIntegration(int.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/15'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-medium text-slate-900">{int.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{int.desc}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'
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
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="flex-[2] py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Continue to review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Launch / All Set */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                    Review and activate
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Verify configuration before provisioning the agent.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Workspace</p>
                        <h4 className="text-xs font-medium text-slate-900">{companyName || 'My Workspace'}</h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Primary use case</p>
                        <h4 className="text-xs font-medium text-slate-900">
                          {useCases.find((u) => u.id === selectedUseCase)?.title || 'Sales & Lead Generation'}
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                        <Globe className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500">Voice and language</p>
                        <h4 className="text-xs font-medium text-slate-900">
                          {voices.find((v) => v.id === selectedVoice)?.name} ({languages.find((l) => l.id === language)?.name})
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Launch agent in studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Settings can be updated at any time from workspace configuration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio & Telephony Telemetry Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] font-mono font-medium tracking-wide text-slate-500 uppercase">
                Telephony preview
              </span>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight mt-0.5">
                Low-latency voice engine
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Real-time speech-to-speech pipeline with streaming response generation.
              </p>
            </div>

            {/* Audio Wave preview player */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
              <div className="p-2.5 rounded-md bg-white border border-slate-200 text-xs text-slate-700">
                &ldquo;Hello! I am your AI assistant from Samvada. How can I assist you with your inquiry today?&rdquo;
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 flex-1 h-7 px-2 justify-center">
                  {[8, 14, 22, 16, 10, 24, 18, 14, 20, 12, 16, 18, 12, 22, 8].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: isPlayingAudio ? `${(h * 1.1) % 24 + 4}px` : `${h * 0.75}px` }}
                      className={`w-1 rounded-full transition-all duration-200 ${
                        isPlayingAudio ? 'bg-slate-900' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-900">{voices.find((v) => v.id === selectedVoice)?.name || 'Aarav'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">en-IN · Opus</p>
                </div>
              </div>
            </div>

            {/* Operational Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center font-mono">
              <div>
                <p className="text-xs font-semibold text-slate-900 tabular-nums">180ms</p>
                <p className="text-[10px] text-slate-500 font-sans">p95 Latency</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-700 tabular-nums">99.98%</p>
                <p className="text-[10px] text-slate-500 font-sans">SLA</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">SIP/WebRTC</p>
                <p className="text-[10px] text-slate-500 font-sans">Trunk</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OnboardingWizardPage;
