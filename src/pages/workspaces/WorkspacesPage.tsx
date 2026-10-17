import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Users,
  Phone,
  Radio,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { useWorkspace, Workspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../contexts/ToastContext';

export const WorkspacesPage: React.FC = () => {
  const { allWorkspaces, currentWorkspace, switchWorkspace, createWorkspace, isOrgAdmin, organizationName } = useWorkspace();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filtered = allWorkspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.adminName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setIsCreating(true);
    try {
      await createWorkspace({
        name: newWsName.trim(),
        slug: newWsName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        icon: '💼',
        description: newWsDesc.trim(),
        adminName: '',
        adminEmail: '',
        monthlyMinuteLimit: 0,
        assignedPhoneNumbers: null,
        escalationMembersCount: null,
      });
      toast.success(`Workspace "${newWsName}" created.`);
      setIsCreateModalOpen(false);
      setNewWsName('');
      setNewWsDesc('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not create the workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <span>{organizationName}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">System Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">Workspaces</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Operational Workspaces</span>
            <span className="text-xs font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              {allWorkspaces.length} Total
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage isolated operational environments for each business division. Each workspace has its own agents, knowledge base, phone lines, calls, and escalation staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isOrgAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c101b]/90 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Total Workspaces</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{allWorkspaces.length}</p>
          <p className="text-[11px] text-zinc-400 mt-1">Active workspace records</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/90 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Active AI Voice Agents</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {allWorkspaces.every((w) => w.activeAgentsCount === null) ? '—' : allWorkspaces.reduce((acc, w) => acc + (w.activeAgentsCount || 0), 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Reported for loaded workspaces</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/90 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Live In-Flight Calls</span>
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {allWorkspaces.every((w) => w.liveCallsCount === null) ? '—' : allWorkspaces.reduce((acc, w) => acc + (w.liveCallsCount || 0), 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Live call count when available</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/90 border border-zinc-800/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Human Escalation Reps</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {allWorkspaces.every((w) => w.escalationMembersCount === null) ? '—' : allWorkspaces.reduce((acc, w) => acc + (w.escalationMembersCount || 0), 0)}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">Reported escalation team members</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by workspace name, ID (e.g. ws-consumer), or manager..."
            className="w-full bg-[#0c101b] border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((ws) => {
          const isSelected = currentWorkspace.id === ws.id;
          const usagePercent = ws.monthlyMinutesUsed !== null && ws.monthlyMinuteLimit ? Math.min(100, Math.round((ws.monthlyMinutesUsed / ws.monthlyMinuteLimit) * 100)) : null;

          return (
            <div
              key={ws.id}
              className={`p-5 rounded-2xl border transition-all relative ${
                isSelected
                  ? 'bg-gradient-to-b from-[#0f172a] to-[#0b101e] border-blue-500/50 shadow-xl shadow-blue-500/10'
                  : 'bg-[#0c101b]/90 border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Top Row: Icon, Name & Current Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {ws.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white tracking-tight">{ws.name}</h2>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-blue-400" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                        {ws.id}
                      </span>
                      {ws.adminName !== '—' && <span className="text-xs text-zinc-400">• Manager: {ws.adminName}</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    switchWorkspace(ws.id);
                    toast.success(`Switched active workspace to "${ws.name}"`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {isSelected ? 'Viewing' : 'Switch Into'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-zinc-300 mt-3 leading-relaxed">{ws.description}</p>

              {/* Isolation Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-zinc-800/60 text-center">
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <p className="text-xs font-bold text-white">{ws.activeAgentsCount ?? '—'}</p>
                  <p className="text-[10px] text-zinc-400">AI Agents</p>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                    {ws.liveCallsCount === null ? '—' : ws.liveCallsCount}
                  </p>
                  <p className="text-[10px] text-zinc-400">Live Calls</p>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <p className="text-xs font-bold text-white">{ws.assignedPhoneNumbers?.length ?? '—'}</p>
                  <p className="text-[10px] text-zinc-400">Phone DIDs</p>
                </div>
                <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-850">
                  <p className="text-xs font-bold text-purple-400">{ws.escalationMembersCount ?? '—'}</p>
                  <p className="text-[10px] text-zinc-400">Escalation Reps</p>
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="mt-4 pt-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Monthly Minutes Quota</span>
                  <span className="font-mono text-zinc-300">
                    {usagePercent === null ? 'Usage unavailable' : `${ws.monthlyMinutesUsed?.toLocaleString()} / ${ws.monthlyMinuteLimit?.toLocaleString()} mins (${usagePercent}%)`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent !== null && usagePercent > 85 ? 'bg-rose-500' : (usagePercent ?? 0) > 60 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${usagePercent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c101b] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Create New Workspace</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Concierge & High Value Accounts"
                  value={newWsName}
                  onChange={(e) => setNewWsName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Operational Purpose / Description</label>
                <textarea
                  rows={2}
                  placeholder="Describe the operations handled in this workspace..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  {isCreating ? 'Creating…' : 'Create workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
