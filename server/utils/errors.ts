/**
 * @fileoverview أخطاء مخصصة للنظام
 * @module errors
 */

import { TRPCError } from "@trpc/server";
import { ErrorMessages, ErrorMessageKey, ErrorSubKey } from "./errorMessages";

type Language = "ar" | "en";

/**
 * الحصول على رسالة الخطأ بلغة محددة
 */
export function getErrorMessage<T extends ErrorMessageKey>(
  category: T,
  key: ErrorSubKey<T>,
  lang: Language = "ar"
): string {
  const messages = ErrorMessages[category] as Record<string, { ar: string; en: string }>;
  return messages[key as string]?.[lang] || "خطأ غير معروف";
}

/**
 * خطأ مخصص للنظام
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * خطأ التحقق من الصحة
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * خطأ عدم وجود العنصر
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string | number) {
    const message = id 
      ? `${resource} برقم ${id} غير موجود`
      : `${resource} غير موجود`;
    super(message, "NOT_FOUND", 404, { resource, id });
  }
}

/**
 * خطأ التعارض
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, details);
  }
}

/**
 * خطأ عدم الصلاحية
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "غير مصرح لك بالوصول") {
    super(message, "UNAUTHORIZED", 401);
  }
}

/**
 * خطأ ممنوع
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "ليس لديك صلاحية لهذه العملية") {
    super(message, "FORBIDDEN", 403);
  }
}

/**
 * خطأ الرصيد غير الكافي
 */
export class InsufficientBalanceError extends AppError {
  constructor(
    required: number,
    available: number,
    currency: string = "SAR"
  ) {
    super(
      `الرصيد غير كافي. المطلوب: ${required} ${currency}، المتاح: ${available} ${currency}`,
      "INSUFFICIENT_BALANCE",
      400,
      { required, available, currency }
    );
  }
}

/**
 * تحويل AppError إلى TRPCError
 */
export function toTRPCError(error: AppError): TRPCError {
  const codeMap: Record<number, TRPCError["code"]> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    500: "INTERNAL_SERVER_ERROR",
  };

  return new TRPCError({
    code: codeMap[error.statusCode] || "INTERNAL_SERVER_ERROR",
    message: error.message,
    cause: error,
  });
}

/**
 * معالج الأخطاء للـ tRPC
 */
export function handleError(error: unknown): never {
  if (error instanceof AppError) {
    throw toTRPCError(error);
  }
  
  if (error instanceof TRPCError) {
    throw error;
  }

  // خطأ غير متوقع
  console.error("Unexpected error:", error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "حدث خطأ داخلي في النظام",
  });
}
