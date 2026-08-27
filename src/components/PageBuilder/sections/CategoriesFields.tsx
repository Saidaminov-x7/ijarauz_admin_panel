import React from 'react';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import type { CategoriesContent, CategoryItem } from '../../../lib/sectionTypes';
import { Input, Select, Button, Card } from '../../ui';

const CATEGORY_ICONS = [
  { value: 'Key', label: 'Key (Ключ / Посуточно)' },
  { value: 'Building2', label: 'Building2 (Новостройки / Здания)' },
  { value: 'Sparkles', label: 'Sparkles (Элитные / Премиум)' },
  { value: 'Home', label: 'Home (Дом / Для студентов / Студии)' },
  { value: 'Building', label: 'Building (Долгосрочно / Квартиры)' },
  { value: 'MapPin', label: 'MapPin (Рядом с метро / Локация)' },
  { value: 'Coins', label: 'Coins (Эконом / Недорого)' },
  { value: 'Users', label: 'Users (Для семей)' },
];

export const CategoriesFields: React.FC<{
  content: CategoriesContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  const categories: CategoryItem[] = content.categories || [];

  const handleAddCategory = () => {
    onChange('categories', [
      ...categories,
      {
        name: 'Новая категория',
        icon: 'Home',
        href: '/catalog',
      },
    ]);
  };

  const handleUpdateCategory = (index: number, key: keyof CategoryItem, value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [key]: value };
    onChange('categories', updated);
  };

  const handleRemoveCategory = (index: number) => {
    onChange('categories', categories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Категории жилья"
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
              <LayoutGrid size={14} className="text-primary-500" />
              Список категорий ({categories.length})
            </h4>
            <p className="text-[11px] text-muted">Плитки быстрого выбора типа аренды</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddCategory} icon={<Plus size={14} />}>
            Добавить категорию
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-app rounded-xl">
            Нет категорий. Нажмите «Добавить категорию», чтобы создать.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category, index) => (
              <Card key={index} padding="sm" className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <span className="text-xs font-bold text-muted">Категория #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCategory(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Удалить категорию"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Название"
                    value={category.name}
                    onChange={(e) => handleUpdateCategory(index, 'name', e.target.value)}
                    placeholder="Посуточно"
                  />
                  <Select
                    label="Иконка (Lucide)"
                    options={CATEGORY_ICONS}
                    value={category.icon || 'Home'}
                    onChange={(val) => handleUpdateCategory(index, 'icon', val)}
                  />
                  <Input
                    label="Ссылка перехода"
                    value={category.href}
                    onChange={(e) => handleUpdateCategory(index, 'href', e.target.value)}
                    placeholder="/catalog?rental_type=daily"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
