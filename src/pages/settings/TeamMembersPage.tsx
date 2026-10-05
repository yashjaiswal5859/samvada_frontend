import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Plus,
  Search,
  MoreHorizontal,
  Crown,
  Shield,
  Briefcase,
  Eye,
  Mail,
  Trash2,
  Check,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { getTeamMembers, inviteTeamMember } from '../../api/settings';
import { TeamMember } from '../../types';

export const TeamMembersPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'developer' | 'viewer'>('developer');
  const [isInviting, setIsInviting] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const fetched = await getTeamMembers();
      
      const currentEmail = user?.email || 'admin@workspace.local';
      const hasCurrent = fetched.some((m) => m.email.toLowerCase() === currentEmail.toLowerCase());
      
      let allMembers = [...fetched];
      if (!hasCurrent) {
        allMembers.unshift({
          id: user?.id || 'owner_current',
          name: user?.displayName || (user?.email ? user.email.split('@')[0] : 'Workspace Owner'),
          email: currentEmail,
          role: 'owner',
          status: 'active',
          joinedAt: new Date().toISOString().slice(0, 10),
        });
      }
      setMembers(allMembers);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (members.some((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      toast.warning('A member or invitation with this email address already exists.');
      return;
    }

    setIsInviting(true);
    try {
      const newMember = await inviteTeamMember(inviteEmail.trim(), inviteRole);
      setMembers((prev) => [...prev, newMember]);
      setInviteEmail('');
      toast.success(`Invitation sent to ${newMember.email} as ${newMember.role}`);
    } catch (err) {
      toast.error('Failed to invite team member');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast.success(`Removed ${name} from workspace`);
  };

  const filteredMembers = members
    .filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
      return matchSearch && matchRole;
    })
    .sort((a, b) => {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    });

  const totalCount = members.length;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'invited').length;

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'developer':
        return <Briefcase className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Eye className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'developer':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Team & Access</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage who has access to your workspace, assign roles, and invite collaborators.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Total Members</span>
            <div className="text-2xl font-bold text-white mt-1 tabular-nums">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Active Members</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 font-medium">Pending Invitations</span>
            <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2-Column Split: Invite Form + Members List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Invite Member Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Send an email invitation with workspace permissions.
            </p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourcompany.com"
                  required
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Workspace Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="admin">Admin (Full management access)</option>
                <option value="developer">Developer (Configure agents & webhooks)</option>
                <option value="viewer">Viewer (Read-only analytics & transcripts)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isInviting || !inviteEmail.trim()}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isInviting ? 'Sending Invite...' : 'Send Invitation'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Members Table (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or role..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="viewer">Viewer</option>
              </select>

              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className="p-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white"
                title="Sort alphabetical"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading team members...
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              No team members match your filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400">
                    <th className="pb-3 pl-2">Member</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Joined</th>
                    <th className="pb-3 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredMembers.map((member) => {
                    const isYou = member.email.toLowerCase() === (user?.email || '').toLowerCase();
                    const initials = member.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={member.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-300 text-[10px] shrink-0">
                              {initials}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white">{member.name}</span>
                                {isYou && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-zinc-500 font-mono">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize ${getRoleBadgeStyle(
                              member.role
                            )}`}
                          >
                            {getRoleIcon(member.role)}
                            {member.role}
                          </span>
                        </td>

                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium capitalize ${
                              member.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                              }`}
                            />
                            {member.status}
                          </span>
                        </td>

                        <td className="py-3 text-zinc-400 font-mono text-[11px]">{member.joinedAt}</td>

                        <td className="py-3 pr-2 text-right">
                          {!isYou && member.role !== 'owner' ? (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-600 italic">Primary</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
