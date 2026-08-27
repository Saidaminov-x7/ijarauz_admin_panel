import React from 'react';
import { Mail, Phone, MapPin, Clock, Send, Camera } from 'lucide-react';
import type { ContactInfoContent } from '../../../lib/sectionTypes';
import { Input, Card } from '../../ui';

export const ContactInfoFields: React.FC<{
  content: ContactInfoContent;
  onChange: (field: string, value: any) => void;
}> = ({ content, onChange }) => {
  const socials = content.socials || {};

  const handleUpdateSocial = (network: 'telegram' | 'instagram', value: string) => {
    onChange('socials', {
      ...socials,
      [network]: value,
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Свяжитесь с нами"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email для связи"
          leftIcon={<Mail size={16} />}
          value={content.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="support@ijarauz.uz"
        />

        <Input
          label="Контактный телефон"
          leftIcon={<Phone size={16} />}
          value={content.phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+998 71 200-00-00"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Физический адрес"
          leftIcon={<MapPin size={16} />}
          value={content.address || ''}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="г. Ташкент, ул. Амира Темура, 107"
        />

        <Input
          label="График работы"
          leftIcon={<Clock size={16} />}
          value={content.workingHours || ''}
          onChange={(e) => onChange('workingHours', e.target.value)}
          placeholder="Пн-Сб: 09:00 - 19:00"
        />
      </div>

      <Card padding="sm" className="space-y-3">
        <h4 className="text-xs font-bold text-app">Ссылки на социальные сети</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Telegram канал / бот"
            leftIcon={<Send size={16} className="text-blue-500" />}
            value={socials.telegram || ''}
            onChange={(e) => handleUpdateSocial('telegram', e.target.value)}
            placeholder="https://t.me/ijarauz_official"
          />

          <Input
            label="Instagram профиль"
            leftIcon={<Camera size={16} className="text-pink-500" />}
            value={socials.instagram || ''}
            onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
            placeholder="https://instagram.com/ijarauz"
          />
        </div>
      </Card>
    </div>
  );
};
