// =============================================================================
// Samvada Platform — AI Catalog & Phone Inventory API Client
// =============================================================================

import { apiClient } from './client';
import { APIEnvelope } from '../types';

export interface AIModelItem {
  id: string;
  category: 'stt' | 'tts' | 'llm';
  name: string;
  provider: string;
  note?: string;
  is_recommended?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface CatalogGroupedModels {
  stt: AIModelItem[];
  tts: AIModelItem[];
  llm: AIModelItem[];
}

export interface CatalogPhoneNumberInput {
  phone_number: string;
  provider: string;
  type?: string;
  monthly_cost_usd?: number;
  carrier_sid?: string;
  country?: string;
  region?: string;
}

export interface BulkUploadSummary {
  total_processed: number;
  inserted: number;
  updated: number;
  failed: number;
  errors?: string[];
}

export const getCatalogModels = async (): Promise<CatalogGroupedModels> => {
  try {
    const res = await apiClient.get<APIEnvelope<CatalogGroupedModels>>('/catalog/models');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to load dynamic model catalog from ABS, falling back to static options', err);
  }
  return { stt: [], tts: [], llm: [] };
};

export const getCatalogPhoneNumbers = async (search?: string): Promise<any[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>('/catalog/phone-numbers', {
      params: search ? { search } : undefined,
    });
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to load available catalog phone numbers', err);
  }
  return [];
};

// Admin bulk upload APIs
export const uploadAdminPhoneNumbers = async (
  numbers: CatalogPhoneNumberInput[]
): Promise<BulkUploadSummary | null> => {
  const res = await apiClient.post<APIEnvelope<BulkUploadSummary>>(
    '/admin/catalog/phone-numbers',
    numbers
  );
  return res.data?.data || null;
};

export const uploadAdminModels = async (
  models: Partial<AIModelItem>[]
): Promise<AIModelItem[]> => {
  const res = await apiClient.post<APIEnvelope<AIModelItem[]>>(
    '/admin/catalog/models',
    models
  );
  return res.data?.data || [];
};

export const uploadAdminSTTModels = async (
  models: Partial<AIModelItem>[]
): Promise<AIModelItem[]> => {
  const res = await apiClient.post<APIEnvelope<AIModelItem[]>>(
    '/admin/catalog/stt',
    models
  );
  return res.data?.data || [];
};

export const uploadAdminTTSModels = async (
  models: Partial<AIModelItem>[]
): Promise<AIModelItem[]> => {
  const res = await apiClient.post<APIEnvelope<AIModelItem[]>>(
    '/admin/catalog/tts',
    models
  );
  return res.data?.data || [];
};

export const uploadAdminLLMModels = async (
  models: Partial<AIModelItem>[]
): Promise<AIModelItem[]> => {
  const res = await apiClient.post<APIEnvelope<AIModelItem[]>>(
    '/admin/catalog/llm',
    models
  );
  return res.data?.data || [];
};
