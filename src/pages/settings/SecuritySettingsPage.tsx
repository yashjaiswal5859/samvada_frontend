import React from 'react';
import { AlertTriangle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { SettingsNav } from '../../components/layout/SettingsNav';
import { useAuth } from '../../contexts/AuthContext';

export const SecuritySettingsPage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6 pb-12">
      <SettingsNav title="Security" subtitle="Review your sign-in method and available account protections." />
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <h2 className="font-semibold text-white">Additional security controls are not available yet</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-300">Password changes, authenticator setup, and session revocation are not currently confirmed by the account service. We’ve disabled these controls until they can securely apply and verify changes.</p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-zinc-800 bg-[#0c101b] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-white">Current sign-in</h2>
            <p className="mt-1 text-sm text-zinc-400">Your account is associated with this email address.</p>
            <p className="mt-3 break-all rounded-lg border border-zinc-800 bg-[#080b11] px-3 py-2 text-sm text-zinc-200">{user?.email || 'Email unavailable'}</p>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-zinc-800 bg-[#0c101b] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
          <div>
            <h2 className="font-semibold text-white">Sign-in verification</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-400">Use the verification flow provided at sign-in. This page does not currently have verified data for multi-factor authentication or active device sessions.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
