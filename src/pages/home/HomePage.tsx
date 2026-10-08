import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ExploreAgents } from '../../components/home/ExploreAgents';
import { Plus, Mic, ArrowUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { CreateAgentModal } from '../../components/modals/CreateAgentModal';
import { useLocation, useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [promptText, setPromptText] = useState('');
  const [templateAgentName, setTemplateAgentName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [composerError, setComposerError] = useState('');
  const knowledgeInput = useRef<HTMLInputElement>(null);
  const recognition = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (new URLSearchParams(location.search).get('create') === '1') {
      setIsModalOpen(true);
      navigate('/home', { replace: true });
    }
  }, [location.search, navigate]);

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
    setTemplateAgentName('');
  };

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsModalOpen(true);
  };

  const handleKnowledgeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setComposerError('Choose a text, Markdown, or CSV file under 1 MB.');
      return;
    }
    try {
      const content = await file.text();
      setPromptText((current) => `${current.trim()}\n\nReference notes from ${file.name}:\n${content.slice(0, 12000)}`.trim());
      setComposerError(content.length > 12000 ? 'The file was added with its first 12,000 characters.' : '');
    } catch {
      setComposerError('Could not read that file. Try a text, Markdown, or CSV file.');
    }
  };

  const toggleDictation = () => {
    if (recognition.current) {
      recognition.current.stop();
      recognition.current = null;
      setIsListening(false);
      return;
    }
    const speechWindow = window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setComposerError('Voice dictation is not supported in this browser. You can type your description instead.');
      return;
    }
    const instance = new SpeechRecognition();
    instance.lang = navigator.language || 'en-US';
    instance.interimResults = true;
    instance.onresult = (event: any) => {
      const results = event.results as ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
      const transcript = Array.from({ length: results.length - event.resultIndex }, (_, index) => results[event.resultIndex + index])
        .filter((result) => result.isFinal).map((result) => result[0].transcript).join(' ');
      if (transcript) setPromptText((current) => `${current}${current && !current.endsWith(' ') ? ' ' : ''}${transcript}`);
    };
    instance.onerror = () => {
      setComposerError('Dictation could not start. Check microphone permission and try again.');
      setIsListening(false);
      recognition.current = null;
    };
    instance.onend = () => {
      setIsListening(false);
      recognition.current = null;
    };
    recognition.current = instance;
    setComposerError('');
    setIsListening(true);
    instance.start();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-6 text-slate-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto w-full">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Voice Agent Studio</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight">
            Welcome back, {fullName}
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            What voice agent do you want to build today?
          </p>
        </div>
      </div>

      {/* Prompt Input Container */}
      <form onSubmit={handleSendPrompt} className="w-full relative">
        <input ref={knowledgeInput} type="file" accept=".txt,.md,.csv,text/plain,text/markdown,text/csv" className="hidden" onChange={handleKnowledgeFile} />
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-400/20 transition-all flex flex-col min-h-[135px] justify-between">
          <textarea
            value={promptText}
            onChange={(e) => { setPromptText(e.target.value); setTemplateAgentName(''); }}
            aria-label="Describe the voice agent you want to create"
            placeholder="Describe your voice agent's role, workflow, and goals (e.g., Build an appointment scheduling agent for my dental clinic)..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 resize-none text-sm outline-none font-normal leading-relaxed pr-10"
            rows={3}
          />
          {composerError && <p role="status" className="mt-2 text-xs text-amber-700">{composerError}</p>}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => knowledgeInput.current?.click()}
              className="h-8 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer"
              title="Add a text reference to the agent instructions"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add reference</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleDictation}
                aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
                aria-pressed={isListening}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                title="Voice dictation"
              >
                <Mic className={`w-3.5 h-3.5 ${isListening ? 'text-rose-600' : 'text-slate-500'}`} />
              </button>

              <button
                type="submit"
                disabled={!promptText.trim()}
                className="h-8 px-3.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-white text-xs font-medium transition-all cursor-pointer shadow-xs"
              >
                <span>Create draft</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Suggested Prompts */}
      <div className="w-full space-y-2 text-left">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Suggested Starting Prompts
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="flex flex-col justify-between p-3.5 rounded-lg bg-white hover:bg-slate-50/80 border border-slate-200/90 text-left transition-all group cursor-pointer shadow-2xs hover:border-slate-300"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Example 0{idx + 1}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <span className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Explore Featured Agents Section */}
      <div className="pt-2 border-t border-slate-200">
      <ExploreAgents onSelectTemplate={(text, agentName) => { setPromptText(text); setTemplateAgentName(agentName); }} />
      </div>

      <CreateAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(agent) => navigate(`/agents/${agent.id}`)}
        initialPrompt={promptText}
        initialName={templateAgentName}
      />
    </div>
  );
};
