/**
 * @fileoverview مُصدِّر CSV
 * @description يوفر هذا الملف وظائف تصدير البيانات بتنسيق CSV
 */

import type {
  ExportData,
  ExportResult,
  CSVExportOptions,
  ExporterOptions,
  Exporter,
  ExportFormat,
} from './types';
import {
  generateFilename,
  dataToMatrix,
  validateExportData,
  createSuccessResult,
  createErrorResult,
  downloadText,
  getVisibleColumns,
} from './export-utils';

/**
 * الخيارات الافتراضية لتصدير CSV
 */
const DEFAULT_CSV_OPTIONS: Partial<CSVExportOptions> = {
  delimiter: ',',
  includeBOM: true,
  encoding: 'utf-8',
  quoteChar: '"',
  includeHeaders: true,
  lineEnding: '\n',
  includeTimestamp: true,
  direction: 'rtl',
};

/**
 * تهريب القيمة لـ CSV
 * @param value - القيمة
 * @param delimiter - الفاصل
 * @param quoteChar - حرف الاقتباس
 * @returns القيمة المُهرَّبة
 */
function escapeCSVValue(value: string, delimiter: string, quoteChar: string): string {
  // إذا كانت القيمة تحتوي على الفاصل أو حرف الاقتباس أو سطر جديد، يجب إحاطتها بعلامات اقتباس
  const needsQuoting = value.includes(delimiter) || 
                       value.includes(quoteChar) || 
                       value.includes('\n') || 
                       value.includes('\r');
  
  if (needsQuoting) {
    // مضاعفة علامات الاقتباس داخل القيمة
    const escapedValue = value.replace(new RegExp(quoteChar, 'g'), quoteChar + quoteChar);
    return `${quoteChar}${escapedValue}${quoteChar}`;
  }
  
  return value;
}

/**
 * تحويل المصفوفة إلى نص CSV
 * @param matrix - المصفوفة ثنائية الأبعاد
 * @param options - خيارات CSV
 * @returns نص CSV
 */
function matrixToCSV(matrix: string[][], options: CSVExportOptions): string {
  const { delimiter = ',', quoteChar = '"', lineEnding = '\n' } = options;
  
  return matrix
    .map((row) => 
      row.map((cell) => escapeCSVValue(cell, delimiter, quoteChar)).join(delimiter)
    )
    .join(lineEnding);
}

/**
 * تصدير البيانات كـ CSV
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function exportToCSV(
  data: ExportData,
  options: ExporterOptions<CSVExportOptions>
): Promise<ExportResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_CSV_OPTIONS, ...options } as CSVExportOptions;
  
  try {
    // إطلاق حدث البدء
    options.onStart?.();
    
    // التحقق من صحة البيانات
    const validation = validateExportData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    
    // إطلاق حدث التقدم
    options.onProgress?.(10);
    
    // تحويل البيانات إلى مصفوفة
    const matrix = dataToMatrix(data, mergedOptions.includeHeaders);
    
    options.onProgress?.(50);
    
    // تحويل المصفوفة إلى CSV
    let csvContent = matrixToCSV(matrix, mergedOptions);
    
    // إضافة BOM للتوافق مع Excel
    if (mergedOptions.includeBOM) {
      csvContent = '\uFEFF' + csvContent;
    }
    
    options.onProgress?.(80);
    
    // إنشاء اسم الملف
    const filename = generateFilename(
      mergedOptions.filename,
      'csv',
      mergedOptions.includeTimestamp
    );
    
    // تنزيل الملف
    downloadText(csvContent, filename, 'text/csv;charset=utf-8');
    
    options.onProgress?.(100);
    
    // إنشاء نتيجة النجاح
    const result = createSuccessResult(
      filename,
      data.rows.length,
      new Blob([csvContent]).size,
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
 * تحويل البيانات إلى نص CSV (بدون تنزيل)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns نص CSV
 */
export function dataToCSVString(
  data: ExportData,
  options: Partial<CSVExportOptions> = {}
): string {
  const mergedOptions = { ...DEFAULT_CSV_OPTIONS, ...options } as CSVExportOptions;
  
  // التحقق من صحة البيانات
  const validation = validateExportData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // تحويل البيانات إلى مصفوفة
  const matrix = dataToMatrix(data, mergedOptions.includeHeaders);
  
  // تحويل المصفوفة إلى CSV
  let csvContent = matrixToCSV(matrix, mergedOptions);
  
  // إضافة BOM للتوافق مع Excel
  if (mergedOptions.includeBOM) {
    csvContent = '\uFEFF' + csvContent;
  }
  
  return csvContent;
}

/**
 * تحليل نص CSV إلى مصفوفة
 * @param csvString - نص CSV
 * @param delimiter - الفاصل
 * @returns مصفوفة ثنائية الأبعاد
 */
export function parseCSV(csvString: string, delimiter: string = ','): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  // إزالة BOM إن وجد
  const content = csvString.replace(/^\uFEFF/, '');
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // علامة اقتباس مزدوجة مُهرَّبة
          currentCell += '"';
          i++;
        } else {
          // نهاية الاقتباس
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
        if (char === '\r') i++;
      } else if (char !== '\r') {
        currentCell += char;
      }
    }
  }
  
  // إضافة الخلية والصف الأخيرين
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  return rows;
}

/**
 * فئة مُصدِّر CSV
 */
export class CSVExporter implements Exporter<CSVExportOptions> {
  private defaultOptions: Partial<CSVExportOptions>;
  
  constructor(defaultOptions: Partial<CSVExportOptions> = {}) {
    this.defaultOptions = { ...DEFAULT_CSV_OPTIONS, ...defaultOptions };
  }
  
  /**
   * تصدير البيانات
   */
  async export(
    data: ExportData,
    options: ExporterOptions<CSVExportOptions>
  ): Promise<ExportResult> {
    return exportToCSV(data, { ...this.defaultOptions, ...options });
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
    return 'csv';
  }
  
  /**
   * تحويل البيانات إلى نص CSV
   */
  toString(data: ExportData, options: Partial<CSVExportOptions> = {}): string {
    return dataToCSVString(data, { ...this.defaultOptions, ...options });
  }
}

/**
 * إنشاء مثيل افتراضي من مُصدِّر CSV
 */
export const csvExporter = new CSVExporter();

export default csvExporter;
