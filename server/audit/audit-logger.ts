// server/audit/audit-logger.ts

import * as fs from 'fs';
import * as path from 'path';
import { AuditEntry, AuditAction, AuditConfig, AuditContext, AuditStatus } from './types';
import { generateAuditId, maskSensitiveData, detectChanges } from './audit-utils';

const DEFAULT_CONFIG: AuditConfig = {
  enabled: true,
  excludeActions: [],
  excludeEntities: [],
  retentionDays: 90,
  logToConsole: false,
  logToFile: true,
  filePath: './logs/audit.log',
};

class AuditLogger {
  private config: AuditConfig;
  private entries: AuditEntry[] = [];
  private context: AuditContext = {};

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureLogDirectory();
  }

  /**
   * تعيين السياق الحالي
   */
  setContext(context: AuditContext): void {
    this.context = context;
  }

  /**
   * مسح السياق
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * تسجيل عملية إنشاء
   */
  async logCreate(
    entityType: string,
    entityId: string | number,
    newValue: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action: 'create',
      entityType,
      entityId,
      newValue: maskSensitiveData(newValue),
      metadata,
      status: 'success',
    });
  }

  /**
   * تسجيل عملية قراءة
   */
  async logRead(
    entityType: string,
    entityId?: string | number,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action: 'read',
      entityType,
      entityId,
      metadata,
      status: 'success',
    });
  }

  /**
   * تسجيل عملية تحديث
   */
  async logUpdate(
    entityType: string,
    entityId: string | number,
    oldValue: Record<string, unknown>,
    newValue: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    const changes = detectChanges(oldValue, newValue);
    
    return this.log({
      action: 'update',
      entityType,
      entityId,
      oldValue: maskSensitiveData(oldValue),
      newValue: maskSensitiveData(newValue),
      changes,
      metadata,
      status: 'success',
    });
  }

  /**
   * تسجيل عملية حذف
   */
  async logDelete(
    entityType: string,
    entityId: string | number,
    oldValue: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action: 'delete',
      entityType,
      entityId,
      oldValue: maskSensitiveData(oldValue),
      metadata,
      status: 'success',
    });
  }

  /**
   * تسجيل عملية تسجيل دخول
   */
  async logLogin(
    userId: number,
    userName: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action: 'login',
      entityType: 'user',
      entityId: userId,
      metadata: { ...metadata, userName },
      status: success ? 'success' : 'failure',
    });
  }

  /**
   * تسجيل عملية تسجيل خروج
   */
  async logLogout(
    userId: number,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action: 'logout',
      entityType: 'user',
      entityId: userId,
      metadata,
      status: 'success',
    });
  }

  /**
   * تسجيل خطأ
   */
  async logError(
    action: AuditAction,
    entityType: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): Promise<AuditEntry> {
    return this.log({
      action,
      entityType,
      metadata,
      status: 'failure',
      errorMessage: error.message,
    });
  }

  /**
   * التسجيل الأساسي
   */
  async log(
    data: Partial<AuditEntry> & { action: AuditAction; entityType: string; status: AuditStatus }
  ): Promise<AuditEntry> {
    if (!this.config.enabled) {
      return {} as AuditEntry;
    }

    // التحقق من الاستثناءات
    if (this.config.excludeActions?.includes(data.action)) {
      return {} as AuditEntry;
    }
    if (this.config.excludeEntities?.includes(data.entityType)) {
      return {} as AuditEntry;
    }

    const entry: AuditEntry = {
      id: generateAuditId(),
      timestamp: new Date(),
      ...data,
      ...this.context,
    };

    // تخزين في الذاكرة
    this.entries.push(entry);

    // تسجيل في Console
    if (this.config.logToConsole) {
      console.log('[AUDIT]', JSON.stringify(entry));
    }

    // تسجيل في ملف
    if (this.config.logToFile) {
      await this.writeToFile(entry);
    }

    return entry;
  }

  /**
   * الكتابة في ملف
   */
  private async writeToFile(entry: AuditEntry): Promise<void> {
    const logLine = JSON.stringify(entry) + '\n';
    const filePath = this.config.filePath!;
    
    fs.appendFileSync(filePath, logLine);
  }

  /**
   * التأكد من وجود مجلد السجلات
   */
  private ensureLogDirectory(): void {
    if (this.config.logToFile && this.config.filePath) {
      const dir = path.dirname(this.config.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  /**
   * الحصول على السجلات من الذاكرة
   */
  getEntries(): AuditEntry[] {
    return [...this.entries];
  }

  /**
   * مسح السجلات من الذاكرة
   */
  clearEntries(): void {
    this.entries = [];
  }
}

export const auditLogger = new AuditLogger();
export { AuditLogger };
