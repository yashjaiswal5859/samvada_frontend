import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { apiClient, setActiveWorkspaceId } from '../api/client';
import { APIEnvelope } from '../types';
import { getSessionItem, setSessionItem, SESSION_KEYS } from '../utils/session';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  adminName: string;
  adminEmail: string;
  activeAgentsCount: number | null;
  liveCallsCount: number | null;
  monthlyMinutesUsed: number | null;
  monthlyMinuteLimit: number | null;
  assignedPhoneNumbers: string[] | null;
  escalationMembersCount: number | null;
}

export type UserRole = 'org_admin' | 'workspace_admin' | 'platform_admin';

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  allWorkspaces: Workspace[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUserRole: UserRole;
  isOrgAdmin: boolean;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (ws: Omit<Workspace, 'id' | 'activeAgentsCount' | 'liveCallsCount' | 'monthlyMinutesUsed'>) => Promise<Workspace>;
  organizationName: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading, activeOrg, activeWorkspace: authActiveWs, workspaces: authWorkspaces, switchWorkspace: authSwitchWorkspace, createWorkspace: authCreateWorkspace } = useAuth();

  const [workspacesList, setWorkspacesList] = useState<Workspace[]>(() => {
    return [];
  });

  // Current selected workspace ID from sessionStorage
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    return getSessionItem(SESSION_KEYS.WORKSPACE_ID) || '';
  });

  // Sync real workspaces from AuthContext when available
  useEffect(() => {
    if (!authLoading) {
      const mapped: Workspace[] = (authWorkspaces || []).map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug || 'default',
        icon: w.icon || '💼',
        description: w.description || 'Voice AI Workspace',
        adminName: '—',
        adminEmail: '',
        activeAgentsCount: null,
        liveCallsCount: null,
        monthlyMinutesUsed: null,
        monthlyMinuteLimit: null,
        assignedPhoneNumbers: null,
        escalationMembersCount: null,
      }));
      setWorkspacesList(mapped);

      const targetId = authActiveWs?.id || getSessionItem(SESSION_KEYS.WORKSPACE_ID) || mapped[0]?.id || '';
      if (targetId && mapped.some((m) => m.id === targetId)) {
        setCurrentWorkspaceId(targetId);
        setActiveWorkspaceId(targetId);
      } else if (mapped[0]) {
        setCurrentWorkspaceId(mapped[0].id);
        setActiveWorkspaceId(mapped[0].id);
      } else {
        setCurrentWorkspaceId('');
        setActiveWorkspaceId(null);
        setSessionItem(SESSION_KEYS.WORKSPACE_ID, null);
      }
    }
  }, [authWorkspaces, authActiveWs, user, authLoading]);

  // Synchronize active workspace ID with Axios client header and sessionStorage
  useEffect(() => {
    if (currentWorkspaceId) {
      setActiveWorkspaceId(currentWorkspaceId);
      setSessionItem(SESSION_KEYS.WORKSPACE_ID, currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  const roleValue = String(authActiveWs?.role || user?.role || 'workspace_admin').toLowerCase();
  const currentUserRole: UserRole = roleValue.includes('platform') || roleValue.includes('owner') || roleValue === 'admin'
    ? 'platform_admin'
    : roleValue.includes('org')
    ? 'org_admin'
    : 'workspace_admin';

  // Search query for workspace search bar in sidebar
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isOrgAdmin = currentUserRole === 'org_admin' || currentUserRole === 'platform_admin';

  // Persist active workspace to sessionStorage and notify AuthContext
  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setSessionItem(SESSION_KEYS.WORKSPACE_ID, workspaceId);
    if (authSwitchWorkspace) {
      authSwitchWorkspace(workspaceId);
    }
  };

  const createWorkspace = async (newWs: Omit<Workspace, 'id' | 'activeAgentsCount' | 'liveCallsCount' | 'monthlyMinutesUsed'>) => {
    const saved = await authCreateWorkspace({ name: newWs.name, description: newWs.description, monthlyMinuteLimit: newWs.monthlyMinuteLimit ?? undefined });
    const ws: Workspace = {
      ...newWs,
      id: saved.id,
      name: saved.name,
      slug: saved.slug || newWs.slug,
      activeAgentsCount: null,
      liveCallsCount: null,
      monthlyMinutesUsed: null,
      monthlyMinuteLimit: null,
      escalationMembersCount: null,
    };
    setWorkspacesList((previous) => [...previous.filter((item) => item.id !== ws.id), ws]);
    setCurrentWorkspaceId(ws.id);
    setSessionItem(SESSION_KEYS.WORKSPACE_ID, ws.id);
    return ws;
  };

  // Find active workspace object
  const currentWorkspace = workspacesList.find((w) => w.id === currentWorkspaceId) || workspacesList[0] || {
    id: currentWorkspaceId,
    name: authLoading ? 'Loading workspace…' : 'No workspace selected',
    slug: 'default',
    icon: '💼',
    description: 'Voice AI Workspace',
    adminName: '—',
    adminEmail: '',
    activeAgentsCount: null,
    liveCallsCount: null,
    monthlyMinutesUsed: null,
    monthlyMinuteLimit: null,
    assignedPhoneNumbers: null,
    escalationMembersCount: null,
  };

  const visibleWorkspaces = isOrgAdmin
    ? workspacesList.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workspacesList.filter((w) => w.id === currentWorkspaceId);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces: visibleWorkspaces,
        allWorkspaces: workspacesList,
        searchQuery,
        setSearchQuery,
        currentUserRole,
        isOrgAdmin,
        switchWorkspace,
        createWorkspace,
        organizationName: activeOrg?.name || user?.organization?.name || getSessionItem(SESSION_KEYS.ORG_NAME) || 'Samvada'
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
