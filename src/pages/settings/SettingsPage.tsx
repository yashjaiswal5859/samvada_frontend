import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  ExternalLink
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [orgName, setOrgName] = useState(user?.companyName || user?.organization?.name || 'Default Workspace');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');
  const [language, setLanguage] = useState('English');
  const [landingPage, setLandingPage] = useState('Dashboard');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [dateFormat, setDateFormat] = useState('Sep 14, 2026 (MMM DD, YYYY)');
  const [timeFormat, setTimeFormat] = useState('12-hour (AM/PM)');

  const toast = useToast();

  React.useEffect(() => {
    if (user?.companyName || user?.organization?.name) {
      setOrgName(user.companyName || user.organization?.name || '');
    }
  }, [user]);

  const tabs = [
    { label: 'General', path: '/settings', active: true },
    { label: 'Voice & Telephony', path: '/telephony', active: false },
    { label: 'Team & Access', path: '/settings/team', active: false },
    { label: 'Integrations', path: '/integrations', active: false },
    { label: 'Security', path: '/settings/security', active: false },
    { label: 'Billing', path: '/settings/billing', active: false },
    { label: 'Notifications', path: '/notifications', active: false }
  ];

  const handleSave = () => {
    toast.success('Settings Saved', 'Organization profile & workspace preferences updated.');
  };

  const handleExportData = () => {
    toast.info('Export Started', 'Archiving all call records, transcripts, and audio files (ZIP)...');
  };

  const handleDeactivate = () => {
    toast.warning('Account Deactivation', 'Contact workspace owner to schedule account deactivation.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Manage your organization, preferences, and platform configuration.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-zinc-800 text-xs font-medium overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.label}
            to={tab.path}
            className={`pb-3 whitespace-nowrap transition-colors relative ${
              tab.active
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* Main Grid: Left Settings Form, Right Overview & Danger Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Organization Settings Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Organization Settings</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Basic information about your organization.</p>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
              >
                <span>Save Changes</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Industry</label>
                  <CustomSelect
                    value={industry}
                    onChange={setIndustry}
                    size="md"
                    options={[
                      { value: 'Technology', label: 'Technology' },
                      { value: 'Finance & Banking', label: 'Finance & Banking' },
                      { value: 'Healthcare', label: 'Healthcare' },
                      { value: 'Real Estate', label: 'Real Estate' },
                      { value: 'E-Commerce', label: 'E-Commerce' },
                      { value: 'Telecommunications', label: 'Telecommunications' }
                    ]}
                  />
                </div>
              </div>

              {/* Right Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Organization Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-400 font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                      A
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.info('Logo Upload', 'Select a PNG/JPG file up to 2MB')}
                        className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
                      >
                        Change Logo
                      </button>
                      <button
                        onClick={() => toast.warning('Logo Removed', 'Reset to default organization avatar')}
                        className="p-2 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Recommended: 512 x 512, PNG or JPG Max size: 2 MB
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Timezone</label>
                  <CustomSelect
                    value={timezone}
                    onChange={setTimezone}
                    size="md"
                    options={[
                      { value: 'Asia/Kolkata (IST)', label: 'Asia/Kolkata (IST)' },
                      { value: 'America/New_York (EST)', label: 'America/New_York (EST)' },
                      { value: 'America/Los_Angeles (PST)', label: 'America/Los_Angeles (PST)' },
                      { value: 'Europe/London (GMT)', label: 'Europe/London (GMT)' }
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Language</label>
                  <CustomSelect
                    value={language}
                    onChange={setLanguage}
                    size="md"
                    options={[
                      { value: 'English', label: 'English' },
                      { value: 'Hindi', label: 'Hindi (हिंदी)' },
                      { value: 'Spanish', label: 'Spanish (Español)' },
                      { value: 'German', label: 'German (Deutsch)' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <h2 className="text-base font-bold text-white">Preferences</h2>
            <p className="text-xs text-zinc-400 mt-0.5 mb-5">Customize your experience.</p>

            <div className="space-y-4 divide-y divide-zinc-800/60 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <div>
                  <div className="font-semibold text-zinc-200">Default Landing Page</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Choose the page you see after login.</div>
                </div>
                <div className="w-48">
                  <CustomSelect
                    value={landingPage}
                    onChange={setLandingPage}
                    options={[
                      { value: 'Dashboard', label: 'Dashboard' },
                      { value: 'Agents', label: 'Agents' },
                      { value: 'Campaigns', label: 'Campaigns' },
                      { value: 'Live Calls', label: 'Live Calls' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="font-semibold text-zinc-200">Enable Sound Notifications</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Play a sound for incoming calls and important events.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    toast.info('Audio Alert', soundEnabled ? 'Sound notifications muted.' : 'Sound notifications enabled.');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    soundEnabled ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="font-semibold text-zinc-200">Enable Dark Mode</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Use dark theme across the application.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    darkModeEnabled ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      darkModeEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                <div>
                  <div className="font-semibold text-zinc-200">Date Format</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Choose your preferred date format.</div>
                </div>
                <div className="w-56">
                  <CustomSelect
                    value={dateFormat}
                    onChange={setDateFormat}
                    options={[
                      { value: 'Sep 14, 2026 (MMM DD, YYYY)', label: 'Sep 14, 2026 (MMM DD, YYYY)' },
                      { value: '14/09/2026 (DD/MM/YYYY)', label: '14/09/2026 (DD/MM/YYYY)' },
                      { value: '2026-09-14 (YYYY-MM-DD)', label: '2026-09-14 (YYYY-MM-DD)' }
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                <div>
                  <div className="font-semibold text-zinc-200">Time Format</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">Choose your preferred time format.</div>
                </div>
                <div className="w-48">
                  <CustomSelect
                    value={timeFormat}
                    onChange={setTimeFormat}
                    options={[
                      { value: '12-hour (AM/PM)', label: '12-hour (AM/PM)' },
                      { value: '24-hour', label: '24-hour' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Account Overview Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Account Overview</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">Your current plan and usage.</p>
              </div>
              <NavLink
                to="/settings/billing"
                className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Manage Plan
              </NavLink>
            </div>

            <div className="mb-4">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>Pro Plan</span>
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Phone className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-white tabular-nums">5,000</span>
                    <span className="text-zinc-400">/ 50,000</span>
                  </div>
                  <span className="text-zinc-400 font-semibold tabular-nums">10%</span>
                </div>
                <div className="text-[11px] text-zinc-500 ml-8 mb-1">Calls used</div>
                <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Users className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-white tabular-nums">3</span>
                    <span className="text-zinc-400">/ 10</span>
                  </div>
                  <span className="text-zinc-400 font-semibold tabular-nums">30%</span>
                </div>
                <div className="text-[11px] text-zinc-500 ml-8 mb-1">Agents</div>
                <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                      <Database className="w-3 h-3" />
                    </div>
                    <span className="font-semibold text-white tabular-nums">1.2 GB</span>
                    <span className="text-zinc-400">/ 10 GB</span>
                  </div>
                  <span className="text-zinc-400 font-semibold tabular-nums">12%</span>
                </div>
                <div className="text-[11px] text-zinc-500 ml-8 mb-1">Knowledge Base Storage</div>
                <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-rose-400">Danger Zone</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-4">These actions are irreversible.</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080b11] border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Export All Data</div>
                    <div className="text-[10px] text-zinc-500">Download all your organization data.</div>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#080b11] border border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Deactivate Account</div>
                    <div className="text-[10px] text-zinc-500">Temporarily disable your account.</div>
                  </div>
                </div>
                <button
                  onClick={handleDeactivate}
                  className="px-3 py-1.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
                >
                  Deactivate
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-rose-300">Delete Account</div>
                    <div className="text-[10px] text-zinc-500">Permanently delete your account and all data.</div>
                  </div>
                </div>
                <button
                  onClick={() => toast.error('Protected Action', 'Account deletion requires 2FA confirmation from workspace Owner.')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 hover:border-transparent text-rose-300 hover:text-white text-xs font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white">Need Help?</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">Get support or reach out to our team.</p>

            <div className="space-y-2.5">
              <NavLink
                to="/help"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      Help Center
                    </div>
                    <div className="text-[10px] text-zinc-500">Browse documentation and guides.</div>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </NavLink>

              <NavLink
                to="/help"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      Contact Support
                    </div>
                    <div className="text-[10px] text-zinc-500">Get help from our team.</div>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                  <span>Contact</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </NavLink>

              <NavLink
                to="/help"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors">
                      Feature Requests
                    </div>
                    <div className="text-[10px] text-zinc-500">Tell us what you'd like to see.</div>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                  <span>Submit</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
