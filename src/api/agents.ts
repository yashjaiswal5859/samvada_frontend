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

export const createAgent = async (payload: CreateAgentPayload): Promise<Agent> => {
  const res = await apiClient.post<APIEnvelope<any>>(getScopedAgentUrl(), payload);
  const item = requireData(res.data?.success, res.data?.data, 'Creating agent');
  return mapAgentFromBackend(item);
};

export const updateAgent = async (id: string, updates: Partial<Agent>): Promise<Agent> => {
  const res = await apiClient.patch<APIEnvelope<any>>(getScopedAgentUrl(`/${id}`), updates);
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
  const res = await apiClient.post<APIEnvelope<AgentVersion>>(getScopedAgentUrl(`/${agentId}/publish`), { changeSummary });
  return requireData(res.data?.success, res.data?.data, 'Publishing agent version');
};

export const rollbackAgentVersion = async (agentId: string, versionNum: number): Promise<Agent> => {
  const res = await apiClient.post<APIEnvelope<Agent>>(getScopedAgentUrl(`/${agentId}/rollback`), {
    target_version: versionNum,
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


