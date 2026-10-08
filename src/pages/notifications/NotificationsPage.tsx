import React, { useEffect, useState } from 'react';
import { AlertCircle, Bell, Check, Loader2, Save } from 'lucide-react';
import { SettingsNav } from '../../components/layout/SettingsNav';
import { useToast } from '../../contexts/ToastContext';
import { getNotificationPreferences, NotificationPreferencesData, updateNotificationPreferences } from '../../api/settings';

const defaults: NotificationPreferencesData = {
  email_enabled: true,
  in_app_enabled: true,
  slack_enabled: false,
  slack_webhook_url: '',
  call_alerts: true,
  billing_alerts: true,
  campaign_alerts: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  digest_frequency: 'daily',
};

export const NotificationsPage: React.FC = () => {
  const toast = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferencesData>(defaults);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then((result) => {
      if (!result) {
        setLoadError(true);
        return;
      }
      setPreferences({ ...defaults, ...result });
    }).finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof NotificationPreferencesData>(key: K, value: NotificationPreferencesData[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const saved = await updateNotificationPreferences(preferences);
      if (!saved) throw new Error('The server did not confirm the updated preferences.');
      setPreferences({ ...defaults, ...saved });
      setLoadError(false);
      toast.success('Notification preferences saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof NotificationPreferencesData, label: string) => (
    <label key={key} className="flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-900/10">
      <span>
        <span className="block text-sm font-medium !text-slate-900">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={Boolean(preferences[key])}
        onChange={(event) => set(key, event.target.checked as never)}
        disabled={loading || saving || loadError}
        className="h-4 w-4 shrink-0 accent-emerald-700"
        aria-label={label}
      />
    </label>
  );

  return (
    <div className="space-y-6 pb-12">
      <SettingsNav title="Notifications" subtitle="Choose which updates you receive and where they are delivered." />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <h2 className="font-semibold !text-slate-900">Delivery channels</h2>
            <p className="mt-1 text-sm !text-slate-600">Choose where workspace updates should reach you.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {toggle('email_enabled', 'Email')}
          {toggle('in_app_enabled', 'In-app')}
          {toggle('slack_enabled', 'Slack')}
        </div>
        {preferences.slack_enabled && (
          <label className="mt-4 block text-sm !text-slate-700">
            Slack webhook URL
            <input value={preferences.slack_webhook_url || ''} onChange={(e) => set('slack_webhook_url', e.target.value)} disabled={loading || saving || loadError} type="url" placeholder="https://hooks.slack.com/services/..." className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15" />
            <span className="mt-1 block text-xs !text-slate-500">Use a webhook managed by your workspace.</span>
          </label>
        )}
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold !text-slate-900">Alert categories</h2>
        <p className="mt-1 text-sm !text-slate-600">Choose the types of events you want to hear about.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {toggle('call_alerts', 'Call alerts')}
          {toggle('campaign_alerts', 'Campaign alerts')}
          {toggle('billing_alerts', 'Billing alerts')}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold !text-slate-900">Quiet hours</h2>
        <p className="mt-1 text-sm !text-slate-600">Pause non-urgent updates during your local quiet hours.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(['quiet_hours_start', 'quiet_hours_end'] as const).map((key) => (
            <label key={key} className="text-sm !text-slate-700">
              {key === 'quiet_hours_start' ? 'Start' : 'End'}
              <input type="time" value={preferences[key] || ''} onChange={(e) => set(key, e.target.value)} disabled={loading || saving || loadError} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15" />
            </label>
          ))}
          <label className="text-sm !text-slate-700">
            Digest frequency
            <select value={preferences.digest_frequency || 'daily'} onChange={(e) => set('digest_frequency', e.target.value)} disabled={loading || saving || loadError} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15">
              <option value="off">Off</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
            </select>
          </label>
        </div>
      </section>
      {loadError && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-sm text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />Could not load saved preferences. Reload the page before changing them so existing settings are not overwritten.</div>}
      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={loading || saving || loadError} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : loadError ? <AlertCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {loading ? 'Loading…' : saving ? 'Saving…' : loadError ? 'Unavailable' : 'Save preferences'}
          {!loading && !saving && !loadError && <Check className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
