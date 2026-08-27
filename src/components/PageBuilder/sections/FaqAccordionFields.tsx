import React from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import type { FaqAccordionContent, FaqItem } from '../../../lib/sectionTypes';
import { Input, Textarea, Button, Card } from '../../ui';

export const FaqAccordionFields: React.FC<{
  content: FaqAccordionContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  const items: FaqItem[] = content.items || [];

  const handleAddItem = () => {
    onChange('items', [
      ...items,
      {
        question: 'Новый вопрос',
        answer: 'Подробный ответ на вопрос пользователя',
      },
    ]);
  };

  const handleUpdateItem = (index: number, key: keyof FaqItem, value: string) => {
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
        label="Заголовок секции FAQ"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Часто задаваемые вопросы"
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
              <HelpCircle size={14} className="text-primary-500" />
              Список вопросов и ответов ({items.length})
            </h4>
            <p className="text-[11px] text-muted">Раскрывающийся аккордеон с популярными вопросами</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddItem} icon={<Plus size={14} />}>
            Добавить вопрос
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-app rounded-xl">
            Нет вопросов. Нажмите «Добавить вопрос», чтобы создать.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <Card key={index} padding="sm" className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <span className="text-xs font-bold text-muted">Вопрос #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Удалить вопрос"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <Input
                  label="Вопрос"
                  value={item.question}
                  onChange={(e) => handleUpdateItem(index, 'question', e.target.value)}
                  placeholder="Как разместить объявление бесплатно?"
                />

                <Textarea
                  label="Ответ"
                  value={item.answer}
                  onChange={(e) => handleUpdateItem(index, 'answer', e.target.value)}
                  placeholder="Нажмите кнопку «Разместить» в верхнем меню, заполните данные об объекте и добавьте фотографии..."
                  rows={3}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
