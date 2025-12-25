# 📋 المهمة 18: إنشاء نظام Audit Trail

## 🎯 الهدف
إنشاء نظام تتبع التغييرات (Audit Trail) لتسجيل جميع العمليات على البيانات.

## 📁 الفرع
```
feature/task18-audit-trail
```

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/audit/
├── types.ts              # أنواع TypeScript
├── audit-logger.ts       # مسجل التدقيق
├── audit-middleware.ts   # Middleware للتدقيق
├── audit-queries.ts      # استعلامات التدقيق
├── audit-utils.ts        # أدوات مساعدة
└── index.ts              # ملف التصدير
```

## 🚫 الملفات الممنوع تعديلها
- `server/*Router.ts`
- `drizzle/schema.ts`
- `client/src/**/*`

---

## 📝 خطوات التنفيذ

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task18-audit-trail
```

### الخطوة 2: إنشاء المجلد
```bash
mkdir -p server/audit
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
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
```

### الخطوة 4: إنشاء ملف audit-utils.ts
```typescript
// server/audit/audit-utils.ts

import { AuditChange } from './types';

/**
 * مقارنة كائنين وإرجاع التغييرات
 */
export function detectChanges(
  oldValue: Record<string, unknown>,
  newValue: Record<string, unknown>,
  excludeFields: string[] = ['updatedAt', 'createdAt']
): AuditChange[] {
  const changes: AuditChange[] = [];
  const allKeys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);

  for (const key of allKeys) {
    if (excludeFields.includes(key)) continue;

    const oldVal = oldValue[key];
    const newVal = newValue[key];

    if (!deepEqual(oldVal, newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal,
        newValue: newVal,
      });
    }
  }

  return changes;
}

/**
 * مقارنة عميقة بين قيمتين
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) =>
      deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }

  return false;
}

/**
 * إخفاء البيانات الحساسة
 */
export function maskSensitiveData(
  data: Record<string, unknown>,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey', 'creditCard']
): Record<string, unknown> {
  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (field in masked) {
      masked[field] = '********';
    }
  }

  return masked;
}

/**
 * توليد معرف فريد
 */
export function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * تنسيق التغييرات للعرض
 */
export function formatChanges(changes: AuditChange[]): string {
  return changes
    .map((c) => `${c.field}: "${c.oldValue}" → "${c.newValue}"`)
    .join(', ');
}

/**
 * الحصول على وصف العملية بالعربية
 */
export function getActionDescription(action: string, entityType: string): string {
  const actions: Record<string, string> = {
    create: 'إنشاء',
    read: 'قراءة',
    update: 'تحديث',
    delete: 'حذف',
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
    export: 'تصدير',
    import: 'استيراد',
  };

  const entities: Record<string, string> = {
    voucher: 'سند',
    party: 'طرف',
    treasury: 'خزينة',
    category: 'فئة',
    user: 'مستخدم',
    business: 'شركة',
  };

  const actionAr = actions[action] || action;
  const entityAr = entities[entityType] || entityType;

  return `${actionAr} ${entityAr}`;
}
```

### الخطوة 5: إنشاء ملف audit-logger.ts
```typescript
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
  private async log(
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
```

### الخطوة 6: إنشاء ملف audit-middleware.ts
```typescript
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
```

### الخطوة 7: إنشاء ملف audit-queries.ts
```typescript
// server/audit/audit-queries.ts

import * as fs from 'fs';
import * as readline from 'readline';
import { AuditEntry, AuditFilter } from './types';
import { auditLogger } from './audit-logger';

class AuditQueries {
  private filePath: string;

  constructor(filePath = './logs/audit.log') {
    this.filePath = filePath;
  }

  /**
   * البحث في سجلات التدقيق
   */
  async search(filter: AuditFilter, limit = 100): Promise<AuditEntry[]> {
    // البحث في الذاكرة أولاً
    let entries = auditLogger.getEntries();

    // إذا لم تكن كافية، اقرأ من الملف
    if (entries.length < limit && fs.existsSync(this.filePath)) {
      const fileEntries = await this.readFromFile(limit * 2);
      entries = [...fileEntries, ...entries];
    }

    // تطبيق الفلاتر
    return this.applyFilters(entries, filter).slice(0, limit);
  }

  /**
   * الحصول على سجلات كيان معين
   */
  async getEntityHistory(
    entityType: string,
    entityId: string | number,
    limit = 50
  ): Promise<AuditEntry[]> {
    return this.search({ entityType, entityId }, limit);
  }

  /**
   * الحصول على سجلات مستخدم معين
   */
  async getUserActivity(userId: number, limit = 50): Promise<AuditEntry[]> {
    return this.search({ userId }, limit);
  }

  /**
   * الحصول على سجلات فترة معينة
   */
  async getByDateRange(startDate: Date, endDate: Date, limit = 100): Promise<AuditEntry[]> {
    return this.search({ startDate, endDate }, limit);
  }

  /**
   * الحصول على إحصائيات التدقيق
   */
  async getStats(filter: AuditFilter = {}): Promise<{
    total: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const entries = await this.search(filter, 10000);

    const stats = {
      total: entries.length,
      byAction: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    for (const entry of entries) {
      stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;
      stats.byEntity[entry.entityType] = (stats.byEntity[entry.entityType] || 0) + 1;
      stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * القراءة من الملف
   */
  private async readFromFile(limit: number): Promise<AuditEntry[]> {
    return new Promise((resolve) => {
      const entries: AuditEntry[] = [];
      
      if (!fs.existsSync(this.filePath)) {
        resolve([]);
        return;
      }

      const rl = readline.createInterface({
        input: fs.createReadStream(this.filePath),
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        try {
          const entry = JSON.parse(line) as AuditEntry;
          entry.timestamp = new Date(entry.timestamp);
          entries.push(entry);
        } catch {
          // تجاهل الأسطر غير الصالحة
        }
      });

      rl.on('close', () => {
        // إرجاع آخر N سجل
        resolve(entries.slice(-limit));
      });
    });
  }

  /**
   * تطبيق الفلاتر
   */
  private applyFilters(entries: AuditEntry[], filter: AuditFilter): AuditEntry[] {
    return entries.filter((entry) => {
      if (filter.startDate && entry.timestamp < filter.startDate) return false;
      if (filter.endDate && entry.timestamp > filter.endDate) return false;
      if (filter.action) {
        const actions = Array.isArray(filter.action) ? filter.action : [filter.action];
        if (!actions.includes(entry.action)) return false;
      }
      if (filter.entityType && entry.entityType !== filter.entityType) return false;
      if (filter.entityId && entry.entityId !== filter.entityId) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.businessId && entry.businessId !== filter.businessId) return false;
      if (filter.status && entry.status !== filter.status) return false;
      return true;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const auditQueries = new AuditQueries();
```

### الخطوة 8: إنشاء ملف index.ts
```typescript
// server/audit/index.ts

export * from './types';
export * from './audit-utils';
export * from './audit-logger';
export * from './audit-middleware';
export * from './audit-queries';

export { auditLogger } from './audit-logger';
export { auditQueries } from './audit-queries';
```

### الخطوة 9: رفع التغييرات
```bash
git add server/audit/
git commit -m "feat(audit): إضافة نظام Audit Trail

- إضافة تسجيل العمليات (CRUD, login, logout)
- إضافة Middleware للتدقيق التلقائي
- إضافة استعلامات البحث والإحصائيات
- إضافة أدوات مساعدة (كشف التغييرات، إخفاء البيانات الحساسة)"

git push origin feature/task18-audit-trail
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/audit/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `audit-utils.ts`
- [ ] إنشاء ملف `audit-logger.ts`
- [ ] إنشاء ملف `audit-middleware.ts`
- [ ] إنشاء ملف `audit-queries.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
