// src/App.tsx
// Корневой компонент — маршрутизация с защитой роутов

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useInitAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Страницы
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ListingsPage from './pages/ListingsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import PagesPage from './pages/PagesPage';
import PageBuilderPage from './pages/PageBuilderPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TrafficAnalyticsPage from './pages/analytics/TrafficAnalyticsPage';
import CityAnalyticsPage from './pages/analytics/CityAnalyticsPage';
import ExportReportsPage from './pages/analytics/ExportReportsPage';
import GeneralSettingsPage from './pages/settings/GeneralSettingsPage';
import AppSettingsPage from './pages/settings/AppSettingsPage';
import StaffPage from './pages/settings/StaffPage';
import AppearanceSettingsPage from './pages/settings/AppearanceSettingsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Инициализация темы (применяем до рендера UI)
import { useTheme } from './hooks/useTheme';

const App: React.FC = () => {
  // Инициализируем тему (добавляет/убирает класс 'dark' на <html>)
  useTheme();
  // Инициализируем auth (пробуем восстановить сессию через refresh token)
  useInitAuth();

  return (
    <BrowserRouter>
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
          path="/media"
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
        {/* Внешний вид — дизайн-токены, доступно SUPER_ADMIN */}
        <Route
          path="/settings/appearance"
          element={
            <ProtectedRoute requiredAdminRole="SUPER_ADMIN">
              <AppearanceSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Роут сотрудников: только для SUPER_ADMIN, для остальных — реальный 404 */}
        <Route
          path="/settings/staff"
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

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;