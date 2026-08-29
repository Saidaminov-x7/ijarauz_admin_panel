// src/pages/ViewingRequestsPage.tsx

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import { getViewingRequestsApi, updateViewingStatusApi, type ViewingRequestItem, type ViewingStatus } from '../lib/listingsApi';
import { toast } from 'sonner';
import { Calendar, CheckCircle2, XCircle, Clock, User, ExternalLink } from 'lucide-react';

const ViewingRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin', 'viewing-requests'],
    queryFn: getViewingRequestsApi,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ViewingStatus }) =>
      updateViewingStatusApi(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'viewing-requests'] });
      const previous = queryClient.getQueryData<ViewingRequestItem[]>(['admin', 'viewing-requests']);
      if (previous) {
        queryClient.setQueryData<ViewingRequestItem[]>(['admin', 'viewing-requests'], (old) =>
          old ? old.map((item) => (item.id === id ? { ...item, status } : item)) : [],
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin', 'viewing-requests'], context.previous);
      }
      toast.error('Не удалось обновить статус заявки');
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'CONFIRMED'
          ? 'Заявка подтверждена'
          : variables.status === 'DECLINED'
          ? 'Заявка отклонена'
          : 'Статус заявки обновлён',
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'viewing-requests'] });
    },
  });

  const statusBadge = (status: ViewingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-full"><CheckCircle2 size={13} /> Подтверждена</span>;
      case 'DECLINED':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 px-2.5 py-1 rounded-full"><XCircle size={13} /> Отклонена</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-2.5 py-1 rounded-full"><CheckCircle2 size={13} /> Просмотр завершён</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2.5 py-1 rounded-full"><Clock size={13} /> В ожидании</span>;
    }
  };

  return (
    <Layout title="Заявки на просмотр">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">
            Всего заявок на просмотр объектов: <strong>{requests.length}</strong>
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted">Загрузка заявок...</div>
        ) : requests.length === 0 ? (
          <div className="card p-12 text-center text-muted">Заявок на просмотр пока нет</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((item: ViewingRequestItem) => (
              <div key={item.id} className="card space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {item.listing.title}
                    </span>
                    <div className="text-[11px] text-muted mt-0.5">
                      Дата создания: {new Date(item.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div>{statusBadge(item.status)}</div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-app font-medium">
                    <User size={13} className="text-muted" />
                    <span>Заявитель: <strong>{item.requester.name}</strong> ({item.requester.phone || item.requester.email})</span>
                  </div>
                  {item.preferredDate && (
                    <div className="text-stone-700 dark:text-stone-300">
                      Желаемая дата: <strong>{new Date(item.preferredDate).toLocaleString('ru-RU')}</strong>
                    </div>
                  )}
                  {item.message && (
                    <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 text-muted text-[11px] italic">
                      "{item.message}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {item.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, status: 'CONFIRMED' })}
                        className="btn btn-sm btn-emerald text-xs"
                      >
                        Подтвердить
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ id: item.id, status: 'DECLINED' })}
                        className="btn btn-sm btn-rose text-xs"
                      >
                        Отклонить
                      </button>
                    </>
                  )}
                  {item.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: item.id, status: 'COMPLETED' })}
                      className="btn btn-sm btn-secondary text-xs"
                    >
                      Завершить просмотр
                    </button>
                  )}
                  <a
                    href={`/catalog/${item.listingId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ghost text-xs inline-flex items-center gap-1"
                  >
                    Объект <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewingRequestsPage;
