/**
 * @fileoverview Middleware للحد من معدل الطلبات
 * @module server/middleware/rateLimiter
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;      // نافذة الوقت بالمللي ثانية
  maxRequests: number;   // الحد الأقصى للطلبات
  message?: string;      // رسالة الخطأ
}

// مخزن الطلبات (في الإنتاج استخدم Redis)
const requestStore = new Map<string, RateLimitEntry>();

// تنظيف دوري للمخزن
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(requestStore.entries());
  for (const [key, entry] of entries) {
    if (entry.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 60000); // كل دقيقة

/**
 * إنشاء middleware للحد من معدل الطلبات
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "تم تجاوز الحد الأقصى للطلبات" } = config;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getClientKey(req);
    const now = Date.now();
    
    let entry = requestStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      };
      requestStore.set(key, entry);
      next();
      return;
    }
    
    entry.count++;
    
    if (entry.count > maxRequests) {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        path: req.path,
        count: entry.count
      });
      
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
      return;
    }
    
    next();
  };
}

/**
 * الحصول على مفتاح العميل
 */
function getClientKey(req: Request): string {
  // استخدام IP + User ID إن وجد
  const userId = (req as any).user?.id;
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return userId ? `user:${userId}` : `ip:${ip}`;
}

// إعدادات افتراضية
export const defaultRateLimiter = createRateLimiter({
  windowMs: 60000,    // دقيقة واحدة
  maxRequests: 100    // 100 طلب في الدقيقة
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60000,
  maxRequests: 10,
  message: "تم تجاوز الحد الأقصى للطلبات الحساسة"
});

export const authRateLimiter = createRateLimiter({
  windowMs: 900000,   // 15 دقيقة
  maxRequests: 5,
  message: "محاولات تسجيل دخول كثيرة، حاول لاحقاً"
});
