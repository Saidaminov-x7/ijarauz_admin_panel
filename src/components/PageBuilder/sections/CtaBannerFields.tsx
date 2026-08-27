import React from 'react';
import type { CtaBannerContent } from '../../../lib/sectionTypes';
import { Input, Textarea } from '../../ui';

export const CtaBannerFields: React.FC<{
  content: CtaBannerContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок баннера"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Сдайте жильё выгодно и быстро"
      />

      <Textarea
        label="Текст описания"
        value={content.text || ''}
        onChange={(e) => onChange('text', e.target.value)}
        placeholder="Разместите объявление бесплатно за 2 минуты и найдите надежных арендаторов уже сегодня"
        rows={3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Текст кнопки действия (CTA)"
          value={content.buttonText || ''}
          onChange={(e) => onChange('buttonText', e.target.value)}
          placeholder="Разместить объявление"
        />

        <Input
          label="Ссылка кнопки"
          value={content.buttonLink || ''}
          onChange={(e) => onChange('buttonLink', e.target.value)}
          placeholder="/add-listing"
        />
      </div>
    </div>
  );
};
