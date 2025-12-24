// @ts-nocheck
/**
 * @fileoverview Rate Limiting للحماية من هجمات DDoS
 * @module server/middleware/rateLimiter
 */

import { logger } from "../logger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// تخزين الطلبات في الذاكرة
const store: RateLimitStore = {};

// إعدادات Rate Limiting
export const rateLimitConfigs = {
  login: { windowMs: 15 * 60 * 1000, maxRequests: 10 },     // 10 محاولات / 15 دقيقة
  register: { windowMs: 15 * 60 * 1000, maxRequests: 5 },   // 5 محاولات / 15 دقيقة
  api: { windowMs: 60 * 1000, maxRequests: 100 },           // 100 طلب / دقيقة
  upload: { windowMs: 60 * 1000, maxRequests: 10 }          // 10 طلبات / دقيقة
};

/**
 * فحص Rate Limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // تنظيف السجلات القديمة
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }
  
  // إنشاء سجل جديد إذا لم يكن موجوداً
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }
  
  const record = store[key];
  record.count++;
  
  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);
  
  if (!allowed) {
    logger.warn("Rate limit exceeded", { identifier, count: record.count });
  }
  
  return { allowed, remaining, resetTime: record.resetTime };
}

/**
 * إعادة تعيين Rate Limit
 */
export function resetRateLimit(identifier: string): void {
  delete store[identifier];
}

/**
 * تنظيف السجلات المنتهية
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    logger.info("Cleaned expired rate limit records", { count: cleaned });
  }
}

// تنظيف دوري كل 5 دقائق
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
