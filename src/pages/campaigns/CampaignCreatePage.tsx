import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  RotateCcw,
  ClipboardList,
  Bell,
  ChevronDown,
  Info,
  BookOpen,
  PlayCircle,
  X,
  Check
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Switch } from '../../components/ui/Switch';
import { getAgents } from '../../api/agents';
import { createCampaign, getAudiences } from '../../api/campaigns';
import { Agent, Audience } from '../../types';

export const CampaignCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('New Voice Outreach');
  const [description, setDescription] = useState(
    'Introduce our services and schedule appointments with prospective clients.'
  );
  const [campaignType, setCampaignType] = useState('outbound');
  const [objective, setObjective] = useState('Generate qualified leads');
  const [tags, setTags] = useState(['outreach']);
  const [newTag, setNewTag] = useState('');
  const [callTimeout, setCallTimeout] = useState('30 seconds');
  const [maxRetries, setMaxRetries] = useState('3');
  const [recordAudio, setRecordAudio] = useState(true);
  const [amd, setAmd] = useState(true);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const campaignSteps = [
    { num: 1, title: 'Basic Info' },
    { num: 2, title: 'Audience' },
    { num: 3, title: 'Agent & Script' },
    { num: 4, title: 'Schedule' },
    { num: 5, title: 'Review & Launch' },
  ];

  React.useEffect(() => {
    Promise.all([getAgents(), getAudiences()]).then(([agList, audList]) => {
      setAgents(agList);
      setAudiences(audList);
      if (agList[0]) setSelectedAgentId(agList[0].id);
      if (audList[0]) setSelectedAudienceId(audList[0].id);
    }).catch((error) => setLoadError(error instanceof Error ? error.message : 'Could not load campaign requirements.'));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    const audience = audiences.find((item) => item.id === selectedAudienceId);
    if (!selectedAgentId || !audience || audience.contactCount < 1) {
      toast.error('Select a saved agent and an audience with contacts before creating a campaign.');
      return;
    }

    setIsSaving(true);
    try {
      await createCampaign({
        name: name.trim(),
        agentId: selectedAgentId,
        targetAudienceId: selectedAudienceId,
        concurrentCallsLimit: 5,
      });

      toast.success(`Campaign "${name}" created and launched!`);
      navigate('/campaigns');
    } catch (err) {
      toast.error('Failed to create campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim())) {
        setTags([...tags, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div>
        <Link
          to="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create Campaign</h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
          Set up your outbound calling campaign in a few simple steps.
        </p>
      </div>
      {loadError && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{loadError}</div>}

      {/* Stepper */}
      <div className="rounded-2xl border border-zinc-800/80 bg-[#0c101b]/95 p-3.5">
        <div className="sm:hidden">
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="shrink-0 font-semibold text-slate-500">Step {step} of {campaignSteps.length}</span>
            <span className="truncate font-semibold text-slate-900">{campaignSteps[step - 1].title}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Campaign setup progress" aria-valuemin={1} aria-valuemax={campaignSteps.length} aria-valuenow={step}>
            <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${(step / campaignSteps.length) * 100}%` }} />
          </div>
        </div>
        <div className="hidden items-center justify-between gap-3 sm:flex">
          {campaignSteps.map((s, idx) => {
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <React.Fragment key={s.num}>
                <button type="button" onClick={() => setStep(s.num)} aria-current={isActive ? 'step' : undefined} className="flex shrink-0 items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : isDone ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                    {isDone ? <Check className="h-3 w-3" /> : s.num}
                  </span>
                  <span className={`text-xs font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{s.title}</span>
                </button>
                {idx < campaignSteps.length - 1 && <div className={`h-0.5 min-w-5 flex-1 rounded-full ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2-Column Split matching create_campaign.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* Campaign Details Box */}
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Campaign Details</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Give your campaign a name and tell us what it's about.</p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-300">
                    Campaign Name <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500">{name.length}/100</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 100))}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-300">Description</label>
                  <span className="text-[10px] text-zinc-500">{description.length}/500</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  className="w-full p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Campaign Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'outbound', label: 'Outbound Calls', sub: 'Call your contacts', icon: Phone },
                    { id: 'followup', label: 'Follow-ups', sub: 'Re-engage past leads', icon: RotateCcw },
                    { id: 'surveys', label: 'Surveys', sub: 'Collect feedback', icon: ClipboardList },
                    { id: 'reminders', label: 'Reminders', sub: 'Send important updates', icon: Bell },
                  ].map((ct) => {
                    const isSel = campaignType === ct.id;
                    const Icon = ct.icon;

                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setCampaignType(ct.id)}
                        aria-pressed={isSel}
                        className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          isSel
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/40'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isSel ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span aria-hidden="true" className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSel ? 'border-blue-700' : 'border-slate-300'}`}>
                            {isSel && <span className="w-2 h-2 rounded-full bg-blue-700" />}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">{ct.label}</h4>
                        <p className="text-[10px] text-slate-600 mt-0.5">{ct.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Business Objective"
                  value={objective}
                  onChange={setObjective}
                  options={[
                    'Generate qualified leads',
                    'Collect customer feedback',
                    'Promote seasonal discount',
                    'Book demo appointments'
                  ]}
                  size="md"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Assigned Voice Agent</label>
      {agents.length === 0 ? (
                  <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                    <span>Create an agent before launching a campaign.</span>
                    <Link to="/agents/create" className="text-blue-400 hover:underline font-semibold text-[11px]">
                      Create Agent →
                    </Link>
                  </div>
                ) : (
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {agents.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name} ({ag.role || 'Voice Assistant'})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Contact audience</label>
                {audiences.length === 0 ? <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between gap-3">
                  <span>Create an audience and add contacts before launching.</span>
                  <Link to="/contacts" className="shrink-0 text-blue-400 hover:underline font-semibold text-[11px]">Open Contacts →</Link>
                </div> : <select value={selectedAudienceId} onChange={(event) => setSelectedAudienceId(event.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-white focus:outline-none focus:border-blue-500">
                  {audiences.map((audience) => <option key={audience.id} value={audience.id}>{audience.name} · {audience.contactCount} contacts</option>)}
                </select>}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Tags <span className="text-zinc-500">(optional)</span>
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                    >
                      <span>{tag}</span>
                      <X className="w-3 h-3 text-zinc-500 hover:text-white cursor-pointer" onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Add a tag..."
                    className="bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none min-w-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Call Settings Box */}
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <h3 className="text-base font-bold text-white">Call Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <CustomSelect
                  label="Call Timeout"
                  value={callTimeout}
                  onChange={setCallTimeout}
                  options={['20 seconds', '30 seconds', '45 seconds', '60 seconds']}
                  size="md"
                />
                <p className="text-[10px] text-zinc-500 mt-1">How long to wait for a pickup.</p>
              </div>

              <div>
                <CustomSelect
                  label="Max Retry Attempts"
                  value={maxRetries}
                  onChange={setMaxRetries}
                  options={['1', '2', '3', '5']}
                  size="md"
                />
                <p className="text-[10px] text-zinc-500 mt-1">Number of times to retry if call is unanswered.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-medium text-white">Call Recording</h5>
                  <p className="text-[10px] text-zinc-500">Record and store call audio</p>
                </div>
                <Switch
                  checked={recordAudio}
                  onChange={setRecordAudio}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-medium text-white">Answering Machine Detection</h5>
                  <p className="text-[10px] text-zinc-500">Detect and handle voicemail</p>
                </div>
                <Switch
                  checked={amd}
                  onChange={setAmd}
                />
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200">Review recipient consent, suppression lists, calling hours, and expected costs before launching. This page does not verify those controls.</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSaving || !name.trim() || !selectedAgentId || !selectedAudienceId || (audiences.find((item) => item.id === selectedAudienceId)?.contactCount ?? 0) < 1 || !!loadError}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition-all active:scale-[0.985] cursor-pointer"
            >
              <span>{isSaving ? 'Creating Campaign...' : 'Create & Launch Campaign'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Campaign Preview</h3>
              <p className="text-xs text-zinc-400 mt-0.5">See how your campaign will look.</p>
            </div>

            <div className="space-y-3 text-xs pt-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Name</span>
                <span className="font-semibold text-white">{name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Type</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold flex items-center gap-1">
                  <Phone className="w-2.5 h-2.5" /> Outbound Calls
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Objective</span>
                <span className="font-semibold text-white">{objective}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Contacts</span>
                <span className="text-zinc-400">Not selected yet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Agent</span>
                <span className="text-zinc-400">Not selected yet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Schedule</span>
                <span className="text-zinc-400">Not scheduled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Est. Duration</span>
                <span className="text-zinc-400">~ 0 minutes</span>
              </div>
            </div>
          </div>

          {/* Estimated Cost Card */}
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
            <h3 className="text-base font-bold text-white">Estimated Cost</h3>
            <p className="text-xs text-zinc-400">Pricing is shown after the campaign details and applicable rates are confirmed.</p>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Total Contacts</span>
                <span className="text-zinc-400">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Estimated Call Duration</span>
                <span className="text-zinc-400">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Estimated Cost</span>
                <span className="text-zinc-400">-</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5 text-[11px] text-zinc-400">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Cost will be calculated once you select contacts, agent and schedule.</span>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="p-6 rounded-2xl bg-[#0c101b]/95 border border-zinc-800/80 space-y-3">
            <h4 className="text-xs font-bold text-white">Need Help?</h4>
            <p className="text-[11px] text-zinc-400">Check our guide on creating effective campaigns.</p>
            <div className="space-y-2 pt-1">
              <Link to="/help" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                <BookOpen className="w-3.5 h-3.5" /> View Documentation
              </Link>
              <Link to="/help" className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                <PlayCircle className="w-3.5 h-3.5" /> Watch Video Tutorial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
