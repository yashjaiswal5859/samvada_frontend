import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  MessageSquare,
  Laptop,
  Smartphone,
  Monitor,
  MoreVertical,
  Mail,
  Clock,
  Globe,
  ChevronRight,
  Check,
  X,
  Copy
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const SecuritySettingsPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [require2faTeam, setRequire2faTeam] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 days');
  const [allowlistIp, setAllowlistIp] = useState(false);

  const [showQrModal, setShowQrModal] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const tabs = [
    { label: 'Profile', path: '/settings/profile', active: false },
    { label: 'Workspace', path: '/settings', active: false },
    { label: 'Security', path: '/settings/security', active: true },
    { label: 'Notifications', path: '/notifications', active: false },
    { label: 'Preferences', path: '/settings', active: false },
    { label: 'API & Webhooks', path: '/integrations', active: false },
    { label: 'Plan & Billing', path: '/settings/billing', active: false }
  ];

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Security credentials updated successfully');
    setTimeout(() => setPasswordSuccess(false), 3000);
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

      {/* Top Hero Security Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0c1427] via-[#091020] to-[#0d162a] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Keep your account secure</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              We take security seriously. Manage your authentication methods, active sessions, and access controls.
            </p>
          </div>
        </div>

        {/* Right 3D lock graphic & quote */}
        <div className="flex items-center gap-3 z-10">
          <div className="relative w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-lg shadow-blue-500/20">
            <Lock className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <p className="font-serif italic text-blue-200/90 text-xs tracking-wide">
            "Stronger security<br />for a brighter tomorrow"
          </p>
        </div>
      </div>

      {/* Main Grid: Left Security Forms, Right Methods & Prefs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Password Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Password</h2>
                  <p className="text-xs text-zinc-400">Update your password regularly to keep your account secure.</p>
                </div>
              </div>
              <button
                onClick={handleUpdatePassword}
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors"
              >
                {passwordSuccess ? 'Password Updated!' : 'Update Password'}
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#080b11] border border-zinc-800 rounded-xl text-xs text-white pr-10 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Two-Factor Authentication (2FA) Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Two-Factor Authentication (2FA)</h2>
                  <p className="text-xs text-zinc-400">Add an extra layer of security to your account.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300 font-medium">Enabled</span>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    twoFactorEnabled ? 'bg-emerald-500' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Authenticator App */}
              <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Authenticator App</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Use Google Authenticator, Authy, or similar apps.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/25 shrink-0"
                >
                  View QR Code
                </button>
              </div>

              {/* SMS Authentication */}
              <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-zinc-300 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">SMS Authentication</span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Receive a verification code via SMS.</p>
                  </div>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors shrink-0">
                  Enable
                </button>
              </div>
            </div>
          </div>

          {/* Active Sessions Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Laptop className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Active Sessions</h2>
                  <p className="text-xs text-zinc-400">Manage your active sessions across different devices.</p>
                </div>
              </div>
              <button
                onClick={() => toast.success('All other 2 active sessions terminated across devices')}
                className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors active:scale-[0.985]"
              >
                Sign Out All
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">MacBook Pro</span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Current Session
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">macOS • Chrome 128.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 hidden sm:inline">Indore, India</span>
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md">This Device</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">iPhone 15</span>
                      <span className="text-xs text-zinc-500">• Last active 2 hours ago</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">iOS • Safari 17.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 hidden sm:inline">Indore, India</span>
                  <button
                    onClick={() => toast.success('iPhone 15 session revoked')}
                    className="px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-300 text-xs transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Windows PC</span>
                      <span className="text-xs text-zinc-500">• Last active 1 day ago</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Windows • Edge 128.0</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 hidden sm:inline">Indore, India</span>
                  <button
                    onClick={() => toast.success('Windows PC session revoked')}
                    className="px-2.5 py-1 rounded-lg border border-zinc-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-300 text-xs transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Login Methods Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white">Login Methods</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">Manage how you sign in to your account.</p>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Email & Password</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{user?.email || 'user@example.com'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Active
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-red-400 font-mono">G</span>
                  <div>
                    <div className="text-xs font-semibold text-white">Google</div>
                    <div className="text-[10px] text-zinc-400">Connected</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Active
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-400 font-mono">&lt;&gt;</span>
                  <div>
                    <div className="text-xs font-semibold text-white">GitHub</div>
                    <div className="text-[10px] text-zinc-400">Not connected</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors">
                  Connect
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-emerald-400 font-mono">#</span>
                  <div>
                    <div className="text-xs font-semibold text-white">Slack</div>
                    <div className="text-[10px] text-zinc-400">Not connected</div>
                  </div>
                </div>
                <button className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors">
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Security Preferences Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white">Security Preferences</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">Configure additional security settings.</p>

            <div className="space-y-3.5 text-xs divide-y divide-zinc-800/60">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Require 2FA for all team members</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Enforce two-factor authentication for everyone in your workspace.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRequire2faTeam(!require2faTeam)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    require2faTeam ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      require2faTeam ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Login alerts</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Get notified of new login attempts.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLoginAlerts(!loginAlerts)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    loginAlerts ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      loginAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-zinc-200">Session timeout</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Automatically log out after a period of inactivity.
                  </div>
                </div>
                <div className="w-32 shrink-0">
                  <CustomSelect
                    value={sessionTimeout}
                    onChange={(val) => {
                      setSessionTimeout(val);
                      toast.success(`Session timeout updated to ${val}`);
                    }}
                    options={['30 days', '14 days', '7 days', '24 hours']}
                    size="sm"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Allowlist IP addresses</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Restrict access to specific IP addresses.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !allowlistIp;
                    setAllowlistIp(next);
                    if (next) {
                      toast.info('IP Allowlist enabled. Make sure your current IP is whitelisted.');
                    } else {
                      toast.info('IP Allowlist disabled.');
                    }
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                    allowlistIp ? 'bg-blue-600' : 'bg-zinc-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      allowlistIp ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Security Activity Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-white">Recent Security Activity</h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">View your latest security events.</p>
              </div>
              <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <span>View All</span>
                <span>&rarr;</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div>
                    <div className="font-semibold text-zinc-200">Successful login</div>
                    <div className="text-[10px] text-zinc-500">Chrome on macOS</div>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono tabular-nums">Today, 10:24 AM</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <div className="font-semibold text-zinc-200">Password updated</div>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono tabular-nums">Today, 9:12 AM</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <div className="font-semibold text-zinc-200">2FA enabled</div>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono tabular-nums">Sep 12, 2026, 4:18 PM</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <div>
                    <div className="font-semibold text-rose-300">Login from new device</div>
                    <div className="text-[10px] text-zinc-500">Windows • Edge</div>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono tabular-nums">Sep 10, 2026, 2:36 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c101b] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Scan Authenticator QR Code</h3>
            <p className="text-xs text-zinc-400">
              Scan this QR code with Google Authenticator or 1Password to bind your token.
            </p>
            <div className="bg-white p-4 rounded-xl inline-block shadow-inner">
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                <path d="M10 10h30v30h-30z M15 15h20v20h-20z M60 10h30v30h-30z M65 15h20v20h-20z M10 60h30v30h-30z M15 65h20v20h-20z M50 20h5v10h-5z M50 40h10v5h-10z M60 60h15v15h-15z M80 60h10v10h-10z M70 80h20v10h-20z" fill="black" />
              </svg>
            </div>
            <div className="flex items-center justify-between bg-[#080b11] p-2.5 rounded-xl border border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-300">
                Samvada-SECRET-AUTH-920482
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('Samvada-SECRET-AUTH-920482');
                  toast.success('2FA Secret key copied to clipboard');
                }}
                className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
                title="Copy Key"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                setShowQrModal(false);
                toast.success('2FA configured and verified successfully');
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-semibold shadow-lg shadow-blue-600/20 active:scale-[0.985] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
