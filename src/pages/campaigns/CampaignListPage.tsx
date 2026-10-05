import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Users,
  BarChart3,
  Clock,
  Search,
  Plus,
  MoreHorizontal,
  ArrowRight,
  Pause,
  Play,
  Megaphone,
  Loader2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getCampaigns } from '../../api/campaigns';
import { getAnalyticsSummary } from '../../api/analytics';
import { AnalyticsSummary } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';

interface CampaignItem {
  id: string;
  name: string;
  subtitle: string;
  agent: string;
  agentInitial: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft' | 'paused';
  contacts: string;
  calls: string;
  conversion: string;
  createdAt: string;
  useCase: string;
  targetAudience: string;
  schedule: string;
  description: string;
}

export const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'scheduled' | 'completed' | 'drafts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [agentFilter, setAgentFilter] = useState('All Agents');
  const [useCaseFilter, setUseCaseFilter] = useState('All Use Cases');

  // Load live campaigns directly from PostgreSQL via ABS API & Analytics
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getCampaigns(),
      getAnalyticsSummary(),
    ])
      .then(([data, analyticsRes]) => {
        if (!isMounted) return;
        setAnalytics(analyticsRes);

        if (Array.isArray(data)) {
          const mapped: CampaignItem[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            subtitle: c.description || c.status || 'Outbound AI Campaign',
            agent: c.agent_name || c.agentName || 'Voice Agent',
            agentInitial: (c.name || 'C').charAt(0).toUpperCase(),
            status: c.status || 'scheduled',
            contacts: (c.total_contacts || c.totalContacts || 0).toLocaleString(),
            calls: (c.completed_calls || c.completedCalls || 0).toLocaleString(),
            conversion: `${Math.round(((c.successful_calls || c.successfulCalls || 0) / Math.max(1, (c.completed_calls || c.completedCalls || 1))) * 100)}%`,
            createdAt: formatDate(c.created_at || c.createdAt),
            useCase: c.useCase || 'Voice AI Outreach',
            targetAudience: c.targetAudience || 'Target Audience',
            schedule: c.schedule || 'Immediate',
            description: c.description || 'Voice AI campaign provisioned via Samvada engine.',
          }));

          setCampaigns(mapped);
          if (mapped.length > 0) {
            setSelectedCampaignId(mapped[0].id);
          } else {
            setSelectedCampaignId('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load campaigns from API', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0] || null;

  const handleToggleCampaignStatus = (id: string) => {
    const c = campaigns.find((camp) => camp.id === id);
    if (!c) return;
    const isNowPaused = c.status !== 'paused';
    setCampaigns(
      campaigns.map((camp) =>
        camp.id === id ? { ...camp, status: isNowPaused ? 'paused' : 'active' } : camp
      )
    );
    if (isNowPaused) {
      toast.warning(`Campaign "${c.name}" paused. Dialing queue suspended.`);
    } else {
      toast.success(`Campaign "${c.name}" resumed. Outbound dialer active.`);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'scheduled') return c.status === 'scheduled';
    if (activeTab === 'completed') return c.status === 'completed';
    if (activeTab === 'drafts') return c.status === 'draft';

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All Statuses' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesAgent = agentFilter === 'All Agents' || c.agent.toLowerCase() === agentFilter.toLowerCase();
    const matchesUseCase = useCaseFilter === 'All Use Cases' || c.useCase.toLowerCase() === useCaseFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesAgent && matchesUseCase;
  });

  const totalCampaignCalls = campaigns.reduce((acc, c) => acc + parseInt(c.calls.replace(/,/g, '') || '0', 10), 0);
  const totalCampaignContacts = campaigns.reduce((acc, c) => acc + parseInt(c.contacts.replace(/,/g, '') || '0', 10), 0);
  const avgConversionRate = campaigns.length > 0
    ? (campaigns.reduce((acc, c) => acc + (parseFloat(c.conversion) || 0), 0) / campaigns.length).toFixed(1)
    : (analytics?.overallSuccessRate ?? 0).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Campaigns</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Create, manage and track your outbound voice campaigns.
          </p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* 4 Stat Metric Cards (Dynamic API-Backed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {totalCampaignCalls.toLocaleString()}
              </span>
              {totalCampaignCalls > 0 && <span className="text-xs font-semibold text-emerald-400">Active</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Total Calls</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {totalCampaignContacts.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Target Contacts</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {avgConversionRate}%
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Avg. Conversion</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {formatDuration(analytics?.avgDurationSec || 0)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Avg. Call Duration</p>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: `All Campaigns (${campaigns.length})` },
            { id: 'active', label: `Active (${campaigns.filter((c) => c.status === 'active').length})` },
            { id: 'scheduled', label: `Scheduled (${campaigns.filter((c) => c.status === 'scheduled').length})` },
            { id: 'completed', label: `Completed (${campaigns.filter((c) => c.status === 'completed').length})` },
            { id: 'drafts', label: `Drafts (${campaigns.filter((c) => c.status === 'draft').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="w-36 shrink-0">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All Statuses', 'Active', 'Scheduled', 'Completed', 'Paused']}
            size="sm"
          />
        </div>

        <div className="w-36 shrink-0">
          <CustomSelect
            value={agentFilter}
            onChange={setAgentFilter}
            options={['All Agents', 'Sales Agent', 'Survey Agent', 'Support Agent']}
            size="sm"
          />
        </div>

        <div className="w-40 shrink-0">
          <CustomSelect
            value={useCaseFilter}
            onChange={setUseCaseFilter}
            options={['All Use Cases', 'Lead Generation', 'Feedback Collection', 'Booking', 'Customer Support']}
            size="sm"
          />
        </div>
      </div>

      {/* Main Split Layout: Table + Right Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Column */}
        <div className="lg:col-span-8 bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Megaphone className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">No campaigns found</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Create your first voice outreach campaign to automatically dial customer contact lists with AI agents.
                </p>
              </div>
              <button
                onClick={() => navigate('/campaigns/create')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                  <tr>
                    <th className="p-3.5 font-semibold text-zinc-300">Campaign Name</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Agent</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Status</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Contacts</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Calls</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Conversion</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredCampaigns.map((c) => {
                    const isSelected = selectedCampaignId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCampaignId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-600/10' : 'hover:bg-zinc-850/40'
                        }`}
                      >
                        <td className="p-3.5">
                          <div>
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-[10px] text-zinc-500 mt-0.5">{c.subtitle}</p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold text-blue-300">
                              {c.agentInitial}
                            </div>
                            <span className="text-zinc-300">{c.agent}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : c.status === 'scheduled'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : c.status === 'paused'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === 'active'
                                  ? 'bg-emerald-400 animate-pulse'
                                  : c.status === 'paused'
                                  ? 'bg-amber-400'
                                  : 'bg-zinc-400'
                              }`}
                            />
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">{c.contacts}</td>
                        <td className="p-3.5 font-mono">{c.calls}</td>
                        <td className="p-3.5 font-semibold text-emerald-400">{c.conversion}</td>
                        <td className="p-3.5 text-zinc-400">{c.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Showing {filteredCampaigns.length} of {campaigns.length} campaign(s)</span>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-5">
          {selectedCampaign ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCampaign.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{selectedCampaign.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {selectedCampaign.status}
                  </span>
                  <button className="p-1 rounded text-zinc-500 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500">Agent</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-300">
                        {selectedCampaign.agentInitial}
                      </div>
                      <span className="font-semibold text-white">{selectedCampaign.agent}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/agents')}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    View Agent <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500">Use Case</span>
                  <p className="font-semibold text-white mt-0.5">{selectedCampaign.useCase}</p>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500">Target Audience</span>
                  <p className="font-semibold text-white mt-0.5">{selectedCampaign.targetAudience}</p>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500">Schedule</span>
                  <p className="font-semibold text-white mt-0.5">{selectedCampaign.schedule}</p>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-500">Description</span>
                  <p className="text-zinc-300 mt-0.5 leading-relaxed">{selectedCampaign.description}</p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center">
                <div>
                  <p className="text-xs font-bold text-white">{selectedCampaign.calls}</p>
                  <p className="text-[10px] text-zinc-500">Calls</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-400">{selectedCampaign.conversion}</p>
                  <p className="text-[10px] text-zinc-500">Conversion</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={() => handleToggleCampaignStatus(selectedCampaign.id)}
                  className="py-2.5 px-3 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.985]"
                >
                  {selectedCampaign.status === 'paused' ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    toast.info(`Opening live telemetry for "${selectedCampaign.name}"`);
                    navigate('/calls/live');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-[0.985]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Live Calls</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Campaign Selected</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Create a campaign to schedule outbound voice calls, manage customer lists, and inspect conversion funnels.
              </p>
              <button
                onClick={() => navigate('/campaigns/create')}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Campaign</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
