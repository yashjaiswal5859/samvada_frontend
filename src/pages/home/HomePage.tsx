import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ExploreAgents } from '../../components/home/ExploreAgents';
import { Plus, Mic, ArrowUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { CreateAgentModal } from '../../components/modals/CreateAgentModal';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [promptText, setPromptText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const firstName = user?.profile?.firstName || user?.displayName?.split(' ')[0] || 'Builder';
  const lastName = user?.profile?.lastName || user?.displayName?.split(' ')[1] || '';
  const fullName = `${firstName} ${lastName}`.trim();

  const suggestedPrompts = [
    'Build an insurance claims processing assistant',
    'Build a dental appointment scheduling agent',
    'Build an outbound payment reminder & debt recovery bot',
  ];

  const handlePromptClick = (text: string) => {
    setPromptText(text);
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto w-full">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Samvada AI Voice Agent Studio</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="text-indigo-400">{fullName}</span>!
          </h1>
          <p className="text-xl font-semibold text-zinc-300 tracking-tight">
            What voice agent do you want to build today?
          </p>
        </div>

        {/* Prompt Input Container */}
        <form onSubmit={handleSendPrompt} className="w-full relative">
          <div className="bg-[#12131a] border border-zinc-800 rounded-2xl p-4 shadow-2xl focus-within:border-indigo-500/80 transition-all flex flex-col min-h-[140px] justify-between">
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. Build an appointment scheduling agent for my dental clinic..."
              className="w-full bg-transparent text-white placeholder-zinc-500 resize-none text-base outline-none font-normal leading-relaxed pr-10"
              rows={3}
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Attach knowledge document"
              >
                <Plus className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Voice dictation"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={!promptText.trim()}
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 flex items-center justify-center text-white transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Suggested Prompts */}
        <div className="w-full space-y-2 text-left">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#12131a]/60 hover:bg-[#161722] text-zinc-300 hover:text-white text-xs transition-colors border border-zinc-800/80 group cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 shrink-0" />
              <span className="truncate font-medium">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explore Featured Agents Section */}
      <div className="pt-4 border-t border-zinc-800/80">
        <ExploreAgents />
      </div>

      <CreateAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(agent) => navigate(`/agents/${agent.id}`)}
      />
    </div>
  );
};
