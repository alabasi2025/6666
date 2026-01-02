// server/cache/cache-keys.ts

/**
 * مفاتيح التخزين المؤقت للأنظمة المختلفة
 */
export const CacheKeys = {
  // النظام المخصص
  custom: {
    parties: (businessId: number) => `custom:parties:${businessId}`,
    party: (id: number) => `custom:party:${id}`,
    categories: (businessId: number) => `custom:categories:${businessId}`,
    category: (id: number) => `custom:category:${id}`,
    treasuries: (businessId: number) => `custom:treasuries:${businessId}`,
    treasury: (id: number) => `custom:treasury:${id}`,
    subSystems: (businessId: number) => `custom:subsystems:${businessId}`,
    subSystem: (id: number) => `custom:subsystem:${id}`,
  },

  // المستخدمين
  users: {
    list: (businessId: number) => `users:list:${businessId}`,
    user: (id: number) => `users:user:${id}`,
    permissions: (userId: number) => `users:permissions:${userId}`,
  },

  // الإعدادات
  settings: {
    all: (businessId: number) => `settings:all:${businessId}`,
    setting: (key: string) => `settings:${key}`,
  },

  // التقارير
  reports: {
    dashboard: (businessId: number) => `reports:dashboard:${businessId}`,
    stats: (type: string, businessId: number) => `reports:stats:${type}:${businessId}`,
  },
} as const;

/**
 * Namespaces للتخزين المؤقت
 */
export const CacheNamespaces = {
  CUSTOM: 'custom',
  USERS: 'users',
  SETTINGS: 'settings',
  REPORTS: 'reports',
} as const;

/**
 * Tags للتخزين المؤقت
 */
export const CacheTags = {
  PARTIES: 'parties',
  CATEGORIES: 'categories',
  TREASURIES: 'treasuries',
  VOUCHERS: 'vouchers',
  USERS: 'users',
  SETTINGS: 'settings',
} as const;

/**
 * توليد مفتاح تخزين مؤقت
 */
export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}
