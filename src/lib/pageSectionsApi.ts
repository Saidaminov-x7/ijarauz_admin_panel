// src/lib/pageSectionsApi.ts
// API для конструктора страниц (Page Builder / CMS)

import { api } from './axios';

export interface PageSectionItem {
  id: string;
  pageKey: string;
  sectionType: string;
  title?: string | null;
  order: number;
  isVisible: boolean;
  layoutRow?: number | null;
  width?: number | null;
  content: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  updatedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const getPageSectionsApi = async (pageKey = 'home'): Promise<PageSectionItem[]> => {
  const { data } = await api.get('/admin/page-sections', { params: { pageKey } });
  return data;
};

export const createPageSectionApi = async (dto: {
  pageKey?: string;
  sectionType: string;
  title?: string;
  order?: number;
  isVisible?: boolean;
  layoutRow?: number;
  width?: number;
  content: Record<string, unknown>;
}): Promise<PageSectionItem> => {
  const { data } = await api.post('/admin/page-sections', dto);
  return data;
};

export const updatePageSectionApi = async (
  id: string,
  dto: {
    title?: string;
    order?: number;
    isVisible?: boolean;
    layoutRow?: number;
    width?: number;
    content?: Record<string, unknown>;
  },
): Promise<PageSectionItem> => {
  const { data } = await api.patch(`/admin/page-sections/${id}`, dto);
  return data;
};

export const reorderPageSectionsApi = async (
  pageKey: string,
  items: { id: string; order: number }[],
): Promise<void> => {
  await api.patch('/admin/page-sections/reorder', { pageKey, items });
};

export const deletePageSectionApi = async (id: string): Promise<void> => {
  await api.delete(`/admin/page-sections/${id}`);
};
