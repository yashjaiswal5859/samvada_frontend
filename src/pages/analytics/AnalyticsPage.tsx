import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Plus,
  MoreVertical,
  Filter,
  Clock,
  Phone,
  Users,
  Bot,
  Sparkles,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Shield,
  Activity,
  Flame,
  ChevronDown,
  Layers,
  Search,
  DollarSign,
  PhoneCall,
  Volume2,
  Zap,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import {
  AgentPerformance,
  AGENT_LEADERBOARD,
  TOPIC_INTENTS,
  DAILY_TREND_DATA,
  HOURLY_HEATMAP,
} from '../../utils/constants';

export const AnalyticsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { organizationName } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'overview' | 'volume' | 'leaderboard' | 'intents'>('overview');
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [selectedAgent, setSelectedAgent] = useState('All Agents');
  const [trendViewMode, setTrendViewMode] = useState<'area' | 'heatmap'>('area');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddWidgetModal, setShowAddWidgetModal] = useState(false);

  // New widget draft state
  const [widgetType, setWidgetType] = useState('kpi');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetMetric, setWidgetMetric] = useState('sentiment');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Analytics telemetry refreshed from live telephony cluster.');
    }, 600);
  };

  const handleExport = (format: 'CSV' | 'PDF') => {
    toast.success(`Executive Voice BI report (${format}) generated successfully. Download started.`);
  };

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetTitle.trim()) {
      toast.error('Please enter a widget title.');
      return;
    }
    setShowAddWidgetModal(false);
    toast.success(`Custom widget "${widgetTitle}" added to dashboard.`);
    setWidgetTitle('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Breadcrumb & Top Mission Control Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>{organizationName}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold">Production Voice AI Hub</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-800 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Executive Analytics BI
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Voice Analytics & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor real-time voice ROI, conversational outcomes, sentiment distribution, and agent performance.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value="Today">Today</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Agent Filter */}
          <div className="relative">
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="appearance-none pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
            >
              <option value="All Agents">All Voice Agents</option>
              <option value="Maya">Maya (Hospitality)</option>
              <option value="David">David (Clinical)</option>
              <option value="Liam">Liam (Enterprise SDR)</option>
              <option value="Elena">Elena (Claims)</option>
              <option value="Marcus">Marcus (Banking)</option>
              <option value="Priya">Priya (Retail)</option>
            </select>
            <Bot className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Export BI Report Button */}
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>

          {/* Add Custom Panel / Widget Button */}
          <button
            onClick={() => setShowAddWidgetModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Widget</span>
          </button>
        </div>
      </div>

      {/* ── Dashboard Sub-Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
            { id: 'volume', label: 'Call Volume & Hourly Heatmap', icon: TrendingUp },
            { id: 'leaderboard', label: 'Agent Performance Leaderboard', icon: Bot },
            { id: 'intents', label: 'Conversational Intents & Sentiment', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'border-l-3 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>SLA Benchmark: 99.98%</span>
        </div>
      </div>

      {/* ── Top 5 Executive Metric KPI Strip ── */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Total Volume */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Volume</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              +18.4%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">24,520</span>
            <span className="text-xs text-slate-500 font-medium">calls</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>81,400 Total Minutes</span>
            <span className="font-mono text-emerald-800 font-semibold">99.9% Routed</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-b-xl opacity-90" />
        </div>

        {/* Metric 2: Answer & Connect Rate */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Connect Rate</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Optimal
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">94.8%</span>
            <span className="text-xs text-emerald-700 font-medium">answered</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Industry Avg: 82%</span>
            <span className="text-slate-700 font-semibold">+12.8% vs bench</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-xl opacity-90" />
        </div>

        {/* Metric 3: First-Call Resolution */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">First-Call Resolution</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <Sparkles className="w-3 h-3" />
              AI Solved
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">89.2%</span>
            <span className="text-xs text-slate-500 font-medium">resolved</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>10.8% Warm Transfers</span>
            <span className="font-mono text-emerald-800 font-semibold">Zero Dropped</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-600 rounded-b-xl opacity-90" />
        </div>

        {/* Metric 4: Average Handle Time */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Avg Handle Time</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              <Clock className="w-3 h-3 text-slate-500" />
              Paced
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">3m 18s</span>
            <span className="text-xs text-slate-500 font-medium">mean</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>P50: 2m 45s</span>
            <span className="text-slate-700 font-semibold">P90: 5m 10s</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-700 rounded-b-xl opacity-90" />
        </div>

        {/* Metric 5: Voice ROI & Cost Savings */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Cost Efficiency</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <DollarSign className="w-3 h-3" />
              ROI
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tabular-nums">$0.126</span>
            <span className="text-xs text-emerald-700 font-medium">/ call</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>$3.80 vs Human CSR</span>
            <span className="font-semibold text-emerald-800">$93.1k saved</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-950 rounded-b-xl opacity-90" />
        </div>
      </div>

      {/* ── Main Dynamic Panels Grid ── */}
      {(activeTab === 'overview' || activeTab === 'volume') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Chart: Call Volume & Hourly Heatmap */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Conversational Volume & Concurrency Trends</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Live Cluster
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate SIP inbound/outbound calls, AI resolutions, and human warm escalations.
                </p>
              </div>

              {/* View Switcher & Actions */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    onClick={() => setTrendViewMode('area')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      trendViewMode === 'area'
                        ? 'bg-white text-emerald-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Area Trend
                  </button>
                  <button
                    onClick={() => setTrendViewMode('heatmap')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      trendViewMode === 'heatmap'
                        ? 'bg-white text-emerald-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    24h Heatmap
                  </button>
                </div>

                <button
                  onClick={() => toast.success('Panel options opened.')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-all"
                  title="Panel Options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode A: Area/Bar Trend Chart */}
            {trendViewMode === 'area' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600" />
                      <span className="font-semibold text-slate-700">Completed by Voice AI (92%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-400" />
                      <span className="font-semibold text-slate-700">Warm Escalated (8%)</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">Peak: 4,690 calls / day</span>
                </div>

                {/* SVG Visual Bars */}
                <div className="h-56 w-full pt-4 relative flex items-end gap-3 px-2 border-b border-slate-100">
                  {DAILY_TREND_DATA.map((item, idx) => {
                    const max = 5000;
                    const completedHeight = (item.completed / max) * 100;
                    const escalatedHeight = (item.escalated / max) * 100;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg py-1 px-2.5 shadow-lg pointer-events-none whitespace-nowrap z-20">
                          <p className="font-bold">{item.date}: {item.calls.toLocaleString()} Total</p>
                          <p className="text-emerald-300">AI: {item.completed.toLocaleString()} ({Math.round((item.completed/item.calls)*100)}%)</p>
                          <p className="text-amber-300">Escalated: {item.escalated}</p>
                        </div>

                        {/* Stacked Bars */}
                        <div className="w-full flex flex-col justify-end h-44 rounded-t-lg overflow-hidden bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <div
                            className="w-full bg-amber-400 transition-all duration-300"
                            style={{ height: `${escalatedHeight}%` }}
                          />
                          <div
                            className="w-full bg-emerald-600 transition-all duration-300 group-hover:bg-emerald-700"
                            style={{ height: `${completedHeight}%` }}
                          />
                        </div>

                        {/* Date Label */}
                        <span className="text-[11px] font-semibold text-slate-600 group-hover:text-emerald-950">
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mode B: 24h Hourly Heatmap */}
            {trendViewMode === 'heatmap' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Call density across 24-hour cycle (Eastern Time)</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px]">Low</span>
                    <span className="w-3 h-3 rounded bg-emerald-100" />
                    <span className="w-3 h-3 rounded bg-emerald-300" />
                    <span className="w-3 h-3 rounded bg-emerald-500" />
                    <span className="w-3 h-3 rounded bg-emerald-700" />
                    <span className="w-3 h-3 rounded bg-emerald-950" />
                    <span className="text-[10px]">Peak</span>
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
                  {HOURLY_HEATMAP.map((item, i) => {
                    const bgClass =
                      item.load > 85
                        ? 'bg-emerald-950 text-white font-bold'
                        : item.load > 65
                        ? 'bg-emerald-700 text-white font-semibold'
                        : item.load > 40
                        ? 'bg-emerald-400 text-emerald-950'
                        : item.load > 20
                        ? 'bg-emerald-200 text-slate-800'
                        : 'bg-emerald-50 text-slate-500';

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-2xs ${bgClass}`}
                        title={`${item.hour}: ${item.load}% capacity`}
                      >
                        <span className="text-[10px] font-mono">{item.hour}</span>
                        <span className="text-xs font-bold mt-1">{item.load}%</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-500 italic text-center pt-1">
                  Peak calling load occurs between 10:00 AM and 16:00 PM EST with 98% concurrency utilization.
                </p>
              </div>
            )}
          </div>

          {/* Sentiment & Resolution Donut / Breakdown */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">Sentiment & Intent Outcomes</h2>
                </div>
                <button
                  onClick={() => toast.success('Sentiment settings.')}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Sentiment Distribution Bars */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Positive / Delight
                  </span>
                  <span className="font-bold text-slate-900 font-mono">68.4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68.4%' }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Neutral / Inquisitive
                  </span>
                  <span className="font-bold text-slate-900 font-mono">23.6%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '23.6%' }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Frustrated / Escalated
                  </span>
                  <span className="font-bold text-slate-900 font-mono">8.0%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '8.0%' }} />
                </div>
              </div>

              {/* Call Resolution Channels */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                <h3 className="text-xs font-semibold text-slate-600">Call resolution pipeline</h3>
                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="font-semibold text-emerald-950">AI Autonomous Resolution</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-900">82.4%</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-semibold text-slate-800">Warm Human Hand-off</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">13.6%</span>
                </div>

                <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-600">Caller Disconnected</span>
                  </div>
                  <span className="font-bold font-mono text-slate-700">4.0%</span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
              <span>Sentiment Accuracy: 97.4%</span>
              <span className="text-emerald-700 font-semibold">SOC-2 Audited</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel: Agent Performance Leaderboard ── */}
      {(activeTab === 'overview' || activeTab === 'leaderboard') && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Voice Agent Performance Leaderboard</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  6 Production Agents
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Benchmark resolution rate, handle time, CSAT score, and turn latency across individual voice agents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/agents')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
              >
                <span>Manage Agents</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Agent & Persona</th>
                  <th className="py-2.5 px-3">Model & Voice</th>
                  <th className="py-2.5 px-3 text-right">Total Calls</th>
                  <th className="py-2.5 px-3 text-right">Avg Handle Time</th>
                  <th className="py-2.5 px-3 text-right">CSAT Rating</th>
                  <th className="py-2.5 px-3 text-right">Resolution Rate</th>
                  <th className="py-2.5 px-3 text-right">P50 Latency</th>
                  <th className="py-2.5 px-3 text-right">Cost / Call</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {AGENT_LEADERBOARD.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        agent.rank === 1
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : agent.rank === 2
                          ? 'bg-slate-100 text-slate-800 border border-slate-300'
                          : agent.rank === 3
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'text-slate-500'
                      }`}>
                        {agent.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={agent.avatar}
                          alt={agent.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-emerald-950 block">
                            {agent.name}
                          </span>
                          <span className="text-[11px] text-slate-500">{agent.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-[11px]">
                        <span className="font-semibold text-slate-800 block">{agent.model}</span>
                        <span className="text-slate-500">{agent.voice}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                      {agent.totalCalls.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {agent.avgDuration}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-bold font-mono text-[11px]">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        {agent.csat.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {agent.resolutionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 font-semibold">
                      {agent.p50Latency}ms
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600 font-medium">
                      {agent.costPerCall}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => navigate(`/agents/${agent.id}`)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-all"
                      >
                        Studio
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Panel: Top Conversational Intents & Resolution Matrix ── */}
      {(activeTab === 'overview' || activeTab === 'intents') && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Top Caller Intents & Resolution Breakdown</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AI Intent Extraction
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically categorized customer intents across all conversations with resolution efficiency.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">100% of calls analyzed</span>
          </div>

          <div className="space-y-3.5">
            {TOPIC_INTENTS.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{item.intent}</span>
                      <span className="text-[11px] text-slate-500">
                        Avg duration: <span className="font-mono text-slate-700 font-semibold">{item.avgTime}</span> • Trend: <span className="text-emerald-700 font-semibold">{item.trend}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Volume Share</span>
                      <span className="font-bold font-mono text-slate-900">{item.volumePct}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resolution</span>
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.resolutionPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${item.resolutionPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Custom Widget Modal ── */}
      {showAddWidgetModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Custom Analytics Widget</h3>
                  <p className="text-xs text-slate-500">Pin a new telemetry widget to your executive dashboard.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddWidgetModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddWidget} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Widget Title</label>
                <input
                  type="text"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  placeholder="e.g. Inbound SIP Trunk Latency (Twilio)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Widget Visualization Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kpi', label: 'Metric Card', desc: 'Single KPI figure' },
                    { id: 'trend', label: 'Time Trend', desc: 'Area / line graph' },
                    { id: 'distribution', label: 'Distribution', desc: 'Donut breakdown' },
                  ].map((type) => (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setWidgetType(type.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        widgetType === type.id
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs block">{type.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Telemetry Data Metric</label>
                <select
                  value={widgetMetric}
                  onChange={(e) => setWidgetMetric(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="sentiment">Customer Sentiment Net Score</option>
                  <option value="concurrency">SIP Trunk Concurrency Load</option>
                  <option value="bargein">Barge-in / User Interruption Rate</option>
                  <option value="token_usage">LLM Token Consumption ($/hr)</option>
                  <option value="stt_accuracy">STT Word Error Rate (WER)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddWidgetModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Save & Pin Widget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
