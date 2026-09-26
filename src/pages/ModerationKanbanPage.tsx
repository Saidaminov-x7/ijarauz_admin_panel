// src/pages/ModerationKanbanPage.tsx
// Orders Kanban Board for AUBRIN: PENDING -> CONFIRMED -> SHIPPED_FROM_UK -> IN_TRANSIT -> DELIVERED

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { getOrdersKanbanApi, updateOrderStatusApi, type OrderStatus, type AdminOrder } from '../lib/listingsApi';
import { Package, Truck, CheckCircle2, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';

const ModerationKanbanPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders-kanban'],
    queryFn: getOrdersKanbanApi,
    refetchInterval: 15000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      return updateOrderStatusApi(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders-kanban'] });
      toast.success('Статус заказа успешно обновлен');
    },
  });

  const columns: Array<{ key: OrderStatus; title: string; icon: any; color: string }> = [
    { key: 'PENDING', title: 'Новые заказы', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { key: 'CONFIRMED', title: 'Подтверждены', icon: CheckCircle2, color: 'text-blue-500 bg-blue-500/10' },
    { key: 'SHIPPED_FROM_UK', title: 'Отправлены из UK', icon: Globe, color: 'text-purple-500 bg-purple-500/10' },
    { key: 'IN_TRANSIT', title: 'В пути (Таможня/Доставка)', icon: Truck, color: 'text-indigo-500 bg-indigo-500/10' },
    { key: 'DELIVERED', title: 'Доставлены', icon: Package, color: 'text-emerald-500 bg-emerald-500/10' },
  ];

  return (
    <Layout title="Канбан заказов AUBRIN">
      <div className="space-y-4 max-w-7xl mx-auto pb-12">
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-muted">
            Управление доставкой заказов одежды из Великобритании в Узбекистан в реальном времени.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted">Загрузка канбан-доски заказов...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-start">
            {columns.map((col) => {
              const colOrders = orders.filter((o) => o.status === col.key);
              const Icon = col.icon;
              return (
                <div
                  key={col.key}
                  className="bg-gray-100/80 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-3 flex flex-col gap-3 min-h-[550px]"
                >
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${col.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-app uppercase tracking-wide">
                        {col.title}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 dark:bg-white/10 text-app">
                      {colOrders.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {colOrders.map((order: AdminOrder) => (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-surface border border-gray-200 dark:border-white/10 rounded-xl p-3.5 shadow-xs flex flex-col gap-2 transition hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary-500">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-app">
                            {order.totalPrice.toLocaleString()} UZS
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-app line-clamp-1">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-muted">{order.customerPhone}</p>
                          <p className="text-[11px] text-muted line-clamp-1">{order.city}, {order.address}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            order.riskScore >= 75
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : order.riskScore >= 25
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}>
                            Риск: {order.riskScore}/100
                          </span>

                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateStatusMutation.mutate({
                                id: order.id,
                                status: e.target.value as OrderStatus,
                              })
                            }
                            className="text-[11px] bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-app font-medium outline-hidden"
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="SHIPPED_FROM_UK">SHIPPED_FROM_UK</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ModerationKanbanPage;
