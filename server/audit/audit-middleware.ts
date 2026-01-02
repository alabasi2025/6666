// server/audit/audit-middleware.ts

import { Request, Response, NextFunction } from 'express';
import { auditLogger } from './audit-logger';
import { AuditAction } from './types';

/**
 * Middleware لتعيين سياق التدقيق
 */
export function auditContextMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    auditLogger.setContext({
      userId: user?.id,
      userName: user?.name,
      businessId: user?.businessId,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      requestId: (req as any).requestId,
    });

    // مسح السياق بعد الاستجابة
    res.on('finish', () => {
      auditLogger.clearContext();
    });

    next();
  };
}

/**
 * Middleware لتسجيل الطلبات
 */
export function auditRequestMiddleware(options: {
  excludePaths?: string[];
  logReads?: boolean;
} = {}) {
  const { excludePaths = [], logReads = false } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // تجاهل المسارات المستثناة
    if (excludePaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    // تحديد نوع العملية
    const action = getActionFromMethod(req.method);
    
    // تجاهل عمليات القراءة إذا لم تكن مطلوبة
    if (action === 'read' && !logReads) {
      return next();
    }

    // تسجيل الطلب
    const originalSend = res.send;
    res.send = function (body) {
      const statusCode = res.statusCode;
      const success = statusCode >= 200 && statusCode < 400;

      // استخراج معلومات الكيان من المسار
      const { entityType, entityId } = parseEntityFromPath(req.path);

      if (entityType) {
        if (success) {
          auditLogger.log({
            action,
            entityType,
            entityId,
            metadata: {
              method: req.method,
              path: req.path,
              statusCode,
            },
            status: 'success',
          } as any);
        } else {
          auditLogger.logError(action, entityType, new Error(`HTTP ${statusCode}`), {
            method: req.method,
            path: req.path,
          });
        }
      }

      return originalSend.call(this, body);
    };

    next();
  };
}

/**
 * تحديد العملية من HTTP Method
 */
function getActionFromMethod(method: string): AuditAction {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'read';
  }
}

/**
 * استخراج نوع الكيان من المسار
 */
function parseEntityFromPath(path: string): { entityType?: string; entityId?: string } {
  const patterns = [
    /\/api\/(?:trpc\/)?(\w+)\.(\w+)/,  // tRPC pattern
    /\/api\/(\w+)(?:\/(\d+))?/,         // REST pattern
  ];

  for (const pattern of patterns) {
    const match = path.match(pattern);
    if (match) {
      return {
        entityType: match[1],
        entityId: match[2],
      };
    }
  }

  return {};
}

/**
 * Decorator لتسجيل عمليات محددة
 */
export function withAudit<T>(
  action: AuditAction,
  entityType: string,
  getEntityId?: (result: T) => string | number
) {
  return function (
    fn: (...args: unknown[]) => Promise<T>
  ): (...args: unknown[]) => Promise<T> {
    return async function (...args: unknown[]): Promise<T> {
      try {
        const result = await fn(...args);
        const entityId = getEntityId ? getEntityId(result) : undefined;
        
        await auditLogger.log({
          action,
          entityType,
          entityId,
          status: 'success',
        } as any);
        
        return result;
      } catch (error) {
        await auditLogger.logError(action, entityType, error as Error);
        throw error;
      }
    };
  };
}
