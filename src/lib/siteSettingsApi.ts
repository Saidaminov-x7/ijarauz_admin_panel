// src/lib/siteSettingsApi.ts
// API для работы с настройками сайта

import { api } from './axios';

export interface SiteSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  googleAuthEnabled: boolean;
  autoModerationEnabled: boolean;
  maxImagesPerListing: number;
  listingsPerPage: number;
  logoUrl: string | null;
  navLinks?: Array<{ label: string; href: string; position: 'header' | 'footer' }>;
  updatedAt: string;
  updatedBy: {
    id: string;
    name: string;
  } | null;
}

// Получить текущие настройки
export const getSiteSettingsApi = async (): Promise<SiteSettings> => {
  const { data } = await api.get('/admin/site-settings');
  return data;
};

// Обновить настройки
export const updateSiteSettingsApi = async (payload: Partial<SiteSettings>): Promise<SiteSettings> => {
  const { data } = await api.patch('/admin/site-settings', payload);
  return data;
};

// Загрузить логотип
export const uploadSiteLogoApi = async (file: File): Promise<SiteSettings> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.post('/admin/site-settings/logo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Удалить логотип
export const deleteSiteLogoApi = async (): Promise<SiteSettings> => {
  const { data } = await api.delete('/admin/site-settings/logo');
  return data;
};