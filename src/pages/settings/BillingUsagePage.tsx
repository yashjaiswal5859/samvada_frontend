import React, { useState, useEffect } from 'react';
import {
  Download,
  Star,
  CheckCircle2,
  Phone,
  Users,
  Database,
  FileText,
  CreditCard,
  Calendar,
  Bell,
  Building2,
  ChevronRight,
  MoreHorizontal,
  Plus,
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  Coins,
  Receipt
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { getBillingUsage, getWalletBalance, topupWallet } from '../../api/settings';
import { BillingUsage, OrganizationWallet } from '../../types';
import { formatDate } from '../../utils/formatters';

export const BillingUsagePage: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [billing, setBilling] = useState<BillingUsage | null>(null);
  const [wallet, setWallet] = useState<OrganizationWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'plans', label: 'Plans & Pricing' },
    { id: 'transactions', label: 'Wallet & Invoices' },
    { id: 'methods', label: 'Payment Methods' },
    { id: 'settings', label: 'Billing Settings' }
  ];

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [billingData, walletData] = await Promise.all([
        getBillingUsage(),
        getWalletBalance(),
      ]);
      setBilling(billingData);
      setWallet(walletData);
    } catch (err) {
      console.error('Failed to load billing details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleTopup = async () => {
    setIsToppingUp(true);
    try {
      const updated = await topupWallet(10.0, 'pm_card_demo');
      setWallet(updated);
      toast.success('Successfully added $10.00 USD to workspace wallet.');
    } catch (err) {
      toast.error('Failed to process demo wallet recharge.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const minutesUsed = billing?.minutesUsed ?? 0;
  const minutesLimit = billing?.minutesLimit ?? 250;
  const usagePercent = Math.min(100, Math.round((minutesUsed / (minutesLimit || 1)) * 100));
  const walletBalance = wallet?.balanceUSD ?? billing?.walletBalanceUsd ?? 5.0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Billing & Usage</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Manage your subscription plan, voice minutes usage, wallet balance, and invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTopup()}
            disabled={isToppingUp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{isToppingUp ? 'Adding Credit...' : 'Add $10.00 Credit'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-6 border-b border-zinc-800 text-xs font-medium">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 transition-colors relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-blue-400 font-semibold border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-xs text-zinc-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading billing and usage telemetry...
        </div>
      ) : (
        <>
          {/* Top Row: Current Plan & Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Current Plan Card (7 Cols) */}
            <div className="lg:col-span-7 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white">Current Plan</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-blue-400" />
                      <span>{billing?.planName || 'Free Trial Tier'}</span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Everything you need to build and scale voice AI assistants.
                </p>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-white tabular-nums">
                        ${walletBalance.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400">USD available credit</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Billing period ends on {formatDate(billing?.billingCycleEnd || new Date().toISOString())}
                    </p>

                    <div className="flex items-center gap-3 mt-5">
                      <button
                        onClick={() => toast.info('Subscription plan upgraded to Scale Tier with volume discounts.')}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md shadow-blue-600/25 cursor-pointer"
                      >
                        Upgrade Plan
                      </button>
                      <button
                        onClick={() => toast.info('Opening Stripe billing portal...')}
                        className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Manage Subscription
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-zinc-300 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Includes {minutesLimit} voice minutes / month</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Unlimited AI voice agents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Real-time call transcripts & audio recording</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Plivo, Twilio, & Exotel SIP integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>REST API & Webhook dispatch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Usage This Month</h2>
                <span className="text-[11px] text-zinc-400 font-mono">Current Cycle</span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-white tabular-nums">{minutesUsed}</span>
                      <span className="text-zinc-400">/ {minutesLimit} minutes</span>
                    </div>
                    <span className="text-zinc-400 font-semibold tabular-nums">{usagePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, usagePercent)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-white tabular-nums">0</span>
                      <span className="text-zinc-400">active campaigns</span>
                    </div>
                    <span className="text-zinc-400 font-semibold tabular-nums">0%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-white tabular-nums">0 MB</span>
                      <span className="text-zinc-400">knowledge base storage</span>
                    </div>
                    <span className="text-zinc-400 font-semibold tabular-nums">0%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Transactions & Invoices (7 cols) + Payment Methods (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Wallet Transactions / Invoices Table (7 Cols) */}
            <div className="lg:col-span-7 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Wallet & Transactions</h2>
                  <p className="text-xs text-zinc-400">Recent credits, refunds, and usage charges.</p>
                </div>
              </div>

              {(!wallet?.recentTransactions || wallet.recentTransactions.length === 0) ? (
                <div className="py-12 text-center space-y-2">
                  <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-semibold text-white">No Invoices or Transactions Yet</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Invoices and transaction receipts will automatically populate here after your calls or credit recharges.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-zinc-800/80 text-[11px] font-semibold text-zinc-400">
                        <th className="pb-3 pl-2">Description</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-xs">
                      {wallet.recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-800/20 transition-colors">
                          <td className="py-3 pl-2 text-white font-medium">{tx.description}</td>
                          <td className="py-3 capitalize text-zinc-400 text-[11px]">
                            {tx.type.replace('_', ' ')}
                          </td>
                          <td className="py-3 font-mono font-semibold text-emerald-400">
                            +${tx.amountUSD.toFixed(2)} USD
                          </td>
                          <td className="py-3 text-zinc-400 font-mono text-[11px]">
                            {formatDate(tx.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payment Method Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#0c101b] border border-zinc-800/80 rounded-2xl p-5 shadow-lg space-y-4">
              <h2 className="text-base font-bold text-white">Payment Method</h2>
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#080b11] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 italic text-xs tracking-wider">
                    TEST
                  </div>
                  <div>
                    <div className="text-xs font-mono font-semibold text-white">Demo Wallet Billing</div>
                    <div className="text-[11px] text-zinc-500">Auto-recharge disabled</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <button
                onClick={() => toast.info('Connect Stripe to add credit cards, UPI, or corporate wire billing.')}
                className="w-full py-2.5 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add Payment Method</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
