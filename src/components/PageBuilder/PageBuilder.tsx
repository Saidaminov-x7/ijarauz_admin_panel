// src/components/PageBuilder/PageBuilder.tsx
// Универсальный конструктор страниц с drag&drop, живым предпросмотром, дублированием и массовыми операциями

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  Copy,
  GripVertical,
  Layers,
  Sparkles,
  Search,
  CheckSquare,
  Square,
  MonitorPlay,
  RotateCcw,
} from 'lucide-react';
import {
  getPageSectionsApi,
  updatePageSectionApi,
  reorderPageSectionsApi,
  createPageSectionApi,
  deletePageSectionApi,
  type PageSectionItem,
} from '../../lib/pageSectionsApi';
import {
  SECTION_META,
  SECTION_DEFAULTS,
  type SectionType,
} from '../../lib/sectionTypes';
import { Button, Modal, Card, Badge, ConfirmDialog, Tabs } from '../ui';
import { SectionEditModal } from './SectionEditModal';
import { PagePreview } from './PagePreview';

export const SECTION_TYPES = SECTION_META;

interface SortableSectionCardProps {
  section: PageSectionItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (section: PageSectionItem) => void;
  onToggleVisibility: (section: PageSectionItem) => void;
  onDuplicate: (section: PageSectionItem) => void;
  onDelete: (id: string) => void;
}

const SortableSectionCard: React.FC<SortableSectionCardProps> = ({
  section,
  isSelected,
  onToggleSelect,
  onEdit,
  onToggleVisibility,
  onDuplicate,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : undefined,
  };

  const meta = SECTION_META[section.sectionType as SectionType] || {
    label: section.sectionType,
    icon: 'Layers',
    desc: 'Секция',
    defaultTitle: section.sectionType,
  };

  return (
    <div ref={setNodeRef} style={style} className="touch-none">
      <Card
        padding="sm"
        className={`flex items-center justify-between gap-3 transition-all duration-150 ${
          isDragging ? 'shadow-lg border-primary-500 bg-primary-50/20' : ''
        } ${!section.isVisible ? 'opacity-60 bg-gray-50 dark:bg-white/5' : ''} ${
          isSelected ? 'ring-2 ring-primary-500 border-primary-500' : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Checkbox for bulk selection */}
          <button
            type="button"
            onClick={() => onToggleSelect(section.id)}
            className="text-muted hover:text-primary-500 transition-colors p-1"
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-primary-500" />
            ) : (
              <Square size={16} />
            )}
          </button>

          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-muted hover:text-app transition-colors"
            title="Перетащите для изменения порядка"
          >
            <GripVertical size={18} />
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold">
            <Layers size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-app truncate">
                {section.title || meta.label || section.sectionType}
              </h4>
              <Badge variant={section.isVisible ? 'success' : 'neutral'} size="sm">
                {section.isVisible ? 'Видима' : 'Скрыта'}
              </Badge>
              <span className="text-[10px] text-muted font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                Порядок: {section.order}
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">
              {meta.label} • {meta.desc}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleVisibility(section)}
            title={section.isVisible ? 'Скрыть секцию' : 'Показать секцию'}
            className={section.isVisible ? 'text-teal-600' : 'text-muted'}
          >
            {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDuplicate(section)}
            title="Дублировать секцию"
            className="text-muted hover:text-app"
          >
            <Copy size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(section)}
            title="Редактировать параметры"
            className="text-muted hover:text-app"
          >
            <Edit size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(section.id)}
            title="Удалить секцию"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export const PageBuilder: React.FC<{ pageKey: string }> = ({ pageKey }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [editingSection, setEditingSection] = useState<PageSectionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType>('HERO_SEARCH');
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Queries
  const { data: sections = [], isLoading, refetch } = useQuery({
    queryKey: ['page-sections', pageKey],
    queryFn: () => getPageSectionsApi(pageKey),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updatePageSectionApi>[1] }) =>
      updatePageSectionApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
      toast.success('Секция успешно обновлена');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка обновления секции');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createPageSectionApi>[0]) => createPageSectionApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
      setIsAddModalOpen(false);
      toast.success('Секция успешно добавлена');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка создания секции');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePageSectionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
      toast.success('Секция удалена');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка удаления секции');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => reorderPageSectionsApi(pageKey, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
      toast.success('Порядок секций сохранён');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Ошибка сохранения порядка');
    },
  });

  // Reordering via drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const newSections = arrayMove(sections, oldIndex, newIndex);

      // Re-index orders
      const reorderPayload = newSections.map((s, index) => ({
        id: s.id,
        order: index,
      }));

      // Optimistic update query cache
      queryClient.setQueryData(
        ['page-sections', pageKey],
        newSections.map((s, index) => ({ ...s, order: index })),
      );

      reorderMutation.mutate(reorderPayload);
    }
  };

  const handleToggleVisibility = (section: PageSectionItem) => {
    updateMutation.mutate({
      id: section.id,
      data: { isVisible: !section.isVisible },
    });
  };

  const handleDuplicateSection = (section: PageSectionItem) => {
    const newOrder = sections.length;
    const defaultMeta = SECTION_META[section.sectionType as SectionType];
    createMutation.mutate({
      pageKey,
      sectionType: section.sectionType,
      title: `${section.title || defaultMeta?.defaultTitle || 'Секция'} (Копия)`,
      content: (section.content || {}) as Record<string, unknown>,
      order: newOrder,
      isVisible: section.isVisible,
      layoutRow: section.layoutRow || 1,
      width: section.width || 12,
    });
  };

  const handleCreateSection = () => {
    const defaultMeta = SECTION_META[selectedSectionType];
    const defaultContent = SECTION_DEFAULTS[selectedSectionType] || {};
    const newOrder = sections.length;

    createMutation.mutate({
      pageKey,
      sectionType: selectedSectionType,
      title: defaultMeta?.defaultTitle || selectedSectionType,
      content: defaultContent as unknown as Record<string, unknown>,
      order: newOrder,
      isVisible: true,
      layoutRow: 1,
      width: 12,
    });
  };

  // Bulk operations
  const handleToggleSelect = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedSectionIds.length === filteredSections.length) {
      setSelectedSectionIds([]);
    } else {
      setSelectedSectionIds(filteredSections.map((s) => s.id));
    }
  };

  const handleBulkVisibility = async (visible: boolean) => {
    for (const id of selectedSectionIds) {
      await updatePageSectionApi(id, { isVisible: visible });
    }
    queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
    toast.success(
      `Секции (${selectedSectionIds.length}) переведены в статус: ${visible ? 'Видимы' : 'Скрыты'}`,
    );
    setSelectedSectionIds([]);
  };

  const handleBulkDelete = async () => {
    for (const id of selectedSectionIds) {
      await deletePageSectionApi(id);
    }
    queryClient.invalidateQueries({ queryKey: ['page-sections', pageKey] });
    toast.success(`Удалено секций: ${selectedSectionIds.length}`);
    setSelectedSectionIds([]);
    setIsBulkDeleteOpen(false);
  };

  const filteredSections = sections.filter((s) => {
    const meta = SECTION_META[s.sectionType as SectionType];
    const matchSearch =
      s.title?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      meta?.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.sectionType.toLowerCase().includes(searchFilter.toLowerCase());
    return matchSearch;
  });

  const pageTabs = [
    { id: 'editor' as const, label: 'Конструктор секций', icon: <Layers size={16} /> },
    { id: 'preview' as const, label: 'Живой предпросмотр', icon: <MonitorPlay size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/pages')}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-app tracking-tight flex items-center gap-2">
              <span>Конструктор страницы:</span>
              <span className="text-primary-600 dark:text-primary-400 font-mono">
                /{pageKey === 'home' ? '' : pageKey}
              </span>
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Управление блоками, последовательностью отображения и мультиязычным контентом
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            icon={<RotateCcw size={14} />}
          >
            Обновить
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus size={16} />}
          >
            Добавить блок
          </Button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-app pb-3">
        <Tabs
          tabs={pageTabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
          variant="segmented"
          size="md"
        />

        {activeTab === 'editor' && (
          <div className="relative w-64 hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Поиск по секциям..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-xl bg-surface border border-app text-app outline-none focus:border-primary-500"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'preview' ? (
        <PagePreview sections={sections} />
      ) : (
        <div className="space-y-4">
          {/* Bulk Action Toolbar */}
          {selectedSectionIds.length > 0 && (
            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800/40 flex items-center justify-between gap-4 animate-fade-in">
              <span className="text-xs font-bold text-primary-800 dark:text-primary-300">
                Выбрано блоков: {selectedSectionIds.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkVisibility(true)}>
                  Показать
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkVisibility(false)}>
                  Скрыть
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  icon={<Trash2 size={14} />}
                >
                  Удалить выбранные
                </Button>
              </div>
            </div>
          )}

          {/* Select all & section count bar */}
          <div className="flex items-center justify-between px-1 text-xs text-muted">
            <button
              type="button"
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 font-medium hover:text-app cursor-pointer"
            >
              {selectedSectionIds.length === filteredSections.length && filteredSections.length > 0 ? (
                <CheckSquare size={14} className="text-primary-500" />
              ) : (
                <Square size={14} />
              )}
              <span>Выбрать все ({filteredSections.length})</span>
            </button>
            <span>💡 Перетаскивайте за маркер слева для изменения порядка</span>
          </div>

          {/* Sections List with Drag&Drop */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-18 rounded-2xl bg-surface border border-app animate-pulse" />
              ))}
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-app bg-surface/50">
              <Layers size={36} className="mx-auto mb-3 text-muted opacity-40" />
              <h3 className="text-sm font-bold text-app">На этой странице пока нет секций</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Создайте первый блок для настройки контента страницы
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                icon={<Plus size={16} />}
                className="mt-4"
              >
                Добавить секцию
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {filteredSections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      isSelected={selectedSectionIds.includes(section.id)}
                      onToggleSelect={handleToggleSelect}
                      onEdit={(sec) => setEditingSection(sec)}
                      onToggleVisibility={handleToggleVisibility}
                      onDuplicate={handleDuplicateSection}
                      onDelete={(id) => setDeleteConfirmId(id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Edit Section Modal */}
      <SectionEditModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSave={(id, content, title, layoutRow, width) => {
          updateMutation.mutate({
            id,
            data: { content, title, layoutRow, width },
          });
        }}
      />

      {/* Add New Section Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Добавить новый блок"
        subtitle="Выберите подходящий тип секции для страницы"
        size="lg"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSection}
              loading={createMutation.isPending}
              icon={<Plus size={16} />}
            >
              Создать блок
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {(Object.keys(SECTION_META) as SectionType[]).map((type) => {
            const meta = SECTION_META[type];
            const isSelected = selectedSectionType === type;
            return (
              <div
                key={type}
                onClick={() => setSelectedSectionType(type)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                    : 'border-app bg-surface hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-app">{meta.label}</span>
                  {isSelected && <Sparkles size={14} className="text-primary-500" />}
                </div>
                <p className="text-[11px] text-muted line-clamp-2">{meta.desc}</p>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Delete Single Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteMutation.mutate(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Удалить секцию?"
        message="Вы уверены, что хотите удалить эту секцию? Все сохранённые данные секции будут безвозвратно стёрты."
        confirmLabel="Удалить"
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Удалить выбранные секции?"
        message={`Вы уверены, что хотите удалить ${selectedSectionIds.length} секций? Это действие невозможно отменить.`}
        confirmLabel="Удалить все"
        variant="danger"
      />
    </div>
  );
};