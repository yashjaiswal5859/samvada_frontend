import { apiClient, getActiveWorkspaceId } from './client';
import { Agent, CreateAgentPayload, APIEnvelope, CallTicketResponse, AgentVersion } from '../types';

const requireData = <T,>(success: boolean | undefined, data: T | undefined, operation: string): T => {
  if (success && data !== undefined && data !== null) return data;
  throw new Error(`${operation} was not confirmed by the server.`);
};

const getScopedAgentUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/agents${subpath}`;
  }
  return `/api/v1/agents${subpath}`;
};

export const mapAgentFromBackend = (item: any): Agent => {
  let toolsCfg: any = {};
  if (item.versions && item.versions.length > 0 && item.versions[0].tools_config) {
    try {
      toolsCfg = typeof item.versions[0].tools_config === 'string'
        ? JSON.parse(item.versions[0].tools_config)
        : item.versions[0].tools_config;
    } catch (e) {
      console.warn('Failed to parse tools_config', e);
    }
  }

  const primaryLang = toolsCfg.primaryLanguage || toolsCfg.language || item.language || 'en-IN';
  const rawAdditional = toolsCfg.additionalLanguages || (Array.isArray(toolsCfg.supportedLanguages) ? toolsCfg.supportedLanguages.filter((l: string) => l !== primaryLang) : []);

  return {
    id: item.id,
    name: item.name,
    role: item.role || toolsCfg.role || 'Voice Assistant',
    description: item.description || toolsCfg.description || '',
    avatar: item.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    systemPrompt: item.system_prompt || item.systemPrompt || toolsCfg.systemPrompt || toolsCfg.system_prompt || '',
    voiceId: item.voice_id || item.voiceId || toolsCfg.voiceId || toolsCfg.voice_id || 'fish-swara-hi-en',
    voiceName: item.voice_name || item.voiceName || toolsCfg.voiceName || toolsCfg.voice_name || 'Swara',
    language: primaryLang,
    primaryLanguage: primaryLang,
    additionalLanguages: rawAdditional,
    supportedLanguages: [primaryLang, ...rawAdditional],
    model: item.model || toolsCfg.model || 'gpt-mini',
    status: item.status || 'active',
    phoneNumber: item.assigned_phone || item.phoneNumber || toolsCfg.assignedPhone,
    escalationPhoneNumber: item.escalation_phone_number || toolsCfg.escalationPhoneNumber,
    workspaceId: item.workspace_id || item.workspaceId,
    knowledgeBaseIds: item.knowledge_base_ids || item.knowledgeBaseIds || toolsCfg.knowledgeBaseIds || toolsCfg.knowledge_base_ids || [],
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
    totalCalls: Number(item.total_calls ?? item.totalCalls ?? 0),
    avgDurationSec: Number(item.avg_duration_sec ?? item.avgDurationSec ?? 0),
    successRate: Number(item.success_rate ?? item.successRate ?? 0),
    greetingText: item.greeting_text || toolsCfg.greetingText || item.inbound_greeting || item.greetingText,
    inboundGreeting: item.inbound_greeting || toolsCfg.inboundGreeting || item.inboundGreeting,
    outboundGreeting: item.outbound_greeting || toolsCfg.outboundGreeting || item.outboundGreeting,
    callDirection: toolsCfg.callDirection || 'inbound',
    telephonyProvider: toolsCfg.telephonyProvider || 'plivo',
    sttProvider: toolsCfg.sttProvider || 'deepgram',
    sttKeyterms: Array.isArray(toolsCfg.sttKeyterms) ? toolsCfg.sttKeyterms : (typeof toolsCfg.sttKeyterms === 'string' ? toolsCfg.sttKeyterms.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
    ttsProvider: toolsCfg.ttsProvider || item.voice_provider || 'fish-audio',
    speakingRate: toolsCfg.voiceBehavior?.speakingRate ?? toolsCfg.speakingRate ?? 1.0,
    pauseBeforeSpeakingMs: toolsCfg.pauseBeforeSpeakingMs ?? 400,
    allowInterruptions: toolsCfg.voiceBehavior?.allowInterruptions ?? toolsCfg.allowInterruptions ?? true,
    greetingMode: toolsCfg.greetingMode || 'static',
    silenceBehavior: toolsCfg.voiceBehavior?.silenceBehavior || toolsCfg.silenceBehavior || 'prompt-again',
    silenceTimeoutSeconds: toolsCfg.voiceBehavior?.silenceTimeoutSeconds || toolsCfg.silenceTimeoutSeconds || 5,
    toolAllowlist: toolsCfg.toolAllowlist || toolsCfg.selectedTools || [],
    toolsConfig: toolsCfg,
  };
};

export const getAgents = async (): Promise<Agent[]> => {
  const res = await apiClient.get<APIEnvelope<any[]>>(getScopedAgentUrl());
  if (res.data?.success && Array.isArray(res.data.data)) {
    return res.data.data.map(mapAgentFromBackend);
  }
  throw new Error('Agent list was not confirmed by the server.');
};

export const getAgentById = async (id: string): Promise<Agent | undefined> => {
  const res = await apiClient.get<APIEnvelope<any>>(getScopedAgentUrl(`/${id}`));
  if (!res.data?.success || !res.data.data) return undefined;
  return mapAgentFromBackend(res.data.data);
};

export const getAgent = getAgentById;

export const toBackendAgentPayload = (p: Partial<Agent> | CreateAgentPayload): Record<string, any> => {
  const out: Record<string, any> = {};
  if (p.name !== undefined) out.name = p.name;
  if (p.role !== undefined) out.role = p.role;
  if (p.description !== undefined) out.description = p.description;
  if (p.systemPrompt !== undefined) out.system_prompt = p.systemPrompt;
  if ((p as any).system_prompt !== undefined) out.system_prompt = (p as any).system_prompt;
  if (p.voiceId !== undefined) out.voice_id = p.voiceId;
  if ((p as any).voice_id !== undefined) out.voice_id = (p as any).voice_id;
  if (p.voiceName !== undefined) out.voice_name = p.voiceName;
  if ((p as any).voice_name !== undefined) out.voice_name = (p as any).voice_name;
  if ((p as any).voiceProvider !== undefined) out.voice_provider = (p as any).voiceProvider;
  if ((p as any).ttsProvider !== undefined && !out.voice_provider) out.voice_provider = (p as any).ttsProvider;
  if ((p as any).voice_provider !== undefined) out.voice_provider = (p as any).voice_provider;
  if (p.language !== undefined) out.language = p.language;
  if (p.model !== undefined) out.model = p.model;
  if (p.status !== undefined) out.status = p.status;
  if ((p as any).avatar !== undefined) out.avatar_url = (p as any).avatar;
  if ((p as any).avatarUrl !== undefined) out.avatar_url = (p as any).avatarUrl;
  if ((p as any).avatar_url !== undefined) out.avatar_url = (p as any).avatar_url;
  if (p.phoneNumberId !== undefined) out.phone_number_id = p.phoneNumberId;
  if ((p as any).phone_number_id !== undefined) out.phone_number_id = (p as any).phone_number_id;
  if ((p as any).phoneNumber !== undefined) out.assigned_phone = (p as any).phoneNumber;
  if ((p as any).assigned_phone !== undefined) out.assigned_phone = (p as any).assigned_phone;
  if (p.knowledgeBaseIds !== undefined) out.knowledge_base_ids = p.knowledgeBaseIds;
  if ((p as any).knowledge_base_ids !== undefined) out.knowledge_base_ids = (p as any).knowledge_base_ids;
  if (p.toolAllowlist !== undefined) out.tool_allowlist = p.toolAllowlist;
  if ((p as any).tool_allowlist !== undefined) out.tool_allowlist = (p as any).tool_allowlist;
  if (p.escalationPhoneNumber !== undefined) out.escalation_phone_number = p.escalationPhoneNumber;
  if ((p as any).escalation_phone_number !== undefined) out.escalation_phone_number = (p as any).escalation_phone_number;
  if (p.greetingText !== undefined) out.greeting_text = p.greetingText;
  if ((p as any).greeting_text !== undefined) out.greeting_text = (p as any).greeting_text;
  if (p.inboundGreeting !== undefined) out.inbound_greeting = p.inboundGreeting;
  if ((p as any).inbound_greeting !== undefined) out.inbound_greeting = (p as any).inbound_greeting;
  if (p.outboundGreeting !== undefined) out.outbound_greeting = p.outboundGreeting;
  if ((p as any).outbound_greeting !== undefined) out.outbound_greeting = (p as any).outbound_greeting;
  if (p.greetingMode !== undefined) out.greeting_mode = p.greetingMode;
  if ((p as any).greeting_mode !== undefined) out.greeting_mode = (p as any).greeting_mode;
  if (p.callDirection !== undefined) out.call_direction = p.callDirection;
  if ((p as any).call_direction !== undefined) out.call_direction = (p as any).call_direction;
  if ((p as any).primaryLanguage !== undefined) out.primary_language = (p as any).primaryLanguage;
  if ((p as any).primary_language !== undefined) out.primary_language = (p as any).primary_language;
  if ((p as any).additionalLanguages !== undefined) out.additional_languages = (p as any).additionalLanguages;
  if ((p as any).additional_languages !== undefined) out.additional_languages = (p as any).additional_languages;
  if ((p as any).supportedLanguages !== undefined) out.supported_languages = (p as any).supportedLanguages;
  if ((p as any).supported_languages !== undefined) out.supported_languages = (p as any).supported_languages;
  if ((p as any).telephonyProvider !== undefined) out.telephony_provider = (p as any).telephonyProvider;
  if ((p as any).telephony_provider !== undefined) out.telephony_provider = (p as any).telephony_provider;
  if ((p as any).sttProvider !== undefined) out.stt_provider = (p as any).sttProvider;
  if ((p as any).stt_provider !== undefined) out.stt_provider = (p as any).stt_provider;
  if ((p as any).ttsProvider !== undefined) out.tts_provider = (p as any).ttsProvider;
  if ((p as any).tts_provider !== undefined) out.tts_provider = (p as any).tts_provider;
  if ((p as any).sttKeyterms !== undefined) out.stt_keyterms = (p as any).sttKeyterms;
  if ((p as any).stt_keyterms !== undefined) out.stt_keyterms = (p as any).stt_keyterms;
  if ((p as any).speakingRate !== undefined) out.speaking_rate = (p as any).speakingRate;
  if ((p as any).speaking_rate !== undefined) out.speaking_rate = (p as any).speaking_rate;
  if ((p as any).pauseBeforeSpeakingMs !== undefined) out.pause_before_speaking_ms = (p as any).pauseBeforeSpeakingMs;
  if ((p as any).pause_before_speaking_ms !== undefined) out.pause_before_speaking_ms = (p as any).pauseBeforeSpeakingMs;
  if ((p as any).allowInterruptions !== undefined) out.allow_interruptions = (p as any).allowInterruptions;
  if ((p as any).allow_interruptions !== undefined) out.allow_interruptions = (p as any).allow_interruptions;
  if ((p as any).silenceBehavior !== undefined) out.silence_behavior = (p as any).silenceBehavior;
  if ((p as any).silence_behavior !== undefined) out.silence_behavior = (p as any).silence_behavior;
  if ((p as any).silenceTimeoutSeconds !== undefined) out.silence_timeout_seconds = (p as any).silenceTimeoutSeconds;
  if ((p as any).silence_timeout_seconds !== undefined) out.silence_timeout_seconds = (p as any).silence_timeout_seconds;
  if ((p as any).voiceBehavior !== undefined) out.voice_behavior = (p as any).voiceBehavior;
  if ((p as any).voice_behavior !== undefined) out.voice_behavior = (p as any).voice_behavior;
  if ((p as any).guardrails !== undefined) out.guardrails = (p as any).guardrails;
  if ((p as any).complianceFlags !== undefined) out.compliance_flags = (p as any).complianceFlags;
  if ((p as any).compliance_flags !== undefined) out.compliance_flags = (p as any).compliance_flags;
  return out;
};

export const createAgent = async (payload: CreateAgentPayload): Promise<Agent> => {
  const backendPayload = toBackendAgentPayload(payload);
  const res = await apiClient.post<APIEnvelope<any>>(getScopedAgentUrl(), backendPayload);
  const item = requireData(res.data?.success, res.data?.data, 'Creating agent');
  return mapAgentFromBackend(item);
};

export const updateAgent = async (id: string, updates: Partial<Agent>): Promise<Agent> => {
  const backendPayload = toBackendAgentPayload(updates);
  const res = await apiClient.patch<APIEnvelope<any>>(getScopedAgentUrl(`/${id}`), backendPayload);
  const data = requireData(res.data?.success, res.data?.data, 'Updating agent');
  return mapAgentFromBackend(data);
};

export const deleteAgent = async (id: string): Promise<boolean> => {
  const res = await apiClient.delete<APIEnvelope<{ deleted?: boolean }>>(getScopedAgentUrl(`/${id}`));
  return !!res.data?.success && res.data.data?.deleted !== false;
};

// --- AGENT VERSIONING & TEST TOKEN APIS (SYNCED WITH BACKEND HLD) ---

export const getAgentTestToken = async (agentId: string): Promise<CallTicketResponse> => {
  const res = await apiClient.post<APIEnvelope<CallTicketResponse>>(getScopedAgentUrl(`/${agentId}/test-token`));
  return requireData(res.data?.success, res.data?.data, 'Starting test call');
};

export const getAgentVersions = async (agentId: string): Promise<AgentVersion[]> => {
  const res = await apiClient.get<APIEnvelope<AgentVersion[]>>(getScopedAgentUrl(`/${agentId}/versions`));
  return requireData(res.data?.success, res.data?.data, 'Loading agent versions');
};

export const publishAgentVersion = async (agentId: string, changeSummary: string): Promise<AgentVersion> => {
  const res = await apiClient.post<APIEnvelope<AgentVersion>>(getScopedAgentUrl(`/${agentId}/publish`), {
    change_summary: changeSummary,
  });
  return requireData(res.data?.success, res.data?.data, 'Publishing agent version');
};

export const rollbackAgentVersion = async (agentId: string, versionNum: number): Promise<Agent> => {
  const res = await apiClient.post<APIEnvelope<Agent>>(getScopedAgentUrl(`/${agentId}/rollback`), {
    version_num: versionNum,
  });
  return requireData(res.data?.success, res.data?.data, 'Rolling back agent');
};

// --- SINGLE CONSOLIDATED AGENT BUILDER RESOURCES API ---

export interface AgentBuilderPhoneNumbers {
  available: Array<{
    id: string;
    phone_number: string;
    provider: string;
    type?: string;
    region?: string;
    monthly_cost_usd?: number;
    carrier_sid?: string;
    assigned_agent_id?: string;
    assigned_agent?: any;
    status?: string;
  }>;
  assigned: Array<{
    id: string;
    phone_number: string;
    provider: string;
    type?: string;
    region?: string;
    monthly_cost_usd?: number;
    carrier_sid?: string;
    assigned_agent_id?: string;
    assigned_agent?: any;
    status?: string;
  }>;
}

export interface AgentBuilderResources {
  phone_numbers: AgentBuilderPhoneNumbers;
  stt: any[];
  tts: any[];
  llm: any[];
  knowledge_bases: Array<{
    id: string;
    workspace_id?: string;
    name: string;
    description?: string;
    document_count?: number;
    chunk_count?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  integrations: Array<{
    id: string;
    provider: string;
    name: string;
    is_connected: boolean;
    credentials_json?: string;
  }>;
}

export const getAgentBuilderResources = async (): Promise<AgentBuilderResources> => {
  const res = await apiClient.get<APIEnvelope<AgentBuilderResources>>(getScopedAgentUrl('/builder-resources'));
  if (res.data?.success && res.data.data) {
    return res.data.data;
  }
  return {
    phone_numbers: { available: [], assigned: [] },
    stt: [],
    tts: [],
    llm: [],
    knowledge_bases: [],
    integrations: [],
  };
};


