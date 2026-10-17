import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Sliders,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  Mic,
  MicOff,
  Radio,
  Play,
  RotateCcw,
  Volume2,
  CheckCircle2,
  BookOpen,
  Boxes,
  Cpu,
  ChevronDown,
  DollarSign,
  Zap,
  ExternalLink,
  MessageSquare,
  Search,
  X,
  Loader2,
  Webhook,
  FileText,
  Smartphone,
  Headphones,
  SlidersHorizontal
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getAgent, updateAgent, getAgentBuilderResources } from '../../api/agents';
import {
  AVAILABLE_VOICES,
  SUPPORTED_LANGUAGES as LANGUAGES,
  TELEPHONY_PROVIDER_OPTIONS as TELEPHONY_OPTIONS,
  STT_PROVIDER_OPTIONS as STT_OPTIONS,
  LLM_PROVIDER_OPTIONS as LLM_OPTIONS,
  TTS_PROVIDER_OPTIONS as TTS_OPTIONS,
  DEFAULT_VOICE_PROMPT_TEMPLATE,
  DEFAULT_INBOUND_GREETING,
  DEFAULT_OUTBOUND_GREETING,
  populateOrgName,
} from '../../utils/constants';
import { Agent, Integration, KnowledgeBase, Voice } from '../../types';

interface ChatTurn {
  id: string;
  sender: 'caller' | 'agent';
  text: string;
  timestamp: string;
  latencyMs?: number;
}

type SettingsSection = 
  | 'persona'
  | 'greetings'
  | 'voice'
  | 'intelligence'
  | 'telephony'
  | 'kb'
  | 'tools';

const splitEntries = (value: string) => value.split(/[\n,]/).map((entry) => entry.trim()).filter(Boolean);

export const AgentStudioPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentWorkspace, organizationName } = useWorkspace();
  const orgName = organizationName || 'our organization';

  const [rawAgent, setRawAgent] = useState<Agent | null>(null);

  // Auto-activate test sandbox when ?tab=test is passed
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'test') {
      setMobileStudioTab('preview');
      const testEl = document.getElementById('studio-simulator-panel');
      if (testEl) {
        testEl.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setMobileStudioTab('editor');
    }
  }, [location.search]);

  // ── 1. AGENT IDENTITY & PERSONA ──
  const [agentName, setAgentName] = useState('Cathy');
  const [agentRole, setAgentRole] = useState('Voice Assistant');
  const [description, setDescription] = useState('');
  const [agentStatus, setAgentStatus] = useState<'active' | 'draft'>('active');
  const [callDirection, setCallDirection] = useState<'inbound' | 'outbound' | 'both'>('inbound');
  const [primaryLanguage, setPrimaryLanguage] = useState('en-IN');
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>(['hi-IN']);
  const [systemPrompt, setSystemPrompt] = useState(() => populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName));
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);

  // ── 2. VOICE & SPEECH ──
  const [ttsProvider, setTtsProvider] = useState<Voice['provider']>('fish-audio');
  const [selectedVoiceId, setSelectedVoiceId] = useState('fish-swara-hi-en');
  const [selectedVoiceName, setSelectedVoiceName] = useState('Swara');
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pauseBeforeSpeakingMs, setPauseBeforeSpeakingMs] = useState(400);
  const [allowInterruptions, setAllowInterruptions] = useState(true);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState<'Sensitive' | 'Balanced' | 'Firm'>('Balanced');
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [formatSpokenDigits, setFormatSpokenDigits] = useState(true);

  // ── 3. TELEPHONY & PHONE NUMBERS ──
  const [telephonyProvider, setTelephonyProvider] = useState('plivo');
  const [assignedPhoneNumber, setAssignedPhoneNumber] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [escalationPhoneNumber, setEscalationPhoneNumber] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);

  // ── 4. STT & LLM INTELLIGENCE ──
  const [sttProvider, setSttProvider] = useState('deepgram');
  const [sttKeyterms, setSttKeyterms] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-mini');
  const [llmTemperaturePreset, setLlmTemperaturePreset] = useState<'Consistent' | 'Balanced' | 'Creative'>('Balanced');
  const [responseEagerness, setResponseEagerness] = useState<'Patient' | 'Balanced' | 'Eager'>('Balanced');

  // ── 5. GREETINGS & CALL FLOW ──
  const [firstSpeaker, setFirstSpeaker] = useState<'agent' | 'caller'>('agent');
  const [greetingMode, setGreetingMode] = useState<'static' | 'dynamic'>('static');
  const [inboundGreeting, setInboundGreeting] = useState(() => populateOrgName(DEFAULT_INBOUND_GREETING, orgName));
  const [outboundGreeting, setOutboundGreeting] = useState(() => populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName));
  const [silenceBehavior, setSilenceBehavior] = useState<'prompt-again' | 'handoff' | 'end-call'>('prompt-again');
  const [silenceSeconds, setSilenceSeconds] = useState(5);
  const [voicemailDetection, setVoicemailDetection] = useState(true);
  const [ivrHangup, setIvrHangup] = useState(false);
  const [callTimezone, setCallTimezone] = useState('Asia/Kolkata (IST)');

  // ── 6. CONTEXT (KNOWLEDGE BASE & TOOLS) ──
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>([]);
  const [kbSearch, setKbSearch] = useState('');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  // ── 7. NAVIGATION & ACTIVE SECTION ──
  const [activeSection, setActiveSection] = useState<SettingsSection>('persona');
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectSection = (section: SettingsSection) => {
    setActiveSection(section);
    setMobileStudioTab('editor');
    if (location.search.includes('tab=')) {
      navigate(`/agents/${id}`, { replace: true });
    }
    const editorContainer = document.getElementById('studio-editor-container');
    if (editorContainer) {
      editorContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── 8. DYNAMIC MODALS ──
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceFilterCategory, setVoiceFilterCategory] = useState('All collections');
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({
    caller_name: 'Evelyn Reed',
    reservation_date: 'October 15, 2026',
    room_type: 'Oceanfront Penthouse Suite',
    loyalty_tier: 'Diamond Ambassador',
  });

  // ── 9. SIMULATOR STATE ──
  const [simulatorMode, setSimulatorMode] = useState<'web' | 'chat' | 'telephony'>('web');
  const [mobileStudioTab, setMobileStudioTab] = useState<'editor' | 'settings' | 'preview'>('editor');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState<ChatTurn[]>([
    {
      id: 'turn-1',
      sender: 'agent',
      text: 'Hello! I am ready to assist you. How can I help today?',
      timestamp: 'Just now',
      latencyMs: 185,
    },
  ]);
  const [userSpeechInput, setUserSpeechInput] = useState('');



  // Filtered Voices by selected TTS provider
  const voicesForProvider = useMemo(
    () => AVAILABLE_VOICES.filter((voice) => voice.provider === ttsProvider),
    [ttsProvider]
  );

  const selectedVoiceObj = voicesForProvider.find((v) => v.id === selectedVoiceId) || AVAILABLE_VOICES.find((v) => v.id === selectedVoiceId) || AVAILABLE_VOICES[0];

  // Load Agent and Builder Resources
  useEffect(() => {
    if (!id) return;
    let isCurrent = true;
    setIsLoadingAgent(true);

    // 1. Fetch Agent
    getAgent(id)
      .then((agent) => {
        if (!isCurrent || !agent) return;
        setRawAgent(agent);
        setAgentName(agent.name || 'Cathy');
        setAgentRole(agent.role || 'Voice Assistant');
        if (agent.description) setDescription(agent.description);
        setAgentStatus(agent.status === 'draft' ? 'draft' : 'active');
        if (agent.systemPrompt) setSystemPrompt(agent.systemPrompt);
        if (agent.callDirection) setCallDirection(agent.callDirection);
        if (agent.primaryLanguage) setPrimaryLanguage(agent.primaryLanguage);
        else if (agent.language) setPrimaryLanguage(agent.language);
        if (agent.additionalLanguages && Array.isArray(agent.additionalLanguages)) {
          setAdditionalLanguages(agent.additionalLanguages);
        }
        if (agent.telephonyProvider) setTelephonyProvider(agent.telephonyProvider);
        if (agent.phoneNumber) setAssignedPhoneNumber(agent.phoneNumber);
        if (agent.escalationPhoneNumber) setEscalationPhoneNumber(agent.escalationPhoneNumber);
        if (agent.sttProvider) setSttProvider(agent.sttProvider);
        if (agent.sttKeyterms) {
          setSttKeyterms(Array.isArray(agent.sttKeyterms) ? agent.sttKeyterms.join(', ') : agent.sttKeyterms);
        }
        if (agent.model) setSelectedModel(agent.model);
        if (agent.ttsProvider) setTtsProvider(agent.ttsProvider as any);
        if (agent.voiceId) setSelectedVoiceId(agent.voiceId);
        if (agent.voiceName) setSelectedVoiceName(agent.voiceName);
        if (typeof agent.speakingRate === 'number') setSpeakingRate(agent.speakingRate);
        if (typeof agent.pauseBeforeSpeakingMs === 'number') setPauseBeforeSpeakingMs(agent.pauseBeforeSpeakingMs);
        if (typeof agent.allowInterruptions === 'boolean') setAllowInterruptions(agent.allowInterruptions);
        if (agent.greetingMode) setGreetingMode(agent.greetingMode);
        if (agent.inboundGreeting) setInboundGreeting(agent.inboundGreeting);
        if (agent.outboundGreeting) setOutboundGreeting(agent.outboundGreeting);
        if (agent.silenceBehavior) setSilenceBehavior(agent.silenceBehavior);
        if (typeof agent.silenceTimeoutSeconds === 'number') setSilenceSeconds(agent.silenceTimeoutSeconds);
        if (agent.knowledgeBaseIds && Array.isArray(agent.knowledgeBaseIds)) {
          setSelectedKbIds(agent.knowledgeBaseIds);
        }
        if (agent.toolAllowlist && Array.isArray(agent.toolAllowlist)) {
          setSelectedTools(agent.toolAllowlist);
        }

        const activeGreeting = agent.inboundGreeting || agent.greetingText || agent.outboundGreeting;
        if (activeGreeting) {
          setConversation([
            {
              id: 'turn-1',
              sender: 'agent',
              text: activeGreeting,
              timestamp: 'Just now',
              latencyMs: 180,
            },
          ]);
        }
      })
      .catch((err) => {
        console.error('Failed to load agent:', err);
        toast.error('Could not load agent details', err?.message || 'Server error');
      })
      .finally(() => {
        if (isCurrent) setIsLoadingAgent(false);
      });

    // 2. Fetch Builder Resources (KBs, Integrations, Numbers)
    getAgentBuilderResources()
      .then((resources) => {
        if (!isCurrent || !resources) return;
        if (resources.knowledge_bases) {
          setKnowledgeBases(resources.knowledge_bases as any);
        }
        if (resources.integrations) {
          setIntegrations(
            resources.integrations.map((item) => ({
              id: item.id,
              name: item.name,
              provider: item.provider as any,
              category: 'crm',
              connected: item.is_connected,
              description: `Connected integration for ${item.name}`,
              workspaceId: currentWorkspace?.id || '',
              iconName: 'database',
              apiKeySet: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }))
          );
        }
        if (resources.phone_numbers) {
          const combined = [
            ...(resources.phone_numbers.available || []),
            ...(resources.phone_numbers.assigned || []),
          ];
          setAvailableNumbers(combined);
        }
      })
      .catch((err) => {
        console.warn('Failed to load builder resources:', err);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, currentWorkspace?.id]);

  // Handle Save & Publish
  const handleSaveAndPublish = async () => {
    if (!id) return;
    setIsSaving(true);
    try {
      const parsedKeyterms = splitEntries(sttKeyterms);
      const greetingText = callDirection === 'outbound' ? outboundGreeting.trim() : inboundGreeting.trim();

      await updateAgent(id, {
        name: agentName.trim(),
        role: agentRole.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        callDirection,
        language: primaryLanguage,
        primaryLanguage,
        additionalLanguages,
        supportedLanguages: [...new Set([primaryLanguage, ...additionalLanguages])],
        model: selectedModel,
        voiceId: selectedVoiceId,
        voiceName: selectedVoiceObj?.name || selectedVoiceName,
        status: 'active',
        telephonyProvider,
        phoneNumber: assignedPhoneNumber || undefined,
        phoneNumberId: phoneNumberId || undefined,
        escalationPhoneNumber: escalationPhoneNumber.trim() || undefined,
        sttProvider,
        ttsProvider,
        sttKeyterms: parsedKeyterms,
        greetingMode,
        greetingText,
        inboundGreeting: inboundGreeting.trim(),
        outboundGreeting: outboundGreeting.trim(),
        pauseBeforeSpeakingMs,
        allowInterruptions,
        speakingRate,
        silenceBehavior,
        silenceTimeoutSeconds: silenceSeconds,
        knowledgeBaseIds: selectedKbIds,
        toolAllowlist: selectedTools,
      });

      setAgentStatus('active');
      toast.success('Agent saved and live!', `“${agentName}” configuration updated successfully.`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save agent', err?.message || 'Please check your inputs and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test Simulator call handler
  const handleStartCall = () => {
    setIsCallActive(true);
    setIsSpeaking(true);

    const greetingToSpeak = callDirection === 'outbound' ? outboundGreeting : inboundGreeting;
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(greetingToSpeak);
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
      let responseText = `I hear you loud and clear. Regarding "${callerText}", everything is configured and ready for ${orgName}. How else may I assist you?`;
      if (lower.includes('booking') || lower.includes('reserve') || lower.includes('appointment')) {
        responseText = `Certainly! I have scheduled that for ${variables.reservation_date || 'your requested date'}. Would you like me to send a confirmation SMS?`;
      } else if (lower.includes('human') || lower.includes('agent') || lower.includes('manager')) {
        responseText = escalationPhoneNumber
          ? `I understand. I am transferring you directly to our team at ${escalationPhoneNumber}. Please hold.`
          : `Connecting you with a senior representative right now. Please hold for just a moment.`;
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
    }, 380);
  };



  const filteredKnowledgeBases = useMemo(() => {
    const q = kbSearch.trim().toLowerCase();
    if (!q) return knowledgeBases;
    return knowledgeBases.filter((kb) => kb.name.toLowerCase().includes(q) || (kb.description && kb.description.toLowerCase().includes(q)));
  }, [knowledgeBases, kbSearch]);

  const toggleKb = (kbId: string) => {
    setSelectedKbIds((prev) =>
      prev.includes(kbId) ? prev.filter((id) => id !== kbId) : [...prev, kbId]
    );
  };

  const toggleTool = (toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const toggleAdditionalLanguage = (langCode: string) => {
    if (langCode === primaryLanguage) return;
    setAdditionalLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((c) => c !== langCode) : [...prev, langCode]
    );
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
              className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white px-1.5 py-0.5 rounded border border-transparent focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 max-w-[120px] sm:max-w-[180px] transition-all truncate"
            />
            <span
              className={`text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 ${
                agentStatus === 'active'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {agentStatus === 'active' ? 'Active' : 'Draft'}
            </span>
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
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-400">Model:</span>
            <span className="font-bold text-slate-900">{selectedModel}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile View Switcher (< lg) */}
          <div className="lg:hidden flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setMobileStudioTab('settings')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mobileStudioTab === 'settings' ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Sections
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileStudioTab('editor');
                if (location.search.includes('tab=')) {
                  navigate(`/agents/${id}`, { replace: true });
                }
              }}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mobileStudioTab === 'editor' ? 'bg-white text-emerald-950 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Configure
            </button>
            <button
              type="button"
              onClick={() => setMobileStudioTab('preview')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                mobileStudioTab === 'preview' ? 'bg-emerald-950 text-white shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Test
            </button>
          </div>

          {/* Desktop/Tablet Mode Switcher (>= lg) */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMobileStudioTab('editor');
                if (location.search.includes('tab=')) {
                  navigate(`/agents/${id}`, { replace: true });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mobileStudioTab !== 'preview'
                  ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Configure Form</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileStudioTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mobileStudioTab === 'preview'
                  ? 'bg-emerald-950 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Headphones className={`w-3.5 h-3.5 ${mobileStudioTab === 'preview' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Test Simulator</span>
            </button>
          </div>

          {/* Save & Publish Agent CTA */}
          <button
            onClick={handleSaveAndPublish}
            disabled={isSaving}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSaving ? 'Saving…' : 'Save & Publish'}</span>
          </button>
        </div>
      </header>

      {/* ── WORKSPACE BODY ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── SUB-LEFT RAIL: CATEGORY INSPECTION NAVIGATION ── */}
        {
          <div className={`${mobileStudioTab === 'settings' ? 'flex' : 'hidden'} lg:flex border-r border-slate-200 shrink-0 bg-slate-50 w-full sm:w-56 lg:w-60 h-full overflow-y-auto p-3 flex-col gap-4 text-xs`}>
            {/* Group 1: Setup & Identity */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Setup & Persona</span>
              <button
                onClick={() => handleSelectSection('persona')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'persona'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  <span>General & Prompt</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>

              <button
                onClick={() => handleSelectSection('greetings')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'greetings'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call Direction & Greeting</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>
            </div>

            {/* Group 2: Voice & Intelligence */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Voice & Models</span>
              <button
                onClick={() => handleSelectSection('voice')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'voice' || activeSection === 'intelligence'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Voice & Model</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>

              <button
                onClick={() => handleSelectSection('telephony')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'telephony'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Telephony & Escalation</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>
            </div>

            {/* Group 3: Context & Integrations */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Knowledge & Tools</span>
              <button
                onClick={() => handleSelectSection('kb')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'kb'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Knowledge Base ({selectedKbIds.length})</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>

              <button
                onClick={() => handleSelectSection('tools')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                  activeSection === 'tools'
                    ? 'bg-white text-emerald-950 font-bold border-l-3 border-emerald-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Boxes className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tools & Integrations ({selectedTools.length})</span>
                </span>
                <span className="text-slate-400">›</span>
              </button>
            </div>
          </div>
        }

        {/* ── CENTER STAGE: EDIT MODE FORM CARDS ── */}
        <div id="studio-editor-container" className={`${mobileStudioTab === 'editor' ? 'flex' : 'hidden'} 2xl:flex flex-1 flex-col overflow-y-auto min-w-0 bg-white`}>
            <div className="p-6 max-w-4xl space-y-6 mx-auto w-full pb-28">

              {/* SECTION 1: GENERAL & PERSONA */}
              {(activeSection === 'persona') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">General Identity & Persona Blueprint</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure your agent's identity, language, and core instructions.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Step 1 Sync
                    </span>
                  </div>

                  {/* Name, Role & Description */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Agent Name</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g. Cathy, Maya, Support Bot"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Role / Headline</label>
                      <input
                        type="text"
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        placeholder="e.g. Customer Support Specialist"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is this agent's scope and purpose?"
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Languages */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Primary Language</label>
                      <select
                        value={primaryLanguage}
                        onChange={(e) => setPrimaryLanguage(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Additional Multilingual Support</label>
                      <div className="flex flex-wrap gap-1.5 min-h-10 p-2 rounded-xl border border-slate-200 bg-slate-50 items-center">
                        {additionalLanguages.map((code) => {
                          const langObj = LANGUAGES.find((l) => l.id === code);
                          return (
                            <span
                              key={code}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-semibold"
                            >
                              <span>{langObj?.name || code}</span>
                              <button
                                type="button"
                                onClick={() => toggleAdditionalLanguage(code)}
                                className="text-emerald-700 hover:text-emerald-950"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) toggleAdditionalLanguage(e.target.value);
                          }}
                          className="bg-transparent text-[11px] text-slate-500 font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="">+ Add language</option>
                          {LANGUAGES.filter((l) => l.id !== primaryLanguage && !additionalLanguages.includes(l.id)).map((l) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* System Prompt Blueprint */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs font-bold text-slate-900 block">System Persona & Prompt Instructions</label>
                        <p className="text-[11px] text-slate-500">The behavioral blueprint that guides this agent's tone, reasoning, and policies.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSystemPrompt(populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName))}
                          className="text-[11px] text-slate-500 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Template</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      rows={isPromptExpanded ? 16 : 8}
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 leading-relaxed focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{systemPrompt.length} characters · {systemPrompt.split(/\s+/).filter(Boolean).length} words</span>
                      <button
                        type="button"
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="text-emerald-800 font-semibold hover:underline cursor-pointer"
                      >
                        {isPromptExpanded ? 'Collapse' : 'Expand full editor'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: VOICE & TELEPHONY */}
              {/* SECTION: VOICE & MODEL */}
              {(activeSection === 'voice' || activeSection === 'intelligence') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Voice & AI Models</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure foundation AI engines (LLM, STT, TTS), vocal timbre, and conversation pacing.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Step 2 & 3 Sync
                    </span>
                  </div>

                  {/* 1. Foundation AI Models: LLM, STT, TTS */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <label className="text-xs font-bold text-slate-900 block">Foundation AI Engines</label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">LLM Model</label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                        >
                          {LLM_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name}{opt.recommended ? ' · Recommended' : ''}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-[10px] text-slate-500">Core intelligence & reasoning engine.</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">STT Provider</label>
                        <select
                          value={sttProvider}
                          onChange={(e) => setSttProvider(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                        >
                          {STT_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name}{opt.recommended ? ' · Recommended' : ''}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-[10px] text-slate-500">Real-time caller speech transcription.</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">TTS Provider</label>
                        <select
                          value={ttsProvider}
                          onChange={(e) => {
                            const newProvider = e.target.value as any;
                            setTtsProvider(newProvider);
                            const matching = AVAILABLE_VOICES.find((v) => v.provider === newProvider);
                            if (matching) {
                              setSelectedVoiceId(matching.id);
                              setSelectedVoiceName(matching.name);
                            }
                          }}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                        >
                          {TTS_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.name}{opt.recommended ? ' · Recommended' : ''}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-[10px] text-slate-500">Text-to-speech audio synthesis engine.</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Active Voice Timbre & Audio Pacing */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Active Voice */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 block">Active Voice</label>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                          {selectedVoiceObj?.gender || 'Voice'} • {selectedVoiceObj?.accent || 'Natural'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowVoiceModal(true)}
                          className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-900 flex items-center justify-between cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{selectedVoiceObj?.name || selectedVoiceName}</span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              window.speechSynthesis.cancel();
                              const utterance = new SpeechSynthesisUtterance(`Hello! This is ${selectedVoiceObj?.name || 'Swara'}. How can I help you today?`);
                              utterance.rate = speakingRate;
                              window.speechSynthesis.speak(utterance);
                            }
                          }}
                          className="h-10 px-3 rounded-xl border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          title="Preview voice"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Preview</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">Acoustic timbre used for live conversation streaming.</p>
                    </div>

                    {/* Voice Speed / Rate Slider */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block">Voice Speed / Rate</label>
                          <p className="text-[10px] text-slate-500">Conversational pacing (1.00x normal).</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {speakingRate !== 1.0 && (
                            <button
                              type="button"
                              onClick={() => setSpeakingRate(1.0)}
                              className="text-[10px] font-semibold text-slate-400 hover:text-emerald-700 cursor-pointer"
                            >
                              Reset
                            </button>
                          )}
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200">
                            {Number(speakingRate).toFixed(2)}x
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <input
                          type="range"
                          min="0.8"
                          max="1.3"
                          step="0.05"
                          value={speakingRate}
                          onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                          aria-label="Voice speed slider"
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 font-mono">
                          <span>0.80x (Slower)</span>
                          <span className={speakingRate === 1 ? 'text-emerald-700 font-bold' : ''}>1.00x (Natural)</span>
                          <span>1.30x (Faster)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Speech Keyterms & LLM Temperature */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Speech Vocabulary Boost (STT Keyterms)</label>
                      <textarea
                        rows={2}
                        value={sttKeyterms}
                        onChange={(e) => setSttKeyterms(e.target.value)}
                        placeholder="e.g. Swiggy, UPI, Zomato, Aadhaar, HDFC, OTP (comma or newline separated)"
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      <p className="mt-1 text-[11px] text-slate-500">Provide company names, industry acronyms, or product terms to boost phonetic recognition.</p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <label className="text-xs font-bold text-slate-800 block">LLM Temperature Preset</label>
                      <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
                        {(['Consistent', 'Balanced', 'Creative'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setLlmTemperaturePreset(mode)}
                            className={`py-1.5 rounded-md ${llmTemperaturePreset === mode ? 'bg-white text-emerald-950 font-bold shadow-2xs' : 'text-slate-600'}`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 3: TELEPHONY & PHONE NUMBERS */}
              {(activeSection === 'telephony') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Telephony Routing & Phone Allocation</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Bind assigned phone numbers, carrier provider, and human escalation handoff.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Carrier Integration
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Telephony Provider</label>
                      <select
                        value={telephonyProvider}
                        onChange={(e) => setTelephonyProvider(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                      >
                        {TELEPHONY_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>{opt.name}{opt.recommended ? ' · Recommended' : ''}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-slate-500">Carrier provider for phone networks and SIP trunks.</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-800 block mb-1">Escalation / Human Transfer Phone Number</label>
                      <input
                        type="text"
                        value={escalationPhoneNumber}
                        onChange={(e) => setEscalationPhoneNumber(e.target.value)}
                        placeholder="e.g. +91 98765 43210 or +1 415 555 2671"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                      <p className="mt-1 text-[11px] text-slate-500">Destination phone number to transfer caller upon human escalation request.</p>
                    </div>
                  </div>
                </div>
              )}



              {/* SECTION: CALL DIRECTION & GREETING */}
              {(activeSection === 'greetings') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Call Direction & Greeting</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Configure call direction and initial opening greetings.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      Step 1 Sync
                    </span>
                  </div>

                  {/* Call Direction */}
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1.5">Call Direction</label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setCallDirection('inbound')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          callDirection === 'inbound' ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <PhoneIncoming className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Inbound only</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallDirection('outbound')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          callDirection === 'outbound' ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Outbound only</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCallDirection('both')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          callDirection === 'both' ? 'bg-white text-emerald-950 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Both (2-Way)</span>
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {callDirection === 'inbound'
                        ? 'Handles incoming calls from customers when they dial your assigned phone number.'
                        : callDirection === 'outbound'
                        ? 'Places proactive outbound calls to contacts, leads, or existing customers.'
                        : 'Handles both incoming inquiries and places proactive outbound campaign calls.'}
                    </p>
                  </div>

                  {/* Separate Inbound & Outbound Greetings */}
                  <div className="space-y-4">
                    {(callDirection === 'inbound' || callDirection === 'both') && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800">Inbound Call Greeting</label>
                          <span className="text-[10px] text-slate-400">Spoken when caller dials into this agent</span>
                        </div>
                        <textarea
                          rows={3}
                          value={inboundGreeting}
                          onChange={(e) => setInboundGreeting(e.target.value)}
                          placeholder="e.g. Hello, thanks for calling. How can I help you today?"
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    )}

                    {(callDirection === 'outbound' || callDirection === 'both') && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-800">Outbound Call Greeting</label>
                          <span className="text-[10px] text-slate-400">Spoken when customer answers outbound dialer</span>
                        </div>
                        <textarea
                          rows={3}
                          value={outboundGreeting}
                          onChange={(e) => setOutboundGreeting(e.target.value)}
                          placeholder="e.g. Hi, this is an automated call regarding..."
                          className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 6: KNOWLEDGE BASE */}
              {(activeSection === 'kb') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Knowledge Base Integration</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Select workspace documents and vector databases for grounding agent answers.</p>
                    </div>
                    <Link
                      to="/knowledge"
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <span>Manage KBs</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={kbSearch}
                      onChange={(e) => setKbSearch(e.target.value)}
                      placeholder="Search available knowledge bases..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredKnowledgeBases.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        No knowledge bases found. Create one in the Knowledge Base section.
                      </div>
                    ) : (
                      filteredKnowledgeBases.map((kb) => {
                        const isChecked = selectedKbIds.includes(kb.id);
                        return (
                          <div
                            key={kb.id}
                            onClick={() => toggleKb(kb.id)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isChecked ? 'border-emerald-600 bg-emerald-50/30' : 'border-slate-200 bg-white hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleKb(kb.id)}
                                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                              />
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{kb.name}</h4>
                                <p className="text-[11px] text-slate-500 truncate">{kb.description || 'Vector knowledge repository'}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Linked
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 7: TOOLS & INTEGRATIONS */}
              {(activeSection === 'tools') && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Connected Tools & Integrations</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Enable CRM tools, calendars, and system actions available to this agent during live calls.</p>
                    </div>
                    <Link
                      to="/integrations"
                      className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <span>Manage Integrations</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {integrations.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                        No connected integrations found in workspace.
                      </div>
                    ) : (
                      integrations.map((tool) => {
                        const isEnabled = selectedTools.includes(tool.id);
                        return (
                          <div
                            key={tool.id}
                            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                              isEnabled ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                <Boxes className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{tool.name}</h4>
                                <p className="text-[11px] text-slate-500">{tool.description}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleTool(tool.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isEnabled ? 'bg-emerald-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}




            </div>
        </div>

        {/* ── RIGHT PANEL: REAL-TIME WEBRTC SIMULATOR / TEST SANDBOX ── */}
        <aside
          id="studio-simulator-panel"
          className={`${mobileStudioTab === 'preview' ? 'flex' : 'hidden'} 2xl:flex w-full 2xl:w-88 bg-white border-l border-slate-200 flex flex-col shrink-0 z-20 overflow-y-auto`}
        >
          {/* Header & Tabs */}
          <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileStudioTab('editor');
                  if (location.search.includes('tab=')) {
                    navigate(`/agents/${id}`, { replace: true });
                  }
                }}
                className="2xl:hidden flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer mr-1 shadow-2xs"
                title="Back to Configuration Form"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                <span>Configure Form</span>
              </button>
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

      </div>

      {/* ── MODAL: CHOOSE VOICE ── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-5 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Choose Voice ({ttsProvider})</h3>
                <p className="text-xs text-slate-500">Voices available for your selected provider.</p>
              </div>
              <button onClick={() => setShowVoiceModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search voices..."
                value={voiceSearch}
                onChange={(e) => setVoiceSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            {/* Voices List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {(voicesForProvider.length > 0 ? voicesForProvider : AVAILABLE_VOICES)
                .filter((v) => !voiceSearch || v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.language?.toLowerCase().includes(voiceSearch.toLowerCase()))
                .map((v) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setSelectedVoiceId(v.id);
                      setSelectedVoiceName(v.name);
                      setShowVoiceModal(false);
                      toast.success(`Selected voice "${v.name}".`);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedVoiceId === v.id ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50'
                    }`}
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
                          {v.accent && <span className="text-[10px] text-slate-400">{v.accent}</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{v.language} • {v.provider}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                          const utterance = new SpeechSynthesisUtterance(`Hello, this is ${v.name}. Ready to assist you.`);
                          utterance.rate = speakingRate;
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
