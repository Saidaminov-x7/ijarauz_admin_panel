// src/routes.tsx
// Константы маршрутов

export const ROUTES = {
  LOGIN:            '/login',
  DASHBOARD:        '/',
  LISTINGS:         '/listings',
  KANBAN:           '/moderation/kanban',
  USERS:            '/users',
  MEDIA:            '/media',
  PAGES:            '/pages',
  ANALYTICS:        '/analytics',
  HEATMAP:          '/analytics/heatmap',
  SEARCH_ANALYTICS: '/analytics/search-queries',
  REVENUE:          '/monetization/revenue',
  PROMO_CODES:      '/monetization/promo-codes',
  SETTINGS:         '/settings',
  STAFF:            '/settings/staff',
  HEALTH:           '/system/health',
  WEBHOOKS:         '/system/webhooks',
  BACKUPS:          '/system/backups',
  ERRORS:           '/errors',
} as const;
