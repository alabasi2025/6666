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
