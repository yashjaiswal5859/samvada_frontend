import { apiClient, getActiveWorkspaceId } from './client';
import { Contact, Audience, APIEnvelope } from '../types';
import { MOCK_AUDIENCES } from '../utils/constants';

let localAudiences: Audience[] = [];
let localContacts: Contact[] = [];

const getScopedAudienceUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/audiences${subpath}`;
  }
  return `/api/v1/audiences${subpath}`;
};

export const getAudiences = async (): Promise<Audience[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<Audience[]>>(getScopedAudienceUrl());
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Audiences API unavailable, using local cache', err);
  }
  return localAudiences;
};

export const getContacts = async (audienceId = 'default'): Promise<Contact[]> => {
  try {
    let targetAudience = audienceId;
    if (!targetAudience || targetAudience === 'default') {
      const audiences = await getAudiences();
      if (audiences && audiences.length > 0) {
        targetAudience = audiences[0].id;
      }
    }
    const res = await apiClient.get<any>(getScopedAudienceUrl(targetAudience ? `/${targetAudience}/contacts` : ''));
    if (res.data?.success && res.data.data) {
      const data = res.data.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data.contacts)) return data.contacts;
    }
  } catch (err) {
    console.warn('Contacts API unavailable, using local cache', err);
  }
  return localContacts;
};

export const createContact = async (
  name: string,
  phone: string,
  email?: string,
  company?: string,
  tags: string[] = [],
  audienceId = 'default'
): Promise<Contact> => {
  try {
    const res = await apiClient.post<APIEnvelope<Contact>>(getScopedAudienceUrl(`/${audienceId}/contacts`), {
      name,
      phone,
      email,
      company,
      tags,
    });
    if (res.data?.success && res.data.data) {
      localContacts.unshift(res.data.data);
      return res.data.data;
    }
  } catch (err) {
    console.warn('Create contact API failed, adding locally', err);
  }

  const newContact: Contact = {
    id: `c-${Date.now()}`,
    name,
    phone,
    email,
    company,
    tags,
    status: 'active',
  };
  localContacts.unshift(newContact);
  return newContact;
};
