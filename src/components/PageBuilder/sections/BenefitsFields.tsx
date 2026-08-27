import React from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import type { BenefitsContent, BenefitItem } from '../../../lib/sectionTypes';
import { Input, Textarea, Select, Button, Card } from '../../ui';

const ICON_OPTIONS = [
  { value: 'ShieldCheck', label: 'ShieldCheck (Безопасность / Гарантия)' },
  { value: 'Map', label: 'Map (Карта / Локация)' },
  { value: 'MessagesSquare', label: 'MessagesSquare (Чат / Общение)' },
  { value: 'Clock', label: 'Clock (Скорость / 24/7)' },
  { value: 'Sparkles', label: 'Sparkles (Качество / Премиум)' },
  { value: 'Key', label: 'Key (Ключи / Заселение)' },
  { value: 'Building', label: 'Building (Недвижимость)' },
  { value: 'Users', label: 'Users (Собственники / Люди)' },
  { value: 'Heart', label: 'Heart (Избранное / Забота)' },
  { value: 'Percent', label: 'Percent (Без комиссии / Выгода)' },
];

export const BenefitsFields: React.FC<{
  content: BenefitsContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  const items: BenefitItem[] = content.items || [];

  const handleAddItem = () => {
    onChange('items', [
      ...items,
      {
        title: 'Новое преимущество',
        text: 'Описание преимущества для пользователя',
        icon: 'ShieldCheck',
      },
    ]);
  };

  const handleUpdateItem = (index: number, key: keyof BenefitItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    onChange('items', updated);
  };

  const handleRemoveItem = (index: number) => {
    onChange('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Почему выбирают ijarauz"
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
              <Sparkles size={14} className="text-primary-500" />
              Список преимуществ ({items.length})
            </h4>
            <p className="text-[11px] text-muted">Карточки с ключевыми выгодами сервиса</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddItem} icon={<Plus size={14} />}>
            Добавить карточку
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-app rounded-xl">
            Нет преимуществ. Нажмите «Добавить карточку», чтобы добавить.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={index} padding="sm" className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <span className="text-xs font-bold text-muted">Карточка #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Удалить карточку"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Заголовок карточки"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(index, 'title', e.target.value)}
                    placeholder="Прямой контакт с собственниками"
                  />
                  <Select
                    label="Иконка (Lucide)"
                    options={ICON_OPTIONS}
                    value={item.icon || 'ShieldCheck'}
                    onChange={(val) => handleUpdateItem(index, 'icon', val)}
                  />
                </div>

                <Textarea
                  label="Текст описания"
                  value={item.text}
                  onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
                  placeholder="Все объявления проходят модерацию. Никаких скрытых комиссий риелторов."
                  rows={2}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
