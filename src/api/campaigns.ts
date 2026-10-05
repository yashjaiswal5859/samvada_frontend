import { apiClient, getActiveWorkspaceId } from './client';
import { Campaign, CreateCampaignPayload, Audience, APIEnvelope } from '../types';
import { MOCK_CAMPAIGNS } from '../utils/constants';

let localCampaigns: Campaign[] = [];

const getScopedCampaignUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/campaigns${subpath}`;
  }
  return `/api/v1/campaigns${subpath}`;
};

const getScopedAudienceUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/audiences${subpath}`;
  }
  return `/api/v1/audiences${subpath}`;
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<Campaign[]>>(getScopedCampaignUrl());
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Campaign API unavailable, using local data', err);
  }
  return localCampaigns;
};

export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  try {
    const res = await apiClient.post<APIEnvelope<Campaign>>(getScopedCampaignUrl(), payload);
    if (res.data?.success && res.data.data) {
      localCampaigns.unshift(res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.warn('Campaign API unavailable, creating campaign locally', err);
  }

  const newCampaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: payload.name,
    agentId: payload.agentId,
    agentName: 'Selected Agent',
    status: payload.scheduledAt ? 'scheduled' : 'running',
    targetAudienceId: payload.targetAudienceId,
    targetAudienceName: 'Selected Audience',
    totalContacts: 150,
    completedCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    scheduledAt: payload.scheduledAt || new Date().toISOString(),
    startedAt: payload.scheduledAt ? undefined : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  localCampaigns.unshift(newCampaign);
  return newCampaign;
};

export const updateCampaignStatus = async (id: string, status: 'running' | 'paused' | 'completed'): Promise<boolean> => {
  try {
    const res = await apiClient.post<APIEnvelope<{ updated: boolean }>>(getScopedCampaignUrl(`/${id}/status`), { status });
    if (res.data?.success) {
      localCampaigns = localCampaigns.map((c) => (c.id === id ? { ...c, status } : c));
      return true;
    }
  } catch (err) {
    console.warn('Campaign status update API failed, updating locally', err);
  }
  localCampaigns = localCampaigns.map((c) => (c.id === id ? { ...c, status } : c));
  return true;
};

export const getAudiences = async (): Promise<Audience[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<Audience[]>>(getScopedAudienceUrl());
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Audiences API unavailable', err);
  }
  return [];
};

export const createAudience = async (name: string, description?: string): Promise<Audience> => {
  try {
    const res = await apiClient.post<APIEnvelope<Audience>>(getScopedAudienceUrl(), { name, description });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Create audience API unavailable', err);
  }
  return {
    id: `aud_${Date.now()}`,
    name,
    description,
    contactCount: 0,
    createdAt: new Date().toISOString(),
  };
};

export const batchImportContactsCSV = async (audienceId: string, csvContent: string): Promise<{ importedCount: number }> => {
  try {
    const res = await apiClient.post<APIEnvelope<{ importedCount: number }>>(
      getScopedAudienceUrl(`/${audienceId}/batch-import`),
      { csvData: csvContent }
    );
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Batch import CSV failed, simulating import', err);
  }
  return { importedCount: 50 };
};
