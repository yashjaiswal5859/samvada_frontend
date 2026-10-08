import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Loader2, Save, Users, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { SettingsNav } from '../../components/layout/SettingsNav';
import { getUserProfile, updateUserProfile, uploadAvatar, UserProfileData } from '../../api/settings';

export const ProfileSettingsPage: React.FC = () => {
  const { user, activeOrg } = useAuth();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Partial<UserProfileData>>({
    first_name: user?.profile?.firstName || user?.displayName?.split(' ')[0] || '',
    last_name: user?.profile?.lastName || user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    company: user?.companyName || activeOrg?.name || '',
  });
  const [avatar, setAvatar] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const loadProfile = async () => {
    setIsLoading(true);
    setLoadError('');
    const result = await getUserProfile();
    if (!result) {
      setLoadError('Saved profile details could not be loaded. Sign-in details are shown where available.');
    } else {
      setProfile((current) => ({ ...current, ...result }));
      setAvatar(result.avatar_url || '');
    }
    setIsLoading(false);
  };

  useEffect(() => { void loadProfile(); }, [user?.id]);

  const setField = (field: keyof UserProfileData, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile.first_name?.trim()) {
      toast.error('Enter your first name to save your profile.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await updateUserProfile({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name?.trim(),
        phone: profile.phone?.trim(),
        job_title: profile.job_title?.trim(),
        timezone: profile.timezone?.trim(),
        language: profile.language?.trim(),
        bio: profile.bio?.trim(),
      });
      if (!saved) throw new Error('The server did not confirm your profile changes.');
      setProfile((current) => ({ ...current, ...saved }));
      toast.success('Profile saved.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast.error('Choose an image smaller than 5 MB.');
      return;
    }
    setIsUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (!url) throw new Error('The server did not confirm the photo upload.');
      setAvatar(url);
      toast.success('Profile photo updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not upload your photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const fields: { key: keyof UserProfileData; label: string; type?: string }[] = [
    { key: 'first_name', label: 'First name' },
    { key: 'last_name', label: 'Last name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'job_title', label: 'Job title' },
    { key: 'timezone', label: 'Time zone' },
    { key: 'language', label: 'Language' },
  ];

  return (
    <div className="space-y-6 pb-10">
      <SettingsNav title="Profile" subtitle="Manage the personal details associated with your sign-in." />

      {loadError && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><span>{loadError}</span><button type="button" onClick={() => void loadProfile()} className="font-medium underline">Retry</button></div>}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5">
            {avatar ? <img src={avatar} alt="Profile" className="h-14 w-14 rounded-full object-cover" /> : <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">{profile.first_name?.[0]?.toUpperCase() || 'U'}</div>}
            <div className="min-w-0 flex-1"><p className="font-semibold text-slate-900">{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Your profile'}</p><p className="truncate text-sm text-slate-500">{profile.email || user?.email || 'Email unavailable'}</p></div>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            <button type="button" onClick={() => fileInput.current?.click()} disabled={isUploading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">{isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}Photo</button>
          </div>

          {isLoading ? <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading profile…</div> : <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(({ key, label, type = 'text' }) => <label key={key} className="block text-sm font-medium text-slate-700">{label}{key === 'first_name' && <span className="text-rose-600"> *</span>}<input type={type} value={String(profile[key] || '')} onChange={(event) => setField(key, event.target.value)} readOnly={key === 'email'} required={key === 'first_name'} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 read-only:bg-slate-50 read-only:text-slate-500" /></label>)}
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">About you <span className="font-normal text-slate-400">(optional)</span><textarea rows={4} maxLength={300} value={profile.bio || ''} onChange={(event) => setField('bio', event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <div className="mt-1 text-right text-xs text-slate-500">{(profile.bio || '').length}/300</div>
            <div className="mt-5 flex justify-end"><button type="submit" disabled={isSaving || !!loadError} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSaving ? 'Saving…' : 'Save profile'}</button></div>
          </>}
        </form>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Workspace</h2><p className="mt-1 text-sm text-slate-600">{activeOrg?.name || user?.companyName || 'Organization unavailable'}</p><p className="mt-1 text-xs text-slate-500">{user?.role || 'Workspace role unavailable'}</p></div>
          <nav aria-label="Account settings" className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <Link to="/settings/team" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"><Users className="h-4 w-4 text-slate-500" />Team access</Link>
            <Link to="/settings/billing" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"><CreditCard className="h-4 w-4 text-slate-500" />Billing and usage</Link>
            <Link to="/settings/security" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"><Shield className="h-4 w-4 text-slate-500" />Security</Link>
          </nav>
        </aside>
      </div>
    </div>
  );
};
