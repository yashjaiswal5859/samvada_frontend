import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { getCallRecords } from '../../api/calls';
import { CallRecord } from '../../types';
import { formatDuration, formatDate } from '../../utils/formatters';
import { Search, Phone, MessageSquare, ChevronRight } from 'lucide-react';
import { CallsNav } from '../../components/layout/CallsNav';

export const CallHistoryPage: React.FC = () => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCallRecords().then(setCalls);
  }, []);

  const filteredCalls = calls.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerPhone.includes(searchQuery) ||
      c.agentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <CallsNav
        title="Call History & Transcripts"
        subtitle="Audit past voice conversations, AI sentiment ratings, and recordings."
      />

      <Card className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by customer, phone, or agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {calls.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
              <Phone className="w-6 h-6 text-zinc-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Call Records Found</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                Calls placed by your AI agents or inbound test calls will appear here in real time with recordings and transcripts.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/calls/live"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
              >
                <span>Open Live Call Console</span>
              </Link>
            </div>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No calls match your search query "{searchQuery}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Agent</th>
                  <th className="py-3 px-2">Direction</th>
                  <th className="py-3 px-2">Duration</th>
                  <th className="py-3 px-2">Sentiment</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-2">
                      <p className="font-bold text-white">{call.customerName}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">{call.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-2 font-medium text-zinc-300">{call.agentName}</td>
                    <td className="py-3.5 px-2">
                      <Badge variant={call.direction === 'inbound' ? 'info' : 'indigo'} size="sm">
                        {call.direction}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2 font-mono text-zinc-300">{formatDuration(call.durationSec)}</td>
                    <td className="py-3.5 px-2">
                      <Badge variant={call.sentiment === 'positive' ? 'success' : 'neutral'} size="sm">
                        {call.sentiment}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-2 text-zinc-400">{formatDate(call.createdAt)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        to={`/calls/${call.id}`}
                        className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Transcript
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
