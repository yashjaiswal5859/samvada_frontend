import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Camera,
  Check,
  Edit2,
  Key,
  Shield,
  Users,
  Download,
  Trash2,
  ChevronRight,
  Lock,
  User,
  Globe,
  Clock
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { getUserProfile, updateUserProfile, uploadAvatar, exportUserData, deleteUserData } from '../../api/settings';

export const ProfileSettingsPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.companyName || user?.organization?.name || '');
  const [jobTitle, setJobTitle] = useState('Workspace Admin');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('(GMT+05:30) India Standard Time');
  const [language, setLanguage] = useState('English');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
      if (user.companyName || user.organization?.name) {
        setCompany(user.companyName || user.organization?.name || '');
      }
    }
    getUserProfile().then((p) => {
      if (p) {
        if (p.first_name || p.last_name) {
          setFullName(`${p.first_name || ''} ${p.last_name || ''}`.trim());
        }
        if (p.email) setEmail(p.email);
        if (p.company) setCompany(p.company);
        if (p.job_title) setJobTitle(p.job_title);
        if (p.phone) setPhone(p.phone);
        if (p.timezone) setTimezone(p.timezone);
        if (p.language) setLanguage(p.language);
        if (p.bio) setBio(p.bio);
        if (p.avatar_url) setAvatarUrl(p.avatar_url);
      }
    });
  }, [user]);

  const tabs = [
    { label: 'Profile', path: '/settings/profile', active: true },
    { label: 'Workspace', path: '/settings', active: false },
    { label: 'Security', path: '/settings/security', active: false },
    { label: 'Audit Logs', path: '/settings/audit-logs', active: false },
    { label: 'Notifications', path: '/notifications', active: false },
    { label: 'Preferences', path: '/settings', active: false },
    { label: 'API & Webhooks', path: '/integrations', active: false },
    { label: 'Plan & Billing', path: '/settings/billing', active: false }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    const names = fullName.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ');

    await updateUserProfile({
      first_name: firstName,
      last_name: lastName,
      email,
      company,
      job_title: jobTitle,
      phone,
      timezone,
      language,
      bio,
    });

    setIsSaving(false);
    setSavedSuccess(true);
    toast.success('Profile details updated successfully');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.info('Uploading avatar...');
    const url = await uploadAvatar(file);
    if (url) {
      setAvatarUrl(url);
      toast.success('Profile photo updated successfully');
    } else {
      toast.error('Failed to upload photo');
    }
  };

  const handleDownloadData = async () => {
    setIsExporting(true);
    toast.info('Generating your GDPR Article 20 data export archive...');
    const data = await exportUserData();
    setIsExporting(false);
    if (!data) {
      toast.error('Failed to generate data export');
      return;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samvada_gdpr_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Your GDPR data export archive has been downloaded.');
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmText.trim() !== 'DELETE') {
      toast.error('Please type DELETE exactly to confirm account erasure');
      return;
    }
    setIsDeleting(true);
    const success = await deleteUserData();
    setIsDeleting(false);
    if (success) {
      toast.success('Personal profile data has been purged under GDPR Art. 17.');
      setShowDeleteModal(false);
      localStorage.clear();
      window.location.href = '/login';
    } else {
      toast.error('Failed to process deletion request');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Manage your account, preferences, security, and workspace settings.
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

      {/* Main Grid: Left Profile Form, Right Account Overview & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Profile Information Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Profile Information</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Update your personal information and profile details.</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-zinc-400" />
                <span>Change Photo</span>
              </button>
            </div>

            {/* Profile Avatar Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-800/80">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover border border-blue-500/40 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600/25 border border-blue-500/40 text-blue-400 font-bold text-2xl flex items-center justify-center shrink-0">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-white">{fullName || 'User Profile'}</h3>
                <p className="text-xs text-zinc-400">{jobTitle || 'Team Member'}</p>
                <p className="text-xs text-zinc-500">{company || 'Organization'}</p>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Phone Number</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-[#080b11] border border-r-0 border-zinc-800 rounded-l-xl text-xs text-zinc-400 flex items-center gap-1.5 select-none">
                      <span>🇮🇳</span>
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-r-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    label="Timezone"
                    value={timezone}
                    onChange={setTimezone}
                    size="md"
                    options={[
                      { value: '(GMT+05:30) India Standard Time', label: '(GMT+05:30) India Standard Time', icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
                      { value: '(GMT-05:00) Eastern Time (US & Canada)', label: '(GMT-05:00) Eastern Time (US & Canada)', icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
                      { value: '(GMT-08:00) Pacific Time (US & Canada)', label: '(GMT-08:00) Pacific Time (US & Canada)', icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
                      { value: '(GMT+00:00) UTC / London', label: '(GMT+00:00) UTC / London', icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> }
                    ]}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Language"
                    value={language}
                    onChange={setLanguage}
                    size="md"
                    options={[
                      { value: 'English', label: 'English', icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> },
                      { value: 'Hindi', label: 'Hindi', icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> },
                      { value: 'Spanish', label: 'Spanish', icon: <Globe className="w-3.5 h-3.5 text-blue-400" /> }
                    ]}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Bio (optional)</label>
                  <span className="text-[11px] text-zinc-500 font-mono">{bio.length}/300</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={300}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved Changes!</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Connected Accounts Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Connected Accounts</h2>
                <p className="text-xs text-zinc-400 mt-0.5">Link your account with external services.</p>
              </div>
              <button className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors">
                Manage
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-base text-red-400">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Google</div>
                    <div className="text-[11px] text-zinc-400">Sign in with Google</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Connected
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-base text-emerald-400">
                    #
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Slack</div>
                    <div className="text-[11px] text-zinc-400">Receive notifications</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Connected
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-base text-zinc-300">
                    &lt;/&gt;
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">GitHub</div>
                    <div className="text-[11px] text-zinc-400">Connect for integrations</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                    Not connected
                  </span>
                  <button className="px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors">
                    Connect
                  </button>
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
                <p className="text-[11px] text-zinc-400 mt-0.5">Your account details and plan information.</p>
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors">
                <span>Edit</span>
                <Edit2 className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-zinc-800/60">
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Organization</span>
                <span className="font-semibold text-white">Acme Corp</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Member Since</span>
                <span className="text-zinc-300">Aug 15, 2026</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Account Type</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Pro
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Account Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Active
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Total Team Members</span>
                <span className="text-zinc-300">8</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Monthly Call Credits</span>
                <span className="font-mono text-zinc-200">100,000</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-zinc-400">Used This Month</span>
                <span className="font-mono text-zinc-200">12,450 (12%)</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white">Quick Actions</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">Common account actions.</p>

            <div className="space-y-1">
              <NavLink
                to="/settings/security"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      Change Password
                    </div>
                    <div className="text-[10px] text-zinc-500">Update your account password</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </NavLink>

              <NavLink
                to="/settings/security"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      Enable Two-Factor Authentication
                    </div>
                    <div className="text-[10px] text-zinc-500">Add an extra layer of security</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </NavLink>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 cursor-pointer transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-purple-400 transition-colors">
                      Manage Connected Accounts
                    </div>
                    <div className="text-[10px] text-zinc-500">Google, Slack, and more</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>

              <div
                onClick={handleDownloadData}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/40 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce text-indigo-400' : ''}`} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {isExporting ? 'Generating Export...' : 'Download Your Data (GDPR Art. 20)'}
                    </div>
                    <div className="text-[10px] text-zinc-500">Export JSON archive of your personal account data</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>

              <div
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteConfirmText('');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-rose-500/10 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-rose-300 group-hover:text-rose-200 transition-colors">
                      Delete Account (GDPR Art. 17)
                    </div>
                    <div className="text-[10px] text-zinc-500">Permanently purge personal profile data</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </div>
            </div>
          </div>

          {/* Recent Account Activity Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-white">Recent Account Activity</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">View your latest account activities and audit records.</p>
              </div>
              <NavLink to="/settings/audit-logs" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                <span>View Audit Logs</span>
                <span>&rarr;</span>
              </NavLink>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Updated profile information</span>
                </div>
                <span className="text-[11px] text-zinc-500">2 hours ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Changed password</span>
                </div>
                <span className="text-[11px] text-zinc-500">3 days ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-300">Enabled two-factor authentication</span>
                </div>
                <span className="text-[11px] text-zinc-500">1 week ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-zinc-400 font-mono">G</span>
                  <span className="text-xs text-zinc-300">Connected Google account</span>
                </div>
                <span className="text-[11px] text-zinc-500">2 weeks ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GDPR Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1320] border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Permanently Delete Account</h3>
                <p className="text-xs text-rose-400">GDPR Article 17 — Right to Erasure</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action will permanently purge your personal profile details, avatar image, and user preferences.
              This operation is irrevocable.
            </p>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div>To confirm deletion, please type <span className="font-bold text-rose-400">DELETE</span> below:</div>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-[#121624] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500/60 mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim() !== 'DELETE' || isDeleting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Purging Data...' : 'Confirm Permanent Erasure'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
