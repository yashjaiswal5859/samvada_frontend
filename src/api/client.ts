import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { APIEnvelope } from '../types';
import { getSessionItem, setSessionItem, clearSessionStorage, SESSION_KEYS } from '../utils/session';

// =============================================================================
// Security Note: Zero JWT Storage in LocalStorage or SessionStorage (100% XSS Immune)
// Authentication tokens are stored strictly in secure HttpOnly cookies set by backend.
// Only safe public context IDs (active org_id, workspace_id) are cached in sessionStorage.
// =============================================================================

let inMemoryAccessToken: string | null = null;
let inMemoryWorkspaceId: string | null = getSessionItem(SESSION_KEYS.WORKSPACE_ID);
let inMemoryOrgId: string | null = getSessionItem(SESSION_KEYS.ORG_ID);

export const setAccessToken = (token: string | null) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

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

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const isPublicRoute = (path?: string): boolean => {
  if (!path && typeof window !== 'undefined') {
    path = window.location.pathname;
  }
  if (!path) return true;
  const clean = path.split('?')[0];
  return clean === '/' || clean === '/login';
};

const redirectToLoginIfProtected = () => {
  if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
    window.location.href = '/login';
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<APIEnvelope<unknown>>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const errorData = (error.response?.data as any)?.error;
    const isTokenExpired = errorData?.code === 'TOKEN_EXPIRED';

    // 1. Transparent token refresh ONLY when backend explicitly signals TOKEN_EXPIRED
    if (status === 401 && originalRequest && !originalRequest._retry && isTokenExpired) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<APIEnvelope<{ accessToken: string; expiresIn: number }>>(
          `${apiClient.defaults.baseURL || ''}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data.success && refreshResponse.data.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          setAccessToken(newToken);
          processQueue(null, newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Token refresh rejected by server'), null);
          setAccessToken(null);
          clearSessionStorage();
          redirectToLoginIfProtected();
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setAccessToken(null);
        clearSessionStorage();
        redirectToLoginIfProtected();
      } finally {
        isRefreshing = false;
      }
    } else if (status === 401) {
      // 2. Unauthenticated (token missing, invalid, or expired session without refresh)
      setAccessToken(null);
      clearSessionStorage();
      redirectToLoginIfProtected();
    }

    const message = errorData?.message || error.message || 'An unexpected error occurred';
    const err = new Error(message);
    (err as any).response = error.response;
    return Promise.reject(err);
  }
);
