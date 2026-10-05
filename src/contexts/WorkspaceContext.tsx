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
  activeAgentsCount: number;
  liveCallsCount: number;
  monthlyMinutesUsed: number;
  monthlyMinuteLimit: number;
  assignedPhoneNumbers: string[];
  escalationMembersCount: number;
}

export type UserRole = 'org_admin' | 'workspace_admin' | 'swiggy_admin';

interface WorkspaceContextType {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  allWorkspaces: Workspace[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUserRole: UserRole;
  switchUserRole: (role: UserRole) => void;
  isOrgAdmin: boolean;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (ws: Omit<Workspace, 'id' | 'activeAgentsCount' | 'liveCallsCount' | 'monthlyMinutesUsed'>) => void;
  organizationName: string;
}

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-consumer-care',
    name: 'Customer Support & Care',
    slug: 'consumer-care',
    icon: '🎧',
    description: 'Inbound customer inquiries, escalations, refund processing and satisfaction follow-ups.',
    adminName: 'Admin',
    adminEmail: 'admin@platform.ai',
    activeAgentsCount: 0,
    liveCallsCount: 0,
    monthlyMinutesUsed: 0,
    monthlyMinuteLimit: 100000,
    assignedPhoneNumbers: [],
    escalationMembersCount: 1
  },
  {
    id: 'ws-product-promo',
    name: 'Sales & Outbound Outreach',
    slug: 'product-promo',
    icon: '📢',
    description: 'Outbound campaigns for lead qualification, renewal reminders, and VIP demo scheduling.',
    adminName: 'Admin',
    adminEmail: 'admin@platform.ai',
    activeAgentsCount: 0,
    liveCallsCount: 0,
    monthlyMinutesUsed: 0,
    monthlyMinuteLimit: 50000,
    assignedPhoneNumbers: [],
    escalationMembersCount: 1
  }
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, activeOrg, activeWorkspace: authActiveWs, workspaces: authWorkspaces, switchWorkspace: authSwitchWorkspace } = useAuth();

  const [workspacesList, setWorkspacesList] = useState<Workspace[]>(() => {
    return DEFAULT_WORKSPACES;
  });

  // Current selected workspace ID from sessionStorage
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    return getSessionItem(SESSION_KEYS.WORKSPACE_ID) || 'ws-consumer-care';
  });

  // Sync real workspaces from AuthContext when available
  useEffect(() => {
    if (authWorkspaces && authWorkspaces.length > 0) {
      const mapped: Workspace[] = authWorkspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug || 'default',
        icon: w.icon || '💼',
        description: w.description || 'Voice AI Workspace',
        adminName: user?.displayName || 'Workspace Admin',
        adminEmail: user?.email || '',
        activeAgentsCount: 0,
        liveCallsCount: 0,
        monthlyMinutesUsed: 0,
        monthlyMinuteLimit: 10000,
        assignedPhoneNumbers: [],
        escalationMembersCount: 1,
      }));
      setWorkspacesList(mapped);

      const targetId = authActiveWs?.id || getSessionItem(SESSION_KEYS.WORKSPACE_ID) || mapped[0]?.id;
      if (targetId && mapped.some((m) => m.id === targetId)) {
        setCurrentWorkspaceId(targetId);
        setActiveWorkspaceId(targetId);
      } else if (mapped[0]) {
        setCurrentWorkspaceId(mapped[0].id);
        setActiveWorkspaceId(mapped[0].id);
      }
    }
  }, [authWorkspaces, authActiveWs, user]);

  // Synchronize active workspace ID with Axios client header and sessionStorage
  useEffect(() => {
    if (currentWorkspaceId) {
      setActiveWorkspaceId(currentWorkspaceId);
      setSessionItem(SESSION_KEYS.WORKSPACE_ID, currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  // Role: Org Admin vs Workspace Admin
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    const saved = getSessionItem('samvada_user_role') as UserRole;
    if (saved === 'swiggy_admin') return 'org_admin';
    return saved || 'org_admin';
  });

  // Search query for workspace search bar in sidebar
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isOrgAdmin = currentUserRole === 'org_admin' || currentUserRole === 'swiggy_admin';

  // Persist active workspace to sessionStorage and notify AuthContext
  const switchWorkspace = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setSessionItem(SESSION_KEYS.WORKSPACE_ID, workspaceId);
    if (authSwitchWorkspace) {
      authSwitchWorkspace(workspaceId);
    }
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentUserRole(role);
    setSessionItem('samvada_user_role', role);
  };

  const createWorkspace = (newWs: Omit<Workspace, 'id' | 'activeAgentsCount' | 'liveCallsCount' | 'monthlyMinutesUsed'>) => {
    const ws: Workspace = {
      ...newWs,
      id: `ws-${newWs.slug || Date.now()}`,
      activeAgentsCount: 0,
      liveCallsCount: 0,
      monthlyMinutesUsed: 0,
    };
    const updated = [...workspacesList, ws];
    setWorkspacesList(updated);
    setCurrentWorkspaceId(ws.id);
    setSessionItem(SESSION_KEYS.WORKSPACE_ID, ws.id);
  };

  // Find active workspace object
  const currentWorkspace = workspacesList.find((w) => w.id === currentWorkspaceId) || workspacesList[0] || {
    id: currentWorkspaceId,
    name: 'Default Workspace',
    slug: 'default',
    icon: '💼',
    description: 'Voice AI Workspace',
    adminName: user?.displayName || 'Workspace Admin',
    adminEmail: user?.email || '',
    activeAgentsCount: 0,
    liveCallsCount: 0,
    monthlyMinutesUsed: 0,
    monthlyMinuteLimit: 10000,
    assignedPhoneNumbers: [],
    escalationMembersCount: 1,
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
        switchUserRole,
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
