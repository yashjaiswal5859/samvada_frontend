import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Download,
  Phone,
  Bot,
  Clock,
  Volume2,
  Maximize2,
  Search,
  Smile,
  Frown,
  Meh,
  Copy,
  ChevronDown,
  Play,
  Pause,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getCallRecordById } from '../../api/calls';
import { CallRecord } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';

export const CallDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();

  const [callRecord, setCallRecord] = useState<CallRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'analysis'>('transcript');
  const [searchTranscript, setSearchTranscript] = useState('');

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getCallRecordById(id)
      .then((record) => {
        setCallRecord(record || null);
      })
      .catch((err) => {
        console.error('Error fetching call record:', err);
        setCallRecord(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Loading call details and transcript...</p>
      </div>
    );
  }

  if (!callRecord) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <Link
            to="/calls"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Call History
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Call Details</h1>
        </div>

        <div className="py-16 px-4 text-center space-y-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Call Record Not Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
              The requested call record ({id}) could not be located in this workspace. It may have expired or was removed.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/calls"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all"
            >
              Back to History
            </Link>
            <Link
              to="/calls/live"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
            >
              Live Call Console
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTranscript = (callRecord.transcript || []).filter((line) =>
    line.text.toLowerCase().includes(searchTranscript.toLowerCase())
  );

  const sentimentIcon =
    callRecord.sentiment === 'positive' ? (
      <Smile className="w-4 h-4 text-emerald-400" />
    ) : callRecord.sentiment === 'negative' ? (
      <Frown className="w-4 h-4 text-rose-400" />
    ) : (
      <Meh className="w-4 h-4 text-zinc-400" />
    );

  const sentimentBadgeColor =
    callRecord.sentiment === 'positive'
      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
      : callRecord.sentiment === 'negative'
      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
      : 'bg-zinc-800 border-zinc-700 text-zinc-300';

  const customerInitials = (callRecord.customerName || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header */}
      <div>
        <Link
          to="/calls"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Calls
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Call Details</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 capitalize ${
                  callRecord.status === 'completed'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                    : callRecord.status === 'in_progress'
                    ? 'bg-blue-500/15 border border-blue-500/30 text-blue-400'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    callRecord.status === 'completed'
                      ? 'bg-emerald-400'
                      : callRecord.status === 'in_progress'
                      ? 'bg-blue-400 animate-pulse'
                      : 'bg-rose-400'
                  }`}
                />
                {callRecord.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {formatDate(callRecord.createdAt)} • {formatDuration(callRecord.durationSec)} • {callRecord.agentName}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
            >
              <span>View in Analytics</span>
            </button>
            <button
              onClick={() => toast.info('Exporting transcript and metadata...')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={() => copyToClipboard(window.location.href, 'Call URL')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Metadata Strip */}
      <div className="p-4 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
            {customerInitials}
          </div>
          <div>
            <h4 className="font-semibold text-white truncate max-w-[120px]">{callRecord.customerName}</h4>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <span>{callRecord.customerPhone}</span>
              <Copy
                onClick={() => copyToClipboard(callRecord.customerPhone, 'Customer Phone')}
                className="w-2.5 h-2.5 text-zinc-500 hover:text-white cursor-pointer"
              />
            </p>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500">Call Type</span>
          <p className="font-semibold text-white flex items-center gap-1 mt-0.5 capitalize">
            <Phone className="w-3 h-3 text-blue-400" /> {callRecord.direction}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500">Agent</span>
          <p className="font-semibold text-white flex items-center gap-1 mt-0.5 truncate">
            <Bot className="w-3 h-3 text-blue-400 shrink-0" /> {callRecord.agentName}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500">Duration</span>
          <p className="font-semibold text-white flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3 text-zinc-400" /> {formatDuration(callRecord.durationSec)}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500">Sentiment</span>
          <p className="font-semibold text-white flex items-center gap-1 mt-0.5 capitalize">
            {sentimentIcon} {callRecord.sentiment}
          </p>
        </div>

        <div>
          <span className="text-[10px] text-zinc-500">Cost</span>
          <p className="font-semibold text-white mt-0.5 font-mono">
            ${callRecord.costUsd.toFixed(4)}
          </p>
        </div>
      </div>

      {/* 2-Column Split: Player & Transcript vs Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Transcript */}
        <div className="lg:col-span-8 space-y-5">
          {/* Call Recording Player */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Call Recording</h3>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300">
                <span>1x</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </div>
            </div>

            {callRecord.recordingUrl ? (
              <div className="pt-2">
                <audio controls className="w-full h-10 rounded-lg" src={callRecord.recordingUrl}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                {/* Waveform Scrubber */}
                <div className="flex items-center gap-0.5 flex-1 h-12">
                  {[
                    8, 14, 20, 26, 18, 32, 22, 12, 18, 28, 36, 24, 16, 30, 20, 14, 22, 34, 26, 18,
                    10, 16, 28, 32, 24, 18, 30, 22, 14, 26, 34, 20, 12, 18, 28, 22, 16, 30, 24, 18,
                    10, 14, 22, 30, 26, 18, 24, 32, 20, 14, 22, 28, 16, 12, 18, 24, 16, 10, 8, 6,
                  ].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className={`w-1 rounded-full transition-colors ${
                        i < 18 ? 'bg-blue-500' : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3 text-zinc-400 shrink-0">
                  <span className="text-xs font-mono">{formatDuration(callRecord.durationSec)}</span>
                  <Volume2 className="w-4 h-4 cursor-pointer hover:text-white" />
                  <Maximize2 className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Transcript Section */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'transcript' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Transcript ({callRecord.transcript?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'analysis' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Conversation Analysis
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTranscript}
                  onChange={(e) => setSearchTranscript(e.target.value)}
                  placeholder="Search in transcript..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Conversation turns */}
            {filteredTranscript.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  {callRecord.transcript?.length === 0
                    ? 'No transcript recorded for this conversation.'
                    : `No matches found for "${searchTranscript}".`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTranscript.map((line, idx) => {
                  const isBot = line.speaker === 'agent';
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[11px] font-mono text-zinc-500 w-12 shrink-0 pt-0.5">
                        {line.timestamp || '00:00'}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isBot
                            ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isBot ? '🤖' : customerInitials}
                      </div>

                      <div className="space-y-1 flex-1">
                        <span className="text-xs font-semibold text-white">
                          {isBot ? callRecord.agentName : callRecord.customerName}
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{line.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Outcomes & Insights */}
        <div className="lg:col-span-4 space-y-4">
          {/* Outcome Card */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Call Disposition</span>
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize flex items-center gap-1 ${sentimentBadgeColor}`}>
                {sentimentIcon}
                {callRecord.status}
              </span>
            </div>
            <p className="text-xs text-zinc-300">
              {callRecord.status === 'completed'
                ? 'Call was connected and successfully completed.'
                : `Call finished with status: ${callRecord.status}.`}
            </p>
          </div>

          {/* Sentiment Analysis Card */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">Sentiment Rating</h4>
              {sentimentIcon}
            </div>

            <div className="flex items-center gap-2 font-semibold text-xs capitalize text-white">
              {sentimentIcon}
              <span>{callRecord.sentiment}</span>
            </div>

            {callRecord.evaluationScore !== undefined && (
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>AI Quality Score</span>
                  <span className="text-white font-mono">{callRecord.evaluationScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, callRecord.evaluationScore))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Call Summary Card */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-2">
            <h4 className="text-xs font-semibold text-white">AI Summary</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {callRecord.summary || 'Summary is being generated or was not captured for this call session.'}
            </p>
          </div>

          {/* Call Metadata */}
          <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-2.5 text-xs">
            <h4 className="text-xs font-semibold text-white">Call Metadata</h4>
            <div className="space-y-1.5 text-zinc-400 text-[11px]">
              <div className="flex justify-between items-center">
                <span>Call ID</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-zinc-200 truncate max-w-[120px]">{callRecord.id}</span>
                  <Copy
                    onClick={() => copyToClipboard(callRecord.id, 'Call ID')}
                    className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <span>Started At</span>
                <span className="text-zinc-200">{formatDate(callRecord.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="text-zinc-200">{formatDuration(callRecord.durationSec)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost</span>
                <span className="text-zinc-200 font-mono">${callRecord.costUsd.toFixed(4)} USD</span>
              </div>
              {callRecord.recordingUrl && (
                <div className="flex justify-between items-center pt-1 border-t border-zinc-800">
                  <span>Recording URL</span>
                  <div
                    onClick={() => copyToClipboard(callRecord.recordingUrl || '', 'Recording URL')}
                    className="flex items-center gap-1 text-blue-400 hover:underline cursor-pointer"
                  >
                    <span className="truncate max-w-[140px] font-mono">{callRecord.recordingUrl}</span>
                    <Copy className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
