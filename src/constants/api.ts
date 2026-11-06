// =============================================================================
// Samvada Voice AI Platform — API Constants & Endpoints
// =============================================================================

export const HTTP_HEADERS = {
  WORKSPACE_ID: 'X-Workspace-ID',
  ORG_ID: 'X-Org-ID',
  CORRELATION_ID: 'X-Correlation-ID',
  REQUEST_ID: 'X-Request-ID',
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  PDF: 'application/pdf',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN_OTP: '/api/v1/auth/login',
    VERIFY_OTP: '/api/v1/auth/login/verify',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    USER_ME: '/api/v1/user/me',
  },
  TENANCY: {
    ORGS: '/api/v1/orgs',
    WORKSPACES: '/api/v1/workspaces',
    WORKSPACE_DETAIL: (id: string) => `/api/v1/workspaces/${id}`,
  },
  AGENTS: {
    LIST: '/api/v1/agents',
    DETAIL: (id: string) => `/api/v1/agents/${id}`,
    TEST_TOKEN: (id: string) => `/api/v1/agents/${id}/test-token`,
    VERSIONS: (id: string) => `/api/v1/agents/${id}/versions`,
    PUBLISH: (id: string) => `/api/v1/agents/${id}/publish`,
    ROLLBACK: (id: string) => `/api/v1/agents/${id}/rollback`,
  },
  CALLS: {
    LIST: '/api/v1/calls',
    DETAIL: (id: string) => `/api/v1/calls/${id}`,
    LIVE: '/api/v1/calls/live',
  },
  CAMPAIGNS: {
    LIST: (wsId: string) => `/api/v1/workspaces/${wsId}/campaigns`,
    STATUS: (id: string) => `/api/v1/campaigns/${id}/status`,
    AUDIENCES: (wsId: string) => `/api/v1/workspaces/${wsId}/audiences`,
    CONTACTS: (audId: string) => `/api/v1/audiences/${audId}/contacts`,
  },
  TELEPHONY: {
    NUMBERS: '/api/v1/phone-numbers',
    AVAILABLE: '/api/v1/phone-numbers/available',
    ASSIGN: (numberId: string) => `/api/v1/phone-numbers/${numberId}/assign`,
    UNASSIGN: (numberId: string) => `/api/v1/phone-numbers/${numberId}/unassign`,
  },
  KNOWLEDGE: {
    BASE: '/api/v1/kb',
    DOCUMENTS: (kbId: string) => `/api/v1/kb/${kbId}/documents`,
    UPLOAD_PRESIGN: (kbId: string) => `/api/v1/kb/${kbId}/documents/presign`,
    UPLOAD: (kbId: string) => `/api/v1/kb/${kbId}/documents/upload`,
    SYNC: (kbId: string) => `/api/v1/kb/${kbId}/sync`,
  },
  ANALYTICS: {
    SUMMARY: '/api/v1/analytics/summary',
    VOLUME_TREND: '/api/v1/analytics/volume-trend',
    LEADERBOARD: '/api/v1/analytics/agents/leaderboard',
    FUNNELS: '/api/v1/analytics/funnels',
  },
  SETTINGS: {
    API_KEYS: '/api/v1/settings/api-keys',
    WEBHOOKS: '/api/v1/settings/webhooks',
    MEMBERS: '/api/v1/settings/members',
    BILLING_USAGE: '/api/v1/settings/billing/usage',
    AUDIT_LOGS: '/api/v1/settings/audit-logs',
    SECURITY_PASSWORD: '/api/v1/settings/security/password',
    SECURITY_2FA: '/api/v1/settings/security/2fa',
  },
} as const;

export const UI_CONFIG = {
  OTP: {
    LENGTH: 6,
    COUNTDOWN_SECONDS: 30,
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    RECENT_CALLS_DASHBOARD: 5,
    RECENT_AGENTS_DASHBOARD: 4,
    LIVE_CONSOLE_CALLS: 50,
  },
  TIMEOUTS: {
    SEARCH_DEBOUNCE_MS: 350,
    TOAST_DURATION_MS: 4000,
    COPY_FEEDBACK_MS: 2000,
  },
} as const;

