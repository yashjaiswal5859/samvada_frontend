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
    <div className="min-h-screen bg-[#0a0b0f] flex text-zinc-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
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
