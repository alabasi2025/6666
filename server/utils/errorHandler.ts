/**
 * @fileoverview معالج الأخطاء المركزي
 * @module server/utils/errorHandler
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

// أنواع الأخطاء المخصصة
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "المورد") {
    super(`${resource} غير موجود`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "غير مصرح") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "ممنوع الوصول") {
    super(message, 403);
  }
}

// معالج الأخطاء الرئيسي
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // تسجيل الخطأ
  logger.error("Error occurred", {
    message: err.message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined
  });
  
  // تحديد كود الحالة
  let statusCode = 500;
  let message = "حدث خطأ في الخادم";
  
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "خطأ في التحقق من البيانات";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "رمز المصادقة غير صالح";
  }
  
  // إرسال الاستجابة
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
}

// معالج الطلبات غير الموجودة
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `المسار ${req.path} غير موجود`
  });
}

// معالج الأخطاء غير المتوقعة
export function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught Exception", { message: error.message, stack: error.stack });
    process.exit(1);
  });
  
  process.on("unhandledRejection", (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    logger.error("Unhandled Rejection", { reason: message });
  });
}
