// src/components/Sidebar/Sidebar.tsx
// Боковое меню с аккордеон-выпадающими списками (dropdown) и профилем администратора

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logoutApi } from '../../lib/authApi';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSiteSettingsApi } from '../../lib/siteSettingsApi';
import { useTranslation } from 'react-i18next';

// ─── Иконки ─────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const PagesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const MediaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

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

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const { data: settings } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getSiteSettingsApi,
  });

  const isSuperAdmin = user?.adminRole === 'SUPER_ADMIN';

  // Состояния раскрытия выпадающих списков (аккордеонов)
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    pages: false,
    analytics: false,
    settings: false,
  });

  // Автоматически раскрываем родительский аккордеон, если активен дочерний роут
  useEffect(() => {
    const path = location.pathname;
    setOpenSections((prev) => ({
      pages: prev.pages || path.startsWith('/pages'),
      analytics: prev.analytics || path.startsWith('/analytics'),
      settings: prev.settings || path.startsWith('/settings'),
    }));
  }, [location.pathname]);

  const toggleSection = (key: string) => {
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

  return (
    <aside
      className="
        flex flex-col h-screen w-64 flex-shrink-0
        sidebar-bg sidebar-border border-r
        transition-colors duration-200 select-none
      "
    >
      {/* ─── Логотип ─── */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b sidebar-border flex-shrink-0">
        <img
          src={settings?.logoUrl || '/logotip.png'}
          alt="Ijarauz Admin"
          className="h-8 w-auto object-contain"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logotip.png';
          }}
        />
      </div>

      {/* ─── Навигация ─── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Главная */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0"><HomeIcon /></span>
          <span>Главная</span>
        </NavLink>

        {/* Объявления */}
        <NavLink
          to="/listings"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0"><ListIcon /></span>
          <span>Объявления</span>
        </NavLink>

        {/* Жалобы */}
        <NavLink
          to="/reports"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span>Жалобы</span>
        </NavLink>

        {/* Заявки на просмотр */}
        <NavLink
          to="/viewing-requests"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <span>Заявки на просмотр</span>
        </NavLink>

        {/* Пользователи */}
        <NavLink
          to="/users"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0"><UsersIcon /></span>
          <span>Пользователи</span>
        </NavLink>

        {/* Медиа-библиотека */}
        <NavLink
          to="/media"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150 cursor-pointer
            ${
              isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
            }
          `}
        >
          <span className="flex-shrink-0"><MediaIcon /></span>
          <span>Медиа-библиотека</span>
        </NavLink>

        {/* ─── Страницы сайта (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('pages')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/pages')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="flex-shrink-0"><PagesIcon /></span>
            <span>Страницы сайта</span>
            <ChevronDownIcon isOpen={openSections.pages} />
          </button>

          {openSections.pages && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <NavLink
                to="/pages"
                end
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Все страницы сайта
              </NavLink>
              <NavLink
                to="/pages/home/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Главная (/home)
              </NavLink>
              <NavLink
                to="/pages/catalog/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Каталог (/catalog)
              </NavLink>
              <NavLink
                to="/pages/about/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                О нас (/about)
              </NavLink>
              <NavLink
                to="/pages/maintenance/builder"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Техобслуживание (/maintenance)
              </NavLink>
            </div>
          )}
        </div>

        {/* ─── Аналитика (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('analytics')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/analytics')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="flex-shrink-0"><AnalyticsIcon /></span>
            <span>Аналитика</span>
            <ChevronDownIcon isOpen={openSections.analytics} />
          </button>

          {openSections.analytics && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <NavLink
                to="/analytics"
                end
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Обзор
              </NavLink>
              <NavLink
                to="/analytics/traffic"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
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
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
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
                to="/analytics/export"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
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

        {/* ─── Настройки (Dropdown) ─── */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150 cursor-pointer
              ${
                location.pathname.startsWith('/settings')
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10'
                  : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-app'
              }
            `}
          >
            <span className="flex-shrink-0"><SettingsIcon /></span>
            <span>Настройки</span>
            <ChevronDownIcon isOpen={openSections.settings} />
          </button>

          {openSections.settings && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <NavLink
                to="/settings/general"
                className={({ isActive }) => `
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
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
                  block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                      : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                  }
                `}
              >
                Настройки приложения
              </NavLink>
              {/* Пункт "Внешний вид" виден ТОЛЬКО для SUPER_ADMIN */}
              {isSuperAdmin && (
                <NavLink
                  to="/settings/appearance"
                  className={({ isActive }) => `
                    block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                        : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  Внешний вид
                </NavLink>
              )}
              {/* Пункт "Сотрудники и роли" виден ТОЛЬКО для SUPER_ADMIN */}
              {isSuperAdmin && (
                <NavLink
                  to="/settings/staff"
                  className={({ isActive }) => `
                    block px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/20 font-semibold'
                        : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }
                  `}
                >
                  Сотрудники и роли
                </NavLink>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ─── Переключатель языка (RU/UZ/EN) ─── */}
      <div className="px-3 py-2 border-t sidebar-border flex items-center justify-between gap-1 flex-shrink-0">
        <span className="text-[11px] font-semibold text-muted">Язык / Til:</span>
        <div className="flex items-center gap-1">
          {(['ru', 'uz', 'en'] as const).map((lng) => {
            const active = i18n.language === lng;
            return (
              <button
                key={lng}
                type="button"
                onClick={() => i18n.changeLanguage(lng)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase transition-colors ${
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
      <div className="px-3 pb-4 pt-2 flex-shrink-0">
        <div
          onClick={() => navigate('/profile')}
          className={`
            flex items-center gap-2.5 p-2 rounded-xl cursor-pointer
            transition-all duration-150
            ${
              location.pathname === '/profile'
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-500/30'
                : 'hover:bg-gray-100 dark:hover:bg-white/5 border border-transparent'
            }
          `}
          title="Открыть профиль"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-500/30"
            />
          ) : (
            <DefaultAvatar name={user?.name || 'Админ'} />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-app truncate">{user?.name || 'Администратор'}</div>
            <div className="text-[10px] text-muted truncate">
              {roleTitles[user?.adminRole || 'SUPER_ADMIN'] || 'Администратор'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Выйти"
            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-150 flex-shrink-0 cursor-pointer"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;