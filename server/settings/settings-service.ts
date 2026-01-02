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
