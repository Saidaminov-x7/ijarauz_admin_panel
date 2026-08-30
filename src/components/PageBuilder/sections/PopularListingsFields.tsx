import React from 'react';
import type { PopularListingsContent } from '../../../lib/sectionTypes';
import { Input } from '../../ui';

export const PopularListingsFields: React.FC<{
  content: PopularListingsContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Популярные предложения"
      />

      <Input
        label="Подзаголовок"
        value={content.subtitle || ''}
        onChange={(e) => onChange('subtitle', e.target.value)}
        placeholder="Свежие предложения аренды от собственников"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Текст ссылки «Смотреть все»"
          value={content.viewAllText || ''}
          onChange={(e) => onChange('viewAllText', e.target.value)}
          placeholder="Смотреть все"
        />

        <Input
          label="Количество карточек для показа"
          type="number"
          min={1}
          max={24}
          value={content.limit || 6}
          onChange={(e) => onChange('limit', Number(e.target.value))}
        />
      </div>

      <div className="p-3 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/30 text-xs text-primary-800 dark:text-primary-300">
        💡 <strong>Примечание:</strong> Секция автоматически подтягивает актуальные активные объявления из базы данных платформы, отсортированные по популярности и просмотрам.
      </div>
    </div>
  );
};
