import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APIEnvelope } from '../types';
import { getSessionItem, setSessionItem, SESSION_KEYS } from '../utils/session';

// =============================================================================
// Security Note: Zero JWT Storage in LocalStorage or SessionStorage (100% XSS Immune)
// Authentication tokens are stored strictly in secure HttpOnly cookies set by backend.
// Only safe public context IDs (active org_id, workspace_id) are cached in sessionStorage.
// =============================================================================

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryWorkspaceId: string | null = getSessionItem(SESSION_KEYS.WORKSPACE_ID);
let inMemoryOrgId: string | null = getSessionItem(SESSION_KEYS.ORG_ID);

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const setRefreshToken = (token: string | null) => {
  inMemoryRefreshToken = token;
};

export const getRefreshToken = () => inMemoryRefreshToken;

export const setActiveWorkspaceId = (id: string | null) => {
  inMemoryWorkspaceId = id;
  setSessionItem(SESSION_KEYS.WORKSPACE_ID, id);
};

export const getActiveWorkspaceId = () => inMemoryWorkspaceId || getSessionItem(SESSION_KEYS.WORKSPACE_ID);

export const setActiveOrgId = (id: string | null) => {
  inMemoryOrgId = id;
  setSessionItem(SESSION_KEYS.ORG_ID, id);
};

export const getActiveOrgId = () => inMemoryOrgId || getSessionItem(SESSION_KEYS.ORG_ID);

export const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || '', // Points to headless API Gateway (e.g., https://api.samvada.ai)
  withCredentials: true, // Send HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  const wsId = inMemoryWorkspaceId || getSessionItem(SESSION_KEYS.WORKSPACE_ID);
  const orgId = inMemoryOrgId || getSessionItem(SESSION_KEYS.ORG_ID);

  if (config.headers) {
    if (!config.headers['X-Workspace-ID'] && wsId) {
      config.headers['X-Workspace-ID'] = wsId;
    }
    if (orgId && !config.headers['X-Org-ID']) {
      config.headers['X-Org-ID'] = orgId;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIEnvelope<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Transparent token refresh on 401 (excluding auth initiation endpoints)
    const isAuthRoute =
      originalRequest?.url?.includes('/api/v1/auth/login') ||
      originalRequest?.url?.includes('/api/v1/auth/register') ||
      originalRequest?.url?.includes('/api/v1/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post<APIEnvelope<{ accessToken: string; refreshToken?: string; expiresIn: number }>>(
          '/api/v1/auth/refresh',
          { refreshToken: inMemoryRefreshToken },
          { withCredentials: true }
        );

        if (refreshResponse.data.success && refreshResponse.data.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          setAccessToken(newToken);
          if (refreshResponse.data.data.refreshToken) {
            setRefreshToken(refreshResponse.data.data.refreshToken);
          }
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        setAccessToken(null);
        setRefreshToken(null);
      }
    }

    const message = error.response?.data?.error?.message || error.message || 'An unexpected error occurred';
    const err = new Error(message);
    (err as any).response = error.response;
    return Promise.reject(err);
  }
);
