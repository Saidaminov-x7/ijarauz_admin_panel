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

      <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800/30 space-y-2 text-xs text-primary-900 dark:text-primary-200">
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
