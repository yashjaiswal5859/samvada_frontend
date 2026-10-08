import { apiClient, getActiveWorkspaceId } from './client';
import { ApiKey, TeamMember, BillingUsage, OrganizationWallet, APIEnvelope } from '../types';

const getScopedSettingsUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}${subpath}`;
  }
  return `/api/v1${subpath}`;
};

// --- DEVELOPER API KEYS ---

export const getApiKeys = async (): Promise<ApiKey[]> => {
  const res = await apiClient.get<APIEnvelope<ApiKey[]>>(getScopedSettingsUrl('/api-keys'));
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error('API key list is unavailable.');
  return res.data.data;
};

export const createApiKey = async (name: string): Promise<{ apiKey: ApiKey; secret: string }> => {
  const res = await apiClient.post<APIEnvelope<{ api_key: ApiKey; secret: string }>>(getScopedSettingsUrl('/api-keys'), { name });
  if (!res.data?.success || !res.data.data?.api_key || !res.data.data.secret) throw new Error('The API key was not created by the server.');
  return { apiKey: res.data.data.api_key, secret: res.data.data.secret };
};

export const deleteApiKey = async (id: string): Promise<boolean> => {
  const res = await apiClient.delete<APIEnvelope<{ revoked?: boolean }>>(getScopedSettingsUrl(`/api-keys/${id}`));
  return !!res.data?.success;
};

// --- WEBHOOKS ---

export const getWebhooks = async (): Promise<any[]> => {
  const res = await apiClient.get<APIEnvelope<any[]>>(getScopedSettingsUrl('/webhooks'));
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error('Webhook list is unavailable.');
  return res.data.data;
};

export const createWebhook = async (url: string): Promise<any> => {
  const res = await apiClient.post<APIEnvelope<any>>(getScopedSettingsUrl('/webhooks'), { url });
  if (!res.data?.success || !res.data.data) throw new Error('The webhook was not created by the server.');
  return res.data.data;
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
  const res = await apiClient.get<APIEnvelope<TeamMember[]>>(getScopedSettingsUrl('/members'));
  if (!res.data?.success || !Array.isArray(res.data.data)) throw new Error('Team list is unavailable.');
  return res.data.data;
};

export const inviteTeamMember = async (email: string, role: 'admin' | 'developer' | 'viewer'): Promise<TeamMember> => {
  const res = await apiClient.post<APIEnvelope<TeamMember>>(getScopedSettingsUrl('/members/invite'), { email, role });
  if (!res.data?.success || !res.data.data) throw new Error('Member invitation is not available from the server.');
  return res.data.data;
};

// --- BILLING & USAGE ---

export const getBillingUsage = async (): Promise<BillingUsage> => {
  const res = await apiClient.get<APIEnvelope<any>>(getScopedSettingsUrl('/billing/usage'));
  if (!res.data?.success || !res.data.data) throw new Error('Billing usage is unavailable.');
  const data = res.data.data;
  return {
    planName: data.plan_name ?? data.planTier ?? '—',
    totalCredits: Number(data.included_minutes ?? 0),
    usedCredits: Number(data.used_minutes ?? 0),
    billingCycleEnd: data.period_end ?? '',
    minutesUsed: Number(data.used_minutes ?? 0),
    minutesLimit: Number(data.included_minutes ?? 0),
    costThisMonthUsd: Number(data.estimated_total_cost_usd ?? 0),
    walletBalanceUsd: Number(data.wallet_balance_usd ?? 0),
  };
};

// --- WALLET & $5.00 DEMO CREDIT APIS ---

export const getWalletBalance = async (): Promise<OrganizationWallet> => {
  const res = await apiClient.get<APIEnvelope<OrganizationWallet>>(getScopedSettingsUrl('/billing/wallet'));
  if (!res.data?.success || !res.data.data) throw new Error('Wallet balance is unavailable.');
  return res.data.data;
};

export const topupWallet = async (amountUSD: number, paymentMethodId: string): Promise<OrganizationWallet> => {
  const res = await apiClient.post<APIEnvelope<OrganizationWallet>>(getScopedSettingsUrl('/billing/wallet/topup'), { amountUSD, paymentMethodId });
  if (!res.data?.success || !res.data.data) throw new Error('Wallet top-up was not confirmed by the billing service.');
  return res.data.data;
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
  const res = await apiClient.patch<APIEnvelope<UserProfileData>>('/api/v1/user/profile', data);
  if (!res.data?.success || !res.data.data) throw new Error('Profile changes were not confirmed by the server.');
  return res.data.data;
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
  const res = await apiClient.put<APIEnvelope<NotificationPreferencesData>>('/api/v1/notifications/preferences', data);
  if (!res.data?.success || !res.data.data) throw new Error('Notification preferences were not saved.');
  return res.data.data;
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
