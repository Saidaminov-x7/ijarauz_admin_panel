// src/App.tsx
// Корневой компонент — маршрутизация с защитой роутов

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useInitAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './routes';

// Страницы
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ListingsPage from './pages/ListingsPage';
import ReportsPage from './pages/ReportsPage';
import ViewingRequestsPage from './pages/ViewingRequestsPage';
import UsersPage from './pages/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import PagesPage from './pages/PagesPage';
import PageBuilderPage from './pages/PageBuilderPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TrafficAnalyticsPage from './pages/analytics/TrafficAnalyticsPage';
import CityAnalyticsPage from './pages/analytics/CityAnalyticsPage';
import ExportReportsPage from './pages/analytics/ExportReportsPage';
import HeatmapPage from './pages/analytics/HeatmapPage';
import SearchAnalyticsPage from './pages/analytics/SearchAnalyticsPage';
import PromoCodesPage from './pages/monetization/PromoCodesPage';
import RevenueAnalyticsPage from './pages/monetization/RevenueAnalyticsPage';
import SystemHealthPage from './pages/system/SystemHealthPage';
import WebhooksPage from './pages/system/WebhooksPage';
import BackupsPage from './pages/system/BackupsPage';
import ModerationKanbanPage from './pages/ModerationKanbanPage';
import GeneralSettingsPage from './pages/settings/GeneralSettingsPage';
import AppSettingsPage from './pages/settings/AppSettingsPage';
import StaffPage from './pages/settings/StaffPage';
import AppearanceSettingsPage from './pages/settings/AppearanceSettingsPage';
import AdminPanelThemePage from './pages/settings/AdminPanelThemePage';
import ProfilePage from './pages/ProfilePage';
import AuditLogPage from './pages/AuditLogPage';
import ErrorLogsPage from './pages/ErrorLogsPage';
import NotFoundPage from './pages/NotFoundPage';

// Инициализация темы (применяем до рендера UI)
import { useTheme } from './hooks/useTheme';
import AdminThemeInjector from './components/AdminThemeInjector';

const App: React.FC = () => {
  // Инициализируем тему (добавляет/убирает класс 'dark' на <html>)
  useTheme();
  // Инициализируем auth (пробуем восстановить сессию через refresh token)
  useInitAuth();

  return (
    <BrowserRouter>
      {/* Применяет CSS-переменные темы ПАНЕЛИ АДМИНИСТРАТОРА при загрузке */}
      <AdminThemeInjector />
      <Routes>
        {/* Публичный маршрут — страница входа */}
        <Route path="/login" element={<LoginPage />} />

        {/* Главная */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Объявления */}
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <ListingsPage />
            </ProtectedRoute>
          }
        />

        {/* Жалобы на объявления */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Заявки на просмотр */}
        <Route
          path="/viewing-requests"
          element={
            <ProtectedRoute>
              <ViewingRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Пользователи */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Медиа-библиотека */}
        <Route
          path={ROUTES.MEDIA}
          element={
            <ProtectedRoute>
              <MediaLibraryPage />
            </ProtectedRoute>
          }
        />

        {/* Страницы сайта и Конструктор */}
        <Route
          path="/pages"
          element={
            <ProtectedRoute>
              <PagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pages/:pageKey/builder"
          element={
            <ProtectedRoute>
              <PageBuilderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pages/builder"
          element={
            <ProtectedRoute>
              <PageBuilderPage />
            </ProtectedRoute>
          }
        />

        {/* Аналитика */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/traffic"
          element={
            <ProtectedRoute>
              <TrafficAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/cities"
          element={
            <ProtectedRoute>
              <CityAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/export"
          element={
            <ProtectedRoute>
              <ExportReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Настройки */}
        <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
        <Route
          path="/settings/general"
          element={
            <ProtectedRoute>
              <GeneralSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/app"
          element={
            <ProtectedRoute>
              <AppSettingsPage />
            </ProtectedRoute>
          }
        />
        {/* Тема сайта — дизайн-токены сайта, доступно SUPER_ADMIN */}
        <Route
          path="/settings/appearance"
          element={
            <ProtectedRoute requiredAdminRole="SUPER_ADMIN">
              <AppearanceSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Тема панели администратора — независимые токены для UI самой панели, доступно SUPER_ADMIN */}
        <Route
          path="/settings/admin-theme"
          element={
            <ProtectedRoute requiredAdminRole="SUPER_ADMIN">
              <AdminPanelThemePage />
            </ProtectedRoute>
          }
        />

        {/* Роут сотрудников: только для SUPER_ADMIN, для остальных — реальный 404 */}
        <Route
          path={ROUTES.STAFF}
          element={
            <ProtectedRoute requiredAdminRole="SUPER_ADMIN">
              <StaffPage />
            </ProtectedRoute>
          }
        />

        {/* Профиль администратора */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Журнал действий (Audit Log) */}
        <Route
          path="/audit-log"
          element={
            <ProtectedRoute>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />

        {/* Канбан модерации */}
        <Route
          path={ROUTES.KANBAN}
          element={
            <ProtectedRoute>
              <ModerationKanbanPage />
            </ProtectedRoute>
          }
        />

        {/* Тепловая карта */}
        <Route
          path={ROUTES.HEATMAP}
          element={
            <ProtectedRoute>
              <HeatmapPage />
            </ProtectedRoute>
          }
        />

        {/* Поисковые запросы */}
        <Route
          path={ROUTES.SEARCH_ANALYTICS}
          element={
            <ProtectedRoute>
              <SearchAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Промокоды */}
        <Route
          path={ROUTES.PROMO_CODES}
          element={
            <ProtectedRoute>
              <PromoCodesPage />
            </ProtectedRoute>
          }
        />

        {/* Выручка и финансы */}
        <Route
          path={ROUTES.REVENUE}
          element={
            <ProtectedRoute>
              <RevenueAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Мониторинг здоровья */}
        <Route
          path={ROUTES.HEALTH}
          element={
            <ProtectedRoute>
              <SystemHealthPage />
            </ProtectedRoute>
          }
        />

        {/* Webhooks */}
        <Route
          path={ROUTES.WEBHOOKS}
          element={
            <ProtectedRoute>
              <WebhooksPage />
            </ProtectedRoute>
          }
        />

        {/* Резервные копии */}
        <Route
          path={ROUTES.BACKUPS}
          element={
            <ProtectedRoute>
              <BackupsPage />
            </ProtectedRoute>
          }
        />

        {/* Ошибки фронтенда */}
        <Route
          path="/errors"
          element={
            <ProtectedRoute>
              <ErrorLogsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;