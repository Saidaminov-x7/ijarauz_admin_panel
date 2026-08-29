// src/pages/monetization/RevenueAnalyticsPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { getRevenueStatsApi } from '../../lib/extendedAdminApi';
import { DollarSign, TrendingUp, Zap, Crown, Award } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const RevenueAnalyticsPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'revenue-stats'],
    queryFn: getRevenueStatsApi,
  });

  return (
    <Layout title="Финансовая аналитика и выручка (MRR)">
      <div className="space-y-6">
        {/* KPI карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold uppercase">Суммарная выручка</span>
              <DollarSign size={18} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(data?.totalRevenue ?? 0).toLocaleString()} сум
            </div>
            <div className="text-xs text-muted mt-1">Доход от платных продвижений (TOP, VIP, Срочно)</div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold uppercase">Прогнозный MRR</span>
              <TrendingUp size={18} className="text-primary-500" />
            </div>
            <div className="text-2xl font-bold text-app">
              {(data?.estimatedMRR ?? 0).toLocaleString()} сум
            </div>
            <div className="text-xs text-muted mt-1">Ориентировочный месячный доход</div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between text-muted mb-2">
              <span className="text-xs font-semibold uppercase">Активных продвижений</span>
              <Zap size={18} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-app">
              {data?.activePromotionsCount ?? 0} шт.
            </div>
            <div className="text-xs text-muted mt-1">Объявления с активным бустом прямо сейчас</div>
          </div>
        </div>

        {/* Распределение по тарифам */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xs text-muted">Тариф BASIC (50 000 сум)</div>
              <div className="text-lg font-bold text-app">{data?.tierCounts?.BASIC ?? 0} шт.</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Crown size={20} />
            </div>
            <div>
              <div className="text-xs text-muted">Тариф TOP (120 000 сум)</div>
              <div className="text-lg font-bold text-app">{data?.tierCounts?.TOP ?? 0} шт.</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-xs text-muted">Тариф URGENT (90 000 сум)</div>
              <div className="text-lg font-bold text-app">{data?.tierCounts?.URGENT ?? 0} шт.</div>
            </div>
          </div>
        </div>

        {/* Таблица продвигаемых объявлений */}
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-app">
            <h3 className="font-bold text-app text-sm">Объявления с активным продвижением</h3>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка данных...</div>
          ) : !data?.promotedListings || data.promotedListings.length === 0 ? (
            <div className="p-8 text-center text-muted">Активных платных продвижений пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-app text-xs text-muted uppercase">
                  <tr>
                    <th className="p-3">Объявление</th>
                    <th className="p-3">Тариф</th>
                    <th className="p-3">Действует до</th>
                    <th className="p-3">Дата подключения</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {data.promotedListings.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-app">{p.title}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                          {p.promotionTier}
                        </span>
                      </td>
                      <td className="p-3 text-muted font-mono text-xs">
                        {p.promotedUntil
                          ? format(new Date(p.promotedUntil), 'd MMM yyyy, HH:mm', { locale: ru })
                          : 'Бессрочно'}
                      </td>
                      <td className="p-3 text-xs text-muted">
                        {format(new Date(p.createdAt), 'd MMM yyyy', { locale: ru })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RevenueAnalyticsPage;
