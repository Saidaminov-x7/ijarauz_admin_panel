// src/lib/extendedAdminApi.ts
import { api } from './axios';

// [Фича 2, 1, 8]
export interface FraudAnalysisResult {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: Array<{
    code: string;
    description: string;
    weight: number;
  }>;
  possibleDuplicates: Array<{
    id: string;
    title: string;
    similarity: number;
    ownerId: string;
  }>;
  marketFairPrice: {
    medianPrice: number;
    differencePercent: number;
    verdict: 'UNDERPRICED' | 'FAIR' | 'OVERPRICED';
  };
}

export const getFraudAnalysisApi = async (listingId: string): Promise<FraudAnalysisResult> => {
  const { data } = await api.get<FraudAnalysisResult>(`/admin/listings/${listingId}/fraud-analysis`);
  return data;
};

// [Фича 6] Heatmap
export interface HeatmapData {
  points: Array<{
    id: string;
    lat: number;
    lng: number;
    weight: number;
    views: number;
  }>;
  districts: Array<{
    city: string;
    district: string;
    count: number;
    avgPrice: number;
    views: number;
    lat: number;
    lng: number;
  }>;
}

export const getHeatmapAnalyticsApi = async (): Promise<HeatmapData> => {
  const { data } = await api.get<HeatmapData>('/admin/analytics/heatmap');
  return data;
};

// [Фича 9] Search Queries
export interface SearchAnalyticsData {
  recentSearches: Array<{
    id: string;
    query?: string | null;
    city?: string | null;
    district?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    rooms?: number | null;
    resultsCount: number;
    ip?: string | null;
    createdAt: string;
  }>;
  stats: {
    totalSearches: number;
    zeroResultsCount: number;
    unmetDemandPercent: number;
  };
}

export const getSearchAnalyticsApi = async (): Promise<SearchAnalyticsData> => {
  const { data } = await api.get<SearchAnalyticsData>('/admin/analytics/search-queries');
  return data;
};

// [Фича 18] Promo Codes
export interface PromoCodeItem {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export const getPromoCodesApi = async (): Promise<PromoCodeItem[]> => {
  const { data } = await api.get<PromoCodeItem[]>('/admin/promo-codes');
  return data;
};

export const createPromoCodeApi = async (dto: {
  code: string;
  discountPercent: number;
  maxUses: number;
  expiresAt?: string;
}): Promise<PromoCodeItem> => {
  const { data } = await api.post<PromoCodeItem>('/admin/promo-codes', dto);
  return data;
};

export const deletePromoCodeApi = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/admin/promo-codes/${id}`);
  return data;
};

// [Фича 20] Revenue & Finances
export interface RevenueStatsData {
  totalRevenue: number;
  activePromotionsCount: number;
  tierCounts: Record<string, number>;
  estimatedMRR: number;
  promotedListings: Array<{
    id: string;
    title: string;
    promotionTier: string;
    promotedUntil: string | null;
    createdAt: string;
  }>;
}

export const getRevenueStatsApi = async (): Promise<RevenueStatsData> => {
  const { data } = await api.get<RevenueStatsData>('/admin/stats/revenue');
  return data;
};

// [Фича 26] System Health
export interface SystemHealthData {
  status: 'HEALTHY' | 'DEGRADED';
  uptimeSeconds: number;
  database: { status: string; latencyMs: number };
  redis: { status: string; latencyMs: number };
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
  };
  nodeVersion: string;
  timestamp: string;
}

export const getSystemHealthApi = async (): Promise<SystemHealthData> => {
  const { data } = await api.get<SystemHealthData>('/admin/system/health');
  return data;
};

// [Фича 27] Webhooks
export interface WebhookItem {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string | null;
  createdAt: string;
}

export const getWebhooksApi = async (): Promise<WebhookItem[]> => {
  const { data } = await api.get<WebhookItem[]>('/admin/webhooks');
  return data;
};

export const createWebhookApi = async (dto: {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}): Promise<WebhookItem> => {
  const { data } = await api.post<WebhookItem>('/admin/webhooks', dto);
  return data;
};

export const deleteWebhookApi = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete<{ success: boolean }>(`/admin/webhooks/${id}`);
  return data;
};

// [Фича 29] Backups
export interface BackupsInfoData {
  lastAutomaticBackup: string;
  snapshotStats: {
    listings: number;
    users: number;
    reports: number;
  };
}

export const getBackupsInfoApi = async (): Promise<BackupsInfoData> => {
  const { data } = await api.get<BackupsInfoData>('/admin/system/backups');
  return data;
};

// [Фича 30] Kanban
export interface KanbanBoardData {
  PENDING: any[];
  CHANGES_REQUESTED: any[];
  REJECTED: any[];
  APPROVED_VERIFIED: any[];
}

export const getKanbanBoardApi = async (): Promise<KanbanBoardData> => {
  const { data } = await api.get<KanbanBoardData>('/admin/moderation/kanban');
  return data;
};
