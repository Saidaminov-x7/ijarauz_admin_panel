// src/pages/ListingsPage.tsx
// Страница модерации объявлений — табы, карточки, кнопки одобрить/отклонить/правки

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import Badge, { getModerationBadge } from '../components/Badge/Badge';
import { Dropdown, DropdownItem } from '../components/Dropdown';
import {
  getAdminListingsApi,
  approveListingApi,
  rejectListingApi,
  requestChangesApi,
  deleteListingApi,
  type ModerationStatus,
} from '../lib/listingsApi';
import { getSiteSettingsApi } from '../lib/siteSettingsApi';

// ─── Типы табов ──────────────────────────────────────────────────────────────

type TabKey = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

const TABS: { key: TabKey; label: string; status?: ModerationStatus }[] = [
  { key: 'ALL', label: 'Все' },
  { key: 'PENDING', label: 'Ожидают', status: 'PENDING' },
  { key: 'APPROVED', label: 'Одобрены', status: 'APPROVED' },
  { key: 'REJECTED', label: 'Отклонены', status: 'REJECTED' },
  { key: 'CHANGES_REQUESTED', label: 'Правки', status: 'CHANGES_REQUESTED' },
];

// ─── Компонент карточки объявления ───────────────────────────────────────────

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: string;
    city: string;
    district: string;
    area: string;
    rooms: number;
    moderationStatus: ModerationStatus;
    moderationNote: string | null;
    createdAt: string;
    owner: { id: string; name: string; phone: string };
    images: { id: string; url: string }[];
  };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing, onApprove, onReject, onRequestChanges, onDelete, isLoading,
}) => {
  const badge = getModerationBadge(listing.moderationStatus);
  const price = parseFloat(listing.price);
  const priceUsd = Math.round(price / 12500); // ~курс

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = listing.images[0]?.url
    ? (listing.images[0].url.startsWith('http') ? listing.images[0].url : `${API_URL}${listing.images[0].url}`)
    : null;

  return (
    <div className="card animate-fade-in">
      <div className="flex gap-4">
        {/* Фото */}
        <div className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5">
          {imageUrl ? (
            <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-muted">🏠</div>
          )}
        </div>

        {/* Основная информация */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-app leading-snug">
                {listing.title.replace('•', '·')}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                ID: LST-{listing.id.slice(-4).toUpperCase()} &nbsp;•&nbsp;
                Разместил: {listing.owner.name} ({listing.owner.phone}) &nbsp;•&nbsp;
                {new Date(listing.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold text-primary-500">
                {priceUsd.toLocaleString()} у.е. / месяц
              </div>
              <Badge variant={badge.variant} className="mt-1">
                {badge.label}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted mt-2 line-clamp-2">{listing.description}</p>

          {/* Причина отклонения */}
          {listing.moderationNote && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
              💬 {listing.moderationNote}
            </p>
          )}

          {/* Кнопки действий (только для ожидающих) */}
          {listing.moderationStatus === 'PENDING' && (
            <div className="flex items-center gap-2 mt-3">
              <button
                id={`approve-${listing.id}`}
                onClick={() => onApprove(listing.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
              >
                Одобрить
              </button>
              <button
                id={`reject-${listing.id}`}
                onClick={() => onReject(listing.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                Отклонить
              </button>
              <button
                id={`changes-${listing.id}`}
                onClick={() => onRequestChanges(listing.id)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-app text-app hover:bg-gray-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Запросить правки
              </button>
            </div>
          )}
        </div>

        {/* Кнопка удаления */}
        <button
          onClick={() => onDelete(listing.id)}
          className="flex-shrink-0 p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all self-start"
          title="Удалить объявление"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Модалка для причины ──────────────────────────────────────────────────────

interface ReasonModalProps {
  title: string;
  placeholder: string;
  onConfirm: (reason: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const ReasonModal: React.FC<ReasonModalProps> = ({ title, placeholder, onConfirm, onClose, isLoading }) => {
  const [value, setValue] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md animate-fade-in">
        <h3 className="text-base font-semibold text-app mb-3">{title}</h3>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="input resize-none mb-4"
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-sm">Отмена</button>
          <button
            onClick={() => value.trim() && onConfirm(value.trim())}
            disabled={!value.trim() || isLoading}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {isLoading ? 'Отправка...' : 'Подтвердить'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Главная страница ─────────────────────────────────────────────────────────

const ListingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'viewsCount' | 'area'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modal, setModal] = useState<{ type: 'reject' | 'changes'; id: string } | null>(null);

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  const { data: settings } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: getSiteSettingsApi,
  });

  const limit = settings?.listingsPerPage || 10;

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'listings', activeTab, page, sortBy, sortOrder, limit],
    queryFn: () => getAdminListingsApi({
      moderationStatus: currentTab.status,
      page,
      limit,
      sortBy,
      sortOrder,
    }),
  });

  // Получаем счётчики для каждого таба (без лимита, чтобы получить общее количество)
  // Счётчики для каждого таба: подгружаем только meta.total (limit=1)
  const { data: allData } = useQuery({
    queryKey: ['admin', 'listings', 'ALL-count'],
    queryFn: () => getAdminListingsApi({ page: 1, limit: 1 }), // Все кроме DELETED
  });
  const { data: pendingData } = useQuery({
    queryKey: ['admin', 'listings', 'PENDING-count'],
    queryFn: () => getAdminListingsApi({ moderationStatus: 'PENDING', page: 1, limit: 1 }),
  });
  const { data: approvedData } = useQuery({
    queryKey: ['admin', 'listings', 'APPROVED-count'],
    queryFn: () => getAdminListingsApi({ moderationStatus: 'APPROVED', page: 1, limit: 1 }),
  });
  const { data: rejectedData } = useQuery({
    queryKey: ['admin', 'listings', 'REJECTED-count'],
    queryFn: () => getAdminListingsApi({ moderationStatus: 'REJECTED', page: 1, limit: 1 }),
  });
  const { data: changesData } = useQuery({
    queryKey: ['admin', 'listings', 'CHANGES_REQUESTED-count'],
    queryFn: () => getAdminListingsApi({ moderationStatus: 'CHANGES_REQUESTED', page: 1, limit: 1 }),
  });

  const tabCounts: Record<TabKey, number> = {
    ALL: allData?.meta.total ?? 0,
    PENDING: pendingData?.meta.total ?? 0,
    APPROVED: approvedData?.meta.total ?? 0,
    REJECTED: rejectedData?.meta.total ?? 0,
    CHANGES_REQUESTED: changesData?.meta.total ?? 0,
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'listings'] });

  const approveMutation = useMutation({
    mutationFn: approveListingApi,
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectListingApi(id, reason),
    onSuccess: () => { invalidate(); setModal(null); },
  });

  const changesMutation = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => requestChangesApi(id, comment),
    onSuccess: () => { invalidate(); setModal(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListingApi,
    onSuccess: invalidate,
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить объявление? Это действие необратимо.')) {
      deleteMutation.mutate(id);
    }
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending || changesMutation.isPending || deleteMutation.isPending;

  return (
    <Layout title="Модерация объявлений">
      <div className="space-y-4 max-w-5xl mx-auto">

        {/* ─── Табы и сортировка ─── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-surface border border-app rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                id={`tab-${tab.key.toLowerCase()}`}
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-muted hover:text-app'
                  }
                `}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'
                  }`}>
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4">
          <Dropdown
            trigger={
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-app bg-surface text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                {(() => {
                  switch (sortBy) {
                    case 'viewsCount': return 'По популярности';
                    case 'price': return 'По цене';
                    case 'area': return 'По площади';
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
            <DropdownItem onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); }}>
              Сначала новые
            </DropdownItem>
            <DropdownItem onClick={() => { setSortBy('createdAt'); setSortOrder('asc'); }}>
              Сначала старые
            </DropdownItem>
            <DropdownItem onClick={() => { setSortBy('viewsCount'); setSortOrder('desc'); }}>
              По популярности
            </DropdownItem>
            <DropdownItem onClick={() => { setSortBy('price'); setSortOrder('asc'); }}>
              По цене (дешевле)
            </DropdownItem>
            <DropdownItem onClick={() => { setSortBy('price'); setSortOrder('desc'); }}>
              По цене (дороже)
            </DropdownItem>
            <DropdownItem onClick={() => { setSortBy('area'); setSortOrder('desc'); }}>
              По площади (больше)
            </DropdownItem>
          </Dropdown>
          </div>
        </div>

        {/* ─── Список объявлений ─── */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-gray-200 dark:bg-white/10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📋</div>
            <p className="text-muted">Объявлений в этой категории нет</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.items.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onApprove={(id) => approveMutation.mutate(id)}
                onReject={(id) => setModal({ type: 'reject', id })}
                onRequestChanges={(id) => setModal({ type: 'changes', id })}
                onDelete={handleDelete}
                isLoading={isMutating}
              />
            ))}
          </div>
        )}

        {/* ─── Пагинация ─── */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Показано {(page - 1) * limit + 1}–{Math.min(page * limit, data.meta.total)} из {data.meta.total}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-app text-sm hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Назад
              </button>
              {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${p === page ? 'bg-primary-500 text-white' : 'border border-app hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                disabled={page === data.meta.totalPages}
                className="px-3 py-1.5 rounded-lg border border-app text-sm hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Модалки ─── */}
      {modal?.type === 'reject' && (
        <ReasonModal
          title="Причина отклонения"
          placeholder="Укажите причину отклонения объявления..."
          onConfirm={(reason) => rejectMutation.mutate({ id: modal.id, reason })}
          onClose={() => setModal(null)}
          isLoading={rejectMutation.isPending}
        />
      )}
      {modal?.type === 'changes' && (
        <ReasonModal
          title="Запрос правок"
          placeholder="Опишите, что нужно исправить в объявлении..."
          onConfirm={(comment) => changesMutation.mutate({ id: modal.id, comment })}
          onClose={() => setModal(null)}
          isLoading={changesMutation.isPending}
        />
      )}
    </Layout>
  );
};

export default ListingsPage;