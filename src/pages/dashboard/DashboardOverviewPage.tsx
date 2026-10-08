import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { getAnalyticsSummary, getVolumeTrend } from '../../api/analytics';
import { getCallRecords } from '../../api/calls';
import { getAgents } from '../../api/agents';
import { AnalyticsSummary, CallRecord, Agent } from '../../types';
import { formatDuration, formatRelativeTime } from '../../utils/formatters';
import {
  Phone,
  Clock,
  Users,
  Plus,
  Mic,
  BarChart3,
  Bot,
  Upload,
  ArrowRight,
  Megaphone,
  PhoneForwarded,
  Calendar,
  Sparkles,
  Inbox
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const DashboardOverviewPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [volumeData, setVolumeData] = useState<AnalyticsSummary['dailyCallVolume']>([]);
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [volumeFilter, setVolumeFilter] = useState('daily');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const displayName = user?.profile?.firstName || user?.displayName?.split(' ')[0] || 'User';

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;

    Promise.all([
      getAnalyticsSummary(),
      getVolumeTrend(days),
      getCallRecords({ limit: 5 }),
      getAgents(),
    ])
      .then(([analyticsRes, volumeRes, callsRes, agentsRes]) => {
        if (!isMounted) return;
        setAnalytics(analyticsRes);
        setVolumeData(volumeRes);
        setRecentCalls(callsRes);
        setAgents(agentsRes);
        setLoadError('');
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        if (isMounted) setLoadError('Workspace metrics are temporarily unavailable. Please retry.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const getDateRangeLabel = (range: string) => {
    const end = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`;
  };

  const hoveredData = hoveredBarIndex !== null && volumeData[hoveredBarIndex] ? volumeData[hoveredBarIndex] : null;
  const totalVolumeInTrend = volumeData.reduce((sum, d) => sum + (d.total || 0), 0);
  const maxTrendVal = Math.max(...volumeData.map((d) => d.total || 0), 10);

  const totalCalls = analytics?.totalCalls ?? 0;
  const completedCalls = analytics?.completedCalls ?? 0;
  const successRate = analytics?.overallSuccessRate ?? 0;
  const avgDurationSec = analytics?.avgDurationSec ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {loadError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{loadError}</span><button type="button" onClick={() => window.location.reload()} className="font-medium underline">Retry</button></div>}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Welcome back, {displayName}! Here's what's happening with your voice AI workspace.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium font-mono text-[11px]">{getDateRangeLabel(timeRange)}</span>
          </div>

          <div className="w-36">
            <CustomSelect
              value={timeRange}
              onChange={(val) => {
                setTimeRange(val);
              }}
              options={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' },
                { value: 'all', label: 'All time' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* 3-Step Guided Quick Start Card */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span>Fast-Track Setup — Get Your Voice AI Live in 3 Steps</span>
              </h2>
              <p className="text-xs text-slate-500">Everything you need to launch natural conversational voice workflows.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-3.5">
          {/* Step 1 */}
          <Link
            to="/ai-studio"
            className="group p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Step 1 • Build Agent
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Create Your First Agent
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Create an editable agent draft from a short description, then review its instructions and settings.
              </p>
            </div>
            <div className="pt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <span>Create an agent draft</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Step 2 */}
          <Link
            to="/knowledge"
            className="group p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  Step 2 • Add Knowledge
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                Add your business information
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Give your agent trusted answers with documents, FAQs, or website content.
              </p>
            </div>
            <div className="pt-2.5 flex items-center gap-1.5 text-xs font-medium text-blue-700">
              <span>Open Knowledge Base</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Step 3 */}
          <Link
            to="/contacts"
            className="group p-3.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  Step 3 • Add Contacts
                </span>
                <Megaphone className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                Import your audience
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Add or import people before you prepare an outbound campaign.
              </p>
            </div>
            <div className="pt-2.5 flex items-center gap-1.5 text-xs font-medium text-purple-700">
              <span>Open Contacts</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-normal">Total Calls</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {totalCalls.toLocaleString()}
              </p>
            </div>
          </div>
          {totalCalls > 0 ? (
            <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              0 calls
            </span>
          )}
        </div>

        {/* Completed / Connected Calls */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-normal">Connected Calls</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {completedCalls.toLocaleString()}
              </p>
            </div>
          </div>
          {completedCalls > 0 ? (
            <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {totalCalls > 0 ? `${Math.round((completedCalls / totalCalls) * 100)}%` : '0%'}
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              -
            </span>
          )}
        </div>

        {/* Success Rate */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-normal">Success Rate</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {successRate.toFixed(1)}%
              </p>
            </div>
          </div>
          {successRate > 0 ? (
            <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Target &gt; 80%
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              -
            </span>
          )}
        </div>

        {/* Avg Call Duration */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-normal">Avg. Call Duration</p>
              <p className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums mt-0.5">
                {formatDuration(avgDurationSec)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {avgDurationSec > 0 ? 'avg/call' : '0s'}
          </span>
        </div>
      </div>

      {/* Charts Row: Interactive Call Volume + Agent Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Call Volume Interactive Area */}
        <div className="lg:col-span-3 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg relative flex flex-col justify-between min-h-[340px]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Call Volume</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Total calls across all agents</p>
            </div>
            <div className="w-28">
              <CustomSelect
                value={volumeFilter}
                onChange={setVolumeFilter}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' }
                ]}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Not Answered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Failed
            </span>
          </div>

          {totalVolumeInTrend > 0 ? (
            /* Interactive Stacked Bar Chart with Tooltip */
            <div className="relative pt-2">
              {hoveredData && (
                <div className="absolute top-0 right-4 bg-[#080b11]/95 border border-zinc-700/80 rounded-xl p-3 shadow-2xl z-20 text-xs backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="font-bold text-white border-b border-zinc-800 pb-1 flex justify-between gap-4">
                    <span>{hoveredData.displayDate || hoveredData.date}</span>
                    <span className="text-blue-400 font-mono">{(hoveredData.total || 0).toLocaleString()} calls</span>
                  </div>
                  <div className="flex justify-between gap-4 text-zinc-300">
                    <span className="text-blue-400">Answered</span>
                    <span className="font-mono">
                      {hoveredData.answered || 0} ({hoveredData.total ? Math.round(((hoveredData.answered || 0) / hoveredData.total) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-zinc-300">
                    <span className="text-purple-400">Not Answered</span>
                    <span className="font-mono">{hoveredData.notAnswered || 0}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-zinc-300">
                    <span className="text-rose-400">Failed</span>
                    <span className="font-mono">{hoveredData.failed || 0}</span>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3 h-52 pt-6">
                {volumeData.map((d, i) => {
                  const isHovered = hoveredBarIndex === i;
                  const total = d.total || 0;
                  const totalH = Math.min(100, Math.max(8, (total / maxTrendVal) * 100));
                  const ansH = total > 0 ? ((d.answered || 0) / total) * 100 : 0;
                  const noAnsH = total > 0 ? ((d.notAnswered || 0) / total) * 100 : 0;
                  const failH = total > 0 ? ((d.failed || 0) / total) * 100 : 0;

                  return (
                    <div
                      key={d.date || i}
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                      className="flex-1 flex flex-col items-center gap-1.5 cursor-pointer group transition-all"
                    >
                      <div
                        className={`w-full rounded-xl overflow-hidden flex flex-col-reverse transition-all duration-200 ${
                          isHovered ? 'scale-105 shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/50' : 'opacity-90 hover:opacity-100'
                        }`}
                        style={{ height: `${totalH}%` }}
                      >
                        <div className="bg-blue-500 transition-colors group-hover:bg-blue-400" style={{ height: `${ansH}%` }} />
                        <div className="bg-purple-500 transition-colors group-hover:bg-purple-400" style={{ height: `${noAnsH}%` }} />
                        <div className="bg-rose-500 transition-colors group-hover:bg-rose-400" style={{ height: `${failH}%` }} />
                      </div>
                      <span
                        className={`text-[11px] font-mono transition-colors ${
                          isHovered ? 'text-blue-400 font-bold' : 'text-zinc-400'
                        }`}
                      >
                        {d.displayDate || d.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">No Call Volume Activity Yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Daily volume trends and disposition breakdowns will automatically populate here as calls occur.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/agents/create')}
                className="mt-4 gap-1.5 text-xs border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-white"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Create Voice Agent</span>
              </Button>
            </div>
          )}
        </div>

        {/* Agent Performance Table */}
        <div className="lg:col-span-2 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Agent Performance</h3>
              <Link to="/agents" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {agents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-400 font-semibold border-b border-zinc-800/80 text-[11px]">
                      <th className="pb-3 pl-1">AGENT</th>
                      <th className="pb-3 text-right">CALLS</th>
                      <th className="pb-3 text-right">CONVERSION</th>
                      <th className="pb-3 text-right pr-1">AVG. DURATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {agents.slice(0, 4).map((agent) => (
                      <tr key={agent.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 pl-1">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                              <Mic className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-white leading-tight">{agent.name}</p>
                              <p className="text-[10px] text-zinc-400">{agent.language} · {agent.voiceName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right text-zinc-200 font-mono tabular-nums">
                          {(agent.totalCalls || 0).toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-bold tabular-nums">
                          {agent.successRate || 0}%
                        </td>
                        <td className="py-3 text-right pr-1 text-zinc-300 font-mono tabular-nums">
                          {formatDuration(agent.avgDurationSec || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">No Agents Created</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Create your first voice agent to start tracking individual agent KPIs and conversion rates.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/agents/create')}
                  className="mt-4 gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Agent</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Calls + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Calls Table */}
        <div className="lg:col-span-3 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg min-h-[260px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Recent Calls</h3>
              <Link to="/calls/live" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentCalls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-zinc-400 font-semibold border-b border-zinc-800/80 text-[11px]">
                      <th className="pb-3 pl-1">CONTACT</th>
                      <th className="pb-3">AGENT</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3">DURATION</th>
                      <th className="pb-3 text-right pr-1">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {recentCalls.map((call) => (
                      <tr key={call.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="py-3 pl-1">
                          <p className="font-semibold text-white">{call.customerName || 'Direct Caller'}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{call.customerPhone}</p>
                        </td>
                        <td className="py-3 text-zinc-300 font-medium">{call.agentName || 'Voice Agent'}</td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                              call.status === 'completed'
                                ? 'text-emerald-400'
                                : call.status === 'failed'
                                ? 'text-rose-400'
                                : 'text-amber-400'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                call.status === 'completed'
                                  ? 'bg-emerald-400'
                                  : call.status === 'failed'
                                  ? 'bg-rose-400'
                                  : 'bg-amber-400'
                              }`}
                            />
                            {call.status ? call.status.charAt(0).toUpperCase() + call.status.slice(1).replace('_', ' ') : 'Completed'}
                          </span>
                        </td>
                        <td className="py-3 text-zinc-200 font-mono tabular-nums">
                          {formatDuration(call.durationSec || 0)}
                        </td>
                        <td className="py-3 text-right pr-1 text-zinc-400">
                          {formatRelativeTime(call.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
                  <PhoneForwarded className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-white">No Recent Calls</h4>
                <p className="text-xs text-zinc-400 max-w-xs mt-1">
                  Live call sessions, recordings, and transcripts will appear here in real-time as conversations occur.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-base font-bold text-white tracking-tight mb-2">Quick Actions</h3>

          <button
            onClick={() => navigate('/agents/create')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Create Voice Agent
                </div>
                <div className="text-[10px] text-zinc-400">Configure prompt, voice & personality</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/campaigns/create')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">
                  New Call Campaign
                </div>
                <div className="text-[10px] text-zinc-400">Launch batch outbound calling</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/contacts')}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-[#080b11] border border-zinc-800/80 hover:border-zinc-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Upload className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Import Contacts
                </div>
                <div className="text-[10px] text-zinc-400">Upload CSV or sync CRM leads</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};
