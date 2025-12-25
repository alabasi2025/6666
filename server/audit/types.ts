// server/audit/types.ts

export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
export type AuditStatus = 'success' | 'failure' | 'pending';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  entityType: string;
  entityId?: string | number;
  userId?: number;
  userName?: string;
  businessId?: number;
  ipAddress?: string;
  userAgent?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
  status: AuditStatus;
  errorMessage?: string;
}

export interface AuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  action?: AuditAction | AuditAction[];
  entityType?: string;
  entityId?: string | number;
  userId?: number;
  businessId?: number;
  status?: AuditStatus;
}

export interface AuditConfig {
  enabled: boolean;
  excludeActions?: AuditAction[];
  excludeEntities?: string[];
  retentionDays?: number;
  logToConsole?: boolean;
  logToFile?: boolean;
  filePath?: string;
}

export interface AuditContext {
  userId?: number;
  userName?: string;
  businessId?: number;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}
