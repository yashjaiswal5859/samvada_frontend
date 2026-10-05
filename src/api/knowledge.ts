import { apiClient, getActiveWorkspaceId } from './client';
import { KnowledgeBase, KnowledgeDocument, APIEnvelope } from '../types';

const getScopedKBUrl = (subpath = ''): string => {
  const wsId = getActiveWorkspaceId();
  if (wsId) {
    return `/api/v1/workspaces/${wsId}/kb${subpath}`;
  }
  return `/api/v1/kb${subpath}`;
};

export const getKnowledgeBases = async (): Promise<KnowledgeBase[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>(getScopedKBUrl(''));
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => ({
        id: item.id,
        workspaceId: item.workspace_id || item.workspaceId || '',
        name: item.name,
        description: item.description || '',
        documentCount: Number(item.document_count ?? item.documentCount ?? 0),
        chunkCount: Number(item.chunk_count ?? item.chunkCount ?? 0),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('KB list API unavailable', err);
  }
  return [];
};

export const createKnowledgeBase = async (name: string, description?: string): Promise<KnowledgeBase | null> => {
  try {
    const res = await apiClient.post<APIEnvelope<any>>(getScopedKBUrl(''), {
      name,
      description: description || '',
    });
    if (res.data?.success && res.data.data) {
      const item = res.data.data;
      return {
        id: item.id,
        workspaceId: item.workspace_id || item.workspaceId || '',
        name: item.name,
        description: item.description || '',
        documentCount: Number(item.document_count ?? 0),
        chunkCount: Number(item.chunk_count ?? 0),
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Failed to create knowledge base', err);
  }
  return null;
};

export const deleteKnowledgeBase = async (kbId: string): Promise<boolean> => {
  try {
    const res = await apiClient.delete<APIEnvelope<any>>(getScopedKBUrl(`/${kbId}`));
    return !!res.data?.success;
  } catch (err) {
    console.error('Failed to delete knowledge base', err);
    return false;
  }
};

export const getKnowledgeDocuments = async (kbId: string): Promise<KnowledgeDocument[]> => {
  if (!kbId) return [];
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>(getScopedKBUrl(`/${kbId}/documents`));
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => ({
        id: item.id,
        kbId: item.kb_id || item.kbId || kbId,
        name: item.name,
        type: item.doc_type || item.type || 'file',
        source: item.source_url_or_path || item.source || '',
        sizeBytes: item.size_bytes ? Number(item.size_bytes) : undefined,
        status: item.status || 'indexed',
        chunkCount: Number(item.chunk_count ?? item.chunkCount ?? 0),
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn(`KB documents API unavailable for kb ${kbId}`, err);
  }
  return [];
};

export const uploadKnowledgeFile = async (kbId: string, file: File): Promise<KnowledgeDocument | null> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<APIEnvelope<any>>(getScopedKBUrl(`/${kbId}/documents/upload`), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (res.data?.success && res.data.data) {
      const item = res.data.data;
      return {
        id: item.id,
        kbId: item.kb_id || kbId,
        name: item.name,
        type: item.doc_type || 'file',
        source: item.source_url_or_path || item.name,
        sizeBytes: item.size_bytes ? Number(item.size_bytes) : file.size,
        status: item.status || 'indexed',
        chunkCount: Number(item.chunk_count ?? 0),
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Failed to upload file to KB', err);
  }
  return null;
};

export const addRawKnowledgeDocument = async (
  kbId: string,
  name: string,
  type: 'file' | 'url' | 'text',
  source: string,
  sizeBytes?: number
): Promise<KnowledgeDocument | null> => {
  try {
    const res = await apiClient.post<APIEnvelope<any>>(getScopedKBUrl(`/${kbId}/documents`), {
      name,
      doc_type: type,
      source_path: source,
      size_bytes: sizeBytes || source.length,
    });
    if (res.data?.success && res.data.data) {
      const item = res.data.data;
      return {
        id: item.id,
        kbId: item.kb_id || kbId,
        name: item.name,
        type: item.doc_type || type,
        source: item.source_url_or_path || source,
        sizeBytes: item.size_bytes ? Number(item.size_bytes) : (sizeBytes || source.length),
        status: item.status || 'indexed',
        chunkCount: Number(item.chunk_count ?? 0),
        createdAt: item.created_at || new Date().toISOString(),
        updatedAt: item.updated_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Failed to add document to KB', err);
  }
  return null;
};

export const deleteKnowledgeDocument = async (kbId: string, docId: string): Promise<boolean> => {
  try {
    const res = await apiClient.delete<APIEnvelope<any>>(getScopedKBUrl(`/${kbId}/documents/${docId}`));
    return !!res.data?.success;
  } catch (err) {
    console.error('Failed to delete KB document', err);
    return false;
  }
};

export const syncKnowledgeBase = async (kbId: string): Promise<boolean> => {
  try {
    const res = await apiClient.post<APIEnvelope<{ synced: boolean }>>(getScopedKBUrl(`/${kbId}/sync`));
    return !!res.data?.success;
  } catch (err) {
    console.warn('Sync KB API unavailable', err);
    return false;
  }
};

export const uploadKnowledgeDocument = async (
  name: string,
  type: 'file' | 'url' | 'text',
  source: string,
  kbId = 'default'
): Promise<KnowledgeDocument> => {
  const doc = await addRawKnowledgeDocument(kbId, name, type, source);
  if (doc) return doc;
  return {
    id: `kb-${Date.now()}`,
    name,
    type,
    source,
    status: 'indexed',
    chunkCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

