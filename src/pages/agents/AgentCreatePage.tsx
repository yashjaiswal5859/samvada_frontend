import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  Rocket,
  Save,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  Sparkles,
  Phone,
  PhoneIncoming,
  PhoneCall,
  PhoneForwarded,
  Sliders,
  Settings2,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  Hash
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Switch } from '../../components/ui/Switch';
import { createAgent } from '../../api/agents';

export const AgentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(1);
  const [agentName, setAgentName] = useState('Sales Agent');
  const [description, setDescription] = useState(
    'Qualify leads, book meetings and drive revenue through natural conversations.'
  );
  const [useCase, setUseCase] = useState('sales');
  const [industry, setIndustry] = useState('technology');
  const [callDirection, setCallDirection] = useState<'outbound' | 'inbound' | 'both'>('outbound');
  const [voice, setVoice] = useState('aarav');
  const [language, setLanguage] = useState('en-in');
  const [speakingStyle, setSpeakingStyle] = useState('natural');
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  const [pauseLength, setPauseLength] = useState(700);
  const [enableBargeIn, setEnableBargeIn] = useState(true);
  const [noiseHandling, setNoiseHandling] = useState(true);

  // Advanced settings state
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [enableCallTransfer, setEnableCallTransfer] = useState(false);
  const [transferNumber, setTransferNumber] = useState('+91 80 4000 1111');
  const [transferTrigger, setTransferTrigger] = useState('talk to human, representative, supervisor');
  const [transferType, setTransferType] = useState<'warm' | 'cold'>('warm');
  const [enableDTMF, setEnableDTMF] = useState(false);
  const [dtmfTimeout, setDtmfTimeout] = useState('5');
  const [enableBusinessHours, setEnableBusinessHours] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [businessStart, setBusinessStart] = useState('09:00');
  const [businessEnd, setBusinessEnd] = useState('18:00');
  const [outsideHoursAction, setOutsideHoursAction] = useState('voicemail');
  const [maxDurationMinutes, setMaxDurationMinutes] = useState('15');
  const [silenceTimeoutSec, setSilenceTimeoutSec] = useState('15');

  // Test console states
  const [isCalling, setIsCalling] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      time: '11:24 AM',
      text: "Hello! I'm your AI assistant from Samvada. How can I help you today?",
    },
    {
      sender: 'user',
      time: '11:24 AM',
      text: 'I want to know more about your product.',
    },
    {
      sender: 'agent',
      time: '11:24 AM',
      text: 'Great! Samvada helps businesses automate voice conversations and drive real results. Would you like me to share a quick demo or schedule a call with our team?',
    },
  ]);

  const handleDeploy = async () => {
    setIsSubmitting(true);
    try {
      await createAgent({
        name: agentName,
        role: useCase,
        description,
        systemPrompt: `You are ${agentName}, an AI voice assistant for ${industry}.`,
        voiceId: voice,
        language,
        model: 'gpt-4o',
      });
      toast.success(`Voice Agent "${agentName}" provisioned and deployed to live telephony.`);
      navigate('/agents');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to deploy agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <Link to="/agents" className="hover:text-zinc-200 transition-colors">Agents</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">Create Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create AI Voice Agent
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Configure your agent's personality, knowledge and behavior. No code required.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => {
              toast.info('Draft agent configuration saved to workspace');
              navigate('/agents');
            }}
            className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all active:scale-[0.985]"
          >
            Save as Draft
          </button>
          <button
            onClick={handleDeploy}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-[0.985]"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Deploying...' : 'Deploy Agent'}</span>
          </button>
        </div>
      </div>

      {/* Conversational Mode Callout */}
      <div className="bg-[#0f1424] border border-blue-500/30 rounded-2xl p-3.5 px-4 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 text-xs text-zinc-300">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-white">Prefer an easier way?</span>{' '}
            <span className="text-zinc-400">You can create your entire voice assistant in 1 minute just by chatting in simple words.</span>
          </div>
        </div>
        <Link
          to="/ai-studio"
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all active:scale-[0.985]"
        >
          <span>Create with AI Chat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal 5-Step Progress Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl flex items-center justify-between overflow-x-auto gap-4">
        {[
          { num: 1, title: 'Basic Info' },
          { num: 2, title: 'Voice & Language' },
          { num: 3, title: 'Knowledge' },
          { num: 4, title: 'Behavior' },
          { num: 5, title: 'Review & Deploy' },
        ].map((step, idx, arr) => {
          const isActive = activeStep === step.num;
          const isDone = activeStep > step.num;

          return (
            <React.Fragment key={step.num}>
              <div
                onClick={() => setActiveStep(step.num)}
                className="flex items-center gap-2.5 cursor-pointer shrink-0"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : isDone
                      ? 'bg-blue-900/60 text-blue-300'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    isActive ? 'text-white' : isDone ? 'text-zinc-300' : 'text-zinc-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {idx < arr.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[24px] rounded-full ${
                    isDone ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main Grid: Form Left (8 cols) + Test Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Basic Info */}
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <h3 className="text-base font-bold text-white">Basic Information</h3>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g. Maya - Claims Support"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-zinc-300">
                  Description <span className="text-zinc-500">(internal)</span>
                </label>
                <span className="text-[10px] text-zinc-500">{description.length}/200</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                className="w-full p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            <div>
              <CustomSelect
                label="Use Case"
                value={useCase}
                onChange={setUseCase}
                options={[
                  { value: 'sales', label: 'Sales & Lead Generation' },
                  { value: 'support', label: 'Customer Support' },
                  { value: 'booking', label: 'Appointment Booking' },
                  { value: 'surveys', label: 'Surveys & Feedback' },
                ]}
                size="md"
              />
            </div>

            <div>
              <CustomSelect
                label="Industry"
                value={industry}
                onChange={setIndustry}
                options={[
                  { value: 'technology', label: 'Technology' },
                  { value: 'healthcare', label: 'Healthcare' },
                  { value: 'finance', label: 'Finance & Banking' },
                  { value: 'realestate', label: 'Real Estate' },
                  { value: 'ecommerce', label: 'E-Commerce' },
                ]}
                size="md"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Call Direction</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div
                  onClick={() => setCallDirection('outbound')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    callDirection === 'outbound'
                      ? 'bg-zinc-900/90 border-white ring-1 ring-white/50 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Phone className={`w-3.5 h-3.5 ${callDirection === 'outbound' ? 'text-white' : 'text-zinc-400'}`} />
                      <h5 className="text-xs font-semibold text-white">Outbound Calls</h5>
                    </div>
                    <input
                      type="radio"
                      name="callDirection"
                      checked={callDirection === 'outbound'}
                      onChange={() => setCallDirection('outbound')}
                      className="radio-white"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">Make calls to your contacts</p>
                </div>

                <div
                  onClick={() => setCallDirection('inbound')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    callDirection === 'inbound'
                      ? 'bg-zinc-900/90 border-white ring-1 ring-white/50 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <PhoneIncoming className={`w-3.5 h-3.5 ${callDirection === 'inbound' ? 'text-white' : 'text-zinc-400'}`} />
                      <h5 className="text-xs font-semibold text-white">Inbound Calls</h5>
                    </div>
                    <input
                      type="radio"
                      name="callDirection"
                      checked={callDirection === 'inbound'}
                      onChange={() => setCallDirection('inbound')}
                      className="radio-white"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">Receive incoming calls</p>
                </div>

                <div
                  onClick={() => setCallDirection('both')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    callDirection === 'both'
                      ? 'bg-zinc-900/90 border-white ring-1 ring-white/50 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <PhoneCall className={`w-3.5 h-3.5 ${callDirection === 'both' ? 'text-white' : 'text-zinc-400'}`} />
                      <h5 className="text-xs font-semibold text-white">Outbound + Inbound</h5>
                    </div>
                    <input
                      type="radio"
                      name="callDirection"
                      checked={callDirection === 'both'}
                      onChange={() => setCallDirection('both')}
                      className="radio-white"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">Make & receive calls</p>
                </div>
              </div>
            </div>

            {/* Expandable Advanced Settings Accordion */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/30 transition-all">
              <button
                type="button"
                onClick={() => setIsAdvancedOpen((prev) => !prev)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isAdvancedOpen ? 'bg-blue-600/20 text-blue-400' : 'bg-zinc-800/60 text-zinc-400'
                    }`}
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-semibold text-white">Advanced Settings</h5>
                      {(enableCallTransfer || enableDTMF || enableBusinessHours) && (
                        <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">Call transfer, DTMF handling, business hours & limits</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    isAdvancedOpen ? 'rotate-180 text-blue-400' : ''
                  }`}
                />
              </button>

              {/* Expandable Content Drawer */}
              {isAdvancedOpen && (
                <div className="p-4 pt-3 border-t border-zinc-800/80 space-y-3.5 text-xs animate-fadeIn">
                  {/* 1. Call Transfer / Human Escalation */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhoneForwarded className="w-3.5 h-3.5 text-blue-400" />
                        <div>
                          <h6 className="text-xs font-semibold text-white">Call Transfer & Escalation</h6>
                          <p className="text-[10px] text-zinc-400">Forward call to a human agent when requested</p>
                        </div>
                      </div>
                      <Switch
                        checked={enableCallTransfer}
                        onChange={setEnableCallTransfer}
                      />
                    </div>

                    {enableCallTransfer && (
                      <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Transfer Destination (Phone / SIP)</label>
                            <input
                              type="text"
                              value={transferNumber}
                              onChange={(e) => setTransferNumber(e.target.value)}
                              placeholder="+91 80 4000 1111 or sip:team@domain.com"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1.5">Transfer Mode</label>
                            <div className="flex items-center gap-4 pt-0.5">
                              <label
                                onClick={() => setTransferType('warm')}
                                className="flex items-center gap-2 cursor-pointer select-none group"
                              >
                                <input
                                  type="radio"
                                  name="transferType"
                                  value="warm"
                                  checked={transferType === 'warm'}
                                  onChange={() => setTransferType('warm')}
                                  className="radio-white"
                                />
                                <span className={`text-xs ${transferType === 'warm' ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                  Warm (Announced)
                                </span>
                              </label>

                              <label
                                onClick={() => setTransferType('cold')}
                                className="flex items-center gap-2 cursor-pointer select-none group"
                              >
                                <input
                                  type="radio"
                                  name="transferType"
                                  value="cold"
                                  checked={transferType === 'cold'}
                                  onChange={() => setTransferType('cold')}
                                  className="radio-white"
                                />
                                <span className={`text-xs ${transferType === 'cold' ? 'text-white font-medium' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                  Cold (Direct Blind)
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">Escalation Trigger Keywords</label>
                          <input
                            type="text"
                            value={transferTrigger}
                            onChange={(e) => setTransferTrigger(e.target.value)}
                            placeholder="agent, supervisor, human, representative"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. DTMF Keypad Handling */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5 text-indigo-400" />
                        <div>
                          <h6 className="text-xs font-semibold text-white">DTMF Keypad Detection</h6>
                          <p className="text-[10px] text-zinc-400">Capture touch-tone dialing (e.g. Press 1 for Sales, OTPs)</p>
                        </div>
                      </div>
                      <Switch
                        checked={enableDTMF}
                        onChange={setEnableDTMF}
                      />
                    </div>

                    {enableDTMF && (
                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-400">Inter-digit Timeout</span>
                        <div className="flex items-center gap-2">
                          {['3s', '5s', '10s'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDtmfTimeout(t.replace('s', ''))}
                              className={`px-2.5 py-1 rounded-md text-[11px] border font-mono ${
                                dtmfTimeout === t.replace('s', '')
                                  ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Business Hours & After-Hours Handling */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <h6 className="text-xs font-semibold text-white">Business Hours Schedule</h6>
                          <p className="text-[10px] text-zinc-400">Restrict agent operation to specified working hours</p>
                        </div>
                      </div>
                      <Switch
                        checked={enableBusinessHours}
                        onChange={setEnableBusinessHours}
                      />
                    </div>

                    {enableBusinessHours && (
                      <div className="pt-2 border-t border-zinc-800/60 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Timezone</label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-blue-500"
                            >
                              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                              <option value="America/New_York">America/New_York (EST)</option>
                              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                              <option value="Europe/London">Europe/London (GMT)</option>
                              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Start Time</label>
                            <input
                              type="time"
                              value={businessStart}
                              onChange={(e) => setBusinessStart(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">End Time</label>
                            <input
                              type="time"
                              value={businessEnd}
                              onChange={(e) => setBusinessEnd(e.target.value)}
                              className="w-full px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1.5">After-Hours Fallback Action</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {[
                              { id: 'voicemail', label: 'Record Voicemail' },
                              { id: 'play_message', label: 'Play Msg & End' },
                              { id: 'transfer', label: 'Route to Emergency' },
                            ].map((opt) => (
                              <label
                                key={opt.id}
                                onClick={() => setOutsideHoursAction(opt.id)}
                                className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all select-none ${
                                  outsideHoursAction === opt.id
                                    ? 'bg-zinc-900 border-white ring-1 ring-white/40'
                                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                                }`}
                              >
                                <span className="text-xs text-white font-medium">{opt.label}</span>
                                <input
                                  type="radio"
                                  name="outsideHoursAction"
                                  value={opt.id}
                                  checked={outsideHoursAction === opt.id}
                                  onChange={() => setOutsideHoursAction(opt.id)}
                                  className="radio-white"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Duration & Silence Limits */}
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <h6 className="text-xs font-semibold text-white">Call Duration & Silence Safeguards</h6>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Max Call Duration</span>
                          <span className="text-white font-mono font-medium">{maxDurationMinutes} mins</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="60"
                          step="1"
                          value={maxDurationMinutes}
                          onChange={(e) => setMaxDurationMinutes(e.target.value)}
                          className="w-full accent-blue-600 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Silence Disconnect</span>
                          <span className="text-white font-mono font-medium">{silenceTimeoutSec}s</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="30"
                          step="1"
                          value={silenceTimeoutSec}
                          onChange={(e) => setSilenceTimeoutSec(e.target.value)}
                          className="w-full accent-blue-600 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column 2: Voice & Language */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Voice & Language</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Choose how your agent sounds and speaks.</p>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">Voice</label>
                <button className="text-[11px] text-blue-400 hover:underline flex items-center gap-1">
                  <Play className="w-3 h-3 fill-current" /> Preview
                </button>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Aarav</h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                      <span>Male</span>
                      <span>•</span>
                      <span>Natural</span>
                      <span>•</span>
                      <span>Friendly</span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </div>
              <button className="text-[11px] text-blue-400 hover:text-blue-300 mt-1.5 flex items-center gap-1">
                Browse more voices <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div>
              <CustomSelect
                label="Language"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: 'en-in', label: '🇮🇳 English (India)' },
                  { value: 'hi-in', label: '🇮🇳 Hindi' },
                  { value: 'hinglish', label: '🇮🇳 Hinglish' },
                  { value: 'en-us', label: '🇺🇸 English (US)' },
                ]}
                size="md"
              />

              <div className="flex items-center gap-1.5 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-600/20 border border-blue-500/40 text-[10px] text-blue-300 font-medium">English</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">Hindi</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">Hinglish</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Speaking Style</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'natural', label: 'Natural', sub: 'Conversational' },
                  { id: 'professional', label: 'Professional', sub: 'Formal & clear' },
                  { id: 'energetic', label: 'Energetic', sub: 'Upbeat & lively' },
                  { id: 'calm', label: 'Calm', sub: 'Soft & soothing' },
                ].map((st) => (
                  <div
                    key={st.id}
                    onClick={() => setSpeakingStyle(st.id)}
                    className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                      speakingStyle === st.id
                        ? 'bg-blue-950/50 border-blue-500 ring-1 ring-blue-500/50'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <h5 className="text-[11px] font-semibold text-white">{st.label}</h5>
                    <p className="text-[9px] text-zinc-400 mt-0.5">{st.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-1 border-t border-zinc-850">
              <h4 className="text-xs font-semibold text-zinc-300">Speech Settings</h4>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Speaking Speed</span>
                  <span className="text-white font-mono">{speakingSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speakingSpeed}
                  onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                  <span>Pause Length</span>
                  <span className="text-white font-mono">{pauseLength} ms</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={pauseLength}
                  onChange={(e) => setPauseLength(parseInt(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h5 className="text-xs font-medium text-white">Allow Callers to Interrupt</h5>
                  <p className="text-[10px] text-zinc-500">Callers can speak over the assistant to ask immediate questions</p>
                </div>
                <Switch
                  checked={enableBargeIn}
                  onChange={setEnableBargeIn}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-medium text-white">Background Noise Handling</h5>
                  <p className="text-[10px] text-zinc-500">Filter ambient noise for better accuracy</p>
                </div>
                <Switch
                  checked={noiseHandling}
                  onChange={setNoiseHandling}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Live Test Console */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Test Your Agent</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Try a quick conversation before deploying.</p>
            </div>
            <button
              onClick={() => {}}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Simulator */}
          <div className="space-y-3 min-h-[220px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-sm'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 px-1">
                  {m.sender === 'agent' ? 'Aarav' : 'You'} • {m.time}
                </span>
              </div>
            ))}
          </div>

          {/* Voice Controls with Big Wave Button */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full border transition-all ${
                isMuted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsCalling(!isCalling)}
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all ${
                isCalling
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {/* Soundwave animation */}
              <div className="flex items-center gap-0.5 h-4 mb-0.5">
                <div className="w-0.5 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-0.5 h-4 bg-white rounded-full" />
                <div className="w-0.5 h-3 bg-white rounded-full" />
                <div className="w-0.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="text-[8px] font-bold uppercase">{isCalling ? 'End Test' : 'Start'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3 rounded-full border transition-all ${
                !isSpeakerOn
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Pro Tip Callout Card */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-white">Pro Tip</h5>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-normal">
                Test different scenarios like objections, pricing questions or call transfers to fine-tune your agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
