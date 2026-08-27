import React, { useState, useEffect } from 'react';
import { Globe, AlertCircle, Save, X } from 'lucide-react';
import type { PageSectionItem } from '../../lib/pageSectionsApi';
import { SECTION_META, type SectionType } from '../../lib/sectionTypes';
import { Modal, Button, Input, Tabs } from '../ui';
import {
  HeroSearchFields,
  BenefitsFields,
  PopularListingsFields,
  CtaBannerFields,
  CategoriesFields,
  TextBlockFields,
  CustomHtmlFields,
  TeamMembersFields,
  FaqAccordionFields,
  ContactInfoFields,
  PlatformStatsFields,
} from './sections';

export interface SectionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: PageSectionItem | null;
  onSave: (
    id: string,
    content: Record<string, unknown>,
    title: string,
    layoutRow: number,
    width: number,
  ) => void;
  onOpenMediaPicker?: (callback: (url: string) => void) => void;
}

export const SectionEditModal: React.FC<SectionEditModalProps> = ({
  isOpen,
  onClose,
  section,
  onSave,
  onOpenMediaPicker,
}) => {
  // ─── Rules of Hooks: ВСЕ хуки вызываются строго на верхнем уровне ДО любых условных return ───
  const [title, setTitle] = useState('');
  const [layoutRow, setLayoutRow] = useState(1);
  const [width, setWidth] = useState(12);
  const [activeLang, setActiveLang] = useState<'ru' | 'uz' | 'en'>('ru');
  const [content, setContent] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  // Синхронизация состояния при изменении открытой секции
  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setLayoutRow(section.layoutRow || 1);
      setWidth(section.width || 12);
      setContent(section.content || {});
      setValidationError(null);
    }
  }, [section]);

  // Условный рендеринг строго ПОСЛЕ всех хуков
  if (!isOpen || !section) {
    return null;
  }

  const handleSave = () => {
    if (!title.trim()) {
      setValidationError('Пожалуйста, укажите название секции для панели администратора');
      return;
    }
    setValidationError(null);
    onSave(section.id, content, title.trim(), layoutRow, width);
    onClose();
  };

  // Если в content есть данные верхнего уровня или данные для активного языка
  const langObj =
    content[activeLang] && typeof content[activeLang] === 'object' ? content[activeLang] : {};
  const currentLangContent = {
    ...content,
    ...langObj,
  };

  const updateField = (field: string, value: any) => {
    setContent((prev) => {
      const prevLangObj =
        prev[activeLang] && typeof prev[activeLang] === 'object' ? prev[activeLang] : {};
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

  const langTabs = [
    { id: 'ru' as const, label: 'Русский (RU)' },
    { id: 'uz' as const, label: "O'zbekcha (UZ)" },
    { id: 'en' as const, label: 'English (EN)' },
  ];

  const renderSectionFields = () => {
    const type = section.sectionType as SectionType;
    switch (type) {
      case 'HERO_SEARCH':
        return <HeroSearchFields content={currentLangContent} onChange={updateField} />;
      case 'BENEFITS':
        return <BenefitsFields content={currentLangContent} onChange={updateField} />;
      case 'POPULAR_LISTINGS':
        return <PopularListingsFields content={currentLangContent} onChange={updateField} />;
      case 'CTA_BANNER':
        return <CtaBannerFields content={currentLangContent} onChange={updateField} />;
      case 'CATEGORIES':
        return <CategoriesFields content={currentLangContent} onChange={updateField} />;
      case 'TEXT_BLOCK':
        return <TextBlockFields content={currentLangContent} onChange={updateField} />;
      case 'CUSTOM_HTML':
        return <CustomHtmlFields content={currentLangContent} onChange={updateField} />;
      case 'TEAM_MEMBERS':
        return (
          <TeamMembersFields
            content={currentLangContent}
            onChange={updateField}
            onOpenMediaPicker={onOpenMediaPicker}
          />
        );
      case 'FAQ_ACCORDION':
        return <FaqAccordionFields content={currentLangContent} onChange={updateField} />;
      case 'CONTACT_INFO':
        return <ContactInfoFields content={currentLangContent} onChange={updateField} />;
      case 'PLATFORM_STATS':
        return <PlatformStatsFields content={currentLangContent} onChange={updateField} />;
      default:
        return (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            Для типа секции <strong>{section.sectionType}</strong> используется стандартный редактор параметров.
          </div>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Редактирование: ${title || meta.label || section.sectionType}`}
      subtitle={`Тип секции: ${meta.label || section.sectionType}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-muted">
            Язык: <strong className="text-app">{activeLang.toUpperCase()}</strong>
          </span>
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={14} />}>
              Отмена
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} icon={<Save size={14} />}>
              Сохранить изменения
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {validationError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Переключатель языка контента */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-app">
          <div className="flex items-center gap-2 text-xs font-semibold text-app">
            <Globe size={16} className="text-primary-500" />
            <span>Языковая локаль контента:</span>
          </div>
          <Tabs
            tabs={langTabs}
            activeTab={activeLang}
            onChange={(tabId) => setActiveLang(tabId)}
            variant="segmented"
            size="sm"
          />
        </div>

        {/* Общие мета-данные секции */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Название секции (для админки)"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Введите название секции"
            />
          </div>
          <div>
            <Input
              label="Ширина в сетке (1-12)"
              type="number"
              min={1}
              max={12}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Контентная форма для выбранного типа секции */}
        <div className="pt-2 border-t border-app">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Параметры содержимого ({meta.label})
          </h4>
          {renderSectionFields()}
        </div>
      </div>
    </Modal>
  );
};
