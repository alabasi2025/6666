# 📋 المهمة 12: إنشاء نظام Caching

## 🎯 الهدف
إنشاء نظام تخزين مؤقت (Caching) متكامل لتحسين أداء التطبيق وتقليل الضغط على قاعدة البيانات.

## 📁 الفرع
```
feature/task12-caching-system
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/cache/
├── types.ts              # أنواع TypeScript
├── memory-cache.ts       # التخزين المؤقت في الذاكرة
├── cache-manager.ts      # مدير التخزين المؤقت
├── cache-decorators.ts   # Decorators للتخزين المؤقت
├── cache-keys.ts         # مفاتيح التخزين المؤقت
├── cache-stats.ts        # إحصائيات التخزين المؤقت
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts` - لتجنب التعارض مع المهام الأخرى
- `drizzle/schema.ts` - لتجنب التعارض مع المهام الأخرى
- `client/src/**/*` - هذه مهمة Server فقط

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task12-caching-system
```

### الخطوة 2: إنشاء مجلد cache
```bash
mkdir -p server/cache
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/cache/types.ts

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
  tags?: string[];
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  tags: string[];
  hits: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  cleanupInterval: number;
  enableStats: boolean;
}

export type CacheKey = string;
export type CacheValue = unknown;
```

### الخطوة 4: إنشاء ملف memory-cache.ts
```typescript
// server/cache/memory-cache.ts

import { CacheEntry, CacheOptions, CacheStats, CacheConfig } from './types';

const DEFAULT_CONFIG: CacheConfig = {
  defaultTTL: 300, // 5 minutes
  maxSize: 1000,
  cleanupInterval: 60000, // 1 minute
  enableStats: true,
};

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private config: CacheConfig;
  private stats = { hits: 0, misses: 0 };
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanup();
  }

  /**
   * الحصول على قيمة من التخزين المؤقت
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * تخزين قيمة في التخزين المؤقت
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? this.config.defaultTTL;
    
    // التحقق من الحجم الأقصى
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttl * 1000,
      createdAt: Date.now(),
      tags: options.tags ?? [],
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * حذف قيمة من التخزين المؤقت
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * حذف جميع القيم بناءً على tag
   */
  invalidateByTag(tag: string): number {
    let count = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * حذف جميع القيم بناءً على pattern
   */
  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * مسح كل التخزين المؤقت
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * تقدير استخدام الذاكرة
   */
  private estimateMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2;
      size += JSON.stringify(entry.value).length * 2;
    }
    return size;
  }

  /**
   * حذف أقدم العناصر
   */
  private evictOldest(): void {
    let oldest: { key: string; createdAt: number } | null = null;
    
    for (const [key, entry] of this.cache.entries()) {
      if (!oldest || entry.createdAt < oldest.createdAt) {
        oldest = { key, createdAt: entry.createdAt };
      }
    }

    if (oldest) {
      this.cache.delete(oldest.key);
    }
  }

  /**
   * بدء التنظيف الدوري
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, this.config.cleanupInterval);
  }

  /**
   * إيقاف التنظيف الدوري
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
export { MemoryCache };
```

### الخطوة 5: إنشاء ملف cache-manager.ts
```typescript
// server/cache/cache-manager.ts

import { memoryCache, MemoryCache } from './memory-cache';
import { CacheOptions, CacheStats } from './types';
import { generateCacheKey } from './cache-keys';

class CacheManager {
  private cache: MemoryCache;
  private namespaces: Map<string, Set<string>> = new Map();

  constructor(cache: MemoryCache = memoryCache) {
    this.cache = cache;
  }

  /**
   * الحصول على قيمة أو تنفيذ الدالة وتخزين النتيجة
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const fullKey = this.buildKey(key, options.namespace);
    
    const cached = this.cache.get<T>(fullKey);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    this.cache.set(fullKey, value, options);
    this.trackKey(fullKey, options.namespace);
    
    return value;
  }

  /**
   * الحصول على قيمة
   */
  get<T>(key: string, namespace?: string): T | null {
    const fullKey = this.buildKey(key, namespace);
    return this.cache.get<T>(fullKey);
  }

  /**
   * تخزين قيمة
   */
  set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const fullKey = this.buildKey(key, options.namespace);
    this.cache.set(fullKey, value, options);
    this.trackKey(fullKey, options.namespace);
  }

  /**
   * حذف قيمة
   */
  delete(key: string, namespace?: string): boolean {
    const fullKey = this.buildKey(key, namespace);
    return this.cache.delete(fullKey);
  }

  /**
   * حذف namespace كامل
   */
  invalidateNamespace(namespace: string): number {
    const keys = this.namespaces.get(namespace);
    if (!keys) return 0;

    let count = 0;
    for (const key of keys) {
      if (this.cache.delete(key)) count++;
    }
    this.namespaces.delete(namespace);
    return count;
  }

  /**
   * حذف بناءً على tag
   */
  invalidateByTag(tag: string): number {
    return this.cache.invalidateByTag(tag);
  }

  /**
   * مسح كل التخزين المؤقت
   */
  clear(): void {
    this.cache.clear();
    this.namespaces.clear();
  }

  /**
   * الحصول على الإحصائيات
   */
  getStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * بناء المفتاح الكامل
   */
  private buildKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * تتبع المفاتيح
   */
  private trackKey(key: string, namespace?: string): void {
    if (namespace) {
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(namespace, new Set());
      }
      this.namespaces.get(namespace)!.add(key);
    }
  }
}

export const cacheManager = new CacheManager();
export { CacheManager };
```

### الخطوة 6: إنشاء ملف cache-keys.ts
```typescript
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
```

### الخطوة 7: إنشاء ملف cache-stats.ts
```typescript
// server/cache/cache-stats.ts

import { cacheManager } from './cache-manager';
import { CacheStats } from './types';

interface DetailedStats extends CacheStats {
  uptime: number;
  lastCleanup: Date | null;
  namespaceStats: Record<string, number>;
}

class CacheStatsCollector {
  private startTime: Date = new Date();
  private lastCleanup: Date | null = null;

  /**
   * الحصول على إحصائيات مفصلة
   */
  getDetailedStats(): DetailedStats {
    const basicStats = cacheManager.getStats();
    
    return {
      ...basicStats,
      uptime: Date.now() - this.startTime.getTime(),
      lastCleanup: this.lastCleanup,
      namespaceStats: this.getNamespaceStats(),
    };
  }

  /**
   * الحصول على إحصائيات حسب namespace
   */
  private getNamespaceStats(): Record<string, number> {
    // يمكن تحسين هذا لاحقاً
    return {};
  }

  /**
   * تسجيل عملية تنظيف
   */
  recordCleanup(): void {
    this.lastCleanup = new Date();
  }

  /**
   * تصدير الإحصائيات كـ JSON
   */
  exportStats(): string {
    return JSON.stringify(this.getDetailedStats(), null, 2);
  }

  /**
   * طباعة الإحصائيات
   */
  printStats(): void {
    const stats = this.getDetailedStats();
    console.log('=== Cache Statistics ===');
    console.log(`Hits: ${stats.hits}`);
    console.log(`Misses: ${stats.misses}`);
    console.log(`Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%`);
    console.log(`Size: ${stats.size} entries`);
    console.log(`Memory: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);
    console.log(`Uptime: ${Math.floor(stats.uptime / 1000)}s`);
  }
}

export const cacheStats = new CacheStatsCollector();
export { CacheStatsCollector };
```

### الخطوة 8: إنشاء ملف cache-decorators.ts
```typescript
// server/cache/cache-decorators.ts

import { cacheManager } from './cache-manager';
import { CacheOptions } from './types';

/**
 * Decorator للتخزين المؤقت التلقائي
 * ملاحظة: يستخدم مع الدوال العادية
 */
export function withCache<T>(
  keyGenerator: (...args: unknown[]) => string,
  options: CacheOptions = {}
) {
  return function (
    fn: (...args: unknown[]) => Promise<T>
  ): (...args: unknown[]) => Promise<T> {
    return async function (...args: unknown[]): Promise<T> {
      const key = keyGenerator(...args);
      return cacheManager.getOrSet(key, () => fn(...args), options);
    };
  };
}

/**
 * Helper لإنشاء دالة مع تخزين مؤقت
 */
export function cached<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  keyGenerator: (...args: A) => string,
  options: CacheOptions = {}
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    const key = keyGenerator(...args);
    return cacheManager.getOrSet(key, () => fn(...args), options);
  };
}

/**
 * Helper لإبطال التخزين المؤقت بعد التعديل
 */
export function invalidateAfter<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>,
  invalidator: (...args: A) => void
): (...args: A) => Promise<T> {
  return async (...args: A): Promise<T> => {
    const result = await fn(...args);
    invalidator(...args);
    return result;
  };
}
```

### الخطوة 9: إنشاء ملف index.ts
```typescript
// server/cache/index.ts

export * from './types';
export * from './memory-cache';
export * from './cache-manager';
export * from './cache-keys';
export * from './cache-stats';
export * from './cache-decorators';

// تصدير الـ instances الافتراضية
export { memoryCache } from './memory-cache';
export { cacheManager } from './cache-manager';
export { cacheStats } from './cache-stats';
```

### الخطوة 10: رفع التغييرات
```bash
git add server/cache/
git commit -m "feat(cache): إضافة نظام Caching متكامل

- إضافة MemoryCache للتخزين المؤقت في الذاكرة
- إضافة CacheManager لإدارة التخزين المؤقت
- إضافة CacheKeys لمفاتيح التخزين المؤقت
- إضافة CacheStats لإحصائيات التخزين المؤقت
- إضافة cache decorators للاستخدام السهل"

git push origin feature/task12-caching-system
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/cache/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `memory-cache.ts`
- [ ] إنشاء ملف `cache-manager.ts`
- [ ] إنشاء ملف `cache-keys.ts`
- [ ] إنشاء ملف `cache-stats.ts`
- [ ] إنشاء ملف `cache-decorators.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع

---

## 📊 جدول تتبع التقدم

| الملف | الحالة |
|:---|:---:|
| types.ts | ⬜ |
| memory-cache.ts | ⬜ |
| cache-manager.ts | ⬜ |
| cache-keys.ts | ⬜ |
| cache-stats.ts | ⬜ |
| cache-decorators.ts | ⬜ |
| index.ts | ⬜ |
