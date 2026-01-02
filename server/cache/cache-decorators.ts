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
