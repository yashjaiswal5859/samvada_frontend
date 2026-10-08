import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Building2,
  User,
  Users2,
  CreditCard,
  Shield,
  FileText,
  Bell,
  Key,
  Layers
} from 'lucide-react';

interface SettingsNavProps {
  title?: string;
  subtitle?: string;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({
  title = 'Platform & Workspace Settings',
  subtitle = 'Manage organization profile, telephony concurrency quotas, team permissions, security, and billing.'
}) => {
  const tabs = [
    { label: 'General', path: '/settings', icon: Building2 },
    { label: 'Workspaces', path: '/workspaces', icon: Layers },
    { label: 'Team Members', path: '/settings/team', icon: Users2 },
    { label: 'Billing & Quotas', path: '/settings/billing', icon: CreditCard },
    { label: 'Security & BAA', path: '/settings/security', icon: Shield },
    { label: 'Audit Logs', path: '/settings/audit-logs', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Integrations & Keys', path: '/integrations', icon: Key },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>

      {/* Unified Settings Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 text-xs font-medium no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/settings'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
