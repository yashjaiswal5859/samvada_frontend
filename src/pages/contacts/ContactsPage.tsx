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
import { AddContactModal } from '../../components/modals/AddContactModal';
import { Contact } from '../../types';

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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

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
          setLoadError('');
          if (mapped.length > 0) {
            setSelectedContactId(mapped[0].id);
          } else {
            setSelectedContactId('');
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load contacts from API', err);
        if (isMounted) setLoadError(err instanceof Error ? err.message : 'Could not load contacts.');
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
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Interested':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Follow Up':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Customer':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Demo':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
      {loadError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{loadError}</div>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Contacts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your customer and lead database for outbound calling campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Contacts</span>
          </button>
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards (Dynamic API-Backed) */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {contacts.length.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">Total Contacts</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {newContactsCount.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">Pending / New</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {reachableCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {contacts.length > 0 ? `${((reachableCount / contacts.length) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">Contacted</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-slate-900 tracking-tight tabular-nums">
                {notReachableCount.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {contacts.length > 0 ? `${((notReachableCount / contacts.length) * 100).toFixed(1)}%` : '0%'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">Not Reachable</p>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, number, email, tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-colors shadow-sm"
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
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
          {isLoading ? (
            <div className="p-16 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                <Users className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No contacts found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Import contacts from CSV or add new leads manually to populate your outreach queue.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                </button>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Tag</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Last Contacted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredContacts.map((c) => {
                    const isSelected = selectedContactId === c.id;

                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedContactId(c.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-emerald-50/70 font-medium' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-900 shrink-0">
                              {c.initial}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{c.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-slate-700">{c.phone}</td>
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
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              c.status === 'contacted'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                c.status === 'contacted' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {c.status === 'contacted' ? 'Contacted' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600">{c.location}</td>
                        <td className="p-3.5 text-slate-500 font-mono text-[11px]">{c.lastContacted}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
            <span>Showing {filteredContacts.length} of {contacts.length} contact(s)</span>
          </div>
        </div>

        {/* Right Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5 text-slate-800">
          {selectedContact ? (
            <>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-lg font-bold text-emerald-900 shrink-0">
                    {selectedContact.initial}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedContact.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${getTagColor(
                        selectedContact.tag
                      )}`}
                    >
                      {selectedContact.tag}
                    </span>
                  </div>
                </div>
                <button className="p-1 rounded text-slate-400 hover:text-slate-700">
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
                  className="py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => toast.info('Edit contact details')}
                  className="py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex items-center gap-4 border-b border-slate-200 pb-2 text-xs">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'details' ? 'text-emerald-950 border-emerald-700 font-bold' : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`font-semibold pb-1 border-b-2 transition-all cursor-pointer ${
                    activeTab === 'notes' ? 'text-emerald-950 border-emerald-700 font-bold' : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  Notes
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{selectedContact.phone}</span>
                  </div>
                  {selectedContact.email && (
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{selectedContact.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedContact.location}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Additional Info</h4>
                <div className="space-y-1.5 text-slate-600 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source</span>
                    <span className="font-medium text-slate-800">{selectedContact.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Language</span>
                    <span className="font-medium text-slate-800">{selectedContact.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created At</span>
                    <span className="font-mono text-slate-700">{selectedContact.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</h4>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-slate-700 text-xs leading-relaxed">{selectedContact.notes}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">No Contact Selected</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select a contact from the list to view profile details, call logs, and notes.
              </p>
            </div>
          )}
        </div>
      </div>
      <AddContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={(contact?: Contact) => {
          if (contact) {
            const mapped: ContactItem = {
              id: contact.id,
              name: contact.name,
              initial: (contact.name || 'C').charAt(0).toUpperCase(),
              phone: contact.phone || '',
              email: contact.email || '',
              tag: contact.tags?.[0] || 'Lead',
              status: 'not_contacted',
              lastContacted: '-',
              location: contact.company || 'Direct',
              source: 'Manual entry',
              language: 'English',
              timezone: 'IST',
              createdAt: 'Just now',
              notes: '',
            };
            setContacts((previous) => [mapped, ...previous]);
            setSelectedContactId(mapped.id);
          } else {
            getContacts().then((items) => {
              setContacts(items.map((item) => ({
                id: item.id,
                name: item.name,
                initial: (item.name || 'C').charAt(0).toUpperCase(),
                phone: item.phone || '',
                email: item.email || '',
                tag: item.tags?.[0] || 'Lead',
                status: 'not_contacted',
                lastContacted: '-',
                location: item.company || 'Direct',
                source: 'Imported',
                language: 'English',
                timezone: 'IST',
                createdAt: formatDate((item as any).createdAt || new Date().toISOString()),
                notes: '',
              })));
            }).catch((error) => toast.error(error instanceof Error ? error.message : 'Contacts were imported, but the list could not be refreshed.'));
          }
        }}
      />
    </div>
  );
};
