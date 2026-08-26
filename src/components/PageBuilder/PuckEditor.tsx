// src/components/PageBuilder/PuckEditor.tsx
// Интерактивный Drag & Drop визуальный конструктор страниц на базе Puck

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puck, type Data } from '@measured/puck';
import '@measured/puck/dist/index.css';
import { puckConfig } from '../../config/puck.config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPageSectionsApi, createPageSectionApi, deletePageSectionApi, updatePageSectionApi } from '../../lib/pageSectionsApi';

interface PuckEditorProps {
  pageKey: string;
}

export const PuckEditor: React.FC<PuckEditorProps> = ({ pageKey }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 1. Получаем секции из бэкенда
  const { data: dbSections = [], isLoading } = useQuery({
    queryKey: ['admin', 'page-sections', pageKey],
    queryFn: () => getPageSectionsApi(pageKey),
  });

  // 2. Преобразуем формат БД в Puck Data
  const initialData: Data = React.useMemo(() => {
    if (!dbSections || dbSections.length === 0) {
      if (pageKey === 'maintenance') {
        return {
          content: [
            {
              type: 'TextBlock',
              props: {
                id: 'maint-1',
                title: '🛠️ Технические работы',
                content: 'Сайт временно недоступен в связи с плановым техническим обслуживанием.\nМы скоро вернемся!',
                align: 'center',
              },
            },
            {
              type: 'ContactInfo',
              props: {
                id: 'maint-2',
                title: 'Служба экстренной поддержки',
                email: 'support@ijarauz.uz',
                phone: '+998 71 200-00-00',
                address: 'г. Ташкент, Узбекистан',
              },
            },
          ],
          root: { props: { title: 'Технические работы' } },
        };
      }

      if (pageKey === 'about') {
        return {
          content: [
            {
              type: 'TextBlock',
              props: {
                id: 'about-1',
                title: 'О сервисе Ijarauz',
                content: 'Ijarauz — это современная национальная платформа для безопасной и удобной аренды недвижимости в Узбекистане без комиссий и посредников.',
                align: 'left',
              },
            },
            {
              type: 'Benefits',
              props: {
                id: 'about-2',
                title: 'Наши ценности',
                item1Title: 'Безопасность',
                item1Text: 'Проверка каждого собственника и объекта',
                item2Title: 'Скорость',
                item2Text: 'Удобный поиск по карте и мгновенные уведомления',
                item3Title: 'Честность',
                item3Text: 'Никаких скрытых платежей и фейковых объявлений',
              },
            },
            {
              type: 'ContactInfo',
              props: {
                id: 'about-3',
                title: 'Наши контакты',
                email: 'support@ijarauz.uz',
                phone: '+998 71 200-00-00',
                address: 'г. Ташкент, Узбекистан',
              },
            },
          ],
          root: { props: { title: 'О нас' } },
        };
      }

      if (pageKey === 'catalog') {
        return {
          content: [
            {
              type: 'HeroSearch',
              props: {
                id: 'cat-hero',
                title: 'Каталог проверенной аренды',
                subtitle: 'Все актуальные квартиры, дома и коммерческая недвижимость',
                showSearch: true,
                searchPlaceholder: 'Город, район, ориентир или метро...',
              },
            },
            {
              type: 'Categories',
              props: {
                id: 'cat-types',
                title: 'Категории недвижимости',
              },
            },
            {
              type: 'PopularListings',
              props: {
                id: 'cat-popular',
                title: 'Рекомендуемые предложения',
                limit: 6,
                viewAllText: 'Все объекты',
              },
            },
          ],
          root: { props: { title: 'Каталог' } },
        };
      }

      // Default for home and other pages
      return {
        content: [
          { type: 'HeroSearch', props: { id: 'hero-1', title: 'Аренда жилья в Узбекистане без посредников', subtitle: 'Найдите идеальную квартиру, дом или комнату напрямую от собственников', showSearch: true, searchPlaceholder: 'Район, метро, улица или город...' } },
          { type: 'Benefits', props: { id: 'benefits-1', title: 'Почему выбирают ijarauz' } },
          { type: 'PopularListings', props: { id: 'pop-1', title: 'Популярные предложения', limit: 6, viewAllText: 'Смотреть все' } },
          { type: 'CtaBanner', props: { id: 'cta-1', title: 'Сдайте жильё выгодно и быстро', buttonText: 'Разместить объявление', buttonLink: '/add-listing' } },
          { type: 'Categories', props: { id: 'cat-1', title: 'Категории недвижимости' } },
        ],
        root: { props: { title: pageKey } },
      };
    }

    const puckContent = dbSections
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((sec) => {
        let type = 'TextBlock';
        if (sec.sectionType === 'HERO_SEARCH') type = 'HeroSearch';
        else if (sec.sectionType === 'BENEFITS') type = 'Benefits';
        else if (sec.sectionType === 'POPULAR_LISTINGS') type = 'PopularListings';
        else if (sec.sectionType === 'CTA_BANNER') type = 'CtaBanner';
        else if (sec.sectionType === 'CATEGORIES') type = 'Categories';
        else if (sec.sectionType === 'TEXT_BLOCK') type = 'TextBlock';
        else if (sec.sectionType === 'FAQ_ACCORDION') type = 'FaqAccordion';
        else if (sec.sectionType === 'CONTACT_INFO') type = 'ContactInfo';

        return {
          type,
          props: {
            id: sec.id,
            ...(sec.content || {}),
          },
        };
      });

    return {
      content: puckContent,
      root: { props: { title: pageKey } },
    };
  }, [dbSections, pageKey]);

  // 3. Сохранение данных в БД
  const saveMutation = useMutation({
    mutationFn: async (puckData: Data) => {
      // Для каждой секции Puck сохраняем/обновляем в БД
      const existingIds = new Set(dbSections.map((s) => s.id));
      const currentIds = new Set<string>();

      for (let i = 0; i < (puckData.content || []).length; i++) {
        const item = puckData.content[i];
        let dbType = 'TEXT_BLOCK';
        if (item.type === 'HeroSearch') dbType = 'HERO_SEARCH';
        else if (item.type === 'Benefits') dbType = 'BENEFITS';
        else if (item.type === 'PopularListings') dbType = 'POPULAR_LISTINGS';
        else if (item.type === 'CtaBanner') dbType = 'CTA_BANNER';
        else if (item.type === 'Categories') dbType = 'CATEGORIES';
        else if (item.type === 'TextBlock') dbType = 'TEXT_BLOCK';
        else if (item.type === 'FaqAccordion') dbType = 'FAQ_ACCORDION';
        else if (item.type === 'ContactInfo') dbType = 'CONTACT_INFO';

        const rawProps = (item.props || {}) as Record<string, any>;
        const secId = typeof rawProps.id === 'string' && rawProps.id.length > 10 ? rawProps.id : null;

        if (secId && existingIds.has(secId)) {
          currentIds.add(secId);
          await updatePageSectionApi(secId, {
            title: rawProps.title || item.type,
            order: i,
            isVisible: true,
            content: rawProps,
          });
        } else {
          const created = await createPageSectionApi({
            pageKey,
            sectionType: dbType,
            title: rawProps.title || item.type,
            order: i,
            isVisible: true,
            content: rawProps,
          });
          if (created?.id) currentIds.add(created.id);
        }
      }

      // Удаляем секции, которых больше нет в Puck
      for (const oldSec of dbSections) {
        if (!currentIds.has(oldSec.id)) {
          await deletePageSectionApi(oldSec.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    },
  });

  const handleSave = async (data: Data) => {
    await saveMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted">Загрузка визуального конструктора Puck...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Верхняя панель с кнопкой Назад и уведомлением */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pages')}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-app bg-surface hover:bg-gray-100 dark:hover:bg-white/5 text-muted hover:text-app transition-colors shadow-sm"
            title="Назад ко всем страницам"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-app">Puck Визуальный конструктор: /{pageKey}</h1>
            <p className="text-xs text-muted">
              Перетаскивайте блоки из левой панели, редактируйте текст справа и нажмите «Сохранить»
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-sm font-semibold border border-teal-500/30 flex items-center gap-2 animate-in fade-in">
            <span>✅</span> Изменения успешно сохранены в базе данных!
          </div>
        )}
      </div>

      {/* Puck Редактор */}
      <div className="h-[calc(100vh-140px)] w-full rounded-2xl overflow-hidden border border-app shadow-xl bg-surface">
        <Puck
          config={puckConfig}
          data={initialData}
          onPublish={handleSave}
        />
      </div>
    </div>
  );
};
