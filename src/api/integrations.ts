import { apiClient } from './client';
import { Integration, APIEnvelope } from '../types';
import { MOCK_INTEGRATIONS } from '../utils/constants';

export const formatIntegrations = (dataList: any[] = []): Integration[] => {
  return MOCK_INTEGRATIONS.map((catalogItem) => {
    const item = dataList.find((entry: any) =>
      entry.provider === catalogItem.id || entry.id === catalogItem.id ||
      String(entry.name || '').toLowerCase() === catalogItem.name.toLowerCase()
    );
    return {
      ...catalogItem,
      connected: item?.is_connected === true,
      apiKeySet: !!item?.credentials_json && item.credentials_json !== '{}',
    };
  });
};

export const getIntegrations = async (): Promise<Integration[]> => {
  const res = await apiClient.get<APIEnvelope<any[]>>('/api/v1/integrations');
  if (!res.data?.success || !Array.isArray(res.data.data)) {
    throw new Error('Integration status was not confirmed by the server.');
  }
  return formatIntegrations(res.data.data || []);
};

export const toggleIntegration = async (id: string, connected: boolean): Promise<Integration> => {
  const res = await apiClient.post<APIEnvelope<any>>(`/api/v1/integrations/${id}/toggle`, { connected });
  if (!res.data?.success) throw new Error('The integration change was not confirmed by the server.');
  const updated = (await getIntegrations()).find((item) => item.id === id);
  if (!updated) throw new Error('Integration not found after the update.');
  return updated;
};

export const saveIntegrationCredentials = async (id: string, credentials: Record<string, any>): Promise<boolean> => {
  try {
    const res = await apiClient.post<APIEnvelope<any>>(`/api/v1/integrations/${id}/credentials`, {
      credentials_json: JSON.stringify(credentials),
    });
    return !!res.data?.success;
  } catch (err) {
    console.warn('Failed to save integration credentials', err);
    return false;
  }
};
