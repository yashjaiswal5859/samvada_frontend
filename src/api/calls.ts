import { apiClient } from './client';
import { CallRecord, APIEnvelope } from '../types';

export const getCallRecords = async (params?: { agentId?: string; limit?: number; offset?: number }): Promise<CallRecord[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.agentId) query.append('agent_id', params.agentId);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const url = `/api/v1/calls${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await apiClient.get<APIEnvelope<any>>(url);
    if (res.data?.success && res.data.data) {
      const rawList = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data.data.calls)
        ? res.data.data.calls
        : [];

      return rawList.map((c: any) => ({
        id: c.call_id || c.id,
        workspaceId: c.workspace_id || c.workspaceId,
        agentId: c.agent_id || c.agentId,
        agentName: c.agent_name || c.agentName || 'Voice Agent',
        customerName: c.customer_name || c.customerName || 'Direct Caller',
        customerPhone: c.caller_number || c.called_number || c.customerPhone || 'N/A',
        direction: c.direction || 'outbound',
        status: c.disposition || c.status || 'completed',
        durationSec: Number(c.duration_sec ?? c.durationSec ?? 0),
        costUsd: Number(c.total_cost_usd ?? c.costUsd ?? 0),
        sentiment: c.overall_sentiment || c.sentiment || 'neutral',
        evaluationScore: Number(c.evaluation_score ?? c.evaluationScore ?? 0),
        recordingUrl: c.recording_url || c.recordingUrl,
        transcript: Array.isArray(c.transcript) ? c.transcript : [],
        summary: c.transcript_summary || c.summary || '',
        createdAt: c.created_at || c.started_at || c.createdAt || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('Calls API unavailable, returning empty calls list', err);
  }
  return [];
};

export const getCallRecordById = async (id: string): Promise<CallRecord | undefined> => {
  try {
    const res = await apiClient.get<APIEnvelope<any>>(`/api/v1/calls/${id}`);
    if (res.data?.success && res.data.data) {
      const c = res.data.data;
      return {
        id: c.call_id || c.id,
        workspaceId: c.workspace_id || c.workspaceId,
        agentId: c.agent_id || c.agentId,
        agentName: c.agent_name || c.agentName || 'Voice Agent',
        customerName: c.customer_name || c.customerName || 'Direct Caller',
        customerPhone: c.caller_number || c.called_number || c.customerPhone || 'N/A',
        direction: c.direction || 'outbound',
        status: c.disposition || c.status || 'completed',
        durationSec: Number(c.duration_sec ?? c.durationSec ?? 0),
        costUsd: Number(c.total_cost_usd ?? c.costUsd ?? 0),
        sentiment: c.overall_sentiment || c.sentiment || 'neutral',
        evaluationScore: Number(c.evaluation_score ?? c.evaluationScore ?? 0),
        recordingUrl: c.recording_url || c.recordingUrl,
        transcript: Array.isArray(c.transcript) ? c.transcript : [],
        summary: c.transcript_summary || c.summary || '',
        createdAt: c.created_at || c.started_at || c.createdAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn('Call detail API unavailable', err);
  }
  return undefined;
};

export const getLiveCalls = async (): Promise<any[]> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>('/api/v1/calls/live');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Live calls API unavailable', err);
  }
  return [];
};
