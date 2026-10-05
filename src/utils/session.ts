// =============================================================================
// Samvada Platform — SessionStorage Tenant Context Manager
// =============================================================================
// Security Note:
// Zero Authentication Tokens (JWTs) are stored here.
// Auth tokens remain strictly in secure HttpOnly cookies set by the backend.
// Only safe, non-sensitive tenant metadata (active org_id, workspace_id, names)
// are cached in sessionStorage for fast client navigation and page reload consistency.
// =============================================================================

import { Organization, Workspace, User } from '../types';

export const SESSION_KEYS = {
  ORG_ID: 'samvada_org_id',
  ORG_NAME: 'samvada_org_name',
  ORG_SLUG: 'samvada_org_slug',
  WORKSPACE_ID: 'samvada_workspace_id',
  WORKSPACE_NAME: 'samvada_workspace_name',
  WORKSPACE_SLUG: 'samvada_workspace_slug',
  USER_ID: 'samvada_user_id',
  USER_EMAIL: 'samvada_user_email',
  ONBOARDING_COMPLETED: 'samvada_onboarding_completed',
  ORGANIZATIONS: 'samvada_organizations',
  WORKSPACES: 'samvada_workspaces',
} as const;

export const getSessionItem = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

export const setSessionItem = (key: string, value: string | null): void => {
  try {
    if (typeof window === 'undefined') return;
    if (value !== null && value !== undefined) {
      sessionStorage.setItem(key, value);
    } else {
      sessionStorage.removeItem(key);
    }
  } catch {}
};

export const clearSessionStorage = (): void => {
  try {
    if (typeof window === 'undefined') return;
    Object.values(SESSION_KEYS).forEach((k) => sessionStorage.removeItem(k));
  } catch {}
};

export interface SessionContextData {
  user?: User | null;
  activeOrg?: Organization | null;
  activeWorkspace?: Workspace | null;
  organizations?: Organization[];
  workspaces?: Workspace[];
}

export const saveSessionContext = (data: SessionContextData): void => {
  if (data.user) {
    setSessionItem(SESSION_KEYS.USER_ID, data.user.id || null);
    setSessionItem(SESSION_KEYS.USER_EMAIL, data.user.email || null);
    setSessionItem(
      SESSION_KEYS.ONBOARDING_COMPLETED,
      data.user.onboardingCompleted ? 'true' : 'false'
    );
  }

  if (data.activeOrg) {
    setSessionItem(SESSION_KEYS.ORG_ID, data.activeOrg.id || null);
    setSessionItem(SESSION_KEYS.ORG_NAME, data.activeOrg.name || null);
    setSessionItem(SESSION_KEYS.ORG_SLUG, data.activeOrg.slug || null);
  }

  if (data.activeWorkspace) {
    setSessionItem(SESSION_KEYS.WORKSPACE_ID, data.activeWorkspace.id || null);
    setSessionItem(SESSION_KEYS.WORKSPACE_NAME, data.activeWorkspace.name || null);
    setSessionItem(SESSION_KEYS.WORKSPACE_SLUG, data.activeWorkspace.slug || null);
  }

  if (data.organizations && data.organizations.length > 0) {
    try {
      setSessionItem(SESSION_KEYS.ORGANIZATIONS, JSON.stringify(data.organizations));
    } catch {}
  }

  if (data.workspaces && data.workspaces.length > 0) {
    try {
      setSessionItem(SESSION_KEYS.WORKSPACES, JSON.stringify(data.workspaces));
    } catch {}
  }
};

export const loadSessionContext = () => {
  const orgId = getSessionItem(SESSION_KEYS.ORG_ID);
  const orgName = getSessionItem(SESSION_KEYS.ORG_NAME);
  const orgSlug = getSessionItem(SESSION_KEYS.ORG_SLUG);

  const workspaceId = getSessionItem(SESSION_KEYS.WORKSPACE_ID);
  const workspaceName = getSessionItem(SESSION_KEYS.WORKSPACE_NAME);
  const workspaceSlug = getSessionItem(SESSION_KEYS.WORKSPACE_SLUG);

  const userId = getSessionItem(SESSION_KEYS.USER_ID);
  const userEmail = getSessionItem(SESSION_KEYS.USER_EMAIL);
  const onboardingCompleted = getSessionItem(SESSION_KEYS.ONBOARDING_COMPLETED) === 'true';

  let organizations: Organization[] = [];
  try {
    const rawOrgs = getSessionItem(SESSION_KEYS.ORGANIZATIONS);
    if (rawOrgs) organizations = JSON.parse(rawOrgs);
  } catch {}

  let workspaces: Workspace[] = [];
  try {
    const rawWorkspaces = getSessionItem(SESSION_KEYS.WORKSPACES);
    if (rawWorkspaces) workspaces = JSON.parse(rawWorkspaces);
  } catch {}

  return {
    orgId,
    orgName,
    orgSlug,
    workspaceId,
    workspaceName,
    workspaceSlug,
    userId,
    userEmail,
    onboardingCompleted,
    organizations,
    workspaces,
  };
};
