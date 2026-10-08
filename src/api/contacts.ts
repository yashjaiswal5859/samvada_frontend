import { apiClient, getActiveWorkspaceId } from './client';
import { Contact, Audience, APIEnvelope } from '../types';
const requireData = <T,>(success: boolean | undefined, data: T | undefined, operation: string): T => {
  if (success && data !== undefined && data !== null) return data;
  throw new Error(`${operation} was not confirmed by the server.`);
};

const getScopedAudienceUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/audiences${subpath}`;
  }
  return `/api/v1/audiences${subpath}`;
};

export const getAudiences = async (): Promise<Audience[]> => {
  const res = await apiClient.get<APIEnvelope<Audience[]>>(getScopedAudienceUrl());
  return requireData(res.data?.success, res.data?.data, 'Loading audiences');
};

export const getContacts = async (audienceId = 'default'): Promise<Contact[]> => {
  let targetAudience = audienceId;
  if (!targetAudience || targetAudience === 'default') {
    const audiences = await getAudiences();
    targetAudience = audiences[0]?.id || '';
  }
  if (!targetAudience) return [];
  const res = await apiClient.get<any>(getScopedAudienceUrl(targetAudience ? `/${targetAudience}/contacts` : ''));
  if (res.data?.success && res.data.data) {
    const data = res.data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.contacts)) return data.contacts;
  }
  throw new Error('Loading contacts was not confirmed by the server.');
};

export const createContact = async (
  name: string,
  phone: string,
  email?: string,
  company?: string,
  tags: string[] = [],
  audienceId = 'default'
): Promise<Contact> => {
  let targetAudience = audienceId;
  if (!targetAudience || targetAudience === 'default') {
    const audiences = await getAudiences();
    targetAudience = audiences[0]?.id || '';
  }
  if (!targetAudience) throw new Error('Create an audience before adding contacts.');
  const res = await apiClient.post<APIEnvelope<Contact>>(getScopedAudienceUrl(`/${targetAudience}/contacts`), {
    name,
    phone,
    email,
    company,
    tags,
  });
  return requireData(res.data?.success, res.data?.data, 'Creating contact');
};

export { batchImportContactsCSV } from './campaigns';
