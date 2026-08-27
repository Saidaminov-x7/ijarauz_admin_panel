import React from 'react';
import { Plus, Trash2, Users, Image as ImageIcon } from 'lucide-react';
import type { TeamMembersContent, TeamMember } from '../../../lib/sectionTypes';
import { Input, Button, Card } from '../../ui';

export const TeamMembersFields: React.FC<{
  content: TeamMembersContent;
  onChange: (field: string, value: any) => void;
  onOpenMediaPicker?: (callback: (url: string) => void) => void;
}> = ({ content, onChange, onOpenMediaPicker }) => {
  const members: TeamMember[] = content.members || [];

  const handleAddMember = () => {
    onChange('members', [
      ...members,
      {
        name: 'Новый сотрудник',
        role: 'Должность',
        photoUrl: '',
      },
    ]);
  };

  const handleUpdateMember = (index: number, key: keyof TeamMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [key]: value };
    onChange('members', updated);
  };

  const handleRemoveMember = (index: number) => {
    onChange('members', members.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Input
        label="Заголовок секции"
        value={content.title || ''}
        onChange={(e) => onChange('title', e.target.value)}
        placeholder="Наша команда"
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-app flex items-center gap-1.5">
              <Users size={14} className="text-primary-500" />
              Список членов команды ({members.length})
            </h4>
            <p className="text-[11px] text-muted">Карточки руководителей и ключевых специалистов</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAddMember} icon={<Plus size={14} />}>
            Добавить сотрудника
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted border border-dashed border-app rounded-xl">
            Нет членов команды. Нажмите «Добавить сотрудника», чтобы создать карточку.
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member, index) => (
              <Card key={index} padding="sm" className="space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-app pb-2">
                  <span className="text-xs font-bold text-muted">Сотрудник #{index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Удалить сотрудника"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Имя и фамилия"
                    value={member.name}
                    onChange={(e) => handleUpdateMember(index, 'name', e.target.value)}
                    placeholder="Алишер Усманов"
                  />
                  <Input
                    label="Должность / Роль"
                    value={member.role}
                    onChange={(e) => handleUpdateMember(index, 'role', e.target.value)}
                    placeholder="Главный разработчик / Founder"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-app">URL фотографии</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={member.photoUrl || ''}
                      onChange={(e) => handleUpdateMember(index, 'photoUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/... или /uploads/..."
                      containerClassName="flex-1"
                    />
                    {onOpenMediaPicker && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onOpenMediaPicker((url) => handleUpdateMember(index, 'photoUrl', url));
                        }}
                        icon={<ImageIcon size={14} />}
                        title="Выбрать из библиотеки"
                        className="shrink-0"
                      >
                        Библиотека
                      </Button>
                    )}
                  </div>
                </div>

                {member.photoUrl && (
                  <div className="flex items-center gap-3 pt-1">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="h-12 w-12 rounded-xl object-cover border border-app shadow-xs"
                      onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    />
                    <span className="text-[11px] text-muted truncate">Превью фото</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
