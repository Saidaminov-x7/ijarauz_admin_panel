// src/pages/settings/AppSettingsPage.tsx
// Настройки приложения: фичи, лимиты, переключатели функционала

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { getSiteSettingsApi, updateSiteSettingsApi } from '../../lib/siteSettingsApi';

const AppSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getSiteSettingsApi,
  });

  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const [autoModerationEnabled, setAutoModerationEnabled] = useState(false);
  const [maxImagesPerListing, setMaxImagesPerListing] = useState(10);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setGoogleAuthEnabled(settings.googleAuthEnabled ?? true);
      setAutoModerationEnabled(settings.autoModerationEnabled ?? false);
      setMaxImagesPerListing(settings.maxImagesPerListing ?? 10);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: updateSiteSettingsApi,
    onSuccess: (updated) => {
      queryClient.setQueryData(['admin', 'site-settings'], updated);
      setSuccessMsg('Параметры приложения успешно обновлены');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      setErrorMsg(error.response?.data?.message || 'Ошибка сохранения настроек');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    mutation.mutate({
      googleAuthEnabled,
      autoModerationEnabled,
      maxImagesPerListing: Number(maxImagesPerListing),
    });
  };

  return (
    <Layout title="Настройки приложения">
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
          {/* Переключатели функционала */}
          <div className="card space-y-6">
            <h3 className="text-base font-semibold text-app">Управление возможностями</h3>

            {/* Google Авторизация */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-app">
              <div>
                <h4 className="text-sm font-semibold text-app">Авторизация через Google OAuth</h4>
                <p className="text-xs text-muted mt-0.5">
                  Позволяет пользователям регистрироваться и входить в один клик с подтверждением номера телефона.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={googleAuthEnabled}
                  onChange={(e) => setGoogleAuthEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            {/* Автоматическая модерация */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-app">
              <div>
                <h4 className="text-sm font-semibold text-app">Автоматическое одобрение объявлений</h4>
                <p className="text-xs text-muted mt-0.5">
                  Если выключено, все новые и отредактированные объявления требуют ручной проверки модератором.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={autoModerationEnabled}
                  onChange={(e) => setAutoModerationEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500" />
              </label>
            </div>

            {/* Лимиты */}
            <div>
              <h4 className="text-sm font-semibold text-app mb-1.5">Максимальное количество фото на объявление</h4>
              <p className="text-xs text-muted mb-3">
                Ограничивает количество фотографий, которые арендодатель может прикрепить к одному объекту.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={maxImagesPerListing}
                  onChange={(e) => setMaxImagesPerListing(Number(e.target.value))}
                  required
                  className="input w-32 text-center font-bold"
                />
                <span className="text-sm text-muted">фотографий</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || mutation.isPending}
              className="btn-primary px-6"
            >
              {mutation.isPending ? 'Сохранение...' : 'Сохранить настройки приложения'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AppSettingsPage;
