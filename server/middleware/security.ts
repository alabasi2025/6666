/**
 * @fileoverview Middleware للأمان
 * @module server/middleware/security
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

/**
 * إضافة رؤوس الأمان
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // منع تضمين الصفحة في iframe
  res.setHeader("X-Frame-Options", "DENY");
  
  // منع تخمين نوع المحتوى
  res.setHeader("X-Content-Type-Options", "nosniff");
  
  // تفعيل XSS Filter
  res.setHeader("X-XSS-Protection", "1; mode=block");
  
  // سياسة الإحالة
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // سياسة أمان المحتوى
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  
  next();
}

/**
 * تسجيل الطلبات المشبوهة
 */
export function suspiciousRequestLogger(req: Request, _res: Response, next: NextFunction): void {
  const suspiciousPatterns = [
    /(\.\.|\/\/)/,           // Path traversal
    /<script/i,              // XSS
    /union\s+select/i,       // SQL injection
    /eval\(/i,               // Code injection
    /javascript:/i           // Protocol injection
  ];
  
  const fullUrl = req.originalUrl || req.url;
  const body = JSON.stringify(req.body || {});
  const combined = fullUrl + body;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(combined)) {
      logger.warn("Suspicious request detected", {
        ip: req.ip,
        path: req.path,
        method: req.method,
        pattern: pattern.source
      });
      break;
    }
  }
  
  next();
}

/**
 * التحقق من صلاحية الطلب
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  // التحقق من Content-Type للطلبات POST/PUT
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (req.body && Object.keys(req.body).length > 0) {
        res.status(415).json({
          success: false,
          error: "Content-Type يجب أن يكون application/json"
        });
        return;
      }
    }
  }
  
  next();
}
