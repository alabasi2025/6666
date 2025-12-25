/**
 * @fileoverview مُصدِّر Excel
 * @description يوفر هذا الملف وظائف تصدير البيانات بتنسيق Excel (XLSX)
 * @note يستخدم تنسيق XML البسيط المتوافق مع Excel (SpreadsheetML)
 */

import type {
  ExportData,
  ExportResult,
  ExcelExportOptions,
  ExporterOptions,
  Exporter,
  ExportFormat,
  ExportColumn,
} from './types';
import {
  generateFilename,
  validateExportData,
  createSuccessResult,
  createErrorResult,
  downloadBlob,
  getVisibleColumns,
  formatValue,
  getNestedValue,
} from './export-utils';

/**
 * الخيارات الافتراضية لتصدير Excel
 */
const DEFAULT_EXCEL_OPTIONS: Partial<ExcelExportOptions> = {
  sheetName: 'Sheet1',
  freezeHeader: true,
  autoFilter: true,
  autoWidth: true,
  headerBackgroundColor: '#4472C4',
  headerTextColor: '#FFFFFF',
  borders: true,
  alternateRowColors: true,
  includeTimestamp: true,
  direction: 'rtl',
};

/**
 * تحويل لون HEX إلى ARGB
 * @param hex - لون HEX
 * @returns لون ARGB
 */
function hexToARGB(hex: string): string {
  const cleanHex = hex.replace('#', '');
  return `FF${cleanHex.toUpperCase()}`;
}

/**
 * تهريب النص لـ XML
 * @param text - النص
 * @returns النص المُهرَّب
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * حساب عرض العمود بناءً على المحتوى
 * @param content - المحتوى
 * @returns العرض
 */
function calculateColumnWidth(content: string): number {
  // تقريب: كل حرف يأخذ حوالي 1.2 وحدة عرض
  const baseWidth = Math.max(content.length * 1.2, 8);
  return Math.min(baseWidth, 50); // الحد الأقصى 50
}

/**
 * إنشاء ملف Excel بتنسيق SpreadsheetML (XML)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns محتوى XML
 */
function createExcelXML(data: ExportData, options: ExcelExportOptions): string {
  const visibleColumns = getVisibleColumns(data.columns);
  const {
    sheetName = 'Sheet1',
    headerBackgroundColor = '#4472C4',
    headerTextColor = '#FFFFFF',
    alternateRowColors = true,
    direction = 'rtl',
  } = options;

  // حساب عروض الأعمدة
  const columnWidths: number[] = visibleColumns.map((col) => {
    let maxWidth = calculateColumnWidth(col.header);
    for (const row of data.rows) {
      const value = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(value, row as Record<string, unknown>)
        : formatValue(value, col.dataType);
      maxWidth = Math.max(maxWidth, calculateColumnWidth(formattedValue));
    }
    return maxWidth;
  });

  // بناء XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>${escapeXML(options.title || options.filename)}</Title>
    <Author>Energy Management System</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center" ss:ReadingOrder="${direction === 'rtl' ? 'RightToLeft' : 'LeftToRight'}"/>
      <Font ss:FontName="Tahoma" ss:Size="11"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Tahoma" ss:Size="11" ss:Bold="1" ss:Color="${headerTextColor}"/>
      <Interior ss:Color="${headerBackgroundColor}" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
      </Borders>
    </Style>
    <Style ss:ID="DataCell">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Tahoma" ss:Size="11"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
      </Borders>
    </Style>
    <Style ss:ID="DataCellAlt">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Tahoma" ss:Size="11"/>
      <Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
      </Borders>
    </Style>
    <Style ss:ID="NumberCell">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Tahoma" ss:Size="11"/>
      <NumberFormat ss:Format="#,##0.00"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D0D0D0"/>
      </Borders>
    </Style>
  </Styles>
  <Worksheet ss:Name="${escapeXML(sheetName)}" ss:RightToLeft="${direction === 'rtl' ? '1' : '0'}">
    <Table ss:DefaultRowHeight="20">`;

  // إضافة تعريفات الأعمدة
  for (let i = 0; i < visibleColumns.length; i++) {
    xml += `
      <Column ss:Index="${i + 1}" ss:AutoFitWidth="1" ss:Width="${columnWidths[i] * 7}"/>`;
  }

  // إضافة صف الرؤوس
  xml += `
      <Row ss:Height="25">`;
  for (const col of visibleColumns) {
    xml += `
        <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXML(col.header)}</Data></Cell>`;
  }
  xml += `
      </Row>`;

  // إضافة صفوف البيانات
  for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex++) {
    const row = data.rows[rowIndex];
    const styleId = alternateRowColors && rowIndex % 2 === 1 ? 'DataCellAlt' : 'DataCell';
    
    xml += `
      <Row>`;
    for (const col of visibleColumns) {
      const rawValue = getNestedValue(row as Record<string, unknown>, col.key);
      const formattedValue = col.formatter
        ? col.formatter(rawValue, row as Record<string, unknown>)
        : formatValue(rawValue, col.dataType);
      
      const dataType = col.dataType === 'number' || col.dataType === 'currency' 
        ? 'Number' 
        : 'String';
      const cellStyle = col.dataType === 'number' || col.dataType === 'currency'
        ? 'NumberCell'
        : styleId;
      
      const cellValue = dataType === 'Number' && typeof rawValue === 'number'
        ? rawValue.toString()
        : escapeXML(formattedValue);
      
      xml += `
        <Cell ss:StyleID="${cellStyle}"><Data ss:Type="${dataType}">${cellValue}</Data></Cell>`;
    }
    xml += `
      </Row>`;
  }

  xml += `
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <PageSetup>
        <Layout x:Orientation="Landscape"/>
      </PageSetup>
      <Print>
        <ValidPrinterInfo/>
        <HorizontalResolution>600</HorizontalResolution>
        <VerticalResolution>600</VerticalResolution>
      </Print>
      <Selected/>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
    </WorksheetOptions>
    <AutoFilter x:Range="R1C1:R${data.rows.length + 1}C${visibleColumns.length}"
      xmlns="urn:schemas-microsoft-com:office:excel">
    </AutoFilter>
  </Worksheet>
</Workbook>`;

  return xml;
}

/**
 * تصدير البيانات كـ Excel
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns وعد بنتيجة التصدير
 */
export async function exportToExcel(
  data: ExportData,
  options: ExporterOptions<ExcelExportOptions>
): Promise<ExportResult> {
  const startTime = Date.now();
  const mergedOptions = { ...DEFAULT_EXCEL_OPTIONS, ...options } as ExcelExportOptions;
  
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
    
    // إنشاء محتوى Excel
    const xmlContent = createExcelXML(data, mergedOptions);
    
    options.onProgress?.(70);
    
    // إنشاء Blob
    const blob = new Blob([xmlContent], {
      type: 'application/vnd.ms-excel',
    });
    
    options.onProgress?.(90);
    
    // إنشاء اسم الملف
    const filename = generateFilename(
      mergedOptions.filename,
      'xls',
      mergedOptions.includeTimestamp
    );
    
    // تنزيل الملف
    downloadBlob(blob, filename);
    
    options.onProgress?.(100);
    
    // إنشاء نتيجة النجاح
    const result = createSuccessResult(
      filename,
      data.rows.length,
      blob.size,
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
 * تحويل البيانات إلى نص Excel XML (بدون تنزيل)
 * @param data - بيانات التصدير
 * @param options - خيارات التصدير
 * @returns نص XML
 */
export function dataToExcelXML(
  data: ExportData,
  options: Partial<ExcelExportOptions> = {}
): string {
  const mergedOptions = { ...DEFAULT_EXCEL_OPTIONS, ...options } as ExcelExportOptions;
  
  // التحقق من صحة البيانات
  const validation = validateExportData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  return createExcelXML(data, mergedOptions);
}

/**
 * فئة مُصدِّر Excel
 */
export class ExcelExporter implements Exporter<ExcelExportOptions> {
  private defaultOptions: Partial<ExcelExportOptions>;
  
  constructor(defaultOptions: Partial<ExcelExportOptions> = {}) {
    this.defaultOptions = { ...DEFAULT_EXCEL_OPTIONS, ...defaultOptions };
  }
  
  /**
   * تصدير البيانات
   */
  async export(
    data: ExportData,
    options: ExporterOptions<ExcelExportOptions>
  ): Promise<ExportResult> {
    return exportToExcel(data, { ...this.defaultOptions, ...options });
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
    return 'excel';
  }
  
  /**
   * تحويل البيانات إلى XML
   */
  toXML(data: ExportData, options: Partial<ExcelExportOptions> = {}): string {
    return dataToExcelXML(data, { ...this.defaultOptions, ...options });
  }
}

/**
 * إنشاء مثيل افتراضي من مُصدِّر Excel
 */
export const excelExporter = new ExcelExporter();

export default excelExporter;
