// server/logging/request-logger.ts

import { Request, Response, NextFunction } from 'express';
import { defaultLogger } from './logger-factory';

const logger = defaultLogger.child('HTTP');

export interface RequestLogOptions {
  excludePaths?: string[];
  logBody?: boolean;
  logHeaders?: boolean;
}

export function requestLogger(options: RequestLogOptions = {}) {
  const { excludePaths = [], logBody = false, logHeaders = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // تجاهل المسارات المستثناة
    if (excludePaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // إضافة requestId للطلب
    (req as any).requestId = requestId;

    // تسجيل الطلب الوارد
    const requestLog: Record<string, unknown> = {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (logHeaders) {
      requestLog.headers = req.headers;
    }

    if (logBody && req.body) {
      requestLog.body = sanitizeBody(req.body);
    }

    logger.info('طلب وارد', requestLog);

    // تسجيل الاستجابة
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;
      
      logger.info('استجابة صادرة', {
        requestId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      return originalSend.call(this, body);
    };

    next();
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

export function errorLogger() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId;

    logger.error('خطأ في الطلب', err, {
      requestId,
      method: req.method,
      path: req.path,
    });

    next(err);
  };
}
