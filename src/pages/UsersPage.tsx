// src/pages/UsersPage.tsx
// База пользователей — таблица с поиском, фильтрами, экспортом, пагинацией

import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge, { getUserStatusBadge, getRoleBadge } from '../components/Badge/Badge';
import {
  getAdminUsersApi,
  blockUserApi,
  unblockUserApi,
  exportUsersApi,
  type UserRole,
  type AdminUser,
} from '../lib/usersApi';
import { Dropdown, DropdownItem } from '../components/Dropdown';

// ─── Аватар ───────────────────────────────────────────────────────────────────

const UserAvatar: React.FC<{ user: AdminUser }> = ({ user }) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const initials = user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

  if (user.avatar) {
    const src = user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`;
    return <img src={src} alt={user.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />;
  }

  const colors = ['bg-teal-500', 'bg-violet-500', 'bg-amber-500', 'bg-sky-500', 'bg-rose-500'];
  const colorIndex = user.name.charCodeAt(0) % colors.length;

  return (
    <div className={`w-9 h-9 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
};

// ─── Главная страница ─────────────────────────────────────────────────────────

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showStaffOnly, setShowStaffOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email' | 'listingsCount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [blockModal, setBlockModal] = useState<{ user: AdminUser } | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Дебаунс поиска
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', debouncedSearch, roleFilter, showStaffOnly, dateFrom, dateTo, sortBy, sortOrder, page],
    queryFn: () => getAdminUsersApi({
      search: debouncedSearch || undefined,
      role: (roleFilter as UserRole) || undefined,
      isStaff: showStaffOnly,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      sortBy,
      sortOrder,
      page,
      limit: 15,
    }),
  });

  // Статистика (отдельные запросы для карточек)
  const { data: allUsersData } = useQuery({
    queryKey: ['admin', 'users', 'total'],
    queryFn: () => getAdminUsersApi({ limit: 1 })
  });
  
  // Активные пользователи (последние 30 дней)
  const { data: activeUsersData } = useQuery({
    queryKey: ['admin', 'users', 'active'],
    queryFn: () => getAdminUsersApi({
      lastActiveDays: 30,
      limit: 1
    })
  });
  
  // Активные пользователи (предыдущие 30 дней, для расчёта процентов)
  const { data: prevActiveUsersData } = useQuery({
    queryKey: ['admin', 'users', 'active-prev'],
    queryFn: () => getAdminUsersApi({
      lastActiveDays: 60,
      createdAfterDays: 30, // Только те, кто был активен в предыдущие 30 дней, но не в последние 30
      limit: 1
    })
  });
  
  // Новые пользователи (последние 30 дней)
  const { data: newUsersData } = useQuery({
    queryKey: ['admin', 'users', 'new'],
    queryFn: () => getAdminUsersApi({
      createdAfterDays: 30,
      limit: 1
    })
  });
  
  // Новые пользователи (предыдущие 30 дней, для расчёта процентов)
  const { data: prevNewUsersData } = useQuery({
    queryKey: ['admin', 'users', 'new-prev'],
    queryFn: () => getAdminUsersApi({
      createdAfterDays: 60,
      createdBeforeDays: 30,
      limit: 1
    })
  });
  
  // Заблокированные пользователи
  const { data: blockedUsersData } = useQuery({
    queryKey: ['admin', 'users', 'blocked'],
    queryFn: () => getAdminUsersApi({
      isBlocked: true,
      limit: 1
    })
  });
  
  // Заблокированные пользователи (предыдущий период)
  const { data: prevBlockedUsersData } = useQuery({
    queryKey: ['admin', 'users', 'blocked-prev'],
    queryFn: () => getAdminUsersApi({
      isBlocked: true,
      createdAfterDays: 60,
      createdBeforeDays: 30,
      limit: 1
    })
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });

  const blockMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => blockUserApi(id, reason),
    onSuccess: () => { invalidate(); setBlockModal(null); setBlockReason(''); },
  });

  const unblockMutation = useMutation({
    mutationFn: (id: string) => unblockUserApi(id),
    onSuccess: invalidate,
  });

  const handleExport = async () => {
    try {
      const blob = await exportUsersApi({ search: debouncedSearch || undefined, role: (roleFilter as UserRole) || undefined });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Ошибка при экспорте');
    }
  };

  return (
    <Layout title="База пользователей">
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* ─── Карточки метрик ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Всего пользователей',
              value: allUsersData?.meta.total ?? 0,
              className: '',
              prevValue: 0
            },
            {
              label: 'Активных',
              value: activeUsersData?.meta.total ?? 0,
              className: 'text-primary-500',
              prevValue: prevActiveUsersData?.meta.total ?? 0
            },
            {
              label: 'Новых за месяц',
              value: newUsersData?.meta.total ?? 0,
              className: 'text-primary-500',
              prevValue: prevNewUsersData?.meta.total ?? 0
            },
            {
              label: 'Заблокированных',
              value: blockedUsersData?.meta.total ?? 0,
              className: 'text-red-500',
              prevValue: prevBlockedUsersData?.meta.total ?? 0
            },
          ].map((card) => {
            const changePercent = card.prevValue > 0
              ? Math.round(((card.value - card.prevValue) / card.prevValue) * 100)
              : card.value > 0 ? 100 : 0;
            return (
              <div key={card.label} className="card">
                <div className="text-sm text-muted mb-1">{card.label}</div>
                <div className={`text-3xl font-bold ${card.className || 'text-app'}`}>
                  {card.value.toLocaleString('ru-RU')}
                </div>
                {changePercent !== 0 && (
                  <div className={`text-xs mt-1 ${changePercent > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {changePercent > 0 ? '↑' : '↓'} {Math.abs(changePercent)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ─── Фильтры ─── */}
        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Дата регистрации от */}
            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Дата регистрации от</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="input w-full"
              />
            </div>

            {/* Дата регистрации до */}
            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Дата регистрации до</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="input w-full"
              />
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Сортировка</label>
              <Dropdown
                trigger={
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-app bg-surface text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors w-full justify-between">
                    {(() => {
                      switch (sortBy) {
                        case 'name': return 'По имени';
                        case 'email': return 'По email';
                        case 'listingsCount': return 'По объявлениям';
                        default: return sortOrder === 'desc' ? 'Сначала новые' : 'Сначала старые';
                      }
                    })()}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                }
                align="right"
              >
                <DropdownItem onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); setPage(1); }}>Сначала новые</DropdownItem>
                <DropdownItem onClick={() => { setSortBy('createdAt'); setSortOrder('asc'); setPage(1); }}>Сначала старые</DropdownItem>
                <DropdownItem onClick={() => { setSortBy('name'); setSortOrder('asc'); setPage(1); }}>По имени (А-Я)</DropdownItem>
                <DropdownItem onClick={() => { setSortBy('email'); setSortOrder('asc'); setPage(1); }}>По email</DropdownItem>
                <DropdownItem onClick={() => { setSortBy('listingsCount'); setSortOrder('desc'); setPage(1); }}>По объявлениям (много)</DropdownItem>
                <DropdownItem onClick={() => { setSortBy('listingsCount'); setSortOrder('asc'); setPage(1); }}>По объявлениям (мало)</DropdownItem>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* ─── Поиск и фильтры ─── */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                id="users-search"
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Поиск по имени, email..."
                className="input pl-9 w-72"
              />
            </div>

            {/* Toggle: Администраторы / Пользователи */}
            <button
              type="button"
              onClick={() => {
                setShowStaffOnly(!showStaffOnly);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${showStaffOnly ? 'bg-primary-500 text-white' : 'border border-app hover:bg-gray-100 dark:hover:bg-white/5'}`}
            >
              <span>{showStaffOnly ? 'Персонал' : 'Пользователи'}</span>
              <div className={`w-8 h-4 rounded-full p-0.5 flex items-center ${showStaffOnly ? 'bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${showStaffOnly ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="sr-only">Переключить категорию: пользователи или персонал</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-app bg-surface text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors min-w-[160px] justify-between">
                  {roleFilter ? (
                    <Badge variant={getRoleBadge(roleFilter).variant} className="text-xs">
                      {getRoleBadge(roleFilter).label}
                    </Badge>
                  ) : 'Роль: Все'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              }
              align="right"
            >
              <DropdownItem onClick={() => { setRoleFilter(''); setPage(1); }}>Все роли</DropdownItem>
              <DropdownItem onClick={() => { setRoleFilter('LANDLORD'); setPage(1); }}>
                <Badge variant={getRoleBadge('LANDLORD').variant} className="text-xs">
                  {getRoleBadge('LANDLORD').label}
                </Badge>
              </DropdownItem>
              <DropdownItem onClick={() => { setRoleFilter('USER'); setPage(1); }}>
                <Badge variant={getRoleBadge('USER').variant} className="text-xs">
                  {getRoleBadge('USER').label}
                </Badge>
              </DropdownItem>
              <DropdownItem onClick={() => { setRoleFilter('ADMIN'); setPage(1); }}>
                <Badge variant={getRoleBadge('ADMIN').variant} className="text-xs">
                  {getRoleBadge('ADMIN').label}
                </Badge>
              </DropdownItem>
            </Dropdown>

            <button
              id="export-users-btn"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-app rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-app"
            >
              Экспорт
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── Таблица ─── */}
        <div className="card p-0 overflow-hidden bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface border-b border-app">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Имя / Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Телефон</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Роль</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Объявлений</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Дата рег.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10" />
                          <div className="space-y-1.5">
                            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
                            <div className="h-2.5 bg-gray-200 dark:bg-white/10 rounded w-32" />
                          </div>
                        </div>
                      </td>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted">
                      Пользователей не найдено
                    </td>
                  </tr>
                ) : (
                  data?.items.map((user, index) => {
                    const statusBadge = getUserStatusBadge(user);
                    const roleBadge = getRoleBadge(user.role, user.adminRole);
                    return (
                      <tr
                        key={user.id}
                        className={`transition-colors ${index % 2 === 0 ? 'bg-gray-50 dark:bg-white/5' : 'bg-surface'} border-b border-app last:border-0`}
                      >
                        <td className="px-4 py-4 leading-relaxed">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <div className="leading-relaxed">
                              <div className="font-medium text-app hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                                {user.name}
                              </div>
                              <div className="text-xs text-muted">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted leading-relaxed">{user.phone}</td>
                        <td className="px-4 py-4 leading-relaxed">
                          <Badge variant={roleBadge.variant}>{roleBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-4 text-muted leading-relaxed">{user._count.listings}</td>
                        <td className="px-4 py-4 text-muted leading-relaxed">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="px-4 py-4 leading-relaxed">
                          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                        </td>
                        <td className="px-4 py-4 leading-relaxed">
                          {user.role !== 'ADMIN' && (
                            user.isBlocked ? (
                              <button
                                onClick={() => unblockMutation.mutate(user.id)}
                                disabled={unblockMutation.isPending}
                                className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
                              >
                                Разблокировать
                              </button>
                            ) : (
                              <button
                                onClick={() => setBlockModal({ user })}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Заблокировать
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {data && data.meta.totalPages > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-app bg-surface text-sm">
              <span className="text-muted">
                Показано {Math.min((page - 1) * 15 + 1, data.meta.total)}–{Math.min(page * 15, data.meta.total)} из {data.meta.total.toLocaleString('ru-RU')} пользователей
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-app hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  Назад
                </button>
                {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${p === page ? 'bg-primary-500 text-white' : 'border border-app hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                  >
                    {p}
                  </button>
                ))}
                {data.meta.totalPages > 5 && <span className="px-2 text-muted">...</span>}
                <button
                  onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                  disabled={page === data.meta.totalPages}
                  className="px-3 py-1 rounded border border-app hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
                >
                  Вперед
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Модалка блокировки ─── */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setBlockModal(null)} />
          <div className="relative card w-full max-w-sm animate-fade-in">
            <h3 className="text-base font-semibold text-app mb-1">
              Заблокировать пользователя
            </h3>
            <p className="text-sm text-muted mb-4">{blockModal.user.name} ({blockModal.user.email})</p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Причина блокировки (необязательно)..."
              rows={3}
              className="input resize-none mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setBlockModal(null)} className="btn-ghost text-sm">Отмена</button>
              <button
                onClick={() => blockMutation.mutate({ id: blockModal.user.id, reason: blockReason || undefined })}
                disabled={blockMutation.isPending}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {blockMutation.isPending ? 'Блокировка...' : 'Заблокировать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersPage;