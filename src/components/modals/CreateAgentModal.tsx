import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { AVAILABLE_VOICES, AVAILABLE_MODELS } from '../../utils/constants';
import { createAgent } from '../../api/agents';
import {
  getKnowledgeBases,
  getKnowledgeDocuments,
  createKnowledgeBase,
  uploadKnowledgeFile,
} from '../../api/knowledge';
import { Agent, KnowledgeBase, KnowledgeDocument } from '../../types';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Shield,
  PhoneCall,
  Copy,
  Check,
  Lock,
  FileCode,
  Loader2,
  RefreshCw,
  FolderOpen,
  FileCheck
} from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agent: Agent) => void;
  initialPrompt?: string;
  initialName?: string;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPrompt = '',
  initialName = '',
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentWorkspace } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stepper: 1: Identity & Goal, 2: Knowledge Base, 3: Guardrails, 4: Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Identity, Role, Description (Intention) & Starting Sentence
  const [name, setName] = useState(initialName || '');
  const [role, setRole] = useState('Voice Assistant');
  const [description, setDescription] = useState('');
  const [startingSentence, setStartingSentence] = useState('Hello! Thank you for calling. How can I help you today?');
  const [selectedVoice, setSelectedVoice] = useState(AVAILABLE_VOICES[0].id);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);

  // Step 2: Knowledge Base
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [selectedKbId, setSelectedKbId] = useState<string>('');
  const [kbDocs, setKbDocs] = useState<KnowledgeDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isLoadingKbs, setIsLoadingKbs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [copiedFormatIndex, setCopiedFormatIndex] = useState<number | null>(null);

  // Step 3: Guardrails
  const [enablePiiMasking, setEnablePiiMasking] = useState(true);
  const [enableHallucinationLock, setEnableHallucinationLock] = useState(true);
  const [prohibitedTopics, setProhibitedTopics] = useState('Competitor comparisons, personal political views, investment or medical advice outside policy');
  const [escalationKeywords, setEscalationKeywords] = useState('talk to human, representative, supervisor, speak with manager, cancel my account');
  const [mandatoryDisclaimer, setMandatoryDisclaimer] = useState('This call is recorded for quality assurance and training.');
  const [enableDisclaimer, setEnableDisclaimer] = useState(false);

  // Step 4: Final Prompt & Submission
  const [finalPrompt, setFinalPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial parameters
  useEffect(() => {
    if (initialName) setName(initialName);
    if (initialPrompt) {
      setDescription(initialPrompt);
      setFinalPrompt(initialPrompt);
    }
  }, [initialName, initialPrompt]);

  // Load Knowledge bases when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingKbs(true);
    getKnowledgeBases()
      .then((kbs) => {
        setKnowledgeBases(kbs);
        if (kbs.length > 0) {
          setSelectedKbId(kbs[0].id);
          return getKnowledgeDocuments(kbs[0].id);
        }
        return [];
      })
      .then((docs) => {
        setKbDocs(docs || []);
      })
      .catch((err) => {
        console.warn('Could not load knowledge bases', err);
      })
      .finally(() => setIsLoadingKbs(false));
  }, [isOpen]);

  // When selected KB changes, load docs
  const handleSelectKb = async (kbId: string) => {
    setSelectedKbId(kbId);
    try {
      const docs = await getKnowledgeDocuments(kbId);
      setKbDocs(docs);
    } catch {
      setKbDocs([]);
    }
  };

  // Toggle document selection for RAG
  const toggleDocSelection = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // File Upload directly inside creation modal
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    try {
      let targetKbId = selectedKbId;
      if (!targetKbId) {
        // Create an initial KB for the workspace
        const newKb = await createKnowledgeBase(`${name || 'General'} Knowledge Base`, 'Auto-created during agent setup');
        if (newKb) {
          targetKbId = newKb.id;
          setKnowledgeBases((prev) => [...prev, newKb]);
          setSelectedKbId(targetKbId);
        }
      }

      if (targetKbId) {
        const uploaded = await uploadKnowledgeFile(targetKbId, file);
        if (uploaded) {
          setKbDocs((prev) => [uploaded, ...prev]);
          setSelectedDocIds((prev) => [...prev, uploaded.id]);
          toast.success('Document Uploaded & Indexed', `"${file.name}" is now connected to this agent.`);
        }
      }
    } catch (err: any) {
      toast.error('Upload Failed', err?.message || 'Could not upload file to knowledge base.');
    } finally {
      setIsUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Build the compiled system prompt from description, opener, knowledge & guardrails
  const compileSystemPrompt = () => {
    const selectedDocNames = kbDocs.filter((d) => selectedDocIds.includes(d.id)).map((d) => d.name);

    return `### 1. IDENTITY & PRIMARY ROLE
You are "${name || 'Samvada Voice Agent'}", serving in the role of ${role || 'AI Voice Assistant'}.

### 2. CORE INTENTION & INSTRUCTIONS
${
  description.trim()
    ? description.trim()
    : 'Assist callers attentively, provide helpful and accurate information, and guide the conversation toward resolving their request smoothly.'
}

### 3. CONVERSATIONAL SPEECH RULES
- FIRST SPOKEN SENTENCE WHEN CALL CONNECTS:
  "${startingSentence.trim() || 'Hello! How can I help you today?'}"
- Speak in natural, conversational, concise speech. Avoid long monologues.
- Limit each turn to 1 to 2 spoken sentences, then pause and allow the human to respond.
- Never read out raw markdown, URLs, or asterisks.

### 4. KNOWLEDGE BASE & GROUNDING (RAG)
${
  selectedDocNames.length > 0
    ? `You have access to the following verified documentation: [${selectedDocNames.join(', ')}].
Cite facts strictly from these documents. Do not speculate or introduce unverified terms.`
    : `Answer questions according to standard verified organizational policies.`
}

### 5. GUARDRAILS & SAFETY BOUNDARIES
${enablePiiMasking ? `- PII REDACTION: Strictly never ask for or repeat passwords, full credit card numbers, CVVs, or Social Security numbers.` : ''}
${enableHallucinationLock ? `- HALLUCINATION LOCK: If you do not know the answer with 100% certainty, politely respond: "I want to make sure you have the exact facts, so let me connect you with a specialist on our team."` : ''}
${prohibitedTopics.trim() ? `- PROHIBITED TOPICS: Never discuss or comment on: ${prohibitedTopics}. Politely steer the conversation back to company services.` : ''}
${escalationKeywords.trim() ? `- HUMAN ESCALATION: If the caller explicitly says any of [${escalationKeywords}], acknowledge immediately and transition to transfer protocol.` : ''}
${enableDisclaimer && mandatoryDisclaimer.trim() ? `- COMPLIANCE NOTICE: Ensure the caller is notified: "${mandatoryDisclaimer}"` : ''}
`;
  };

  // When progressing to Step 4, automatically compile the prompt
  useEffect(() => {
    if (currentStep === 4) {
      setFinalPrompt(compileSystemPrompt());
    }
  }, [currentStep]);

  // Handle Final Submission
  const handleSubmitAgent = async () => {
    if (!name.trim()) {
      toast.error('Name Required', 'Please enter a name for your voice agent.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createAgent({
        name: name.trim(),
        role: role.trim(),
        voiceId: selectedVoice,
        model: selectedModel,
        description: description.trim() || `Configured for ${role}`,
        systemPrompt: finalPrompt || compileSystemPrompt(),
      });

      toast.success('Agent Created Successfully', `"${created.name}" is now live and ready for calls.`);
      setIsSubmitting(false);
      onSuccess(created);
      onClose();
      navigate(`/agents/${created.id}`);
    } catch (err: any) {
      console.error('Failed to create agent', err);
      toast.error('Creation Failed', err?.message || 'Server was unable to register the voice agent.');
      setIsSubmitting(false);
    }
  };

  // Best Format Examples for Knowledge Base
  const formatExamples = [
    {
      title: 'Format 1: Question & Answer Pairs (Recommended for FAQs)',
      ext: '.md or .txt',
      desc: 'Ideal for customer care, return policies, hours of operation, and product pricing.',
      sample: `# Customer Support & Shipping FAQ

Q: What are your customer service hours?
A: Our team is available Monday through Friday from 8:00 AM to 8:00 PM Eastern Time.

Q: How long does express shipping take?
A: Express shipping delivers within 2 business days across the continental United States.

Q: What is your refund policy?
A: Items can be returned within 30 days of delivery with receipt for a 100% full refund.`,
    },
    {
      title: 'Format 2: Hierarchical Markdown with Clear Headings',
      ext: '.md',
      desc: 'Optimal for technical documentation, pricing tiers, and service specifications.',
      sample: `# Enterprise Platform Tiers

## Starter Plan
- Price: $49/month
- Inclusions: Up to 500 voice minutes, 2 agents, standard webhooks.

## Enterprise Plan
- Price: $499/month
- Inclusions: 10,000 voice minutes, unlimited agents, dedicated SIP trunks, 99.99% SLA.

## Cancellation & Downgrades
- Customers may downgrade anytime with prorated credit applied to the next billing cycle.`,
    },
    {
      title: 'Format 3: Standard Operating Procedure (SOP & Policy Rules)',
      ext: '.md or .txt',
      desc: 'Best for clinical intake, qualification checklists, and compliance escalations.',
      sample: `# Inbound Call Intake Protocol

## Mandatory Verification
- Step 1: Collect caller full legal name.
- Step 2: Confirm account ID or 10-digit phone number.

## Escalation Triggers
- If caller mentions "attorney", "legal dispute", or "regulatory complaint", immediately initiate warm transfer to tier-3 supervisor.
- Never quote specific investment returns or guaranteed medical outcomes.`,
    },
  ];

  const handleCopyExample = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedFormatIndex(idx);
    setTimeout(() => setCopiedFormatIndex(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Voice AI Agent"
      subtitle="Define your agent's identity, goal, knowledge base RAG, and safety guardrails."
      maxWidth="2xl"
      theme="light"
    >
      <div className="space-y-6">
        {/* ── 4-STEP BREADCRUMB STEPPER ── */}
        <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          {[
            { step: 1, label: '1. Identity & Goal', icon: Bot },
            { step: 2, label: '2. Knowledge Base', icon: FileText },
            { step: 3, label: '3. Guardrails', icon: Shield },
            { step: 4, label: '4. Prompt & Review', icon: Sparkles },
          ].map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setCurrentStep(s.step as any)}
                className={`py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80 font-bold'
                    : isCompleted
                    ? 'text-emerald-700 hover:bg-white/60'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            STEP 1: IDENTITY, INTENTION (DESCRIPTION) & OPENER
        ══════════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* Agent Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Agent Display Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya, Liam, Support Assistant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Professional Role / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Support Specialist, Senior SDR, Intake Coordinator"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* AGENT GOAL, INTENTION & DESCRIPTION (FULL NATURAL LANGUAGE FIELD - NO RESTRICTIVE OPTIONS) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Agent Description & Intention <span className="text-rose-500">*</span>
                  </label>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Backend LLM will build system prompt</span>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <span>Write everything in this description</span>
                </p>
                <p className="leading-relaxed text-slate-600">
                  Tell us everything you want this voice agent to do in your own words—its core intention (e.g. sales pitching, customer support, lead qualification, interactive Q&A, or booking appointments), speaking style, what information it should collect, and how it should handle objections. There are no rigid options or templates: our backend LLM will synthesize your complete description into a production-ready voice system prompt.
                </p>
              </div>

              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write everything here in your own words...
Example: This agent is built for inbound customer support. Its primary intention is to warmly greet customers, ask for their order ID, look up return policies in the attached knowledge base, and answer shipping or refund questions. If the customer is frustrated or asks for a refund over $200, de-escalate with empathy before offering supervisor transfer."
                className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Provide as much detail as you like for the backend prompt generator.</span>
                <span className="font-mono text-slate-500 font-medium">{description.length} characters</span>
              </div>
            </div>

            {/* STARTING SENTENCE (FIRST SPOKEN GREETING) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <label className="text-xs font-bold text-slate-900">
                    Starting Sentence (First Spoken Greeting) <span className="text-rose-500">*</span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Immediate Opener</span>
              </div>
              <p className="text-[11px] text-slate-500">
                The exact words your voice agent will speak the moment the caller answers the phone.
              </p>
              <textarea
                rows={2}
                required
                value={startingSentence}
                onChange={(e) => setStartingSentence(e.target.value)}
                placeholder="e.g. Hello! Thank you for calling Samvada Support. My name is Maya. How can I assist you today?"
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Voice & LLM Model Choice */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Voice Model</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.accent || v.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">LLM Intelligence Engine</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                disabled={!name.trim() || !role.trim() || !description.trim() || !startingSentence.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Continue to Knowledge Base</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2: KNOWLEDGE BASE & STRUCTURED FILE GUIDANCE
        ══════════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            {/* Structured File Explanation Banner */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                  <FileCode className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Structured Documents Yield 10x Better Voice Performance</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 rounded">
                      High Retrieval Speed
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Voice AI requires sub-200ms vector lookups. Clear Markdown headings, Q&A pairs, and bulleted rules guarantee instant facts with zero hallucinations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormatGuide(!showFormatGuide)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-950 rounded-lg text-xs font-bold shrink-0 shadow-2xs cursor-pointer transition-colors"
              >
                {showFormatGuide ? 'Hide Format Guide' : 'View Best Format Examples'}
              </button>
            </div>

            {/* Interactive Format Guide Accordion */}
            {showFormatGuide && (
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-4 shadow-md border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Recommended File Formats for Real-time Voice</span>
                  </div>
                  <span className="text-[11px] text-slate-400">Click copy to use as your starter template</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {formatExamples.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400">{ex.title.split('(')[0]}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1 rounded">{ex.ext}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">{ex.desc}</p>
                        <pre className="text-[10px] font-mono bg-slate-900 p-2 rounded mt-2 text-slate-300 overflow-x-auto max-h-36 whitespace-pre-wrap">
                          {ex.sample}
                        </pre>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyExample(ex.sample, idx)}
                        className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedFormatIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-300" />
                            <span>Copy Template</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Direct Upload Dropzone */}
            <div className="p-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 transition-all text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,.json,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="kb-file-upload-input"
              />
              <label htmlFor="kb-file-upload-input" className="cursor-pointer block">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  {isUploadingDoc ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {isUploadingDoc ? 'Uploading & Processing Document in Backend...' : 'Upload Document Directly to Knowledge Base'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports Markdown (.md), Plain Text (.txt), PDF, Word (.docx), JSON, or CSV (up to 25MB)
                </p>
                <span className="inline-block mt-2.5 px-3 py-1 bg-white border border-slate-200 text-emerald-950 font-bold text-xs rounded-lg shadow-2xs hover:bg-slate-100 transition-colors">
                  Browse Files
                </span>
              </label>
            </div>

            {/* Existing Documents Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Knowledge Documents for This Agent ({selectedDocIds.length} attached)
                </label>
                {knowledgeBases.length > 1 && (
                  <select
                    value={selectedKbId}
                    onChange={(e) => handleSelectKb(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 font-medium"
                  >
                    {knowledgeBases.map((kb) => (
                      <option key={kb.id} value={kb.id}>
                        KB: {kb.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {isLoadingKbs ? (
                <div className="p-6 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                  <p className="text-xs">Loading workspace knowledge documents...</p>
                </div>
              ) : kbDocs.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 space-y-1">
                  <FolderOpen className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                  <p className="text-xs font-semibold text-slate-700">No documents found in knowledge base</p>
                  <p className="text-[11px] text-slate-400">
                    Upload a file above, or continue without attaching documents (you can connect documents later).
                  </p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-2xs">
                  {kbDocs.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDocSelection(doc.id)}
                        className={`p-3 flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDocSelection(doc.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>{doc.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {doc.type || 'doc'}
                              </span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Status: <span className="text-emerald-700 font-semibold">{doc.status || 'Indexed'}</span> • {doc.chunkCount || 1} Chunks
                            </p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-400'}`}>
                          {isSelected ? 'Attached' : 'Click to attach'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue to Guardrails</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3: GUARDRAILS & SAFETY POLICIES
        ══════════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            {/* Quick Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Quick Safety Presets
                </label>
                <span className="text-[11px] text-slate-500 font-medium">1-Click enterprise compliance profiles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    title: 'Enterprise Standard',
                    desc: 'Strict PII masking, grounded RAG, competitor blocking, supervisor transfer.',
                    pii: true,
                    hallucination: true,
                    disclaimer: false,
                  },
                  {
                    title: 'Financial & Banking',
                    desc: 'Full PCI-DSS compliance, mandatory recording disclaimer, zero credit card retention.',
                    pii: true,
                    hallucination: true,
                    disclaimer: true,
                  },
                  {
                    title: 'Healthcare Strict',
                    desc: 'HIPAA containment, clinical disclaimers, immediate emergency transfer.',
                    pii: true,
                    hallucination: true,
                    disclaimer: true,
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setEnablePiiMasking(preset.pii);
                      setEnableHallucinationLock(preset.hallucination);
                      setEnableDisclaimer(preset.disclaimer);
                      toast.info('Preset Applied', `Configured ${preset.title} guardrails.`);
                    }}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{preset.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{preset.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Core Toggles */}
            <div className="space-y-3">
              {/* PII Masking Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      PII & Sensitive Data Redaction
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Prevents collecting or repeating credit cards, CVVs, passwords, SSNs, or sensitive auth tokens during spoken calls.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enablePiiMasking}
                  onChange={(e) => setEnablePiiMasking(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Hallucination Lock Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Hallucination Lock (Strict Fact Grounding)
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Forces the agent to politely state it does not know if facts are not explicitly confirmed in your attached knowledge base.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableHallucinationLock}
                  onChange={(e) => setEnableHallucinationLock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Prohibited Topics */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Restricted Topics & Competitor Blacklist
              </label>
              <input
                type="text"
                value={prohibitedTopics}
                onChange={(e) => setProhibitedTopics(e.target.value)}
                placeholder="e.g. Competitor X, politics, personal medical advice"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Agent will deflect any user inquiry matching these subjects back to approved topics.
              </p>
            </div>

            {/* Human Escalation Keywords */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency & Human Escalation Triggers
              </label>
              <input
                type="text"
                value={escalationKeywords}
                onChange={(e) => setEscalationKeywords(e.target.value)}
                placeholder="e.g. speak to manager, representative, cancel service, lawyer"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Keywords that trigger instant escalation or SIP warm transfer to human supervisors.
              </p>
            </div>

            {/* Legal Disclaimer Toggle */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Mandatory Call Recording Notice</span>
                <input
                  type="checkbox"
                  checked={enableDisclaimer}
                  onChange={(e) => setEnableDisclaimer(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              {enableDisclaimer && (
                <input
                  type="text"
                  value={mandatoryDisclaimer}
                  onChange={(e) => setMandatoryDisclaimer(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Review & Launch</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 4: SYSTEM PROMPT REVIEW & FINAL LAUNCH
        ══════════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Name & Role</span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{name}</p>
                <p className="text-[11px] text-slate-500 truncate">{role}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Goal Context</span>
                <p className="text-xs font-bold text-emerald-950 truncate mt-0.5" title={description}>
                  {description.slice(0, 24)}...
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">User Defined</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Voice & Model</span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {AVAILABLE_VOICES.find((v) => v.id === selectedVoice)?.name}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{selectedModel}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Knowledge & Safety</span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {selectedDocIds.length} Docs Attached
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {enablePiiMasking ? '🛡️ PII Guarded' : 'Standard'}
                </p>
              </div>
            </div>

            {/* Starting Opener Quick Card */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-900 block">
                  Opening Spoken Greeting
                </span>
                <p className="text-xs text-emerald-950 font-medium italic mt-0.5">
                  "{startingSentence}"
                </p>
              </div>
            </div>

            {/* Editable Compiled System Prompt */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Compiled Production System Prompt
                </label>
                <button
                  type="button"
                  onClick={() => setFinalPrompt(compileSystemPrompt())}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-compile from settings</span>
                </button>
              </div>
              <textarea
                rows={9}
                value={finalPrompt}
                onChange={(e) => setFinalPrompt(e.target.value)}
                className="w-full p-3 font-mono text-[11px] leading-relaxed rounded-xl border border-slate-200 bg-slate-900 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                You can fine-tune the assembled prompt directly before creating the agent.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitAgent}
                disabled={isSubmitting || !name.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                    <span>Deploying Voice Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    <span>Create & Launch Voice Agent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
