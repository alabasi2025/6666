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
  const allKeys = Array.from(new Set([...Object.keys(oldValue), ...Object.keys(newValue)]));

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
