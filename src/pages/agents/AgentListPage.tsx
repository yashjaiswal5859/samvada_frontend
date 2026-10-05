import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Phone,
  BarChart3,
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Rocket,
  Edit2,
  Mic,
  ArrowRight,
  Globe,
  Cpu,
  BookOpen,
  Boxes,
  Calendar,
  Sparkles,
  Bot,
  Loader2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getAgents } from '../../api/agents';
import { getAnalyticsSummary } from '../../api/analytics';
import { Agent, AnalyticsSummary } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';

interface AgentItem {
  id: string;
  workspaceId: string;
  name: string;
  isPrimary?: boolean;
  avatar: string;
  description: string;
  systemPrompt?: string;
  phoneNumber?: string;
  knowledgeBaseIds?: string[];
  tags: string[];
  language: string;
  voice: string;
  calls: string;
  conversion: string;
  avgDuration: string;
  isActive: boolean;
  model: string;
  kb: string;
  integrations: string;
  createdAt: string;
  updatedAt: string;
}

export const AgentListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentWorkspace, organizationName } = useWorkspace();

  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'kb' | 'integrations'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [useCaseFilter, setUseCaseFilter] = useState('All Use Cases');
  const [langFilter, setLangFilter] = useState('All Languages');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Last Updated');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getAgents(),
      getAnalyticsSummary(),
    ])
      .then(([apiAgents, analyticsRes]) => {
        if (!isMounted) return;
        setAnalytics(analyticsRes);

        if (Array.isArray(apiAgents)) {
          const mapped: AgentItem[] = apiAgents.map((a: Agent) => ({
            id: a.id,
            workspaceId: a.workspaceId || currentWorkspace.id,
            name: a.name,
            isPrimary: false,
            avatar: a.avatar || '',
            description: a.description || a.role || 'Voice AI Assistant',
            systemPrompt: a.systemPrompt || '',
            phoneNumber: a.phoneNumber || '',
            knowledgeBaseIds: a.knowledgeBaseIds || [],
            tags: [a.role || 'Voice Assistant', a.language, a.status].filter(Boolean),
            language: a.language || 'English (India)',
            voice: a.voiceName || 'Rachel',
            calls: (a.totalCalls || 0).toLocaleString(),
            conversion: `${a.successRate || 0}%`,
            avgDuration: formatDuration(a.avgDurationSec || 0),
            isActive: a.status === 'active',
            model: a.model || 'GPT-4o',
            kb: (a.knowledgeBaseIds && a.knowledgeBaseIds.length > 0)
              ? `${a.knowledgeBaseIds.length} Linked Base(s)`
              : 'None linked',
            integrations: a.phoneNumber ? `SIP: ${a.phoneNumber}` : 'WebRTC Gateway',
            createdAt: formatDate(a.createdAt),
            updatedAt: formatDate(a.updatedAt),
          }));

          setAgents(mapped);
          if (mapped.length > 0) {
            setSelectedAgentId(mapped[0].id);
          } else {
            setSelectedAgentId('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load agents or analytics:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentWorkspace.id]);

  const toggleAgentStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === id) {
          const nextActive = !agent.isActive;
          if (nextActive) {
            toast.success(`Agent "${agent.name}" activated for telephony routing`);
          } else {
            toast.warning(`Agent "${agent.name}" paused. Inbound calls will use fallback route.`);
          }
          return { ...agent, isActive: nextActive };
        }
        return agent;
      })
    );
  };

  // Filter & sort agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUseCase =
      useCaseFilter === 'All Use Cases' ||
      agent.tags.some((t) => t.toLowerCase().includes(useCaseFilter.toLowerCase()));

    const matchesLang =
      langFilter === 'All Languages' ||
      agent.language.toLowerCase().includes(langFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Active Only' ? agent.isActive : !agent.isActive);

    return matchesSearch && matchesUseCase && matchesLang && matchesStatus;
  });

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || filteredAgents[0] || null;

  const totalCalls = analytics?.totalCalls ?? 0;
  const avgConversion = analytics?.overallSuccessRate ?? 0;
  const avgDurationSec = analytics?.avgDurationSec ?? 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <span>{organizationName || 'Samvada Platform'}</span>
            <span>/</span>
            <span className="text-blue-400 font-medium">{currentWorkspace.name}</span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-500">{currentWorkspace.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Voice Agents</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage voice agents operating inside the <strong>{currentWorkspace.name}</strong> workspace.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/ai-studio')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer border border-blue-400/30 active:scale-[0.985]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Create with AI Chat</span>
          </button>
          <button
            onClick={() => navigate('/agents/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-sm font-semibold border border-zinc-700/80 transition-all cursor-pointer active:scale-[0.985]"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Setup</span>
          </button>
        </div>
      </div>

      {/* AI Chat Creation Discovery Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/30 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Create Your Agent Just By Talking</span>
            </h3>
            <p className="text-xs text-zinc-300 mt-0.5">
              Describe your business or upload your price list — our AI creates your complete voice agent in seconds.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai-studio')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <span>Try AI Chat Builder</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Stat Metric Cards (Dynamic API-Backed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {agents.length}
              </span>
              {agents.length > 0 ? (
                <span className="text-xs font-semibold text-emerald-400">Configured</span>
              ) : (
                <span className="text-xs font-medium text-zinc-500">-</span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Total Agents</p>
          </div>
        </div>

        {/* Total Calls */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {totalCalls.toLocaleString()}
              </span>
              {totalCalls > 0 && <span className="text-xs font-semibold text-emerald-400">Active</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Total Calls <span className="text-zinc-500 text-[10px]">across agents</span>
            </p>
          </div>
        </div>

        {/* Avg Conversion */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {avgConversion.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Avg. Conversion <span className="text-zinc-500 text-[10px]">success rate</span>
            </p>
          </div>
        </div>

        {/* Avg Duration */}
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {formatDuration(avgDurationSec)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Avg. Duration <span className="text-zinc-500 text-[10px]">per call</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="w-36 shrink-0">
            <CustomSelect
              value={useCaseFilter}
              onChange={setUseCaseFilter}
              options={['All Use Cases', 'Sales', 'Support', 'Surveys', 'Retention']}
              size="sm"
            />
          </div>

          <div className="w-36 shrink-0">
            <CustomSelect
              value={langFilter}
              onChange={setLangFilter}
              options={['All Languages', 'English (India)', 'Hinglish', 'Hindi', 'English (US)']}
              size="sm"
            />
          </div>

          <div className="w-32 shrink-0">
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['All Statuses', 'Active Only', 'Paused Only']}
              size="sm"
            />
          </div>
        </div>

        <div className="w-40 shrink-0">
          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={['Last Updated', 'Most Calls', 'Highest Conversion', 'Alphabetical']}
            size="sm"
          />
        </div>
      </div>

      {/* Main 2-Column Split: Agent List + Selected Agent Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Agent List */}
        <div className="lg:col-span-8 space-y-3">
          {isLoading ? (
            <div className="p-16 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0c101b]/95 border border-dashed border-zinc-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Bot className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">No voice agents found</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Create your first voice agent using the AI Chat Studio or build manually with customized prompts and telephony settings.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/ai-studio')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create with AI Chat</span>
                </button>
                <button
                  onClick={() => navigate('/agents/create')}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Setup</span>
                </button>
              </div>
            </div>
          ) : (
            filteredAgents.map((agent) => {
              const isSelected = selectedAgentId === agent.id;

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0e1424] border-blue-500/80 shadow-lg ring-1 ring-blue-500/30'
                      : 'bg-[#0c101b]/95 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Avatar & Info */}
                    <div className="flex items-start gap-3.5">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-sm font-bold text-blue-300 shrink-0">
                          {agent.name[0]}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                          {agent.isPrimary && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[10px] font-semibold text-blue-400">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{agent.description}</p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {agent.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics, Language, Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                      <div className="space-y-1 text-left sm:text-right">
                        <p className="text-[11px] text-zinc-300 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-zinc-500" /> {agent.language}
                        </p>
                        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Mic className="w-3 h-3 text-blue-400" /> {agent.voice}
                        </p>
                      </div>

                      <div className="space-y-1 text-right min-w-[70px]">
                        <p className="text-xs font-bold text-white">{agent.calls} Calls</p>
                        <p className="text-[11px] font-semibold text-emerald-400">{agent.conversion}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Active Status Toggle */}
                        <button
                          type="button"
                          onClick={(e) => toggleAgentStatus(agent.id, e)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                            agent.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}
                          />
                          <span>{agent.isActive ? 'Active' : 'Inactive'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/agents/create');
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-3 text-xs text-zinc-400">
            <span>Showing {filteredAgents.length} of {agents.length} agent(s)</span>
          </div>
        </div>

        {/* Right Selected Agent Details Drawer */}
        <div className="lg:col-span-4 space-y-4">
          {selectedAgent ? (
            <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-xl space-y-5">
              {/* Header with Avatar & Status */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  {selectedAgent.avatar ? (
                    <img
                      src={selectedAgent.avatar}
                      alt={selectedAgent.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-700 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-blue-300">
                      {selectedAgent.name[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedAgent.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {selectedAgent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => navigate('/agents/create')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'overview' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('config')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'config' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Configuration
                </button>
                <button
                  onClick={() => setActiveTab('kb')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'kb' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Knowledge
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'integrations' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Integrations
                </button>
              </div>

              {/* Sub-tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{selectedAgent.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selectedAgent.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-zinc-400" /> Language
                      </span>
                      <p className="font-semibold text-white">{selectedAgent.language}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-blue-400" /> Voice
                      </span>
                      <p className="font-semibold text-white">{selectedAgent.voice}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-zinc-400" /> Model
                      </span>
                      <p className="font-semibold text-white">{selectedAgent.model}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" /> Created
                      </span>
                      <p className="font-semibold text-white truncate">{selectedAgent.createdAt}</p>
                    </div>
                  </div>

                  {selectedAgent.systemPrompt && (
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">System Prompt</p>
                      <p className="text-xs text-zinc-300 font-mono line-clamp-3 leading-relaxed">{selectedAgent.systemPrompt}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Configuration */}
              {activeTab === 'config' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">LLM Reasoning Engine</span>
                      <span className="font-bold text-white font-mono">{selectedAgent.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Speech Synthesis Voice</span>
                      <span className="font-semibold text-blue-400">{selectedAgent.voice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Primary Language</span>
                      <span className="font-semibold text-zinc-200">{selectedAgent.language}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Interruption (Barge-in)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                        Enabled
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Pipelined Audio Latency</span>
                      <span className="font-mono text-zinc-200">~240ms (Sub-second)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-tab 3: Knowledge Base */}
              {activeTab === 'kb' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400 font-medium">Attached Knowledge</span>
                      <span className="font-semibold text-white">{selectedAgent.kb}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {selectedAgent.knowledgeBaseIds && selectedAgent.knowledgeBaseIds.length > 0
                        ? `Agent queries ${selectedAgent.knowledgeBaseIds.length} synced vector index(es) for semantic RAG answers.`
                        : 'No custom knowledge base documents currently linked to this agent.'}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate('/knowledge')}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Manage Knowledge Bases</span>
                  </button>
                </div>
              )}

              {/* Sub-tab 4: Integrations */}
              {activeTab === 'integrations' && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Assigned Inbound Line</span>
                      <span className="font-mono font-semibold text-white">{selectedAgent.phoneNumber || 'None'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Telephony Routing</span>
                      <span className="font-semibold text-indigo-400">{selectedAgent.integrations}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold">Live Webhook Endpoint</span>
                    <p className="font-mono text-[10px] text-zinc-300 break-all bg-black/40 p-2 rounded-lg border border-zinc-800">
                      POST /api/v1/agents/{selectedAgent.id}/events
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    toast.info(`Connecting WebRTC test channel for "${selectedAgent.name}"...`);
                    navigate('/calls/live');
                  }}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.985]"
                >
                  <Play className="w-3.5 h-3.5 text-blue-400 fill-current" />
                  <span>Test Agent</span>
                </button>

                <button
                  onClick={() => navigate('/campaigns/create')}
                  className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-[0.985]"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Deploy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Agent Selected</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Create an agent or select an existing voice assistant from the list to inspect settings, prompts, and telephony bindings.
              </p>
              <button
                onClick={() => navigate('/agents/create')}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Agent</span>
              </button>
            </div>
          )}

          {/* Bottom Conversion Banner matching design */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-blue-900/30 to-[#0c101b] border border-blue-500/25 flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="space-y-1 max-w-[200px]">
              <h4 className="text-xs font-bold text-white leading-tight">
                Turn conversations into conversions.
              </h4>
              <p className="text-[10px] text-zinc-400 leading-normal">
                Build voice agents that sound human, work 24/7 and deliver real business outcomes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-16 h-8 text-blue-400" viewBox="0 0 80 40" fill="none">
                <path d="M0,20 Q10,5 20,20 T40,20 T60,20 T80,20" stroke="#38bdf8" strokeWidth="2" fill="none" />
              </svg>
              <button
                onClick={() => navigate('/agents/create')}
                className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
