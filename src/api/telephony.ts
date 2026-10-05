import { apiClient, getActiveWorkspaceId } from './client';
import { APIEnvelope } from '../types';

export interface PhoneNumberRecord {
  id: string;
  phoneNumber: string;
  countryCode: string;
  provider: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: 'active' | 'pending' | 'released';
  type: string;
}

const getScopedTelephonyUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/phone-numbers${subpath}`;
  }
  return `/api/v1/phone-numbers${subpath}`;
};

export const getPhoneNumbers = async (): Promise<PhoneNumberRecord[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<PhoneNumberRecord[]>>(getScopedTelephonyUrl());
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Phone numbers API unavailable, using local mock data', err);
  }

  return [
    { id: 'num-1', phoneNumber: '+1 (800) 555-0192', countryCode: 'US', type: 'Toll-Free Inbound', assignedAgentName: 'Claims Support Assistant', status: 'active', provider: 'Twilio' },
    { id: 'num-2', phoneNumber: '+1 (800) 555-0481', countryCode: 'US', type: 'Local US Outbound', assignedAgentName: 'Dental Appointment Scheduler', status: 'active', provider: 'Twilio' },
    { id: 'num-3', phoneNumber: '+1 (800) 555-0922', countryCode: 'US', type: 'Local US Outbound', assignedAgentName: 'Payment Reminder Bot', status: 'active', provider: 'Plivo' },
  ];
};

export const searchAvailableNumbers = async (country = 'US'): Promise<any[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>(getScopedTelephonyUrl(`/available?country=${country}`));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Search available numbers API unavailable', err);
  }
  return [];
};

export const purchasePhoneNumber = async (phoneNumber: string, provider: 'twilio' | 'plivo'): Promise<PhoneNumberRecord> => {
  const res = await apiClient.post<APIEnvelope<PhoneNumberRecord>>(getScopedTelephonyUrl('/purchase'), {
    phone_number: phoneNumber,
    provider,
  });
  if (res.data?.success && res.data.data) {
    return res.data.data;
  }
  return {
    id: `num-${Date.now()}`,
    phoneNumber,
    countryCode: 'US',
    provider,
    status: 'active',
    type: 'Inbound / Outbound',
  };
};

export const assignAgentToNumber = async (numberId: string, agentId: string): Promise<boolean> => {
  const res = await apiClient.post<APIEnvelope<{ assigned: boolean }>>(getScopedTelephonyUrl(`/${numberId}/assign`), {
    agent_id: agentId,
  });
  return !!res.data?.success;
};

export const releasePhoneNumber = async (numberId: string): Promise<boolean> => {
  const res = await apiClient.delete(getScopedTelephonyUrl(`/${numberId}`));
  return !!res.data?.success;
};
