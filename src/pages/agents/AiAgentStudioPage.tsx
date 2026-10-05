import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Bot,
  User,
  Copy,
  Check,
  Play,
  Square,
  Volume2,
  FileText,
  Sliders,
  PhoneCall,
  RotateCcw,
  Rocket,
  Plus,
  Upload,
  Globe,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Wrench,
  X,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { createAgent } from '../../api/agents';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  preparedSteps?: string[];
  updates?: {
    name?: string;
    voice?: string;
    languages?: string;
    actionsAdded?: string[];
    documentsLearned?: string[];
    rulesSet?: string[];
  };
  suggestions?: string[];
}

interface ReferenceDocument {
  id: string;
  name: string;
  filename: string;
  size: string;
  topicsCount: number;
  status: 'ready' | 'processing';
  snippet: string;
}

interface AgentAction {
  name: string;
  label: string;
  description: string;
  inputsSummary: string;
  status: 'active' | 'draft';
}

interface AgentBlueprint {
  name: string;
  tagline: string;
  avatar: string;
  category: string;
  direction: string;
  voice: string;
  voiceName: string;
  voiceGender: string;
  languages: string;
  speakingSpeed: number;
  responseSpeedMs: number;
  interruptionFriendly: number;
  instructions: string;
  knowledgeDocuments: ReferenceDocument[];
  actions: AgentAction[];
}

export const AiAgentStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Mode & Speed Settings
  const [selectedSpeedMode, setSelectedSpeedMode] = useState('fast');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'persona' | 'instructions' | 'knowledge' | 'actions' | 'test'>('persona');
  const [copiedInstructions, setCopiedInstructions] = useState(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: '12:00 PM',
      text: "👋 Hi! I'm your **AI Agent Builder**.\n\nTell me about the voice assistant you need in simple words. For example: what business you run, what questions customers ask, or upload your price list and FAQs. I'll automatically create your assistant right here on the right side.",
      suggestions: [
        '🦷 Dental Clinic Receptionist (Hindi & English)',
        '💼 Sales Assistant that books meetings',
        '📦 Customer Care & Order Tracking',
        '🏠 Real Estate Assistant for property inquiries'
      ]
    }
  ]);

  // Dynamic Live Agent State (Updated in plain English)
  const [agentBlueprint, setAgentBlueprint] = useState<AgentBlueprint>({
    name: 'SmileCare Dental Assistant',
    tagline: 'Friendly phone assistant for appointment booking and treatment inquiries',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    category: 'Clinic & Healthcare',
    direction: 'Inbound & Outbound Calls',
    voice: 'kavya-warm',
    voiceName: 'Kavya (Warm & Friendly)',
    voiceGender: 'Female',
    languages: 'Hindi + English (Natural Code-Switching)',
    speakingSpeed: 1.05,
    responseSpeedMs: 220,
    interruptionFriendly: 92,
    instructions: `You are "Kavya", the friendly phone receptionist for SmileCare Dental Clinic.
Your goal is to answer caller questions about treatments, prices, and clinic hours, and book them for an appointment with Dr. Sharma.

### How to talk to customers:
1. Tone: Always be polite, warm, and clear. Speak like a helpful front-desk coordinator.
2. Language: If the caller speaks in Hindi or Hinglish, reply naturally in Hindi or Hinglish.
3. Pricing: Always check your uploaded clinic price list before quoting costs. Never guess pricing.
4. Booking: Ask for the patient's name, preferred day, and tooth problem, then confirm the booking.
5. Emergencies: If the caller has heavy bleeding or unbearable pain, ask them to visit the emergency room immediately.`,
    knowledgeDocuments: [
      {
        id: 'doc-1',
        name: 'SmileCare Treatment & Price List 2026',
        filename: 'smilecare_pricing_2026.pdf',
        size: '1.4 MB',
        topicsCount: 42,
        status: 'ready',
        snippet: 'Root Canal Treatment (RCT): ₹4,500 - ₹7,000. Teeth Whitening: ₹9,500. Doctor Consultation Fee: ₹500.'
      },
      {
        id: 'doc-2',
        name: 'Clinic Timings & Cancellation Policy',
        filename: 'clinic_faqs_policies.docx',
        size: '850 KB',
        topicsCount: 28,
        status: 'ready',
        snippet: 'Open Mon-Sat 9:00 AM to 8:00 PM. Sundays for emergencies only. Free cancellations with 4 hours prior notice.'
      }
    ],
    actions: [
      {
        name: 'book_appointment_slot',
        label: 'Book Appointment on Calendar',
        description: 'Collects patient details and reserves a slot with Dr. Sharma.',
        inputsSummary: 'Patient Name, Date, Preferred Time, Problem',
        status: 'active'
      },
      {
        name: 'query_treatment_pricing',
        label: 'Check Treatment Price',
        description: 'Looks up exact costs and procedure details from your price list.',
        inputsSummary: 'Procedure Name (e.g. Root Canal, Cleaning)',
        status: 'active'
      },
      {
        name: 'transfer_to_frontdesk',
        label: 'Transfer Call to Human Receptionist',
        description: 'Transfers the caller to a staff member if they request a human.',
        inputsSummary: 'Transfer Reason',
        status: 'active'
      }
    ]
  });

  // Knowledge search test state
  const [testQuestion, setTestQuestion] = useState('');
  const [searchResult, setSearchResult] = useState<{ answer: string; sourceDocument: string; confidence: string } | null>(null);
  const [isSearchingDoc, setIsSearchingDoc] = useState(false);

  // Live Test Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [testTranscript, setTestTranscript] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Namaste! Welcome to SmileCare Dental Clinic. I am Kavya. How can I help you today?',
      time: '00:01'
    }
  ]);
  const [testUserSpeech, setTestUserSpeech] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSynthesizing]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Process user request in natural language
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isSynthesizing) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsSynthesizing(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let updated = { ...agentBlueprint };
      let replyText = '';
      let updates: ChatMessage['updates'] = {};
      let suggestions: string[] = [];

      if (lower.includes('dental') || lower.includes('clinic') || lower.includes('doctor') || lower.includes('hospital')) {
        updated.name = 'SmileCare Dental Assistant';
        updated.tagline = 'Helpful assistant for appointment bookings and pricing questions';
        updated.category = 'Clinic & Healthcare';
        updated.voice = 'kavya-warm';
        updated.voiceName = 'Kavya (Warm & Friendly)';
        updated.languages = 'Hindi + English (Natural Code-Switching)';
        updated.responseSpeedMs = 210;

        replyText = `I have set up **SmileCare Dental Assistant** for your clinic:\n\n` +
          `• **Voice**: Kavya (Warm, polite Indian English & Hindi voice)\n` +
          `• **What It Knows**: Learned your pricing list and clinic timings\n` +
          `• **What It Can Do**: Books appointments directly and transfers calls to front desk if needed\n` +
          `• **Speaking Style**: Responds instantly without awkward pauses.`;

        updates = {
          name: 'SmileCare Dental Assistant',
          voice: 'Kavya (Friendly Indian English)',
          languages: 'Hindi & English',
          actionsAdded: ['Book Appointment', 'Check Treatment Price'],
          documentsLearned: ['smilecare_pricing_2026.pdf', 'clinic_faqs_policies.docx']
        };

        suggestions = [
          'Give a 10% discount if the customer asks about teeth cleaning',
          'Make voice speak slightly faster',
          'Send appointment confirmation by SMS',
          'Test call my assistant now'
        ];
      } else if (lower.includes('sales') || lower.includes('sdr') || lower.includes('b2b') || lower.includes('outbound')) {
        updated.name = 'Nexus Sales Assistant';
        updated.tagline = 'Professional outbound assistant that qualifies leads and books meetings';
        updated.category = 'B2B Sales & Outreach';
        updated.voice = 'marcus-confident';
        updated.voiceName = 'Marcus (Confident & Clear)';
        updated.languages = 'English (Global)';
        updated.speakingSpeed = 1.1;
        updated.responseSpeedMs = 190;
        updated.interruptionFriendly = 95;

        updated.instructions = `You are "Marcus", a professional sales assistant for Nexus Cloud.
Your job is to introduce our cloud services to business leaders, ask 2 quick qualification questions, and book a short demo call on the calendar.
Be polite, confident, and respect the customer's time.`;

        updated.knowledgeDocuments = [
          {
            id: 'doc-sales-1',
            name: 'Nexus Product Benefits & Pricing',
            filename: 'nexus_cloud_benefits.pdf',
            size: '2.1 MB',
            topicsCount: 58,
            status: 'ready',
            snippet: 'Saves 35% on server hosting costs while making voice applications 40% faster.'
          }
        ];

        updated.actions = [
          {
            name: 'qualify_lead',
            label: 'Save Lead Information',
            description: 'Saves company size and needs to your CRM.',
            inputsSummary: 'Company Size, Current Software, Timeline',
            status: 'active'
          },
          {
            name: 'book_meeting',
            label: 'Schedule Meeting on Calendar',
            description: 'Finds an open slot and schedules a demo call.',
            inputsSummary: 'Customer Email, Date & Time Slot',
            status: 'active'
          }
        ];

        replyText = `Created **Nexus Sales Assistant** to help your sales team book more meetings!\n\n` +
          `• **Voice**: Marcus (Clear, energetic, and professional)\n` +
          `• **Knowledge**: Knows your product benefits and cost-saving highlights\n` +
          `• **Actions**: Can qualify leads and place appointments directly on your calendar.`;

        updates = {
          name: 'Nexus Sales Assistant',
          voice: 'Marcus (Confident)',
          languages: 'English',
          actionsAdded: ['Save Lead Information', 'Schedule Meeting on Calendar'],
          documentsLearned: ['nexus_cloud_benefits.pdf']
        };

        suggestions = [
          'Only book meetings with companies larger than 10 people',
          'Switch to a British accent voice',
          'Test call my assistant'
        ];
      } else if (lower.includes('ecommerce') || lower.includes('order') || lower.includes('refund') || lower.includes('shop')) {
        updated.name = 'Velox Customer Care';
        updated.tagline = 'Helpful support assistant for order tracking, returns, and delivery questions';
        updated.category = 'Customer Support';
        updated.voice = 'priya-clarity';
        updated.voiceName = 'Priya (Polite & Helpful)';
        updated.languages = 'Hindi + English';
        updated.responseSpeedMs = 200;

        updated.instructions = `You are "Priya", the polite customer support assistant for Velox Fashion.
You help shoppers check delivery dates, start returns, and find sizing recommendations.
Always ask for the Order ID and phone number before updating any order.`;

        updated.knowledgeDocuments = [
          {
            id: 'doc-ecom-1',
            name: 'Return & Exchange Policy',
            filename: 'return_policy.pdf',
            size: '640 KB',
            topicsCount: 18,
            status: 'ready',
            snippet: 'Easy 30-day returns on unworn clothes. Refunds are returned to original payment within 3-5 days.'
          }
        ];

        updated.actions = [
          {
            name: 'lookup_order',
            label: 'Check Order Status',
            description: 'Looks up where the package is and expected delivery date.',
            inputsSummary: 'Order ID, Phone Number',
            status: 'active'
          },
          {
            name: 'schedule_return',
            label: 'Schedule Courier Pickup',
            description: 'Books a courier to pick up return items from the customer door.',
            inputsSummary: 'Order ID, Reason for Return, Pickup Date',
            status: 'active'
          }
        ];

        replyText = `Created **Velox Customer Care**! It can look up order tracking numbers and schedule doorstep return pickups automatically.`;
        updates = {
          name: 'Velox Customer Care',
          voice: 'Priya (Polite)',
          languages: 'Hindi + English',
          actionsAdded: ['Check Order Status', 'Schedule Courier Pickup'],
          documentsLearned: ['return_policy.pdf']
        };
        suggestions = ['Limit return window to 14 days', 'Add WhatsApp order link notification', 'Test call my assistant'];
      } else {
        replyText = `Got it! I have updated your assistant with your request: "${query}".\n\n` +
          `• Updated behavioral instructions and guidelines.\n` +
          `• Everything is saved live on the right side. You can click "Test Call" anytime to hear it speak.`;

        updated.instructions += `\n\n### Important Rule from Owner:\n- ${query}`;
        updates = {
          rulesSet: [query]
        };
        suggestions = ['Make tone more friendly and casual', 'Send summary to my phone after calls', 'Activate voice agent'];
      }

      setAgentBlueprint(updated);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        preparedSteps: [
          'Understood your business requirements',
          'Configured natural conversational tone and voice style',
          'Connected your business documents for accurate answers',
          'Added automated actions for call handling'
        ],
        updates,
        suggestions
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsSynthesizing(false);
      toast.success('Assistant updated successfully!');
    }, 800);
  };

  // Test knowledge search in plain English
  const handleTestKnowledge = () => {
    if (!testQuestion.trim()) return;
    setIsSearchingDoc(true);
    setTimeout(() => {
      const match = agentBlueprint.knowledgeDocuments[0];
      setSearchResult({
        answer: match.snippet,
        sourceDocument: match.filename,
        confidence: '94% Match'
      });
      setIsSearchingDoc(false);
    }, 400);
  };

  // Interactive Test Call: User speaks or sends text
  const handleSendTestUtterance = () => {
    if (!testUserSpeech.trim()) return;

    const userText = testUserSpeech.trim();
    const time = formatTime(callDuration);

    setTestTranscript((prev) => [...prev, { sender: 'user', text: userText, time }]);
    setTestUserSpeech('');

    setTimeout(() => {
      let agentReply = "Sure! A root canal treatment at SmileCare costs between ₹4,500 and ₹7,000 depending on the tooth. Would you like me to book an appointment with Dr. Sharma for this Thursday?";
      if (userText.toLowerCase().includes('hindi') || userText.toLowerCase().includes('namaste')) {
        agentReply = "Namaste ji! Root canal treatment ₹4,500 se ₹7,000 ke beech hota hai. Kya main aapka Dr. Sharma ji ke sath Thursday ko appointment book kar doon?";
      }

      setTestTranscript((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: agentReply,
          time: formatTime(callDuration + 1)
        }
      ]);
    }, 600);
  };

  const handleCopyInstructions = () => {
    navigator.clipboard.writeText(agentBlueprint.instructions);
    setCopiedInstructions(true);
    toast.success('Instructions copied to clipboard');
    setTimeout(() => setCopiedInstructions(false), 2000);
  };

  const handleDeployAgent = async () => {
    try {
      await createAgent({
        name: agentBlueprint.name,
        role: agentBlueprint.tagline || 'Voice Assistant',
        description: agentBlueprint.tagline,
        systemPrompt: agentBlueprint.instructions,
        voiceId: agentBlueprint.voice,
        language: agentBlueprint.languages,
        model: 'gpt-4o',
      });
      toast.success(`Voice Assistant "${agentBlueprint.name}" is now ready and live on your phone line!`);
      navigate('/agents');
    } catch (err) {
      toast.error('Failed to activate voice assistant');
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-14 border-b border-zinc-800/80 bg-[#0c101b]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            to="/agents"
            className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <span>Agents</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight">AI Agent Builder</h1>
          </div>
        </div>

        {/* Speed / Tone Preference & Activation Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-400 hidden sm:inline">Speaking Style:</span>
            <div className="w-48">
              <CustomSelect
                value={selectedSpeedMode}
                onChange={setSelectedSpeedMode}
                options={[
                  { value: 'fast', label: '⚡ Fast & Responsive' },
                  { value: 'natural', label: '🎯 Natural Conversational' },
                  { value: 'detailed', label: '🧠 Detailed Explanations' },
                  { value: 'relaxed', label: '☕ Relaxed & Calm' }
                ]}
              />
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-800 mx-1 hidden sm:block" />

          {/* Activate Button */}
          <button
            onClick={handleDeployAgent}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.985] transition-all cursor-pointer"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Activate Voice Assistant</span>
          </button>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT PANE: CHAT TO CREATE ASSISTANT (50%) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-1/2 flex flex-col border-r border-zinc-800/80 bg-[#07090f] relative">
          {/* Sub-Header */}
          <div className="px-5 py-3 border-b border-zinc-800/60 bg-[#0a0e18]/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-zinc-200">Chat with AI to Build Your Agent</span>
              <span className="text-[11px] text-zinc-400">· Type your requirements or attach price lists</span>
            </div>
            <button
              onClick={() => {
                setMessages([messages[0]]);
                toast.info('Chat cleared. You can start fresh.');
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
              title="Start over"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Over</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-[#0f1422] border border-zinc-800/90 text-zinc-200 rounded-tl-sm shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 pb-1 border-b border-white/10">
                    <span className="font-semibold">{msg.sender === 'user' ? 'You' : 'Samvada AI Assistant'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Content */}
                  <div className="whitespace-pre-line text-xs font-normal space-y-1">
                    {msg.text}
                  </div>

                  {/* Friendly Prepared Steps */}
                  {msg.preparedSteps && (
                    <div className="bg-[#090d16] rounded-xl p-2.5 border border-zinc-800/80 space-y-1.5 my-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                        <Layers className="w-3 h-3" />
                        <span>What AI Configured For You</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 text-[11px] text-zinc-300">
                        {msg.preparedSteps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary of Changes */}
                  {msg.updates && Object.keys(msg.updates).length > 0 && (
                    <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-2.5 space-y-2">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        Updated Live:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.updates.name && (
                          <span className="bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            🏷️ Name: {msg.updates.name}
                          </span>
                        )}
                        {msg.updates.voice && (
                          <span className="bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            🎙️ Voice: {msg.updates.voice}
                          </span>
                        )}
                        {msg.updates.languages && (
                          <span className="bg-blue-900/40 text-blue-200 border border-blue-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            🌐 Language: {msg.updates.languages}
                          </span>
                        )}
                        {msg.updates.actionsAdded?.map((action, aIdx) => (
                          <span key={aIdx} className="bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            ⚡ Action: {action}
                          </span>
                        ))}
                        {msg.updates.documentsLearned?.map((doc, dIdx) => (
                          <span key={dIdx} className="bg-purple-900/40 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            📄 Learned: {doc}
                          </span>
                        ))}
                        {msg.updates.rulesSet?.map((rule, rIdx) => (
                          <span key={rIdx} className="bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-md text-[10px] font-medium">
                            📝 New Rule: {rule}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[10px] font-medium text-zinc-400">Click to ask next:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 hover:text-white px-2.5 py-1 rounded-lg border border-zinc-700/60 transition-all text-left flex items-center gap-1 active:scale-[0.98] cursor-pointer"
                          >
                            <span>{sug}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Waiting Indicator */}
            {isSynthesizing && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#0f1422] border border-zinc-800/90 rounded-2xl rounded-tl-sm p-4 text-xs text-zinc-300 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  </div>
                  <span>Updating your assistant and learning your documents...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Attached Documents Quick Strip */}
          <div className="px-5 py-2 bg-[#090d16] border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-[11px] font-semibold text-zinc-400 shrink-0 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-blue-400" />
                <span>Reference Documents:</span>
              </span>
              {agentBlueprint.knowledgeDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-1.5 bg-[#121828] border border-zinc-800 px-2 py-0.5 rounded-md text-[11px] text-zinc-300 shrink-0"
                >
                  <FileText className="w-3 h-3 text-blue-400" />
                  <span className="truncate max-w-[140px]">{doc.name}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">✓ Learned</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDocumentModal(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 shrink-0 ml-2 hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Document</span>
            </button>
          </div>

          {/* Simple Chat Input */}
          <div className="p-4 bg-[#0c101b] border-t border-zinc-800/80">
            <div className="relative rounded-2xl bg-[#111726] border border-zinc-800 focus-within:border-blue-500/80 transition-all p-2.5">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder="Describe what you want your assistant to do (e.g. 'I run a dental clinic in Delhi. I need someone to answer questions about root canal costs and book appointments in Hindi and English')..."
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none px-1.5 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-1 px-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all cursor-pointer"
                    title="Upload PDF, price list, or enter website link"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsRecordingMic(!isRecordingMic);
                      if (!isRecordingMic) {
                        toast.info('Listening to you speak...');
                        setTimeout(() => {
                          setInputText('Create a polite real estate assistant that asks caller budget and books a visit.');
                          setIsRecordingMic(false);
                          toast.success('Your speech was transcribed accurately.');
                        }, 2500);
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      isRecordingMic
                        ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                    }`}
                    title="Speak using microphone"
                  >
                    {isRecordingMic ? <Mic className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                    {isRecordingMic && <span className="text-[10px] font-bold">Listening...</span>}
                  </button>

                  <button
                    onClick={() => {
                      setInputText((prev) =>
                        prev ? `${prev} with polite manners, natural conversational speaking style, and accurate answers.` : 'Create a helpful customer assistant for my business.'
                      );
                      toast.info('Added friendly conversational guidance.');
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/60 transition-all cursor-pointer"
                    title="Make instructions friendlier"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 hidden sm:inline">Press Enter to send</span>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || isSynthesizing}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE: LIVE AGENT PREVIEW (50%) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[#0a0d17] overflow-y-auto">
          {/* Assistant Card Header */}
          <div className="p-5 border-b border-zinc-800/80 bg-[#0e1322] shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={agentBlueprint.avatar}
                  alt={agentBlueprint.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-blue-500/40 shadow-lg shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">{agentBlueprint.name}</h2>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ready to Use
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">{agentBlueprint.tagline}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDeployAgent}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Activate</span>
                </button>
              </div>
            </div>

            {/* Simple Tabs Navigation */}
            <div className="flex items-center gap-1 border-t border-zinc-800/70 pt-4 mt-4 overflow-x-auto">
              {[
                { key: 'persona', label: 'Voice & Style', icon: Sliders },
                { key: 'instructions', label: 'Instructions', icon: FileText },
                { key: 'knowledge', label: `Documents (${agentBlueprint.knowledgeDocuments.length})`, icon: BookOpen },
                { key: 'actions', label: `Actions (${agentBlueprint.actions.length})`, icon: Wrench },
                { key: 'test', label: 'Test Call', icon: PhoneCall }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Contents in Plain English */}
          <div className="p-6 space-y-6 flex-1">
            {/* TAB 1: VOICE & STYLE */}
            {activeTab === 'persona' && (
              <div className="space-y-6">
                {/* Voice Card */}
                <div className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Assistant Voice</h3>
                        <p className="text-[11px] text-zinc-400">{agentBlueprint.voiceName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg font-medium">
                      High Quality Voice
                    </span>
                  </div>

                  {/* Sample Voice Player */}
                  <div className="bg-[#0a0d16] rounded-xl p-3 border border-zinc-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => toast.info(`Playing voice sample: "Namaste, how may I help you today?"`)}
                      className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                    </button>
                    <div className="flex-1 flex items-center gap-1 h-6">
                      {[12, 24, 18, 32, 14, 28, 40, 36, 18, 22, 30, 16, 26, 38, 20, 14, 28, 12].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className="flex-1 bg-blue-500/60 rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-zinc-400">Click to listen</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                    <div>
                      <span className="text-zinc-400 text-[11px] block mb-1">Languages Spoken</span>
                      <div className="p-2.5 rounded-xl bg-[#0a0d16] border border-zinc-800 font-medium text-zinc-200">
                        {agentBlueprint.languages}
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-400 text-[11px] block mb-1">Call Types</span>
                      <div className="p-2.5 rounded-xl bg-[#0a0d16] border border-zinc-800 font-medium text-zinc-200">
                        {agentBlueprint.direction}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation Rhythm Settings */}
                <div className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>How Your Agent Responds to Callers</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-300 font-medium">Response Speed</span>
                        <span className="text-blue-400 font-bold">Fast & Immediate ({agentBlueprint.responseSpeedMs}ms)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-2">
                        How quickly your assistant answers when a caller stops speaking.
                      </p>
                      <input
                        type="range"
                        min="150"
                        max="500"
                        value={agentBlueprint.responseSpeedMs}
                        onChange={(e) =>
                          setAgentBlueprint({ ...agentBlueprint, responseSpeedMs: Number(e.target.value) })
                        }
                        className="w-full accent-blue-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-300 font-medium">Allow Callers to Interrupt</span>
                        <span className="text-emerald-400 font-bold">Natural & Easy ({agentBlueprint.interruptionFriendly}%)</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-2">
                        If a caller speaks while the assistant is talking, the assistant politely stops and listens.
                      </p>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={agentBlueprint.interruptionFriendly}
                        onChange={(e) =>
                          setAgentBlueprint({ ...agentBlueprint, interruptionFriendly: Number(e.target.value) })
                        }
                        className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INSTRUCTIONS */}
            {activeTab === 'instructions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">How Your Agent Talks</h3>
                    <p className="text-[11px] text-zinc-400">These clear instructions guide your assistant during phone calls.</p>
                  </div>
                  <button
                    onClick={handleCopyInstructions}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedInstructions ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedInstructions ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="rounded-2xl bg-[#090d16] border border-zinc-800 p-4 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto font-sans">
                  {agentBlueprint.instructions}
                </div>

                <p className="text-[11px] text-zinc-400">
                  💡 You don't need to edit this manually. Just tell the AI on the left chat what rules to change anytime!
                </p>
              </div>
            )}

            {/* TAB 3: BUSINESS KNOWLEDGE */}
            {activeTab === 'knowledge' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Documents & Price Lists Your Agent Knows</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Your assistant reads these files to answer customer questions accurately without guessing.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>

                {/* Document Cards */}
                <div className="space-y-3">
                  {agentBlueprint.knowledgeDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-4 space-y-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{doc.name}</h4>
                            <span className="text-[11px] text-zinc-400">{doc.filename} · {doc.size}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {doc.topicsCount} sections learned
                        </span>
                      </div>

                      <div className="bg-[#090d16] rounded-xl p-2.5 text-[11px] text-zinc-300 border border-zinc-800/60">
                        <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider font-semibold">
                          Sample Information Your Agent Learned:
                        </span>
                        "{doc.snippet}"
                      </div>
                    </div>
                  ))}
                </div>

                {/* Easy Document Search Tester */}
                <div className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-4 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ask a Question to Test Your Agent's Knowledge</span>
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testQuestion}
                      onChange={(e) => setTestQuestion(e.target.value)}
                      placeholder="e.g. How much does a root canal cost?"
                      className="flex-1 bg-[#090d16] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleTestKnowledge}
                      disabled={isSearchingDoc}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSearchingDoc ? 'Checking...' : 'Check Answer'}
                    </button>
                  </div>

                  {searchResult && (
                    <div className="bg-[#090d16] rounded-xl p-3 border border-emerald-500/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-400">✓ Accurate Answer Found</span>
                        <span className="text-zinc-400 text-[10px]">Source: {searchResult.sourceDocument}</span>
                      </div>
                      <p className="text-zinc-200 text-[11px] font-medium leading-relaxed">
                        "{searchResult.answer}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: AUTOMATED ACTIONS */}
            {activeTab === 'actions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" />
                      <span>Actions Your Assistant Can Perform</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Your assistant can automatically perform these tasks during a call.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {agentBlueprint.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {action.label}
                          </span>
                          <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300">{action.description}</p>

                      <div className="bg-[#090d16] rounded-xl p-2.5 border border-zinc-800/70 text-[11px] text-zinc-400">
                        <span className="text-zinc-300 font-medium">Information collected from caller: </span>
                        {action.inputsSummary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: TEST CALL MY AGENT */}
            {activeTab === 'test' && (
              <div className="bg-[#0f1526] rounded-2xl border border-zinc-800/80 p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                        isCallActive ? 'bg-emerald-600 animate-pulse' : 'bg-blue-600'
                      }`}
                    >
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Test Your Agent in Browser</h3>
                      <p className="text-xs text-zinc-400">
                        {isCallActive ? `Call in progress · ${formatTime(callDuration)}` : 'Click to hear your assistant live'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCallActive(!isCallActive);
                      if (!isCallActive) {
                        toast.success('Call started! Say something to hear your assistant reply.');
                      } else {
                        toast.info('Test call ended.');
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                      isCallActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isCallActive ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>End Call</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Test Call</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Call Status & Waveform */}
                {isCallActive && (
                  <div className="bg-[#090d16] rounded-xl p-4 border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-zinc-200 font-medium">Assistant is Listening & Speaking</span>
                    </div>

                    <div className="flex items-center gap-1.5 h-6">
                      {[15, 30, 20, 45, 25, 40, 50, 30, 20, 35, 45, 25, 15].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}px` }}
                          className="w-1 bg-emerald-500 rounded-full animate-pulse"
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-2 rounded-lg text-xs font-medium cursor-pointer ${
                        isMuted ? 'bg-rose-600/20 text-rose-400' : 'bg-zinc-800 text-zinc-200'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Live Conversation Transcript */}
                <div className="bg-[#090d16] rounded-xl border border-zinc-800 p-4 space-y-3 max-h-[300px] overflow-y-auto">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    What was said during the call:
                  </span>
                  {testTranscript.map((t, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col text-xs ${
                        t.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mb-0.5">
                        <span>{t.sender === 'user' ? 'You' : agentBlueprint.name}</span>
                        <span>· {t.time}</span>
                      </div>
                      <div
                        className={`rounded-xl p-2.5 max-w-[85%] leading-relaxed ${
                          t.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-200'
                        }`}
                      >
                        {t.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Speak or Type Simulator Input */}
                {isCallActive && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testUserSpeech}
                      onChange={(e) => setTestUserSpeech(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendTestUtterance()}
                      placeholder="Say something to test (e.g. 'What are the charges for teeth cleaning?')..."
                      className="flex-1 bg-[#090d16] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleSendTestUtterance}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal in Plain English */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f1424] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Business Information</h3>
                  <p className="text-xs text-zinc-400">Upload documents so your assistant knows your business</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => {
                const newDoc: ReferenceDocument = {
                  id: `doc-${Date.now()}`,
                  name: 'Clinic Services & Warranty Guide',
                  filename: 'services_guide.pdf',
                  size: '1.8 MB',
                  topicsCount: 35,
                  status: 'ready',
                  snippet: 'All dental crowns include a 5-year replacement guarantee with free checkups.'
                };
                setAgentBlueprint((prev) => ({
                  ...prev,
                  knowledgeDocuments: [...prev.knowledgeDocuments, newDoc]
                }));
                setShowDocumentModal(false);
                toast.success('Document uploaded and saved! Your assistant has learned this document.');
              }}
              className="border-2 border-dashed border-zinc-700 hover:border-blue-500/70 bg-[#090d16]/80 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-zinc-200">Click to upload your file</h4>
              <p className="text-[11px] text-zinc-400">PDF, Word document, or Text file (Up to 25MB)</p>
            </div>

            {/* Web URL Reader */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-300 block">Or read from your website:</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    placeholder="https://yourclinic.com/pricing"
                    className="w-full bg-[#090d16] border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowDocumentModal(false);
                    toast.success('Website saved! Your assistant learned 48 topics from your website.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Read Website
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
