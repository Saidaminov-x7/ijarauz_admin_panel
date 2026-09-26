// src/pages/ProductsPage.tsx
// Каталог товаров интернет-магазина AUBRIN (Products Page)

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  ShoppingBag,
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  getAdminProductsApi,
  approveListingApi,
  rejectListingApi,
  deleteListingApi,
  type ModerationStatus,
  type AdminProduct,
} from '../lib/listingsApi';
import {
  Button,
  Modal,
  Input,
  Tabs,
  Pagination,
  Badge,
  Card,
  ConfirmDialog,
  EmptyState,
} from '../components/ui';

type TabKey = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const TABS = [
    { id: 'ALL' as const, label: 'Все товары' },
    { id: 'PENDING' as const, label: 'На модерации' },
    { id: 'APPROVED' as const, label: 'Опубликованные' },
    { id: 'REJECTED' as const, label: 'Отклонённые' },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, activeTab, search],
    queryFn: () =>
      getAdminProductsApi({
        page,
        limit: 12,
        moderationStatus: activeTab === 'ALL' ? undefined : (activeTab as ModerationStatus),
        search: search.trim() || undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: approveListingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Товар успешно одобрен и опубликован');
    },
    onError: () => toast.error('Не удалось одобрить товар'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectListingApi(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Товар отклонен');
      setRejectModalId(null);
      setRejectReason('');
    },
    onError: () => toast.error('Не удалось отклонить товар'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Товар удален');
      setDeleteModalId(null);
    },
    onError: () => toast.error('Не удалось удалить товар'),
  });

  const items = data?.items || [];
  const totalPages = data?.meta?.totalPages || 1;

  const getStatusBadge = (status: ModerationStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Опубликован</Badge>;
      case 'PENDING':
        return <Badge variant="warning">На модерации</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Отклонён</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Layout title="Товары AUBRIN (Каталог одежды)">
      <div className="space-y-5 max-w-7xl mx-auto pb-12">
        {/* Заголовок и фильтры */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-app">Управление товарами</h1>
            <p className="text-xs text-muted mt-0.5">
              Каталог брендовой одежды из Великобритании (Zara UK, ASOS, Next и др.)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Поиск по SKU или названию..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface border border-app rounded-xl text-app placeholder:text-muted focus:outline-hidden focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Вкладки */}
        <div className="border-b border-app">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab as TabKey);
              setPage(1);
            }}
          />
        </div>

        {/* Список товаров */}
        {isLoading ? (
          <div className="p-12 text-center text-muted">Загрузка каталога товаров...</div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={32} className="text-muted" />}
            title="Товары не найдены"
            description="По заданным фильтрам нет добавленных товаров"
          />
        ) : (
          <div className="space-y-3">
            {items.map((item: AdminProduct) => (
              <Card
                key={item.id}
                padding="sm"
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary-500/30 transition"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0 border border-app flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag size={24} className="text-muted opacity-40" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-app truncate">{item.title}</h3>
                      {getStatusBadge(item.moderationStatus)}
                      {item.badge && (
                        <Badge variant={item.badge === 'SALE' ? 'danger' : 'info'}>
                          {item.badge}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        {item.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap">
                      <span>Бренд: <strong className="text-app">{item.brand}</strong></span>
                      <span>• Остаток: <strong className="text-app">{item.stock} шт.</strong></span>
                      <span>• Категория: {item.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-app">
                  <div className="text-right">
                    <div className="text-base font-black text-primary-600 dark:text-primary-400">
                      {item.price.toLocaleString()} UZS
                    </div>
                    {item.oldPrice && (
                      <span className="text-xs text-muted line-through block">
                        {item.oldPrice.toLocaleString()} UZS
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.moderationStatus === 'PENDING' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => approveMutation.mutate(item.id)}
                          leftIcon={<CheckCircle2 size={14} />}
                        >
                          Одобрить
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRejectModalId(item.id)}
                          leftIcon={<XCircle size={14} />}
                        >
                          Отклонить
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteModalId(item.id)}
                      className="text-rose-500 hover:text-rose-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="pt-4 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}

        {/* Модалка отклонения */}
        <Modal
          isOpen={!!rejectModalId}
          onClose={() => setRejectModalId(null)}
          title="Отклонить публикацию товара"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted">
              Укажите причину отклонения для менеджера, добавившего товар.
            </p>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Причина отклонения (неверный SKU, ссылка и т.д.)..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setRejectModalId(null)}>
                Отмена
              </Button>
              <Button
                variant="danger"
                disabled={!rejectReason.trim()}
                onClick={() =>
                  rejectModalId &&
                  rejectMutation.mutate({ id: rejectModalId, reason: rejectReason })
                }
              >
                Отклонить товар
              </Button>
            </div>
          </div>
        </Modal>

        {/* Подтверждение удаления */}
        <ConfirmDialog
          isOpen={!!deleteModalId}
          title="Удалить товар"
          message="Вы уверены, что хотите удалить товар? Он перестанет отображаться в каталоге интернет-магазина."
          confirmLabel="Удалить"
          variant="danger"
          onConfirm={() => {
            if (deleteModalId) deleteMutation.mutate(deleteModalId);
          }}
          onClose={() => setDeleteModalId(null)}
        />
      </div>
    </Layout>
  );
};

export default ProductsPage;
