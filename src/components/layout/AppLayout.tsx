import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CreateAgentModal } from '../modals/CreateAgentModal';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070b16] flex text-zinc-100 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Refined, formal enterprise ambient backdrop */}
      <div className="fixed top-0 right-1/4 w-[750px] h-[380px] bg-blue-600/8 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed -bottom-36 -left-36 w-[560px] h-[560px] bg-blue-900/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed -bottom-28 -right-28 w-[450px] h-[450px] bg-slate-800/15 rounded-full blur-[140px] pointer-events-none z-0" />

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        <Header onOpenCreateAgent={() => setIsCreateAgentOpen(true)} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
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
