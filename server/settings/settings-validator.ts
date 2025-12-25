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
