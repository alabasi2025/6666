/**
 * @fileoverview Middleware لتسجيل العمليات الحساسة
 * @module server/middleware/auditLog
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

// أنواع العمليات
type AuditAction = "create" | "read" | "update" | "delete" | "login" | "logout" | "export";

interface AuditEntry {
  timestamp: Date;
  userId: number | null;
  action: AuditAction;
  resource: string;
  resourceId?: number | string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
}

// مخزن السجلات (في الإنتاج يجب استخدام قاعدة بيانات)
const auditLogs: AuditEntry[] = [];

/**
 * تسجيل عملية في سجل المراجعة
 */
export function logAudit(entry: Omit<AuditEntry, "timestamp">): void {
  const fullEntry: AuditEntry = {
    ...entry,
    timestamp: new Date()
  };
  
  auditLogs.push(fullEntry);
  
  logger.info("Audit log entry", {
    action: entry.action,
    resource: entry.resource,
    userId: entry.userId
  });
}

/**
 * Middleware لتسجيل الطلبات تلقائياً
 */
export function auditMiddleware(resource: string, action: AuditAction) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userId = (req as any).user?.id || null;
    const resourceId = req.params.id;
    
    logAudit({
      userId,
      action,
      resource,
      resourceId,
      ip: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      details: {
        method: req.method,
        path: req.path
      }
    });
    
    next();
  };
}

/**
 * جلب سجلات المراجعة
 */
export function getAuditLogs(filters?: {
  userId?: number;
  action?: AuditAction;
  resource?: string;
  fromDate?: Date;
  toDate?: Date;
}): AuditEntry[] {
  let result = [...auditLogs];
  
  if (filters) {
    if (filters.userId) {
      result = result.filter(log => log.userId === filters.userId);
    }
    if (filters.action) {
      result = result.filter(log => log.action === filters.action);
    }
    if (filters.resource) {
      result = result.filter(log => log.resource === filters.resource);
    }
    if (filters.fromDate) {
      result = result.filter(log => log.timestamp >= filters.fromDate!);
    }
    if (filters.toDate) {
      result = result.filter(log => log.timestamp <= filters.toDate!);
    }
  }
  
  return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * مسح السجلات القديمة (للصيانة)
 */
export function clearOldLogs(daysToKeep: number = 90): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const initialLength = auditLogs.length;
  const newLogs = auditLogs.filter(log => log.timestamp > cutoffDate);
  auditLogs.length = 0;
  auditLogs.push(...newLogs);
  
  const deletedCount = initialLength - auditLogs.length;
  logger.info("Cleared old audit logs", { deletedCount, daysToKeep });
  
  return deletedCount;
}
