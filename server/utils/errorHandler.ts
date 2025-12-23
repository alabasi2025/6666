/**
 * @fileoverview معالجة الأخطاء الموحدة
 * @module server/utils/errorHandler
 */

import { logger } from "../logger";

// أنواع الأخطاء المخصصة
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} غير موجود`, 404);
    this.name = "NotFoundError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "غير مصرح") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "غير مسموح") {
    super(message, 403);
    this.name = "AuthorizationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = "ConflictError";
  }
}

// معالج الأخطاء العام
export function handleError(error: Error): { statusCode: number; message: string } {
  if (error instanceof AppError) {
    logger.warn("Operational error", { 
      name: error.name, 
      message: error.message,
      statusCode: error.statusCode 
    });
    return { statusCode: error.statusCode, message: error.message };
  }

  // خطأ غير متوقع
  logger.error("Unexpected error", { 
    name: error.name, 
    message: error.message,
    stack: error.stack 
  });
  
  return { 
    statusCode: 500, 
    message: "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." 
  };
}

// دالة مساعدة للتحقق من الأخطاء
export function assertExists<T>(value: T | null | undefined, resource: string): T {
  if (value === null || value === undefined) {
    throw new NotFoundError(resource);
  }
  return value;
}
