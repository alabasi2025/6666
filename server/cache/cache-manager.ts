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
    const keysArray = Array.from(keys);
    for (const key of keysArray) {
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
