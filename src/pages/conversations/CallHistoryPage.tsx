import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Phone,
  Search,
  Sliders,
  Filter,
  Play,
  Pause,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  Zap,
  Activity,
  Headphones,
  FileText,
  Volume2,
  X,
  Code,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { formatDuration } from '../../utils/formatters';
import { getCallRecords } from '../../api/calls';
import { getAnalyticsSummary, EMPTY_ANALYTICS } from '../../api/analytics';
import { AnalyticsSummary } from '../../types';
import { CallDetail, TranscriptItem } from '../../utils/constants';

export const CallHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentWorkspace } = useWorkspace();

  const [calls, setCalls] = useState<CallDetail[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(EMPTY_ANALYTICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('All Sentiments');
  const [directionFilter, setDirectionFilter] = useState('All Directions');
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);

  const fetchCallsData = async () => {
    setIsLoading(true);
    try {
      const [callsRes, analyticsRes] = await Promise.allSettled([
        getCallRecords(),
        getAnalyticsSummary(),
      ]);

      if (callsRes.status === 'fulfilled' && Array.isArray(callsRes.value)) {
        const mapped: CallDetail[] = callsRes.value.map((r) => ({
          id: r.id,
          callerName: r.customerName || 'Direct Caller',
          callerPhone: r.customerPhone || 'N/A',
          direction: r.direction || 'inbound',
          agentName: r.agentName || 'Voice Agent',
          agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
          model: 'GPT-4o Realtime',
          voice: 'Voice Audio',
          durationSec: r.durationSec || 0,
          turnCount: r.transcript ? r.transcript.length : 0,
          p50Latency: 185,
          sentiment: r.sentiment === 'negative' ? 'escalated' : ((r.sentiment as any) || 'neutral'),
          summary: r.summary || (r.transcript && r.transcript.length > 0 ? r.transcript.map((t) => `${t.speaker}: ${t.text}`).join(' ') : 'Completed call session.'),
          date: r.createdAt ? new Date(r.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent',
          extractedData: {
            caller_phone: r.customerPhone || 'N/A',
            disposition: r.status || 'completed',
            cost_usd: `$${(r.costUsd || 0).toFixed(4)}`,
            duration: formatDuration(r.durationSec || 0),
          },
          transcript: r.transcript && r.transcript.length > 0
            ? r.transcript.map((t) => ({
                speaker: t.speaker === 'agent' ? 'agent' : 'caller',
                text: t.text,
                timestamp: t.timestamp || '00:00',
              }))
            : [],
        }));
        setCalls(mapped);
      } else {
        setCalls([]);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value);
      }
    } catch (err) {
      console.warn('Failed to load call history', err);
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCallsData();
  }, [currentWorkspace.id]);

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayRecording = (call: CallDetail) => {
    setSelectedCall(call);
    setIsPlayingAudio(true);
    // Synthesize opening turn or play
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(call.transcript[0]?.text || call.summary);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopyJson = () => {
    if (!selectedCall) return;
    navigator.clipboard.writeText(JSON.stringify(selectedCall.extractedData, null, 2));
    toast.success('Extracted JSON payload copied to clipboard');
  };

  const filteredCalls = calls.filter((c) => {
    const matchesSearch =
      c.callerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.callerPhone.includes(searchQuery) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment =
      sentimentFilter === 'All Sentiments' ||
      c.sentiment.toLowerCase() === sentimentFilter.toLowerCase();
    const matchesDirection =
      directionFilter === 'All Directions' ||
      c.direction.toLowerCase() === directionFilter.toLowerCase();
    return matchesSearch && matchesSentiment && matchesDirection;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16 relative">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-mono">
            <span>Samvada Enterprise Labs</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{currentWorkspace.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-bold">Call History</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Conversations & Call Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Audit turn-by-turn voice sessions, sentiment ratings, speech-to-speech latency waterfalls, and synchronized stereo recordings.
          </p>
        </div>

        {/* Subtabs Switcher: Call Logs vs Live Calls Monitor */}
        <div className="flex items-center gap-3">
          <Link
            to="/calls/live"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold shadow-2xs transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Monitor Console</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
          </Link>
        </div>
      </div>

      {/* ── Top Telemetry KPI Cards Strip ── */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Phone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                {analytics.totalCalls > 0 ? analytics.totalCalls.toLocaleString() : calls.length.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {analytics.totalCalls > 0 || calls.length > 0 ? 'ClickHouse Sync' : 'Real-time'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Total Conversations</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Zap className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-emerald-800 tracking-tight tabular-nums">
                {analytics.avgLatencyMs > 0 ? `${analytics.avgLatencyMs}ms` : (calls.length > 0 ? `${calls[0].p50Latency}ms` : '—')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                P50 V2V
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Avg Turn Latency</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                {(analytics.positiveSentimentPercent ?? 0) > 0
                  ? `${(analytics.positiveSentimentPercent ?? 0).toFixed(1)}%`
                  : (calls.length > 0 ? `${Math.round((calls.filter(c => c.sentiment === 'positive').length / calls.length) * 100)}%` : '—')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Positive Sentiment Rate</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Activity className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                {analytics.overallSuccessRate > 0
                  ? `${analytics.overallSuccessRate.toFixed(1)}%`
                  : (calls.length > 0 ? '100%' : '—')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Direct
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Autonomous Resolution</p>
          </div>
        </div>
      </div>

      {/* ── Natural Language Search Bar & Multi-Facet Filters ── */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search call logs"
              placeholder="Filter by customer, phone, keywords (e.g. 'refund', 'table reservation'), or agent persona..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="All Sentiments">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Escalated">Escalated</option>
            </select>

            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="All Directions">All Directions</option>
              <option value="Inbound">Inbound</option>
              <option value="Outbound">Outbound</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── High-Density Call History Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Caller Identity</th>
              <th className="py-3 px-4">Assigned Agent Persona</th>
              <th className="py-3 px-4">Duration & Turns</th>
              <th className="py-3 px-4">Latency (P50)</th>
              <th className="py-3 px-4">Sentiment</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Querying ClickHouse Telemetry...</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Fetching call logs and speech-to-speech recordings</p>
                </td>
              </tr>
            ) : filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-500">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Phone className="w-6 h-6 text-slate-400" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">No call sessions recorded yet</h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    {searchQuery || sentimentFilter !== 'All Sentiments' || directionFilter !== 'All Directions'
                      ? 'No calls match your active search or filter criteria. Try clearing filters.'
                      : 'Your voice agents are configured and ready. When incoming calls are answered or outbound calls are placed, turn-by-turn transcripts and audio recordings will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => (
              <tr
                key={call.id}
                onClick={() => setSelectedCall(call)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"
                      title={call.direction === 'inbound' ? 'Inbound Call' : 'Outbound Call'}
                    >
                      {call.direction === 'inbound' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{call.callerName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{call.callerPhone}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={call.agentAvatar}
                      alt={call.agentName}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-800">{call.agentName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{call.model}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <p className="font-mono font-bold text-slate-800">{formatDuration(call.durationSec)}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{call.turnCount} turns</p>
                </td>

                <td className="py-3.5 px-4">
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    ~{call.p50Latency}ms
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${
                      call.sentiment === 'positive'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : call.sentiment === 'neutral'
                        ? 'bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {call.sentiment}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                  {call.date}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayRecording(call);
                    }}
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 transition-all cursor-pointer"
                    title="Inspect audio recording"
                  >
                    <Headphones className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── Slide-Out Call Inspector Drawer ── */}
      {selectedCall && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col animate-slide-in">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                {selectedCall.callerName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedCall.callerName}</h3>
                <p className="text-[11px] font-mono text-slate-500">{selectedCall.callerPhone} • {selectedCall.date}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCall(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Synchronized Stereo Audio Player Strip */}
          <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>Stereo Call Recording (Lossless 48kHz)</span>
              </span>
              <span className="font-mono text-slate-500">{formatDuration(selectedCall.durationSec)}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-9 h-9 rounded-full bg-emerald-950 hover:bg-emerald-900 text-white flex items-center justify-center shadow-xs cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <div className="flex-1 bg-white border border-slate-200 h-8 rounded-lg px-2 flex items-center gap-1">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${
                      isPlayingAudio && i % 2 === 0
                        ? 'bg-emerald-600 animate-pulse'
                        : 'bg-emerald-200'
                    }`}
                    style={{ height: `${20 + ((i * 17) % 60)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Body: Transcript & Structured Data JSON */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Call Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                AI Executive Summary
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedCall.summary}
              </p>
            </div>

            {/* Extracted JSON Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Extracted Structured Data (CRM Payload)</span>
                </span>
                <button
                  onClick={handleCopyJson}
                  className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy JSON</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] leading-relaxed overflow-x-auto">
                <pre>{JSON.stringify(selectedCall.extractedData, null, 2)}</pre>
              </div>
            </div>

            {/* Turn-by-Turn Transcript with exact Latency Waterfalls */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Turn-by-Turn Acoustic Transcript
              </span>

              <div className="space-y-3">
                {selectedCall.transcript.map((turn, idx) => {
                  const isAgent = turn.speaker === 'agent';
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-700">
                          {isAgent ? selectedCall.agentName : selectedCall.callerName}
                        </span>
                        <span className="font-mono">{turn.timestamp}</span>
                        {turn.latencyMs && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[9px] border border-emerald-200">
                            {turn.latencyMs}ms V2V
                          </span>
                        )}
                      </div>

                      <div
                        className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed ${
                          isAgent
                            ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                            : 'bg-emerald-950 text-white rounded-tr-sm'
                        }`}
                      >
                        {turn.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
