import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateAgentModal } from '../modals/CreateAgentModal';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, theme }) => {
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace } = useWorkspace();

  useEffect(() => setIsMobileNavOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isMobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileNavOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isMobileNavOpen]);

  const isLight = theme !== 'dark';

  return (
    <div
      className={`min-h-screen flex font-sans relative overflow-hidden ${
        isLight
          ? 'portal-light bg-[#f8fafc] text-slate-900 selection:bg-slate-900 selection:text-white'
          : 'bg-[#070b16] text-zinc-100 selection:bg-blue-600 selection:text-white'
      }`}
    >
      {/* Ambient backdrop */}
      {!isLight ? (
        <>
          <div className="fixed top-0 right-1/4 w-[750px] h-[380px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none z-0" />
          <div className="fixed -bottom-36 -left-36 w-[560px] h-[560px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
          <div className="fixed -bottom-28 -right-28 w-[450px] h-[450px] bg-slate-800/15 rounded-full blur-[140px] pointer-events-none z-0" />
        </>
      ) : (
        <>
          <div className="fixed top-0 right-1/4 w-[600px] h-[320px] bg-emerald-50/30 rounded-full blur-[160px] pointer-events-none z-0" />
          <div className="fixed bottom-0 left-1/3 w-[500px] h-[300px] bg-slate-100/60 rounded-full blur-[140px] pointer-events-none z-0" />
        </>
      )}

      {isMobileNavOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <Sidebar
        theme={isLight ? 'light' : 'dark'}
        mobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-white">
        {/* Samvada AI Mission Control Telemetry HUD (Distinctive Top Bar) */}
        {isLight && (
          <div className="min-h-9 px-3 sm:px-6 py-1 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between text-[11px] select-none shrink-0 z-20 overflow-hidden">
            {/* Left: Engine & Telephony Trunk Status */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 shrink-0">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="font-semibold text-slate-800 text-[10px] sm:text-[11px]">Samvada Voice Engine</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-semibold text-[10px] sm:text-[11px]">Ready</span>
              </div>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="hidden sm:inline text-slate-500 font-mono text-[10px]">99.98% SLA</span>
            </div>

            {/* Right: Telephony Concurrency & Instant Quick Action */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-mono text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Trunks:</span>
                <span className="font-semibold text-slate-900">14 / 50 Active</span>
              </div>

              <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 text-[10px] font-semibold">
                <span>Credit:</span>
                <span className="font-mono text-emerald-900">$142.50</span>
              </div>

              <button
                onClick={() => setIsCreateAgentOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors shadow-2xs"
              >
                <span>+ New Agent</span>
              </button>
            </div>
          </div>
        )}

        <Header
          theme={isLight ? 'light' : 'dark'}
          onOpenCreateAgent={() => setIsCreateAgentOpen(true)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
        />
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-white">{children}</main>
      </div>

      <CreateAgentModal
        isOpen={isCreateAgentOpen}
        onClose={() => setIsCreateAgentOpen(false)}
        onSuccess={(agent) => {
          navigate(`/agents/${agent.id}`);
        }}
      />
    </div>
  );
};
