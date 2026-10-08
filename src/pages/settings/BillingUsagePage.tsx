import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, RefreshCw, Wallet } from 'lucide-react';
import { getBillingUsage, getWalletBalance } from '../../api/settings';
import { BillingUsage, OrganizationWallet } from '../../types';
import { SettingsNav } from '../../components/layout/SettingsNav';

export const BillingUsagePage: React.FC = () => {
  const [billing, setBilling] = useState<BillingUsage | null>(null);
  const [wallet, setWallet] = useState<OrganizationWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usage, balance] = await Promise.all([getBillingUsage(), getWalletBalance()]);
      setBilling(usage);
      setWallet(balance);
    } catch (reason) {
      setBilling(null);
      setWallet(null);
      setError(reason instanceof Error ? reason.message : 'Billing information is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const usagePercent = billing && billing.minutesLimit > 0 ? Math.min(100, Math.round((billing.minutesUsed / billing.minutesLimit) * 100)) : null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      <SettingsNav title="Billing and usage" subtitle="Review your plan, wallet balance, and reported voice usage." />
      <div className="flex justify-end"><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</button></div>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><CreditCard className="h-4 w-4" />Plan</div>
          <p className="mt-4 text-2xl font-semibold text-slate-900">{loading ? '…' : billing?.planName || 'Unavailable'}</p>
          <p className="mt-2 text-sm text-slate-500">{billing?.billingCycleEnd ? `Cycle ends ${new Date(billing.billingCycleEnd).toLocaleDateString()}` : 'Billing cycle details were not provided.'}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Wallet className="h-4 w-4" />Wallet balance</div>
          <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">{loading ? '…' : wallet ? `${wallet.currency} ${wallet.balanceUSD.toFixed(2)}` : 'Unavailable'}</p>
          <p className="mt-2 text-sm text-slate-500">Current balance returned by the billing service.</p>
        </article>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4"><div><h2 className="text-base font-semibold text-slate-900">Voice minutes</h2><p className="mt-1 text-sm text-slate-500">Usage from the current billing period.</p></div><span className="text-sm font-medium tabular-nums text-slate-700">{billing ? `${billing.minutesUsed.toLocaleString()} / ${billing.minutesLimit.toLocaleString()} min` : '—'}</span></div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${usagePercent ?? 0}%` }} /></div>
        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{usagePercent === null ? 'Usage limit unavailable' : `${usagePercent}% used`}</span><span>{billing ? `Reported spend: $${billing.costThisMonthUsd.toFixed(2)}` : 'Spend unavailable'}</span></div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Recent wallet activity</h2>
        {!wallet?.recentTransactions?.length ? <p className="mt-3 text-sm text-slate-500">No wallet transactions were returned.</p> : <ul className="mt-3 divide-y divide-slate-100">{wallet.recentTransactions.map((transaction) => <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><span className="block font-medium text-slate-800">{transaction.description}</span><span className="mt-1 block text-xs text-slate-500">{new Date(transaction.createdAt).toLocaleString()}</span></span><span className="font-medium tabular-nums text-slate-900">${transaction.amountUSD.toFixed(2)}</span></li>)}</ul>}
      </section>
    </div>
  );
};
