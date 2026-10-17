import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { createAgent, updateAgent, getAgent, getAgentBuilderResources } from '../../api/agents';
import { formatIntegrations } from '../../api/integrations';
import {
  AVAILABLE_VOICES,
  DEFAULT_VOICE_PROMPT_TEMPLATE,
  DEFAULT_INBOUND_GREETING,
  DEFAULT_OUTBOUND_GREETING,
  populateOrgName,
  AGENT_CREATION_STEPS as STEPS,
  SUPPORTED_LANGUAGES as LANGUAGES,
  TELEPHONY_PROVIDER_OPTIONS as TELEPHONY_OPTIONS,
  STT_PROVIDER_OPTIONS as STT_OPTIONS,
  LLM_PROVIDER_OPTIONS as LLM_OPTIONS,
  TTS_PROVIDER_OPTIONS as TTS_OPTIONS,
  ProviderOption,
} from '../../utils/constants';
import { Agent, Integration, KnowledgeBase, Voice } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Folder,
  FolderOpen,
  Globe,
  Loader2,
  Mic,
  Pencil,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneForwarded,
  RotateCcw,
  Search,
  Sparkles,
  FileText,
  Copy,
} from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
  agent?: Agent | null;
  agentId?: string | null;
}

type Step = 1 | 2 | 3 | 4;

// Module-level cache to avoid repeating network roundtrips on modal re-open
let cachedResources: {
  stt?: any[];
  tts?: any[];
  llm?: any[];
  kbs?: KnowledgeBase[];
  integrations?: Integration[];
} | null = null;

export { DEFAULT_VOICE_PROMPT_TEMPLATE };

const splitEntries = (value: string) => value.split(/[\n,]/).map((entry) => entry.trim()).filter(Boolean);

const SelectField: React.FC<{
  label: string;
  value: string;
  options: ProviderOption[];
  onChange: (value: string) => void;
  icon: React.ReactNode;
}> = ({ label, value, options, onChange, icon }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-800">
      <span className="text-emerald-800">{icon}</span>{label}
    </span>
    <span className="relative block">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.name}{option.recommended ? ' · Recommended' : ''}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </span>
    <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-500">
      {options.find((option) => option.id === value)?.note}
    </span>
  </label>
);

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent = null,
  agentId = null,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { organizationName } = useWorkspace();
  const orgName = organizationName || 'our organization';

  const targetAgentId = agent?.id || agentId;
  const isEditMode = Boolean(targetAgentId);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [name, setName] = useState('Cathy');
  const [description, setDescription] = useState(`Handles incoming customer inquiries, bookings, and support for ${orgName} with structured call flows.`);
  const [systemPrompt, setSystemPrompt] = useState(() => populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName));
  const [callDirection, setCallDirection] = useState<'inbound' | 'outbound' | 'both'>('inbound');

  const [primaryLanguage, setPrimaryLanguage] = useState('en-IN');
  const [additionalLanguages, setAdditionalLanguages] = useState<string[]>(['hi-IN']);
  const [greetingMode, setGreetingMode] = useState<'static' | 'dynamic'>('static');
  const [inboundGreeting, setInboundGreeting] = useState(() => populateOrgName(DEFAULT_INBOUND_GREETING, orgName));
  const [outboundGreeting, setOutboundGreeting] = useState(() => populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName));
  const [pauseBeforeSpeakingMs, setPauseBeforeSpeakingMs] = useState(400);
  const [allowInterruptions, setAllowInterruptions] = useState(true);
  const [speakingRate, setSpeakingRate] = useState(1);
  const [silenceBehavior, setSilenceBehavior] = useState<'prompt-again' | 'handoff' | 'end-call'>('prompt-again');
  const [silenceTimeoutSeconds, setSilenceTimeoutSeconds] = useState(5);
  const [telephonyProvider, setTelephonyProvider] = useState('plivo');
  const [sttProvider, setSttProvider] = useState('deepgram');
  const [sttKeyterms, setSttKeyterms] = useState('');
  const [model, setModel] = useState('gpt-mini');
  const [ttsProvider, setTtsProvider] = useState<Voice['provider']>('fish-audio');
  const [voiceId, setVoiceId] = useState('fish-swara-hi-en');

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>([]);
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceLoadError, setResourceLoadError] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const [escalationPhoneNumber, setEscalationPhoneNumber] = useState('');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sttOptions, setSttOptions] = useState<ProviderOption[]>(STT_OPTIONS);
  const [llmOptions, setLlmOptions] = useState<ProviderOption[]>(LLM_OPTIONS);
  const [ttsOptions, setTtsOptions] = useState<Array<ProviderOption & { id: Voice['provider'] }>>(TTS_OPTIONS);

  const voicesForProvider = useMemo(
    () => AVAILABLE_VOICES.filter((voice) => voice.provider === ttsProvider),
    [ttsProvider]
  );

  const selectedVoice = voicesForProvider.find((voice) => voice.id === voiceId)
    || AVAILABLE_VOICES.find((voice) => voice.id === voiceId)
    || voicesForProvider[0]
    || AVAILABLE_VOICES[0];
  const readyIntegrations = integrations.filter((integration) => integration.connected);

  const primaryLangObj = useMemo(() => LANGUAGES.find((l) => l.id === primaryLanguage), [primaryLanguage]);
  const primaryLangName = primaryLangObj?.name || primaryLanguage;

  const additionalLangNames = useMemo(
    () => additionalLanguages.map((code) => LANGUAGES.find((l) => l.id === code)?.name || code),
    [additionalLanguages]
  );

  const telephonyObj = useMemo(() => TELEPHONY_OPTIONS.find((t) => t.id === telephonyProvider), [telephonyProvider]);
  const telephonyName = telephonyObj?.name || telephonyProvider;

  const sttObj = useMemo(() => sttOptions.find((s) => s.id === sttProvider), [sttOptions, sttProvider]);
  const sttName = sttObj?.name || sttProvider;

  const llmObj = useMemo(() => llmOptions.find((m) => m.id === model), [llmOptions, model]);
  const llmName = llmObj?.name || model;

  const ttsObj = useMemo(() => ttsOptions.find((t) => t.id === ttsProvider), [ttsOptions, ttsProvider]);
  const ttsName = ttsObj?.name || ttsProvider;

  const selectedKBs = useMemo(
    () => knowledgeBases.filter((kb) => selectedKbIds.includes(kb.id)),
    [knowledgeBases, selectedKbIds]
  );

  const selectedToolList = useMemo(
    () => readyIntegrations.filter((tool) => selectedTools.includes(tool.id)),
    [readyIntegrations, selectedTools]
  );

  const parsedKeyterms = useMemo(() => splitEntries(sttKeyterms), [sttKeyterms]);

  const filteredKnowledgeBases = useMemo(() => {
    const query = knowledgeSearch.trim().toLowerCase();
    if (!query) return knowledgeBases;
    return knowledgeBases.filter(
      (base) =>
        base.name.toLowerCase().includes(query) ||
        (base.description && base.description.toLowerCase().includes(query))
    );
  }, [knowledgeBases, knowledgeSearch]);

  // Helper to map and apply catalog model options
  const applyCatalog = (catalog: { stt?: any[]; tts?: any[]; llm?: any[] }) => {
    if (catalog.stt?.length) {
      setSttOptions(catalog.stt.map((m) => ({
        id: m.id,
        name: m.name,
        note: m.note || m.provider,
        recommended: m.is_recommended,
      })));
    }
    if (catalog.llm?.length) {
      setLlmOptions(catalog.llm.map((m) => ({
        id: m.id,
        name: m.name,
        note: m.note || m.provider,
        recommended: m.is_recommended,
      })));
    }
    if (catalog.tts?.length) {
      setTtsOptions(catalog.tts.map((m) => ({
        id: (m.id || m.provider) as Voice['provider'],
        name: m.name,
        note: m.note || m.provider,
        recommended: m.is_recommended,
      })));
    }
  };

  // Step 1: Initialize form & load phone numbers only
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);

    const initFromAgent = (a: Agent) => {
      setName(a.name || '');
      setDescription(a.description || '');
      setSystemPrompt(a.systemPrompt || a.toolsConfig?.systemPrompt || populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName));
      setCallDirection(a.callDirection || a.toolsConfig?.callDirection || 'inbound');

      const pLang = a.primaryLanguage || a.language || a.toolsConfig?.primaryLanguage || 'en-IN';
      setPrimaryLanguage(pLang);

      const addLangs = a.additionalLanguages || a.toolsConfig?.additionalLanguages ||
        (Array.isArray(a.supportedLanguages) ? a.supportedLanguages.filter((l: string) => l !== pLang) : ['hi-IN']);
      setAdditionalLanguages(addLangs);

      setGreetingMode(a.greetingMode || a.toolsConfig?.greetingMode || 'static');
      setInboundGreeting(a.inboundGreeting || a.greetingText || a.toolsConfig?.inboundGreeting || populateOrgName(DEFAULT_INBOUND_GREETING, orgName));
      setOutboundGreeting(a.outboundGreeting || a.greetingText || a.toolsConfig?.outboundGreeting || populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName));

      setPauseBeforeSpeakingMs(typeof a.pauseBeforeSpeakingMs === 'number' ? a.pauseBeforeSpeakingMs : (typeof a.toolsConfig?.pauseBeforeSpeakingMs === 'number' ? a.toolsConfig.pauseBeforeSpeakingMs : 400));
      setAllowInterruptions(a.allowInterruptions ?? a.toolsConfig?.allowInterruptions ?? a.toolsConfig?.voiceBehavior?.allowInterruptions ?? true);
      setSpeakingRate(typeof a.speakingRate === 'number' ? a.speakingRate : (typeof a.toolsConfig?.speakingRate === 'number' ? a.toolsConfig.speakingRate : 1));
      setSilenceBehavior(a.silenceBehavior || a.toolsConfig?.silenceBehavior || a.toolsConfig?.voiceBehavior?.silenceBehavior || 'prompt-again');
      setSilenceTimeoutSeconds(a.silenceTimeoutSeconds ?? a.toolsConfig?.silenceTimeoutSeconds ?? a.toolsConfig?.voiceBehavior?.silenceTimeoutSeconds ?? 5);

      setTelephonyProvider(a.telephonyProvider || a.toolsConfig?.telephonyProvider || 'plivo');
      setSttProvider(a.sttProvider || a.toolsConfig?.sttProvider || 'deepgram');

      const rawKeyterms = a.sttKeyterms || a.toolsConfig?.sttKeyterms || '';
      setSttKeyterms(Array.isArray(rawKeyterms) ? rawKeyterms.join(', ') : rawKeyterms);

      setModel(a.model || a.toolsConfig?.model || 'gpt-mini');
      const nextTts = (a.ttsProvider || a.toolsConfig?.ttsProvider || 'fish-audio') as Voice['provider'];
      setTtsProvider(nextTts);
      setVoiceId(a.voiceId || a.toolsConfig?.voiceId || 'fish-swara-hi-en');

      setSelectedKbIds(a.knowledgeBaseIds || a.toolsConfig?.knowledgeBaseIds || []);
      setKnowledgeSearch('');

      const rawTools = a.toolAllowlist || a.toolsConfig?.toolAllowlist || a.toolsConfig?.selectedTools || [];
      setSelectedTools(rawTools);

      setEscalationPhoneNumber(a.escalationPhoneNumber || a.toolsConfig?.escalationPhoneNumber || (a as any).guardrails?.escalationPhoneNumber || '');
      setIsPromptExpanded(false);
      setResourceLoadError(false);
    };

    if (agent) {
      initFromAgent(agent);
    } else if (agentId) {
      getAgent(agentId).then((loaded) => {
        if (loaded) initFromAgent(loaded);
      }).catch(console.error);
    } else {
      setName('Cathy');
      setDescription(`Handles incoming customer inquiries, bookings, and support for ${orgName} with structured call flows.`);
      setSystemPrompt(populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName));
      setCallDirection('inbound');
      setPrimaryLanguage('en-IN');
      setAdditionalLanguages(['hi-IN']);
      setGreetingMode('static');
      setInboundGreeting(populateOrgName(DEFAULT_INBOUND_GREETING, orgName));
      setOutboundGreeting(populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName));
      setPauseBeforeSpeakingMs(400);
      setAllowInterruptions(true);
      setSpeakingRate(1);
      setSilenceBehavior('prompt-again');
      setSilenceTimeoutSeconds(5);
      setTelephonyProvider('plivo');
      setSttProvider('deepgram');
      setSttKeyterms('');
      setModel('gpt-mini');
      setTtsProvider('fish-audio');
      setVoiceId('fish-swara-hi-en');
      setSelectedKbIds([]);
      setKnowledgeSearch('');
      setSelectedTools([]);
      setEscalationPhoneNumber('');
      setIsPromptExpanded(false);
      setResourceLoadError(false);
    }

    if (cachedResources) {
      applyCatalog({
        stt: cachedResources.stt,
        tts: cachedResources.tts,
        llm: cachedResources.llm,
      });
      if (cachedResources.kbs) setKnowledgeBases(cachedResources.kbs);
      if (cachedResources.integrations) setIntegrations(cachedResources.integrations);
      return;
    }

    let isCurrent = true;
    setIsLoadingResources(true);

    // 1 Single Unified GET API fetches models, KBs, and integrations together
    getAgentBuilderResources()
      .then((res) => {
        if (!isCurrent) return;

        // 1. AI Models (STT, TTS, LLM)
        applyCatalog({
          stt: res.stt || [],
          tts: res.tts || [],
          llm: res.llm || [],
        });

        // 3. Knowledge Bases
        let mappedKBs: KnowledgeBase[] = [];
        if (res.knowledge_bases?.length) {
          mappedKBs = res.knowledge_bases.map((item: any) => ({
            id: item.id,
            workspaceId: item.workspace_id || item.workspaceId || '',
            name: item.name,
            description: item.description || '',
            documentCount: Number(item.document_count ?? item.documentCount ?? 0),
            chunkCount: Number(item.chunk_count ?? item.chunkCount ?? 0),
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
          }));
          setKnowledgeBases(mappedKBs);
        }

        // 4. Integrations
        const mappedIntegrations = formatIntegrations(res.integrations || []);
        setIntegrations(mappedIntegrations);

        // Cache for subsequent modal opens
        cachedResources = {
          stt: res.stt,
          tts: res.tts,
          llm: res.llm,
          kbs: mappedKBs,
          integrations: mappedIntegrations,
        };
      })
      .catch((err) => {
        console.warn('Failed to load agent builder resources', err);
        if (isCurrent) setResourceLoadError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoadingResources(false);
      });

    return () => { isCurrent = false; };
  }, [isOpen]);

  const toggleLanguage = (languageId: string) => {
    setAdditionalLanguages((current) => current.includes(languageId)
      ? current.filter((id) => id !== languageId)
      : [...current, languageId]);
  };

  const handleCallDirectionChange = (direction: typeof callDirection) => {
    setCallDirection(direction);
  };

  const handleTtsProviderChange = (provider: string) => {
    const nextProvider = provider as Voice['provider'];
    setTtsProvider(nextProvider);
    const firstVoice = AVAILABLE_VOICES.find((voice) => voice.provider === nextProvider);
    if (firstVoice) setVoiceId(firstVoice.id);
  };

  const toggleKnowledgeBase = (kbId: string) => {
    setSelectedKbIds((current) =>
      current.includes(kbId)
        ? current.filter((id) => id !== kbId)
        : [...current, kbId]
    );
  };

  const toggleTool = (integrationId: string) => {
    setSelectedTools((current) => current.includes(integrationId)
      ? current.filter((id) => id !== integrationId)
      : [...current, integrationId]);
  };



  const handleSubmitAgent = async () => {
    if (!systemPrompt.trim()) {
      toast.error('Instructions required', 'Please provide or customize the agent instructions blueprint.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim() || (agent ? agent.name : 'Cathy'),
        role: 'Voice Assistant',
        description: description.trim() || 'Voice assistant configured with structured call blueprint',
        systemPrompt: systemPrompt.trim(),
        callDirection,
        language: primaryLanguage,
        primaryLanguage,
        additionalLanguages,
        supportedLanguages: [...new Set([primaryLanguage, ...additionalLanguages])],
        voiceId: selectedVoice?.id || voiceId,
        voiceName: selectedVoice?.name || '',
        model,
        status: agent?.status || 'active',
        telephonyProvider,
        sttProvider,
        ttsProvider,
        firstSpeaker: 'agent',
        greetingMode,
        greetingText: callDirection === 'outbound' ? outboundGreeting.trim() : inboundGreeting.trim(),
        inboundGreeting: inboundGreeting.trim(),
        outboundGreeting: outboundGreeting.trim(),
        pauseBeforeSpeakingMs,
        sttKeyterms: splitEntries(sttKeyterms),
        voiceBehavior: { allowInterruptions, speakingRate, silenceBehavior, silenceTimeoutSeconds },
        speakingRate,
        allowInterruptions,
        silenceBehavior,
        silenceTimeoutSeconds,
        knowledgeBaseIds: selectedKbIds,
        knowledgeDocumentIds: [],
        toolAllowlist: selectedTools,
        escalationPhoneNumber: escalationPhoneNumber.trim() || undefined,
        guardrails: {
          redactSensitiveData: true,
          groundAnswersInKnowledge: true,
          restrictedTopics: [],
          prohibitedPromises: [],
          escalationTriggers: escalationPhoneNumber.trim() ? [`Transfer to ${escalationPhoneNumber.trim()}`] : [],
          aiDisclosure: 'This call is assisted by an AI voice agent.',
          recordingDisclosure: 'This call may be recorded for quality and compliance purposes.',
          customRules: '',
          escalationPhoneNumber: escalationPhoneNumber.trim(),
        },
        complianceFlags: {
          aiDisclosureRequired: true,
          recordingDisclosureRequired: true,
          outboundDndDncChecksRequired: true,
        },
      };

      if (isEditMode && targetAgentId) {
        const updated = await updateAgent(targetAgentId, payload);
        toast.success('Agent updated', `“${updated.name || name}” configuration has been updated.`);
        onSuccess(updated);
        onClose();
      } else {
        const created = await createAgent(payload);
        toast.success('Agent created', `“${created.name}” is now active and ready.`);
        onSuccess(created);
        onClose();
      }
    } catch (error: any) {
      console.error(isEditMode ? 'Failed to update agent' : 'Failed to create agent', error);
      toast.error(isEditMode ? 'Could not update agent' : 'Could not create agent', error?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const renderFooter = (backStep?: Step, nextStep?: Step) => (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      {backStep ? (
        <button type="button" onClick={() => setCurrentStep(backStep)} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      ) : <span className="text-[11px] text-slate-400">You can edit these settings anytime.</span>}
      {nextStep ? (
        <button type="button" onClick={() => setCurrentStep(nextStep)} disabled={nextStep === 2 && !systemPrompt.trim()} className="flex min-h-10 items-center gap-2 rounded-xl bg-emerald-950 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-45">
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button type="button" onClick={handleSubmitAgent} disabled={isSubmitting || !systemPrompt.trim()} className="flex min-h-10 items-center gap-2 rounded-xl bg-emerald-950 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-45">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-emerald-300" />}
          {isSubmitting
            ? (isEditMode ? 'Saving changes…' : 'Creating agent…')
            : (isEditMode ? 'Save Changes' : 'Create agent')}
        </button>
      )}
    </div>
  );

  const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-800';
  const inputClass = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15';
  const textareaClass = 'w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Configure Agent: ${name || agent?.name || 'Voice Assistant'}` : 'Create your voice agent'}
      subtitle={isEditMode ? 'Update identity, speech behaviors, integrations, and operational parameters.' : 'Shape the conversation, choose its voice and tools, then add trusted knowledge and guardrails.'}
      maxWidth="4xl"
      theme="light"
      scrollToTopKey={currentStep}
    >
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800">Agent setup</p>
              <h2 className="mt-1 text-sm font-semibold text-slate-950">{STEPS[currentStep - 1].label}</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600">STEP {currentStep} OF {STEPS.length}</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div className="h-full rounded-full bg-emerald-600 transition-all duration-300" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STEPS.map((step) => {
              const active = step.id === currentStep;
              const complete = step.id < currentStep;
              return (
                <button key={step.id} type="button" onClick={() => step.id <= currentStep && setCurrentStep(step.id)} disabled={step.id > currentStep} aria-current={active ? 'step' : undefined} className={`flex min-h-9 items-center justify-center gap-2 rounded-xl px-2 text-[11px] font-semibold transition ${active ? 'border border-emerald-200 bg-white text-emerald-950 shadow-sm' : complete ? 'text-emerald-800 hover:bg-white' : 'cursor-not-allowed text-slate-400'}`}>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-md ${active ? 'bg-emerald-100' : complete ? 'bg-emerald-50' : 'bg-slate-100'}`}>{complete ? <Check className="h-3.5 w-3.5" /> : step.id}</span>
                  <span className="truncate">{step.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Top configuration row: Agent Name */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div>
                    <label htmlFor="agent-name" className="text-xs font-semibold text-slate-900">
                      Agent Name
                    </label>
                    <p className="text-[11px] text-slate-500">Default name: Cathy · Fully customizable anytime.</p>
                  </div>
                </div>
                <div className="sm:w-72">
                  <input
                    id="agent-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Cathy"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Call Direction with Greeting Configuration */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-emerald-800" />
                  <h3 className="text-xs font-semibold text-slate-900">Call Direction</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                  {callDirection === 'inbound'
                    ? 'Inbound only'
                    : callDirection === 'outbound'
                    ? 'Outbound only'
                    : 'Inbound + Outbound'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Call direction">
                {[
                  { id: 'inbound', label: 'Inbound', desc: 'Customer calls you', icon: PhoneIncoming },
                  { id: 'outbound', label: 'Outbound', desc: 'Agent calls contact', icon: PhoneOutgoing },
                  { id: 'both', label: 'Both', desc: 'Inbound & outbound', icon: PhoneCall },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={callDirection === option.id}
                      onClick={() => handleCallDirectionChange(option.id as typeof callDirection)}
                      className={`min-h-12 rounded-xl border p-2.5 text-center transition ${
                        callDirection === option.id
                          ? 'border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-950 ring-1 ring-emerald-200 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <Icon className={`h-3.5 w-3.5 ${callDirection === option.id ? 'text-emerald-800' : 'text-slate-400'}`} />
                        <span className="block text-xs font-semibold">{option.label}</span>
                      </div>
                      <span className="mt-0.5 block text-[10px] text-slate-500 font-normal">{option.desc}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {callDirection === 'inbound'
                  ? 'Handles incoming calls from customers when they dial your assigned phone number.'
                  : callDirection === 'outbound'
                  ? 'Places proactive outbound calls to contacts, leads, or existing customers.'
                  : 'Handles both incoming inquiries and places proactive outbound campaign calls.'}
              </p>

              {/* Greeting prompt dynamically asked when clicking inbound, outbound, or both */}
              <div className="mt-4 border-t border-slate-100 pt-3.5">
                {callDirection === 'inbound' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="agent-inbound-greeting-step1" className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>Inbound Greeting</span>
                        <span className="rounded-md bg-emerald-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">When caller dials in</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setInboundGreeting(populateOrgName(DEFAULT_INBOUND_GREETING, orgName))}
                          className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 hover:underline"
                        >
                          Reset to default
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      What should the agent say immediately when an inbound caller connects? ({greetingMode === 'static' ? 'exact wording' : 'dynamically tailored'})
                    </p>
                    <textarea
                      id="agent-inbound-greeting-step1"
                      rows={3}
                      value={inboundGreeting}
                      onChange={(event) => setInboundGreeting(event.target.value)}
                      placeholder={`e.g. Hello, thanks for calling ${orgName}. My name is Cathy, how can I assist you today?`}
                      className={textareaClass}
                    />
                  </div>
                )}

                {callDirection === 'outbound' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="agent-outbound-greeting-step1" className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>Outbound Greeting</span>
                        <span className="rounded-md bg-sky-100/70 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800">When contact picks up</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setOutboundGreeting(populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName))}
                          className="text-[11px] font-medium text-sky-800 hover:text-sky-950 hover:underline"
                        >
                          Reset to default
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      What should the agent say immediately when the contact answers an outbound call? ({greetingMode === 'static' ? 'exact wording' : 'dynamically tailored'})
                    </p>
                    <textarea
                      id="agent-outbound-greeting-step1"
                      rows={3}
                      value={outboundGreeting}
                      onChange={(event) => setOutboundGreeting(event.target.value)}
                      placeholder={`e.g. Hi, this is Cathy calling from ${orgName}. Am I speaking with [Contact Name]?`}
                      className={textareaClass}
                    />
                  </div>
                )}

                {callDirection === 'both' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900">Configure Greetings for Both Directions</h4>
                        <p className="text-[11px] text-slate-500">Set distinct opening lines for inbound inquiries and outbound calls.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInboundGreeting(populateOrgName(DEFAULT_INBOUND_GREETING, orgName));
                            setOutboundGreeting(populateOrgName(DEFAULT_OUTBOUND_GREETING, orgName));
                          }}
                          className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 hover:underline"
                        >
                          Reset both
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="agent-both-inbound-greeting-step1" className="text-xs font-semibold text-emerald-950 flex items-center gap-1">
                            <PhoneIncoming className="h-3.5 w-3.5 text-emerald-700" />
                            <span>1. Inbound Greeting</span>
                          </label>
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-800 uppercase tracking-wide">
                            Incoming
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">When customers call your agent</p>
                        <textarea
                          id="agent-both-inbound-greeting-step1"
                          rows={3}
                          value={inboundGreeting}
                          onChange={(event) => setInboundGreeting(event.target.value)}
                          placeholder="Inbound greeting text..."
                          className={textareaClass}
                        />
                      </div>

                      <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="agent-both-outbound-greeting-step1" className="text-xs font-semibold text-sky-950 flex items-center gap-1">
                            <PhoneOutgoing className="h-3.5 w-3.5 text-sky-700" />
                            <span>2. Outbound Greeting</span>
                          </label>
                          <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-semibold text-sky-800 uppercase tracking-wide">
                            Outgoing
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">When contacts pick up outbound calls</p>
                        <textarea
                          id="agent-both-outbound-greeting-step1"
                          rows={3}
                          value={outboundGreeting}
                          onChange={(event) => setOutboundGreeting(event.target.value)}
                          placeholder="Outbound greeting text..."
                          className={textareaClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Core Blueprint: Agent Instructions & Conversational Prompt Text Area */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      Agent Instructions
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Starter blueprint personalized for <span className="font-semibold text-slate-700">{orgName}</span>. Customize instructions freely.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(systemPrompt);
                      toast.success('Blueprint copied', 'Prompt text copied to clipboard.');
                    }}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50"
                    title="Copy blueprint text"
                  >
                    <Copy className="h-3 w-3 text-slate-400" />
                    <span>Copy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSystemPrompt(populateOrgName(DEFAULT_VOICE_PROMPT_TEMPLATE, orgName));
                      toast.info('Template restored', `Reset to starter blueprint for ${orgName}.`);
                    }}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/70 px-2.5 text-[11px] font-semibold text-emerald-900 transition hover:bg-emerald-100"
                    title="Restore default blueprint template"
                  >
                    <RotateCcw className="h-3 w-3 text-emerald-700" />
                    <span>Reset template</span>
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <label htmlFor="agent-system-prompt" className="font-semibold text-slate-800">
                    Instructions <span className="text-emerald-700 font-normal">· edit freely</span>
                  </label>
                  <span className="font-mono text-slate-400 font-normal">
                    {systemPrompt.length} chars · {systemPrompt.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  id="agent-system-prompt"
                  rows={15}
                  value={systemPrompt}
                  onChange={(event) => setSystemPrompt(event.target.value)}
                  placeholder="Describe who your agent is, what it does on a call, how it should speak, and what it should never do..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/15"
                />
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <p>
                    Personalized for <span className="font-semibold text-slate-700">{orgName}</span> — edit instructions, call flow, or guardrails freely.
                  </p>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Fully editable
                  </span>
                </div>
              </div>
            </section>

            {renderFooter(undefined, 2)}
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Mic className="h-5 w-5" /></span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">Make the first seconds feel right</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">Choose a voice and calibrate speech delivery. The agent greets callers immediately when the line connects.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SelectField label="Primary language" value={primaryLanguage} options={LANGUAGES.map((language) => ({ id: language.id, name: language.name, note: language.id === primaryLanguage ? 'Used as the default language for the call.' : '' }))} onChange={setPrimaryLanguage} icon={<Globe className="h-4 w-4" />} />
                  <div className="mt-3">
                    <p className={labelClass}>Also support <span className="font-normal text-slate-400">· optional</span></p>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.filter((language) => language.id !== primaryLanguage).map((language) => {
                        const selected = additionalLanguages.includes(language.id);
                        return <button key={language.id} type="button" aria-pressed={selected} onClick={() => toggleLanguage(language.id)} className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition ${selected ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{selected && <Check className="mr-1 inline h-3 w-3" />}{language.name}</button>;
                      })}
                    </div>
                  </div>
                </div>
                <div>
                  <SelectField label="Voice" value={selectedVoice?.id || ''} options={voicesForProvider.map((voice) => ({ id: voice.id, name: `${voice.name} · ${voice.accent || voice.language}`, note: `${voice.gender === 'female' ? 'Feminine' : voice.gender === 'male' ? 'Masculine' : 'Neutral'} voice · ${voice.language}` }))} onChange={setVoiceId} icon={<AudioLines className="h-4 w-4" />} />
                  <a href="/voices" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950">Explore the voice library <ExternalLink className="h-3 w-3" /></a>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div>
                  <label className="flex items-center justify-between gap-3 text-xs font-medium text-slate-700">
                    <span className={labelClass}>Speaking speed</span>
                    <span className="font-mono text-slate-500 text-xs">{speakingRate.toFixed(2)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={speakingRate}
                    onChange={(event) => setSpeakingRate(Number(event.target.value))}
                    aria-label="Speaking speed"
                    className="mt-2.5 w-full accent-emerald-700"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Controls vocal delivery speed. Normal conversational pacing is 1.00x.
                  </p>
                </div>
              </div>


            </section>
            {renderFooter(1, 3)}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><AudioLines className="h-5 w-5" /></span>
                <div><h3 className="text-sm font-semibold text-slate-950">Choose the voice stack</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Start with recommended providers or choose the services connected to your workspace.</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Telephony & call network" value={telephonyProvider} options={TELEPHONY_OPTIONS} onChange={setTelephonyProvider} icon={<PhoneCall className="h-4 w-4" />} />
                <SelectField label="Speech recognition · STT" value={sttProvider} options={sttOptions} onChange={setSttProvider} icon={<Mic className="h-4 w-4" />} />
                <SelectField label="Conversation model · LLM" value={model} options={llmOptions} onChange={setModel} icon={<Bot className="h-4 w-4" />} />
                <SelectField label="Voice synthesis · TTS" value={ttsProvider} options={ttsOptions} onChange={handleTtsProviderChange} icon={<AudioLines className="h-4 w-4" />} />
              </div>
              <label className="mt-4 block"><span className={labelClass}>Words the speech recognizer should know <span className="font-normal text-slate-400">· optional</span></span><textarea rows={2} value={sttKeyterms} onChange={(event) => setSttKeyterms(event.target.value)} placeholder="Brand names, product names, local terms, or acronyms" className={textareaClass} /><span className="mt-1 block text-[11px] text-slate-500">Used as transcription hints where the selected speech provider supports them. Separate terms with commas.</span></label>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-800">
                    <FolderOpen className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Choose trusted knowledge</h3>
                    <p className="mt-1 text-xs text-slate-500">Connect verified knowledge base folders to ground your agent's responses in approved documentation.</p>
                  </div>
                </div>
                <a href="/knowledge" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50">Manage folders <ExternalLink className="h-3 w-3" /></a>
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={knowledgeSearch} onChange={(event) => setKnowledgeSearch(event.target.value)} aria-label="Search knowledge folders" placeholder="Search knowledge folders by name or description..." className={`${inputClass} pl-9`} />
              </div>

              {isLoadingResources ? (
                <div className="py-10 text-center" role="status"><Loader2 className="mx-auto h-5 w-5 animate-spin text-emerald-700" /><p className="mt-2 text-xs text-slate-500">Loading your knowledge folders…</p></div>
              ) : resourceLoadError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">Could not load knowledge folders. You can continue and select knowledge later.</div>
              ) : knowledgeBases.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <FolderOpen className="mx-auto h-6 w-6 text-slate-400" />
                  <p className="mt-2 text-xs font-semibold text-slate-800">No knowledge folders yet</p>
                  <p className="mt-1 text-[11px] text-slate-500">Create folders and upload reference files in Knowledge Base to attach them here.</p>
                </div>
              ) : filteredKnowledgeBases.length === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">No knowledge folders match “{knowledgeSearch}”.</div>
              ) : (
                <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                  {filteredKnowledgeBases.map((base) => {
                    const isSelected = selectedKbIds.includes(base.id);
                    return (
                      <label
                        key={base.id}
                        className={`group flex cursor-pointer items-center justify-between gap-3.5 rounded-xl border p-3.5 transition-all ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50/60 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleKnowledgeBase(base.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                          />
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                            isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-700'
                          }`}>
                            <Folder className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">{base.name}</p>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {base.description || `${base.documentCount} ${base.documentCount === 1 ? 'file' : 'files'} · ${base.chunkCount || 0} indexed chunks`}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                          {base.description && (
                            <span className="hidden text-[11px] font-medium text-slate-500 sm:inline-block">
                              {base.documentCount} {base.documentCount === 1 ? 'file' : 'files'}
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                              isSelected
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50/70 px-3.5 py-2.5 text-xs"><span className="font-medium text-emerald-950">{selectedKbIds.length ? `${selectedKbIds.length} folder${selectedKbIds.length === 1 ? '' : 's'} selected` : 'Knowledge is optional for this draft'}</span><span className="text-[11px] text-emerald-800">Answers stay grounded in approved sources</span></div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-950">Allow connected actions</h3><p className="mt-1 text-xs text-slate-500">Only the tools you select will be available to this agent.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">Optional</span></div>
              {readyIntegrations.length ? <div className="grid gap-2 sm:grid-cols-2">{readyIntegrations.map((integration) => { const selected = selectedTools.includes(integration.id); return <label key={integration.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${selected ? 'border-emerald-300 bg-emerald-50/60' : 'border-slate-200 hover:bg-slate-50'}`}><input type="checkbox" checked={selected} onChange={() => toggleTool(integration.id)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600" /><span className="min-w-0"><span className="block text-xs font-semibold text-slate-800">{integration.name}</span><span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{integration.description}</span></span></label>; })}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center"><p className="text-xs font-medium text-slate-700">No connected actions found</p><a href="/integrations" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">Connect an integration <ExternalLink className="h-3 w-3" /></a></div>}
            </section>
            {renderFooter(2, 4)}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            {/* Live Call Escalation & Human Handoff */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
                  <PhoneForwarded className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950">Call escalation & human handoff</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      escalationPhoneNumber.trim() ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {escalationPhoneNumber.trim() ? 'Configured' : 'Optional'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Provide a phone number to redirect live calls whenever a caller requests a human representative or requires live agent support.
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="escalation-phone" className={labelClass}>
                  Escalation phone number <span className="font-normal text-slate-400">· optional redirect target</span>
                </label>
                <div className="relative">
                  <PhoneForwarded className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="escalation-phone"
                    type="tel"
                    value={escalationPhoneNumber}
                    onChange={(event) => setEscalationPhoneNumber(event.target.value)}
                    placeholder="+1 (555) 012-3456 or +91 98765 43210"
                    className={`${inputClass} pl-10`}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  {escalationPhoneNumber.trim() ? (
                    <span className="font-medium text-emerald-700">
                      ✓ Active transfer: Live calls will transfer immediately to <strong className="font-semibold text-emerald-800">{escalationPhoneNumber.trim()}</strong> upon request.
                    </span>
                  ) : (
                    'When left blank, the agent politely informs callers that live transfer is unavailable and offers to log a callback request.'
                  )}
                </p>
              </div>
            </section>

            {/* Complete Configuration & Blueprint Review */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950">Full Agent Blueprint & Configuration Review</h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <Sparkles className="h-3 w-3 text-emerald-600" /> Complete overview
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {isEditMode ? 'Verify every configured parameter across all steps before saving your updates.' : 'Verify every configured parameter across all steps before creating the active agent.'}
                </p>
              </div>
            </div>

            {/* Step 1 Review: Identity, Flow & Prompt */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Agent Identity & Conversational Flow</h4>
                    <p className="text-[11px] text-slate-500">Name, call direction, opening greetings, and instruction blueprint</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Pencil className="h-3 w-3 text-slate-500" />
                  <span>Edit Step 1</span>
                </button>
              </div>

              <div className="mt-3.5 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Agent Name & Role</span>
                    <p className="mt-1 text-sm font-bold text-slate-900">{name || 'Cathy'}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{description || 'Voice assistant configured with structured call blueprint'}</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Call Direction & Mode</span>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                        {callDirection === 'inbound' ? 'Inbound Calls Only' : callDirection === 'outbound' ? 'Outbound Calls Only' : 'Both (Inbound & Outbound)'}
                      </span>
                      <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium capitalize text-slate-700">
                        {greetingMode} greeting
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      {callDirection === 'inbound'
                        ? 'Responds immediately when customers dial in.'
                        : callDirection === 'outbound'
                        ? 'Speaks first when contacts answer outbound calls.'
                        : 'Handles inbound calls and makes outbound campaign calls.'}
                    </p>
                  </div>
                </div>

                {/* Configured Greetings */}
                <div className="space-y-2">
                  {(callDirection === 'inbound' || callDirection === 'both') && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-950">
                          <PhoneIncoming className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Inbound Opening Greeting</span>
                        </span>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800">
                          First words spoken
                        </span>
                      </div>
                      <p className="mt-1.5 rounded-lg border border-emerald-100/70 bg-white/90 p-2.5 text-xs italic text-slate-800">
                        "{inboundGreeting}"
                      </p>
                    </div>
                  )}

                  {(callDirection === 'outbound' || callDirection === 'both') && (
                    <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-950">
                          <PhoneOutgoing className="h-3.5 w-3.5 text-sky-700" />
                          <span>Outbound Opening Greeting</span>
                        </span>
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-800">
                          Upon call pickup
                        </span>
                      </div>
                      <p className="mt-1.5 rounded-lg border border-sky-100/70 bg-white/90 p-2.5 text-xs italic text-slate-800">
                        "{outboundGreeting}"
                      </p>
                    </div>
                  )}
                </div>

                {/* System Prompt / Instructions Review */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span>Instruction Prompt Blueprint</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-medium text-slate-500">
                        {systemPrompt.length} chars · {systemPrompt.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        {isPromptExpanded ? (
                          <><span>Collapse</span><ChevronUp className="h-3 w-3" /></>
                        ) : (
                          <><span>View full</span><ChevronDown className="h-3 w-3" /></>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={`mt-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap ${
                    isPromptExpanded ? 'max-h-96' : 'max-h-24'
                  }`}>
                    {systemPrompt}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2 Review: Voice Persona & Speech Calibration */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Voice Persona & Speech Dynamics</h4>
                    <p className="text-[11px] text-slate-500">Voice character, language capabilities, timing buffers, and speech rate</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Pencil className="h-3 w-3 text-slate-500" />
                  <span>Edit Step 2</span>
                </button>
              </div>

              <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <Mic className="h-3 w-3 text-slate-400" />
                    <span>Voice Persona & Languages</span>
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Selected Voice:</span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedVoice?.name || 'Standard Voice'} ({selectedVoice?.gender === 'female' ? 'Feminine' : selectedVoice?.gender === 'male' ? 'Masculine' : 'Neutral'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Accent / Style:</span>
                    <span className="text-xs font-medium text-slate-800">
                      {selectedVoice?.accent || selectedVoice?.language || 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Primary Language:</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                      {primaryLangName}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-xs text-slate-600">Supported Languages:</span>
                    <div className="flex max-w-[65%] flex-wrap justify-end gap-1">
                      {additionalLangNames.length ? (
                        additionalLangNames.map((langName) => (
                          <span key={langName} className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-800">
                            {langName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs italic text-slate-500">None (Primary only)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <AudioLines className="h-3 w-3 text-slate-400" />
                    <span>Speech Timing & Turn-Taking</span>
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Speaking Speed:</span>
                    <span className="font-mono text-xs font-semibold text-slate-900">
                      {speakingRate.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3 Review: Voice Stack & AI Infrastructure */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Voice Stack & AI Infrastructure</h4>
                    <p className="text-[11px] text-slate-500">Telephony network, speech recognition, reasoning model, and voice synthesis</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Pencil className="h-3 w-3 text-slate-500" />
                  <span>Edit Step 3</span>
                </button>
              </div>

              <div className="mt-3.5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <PhoneCall className="h-3 w-3 text-slate-400" />
                    <span>Telephony</span>
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-900">{telephonyName}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">PSTN & SIP routing</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <Mic className="h-3 w-3 text-slate-400" />
                    <span>Speech (STT)</span>
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-900">{sttName}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Live streaming audio</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <Bot className="h-3 w-3 text-slate-400" />
                    <span>Model (LLM)</span>
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-900">{llmName}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Conversational reasoning</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    <AudioLines className="h-3 w-3 text-slate-400" />
                    <span>Voice (TTS)</span>
                  </span>
                  <p className="mt-1 text-xs font-bold text-slate-900">{ttsName}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">Neural audio synthesis</p>
                </div>
              </div>

              {/* Keyterms */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Custom STT Keyterms & Vocabulary Hints
                </span>
                {parsedKeyterms.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {parsedKeyterms.map((term, idx) => (
                      <span key={idx} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800">
                        {term}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs italic text-slate-500">None configured · standard vocabulary recognition</p>
                )}
              </div>
            </section>

            {/* Step 3 Review: Knowledge Bases & Connected Tools */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Knowledge Bases & Connected Actions</h4>
                    <p className="text-[11px] text-slate-500">Connected grounding documentation and allowed external tools</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  <Pencil className="h-3 w-3 text-slate-500" />
                  <span>Edit Step 3</span>
                </button>
              </div>

              <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                {/* Knowledge Base */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <FolderOpen className="h-3 w-3 text-slate-400" />
                      <span>Knowledge Base Folders</span>
                    </span>
                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-900">
                      {selectedKBs.length} attached
                    </span>
                  </div>

                  {selectedKBs.length ? (
                    <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                      {selectedKBs.map((kb) => (
                        <div key={kb.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <Folder className="h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <span className="truncate font-semibold text-slate-900">{kb.name}</span>
                          </div>
                          <span className="shrink-0 text-[10px] font-medium text-slate-500">
                            {kb.documentCount} {kb.documentCount === 1 ? 'file' : 'files'} · {kb.chunkCount || 0} chunks
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-2 text-xs italic text-slate-500">
                      No knowledge folders attached. The agent will rely on its prompt blueprint instructions.
                    </p>
                  )}
                </div>

                {/* Connected Tools */}
                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      <Bot className="h-3 w-3 text-slate-400" />
                      <span>Connected Tools & Actions</span>
                    </span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                      {selectedToolList.length} allowed
                    </span>
                  </div>

                  {selectedToolList.length ? (
                    <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                      {selectedToolList.map((tool) => (
                        <div key={tool.id} className="rounded-lg border border-slate-200 bg-white p-2 text-xs">
                          <div className="font-semibold text-slate-900">{tool.name}</div>
                          {tool.description && (
                            <p className="mt-0.5 truncate text-[10px] text-slate-500">{tool.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-2 text-xs italic text-slate-500">
                      No external actions selected. Agent operates in conversational-only mode.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {renderFooter(3)}
          </div>
        )}
      </div>
    </Modal>
  );
};
