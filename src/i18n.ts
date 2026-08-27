// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ru: {
    translation: {
      nav: {
        dashboard: 'Дашборд',
        listings: 'Объявления',
        users: 'Пользователи',
        staff: 'Сотрудники',
        reports: 'Жалобы',
        viewingRequests: 'Заявки на просмотр',
        analytics: 'Аналитика',
        pageBuilder: 'Конструктор страниц',
        settings: 'Настройки',
        media: 'Медиабиблиотека',
        audit: 'Аудит действий',
      },
      common: {
        search: 'Поиск...',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
        loading: 'Загрузка...',
        actions: 'Действия',
        status: 'Статус',
        date: 'Дата',
        filter: 'Фильтр',
        language: 'Язык',
      },
      header: {
        adminPanel: 'Админ-панель Ijarauz',
        logout: 'Выйти',
      },
    },
  },
  uz: {
    translation: {
      nav: {
        dashboard: 'Boshqaruv paneli',
        listings: 'E\'lonlar',
        users: 'Foydalanuvchilar',
        staff: 'Xodimlar',
        reports: 'Shikoyatlar',
        viewingRequests: 'Ko\'rish so\'rovlari',
        analytics: 'Tahlil',
        pageBuilder: 'Sahifa konstruktori',
        settings: 'Sozlamalar',
        media: 'Mediateka',
        audit: 'Harakatlar auditi',
      },
      common: {
        search: 'Qidirish...',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        delete: 'O\'chirish',
        edit: 'Tahrirlash',
        loading: 'Yuklanmoqda...',
        actions: 'Harakatlar',
        status: 'Holat',
        date: 'Sana',
        filter: 'Filtr',
        language: 'Til',
      },
      header: {
        adminPanel: 'Ijarauz Admin paneli',
        logout: 'Chiqish',
      },
    },
  },
  en: {
    translation: {
      nav: {
        dashboard: 'Dashboard',
        listings: 'Listings',
        users: 'Users',
        staff: 'Staff',
        reports: 'Reports',
        viewingRequests: 'Viewing Requests',
        analytics: 'Analytics',
        pageBuilder: 'Page Builder',
        settings: 'Settings',
        media: 'Media Library',
        audit: 'Audit Log',
      },
      common: {
        search: 'Search...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        filter: 'Filter',
        language: 'Language',
      },
      header: {
        adminPanel: 'Ijarauz Admin Panel',
        logout: 'Logout',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
