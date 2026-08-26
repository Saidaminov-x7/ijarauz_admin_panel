// src/lib/listingsApi.ts
// API функции для управления объявлениями (admin)

import { api } from './axios';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export interface AdminListing {
  id:               string;
  title:            string;
  description:      string;
  price:            string;
  type:             string;
  rooms:            number;
  area:             string;
  city:             string;
  district:         string;
  address:          string | null;
  status:           ListingStatus;
  moderationStatus: ModerationStatus;
  moderationNote:   string | null;
  viewsCount:       number;
  createdAt:        string;
  updatedAt:        string;
  owner: {
    id:     string;
    name:   string;
    email:  string;
    phone:  string;
    avatar: string | null;
  };
  images: { id: string; url: string }[];
  _count: { favorites: number };
}

export interface ListingsFilter {
  page?:             number;
  limit?:            number;
  status?:           ListingStatus;
  moderationStatus?: ModerationStatus;
  city?:             string;
  ownerId?:          string;
  dateFrom?:         string;
  dateTo?:           string;
  sortBy?:           string;
  sortOrder?:        'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
  };
}

// Список объявлений с фильтрами
export const getAdminListingsApi = async (
  filter: ListingsFilter,
): Promise<PaginatedResponse<AdminListing>> => {
  const { data } = await api.get<PaginatedResponse<AdminListing>>('/admin/listings', { params: filter });
  return data;
};

// Одобрить объявление
export const approveListingApi = async (id: string): Promise<AdminListing> => {
  const { data } = await api.patch<AdminListing>(`/admin/listings/${id}/approve`);
  return data;
};

// Отклонить объявление
export const rejectListingApi = async (id: string, reason: string): Promise<AdminListing> => {
  const { data } = await api.patch<AdminListing>(`/admin/listings/${id}/reject`, { reason });
  return data;
};

// Запросить правки
export const requestChangesApi = async (id: string, comment: string): Promise<AdminListing> => {
  const { data } = await api.patch<AdminListing>(`/admin/listings/${id}/request-changes`, { comment });
  return data;
};

// Удалить объявление (soft delete)
export const deleteListingApi = async (id: string): Promise<void> => {
  await api.delete(`/admin/listings/${id}`);
};
