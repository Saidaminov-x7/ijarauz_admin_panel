// src/components/Sidebar/Sidebar.tsx
// Боковое меню с аккордеон-выпадающими списками, сворачиванием (collapsed) и профилем администратора

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutApi } from '../../lib/authApi';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSiteSettingsApi, getMediaUrl } from '../../lib/siteSettingsApi';
import { getOverviewStatsApi } from '../../lib/dashboardApi';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Kanban,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Users,
  Image,
  FileText,
  BarChart2,
  Settings,
  DollarSign,
  Server,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const roleTitles: Record<string, string> = {
  SUPER_ADMIN: 'Супер Администратор',
  ADMIN: 'Администратор',
  MODERATOR: 'Модератор',
  SUPPORT: 'Поддержка',
};

const DefaultAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
      {initials || 'A'}
    </div>
  );
};

interface SidebarProps {
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Состояние сворачивания (collapsed), сохраняется в localStorage
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', String(collapsed));
    } catch {}
  }, [collapsed]);

  const { data: settings } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getSiteSettingsApi,
  });

  // Получаем статистику для счетчиков/бейджей в реальном времени (polling раз в 30 секунд)
  const { data: overviewStats } = useQuery({
    queryKey: ['admin', 'overview-stats-sidebar'],
    queryFn: getOverviewStatsApi,
    refetchInterval: 30000,
  });

  const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN';

  // Состояния раскрытия выпадающих списков (аккордеонов)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    pages: false,
    analytics: false,
    settings: false,
    monetization: false,
    system: false,
  });

  // Автоматически раскрываем родительский аккордеон, если активен дочерний роут
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/pages')) setOpenSections((p) => ({ ...p, pages: true }));
    if (path.startsWith('/analytics')) setOpenSections((p) => ({ ...p, analytics: true }));
    if (path.startsWith('/settings')) setOpenSections((p) => ({ ...p, settings: true }));
    if (path.startsWith('/monetization')) setOpenSections((p) => ({ ...p, monetization: true }));
    if (path.startsWith('/system')) setOpenSections((p) => ({ ...p, system: true }));
  }, [location.pathname]);

  const toggleSection = (key: string) => {
    if (collapsed) {
      setCollapsed(false);
    }
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await logoutApi();
    } catch {
      // Игнорируем ошибки при логауте
    } finally {
      useAuthStore.getState().logout();
      navigate('/login');
    }
  };

  const pendingModerationCount = overviewStats?.pendingModeration?.value || 0;

  return (
    <aside
      className={`
        flex flex-col h-screen flex-shrink-0
        sidebar-bg sidebar-border border-r
        transition-all duration-300 ease-in-out select-none relative
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* ─── Логотип и кнопка закрытия на мобилке ─── */}
      <div
        className={`flex items-center ${
          collapsed ? 'justify-center px-2' : 'justify-between px-5'
        } h-16 border-b sidebar-border flex-shrink-0 overflow-hidden`}
      >
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer min-w-0"
          title="Ijarauz Admin"
        >
          <img
            src={getMediaUrl(settings?.logoUrl)}
            alt="Ijarauz Admin"
            className="h-7 w-auto object-contain shrink-0"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logotip.png';
            }}
          />
          {!collapsed && (
            <span className="font-bold text-base tracking-tight text-app truncate">
              ijarauz <span className="text-[10px] text-primary-500 font-extrabold uppercase">admin</span>
            </span>
          )}
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Закрыть меню"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* ─── Навигация ─── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin">
        {/* Главная */}
        <NavLink
          to="/"
          end
          title={collapsed ? t('nav.dashboard', 'Главная') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><Home size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.dashboard', 'Главная')}</span>}
        </NavLink>

        {/* Объявления */}
        <NavLink
          to="/listings"
          title={collapsed ? t('nav.listings', 'Объявления') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><List size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.listings', 'Объявления')}</span>}
        </NavLink>

        {/* Канбан модерации */}
        <NavLink
          to="/moderation/kanban"
          title={collapsed ? `${t('nav.kanban', 'Канбан модерации')} ${pendingModerationCount > 0 ? `(${pendingModerationCount})` : ''}` : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer relative
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0 relative">
            <Kanban size={18} />
            {collapsed && pendingModerationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
            )}
          </span>
          {!collapsed && (
            <>
              <span className="truncate">{t('nav.kanban', 'Канбан модерации')}</span>
              {pendingModerationCount > 0 && (
                <span className="ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {pendingModerationCount}
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Жалобы */}
        <NavLink
          to="/reports"
          title={collapsed ? t('nav.reports', 'Жалобы') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><AlertTriangle size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.reports', 'Жалобы')}</span>}
        </NavLink>

        {/* Ошибки сайта */}
        <NavLink
          to="/errors"
          title={collapsed ? t('nav.errors', 'Ошибки сайта') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><AlertCircle size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.errors', 'Ошибки сайта')}</span>}
        </NavLink>

        {/* Заявки на просмотр */}
        <NavLink
          to="/viewing-requests"
          title={collapsed ? t('nav.viewingRequests', 'Заявки на просмотр') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><Calendar size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.viewingRequests', 'Заявки на просмотр')}</span>}
        </NavLink>

        {/* Пользователи */}
        <NavLink
          to="/users"
          title={collapsed ? t('nav.users', 'Пользователи') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><Users size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.users', 'Пользователи')}</span>}
        </NavLink>

        {/* Медиа-библиотека */}
        <NavLink
          to={ROUTES.MEDIA}
          title={collapsed ? t('nav.media', 'Медиа-библиотека') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0"><Image size={18} /></span>
          {!collapsed && <span className="truncate">{t('nav.media', 'Медиа-библиотека')}</span>}
        </NavLink>

        {/* ─── [ГРУППА F] Страницы сайта и Управление контентом ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('pages')}
            title={collapsed ? t('nav.pages', 'Страницы сайта') : undefined}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/pages')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 font-semibold'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="shrink-0"><FileText size={18} /></span>
            {!collapsed && (
              <>
                <span className="truncate">{t('nav.pages', 'Страницы сайта')}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto transition-transform duration-200 ${
                    openSections.pages ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {!collapsed && openSections.pages && (
            <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in-50 duration-150">
              <NavLink
                to="/pages"
                end
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Все страницы (CMS)
              </NavLink>
              <NavLink
                to="/pages/home/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Конструктор главной (/home)
              </NavLink>
              <NavLink
                to="/pages/catalog/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Секции каталога (/catalog)
              </NavLink>
              <NavLink
                to="/settings/general#navigation"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Навигационное меню
              </NavLink>
              <NavLink
                to="/settings/general#footer"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Футер и контакты
              </NavLink>
              <NavLink
                to="/settings/general#seo"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                SEO-настройки по умолчанию
              </NavLink>
            </div>
          )}
        </div>

        {/* ─── Аналитика (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('analytics')}
            title={collapsed ? t('nav.analytics', 'Аналитика') : undefined}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/analytics')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 font-semibold'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="shrink-0"><BarChart2 size={18} /></span>
            {!collapsed && (
              <>
                <span className="truncate">{t('nav.analytics', 'Аналитика')}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto transition-transform duration-200 ${
                    openSections.analytics ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {!collapsed && openSections.analytics && (
            <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in-50 duration-150">
              <NavLink
                to="/analytics"
                end
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Общий обзор
              </NavLink>
              <NavLink
                to="/analytics/traffic"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Посещаемость
              </NavLink>
              <NavLink
                to="/analytics/cities"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                По городам
              </NavLink>
              <NavLink
                to="/analytics/heatmap"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Тепловая карта (Heatmap)
              </NavLink>
              <NavLink
                to="/analytics/search-queries"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Поисковые запросы
              </NavLink>
              <NavLink
                to="/analytics/export"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Экспорт отчётов
              </NavLink>
            </div>
          )}
        </div>

        {/* ─── Журнал действий (Audit Log) ─── */}
        <NavLink
          to="/audit-log"
          title={collapsed ? t('nav.audit', 'Журнал действий') : undefined}
          className={({ isActive }) => `
            flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm font-semibold'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          {!collapsed && <span className="truncate">{t('nav.audit', 'Журнал действий')}</span>}
        </NavLink>

        {/* ─── Настройки (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            title={collapsed ? t('nav.settings', 'Настройки') : undefined}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/settings')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 font-semibold'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="shrink-0"><Settings size={18} /></span>
            {!collapsed && (
              <>
                <span className="truncate">{t('nav.settings', 'Настройки')}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto transition-transform duration-200 ${
                    openSections.settings ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {!collapsed && openSections.settings && (
            <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in-50 duration-150">
              <NavLink
                to="/settings/general"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Основные настройки
              </NavLink>
              <NavLink
                to="/settings/app"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Параметры и Feature Flags
              </NavLink>
              {isSuperAdmin && (
                <NavLink
                  to="/settings/appearance"
                  className={({ isActive }) => `
                    block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                        : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  Тема сайта
                </NavLink>
              )}
              {isSuperAdmin && (
                <NavLink
                  to="/settings/admin-theme"
                  className={({ isActive }) => `
                    block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                        : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  Тема панели
                </NavLink>
              )}
              {isSuperAdmin && (
                <NavLink
                  to={ROUTES.STAFF}
                  className={({ isActive }) => `
                    block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                        : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  Сотрудники и роли (RBAC)
                </NavLink>
              )}
            </div>
          )}
        </div>

        {/* ─── Монетизация (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('monetization')}
            title={collapsed ? t('nav.monetization', 'Монетизация') : undefined}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/monetization')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 font-semibold'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="shrink-0"><DollarSign size={18} /></span>
            {!collapsed && (
              <>
                <span className="truncate">{t('nav.monetization', 'Монетизация')}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto transition-transform duration-200 ${
                    openSections.monetization ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {!collapsed && openSections.monetization && (
            <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in-50 duration-150">
              <NavLink
                to="/monetization/revenue"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Выручка и финансы
              </NavLink>
              <NavLink
                to="/monetization/promo-codes"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Промокоды и скидки
              </NavLink>
            </div>
          )}
        </div>

        {/* ─── Инфраструктура и бэкапы (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('system')}
            title={collapsed ? t('nav.system', 'Инфраструктура') : undefined}
            className={`
              w-full flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/system')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/60 dark:bg-primary-950/30 font-semibold'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="shrink-0"><Server size={18} /></span>
            {!collapsed && (
              <>
                <span className="truncate">{t('nav.system', 'Инфраструктура')}</span>
                <ChevronDown
                  size={15}
                  className={`ml-auto transition-transform duration-200 ${
                    openSections.system ? 'rotate-180' : ''
                  }`}
                />
              </>
            )}
          </button>

          {!collapsed && openSections.system && (
            <div className="pl-9 pr-2 py-1 space-y-1 animate-in fade-in-50 duration-150">
              <NavLink
                to="/system/health"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Здоровье системы (Health)
              </NavLink>
              <NavLink
                to="/system/webhooks"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Вебхуки (Webhooks)
              </NavLink>
              <NavLink
                to="/system/backups"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Бэкапы и Snapshot
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* ─── Кнопка Свернуть / Развернуть (Group E) ─── */}
      <div className="px-3 py-2 border-t sidebar-border hidden lg:flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`
            w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded-lg
            text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5
            transition-colors cursor-pointer text-xs
          `}
          title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {!collapsed && <span className="font-medium text-xs">Свернуть меню</span>}
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ─── Переключатель языка (RU/UZ/EN) ─── */}
      <div
        className={`px-3 py-2 border-t sidebar-border flex items-center ${
          collapsed ? 'justify-center flex-col gap-1.5' : 'justify-between gap-1'
        } flex-shrink-0`}
      >
        {!collapsed && <span className="text-[11px] font-semibold text-muted">Язык / Til:</span>}
        <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>
          {(['ru', 'uz', 'en'] as const).map((lng) => {
            const active = i18n.language === lng;
            return (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                title={lng.toUpperCase()}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase transition-colors cursor-pointer ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-white/5 text-muted hover:text-app'
                }`}
              >
                {lng}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Профиль администратора (клик открывает /profile) ─── */}
      <div className="px-2.5 pb-3 pt-1.5 flex-shrink-0">
        <div
          onClick={() => navigate('/profile')}
          className={`
            flex items-center ${collapsed ? 'justify-center p-1.5' : 'gap-2.5 p-2'} rounded-xl cursor-pointer
            transition-all duration-150
            ${
              location.pathname === '/profile'
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-500/30'
                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
            }
          `}
          title={`Профиль: ${user?.name || 'Администратор'}`}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-500/30"
            />
          ) : (
            <DefaultAvatar name={user?.name || 'Админ'} />
          )}

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-app truncate">{user?.name || 'Администратор'}</div>
                <div className="text-[10px] text-muted truncate">
                  {roleTitles[user?.adminRole || 'SUPER_ADMIN'] || 'Администратор'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                title="Выйти"
                className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150 flex-shrink-0 cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;