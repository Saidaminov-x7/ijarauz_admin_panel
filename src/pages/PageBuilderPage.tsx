// src/pages/PageBuilderPage.tsx
// Универсальный конструктор страниц — работает для любого pageKey

import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PageBuilder from '../components/PageBuilder/PageBuilder';

// Названия страниц для отображения в заголовке
const PAGE_TITLES: Record<string, string> = {
  home: 'Главная',
  catalog: 'Каталог',
  listing: 'Страница объявления',
  profile: 'Профиль пользователя',
  favorites: 'Избранное',
  chat: 'AI-помощник',
  maintenance: 'Технические работы',
};

const PageBuilderPage: React.FC = () => {
  const { pageKey } = useParams<{ pageKey: string }>();

  if (!pageKey) {
    return (
      <Layout title="Страница не найдена">
        <div className="card text-center py-8">
          <p className="text-muted mb-4">Не указан тип страницы</p>
        </div>
      </Layout>
    );
  }

  const title = PAGE_TITLES[pageKey] || `Страница: ${pageKey}`;

  return (
    <Layout title={`Конструктор: ${title}`}>
      <PageBuilder pageKey={pageKey} />
    </Layout>
  );
};

export default PageBuilderPage;