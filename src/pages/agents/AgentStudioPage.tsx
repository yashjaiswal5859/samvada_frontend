import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Sliders,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Radio,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  BookOpen,
  Boxes,
  Cpu,
  Layers,
  ChevronDown,
  DollarSign,
  Zap,
  Clock,
  Code,
  Shield,
  Plus,
  Trash2,
  Settings,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  Search,
  Eye,
  X,
  Send,
  Loader2,
  Database,
  Webhook,
  FileText,
  Smartphone,
  MessageCircle,
  Headphones
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getAgent, updateAgent } from '../../api/agents';

interface ChatTurn {
  id: string;
  sender: 'caller' | 'agent';
  text: string;
  timestamp: string;
  latencyMs?: number;
}

interface WorkflowNode {
  id: string;
  title: string;
  type: 'trigger' | 'crm' | 'knowledge' | 'brain' | 'tool' | 'output';
  subtitle: string;
  x: number;
  y: number;
  status: 'active' | 'configured';
  details: string;
}

export const AgentStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentWorkspace } = useWorkspace();

  // Mode: 'agent' (Prompt Studio) vs 'workflow' (Visual DAG)
  const currentTab = searchParams.get('tab') === 'workflow' ? 'workflow' : 'agent';

  // Agent Core State
  const [agentName, setAgentName] = useState('Maya');
  const [agentRole, setAgentRole] = useState('Luxury Hospitality Concierge');
  const [agentStatus, setAgentStatus] = useState<'active' | 'draft'>('active');
  const [selectedModel, setSelectedModel] = useState('GPT-4o Realtime');
  const [selectedVoice, setSelectedVoice] = useState('Cartesia Sonic');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  // Left Drawer Settings Navigation
  const [activeSettingsDrawer, setActiveSettingsDrawer] = useState<string | null>('speech');
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);

  // Speech Settings
  const [interruptionSensitivity, setInterruptionSensitivity] = useState<'Sensitive' | 'Balanced' | 'Firm'>('Balanced');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [speechEndDetection, setSpeechEndDetection] = useState<'Aggressive' | 'Balanced' | 'Relaxed'>('Balanced');
  const [vocabSpecialization, setVocabSpecialization] = useState<'General' | 'Medical' | 'Hospitality'>('Hospitality');
  const [formatSpokenDigits, setFormatSpokenDigits] = useState(true);

  // Call Settings
  const [callTimezone, setCallTimezone] = useState('America/New_York (EST)');
  const [voicemailDetection, setVoicemailDetection] = useState(true);
  const [ivrHangup, setIvrHangup] = useState(false);
  const [llmTemperaturePreset, setLlmTemperaturePreset] = useState<'Consistent' | 'Balanced' | 'Creative'>('Balanced');
  const [responseEagerness, setResponseEagerness] = useState<'Patient' | 'Balanced' | 'Eager'>('Balanced');
  const [silenceAction, setSilenceAction] = useState<'End call' | 'Nudge'>('Nudge');
  const [silenceSeconds, setSilenceSeconds] = useState(3);

  // Greeting Config
  const [firstSpeaker, setFirstSpeaker] = useState<'agent' | 'caller'>('agent');
  const [greetingType, setGreetingType] = useState<'Static' | 'Dynamic'>('Static');
  const [greetingText, setGreetingText] = useState(
    'Good evening. Welcome to Grand Horizon Resort. My name is Maya. How may I orchestrate your stay today?'
  );

  // System Prompt (Markdown format)
  const [systemPrompt, setSystemPrompt] = useState(
`# Objective
You are Maya, an ultra-luxury resort concierge at Grand Horizon Resort. Your goal is to deliver anticipatory, polished hospitality by handling room reservations, dining bookings, spa appointments, and bespoke guest inquiries with warmth and efficiency.

# Persona & Acoustic Style
- Demeanor: Impeccably courteous, warm, and sophisticated.
- Tone: Calming and conversational; never robotic or hurried.
- Speech Pacing: Measured, clear cadence (~150 wpm). Use graceful affirmations such as "Certainly", "With pleasure", and "I would be delighted to assist".

# Guardrails & Red Lines
- Always verify guest room number and primary surname before booking services.
- Never quote cancellation waivers without referencing the resort policy guidelines.
- Escalate medical emergencies or security requests immediately to human guest relations.

# Available Tools & API Calls
- calendar_book_reservation: Books dining, spa, and cabana slots into the PMS.
- query_guest_profile: Fetches dietary preferences and loyalty status from Opera PMS.
- dispatch_sms_confirmation: Sends a structured summary SMS to the caller's mobile.`
  );

  // Dynamic Variables
  const [variables, setVariables] = useState<Record<string, string>>({
    caller_name: 'Evelyn Reed',
    reservation_date: 'October 15, 2026',
    room_type: 'Oceanfront Penthouse Suite',
    loyalty_tier: 'Diamond Ambassador',
  });
  const [showVariableModal, setShowVariableModal] = useState(false);

  // Voice Selection Modal
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceFilterCategory, setVoiceFilterCategory] = useState('All collections');
  const [voiceSearch, setVoiceSearch] = useState('');

  // AI Composer Drawer
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInput, setComposerInput] = useState('');
  const [isComposerLoading, setIsComposerLoading] = useState(false);

  // Simulator Mode
  const [simulatorMode, setSimulatorMode] = useState<'web' | 'chat' | 'telephony'>('web');

  // Audio Testing / Simulator State
  const [mobileStudioTab, setMobileStudioTab] = useState<'editor' | 'settings' | 'preview'>('editor');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ChatTurn[]>([
    {
      id: 'turn-1',
      sender: 'agent',
      text: 'Good evening. Welcome to Grand Horizon Resort. My name is Maya. How may I orchestrate your stay today?',
      timestamp: 'Just now',
      latencyMs: 185,
    },
  ]);
  const [userSpeechInput, setUserSpeechInput] = useState('');

  // Workflow Canvas State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-brain');
  const [isSaving, setIsSaving] = useState(false);

  // Available Voices List for Modal
  const AVAILABLE_VOICES = [
    { id: 'cartesia-sonic', name: 'Roger', gender: 'Male', accent: 'US English', tags: 'Laid-Back, Casual, Resonant', provider: 'Cartesia' },
    { id: 'eleven-sarah', name: 'Sarah', gender: 'Female', accent: 'US English', tags: 'Mature, Reassuring, Confident', provider: 'ElevenLabs' },
    { id: 'cartesia-maya', name: 'Maya', gender: 'Female', accent: 'British Luxury', tags: 'Polished, Warm, Anticipatory', provider: 'Cartesia' },
    { id: 'eleven-david', name: 'David', gender: 'Male', accent: 'US English', tags: 'Clinical, Reassuring, Empathetic', provider: 'ElevenLabs' },
    { id: 'playht-liam', name: 'Liam', gender: 'Male', accent: 'US English', tags: 'Executive, Energetic, Authoritative', provider: 'PlayHT' },
    { id: 'azure-elena', name: 'Elena', gender: 'Female', accent: 'US English', tags: 'Empathetic, Clear, Professional', provider: 'Azure' },
  ];

  // Workflow DAG Nodes Definition
  const workflowNodes: WorkflowNode[] = [
    {
      id: 'node-trigger',
      title: 'Call incoming / outgoing',
      type: 'trigger',
      subtitle: '+1 (415) 890-2341 • Twilio SIP',
      x: 40,
      y: 180,
      status: 'active',
      details: 'Accepts incoming RTP stream, negotiates G.711 / Opus audio codec, and routes session to Samvada Media Gateway.',
    },
    {
      id: 'node-pre-call',
      title: 'Pre-call integrations',
      type: 'crm',
      subtitle: 'Prepare context before conversation',
      x: 280,
      y: 120,
      status: 'active',
      details: 'Extracts caller ID, fetches loyalty VIP tier, previous reservation history, and injects payload into session state.',
    },
    {
      id: 'node-kb',
      title: 'Knowledge bases',
      type: 'knowledge',
      subtitle: 'Grand Horizon Resort Guidelines.pdf',
      x: 580,
      y: 40,
      status: 'configured',
      details: 'Embeds real-time queries with BGE-M3 and performs sub-25ms semantic search over resort amenities.',
    },
    {
      id: 'node-brain',
      title: `Agent (${agentName})`,
      type: 'brain',
      subtitle: `${selectedModel} • ${selectedVoice}`,
      x: 580,
      y: 180,
      status: 'active',
      details: 'Executes streaming turn-by-turn inference with conversational guardrails, interruption detection, and acoustic synthesis.',
    },
    {
      id: 'node-post-call',
      title: 'Post-call integrations',
      type: 'tool',
      subtitle: 'Send results to connected services',
      x: 900,
      y: 100,
      status: 'configured',
      details: 'Binds available dining tables or spa appointments directly with two-way calendar synchronization.',
    },
    {
      id: 'node-extraction',
      title: 'Data extraction',
      type: 'output',
      subtitle: 'User Sentiment & Structured Summary',
      x: 900,
      y: 260,
      status: 'active',
      details: 'Extracts structured JSON payload: Sentiment score, guest confirmation number, and follow-up flags.',
    },
    {
      id: 'node-webhooks',
      title: 'Webhooks',
      type: 'output',
      subtitle: 'Dispatch events to external endpoints',
      x: 580,
      y: 350,
      status: 'configured',
      details: 'Posts session recordings and transcript webhooks to corporate CRM upon completion.',
    },
  ];

  const selectedNode = workflowNodes.find((n) => n.id === selectedNodeId) || workflowNodes[3];

  const handleStartCall = () => {
    setIsCallActive(true);
    setIsSpeaking(true);

    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(greetingText);
      utterance.rate = speakingRate;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 2200);
    }
    toast.success(`Connected test call with ${agentName} (${selectedModel}).`);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    toast.info('Test session ended.');
  };

  const handleSendUserMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;

    const callerText = userSpeechInput;
    setUserSpeechInput('');

    const callerTurn: ChatTurn = {
      id: `turn-${Date.now()}`,
      sender: 'caller',
      text: callerText,
      timestamp: 'Now',
    };

    setConversation((prev) => [...prev, callerTurn]);
    setIsSpeaking(true);

    setTimeout(() => {
      const lower = callerText.toLowerCase();
      let responseText = `I have verified your inquiry, ${variables.caller_name || 'guest'}. Our team is pleased to confirm that for ${variables.reservation_date || 'your upcoming date'}, everything is prepared. Would you like me to book dinner at the Terrace tonight?`;
      if (lower.includes('spa') || lower.includes('massage')) {
        responseText = 'I would be delighted to schedule a 90-minute Deep Tissue treatment for you at the Grand Spa at 4:00 PM. Shall I confirm that to your suite?';
      } else if (lower.includes('dinner') || lower.includes('table')) {
        responseText = 'Certainly. I have reserved an ocean-view table for two at Azure Seafood Grill for 7:30 PM this evening.';
      }

      const agentTurn: ChatTurn = {
        id: `turn-${Date.now() + 1}`,
        sender: 'agent',
        text: responseText,
        timestamp: 'Now',
        latencyMs: Math.floor(Math.random() * 30) + 180,
      };

      setConversation((prev) => [...prev, agentTurn]);

      if ('speechSynthesis' in window && !isMuted) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = speakingRate;
        utterance.pitch = 1.05;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsSpeaking(false), 2000);
      }
    }, 400);
  };

  const handleSaveAndPublish = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setAgentStatus('active');
      toast.success(`Agent "${agentName}" published to production voice cluster!`);
    }, 500);
  };

  const handleComposerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerInput.trim()) return;
    setIsComposerLoading(true);
    setTimeout(() => {
      setIsComposerLoading(false);
      setSystemPrompt((prev) => `${prev}\n\n# Updated Instruction\n${composerInput}`);
      toast.success('Prompt augmented with AI Composer recommendation.');
      setComposerInput('');
    }, 700);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] bg-white overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* ── TOP CONTROL BAR & ECONOMICS HUD ── */}
      <header className="min-h-14 py-2 sm:py-0 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between shrink-0 shadow-2xs z-30 flex-wrap gap-2">
        {/* Left: Back & Agent Title / Status */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/agents')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Back to Voice Agents"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-950 text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-700 shrink-0">
              {agentName.slice(0, 1)}
            </div>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 max-w-[110px] sm:max-w-[160px] transition-all truncate"
            />
            <span
              className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${
                agentStatus === 'active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {agentStatus === 'active' ? 'Published' : 'Draft'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">Auto-saved 18:27</span>
          </div>
        </div>

        {/* Center: Economics & Latency HUD */}
        <div className="hidden lg:flex items-center gap-5 px-3.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-700">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Cost:</span>
            <span className="font-bold text-slate-900">$0.042/min</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Turn Latency:</span>
            <span className="font-bold text-emerald-800">195ms P50</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Tokens:</span>
            <span className="font-bold text-slate-900">1.4k / 128k</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'agent' })}
              className={`px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs ${
                currentTab === 'agent'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3 h-3 text-emerald-600" />
              <span>Prompt<span className="hidden sm:inline"> Studio</span></span>
            </button>
            <button
              type="button"
              onClick={() => setSearchParams({ tab: 'workflow' })}
              className={`px-2 sm:px-3 py-1 rounded-md flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs ${
                currentTab === 'workflow'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-600" />
              <span>DAG<span className="hidden sm:inline"> Workflow</span></span>
            </button>
          </div>

          {/* AI Composer Trigger */}
          <button
            onClick={() => setIsComposerOpen(!isComposerOpen)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all ${
              isComposerOpen
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Composer</span>
          </button>

          {/* Preview / Sandbox Toggle for Tablet & Mobile */}
          <button
            onClick={() => setMobileStudioTab(mobileStudioTab === 'preview' ? 'editor' : 'preview')}
            className={`xl:hidden flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold shadow-2xs transition-all ${
              mobileStudioTab === 'preview'
                ? 'bg-emerald-950 text-white border-emerald-950 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Live Test Sandbox"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Publish Agent CTA */}
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Toolbar: Quick pane switching on mobile and tablet */}
      <div className="lg:hidden flex items-center justify-around border-b border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold shrink-0 z-20">
        <button
          type="button"
          onClick={() => setMobileStudioTab('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mobileStudioTab === 'settings'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileStudioTab('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mobileStudioTab === 'editor'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{currentTab === 'agent' ? 'Prompt Editor' : 'Workflow DAG'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileStudioTab('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mobileStudioTab === 'preview'
              ? 'bg-emerald-950 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Test Sandbox</span>
        </button>
      </div>

      {/* ── WORKSPACE BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── SUB-LEFT RAIL: Persistence-style Settings Drawer ── */}
        {currentTab === 'agent' && (
          <div className={`${mobileStudioTab === 'settings' ? 'flex' : 'hidden'} lg:flex border-r border-slate-200 shrink-0 bg-slate-50 w-full lg:w-auto h-full overflow-hidden`}>
            {/* Narrow Icon/Menu Rail */}
            <div className={`${activeSettingsDrawer ? 'hidden sm:block' : 'block'} w-full sm:w-48 bg-slate-50 border-r border-slate-200 p-2.5 space-y-4 overflow-y-auto text-xs shrink-0`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Actions</span>
                <button
                  onClick={() => setActiveSettingsDrawer('integrations')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'integrations'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    <span>Integrations</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  onClick={() => setActiveSettingsDrawer('tools')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'tools'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-slate-400" />
                    <span>System tools</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  onClick={() => setActiveSettingsDrawer('mcps')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'mcps'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>MCP Servers</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Context</span>
                <button
                  onClick={() => setActiveSettingsDrawer('kb')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'kb'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Knowledge base</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Behaviour</span>
                <button
                  onClick={() => setActiveSettingsDrawer('speech')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'speech'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Speech settings</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  onClick={() => setActiveSettingsDrawer('call')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'call'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span>Call settings</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">After Call</span>
                <button
                  onClick={() => setActiveSettingsDrawer('extraction')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'extraction'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Data extraction</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>

                <button
                  onClick={() => setActiveSettingsDrawer('webhooks')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all ${
                    activeSettingsDrawer === 'webhooks'
                      ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Webhook className="w-3.5 h-3.5 text-slate-400" />
                    <span>Webhooks</span>
                  </span>
                  <span className="text-slate-400">›</span>
                </button>
              </div>
            </div>

            {/* Slide-out Settings Inspector Panel */}
            {activeSettingsDrawer && (
              <div className="w-full sm:w-72 bg-white border-r border-slate-200 p-4 overflow-y-auto space-y-4 text-xs shadow-inner shrink-0">
                <div className="sm:hidden pb-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveSettingsDrawer(null)}
                    className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to settings categories</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSettingsDrawer(null)}
                    className="text-slate-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* 1. Speech Settings Drawer */}
                {activeSettingsDrawer === 'speech' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900">Speech settings</h4>
                      <button onClick={() => setActiveSettingsDrawer(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Interruption sensitivity</label>
                      <p className="text-[11px] text-slate-500 mb-2">Delay before agent stops speaking when user speaks.</p>
                      <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg">
                        {(['Sensitive', 'Balanced', 'Firm'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setInterruptionSensitivity(mode)}
                            className={`py-1 text-center font-semibold rounded ${
                              interruptionSensitivity === mode ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Voice speed</span>
                        <span className="font-mono text-emerald-800">{speakingRate}x</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 p-0.5 bg-slate-100 rounded-lg text-center font-mono text-[10px]">
                        {[0.8, 0.9, 1.0, 1.1, 1.2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setSpeakingRate(rate)}
                            className={`py-1 rounded font-semibold ${
                              speakingRate === rate ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">Noise cancellation</span>
                        <span className="text-[10px] text-slate-500">Filter background noise in real-time</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={noiseCancellation}
                        onChange={(e) => setNoiseCancellation(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Speech end detection</label>
                      <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg">
                        {(['Aggressive', 'Balanced', 'Relaxed'] as const).map((det) => (
                          <button
                            key={det}
                            onClick={() => setSpeechEndDetection(det)}
                            className={`py-1 text-center font-semibold rounded ${
                              speechEndDetection === det ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
                            }`}
                          >
                            {det}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">Formatting digits & dates</span>
                        <span className="text-[10px] text-slate-500">Format spoken numbers to digits in transcript</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formatSpokenDigits}
                        onChange={(e) => setFormatSpokenDigits(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Call Settings Drawer */}
                {activeSettingsDrawer === 'call' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900">Call settings</h4>
                      <button onClick={() => setActiveSettingsDrawer(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Time zone</label>
                      <select
                        value={callTimezone}
                        onChange={(e) => setCallTimezone(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                      >
                        <option value="America/New_York (EST)">America/New_York (EST)</option>
                        <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                        <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">Voicemail detection (AMD)</span>
                        <span className="text-[10px] text-slate-500">Hang up or leave message if answering machine detected</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={voicemailDetection}
                        onChange={(e) => setVoicemailDetection(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div>
                        <span className="font-bold text-slate-900 block">IVR hangup</span>
                        <span className="text-[10px] text-slate-500">Hang up immediately if automated IVR answers</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={ivrHangup}
                        onChange={(e) => setIvrHangup(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">LLM Temperature</label>
                      <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg">
                        {(['Consistent', 'Balanced', 'Creative'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setLlmTemperaturePreset(mode)}
                            className={`py-1 text-center font-semibold rounded ${
                              llmTemperaturePreset === mode ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Silence handling</label>
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={silenceAction}
                          onChange={(e) => setSilenceAction(e.target.value as any)}
                          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-800 font-semibold"
                        >
                          <option value="Nudge">Nudge caller</option>
                          <option value="End call">End call</option>
                        </select>
                        <span className="text-slate-500">after</span>
                        <input
                          type="number"
                          value={silenceSeconds}
                          onChange={(e) => setSilenceSeconds(Number(e.target.value))}
                          className="w-12 px-2 py-1 border border-slate-200 rounded-lg text-center font-mono font-bold"
                          min={1}
                          max={15}
                        />
                        <span className="text-slate-500">sec</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Data Extraction Drawer */}
                {activeSettingsDrawer === 'extraction' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900">Data extraction</h4>
                      <button onClick={() => setActiveSettingsDrawer(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">Extract structured parameters from the conversation upon completion.</p>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">User Sentiment</span>
                          <span className="text-[10px] text-slate-500">Positive, Neutral, Escalated</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Executive Summary</span>
                          <span className="text-[10px] text-slate-500">3-bullet summary text</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>

                      <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Reservation Details</span>
                          <span className="text-[10px] text-slate-500">Dates, room tier, party size</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>

                    <button
                      onClick={() => toast.success('Custom extraction parameter added.')}
                      className="w-full py-1.5 border border-dashed border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-50"
                    >
                      + Add custom extraction field
                    </button>
                  </div>
                )}

                {/* 4. MCP Servers Drawer */}
                {activeSettingsDrawer === 'mcps' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-900">Model Context Protocol (MCP)</h4>
                      <button onClick={() => setActiveSettingsDrawer(null)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">Connect standardized tool servers via Model Context Protocol.</p>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-900 block">PostgreSQL Database MCP</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Connected • 12 tools active</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                      <span className="font-bold text-slate-900 block">Salesforce CRM MCP</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Connected • 8 tools active</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CENTER STAGE: PROMPT STUDIO OR VISUAL WORKFLOW DAG ── */}
        <div className={`${mobileStudioTab === 'editor' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col overflow-y-auto min-w-0 bg-white`}>
          {currentTab === 'agent' ? (
            <div className="p-6 max-w-4xl space-y-5 mx-auto w-full pb-20">
              {/* Architecture Model & Voice Selector Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  {/* Model Selector */}
                  <div className="relative">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="GPT-4o Realtime">Spark (GPT-4o Realtime)</option>
                      <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                      <option value="Elara (Fast)">Elara ($0.005/min)</option>
                      <option value="Titan">Titan ($0.003/min)</option>
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Language</label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-2xs cursor-pointer"
                    >
                      <option value="English (US)">US English (US)</option>
                      <option value="English (UK)">British English (UK)</option>
                      <option value="Spanish">Spanish (ES)</option>
                      <option value="Hindi">Hindi (IN)</option>
                    </select>
                  </div>

                  {/* Voice Selector button */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Voice</label>
                    <button
                      type="button"
                      onClick={() => setShowVoiceModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 shadow-2xs hover:bg-slate-50 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedVoice}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Dual-Channel Streaming Active</span>
                </div>
              </div>

              {/* Greeting Builder: Speaks first */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setFirstSpeaker('agent')}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          firstSpeaker === 'agent' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Agent
                      </button>
                      <button
                        type="button"
                        onClick={() => setFirstSpeaker('caller')}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          firstSpeaker === 'caller' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Caller
                      </button>
                    </div>
                    <span>speaks first with</span>
                    <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setGreetingType('Static')}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          greetingType === 'Static' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Static
                      </button>
                      <button
                        type="button"
                        onClick={() => setGreetingType('Dynamic')}
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          greetingType === 'Dynamic' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Dynamic
                      </button>
                    </div>
                    <span>message:</span>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={greetingText}
                  onChange={(e) => setGreetingText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Rich Markdown Prompt Editor */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Agent Persona & Guardrails Prompt
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Insert:</span>
                    {['caller_name', 'reservation_date', 'room_type'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setSystemPrompt((prev) => `${prev} {{${v}}}`)}
                        className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-mono font-semibold border border-emerald-200"
                      >
                        + {`{{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-3 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                <p className="text-[11px] text-slate-400">
                  Type <code className="text-emerald-800 bg-emerald-50 px-1 rounded">{`{{variable}}`}</code> for contact attributes, or <code className="text-emerald-800 bg-emerald-50 px-1 rounded">//tool_name</code> to invoke integrations.
                </p>
              </div>
            </div>
          ) : (
            /* ───────────────────────────────────────────────────────────── */
            /* TAB 2: VISUAL DAG WORKFLOW CANVAS                             */
            /* ───────────────────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
              {/* Zoom Controls */}
              <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-lg text-xs">
                <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1.5 hover:bg-slate-100 rounded">-</button>
                <span className="px-2 font-mono font-bold text-slate-700">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))} className="p-1.5 hover:bg-slate-100 rounded">+</button>
              </div>

              {/* Dotted Infinite Canvas */}
              <div
                className="flex-1 w-full h-full relative cursor-grab p-10 overflow-auto"
                style={{
                  backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
                  backgroundSize: '24px 24px',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: '0 0',
                }}
              >
                {/* SVG Connectors */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '1200px', minHeight: '600px' }}>
                  <path d="M 200 200 C 240 200, 240 140, 280 140" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 4" />
                  <path d="M 500 140 C 540 140, 540 200, 580 200" fill="none" stroke="#059669" strokeWidth="2.5" />
                  <path d="M 580 70 L 580 180" fill="none" stroke="#059669" strokeWidth="2.5" />
                  <path d="M 800 200 C 850 200, 850 120, 900 120" fill="none" stroke="#059669" strokeWidth="2.5" />
                  <path d="M 800 220 C 850 220, 850 280, 900 280" fill="none" stroke="#059669" strokeWidth="2.5" />
                  <path d="M 580 240 L 580 350" fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray="4 4" />
                </svg>

                {/* Nodes */}
                {workflowNodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                      className={`absolute w-60 p-3 rounded-xl border bg-white shadow-xs transition-all cursor-pointer ${
                        isSelected ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                          {node.type}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{node.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{node.subtitle}</p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Drawer: Node Inspector */}
              <div className="h-28 bg-white border-t border-slate-200 p-4 shrink-0 flex items-start justify-between z-20 shadow-lg">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900">{selectedNode.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200">
                      {selectedNode.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{selectedNode.details}</p>
                </div>
                <button
                  onClick={() => toast.info(`Configuring node: ${selectedNode.title}`)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  Configure Node
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL: REAL-TIME WEBRTC SIMULATOR / TEST SANDBOX ── */}
        <aside className={`${mobileStudioTab === 'preview' ? 'flex' : 'hidden'} xl:flex w-full xl:w-88 2xl:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20 overflow-y-auto`}>
          {/* Header & Tabs */}
          <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Preview agent</span>
            </div>
            {/* Simulator Mode Tabs: Web, Chat, Telephony */}
            <div className="flex items-center p-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold">
              <button
                onClick={() => setSimulatorMode('web')}
                className={`px-2 py-0.5 rounded ${simulatorMode === 'web' ? 'bg-emerald-950 text-white font-bold' : 'text-slate-600'}`}
              >
                Web
              </button>
              <button
                onClick={() => setSimulatorMode('chat')}
                className={`px-2 py-0.5 rounded ${simulatorMode === 'chat' ? 'bg-emerald-950 text-white font-bold' : 'text-slate-600'}`}
              >
                Chat
              </button>
              <button
                onClick={() => setSimulatorMode('telephony')}
                className={`px-2 py-0.5 rounded ${simulatorMode === 'telephony' ? 'bg-emerald-950 text-white font-bold' : 'text-slate-600'}`}
              >
                Telephony
              </button>
            </div>
          </div>

          {/* Dynamic Variables Pill Strip */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              <strong className="text-slate-800">{Object.keys(variables).length}</strong> variables injected
            </span>
            <button
              onClick={() => setShowVariableModal(true)}
              className="text-emerald-800 font-semibold hover:underline"
            >
              Set values
            </button>
          </div>

          {/* Avatar & Call Controls */}
          <div className="p-5 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50/40 to-white border-b border-slate-200">
            <div className="relative mb-3">
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 -m-3 rounded-full border-2 border-emerald-400/50 animate-ping" />
                  <div className="absolute inset-0 -m-6 rounded-full border border-emerald-300/40 animate-pulse" />
                </>
              )}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white text-2xl font-bold shadow-md border-3 border-white">
                {agentName.slice(0, 1)}
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900">{agentName}</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {isSpeaking ? 'Speaking… (195ms V2V)' : isCallActive ? 'Listening to caller…' : 'Ready to Connect'}
            </p>

            <div className="mt-3.5 w-full">
              {!isCallActive ? (
                <button
                  type="button"
                  onClick={handleStartCall}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Start talking</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                      isMuted ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Hang Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transcript & Latency Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {conversation.map((turn) => {
              const isAgent = turn.sender === 'agent';
              return (
                <div key={turn.id} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-700">{isAgent ? agentName : 'You (Caller)'}</span>
                    {turn.latencyMs && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[9px] border border-emerald-200">
                        {turn.latencyMs}ms V2V
                      </span>
                    )}
                  </div>
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed shadow-2xs ${
                      isAgent
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                        : 'bg-emerald-950 text-white rounded-tr-sm'
                    }`}
                  >
                    {turn.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input text sender */}
          <form onSubmit={handleSendUserMessage} className="p-3 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={!isCallActive && simulatorMode === 'web'}
                placeholder={isCallActive ? 'Type what caller says...' : 'Start call or switch to Chat...'}
                value={userSpeechInput}
                onChange={(e) => setUserSpeechInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 disabled:bg-slate-50"
              />
              <button
                type="submit"
                disabled={!userSpeechInput.trim()}
                className="px-3 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold disabled:opacity-40 transition-all cursor-pointer"
              >
                Send
              </button>
            </div>
          </form>
        </aside>

        {/* ── SLIDE-OUT AI COMPOSER DRAWER ── */}
        {isComposerOpen && (
          <div className="w-80 bg-white border-l border-slate-200 shadow-xl flex flex-col shrink-0 animate-slide-left z-30">
            <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">AI Composer Copilot</span>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 leading-relaxed">
                <strong className="block mb-1">What would you like to refine?</strong>
                Ask me to adjust Maya's tone, write strict compliance guardrails, or attach a booking tool schema.
              </div>
            </div>

            <form onSubmit={handleComposerSubmit} className="p-3 border-t border-slate-200 space-y-2">
              <textarea
                rows={3}
                value={composerInput}
                onChange={(e) => setComposerInput(e.target.value)}
                placeholder="e.g. Add a guardrail preventing Maya from giving refunds directly..."
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isComposerLoading || !composerInput.trim()}
                className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isComposerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Update Agent Prompt</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── MODAL: CHOOSE VOICE (Discover vs My Voices) ── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose Voice</h3>
                <p className="text-xs text-slate-500">Select the acoustic timbre that best suits your use case.</p>
              </div>
              <button onClick={() => setShowVoiceModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Collection */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search voices..."
                  value={voiceSearch}
                  onChange={(e) => setVoiceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <select
                value={voiceFilterCategory}
                onChange={(e) => setVoiceFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold"
              >
                <option value="All collections">All collections</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            {/* Voices List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {AVAILABLE_VOICES.map((v) => (
                <div
                  key={v.id}
                  onClick={() => {
                    setSelectedVoice(`${v.name} (${v.provider})`);
                    setShowVoiceModal(false);
                    toast.success(`Selected voice "${v.name}" (${v.provider}).`);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                      {v.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{v.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                          {v.gender}
                        </span>
                        <span className="text-[10px] text-slate-400">{v.accent}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.tags}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(`Hello, this is ${v.name}. Ready to assist.`);
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SET DYNAMIC VARIABLES ── */}
      {showVariableModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Set Dynamic Variables</h3>
                <p className="text-xs text-slate-500">Inject mock caller parameters into the test simulator.</p>
              </div>
              <button onClick={() => setShowVariableModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {Object.entries(variables).map(([k, v]) => (
                <div key={k}>
                  <label className="font-mono font-bold text-slate-700 block mb-1">{`{{${k}}}`}</label>
                  <input
                    type="text"
                    value={v}
                    onChange={(e) => setVariables({ ...variables, [k]: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-900 font-medium"
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowVariableModal(false);
                  toast.success('Dynamic variables updated for simulator session.');
                }}
                className="px-4 py-2 bg-emerald-950 text-white rounded-lg text-xs font-semibold"
              >
                Apply Variables
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
