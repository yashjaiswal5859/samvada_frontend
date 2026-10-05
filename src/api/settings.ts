import { apiClient, getActiveWorkspaceId } from './client';
import { ApiKey, TeamMember, BillingUsage, OrganizationWallet, APIEnvelope } from '../types';
import { MOCK_API_KEYS, MOCK_TEAM, MOCK_BILLING } from '../utils/constants';

let localApiKeys: ApiKey[] = [];
let localTeam: TeamMember[] = [];
let localBilling: BillingUsage = {
  planName: 'Starter Trial',
  totalCredits: 250,
  usedCredits: 0,
  billingCycleEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
  minutesUsed: 0,
  minutesLimit: 250,
  costThisMonthUsd: 0,
  walletBalanceUsd: 5.0,
};

let localWallet: OrganizationWallet = {
  walletId: 'w_default',
  currency: 'USD',
  balanceUSD: 5.0000,
  promotionalCreditUSD: 5.0000,
  lifetimeSpendUSD: 0.0000,
  isFrozen: false,
  recentTransactions: [
    {
      id: 'tx_welcome',
      type: 'signup_promo',
      amountUSD: 5.0000,
      balanceAfterUSD: 5.0000,
      description: 'Welcome trial credit ($5.00 USD)',
      createdAt: new Date().toISOString(),
    },
  ],
};

const getScopedSettingsUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}${subpath}`;
  }
  return `/api/v1${subpath}`;
};

// --- DEVELOPER API KEYS ---

export const getApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<ApiKey[]>>(getScopedSettingsUrl('/api-keys'));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('API keys endpoint unavailable, using local keys', err);
  }
  return localApiKeys;
};

export const createApiKey = async (name: string): Promise<{ apiKey: ApiKey; secret: string }> => {
  try {
    const res = await apiClient.post<APIEnvelope<{ api_key: ApiKey; secret: string }>>(
      getScopedSettingsUrl('/api-keys'),
      { name }
    );
    if (res.data?.success && res.data.data) {
      const { api_key, secret } = res.data.data;
      localApiKeys.unshift(api_key);
      return { apiKey: api_key, secret };
    }
  } catch (err) {
    console.warn('Create API key endpoint unavailable, creating mock key', err);
  }

  const secret = `sk_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
  const newKey: ApiKey = {
    id: `key-${Date.now()}`,
    name,
    keyPrefix: `${secret.slice(0, 12)}...`,
    createdAt: new Date().toISOString().slice(0, 10),
    lastUsedAt: 'Never',
  };
  localApiKeys.unshift(newKey);
  return { apiKey: newKey, secret };
};

export const deleteApiKey = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(getScopedSettingsUrl(`/api-keys/${id}`));
  } catch (err) {
    console.warn('Delete API key failed', err);
  }
  localApiKeys = localApiKeys.filter((k) => k.id !== id);
  return true;
};

// --- WEBHOOKS ---

export const getWebhooks = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>(getScopedSettingsUrl('/webhooks'));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Webhooks endpoint unavailable', err);
  }
  return [];
};

export const createWebhook = async (url: string): Promise<any> => {
  try {
    const res = await apiClient.post<APIEnvelope<any>>(getScopedSettingsUrl('/webhooks'), { url });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Create webhook failed', err);
  }
  return { id: `wh_${Date.now()}`, url, isActive: true };
};

export const deleteWebhook = async (id: string): Promise<boolean> => {
  try {
    await apiClient.delete(getScopedSettingsUrl(`/webhooks/${id}`));
    return true;
  } catch (err) {
    console.warn('Delete webhook failed', err);
    return false;
  }
};

// --- TEAM MEMBERS ---

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<TeamMember[]>>(getScopedSettingsUrl('/members'));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Team members endpoint unavailable', err);
  }
  return localTeam;
};

export const inviteTeamMember = async (email: string, role: 'admin' | 'developer' | 'viewer'): Promise<TeamMember> => {
  const newMember: TeamMember = {
    id: `team-${Date.now()}`,
    name: email.split('@')[0],
    email,
    role,
    status: 'invited',
    joinedAt: new Date().toISOString().slice(0, 10),
  };
  localTeam.push(newMember);
  return newMember;
};

// --- BILLING & USAGE ---

export const getBillingUsage = async (): Promise<BillingUsage> => {
  try {
    const res = await apiClient.get<APIEnvelope<any>>(getScopedSettingsUrl('/billing/usage'));
    if (res.data?.success && res.data.data) {
      const d = res.data.data;
      return {
        planName: d.plan_name || d.planTier || 'Starter Growth',
        totalCredits: d.included_minutes || 250,
        usedCredits: d.used_minutes || 0,
        billingCycleEnd: d.period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
        minutesUsed: d.used_minutes || 0,
        minutesLimit: d.included_minutes || 250,
        costThisMonthUsd: d.estimated_total_cost_usd || 49.00,
        walletBalanceUsd: d.wallet_balance_usd || 5.00,
      };
    }
  } catch (err) {
    console.warn('Billing usage endpoint unavailable', err);
  }
  return localBilling;
};

// --- WALLET & $5.00 DEMO CREDIT APIS ---

export const getWalletBalance = async (): Promise<OrganizationWallet> => {
  try {
    const res = await apiClient.get<APIEnvelope<OrganizationWallet>>(getScopedSettingsUrl('/billing/wallet'));
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Billing wallet API unavailable, using trial state', err);
  }
  return localWallet;
};

export const topupWallet = async (amountUSD: number, paymentMethodId: string): Promise<OrganizationWallet> => {
  try {
    const res = await apiClient.post<APIEnvelope<OrganizationWallet>>(getScopedSettingsUrl('/billing/wallet/topup'), {
      amountUSD,
      paymentMethodId,
    });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Topup API unavailable, updating local state', err);
  }

  localWallet = {
    ...localWallet,
    balanceUSD: localWallet.balanceUSD + amountUSD,
    recentTransactions: [
      {
        id: `tx_${Date.now()}`,
        type: 'topup',
        amountUSD,
        balanceAfterUSD: localWallet.balanceUSD + amountUSD,
        description: `Wallet manual top-up ($${amountUSD.toFixed(2)})`,
        createdAt: new Date().toISOString(),
      },
      ...localWallet.recentTransactions,
    ],
  };

  return localWallet;
};

// --- SECURITY & 2FA APIS ---

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  const res = await apiClient.post('/api/v1/security/password', { current_password: currentPassword, new_password: newPassword });
  return !!res.data?.success;
};

export const generate2FASecret = async (): Promise<{ secret: string; qrCode: string; otpauthUrl: string }> => {
  const res = await apiClient.post('/api/v1/security/2fa/generate');
  return {
    secret: res.data?.secret || '',
    qrCode: res.data?.qr_code || '',
    otpauthUrl: res.data?.otpauth_url || '',
  };
};

export const enable2FA = async (code: string, secret: string): Promise<boolean> => {
  const res = await apiClient.post('/api/v1/security/2fa/enable', { code, secret });
  return !!res.data?.success;
};

export const disable2FA = async (): Promise<boolean> => {
  const res = await apiClient.post('/api/v1/security/2fa/disable');
  return !!res.data?.success;
};

export const getActiveSessions = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get('/api/v1/security/sessions');
    return res.data?.data || [];
  } catch {
    return [];
  }
};

// --- USER PROFILE APIS ---

export interface UserProfileData {
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  timezone?: string;
  language?: string;
  avatar_url?: string;
  bio?: string;
}

export const getUserProfile = async (): Promise<UserProfileData | null> => {
  try {
    const res = await apiClient.get<APIEnvelope<UserProfileData>>('/api/v1/user/profile');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch user profile', err);
  }
  return null;
};

export const updateUserProfile = async (data: Partial<UserProfileData>): Promise<UserProfileData | null> => {
  try {
    const res = await apiClient.patch<APIEnvelope<UserProfileData>>('/api/v1/user/profile', data);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to update user profile', err);
  }
  return null;
};

export const uploadAvatar = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post<APIEnvelope<{ avatar_url: string }>>('/api/v1/user/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data?.success && res.data.data?.avatar_url) {
      return res.data.data.avatar_url;
    }
  } catch (err) {
    console.warn('Failed to upload avatar', err);
  }
  return null;
};

// --- NOTIFICATION PREFERENCES APIS ---

export interface NotificationPreferencesData {
  email_enabled: boolean;
  in_app_enabled: boolean;
  slack_enabled: boolean;
  slack_webhook_url?: string;
  call_alerts: boolean;
  billing_alerts: boolean;
  campaign_alerts: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  digest_frequency?: string;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferencesData | null> => {
  try {
    const res = await apiClient.get<APIEnvelope<NotificationPreferencesData>>('/api/v1/notifications/preferences');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch notification preferences', err);
  }
  return null;
};

export const updateNotificationPreferences = async (data: NotificationPreferencesData): Promise<NotificationPreferencesData | null> => {
  try {
    const res = await apiClient.put<APIEnvelope<NotificationPreferencesData>>('/api/v1/notifications/preferences', data);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to update notification preferences', err);
  }
  return null;
};

export const sendTestNotification = async (channel = 'all'): Promise<boolean> => {
  try {
    const res = await apiClient.post<APIEnvelope<{ message: string }>>('/api/v1/notifications/test', { channel });
    return !!res.data?.success;
  } catch (err) {
    console.warn('Failed to send test notification', err);
    return false;
  }
};

// --- GDPR & DATA PROTECTION APIS (Phase 6.4) ---

export interface GDPRDataExport {
  user_id: string;
  exported_at: string;
  profile?: UserProfileData;
  notification_preferences?: NotificationPreferencesData;
  organizations?: any[];
  workspaces?: any[];
  compliance_notice: string;
}

export const exportUserData = async (): Promise<GDPRDataExport | null> => {
  try {
    const res = await apiClient.get<APIEnvelope<GDPRDataExport>>('/api/v1/user/data-export');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to export user data', err);
  }
  return null;
};

export const deleteUserData = async (): Promise<boolean> => {
  try {
    const res = await apiClient.delete<APIEnvelope<{ message: string }>>('/api/v1/user/data-deletion');
    return !!res.data?.success;
  } catch (err) {
    console.warn('Failed to delete user data', err);
    return false;
  }
};

// --- AUDIT LOGS (Phase 6.4) ---

export interface AuditLogEntry {
  id: string;
  workspace_id?: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  details: string;
  created_at: string;
}

export const getAuditLogs = async (limit = 50, offset = 0): Promise<{ logs: AuditLogEntry[]; total: number }> => {
  try {
    const res = await apiClient.get<APIEnvelope<{ logs: AuditLogEntry[]; total: number }>>(
      getScopedSettingsUrl(`/audit-logs?limit=${limit}&offset=${offset}`)
    );
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Failed to fetch audit logs', err);
  }
  return { logs: [], total: 0 };
};


