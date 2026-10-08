import { apiClient, getActiveWorkspaceId } from './client';
import { APIEnvelope } from '../types';

export interface PhoneNumberRecord {
  id: string;
  phoneNumber: string;
  country: string;
  countryCode: string;
  provider: string;
  carrier: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: 'active' | 'unassigned' | 'released' | 'pending' | 'available';
  type: string;
  concurrencyLimit: number;
  monthlyCostUsd?: number;
  createdAt?: string;
}

const getScopedTelephonyUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/phone-numbers${subpath}`;
  }
  return `/api/v1/phone-numbers${subpath}`;
};

export const mapRawToPhoneNumberRecord = (raw: any): PhoneNumberRecord => {
  const rawNumber = raw.phone_number || raw.phoneNumber || '';
  const assignedAgentObj = raw.assigned_agent || raw.assignedAgent;
  const assignedAgentName =
    assignedAgentObj?.name ||
    raw.assigned_agent_name ||
    raw.assignedAgentName ||
    (raw.assigned_agent_id || raw.assignedAgentId ? 'Assigned Agent' : 'Unassigned (Reserve)');
  const assignedAgentId =
    raw.assigned_agent_id ||
    raw.assignedAgentId ||
    assignedAgentObj?.id ||
    '';

  const provider = (raw.provider || 'twilio').toLowerCase();
  const carrier =
    provider.includes('telnyx')
      ? 'Telnyx Trunk'
      : provider.includes('bandwidth')
      ? 'Bandwidth Enterprise'
      : provider.includes('plivo')
      ? 'Plivo Voice'
      : 'Twilio SIP';

  const rawType = (raw.type || 'toll_free').toLowerCase();
  const displayType =
    rawType === 'local'
      ? 'Local Geographic'
      : rawType === 'mobile'
      ? 'Mobile DID'
      : 'Toll-Free';

  let country = 'United States';
  let countryCode = 'US';
  if (rawNumber.startsWith('+44')) {
    country = 'United Kingdom';
    countryCode = 'GB';
  } else if (rawNumber.startsWith('+91')) {
    country = 'India';
    countryCode = 'IN';
  }

  const statusVal = (raw.status || 'active').toLowerCase();

  return {
    id: String(raw.id),
    phoneNumber: rawNumber,
    country,
    countryCode,
    provider: raw.provider || 'twilio',
    carrier,
    assignedAgentId,
    assignedAgentName,
    status: statusVal === 'available' ? 'available' : !assignedAgentId && statusVal === 'active' ? 'unassigned' : (statusVal as any),
    type: displayType,
    concurrencyLimit: raw.concurrency_limit || (rawType === 'toll_free' ? 20 : 10),
    monthlyCostUsd: Number(raw.monthly_cost_usd ?? 1.0),
    createdAt: raw.created_at,
  };
};

export const getPhoneNumbers = async (search?: string): Promise<PhoneNumberRecord[]> => {
  const queryParam = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  const res = await apiClient.get<APIEnvelope<any[]>>(getScopedTelephonyUrl(queryParam));
  if (!res.data?.success || !Array.isArray(res.data.data)) {
    throw new Error('Phone number inventory was not confirmed by the server.');
  }

  return res.data.data.map(mapRawToPhoneNumberRecord);
};

export const getAvailablePhoneNumbers = async (search?: string): Promise<PhoneNumberRecord[]> => {
  try {
    const queryParam = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
    const res = await apiClient.get<APIEnvelope<any[]>>(getScopedTelephonyUrl(`/available${queryParam}`));
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map(mapRawToPhoneNumberRecord);
    }
  } catch (err) {
    console.warn('Failed to fetch available numbers from database', err);
  }
  return [];
};

export const allocateNumberFromDatabase = async (payload: {
  phoneNumberId: string;
  assignedAgentId?: string;
}): Promise<PhoneNumberRecord> => {
  const res = await apiClient.post<APIEnvelope<any>>(getScopedTelephonyUrl(), {
    phone_number_id: payload.phoneNumberId,
    assigned_agent_id: payload.assignedAgentId || undefined,
  });

  if (res.data?.success && res.data.data) {
    return mapRawToPhoneNumberRecord(res.data.data);
  }
  throw new Error('Allocation was not confirmed by the server.');
};

export const assignAgentToNumber = async (numberId: string, agentId: string): Promise<boolean> => {
  const res = await apiClient.post<APIEnvelope<{ assigned: boolean }>>(getScopedTelephonyUrl(`/${numberId}/assign`), {
    agent_id: agentId,
  });
  return !!res.data?.success;
};

export const unassignAgentFromNumber = async (numberId: string): Promise<boolean> => {
  const res = await apiClient.post<APIEnvelope<{ unassigned: boolean }>>(getScopedTelephonyUrl(`/${numberId}/unassign`));
  return !!res.data?.success;
};

export const releasePhoneNumber = async (numberId: string): Promise<boolean> => {
  const res = await apiClient.delete(getScopedTelephonyUrl(`/${numberId}`));
  return !!res.data?.success;
};
