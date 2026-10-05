// =============================================================================
// Samvada Platform — Workspace Audit Logs Page (Phase 6.4)
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  User,
  Shield,
  Clock,
  Terminal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code
} from 'lucide-react';
import { getAuditLogs, AuditLogEntry } from '../../api/settings';
import { useToast } from '../../contexts/ToastContext';
import { SettingsNav } from '../../components/layout/SettingsNav';

export const AuditLogsPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const fetchLogs = async () => {
    setLoading(true);
    const data = await getAuditLogs(pageSize, currentPage * pageSize);
    setLogs(data.logs || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = selectedAction === 'all' || log.action.toLowerCase().includes(selectedAction.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('delete') || action.includes('revoke') || action.includes('destroy')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (action.includes('publish') || action.includes('create') || action.includes('provision')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (action.includes('update') || action.includes('modify') || action.includes('rollback')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  };

  const exportCSV = () => {
    if (logs.length === 0) {
      toast.info('No audit records to export');
      return;
    }
    const headers = ['ID', 'Timestamp', 'User ID', 'Action', 'Resource Type', 'Resource ID', 'IP Address'];
    const rows = logs.map((l) => [
      l.id,
      l.created_at,
      l.user_id,
      l.action,
      l.resource_type,
      l.resource_id,
      l.ip_address
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `samvada_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit logs CSV exported successfully');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      <SettingsNav
        title="Audit Logs"
        subtitle="Immutable tamper-evident record of administrative mutations, configuration updates, and security events."
      />

      {/* Audit Log Card */}
      <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Administrative Audit Log
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Immutable tamper-evident record of administrative mutations, configuration updates, and key lifecycle events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Export CSV
            </button>
            <button
              onClick={fetchLogs}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, action, IP, resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121624] border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-[#121624] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all">All Event Types</option>
              <option value="agent">Agent Actions</option>
              <option value="apikey">API Key Actions</option>
              <option value="webhook">Webhook Actions</option>
              <option value="member">Team & Member</option>
              <option value="billing">Billing & Subscriptions</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-[#090d16]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 border-b border-zinc-800 font-medium">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading audit records...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-500">
                      No matching audit records recorded for this workspace.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-200">{log.resource_type}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{log.resource_id || '—'}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <User className="w-3 h-3 text-zinc-500" />
                          <span className="font-mono text-[11px]">{log.user_id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-zinc-400 font-mono text-[11px]">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800/80 bg-zinc-900/40 text-xs text-zinc-400">
            <div>
              Showing {filteredLogs.length} of {total} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-zinc-300 font-medium">Page {currentPage + 1}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={(currentPage + 1) * pageSize >= total}
                className="p-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1320] border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Audit Log Payload Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white text-xs font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-zinc-500">Event ID:</span>
                <span className="col-span-2 font-mono text-zinc-200">{selectedLog.id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-zinc-500">Action:</span>
                <span className="col-span-2 font-mono text-indigo-400">{selectedLog.action}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-zinc-500">Actor User:</span>
                <span className="col-span-2 font-mono text-zinc-200">{selectedLog.user_id}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                <span className="text-zinc-500">IP & Device:</span>
                <span className="col-span-2 text-zinc-200">
                  {selectedLog.ip_address} — <span className="text-[10px] text-zinc-400">{selectedLog.user_agent || 'Standard REST Client'}</span>
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-400 mb-1 font-medium">Recorded Payload Metadata:</div>
              <pre className="bg-[#070a12] p-3 rounded-xl border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(selectedLog.details || '{}'), null, 2);
                  } catch {
                    return selectedLog.details || '{}';
                  }
                })()}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
