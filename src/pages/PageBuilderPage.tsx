import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { PageBuilder } from '../components/PageBuilder/PageBuilder';
import { Button } from '../components/ui/Button';

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

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://ijarauz.vercel.app';

const PageBuilderPage: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();
  const navigate = useNavigate();

  if (!pageKey) {
    return (
      <Layout title="Страница не найдена">
        <div className="card text-center py-8">
          <p className="text-muted mb-4">Не указан тип страницы</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/pages')}>
            Вернуться ко всем страницам
          </Button>
        </div>
      </Layout>
    );
  }

  const title = PAGE_TITLES[pageKey] || `Страница: ${pageKey}`;

  return (
    <Layout title={`Конструктор: ${title}`}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-surface border border-app shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => navigate('/pages')}>
            <ArrowLeft size={16} /> Все страницы
          </Button>
          <a
            href={`${SITE_URL}/${pageKey === 'home' ? '' : pageKey}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/40 rounded-xl transition-colors whitespace-nowrap"
          >
            Посмотреть на сайте <ExternalLink size={14} />
          </a>
        </div>
        <PageBuilder pageKey={pageKey} />
      </div>
    </Layout>
  );
};

export default PageBuilderPage;