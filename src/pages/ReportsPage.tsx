// src/pages/ReportsPage.tsx
// Страница управления жалобами на объявления

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RotateCcw,
  Building,
  Calendar,
  Download,
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const TABS = [
    { id: 'ALL' as const, label: t('common.all', 'Все жалобы') },
    { id: 'OPEN' as const, label: `${t('reports.open', 'Открытые')} (${t('dashboard.pendingModeration', 'требуют внимания')})` },
    { id: 'RESOLVED' as const, label: t('reports.resolved', 'Решённые') },
    { id: 'DISMISSED' as const, label: t('reports.dismissed', 'Отклонённые') },
  ];

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

  const handleExportCSV = () => {
    if (reports.length === 0) {
      toast.error(t('common.noData', 'Нет данных для экспорта'));
      return;
    }
    const headers = ['ID', 'ListingTitle', 'Reason', 'Status', 'ReporterName', 'CreatedAt'];
    const rows = reports.map((r: any) => [
      r.id,
      `"${(r.listing?.title || '').replace(/"/g, '""')}"`,
      r.reason || '',
      r.status || '',
      `"${(r.reporter?.name || '').replace(/"/g, '""')}"`,
      r.createdAt || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reports-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Экспорт жалоб завершен');
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="warning">{t('reports.open', 'Открыта')}</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">{t('reports.resolved', 'Решена')}</Badge>;
      case 'DISMISSED':
        return <Badge variant="neutral">{t('reports.dismissed', 'Отклонена')}</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <Layout title={t('reports.title', 'Жалобы на объявления')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-app tracking-tight">{t('reports.title', 'Жалобы и репорты')}</h1>
            <p className="text-sm text-muted mt-1">
              {t('reports.subtitle', 'Обработка жалоб пользователей на подозрительные или неактуальные объявления')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              leftIcon={<RotateCcw size={14} />}
            >
              {t('common.refresh', 'Обновить')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download size={14} />}
            >
              {t('common.export', 'Экспорт в CSV')}
            </Button>
          </div>
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
            <AnimatePresence mode="popLayout">
              {reports.map((report) => {
                const firstImage = report.listing?.images?.[0]?.url;

                return (
                  <motion.div
                    layout
                    key={report.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden', marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card padding="sm" className="space-y-3">
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
