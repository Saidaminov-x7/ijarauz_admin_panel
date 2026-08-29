// src/pages/ReportsPage.tsx
// Страница управления жалобами на объявления

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Building,
  Calendar,
} from 'lucide-react';
import Layout from '../components/Layout';
import {
  getReportsApi,
  updateReportStatusApi,
  type ReportItem,
  type ReportStatus,
} from '../lib/listingsApi';
import { Button, Tabs, Pagination, Badge, Card, EmptyState } from '../components/ui';

type TabKey = 'ALL' | 'OPEN' | 'RESOLVED' | 'DISMISSED';

const TABS = [
  { id: 'ALL' as const, label: 'Все жалобы' },
  { id: 'OPEN' as const, label: 'Открытые (требуют внимания)' },
  { id: 'RESOLVED' as const, label: 'Решённые' },
  { id: 'DISMISSED' as const, label: 'Отклонённые' },
];

const REASON_LABELS: Record<string, string> = {
  SCAM: '⚠️ Мошенничество / Скам',
  ALREADY_RENTED: '🔒 Уже сдано',
  WRONG_PRICE: '💰 Неверная цена',
  WRONG_PHOTOS: '🖼️ Чужие или фейковые фото',
  DUPLICATE: '📑 Дубликат объявления',
  REALTOR: '👔 Скрытый риелтор / Агентство',
  OTHER: 'ℹ️ Другая причина',
};

export const ReportsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = (searchParams.get('tab') as TabKey) || 'OPEN';
  const page = Number(searchParams.get('page')) || 1;
  const [pageSize, setPageSize] = useState(10);

  const updateParam = (key: string, value: string | number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value !== undefined && value !== '' && value !== null) {
        next.set(key, String(value));
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const currentStatus = activeTab === 'ALL' ? undefined : (activeTab as ReportStatus);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'reports', activeTab, page, pageSize],
    queryFn: () =>
      getReportsApi({
        status: currentStatus,
        page,
        limit: pageSize,
      }),
  });

  const invalidateReports = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
  };

  // C1: Optimistic update для смены статуса жалоб
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReportStatus }) =>
      updateReportStatusApi(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'reports'] });
      const previousData = queryClient.getQueriesData({ queryKey: ['admin', 'reports'] });
      queryClient.setQueriesData({ queryKey: ['admin', 'reports'] }, (old: any) => {
        if (!old) return old;
        if (old.items && Array.isArray(old.items)) {
          return {
            ...old,
            items: old.items.map((r: any) => (r.id === id ? { ...r, status } : r)),
          };
        }
        return old;
      });
      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [key, val] of context.previousData) {
          queryClient.setQueryData(key, val);
        }
      }
      toast.error('Не удалось обновить статус жалобы');
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'RESOLVED'
          ? 'Жалоба отмечена как решённая'
          : 'Жалоба отклонена',
      );
    },
    onSettled: () => {
      invalidateReports();
    },
  });

  const reports: ReportItem[] = data?.items || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 1;

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="warning">Открыта</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Решена</Badge>;
      case 'DISMISSED':
        return <Badge variant="neutral">Отклонена</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Layout title="Жалобы на объявления">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-app tracking-tight">Жалобы и репорты</h1>
            <p className="text-sm text-muted mt-1">
              Обработка жалоб пользователей на подозрительные или неактуальные объявления
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            leftIcon={<RotateCcw size={14} />}
          >
            Обновить
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={(tab) => {
            updateParam('tab', tab);
            updateParam('page', 1);
          }}
        />

        {/* Reports List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-surface border border-app animate-pulse" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={32} />}
            title="Нет жалоб в этой категории"
            description="Все поступившие жалобы обработаны или список пуст"
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const firstImage = report.listing?.images?.[0]?.url;

              return (
                <Card key={report.id} padding="sm" className="space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Image */}
                      <div className="h-16 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 shrink-0 border border-app flex items-center justify-center">
                        {firstImage ? (
                          <img src={firstImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Building size={20} className="text-muted opacity-50" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-app truncate">
                            {report.listing?.title || 'Объявление'}
                          </span>
                          {getStatusBadge(report.status)}
                          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                            {REASON_LABELS[report.reason] || report.reason}
                          </span>
                        </div>

                        {report.comment && (
                          <p className="text-xs text-app mt-1 bg-surface p-2 rounded-lg border border-app">
                            &ldquo;{report.comment}&rdquo;
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-xs text-muted mt-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                          {report.reporter && (
                            <span>• Заявитель: {report.reporter.name} ({report.reporter.email})</span>
                          )}
                          {report.listing?.owner && (
                            <span>• Автор объекта: {report.listing.owner.name} ({report.listing.owner.email})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {report.status === 'OPEN' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({ id: report.id, status: 'RESOLVED' })
                            }
                            leftIcon={<CheckCircle2 size={14} />}
                          >
                            Решено
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              statusMutation.mutate({ id: report.id, status: 'DISMISSED' })
                            }
                            leftIcon={<XCircle size={14} />}
                          >
                            Отклонить
                          </Button>
                        </>
                      )}

                      <a
                        href={`https://ijara.uz/catalog/${report.listingId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-app bg-surface hover:bg-gray-50 dark:hover:bg-white/5 text-muted hover:text-app transition-colors"
                      >
                        <ExternalLink size={12} />
                        Открыть объект
                      </a>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={(p) => updateParam('page', p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            updateParam('page', 1);
          }}
        />
      </div>
    </Layout>
  );
};

export default ReportsPage;
