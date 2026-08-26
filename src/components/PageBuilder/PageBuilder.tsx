// src/components/PageBuilder/PageBuilder.tsx
// Универсальный конструктор страниц — работает для любого pageKey с поддержкой всех типов секций

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowUp, ArrowDown, Eye, EyeOff, Edit, Trash2, Plus, Globe } from 'lucide-react';
import {
  getPageSectionsApi,
  updatePageSectionApi,
  reorderPageSectionsApi,
  createPageSectionApi,
  deletePageSectionApi,
  type PageSectionItem,
} from '../../lib/pageSectionsApi';
import {
  SECTION_META,
  SECTION_DEFAULTS,
  type SectionType,
} from '../../lib/sectionTypes';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const SECTION_TYPES = SECTION_META;

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

  const meta = SECTION_META[section.sectionType as SectionType] || {
    label: section.sectionType,
    icon: 'FileText',
    desc: 'Секция',
    defaultTitle: section.sectionType,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Редактирование: ${title || meta.label || section.sectionType}`}
      subtitle={`Тип: ${section.sectionType}`}
      size="xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Языковые вкладки */}
        <div className="flex items-center justify-between gap-4 p-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-app">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Globe size={14} />
            <span>Язык контента:</span>
          </div>
          <div className="flex gap-1">
            {(['ru', 'uz', 'en'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeLang === lang
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-muted hover:text-app hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

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
              <label className="block text-sm font-medium text-app mb-1">Бейдж (опционально)</label>
              <input
                value={currentLangContent.badgeText || ''}
                onChange={(e) => updateField('badgeText', e.target.value)}
                placeholder="✨ Проверенные собственники"
                className="input w-full"
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
            <label className="block text-sm font-medium text-app mb-1">Быстрые фильтры</label>
            <div className="space-y-2">
              {(Array.isArray(currentLangContent.quickFilters) ? currentLangContent.quickFilters : []).map((qf: any, i: number) => (
                <div key={i} className="flex gap-2 p-2 border border-app rounded-xl bg-surface">
                  <input
                    value={qf.label || ''}
                    onChange={(e) => {
                      const arr = [...(currentLangContent.quickFilters || [])];
                      arr[i] = { ...arr[i], label: e.target.value };
                      updateField('quickFilters', arr);
                    }}
                    placeholder="Название (Студии)"
                    className="input flex-1"
                  />
                  <input
                    value={qf.href || ''}
                    onChange={(e) => {
                      const arr = [...(currentLangContent.quickFilters || [])];
                      arr[i] = { ...arr[i], href: e.target.value };
                      updateField('quickFilters', arr);
                    }}
                    placeholder="Ссылка (/catalog?type_apartments=studio)"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = [...(currentLangContent.quickFilters || [])];
                      arr.splice(i, 1);
                      updateField('quickFilters', arr);
                    }}
                    className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(currentLangContent.quickFilters || []), { label: '', href: '/catalog' }];
                  updateField('quickFilters', arr);
                }}
                className="w-full p-2 text-xs font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30 cursor-pointer"
              >
                + Добавить быстрый фильтр
              </button>
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
                    value={item.icon || ''}
                    onChange={(e) => {
                      const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                      newItems[i] = { ...newItems[i], icon: e.target.value };
                      updateField('items', newItems);
                    }}
                    placeholder="Иконка (ShieldCheck, Map, MessagesSquare)"
                    className="input sm:w-44"
                  />
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
                    type="button"
                    onClick={() => {
                      const newItems = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                      newItems.splice(i, 1);
                      updateField('items', newItems);
                    }}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm cursor-pointer"
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
                className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30 cursor-pointer"
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
              <label className="block text-sm font-medium text-app mb-1">Подзаголовок (опционально)</label>
              <input
                value={currentLangContent.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Свежие проверенные варианты аренды"
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
                placeholder="Категории недвижимости"
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
                    placeholder="Иконка (Key, Home, Building2, Sparkles)"
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
                    type="button"
                    onClick={() => {
                      const newCats = [...(Array.isArray(currentLangContent.categories) ? currentLangContent.categories : [])];
                      newCats.splice(i, 1);
                      updateField('categories', newCats);
                    }}
                    className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm cursor-pointer"
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
                className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30 cursor-pointer"
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
              <label className="block text-sm font-medium text-app mb-1">Выравнивание текста</label>
              <select
                value={currentLangContent.align || 'left'}
                onChange={(e) => updateField('align', e.target.value)}
                className="select w-full"
              >
                <option value="left">По левому краю</option>
                <option value="center">По центру</option>
                <option value="right">По правому краю</option>
              </select>
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
            <label className="block text-sm font-medium text-app mb-1">Участники</label>
            <div className="space-y-2">
              {(Array.isArray(currentLangContent.members) ? currentLangContent.members : []).map((m: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 border border-app rounded-xl bg-surface">
                  <input
                    value={m.name || ''}
                    onChange={(e) => {
                      const arr = [...(currentLangContent.members || [])];
                      arr[i] = { ...arr[i], name: e.target.value };
                      updateField('members', arr);
                    }}
                    placeholder="Имя"
                    className="input flex-1"
                  />
                  <input
                    value={m.role || ''}
                    onChange={(e) => {
                      const arr = [...(currentLangContent.members || [])];
                      arr[i] = { ...arr[i], role: e.target.value };
                      updateField('members', arr);
                    }}
                    placeholder="Должность"
                    className="input flex-1"
                  />
                  <input
                    value={m.photoUrl || ''}
                    onChange={(e) => {
                      const arr = [...(currentLangContent.members || [])];
                      arr[i] = { ...arr[i], photoUrl: e.target.value };
                      updateField('members', arr);
                    }}
                    placeholder="URL фото (опционально)"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = [...(currentLangContent.members || [])];
                      arr.splice(i, 1);
                      updateField('members', arr);
                    }}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const arr = [...(currentLangContent.members || []), { name: '', role: '', photoUrl: '' }];
                  updateField('members', arr);
                }}
                className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30 cursor-pointer"
              >
                + Добавить участника
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
                      type="button"
                      onClick={() => {
                        const newF = [...(Array.isArray(currentLangContent.items) ? currentLangContent.items : [])];
                        newF.splice(i, 1);
                        updateField('items', newF);
                      }}
                      className="px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm cursor-pointer"
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
                className="w-full p-2.5 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl border border-dashed border-teal-500/30 cursor-pointer"
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
                placeholder="Контакты"
                className="input w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <div>
                <label className="block text-sm font-medium text-app mb-1">Адрес</label>
                <input
                  value={currentLangContent.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="г. Ташкент"
                  className="input w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-app mb-1">Часы работы</label>
              <input
                value={currentLangContent.workingHours || ''}
                onChange={(e) => updateField('workingHours', e.target.value)}
                placeholder="Пн–Пт, 9:00–18:00"
                className="input w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-app mb-1">Telegram (ссылка)</label>
                <input
                  value={currentLangContent.socials?.telegram || ''}
                  onChange={(e) =>
                    updateField('socials', { ...(currentLangContent.socials || {}), telegram: e.target.value })
                  }
                  placeholder="https://t.me/ijarauz"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app mb-1">Instagram (ссылка)</label>
                <input
                  value={currentLangContent.socials?.instagram || ''}
                  onChange={(e) =>
                    updateField('socials', { ...(currentLangContent.socials || {}), instagram: e.target.value })
                  }
                  placeholder="https://instagram.com/ijarauz"
                  className="input w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* 11. PLATFORM_STATS */}
        {section.sectionType === 'PLATFORM_STATS' && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-sm font-medium text-app mb-1">Заголовок секции</label>
              <input
                value={currentLangContent.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Ijarauz в цифрах"
                className="input w-full"
              />
            </div>
            <p className="text-xs text-muted p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-app">
              Цифры (объявления, пользователи, города, просмотры) считаются автоматически на сервере — здесь нельзя задать их вручную.
            </p>
          </div>
        )}
      </div>
    </Modal>
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
  const [newSectionType, setNewSectionType] = useState<SectionType>('TEXT_BLOCK');

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['admin', 'page-sections', pageKey],
    queryFn: () => getPageSectionsApi(pageKey),
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: ({ id, isVisible }: { id: string; isVisible: boolean }) =>
      updatePageSectionApi(id, { isVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      toast.success('Видимость секции изменена');
    },
    onError: () => {
      toast.error('Не удалось изменить видимость секции');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: Array<{ id: string; order: number }>) =>
      reorderPageSectionsApi(pageKey, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      toast.success('Порядок секций обновлен');
    },
    onError: () => {
      toast.error('Не удалось обновить порядок секций');
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, content, title, layoutRow, width }: { id: string; content: Record<string, unknown>; title: string; layoutRow: number; width: number }) =>
      updatePageSectionApi(id, { content, title, layoutRow, width }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      setEditingSection(null);
      toast.success('Изменения успешно сохранены');
    },
    onError: () => {
      toast.error('Не удалось сохранить изменения');
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { pageKey: string; sectionType: string; title: string; order: number; isVisible: boolean; content: Record<string, unknown> }) =>
      createPageSectionApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      setIsAddModalOpen(false);
      toast.success('Секция успешно создана');
    },
    onError: () => {
      toast.error('Не удалось создать секцию');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePageSectionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'page-sections', pageKey] });
      toast.success('Секция успешно удалена');
    },
    onError: () => {
      toast.error('Не удалось удалить секцию');
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
    const defaultContent = (SECTION_DEFAULTS[newSectionType] || {}) as unknown as Record<string, unknown>;

    createMutation.mutate({
      pageKey,
      sectionType: newSectionType,
      title: SECTION_META[newSectionType]?.defaultTitle || newSectionType,
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/pages')}
            title="Назад ко всем страницам"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-app">Управление секциями страницы: /{pageKey}</h1>
            <p className="text-sm text-muted">
              Настраивайте блоки, переставляйте их местами, редактируйте тексты и видимость
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto"
        >
          <Plus size={16} /> Добавить секцию
        </Button>
      </div>

      {/* Список секций */}
      {sections.length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto text-2xl font-bold">
            📄
          </div>
          <div>
            <h3 className="text-base font-bold text-app mb-1">Секции для страницы /{pageKey} еще не созданы</h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              Вы можете быстро инициализировать стандартный набор блоков для этой страницы или добавить блоки вручную
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                const defaultsMap: Record<string, Array<{ type: SectionType; title: string; content: any }>> = {
                  home: [
                    { type: 'HERO_SEARCH', title: 'Главный баннер с поиском', content: SECTION_DEFAULTS.HERO_SEARCH },
                    { type: 'BENEFITS', title: 'Преимущества', content: SECTION_DEFAULTS.BENEFITS },
                    { type: 'POPULAR_LISTINGS', title: 'Популярные предложения', content: SECTION_DEFAULTS.POPULAR_LISTINGS },
                    { type: 'CTA_BANNER', title: 'Баннер размещения', content: SECTION_DEFAULTS.CTA_BANNER },
                    { type: 'CATEGORIES', title: 'Категории недвижимости', content: SECTION_DEFAULTS.CATEGORIES },
                    { type: 'PLATFORM_STATS', title: 'Ijarauz в цифрах', content: SECTION_DEFAULTS.PLATFORM_STATS },
                  ],
                  about: [
                    { type: 'TEXT_BLOCK', title: 'О нашей компании', content: SECTION_DEFAULTS.TEXT_BLOCK },
                    { type: 'BENEFITS', title: 'Наши ценности', content: SECTION_DEFAULTS.BENEFITS },
                    { type: 'TEAM_MEMBERS', title: 'Наша команда', content: SECTION_DEFAULTS.TEAM_MEMBERS },
                    { type: 'CONTACT_INFO', title: 'Контакты', content: SECTION_DEFAULTS.CONTACT_INFO },
                  ],
                  catalog: [
                    { type: 'HERO_SEARCH', title: 'Поиск по каталогу', content: SECTION_DEFAULTS.HERO_SEARCH },
                    { type: 'CATEGORIES', title: 'Категории', content: SECTION_DEFAULTS.CATEGORIES },
                    { type: 'POPULAR_LISTINGS', title: 'Рекомендуемые', content: SECTION_DEFAULTS.POPULAR_LISTINGS },
                  ],
                  maintenance: [
                    { type: 'TEXT_BLOCK', title: 'Статус техработ', content: { title: '🛠️ Плановое техническое обслуживание', text: 'Сайт временно недоступен. Мы обновляем сервисы для вашего удобства.' } },
                    { type: 'CONTACT_INFO', title: 'Контакты экстренной связи', content: SECTION_DEFAULTS.CONTACT_INFO },
                  ],
                  privacy: [
                    { type: 'TEXT_BLOCK', title: 'Политика конфиденциальности', content: { title: 'Политика обработки персональных данных', text: 'Мы гарантируем безопасность и сохранность ваших данных в соответствии с законодательством Республики Узбекистан.' } },
                  ],
                  terms: [
                    { type: 'TEXT_BLOCK', title: 'Условия использования', content: { title: 'Пользовательское соглашение', text: 'Используя платформу Ijarauz, вы соглашаетесь с правилами размещения и поиска объявлений.' } },
                  ],
                };

                const templates = defaultsMap[pageKey] || [
                  { type: 'TEXT_BLOCK', title: `Информация о ${pageKey}`, content: { title: `Раздел: ${pageKey}`, text: 'Текст страницы.' } },
                  { type: 'CONTACT_INFO', title: 'Контакты', content: SECTION_DEFAULTS.CONTACT_INFO },
                ];

                templates.forEach((t, i) => {
                  createMutation.mutate({
                    pageKey,
                    sectionType: t.type,
                    title: t.title,
                    order: i,
                    isVisible: true,
                    content: t.content,
                  });
                });
              }}
              disabled={createMutation.isPending}
            >
              🚀 Создать стандартный шаблон для /{pageKey}
            </Button>
            <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(true)}>
              + Добавить блок вручную
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, index) => {
            const meta = SECTION_META[section.sectionType as SectionType] || {
              label: section.sectionType,
              icon: 'FileText',
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
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xs font-bold shrink-0">
                      {section.sectionType.slice(0, 3)}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      title="Поднять выше"
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      title="Опустить ниже"
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibilityMutation.mutate({ id: section.id, isVisible: !section.isVisible })}
                      title={section.isVisible ? 'Скрыть с сайта' : 'Показать на сайте'}
                      className={section.isVisible ? 'text-teal-600' : 'text-muted'}
                    >
                      {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingSection(section)}
                      title="Редактировать контент"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(section.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Удалить секцию"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка добавления секции */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Добавить секцию на страницу /${pageKey}`}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddSection}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Добавление...' : 'Добавить секцию'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app mb-1.5">Выберите тип блока</label>
            <select
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value as SectionType)}
              className="select w-full"
            >
              {(Object.keys(SECTION_META) as SectionType[]).map((key) => (
                <option key={key} value={key}>
                  {SECTION_META[key].label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              {SECTION_META[newSectionType]?.desc}
            </p>
          </div>
        </div>
      </Modal>

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