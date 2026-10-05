import React from 'react';
import { NavLink } from 'react-router-dom';
import { PhoneCall, Radio, BarChart3 } from 'lucide-react';

interface CallsNavProps {
  title?: string;
  subtitle?: string;
}

export const CallsNav: React.FC<CallsNavProps> = ({
  title = 'Call Center & Activity',
  subtitle = 'Monitor live calls, inspect past conversation recordings and review performance metrics.'
}) => {
  const tabs = [
    { label: 'Call History', path: '/calls', icon: PhoneCall },
    { label: 'Live Monitor', path: '/calls/live', icon: Radio },
    { label: 'Call Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">{subtitle}</p>
      </div>

      {/* Calls Sub-Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-zinc-800 pb-2 text-xs font-medium no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/calls'}
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
