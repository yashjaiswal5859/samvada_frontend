import { apiClient, setAccessToken, setRefreshToken, getRefreshToken } from './client';
import { APIEnvelope, OTPResponse, TokenResponse, VerifyOTPResponse, User, Organization, Workspace } from '../types';

export const requestLoginOTP = async (email: string): Promise<OTPResponse> => {
  const res = await apiClient.post<APIEnvelope<OTPResponse>>('/api/v1/auth/login', { email });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to request login OTP');
  }
  return res.data.data;
};

export const verifyLoginOTP = async (requestId: string, otp: string, loginChallenge?: string): Promise<VerifyOTPResponse> => {
  const res = await apiClient.post<APIEnvelope<VerifyOTPResponse>>('/api/v1/auth/login/verify', {
    requestId,
    otp,
    loginChallenge,
  });
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to verify login OTP');
  }
  if (res.data.data.accessToken) {
    setAccessToken(res.data.data.accessToken);
  }
  if (res.data.data.refreshToken) {
    setRefreshToken(res.data.data.refreshToken);
  }
  return res.data.data;
};


export const fetchMe = async (): Promise<User> => {
  // Session & tenant data is fetched directly from ABS (samvada_abs)
  const res = await apiClient.get<APIEnvelope<User>>('/api/v1/user/me');
  if (!res.data.success || !res.data.data) {
    throw new Error(res.data.error?.message || 'Failed to fetch user session from ABS');
  }
  return res.data.data;
};

export const fetchMyOrganizations = async (): Promise<Organization[]> => {
  const res = await apiClient.get<APIEnvelope<Organization[]>>('/api/v1/orgs');
  if (res.data.success && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  return [];
};

export const fetchMyWorkspaces = async (orgId?: string): Promise<Workspace[]> => {
  const url = orgId ? `/api/v1/workspaces?org_id=${encodeURIComponent(orgId)}` : '/api/v1/workspaces';
  const res = await apiClient.get<APIEnvelope<Workspace[]>>(url);
  if (res.data.success && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  return [];
};

export const logoutUser = async (): Promise<void> => {
  try {
    const refreshToken = getRefreshToken();
    await apiClient.post('/api/v1/auth/logout', { refreshToken });
  } finally {
    setAccessToken(null);
    setRefreshToken(null);
  }
};
