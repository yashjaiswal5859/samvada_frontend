import { apiClient } from './client';
import { AnalyticsSummary, APIEnvelope } from '../types';

export const EMPTY_ANALYTICS: AnalyticsSummary = {
  totalCalls: 0,
  completedCalls: 0,
  failedCalls: 0,
  escalatedCalls: 0,
  totalDurationMin: 0,
  totalDurationSec: 0,
  avgDurationSec: 0,
  avgLatencyMs: 0,
  overallSuccessRate: 0,
  totalCostUsd: 0,
  positiveSentimentPercent: 0,
  neutralSentimentPercent: 0,
  negativeSentimentPercent: 0,
  dailyCallVolume: [],
  sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 },
};

export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
  try {
    const res = await apiClient.get<APIEnvelope<any>>('/api/v1/analytics/summary');
    if (res.data?.success && res.data.data) {
      const d = res.data.data;
      const totalCalls = Number(d.total_calls ?? d.totalCalls ?? 0);
      const completedCalls = Number(d.completed_calls ?? d.completedCalls ?? 0);
      const failedCalls = Number(d.failed_calls ?? d.failedCalls ?? 0);
      const escalatedCalls = Number(d.escalated_calls ?? d.escalatedCalls ?? 0);
      const totalDurationSec = Number(d.total_duration_sec ?? d.totalDurationSec ?? 0);
      const avgDurationSec = Number(d.avg_duration_sec ?? d.avgDurationSec ?? 0);
      const avgLatencyMs = Number(d.avg_e2e_latency_ms ?? d.avgLatencyMs ?? 0);
      const overallSuccessRate = Number(d.success_rate_percent ?? d.overallSuccessRate ?? 0);
      const totalCostUsd = Number(d.total_spend_usd ?? d.totalCostUsd ?? 0);
      const posPct = Number(d.positive_sentiment_percent ?? 0);
      const neuPct = Number(d.neutral_sentiment_percent ?? 0);
      const negPct = Number(d.negative_sentiment_percent ?? 0);

      return {
        totalCalls,
        completedCalls,
        failedCalls,
        escalatedCalls,
        totalDurationMin: Math.round((totalDurationSec / 60) * 10) / 10,
        totalDurationSec,
        avgDurationSec,
        avgLatencyMs,
        overallSuccessRate,
        totalCostUsd,
        positiveSentimentPercent: posPct,
        neutralSentimentPercent: neuPct,
        negativeSentimentPercent: negPct,
        dailyCallVolume: [],
        sentimentBreakdown: {
          positive: posPct,
          neutral: neuPct,
          negative: negPct,
        },
      };
    }
  } catch (err) {
    console.warn('Analytics summary API unavailable', err);
    throw new Error('Analytics summary is temporarily unavailable. Please try again.');
  }
  throw new Error('Analytics summary was not confirmed by the server.');
};

export const getVolumeTrend = async (days = 30): Promise<AnalyticsSummary['dailyCallVolume']> => {
  try {
    const res = await apiClient.get<APIEnvelope<any[]>>(`/api/v1/analytics/volume-trend?days=${days}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((item: any) => {
        const total = Number(item.total_calls ?? item.calls ?? item.total ?? 0);
        const answered = Number(item.completed_calls ?? item.answered ?? 0);
        const notAnswered = Math.max(0, total - answered);
        const failed = Number(item.failed_calls ?? item.failed ?? 0);
        const cost = Number(item.total_spend_usd ?? item.cost ?? 0);
        const dateStr = item.date || '';
        let displayDate = dateStr;
        try {
          if (dateStr) {
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
              displayDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
          }
        } catch {
          // fallback to raw date
        }

        return {
          date: dateStr,
          displayDate,
          answered,
          notAnswered,
          failed,
          total,
          calls: total,
          cost,
        };
      });
    }
  } catch (err) {
    console.warn('Analytics volume trend API unavailable', err);
  }
  return [];
};

export const getAgentLeaderboard = async () => {
  try {
    const res = await apiClient.get<APIEnvelope<any>>('/api/v1/analytics/agents/leaderboard');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Leaderboard API unavailable', err);
  }
  return [];
};

export const getConversionFunnels = async () => {
  try {
    const res = await apiClient.get<APIEnvelope<any>>('/api/v1/analytics/funnels');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('Funnel API unavailable', err);
  }
  return null;
};
