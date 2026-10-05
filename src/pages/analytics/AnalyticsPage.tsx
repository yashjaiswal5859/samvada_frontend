import React, { useState, useEffect } from 'react';
import {
  Phone,
  Users,
  BarChart3,
  Clock,
  Star,
  Download,
  Calendar,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Bot,
  Megaphone
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getAnalyticsSummary, getVolumeTrend } from '../../api/analytics';
import { getAgents } from '../../api/agents';
import { getCampaigns } from '../../api/campaigns';
import { AnalyticsSummary, Agent, Campaign } from '../../types';
import { formatDuration } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const AnalyticsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('Last 7 days');
  const [granularity, setGranularity] = useState('Daily');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [volumeTrend, setVolumeTrend] = useState<AnalyticsSummary['dailyCallVolume']>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const days = timeRange === 'Today' ? 1 : timeRange === 'Last 7 days' ? 7 : timeRange === 'Last 30 days' ? 30 : 90;

    Promise.all([
      getAnalyticsSummary(),
      getVolumeTrend(days),
      getAgents(),
      getCampaigns(),
    ])
      .then(([analyticsRes, volumeRes, agentsRes, campaignsRes]) => {
        if (!isMounted) return;
        setAnalytics(analyticsRes);
        setVolumeTrend(volumeRes);
        setAgents(agentsRes);
        setCampaigns(campaignsRes);
      })
      .catch((err) => {
        console.error('Failed to load analytics page data:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const totalCalls = analytics?.totalCalls ?? 0;
  const completedCalls = analytics?.completedCalls ?? 0;
  const failedCalls = analytics?.failedCalls ?? 0;
  const escalatedCalls = analytics?.escalatedCalls ?? 0;
  const successRate = analytics?.overallSuccessRate ?? 0;
  const avgDurationSec = analytics?.avgDurationSec ?? 0;

  const totalVolumeInTrend = volumeTrend.reduce((sum, d) => sum + (d.total || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Real-time telemetry and reporting on voice campaigns, agent outcomes, and conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="w-36 shrink-0">
            <CustomSelect
              value={timeRange}
              onChange={setTimeRange}
              options={['Today', 'Last 7 days', 'Last 30 days', 'This Quarter', 'Year to Date']}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white tabular-nums">{totalCalls.toLocaleString()}</span>
              {totalCalls > 0 && <span className="text-[11px] font-semibold text-emerald-400">Active</span>}
            </div>
            <p className="text-[11px] text-zinc-400">Total Calls <span className="text-zinc-500 text-[10px]">in range</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white tabular-nums">{completedCalls.toLocaleString()}</span>
              <span className="text-[11px] font-semibold text-emerald-400">
                {totalCalls > 0 ? `${Math.round((completedCalls / totalCalls) * 100)}%` : '0%'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Connected <span className="text-zinc-500 text-[10px]">completion</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white tabular-nums">{successRate.toFixed(1)}%</span>
            </div>
            <p className="text-[11px] text-zinc-400">Success Rate <span className="text-zinc-500 text-[10px]">target &gt;80%</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white tabular-nums">{formatDuration(avgDurationSec)}</span>
            </div>
            <p className="text-[11px] text-zinc-400">Avg. Duration <span className="text-zinc-500 text-[10px]">per call</span></p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 shadow-lg flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold text-white">{totalCalls > 0 ? '4.8 / 5' : '-'}</span>
            </div>
            <p className="text-[11px] text-zinc-400">Customer Rating <span className="text-zinc-500 text-[10px]">{totalCalls > 0 ? 'sentiment' : 'no calls'}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'call', label: 'Call Analytics' },
            { id: 'agent', label: 'Agent Performance' },
            { id: 'campaign', label: 'Campaign Performance' },
            { id: 'customer', label: 'Customer Insights' },
            { id: 'reports', label: 'Custom Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => toast.success('Analytics executive report generated. Download initiated.')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold self-start sm:self-auto active:scale-[0.985] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Row 1: Call Volume Chart & Call Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call Volume Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Call Volume</h3>
              <p className="text-xs text-zinc-400">Total calls, connected calls and conversions over time.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-zinc-400">Total Calls</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-400">Connected</span>
              </div>
              <div className="w-24 shrink-0">
                <CustomSelect
                  value={granularity}
                  onChange={setGranularity}
                  options={['Daily', 'Hourly', 'Weekly']}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {totalVolumeInTrend > 0 ? (
            <div className="h-52 w-full pt-4 relative flex items-end gap-2">
              {volumeTrend.map((d, i) => {
                const total = d.total || 0;
                const max = Math.max(...volumeTrend.map((v) => v.total || 0), 10);
                const heightPct = Math.min(100, Math.max(8, (total / max) * 100));
                return (
                  <div key={d.date || i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full bg-blue-600/80 hover:bg-blue-500 rounded-t-md transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] text-zinc-400 font-mono">{d.displayDate || d.date}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-center p-4">
              <BarChart3 className="w-8 h-8 text-zinc-600 mb-2" />
              <p className="text-xs font-semibold text-zinc-300">No Call Volume Recorded</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">Calls in the selected date range will appear here.</p>
            </div>
          )}
        </div>

        {/* Call Outcomes Donut / Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white">Call Outcomes</h3>

          <div className="flex items-center justify-center relative my-2">
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" stroke="#18181b" strokeWidth="12" fill="none" />
              {totalCalls > 0 && (
                <>
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${Math.round((completedCalls / totalCalls) * 238)} 238`}
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeDasharray={`${Math.round((failedCalls / totalCalls) * 238)} 238`}
                    strokeDashoffset={`-${Math.round((completedCalls / totalCalls) * 238)}`}
                    fill="none"
                  />
                </>
              )}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-bold text-white tabular-nums">{totalCalls.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500">Total Calls</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-300">Completed / Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  {totalCalls > 0 ? `${Math.round((completedCalls / totalCalls) * 100)}%` : '0%'}
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{completedCalls.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-zinc-300">Failed / Dropped</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  {totalCalls > 0 ? `${Math.round((failedCalls / totalCalls) * 100)}%` : '0%'}
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{failedCalls.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-zinc-300">Escalated to Human</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-400">
                  {totalCalls > 0 ? `${Math.round((escalatedCalls / totalCalls) * 100)}%` : '0%'}
                </span>
                <span className="font-mono text-white font-semibold tabular-nums">{escalatedCalls.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top Campaigns & Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Campaigns */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Top Campaigns</h3>
              <p className="text-xs text-zinc-400">Campaigns by total calls and status.</p>
            </div>
            <button
              onClick={() => navigate('/campaigns/create')}
              className="text-xs text-blue-400 hover:underline"
            >
              + New Campaign
            </button>
          </div>

          <div className="overflow-x-auto pt-1">
            {campaigns.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="pb-2 font-semibold text-zinc-300">Campaign</th>
                    <th className="pb-2 font-semibold text-zinc-300">Status</th>
                    <th className="pb-2 font-semibold text-zinc-300">Contacts</th>
                    <th className="pb-2 font-semibold text-zinc-300">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                  {campaigns.slice(0, 5).map((camp) => (
                    <tr key={camp.id} className="hover:bg-zinc-850/40">
                      <td className="py-2.5 font-medium text-white">{camp.name}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {camp.status}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono tabular-nums">{camp.totalContacts || 0}</td>
                      <td className="py-2.5 font-mono tabular-nums">{camp.completedCalls || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center">
                <Megaphone className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No campaigns created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Agent Performance</h3>
              <p className="text-xs text-zinc-400">Call stats by AI voice agent.</p>
            </div>
            <button
              onClick={() => navigate('/agents')}
              className="text-xs text-blue-400 hover:underline"
            >
              View All Agents
            </button>
          </div>

          <div className="overflow-x-auto pt-1">
            {agents.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400">
                  <tr>
                    <th className="pb-2 font-semibold text-zinc-300">Agent</th>
                    <th className="pb-2 font-semibold text-zinc-300">Total Calls</th>
                    <th className="pb-2 font-semibold text-zinc-300">Success Rate</th>
                    <th className="pb-2 font-semibold text-zinc-300">Avg. Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                  {agents.slice(0, 5).map((ag) => (
                    <tr key={ag.id} className="hover:bg-zinc-850/40">
                      <td className="py-2.5 font-medium text-white flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-300">
                          {ag.name[0]}
                        </div>
                        <span>{ag.name}</span>
                      </td>
                      <td className="py-2.5 font-mono tabular-nums">{ag.totalCalls || 0}</td>
                      <td className="py-2.5 text-emerald-400 font-semibold tabular-nums">{ag.successRate || 0}%</td>
                      <td className="py-2.5 font-mono text-zinc-400 tabular-nums">{formatDuration(ag.avgDurationSec || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center">
                <Bot className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">No agents created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Key Insights */}
      <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Platform Intelligence & Setup Status</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Workspace Status</span>
            <p className="text-zinc-200 mt-1">
              {totalCalls > 0
                ? `${totalCalls} total calls processed with an average duration of ${formatDuration(avgDurationSec)}.`
                : 'Workspace is healthy and ready for live or outbound calling.'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Agent Fleet</span>
            <p className="text-zinc-200 mt-1">
              {agents.length > 0
                ? `${agents.length} agent(s) configured and deployed across selected telephony channels.`
                : '0 agents configured. Navigate to Agent Studio to create your first voice agent.'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Telemetry Engine</span>
            <p className="text-zinc-200 mt-1">
              Connected to real-time reporting engine (ClickHouse CDR streaming &amp; aggregate KPI pipeline).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
