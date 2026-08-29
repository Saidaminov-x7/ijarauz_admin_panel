// src/pages/ModerationKanbanPage.tsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getKanbanBoardApi } from '../lib/extendedAdminApi';
import { api } from '../lib/axios';
import { Check, X, Edit3, MapPin, User } from 'lucide-react';

const ModerationKanbanPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'kanban-board'],
    queryFn: getKanbanBoardApi,
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      await api.patch(`/admin/listings/${id}/moderation`, {
        moderationStatus: status,
        moderationNote: note,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kanban-board'] });
    },
  });

  const columns = [
    { key: 'PENDING', title: 'Ожидают проверки', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
    { key: 'CHANGES_REQUESTED', title: 'Запрошены правки', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
    { key: 'REJECTED', title: 'Отклоненные', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
    { key: 'APPROVED_VERIFIED', title: 'Проверено Ijarauz', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
  ];

  return (
    <Layout title="Канбан-доска модерации объявлений">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Быстрая обработка входящих объявлений. Одобряйте, отклоняйте или запрашивайте правки в 1 клик.
        </p>

        {isLoading ? (
          <div className="p-12 text-center text-muted">Загрузка доски модерации...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const items = data ? (data as any)[col.key] || [] : [];
              return (
                <div key={col.key} className="bg-gray-100 dark:bg-white/5 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px]">
                  {/* Заголовок колонки */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-app uppercase tracking-wide">{col.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badge}`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Список карточек */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className="card p-3 shadow-xs hover:shadow-md transition-shadow flex flex-col gap-2 cursor-pointer border border-app"
                        onClick={() => navigate(`/listings/${item.id}`)}
                      >
                        <div className="flex gap-2">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0].url || item.images[0].secure_url}
                              alt={item.title}
                              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center text-xs text-muted">
                              Нет фото
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-app truncate">{item.title}</h4>
                            <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                              {Number(item.price).toLocaleString()} сум
                            </div>
                            <div className="text-[11px] text-muted flex items-center gap-1 mt-1 truncate">
                              <MapPin size={10} /> {item.city}, {item.district}
                            </div>
                          </div>
                        </div>

                        {/* Автор */}
                        <div className="pt-2 border-t border-app flex items-center justify-between text-[11px] text-muted">
                          <span className="truncate flex items-center gap-1">
                            <User size={10} /> {item.owner?.name || 'Пользователь'}
                          </span>
                          {item.owner?.verified && (
                            <span className="text-emerald-500 font-medium">Verified</span>
                          )}
                        </div>

                        {/* Кнопки быстрых действий */}
                        <div className="flex gap-1 pt-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          {col.key !== 'APPROVED_VERIFIED' && (
                            <button
                              type="button"
                              title="Одобрить"
                              onClick={() => moderateMutation.mutate({ id: item.id, status: 'APPROVED' })}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {col.key !== 'CHANGES_REQUESTED' && (
                            <button
                              type="button"
                              title="Запросить правки"
                              onClick={() => moderateMutation.mutate({ id: item.id, status: 'CHANGES_REQUESTED', note: 'Требуется исправить описание или фото' })}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                          {col.key !== 'REJECTED' && (
                            <button
                              type="button"
                              title="Отклонить"
                              onClick={() => moderateMutation.mutate({ id: item.id, status: 'REJECTED', note: 'Нарушение правил платформы' })}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50"
                            >
                              <X size={14} />
                            </button>
                          )}
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
