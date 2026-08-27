import React from 'react';
import type { PlatformStatsContent } from '../../../lib/sectionTypes';
import { Input } from '../../ui';

export const PlatformStatsFields: React.FC<{
  content: PlatformStatsContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции статистики"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Платформа в цифрах"
      />

      <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/30 space-y-2 text-xs text-teal-900 dark:text-teal-200">
        <p className="font-bold text-sm">📊 Автоматический сбор метрик платформы</p>
        <p>Секция динамически отображает реальные показатели из базы данных:</p>
        <ul className="list-disc pl-5 space-y-1 text-muted">
          <li>Количество активных проверенных объявлений</li>
          <li>Количество зарегистрированных пользователей</li>
          <li>Количество успешных сделок / контактов</li>
          <li>Среднее время сдачи объекта</li>
        </ul>
      </div>
    </div>
  );
};
