/**
 * @fileoverview Middleware لمعالجة الأخطاء
 * @module errorHandler
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Middleware لمعالجة الأخطاء في Express
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // تسجيل الخطأ
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // إذا كان خطأ مخصص
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  // خطأ غير متوقع
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "حدث خطأ داخلي في النظام",
    },
  });
}

/**
 * Middleware للأخطاء غير المعالجة
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `المسار ${req.path} غير موجود`,
    },
  });
}

/**
 * معالج الأخطاء غير المتوقعة
 */
export function setupGlobalErrorHandlers(): void {
  process.on("uncaughtException", (error: Error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason: unknown) => {
    console.error("Unhandled Rejection:", reason);
  });
}
