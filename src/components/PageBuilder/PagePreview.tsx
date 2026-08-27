import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, Search, ShieldCheck, Building, Phone, Mail, HelpCircle, Users } from 'lucide-react';
import type { PageSectionItem } from '../../lib/pageSectionsApi';
import type { SectionType } from '../../lib/sectionTypes';
import { Tabs } from '../ui';

export interface PagePreviewProps {
  sections: PageSectionItem[];
  activeLang?: 'ru' | 'uz' | 'en';
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  sections,
  activeLang = 'ru',
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const visibleSections = sections.filter((s) => s.isVisible);

  const deviceWidths = {
    desktop: 'w-full max-w-5xl',
    tablet: 'w-[640px]',
    mobile: 'w-[375px]',
  }[device];

  const deviceTabs = [
    { id: 'desktop' as const, label: 'Десктоп', icon: <Monitor size={14} /> },
    { id: 'tablet' as const, label: 'Планшет', icon: <Tablet size={14} /> },
    { id: 'mobile' as const, label: 'Мобильный', icon: <Smartphone size={14} /> },
  ];

  const renderSectionPreview = (section: PageSectionItem) => {
    const raw: any = section.content || {};
    const content: any = (raw[activeLang] && typeof raw[activeLang] === 'object')
      ? { ...raw, ...raw[activeLang] }
      : raw;

    const type = section.sectionType as SectionType;

    switch (type) {
      case 'HERO_SEARCH':
        return (
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white p-8 rounded-2xl my-3 shadow-sm text-center">
            {content.badgeText && (
              <span className="inline-block px-3 py-1 bg-white/10 text-teal-200 text-xs rounded-full mb-3">
                {content.badgeText}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-black mb-2">
              {content.title || 'Главный баннер с поиском'}
            </h1>
            <p className="text-xs text-teal-100/80 max-w-lg mx-auto mb-5">
              {content.subtitle || 'Поиск жилья без посредников'}
            </p>
            {content.showSearch !== false && (
              <div className="max-w-md mx-auto flex items-center bg-white dark:bg-[#1E1E1E] text-stone-900 dark:text-white rounded-xl p-1.5 shadow-md">
                <Search size={16} className="text-stone-400 ml-2 mr-2" />
                <span className="text-xs text-stone-400 flex-1 text-left">
                  {content.searchPlaceholder || 'Район, метро, улица...'}
                </span>
                <button className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold">
                  Найти
                </button>
              </div>
            )}
          </div>
        );

      case 'BENEFITS':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <h3 className="text-base font-bold text-app text-center mb-4">
              {content.title || 'Преимущества платформы'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-app">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 mb-2">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-xs font-bold text-app mb-1">{item.title}</h4>
                  <p className="text-[11px] text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'POPULAR_LISTINGS':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-app">{content.title || 'Популярные объявления'}</h3>
                {content.subtitle && <p className="text-xs text-muted">{content.subtitle}</p>}
              </div>
              <span className="text-xs font-semibold text-teal-600">{content.viewAllText || 'Смотреть все'} →</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-2.5 rounded-xl border border-app bg-gray-50 dark:bg-white/5 space-y-2">
                  <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted text-xs">
                    Фото объекта #{i}
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-teal-500/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'CTA_BANNER':
        return (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl my-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold mb-1">{content.title || 'Сдайте жильё выгодно'}</h3>
              <p className="text-xs text-emerald-100 max-w-md">{content.text}</p>
            </div>
            <button className="px-5 py-2.5 bg-white text-teal-800 rounded-xl text-xs font-bold shrink-0 shadow-md">
              {content.buttonText || 'Разместить объявление'}
            </button>
          </div>
        );

      case 'CATEGORIES':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <h3 className="text-base font-bold text-app mb-3">{content.title || 'Категории жилья'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(content.categories || []).map((cat: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-app bg-gray-50 dark:bg-white/5 flex items-center gap-2.5">
                  <Building size={16} className="text-teal-600" />
                  <span className="text-xs font-semibold text-app truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'TEAM_MEMBERS':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <h3 className="text-base font-bold text-app text-center mb-4">{content.title || 'Наша команда'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(content.members || []).map((m: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-app bg-gray-50 dark:bg-white/5 text-center">
                  <div className="h-14 w-14 rounded-full bg-teal-500/10 text-teal-600 mx-auto mb-2 flex items-center justify-center font-bold">
                    {m.name ? m.name.charAt(0) : <Users size={20} />}
                  </div>
                  <h4 className="text-xs font-bold text-app truncate">{m.name}</h4>
                  <p className="text-[10px] text-muted truncate">{m.role}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'FAQ_ACCORDION':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <h3 className="text-base font-bold text-app mb-3 flex items-center gap-2">
              <HelpCircle size={18} className="text-teal-600" />
              {content.title || 'Часто задаваемые вопросы'}
            </h3>
            <div className="space-y-2">
              {(content.items || []).map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-app bg-gray-50 dark:bg-white/5">
                  <p className="text-xs font-bold text-app">{item.question}</p>
                  <p className="text-[11px] text-muted mt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'CONTACT_INFO':
        return (
          <div className="p-6 rounded-2xl bg-surface border border-app my-3">
            <h3 className="text-base font-bold text-app mb-3">{content.title || 'Контакты'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {content.phone && (
                <div className="flex items-center gap-2 text-app">
                  <Phone size={14} className="text-teal-600" /> {content.phone}
                </div>
              )}
              {content.email && (
                <div className="flex items-center gap-2 text-app">
                  <Mail size={14} className="text-teal-600" /> {content.email}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-xl border border-app bg-surface my-3">
            <h4 className="text-xs font-bold text-app">{section.title || section.sectionType}</h4>
            <p className="text-[11px] text-muted mt-1">Секция типа {section.sectionType}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Toolbar */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface border border-app shadow-xs">
        <span className="text-xs font-bold text-app px-2">Режим отображения:</span>
        <Tabs
          tabs={deviceTabs}
          activeTab={device}
          onChange={(d) => setDevice(d)}
          variant="segmented"
          size="sm"
        />
      </div>

      {/* Screen container */}
      <div className="flex justify-center p-4 bg-gray-200/60 dark:bg-black/40 rounded-3xl min-h-[400px] overflow-x-auto border border-app">
        <div className={`transition-all duration-300 ${deviceWidths}`}>
          {visibleSections.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted bg-surface rounded-2xl border border-app">
              Нет видимых секций для отображения. Включите видимость хотя бы одной секции.
            </div>
          ) : (
            visibleSections.map((sec) => (
              <div key={sec.id} className="relative group">
                {renderSectionPreview(sec)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
