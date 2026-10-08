import { apiClient, getActiveWorkspaceId } from './client';
import { Campaign, CreateCampaignPayload, Audience, APIEnvelope } from '../types';
const requireData = <T,>(success: boolean | undefined, data: T | undefined, operation: string): T => {
  if (success && data !== undefined && data !== null) return data;
  throw new Error(`${operation} was not confirmed by the server.`);
};

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
  const res = await apiClient.get<APIEnvelope<Campaign[]>>(getScopedCampaignUrl());
  return requireData(res.data?.success, res.data?.data, 'Loading campaigns');
};

export const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
  const res = await apiClient.post<APIEnvelope<Campaign>>(getScopedCampaignUrl(), payload);
  return requireData(res.data?.success, res.data?.data, 'Creating campaign');
};

export const updateCampaignStatus = async (id: string, status: 'running' | 'paused' | 'completed'): Promise<boolean> => {
  const res = await apiClient.post<APIEnvelope<{ updated: boolean }>>(getScopedCampaignUrl(`/${id}/status`), { status });
  return !!res.data?.success && !!res.data.data?.updated;
};

export const getAudiences = async (): Promise<Audience[]> => {
  const res = await apiClient.get<APIEnvelope<Audience[]>>(getScopedAudienceUrl());
  return requireData(res.data?.success, res.data?.data, 'Loading audiences');
};

export const createAudience = async (name: string, description?: string): Promise<Audience> => {
  const res = await apiClient.post<APIEnvelope<Audience>>(getScopedAudienceUrl(), { name, description });
  return requireData(res.data?.success, res.data?.data, 'Creating audience');
};

export const batchImportContactsCSV = async (audienceId: string, csvContent: string): Promise<{ importedCount: number }> => {
  const res = await apiClient.post<APIEnvelope<{ importedCount: number }>>(
    getScopedAudienceUrl(`/${audienceId}/batch-import`),
    { csvData: csvContent }
  );
  return requireData(res.data?.success, res.data?.data, 'Importing contacts');
};
