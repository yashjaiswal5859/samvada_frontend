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
  Key
} from 'lucide-react';

interface SettingsNavProps {
  title?: string;
  subtitle?: string;
}

export const SettingsNav: React.FC<SettingsNavProps> = ({
  title = 'Settings',
  subtitle = 'Manage your workspace, profile, team permissions, billing, security, and developer integrations.'
}) => {
  const tabs = [
    { label: 'General', path: '/settings', icon: Building2 },
    { label: 'Profile', path: '/settings/profile', icon: User },
    { label: 'Team Members', path: '/settings/team', icon: Users2 },
    { label: 'Billing & Usage', path: '/settings/billing', icon: CreditCard },
    { label: 'Security', path: '/settings/security', icon: Shield },
    { label: 'Audit Logs', path: '/settings/audit-logs', icon: FileText },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Integrations & Keys', path: '/integrations', icon: Key },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
      </div>

      {/* Unified Settings Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-800 pb-2 text-xs font-medium no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/settings'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap transition-all select-none ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
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
