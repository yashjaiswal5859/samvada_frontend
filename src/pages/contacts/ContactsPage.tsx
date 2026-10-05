import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  Upload,
  Phone,
  Edit2,
  MoreHorizontal,
  Mail,
  MapPin,
  Clock,
  Loader2
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getContacts } from '../../api/contacts';
import { formatDate } from '../../utils/formatters';

interface ContactItem {
  id: string;
  name: string;
  initial: string;
  phone: string;
  email: string;
  tag: string;
  status: 'contacted' | 'not_contacted' | 'not_reachable';
  lastContacted: string;
  location: string;
  source: string;
  language: string;
  timezone: string;
  createdAt: string;
  notes: string;
}

export const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'notes' | 'activity'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  // Load live contacts directly from PostgreSQL via ABS API
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    getContacts()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          const mapped: ContactItem[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            initial: (c.name || 'C').charAt(0).toUpperCase(),
            phone: c.phone || '',
            email: c.email || '',
            tag: (c.tags && c.tags.length > 0) ? c.tags[0] : 'Lead',
            status: c.status || 'not_contacted',
            lastContacted: c.lastContacted || '-',
            location: c.company || c.location || 'Direct',
            source: c.source || 'Database',
            language: c.language || 'English',
            timezone: c.timezone || 'IST',
            createdAt: formatDate(c.createdAt),
            notes: c.notes || `Contact record for ${c.name}`,
          }));
          setContacts(mapped);
          if (mapped.length > 0) {
            setSelectedContactId(mapped[0].id);
          } else {
            setSelectedContactId('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load contacts from API', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0] || null;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Hot Lead':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'Interested':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Follow Up':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Customer':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Demo':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = tagFilter === 'All Tags' || c.tag.toLowerCase() === tagFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (statusFilter === 'Contacted' ? c.status === 'contacted' : c.status !== 'contacted');

    return matchesSearch && matchesTag && matchesStatus;
  });

  const reachableCount = contacts.filter((c) => c.status === 'contacted').length;
  const notReachableCount = contacts.filter((c) => c.status === 'not_reachable').length;
  const newContactsCount = contacts.filter((c) => c.status === 'not_contacted').length;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Contacts</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your customer and lead database for outbound calling campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => toast.info('Import CSV: upload contacts format (.csv, .xlsx)')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-sm font-semibold transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Contacts</span>
          </button>
          <button
            onClick={() => toast.info('New Contact: open manual contact entry form')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards (Dynamic API-Backed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {contacts.length.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Total Contacts</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {newContactsCount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Pending / New</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {reachableCount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {contacts.length > 0 ? `${((reachableCount / contacts.length) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Contacted</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 backdrop-blur-xl shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {notReachableCount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-zinc-400">
                {contacts.length > 0 ? `${((notReachableCount / contacts.length) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">Not Reachable</p>
          </div>
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
            placeholder="Search by name, number, email, tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0c101b] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="w-36 shrink-0">
          <CustomSelect
            value={tagFilter}
            onChange={setTagFilter}
            options={['All Tags', 'Hot Lead', 'Interested', 'Follow Up', 'Customer', 'Demo']}
            size="sm"
          />
        </div>

        <div className="w-36 shrink-0">
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All Statuses', 'Contacted', 'Pending']}
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
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-white">No contacts found</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Import contacts from CSV or add new leads manually to populate your outreach queue.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => toast.info('Import CSV')}
                  className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => toast.info('Add Contact')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-400 font-medium">
                  <tr>
                    <th className="p-3.5 font-semibold text-zinc-300">Name</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Phone</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Tag</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Status</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Location</th>
                    <th className="p-3.5 font-semibold text-zinc-300">Last Contacted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                  {filteredContacts.map((c) => {
                    const isSelected = selectedContactId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedContactId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-600/10' : 'hover:bg-zinc-850/40'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-300">
                              {c.initial}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{c.name}</p>
                              <p className="text-[10px] text-zinc-500">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{c.phone}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTagColor(
                              c.tag
                            )}`}
                          >
                            {c.tag}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              c.status === 'contacted'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === 'contacted' ? 'bg-emerald-400' : 'bg-zinc-400'
                              }`}
                            />
                            {c.status === 'contacted' ? 'Contacted' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-400">{c.location}</td>
                        <td className="p-3.5 text-zinc-400">{c.lastContacted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Showing {filteredContacts.length} of {contacts.length} contact(s)</span>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-5">
          {selectedContact ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-lg font-bold text-blue-300">
                    {selectedContact.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedContact.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${getTagColor(
                        selectedContact.tag
                      )}`}
                    >
                      {selectedContact.tag}
                    </span>
                  </div>
                </div>
                <button className="p-1 rounded text-zinc-500 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    toast.info(`Dialing ${selectedContact.name} (${selectedContact.phone})...`);
                    navigate('/calls/live');
                  }}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => toast.info('Edit contact details')}
                  className="py-2 px-3 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'details' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`font-semibold pb-1 border-b-2 transition-all ${
                    activeTab === 'notes' ? 'text-blue-400 border-blue-500' : 'text-zinc-400 border-transparent hover:text-white'
                  }`}
                >
                  Notes
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-semibold text-zinc-400">Contact Information</h4>
                <div className="space-y-2 text-zinc-300">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedContact.phone}</span>
                  </div>
                  {selectedContact.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedContact.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{selectedContact.location}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-xs pt-1 border-t border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-400">Additional Info</h4>
                <div className="space-y-1.5 text-zinc-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Source</span>
                    <span>{selectedContact.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Language</span>
                    <span>{selectedContact.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Created At</span>
                    <span>{selectedContact.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 text-xs pt-1 border-t border-zinc-800">
                <h4 className="text-xs font-semibold text-zinc-400">Notes</h4>
                <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <p className="text-zinc-300 text-xs leading-relaxed">{selectedContact.notes}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">No Contact Selected</h4>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Select a contact from the list to view profile details, call logs, and notes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
