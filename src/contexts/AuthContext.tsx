import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, Workspace } from '../types';
import {
  fetchMe,
  fetchMyOrganizations,
  fetchMyWorkspaces,
  requestLoginOTP,
  verifyLoginOTP,
  logoutUser,
} from '../api/auth';
import { apiClient, setAccessToken, setRefreshToken, setActiveOrgId, setActiveWorkspaceId } from '../api/client';
import {
  saveSessionContext,
  loadSessionContext,
  clearSessionStorage,
  setSessionItem,
  SESSION_KEYS,
} from '../utils/session';

interface CreateWorkspacePayload {
  name: string;
  description?: string;
  monthlyMinuteLimit?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  organization: Organization | null;
  activeOrg: Organization | null; // Alias for backward compatibility
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loginWithOTP: (email: string) => Promise<string>;
  verifyLogin: (requestId: string, otp: string, loginChallenge?: string) => Promise<User | { redirectTo: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace>;
  devLogin?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Tenant Architecture: 1 User = 1 Organization, Multiple Workspaces
// - 1 User belongs to exactly 1 Organization.
// - Inside that 1 Organization, the user can create and switch between multiple Workspaces.
// - Active org_id and active workspace_id are persisted in sessionStorage.
// - Zero JWTs in LocalStorage/SessionStorage; auth tokens remain strictly in HttpOnly cookies.
// =============================================================================

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const applyTenantContext = (
    u: User | null,
    org: Organization | null,
    wsList: Workspace[],
    preferredWsId?: string | null
  ) => {
    setUser(u);
    setOrganization(org);
    setWorkspaces(wsList);

    if (!u) {
      setOrganization(null);
      setActiveWorkspace(null);
      setActiveOrgId(null);
      setActiveWorkspaceId(null);
      clearSessionStorage();
      return;
    }

    // 1. Sync Organization ID (1 user = 1 org)
    if (org?.id) {
      setActiveOrgId(org.id);
      setSessionItem(SESSION_KEYS.ORG_ID, org.id);
      setSessionItem(SESSION_KEYS.ORG_NAME, org.name);
      if (org.slug) setSessionItem(SESSION_KEYS.ORG_SLUG, org.slug);
    } else {
      setActiveOrgId(null);
    }

    // 2. Determine Active Workspace within the organization
    const cachedSession = loadSessionContext();
    const targetWsId = preferredWsId || cachedSession.workspaceId || u.workspace?.id;
    const selectedWs =
      wsList.find((w) => w.id === targetWsId) ||
      (u.workspace?.id ? u.workspace : null) ||
      wsList[0] ||
      null;

    setActiveWorkspace(selectedWs);
    if (selectedWs?.id) {
      setActiveWorkspaceId(selectedWs.id);
      setSessionItem(SESSION_KEYS.WORKSPACE_ID, selectedWs.id);
      setSessionItem(SESSION_KEYS.WORKSPACE_NAME, selectedWs.name);
      if (selectedWs.slug) setSessionItem(SESSION_KEYS.WORKSPACE_SLUG, selectedWs.slug);
    } else {
      setActiveWorkspaceId(null);
    }

    // 3. Save safe context into sessionStorage
    saveSessionContext({
      user: u,
      activeOrg: org,
      activeWorkspace: selectedWs,
      organizations: org ? [org] : [],
      workspaces: wsList,
    });
  };

  const refreshUser = async () => {
    try {
      // 1. Fetch user identity, profile & default org/workspace from ABS
      const u = await fetchMe();

      // 2. Fetch user's organization (1 user = 1 org)
      let org: Organization | null = u.organization || null;
      if (!org) {
        try {
          const orgs = await fetchMyOrganizations();
          if (orgs.length > 0) {
            org = orgs[0];
          }
        } catch (e) {
          // fallback to user.organization
        }
      }

      // 3. Fetch workspaces under this organization
      let wsList: Workspace[] = [];
      try {
        wsList = await fetchMyWorkspaces(org?.id);
      } catch (e) {
        if (u.workspace) wsList = [u.workspace];
      }

      if (u.workspace && !wsList.some((w) => w.id === u.workspace?.id)) {
        wsList = [u.workspace, ...wsList];
      }

      applyTenantContext(u, org, wsList);
    } catch (err) {
      applyTenantContext(null, null, []);
    }
  };

  // Switch active workspace within the user's organization
  const switchWorkspace = (workspaceId: string) => {
    const selectedWs = workspaces.find((w) => w.id === workspaceId) || null;
    if (selectedWs) {
      setActiveWorkspace(selectedWs);
      setActiveWorkspaceId(selectedWs.id);
      setSessionItem(SESSION_KEYS.WORKSPACE_ID, selectedWs.id);
      setSessionItem(SESSION_KEYS.WORKSPACE_NAME, selectedWs.name);

      saveSessionContext({
        user,
        activeOrg: organization,
        activeWorkspace: selectedWs,
        organizations: organization ? [organization] : [],
        workspaces,
      });
    }
  };

  // Create a new workspace under the user's single organization
  const createWorkspace = async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    if (!organization?.id) {
      throw new Error('Organization not found for current user session');
    }

    const res = await apiClient.post('/api/v1/workspaces', {
      name: payload.name,
      description: payload.description,
      monthly_minute_limit: payload.monthlyMinuteLimit || 10000,
    });

    const newWs: Workspace = res.data?.data;
    const updatedWorkspaces = [...workspaces, newWs];
    setWorkspaces(updatedWorkspaces);
    switchWorkspace(newWs.id);
    return newWs;
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await refreshUser();
      } catch (e) {
        applyTenantContext(null, null, []);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const loginWithOTP = async (email: string): Promise<string> => {
    const res = await requestLoginOTP(email);
    return res.requestId;
  };

  const verifyLogin = async (
    requestId: string,
    otp: string,
    loginChallenge?: string
  ): Promise<User | { redirectTo: string }> => {
    const res = await verifyLoginOTP(requestId, otp, loginChallenge);
    if (res.redirectTo) {
      return { redirectTo: res.redirectTo };
    }
    // Fetch user and populate org & workspaces into sessionStorage
    await refreshUser();
    const u = await fetchMe();
    return u;
  };



  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    } finally {
      applyTenantContext(null, null, []);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  const devLogin = () => {
    if (!(import.meta as any).env?.DEV || (import.meta as any).env?.VITE_ENABLE_DEMO_ACCESS !== 'true') return;
    const mockOrg: Organization = {
      id: 'org-111',
      name: 'Samvada Enterprise Labs',
      slug: 'samvada-labs',
      ownerId: '11111111-1111-1111-1111-111111111111',
    };
    const mockWs: Workspace = {
      id: 'ws-111',
      name: 'Production Voice AI Hub',
      orgId: 'org-111',
      slug: 'production-hub',
    };
    const mockUser: User = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'testuser@samvada.ai',
      displayName: 'Alex Rivers',
      role: 'ADMIN',
      organization: mockOrg,
      workspace: mockWs,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    document.cookie = 'access_token=dev_token_bypass_1234567890; path=/';
    document.cookie = 'refresh_token=dev_token_bypass_1234567890; path=/';
    applyTenantContext(mockUser, mockOrg, [mockWs]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        organization,
        activeOrg: organization, // Alias for backward compatibility
        workspaces,
        activeWorkspace,
        loginWithOTP,
        verifyLogin,
        logout,
        refreshUser,
        switchWorkspace,
        createWorkspace,
        devLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
