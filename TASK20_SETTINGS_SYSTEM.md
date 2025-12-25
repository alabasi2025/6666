# 📋 المهمة 20: إنشاء نظام الإعدادات

## 🎯 الهدف
إنشاء نظام إعدادات مركزي للتطبيق يدعم إعدادات متعددة المستويات.

## 📁 الفرع
```
feature/task20-settings-system
```

## ⏱️ الوقت المتوقع
2-3 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/settings/
├── types.ts              # أنواع TypeScript
├── default-settings.ts   # الإعدادات الافتراضية
├── settings-service.ts   # خدمة الإعدادات
├── settings-validator.ts # التحقق من الإعدادات
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
git checkout feature/task20-settings-system
```

### الخطوة 2: إنشاء المجلد
```bash
mkdir -p server/settings
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/settings/types.ts

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array';
export type SettingScope = 'system' | 'business' | 'user';

export interface SettingDefinition {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: SettingType;
  scope: SettingScope;
  defaultValue: unknown;
  category: string;
  validation?: SettingValidation;
  options?: SettingOption[];
  isSecret?: boolean;
  isReadOnly?: boolean;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: unknown[];
}

export interface SettingOption {
  value: unknown;
  label: string;
  labelAr: string;
}

export interface SettingValue {
  key: string;
  value: unknown;
  scope: SettingScope;
  scopeId?: number; // businessId or userId
  updatedAt: Date;
  updatedBy?: number;
}

export interface SettingsGroup {
  category: string;
  categoryAr: string;
  settings: SettingDefinition[];
}
```

### الخطوة 4: إنشاء ملف default-settings.ts
```typescript
// server/settings/default-settings.ts

import { SettingDefinition } from './types';

export const DefaultSettings: SettingDefinition[] = [
  // إعدادات عامة
  {
    key: 'app.language',
    name: 'Default Language',
    nameAr: 'اللغة الافتراضية',
    description: 'Default application language',
    descriptionAr: 'اللغة الافتراضية للتطبيق',
    type: 'string',
    scope: 'business',
    defaultValue: 'ar',
    category: 'general',
    options: [
      { value: 'ar', label: 'Arabic', labelAr: 'العربية' },
      { value: 'en', label: 'English', labelAr: 'الإنجليزية' },
    ],
  },
  {
    key: 'app.timezone',
    name: 'Timezone',
    nameAr: 'المنطقة الزمنية',
    description: 'Application timezone',
    descriptionAr: 'المنطقة الزمنية للتطبيق',
    type: 'string',
    scope: 'business',
    defaultValue: 'Asia/Riyadh',
    category: 'general',
  },
  {
    key: 'app.dateFormat',
    name: 'Date Format',
    nameAr: 'تنسيق التاريخ',
    description: 'Date display format',
    descriptionAr: 'تنسيق عرض التاريخ',
    type: 'string',
    scope: 'business',
    defaultValue: 'DD/MM/YYYY',
    category: 'general',
    options: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', labelAr: 'يوم/شهر/سنة' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', labelAr: 'شهر/يوم/سنة' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', labelAr: 'سنة-شهر-يوم' },
    ],
  },

  // إعدادات العملة
  {
    key: 'currency.default',
    name: 'Default Currency',
    nameAr: 'العملة الافتراضية',
    description: 'Default currency for transactions',
    descriptionAr: 'العملة الافتراضية للمعاملات',
    type: 'string',
    scope: 'business',
    defaultValue: 'SAR',
    category: 'currency',
    options: [
      { value: 'SAR', label: 'Saudi Riyal', labelAr: 'ريال سعودي' },
      { value: 'USD', label: 'US Dollar', labelAr: 'دولار أمريكي' },
      { value: 'EUR', label: 'Euro', labelAr: 'يورو' },
      { value: 'AED', label: 'UAE Dirham', labelAr: 'درهم إماراتي' },
    ],
  },
  {
    key: 'currency.decimals',
    name: 'Decimal Places',
    nameAr: 'الخانات العشرية',
    description: 'Number of decimal places for amounts',
    descriptionAr: 'عدد الخانات العشرية للمبالغ',
    type: 'number',
    scope: 'business',
    defaultValue: 2,
    category: 'currency',
    validation: { min: 0, max: 4 },
  },

  // إعدادات السندات
  {
    key: 'voucher.autoNumber',
    name: 'Auto Numbering',
    nameAr: 'الترقيم التلقائي',
    description: 'Enable automatic voucher numbering',
    descriptionAr: 'تفعيل الترقيم التلقائي للسندات',
    type: 'boolean',
    scope: 'business',
    defaultValue: true,
    category: 'voucher',
  },
  {
    key: 'voucher.numberPrefix',
    name: 'Number Prefix',
    nameAr: 'بادئة الرقم',
    description: 'Prefix for voucher numbers',
    descriptionAr: 'بادئة أرقام السندات',
    type: 'string',
    scope: 'business',
    defaultValue: 'V',
    category: 'voucher',
    validation: { maxLength: 5 },
  },
  {
    key: 'voucher.requireApproval',
    name: 'Require Approval',
    nameAr: 'يتطلب موافقة',
    description: 'Require approval for vouchers',
    descriptionAr: 'طلب موافقة على السندات',
    type: 'boolean',
    scope: 'business',
    defaultValue: false,
    category: 'voucher',
  },
  {
    key: 'voucher.approvalThreshold',
    name: 'Approval Threshold',
    nameAr: 'حد الموافقة',
    description: 'Amount threshold requiring approval',
    descriptionAr: 'المبلغ الذي يتطلب موافقة',
    type: 'number',
    scope: 'business',
    defaultValue: 10000,
    category: 'voucher',
    validation: { min: 0 },
  },

  // إعدادات التقارير
  {
    key: 'report.defaultFormat',
    name: 'Default Format',
    nameAr: 'التنسيق الافتراضي',
    description: 'Default report export format',
    descriptionAr: 'تنسيق التصدير الافتراضي للتقارير',
    type: 'string',
    scope: 'user',
    defaultValue: 'pdf',
    category: 'report',
    options: [
      { value: 'pdf', label: 'PDF', labelAr: 'PDF' },
      { value: 'excel', label: 'Excel', labelAr: 'Excel' },
      { value: 'csv', label: 'CSV', labelAr: 'CSV' },
    ],
  },
  {
    key: 'report.pageSize',
    name: 'Page Size',
    nameAr: 'حجم الصفحة',
    description: 'Default page size for reports',
    descriptionAr: 'حجم الصفحة الافتراضي للتقارير',
    type: 'string',
    scope: 'user',
    defaultValue: 'A4',
    category: 'report',
    options: [
      { value: 'A4', label: 'A4', labelAr: 'A4' },
      { value: 'A3', label: 'A3', labelAr: 'A3' },
      { value: 'Letter', label: 'Letter', labelAr: 'Letter' },
    ],
  },

  // إعدادات الإشعارات
  {
    key: 'notification.email',
    name: 'Email Notifications',
    nameAr: 'إشعارات البريد',
    description: 'Enable email notifications',
    descriptionAr: 'تفعيل إشعارات البريد الإلكتروني',
    type: 'boolean',
    scope: 'user',
    defaultValue: true,
    category: 'notification',
  },
  {
    key: 'notification.sms',
    name: 'SMS Notifications',
    nameAr: 'إشعارات SMS',
    description: 'Enable SMS notifications',
    descriptionAr: 'تفعيل إشعارات الرسائل النصية',
    type: 'boolean',
    scope: 'user',
    defaultValue: false,
    category: 'notification',
  },
  {
    key: 'notification.inApp',
    name: 'In-App Notifications',
    nameAr: 'إشعارات التطبيق',
    description: 'Enable in-app notifications',
    descriptionAr: 'تفعيل الإشعارات داخل التطبيق',
    type: 'boolean',
    scope: 'user',
    defaultValue: true,
    category: 'notification',
  },

  // إعدادات الأمان
  {
    key: 'security.sessionTimeout',
    name: 'Session Timeout',
    nameAr: 'مهلة الجلسة',
    description: 'Session timeout in minutes',
    descriptionAr: 'مهلة انتهاء الجلسة بالدقائق',
    type: 'number',
    scope: 'system',
    defaultValue: 60,
    category: 'security',
    validation: { min: 5, max: 1440 },
  },
  {
    key: 'security.maxLoginAttempts',
    name: 'Max Login Attempts',
    nameAr: 'محاولات تسجيل الدخول',
    description: 'Maximum failed login attempts',
    descriptionAr: 'الحد الأقصى لمحاولات تسجيل الدخول الفاشلة',
    type: 'number',
    scope: 'system',
    defaultValue: 5,
    category: 'security',
    validation: { min: 3, max: 10 },
  },
  {
    key: 'security.passwordMinLength',
    name: 'Min Password Length',
    nameAr: 'طول كلمة المرور',
    description: 'Minimum password length',
    descriptionAr: 'الحد الأدنى لطول كلمة المرور',
    type: 'number',
    scope: 'system',
    defaultValue: 8,
    category: 'security',
    validation: { min: 6, max: 32 },
  },
];

/**
 * الحصول على إعداد بالمفتاح
 */
export function getSettingDefinition(key: string): SettingDefinition | undefined {
  return DefaultSettings.find((s) => s.key === key);
}

/**
 * الحصول على الإعدادات حسب الفئة
 */
export function getSettingsByCategory(category: string): SettingDefinition[] {
  return DefaultSettings.filter((s) => s.category === category);
}

/**
 * الحصول على الإعدادات حسب النطاق
 */
export function getSettingsByScope(scope: string): SettingDefinition[] {
  return DefaultSettings.filter((s) => s.scope === scope);
}

/**
 * الحصول على جميع الفئات
 */
export function getAllCategories(): string[] {
  return [...new Set(DefaultSettings.map((s) => s.category))];
}
```

### الخطوة 5: إنشاء ملف settings-validator.ts
```typescript
// server/settings/settings-validator.ts

import { SettingDefinition, SettingValidation } from './types';
import { getSettingDefinition } from './default-settings';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class SettingsValidator {
  /**
   * التحقق من قيمة إعداد
   */
  validate(key: string, value: unknown): ValidationResult {
    const definition = getSettingDefinition(key);
    if (!definition) {
      return { valid: false, errors: ['الإعداد غير موجود'] };
    }

    const errors: string[] = [];

    // التحقق من النوع
    if (!this.validateType(value, definition.type)) {
      errors.push(`نوع القيمة غير صحيح، المتوقع: ${definition.type}`);
    }

    // التحقق من القواعد
    if (definition.validation) {
      const validationErrors = this.validateRules(value, definition.validation, definition.type);
      errors.push(...validationErrors);
    }

    // التحقق من الخيارات
    if (definition.options && definition.options.length > 0) {
      const validValues = definition.options.map((o) => o.value);
      if (!validValues.includes(value)) {
        errors.push('القيمة غير موجودة في الخيارات المتاحة');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * التحقق من النوع
   */
  private validateType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'json':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * التحقق من القواعد
   */
  private validateRules(
    value: unknown,
    validation: SettingValidation,
    type: string
  ): string[] {
    const errors: string[] = [];

    if (validation.required && (value === null || value === undefined || value === '')) {
      errors.push('هذا الإعداد مطلوب');
    }

    if (type === 'number' && typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`القيمة يجب أن تكون أكبر من أو تساوي ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`القيمة يجب أن تكون أقل من أو تساوي ${validation.max}`);
      }
    }

    if (type === 'string' && typeof value === 'string') {
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        errors.push(`الطول يجب أن يكون ${validation.minLength} حرف على الأقل`);
      }
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        errors.push(`الطول يجب أن يكون ${validation.maxLength} حرف على الأكثر`);
      }
      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push('القيمة لا تطابق النمط المطلوب');
        }
      }
    }

    if (validation.enum && !validation.enum.includes(value)) {
      errors.push('القيمة غير موجودة في القيم المسموحة');
    }

    return errors;
  }

  /**
   * التحقق من مجموعة إعدادات
   */
  validateBatch(settings: Record<string, unknown>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    for (const [key, value] of Object.entries(settings)) {
      results[key] = this.validate(key, value);
    }
    
    return results;
  }
}

export const settingsValidator = new SettingsValidator();
```

### الخطوة 6: إنشاء ملف settings-service.ts
```typescript
// server/settings/settings-service.ts

import { SettingValue, SettingScope, SettingsGroup } from './types';
import { DefaultSettings, getSettingDefinition, getAllCategories } from './default-settings';
import { settingsValidator } from './settings-validator';

class SettingsService {
  private values: Map<string, SettingValue> = new Map();

  /**
   * الحصول على قيمة إعداد
   */
  get<T>(key: string, scope: SettingScope = 'business', scopeId?: number): T {
    const fullKey = this.buildKey(key, scope, scopeId);
    const stored = this.values.get(fullKey);
    
    if (stored) {
      return stored.value as T;
    }

    // إرجاع القيمة الافتراضية
    const definition = getSettingDefinition(key);
    return (definition?.defaultValue ?? null) as T;
  }

  /**
   * تعيين قيمة إعداد
   */
  set(
    key: string,
    value: unknown,
    scope: SettingScope = 'business',
    scopeId?: number,
    updatedBy?: number
  ): { success: boolean; errors?: string[] } {
    // التحقق من صحة القيمة
    const validation = settingsValidator.validate(key, value);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const fullKey = this.buildKey(key, scope, scopeId);
    
    this.values.set(fullKey, {
      key,
      value,
      scope,
      scopeId,
      updatedAt: new Date(),
      updatedBy,
    });

    return { success: true };
  }

  /**
   * حذف قيمة إعداد (العودة للقيمة الافتراضية)
   */
  reset(key: string, scope: SettingScope = 'business', scopeId?: number): boolean {
    const fullKey = this.buildKey(key, scope, scopeId);
    return this.values.delete(fullKey);
  }

  /**
   * الحصول على جميع الإعدادات لنطاق معين
   */
  getAll(scope: SettingScope, scopeId?: number): Record<string, unknown> {
    const settings: Record<string, unknown> = {};
    
    for (const definition of DefaultSettings) {
      if (definition.scope === scope) {
        settings[definition.key] = this.get(definition.key, scope, scopeId);
      }
    }
    
    return settings;
  }

  /**
   * تعيين مجموعة إعدادات
   */
  setBatch(
    settings: Record<string, unknown>,
    scope: SettingScope = 'business',
    scopeId?: number,
    updatedBy?: number
  ): Record<string, { success: boolean; errors?: string[] }> {
    const results: Record<string, { success: boolean; errors?: string[] }> = {};
    
    for (const [key, value] of Object.entries(settings)) {
      results[key] = this.set(key, value, scope, scopeId, updatedBy);
    }
    
    return results;
  }

  /**
   * الحصول على الإعدادات مجمعة حسب الفئة
   */
  getGrouped(scope: SettingScope, scopeId?: number): SettingsGroup[] {
    const categories = getAllCategories();
    const categoryNames: Record<string, string> = {
      general: 'عام',
      currency: 'العملة',
      voucher: 'السندات',
      report: 'التقارير',
      notification: 'الإشعارات',
      security: 'الأمان',
    };

    return categories.map((category) => ({
      category,
      categoryAr: categoryNames[category] || category,
      settings: DefaultSettings.filter(
        (s) => s.category === category && s.scope === scope
      ),
    }));
  }

  /**
   * بناء المفتاح الكامل
   */
  private buildKey(key: string, scope: SettingScope, scopeId?: number): string {
    if (scope === 'system') {
      return `system:${key}`;
    }
    return `${scope}:${scopeId || 0}:${key}`;
  }

  /**
   * تصدير الإعدادات
   */
  export(scope: SettingScope, scopeId?: number): string {
    const settings = this.getAll(scope, scopeId);
    return JSON.stringify(settings, null, 2);
  }

  /**
   * استيراد الإعدادات
   */
  import(
    json: string,
    scope: SettingScope,
    scopeId?: number,
    updatedBy?: number
  ): { success: boolean; imported: number; errors: string[] } {
    try {
      const settings = JSON.parse(json);
      const results = this.setBatch(settings, scope, scopeId, updatedBy);
      
      let imported = 0;
      const errors: string[] = [];
      
      for (const [key, result] of Object.entries(results)) {
        if (result.success) {
          imported++;
        } else {
          errors.push(`${key}: ${result.errors?.join(', ')}`);
        }
      }
      
      return { success: errors.length === 0, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: ['JSON غير صالح'] };
    }
  }
}

export const settingsService = new SettingsService();
```

### الخطوة 7: إنشاء ملف index.ts
```typescript
// server/settings/index.ts

export * from './types';
export * from './default-settings';
export * from './settings-validator';
export * from './settings-service';

export { settingsService } from './settings-service';
export { settingsValidator } from './settings-validator';
```

### الخطوة 8: رفع التغييرات
```bash
git add server/settings/
git commit -m "feat(settings): إضافة نظام الإعدادات

- إضافة تعريفات الإعدادات الافتراضية
- إضافة خدمة الإعدادات مع دعم النطاقات
- إضافة التحقق من صحة الإعدادات
- دعم التصدير والاستيراد"

git push origin feature/task20-settings-system
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/settings/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `default-settings.ts`
- [ ] إنشاء ملف `settings-validator.ts`
- [ ] إنشاء ملف `settings-service.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
