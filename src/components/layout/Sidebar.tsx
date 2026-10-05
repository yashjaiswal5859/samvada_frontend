import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  Sparkles,
  BookOpen,
  Boxes,
  Phone,
  Megaphone,
  Users,
  Radio,
  BarChart3,
  Bell,
  Users2,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Building2,
  LogOut,
  Search,
  Layers,
  Shield,
  Plus,
  Lock,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    currentWorkspace,
    workspaces,
    allWorkspaces,
    searchQuery,
    setSearchQuery,
    currentUserRole,
    switchUserRole,
    isOrgAdmin,
    switchWorkspace,
    organizationName
  } = useWorkspace();

  // Sidebar collapse toggle
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Workspace selector dropdown state
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const displayName = user?.displayName || (isOrgAdmin ? 'Organization Admin' : 'Workspace Admin');
  const userInitials = (displayName || 'EA').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'EA';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 select-none group ${
      isActive
        ? 'bg-[#121c33] text-blue-400 font-semibold shadow-sm'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
    }`;

  return (
    <aside
      className={`bg-[#060a16]/95 backdrop-blur-xl border-r border-blue-900/30 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none transition-all duration-200 z-30 ${
        isCollapsed ? 'w-18' : 'w-68'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Samvada Brand Header + Collapse Toggle */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-zinc-800/60 shrink-0">
          {!isCollapsed && (
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center gap-1 shadow-md shadow-blue-500/10 shrink-0 group-hover:border-blue-500/50 transition-all">
                <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1 h-5 bg-blue-400 rounded-full" />
                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                <div className="w-1 h-2 bg-blue-600 rounded-full" />
              </div>
              <div className="leading-tight overflow-hidden">
                <span className="font-extrabold text-white text-base tracking-tight block">Samvada AI</span>
                <span className="text-[10px] text-zinc-400 font-medium block -mt-0.5">{organizationName} Voice Platform</span>
              </div>
            </NavLink>
          )}

          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center gap-0.5 shadow-md shadow-blue-500/10">
                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                <div className="w-1 h-5 bg-blue-400 rounded-full" />
                <div className="w-1 h-3 bg-blue-500 rounded-full" />
              </div>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 flex items-center justify-center transition-colors shrink-0 ml-1"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TOP SECTION: WORKSPACE SELECTOR & SEARCH BAR */}
        {/* ========================================================================= */}
        {!isCollapsed && (
          <div className="p-3 border-b border-zinc-800/60 bg-[#06080e]/90 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
              <span>ACTIVE WORKSPACE</span>
              <span className="text-zinc-400 font-mono text-[9px]">{currentWorkspace.id}</span>
            </div>

            {/* Selected Workspace Pill Button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (isOrgAdmin) {
                    setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen);
                  } else {
                    toast.info(`You are locked to ${currentWorkspace.name} as Workspace Admin.`);
                  }
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isWorkspaceMenuOpen
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                    : 'bg-[#0c101b] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-lg shrink-0">{currentWorkspace.icon}</span>
                  <div className="leading-tight overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{currentWorkspace.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">
                      {currentWorkspace.activeAgentsCount} Agents • {currentWorkspace.liveCallsCount} Calls
                    </p>
                  </div>
                </div>

                {isOrgAdmin ? (
                  <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                ) : (
                  <span title="Assigned Workspace">
                    <Lock className="w-3 h-3 text-amber-400/80 shrink-0 ml-1" />
                  </span>
                )}
              </button>

              {/* Workspace Search & Select Dropdown */}
              {isWorkspaceMenuOpen && isOrgAdmin && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c101b] border border-zinc-800 rounded-2xl p-2.5 shadow-2xl z-50 space-y-2 animate-scaleUp">
                  {/* Search Bar on top side of workspace selector */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search workspace ID or name..."
                      autoFocus
                      className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* List of Workspaces */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {workspaces.map((ws) => {
                      const isCurrent = ws.id === currentWorkspace.id;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => {
                            switchWorkspace(ws.id);
                            setIsWorkspaceMenuOpen(false);
                            toast.success(`Switched to workspace: "${ws.name}"`);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                              : 'text-zinc-300 hover:bg-zinc-850/70 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-base shrink-0">{ws.icon}</span>
                            <div className="overflow-hidden">
                              <p className="font-semibold truncate leading-tight">{ws.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono truncate">{ws.id}</p>
                            </div>
                          </div>
                          {isCurrent ? (
                            <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1" />
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-1">
                              {ws.liveCallsCount > 0 ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  {ws.liveCallsCount}
                                </span>
                              ) : (
                                `${ws.activeAgentsCount} ag.`
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {workspaces.length === 0 && (
                      <p className="text-[11px] text-zinc-400 text-center py-2">No workspace matching "{searchQuery}"</p>
                    )}
                  </div>

                  {/* Manage All Workspaces button */}
                  <div className="border-t border-zinc-800 pt-1.5 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        navigate('/workspaces');
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Manage All Workspaces</span>
                    </button>
                    <span className="text-[10px] text-zinc-400">{allWorkspaces.length} Total</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="px-2.5 py-3 space-y-4 flex-1">
          {/* Main Executive View */}
          <div>
            <NavLink to="/dashboard" className={linkClass} title="Dashboard">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span>Dashboard</span>}
                </>
              )}
            </NavLink>
          </div>          {/* ========================================================================= */}
          {/* GROUP 1: VOICE AGENTS */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                VOICE AGENTS
              </div>
            )}

            {/* AI Agent Chat Studio */}
            <NavLink
              to="/ai-studio"
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`
              }
              title="Create with AI Chat"
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                  {!isCollapsed && <span>Create with AI</span>}
                </>
              )}
            </NavLink>

            {/* My Agents */}
            <NavLink to="/agents" className={linkClass} title="My Voice Agents">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Bot className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>My Agents</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {currentWorkspace.activeAgentsCount}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Live Interactive Demo Sandbox */}
            <NavLink
              to="/demo"
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                    : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-950/30'
                }`
              }
              title="Interactive Voice Demo"
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-500 rounded-r-md" />}
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Live Voice Demo</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold font-mono">
                        LIVE
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Knowledge Base */}
            <NavLink to="/knowledge" className={linkClass} title="Knowledge Base">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <BookOpen className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Knowledge Base</span>}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 2: CALLS & OUTREACH */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                CALLS & OUTREACH
              </div>
            )}

            {/* Call History (Recordings & Transcripts) */}
            <NavLink to="/calls" className={linkClass} title="Call History">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <PhoneCall className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span>Call History</span>}
                </>
              )}
            </NavLink>

            {/* Live Calls Monitor */}
            <NavLink to="/calls/live" className={linkClass} title="Live Calls Monitor">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Radio className="w-4 h-4 shrink-0 text-emerald-400" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Live Monitor</span>
                      {currentWorkspace.liveCallsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono animate-pulse">
                          {currentWorkspace.liveCallsCount} Active
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Calling Campaigns */}
            <NavLink to="/campaigns" className={linkClass} title="Calling Campaigns">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Megaphone className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Calling Campaigns</span>}
                </>
              )}
            </NavLink>

            {/* Customer Contacts */}
            <NavLink to="/contacts" className={linkClass} title="Customer Contacts">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Users className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Customer Contacts</span>}
                </>
              )}
            </NavLink>

            {/* Phone Numbers */}
            <NavLink to="/telephony" className={linkClass} title="Phone Numbers">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Phone className="w-4 h-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Phone Numbers</span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {currentWorkspace.assignedPhoneNumbers.length}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 3: PLATFORM & SYSTEM */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                PLATFORM & SETTINGS
              </div>
            )}

            {/* Analytics & Reports */}
            <NavLink to="/analytics" className={linkClass} title="Reports & Analytics">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Reports & Analytics</span>}
                </>
              )}
            </NavLink>

            {/* Connected Tools & Integrations */}
            <NavLink to="/integrations" className={linkClass} title="Connected Tools & APIs">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Boxes className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Integrations</span>}
                </>
              )}
            </NavLink>

            {/* Workspaces Management */}
            <NavLink to="/workspaces" className={linkClass} title="Workspaces Management">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <Layers className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Workspaces</span>
                      <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-full">
                        {allWorkspaces.length}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Platform Settings */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                linkClass({
                  isActive:
                    isActive ||
                    window.location.pathname.startsWith('/settings') ||
                    window.location.pathname.startsWith('/notifications')
                })
              }
              title="Platform Settings"
            >
              {({ isActive }) => {
                const isSettingsActive =
                  isActive ||
                  window.location.pathname.startsWith('/settings') ||
                  window.location.pathname.startsWith('/notifications');
                return (
                  <>
                    {isSettingsActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />
                    )}
                    <Settings className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>Settings</span>}
                  </>
                );
              }}
            </NavLink>

            {/* Help & Support */}
            <NavLink to="/help" className={linkClass} title="Help & Support">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-md" />}
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Help & Support</span>}
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER: ROLE PERSONA SWITCHER & PROFILE */}
      {/* ========================================================================= */}
      <div className="p-3 border-t border-zinc-800/60 bg-[#06080e] space-y-2 shrink-0">
        {!isCollapsed && (
          <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-zinc-400">View as:</span>
              <span className="font-bold text-white">
                {isOrgAdmin ? 'Org Admin' : 'Workspace Admin'}
              </span>
            </div>
            <button
              onClick={() => {
                const nextRole = isOrgAdmin ? 'workspace_admin' : 'org_admin';
                switchUserRole(nextRole);
                toast.info(
                  nextRole === 'org_admin'
                    ? `Switched to: ${organizationName || 'Organization'} Admin (Full Org View)`
                    : 'Switched to: Workspace Admin (Isolated Workspace)'
                );
              }}
              className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              Toggle
            </button>
          </div>
        )}

        {/* User Workspace Profile Card */}
        <div className="w-full flex items-center justify-between p-2 rounded-xl text-left">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0 shadow-sm">
              {userInitials}
            </div>

            {!isCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className="text-xs font-bold text-white truncate tracking-tight">
                  {displayName}
                </div>
                <div className="text-[11px] text-zinc-400 truncate font-medium flex items-center gap-1">
                  <span>{organizationName}</span>
                  <span>•</span>
                  <span className="text-blue-400 font-mono">{currentWorkspace.slug}</span>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                logout();
                toast.info('Signed out.');
              }}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
