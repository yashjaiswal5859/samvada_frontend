import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  Play,
  Pause,
  Upload,
  Sparkles,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Layers,
  Radio,
  Zap,
  Globe,
  Tag,
  ArrowRight,
  Filter,
  Check,
  X,
  FileAudio
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Modal } from '../../components/ui/Modal';
import { VOICES_CATALOG, VoiceCatalogItem as VoiceItem } from '../../utils/constants';

export const VoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentWorkspace } = useWorkspace();

  const [voices, setVoices] = useState<VoiceItem[]>(VOICES_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('All Providers');
  const [genderFilter, setGenderFilter] = useState('All Genders');
  const [accentFilter, setAccentFilter] = useState('All Accents');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Cloning Studio Modal
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneMode, setCloneMode] = useState<'upload' | 'record'>('upload');
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [cloneGender, setCloneGender] = useState<'Female' | 'Male' | 'Neutral'>('Female');
  const [cloneAccent, setCloneAccent] = useState('American (Neutral)');
  const [hasConsent, setHasConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => setRecordedSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handlePlayVoice = (id: string, sampleText: string) => {
    if (playingVoiceId === id) {
      window.speechSynthesis?.cancel();
      setPlayingVoiceId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      utterance.rate = 1.0;
      utterance.pitch = 1.02;
      utterance.onend = () => setPlayingVoiceId(null);
      utterance.onerror = () => setPlayingVoiceId(null);
      setPlayingVoiceId(id);
      window.speechSynthesis.speak(utterance);
    } else {
      toast.info('Browser audio synthesis not supported in this view.');
    }
  };

  const handleCreateClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneName.trim()) {
      toast.error('Please specify a name for your cloned voice persona');
      return;
    }
    if (!hasConsent) {
      toast.error('You must certify consent and commercial authorization');
      return;
    }

    const newClonedVoice: VoiceItem = {
      id: `voice-cloned-${Date.now()}`,
      name: `${cloneName.trim()} (Custom Clone)`,
      provider: 'Cartesia Sonic',
      gender: cloneGender,
      accent: cloneAccent,
      language: 'English (US)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      sampleText: `Hello, this is your custom cloned voice persona, ${cloneName.trim()}. I am ready to be assigned to your conversational agents.`,
      latencyTtfb: '140ms TTFB',
      samplingRate: '48kHz Lossless',
      tone: 'Bespoke Custom Brand Tone',
      idealUse: cloneDescription || 'Enterprise Brand Voice',
      isCloned: true,
    };

    setVoices((prev) => [newClonedVoice, ...prev]);
    setIsCloneModalOpen(false);
    toast.success(`Voice "${cloneName}" successfully synthesized and added to workspace!`);
    setCloneName('');
    setCloneDescription('');
    setHasConsent(false);
  };

  const filteredVoices = voices.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.idealUse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      providerFilter === 'All Providers' || v.provider === providerFilter;
    const matchesGender =
      genderFilter === 'All Genders' || v.gender === genderFilter;
    const matchesAccent =
      accentFilter === 'All Accents' || v.accent.includes(accentFilter);
    return matchesSearch && matchesProvider && matchesGender && matchesAccent;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-mono">
            <span>Samvada Enterprise Labs</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{currentWorkspace.name}</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-700 font-bold">Acoustic Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Voice Library & Cloning Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover ultra-low latency voice models (~135ms TTFB) across Cartesia Sonic, ElevenLabs Turbo, and PlayHT, or clone a bespoke brand voice.
          </p>
        </div>

        {/* Top Actions in Deep Emerald & Forest Slate */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCloneModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-300" />
            <span>+ Clone New Voice</span>
          </button>
        </div>
      </div>

      {/* ── Top Trending Voice Portrait Cards ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Trending Production Voices</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold">
            Zero-Jitter • Sub-150ms TTFB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {voices.filter((v) => v.isTrending).map((v) => {
            const isPlaying = playingVoiceId === v.id;
            return (
              <div
                key={v.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={v.avatar}
                        alt={v.name}
                        className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-100 shadow-2xs"
                      />
                      <div>
                        <h4 className="text-base font-bold text-slate-900 tracking-tight">{v.name}</h4>
                        <p className="text-xs font-semibold text-emerald-800">{v.provider}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{v.accent}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {v.latencyTtfb}
                    </span>
                  </div>

                  {/* Acoustic Waveform Sample Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <p className="text-sm text-slate-700 italic leading-relaxed line-clamp-2">
                      "{v.sampleText}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{v.samplingRate}</span>
                      <span className="text-emerald-700 font-semibold">{v.tone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(v.id, v.sampleText)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Playing…</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                        <span>Listen Sample</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`"${v.name}" selected as active voice for workspace agents.`);
                      navigate('/agents');
                    }}
                    className="py-2 px-3 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    Select
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Multi-Facet Filter Toolbar ── */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search input with Deep Emerald focus ring */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search voices by persona, tone, or use-case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Facets */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="All Providers">All Providers</option>
              <option value="Cartesia Sonic">Cartesia Sonic</option>
              <option value="ElevenLabs Turbo">ElevenLabs Turbo</option>
              <option value="PlayHT 2.0">PlayHT 2.0</option>
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="All Genders">All Genders</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Neutral">Neutral</option>
            </select>

            <select
              value={accentFilter}
              onChange={(e) => setAccentFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="All Accents">All Accents</option>
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="Indian">Indian</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── High-Density Voice Table View ── */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Voice Persona</th>
              <th className="py-3 px-4">Provider Engine</th>
              <th className="py-3 px-4">Accent & Language</th>
              <th className="py-3 px-4">Ideal Business Use</th>
              <th className="py-3 px-4">Latency (TTFB)</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredVoices.map((v) => {
              const isPlaying = playingVoiceId === v.id;
              return (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(v.id, v.sampleText)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                        }`}
                        title="Preview audio sample"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-emerald-800 ml-0.5" />}
                      </button>
                      <img
                        src={v.avatar}
                        alt={v.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{v.name}</span>
                          {v.isCloned && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 font-mono">
                              Cloned
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400">{v.gender}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold text-slate-700 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {v.provider}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-800">{v.accent}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{v.language}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-slate-700 font-medium">{v.idealUse}</p>
                    <p className="text-[11px] text-slate-400">{v.tone}</p>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {v.latencyTtfb}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        toast.success(`Assigned ${v.name} to agent template`);
                        navigate('/agents');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold text-xs transition-all cursor-pointer"
                    >
                      Use in Agent
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Voice Cloning Studio Modal ── */}
      <Modal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        title="Voice Cloning Studio"
        subtitle="Synthesize a bespoke brand voice persona in under 60 seconds with studio clarity."
        maxWidth="lg"
        theme="light"
      >
        <form onSubmit={handleCreateClone} className="space-y-6">
          {/* Method Segmented Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setCloneMode('upload')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cloneMode === 'upload'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Upload Audio Sample</span>
            </button>

            <button
              type="button"
              onClick={() => setCloneMode('record')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                cloneMode === 'record'
                  ? 'bg-white text-emerald-950 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-600" />
              <span>Record Live Microphone</span>
            </button>
          </div>

          {/* Upload Method Form */}
          {cloneMode === 'upload' ? (
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer">
              <FileAudio className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Click to upload audio sample or drag file here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                WAV, MP3, or FLAC (30 seconds to 2 minutes recommended for lossless acoustic replication)
              </p>
            </div>
          ) : (
            /* Live Microphone Record Form */
            <div className="border border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
                <Mic className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {isRecording ? `Recording Audio: ${recordedSeconds}s` : 'Ready to record audio sample'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Read 1-2 paragraphs of clear conversational dialogue into your microphone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-white'
                }`}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>
          )}

          {/* Form Parameters */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Voice Persona Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rachel - Executive Brand Voice"
                value={cloneName}
                onChange={(e) => setCloneName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={cloneGender}
                  onChange={(e) => setCloneGender(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accent</label>
                <input
                  type="text"
                  placeholder="e.g. American (Neutral)"
                  value={cloneAccent}
                  onChange={(e) => setCloneAccent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Voice Description & Tone (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Authoritative yet friendly voice for healthcare triage and patient consultations."
                value={cloneDescription}
                onChange={(e) => setCloneDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Legal Consent Checkbox */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consentCheck"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="consentCheck" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                I certify that I hold full commercial authorization to clone and synthesize this acoustic persona under Samvada Voice AI Terms and applicable synthetic media regulations.
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCloneModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!hasConsent || !cloneName.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Clone Voice Model</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
