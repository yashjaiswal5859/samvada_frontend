import { apiClient } from './client';
import { Integration, APIEnvelope } from '../types';
import { MOCK_INTEGRATIONS } from '../utils/constants';

let localIntegrations = [...MOCK_INTEGRATIONS];

export const getIntegrations = async (): Promise<Integration[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>('/api/v1/integrations');
    if (res.data?.success && res.data.data && res.data.data.length > 0) {
      return res.data.data.map((item: any) => {
        const matchingMock = MOCK_INTEGRATIONS.find(
          (m) => m.name.toLowerCase().includes(item.provider?.toLowerCase() || '') || m.id === item.provider
        );
        return {
          id: item.id || item.provider,
          name: item.name || matchingMock?.name || item.provider,
          category: matchingMock?.category || 'crm',
          description: matchingMock?.description || 'Connected third-party service.',
          iconName: matchingMock?.iconName || 'Globe',
          connected: item.is_connected ?? false,
          apiKeySet: !!item.credentials_json && item.credentials_json !== '{}',
        };
      });
    }
  } catch (err) {
    console.warn('Integrations endpoint unavailable, falling back to local state', err);
  }
  return localIntegrations;
};

export const toggleIntegration = async (id: string, connected: boolean): Promise<Integration> => {
  try {
    const res = await apiClient.post<APIEnvelope<any>>(`/api/v1/integrations/${id}/toggle`, { connected });
    if (res.data?.success && res.data.data) {
      localIntegrations = localIntegrations.map((item) => (item.id === id ? { ...item, connected } : item));
      const updated = localIntegrations.find((item) => item.id === id);
      if (updated) return { ...updated, connected };
    }
  } catch (err) {
    console.warn('Toggle integration API failed, updating locally', err);
  }

  localIntegrations = localIntegrations.map((item) => (item.id === id ? { ...item, connected } : item));
  const updated = localIntegrations.find((item) => item.id === id);
  if (!updated) throw new Error('Integration not found');
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
