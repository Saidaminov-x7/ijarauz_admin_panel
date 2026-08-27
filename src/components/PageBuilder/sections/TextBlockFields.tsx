import React from 'react';
import type { TextBlockContent } from '../../../lib/sectionTypes';
import { Input, Textarea, Select } from '../../ui';

const ALIGN_OPTIONS = [
  { value: 'left', label: 'По левому краю' },
  { value: 'center', label: 'По центру' },
  { value: 'right', label: 'По правому краю' },
];

export const TextBlockFields: React.FC<{
  content: TextBlockContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок (опционально)"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="О нашей платформе"
      />

      <Input
        label="Подзаголовок (опционально)"
        value={content.subtitle || ''}
        onChange={(e) => onChange('subtitle', e.target.value)}
        placeholder="История создания и миссия"
      />

      <Select
        label="Выравнивание текста"
        options={ALIGN_OPTIONS}
        value={content.align || 'left'}
        onChange={(val) => onChange('align', val)}
      />

      <Textarea
        label="Основной текст (поддерживает Markdown)"
        value={content.text || ''}
        onChange={(e) => onChange('text', e.target.value)}
        placeholder="Введите текст статьи или информационного блока..."
        rows={6}
      />
    </div>
  );
};
