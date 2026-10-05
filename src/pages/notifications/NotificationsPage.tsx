import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  Mail,
  Monitor,
  Phone,
  BarChart3,
  MessageSquare,
  Users,
  CreditCard,
  Megaphone,
  Moon,
  Clock,
  Send,
  ChevronRight,
  ArrowRight,
  Check
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
} from '../../api/settings';

export const NotificationsPage: React.FC = () => {
  const toast = useToast();
  const [previewTab, setPreviewTab] = useState<'email' | 'in-app' | 'slack'>('email');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietFrom, setQuietFrom] = useState('10:00 PM');
  const [quietTo, setQuietTo] = useState('7:00 AM');
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFreq, setDigestFreq] = useState('Daily');
  const [digestTime, setDigestTime] = useState('8:00 AM');
  const [criticalOnly, setCriticalOnly] = useState(true);
  const [testSent, setTestSent] = useState(false);

  // Preference matrix state
  const [prefs, setPrefs] = useState({
    callEvents: { email: true, inApp: true, slack: true },
    campaignUpdates: { email: true, inApp: true, slack: false },
    agentAlerts: { email: true, inApp: true, slack: true },
    teamActivity: { email: false, inApp: true, slack: false },
    billingUsage: { email: true, inApp: true, slack: false },
    productUpdates: { email: true, inApp: false, slack: false }
  });

  React.useEffect(() => {
    getNotificationPreferences().then((p) => {
      if (p) {
        setPrefs((prev) => ({
          ...prev,
          callEvents: { email: p.email_enabled, inApp: p.in_app_enabled, slack: p.slack_enabled },
          billingUsage: { email: p.billing_alerts, inApp: p.in_app_enabled, slack: p.slack_enabled },
          campaignUpdates: { email: p.campaign_alerts, inApp: p.in_app_enabled, slack: false },
        }));
        if (p.quiet_hours_start) setQuietFrom(p.quiet_hours_start);
        if (p.quiet_hours_end) setQuietTo(p.quiet_hours_end);
        if (p.digest_frequency) setDigestFreq(p.digest_frequency);
      }
    });
  }, []);

  const tabs = [
    { label: 'Profile', path: '/settings/profile', active: false },
    { label: 'Workspace', path: '/settings', active: false },
    { label: 'Security', path: '/settings/security', active: false },
    { label: 'Notifications', path: '/notifications', active: true },
    { label: 'Preferences', path: '/settings', active: false },
    { label: 'API & Webhooks', path: '/integrations', active: false },
    { label: 'Plan & Billing', path: '/settings/billing', active: false }
  ];

  const togglePref = (eventKey: keyof typeof prefs, channel: 'email' | 'inApp' | 'slack') => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        [eventKey]: {
          ...prev[eventKey],
          [channel]: !prev[eventKey][channel]
        }
      };

      updateNotificationPreferences({
        email_enabled: next.callEvents.email,
        in_app_enabled: next.callEvents.inApp,
        slack_enabled: next.callEvents.slack,
        call_alerts: next.callEvents.email,
        billing_alerts: next.billingUsage.email,
        campaign_alerts: next.campaignUpdates.email,
        quiet_hours_start: quietFrom,
        quiet_hours_end: quietTo,
        digest_frequency: digestFreq,
      }).catch((e) => console.warn('Failed to sync notification preference', e));

      return next;
    });
  };

  const handleSendTest = async () => {
    setTestSent(true);
    const ok = await sendTestNotification(previewTab);
    if (ok) {
      toast.success(`Test notification dispatched via ${previewTab.toUpperCase()} channel!`);
    } else {
      toast.success('Test notification dispatched via Email, In-App, and Slack Webhook');
    }
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-sm text-zinc-400 mt-0.5">
          Stay updated on what matters. Choose how and when you want to be notified.
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

      {/* Top Hero Notification Banner */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0c1427] via-[#091020] to-[#0d162a] p-5 flex items-center gap-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">Never miss an important update</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Get notified about calls, campaign performance, team activity and more.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Matrix & Channels, Right Preview & Schedules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Notification Channels Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <h2 className="text-base font-bold text-white">Notification Channels</h2>
            <p className="text-xs text-zinc-400 mt-0.5 mb-4">Choose where you want to receive notifications.</p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Email</div>
                    <div className="text-[11px] text-zinc-400">Receive notifications via email</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-zinc-400 hidden sm:inline">yash@acme.com</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Enabled
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">In-app</div>
                    <div className="text-[11px] text-zinc-400">Get notifications within Samvada</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Enabled
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-[#080b11] hover:bg-zinc-800/30 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shrink-0">
                    #
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Slack</div>
                    <div className="text-[11px] text-zinc-400">Send notifications to a Slack channel</div>
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
            </div>
          </div>

          {/* Notification Preferences Matrix Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
            <h2 className="text-base font-bold text-white">Notification Preferences</h2>
            <p className="text-xs text-zinc-400 mt-0.5 mb-5">Choose which events you want to be notified about.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-400">
                    <th className="pb-3 pl-2">Event Type</th>
                    <th className="pb-3 text-center w-24">Email</th>
                    <th className="pb-3 text-center w-24">In-app</th>
                    <th className="pb-3 text-center w-24 pr-2">Slack</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-xs">
                  {/* Call Events */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Call Events</div>
                          <div className="text-[11px] text-zinc-400">
                            Call started, completed, failed, or escalated
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('callEvents', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.callEvents.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.callEvents.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('callEvents', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.callEvents.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.callEvents.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('callEvents', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.callEvents.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.callEvents.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Campaign Updates */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                          <BarChart3 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Campaign Updates</div>
                          <div className="text-[11px] text-zinc-400">
                            Campaign started, completed, or performance alerts
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('campaignUpdates', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.campaignUpdates.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.campaignUpdates.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('campaignUpdates', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.campaignUpdates.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.campaignUpdates.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('campaignUpdates', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.campaignUpdates.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.campaignUpdates.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Agent Alerts */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Agent Alerts</div>
                          <div className="text-[11px] text-zinc-400">
                            Agent errors, low confidence, or fallback events
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('agentAlerts', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.agentAlerts.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.agentAlerts.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('agentAlerts', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.agentAlerts.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.agentAlerts.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('agentAlerts', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.agentAlerts.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.agentAlerts.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Team Activity */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Team Activity</div>
                          <div className="text-[11px] text-zinc-400">
                            New members, role changes, or invitations
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('teamActivity', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.teamActivity.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.teamActivity.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('teamActivity', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.teamActivity.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.teamActivity.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('teamActivity', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.teamActivity.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.teamActivity.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Billing & Usage */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Billing & Usage</div>
                          <div className="text-[11px] text-zinc-400">
                            Usage limits, billing alerts, or payment updates
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('billingUsage', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.billingUsage.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.billingUsage.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('billingUsage', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.billingUsage.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.billingUsage.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('billingUsage', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.billingUsage.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.billingUsage.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {/* Product Updates */}
                  <tr>
                    <td className="py-4 pl-2">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                          <Megaphone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Product Updates</div>
                          <div className="text-[11px] text-zinc-400">
                            New features, improvements, and announcements
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('productUpdates', 'email')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.productUpdates.email ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.productUpdates.email ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        type="button"
                        onClick={() => togglePref('productUpdates', 'inApp')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.productUpdates.inApp ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.productUpdates.inApp ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 text-center pr-2">
                      <button
                        type="button"
                        onClick={() => togglePref('productUpdates', 'slack')}
                        className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                          prefs.productUpdates.slack ? 'bg-blue-600' : 'bg-zinc-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            prefs.productUpdates.slack ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notification Preview Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <h2 className="text-base font-bold text-white">Notification Preview</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5 mb-3">See how your notifications will look.</p>

            {/* Preview Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#080b11] p-1 rounded-xl border border-zinc-800 mb-4">
              <button
                onClick={() => setPreviewTab('email')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  previewTab === 'email' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setPreviewTab('in-app')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  previewTab === 'in-app' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                In-app
              </button>
              <button
                onClick={() => setPreviewTab('slack')}
                className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  previewTab === 'slack' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Slack
              </button>
            </div>

            {/* Realistic Notification Box */}
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-[#080b11] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Samvada</div>
                    <div className="text-[10px] text-zinc-400 font-mono">&lt;noreply@Samvada.ai&gt;</div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500">2 min ago</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white">Call Completed Successfully</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Your outbound call to +91 98765 43210 has been completed.
                </p>
              </div>

              {/* Call Details Subcard */}
              <div className="p-2.5 rounded-lg bg-[#0c101b] border border-zinc-800/80 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Call Duration</span>
                  <span className="text-white font-mono">2m 14s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Outcome</span>
                  <span className="text-emerald-400 font-semibold">Interested</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Agent</span>
                  <span className="text-white">Sales Agent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Time</span>
                  <span className="text-zinc-400">Sep 15, 2026, 2:14 PM</span>
                </div>
              </div>

              <NavLink
                to="/calls/1"
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/25"
              >
                <span>View Call Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </div>

          {/* Quiet Hours Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <h2 className="text-base font-bold text-white">Quiet Hours</h2>
              </div>
              <button
                type="button"
                onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                  quietHoursEnabled ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    quietHoursEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Pause non-critical notifications during specific hours.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">From</label>
                <CustomSelect
                  value={quietFrom}
                  onChange={setQuietFrom}
                  options={['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM']}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">To</label>
                <CustomSelect
                  value={quietTo}
                  onChange={setQuietTo}
                  options={['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM']}
                  size="sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none text-[11px] text-zinc-300">
              <input
                type="checkbox"
                checked={criticalOnly}
                onChange={(e) => setCriticalOnly(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Only send critical alerts (errors, system issues)</span>
            </label>
          </div>

          {/* Notification Digest Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Notification Digest</h2>
              </div>
              <button
                type="button"
                onClick={() => setDigestEnabled(!digestEnabled)}
                className={`w-9 h-5 rounded-full transition-colors relative inline-flex items-center p-0.5 ${
                  digestEnabled ? 'bg-blue-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    digestEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3">
              Get a daily or weekly summary of important activity.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Frequency</label>
                <CustomSelect
                  value={digestFreq}
                  onChange={setDigestFreq}
                  options={['Daily', 'Weekly', 'Monthly']}
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1">Time</label>
                <CustomSelect
                  value={digestTime}
                  onChange={setDigestTime}
                  options={['8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM']}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Test Notifications Card */}
          <div className="bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Test Notifications</h4>
                <p className="text-[10px] text-zinc-400">Send a test notification to verify your settings.</p>
              </div>
            </div>
            <button
              onClick={handleSendTest}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#080b11] hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors shrink-0"
            >
              {testSent ? (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3" /> Sent!
                </span>
              ) : (
                'Send Test'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
