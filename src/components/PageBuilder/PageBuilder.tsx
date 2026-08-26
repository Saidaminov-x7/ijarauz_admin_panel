// src/components/PageBuilder/PageBuilder.tsx
// Универсальный конструктор страниц — работает для любого pageKey с поддержкой всех типов секций

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPageSectionsApi,
  updatePageSectionApi,
  reorderPageSectionsApi,
  createPageSectionApi,
  deletePageSectionApi,
  type PageSectionItem,
} from '../../lib/pageSectionsApi';

// Все поддерживаемые типы секций
export const SECTION_TYPES: Record<string, { label: string; icon: string; desc: string; defaultTitle: string }> = {
  HERO_SEARCH: {
    label: 'Поисковая строка / Главный баннер',
    icon: '🔍',
    desc: 'Главный заголовок, подзаголовок, поле поиска и быстрые фильтры',
    defaultTitle: 'Главный баннер с поиском',
  },
  BENEFITS: {
    label: 'Преимущества / Особенности',
    icon: '✨',
    desc: 'Карточки с иконками, заголовками и описанием преимуществ',
    defaultTitle: 'Преимущества',
  },
  POPULAR_LISTINGS: {
    label: 'Популярные / Рекомендуемые объявления',
    icon: '🔥',
    desc: 'Сетка популярных или рекомендованных объявлений из базы данных',
    defaultTitle: 'Популярные объявления',
  },
  CTA_BANNER: {
    label: 'Призыв к действию (CTA Баннер)',
    icon: '📢',
    desc: 'Баннер с заголовком, текстом и кнопкой перехода',
    defaultTitle: 'Баннер размещения',
  },
  CATEGORIES: {
    label: 'Категории жилья',
    icon: '🏷️',
    desc: 'Список категорий (посуточно, новостройки, студентам, комнаты)',
    defaultTitle: 'Категории жилья',
  },
  TEXT_BLOCK: {
    label: 'Текстовый блок / Описание',
    icon: '📝',
    desc: 'Свободный текстовый контент с заголовком, подзаголовком и форматированным текстом',
    defaultTitle: 'Информация',
  },
  TEAM_MEMBERS: {
    label: 'Наша команда / Эксперты',
    icon: '👥',
    desc: 'Список членов команды с именами, ролями и описанием',
    defaultTitle: 'Наша команда',
  },
  FAQ_ACCORDION: {
    label: 'Часто задаваемые вопросы (FAQ)',
    icon: '❓',
    desc: 'Список вопросов и раскрывающихся ответов',
    defaultTitle: 'Вопросы и ответы',
  },
  CONTACT_INFO: {
    label: 'Контакты и обратная связь',
    icon: '📞',
    desc: 'Email, телефон, адрес, время работы и ссылки',
    defaultTitle: 'Контакты',
  },
  CUSTOM_HTML: {
    label: 'Произвольный контент / Markdown',
    icon: '📄',
    desc: 'Универсальный блок с форматированным текстом или Markdown',
    defaultTitle: 'Дополнительный блок',
  },
};

interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: PageSectionItem | null;
  onSave: (id: string, content: Record<string, unknown>, title: string, layoutRow: number, width: number) => void;
}

const SectionEditModal: React.FC<SectionEditModalProps> = ({ isOpen, onClose, section, onSave }) => {
  if (!isOpen || !section) return null;

  const [title, setTitle] = useState(section.title || '');
  const [layoutRow, setLayoutRow] = useState(section.layoutRow || 1);
  const [width, setWidth] = useState(section.width || 12);
  const [activeLang, setActiveLang] = useState<'ru' | 'uz' | 'en'>('ru');
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setLayoutRow(section.layoutRow || 1);
      setWidth(section.width || 12);
      setContent(section.content || {});
    }
  }, [section]);

  const handleSave = () => {
    onSave(section.id, content, title, layoutRow, width);
    onClose();
  };

  // Если в content есть данные верхнего уровня или данные для активного языка
  const langObj = (content[activeLang] && typeof content[activeLang] === 'object') ? content[activeLang] : {};
  const currentLangContent = {
    ...content,
    ...langObj,
  };

  const updateField = (field: string, value: any) => {
    setContent((prev) => {
      const prevLangObj = (prev[activeLang] && typeof prev[activeLang] === 'object') ? prev[activeLang] : {};
      return {
        ...prev,
        [field]: value,
        [activeLang]: {
          ...prevLangObj,
          [field]: value,
        },
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-surface p-6 shadow-2xl border border-app z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-app">
          <div className="flex items-center gap-2">
            <span className="text-xl">{SECTION_TYPES[section.sectionType]?.icon || '📄'}</span>
            <div>
              <h3 className="text-base font-bold text-app">
                Редактирование: {title || SECTION_TYPES[section.sectionType]?.label || section.sectionType}
              </h3>
              <p className="text-xs text-muted">Тип: {section.sectionType}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-app p-1 rounded-lg">
            ✕
          </button>
        </div>

        {/* Языковые вкладки */}
        <div className="flex items-center justify-between gap-4 mb-4 p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-app">
          <span className="text-xs font-semibold text-muted">Язык контента:</span>
          <div className="flex gap-1">
            {(['ru', 'uz', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  activeLang === lang
                    ? 'bg-teal-600 text-white'
                    : 'text-muted hover:text-app hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-1.5">Название секции (для админки)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название секции"
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Строка макета (Layout Row)</label>
              <input
                type="number"
                value={layoutRow}
                onChange={(e) => setLayoutRow(Number(e.target.value))}
                min={1}
                max={10}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-1.5">Ширина (1-12 колонок)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={1}
                max={12}
                className="input w-full"
              />
            </div>
          </div>

          {/* 1. HERO_SEARCH */}
          {section.sectionType === 'HERO_SEARCH' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Главный заголовок</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Аренда жилья в Узбекистане без посредников"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Подзаголовок</label>
                <textarea
                  value={currentLangContent.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Найдите идеальную квартиру или комнату напрямую от собственников"
                  rows={2}
                  className="input w-full resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Плейсхолдер поиска</label>
                <input
                  value={currentLangContent.searchPlaceholder || ''}
                  onChange={(e) => updateField('searchPlaceholder', e.target.value)}
                  placeholder="Район, метро, улица или город..."
                  className="input w-full"
                />
              </div>
            </div>
          )}

          {/* 2. BENEFITS */}
          {section.sectionType === 'BENEFITS' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок блока</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Почему выбирают ijarauz"
                  className="input w-full"
                />
              </div>
              <label className="block text-sm font-medium text-app mb-1">Список преимуществ</label>
              <div className="space-y-2">
                {(Array.isArray(currentLangContent.items) ? currentLangContent.items : []).map((item: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 border border-app rounded-xl bg-surface">
                    <input
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                        newItems[i] = { ...newItems[i], title: e.target.value };
                        updateField('items', newItems);
                      }}
                      placeholder="Заголовок"
                      className="input flex-1"
                    />
                    <input
                      value={item.text || ''}
                      onChange={(e) => {
                        const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                        newItems[i] = { ...newItems[i], text: e.target.value };
                        updateField('items', newItems);
                      }}
                      placeholder="Описание"
                      className="input flex-2"
                    />
                    <button
                      onClick={() => {
                        const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                        newItems.splice(i, 1);
                        updateField('items', newItems);
                      }}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : []), { title: '', text: '', icon: 'ShieldCheck' }];
                    updateField('items', newItems);
                  }}
                  className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30"
                >
                  + Добавить пункт преимущества
                </button>
              </div>
            </div>
          )}

          {/* 3. POPULAR_LISTINGS */}
          {section.sectionType === 'POPULAR_LISTINGS' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Популярные предложения"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Текст ссылки "Смотреть все"</label>
                <input
                  value={currentLangContent.viewAllText || ''}
                  onChange={(e) => updateField('viewAllText', e.target.value)}
                  placeholder="Смотреть все"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Лимит отображаемых объявлений</label>
                <input
                  type="number"
                  value={currentLangContent.limit || 6}
                  onChange={(e) => updateField('limit', Number(e.target.value))}
                  min={1}
                  max={24}
                  className="input w-full"
                />
              </div>
            </div>
          )}

          {/* 4. CTA_BANNER */}
          {section.sectionType === 'CTA_BANNER' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок баннера</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Сдайте жильё выгодно и быстро"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Текст описания</label>
                <textarea
                  value={currentLangContent.text || ''}
                  onChange={(e) => updateField('text', e.target.value)}
                  placeholder="Разместите объявление бесплатно за 2 минуты и найдите надежных арендаторов уже сегодня"
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-1">Текст кнопки</label>
                  <input
                    value={currentLangContent.buttonText || ''}
                    onChange={(e) => updateField('buttonText', e.target.value)}
                    placeholder="Разместить объявление"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-1">Ссылка кнопки</label>
                  <input
                    value={currentLangContent.buttonLink || ''}
                    onChange={(e) => updateField('buttonLink', e.target.value)}
                    placeholder="/add-listing"
                    className="input w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. CATEGORIES */}
          {section.sectionType === 'CATEGORIES' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок блока</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Категории жилья"
                  className="input w-full"
                />
              </div>
              <label className="block text-sm font-medium text-app mb-1">Категории</label>
              <div className="space-y-2">
                {(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : []).map((cat: any, i: number) => (
                  <div key={i} className="flex gap-2 p-2 border border-app rounded-xl bg-surface">
                    <input
                      value={cat.name || ''}
                      onChange={(e) => {
                        const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : [])];
                        newCats[i] = { ...newCats[i], name: e.target.value };
                        updateField('categories', newCats);
                      }}
                      placeholder="Название"
                      className="input flex-1"
                    />
                    <input
                      value={cat.icon || ''}
                      onChange={(e) => {
                        const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : [])];
                        newCats[i] = { ...newCats[i], icon: e.target.value };
                        updateField('categories', newCats);
                      }}
                      placeholder="Иконка (Key, Home, Building)"
                      className="input w-40"
                    />
                    <input
                      value={cat.href || ''}
                      onChange={(e) => {
                        const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : [])];
                        newCats[i] = { ...newCats[i], href: e.target.value };
                        updateField('categories', newCats);
                      }}
                      placeholder="/catalog?rental_type=daily"
                      className="input flex-1"
                    />
                    <button
                      onClick={() => {
                        const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : [])];
                        newCats.splice(i, 1);
                        updateField('categories', newCats);
                      }}
                      className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : []), { name: '', icon: 'Home', href: '/catalog' }];
                    updateField('categories', newCats);
                  }}
                  className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30"
                >
                  + Добавить категорию
                </button>
              </div>
            </div>
          )}

          {/* 6. TEXT_BLOCK / CUSTOM_HTML */}
          {(section.sectionType === 'TEXT_BLOCK' || section.sectionType === 'CUSTOM_HTML') && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок блока</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Заголовок раздела"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Подзаголовок (опционально)</label>
                <input
                  value={currentLangContent.subtitle || ''}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Дополнительный подзаголовок"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Текст контента (Markdown / Текст)</label>
                <textarea
                  value={currentLangContent.text || currentLangContent.content || ''}
                  onChange={(e) => updateField('text', e.target.value)}
                  placeholder="Введите текст или параграфы страницы..."
                  rows={6}
                  className="input w-full font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* 7. TEAM_MEMBERS */}
          {section.sectionType === 'TEAM_MEMBERS' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок секции команды</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Наша команда"
                  className="input w-full"
                />
              </div>
              <label className="block text-sm font-medium text-app mb-1">Члены команды</label>
              <div className="space-y-2">
                {(Array.isArray(currentLangContent.members) ? currentLangContent.members : []).map((m: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 border border-app rounded-xl bg-surface">
                    <input
                      value={m.name || ''}
                      onChange={(e) => {
                        const newM = [...(Array.isArray(currentLangContent.members) ? currentLangContent.members : [])];
                        newM[i] = { ...newM[i], name: e.target.value };
                        updateField('members', newM);
                      }}
                      placeholder="Имя"
                      className="input flex-1"
                    />
                    <input
                      value={m.role || ''}
                      onChange={(e) => {
                        const newM = [...(Array.isArray(currentLangContent.members) ? currentLangContent.members : [])];
                        newM[i] = { ...newM[i], role: e.target.value };
                        updateField('members', newM);
                      }}
                      placeholder="Должность"
                      className="input flex-1"
                    />
                    <input
                      value={m.avatar || ''}
                      onChange={(e) => {
                        const newM = [...(Array.isArray(currentLangContent.members) ? currentLangContent.members : [])];
                        newM[i] = { ...newM[i], avatar: e.target.value };
                        updateField('members', newM);
                      }}
                      placeholder="URL фото"
                      className="input flex-1"
                    />
                    <button
                      onClick={() => {
                        const newM = [...(Array.isArray(currentLangContent.members) ? currentLangContent.members : [])];
                        newM.splice(i, 1);
                        updateField('members', newM);
                      }}
                      className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newM = [...(Array.isArray(currentLangContent.members) ? currentLangContent.members : []), { name: '', role: '', avatar: '' }];
                    updateField('members', newM);
                  }}
                  className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30"
                >
                  + Добавить сотрудника
                </button>
              </div>
            </div>
          )}

          {/* 8. FAQ_ACCORDION */}
          {section.sectionType === 'FAQ_ACCORDION' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок FAQ</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Часто задаваемые вопросы"
                  className="input w-full"
                />
              </div>
              <label className="block text-sm font-medium text-app mb-1">Вопросы и ответы</label>
              <div className="space-y-2">
                {(Array.isArray(currentLangContent.items) ? currentLangContent.items : []).map((faq: any, i: number) => (
                  <div key={i} className="p-3 border border-app rounded-xl space-y-2 bg-surface">
                    <div className="flex gap-2">
                      <input
                        value={faq.question || ''}
                        onChange={(e) => {
                          const newF = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                          newF[i] = { ...newF[i], question: e.target.value };
                          updateField('items', newF);
                        }}
                        placeholder="Вопрос"
                        className="input flex-1"
                      />
                      <button
                        onClick={() => {
                          const newF = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                          newF.splice(i, 1);
                          updateField('items', newF);
                        }}
                        className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={faq.answer || ''}
                      onChange={(e) => {
                        const newF = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                        newF[i] = { ...newF[i], answer: e.target.value };
                        updateField('items', newF);
                      }}
                      placeholder="Ответ..."
                      rows={2}
                      className="input w-full resize-none"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newF = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : []), { question: '', answer: '' }];
                    updateField('items', newF);
                  }}
                  className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30"
                >
                  + Добавить вопрос
                </button>
              </div>
            </div>
          )}

          {/* 9. CONTACT_INFO */}
          {section.sectionType === 'CONTACT_INFO' && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Заголовок</label>
                <input
                  value={currentLangContent.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Свяжитесь с нами"
                  className="input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-app mb-1">Email</label>
                  <input
                    value={currentLangContent.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="support@ijarauz.uz"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-app mb-1">Телефон</label>
                  <input
                    value={currentLangContent.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+998 71 200-00-00"
                    className="input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Адрес</label>
                <input
                  value={currentLangContent.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="г. Ташкент, ул. Амира Темура"
                  className="input w-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
            <button onClick={onClose} className="btn-ghost text-sm">
              Отмена
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PageBuilderProps {
  pageKey: string;
}

const PageBuilder: React.FC<PageBuilderProps> = ({ pageKey }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<PageSectionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSectionType, setNewSectionType] = useState('TEXT_BLOCK');

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['admin', 'page-sections', pageKey],
    queryFn: () => getPageSectionsApi(pageKey),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      updatePageSectionApi(id, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: Array<{ id: string; order: number }>) =>
      reorderPageSectionsApi(pageKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, content, title, layoutRow, width }: { id: string; content: Record<string, unknown>; title: string; layoutRow: number; width: number }) =>
      updatePageSectionApi(id, { content, title, layoutRow, width }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      setEditingSection(null);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { pageKey: string; sectionType: string; title: string; order: number; isVisible: boolean; content: Record<string, unknown> }) =>
      createPageSectionApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      setIsAddModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePageSectionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
    },
  });

  const moveSection = (currentIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newItems = [...sections];
    const temp = newItems[currentIndex];
    newItems[currentIndex] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const reorderedPayload = newItems.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    reorderMutation.mutate(reorderedPayload);
  };

  const handleAddSection = () => {
    let defaultContent: Record<string, unknown> = {};

    switch (newSectionType) {
      case 'HERO_SEARCH':
        defaultContent = {
          title: 'Аренда жилья в Узбекистане без посредников',
          subtitle: 'Найдите идеальную квартиру, дом или комнату напрямую от собственников',
          showSearch: true,
          searchPlaceholder: 'Район, метро, улица или город...',
          quickFilters: [
            { label: 'Студии', href: '/catalog?type_apartments=studio' },
            { label: '1-комнатные', href: '/catalog?rooms=1' },
          ],
        };
        break;
      case 'BENEFITS':
        defaultContent = {
          title: 'Почему выбирают нас',
          items: [
            { title: 'Прямой контакт', text: 'Без посредников и скрытых комиссий', icon: 'ShieldCheck' },
            { title: 'Безопасность', text: 'Все объявления проходят модерацию', icon: 'Lock' },
          ],
        };
        break;
      case 'POPULAR_LISTINGS':
        defaultContent = {
          title: 'Популярные предложения',
          viewAllText: 'Смотреть все',
          limit: 6,
        };
        break;
      case 'CTA_BANNER':
        defaultContent = {
          title: 'Сдайте жильё выгодно и быстро',
          text: 'Разместите объявление бесплатно за 2 минуты',
          buttonText: 'Разместить объявление',
          buttonLink: '/add-listing',
        };
        break;
      case 'CATEGORIES':
        defaultContent = {
          title: 'Категории жилья',
          categories: [
            { name: 'Посуточно', icon: 'Key', href: '/catalog?rental_type=daily' },
            { name: 'Новостройки', icon: 'Building', href: '/catalog?building_type=new' },
          ],
        };
        break;
      case 'TEXT_BLOCK':
        defaultContent = {
          title: 'Наша миссия',
          text: 'Мы создаем удобный, безопасный и прозрачный сервис аренды жилья по всему Узбекистану.',
        };
        break;
      case 'TEAM_MEMBERS':
        defaultContent = {
          title: 'Наша команда',
          members: [
            { name: 'Команда разработчиков', role: 'Engineering', avatar: '' },
            { name: 'Служба заботы о клиентах', role: 'Support', avatar: '' },
          ],
        };
        break;
      case 'FAQ_ACCORDION':
        defaultContent = {
          title: 'Частые вопросы',
          items: [
            { question: 'Как разместить объявление?', answer: 'Нажмите кнопку «Разместить объявление» в верхнем меню, заполните информацию и загрузите фотографии.' },
          ],
        };
        break;
      case 'CONTACT_INFO':
        defaultContent = {
          title: 'Контактная информация',
          email: 'support@ijarauz.uz',
          phone: '+998 71 200-00-00',
          address: 'Ташкент, Узбекистан',
        };
        break;
      default:
        defaultContent = {
          title: 'Секция',
          text: 'Текст секции',
        };
    }

    createMutation.mutate({
      pageKey,
      sectionType: newSectionType,
      title: SECTION_TYPES[newSectionType]?.defaultTitle || newSectionType,
      order: sections.length,
      isVisible: true,
      content: defaultContent,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить эту секцию страницы?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <h1 className="text-xl font-bold text-app">Управление секциями страницы: /{pageKey}</h1>
            <p className="text-sm text-muted">
              Настраивайте блоки, переставляйте их местами, редактируйте тексты и видимость
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary text-sm flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          + Добавить секцию
        </button>
      </div>

      {/* Список секций */}
      {sections.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-muted mb-4">На этой странице пока нет секций</p>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-sm">
            Добавить первую секцию
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const meta = SECTION_TYPES[section.sectionType] || {
              label: section.sectionType,
              icon: '📄',
              desc: 'Пользовательская секция',
            };

            return (
              <div
                key={section.id}
                className={`card p-4 transition-all duration-150 ${
                  !section.isVisible ? 'opacity-60 bg-gray-50/50 dark:bg-white/2' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
                      {meta.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-app truncate">
                          {section.title || meta.label}
                        </span>
                        {!section.isVisible && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 rounded-md">
                            Скрыта
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted truncate">
                        {meta.desc} • Строка: {section.layoutRow || 1} • Ширина: {section.width || 12}/12
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-muted hover:text-app rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20 transition-colors"
                      title="Поднять выше"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className="p-2 text-muted hover:text-app rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-20 transition-colors"
                      title="Опустить ниже"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibilityMutation.mutate({ id: section.id, isVisible: !section.isVisible })}
                      className={`p-2 rounded-lg transition-colors ${
                        section.isVisible
                          ? 'text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                          : 'text-muted hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                      title={section.isVisible ? 'Скрыть с сайта' : 'Показать на сайте'}
                    >
                      {section.isVisible ? '👁️' : '🙈'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-app hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                      title="Редактировать контент"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(section.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Удалить секцию"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка добавления секции */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl border border-app z-10">
            <h3 className="text-base font-bold text-app mb-4">Добавить секцию на страницу /{pageKey}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-app mb-1.5">Выберите тип блока</label>
                <select
                  value={newSectionType}
                  onChange={(e) => setNewSectionType(e.target.value)}
                  className="select w-full"
                >
                  {Object.entries(SECTION_TYPES).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.icon} {meta.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-muted">
                  {SECTION_TYPES[newSectionType]?.desc}
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-app">
                <button onClick={() => setIsAddModalOpen(false)} className="btn-ghost text-sm">
                  Отмена
                </button>
                <button
                  onClick={handleAddSection}
                  disabled={createMutation.isPending}
                  className="btn-primary text-sm"
                >
                  {createMutation.isPending ? 'Добавление...' : 'Добавить секцию'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модалка редактирования секции */}
      <SectionEditModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSave={(id, content, title, layoutRow, width) =>
          updateContentMutation.mutate({ id, content, title, layoutRow, width })
        }
      />
    </div>
  );
};

export default PageBuilder;