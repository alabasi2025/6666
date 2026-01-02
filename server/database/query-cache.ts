/**
 * @fileoverview نظام تخزين مؤقت للاستعلامات
 * @module database/query-cache
 */

import { CacheConfig, CacheEntry, CacheStats } from './types';

/**
 * إعدادات افتراضية للكاش
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  maxSize: 1000,
  defaultTTL: 300, // 5 دقائق
  excludePatterns: [
    /INSERT/i,
    /UPDATE/i,
    /DELETE/i,
    /CREATE/i,
    /DROP/i,
    /ALTER/i,
  ],
};

/**
 * مدير Query Cache
 * @class QueryCacheManager
 */
export class QueryCacheManager {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hitCount: 0,
    missCount: 0,
    evictionCount: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * توليد مفتاح الكاش
   */
  private generateKey(query: string, params?: unknown[]): string {
    const normalizedQuery = query.trim().toLowerCase();
    const paramsHash = params ? JSON.stringify(params) : '';
    return `${normalizedQuery}:${paramsHash}`;
  }

  /**
   * التحقق من إمكانية تخزين الاستعلام
   */
  private isCacheable(query: string): boolean {
    if (!this.config.enabled) return false;

    for (const pattern of this.config.excludePatterns) {
      if (pattern.test(query)) return false;
    }

    return true;
  }

  /**
   * الحصول على قيمة من الكاش
   */
  get<T>(query: string, params?: unknown[]): T | null {
    if (!this.isCacheable(query)) return null;

    const key = this.generateKey(query, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.missCount++;
      return null;
    }

    // التحقق من انتهاء الصلاحية
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.missCount++;
      return null;
    }

    entry.hitCount++;
    this.stats.hitCount++;
    return entry.value as T;
  }

  /**
   * تخزين قيمة في الكاش
   */
  set<T>(query: string, params: unknown[] | undefined, value: T, ttl?: number): void {
    if (!this.isCacheable(query)) return;

    const key = this.generateKey(query, params);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl || this.config.defaultTTL) * 1000);

    // التحقق من الحجم وإزالة العناصر القديمة إذا لزم الأمر
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt,
      hitCount: 0,
      size: this.estimateSize(value),
    };

    this.cache.set(key, entry);
  }

  /**
   * إزالة أقدم عنصر
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      const score = entry.createdAt.getTime() - entry.hitCount * 1000;
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictionCount++;
    }
  }

  /**
   * تقدير حجم القيمة
   */
  private estimateSize(value: unknown): number {
    return JSON.stringify(value).length * 2; // تقريبي بالبايت
  }

  /**
   * إبطال الكاش لجدول معين
   */
  invalidateTable(tableName: string): void {
    const pattern = new RegExp(tableName, 'i');
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * مسح الكاش بالكامل
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * الحصول على إحصائيات الكاش
   */
  getStats(): CacheStats {
    let totalSize = 0;
    const values = Array.from(this.cache.values());
    for (const entry of values) {
      totalSize += entry.size;
    }

    const totalRequests = this.stats.hitCount + this.stats.missCount;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitCount: this.stats.hitCount,
      missCount: this.stats.missCount,
      hitRate: totalRequests > 0 ? this.stats.hitCount / totalRequests : 0,
      evictionCount: this.stats.evictionCount,
    };
  }
}

// تصدير instance واحد
export const queryCache = new QueryCacheManager();
