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

export const getAgents = async (): Promise<Agent[]> => {
  const res = await apiClient.get<APIEnvelope<any[]>>(getScopedAgentUrl());
  if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        role: item.role || 'Voice Assistant',
        description: item.description || '',
        avatar: item.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        systemPrompt: item.system_prompt || '',
        voiceId: item.voice_id || 'eleven_multilingual_v2',
        voiceName: item.voice_name || 'Rachel',
        language: item.language || 'en-US',
        model: item.model || 'gpt-4o',
        status: item.status || 'draft',
        phoneNumber: item.assigned_phone,
        workspaceId: item.workspace_id,
        knowledgeBaseIds: [],
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
        totalCalls: Number(item.total_calls ?? item.totalCalls ?? 0),
        avgDurationSec: Number(item.avg_duration_sec ?? item.avgDurationSec ?? 0),
        successRate: Number(item.success_rate ?? item.successRate ?? 0),
      }));
  }
  throw new Error('Agent list was not confirmed by the server.');
};

export const getAgentById = async (id: string): Promise<Agent | undefined> => {
  const res = await apiClient.get<APIEnvelope<Agent>>(getScopedAgentUrl(`/${id}`));
  if (!res.data?.success) return undefined;
  return res.data.data;
};

export const getAgent = getAgentById;

export const createAgent = async (payload: CreateAgentPayload): Promise<Agent> => {
  const res = await apiClient.post<APIEnvelope<Agent>>(getScopedAgentUrl(), payload);
  return requireData(res.data?.success, res.data?.data, 'Creating agent');
};

export const updateAgent = async (id: string, updates: Partial<Agent>): Promise<Agent> => {
  const res = await apiClient.patch<APIEnvelope<Agent>>(getScopedAgentUrl(`/${id}`), updates);
  return requireData(res.data?.success, res.data?.data, 'Updating agent');
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
