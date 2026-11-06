// =============================================================================
// Samvada Voice AI Platform — Frontend Route Registry
// =============================================================================

export const ROUTES = {
  // Public & Authentication
  ROOT: '/',
  LANDING: '/landing',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify-email',

  // Onboarding
  ONBOARDING: '/onboarding',
  ONBOARDING_PROFILE: '/onboarding/profile',
  ONBOARDING_INDUSTRIES: '/onboarding/industries',

  // Core Operations Portal
  HOME: '/home',
  DASHBOARD: '/dashboard',

  // Voice Agents
  AGENTS: '/agents',
  AGENTS_CREATE: '/agents/create',
  AGENTS_STUDIO: '/ai-studio',
  AGENTS_BUILDER: '/agents/builder',
  AGENT_DETAIL: (id: string) => `/agents/${id}`,

  // Conversational Telephony & Calls
  CALLS: '/calls',
  CALLS_LIVE: '/calls/live',
  CALL_DETAIL: (id: string) => `/calls/${id}`,
  TELEPHONY: '/telephony',
  VOICES: '/voices',

  // Campaigns & Contacts
  CAMPAIGNS: '/campaigns',
  CAMPAIGNS_CREATE: '/campaigns/create',
  CONTACTS: '/contacts',

  // Knowledge & Integrations
  KNOWLEDGE: '/knowledge',
  KNOWLEDGE_FOLDER: (folderName: string) => `/knowledge/${folderName}`,
  INTEGRATIONS: '/integrations',

  // Telemetry & Observability
  ANALYTICS: '/analytics',
  OBSERVABILITY: '/observability',
  NOTIFICATIONS: '/notifications',

  // Multi-Tenant Workspaces & Settings
  WORKSPACES: '/workspaces',
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_TEAM: '/settings/team',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_AUDIT_LOGS: '/settings/audit-logs',
  SETTINGS_TELEPHONY: '/settings/telephony',

  // Documentation & Support
  HELP: '/help',
  GETTING_STARTED: '/getting-started',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];

