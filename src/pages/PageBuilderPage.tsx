import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PageBuilder from '../components/PageBuilder/PageBuilder';
import { PuckEditor } from '../components/PageBuilder/PuckEditor';

// Названия страниц для отображения в заголовке
const PAGE_TITLES: Record<string, string> = {
  home: 'Главная страница',
  catalog: 'Каталог недвижимости',
  listing: 'Страница объявления',
  profile: 'Профиль пользователя',
  favorites: 'Избранные объявления',
  chat: 'AI-помощник и чаты',
  about: 'О компании',
  privacy: 'Политика конфиденциальности',
  terms: 'Условия использования',
  maintenance: 'Технические работы',
};

const PageBuilderPage: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'blocks' | 'visual'>('blocks');

  if (!pageKey) {
    return (
      <Layout title="Страница не найдена">
        <div className="card text-center py-8">
          <p className="text-muted mb-4">Не указан тип страницы</p>
          <button onClick={() => navigate('/pages')} className="btn-primary text-sm">
            Вернуться ко всем страницам
          </button>
        </div>
      </Layout>
    );
  }

  const title = PAGE_TITLES[pageKey] || `Страница: ${pageKey}`;

  return (
    <Layout title={`Конструктор: ${title}`}>
      <div className="space-y-5">
        {/* Переключатель режимов конструктора */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-surface border border-app shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('blocks')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'blocks'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              📑 Редактор блоков и текстов
            </button>
            <button
              onClick={() => setMode('visual')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'visual'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-muted hover:text-app hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              🎨 Визуальный Drag & Drop холст
            </button>
          </div>

          <a
            href={`https://ijarauz.vercel.app/${pageKey === 'home' ? '' : pageKey}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors"
          >
            <span>Посмотреть на сайте</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>

        {/* Контент активного режима */}
        {mode === 'blocks' ? (
          <PageBuilder pageKey={pageKey} />
        ) : (
          <PuckEditor pageKey={pageKey} />
        )}
      </div>
    </Layout>
  );
};

export default PageBuilderPage;