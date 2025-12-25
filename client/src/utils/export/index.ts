/**
 * @fileoverview ملف التصدير الرئيسي لأدوات التصدير
 * @description يُصدِّر هذا الملف جميع أدوات التصدير والأنواع والدوال المساعدة
 */

// ==================== الأنواع ====================
export type {
  // أنواع التصدير الأساسية
  ExportFormat,
  ExportStatus,
  TextDirection,
  TextAlignment,
  ColumnDataType,
  
  // واجهات الأعمدة والبيانات
  ExportColumn,
  ExportData,
  ExportResult,
  
  // خيارات التصدير
  BaseExportOptions,
  CSVExportOptions,
  ExcelExportOptions,
  PDFExportOptions,
  JSONExportOptions,
  ClipboardExportOptions,
  
  // أنواع متقدمة
  ExportDefaults,
  ExportEventHandlers,
  ExporterOptions,
  Exporter,
} from './types';

// ==================== أدوات التصدير ====================

// مُصدِّر CSV
export {
  exportToCSV,
  dataToCSVString,
  parseCSV,
  CSVExporter,
  csvExporter,
} from './csv-exporter';

// مُصدِّر Excel
export {
  exportToExcel,
  dataToExcelXML,
  ExcelExporter,
  excelExporter,
} from './excel-exporter';

// مُصدِّر PDF
export {
  exportToPDF,
  dataToPrintHTML,
  printData,
  PDFExporter,
  pdfExporter,
} from './pdf-exporter';

// مُصدِّر JSON
export {
  exportToJSON,
  dataToJSONString,
  dataToJSON,
  parseJSONToExportData,
  JSONExporter,
  jsonExporter,
} from './json-exporter';

// مُصدِّر الحافظة
export {
  copyToClipboard,
  copyText,
  copyRow,
  copyCell,
  isClipboardSupported,
  readFromClipboard,
  ClipboardExporter,
  clipboardExporter,
} from './clipboard-exporter';

// ==================== الأدوات المساعدة ====================
export {
  // تنسيق الملفات والأسماء
  formatTimestamp,
  generateFilename,
  sanitizeFilename,
  
  // تنسيق القيم
  formatValue,
  formatFileSize,
  
  // معالجة البيانات
  getNestedValue,
  dataToMatrix,
  calculateColumnWidths,
  getVisibleColumns,
  
  // التحقق والنتائج
  validateExportData,
  createSuccessResult,
  createErrorResult,
  
  // التنزيل
  downloadBlob,
  downloadText,
  
  // أدوات متنوعة
  directionToCSS,
  delay,
  chunkArray,
  generateUniqueId,
} from './export-utils';

// ==================== دوال التصدير الموحدة ====================

import type { ExportFormat, ExportData, ExportResult, ExporterOptions, BaseExportOptions } from './types';
import { exportToCSV } from './csv-exporter';
import { exportToExcel } from './excel-exporter';
import { exportToPDF } from './pdf-exporter';
import { exportToJSON } from './json-exporter';
import { copyToClipboard } from './clipboard-exporter';

/**
 * تصدير البيانات بالتنسيق المحدد
 * @param data - بيانات التصدير
 * @param format - تنسيق التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function exportData(
  data: ExportData,
  format: ExportFormat,
  options: ExporterOptions<BaseExportOptions>
): Promise<ExportResult> {
  switch (format) {
    case 'csv':
      return exportToCSV(data, options);
    case 'excel':
      return exportToExcel(data, options);
    case 'pdf':
      return exportToPDF(data, options);
    case 'json':
      return exportToJSON(data, options);
    case 'clipboard':
      return copyToClipboard(data, options);
    default:
      throw new Error(`تنسيق التصدير غير مدعوم: ${format}`);
  }
}

/**
 * الحصول على امتداد الملف للتنسيق
 * @param format - تنسيق التصدير
 * @returns امتداد الملف
 */
export function getFileExtension(format: ExportFormat): string {
  const extensions: Record<ExportFormat, string> = {
    csv: 'csv',
    excel: 'xls',
    pdf: 'pdf',
    json: 'json',
    clipboard: '',
  };
  return extensions[format] || '';
}

/**
 * الحصول على نوع MIME للتنسيق
 * @param format - تنسيق التصدير
 * @returns نوع MIME
 */
export function getMimeType(format: ExportFormat): string {
  const mimeTypes: Record<ExportFormat, string> = {
    csv: 'text/csv',
    excel: 'application/vnd.ms-excel',
    pdf: 'application/pdf',
    json: 'application/json',
    clipboard: 'text/plain',
  };
  return mimeTypes[format] || 'application/octet-stream';
}

/**
 * الحصول على اسم التنسيق بالعربية
 * @param format - تنسيق التصدير
 * @returns اسم التنسيق
 */
export function getFormatName(format: ExportFormat): string {
  const names: Record<ExportFormat, string> = {
    csv: 'ملف CSV',
    excel: 'ملف Excel',
    pdf: 'ملف PDF',
    json: 'ملف JSON',
    clipboard: 'الحافظة',
  };
  return names[format] || format;
}

/**
 * قائمة تنسيقات التصدير المتاحة
 */
export const EXPORT_FORMATS: { value: ExportFormat; label: string; icon?: string }[] = [
  { value: 'excel', label: 'Excel', icon: 'file-spreadsheet' },
  { value: 'csv', label: 'CSV', icon: 'file-text' },
  { value: 'pdf', label: 'PDF', icon: 'file-text' },
  { value: 'json', label: 'JSON', icon: 'file-json' },
  { value: 'clipboard', label: 'نسخ', icon: 'clipboard' },
];

/**
 * الخيارات الافتراضية للتصدير
 */
export const DEFAULT_EXPORT_OPTIONS: BaseExportOptions = {
  filename: 'export',
  direction: 'rtl',
  includeTimestamp: true,
  includeHeader: true,
  includeFooter: true,
};
