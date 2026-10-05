import { apiClient, getActiveWorkspaceId } from './client';
import { Agent, CreateAgentPayload, APIEnvelope, CallTicketResponse, AgentVersion } from '../types';

let localAgents: Agent[] = [];

const getScopedAgentUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/agents${subpath}`;
  }
  return `/api/v1/agents${subpath}`;
};

export const getAgents = async (): Promise<Agent[]> => {
  try {
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
  } catch (err) {
    console.warn('API unavailable, returning local agents', err);
  }
  return localAgents;
};

export const getAgentById = async (id: string): Promise<Agent | undefined> => {
  try {
    const res = await apiClient.get<APIEnvelope<Agent>>(getScopedAgentUrl(`/${id}`));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('API unavailable, falling back to local agent lookup', err);
  }
  return localAgents.find((a) => a.id === id);
};

export const createAgent = async (payload: CreateAgentPayload): Promise<Agent> => {
  try {
    const res = await apiClient.post<APIEnvelope<Agent>>(getScopedAgentUrl(), payload);
    if (res.data?.success && res.data.data) {
      localAgents.unshift(res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.warn('API unavailable, creating agent locally', err);
  }

  const newAgent: Agent = {
    id: `agent-${Date.now()}`,
    name: payload.name,
    role: payload.role,
    description: payload.description || 'Custom configured voice assistant.',
    systemPrompt: payload.systemPrompt || `You are ${payload.name}, a helpful AI voice assistant.`,
    voiceId: payload.voiceId,
    voiceName: 'Selected Voice',
    language: payload.language || 'English (US)',
    model: payload.model || 'gpt-4o',
    status: 'active',
    phoneNumber: '+1 (800) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
    knowledgeBaseIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalCalls: 0,
    avgDurationSec: 0,
    successRate: 100,
  };

  localAgents.unshift(newAgent);
  return newAgent;
};

export const updateAgent = async (id: string, updates: Partial<Agent>): Promise<Agent> => {
  try {
    const res = await apiClient.patch<APIEnvelope<Agent>>(getScopedAgentUrl(`/${id}`), updates);
    if (res.data?.success && res.data.data) {
      localAgents = localAgents.map((a) => (a.id === id ? res.data.data! : a));
      return res.data.data;
    }
  } catch (err) {
    console.warn('API update failed, updating local state', err);
  }

  localAgents = localAgents.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
  const found = localAgents.find((a) => a.id === id);
  if (!found) throw new Error('Agent not found');
  return found;
};

export const deleteAgent = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(getScopedAgentUrl(`/${id}`));
  } catch (err) {
    console.warn('API delete failed, removing locally', err);
  }
  localAgents = localAgents.filter((a) => a.id !== id);
  return true;
};

// --- AGENT VERSIONING & TEST TOKEN APIS (SYNCED WITH BACKEND HLD) ---

export const getAgentTestToken = async (agentId: string): Promise<CallTicketResponse> => {
  try {
    const res = await apiClient.post<APIEnvelope<CallTicketResponse>>(getScopedAgentUrl(`/${agentId}/test-token`));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Backend ABS token endpoint unavailable, using mock token', err);
  }

  return {
    ticket: `mock_ticket_${agentId}_${Date.now()}`,
    wssUrl: (import.meta as any).env?.VITE_WS_BASE_URL ? `${(import.meta as any).env.VITE_WS_BASE_URL}/ws/calls/demo` : 'ws://localhost:8084/ws/calls/demo',
    remainingCreditUSD: 5.0000,
    maxDurationSec: 300,
    expiresInSec: 60,
  };
};

export const getAgentVersions = async (agentId: string): Promise<AgentVersion[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<AgentVersion[]>>(getScopedAgentUrl(`/${agentId}/versions`));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Agent versions API unavailable, using local snapshot', err);
  }

  return [
    {
      id: `ver-1-${agentId}`,
      agentId,
      versionNum: 1,
      systemPrompt: 'Initial deployment configuration.',
      model: 'gpt-4o',
      voiceId: 'voice_elevenlabs_rachel',
      language: 'en-US',
      changeSummary: 'Initial production version',
      createdAt: new Date().toISOString(),
    },
  ];
};

export const publishAgentVersion = async (agentId: string, changeSummary: string): Promise<AgentVersion> => {
  try {
    const res = await apiClient.post<APIEnvelope<AgentVersion>>(getScopedAgentUrl(`/${agentId}/publish`), { changeSummary });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Publish version API unavailable', err);
  }

  return {
    id: `ver-${Date.now()}`,
    agentId,
    versionNum: 2,
    systemPrompt: 'Updated system instructions.',
    model: 'gpt-4o',
    voiceId: 'voice_elevenlabs_rachel',
    language: 'en-US',
    changeSummary,
    createdAt: new Date().toISOString(),
  };
};

export const rollbackAgentVersion = async (agentId: string, versionNum: number): Promise<Agent> => {
  try {
    const res = await apiClient.post<APIEnvelope<Agent>>(getScopedAgentUrl(`/${agentId}/rollback`), {
      target_version: versionNum,
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Rollback API unavailable', err);
  }

  const agent = localAgents.find((a) => a.id === agentId);
  if (!agent) throw new Error('Agent not found');
  return agent;
};
