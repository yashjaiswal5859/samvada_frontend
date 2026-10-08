import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown, User, Settings, CreditCard, Users, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onOpenCreateAgent?: () => void;
  onOpenMobileNav?: () => void;
  theme?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateAgent, onOpenMobileNav, theme = 'dark' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const searchItems = [
    { label: 'Home', path: '/home', terms: 'home overview setup' },
    { label: 'Agents', path: '/agents', terms: 'agents assistant voice builder' },
    { label: 'Create with AI', path: '/ai-studio', terms: 'create agent ai prompt' },
    { label: 'Knowledge base', path: '/knowledge', terms: 'knowledge documents upload' },
    { label: 'Contacts', path: '/contacts', terms: 'contacts audience customers' },
    { label: 'Campaigns', path: '/campaigns', terms: 'campaigns outbound calls' },
    { label: 'Phone numbers', path: '/telephony', terms: 'phone numbers telephony' },
    { label: 'Call history', path: '/calls', terms: 'calls recordings history' },
    { label: 'Analytics', path: '/analytics', terms: 'analytics reports' },
    { label: 'Team', path: '/settings/team', terms: 'team members invite' },
    { label: 'Billing', path: '/settings/billing', terms: 'billing invoices plan' },
    { label: 'Settings', path: '/settings', terms: 'settings organization security' },
    { label: 'Help', path: '/help', terms: 'help support documentation' },
  ];
  const searchResults = searchQuery.trim()
    ? searchItems.filter((item) => `${item.label} ${item.terms}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 5)
    : [];

  const isLight = theme === 'light';

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

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const openSearchResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
  };

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
    <header
      className={`h-16 sticky top-0 z-40 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none backdrop-blur-xl transition-colors ${
        isLight
          ? 'border-b border-slate-200 bg-white/95 text-slate-800'
          : 'border-b border-blue-900/30 bg-[#060a16]/90 text-zinc-100'
      }`}
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className={`lg:hidden shrink-0 p-2 -ml-1 rounded-lg transition-colors ${isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-zinc-300 hover:bg-zinc-800'}`}
      >
        <Menu className="w-5 h-5" />
      </button>
      {/* Search Input Bar */}
      <div className="relative flex-1 min-w-0 max-w-xl">
        <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
        <input
          ref={searchRef}
          type="text"
          aria-label="Search pages and tools"
          placeholder={getSearchPlaceholder()}
          value={searchQuery}
          onFocus={() => setSearchOpen(true)}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && searchResults[0]) openSearchResult(searchResults[0].path);
            if (event.key === 'Escape') setSearchOpen(false);
          }}
          className={`w-full rounded-xl pl-10 pr-14 py-2 text-xs transition-all ${
            isLight
              ? 'bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 focus:bg-white shadow-2xs'
              : 'bg-[#0c101b] border border-zinc-800/80 hover:border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 shadow-inner'
          }`}
        />
        <div className={`hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-mono pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
          <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80'}`}>⌘</kbd>
          <kbd className={`px-1.5 py-0.5 rounded border ${isLight ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/80'}`}>K</kbd>
        </div>
        {searchOpen && searchQuery.trim() && (
          <div className={`absolute left-0 right-0 top-full mt-2 rounded-xl border p-1.5 shadow-xl z-50 ${isLight ? 'bg-white border-slate-200' : 'bg-[#0c101b] border-zinc-800'}`} role="listbox" aria-label="Search results">
            {searchResults.length ? searchResults.map((item) => (
              <button key={item.path} type="button" role="option" aria-selected="false" onMouseDown={(event) => event.preventDefault()} onClick={() => openSearchResult(item.path)} className={`w-full text-left rounded-lg px-3 py-2 text-xs ${isLight ? 'text-slate-700 hover:bg-slate-50' : 'text-zinc-200 hover:bg-zinc-800'}`}>
                {item.label}<span className="float-right text-[10px] opacity-60">Open</span>
              </button>
            )) : <p className={`px-3 py-2 text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>No matching pages. Try agents, contacts, billing, or help.</p>}
          </div>
        )}
      </div>

      {/* Right Controls: Notification Bell + User Profile */}
      <div className="flex items-center gap-2 sm:gap-5 shrink-0">
        {/* Bell Icon */}
        <button
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className={`relative transition-colors p-1.5 rounded-lg ${
            isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
          }`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className={`w-2 h-2 rounded-full bg-emerald-500 absolute top-1 right-1 ring-2 ${isLight ? 'ring-white' : 'ring-[#080b11]'}`} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shadow-md ${
              isLight ? 'bg-emerald-950 text-white shadow-xs' : 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
            }`}>
              {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className={`text-xs font-semibold leading-tight transition-colors ${
                isLight ? 'text-slate-900 group-hover:text-emerald-700' : 'text-white font-bold group-hover:text-emerald-400'
              }`}>
                {displayName}
              </div>
              <div className={`text-[10px] leading-tight mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{companyName}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-colors ${isLight ? 'text-slate-400 group-hover:text-slate-700' : 'text-zinc-400 group-hover:text-white'}`} />
          </button>

          {dropdownOpen && (
            <div className={`absolute right-0 mt-3 w-56 rounded-2xl p-2 shadow-2xl space-y-1 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
              isLight
                ? 'bg-white border border-slate-200 text-slate-700'
                : 'bg-[#0c101b] border border-zinc-800 text-zinc-100'
            }`}>
              <div className={`px-3 py-2 border-b mb-1 ${isLight ? 'border-slate-100' : 'border-zinc-800/80'}`}>
                <p className={`font-semibold text-xs ${isLight ? 'text-slate-900' : 'text-white font-bold'}`}>{displayName}</p>
                <p className={`text-[11px] font-mono truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>{user?.email || 'user@samvada.ai'}</p>
              </div>

              <Link
                to="/settings/profile"
                onClick={() => setDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <User className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                <span>Profile & Account</span>
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Settings className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                <span>Settings</span>
              </Link>

              <Link
                to="/settings/billing"
                onClick={() => setDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <CreditCard className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                <span>Billing & Usage</span>
              </Link>

              <Link
                to="/settings/team"
                onClick={() => setDropdownOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <Users className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-400'}`} />
                <span>Team & Members</span>
              </Link>

              <div className={`border-t pt-1 mt-1 ${isLight ? 'border-slate-100' : 'border-zinc-800/80'}`}>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left ${
                    isLight ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
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
