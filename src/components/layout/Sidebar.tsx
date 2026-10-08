import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Home,
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
  PhoneCall,
  Volume2,
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface SidebarProps {
  theme?: 'light' | 'dark';
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ theme = 'dark', mobileOpen = false, onMobileClose }) => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const isLight = theme === 'light';

  const {
    currentWorkspace,
    workspaces,
    allWorkspaces,
    searchQuery,
    setSearchQuery,
    currentUserRole,
    isOrgAdmin,
    switchWorkspace,
    organizationName
  } = useWorkspace();

  // Sidebar collapse toggle
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarCollapsed = isCollapsed && !mobileOpen;

  // Workspace selector dropdown state
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const displayName = user?.displayName || (isOrgAdmin ? 'Organization Admin' : 'Workspace Admin');
  const userInitials = (displayName || 'EA').replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'EA';

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 select-none group ${
      isActive
        ? isLight
          ? 'border-l-3 border-emerald-600 bg-emerald-50/75 text-emerald-950 font-semibold shadow-2xs'
          : 'bg-emerald-950/40 text-emerald-300 font-semibold shadow-sm border-l-2 border-emerald-500'
        : isLight
          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[60] flex flex-col justify-between h-[100dvh] w-[min(17rem,calc(100vw-3rem))] shrink-0 select-none transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'} ${
        isLight
          ? 'bg-white border-r border-slate-200 text-slate-800'
          : 'bg-[#060a16]/95 backdrop-blur-xl border-r border-blue-900/30 text-zinc-100'
      } ${
        sidebarCollapsed ? 'lg:w-18' : 'lg:w-68'
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Samvada Brand Header + Collapse Toggle */}
        <div className={`h-16 px-4 flex items-center justify-between border-b shrink-0 ${isLight ? 'border-slate-200 bg-white' : 'border-zinc-800/60'}`}>
          {!sidebarCollapsed && (
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center gap-1 shrink-0 transition-all ${
                isLight
                  ? 'bg-emerald-950 shadow-xs'
                  : 'bg-emerald-950/60 border border-emerald-500/30 shadow-md shadow-emerald-500/10 group-hover:border-emerald-500/50'
              }`}>
                <div className="w-1 h-3 rounded-full bg-emerald-400" />
                <div className="w-1 h-5 rounded-full bg-emerald-300 animate-pulse" />
                <div className="w-1 h-3 rounded-full bg-emerald-400" />
                <div className="w-1 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="leading-tight overflow-hidden">
                <span className={`font-bold text-base tracking-tight block ${isLight ? 'text-slate-900' : 'text-white font-extrabold'}`}>Samvada AI</span>
                <span className={`text-[10px] font-medium block -mt-0.5 ${isLight ? 'text-emerald-700 font-semibold' : 'text-zinc-400'}`}>{organizationName} Voice Platform</span>
              </div>
            </NavLink>
          )}

          {sidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center gap-0.5 shadow-md ${
                isLight ? 'bg-emerald-950' : 'bg-emerald-950/60 border border-emerald-500/40 shadow-emerald-500/10'
              }`}>
                <div className="w-1 h-3 rounded-full bg-emerald-400" />
                <div className="w-1 h-5 rounded-full bg-emerald-300" />
                <div className="w-1 h-3 rounded-full bg-emerald-400" />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex w-7 h-7 rounded-lg items-center justify-center transition-colors shrink-0 ml-1 ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close navigation menu"
            className={`lg:hidden w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TOP SECTION: WORKSPACE SELECTOR & SEARCH BAR */}
        {/* ========================================================================= */}
        {!sidebarCollapsed && (
          <div className={`p-3 border-b space-y-2 ${isLight ? 'border-slate-200 bg-slate-50/60' : 'border-zinc-800/60 bg-[#06080e]/90'}`}>
            <div className={`flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider px-1 ${isLight ? 'text-slate-400' : 'text-zinc-400 font-bold'}`}>
              <span>ACTIVE WORKSPACE</span>
              
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
                    ? isLight
                      ? 'bg-slate-100 border-slate-300 shadow-sm'
                      : 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                    : isLight
                      ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      : 'bg-[#0c101b] border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="text-lg shrink-0">{currentWorkspace.icon}</span>
                  <div className="leading-tight overflow-hidden">
                    <p className={`text-xs truncate ${isLight ? 'text-slate-900 font-semibold' : 'text-white font-bold'}`}>{currentWorkspace.name}</p>
                    <p className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {currentWorkspace.activeAgentsCount} Agents • {currentWorkspace.liveCallsCount} Calls
                    </p>
                  </div>
                </div>

                {isOrgAdmin ? (
                  <ChevronsUpDown className={`w-3.5 h-3.5 shrink-0 ml-1 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                ) : (
                  <span title="Assigned Workspace">
                    <Lock className={`w-3 h-3 shrink-0 ml-1 ${isLight ? 'text-amber-600' : 'text-amber-400/80'}`} />
                  </span>
                )}
              </button>

              {/* Workspace Search & Select Dropdown */}
              {isWorkspaceMenuOpen && isOrgAdmin && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl p-2.5 shadow-2xl z-50 space-y-2 animate-scaleUp border ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0c101b] border-zinc-800 text-zinc-100'
                }`}>
                  {/* Search Bar on top side of workspace selector */}
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search workspace ID or name..."
                      autoFocus
                      className={`w-full rounded-xl pl-8 pr-2.5 py-1.5 text-xs focus:outline-none transition-colors border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400'
                          : 'bg-zinc-900 border-zinc-700/80 text-white placeholder:text-zinc-400 focus:border-blue-500'
                      }`}
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
                              ? isLight
                                ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200'
                                : 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                              : isLight
                                ? 'text-slate-700 hover:bg-slate-50'
                                : 'text-zinc-300 hover:bg-zinc-850/70 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-base shrink-0">{ws.icon}</span>
                            <div className="overflow-hidden">
                              <p className="font-semibold truncate leading-tight">{ws.name}</p>
                              <p className={`text-[10px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{ws.id}</p>
                            </div>
                          </div>
                          {isCurrent ? (
                            <Check className={`w-3.5 h-3.5 shrink-0 ml-1 ${isLight ? 'text-slate-900' : 'text-blue-400'}`} />
                          ) : (
                            <span className={`text-[10px] font-mono shrink-0 ml-1 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                              {(ws.liveCallsCount ?? 0) > 0 ? (
                                <span className={`font-bold flex items-center gap-1 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-600' : 'bg-emerald-400 animate-pulse'}`} />
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
                      <p className={`text-[11px] text-center py-2 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>No workspace matching "{searchQuery}"</p>
                    )}
                  </div>

                  {/* Manage All Workspaces button */}
                  <div className={`border-t pt-1.5 flex items-center justify-between text-[11px] ${isLight ? 'border-slate-100' : 'border-zinc-800'}`}>
                    <button
                      onClick={() => {
                        setIsWorkspaceMenuOpen(false);
                        navigate('/workspaces');
                      }}
                      className={`font-semibold flex items-center gap-1 cursor-pointer ${isLight ? 'text-slate-700 hover:text-slate-900' : 'text-blue-400 hover:text-blue-300'}`}
                    >
                      <Layers className="w-3 h-3" />
                      <span>Manage All Workspaces</span>
                    </button>
                    <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>{allWorkspaces.length} Total</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="px-2 py-2.5 space-y-2 lg:px-2.5 lg:py-3 lg:space-y-3 flex-1">
          <div className="space-y-1">
            <NavLink to="/home" className={linkClass} title="Home" end>
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Home className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Home</span>}
                </>
              )}
            </NavLink>
            {/* Main Executive View */}
            <NavLink to="/dashboard" className={linkClass} title="Dashboard">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <LayoutDashboard className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Dashboard</span>}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 1: BUILD */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className={`px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-400' : 'text-zinc-400 font-bold'}`}>
                BUILD
              </div>
            )}

            {/* AI Agent Chat Studio */}
            <NavLink
              to="/ai-studio"
              className={({ isActive }) =>
                `group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? isLight
                      ? 'border-l-3 border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-2xs'
                      : 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 font-bold shadow-sm'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-800/40'
                }`
              }
              title="Create with AI Chat"
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-emerald-600" />}
                  <Sparkles className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-emerald-600'}`} />
                  {!sidebarCollapsed && <span>Create with AI</span>}
                </>
              )}
            </NavLink>

            {/* My Agents */}
            <NavLink to="/agents" className={linkClass} title="My Voice Agents">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Bot className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>My Agents</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentWorkspace.activeAgentsCount}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Voices Library & Cloning */}
            <NavLink to="/voices" className={linkClass} title="Acoustic Voice Library & Cloning">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Volume2 className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Voices</span>}
                </>
              )}
            </NavLink>

            {/* Knowledge Base */}
            <NavLink to="/knowledge" className={linkClass} title="Knowledge Base">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Knowledge Base</span>}
                </>
              )}
            </NavLink>

            {/* Connected Tools & Integrations */}
            <NavLink to="/integrations" className={linkClass} title="Connected Tools & APIs">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Boxes className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Integrations</span>}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 2: DEPLOY */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className={`px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-400' : 'text-zinc-400 font-bold'}`}>
                DEPLOY
              </div>
            )}

            {/* Calling Campaigns */}
            <NavLink to="/campaigns" className={linkClass} title="Calling Campaigns">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Megaphone className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Calling Campaigns</span>}
                </>
              )}
            </NavLink>

            {/* Customer Contacts */}
            <NavLink to="/contacts" className={linkClass} title="Customer Contacts">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Users className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Contacts & Audiences</span>}
                </>
              )}
            </NavLink>

            {/* Phone Numbers */}
            <NavLink to="/telephony" className={linkClass} title="Phone Numbers">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Phone className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Phone Numbers</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {currentWorkspace.assignedPhoneNumbers?.length ?? 0}
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 3: MONITOR */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className={`px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-400' : 'text-zinc-400 font-bold'}`}>
                MONITOR
              </div>
            )}

            {/* Live Calls Monitor */}
            <NavLink to="/calls/live" className={linkClass} title="Live Calls Monitor">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Radio className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-emerald-600'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Live Monitor</span>
                      {(currentWorkspace.liveCallsCount ?? 0) > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 text-[10px] font-bold font-mono animate-pulse">
                          {currentWorkspace.liveCallsCount} Active
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>

            {/* Call History (Recordings & Transcripts) */}
            <NavLink to="/calls" className={linkClass} title="Call History">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <PhoneCall className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Call History</span>}
                </>
              )}
            </NavLink>

            {/* Voice AI Observability */}
            <NavLink to="/observability" className={linkClass} title="Voice AI Observability & Telemetry">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Activity className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Observability</span>}
                </>
              )}
            </NavLink>

            {/* Analytics & Reports */}
            <NavLink to="/analytics" className={linkClass} title="Reports & Analytics">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <BarChart3 className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Reports & Analytics</span>}
                </>
              )}
            </NavLink>
          </div>

          {/* ========================================================================= */}
          {/* GROUP 4: SYSTEM */}
          {/* ========================================================================= */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <div className={`px-3 pt-1 pb-1 text-[10px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-400' : 'text-zinc-400 font-bold'}`}>
                SYSTEM
              </div>
            )}

            {/* Workspaces Management */}
            <NavLink to="/workspaces" className={linkClass} title="Workspaces Management">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <Layers className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>Workspaces</span>
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded-full">
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
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />
                    )}
                    <Settings className={`w-4 h-4 shrink-0 ${isSettingsActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span>Settings</span>}
                  </>
                );
              }}
            </NavLink>

            {/* Help & Support */}
            <NavLink to="/help" className={linkClass} title="Help & Support">
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-md" />}
                  <HelpCircle className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-emerald-700' : 'text-emerald-400') : 'text-slate-400'}`} />
                  {!sidebarCollapsed && <span>Help & Support</span>}
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER: WORKSPACE ROLE & PROFILE */}
      {/* ========================================================================= */}
      <div className={`p-3 border-t space-y-2 shrink-0 ${isLight ? 'border-slate-200 bg-slate-50/60' : 'border-zinc-800/60 bg-[#06080e]'}`}>
        {!sidebarCollapsed && (
          <div className={`p-2 rounded-xl border flex items-center justify-between text-[10px] ${
            isLight ? 'bg-white border-slate-200 shadow-2xs text-slate-700' : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
          }`}>
            <div className="flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-slate-700' : 'text-blue-400'}`} />
              <span className={isLight ? 'text-slate-500' : 'text-zinc-400'}>Access:</span>
              <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white font-bold'}`}>
                {isOrgAdmin ? 'Org Admin' : 'Workspace Admin'}
              </span>
            </div>
          </div>
        )}

        {/* User Workspace Profile Card */}
        <div className="w-full flex items-center justify-between p-2 rounded-xl text-left">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isLight ? 'bg-emerald-950 text-white shadow-2xs' : 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 shadow-sm'
            }`}>
              {userInitials}
            </div>

            {!sidebarCollapsed && (
              <div className="leading-tight overflow-hidden">
                <div className={`text-xs truncate tracking-tight ${isLight ? 'text-slate-900 font-semibold' : 'text-white font-bold'}`}>
                  {displayName}
                </div>
                <div className={`text-[11px] truncate font-medium flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                  <span>{organizationName}</span>
                  <span>•</span>
                  <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-blue-400'}`}>{currentWorkspace.slug}</span>
                </div>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={() => {
                logout();
                toast.info('Signed out.');
              }}
              className={`p-1 rounded transition-colors ${
                isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-slate-100' : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
              }`}
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
