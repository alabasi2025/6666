/**
 * @fileoverview أدوات مساعدة للتصدير
 * @description يحتوي هذا الملف على الدوال المساعدة المشتركة لجميع أدوات التصدير
 */

import type {
  ExportColumn,
  ExportData,
  ExportResult,
  ColumnDataType,
  TextDirection,
} from './types';

/**
 * تنسيق التاريخ والوقت للطابع الزمني
 * @param date - كائن التاريخ
 * @returns سلسلة نصية بتنسيق YYYYMMDD_HHMMSS
 */
export function formatTimestamp(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * إنشاء اسم الملف مع الطابع الزمني
 * @param baseName - الاسم الأساسي للملف
 * @param extension - امتداد الملف
 * @param includeTimestamp - تضمين الطابع الزمني
 * @returns اسم الملف الكامل
 */
export function generateFilename(
  baseName: string,
  extension: string,
  includeTimestamp: boolean = true
): string {
  const sanitizedName = sanitizeFilename(baseName);
  const timestamp = includeTimestamp ? `_${formatTimestamp()}` : '';
  return `${sanitizedName}${timestamp}.${extension}`;
}

/**
 * تنظيف اسم الملف من الأحرف غير المسموح بها
 * @param filename - اسم الملف
 * @returns اسم الملف المُنظَّف
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 200);
}

/**
 * تنسيق القيمة حسب نوع البيانات
 * @param value - القيمة
 * @param dataType - نوع البيانات
 * @param locale - اللغة المحلية
 * @returns القيمة المُنسَّقة
 */
export function formatValue(
  value: unknown,
  dataType: ColumnDataType = 'string',
  locale: string = 'ar-SA'
): string {
  if (value === null || value === undefined) {
    return '';
  }

  switch (dataType) {
    case 'number':
      if (typeof value === 'number') {
        return new Intl.NumberFormat(locale).format(value);
      }
      return String(value);

    case 'currency':
      if (typeof value === 'number') {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'SAR',
        }).format(value);
      }
      return String(value);

    case 'date':
      if (value instanceof Date) {
        return new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(value);
      }
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(date);
        }
      }
      return String(value);

    case 'boolean':
      return value ? 'نعم' : 'لا';

    case 'string':
    default:
      return String(value);
  }
}

/**
 * استخراج قيمة من كائن باستخدام مسار النقطة
 * @param obj - الكائن
 * @param path - مسار الخاصية (مثل 'user.name')
 * @returns القيمة
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part: string) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

/**
 * تحويل البيانات إلى مصفوفة ثنائية الأبعاد
 * @param data - بيانات التصدير
 * @param includeHeaders - تضمين الرؤوس
 * @returns مصفوفة ثنائية الأبعاد
 */
export function dataToMatrix(
  data: ExportData,
  includeHeaders: boolean = true
): string[][] {
  const visibleColumns = data.columns.filter((col) => !col.hidden);
  const matrix: string[][] = [];

  // إضافة صف الرؤوس
  if (includeHeaders) {
    matrix.push(visibleColumns.map((col) => col.header));
  }

  // إضافة صفوف البيانات
  for (const row of data.rows) {
    const rowData: string[] = [];
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(rawValue, row as Record<string, unknown>)
        : formatValue(rawValue, col.dataType);
      rowData.push(formattedValue);
    }
    matrix.push(rowData);
  }

  return matrix;
}

/**
 * حساب عرض الأعمدة التلقائي
 * @param data - بيانات التصدير
 * @param minWidth - الحد الأدنى للعرض
 * @param maxWidth - الحد الأقصى للعرض
 * @returns قائمة عروض الأعمدة
 */
export function calculateColumnWidths(
  data: ExportData,
  minWidth: number = 50,
  maxWidth: number = 300
): number[] {
  const visibleColumns = data.columns.filter((col) => !col.hidden);
  const widths: number[] = [];

  for (const col of visibleColumns) {
    // عرض الرأس
    let maxLength = col.header.length;

    // فحص عرض البيانات
    for (const row of data.rows) {
      const value = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(value, row as Record<string, unknown>)
        : formatValue(value, col.dataType);
      maxLength = Math.max(maxLength, formattedValue.length);
    }

    // حساب العرض (تقريبي: 8 بكسل لكل حرف)
    const calculatedWidth = Math.min(Math.max(maxLength * 8, minWidth), maxWidth);
    widths.push(calculatedWidth);
  }

  return widths;
}

/**
 * تحويل الاتجاه إلى سمة CSS
 * @param direction - اتجاه النص
 * @returns سمة CSS
 */
export function directionToCSS(direction: TextDirection): string {
  return direction === 'rtl' ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;';
}

/**
 * إنشاء نتيجة تصدير ناجحة
 * @param filename - اسم الملف
 * @param rowCount - عدد الصفوف
 * @param fileSize - حجم الملف
 * @param startTime - وقت البدء
 * @returns نتيجة التصدير
 */
export function createSuccessResult(
  filename: string,
  rowCount: number,
  fileSize?: number,
  startTime?: number
): ExportResult {
  return {
    success: true,
    message: `تم تصدير ${rowCount} صف بنجاح`,
    filename,
    rowCount,
    fileSize,
    duration: startTime ? Date.now() - startTime : undefined,
  };
}

/**
 * إنشاء نتيجة تصدير فاشلة
 * @param error - الخطأ
 * @returns نتيجة التصدير
 */
export function createErrorResult(error: Error | string): ExportResult {
  const errorMessage = error instanceof Error ? error.message : error;
  return {
    success: false,
    message: 'فشل التصدير',
    error: errorMessage,
  };
}

/**
 * التحقق من صحة بيانات التصدير
 * @param data - بيانات التصدير
 * @returns صحة البيانات
 */
export function validateExportData(data: ExportData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('بيانات التصدير مطلوبة');
    return { valid: false, errors };
  }

  if (!Array.isArray(data.columns) || data.columns.length === 0) {
    errors.push('يجب تحديد عمود واحد على الأقل');
  }

  if (!Array.isArray(data.rows)) {
    errors.push('يجب أن تكون الصفوف مصفوفة');
  }

  // التحقق من الأعمدة
  for (let i = 0; i < (data.columns?.length || 0); i++) {
    const col = data.columns[i];
    if (!col.key) {
      errors.push(`العمود ${i + 1}: معرف العمود (key) مطلوب`);
    }
    if (!col.header) {
      errors.push(`العمود ${i + 1}: عنوان العمود (header) مطلوب`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * تحويل البايتات إلى حجم قابل للقراءة
 * @param bytes - عدد البايتات
 * @returns حجم قابل للقراءة
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * تنزيل ملف Blob
 * @param blob - كائن Blob
 * @param filename - اسم الملف
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * تنزيل نص كملف
 * @param content - المحتوى النصي
 * @param filename - اسم الملف
 * @param mimeType - نوع MIME
 */
export function downloadText(
  content: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * الحصول على الأعمدة المرئية فقط
 * @param columns - قائمة الأعمدة
 * @returns الأعمدة المرئية
 */
export function getVisibleColumns(columns: ExportColumn[]): ExportColumn[] {
  return columns.filter((col) => !col.hidden);
}

/**
 * تأخير التنفيذ (للعمليات الطويلة)
 * @param ms - المدة بالمللي ثانية
 * @returns وعد
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * تقسيم المصفوفة إلى أجزاء
 * @param array - المصفوفة
 * @param chunkSize - حجم الجزء
 * @returns مصفوفة من الأجزاء
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * إنشاء معرف فريد
 * @returns معرف فريد
 */
export function generateUniqueId(): string {
  return `export_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
