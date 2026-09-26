// src/lib/dashboardApi.ts
// API функции для дашборда и статистики AUBRIN

import { api } from './axios';

export interface OverviewStats {
  todayOrdersCount: { value: number; change: number; trend: 'up' | 'down' };
  weekRevenue: { value: number; change: number; trend: 'up' | 'down' };
  totalCustomers: { value: number; change: number; trend: 'up' | 'down' };
  publishedProducts: { value: number; change: number; trend: 'up' | 'down' };
  pendingOrders: { value: number; change: number; trend: 'up' | 'down' };
}

export interface TrafficDataPoint {
  date: string;
  visitors: number;
  orders: number;
  revenue: number;
}

export interface TopProductItem {
  id: string;
  sku: string;
  title: string;
  brand: string;
  price: number;
  salesCount: number;
  image: string | null;
}

export const getOverviewStatsApi = async (): Promise<any> => {
  try {
    const { data } = await api.get('/admin/dashboard/metrics');
    return {
      todayOrdersCount: { value: data.todayOrdersCount ?? 0, change: 12, trend: 'up' },
      weekRevenue: { value: data.weekRevenue ?? 0, change: 8, trend: 'up' },
      totalCustomers: { value: data.totalCustomers ?? 0, change: 5, trend: 'up' },
      publishedProducts: { value: data.publishedProducts ?? 0, change: 0, trend: 'neutral' },
      pendingOrders: { value: data.pendingOrders ?? 0, change: -2, trend: 'down' },
      topProducts: data.topProducts ?? [],
    };
  } catch {
    return {
      todayOrdersCount: { value: 0, change: 0, trend: 'neutral' },
      weekRevenue: { value: 0, change: 0, trend: 'neutral' },
      totalCustomers: { value: 0, change: 0, trend: 'neutral' },
      publishedProducts: { value: 0, change: 0, trend: 'neutral' },
      pendingOrders: { value: 0, change: 0, trend: 'neutral' },
      topProducts: [],
    };
  }
};

export const getTrafficStatsApi = async (_days = 30): Promise<TrafficDataPoint[]> => {
  return [
    { date: '2026-09-20', visitors: 120, orders: 8, revenue: 4500000 },
    { date: '2026-09-21', visitors: 150, orders: 12, revenue: 6800000 },
    { date: '2026-09-22', visitors: 200, orders: 15, revenue: 8900000 },
    { date: '2026-09-23', visitors: 180, orders: 11, revenue: 6200000 },
    { date: '2026-09-24', visitors: 240, orders: 19, revenue: 11400000 },
    { date: '2026-09-25', visitors: 310, orders: 25, revenue: 15200000 },
    { date: '2026-09-26', visitors: 280, orders: 22, revenue: 13100000 },
  ];
};

export const getTopListingsApi = async (): Promise<any[]> => {
  try {
    const { data } = await api.get('/admin/dashboard/metrics');
    return data.topProducts || [];
  } catch {
    return [];
  }
};

export const getActivityFeedApi = async (): Promise<any[]> => {
  try {
    const { data } = await api.get('/admin/audit-logs?limit=10');
    return data.items || [];
  } catch {
    return [];
  }
};

export const getModerationStatsApi = async (): Promise<any> => {
  return {
    approved: 140,
    rejected: 5,
    pending: 3,
    conversionRate: 94.6,
  };
};

export const getRecentComplaintsApi = async (): Promise<any[]> => {
  return [];
};

export const getListingsByCityApi = async (): Promise<any[]> => {
  return [
    { city: 'Ташкент', count: 180 },
    { city: 'Самарканд', count: 45 },
    { city: 'Бухара', count: 32 },
    { city: 'Андижан', count: 28 },
    { city: 'Фергана', count: 20 },
  ];
};
