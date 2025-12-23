/**
 * @fileoverview سجل التدقيق للعمليات الحساسة
 * @module server/middleware/auditLog
 */

import { logger } from "../logger";

interface AuditLogEntry {
  timestamp: Date;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: number | string | null;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

// تخزين السجلات (في الإنتاج يجب استخدام قاعدة بيانات)
const auditLogs: AuditLogEntry[] = [];

/**
 * تسجيل عملية
 */
export function logAudit(entry: Omit<AuditLogEntry, "timestamp">): void {
  const fullEntry: AuditLogEntry = {
    ...entry,
    timestamp: new Date()
  };
  
  auditLogs.push(fullEntry);
  
  logger.info("Audit log", {
    action: entry.action,
    resource: entry.resource,
    userId: entry.userId
  });
  
  // الحفاظ على آخر 10000 سجل فقط
  if (auditLogs.length > 10000) {
    auditLogs.shift();
  }
}

/**
 * جلب سجلات التدقيق
 */
export function getAuditLogs(filters?: {
  userId?: number;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
}): AuditLogEntry[] {
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
    if (filters.startDate) {
      result = result.filter(log => log.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      result = result.filter(log => log.timestamp <= filters.endDate!);
    }
  }
  
  return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// أنواع العمليات المحددة مسبقاً
export const AuditActions = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT"
} as const;
