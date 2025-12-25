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
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
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
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
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
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
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
    
    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
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
      const entries = Array.from(this.cache.entries());
      for (const [key, entry] of entries) {
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
