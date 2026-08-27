import React from 'react';
import type { TextBlockContent } from '../../../lib/sectionTypes';
import { Input, Textarea } from '../../ui';

export const CustomHtmlFields: React.FC<{
  content: TextBlockContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции (опционально)"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Пользовательский HTML блок"
      />

      <Textarea
        label="HTML код / Встраиваемый виджет"
        value={content.text || ''}
        onChange={(e) => onChange('text', e.target.value)}
        placeholder="<div class='custom-widget'>...</div>"
        rows={8}
        className="font-mono text-xs"
      />

      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 text-xs text-amber-800 dark:text-amber-300">
        ⚠️ <strong>Внимание:</strong> Вставляемый HTML должен быть валидным. На фронтенде код экранируется и фильтруется DOMPurify для безопасности.
      </div>
    </div>
  );
};
