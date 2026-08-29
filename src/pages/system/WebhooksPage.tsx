// src/pages/system/WebhooksPage.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../../components/Layout';
import { getWebhooksApi, createWebhookApi, deleteWebhookApi } from '../../lib/extendedAdminApi';
import { Webhook, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const WebhooksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState('ALL');

  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['admin', 'webhooks'],
    queryFn: getWebhooksApi,
  });

  const createMutation = useMutation({
    mutationFn: createWebhookApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
      setIsOpenModal(false);
      setName('');
      setUrl('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWebhookApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'webhooks'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    createMutation.mutate({
      name,
      url,
      events: [event],
    });
  };

  return (
    <Layout title="Webhooks & Telegram-алерты">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Настройте отправку мгновенных HTTP вебхуков или оповещений в Telegram-чат модераторов при обнаружении скама, жалобах и критических ошибках.
          </p>
          <button
            type="button"
            onClick={() => setIsOpenModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} /> Добавить вебхук
          </button>
        </div>

        {/* Список вебхуков */}
        <div className="card p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted">Загрузка вебхуков...</div>
          ) : !webhooks || webhooks.length === 0 ? (
            <div className="p-8 text-center text-muted">Вебхуков пока не настроено</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-app text-xs text-muted uppercase">
                  <tr>
                    <th className="p-3">Название</th>
                    <th className="p-3">URL назначения</th>
                    <th className="p-3">События</th>
                    <th className="p-3">Статус</th>
                    <th className="p-3">Дата добавления</th>
                    <th className="p-3 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3 font-semibold text-app flex items-center gap-2">
                        <Webhook size={16} className="text-teal-500" />
                        {w.name}
                      </td>
                      <td className="p-3 font-mono text-xs text-muted max-w-xs truncate">{w.url}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {w.events.map((ev, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/10 font-mono">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                          Активен
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted">
                        {format(new Date(w.createdAt), 'd MMM yyyy, HH:mm', { locale: ru })}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(w.id)}
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
              <h3 className="text-lg font-bold text-app mb-4">Подключить Webhook</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Название интеграции</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Telegram Alert Bot / Zapier"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">HTTP Webhook URL</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.telegram.org/... или https://hooks.zapier.com/..."
                    className="input font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1">Тип событий</label>
                  <select
                    value={event}
                    onChange={(e) => setEvent(e.target.value)}
                    className="input"
                  >
                    <option value="ALL">Все критические события</option>
                    <option value="FRAUD_DETECTED">Высокий риск скама (Fraud Score &gt; 75%)</option>
                    <option value="NEW_REPORT">Новая жалоба от пользователя</option>
                    <option value="SYSTEM_ERROR">Системные ошибки фронтенда/бэкенда</option>
                    <option value="NEW_PAYMENT">Оплата продвижения</option>
                  </select>
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
                    {createMutation.isPending ? 'Сохранение...' : 'Подключить'}
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

export default WebhooksPage;
