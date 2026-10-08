import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Phone,
  Plus,
  Radio,
  Search,
  Bot,
  Copy,
  Trash2,
  Settings2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Filter
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Modal } from '../../components/ui/Modal';
import {
  getPhoneNumbers,
  getAvailablePhoneNumbers,
  allocateNumberFromDatabase,
  releasePhoneNumber,
  assignAgentToNumber,
  unassignAgentFromNumber,
  PhoneNumberRecord,
} from '../../api/telephony';
import { getAgents } from '../../api/agents';
import { Agent } from '../../types';

export const PhoneNumbersPage: React.FC = () => {
  const toast = useToast();
  const { currentWorkspace } = useWorkspace();

  const [numbers, setNumbers] = useState<PhoneNumberRecord[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Available numbers in DB (for allocation modal)
  const [availableDbNumbers, setAvailableDbNumbers] = useState<PhoneNumberRecord[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [selectedDbNumberId, setSelectedDbNumberId] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [availableCountryFilter, setAvailableCountryFilter] = useState<string>('ALL');
  const [availableSearchTerm, setAvailableSearchTerm] = useState<string>('');

  // Modals
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumberRecord | null>(null);
  const [configAgentId, setConfigAgentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search timer
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load agents for assignment dropdowns
  const fetchAgents = useCallback(async () => {
    try {
      const agentList = await getAgents();
      setAgents(agentList || []);
      if (agentList?.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentList[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch agents for telephony assignment:', err);
    }
  }, [selectedAgentId]);

  // Load allocated phone numbers from ABS (PostgreSQL)
  const fetchNumbers = useCallback(
    async (query?: string, showSearchLoader = false) => {
      if (showSearchLoader) {
        setIsSearching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getPhoneNumbers(query);
        setNumbers(data);
      } catch (err: any) {
        console.error('Failed to fetch phone numbers from ABS:', err);
        setError(err.message || 'Failed to fetch allocated numbers from ABS');
      } finally {
        setIsLoading(false);
        setIsSearching(false);
      }
    },
    []
  );

  // Load available unassigned numbers from database pool
  const fetchAvailableNumbers = useCallback(async () => {
    setIsLoadingAvailable(true);
    try {
      const available = await getAvailablePhoneNumbers();
      setAvailableDbNumbers(available);
      if (available.length > 0) {
        setSelectedDbNumberId(available[0].id);
      }
    } catch (err) {
      console.warn('Failed to load available database numbers:', err);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchNumbers();
    fetchAgents();
  }, [fetchNumbers, fetchAgents, currentWorkspace.id]);

  // When opening allocate modal, refresh available numbers from DB
  const handleOpenAllocateModal = () => {
    setIsAllocateModalOpen(true);
    fetchAvailableNumbers();
  };

  // Handle Search Input with debounce to query PostgreSQL via ABS API
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchNumbers(val, true);
    }, 350);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchNumbers('', true);
  };

  // Allocate selected number from our DB data
  const handleAllocateFromDb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDbNumberId) {
      toast.error('Please select an available phone number from our database.');
      return;
    }

    setIsSubmitting(true);
    try {
      const allocated = await allocateNumberFromDatabase({
        phoneNumberId: selectedDbNumberId,
        assignedAgentId: selectedAgentId || undefined,
      });

      const agentName = agents.find((a) => a.id === selectedAgentId)?.name || 'Reserve Pool';
      toast.success(`DID Number ${allocated.phoneNumber} allocated from database and assigned to ${agentName}!`);
      setIsAllocateModalOpen(false);
      setSelectedDbNumberId('');
      fetchNumbers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Failed to allocate phone number from database');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Configure Modal
  const handleOpenConfig = (num: PhoneNumberRecord) => {
    setSelectedNumber(num);
    setConfigAgentId(num.assignedAgentId || '');
    setIsConfigModalOpen(true);
  };

  // Save updated routing/agent binding
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNumber) return;
    setIsSubmitting(true);

    try {
      if (configAgentId) {
        await assignAgentToNumber(selectedNumber.id, configAgentId);
        const agentName = agents.find((a) => a.id === configAgentId)?.name || 'Agent';
        toast.success(`DID ${selectedNumber.phoneNumber} routed to ${agentName}!`);
      } else {
        await unassignAgentFromNumber(selectedNumber.id);
        toast.success(`DID ${selectedNumber.phoneNumber} unassigned and placed into reserve pool.`);
      }
      setIsConfigModalOpen(false);
      fetchNumbers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update route');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Release/Delete phone number
  const handleRelease = async (num: PhoneNumberRecord) => {
    if (!window.confirm(`Are you sure you want to release ${num.phoneNumber}? This will return it to the database pool.`)) {
      return;
    }

    try {
      await releasePhoneNumber(num.id);
      toast.success(`Number ${num.phoneNumber} released back to database pool.`);
      fetchNumbers(searchQuery);
    } catch (err: any) {
      toast.error(err.message || 'Failed to release number');
    }
  };

  // Copy number to clipboard
  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    toast.success(`Copied ${num} to clipboard`);
  };

  const activeCount = numbers.filter((n) => n.status === 'active' || !!n.assignedAgentId).length;
  const reserveCount = numbers.length - activeCount;

  // Filter available numbers in modal by country and term
  const filteredAvailableDbNumbers = availableDbNumbers.filter((n) => {
    const matchesCountry =
      availableCountryFilter === 'ALL' || n.countryCode === availableCountryFilter;
    const matchesSearch =
      !availableSearchTerm ||
      n.phoneNumber.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
      n.carrier.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(availableSearchTerm.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-mono">
            <span>Samvada Enterprise Labs</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{currentWorkspace.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-medium">Inbound & Outbound Calling</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Phone Numbers & SIP Trunks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage provisioned phone numbers, configure SIP trunks, and route incoming calls to voice agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchNumbers(searchQuery)}
            disabled={isLoading || isSearching}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh numbers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={handleOpenAllocateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300" />
            <span>Allocate Phone Number</span>
          </button>
        </div>
      </div>

      {/* ── Telephony Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Phone className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight tabular-nums">
                {numbers.length}
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {activeCount} Active • {reserveCount} Reserve
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Allocated Numbers</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Radio className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-700">SIP Concurrency Allocation</span>
              <span className="font-mono font-bold text-xs text-emerald-800">
                {numbers.reduce((acc, n) => acc + (n.concurrencyLimit || 10), 0)} Channels
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(15, numbers.length * 20))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchNumbers(searchQuery)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold rounded cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Phone Numbers Table ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Allocated Telephone Numbers
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full font-semibold">
              {numbers.length} total
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search numbers, assigned agents, carriers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 w-full"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-2.5 top-1/2 -translate-y-1/2" />
            ) : searchQuery ? (
              <button
                onClick={handleClearSearch}
                className="text-[10px] text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer font-bold"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Carrier & Protocol</th>
                <th className="py-3 px-4">Country & Type</th>
                <th className="py-3 px-4">Inbound Route (Agent)</th>
                <th className="py-3 px-4">Concurrency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading && numbers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                    <p className="text-xs">Loading allocated phone numbers...</p>
                  </td>
                </tr>
              ) : numbers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Phone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No allocated phone numbers found</p>
                    {searchQuery ? (
                      <p className="text-xs mt-1">
                        No phone numbers found matching "{searchQuery}".
                        <button
                          onClick={handleClearSearch}
                          className="text-emerald-700 font-semibold underline ml-1 cursor-pointer"
                        >
                          Clear search filter
                        </button>
                      </p>
                    ) : (
                      <p className="text-xs mt-1">
                        Click "Allocate Phone Number" to choose and assign an available number.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                numbers.map((num) => (
                  <tr key={num.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900 text-sm">
                        <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{num.phoneNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(num.phoneNumber)}
                          title="Copy number"
                          className="text-slate-400 hover:text-slate-700 p-1 rounded cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {num.carrier || num.provider}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{num.country}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{num.type}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <Bot className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{num.assignedAgentName || 'Unassigned (Reserve)'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {num.concurrencyLimit || 10} Channels
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          num.assignedAgentId
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {num.assignedAgentId ? 'Active Inbound' : 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenConfig(num)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <Settings2 className="w-3 h-3 text-emerald-700" />
                          <span>Configure</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRelease(num)}
                          title="Release number back to database pool"
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Allocate Number from Database Modal ── */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title="Allocate Phone Number"
        subtitle="Select an available phone number from inventory to assign to your voice agent."
        maxWidth="lg"
        theme="light"
      >
        <form onSubmit={handleAllocateFromDb} className="space-y-4">
          {/* Country Filter Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Filter by Country
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All Countries' },
                { id: 'US', label: 'United States (+1)' },
                { id: 'GB', label: 'United Kingdom (+44)' },
                { id: 'IN', label: 'India (+91)' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setAvailableCountryFilter(c.id)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer ${
                    availableCountryFilter === c.id
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search inside modal */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search available numbers by area code, number, or carrier..."
              value={availableSearchTerm}
              onChange={(e) => setAvailableSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 w-full"
            />
          </div>

          {/* Selectable Number List from DB */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Available Phone Number ({filteredAvailableDbNumbers.length} available)
            </label>

            {isLoadingAvailable ? (
              <div className="py-8 text-center text-slate-400 border border-slate-200 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mx-auto mb-2" />
                <p className="text-xs">Loading available phone numbers...</p>
              </div>
            ) : filteredAvailableDbNumbers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <Phone className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">No unassigned numbers match this filter</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try selecting "All Countries" or clearing the search.</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                {filteredAvailableDbNumbers.map((item) => {
                  const isSelected = selectedDbNumberId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedDbNumberId(item.id)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-4 border-l-emerald-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="selectedDbNumber"
                          checked={isSelected}
                          onChange={() => setSelectedDbNumberId(item.id)}
                          className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {item.phoneNumber}
                            </span>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {item.carrier}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {item.country} • {item.type}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-950 font-mono">
                          ${item.monthlyCostUsd?.toFixed(2) || '1.00'}/mo
                        </span>
                        <p className="text-[10px] text-emerald-700 font-medium">Ready to Assign</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Direct Agent Binding */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Direct Inbound Voice Agent Binding
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="">-- Unassigned (Hold in Reserve Pool) --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role || 'Voice Assistant'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Calls to this number will immediately route to the selected agent.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAllocateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedDbNumberId}
              className="px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span>Allocate & Assign Number</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Configure / Route Assignment Modal ── */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Inbound Routing & Agent Assignment"
        subtitle={`Configure which voice agent handles incoming calls on ${selectedNumber?.phoneNumber || ''}.`}
        maxWidth="md"
        theme="light"
      >
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-500">Phone Number:</span>
              <span className="font-bold text-slate-900">{selectedNumber?.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Carrier Trunk:</span>
              <span className="font-semibold text-emerald-800">{selectedNumber?.carrier || selectedNumber?.provider}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Voice AI Agent
            </label>
            <select
              value={configAgentId}
              onChange={(e) => setConfigAgentId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="">-- Unassigned (Do not route calls) --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.role || 'Voice Assistant'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Incoming SIP packets on this DID will initiate real-time speech-to-speech with this agent.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span>Save Routing</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
