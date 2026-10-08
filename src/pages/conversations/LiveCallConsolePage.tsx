import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  Users,
  Clock,
  BarChart3,
  Search,
  ChevronDown,
  Filter,
  PhoneOff,
  Pause,
  ArrowRightLeft,
  MoreHorizontal,
  Maximize2,
  Send,
  Volume2,
  Mic,
  Activity,
  History,
  Loader2,
  Sparkles
} from 'lucide-react';

import { useWorkspace } from '../../contexts/WorkspaceContext';
import { getCallRecords } from '../../api/calls';
import { getAnalyticsSummary } from '../../api/analytics';
import { CallRecord, AnalyticsSummary } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';
import { CallsNav } from '../../components/layout/CallsNav';

interface LiveCallItem {
  id: string;
  workspaceId: string;
  phone: string;
  contactName: string;
  contactInitial: string;
  agent: string;
  campaign: string;
  status: 'live' | 'on_hold' | 'completed' | 'failed';
  duration: string;
  startedAt: string;
  sentiment?: string;
  summary?: string;
  transcript?: any[];
}

export const LiveCallConsolePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace, organizationName } = useWorkspace();

  const [calls, setCalls] = useState<LiveCallItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'info' | 'customer' | 'notes'>('transcript');
  const [internalNote, setInternalNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      getCallRecords({ limit: 50 }),
      getAnalyticsSummary(),
    ])
      .then(([rawCalls, analyticsRes]) => {
        if (!isMounted) return;
        setAnalytics(analyticsRes);

        if (Array.isArray(rawCalls)) {
          const mapped: LiveCallItem[] = rawCalls.map((c: CallRecord) => ({
            id: c.id,
            workspaceId: c.workspaceId || currentWorkspace.id,
            phone: c.customerPhone,
            contactName: c.customerName,
            contactInitial: (c.customerName || 'C').charAt(0).toUpperCase(),
            agent: c.agentName,
            campaign: c.summary || 'Direct Voice Agent Call',
            status: c.status === 'in_progress' ? 'live' : c.status === 'completed' ? 'completed' : 'live',
            duration: formatDuration(c.durationSec),
            startedAt: formatDate(c.createdAt),
            sentiment: c.sentiment,
            summary: c.summary,
            transcript: c.transcript,
          }));

          setCalls(mapped);
          if (mapped.length > 0) {
            setSelectedCallId(mapped[0].id);
          } else {
            setSelectedCallId('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load live call telemetry:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentWorkspace.id]);

  const filteredCalls = calls.filter((c) => {
    return (
      c.phone.includes(searchQuery) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.campaign.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const selectedCall = calls.find((c) => c.id === selectedCallId) || filteredCalls[0] || null;

  const activeCallsCount = calls.filter((c) => c.status === 'live').length;
  const totalCallsToday = analytics?.totalCalls ?? calls.length;
  const avgDuration = formatDuration(analytics?.avgDurationSec ?? 0);
  const successRate = (analytics?.overallSuccessRate ?? 0).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <CallsNav
        title="Live Calls Monitor"
        subtitle={`Real-time voice stream supervision and caller analytics for ${currentWorkspace.name}.`}
      />

      {/* Sub-bar with workspace tag & actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>Active Workspace:</span>
          <span className="text-blue-400 font-semibold">{currentWorkspace.name}</span>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
            activeCallsCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${activeCallsCount > 0 ? 'bg-emerald-400 animate-ping' : 'bg-zinc-500'}`} />
            {activeCallsCount} Active Stream{activeCallsCount !== 1 ? 's' : ''}
          </span>
        </div>


      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{activeCallsCount}</span>
              {activeCallsCount > 0 && <span className="text-xs font-semibold text-emerald-400">Live Now</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Active Calls</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{totalCallsToday.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Total Calls</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{avgDuration}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Avg. Call Duration</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">{successRate}%</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Overall Conversion</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by phone number, contact, agent..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* 2-Column Main Split: Table + Realtime Monitor Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Column */}
        <div className="lg:col-span-8 bg-[#0c101b]/95 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Activity className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">No active calls in progress</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Active inbound telephony calls and outbound campaign dials will stream telemetry here in real time.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('/calls')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Call History</span>
                </button>
                <button
                  onClick={() => navigate('/calls')}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>View Call History</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                  <tr>
                    <th className="p-3.5 font-semibold text-zinc-300">Phone Number</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Contact</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Agent</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Status</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Duration</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Started At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredCalls.map((c) => {
                    const isSelected = selectedCallId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCallId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-600/10' : 'hover:bg-zinc-850/40'
                        }`}
                      >
                        <td className="p-3.5 font-mono">{c.phone}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold text-blue-300">
                              {c.contactInitial}
                            </div>
                            <span className="font-semibold text-white">{c.contactName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-zinc-300">{c.agent}</td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.status === 'live'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'}`} />
                            {c.status === 'live' ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono">{c.duration}</td>
                        <td className="p-3.5 text-zinc-400">{c.startedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Showing {filteredCalls.length} of {calls.length} call(s)</span>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
          {selectedCall ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCall.contactName}</h3>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedCall.phone}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {selectedCall.status}
                </span>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'transcript' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Live Transcript
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'info' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Call Details
                </button>
              </div>

              {activeTab === 'transcript' && (
                <div className="space-y-3 min-h-[200px] max-h-[350px] overflow-y-auto pr-1 text-xs">
                  {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((t: any, i: number) => (
                      <div key={i} className={`p-2.5 rounded-xl border ${t.speaker === 'agent' ? 'bg-blue-950/30 border-blue-500/20 text-blue-200' : 'bg-zinc-900 border-zinc-800 text-zinc-200'}`}>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                          <span className="font-semibold">{t.speaker === 'agent' ? selectedCall.agent : selectedCall.contactName}</span>
                          <span>{t.timestamp || ''}</span>
                        </div>
                        <p>{t.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-zinc-500 text-xs">
                      <p>Audio stream connected.</p>
                      <p className="text-[10px] text-zinc-600 mt-1">Transcripts stream as speech is recognized.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Agent</span>
                    <span className="font-semibold text-white">{selectedCall.agent}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Duration</span>
                    <span className="font-mono text-white">{selectedCall.duration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Sentiment</span>
                    <span className="text-emerald-400 font-semibold">{selectedCall.sentiment || 'neutral'}</span>
                  </div>
                  {selectedCall.summary && (
                    <div className="pt-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Summary</span>
                      <p className="text-zinc-300 mt-1 leading-relaxed">{selectedCall.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  onClick={() => navigate(`/calls/${selectedCall.id}`)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
                >
                  <span>Open Full Call Audit</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Call Selected</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Select an active voice conversation from the table to inspect real-time speech and telephony metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
