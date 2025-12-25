/**
 * @fileoverview مُصدِّر PDF
 * @description يوفر هذا الملف وظائف تصدير البيانات بتنسيق PDF
 * @note يستخدم تقنية طباعة HTML لإنشاء PDF
 */

import type {
  ExportData,
  ExportResult,
  PDFExportOptions,
  ExporterOptions,
  Exporter,
  ExportFormat,
} from './types';
import {
  generateFilename,
  validateExportData,
  createSuccessResult,
  createErrorResult,
  getVisibleColumns,
  formatValue,
  getNestedValue,
} from './export-utils';

/**
 * الخيارات الافتراضية لتصدير PDF
 */
const DEFAULT_PDF_OPTIONS: Partial<PDFExportOptions> = {
  orientation: 'landscape',
  pageSize: 'A4',
  margins: {
    top: 20,
    right: 15,
    bottom: 20,
    left: 15,
  },
  fontSize: 10,
  fontFamily: 'Tahoma, Arial, sans-serif',
  pageNumbers: true,
  headerColor: '#4472C4',
  tableLines: true,
  includeTimestamp: true,
  direction: 'rtl',
  includeHeader: true,
  includeFooter: true,
};

/**
 * تهريب HTML
 * @param text - النص
 * @returns النص المُهرَّب
 */
function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * إنشاء أنماط CSS للطباعة
 * @param options - خيارات التصدير
 * @returns أنماط CSS
 */
function createPrintStyles(options: PDFExportOptions): string {
  const {
    orientation = 'landscape',
    pageSize = 'A4',
    margins = {},
    fontSize = 10,
    fontFamily = 'Tahoma, Arial, sans-serif',
    headerColor = '#4472C4',
    direction = 'rtl',
    tableLines = true,
  } = options;

  const { top = 20, right = 15, bottom = 20, left = 15 } = margins;

  return `
    @page {
      size: ${pageSize} ${orientation};
      margin: ${top}mm ${right}mm ${bottom}mm ${left}mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: ${fontFamily};
      font-size: ${fontSize}pt;
      direction: ${direction};
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      line-height: 1.4;
      color: #333;
    }
    
    .report-container {
      width: 100%;
      padding: 10px;
    }
    
    .report-header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid ${headerColor};
    }
    
    .report-title {
      font-size: ${fontSize + 6}pt;
      font-weight: bold;
      color: ${headerColor};
      margin-bottom: 5px;
    }
    
    .report-description {
      font-size: ${fontSize}pt;
      color: #666;
    }
    
    .report-meta {
      font-size: ${fontSize - 1}pt;
      color: #888;
      margin-top: 5px;
    }
    
    .report-logo {
      max-height: 50px;
      margin-bottom: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    th {
      background-color: ${headerColor};
      color: white;
      font-weight: bold;
      padding: 10px 8px;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      ${tableLines ? 'border: 1px solid #ddd;' : ''}
    }
    
    td {
      padding: 8px;
      text-align: ${direction === 'rtl' ? 'right' : 'left'};
      ${tableLines ? 'border: 1px solid #ddd;' : 'border-bottom: 1px solid #eee;'}
    }
    
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    
    tr:hover {
      background-color: #f5f5f5;
    }
    
    .report-footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: ${fontSize - 1}pt;
      color: #666;
      text-align: center;
    }
    
    .page-number {
      position: fixed;
      bottom: 10mm;
      ${direction === 'rtl' ? 'left' : 'right'}: 15mm;
      font-size: ${fontSize - 2}pt;
      color: #888;
    }
    
    .number-cell {
      text-align: ${direction === 'rtl' ? 'left' : 'right'};
      font-family: 'Courier New', monospace;
    }
    
    @media print {
      .no-print {
        display: none !important;
      }
      
      tr {
        page-break-inside: avoid;
      }
      
      thead {
        display: table-header-group;
      }
      
      tfoot {
        display: table-footer-group;
      }
    }
  `;
}

/**
 * إنشاء محتوى HTML للتقرير
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns محتوى HTML
 */
function createReportHTML(data: ExportData, options: PDFExportOptions): string {
  const visibleColumns = getVisibleColumns(data.columns);
  const {
    title,
    description,
    logo,
    includeHeader = true,
    includeFooter = true,
    footerText,
    pageNumbers = true,
    direction = 'rtl',
  } = options;

  const styles = createPrintStyles(options);
  const currentDate = new Date().toLocaleDateString(direction === 'rtl' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let html = `
<!DOCTYPE html>
<html dir="${direction}" lang="${direction === 'rtl' ? 'ar' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title || options.filename)}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="report-container">`;

  // رأس التقرير
  if (includeHeader) {
    html += `
    <div class="report-header">`;
    
    if (logo) {
      html += `
      <img src="${escapeHTML(logo)}" alt="Logo" class="report-logo">`;
    }
    
    if (title) {
      html += `
      <h1 class="report-title">${escapeHTML(title)}</h1>`;
    }
    
    if (description) {
      html += `
      <p class="report-description">${escapeHTML(description)}</p>`;
    }
    
    html += `
      <p class="report-meta">${direction === 'rtl' ? 'تاريخ التقرير:' : 'Report Date:'} ${currentDate}</p>
    </div>`;
  }

  // جدول البيانات
  html += `
    <table>
      <thead>
        <tr>`;
  
  for (const col of visibleColumns) {
    html += `
          <th>${escapeHTML(col.header)}</th>`;
  }
  
  html += `
        </tr>
      </thead>
      <tbody>`;

  for (const row of data.rows) {
    html += `
        <tr>`;
    
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(rawValue, row as Record<string, unknown>)
        : formatValue(rawValue, col.dataType);
      
      const cellClass = col.dataType === 'number' || col.dataType === 'currency'
        ? 'number-cell'
        : '';
      
      html += `
          <td class="${cellClass}">${escapeHTML(formattedValue)}</td>`;
    }
    
    html += `
        </tr>`;
  }

  html += `
      </tbody>
    </table>`;

  // تذييل التقرير
  if (includeFooter) {
    const footer = footerText || (direction === 'rtl' 
      ? `إجمالي السجلات: ${data.rows.length}` 
      : `Total Records: ${data.rows.length}`);
    
    html += `
    <div class="report-footer">
      <p>${escapeHTML(footer)}</p>
    </div>`;
  }

  // أرقام الصفحات
  if (pageNumbers) {
    html += `
    <div class="page-number"></div>`;
  }

  html += `
  </div>
</body>
</html>`;

  return html;
}

/**
 * فتح نافذة الطباعة
 * @param html - محتوى HTML
 * @param filename - اسم الملف
 */
function openPrintWindow(html: string, filename: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    throw new Error('تعذر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.');
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // انتظار تحميل المحتوى ثم الطباعة
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // إغلاق النافذة بعد الطباعة (اختياري)
    // printWindow.close();
  };
}

/**
 * تصدير البيانات كـ PDF (عبر الطباعة)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function exportToPDF(
  data: ExportData,
  options: ExporterOptions<PDFExportOptions>
): Promise<ExportResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options } as PDFExportOptions;
  
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
    
    // إنشاء محتوى HTML
    const htmlContent = createReportHTML(data, mergedOptions);
    
    options.onProgress?.(60);
    
    // إنشاء اسم الملف
    const filename = generateFilename(
      mergedOptions.filename,
      'pdf',
      mergedOptions.includeTimestamp
    );
    
    options.onProgress?.(80);
    
    // فتح نافذة الطباعة
    openPrintWindow(htmlContent, filename);
    
    options.onProgress?.(100);
    
    // إنشاء نتيجة النجاح
    const result = createSuccessResult(
      filename,
      data.rows.length,
      undefined,
      startTime
    );
    result.message = 'تم فتح نافذة الطباعة. يرجى اختيار "حفظ كـ PDF" من خيارات الطباعة.';
    
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
 * تحويل البيانات إلى HTML للطباعة (بدون فتح نافذة)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns محتوى HTML
 */
export function dataToPrintHTML(
  data: ExportData,
  options: Partial<PDFExportOptions> = {}
): string {
  const mergedOptions = { ...DEFAULT_PDF_OPTIONS, ...options } as PDFExportOptions;
  
  // التحقق من صحة البيانات
  const validation = validateExportData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  return createReportHTML(data, mergedOptions);
}

/**
 * طباعة البيانات مباشرة
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 */
export function printData(
  data: ExportData,
  options: Partial<PDFExportOptions> = {}
): void {
  const html = dataToPrintHTML(data, options);
  openPrintWindow(html, options.filename || 'report');
}

/**
 * فئة مُصدِّر PDF
 */
export class PDFExporter implements Exporter<PDFExportOptions> {
  private defaultOptions: Partial<PDFExportOptions>;
  
  constructor(defaultOptions: Partial<PDFExportOptions> = {}) {
    this.defaultOptions = { ...DEFAULT_PDF_OPTIONS, ...defaultOptions };
  }
  
  /**
   * تصدير البيانات
   */
  async export(
    data: ExportData,
    options: ExporterOptions<PDFExportOptions>
  ): Promise<ExportResult> {
    return exportToPDF(data, { ...this.defaultOptions, ...options });
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
    return 'pdf';
  }
  
  /**
   * تحويل البيانات إلى HTML
   */
  toHTML(data: ExportData, options: Partial<PDFExportOptions> = {}): string {
    return dataToPrintHTML(data, { ...this.defaultOptions, ...options });
  }
  
  /**
   * طباعة البيانات
   */
  print(data: ExportData, options: Partial<PDFExportOptions> = {}): void {
    printData(data, { ...this.defaultOptions, ...options });
  }
}

/**
 * إنشاء مثيل افتراضي من مُصدِّر PDF
 */
export const pdfExporter = new PDFExporter();

export default pdfExporter;
