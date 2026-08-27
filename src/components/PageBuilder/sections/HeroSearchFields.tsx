import React from 'react';
import { Plus, Trash2, Tag, Search } from 'lucide-react';
import type { HeroSearchContent, QuickFilter } from '../../../lib/sectionTypes';
import { Input, Switch, Button, Card } from '../../ui';

export interface SectionFieldProps<T> {
  content: T;
  onChange: (field: string, value: any) => void;
}

export const HeroSearchFields: React.FC<SectionFieldProps<HeroSearchContent>> = ({
  content,
  onChange,
}) => {
  const quickFilters: QuickFilter[] = content.quickFilters || [];

  const handleAddFilter = () => {
    onChange('quickFilters', [...quickFilters, { label: 'Новый фильтр', href: '/catalog' }]);
  };

  const handleUpdateFilter = (index: number, key: keyof QuickFilter, value: string) => {
    const updated = [...quickFilters];
    updated[index] = { ...updated[index], [key]: value };
    onChange('quickFilters', updated);
  };

  const handleRemoveFilter = (index: number) => {
    onChange('quickFilters', quickFilters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Главный заголовок"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Аренда жилья в Узбекистане без посредников"
      />

      <Input
        label="Подзаголовок"
        value={content.subtitle || ''}
        onChange={(e) => onChange('subtitle', e.target.value)}
        placeholder="Найдите идеальную квартиру, дом или комнату..."
      />

      <Input
        label="Текст бейджа (опционально)"
        value={content.badgeText || ''}
        onChange={(e) => onChange('badgeText', e.target.value)}
        placeholder="Например: Более 10 000 проверенных объектов"
      />

      <div className="p-4 rounded-xl border border-app bg-surface/50 space-y-3">
        <div className="flex items-center justify-between">
          <Switch
            checked={content.showSearch !== false}
            onChange={(checked) => onChange('showSearch', checked)}
            label="Отображать поисковую строку"
            description="Показывает поле ввода поиска внутри главного баннера"
          />
        </div>

        {content.showSearch !== false && (
          <Input
            label="Плейсхолдер поиска"
            leftIcon={<Search size={16} />}
            value={content.searchPlaceholder || ''}
            onChange={(e) => onChange('searchPlaceholder', e.target.value)}
            placeholder="Район, метро, улица или город..."
          />
        )}
      </div>

      {/* Быстрые фильтры */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
              <Tag size={14} className="text-primary-500" />
              Быстрые фильтры (Теги)
            </h4>
            <p className="text-[11px] text-muted">Кнопки быстрого перехода под поисковой строкой</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddFilter} icon={<Plus size={14} />}>
            Добавить тег
          </Button>
        </div>

        {quickFilters.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-app rounded-xl">
            Нет быстрых фильтров. Нажмите «Добавить тег», чтобы создать первый.
          </div>
        ) : (
          <div className="space-y-2">
            {quickFilters.map((filter, index) => (
              <Card key={index} padding="sm" className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Название (Студии, Без комиссии)"
                    value={filter.label}
                    onChange={(e) => handleUpdateFilter(index, 'label', e.target.value)}
                  />
                  <Input
                    placeholder="Ссылка (/catalog?rooms=1)"
                    value={filter.href}
                    onChange={(e) => handleUpdateFilter(index, 'href', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveFilter(index)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
