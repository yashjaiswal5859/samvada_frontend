import { Voice, Agent, Campaign, KnowledgeDocument, CallRecord, Integration, ApiKey, TeamMember, BillingUsage, AnalyticsSummary, Audience } from '../types';

export const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'OpenAI GPT-4o (Ultra Fast & Smart)', speed: 'Fast', provider: 'OpenAI' },
  { id: 'claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet', speed: 'Medium', provider: 'Anthropic' },
  { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro', speed: 'Ultra Fast', provider: 'Google' },
  { id: 'llama-3-70b', name: 'Meta Llama 3 70B (Open-Weights)', speed: 'Ultra Fast', provider: 'Meta' },
];

export const AVAILABLE_VOICES: Voice[] = [
  { id: 'fish-swara-hi-en', name: 'Swara (Hindi / English, Warm)', provider: 'fish-audio', gender: 'female', language: 'hi-IN, en-IN', accent: 'Indian' },
  { id: 'fish-arjun-hi-en', name: 'Arjun (Hindi / English, Clear)', provider: 'fish-audio', gender: 'male', language: 'hi-IN, en-IN', accent: 'Indian' },
  { id: 'cartesia-aarav-en-in', name: 'Aarav (Indian English)', provider: 'cartesia', gender: 'male', language: 'en-IN', accent: 'Indian' },
  { id: 'playht-elena-en-es', name: 'Elena (English / Spanish)', provider: 'playht', gender: 'female', language: 'en-US, es-ES', accent: 'International' },
  { id: 'azure-neha-hi-en', name: 'Neha (Hindi / English)', provider: 'azure', gender: 'female', language: 'hi-IN, en-IN', accent: 'Indian' },
  { id: 'v-1', name: 'Sarah (US Professional)', provider: 'elevenlabs', gender: 'female', language: 'en-US', accent: 'American' },
  { id: 'v-2', name: 'Michael (Warm Conversational)', provider: 'elevenlabs', gender: 'male', language: 'en-US', accent: 'American' },
  { id: 'v-3', name: 'Aarav (Indian English)', provider: 'elevenlabs', gender: 'male', language: 'en-IN', accent: 'Indian' },
  { id: 'v-4', name: 'Priya (Hindi / English Neutral)', provider: 'elevenlabs', gender: 'female', language: 'en-IN', accent: 'Indian' },
  { id: 'v-5', name: 'Emma (British Formal)', provider: 'elevenlabs', gender: 'female', language: 'en-GB', accent: 'British' },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    workspaceId: 'ws-consumer-care',
    name: 'Refund Specialist Bot',
    role: 'Consumer Care & Instant Refunds',
    description: 'Handles damaged packaging, spilled dishes, item discrepancies, and instant UPI refund processing.',
    systemPrompt: 'You are Samvada, Swiggy Consumer Care assistant. Verify order ID, request image proof if needed, and issue immediate refund credit.',
    voiceId: 'v-4',
    voiceName: 'Priya (Hindi / English)',
    language: 'Hindi + English',
    model: 'gpt-4o',
    status: 'active',
    phoneNumber: '+91 80 4000 1111',
    knowledgeBaseIds: ['kb-1'],
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-15T14:30:00Z',
    totalCalls: 2140,
    avgDurationSec: 165,
    successRate: 95.2,
  },
  {
    id: 'agent-4',
    workspaceId: 'ws-consumer-care',
    name: 'Late Delivery Resolver',
    role: 'Live Order Tracking & Expediting',
    description: 'Tracks delivery partner GPS, calls rider on behalf of customer, and issues delay apology credits.',
    systemPrompt: 'You are Swiggy Priority Support. Check rider location, provide accurate ETA, and reassure hungry customers.',
    voiceId: 'v-3',
    voiceName: 'Aarav (Natural Indian)',
    language: 'English (IN)',
    model: 'gpt-4o',
    status: 'active',
    phoneNumber: '+91 80 4000 1112',
    knowledgeBaseIds: ['kb-1'],
    createdAt: '2026-09-11T08:00:00Z',
    updatedAt: '2026-09-16T12:00:00Z',
    totalCalls: 1820,
    avgDurationSec: 110,
    successRate: 93.4,
  },
  {
    id: 'agent-2',
    workspaceId: 'ws-product-promo',
    name: 'Swiggy One Pitcher',
    role: 'Membership Sales & Upgrades',
    description: 'Pitching annual Swiggy One memberships with zero delivery fees and extra dining discounts.',
    systemPrompt: 'You are Swiggy One Outreach specialist. Highlight savings on daily orders and dining out benefits.',
    voiceId: 'v-4',
    voiceName: 'Priya (Conversational)',
    language: 'English (IN)',
    model: 'gpt-4o',
    status: 'active',
    phoneNumber: '+91 80 4000 2221',
    knowledgeBaseIds: ['kb-2'],
    createdAt: '2026-09-12T09:15:00Z',
    updatedAt: '2026-09-16T11:20:00Z',
    totalCalls: 890,
    avgDurationSec: 140,
    successRate: 91.8,
  },
  {
    id: 'agent-5',
    workspaceId: 'ws-restaurant-onboarding',
    name: 'KYC & FSSAI Verification Assistant',
    role: 'Merchant Onboarding Specialist',
    description: 'Guides restaurant partners through FSSAI upload, GST verification, and menu photo approval.',
    systemPrompt: 'You are Swiggy Merchant Onboarding. Help owners complete digital KYC and bank settlement setups.',
    voiceId: 'v-3',
    voiceName: 'Aarav (Professional)',
    language: 'Hindi + English',
    model: 'gemini-1.5-pro',
    status: 'active',
    phoneNumber: '+91 80 4000 3331',
    knowledgeBaseIds: ['kb-3'],
    createdAt: '2026-09-13T10:00:00Z',
    updatedAt: '2026-09-17T09:00:00Z',
    totalCalls: 620,
    avgDurationSec: 210,
    successRate: 94.0,
  },
  {
    id: 'agent-6',
    workspaceId: 'ws-delivery-support',
    name: 'Rider Emergency & Surge Support',
    role: 'Delivery Partner Helpline',
    description: 'Provides on-road support for delivery partners: rain surge bonus, flat tyre re-assignment, and cashless insurance.',
    systemPrompt: 'You are Swiggy Delivery Partner Helpline. Speak politely in Hindi/English, resolve rider issue quickly.',
    voiceId: 'v-3',
    voiceName: 'Aarav (Support)',
    language: 'Hindi + English',
    model: 'gpt-4o',
    status: 'active',
    phoneNumber: '+91 80 4000 4441',
    knowledgeBaseIds: [],
    createdAt: '2026-09-14T07:30:00Z',
    updatedAt: '2026-09-17T11:00:00Z',
    totalCalls: 1100,
    avgDurationSec: 90,
    successRate: 96.1,
  },
  {
    id: 'agent-3',
    workspaceId: 'ws-collections',
    name: 'Settlement Recovery Bot',
    role: 'Merchant Overdue Collections',
    description: 'Polite reminder calls to partner restaurants for weekly commission deductions and negative balance clearance.',
    systemPrompt: 'You are Swiggy Finance Team. Remind merchants about overdue commission settlement politely.',
    voiceId: 'v-2',
    voiceName: 'Michael (Formal)',
    language: 'English (IN)',
    model: 'gemini-1.5-pro',
    status: 'active',
    phoneNumber: '+91 80 4000 5551',
    knowledgeBaseIds: [],
    createdAt: '2026-09-14T16:00:00Z',
    updatedAt: '2026-09-17T08:00:00Z',
    totalCalls: 450,
    avgDurationSec: 95,
    successRate: 88.5,
  },
];

export const MOCK_AUDIENCES: Audience[] = [
  { id: 'aud-1', name: 'Q3 Pending Claimants List', description: 'Policyholders with open claims', contactCount: 340, createdAt: '2026-09-10' },
  { id: 'aud-2', name: 'Overdue Invoices List (September)', description: 'Customers 30+ days overdue', contactCount: 185, createdAt: '2026-09-12' },
  { id: 'aud-3', name: 'VIP Dental Patients', description: 'Patients due for 6-month cleaning', contactCount: 520, createdAt: '2026-09-14' },
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'September Claims Verification Drive',
    agentId: 'agent-1',
    agentName: 'Claims Support Assistant',
    status: 'running',
    targetAudienceId: 'aud-1',
    targetAudienceName: 'Q3 Pending Claimants List',
    totalContacts: 340,
    completedCalls: 215,
    successfulCalls: 198,
    failedCalls: 17,
    scheduledAt: '2026-09-16T09:00:00Z',
    startedAt: '2026-09-16T09:00:00Z',
    createdAt: '2026-09-15T15:00:00Z',
  },
  {
    id: 'camp-2',
    name: 'Q3 Payment Reminder Outreach',
    agentId: 'agent-3',
    agentName: 'Payment Reminder Bot',
    status: 'scheduled',
    targetAudienceId: 'aud-2',
    targetAudienceName: 'Overdue Invoices List (September)',
    totalContacts: 185,
    completedCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    scheduledAt: '2026-09-18T10:00:00Z',
    createdAt: '2026-09-16T12:00:00Z',
  },
];

export const MOCK_CALL_RECORDS: CallRecord[] = [
  {
    id: 'call-101',
    workspaceId: 'ws-consumer-care',
    agentId: 'agent-1',
    agentName: 'Refund Specialist Bot',
    customerName: 'Robert Fox',
    customerPhone: '+91 98765 43210',
    direction: 'inbound',
    status: 'completed',
    durationSec: 214,
    costUsd: 0.18,
    sentiment: 'positive',
    evaluationScore: 96,
    recordingUrl: 'https://actions.google.com/sounds/v1/speech/person_talking.ogg',
    summary: 'Customer called about food spilled in transit. Agent verified order #SW-8921 and approved instant UPI refund of ₹450.',
    transcript: [
      { id: 't-1', speaker: 'agent', timestamp: '00:02', text: 'Hello! Thank you for calling Swiggy Care. My name is Priya, how can I assist you with your order?', sentiment: 'positive' },
      { id: 't-2', speaker: 'customer', timestamp: '00:08', text: 'Hi Priya, my dal makhani spilled all over the bag. Everything is ruined.', sentiment: 'negative' },
      { id: 't-3', speaker: 'agent', timestamp: '00:14', text: 'I am so sorry for this bad experience! I have initiated a full refund of ₹450 to your Google Pay account right now.', sentiment: 'positive' },
      { id: 't-4', speaker: 'customer', timestamp: '00:22', text: 'Thank you for handling it so quickly!', sentiment: 'positive' },
    ],
    createdAt: '2026-09-17T14:22:00Z',
  },
  {
    id: 'call-102',
    workspaceId: 'ws-product-promo',
    agentId: 'agent-2',
    agentName: 'Swiggy One Pitcher',
    customerName: 'Emily Watson',
    customerPhone: '+91 91234 56789',
    direction: 'outbound',
    status: 'completed',
    durationSec: 130,
    costUsd: 0.11,
    sentiment: 'positive',
    evaluationScore: 92,
    summary: 'Outbound pitch for annual Swiggy One membership. Customer subscribed with 50% promotional discount.',
    transcript: [
      { id: 't-10', speaker: 'agent', timestamp: '00:02', text: 'Hi Emily, this is Priya calling from Swiggy One. We noticed you order frequently in Koramangala!', sentiment: 'positive' },
      { id: 't-11', speaker: 'customer', timestamp: '00:07', text: 'Yes! Is there any offer running?', sentiment: 'neutral' },
      { id: 't-12', speaker: 'agent', timestamp: '00:11', text: 'Yes, we have an exclusive 50% discount on annual Swiggy One with free delivery across all restaurants.', sentiment: 'positive' },
    ],
    createdAt: '2026-09-17T13:45:00Z',
  },
  {
    id: 'call-103',
    workspaceId: 'ws-restaurant-onboarding',
    agentId: 'agent-5',
    agentName: 'KYC & FSSAI Verification Assistant',
    customerName: 'Karan Malhotra (Punjab Grill)',
    customerPhone: '+91 78965 41230',
    direction: 'outbound',
    status: 'completed',
    durationSec: 195,
    costUsd: 0.16,
    sentiment: 'positive',
    evaluationScore: 94,
    summary: 'Assisted restaurant owner with uploading FSSAI renewal certificate to merchant portal.',
    transcript: [
      { id: 't-20', speaker: 'agent', timestamp: '00:02', text: 'Namaste Karan ji, I am calling from Swiggy Partner Support regarding your FSSAI certificate.', sentiment: 'positive' },
      { id: 't-21', speaker: 'customer', timestamp: '00:08', text: 'Yes, I received the renewal certificate today.', sentiment: 'neutral' },
      { id: 't-22', speaker: 'agent', timestamp: '00:15', text: 'Wonderful! I have sent you a direct WhatsApp upload link. Once uploaded, your listing will be verified within 2 hours.', sentiment: 'positive' },
    ],
    createdAt: '2026-09-17T11:10:00Z',
  },
  {
    id: 'call-104',
    workspaceId: 'ws-delivery-support',
    agentId: 'agent-6',
    agentName: 'Rider Emergency & Surge Support',
    customerName: 'Rajesh Kumar (Rider #492)',
    customerPhone: '+91 94321 09876',
    direction: 'inbound',
    status: 'completed',
    durationSec: 90,
    costUsd: 0.08,
    sentiment: 'positive',
    evaluationScore: 98,
    summary: 'Rider called for rain surge payout clarification for Indiranagar zone. Bonus verified and credited.',
    transcript: [
      { id: 't-30', speaker: 'agent', timestamp: '00:02', text: 'Hello Rajesh, Swiggy Rider Helpline. How can I help you today?', sentiment: 'positive' },
      { id: 't-31', speaker: 'customer', timestamp: '00:06', text: 'I completed 5 orders in heavy rain in Indiranagar. Was the ₹30 per order bonus credited?', sentiment: 'neutral' },
      { id: 't-32', speaker: 'agent', timestamp: '00:12', text: 'Yes Rajesh, ₹150 rain incentive has been approved and will reflect in your Tuesday weekly settlement.', sentiment: 'positive' },
    ],
    createdAt: '2026-09-17T10:00:00Z',
  },
  {
    id: 'call-105',
    workspaceId: 'ws-collections',
    agentId: 'agent-3',
    agentName: 'Settlement Recovery Bot',
    customerName: 'Deepak Seth (Cafe Coffee)',
    customerPhone: '+91 95432 10987',
    direction: 'outbound',
    status: 'completed',
    durationSec: 105,
    costUsd: 0.09,
    sentiment: 'positive',
    evaluationScore: 90,
    summary: 'Merchant agreed to deduct outstanding commission of ₹3,200 from upcoming Friday weekly payout.',
    transcript: [
      { id: 't-40', speaker: 'agent', timestamp: '00:02', text: 'Hello Deepak ji, calling from Swiggy Merchant Accounts regarding weekly commission adjustment.', sentiment: 'neutral' },
      { id: 't-41', speaker: 'customer', timestamp: '00:08', text: 'Yes, please adjust the balance from this Friday payout.', sentiment: 'neutral' },
      { id: 't-42', speaker: 'agent', timestamp: '00:14', text: 'Done! The adjustment of ₹3,200 has been scheduled for Friday payout. Thank you for your partnership.', sentiment: 'positive' },
    ],
    createdAt: '2026-09-16T16:30:00Z',
  }
];

export const MOCK_KNOWLEDGE: KnowledgeDocument[] = [
  { id: 'kb-1', name: 'Auto_Insurance_Policy_2026.pdf', type: 'file', source: 'Internal PDF Document', sizeBytes: 2450000, status: 'indexed', chunkCount: 142, createdAt: '2026-09-10', updatedAt: '2026-09-10' },
  { id: 'kb-2', name: 'https://apexdental.com/services-faq', type: 'url', source: 'Web Scraper', status: 'indexed', chunkCount: 68, createdAt: '2026-09-12', updatedAt: '2026-09-15' },
  { id: 'kb-3', name: 'Dental_Pricing_Guide_v2.docx', type: 'file', source: 'Uploaded Doc', sizeBytes: 890000, status: 'indexed', chunkCount: 34, createdAt: '2026-09-14', updatedAt: '2026-09-14' },
];

export const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int-1', name: 'Twilio Telephony', category: 'telephony', description: 'Inbound & Outbound phone number SIP trunking and carrier routing.', iconName: 'Phone', connected: true, apiKeySet: true },
  { id: 'int-2', name: 'Salesforce CRM', category: 'crm', description: 'Automatically sync call logs, transcripts, and lead scores directly into Salesforce.', iconName: 'Database', connected: true, apiKeySet: true },
  { id: 'int-3', name: 'Zapier Webhooks', category: 'automation', description: 'Trigger 5,000+ app workflows upon call completion or sentiment events.', iconName: 'Zap', connected: true, apiKeySet: true },
  { id: 'int-4', name: 'HubSpot CRM', category: 'crm', description: 'Update deal stages and contact records following customer conversations.', iconName: 'Users', connected: false, apiKeySet: false },
  { id: 'int-5', name: 'Custom HTTP Webhook', category: 'webhooks', description: 'Receive raw JSON payloads for real-time speech events and call summaries.', iconName: 'Code', connected: true, apiKeySet: true, webhookUrl: 'https://api.yourcompany.com/v1/voice-webhooks' },
];

export const MOCK_API_KEYS: ApiKey[] = [
  { id: 'key-1', name: 'Production Backend Key', keyPrefix: 'samvada_live_89f2...', createdAt: '2026-09-01', lastUsedAt: '2026-09-17 15:30' },
  { id: 'key-2', name: 'Staging Testing Secret', keyPrefix: 'samvada_test_3a12...', createdAt: '2026-09-10', lastUsedAt: '2026-09-16 18:40' },
];

export const MOCK_TEAM: TeamMember[] = [
  { id: 'team-1', name: 'Yash Jaiswal', email: 'yash@samvada.ai', role: 'owner', status: 'active', joinedAt: '2026-08-15' },
  { id: 'team-2', name: 'Ananya Sharma', email: 'ananya@samvada.ai', role: 'admin', status: 'active', joinedAt: '2026-09-01' },
  { id: 'team-3', name: 'Dev Team Lead', email: 'dev@samvada.ai', role: 'developer', status: 'invited', joinedAt: '2026-09-15' },
];

export const MOCK_BILLING: BillingUsage = {
  planName: 'Enterprise Growth Tier',
  totalCredits: 10000,
  usedCredits: 2450,
  billingCycleEnd: '2026-10-01',
  minutesUsed: 490,
  minutesLimit: 2000,
  costThisMonthUsd: 147.00,
  paymentMethod: { brand: 'Visa', last4: '4242', expiry: '12/28' },
};

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalCalls: 2580,
  totalDurationMin: 724,
  avgLatencyMs: 420,
  overallSuccessRate: 93.4,
  totalCostUsd: 217.20,
  dailyCallVolume: [
    { date: 'Sep 11', calls: 320, cost: 26.8 },
    { date: 'Sep 12', calls: 410, cost: 34.5 },
    { date: 'Sep 13', calls: 390, cost: 32.1 },
    { date: 'Sep 14', calls: 480, cost: 40.2 },
    { date: 'Sep 15', calls: 420, cost: 35.0 },
    { date: 'Sep 16', calls: 560, cost: 48.6 },
    { date: 'Sep 17', calls: 610, cost: 52.4 },
  ],
  sentimentBreakdown: { positive: 74, neutral: 21, negative: 5 },
};

export const DEFAULT_VOICE_PROMPT_TEMPLATE = `## Who you are
You are Cathy, a voice assistant for {{ORGANIZATION}}.
You sound warm, professional, and unhurried — like an experienced receptionist who genuinely wants to help.
Stay in character at all times.

## How to conduct the call
1. Listen and identify why the caller is reaching out.
2. Collect required details one at a time — never ask two questions at once.
3. Take action: look up information, book requests, or answer questions.
4. Read back critical details: always verify names, numbers, and dates.
5. Close clearly: confirm next steps and check if they need anything else.

If a request cannot be completed live, collect callback details (see Callback protocol below).

## How you speak
- Keep every reply to 2–3 short sentences. This is a phone call, not an email.
- Ask one question, then wait. Don't stack questions.
- Output plain spoken text only: never use markdown, bullet points, asterisks, URLs, or emojis. Everything is read aloud by text-to-speech.
- Say numbers, phone digits, and currency naturally so they sound clear over the phone.
- Spell back names and read back numbers to double-check.
- If the caller speaks or interrupts, stop immediately and listen.
- Match their pace — if they're relaxed, slow down; if they're in a rush, be brisk.

## Handling difficult situations
- Frustrated caller: Acknowledge with empathy ("I completely understand your frustration and I'm sorry for the trouble"), avoid arguing, and focus on practical solutions.
- Dead air (silence): If silent for 5 seconds, gently check "Are you still there?". After repeated silence, politely let them know the call may have disconnected before hanging up.
- Unclear audio / mishearing: Politely ask them to repeat or spell out names/words. Never guess.

## Callback protocol
When an issue cannot be resolved on the call, collect these four items:
1. Full name
2. Best phone number
3. Reason for the call (one sentence)
4. Preferred callback time (morning, afternoon, or evening)
Read it back to confirm before ending the call.

## Guardrails & boundaries
- Anti-hallucination: Only provide information from verified company knowledge. If you do not know or information is missing, admit it honestly — never invent prices, policies, or commitments.
- Sensitive data: Never request, collect, or repeat passwords, PINs, OTPs, CVVs, or full credit card numbers. If a caller offers them, tell them not to share them over the phone.
- Stay on topic: Only assist with matters relevant to {{ORGANIZATION}}. Politely redirect unrelated queries.
- Human transfer: If the caller asks to speak with a human or manager, transfer them immediately without arguing or resisting.`;

export const DEFAULT_INBOUND_GREETING = "Hello, thanks for calling {{ORGANIZATION}}. My name is Cathy, how can I assist you today?";
export const DEFAULT_OUTBOUND_GREETING = "Hi, this is Cathy calling from {{ORGANIZATION}}. Am I speaking with [Contact Name]?";

export const populateOrgName = (template: string, orgName?: string): string => {
  const name = orgName?.trim() || 'our organization';
  return template
    .replace(/\{\{ORGANIZATION\}\}/g, name)
    .replace(/COMPANY_NAME/g, name);
};

export interface ProviderOption {
  id: string;
  name: string;
  note: string;
  recommended?: boolean;
}

export interface PurchasedNumberPreview {
  id: string;
  maskedNumber: string;
  label: string;
  region: string;
  direction: 'inbound' | 'outbound' | 'both';
  available: boolean;
}

export interface AgentCreationStep {
  id: 1 | 2 | 3 | 4;
  label: string;
  short: string;
}

export interface SupportedLanguage {
  id: string;
  name: string;
}

export interface AgentStarterTemplate {
  id: string;
  title: string;
  role: string;
  icon: string;
  desc: string;
  prompt: string;
}

export interface VoiceCatalogItem {
  id: string;
  name: string;
  provider: 'Cartesia Sonic' | 'ElevenLabs Turbo' | 'PlayHT 2.0' | 'OpenAI Realtime' | string;
  gender: 'Female' | 'Male' | 'Neutral';
  accent: string;
  language: string;
  avatar: string;
  sampleText: string;
  latencyTtfb: string;
  samplingRate: string;
  tone: string;
  idealUse: string;
  tags?: string;
  isTrending?: boolean;
  isCloned?: boolean;
}

export const AGENT_CREATION_STEPS: AgentCreationStep[] = [
  { id: 1, label: 'Agent brief', short: 'Purpose' },
  { id: 2, label: 'Voice & speech', short: 'Voice' },
  { id: 3, label: 'Knowledge & tools', short: 'Resources' },
  { id: 4, label: 'Escalation & review', short: 'Review' },
];

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { id: 'en-IN', name: 'English (India)' },
  { id: 'hi-IN', name: 'Hindi' },
  { id: 'bn-IN', name: 'Bengali' },
  { id: 'ta-IN', name: 'Tamil' },
  { id: 'te-IN', name: 'Telugu' },
  { id: 'mr-IN', name: 'Marathi' },
  { id: 'kn-IN', name: 'Kannada' },
  { id: 'gu-IN', name: 'Gujarati' },
  { id: 'pa-IN', name: 'Punjabi' },
  { id: 'ml-IN', name: 'Malayalam' },
  { id: 'en-US', name: 'English (United States)' },
  { id: 'es-ES', name: 'Spanish' },
];

export const TELEPHONY_PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'plivo', name: 'Plivo', note: 'Recommended · phone numbers and call routing', recommended: true },
  { id: 'twilio', name: 'Twilio', note: 'Use your connected Twilio account' },
  { id: 'sip', name: 'Bring your own SIP trunk', note: 'Connect an existing carrier in Integrations' },
];

export const STT_PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'deepgram', name: 'Deepgram', note: 'Recommended · streaming transcription', recommended: true },
  { id: 'google-speech', name: 'Google Cloud Speech', note: 'Speech recognition through Google Cloud' },
  { id: 'azure-speech', name: 'Azure AI Speech', note: 'Speech recognition through Microsoft Azure' },
];

export const LLM_PROVIDER_OPTIONS: ProviderOption[] = [
  { id: 'gpt-mini', name: 'GPT mini', note: 'Recommended · optimized for low latency and cost', recommended: true },
  { id: 'claude-haiku', name: 'Claude Haiku', note: 'Fast model for concise conversations' },
  { id: 'gemini-flash', name: 'Gemini Flash', note: 'Fast multilingual model' },
  { id: 'gpt-4o', name: 'GPT-4o', note: 'Higher-capability model for complex tasks' },
];

export const TTS_PROVIDER_OPTIONS: Array<ProviderOption & { id: Voice['provider'] }> = [
  { id: 'fish-audio', name: 'Fish Audio', note: 'Recommended · expressive speech generation', recommended: true },
  { id: 'elevenlabs', name: 'ElevenLabs', note: 'Natural voices with broad language coverage' },
  { id: 'cartesia', name: 'Cartesia', note: 'Low-latency conversational speech' },
  { id: 'playht', name: 'PlayHT', note: 'Expressive multilingual speech' },
  { id: 'azure', name: 'Azure Speech', note: 'Neural voices from Microsoft Azure' },
];

export const PURCHASED_NUMBER_PREVIEW: PurchasedNumberPreview[] = [
  { id: 'preview-number-support', maskedNumber: '+91 •••• •• 0184', label: 'Customer care', region: 'Bengaluru', direction: 'both', available: true },
  { id: 'preview-number-claims', maskedNumber: '+91 •••• •• 6208', label: 'Claims line', region: 'Mumbai', direction: 'inbound', available: true },
  { id: 'preview-number-outbound', maskedNumber: '+91 •••• •• 9031', label: 'Outbound caller ID', region: 'Delhi', direction: 'outbound', available: true },
  { id: 'preview-number-assigned', maskedNumber: '+91 •••• •• 4482', label: 'Billing line', region: 'Chennai', direction: 'both', available: false },
];

export const AGENT_STARTER_TEMPLATES: AgentStarterTemplate[] = [
  {
    id: 'support',
    title: 'Customer Experience Support',
    role: 'Customer Support Lead',
    icon: '🎧',
    desc: 'Resolves FAQs, tracks shipments, and escalates complex issues.',
    prompt: 'You are a warm, highly efficient customer support specialist. Assist the user with order tracking, returns, and common inquiries with empathy and concise answers.',
  },
  {
    id: 'claims',
    title: 'Healthcare Patient Intake',
    role: 'Clinical Intake Specialist',
    icon: '🩺',
    desc: 'HIPAA-compliant patient screening, intake, and doctor appointments.',
    prompt: 'You are a clinical intake assistant. Adhere strictly to HIPAA guidelines. Collect symptoms and schedule doctor appointments with utmost care.',
  },
  {
    id: 'sales',
    title: 'Inbound B2B Sales SDR',
    role: 'Executive Sales Development Rep',
    icon: '💼',
    desc: 'Qualifies inbound website leads and books discovery meetings.',
    prompt: 'You are an executive SDR. Inquire about monthly call volume, current tech stack, and schedule executive consultations for high-intent leads.',
  },
  {
    id: 'fintech',
    title: 'Debt Restructuring & KYC',
    role: 'Account Resolution Advisor',
    icon: '💳',
    desc: 'Empathetic payment planning and secure identity verification.',
    prompt: 'You are a compassionate account resolution advisor. Assist customers with flexible, compliant installment plans while verifying identity securely.',
  },
];

export const ALL_INDUSTRIES: string[] = [
  'Healthcare & Medical',
  'Home & Trade Services',
  'Real Estate & Property Management',
  'Retail & E-commerce',
  'Insurance',
  'Banking & Financial Services',
  'Legal Services',
  'Automotive',
  'Beauty, Salon & Spa',
  'Restaurants & Food Service',
  'Hospitality & Travel',
  'Education & Training',
  'Fitness & Wellness',
  'Technology & SaaS',
  'Professional Services',
  'Logistics & Transportation',
  'Staffing & Recruitment',
  'Utilities & Telecom',
  'Veterinary & Pet Care',
  'Manufacturing & Industrial',
  'Government & Public Sector',
  'Non-Profit & Community',
  'Media & Entertainment',
  'General / Cross-industry',
  'Others',
];

export const INDUSTRY_CATEGORIES: string[] = [
  'All',
  'Insurance',
  'Healthcare & Medical',
  'Banking & Financial Services',
  'Real Estate & Property Management',
  'Retail & E-commerce',
  'Home & Trade Services',
  'Legal Services',
  'Automotive',
  'Technology & SaaS',
  'Professional Services',
  'Education & Training',
];

export const USE_CASE_CATEGORIES: string[] = [
  'All',
  'Customer Support',
  'Scheduling',
  'Intake',
  'Billing',
  'Outreach',
  'Receptionist',
  'Sales',
];

export interface WorkflowNode {
  id: string;
  title: string;
  type: 'trigger' | 'crm' | 'knowledge' | 'brain' | 'tool' | 'output';
  subtitle: string;
  x: number;
  y: number;
  status: 'active' | 'configured';
  details: string;
}

export const DEFAULT_WORKFLOW_NODES: WorkflowNode[] = [
  {
    id: 'node-trigger',
    title: 'Call incoming / outgoing',
    type: 'trigger',
    subtitle: '+1 (415) 890-2341 • Twilio SIP',
    x: 40,
    y: 180,
    status: 'active',
    details: 'Accepts incoming RTP stream, negotiates G.711 / Opus audio codec, and routes session to Samvada Media Gateway.',
  },
  {
    id: 'node-pre-call',
    title: 'Pre-call integrations',
    type: 'crm',
    subtitle: 'Prepare context before conversation',
    x: 280,
    y: 120,
    status: 'active',
    details: 'Extracts caller ID, fetches loyalty VIP tier, previous reservation history, and injects payload into session state.',
  },
  {
    id: 'node-kb',
    title: 'Knowledge bases',
    type: 'knowledge',
    subtitle: 'Grand Horizon Resort Guidelines.pdf',
    x: 580,
    y: 40,
    status: 'configured',
    details: 'Embeds real-time queries with BGE-M3 and performs sub-25ms semantic search over resort amenities.',
  },
  {
    id: 'node-brain',
    title: 'Agent Core Intelligence',
    type: 'brain',
    subtitle: 'Realtime Model & Voice',
    x: 580,
    y: 180,
    status: 'active',
    details: 'Executes streaming turn-by-turn inference with conversational guardrails, interruption detection, and acoustic synthesis.',
  },
  {
    id: 'node-post-call',
    title: 'Post-call integrations',
    type: 'tool',
    subtitle: 'Send results to connected services',
    x: 900,
    y: 100,
    status: 'configured',
    details: 'Binds available dining tables or spa appointments directly with two-way calendar synchronization.',
  },
  {
    id: 'node-extraction',
    title: 'Data extraction',
    type: 'output',
    subtitle: 'Structured JSON & transcript',
    x: 900,
    y: 260,
    status: 'active',
    details: 'Extracts structured caller intents, CSAT indicators, and entity slots after call completion.',
  },
];

export const VOICES_CATALOG: VoiceCatalogItem[] = [
  {
    id: 'voice-sophia',
    name: 'Sophia',
    provider: 'Cartesia Sonic',
    gender: 'Female',
    accent: 'British Luxury',
    language: 'English',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Good evening. Welcome to the Grand Horizon Resort. My name is Sophia. How may I orchestrate your stay today?',
    latencyTtfb: '135ms TTFB',
    samplingRate: '48kHz Lossless',
    tone: 'Sophisticated & Warm',
    idealUse: 'Luxury Hospitality, VIP Concierge',
    tags: 'Polished, Warm, Anticipatory',
    isTrending: true,
  },
  {
    id: 'voice-james',
    name: 'James',
    provider: 'ElevenLabs Turbo',
    gender: 'Male',
    accent: 'American Clinical',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Hello, this is James from Providence Health. I can help you schedule your clinic visit or review intake questions.',
    latencyTtfb: '145ms TTFB',
    samplingRate: '48kHz HD',
    tone: 'Gentle & Authoritative',
    idealUse: 'Healthcare Intake, HIPAA Triage',
    tags: 'Clinical, Reassuring, Empathetic',
    isTrending: true,
  },
  {
    id: 'voice-aarav',
    name: 'Aarav',
    provider: 'Cartesia Sonic',
    gender: 'Male',
    accent: 'Indian English',
    language: 'English, Hindi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Namaste and welcome. I am Aarav, your personal automotive advisor. How can I assist with your vehicle service?',
    latencyTtfb: '138ms TTFB',
    samplingRate: '48kHz HD',
    tone: 'Polite, Clear & Energetic',
    idealUse: 'Automotive Dealership, Bilingual Support',
    tags: 'Polite, Clear, Energetic',
    isTrending: true,
  },
  {
    id: 'voice-elena',
    name: 'Elena',
    provider: 'PlayHT 2.0',
    gender: 'Female',
    accent: 'Spanish & English',
    language: 'English, Spanish',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Hello, this is Elena from Apex Financial. I can assist you today with structured payment agreements and account updates.',
    latencyTtfb: '160ms TTFB',
    samplingRate: '44.1kHz',
    tone: 'Empathetic & Firm',
    idealUse: 'Fintech Collections, Debt Restructuring',
    tags: 'Empathetic, Clear, Professional',
  },
  {
    id: 'voice-liam',
    name: 'Liam',
    provider: 'PlayHT 2.0',
    gender: 'Male',
    accent: 'American Corporate',
    language: 'English (US)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Hi! This is Liam with CloudScale Systems. I noticed your team requested a voice automation benchmark demo.',
    latencyTtfb: '150ms TTFB',
    samplingRate: '48kHz HD',
    tone: 'Confident & Engaging',
    idealUse: 'B2B Sales SDR, Inbound Lead Qualification',
    tags: 'Executive, Energetic, Authoritative',
  },
  {
    id: 'voice-priya',
    name: 'Priya',
    provider: 'ElevenLabs Turbo',
    gender: 'Female',
    accent: 'Indian Neutral',
    language: 'English, Hindi',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    sampleText: 'Hi there! This is Priya from Lumina Goods. I can look up your recent shipment or initiate a refund in just seconds.',
    latencyTtfb: '142ms TTFB',
    samplingRate: '48kHz HD',
    tone: 'Warm, Patient & Empathetic',
    idealUse: 'E-Commerce CSAT, Inbound Telephony',
    tags: 'Mature, Reassuring, Confident',
  },
];

export interface AgentPerformance {
  rank: number;
  id: string;
  name: string;
  role: string;
  avatar: string;
  model: string;
  voice: string;
  totalCalls: number;
  avgDuration: string;
  csat: number;
  resolutionRate: number;
  p50Latency: number;
  costPerCall: string;
}

export const AGENT_LEADERBOARD: AgentPerformance[] = [
  {
    rank: 1,
    id: 'agent-maya-hotel',
    name: 'Maya',
    role: 'Luxury Hospitality Concierge',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'GPT-4o Realtime',
    voice: 'Cartesia Sonic (Warm)',
    totalCalls: 9420,
    avgDuration: '2m 45s',
    csat: 4.94,
    resolutionRate: 94.2,
    p50Latency: 245,
    costPerCall: '$0.11',
  },
  {
    rank: 2,
    id: 'agent-david-clinic',
    name: 'David',
    role: 'Clinical Triage & Scheduling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'Claude 3.5 Sonnet',
    voice: 'ElevenLabs Turbo (Reassuring)',
    totalCalls: 6810,
    avgDuration: '3m 12s',
    csat: 4.88,
    resolutionRate: 91.5,
    p50Latency: 285,
    costPerCall: '$0.13',
  },
  {
    rank: 3,
    id: 'agent-liam-sdr',
    name: 'Liam',
    role: 'Enterprise SDR & Discovery',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'Claude 3.5 Sonnet',
    voice: 'PlayHT 2.0 (Authoritative)',
    totalCalls: 4320,
    avgDuration: '4m 05s',
    csat: 4.82,
    resolutionRate: 88.4,
    p50Latency: 290,
    costPerCall: '$0.16',
  },
  {
    rank: 4,
    id: 'agent-elena-claims',
    name: 'Elena',
    role: 'First Notice of Loss Claims',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'GPT-4o Realtime',
    voice: 'Azure Neural HD (Empathetic)',
    totalCalls: 2150,
    avgDuration: '3m 50s',
    csat: 4.86,
    resolutionRate: 89.0,
    p50Latency: 260,
    costPerCall: '$0.15',
  },
  {
    rank: 5,
    id: 'agent-marcus-banking',
    name: 'Marcus',
    role: 'Card Fraud & Disputes',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'Llama 3.3 70B',
    voice: 'ElevenLabs Turbo (Calm)',
    totalCalls: 1120,
    avgDuration: '2m 10s',
    csat: 4.79,
    resolutionRate: 86.8,
    p50Latency: 310,
    costPerCall: '$0.09',
  },
  {
    rank: 6,
    id: 'agent-priya-retail',
    name: 'Priya',
    role: 'Omnichannel Order Tracking',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
    model: 'GPT-4o Realtime',
    voice: 'Cartesia Sonic (Energetic)',
    totalCalls: 700,
    avgDuration: '1m 55s',
    csat: 4.81,
    resolutionRate: 92.0,
    p50Latency: 250,
    costPerCall: '$0.08',
  },
];

export interface TopicIntent {
  intent: string;
  volumePct: number;
  resolutionPct: number;
  avgTime: string;
  trend: string;
}

export const TOPIC_INTENTS: TopicIntent[] = [
  { intent: 'Reservation Booking & Room Upgrade', volumePct: 34, resolutionPct: 96, avgTime: '2m 15s', trend: '+14%' },
  { intent: 'Prescription Refill & Clinic Schedule', volumePct: 24, resolutionPct: 92, avgTime: '3m 05s', trend: '+8%' },
  { intent: 'SaaS Demo Qualification & BANT Routing', volumePct: 18, resolutionPct: 88, avgTime: '4m 10s', trend: '+22%' },
  { intent: 'First Notice of Loss Auto Claims', volumePct: 14, resolutionPct: 84, avgTime: '3m 50s', trend: '+3%' },
  { intent: 'Billing Inquiry & Cancellation Prevention', volumePct: 10, resolutionPct: 79, avgTime: '3m 30s', trend: '-2%' },
];

export interface DailyTrendData {
  date: string;
  calls: number;
  completed: number;
  escalated: number;
}

export const DAILY_TREND_DATA: DailyTrendData[] = [
  { date: 'Mon', calls: 3240, completed: 3080, escalated: 160 },
  { date: 'Tue', calls: 3950, completed: 3740, escalated: 210 },
  { date: 'Wed', calls: 4420, completed: 4210, escalated: 210 },
  { date: 'Thu', calls: 4180, completed: 3960, escalated: 220 },
  { date: 'Fri', calls: 4690, completed: 4450, escalated: 240 },
  { date: 'Sat', calls: 2120, completed: 2010, escalated: 110 },
  { date: 'Sun', calls: 1920, completed: 1830, escalated: 90 },
];

export interface HourlyHeatmapItem {
  hour: string;
  load: number;
}

export const HOURLY_HEATMAP: HourlyHeatmapItem[] = [
  { hour: '00:00', load: 12 }, { hour: '02:00', load: 8 }, { hour: '04:00', load: 6 },
  { hour: '06:00', load: 24 }, { hour: '08:00', load: 68 }, { hour: '10:00', load: 95 },
  { hour: '12:00', load: 88 }, { hour: '14:00', load: 98 }, { hour: '16:00', load: 92 },
  { hour: '18:00', load: 74 }, { hour: '20:00', load: 45 }, { hour: '22:00', load: 28 },
];

export interface MarketplaceTemplate {
  id: string;
  name: string;
  role: string;
  category: 'support' | 'sales' | 'healthcare' | 'fintech' | 'automotive' | 'hospitality';
  categoryLabel: string;
  avatar: string;
  model: string;
  voiceProvider: string;
  voiceName: string;
  language: string;
  description: string;
  greetingSample: string;
  callsRouted: string;
  turnLatency: string;
  csatRating: string;
  complianceBadges: string[];
  systemPromptPreset?: string;
}

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [
  {
    id: 'tpl-maya-hospitality',
    name: 'Maya',
    role: 'Luxury Hospitality Concierge',
    category: 'hospitality',
    categoryLabel: 'Hospitality & Travel',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    model: 'GPT-4o Realtime',
    voiceProvider: 'Cartesia Sonic',
    voiceName: 'British Luxury (Sophia)',
    language: 'English, Hindi',
    description: 'Manages 5-star resort reservations, bespoke dining bookings, room service orders, and VIP guest queries with warm sophistication.',
    greetingSample: 'Good evening. Welcome to the Grand Horizon Resort. My name is Maya. How may I orchestrate your stay today?',
    callsRouted: '34.2k calls',
    turnLatency: '180ms P50',
    csatRating: '4.96 / 5.0',
    complianceBadges: ['SOC-2 Type II', 'GDPR', 'PCI-DSS L1'],
    systemPromptPreset: 'You are Maya, an ultra-luxury resort concierge. Maintain an immaculate, courteous, and anticipatory demeanor. Assist guests with suite bookings, dining reservations, and personalized itinerary requests.',
  },
  {
    id: 'tpl-david-healthcare',
    name: 'David',
    role: 'Clinical Triage & Patient Intake',
    category: 'healthcare',
    categoryLabel: 'Healthcare & Clinical',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    model: 'Claude 3.5 Sonnet',
    voiceProvider: 'ElevenLabs Turbo v2.5',
    voiceName: 'Gentle Clinical (James)',
    language: 'English (US)',
    description: 'HIPAA-compliant patient screening, medical record intake, symptom pre-evaluation, and automated clinic calendar scheduling.',
    greetingSample: 'Hello, this is David with Providence Health. I can help you schedule your appointment or securely update your medical intake records. How may I assist you today?',
    callsRouted: '19.8k calls',
    turnLatency: '210ms P50',
    csatRating: '4.94 / 5.0',
    complianceBadges: ['HIPAA Compliant', 'SOC-2 Type II', 'BAA Ready'],
    systemPromptPreset: 'You are David, a clinical intake assistant for Providence Health. Maintain strict HIPAA confidentiality. Confirm patient DOB, collect symptoms with clinical clarity, and guide patient scheduling.',
  },
  {
    id: 'tpl-elena-fintech',
    name: 'Elena',
    role: 'Fintech Debt Resolution & KYC',
    category: 'fintech',
    categoryLabel: 'Fintech & Collections',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    model: 'DeepSeek-V3',
    voiceProvider: 'PlayHT 2.0',
    voiceName: 'Authoritative Empathic (Elena)',
    language: 'English, Spanish',
    description: 'Handles compassionate payment restructuring, instant identity verification, and PCI-DSS compliant installment agreements.',
    greetingSample: 'Hello, this is Elena on behalf of Apex Financial. I am calling regarding your account update and can assist you with confidential, flexible payment options today.',
    callsRouted: '42.1k calls',
    turnLatency: '220ms P50',
    csatRating: '4.89 / 5.0',
    complianceBadges: ['PCI-DSS L1', 'SOC-2 Type II', 'FCRA Compliant'],
    systemPromptPreset: 'You are Elena, a debt resolution specialist. You must remain empathetic, professional, and compliant with consumer debt protection regulations. Offer structured payment plans.',
  },
  {
    id: 'tpl-marcus-automotive',
    name: 'Marcus',
    role: 'Automotive Dealership & Service',
    category: 'automotive',
    categoryLabel: 'Automotive & Dealership',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    model: 'Llama 3.3 70B',
    voiceProvider: 'Cartesia Sonic',
    voiceName: 'Energetic Pro (Marcus)',
    language: 'English (US)',
    description: 'Inbound scheduler for vehicle maintenance, warranty questions, repair shop status updates, and trade-in appraisals.',
    greetingSample: 'Thanks for calling Apex Motors Service Center. My name is Marcus. Are you looking to schedule routine maintenance or check on an active vehicle repair?',
    callsRouted: '16.4k calls',
    turnLatency: '195ms P50',
    csatRating: '4.91 / 5.0',
    complianceBadges: ['SOC-2 Type II', 'GDPR Compliant'],
    systemPromptPreset: 'You are Marcus, service director at Apex Motors. Ask for vehicle make, model, year, and mileage. Book service appointments into the dealer management system.',
  },
  {
    id: 'tpl-priya-ecommerce',
    name: 'Priya',
    role: 'E-Commerce VIP Concierge & Returns',
    category: 'support',
    categoryLabel: 'Customer Support',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    model: 'GPT-4o Realtime',
    voiceProvider: 'ElevenLabs Turbo v2.5',
    voiceName: 'Warm & Attentive (Priya)',
    language: 'English, Hindi',
    description: 'Resolves shipment inquiries, processing real-time returns, exchanges, warranty claims, and Shopify order lookup with zero hold time.',
    greetingSample: 'Hi there! This is Priya from Lumina Goods. I can look up your recent order or initiate a hassle-free exchange right now. What can I do for you?',
    callsRouted: '51.3k calls',
    turnLatency: '205ms P50',
    csatRating: '4.95 / 5.0',
    complianceBadges: ['SOC-2 Type II', 'GDPR', 'PCI-DSS'],
    systemPromptPreset: 'You are Priya, customer experience lead. Verify customer order numbers, check real-time tracking, and process return labels with utmost warmth and efficiency.',
  },
  {
    id: 'tpl-liam-sales',
    name: 'Liam',
    role: 'B2B Enterprise SDR & Inbound Qualifier',
    category: 'sales',
    categoryLabel: 'Inbound Sales & SDR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    model: 'Claude 3.5 Sonnet',
    voiceProvider: 'PlayHT 2.0',
    voiceName: 'Executive SDR (Liam)',
    language: 'English (US)',
    description: 'Engages high-intent website inbound leads, analyzes BANT qualification criteria, and coordinates calendar bookings directly with Account Executives.',
    greetingSample: 'Hello! This is Liam from CloudScale Systems. I noticed you requested information on our enterprise voice pipeline. Do you have two minutes to discuss your current telephony volume?',
    callsRouted: '28.7k calls',
    turnLatency: '190ms P50',
    csatRating: '4.93 / 5.0',
    complianceBadges: ['SOC-2 Type II', 'GDPR Compliant'],
    systemPromptPreset: 'You are Liam, an enterprise sales development representative. Qualify leads by asking about monthly call volume, existing SIP infrastructure, and timeline before booking calendar slots.',
  },
];

export interface SessionTelemetry {
  sessionId: string;
  caller: string;
  agent: string;
  model: string;
  voiceProvider: string;
  sttLatency: number;
  llmTtft: number;
  ttsLatency: number;
  totalV2V: number;
  bargeIns: number;
  packetLoss: string;
  jitter: string;
  disconnectCode: string;
  status: 'active' | 'completed';
}

export const MOCK_SESSIONS: SessionTelemetry[] = [
  {
    sessionId: 'sess-8921-a',
    caller: 'Evelyn Reed (+1 415-304-9821)',
    agent: 'Maya (Luxury Hospitality)',
    model: 'GPT-4o Realtime',
    voiceProvider: 'Cartesia Sonic',
    sttLatency: 68,
    llmTtft: 88,
    ttsLatency: 94,
    totalV2V: 250,
    bargeIns: 0,
    packetLoss: '0.00%',
    jitter: '2.1ms',
    disconnectCode: 'SIP 200 OK',
    status: 'completed',
  },
  {
    sessionId: 'sess-8922-b',
    caller: 'Arthur Vance (+1 212-590-4102)',
    agent: 'David (Clinical Triage)',
    model: 'Claude 3.5 Sonnet',
    voiceProvider: 'ElevenLabs Turbo',
    sttLatency: 74,
    llmTtft: 112,
    ttsLatency: 104,
    totalV2V: 290,
    bargeIns: 1,
    packetLoss: '0.01%',
    jitter: '3.4ms',
    disconnectCode: 'SIP 200 OK',
    status: 'completed',
  },
  {
    sessionId: 'sess-8923-c',
    caller: 'Marcus Sterling (+1 312-802-9934)',
    agent: 'Liam (Enterprise SDR)',
    model: 'Claude 3.5 Sonnet',
    voiceProvider: 'PlayHT 2.0',
    sttLatency: 70,
    llmTtft: 98,
    ttsLatency: 110,
    totalV2V: 278,
    bargeIns: 2,
    packetLoss: '0.00%',
    jitter: '1.8ms',
    disconnectCode: 'IN_PROGRESS',
    status: 'active',
  },
  {
    sessionId: 'sess-8924-d',
    caller: 'Elena Vasquez (+1 786-431-2910)',
    agent: 'Elena (Fintech Resolution)',
    model: 'DeepSeek-V3',
    voiceProvider: 'PlayHT 2.0',
    sttLatency: 82,
    llmTtft: 90,
    ttsLatency: 118,
    totalV2V: 290,
    bargeIns: 0,
    packetLoss: '0.03%',
    jitter: '4.2ms',
    disconnectCode: 'SIP 200 OK',
    status: 'completed',
  },
];

export interface CampaignItem {
  id: string;
  name: string;
  subtitle: string;
  agent: string;
  agentAvatar: string;
  status: 'active' | 'scheduled' | 'completed' | 'draft' | 'paused';
  totalContacts: number;
  completedCalls: number;
  successfulCalls: number;
  connectRate: number;
  concurrencyLimit: number;
  schedule: string;
  createdAt: string;
}

export const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'camp-1',
    name: 'Q4 Enterprise SaaS Expansion Outreach',
    subtitle: 'Outbound qualification for high-intent whitepaper download leads',
    agent: 'Liam (Enterprise SDR)',
    agentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    totalContacts: 2400,
    completedCalls: 1680,
    successfulCalls: 1180,
    connectRate: 70.2,
    concurrencyLimit: 8,
    schedule: 'Mon-Fri • 09:00 - 17:00 EST',
    createdAt: '2026-10-02',
  },
  {
    id: 'camp-2',
    name: 'Healthcare Preventive Screening Intake',
    subtitle: 'Annual health check reminders and scheduling for enrolled patients',
    agent: 'David (Clinical Triage)',
    agentAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    totalContacts: 1500,
    completedCalls: 920,
    successfulCalls: 690,
    connectRate: 75.0,
    concurrencyLimit: 6,
    schedule: 'Mon-Sat • 10:00 - 18:00 Local',
    createdAt: '2026-10-04',
  },
  {
    id: 'camp-3',
    name: 'Hospitality VIP Guest Pre-Arrival Concierge',
    subtitle: 'Pre-check-in itinerary confirmation and suite amenity requests',
    agent: 'Maya (Luxury Hospitality)',
    agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    status: 'scheduled',
    totalContacts: 650,
    completedCalls: 0,
    successfulCalls: 0,
    connectRate: 0,
    concurrencyLimit: 4,
    schedule: 'Scheduled: Oct 12, 10:00 AM',
    createdAt: '2026-10-05',
  },
  {
    id: 'camp-4',
    name: 'Overdue Invoice Account Restructuring',
    subtitle: 'Gentle outbound payment plan restructuring for 30-day past-due accounts',
    agent: 'Elena (Fintech Resolution)',
    agentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    status: 'paused',
    totalContacts: 1100,
    completedCalls: 450,
    successfulCalls: 290,
    connectRate: 64.4,
    concurrencyLimit: 5,
    schedule: 'Paused by Supervisor',
    createdAt: '2026-09-28',
  },
];

export interface DemoPersona {
  id: string;
  name: string;
  role: string;
  industry: string;
  company: string;
  avatar: string;
  gender: 'female' | 'male';
  greeting: string;
  description: string;
  badges: string[];
  suggestedPrompts: string[];
  knowledgeResponses: Record<string, string>;
  defaultReply: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'healthcare',
    name: 'Aanya',
    role: 'Clinic Front-Desk & Triage',
    industry: 'Healthcare',
    company: 'SmileCare Dental & Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    greeting: "Namaste! Welcome to SmileCare Clinics. I am Aanya, your virtual care coordinator. How can I help you with appointments or treatments today?",
    description: 'Handles dental appointment bookings, price estimates, and emergency symptom triage with empathy.',
    badges: ['Sample conversation', 'Hinglish & English'],
    suggestedPrompts: [
      'What are your root canal charges?',
      'Can I book an appointment for tomorrow at 4 PM?',
      'Do you accept cashless health insurance?',
      'Kya main Hindi mein baat kar sakta hoon?'
    ],
    knowledgeResponses: {
      'root canal': "A standard root canal at SmileCare starts from ₹4,500. For specialized rotary endodontics with ceramic crown, it ranges up to ₹7,500. Would you like me to book a preliminary checkup with Dr. Sharma?",
      'charges': "Consultation is ₹500, teeth cleaning is ₹1,200, and root canal starts at ₹4,500. Would you like to schedule an appointment?",
      'book': "I have an opening with Dr. Sharma tomorrow, Thursday at 4:00 PM and another slot at 6:30 PM. Which one suits you best?",
      'tomorrow': "Great! Tomorrow at 4:00 PM is available. Should I confirm this slot under your phone number?",
      'insurance': "Yes! We accept cashless pre-authorization for Star Health, Care Health, HDFC Ergo, and ICICI Lombard. We also assist with instant reimbursement claims.",
      'hindi': "Ji bilkul! Aap mujhse Hindi ya Hinglish mein bhi baat kar sakte hain. Bataiye, main aapki kya sahayata karoon?",
    },
    defaultReply: "I understand! At SmileCare, our priority is providing comfortable and painless care. Would you like me to connect you with a doctor or assist with booking a consultation?"
  },
  {
    id: 'ecommerce',
    name: 'Kabir',
    role: 'Logistics & Order Resolution',
    industry: 'Quick Commerce & Retail',
    company: 'NexCart Express',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    greeting: "Hey there! Thanks for calling NexCart Express. I'm Kabir. Are you calling regarding your recent order, or do you need help with returns or refunds?",
    description: 'Resolves late deliveries, dispatches replacement riders, and issues instantaneous UPI refunds.',
    badges: ['Live GPS Hook', 'Instant UPI Payouts', 'High Energy'],
    suggestedPrompts: [
      'My delivery order is 25 minutes late!',
      'Two items are missing from my grocery bag',
      'Can I get an instant refund to my UPI ID?',
      'Where is the delivery rider right now?'
    ],
    knowledgeResponses: {
      'late': "I deeply apologize for the delay. Looking at your live order #NX-8821, rider Ramesh is 400 meters away at the main gate. He will reach your doorstep within 4 minutes. I have credited ₹50 delay cash to your wallet as an apology.",
      'missing': "I'm so sorry about that! I can see the packed receipt for order #NX-8821. I have initiated an instant replacement delivery for the missing items, or if you prefer, I can reverse ₹240 back to your UPI immediately.",
      'refund': "Refund of ₹240 has been authorized to your registered UPI ID via Razorpay. It will reflect in your bank account in under 30 seconds. Your reference number is REF-9941.",
      'rider': "Rider Ramesh is on a blue electric scooter at Cross Road 4, currently moving at 22 km/h. He is 3 minutes away from your location.",
    },
    defaultReply: "Got it! Your order experience is our top priority. I have pulled up your order details. Is there anything else you'd like me to update or track?"
  },
  {
    id: 'saas',
    name: 'Maya',
    role: 'Inbound Enterprise SDR',
    industry: 'B2B Software',
    company: 'CloudScale AI Infrastructure',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    greeting: "Hi! Welcome to CloudScale. I am Maya, Enterprise Growth Concierge. Are you exploring voice AI for customer support, outbound sales, or telephony automation?",
    description: 'Discovers pipeline qualification criteria, analyzes tech stacks, and books high-ticket executive demos.',
    badges: ['CRM Sync', 'B2B Qualification', 'Sub-second'],
    suggestedPrompts: [
      'How many concurrent calls can your platform handle?',
      'Do you integrate with HubSpot and Twilio?',
      'What is your enterprise pricing model?',
      'Can we book a 20-minute architecture demo?'
    ],
    knowledgeResponses: {
      'concurrent': "Capacity depends on your deployment and plan. Contact the team to discuss your expected call volume and requirements.",
      'integrate': "Yes! We have native bilateral integrations with HubSpot, Salesforce, Zendesk, as well as SIP trunking with Twilio, Exotel, and Tata Teleservices.",
      'pricing': "This interactive demo uses sample responses. Contact the team for current pricing and available security commitments.",
      'demo': "I would love to set that up! Our Solutions Architect has an open slot this Friday at 3:00 PM IST or Monday at 11:00 AM IST. Which works better for your calendar?",
    },
    defaultReply: "That sounds like a great use case for voice automation! Our team specializes in exactly this. Would you like me to block a dedicated technical walk-through with our engineering team?"
  }
];

export interface TranscriptItem {
  speaker: 'agent' | 'caller';
  text: string;
  timestamp: string;
  latencyMs?: number;
}

export interface CallDetail {
  id: string;
  callerName: string;
  callerPhone: string;
  direction: 'inbound' | 'outbound';
  agentName: string;
  agentAvatar: string;
  model: string;
  voice: string;
  durationSec: number;
  turnCount: number;
  p50Latency: number;
  sentiment: 'positive' | 'neutral' | 'escalated';
  summary: string;
  date: string;
  extractedData: Record<string, string>;
  transcript: TranscriptItem[];
}

export const MOCK_CALL_DETAILS: CallDetail[] = [
  {
    id: 'call-101',
    callerName: 'Evelyn Reed',
    callerPhone: '+1 (415) 304-9821',
    direction: 'inbound',
    agentName: 'Maya (Luxury Hospitality)',
    agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    model: 'GPT-4o Realtime',
    voice: 'Cartesia Sonic (British Luxury)',
    durationSec: 194,
    turnCount: 8,
    p50Latency: 185,
    sentiment: 'positive',
    summary: 'Guest confirmed 3-night Oceanfront Suite reservation and reserved an 8:00 PM table on the terrace for dinner.',
    date: 'Oct 06, 2026 • 21:42',
    extractedData: {
      guest_name: 'Evelyn Reed',
      room_number: 'Penthouse 402',
      dining_time: '20:00 EST',
      party_size: '2 guests',
      special_request: 'Gluten-free menu requested',
      resolution_status: 'Fully Resolved',
    },
    transcript: [
      { speaker: 'agent', text: 'Good evening. Welcome to the Grand Horizon Resort. My name is Maya. How may I orchestrate your stay today?', timestamp: '00:01', latencyMs: 175 },
      { speaker: 'caller', text: 'Hi Maya, I have an upcoming reservation under Evelyn Reed for tomorrow and wanted to book dinner at the terrace.', timestamp: '00:06' },
      { speaker: 'agent', text: 'Certainly, Ms. Reed! I have located your Penthouse Suite reservation. Would 8:00 PM suit your party of two for terrace dining?', timestamp: '00:11', latencyMs: 182 },
      { speaker: 'caller', text: '8:00 PM is perfect, and please note a gluten-free menu for one guest.', timestamp: '00:17' },
      { speaker: 'agent', text: 'With pleasure. I have locked in your 8:00 PM reservation with dietary notes dispatched directly to Executive Chef Laurent. A confirmation SMS is on its way.', timestamp: '00:24', latencyMs: 190 },
    ],
  },
  {
    id: 'call-102',
    callerName: 'Arthur Vance',
    callerPhone: '+1 (212) 590-4102',
    direction: 'inbound',
    agentName: 'David (Clinical Triage)',
    agentAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
    model: 'Claude 3.5 Sonnet',
    voice: 'ElevenLabs Turbo v2.5 (Gentle Clinical)',
    durationSec: 245,
    turnCount: 10,
    p50Latency: 210,
    sentiment: 'neutral',
    summary: 'Patient scheduled preventive cardiology intake screening with Dr. Henderson following routine referral.',
    date: 'Oct 06, 2026 • 20:15',
    extractedData: {
      patient_dob: '1984-06-14',
      clinic: 'Providence Cardiology',
      physician: 'Dr. Henderson',
      appointment_slot: 'Oct 14, 10:30 AM',
      insurance_verified: 'BlueCross BlueShield Tier 1',
    },
    transcript: [
      { speaker: 'agent', text: 'Hello, this is David with Providence Health. I can help you schedule your appointment or securely update intake records. How may I assist you today?', timestamp: '00:01', latencyMs: 205 },
      { speaker: 'caller', text: 'Hi, I received a referral from my primary physician for a cardiology consult and need to schedule an appointment.', timestamp: '00:07' },
      { speaker: 'agent', text: 'I would be happy to coordinate that for you. May I verify your date of birth for patient verification?', timestamp: '00:12', latencyMs: 212 },
    ],
  },
  {
    id: 'call-103',
    callerName: 'Marcus Sterling',
    callerPhone: '+1 (312) 802-9934',
    direction: 'outbound',
    agentName: 'Liam (Enterprise SDR)',
    agentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    model: 'Claude 3.5 Sonnet',
    voice: 'PlayHT 2.0 (Executive Cadence)',
    durationSec: 310,
    turnCount: 12,
    p50Latency: 195,
    sentiment: 'positive',
    summary: 'Prospect qualified for 50-agent enterprise tier. Booked product architecture demonstration with VP of Engineering.',
    date: 'Oct 06, 2026 • 18:30',
    extractedData: {
      company: 'Sterling Logistics',
      telephony_trunk: 'Twilio SIP Trunking',
      estimated_monthly_minutes: '120,000 min',
      demo_scheduled: 'Thursday, 2:00 PM EST',
    },
    transcript: [
      { speaker: 'agent', text: 'Hello Marcus! This is Liam from CloudScale Systems following up on your team\'s voice AI benchmark request. Do you have two minutes to discuss your telephony volume?', timestamp: '00:01', latencyMs: 190 },
      { speaker: 'caller', text: 'Hi Liam, yes, we are evaluating automated voice dispatchers for 100k+ minutes a month.', timestamp: '00:08' },
    ],
  },
  {
    id: 'call-104',
    callerName: 'Carlos Gomez',
    callerPhone: '+1 (786) 431-2910',
    direction: 'inbound',
    agentName: 'Elena (Fintech Resolution)',
    agentAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    model: 'DeepSeek-V3',
    voice: 'PlayHT 2.0 (Empathic Firm)',
    durationSec: 160,
    turnCount: 6,
    p50Latency: 225,
    sentiment: 'positive',
    summary: 'Structured flexible 3-month payment plan for past-due account; first installment scheduled.',
    date: 'Oct 06, 2026 • 16:10',
    extractedData: {
      account_id: 'APX-98214',
      installment_plan: '$150 / month x 3',
      payment_method: 'ACH Direct Debit',
      compliance_disclosure: 'FCRA Compliant Confirmed',
    },
    transcript: [
      { speaker: 'agent', text: 'Hello, this is Elena on behalf of Apex Financial regarding your account update. I can assist you with flexible, confidential payment options today.', timestamp: '00:01', latencyMs: 220 },
      { speaker: 'caller', text: 'Yes, I wanted to pay half now and split the rest over the next two months.', timestamp: '00:07' },
    ],
  },
];

export interface LandingHowItWorksStep {
  step: string;
  title: string;
  desc: string;
}

export const LANDING_HOW_IT_WORKS: LandingHowItWorksStep[] = [
  {
    step: '01',
    title: 'Design your agent',
    desc: 'Use the visual composer to define conversation flows, set the voice personality, and connect your tools — no code required.',
  },
  {
    step: '02',
    title: 'Test with simulations',
    desc: 'Run hundreds of simulated calls against real scenarios. Catch edge cases before a single real caller hears your agent.',
  },
  {
    step: '03',
    title: 'Go live in minutes',
    desc: 'Connect a phone number, press deploy. Monitor every call with real-time transcripts and analytics from day one.',
  },
];

export interface LandingTimelineDay {
  day: string;
  title: string;
  desc: string;
}

export const LANDING_TIMELINE: LandingTimelineDay[] = [
  { day: 'Day 1', title: 'Discovery & scoping', desc: 'Review call types, agree on scope and success criteria, plan system integrations.' },
  { day: 'Day 7', title: 'Build phase', desc: 'Set up voice personality, design deterministic flows, write the first test suite.' },
  { day: 'Day 14', title: 'End-to-end testing', desc: 'Full test calls from greeting to wrap-up. Backend actions verified.' },
  { day: 'Day 21', title: 'Dry run & guardrails', desc: 'Enterprise test cases pass. Safety locks, handoff rules, and final review.' },
  { day: 'Day 30', title: 'Production launch', desc: 'Live on real phone lines. Daily call review dashboard and ongoing optimization.' },
];

export interface OnboardingStep {
  num: number;
  title: string;
  desc: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { num: 1, title: 'Get started', desc: 'Basic information' },
  { num: 2, title: 'Set up workspace', desc: 'Tell us about your use case' },
  { num: 3, title: 'Choose voice', desc: 'Select language and voice' },
  { num: 4, title: 'Integrate (optional)', desc: 'Connect your tools' },
  { num: 5, title: 'Launch', desc: "You're all set!" },
];

export interface OnboardingUseCase {
  id: string;
  title: string;
  desc: string;
}

export const ONBOARDING_USE_CASES: OnboardingUseCase[] = [
  { id: 'sales', title: 'Sales & Lead Generation', desc: 'Qualify leads, book meetings and drive revenue.' },
  { id: 'support', title: 'Customer Support', desc: 'Handle customer queries, resolve issues and improve CSAT.' },
  { id: 'appointment', title: 'Appointment Booking', desc: 'Schedule appointments, reminders and follow-ups.' },
  { id: 'inbound', title: 'Inbound Call Handling', desc: 'Answer calls, route enquiries and capture information.' },
  { id: 'surveys', title: 'Surveys & Feedback', desc: 'Collect feedback, run surveys and analyze insights.' },
  { id: 'operations', title: 'Internal Operations', desc: 'Automate internal calls and workflows.' },
];

export interface OnboardingLanguage {
  id: string;
  name: string;
  desc: string;
}

export const ONBOARDING_LANGUAGES: OnboardingLanguage[] = [
  { id: 'en-IN', name: '🇮🇳 English (India)', desc: 'Indian accent & nuances' },
  { id: 'hi-IN', name: '🇮🇳 Hindi (हिन्दी)', desc: 'Pure conversational Hindi' },
  { id: 'hinglish', name: '🇮🇳 Hinglish', desc: 'Bilingual Hindi-English mix' },
  { id: 'en-US', name: '🇺🇸 English (US)', desc: 'Standard North American' },
  { id: 'ta-IN', name: '🇮🇳 Tamil (தமிழ்)', desc: 'Regional South Indian' },
];

export interface OnboardingVoiceOption {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  tone: string;
}

export const ONBOARDING_VOICES: OnboardingVoiceOption[] = [
  { id: 'aarav', name: 'Aarav', gender: 'Male', tone: 'Natural' },
  { id: 'diya', name: 'Diya', gender: 'Female', tone: 'Warm' },
  { id: 'kabir', name: 'Kabir', gender: 'Male', tone: 'Professional' },
  { id: 'meera', name: 'Meera', gender: 'Female', tone: 'Friendly' },
  { id: 'rohan', name: 'Rohan', gender: 'Male', tone: 'Energetic' },
  { id: 'priya', name: 'Priya', gender: 'Female', tone: 'Calm' },
];

export interface OnboardingStyleOption {
  id: string;
  name: string;
  desc: string;
}

export const ONBOARDING_STYLES: OnboardingStyleOption[] = [
  { id: 'balanced', name: 'Balanced', desc: 'Natural and versatile' },
  { id: 'professional', name: 'Professional', desc: 'Formal and clear' },
  { id: 'friendly', name: 'Friendly', desc: 'Warm and engaging' },
  { id: 'energetic', name: 'Energetic', desc: 'Upbeat and lively' },
];

export interface SupportFaq {
  q: string;
  a: string;
}

export const SUPPORT_FAQS: SupportFaq[] = [
  {
    q: 'How do I set up my first voice agent?',
    a: 'Go to Agents and select Create Agent, or use the New Agent button. Add a plain-language brief, knowledge sources, and guardrails to start your draft.',
  },
  {
    q: 'Which telephony providers are supported?',
    a: 'Samvada AI supports major phone networks, VoIP systems, and browser calls with crystal-clear audio and instant response times.',
  },
  {
    q: 'How does billing work?',
    a: 'Billing is calculated per minute of active voice call, plus monthly subscription plan tier limits. Detailed breakdowns are visible on the Billing & Usage page.',
  },
  {
    q: 'Can I use my own business documents and price lists?',
    a: 'Yes! Upload PDF files, office documents, or paste your website link. Your voice assistant will learn your products and answers automatically.',
  },
  {
    q: 'What languages are supported?',
    a: 'Samvada AI supports English (US, UK, Indian accents), Hindi, Hinglish, Spanish, French, and 40+ global languages.',
  },
  {
    q: 'How do I handle call failures or retries?',
    a: 'Configure retry policies in Campaign Settings to automatically re-dial busy lines or failed calls up to 3 times at custom intervals.',
  },
];

export const SUPPORT_POPULAR_TOPICS: string[] = [
  'Getting Started',
  'Voice Agents',
  'Call Configuration',
  'Billing',
  'API Integration',
  'Troubleshooting',
];

