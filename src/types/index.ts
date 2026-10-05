export interface User {
  id: string;
  email: string;
  displayName: string;
  companyName?: string;
  role?: string;
  createdAt?: string;
  onboardingCompleted: boolean;
  profile?: UserProfile;
  organization?: Organization;
  workspace?: Workspace;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName?: string;
  accountType: 'business' | 'individual';
  industries: string[];
  onboardingCompleted: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  ownerId?: string;
  role?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug?: string;
  orgId?: string;
  ownerId?: string;
  role?: string;
  isDefault?: boolean;
  icon?: string;
  description?: string;
}

export interface OnboardingState {
  profile?: UserProfile;
  organization?: Organization;
  workspace?: Workspace;
  onboardingCompleted: boolean;
}

export interface APIEnvelope<T> {
  success: boolean;
  correlation_id?: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
  };
}

export interface OTPResponse {
  requestId: string;
  expiresIn: number;
}

export interface TokenResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
}

export interface VerifyOTPResponse {
  accessToken?: string;
  expiresIn?: number;
  refreshToken?: string;
  redirectTo?: string;
}

export interface ProfileSetupPayload {
  firstName: string;
  lastName?: string;
  accountType: 'business' | 'individual';
  orgName?: string;
  workspaceName: string;
}

export interface IndustrySelectionPayload {
  industries: string[];
}

// --- VOICE AGENT & PORTAL ENTITIES ---

export interface Voice {
  id: string;
  name: string;
  provider: 'elevenlabs' | 'openai' | 'deepgram' | 'azure';
  gender: 'female' | 'male' | 'neutral';
  language: string;
  accent?: string;
  previewAudioUrl?: string;
  avatarUrl?: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  description?: string;
  avatar?: string;
  systemPrompt: string;
  voiceId: string;
  voiceName: string;
  language: string;
  model: string; // e.g. 'gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'
  status: 'active' | 'draft' | 'archived';
  phoneNumber?: string;
  workspaceId?: string;
  knowledgeBaseIds: string[];
  createdAt: string;
  updatedAt: string;
  totalCalls: number;
  avgDurationSec: number;
  successRate: number;
}

export interface CreateAgentPayload {
  name: string;
  role: string;
  description?: string;
  systemPrompt?: string;
  voiceId: string;
  language?: string;
  model?: string;
  templateId?: string;
}

export interface Campaign {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  status: 'scheduled' | 'running' | 'completed' | 'paused' | 'draft';
  targetAudienceId: string;
  targetAudienceName: string;
  totalContacts: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  scheduledAt: string;
  startedAt?: string;
  createdAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  agentId: string;
  targetAudienceId: string;
  scheduledAt?: string;
  concurrentCallsLimit?: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
  lastCalledAt?: string;
  status: 'active' | 'do_not_call' | 'invalid';
}

export interface Audience {
  id: string;
  name: string;
  description?: string;
  contactCount: number;
  createdAt: string;
}

export interface KnowledgeBase {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  documentCount: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  kbId?: string;
  name: string;
  type: 'file' | 'url' | 'text' | string;
  source: string;
  sizeBytes?: number;
  status: 'indexed' | 'indexing' | 'failed' | string;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  timestamp: string;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CallRecord {
  id: string;
  workspaceId?: string;
  agentId: string;
  agentName: string;
  customerName: string;
  customerPhone: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'busy' | 'failed' | 'no_answer' | 'in_progress';
  durationSec: number;
  costUsd: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  evaluationScore?: number; // 0-100
  recordingUrl?: string;
  transcript: TranscriptSegment[];
  summary?: string;
  createdAt: string;
}

export interface Integration {
  id: string;
  name: string;
  category: 'telephony' | 'crm' | 'automation' | 'webhooks';
  description: string;
  iconName: string;
  connected: boolean;
  apiKeySet: boolean;
  webhookUrl?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'active' | 'invited';
  joinedAt: string;
  avatarUrl?: string;
}

export interface BillingUsage {
  planName: string;
  totalCredits: number;
  usedCredits: number;
  billingCycleEnd: string;
  minutesUsed: number;
  minutesLimit: number;
  costThisMonthUsd: number;
  walletBalanceUsd?: number;
  promotionalCreditUsd?: number;
  paymentMethod?: {
    brand: string;
    last4: string;
    expiry: string;
  };
}

export interface AnalyticsSummary {
  totalCalls: number;
  completedCalls?: number;
  failedCalls?: number;
  escalatedCalls?: number;
  totalDurationMin: number;
  totalDurationSec?: number;
  avgDurationSec?: number;
  avgLatencyMs: number;
  overallSuccessRate: number;
  totalCostUsd: number;
  positiveSentimentPercent?: number;
  neutralSentimentPercent?: number;
  negativeSentimentPercent?: number;
  dailyCallVolume: {
    date: string;
    displayDate?: string;
    answered?: number;
    notAnswered?: number;
    failed?: number;
    total?: number;
    calls?: number;
    cost?: number;
  }[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
}

// --- CALL TICKET & WALLET TYPES (SYNCED WITH BACKEND HLD) ---

export interface CallTicketResponse {
  ticket: string;
  wssUrl: string;
  remainingCreditUSD: number;
  maxDurationSec: number;
  expiresInSec: number;
}

export interface WalletTransaction {
  id: string;
  callId?: string;
  type: 'signup_promo' | 'topup' | 'call_deduction' | 'refund';
  amountUSD: number;
  balanceAfterUSD: number;
  description: string;
  createdAt: string;
}

export interface OrganizationWallet {
  walletId: string;
  currency: string;
  balanceUSD: number;
  promotionalCreditUSD: number;
  lifetimeSpendUSD: number;
  isFrozen: boolean;
  recentTransactions: WalletTransaction[];
}

export interface AgentVersion {
  id: string;
  agentId: string;
  versionNum: number;
  systemPrompt: string;
  model: string;
  voiceId: string;
  language: string;
  changeSummary?: string;
  publishedBy?: string;
  createdAt: string;
}

