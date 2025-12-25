/**
 * @fileoverview مُصدِّر JSON
 * @description يوفر هذا الملف وظائف تصدير البيانات بتنسيق JSON
 */

import type {
  ExportData,
  ExportResult,
  JSONExportOptions,
  ExporterOptions,
  Exporter,
  ExportFormat,
} from './types';
import {
  generateFilename,
  validateExportData,
  createSuccessResult,
  createErrorResult,
  downloadText,
  getVisibleColumns,
  formatValue,
  getNestedValue,
} from './export-utils';

/**
 * الخيارات الافتراضية لتصدير JSON
 */
const DEFAULT_JSON_OPTIONS: Partial<JSONExportOptions> = {
  pretty: true,
  indentSpaces: 2,
  includeMetadata: true,
  includeExportTimestamp: true,
  includeTimestamp: true,
  direction: 'rtl',
};

/**
 * واجهة بيانات JSON المُصدَّرة
 */
interface ExportedJSONData {
  /** البيانات الوصفية */
  metadata?: {
    /** عنوان التقرير */
    title?: string;
    /** وصف التقرير */
    description?: string;
    /** تاريخ التصدير */
    exportedAt?: string;
    /** عدد السجلات */
    recordCount?: number;
    /** الأعمدة */
    columns?: Array<{
      key: string;
      header: string;
      dataType?: string;
    }>;
  };
  /** البيانات */
  data: Record<string, unknown>[];
}

/**
 * تحويل البيانات إلى تنسيق JSON
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns كائن JSON
 */
function dataToJSONObject(
  data: ExportData,
  options: JSONExportOptions
): ExportedJSONData {
  const visibleColumns = getVisibleColumns(data.columns);
  const { includeMetadata = true, includeExportTimestamp = true, title, description } = options;

  const result: ExportedJSONData = {
    data: [],
  };

  // إضافة البيانات الوصفية
  if (includeMetadata) {
    result.metadata = {
      title: title || data.metadata?.title,
      description: description || data.metadata?.description,
      recordCount: data.rows.length,
      columns: visibleColumns.map((col) => ({
        key: col.key,
        header: col.header,
        dataType: col.dataType,
      })),
    };

    if (includeExportTimestamp) {
      result.metadata.exportedAt = new Date().toISOString();
    }
  }

  // تحويل الصفوف
  for (const row of data.rows) {
    const jsonRow: Record<string, unknown> = {};
    
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      
      // الاحتفاظ بالقيمة الأصلية للأنواع الرقمية والمنطقية
      if (col.dataType === 'number' || col.dataType === 'currency') {
        jsonRow[col.key] = typeof rawValue === 'number' ? rawValue : null;
      } else if (col.dataType === 'boolean') {
        jsonRow[col.key] = Boolean(rawValue);
      } else if (col.dataType === 'date') {
        if (rawValue instanceof Date) {
          jsonRow[col.key] = rawValue.toISOString();
        } else if (typeof rawValue === 'string' || typeof rawValue === 'number') {
          const date = new Date(rawValue);
          jsonRow[col.key] = !isNaN(date.getTime()) ? date.toISOString() : rawValue;
        } else {
          jsonRow[col.key] = rawValue;
        }
      } else {
        // للنصوص، استخدام المُنسِّق إن وجد
        jsonRow[col.key] = col.formatter
          ? col.formatter(rawValue, row as Record<string, unknown>)
          : rawValue;
      }
    }
    
    result.data.push(jsonRow);
  }

  return result;
}

/**
 * تصدير البيانات كـ JSON
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function exportToJSON(
  data: ExportData,
  options: ExporterOptions<JSONExportOptions>
): Promise<ExportResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_JSON_OPTIONS, ...options } as JSONExportOptions;
  
  try {
    // إطلاق حدث البدء
    options.onStart?.();
    
    // التحقق من صحة البيانات
    const validation = validateExportData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // إطلاق حدث التقدم
    options.onProgress?.(20);
    
    // تحويل البيانات إلى JSON
    const jsonObject = dataToJSONObject(data, mergedOptions);
    
    options.onProgress?.(50);
    
    // تحويل إلى نص
    const jsonString = mergedOptions.pretty
      ? JSON.stringify(jsonObject, null, mergedOptions.indentSpaces)
      : JSON.stringify(jsonObject);
    
    options.onProgress?.(80);
    
    // إنشاء اسم الملف
    const filename = generateFilename(
      mergedOptions.filename,
      'json',
      mergedOptions.includeTimestamp
    );
    
    // تنزيل الملف
    downloadText(jsonString, filename, 'application/json;charset=utf-8');
    
    options.onProgress?.(100);
    
    // إنشاء نتيجة النجاح
    const result = createSuccessResult(
      filename,
      data.rows.length,
      new Blob([jsonString]).size,
      startTime
    );
    
    // إطلاق أحداث النجاح والاكتمال
    options.onSuccess?.(result);
    options.onComplete?.();
    
    return result;
  } catch (error) {
    const result = createErrorResult(error as Error);
    options.onError?.(error as Error);
    options.onComplete?.();
    return result;
  }
}

/**
 * تحويل البيانات إلى نص JSON (بدون تنزيل)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns نص JSON
 */
export function dataToJSONString(
  data: ExportData,
  options: Partial<JSONExportOptions> = {}
): string {
  const mergedOptions = { ...DEFAULT_JSON_OPTIONS, ...options } as JSONExportOptions;
  
  // التحقق من صحة البيانات
  const validation = validateExportData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // تحويل البيانات إلى JSON
  const jsonObject = dataToJSONObject(data, mergedOptions);
  
  // تحويل إلى نص
  return mergedOptions.pretty
    ? JSON.stringify(jsonObject, null, mergedOptions.indentSpaces)
    : JSON.stringify(jsonObject);
}

/**
 * تحويل البيانات إلى كائن JSON (بدون تنزيل)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns كائن JSON
 */
export function dataToJSON(
  data: ExportData,
  options: Partial<JSONExportOptions> = {}
): ExportedJSONData {
  const mergedOptions = { ...DEFAULT_JSON_OPTIONS, ...options } as JSONExportOptions;
  
  // التحقق من صحة البيانات
  const validation = validateExportData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  return dataToJSONObject(data, mergedOptions);
}

/**
 * تحليل نص JSON إلى بيانات تصدير
 * @param jsonString - نص JSON
 * @returns بيانات التصدير
 */
export function parseJSONToExportData(jsonString: string): ExportData {
  const parsed = JSON.parse(jsonString) as ExportedJSONData;
  
  if (!parsed.data || !Array.isArray(parsed.data)) {
    throw new Error('تنسيق JSON غير صالح: يجب أن يحتوي على مصفوفة "data"');
  }
  
  // استخراج الأعمدة من البيانات الوصفية أو من أول صف
  let columns = parsed.metadata?.columns?.map((col) => ({
    key: col.key,
    header: col.header,
    dataType: col.dataType as 'string' | 'number' | 'date' | 'boolean' | 'currency' | undefined,
  }));
  
  if (!columns && parsed.data.length > 0) {
    columns = Object.keys(parsed.data[0]).map((key) => ({
      key,
      header: key,
      dataType: 'string' as const,
    }));
  }
  
  return {
    columns: columns || [],
    rows: parsed.data,
    metadata: parsed.metadata
      ? {
          title: parsed.metadata.title,
          description: parsed.metadata.description,
          createdAt: parsed.metadata.exportedAt
            ? new Date(parsed.metadata.exportedAt)
            : undefined,
        }
      : undefined,
  };
}

/**
 * فئة مُصدِّر JSON
 */
export class JSONExporter implements Exporter<JSONExportOptions> {
  private defaultOptions: Partial<JSONExportOptions>;
  
  constructor(defaultOptions: Partial<JSONExportOptions> = {}) {
    this.defaultOptions = { ...DEFAULT_JSON_OPTIONS, ...defaultOptions };
  }
  
  /**
   * تصدير البيانات
   */
  async export(
    data: ExportData,
    options: ExporterOptions<JSONExportOptions>
  ): Promise<ExportResult> {
    return exportToJSON(data, { ...this.defaultOptions, ...options });
  }
  
  /**
   * التحقق من صحة البيانات
   */
  validate(data: ExportData): boolean {
    return validateExportData(data).valid;
  }
  
  /**
   * الحصول على التنسيق المدعوم
   */
  getFormat(): ExportFormat {
    return 'json';
  }
  
  /**
   * تحويل البيانات إلى نص JSON
   */
  toString(data: ExportData, options: Partial<JSONExportOptions> = {}): string {
    return dataToJSONString(data, { ...this.defaultOptions, ...options });
  }
  
  /**
   * تحويل البيانات إلى كائن JSON
   */
  toObject(data: ExportData, options: Partial<JSONExportOptions> = {}): ExportedJSONData {
    return dataToJSON(data, { ...this.defaultOptions, ...options });
  }
  
  /**
   * تحليل نص JSON
   */
  parse(jsonString: string): ExportData {
    return parseJSONToExportData(jsonString);
  }
}

/**
 * إنشاء مثيل افتراضي من مُصدِّر JSON
 */
export const jsonExporter = new JSONExporter();

export default jsonExporter;
