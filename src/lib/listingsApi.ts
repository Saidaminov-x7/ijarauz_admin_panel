// src/lib/listingsApi.ts
// API функции для управления товарами, заказами и жалобами (AUBRIN Admin)

import { api } from './axios';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'OUT_OF_STOCK' | 'ARCHIVED';
export type BadgeType = 'NEW' | 'SALE' | 'HIT' | 'LIMITED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED_FROM_UK'
  | 'IN_TRANSIT'
  | 'CUSTOMS'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type ReportReason =
  | 'WRONG_DESCRIPTION'
  | 'OUT_OF_STOCK'
  | 'DEFECTIVE'
  | 'WRONG_PRICE'
  | 'COUNTERFEIT'
  | 'OTHER';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export type ViewingStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';

export interface AdminProduct {
  id: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  status: ProductStatus;
  moderationStatus: ModerationStatus;
  badge?: BadgeType | null;
  image?: string | null;
  images?: string[];
  createdAt: string;
  isVerified?: boolean;
  isPromoted?: boolean;
  promotionTier?: string | null;
  moderationNote?: string | null;
  city?: string;
  district?: string;
  area?: number;
  rooms?: number;
  owner?: { name: string; email: string };
}

export interface ProductsFilter {
  page?: number;
  limit?: number;
  status?: ProductStatus;
  moderationStatus?: ModerationStatus;
  brandId?: string;
  categoryId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  city: string;
  totalPrice: number;
  discountPrice?: number | null;
  deliveryPrice: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  riskScore: number;
  riskLevel: string;
  createdAt: string;
  items: Array<{
    id: string;
    size: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      sku: string;
      brand: { name: string };
      images: Array<{ url: string }>;
    };
  }>;
}

export interface ReportItem {
  id: string;
  productId?: string;
  listingId?: string;
  reason: ReportReason;
  comment: string | null;
  status: ReportStatus;
  createdAt: string;
  product?: {
    id: string;
    sku: string;
    title: string;
    price: number;
  };
  listing?: {
    id: string;
    title: string;
    city: string;
    price: string;
    status: string;
    images: { url: string }[];
    owner: { id: string; name: string; email: string };
  };
  reporter?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ViewingRequestItem {
  id: string;
  orderId?: string;
  listingId?: string;
  reason?: string;
  status: ViewingStatus | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  preferredDate?: string | null;
  message?: string | null;
  listing?: { id: string; title: string; ownerId: string };
  requester?: { id: string; name: string; phone: string; email: string };
  order?: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
  };
}

// ─── API Методы ──────────────────────────────────────────────────────────────

export const getAdminProductsApi = async (
  filter: ProductsFilter = {},
): Promise<PaginatedResponse<AdminProduct>> => {
  const { data } = await api.get<PaginatedResponse<AdminProduct>>('/admin/products', {
    params: filter,
  });
  return data;
};

// Алиас для обратной совместимости
export const getAdminListingsApi = getAdminProductsApi;

export const approveListingApi = async (id: string): Promise<any> => {
  const { data } = await api.patch(`/admin/products/${id}/moderate`, { status: 'APPROVED' });
  return data;
};

export const rejectListingApi = async (id: string, note: string): Promise<any> => {
  const { data } = await api.patch(`/admin/products/${id}/moderate`, {
    status: 'REJECTED',
    note,
  });
  return data;
};

export const requestChangesApi = async (id: string, comment: string): Promise<any> => {
  const { data } = await api.patch(`/admin/products/${id}/moderate`, {
    status: 'CHANGES_REQUESTED',
    note: comment,
  });
  return data;
};

export const verifyListingApi = async (id: string, isVerified = true): Promise<any> => {
  const { data } = await api.patch(`/admin/products/${id}/moderate`, {
    isVerified,
  });
  return data;
};

export const deleteListingApi = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};

export const getAdminOrdersApi = async (
  params: { page?: number; limit?: number; status?: OrderStatus; search?: string } = {},
): Promise<PaginatedResponse<AdminOrder>> => {
  const { data } = await api.get<PaginatedResponse<AdminOrder>>('/admin/orders', { params });
  return data;
};

export const getOrdersKanbanApi = async (): Promise<AdminOrder[]> => {
  const { data } = await api.get<AdminOrder[]>('/admin/orders/kanban');
  return data;
};

export const updateOrderStatusApi = async (
  id: string,
  status: OrderStatus,
  comment?: string,
): Promise<AdminOrder> => {
  const { data } = await api.patch<AdminOrder>(`/orders/${id}/status`, { status, comment });
  return data;
};

export const getReportsApi = async (
  params: { status?: ReportStatus; page?: number; limit?: number } = {},
): Promise<PaginatedResponse<ReportItem>> => {
  const { data } = await api.get<PaginatedResponse<ReportItem>>('/admin/reports', { params });
  return data;
};

export const updateReportStatusApi = async (
  id: string,
  status: ReportStatus,
): Promise<ReportItem> => {
  const { data } = await api.patch<ReportItem>(`/admin/reports/${id}/status`, { status });
  return data;
};

export const getViewingRequestsApi = async (): Promise<ViewingRequestItem[]> => {
  const { data } = await api.get<ViewingRequestItem[]>('/admin/returns');
  return data;
};

export const updateViewingStatusApi = async (
  id: string,
  status: string,
): Promise<ViewingRequestItem> => {
  const { data } = await api.patch<ViewingRequestItem>(`/admin/returns/${id}/status`, { status });
  return data;
};
