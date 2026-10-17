import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  Globe,
  Upload,
  Trash2,
  Clock,
  Languages,
  Check,
  Star,
  Phone,
  Users,
  Database,
  Download,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Lightbulb,
  ExternalLink,
  Shield,
  Key,
  Layers,
  Radio,
  Sliders,
  Zap,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Server,
  DollarSign,
  Lock,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { SettingsNav } from '../../components/layout/SettingsNav';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  keyMasked: string;
  scope: string;
  environment: 'Production' | 'Sandbox';
  created: string;
  lastUsed: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Voice Architect' | 'Analyst';
  avatar: string;
  status: 'Active' | 'Invited';
  twoFactor: boolean;
  lastActive: string;
}

type SettingsSection = 'general' | 'concurrency' | 'apikeys' | 'team' | 'billing' | 'security';

const resolveSettingsSection = (pathname: string): SettingsSection =>
  pathname === '/settings/telephony' ? 'concurrency' : 'general';

export const SettingsPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { organizationName } = useWorkspace();
  const toast = useToast();

  const activeTab = resolveSettingsSection(location.pathname);

  // General Settings state
  const [orgName, setOrgName] = useState(user?.companyName || user?.organization?.name || organizationName || 'Samvada Enterprise Labs');
  const [website, setWebsite] = useState('https://samvada.ai');
  const [industry, setIndustry] = useState('Enterprise AI & Telephony');
  const [timezone, setTimezone] = useState('America/New_York (EST)');
  const [dataResidency, setDataResidency] = useState('US-East (N. Virginia)');
  const [audioCodec, setAudioCodec] = useState('8kHz Telephony (G.711 / μ-law)');
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [noiseSuppression, setNoiseSuppression] = useState(true);

  // Concurrency state
  const [concurrencyQuota, setConcurrencyQuota] = useState(50);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [requestedChannels, setRequestedChannels] = useState('100');

  // API Keys state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScope, setNewKeyScope] = useState('Full Telephony Admin');
  const [newKeyEnv, setNewKeyEnv] = useState<'Production' | 'Sandbox'>('Production');
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Primary SIP Gateway Dispatcher',
      prefix: 'samvada_live_',
      keyMasked: 'samvada_live_948f••••••••2819',
      scope: 'Full Telephony Admin',
      environment: 'Production',
      created: 'Oct 1, 2026',
      lastUsed: 'Just now',
    },
    {
      id: 'key-2',
      name: 'Outbound Campaign Dialer Worker',
      prefix: 'samvada_live_',
      keyMasked: 'samvada_live_38ca••••••••7110',
      scope: 'Campaign Dispatch & Telephony',
      environment: 'Production',
      created: 'Sep 28, 2026',
      lastUsed: '14 mins ago',
    },
    {
      id: 'key-3',
      name: 'Local Dev Voice Simulator',
      prefix: 'samvada_test_',
      keyMasked: 'samvada_test_01ef••••••••6291',
      scope: 'Sandbox Simulator Access',
      environment: 'Sandbox',
      created: 'Sep 10, 2026',
      lastUsed: '2 hours ago',
    },
  ]);

  // Team state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Voice Architect' | 'Analyst'>('Voice Architect');

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'team-1',
      name: user?.displayName || 'Alex Rivers',
      email: user?.email || 'alex.rivers@samvada.ai',
      role: 'Owner',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'Active',
      twoFactor: true,
      lastActive: 'Online now',
    },
    {
      id: 'team-2',
      name: 'Priya Nair',
      email: 'priya.nair@samvada.ai',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'Active',
      twoFactor: true,
      lastActive: '28 mins ago',
    },
    {
      id: 'team-3',
      name: 'Marcus Sterling',
      email: 'marcus.s@samvada.ai',
      role: 'Voice Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'Active',
      twoFactor: true,
      lastActive: '3 hours ago',
    },
    {
      id: 'team-4',
      name: 'David Vance',
      email: 'david.v@samvada.ai',
      role: 'Analyst',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'Active',
      twoFactor: false,
      lastActive: 'Yesterday',
    },
  ]);

  const handleCopyKey = (key: ApiKeyItem) => {
    navigator.clipboard.writeText(`${key.prefix}sec_a89172839b9101f2`);
    toast.success('API Key Copied', `${key.name} token copied to clipboard.`);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name.');
      return;
    }
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      prefix: newKeyEnv === 'Production' ? 'samvada_live_' : 'samvada_test_',
      keyMasked: `${newKeyEnv === 'Production' ? 'samvada_live_' : 'samvada_test_'}83f1••••••••${Math.floor(1000 + Math.random() * 9000)}`,
      scope: newKeyScope,
      environment: newKeyEnv,
      created: 'Just now',
      lastUsed: 'Never',
    };
    setApiKeys([newKey, ...apiKeys]);
    setShowKeyModal(false);
    setNewKeyName('');
    toast.success('API Key Generated', `Secret token for "${newKeyName}" is ready.`);
  };

  const handleInviteTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Please enter a valid email.');
      return;
    }
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
      status: 'Invited',
      twoFactor: false,
      lastActive: 'Pending verification',
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
    toast.success('Invitation Dispatched', `Invite sent to ${inviteEmail} as ${inviteRole}.`);
  };

  const handleRequestQuota = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuotaModal(false);
    toast.success('Quota Request Submitted', `Requested capacity expansion to ${requestedChannels} concurrent SIP channels. Engineering review SLA is < 2 hours.`);
  };

  const handleSaveGeneral = () => {
    toast.success('Settings Saved', 'Organization profile & telephony preferences updated.');
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <SettingsNav
        title="Platform & Workspace Governance"
        subtitle="Manage telephony concurrency quotas, developer API keys, role permissions, compliance, and billing."
      />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: GENERAL & ORGANIZATION SETTINGS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Organization Voice Profile</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Global defaults applied across all voice agents and outbound campaigns.</p>
                </div>
                <button
                  onClick={handleSaveGeneral}
                  className="min-h-9 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Organization Legal Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Public Domain</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Industry & Vertical</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Enterprise AI & Telephony">Enterprise AI & Telephony</option>
                    <option value="Healthcare & Clinical Triage">Healthcare & Clinical Triage</option>
                    <option value="Hospitality & Travel Concierge">Hospitality & Travel Concierge</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="Insurance & Claims Processing">Insurance & Claims Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Telephony Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                    <option value="America/Los_Angeles (PST)">America/Los_Angeles (PST)</option>
                    <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                    <option value="Asia/Tokyo (JST)">Asia/Tokyo (JST)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Residency & Sovereign Region</label>
                  <select
                    value={dataResidency}
                    onChange={(e) => setDataResidency(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="US-East (N. Virginia)">US-East (N. Virginia, HIPAA/SOC-2)</option>
                    <option value="EU-Central (Frankfurt)">EU-Central (Frankfurt, GDPR Compliant)</option>
                    <option value="IN-West (Mumbai)">IN-West (Mumbai, Data Localization)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telephony Stream Audio Codec</label>
                  <select
                    value={audioCodec}
                    onChange={(e) => setAudioCodec(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="8kHz Telephony (G.711 / μ-law)">8kHz Telephony (G.711 / μ-law) - PSTN Native</option>
                    <option value="16kHz Wideband (G.722)">16kHz Wideband (G.722) - HD Voice</option>
                    <option value="24kHz Full-Band (Opus WebRTC)">24kHz Full-Band (Opus) - WebRTC Ultra-HD</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Automatic PII / PCI Audio Redaction</span>
                      <span className="text-xs text-slate-600">
                        Automatically bleeps and masks credit cards, SSNs, and medical records before saving recordings.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Enable personally identifiable information redaction"
                    checked={piiRedaction}
                    onChange={(e) => setPiiRedaction(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Radio className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Dynamic Acoustic Background Noise Suppression</span>
                      <span className="text-xs text-slate-600">
                        Filters wind, car acoustics, and street noise before sending audio into the speech-to-text pipeline.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Enable background noise suppression"
                    checked={noiseSuppression}
                    onChange={(e) => setNoiseSuppression(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Voice architecture status</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Live Voice Cluster</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Operational (99.98%)
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">E2E Turn Latency SLA</span>
                  <span className="font-bold font-mono text-slate-900">&lt; 400ms Guaranteed</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Active SIP Trunks</span>
                  <span className="font-bold text-slate-900">Twilio / Telnyx</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Compliance Accreditations</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SOC-2 • HIPAA • PCI
                  </span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 rounded-xl bg-rose-50/50 border border-rose-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">Data Governance & Export</h3>
              </div>
              <p className="text-xs text-rose-700">
                Download your complete conversational vault including call transcripts, audio recordings, and evaluation metrics.
              </p>
              <button
                onClick={() => toast.info('Export Started', 'Packaging voice vault as encrypted ZIP (AES-256)...')}
                className="w-full py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-lg text-xs font-bold shadow-2xs transition-all"
              >
                Export Complete Voice Vault (.zip)
              </button>
            </div>
          </div>
          <div className="lg:col-span-12 flex justify-end border-t border-slate-200 pt-4">
            <button
              onClick={handleSaveGeneral}
              className="min-h-9 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: CONCURRENCY & TELEPHONY LIMITS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'concurrency' && (
        <div className="space-y-6">
          {/* Main Concurrency Meter Card */}
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Telephony Concurrency & Trunk Capacity</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    SLA Tier: Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time concurrent SIP trunk channel allocation across inbound IVR routes and outbound dialing campaigns.
                </p>
              </div>

              <button
                onClick={() => setShowQuotaModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Request Concurrency Increase</span>
              </button>
            </div>

            {/* Visual Concurrency Allocation Bar */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">14</span>
                  <span className="text-lg font-bold text-slate-400 font-mono">/ 50</span>
                  <span className="text-xs font-semibold text-slate-500">Concurrent Channels Active (28% Utilization)</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  36 Standby Channels Available
                </span>
              </div>

              {/* Segmented Bar */}
              <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
                {/* Inbound (6 channels = 12%) */}
                <div
                  className="h-full bg-emerald-600 rounded-l-full transition-all"
                  style={{ width: '12%' }}
                  title="Inbound IVR: 6 channels (12%)"
                />
                {/* Outbound (8 channels = 16%) */}
                <div
                  className="h-full bg-teal-600 transition-all"
                  style={{ width: '16%' }}
                  title="Outbound Campaigns: 8 channels (16%)"
                />
                {/* Available Buffer (72%) */}
                <div className="h-full bg-transparent flex-1" />
              </div>

              {/* Legend Strip */}
              <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Inbound IVR Trunks: <strong className="text-slate-900">6 Active</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-teal-600" />
                  <span className="text-slate-600 font-medium">Outbound Dialers: <strong className="text-slate-900">8 Active</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                  <span className="text-slate-600 font-medium">Headroom Buffer: <strong className="text-slate-900">36 Available</strong></span>
                </div>
              </div>
            </div>

            {/* Telephony Performance Guarantees */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Outbound Calls Per Second (CPS)</span>
                <span className="text-lg font-bold font-mono text-slate-900">15.0 CPS</span>
                <span className="text-[11px] text-slate-500 block">Carriers: Twilio Elastic, Telnyx Global</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Max Queue Buffer Depth</span>
                <span className="text-lg font-bold font-mono text-slate-900">500 Callers</span>
                <span className="text-[11px] text-slate-500 block">Zero drop rate with auto-hold music</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block">Voice SLA Guarantee</span>
                <span className="text-lg font-bold font-mono text-emerald-800">99.98% Uptime</span>
                <span className="text-[11px] text-slate-500 block">Multi-region SIP failover enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: API KEYS & DEVELOPER SECRETS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'apikeys' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Developer API Keys & Webhook Secrets</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Encrypted Vault
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authenticate your backend services, trigger outbound calling campaigns, and receive realtime WebRTC webhooks.
                </p>
              </div>

              <button
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Generate New API Key</span>
              </button>
            </div>

            {/* Keys Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-3">Name & Token</th>
                    <th className="py-2.5 px-3">Environment</th>
                    <th className="py-2.5 px-3">Permission Scope</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apiKeys.map((key) => {
                    const isRevealed = revealedKeys[key.id];
                    return (
                      <tr key={key.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-900 block">{key.name}</span>
                          <span className="font-mono text-[11px] text-slate-500 mt-0.5 inline-block">
                            {isRevealed ? `${key.prefix}sec_a89172839b9101f2` : key.keyMasked}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            key.environment === 'Production'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {key.environment}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-700 font-semibold">{key.scope}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                          {key.created}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-mono text-[11px] font-semibold">
                          {key.lastUsed}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title={isRevealed ? 'Hide Secret' : 'Reveal Secret'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleCopyKey(key)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded hover:bg-emerald-50"
                              title="Copy API Key"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setApiKeys(apiKeys.filter((k) => k.id !== key.id));
                                toast.warning('Key Revoked', `API key "${key.name}" has been disabled immediately.`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Revoke Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 4: TEAM & ACCESS CONTROL */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Team Members & Role-Based Access Control</h2>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    4 Members
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage organization access, role privileges, and multi-factor authentication requirements.
                </p>
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Invite Team Member</span>
              </button>
            </div>

            {/* Team Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-3">Team Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">2FA Security</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Last Active</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{member.name}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          member.role === 'Owner'
                            ? 'bg-purple-50 text-purple-900 border border-purple-200'
                            : member.role === 'Admin'
                            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          member.twoFactor ? 'text-emerald-700' : 'text-amber-600'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                          {member.twoFactor ? 'Enforced' : 'Not Configured'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                        {member.lastActive}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {member.role !== 'Owner' && (
                          <button
                            onClick={() => {
                              setTeamMembers(teamMembers.filter((m) => m.id !== member.id));
                              toast.info('Member Removed', `${member.name} removed from organization.`);
                            }}
                            className="text-xs text-slate-400 hover:text-rose-600 font-semibold px-2 py-1 rounded hover:bg-rose-50"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 5: BILLING & SUBSCRIPTIONS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Plan</span>
              <div className="text-xl font-bold text-slate-900">Samvada Enterprise Voice</div>
              <p className="text-xs text-slate-500">Dedicated high-availability cluster with 50 parallel trunks.</p>
              <span className="inline-block mt-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                $499 / month • Billed Annually
              </span>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Voice Credit Balance</span>
              <div className="text-2xl font-bold font-mono text-emerald-800">$142.50</div>
              <p className="text-xs text-slate-500">Auto-recharges $200 when balance falls below $50.</p>
              <button
                onClick={() => toast.success('Credit Added', '$100.00 added to Voice Engine credits.')}
                className="mt-1 px-3 py-1.5 bg-emerald-950 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                + Add $100 Credit
              </button>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
              <div className="text-base font-bold text-slate-900">Mastercard •••• 4912</div>
              <p className="text-xs text-slate-500">Expires 08/2028 • Billed to billing@samvada.ai</p>
              <button
                onClick={() => toast.info('Stripe Customer Portal', 'Redirecting to secure Stripe billing portal...')}
                className="mt-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
              >
                Manage in Stripe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB 6: SECURITY & COMPLIANCE */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Enterprise Security & Compliance Certifications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Continuous verification of encryption in transit and at rest.</p>
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>SOC-2 Type II Certified</span>
              </div>
              <p className="text-slate-600 text-[11px]">Audit report valid through 2027. End-to-end TLS 1.3 encryption on all SIP media streams.</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>HIPAA BAA Available</span>
              </div>
              <p className="text-slate-600 text-[11px]">Protected Health Information (PHI) encrypted with customer-managed keys (CMK).</p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Level 1 Redaction</span>
              </div>
              <p className="text-slate-600 text-[11px]">Zero storage of primary account numbers (PAN) or CVV codes during voice transactions.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Request Concurrency Increase ── */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Concurrency Expansion</h3>
                  <p className="text-xs text-slate-500">Scale dedicated SIP channels for high-volume campaigns.</p>
                </div>
              </div>
              <button
                onClick={() => setShowQuotaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRequestQuota} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Concurrent Channel Capacity</label>
                <select
                  value={requestedChannels}
                  onChange={(e) => setRequestedChannels(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                >
                  <option value="100">100 Concurrent Channels (~30 CPS)</option>
                  <option value="250">250 Concurrent Channels (~75 CPS)</option>
                  <option value="500">500 Concurrent Channels (~150 CPS)</option>
                  <option value="1000">1,000+ Custom Enterprise Trunk</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Use Case</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Nationwide clinical reminder campaign launching next Monday at 9 AM EST."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                <span className="font-bold block">Instant Automated Scaling</span>
                <span className="text-[11px] text-emerald-800">
                  Capacity is allocated directly across Twilio Elastic SIP & Telnyx without service interruption.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuotaModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Submit Expansion Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Generate API Key ── */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Generate New API Key</h3>
                  <p className="text-xs text-slate-500">Create a scoped secret for voice platform integration.</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Key Description / Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production CRM Webhook Dispatcher"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Environment</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('Production')}
                    className={`p-2.5 rounded-lg border font-semibold text-center ${
                      newKeyEnv === 'Production'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Production (Live SIP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewKeyEnv('Sandbox')}
                    className={`p-2.5 rounded-lg border font-semibold text-center ${
                      newKeyEnv === 'Sandbox'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Sandbox (Simulated)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Permission Scope</label>
                <select
                  value={newKeyScope}
                  onChange={(e) => setNewKeyScope(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="Full Telephony Admin">Full Telephony Admin (Dial, Read, Config)</option>
                  <option value="Campaign Dispatch & Telephony">Campaign Dispatch & Outbound Only</option>
                  <option value="Read-only Telemetry & Metrics">Read-only Telemetry & Audio Stream</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Invite Team Member ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invite Team Member</h3>
                  <p className="text-xs text-slate-500">Add an engineer or analyst to your workspace.</p>
                </div>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteTeam} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Corporate Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@yourcompany.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Privileges</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                >
                  <option value="Admin">Workspace Admin (Full Agent & Telephony)</option>
                  <option value="Voice Architect">Voice Architect (Prompt Studio & DAG Canvas)</option>
                  <option value="Analyst">Analyst (BI Reports & Observability Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg font-semibold shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
