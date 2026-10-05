import { apiClient } from './client';
import { APIEnvelope, OnboardingState, ProfileSetupPayload, IndustrySelectionPayload } from '../types';

export const saveProfile = async (payload: ProfileSetupPayload): Promise<OnboardingState> => {
  const res = await apiClient.post<APIEnvelope<OnboardingState>>('/api/v1/onboarding/profile', payload);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to save profile');
  }
  return res.data.data;
};

export const saveIndustries = async (payload: IndustrySelectionPayload): Promise<OnboardingState> => {
  const res = await apiClient.post<APIEnvelope<OnboardingState>>('/api/v1/onboarding/industries', payload);
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to save industry selections');
  }
  return res.data.data;
};

export const getOnboardingState = async (): Promise<OnboardingState> => {
  const res = await apiClient.get<APIEnvelope<OnboardingState>>('/api/v1/onboarding/state');
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to get onboarding state');
  }
  return res.data.data;
};
