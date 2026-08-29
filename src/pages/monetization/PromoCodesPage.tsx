// src/pages/monetization/PromoCodesPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { getPromoCodesApi, createPromoCodeApi, deletePromoCodeApi } from '../../lib/extendedAdminApi';
import { Ticket, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PromoCodesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [maxUses, setMaxUses] = useState(100);

  const { data: promoCodes, isLoading } = useQuery({
    queryKey: ['admin', 'promo-codes'],
    queryFn: getPromoCodesApi,
  });

  const createMutation = useMutation({
    mutationFn: createPromoCodeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      setIsOpenModal(false);
      setCode('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePromoCodeApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    createMutation.mutate({
      code,
      discountPercent: Number(discountPercent),
      maxUses: Number(maxUses),
    });
  };

  return (
    <Layout title="Управление промокодами и скидками">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Создавайте промокоды на скидку для продвижения объявлений арендодателей (TOP, VIP, Срочно).
          </p>
          <button
            type="button"
            onClick={() => setIsOpenModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Создать промокод
          </button>
        </div>

        {/* Список промокодов */}
        <div className="card p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка промокодов...</div>
          ) : !promoCodes || promoCodes.length === 0 ? (
            <div className="p-8 text-center text-muted">Промокодов пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-app text-xs text-muted uppercase">
                  <tr>
                    <th className="p-3">Код</th>
                    <th className="p-3">Скидка</th>
                    <th className="p-3">Использовано</th>
                    <th className="p-3">Статус</th>
                    <th className="p-3">Дата создания</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {promoCodes.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono font-bold text-app flex items-center gap-2">
                        <Ticket size={16} className="text-teal-500" />
                        {p.code}
                      </td>
                      <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        {p.discountPercent}%
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-app">{p.usedCount}</span> / {p.maxUses}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Активен
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted">
                        {format(new Date(p.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(p.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Модалка создания */}
        {isOpenModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="card w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <h3 className="text-lg font-bold text-app mb-4">Новый промокод</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Код промокода</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER2026"
                    className="input font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Скидка (%)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted mb-1">Лимит активаций</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={maxUses}
                      onChange={(e) => setMaxUses(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenModal(false)}
                    className="btn btn-secondary"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createMutation.isPending ? 'Создание...' : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PromoCodesPage;
