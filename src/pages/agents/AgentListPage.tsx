import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Phone,
  BarChart3,
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
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
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Sliders,
  SlidersHorizontal,
  Volume2,
  ExternalLink,
  Layers,
  Zap,
  Radio,
  FileText
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getAgents, getAgent, createAgent } from '../../api/agents';
import { getAnalyticsSummary } from '../../api/analytics';
import { Agent, AnalyticsSummary } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';
import { CreateAgentModal } from '../../components/modals/CreateAgentModal';

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
  rawAgent: Agent;
}
import { MarketplaceTemplate, MARKETPLACE_TEMPLATES } from '../../utils/constants';

export const AgentListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { currentWorkspace, organizationName } = useWorkspace();

  // Primary subtab: 'my-agents' | 'marketplace'
  const [activeSubtab, setActiveSubtab] = useState<'my-agents' | 'marketplace'>('my-agents');

  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('all');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Creation & Configure modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgentForEdit, setSelectedAgentForEdit] = useState<Agent | null>(null);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('create') === '1') {
      setIsCreateModalOpen(true);
      navigate('/agents', { replace: true });
    }
  }, [location.search, navigate]);

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
            model: a.model || 'GPT-4o Realtime',
            kb: (a.knowledgeBaseIds && a.knowledgeBaseIds.length > 0)
              ? `${a.knowledgeBaseIds.length} Linked Base(s)`
              : 'None linked',
            integrations: a.phoneNumber ? `SIP: ${a.phoneNumber}` : 'WebRTC Gateway',
            createdAt: formatDate(a.createdAt),
            updatedAt: formatDate(a.updatedAt),
            rawAgent: a,
          }));

          setAgents(mapped);
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

  const refreshAgents = () => {
    getAgents().then((apiAgents) => {
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
          model: a.model || 'GPT-4o Realtime',
          kb: (a.knowledgeBaseIds && a.knowledgeBaseIds.length > 0)
            ? `${a.knowledgeBaseIds.length} Linked Base(s)`
            : 'None linked',
          integrations: a.phoneNumber ? `SIP: ${a.phoneNumber}` : 'WebRTC Gateway',
          createdAt: formatDate(a.createdAt),
          updatedAt: formatDate(a.updatedAt),
          rawAgent: a,
        }));
        setAgents(mapped);
      }
    });
  };

  const handleOpenConfigure = async (agentItem: AgentItem) => {
    setSelectedAgentForEdit(agentItem.rawAgent);
    setIsConfigureModalOpen(true);
    try {
      const fullAgent = await getAgent(agentItem.id);
      if (fullAgent) {
        setSelectedAgentForEdit(fullAgent);
      }
    } catch (e) {
      // rawAgent is fallback
    }
  };

  // Audio sample playback using browser Web Speech API
  const handlePlayVoiceSample = (id: string, text: string) => {
    if (playingAudioId === id) {
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      setPlayingAudioId(id);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info('Audio synthesis not supported in this browser environment.');
    }
  };

  // One-click clone from marketplace template
  const handleCloneTemplate = async (template: MarketplaceTemplate) => {
    setIsCloning(true);
    try {
      const created = await createAgent({
        name: `${template.name} (${template.role})`,
        role: template.role,
        voiceId: template.voiceName,
        model: template.model,
        description: template.description,
        guardrails: {
          redactSensitiveData: true,
          groundAnswersInKnowledge: true,
          restrictedTopics: [],
          prohibitedPromises: [],
          escalationTriggers: [],
          aiDisclosure: '',
          recordingDisclosure: '',
        },
        complianceFlags: {
          aiDisclosureRequired: true,
          recordingDisclosureRequired: true,
          outboundDndDncChecksRequired: true,
        },
      });

      toast.success(`Agent "${template.name}" cloned into ${currentWorkspace.name}`);
      setActiveSubtab('my-agents');
      refreshAgents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to clone template into workspace');
    } finally {
      setIsCloning(false);
    }
  };

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

  // Filter My Agents
  const filteredMyAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Active Only' ? agent.isActive : !agent.isActive);
    return matchesSearch && matchesStatus;
  });

  // Filter Marketplace Templates
  const filteredMarketplace = MARKETPLACE_TEMPLATES.filter((tpl) => {
    const matchesCategory =
      marketplaceCategory === 'all' || tpl.category === marketplaceCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-mono">
            <span>{organizationName || 'Samvada Enterprise Labs'}</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{currentWorkspace.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Voice Agents</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Architect, deploy, and observe conversational voice agents across SIP trunks and WebRTC channels.
          </p>
        </div>

        {/* Top Header Actions (Forest Slate & Emerald) */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-[0.985]"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            <span>Create Agent</span>
          </button>
        </div>
      </div>

      {/* ── Formal Subtabs Switcher ── */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveSubtab('my-agents')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
              activeSubtab === 'my-agents'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>My Active Agents</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              {agents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubtab('marketplace')}
            className={`pb-3 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer relative ${
              activeSubtab === 'marketplace'
                ? 'text-emerald-950 font-bold border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Explore Marketplace</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-900">
              Enterprise Blueprints
            </span>
          </button>
        </div>

        {/* Quick Search in Subtab Bar */}
        <div className="hidden md:flex items-center pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label={activeSubtab === 'my-agents' ? 'Search agents' : 'Search templates'}
              placeholder={activeSubtab === 'my-agents' ? 'Search my agents...' : 'Search templates by role or model...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUBTAB 1: MY ACTIVE AGENTS                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'my-agents' && (
        <div className="space-y-6">
          {/* Workspace metrics */}
          {!isLoading && agents.length > 0 && <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Agents */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {agents.length}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Configured Agents</p>
              </div>
            </div>

            {/* Total Calls */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {analytics?.totalCalls ?? 0}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    All-time
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Telephony Sessions</p>
              </div>
            </div>

            {/* Active agents */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {agents.filter(a => a.isActive).length}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Active agents</p>
              </div>
            </div>

            {/* Draft agents */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                    {agents.filter(a => !a.isActive).length}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Draft
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Agents in draft</p>
              </div>
            </div>
          </div>}

          {/* If No Agents Configured Yet: Signature Anti-Copy Concentric Acoustic Soundwave Empty State */}
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs" role="status" aria-live="polite">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
              <p className="text-sm font-semibold text-slate-800">Loading voice agents…</p>
            </div>
          ) : filteredMyAgents.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs flex flex-col items-center justify-center relative overflow-hidden">
              {/* Subtle background acoustic waves */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
                <div className="w-[420px] h-[420px] rounded-full border border-emerald-100" />
                <div className="absolute w-[320px] h-[320px] rounded-full border border-emerald-200/60" />
                <div className="absolute w-[220px] h-[220px] rounded-full border border-emerald-300/40" />
              </div>

              {/* Signature Concentric Acoustic Soundwave Glyph */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-6 bg-white/70 rounded-full animate-pulse" />
                  <span className="w-1.5 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-12 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                  <span className="w-1.5 h-8 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
                  <span className="w-1.5 h-4 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
                </div>
              </div>

              <div className="relative z-10 max-w-md space-y-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {agents.length === 0 ? 'Create your first voice agent' : 'No agents match these filters'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {agents.length === 0
                    ? 'Start with a guided draft or choose a proven template, then tailor the voice and workflow to your business.'
                    : 'Try a different search or status filter to find an agent in this workspace.'}
                </p>
              </div>

              {/* Dual Action CTAs */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-6">
                {agents.length === 0 ? (
                  <>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-emerald-300" />
                      <span>Create Agent</span>
                    </button>
                    <button
                      onClick={() => setActiveSubtab('marketplace')}
                      className="px-4 py-2.5 rounded-lg border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Browse templates</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('All Statuses'); }}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Agents Grid when agents exist */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMyAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4
                            onClick={() => navigate(`/agents/${agent.id}`)}
                            className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition-colors"
                            title="Open Studio & Configuration"
                          >
                            <span>{agent.name}</span>
                            {agent.isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Active in telephony route" />
                            )}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{agent.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleAgentStatus(agent.id, e)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                          agent.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {agent.isActive ? 'Active' : 'Draft'}
                      </button>
                    </div>

                    {/* Metadata Strip */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 font-mono text-slate-700">
                        {agent.model}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                        {agent.voice}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                        {agent.language}
                      </span>
                    </div>

                    {/* Telephony Connection */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {agent.phoneNumber || 'WebRTC Only (No DID)'}
                      </span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {agent.calls} calls
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar: Single Unified Configure & Test Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center">
                    <button
                      onClick={() => navigate(`/agents/${agent.id}`)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-200/80 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.985]"
                      title="Open Studio to Configure Agent and Test in Real-Time"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Configure & Test</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SUBTAB 2: EXPLORE MARKETPLACE (3-COLUMN ENTERPRISE BLUEPRINTS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeSubtab === 'marketplace' && (
        <div className="space-y-6">
          {/* Marketplace Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Industries' },
              { id: 'support', label: 'Customer Support' },
              { id: 'sales', label: 'Inbound Sales & SDR' },
              { id: 'healthcare', label: 'Healthcare & Clinical' },
              { id: 'fintech', label: 'Fintech & Collections' },
              { id: 'automotive', label: 'Automotive & Dealership' },
              { id: 'hospitality', label: 'Hospitality & Travel' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setMarketplaceCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  marketplaceCategory === cat.id
                    ? 'bg-emerald-950 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 3-Column Enterprise Blueprint Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarketplace.map((template) => {
              const isPlaying = playingAudioId === template.id;

              return (
                <div
                  key={template.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Photographic Avatar + Verification & Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={template.avatar}
                            alt={template.name}
                            className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-100 shadow-2xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] shadow-xs" title="Verified Enterprise Architecture">
                            ✓
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                            <span>{template.name}</span>
                          </h3>
                          <p className="text-xs font-medium text-emerald-800">{template.role}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{template.categoryLabel}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
                        {template.language}
                      </span>
                    </div>

                    {/* Architecture Model & Voice Spec */}
                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold">{template.model}</span>
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{template.voiceProvider}</span>
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {template.description}
                    </p>

                    {/* 3-Metric Statistics Strip */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">Routed</p>
                        <p className="text-xs font-bold text-slate-900">{template.callsRouted}</p>
                      </div>
                      <div className="border-x border-emerald-100">
                        <p className="text-[10px] text-slate-400 font-medium">Latency</p>
                        <p className="text-xs font-bold text-emerald-800">{template.turnLatency}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium">CSAT</p>
                        <p className="text-xs font-bold text-slate-900">{template.csatRating}</p>
                      </div>
                    </div>

                    {/* Compliance Trust Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {template.complianceBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                        >
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{badge}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {/* Audio Preview Button */}
                    <button
                      type="button"
                      onClick={() => handlePlayVoiceSample(template.id, template.greetingSample)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Playing sample…</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span>Listen sample</span>
                        </>
                      )}
                    </button>

                    {/* Clone & Configure CTA */}
                    <button
                      type="button"
                      disabled={isCloning}
                      onClick={() => handleCloneTemplate(template)}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {isCloning ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                      <span>Use blueprint</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enterprise Multi-Path Creation & Configuration Modal */}
      <CreateAgentModal
        isOpen={isCreateModalOpen || isConfigureModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsConfigureModalOpen(false);
          setSelectedAgentForEdit(null);
        }}
        agent={selectedAgentForEdit}
        onSuccess={(_agent) => {
          refreshAgents();
        }}
      />
    </div>
  );
};
