// src/pages/settings/GeneralSettingsPage.tsx
// Основные настройки: maintenance mode, название сайта, контакты для футера

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { getSiteSettingsApi, updateSiteSettingsApi, uploadSiteLogoApi, deleteSiteLogoApi } from '../../lib/siteSettingsApi';

const TrashIcon = () => <span aria-hidden="true">x</span>;
const UploadIcon = () => <span aria-hidden="true">+</span>;

const GeneralSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getSiteSettingsApi,
  });

  const [siteName, setSiteName] = useState('Ijarauz');
  const [contactEmail, setContactEmail] = useState('support@ijarauz.uz');
  const [contactPhone, setContactPhone] = useState('+998 71 200-00-00');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || 'Ijarauz');
      setContactEmail(settings.contactEmail || 'support@ijarauz.uz');
      setContactPhone(settings.contactPhone || '+998 71 200-00-00');
      setMaintenanceMode(settings.maintenanceMode ?? false);
      setMaintenanceMessage(settings.maintenanceMessage || '');
      setLogoPreview(settings.logoUrl || null);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSiteSettingsApi,
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'site-settings'], updated);
      setSuccessMsg('Основные настройки успешно сохранены');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Ошибка сохранения настроек');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    // Сначала обновляем основные настройки
    await mutation.mutateAsync({
      siteName,
      contactEmail,
      contactPhone,
      maintenanceMode,
      maintenanceMessage: maintenanceMessage.trim() || null,
    });
    
    // Затем загружаем логотип, если он выбран
    if (logoFile) {
      try {
        await uploadSiteLogoApi(logoFile);
        queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setErrorMsg(error.response?.data?.message || 'Ошибка загрузки логотипа');
      }
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Можно загружать только изображения');
      return;
    }
    
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoDelete = async () => {
    try {
      await deleteSiteLogoApi();
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      setLogoPreview(null);
      setLogoFile(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Ошибка удаления логотипа');
    }
  };

  return (
    <Layout title="Основные настройки">
      <div className="max-w-4xl mx-auto space-y-6">
        {successMsg && (
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm border border-green-200 dark:border-green-800 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-800">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Режим обслуживания */}
          <div className="card border-2 border-primary-500/20">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-app">Режим технического обслуживания</h3>
                <p className="text-sm text-muted mt-0.5">
                  Если включено, публичная часть сайта будет недоступна для посетителей.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            {maintenanceMode && (
              <div className="mt-4 pt-4 border-t border-app">
                <label className="block text-sm font-medium text-app mb-1.5">
                  Сообщение для посетителей при техобслуживании
                </label>
                <textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  rows={3}
                  placeholder="Сайт временно недоступен. Мы проводим технические работы..."
                  className="input w-full"
                />
              </div>
            )}
          </div>

          {/* Логотип платформы */}
          <div className="card space-y-4">
            <h3 className="text-base font-semibold text-app">Логотип платформы</h3>
            <p className="text-sm text-muted">
              Загруженный логотип будет отображаться в шапке сайта и админ-панели.
            </p>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Логотип платформы"
                    className="h-16 w-auto rounded-lg border border-app"
                  />
                  <button
                    type="button"
                    onClick={handleLogoDelete}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить логотип"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-app flex items-center justify-center text-muted">
                  Нет логотипа
                </div>
              )}
              <label className="btn-ghost flex items-center gap-2 cursor-pointer">
                <UploadIcon />
                Загрузить логотип
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Общая информация */}
          <div className="card space-y-4">
            <h3 className="text-base font-semibold text-app">Информация о сайте и контакты</h3>

            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Название платформы</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="input max-w-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app mb-1.5">Контактный Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-app mb-1.5">Контактный телефон</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || mutation.isPending}
              className="btn-primary px-6"
            >
              {mutation.isPending ? 'Сохранение...' : 'Сохранить основные настройки'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GeneralSettingsPage;
