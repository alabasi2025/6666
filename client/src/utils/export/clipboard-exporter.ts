/**
 * @fileoverview مُصدِّر الحافظة
 * @description يوفر هذا الملف وظائف نسخ البيانات إلى الحافظة
 */

import type {
  ExportData,
  ExportResult,
  ClipboardExportOptions,
  ExporterOptions,
  Exporter,
  ExportFormat,
} from './types';
import {
  validateExportData,
  createSuccessResult,
  createErrorResult,
  getVisibleColumns,
  formatValue,
  getNestedValue,
  dataToMatrix,
} from './export-utils';

/**
 * الخيارات الافتراضية للنسخ للحافظة
 */
const DEFAULT_CLIPBOARD_OPTIONS: Partial<ClipboardExportOptions> = {
  format: 'text',
  columnSeparator: '\t',
  rowSeparator: '\n',
  includeHeaders: true,
  direction: 'rtl',
};

/**
 * تحويل البيانات إلى نص عادي
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns النص
 */
function dataToPlainText(data: ExportData, options: ClipboardExportOptions): string {
  const { columnSeparator = '\t', rowSeparator = '\n', includeHeaders = true } = options;
  const matrix = dataToMatrix(data, includeHeaders);
  
  return matrix
    .map((row) => row.join(columnSeparator))
    .join(rowSeparator);
}

/**
 * تحويل البيانات إلى HTML
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns HTML
 */
function dataToHTML(data: ExportData, options: ClipboardExportOptions): string {
  const visibleColumns = getVisibleColumns(data.columns);
  const { includeHeaders = true, direction = 'rtl' } = options;
  
  let html = `<table dir="${direction}" style="border-collapse: collapse; font-family: Tahoma, Arial, sans-serif;">`;
  
  // إضافة الرؤوس
  if (includeHeaders) {
    html += '<thead><tr>';
    for (const col of visibleColumns) {
      html += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #4472C4; color: white; text-align: ${direction === 'rtl' ? 'right' : 'left'};">${escapeHTML(col.header)}</th>`;
    }
    html += '</tr></thead>';
  }
  
  // إضافة البيانات
  html += '<tbody>';
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    const bgColor = i % 2 === 0 ? '#ffffff' : '#f9f9f9';
    html += `<tr style="background-color: ${bgColor};">`;
    
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(rawValue, row as Record<string, unknown>)
        : formatValue(rawValue, col.dataType);
      
      html += `<td style="border: 1px solid #ddd; padding: 8px; text-align: ${direction === 'rtl' ? 'right' : 'left'};">${escapeHTML(formattedValue)}</td>`;
    }
    
    html += '</tr>';
  }
  html += '</tbody></table>';
  
  return html;
}

/**
 * تهريب HTML
 * @param text - النص
 * @returns النص المُهرَّب
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * تحويل البيانات إلى JSON للحافظة
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns JSON
 */
function dataToJSONForClipboard(data: ExportData, options: ClipboardExportOptions): string {
  const visibleColumns = getVisibleColumns(data.columns);
  
  const jsonData = data.rows.map((row) => {
    const jsonRow: Record<string, unknown> = {};
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      jsonRow[col.key] = rawValue;
    }
    return jsonRow;
  });
  
  return JSON.stringify(jsonData, null, 2);
}

/**
 * نسخ النص إلى الحافظة باستخدام Clipboard API
 * @param text - النص
 * @returns وعد
 */
async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    // طريقة بديلة للمتصفحات القديمة
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('فشل النسخ إلى الحافظة');
      }
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * نسخ HTML إلى الحافظة
 * @param html - HTML
 * @param plainText - النص العادي
 * @returns وعد
 */
async function copyHTMLToClipboard(html: string, plainText: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.write) {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText], { type: 'text/plain' });
    
    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });
    
    await navigator.clipboard.write([clipboardItem]);
  } else {
    // طريقة بديلة: نسخ النص العادي فقط
    await copyTextToClipboard(plainText);
  }
}

/**
 * نسخ البيانات إلى الحافظة
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function copyToClipboard(
  data: ExportData,
  options: ExporterOptions<ClipboardExportOptions>
): Promise<ExportResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_CLIPBOARD_OPTIONS, ...options } as ClipboardExportOptions;
  
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
    
    let content: string;
    const plainText = dataToPlainText(data, mergedOptions);
    
    switch (mergedOptions.format) {
      case 'html':
        const html = dataToHTML(data, mergedOptions);
        await copyHTMLToClipboard(html, plainText);
        content = html;
        break;
        
      case 'json':
        content = dataToJSONForClipboard(data, mergedOptions);
        await copyTextToClipboard(content);
        break;
        
      case 'text':
      default:
        content = plainText;
        await copyTextToClipboard(content);
        break;
    }
    
    options.onProgress?.(100);
    
    // إنشاء نتيجة النجاح
    const result = createSuccessResult(
      'clipboard',
      data.rows.length,
      new Blob([content]).size,
      startTime
    );
    result.message = `تم نسخ ${data.rows.length} صف إلى الحافظة`;
    
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
 * نسخ نص مخصص إلى الحافظة
 * @param text - النص
 * @returns وعد
 */
export async function copyText(text: string): Promise<void> {
  await copyTextToClipboard(text);
}

/**
 * نسخ صف واحد إلى الحافظة
 * @param row - الصف
 * @param columns - الأعمدة
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function copyRow(
  row: Record<string, unknown>,
  columns: ExportData['columns'],
  options: Partial<ClipboardExportOptions> = {}
): Promise<ExportResult> {
  const data: ExportData = {
    columns,
    rows: [row],
  };
  
  return copyToClipboard(data, {
    filename: 'row',
    ...options,
  });
}

/**
 * نسخ خلية واحدة إلى الحافظة
 * @param value - القيمة
 * @returns وعد
 */
export async function copyCell(value: unknown): Promise<void> {
  const text = value === null || value === undefined ? '' : String(value);
  await copyTextToClipboard(text);
}

/**
 * التحقق من دعم الحافظة
 * @returns هل الحافظة مدعومة
 */
export function isClipboardSupported(): boolean {
  return !!(navigator.clipboard || document.execCommand);
}

/**
 * قراءة النص من الحافظة
 * @returns وعد بالنص
 */
export async function readFromClipboard(): Promise<string> {
  if (navigator.clipboard && navigator.clipboard.readText) {
    return navigator.clipboard.readText();
  }
  throw new Error('قراءة الحافظة غير مدعومة في هذا المتصفح');
}

/**
 * فئة مُصدِّر الحافظة
 */
export class ClipboardExporter implements Exporter<ClipboardExportOptions> {
  private defaultOptions: Partial<ClipboardExportOptions>;
  
  constructor(defaultOptions: Partial<ClipboardExportOptions> = {}) {
    this.defaultOptions = { ...DEFAULT_CLIPBOARD_OPTIONS, ...defaultOptions };
  }
  
  /**
   * تصدير البيانات (نسخ إلى الحافظة)
   */
  async export(
    data: ExportData,
    options: ExporterOptions<ClipboardExportOptions>
  ): Promise<ExportResult> {
    return copyToClipboard(data, { ...this.defaultOptions, ...options });
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
    return 'clipboard';
  }
  
  /**
   * نسخ نص
   */
  async copyText(text: string): Promise<void> {
    return copyText(text);
  }
  
  /**
   * نسخ صف
   */
  async copyRow(
    row: Record<string, unknown>,
    columns: ExportData['columns'],
    options: Partial<ClipboardExportOptions> = {}
  ): Promise<ExportResult> {
    return copyRow(row, columns, { ...this.defaultOptions, ...options });
  }
  
  /**
   * نسخ خلية
   */
  async copyCell(value: unknown): Promise<void> {
    return copyCell(value);
  }
  
  /**
   * التحقق من الدعم
   */
  isSupported(): boolean {
    return isClipboardSupported();
  }
  
  /**
   * قراءة من الحافظة
   */
  async read(): Promise<string> {
    return readFromClipboard();
  }
}

/**
 * إنشاء مثيل افتراضي من مُصدِّر الحافظة
 */
export const clipboardExporter = new ClipboardExporter();

export default clipboardExporter;
