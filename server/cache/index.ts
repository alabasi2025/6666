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
