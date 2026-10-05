import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, Settings, CreditCard, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onOpenCreateAgent?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateAgent }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.profile?.firstName
    ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
    : user?.displayName || 'Yash';

  const companyName = user?.organization?.name || user?.workspace?.name || 'My Organization';

  // Dynamic search placeholder based on current path
  const getSearchPlaceholder = () => {
    if (location.pathname.includes('/agents')) return 'Search agents, models, prompts...';
    if (location.pathname.includes('/campaigns')) return 'Search campaigns, schedules...';
    if (location.pathname.includes('/contacts')) return 'Search contacts, tags, phones...';
    if (location.pathname.includes('/team')) return 'Search members, roles, permissions...';
    if (location.pathname.includes('/settings')) return 'Search settings, billing, users...';
    if (location.pathname.includes('/help')) return 'Search documentation, guides, or ask a question...';
    return 'Search calls, campaigns, agents...';
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-[#080b11] sticky top-0 z-40 px-6 flex items-center justify-between gap-4 select-none">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          className="w-full bg-[#0c101b] border border-zinc-800/80 hover:border-zinc-700 rounded-xl pl-10 pr-14 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-zinc-500 font-mono pointer-events-none">
          <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded text-zinc-400 border border-zinc-700/80">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-zinc-800/80 rounded text-zinc-400 border border-zinc-700/80">K</kbd>
        </div>
      </div>

      {/* Right Controls: Notification Bell + User Profile */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Bell Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-800/50"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 ring-2 ring-[#080b11]" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                {displayName}
              </div>
              <div className="text-[10px] text-zinc-400 leading-tight mt-0.5">{companyName}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-[#0c101b] border border-zinc-800 rounded-2xl p-2 shadow-2xl space-y-1 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                <p className="font-bold text-white text-xs">{displayName}</p>
                <p className="text-[11px] text-zinc-400 font-mono truncate">{user?.email || 'user@samvada.ai'}</p>
              </div>

              <Link
                to="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <User className="w-4 h-4 text-zinc-400" />
                <span>Profile & Account</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-zinc-400" />
                <span>Settings</span>
              </Link>

              <Link
                to="/settings/billing"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-zinc-400" />
                <span>Billing & Usage</span>
              </Link>

              <Link
                to="/settings/team"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
              >
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Team & Members</span>
              </Link>

              <div className="border-t border-zinc-800/80 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
