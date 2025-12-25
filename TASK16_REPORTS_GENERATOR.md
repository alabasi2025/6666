# 📋 المهمة 16: إنشاء نظام توليد التقارير

## 🎯 الهدف
إنشاء نظام توليد تقارير متكامل يدعم تنسيقات متعددة (PDF, Excel, CSV).

## 📁 الفرع
```
feature/task16-reports-generator
```

## ⏱️ الوقت المتوقع
4-5 ساعات

---

## 📂 الملفات المطلوب إنشاؤها

```
server/reports/
├── types.ts              # أنواع TypeScript
├── report-builder.ts     # بناء التقارير
├── formatters/
│   ├── pdf-formatter.ts  # تنسيق PDF
│   ├── excel-formatter.ts # تنسيق Excel
│   └── csv-formatter.ts  # تنسيق CSV
├── templates/
│   ├── voucher-report.ts # تقرير السندات
│   ├── party-report.ts   # تقرير الأطراف
│   └── treasury-report.ts # تقرير الخزائن
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
git checkout feature/task16-reports-generator
```

### الخطوة 2: إنشاء المجلدات
```bash
mkdir -p server/reports/formatters server/reports/templates
```

### الخطوة 3: إنشاء ملف types.ts
```typescript
// server/reports/types.ts

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportType = 'voucher' | 'party' | 'treasury' | 'summary' | 'custom';

export interface ReportConfig {
  title: string;
  titleAr: string;
  type: ReportType;
  format: ReportFormat;
  columns: ReportColumn[];
  filters?: ReportFilter[];
  groupBy?: string;
  sortBy?: { field: string; order: 'asc' | 'desc' };
  includeHeader?: boolean;
  includeFooter?: boolean;
  includeSummary?: boolean;
  pageSize?: 'A4' | 'A3' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface ReportColumn {
  key: string;
  title: string;
  titleAr: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'like';
  value: unknown;
}

export interface ReportData {
  rows: Record<string, unknown>[];
  summary?: Record<string, unknown>;
  metadata?: {
    generatedAt: Date;
    generatedBy?: string;
    businessId?: number;
    totalRows: number;
    filters?: ReportFilter[];
  };
}

export interface GeneratedReport {
  fileName: string;
  format: ReportFormat;
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface ReportFormatter {
  format(config: ReportConfig, data: ReportData): Promise<Buffer>;
  getMimeType(): string;
  getExtension(): string;
}
```

### الخطوة 4: إنشاء ملف formatters/csv-formatter.ts
```typescript
// server/reports/formatters/csv-formatter.ts

import { ReportConfig, ReportData, ReportFormatter } from '../types';

export class CsvFormatter implements ReportFormatter {
  async format(config: ReportConfig, data: ReportData): Promise<Buffer> {
    const lines: string[] = [];

    // Header row
    const headers = config.columns.map((col) => this.escapeValue(col.titleAr));
    lines.push(headers.join(','));

    // Data rows
    for (const row of data.rows) {
      const values = config.columns.map((col) => {
        const value = row[col.key];
        return this.escapeValue(this.formatValue(value, col.format));
      });
      lines.push(values.join(','));
    }

    // Summary row
    if (config.includeSummary && data.summary) {
      const summaryValues = config.columns.map((col) => {
        if (col.aggregation && data.summary) {
          return this.escapeValue(String(data.summary[col.key] || ''));
        }
        return '';
      });
      lines.push(summaryValues.join(','));
    }

    // Add BOM for Arabic support
    const bom = '\uFEFF';
    const content = bom + lines.join('\n');
    
    return Buffer.from(content, 'utf-8');
  }

  getMimeType(): string {
    return 'text/csv; charset=utf-8';
  }

  getExtension(): string {
    return 'csv';
  }

  private escapeValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatValue(value: unknown, format?: string): string {
    if (value === null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'date':
        return value instanceof Date ? value.toLocaleDateString('ar-SA') : String(value);
      case 'percentage':
        return typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : String(value);
      default:
        return String(value);
    }
  }
}

export const csvFormatter = new CsvFormatter();
```

### الخطوة 5: إنشاء ملف formatters/excel-formatter.ts
```typescript
// server/reports/formatters/excel-formatter.ts

import { ReportConfig, ReportData, ReportFormatter } from '../types';

export class ExcelFormatter implements ReportFormatter {
  async format(config: ReportConfig, data: ReportData): Promise<Buffer> {
    // إنشاء ملف Excel بسيط (XML-based)
    const xml = this.buildExcelXml(config, data);
    return Buffer.from(xml, 'utf-8');
  }

  getMimeType(): string {
    return 'application/vnd.ms-excel';
  }

  getExtension(): string {
    return 'xls';
  }

  private buildExcelXml(config: ReportConfig, data: ReportData): string {
    const rows: string[] = [];

    // Header row
    const headerCells = config.columns
      .map((col) => `<Cell><Data ss:Type="String">${this.escapeXml(col.titleAr)}</Data></Cell>`)
      .join('');
    rows.push(`<Row ss:StyleID="Header">${headerCells}</Row>`);

    // Data rows
    for (const row of data.rows) {
      const cells = config.columns
        .map((col) => {
          const value = row[col.key];
          const type = this.getExcelType(col.format);
          const formattedValue = this.formatValue(value, col.format);
          return `<Cell><Data ss:Type="${type}">${this.escapeXml(formattedValue)}</Data></Cell>`;
        })
        .join('');
      rows.push(`<Row>${cells}</Row>`);
    }

    // Summary row
    if (config.includeSummary && data.summary) {
      const summaryCells = config.columns
        .map((col) => {
          if (col.aggregation && data.summary) {
            const value = data.summary[col.key];
            return `<Cell ss:StyleID="Summary"><Data ss:Type="Number">${value || ''}</Data></Cell>`;
          }
          return '<Cell></Cell>';
        })
        .join('');
      rows.push(`<Row ss:StyleID="Summary">${summaryCells}</Row>`);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Default">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Font ss:FontName="Arial" ss:Size="11"/>
    </Style>
    <Style ss:ID="Header">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Font ss:FontName="Arial" ss:Size="12" ss:Bold="1"/>
      <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF"/>
    </Style>
    <Style ss:ID="Summary">
      <Font ss:FontName="Arial" ss:Size="11" ss:Bold="1"/>
      <Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="${this.escapeXml(config.titleAr)}">
    <Table>
      ${config.columns.map((col) => `<Column ss:Width="${col.width || 100}"/>`).join('')}
      ${rows.join('\n      ')}
    </Table>
  </Worksheet>
</Workbook>`;
  }

  private getExcelType(format?: string): string {
    switch (format) {
      case 'number':
      case 'currency':
      case 'percentage':
        return 'Number';
      case 'date':
        return 'DateTime';
      default:
        return 'String';
    }
  }

  private formatValue(value: unknown, format?: string): string {
    if (value === null || value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'date':
        if (value instanceof Date) {
          return value.toISOString();
        }
        return String(value);
      case 'percentage':
        return typeof value === 'number' ? (value * 100).toFixed(2) : String(value);
      default:
        return String(value);
    }
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}

export const excelFormatter = new ExcelFormatter();
```

### الخطوة 6: إنشاء ملف formatters/pdf-formatter.ts
```typescript
// server/reports/formatters/pdf-formatter.ts

import { ReportConfig, ReportData, ReportFormatter } from '../types';

export class PdfFormatter implements ReportFormatter {
  async format(config: ReportConfig, data: ReportData): Promise<Buffer> {
    // إنشاء HTML ثم تحويله لـ PDF
    const html = this.buildHtml(config, data);
    
    // في الإنتاج: استخدم puppeteer أو wkhtmltopdf
    // هنا نعيد HTML كـ placeholder
    return Buffer.from(html, 'utf-8');
  }

  getMimeType(): string {
    return 'application/pdf';
  }

  getExtension(): string {
    return 'pdf';
  }

  private buildHtml(config: ReportConfig, data: ReportData): string {
    const tableRows = data.rows
      .map((row) => {
        const cells = config.columns
          .map((col) => {
            const value = this.formatValue(row[col.key], col.format);
            const align = col.align || 'right';
            return `<td style="text-align: ${align}; padding: 8px; border: 1px solid #ddd;">${value}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const headerCells = config.columns
      .map((col) => `<th style="padding: 10px; background: #4472C4; color: white; border: 1px solid #ddd;">${col.titleAr}</th>`)
      .join('');

    let summaryRow = '';
    if (config.includeSummary && data.summary) {
      const summaryCells = config.columns
        .map((col) => {
          if (col.aggregation && data.summary) {
            const value = this.formatValue(data.summary[col.key], col.format);
            return `<td style="font-weight: bold; padding: 8px; background: #E2EFDA; border: 1px solid #ddd;">${value}</td>`;
          }
          return '<td style="border: 1px solid #ddd;"></td>';
        })
        .join('');
      summaryRow = `<tr>${summaryCells}</tr>`;
    }

    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>${config.titleAr}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .metadata {
      margin-top: 20px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <h1>${config.titleAr}</h1>
  <table>
    <thead>
      <tr>${headerCells}</tr>
    </thead>
    <tbody>
      ${tableRows}
      ${summaryRow}
    </tbody>
  </table>
  <div class="metadata">
    <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</p>
    <p>عدد السجلات: ${data.rows.length}</p>
  </div>
</body>
</html>`;
  }

  private formatValue(value: unknown, format?: string): string {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' 
          ? value.toLocaleString('ar-SA', { style: 'currency', currency: 'SAR' })
          : String(value);
      case 'date':
        return value instanceof Date 
          ? value.toLocaleDateString('ar-SA')
          : String(value);
      case 'percentage':
        return typeof value === 'number' 
          ? `${(value * 100).toFixed(2)}%`
          : String(value);
      case 'number':
        return typeof value === 'number'
          ? value.toLocaleString('ar-SA')
          : String(value);
      default:
        return String(value);
    }
  }
}

export const pdfFormatter = new PdfFormatter();
```

### الخطوة 7: إنشاء ملف templates/voucher-report.ts
```typescript
// server/reports/templates/voucher-report.ts

import { ReportConfig, ReportColumn } from '../types';

export const VoucherReportColumns: ReportColumn[] = [
  { key: 'voucherNumber', title: 'Voucher No.', titleAr: 'رقم السند', width: 80, align: 'center' },
  { key: 'date', title: 'Date', titleAr: 'التاريخ', width: 100, format: 'date', align: 'center' },
  { key: 'type', title: 'Type', titleAr: 'النوع', width: 80, align: 'center' },
  { key: 'partyName', title: 'Party', titleAr: 'الطرف', width: 150 },
  { key: 'description', title: 'Description', titleAr: 'الوصف', width: 200 },
  { key: 'debit', title: 'Debit', titleAr: 'مدين', width: 100, format: 'currency', aggregation: 'sum' },
  { key: 'credit', title: 'Credit', titleAr: 'دائن', width: 100, format: 'currency', aggregation: 'sum' },
  { key: 'balance', title: 'Balance', titleAr: 'الرصيد', width: 100, format: 'currency' },
];

export function createVoucherReportConfig(options: {
  format: 'pdf' | 'excel' | 'csv';
  includeHeader?: boolean;
  includeSummary?: boolean;
}): ReportConfig {
  return {
    title: 'Vouchers Report',
    titleAr: 'تقرير السندات',
    type: 'voucher',
    format: options.format,
    columns: VoucherReportColumns,
    includeHeader: options.includeHeader ?? true,
    includeSummary: options.includeSummary ?? true,
    pageSize: 'A4',
    orientation: 'landscape',
  };
}
```

### الخطوة 8: إنشاء ملف templates/party-report.ts
```typescript
// server/reports/templates/party-report.ts

import { ReportConfig, ReportColumn } from '../types';

export const PartyReportColumns: ReportColumn[] = [
  { key: 'code', title: 'Code', titleAr: 'الكود', width: 80, align: 'center' },
  { key: 'name', title: 'Name', titleAr: 'الاسم', width: 150 },
  { key: 'type', title: 'Type', titleAr: 'النوع', width: 80, align: 'center' },
  { key: 'phone', title: 'Phone', titleAr: 'الهاتف', width: 100, align: 'center' },
  { key: 'email', title: 'Email', titleAr: 'البريد', width: 150 },
  { key: 'openingBalance', title: 'Opening', titleAr: 'الرصيد الافتتاحي', width: 100, format: 'currency' },
  { key: 'currentBalance', title: 'Current', titleAr: 'الرصيد الحالي', width: 100, format: 'currency', aggregation: 'sum' },
  { key: 'status', title: 'Status', titleAr: 'الحالة', width: 80, align: 'center' },
];

export function createPartyReportConfig(options: {
  format: 'pdf' | 'excel' | 'csv';
  includeHeader?: boolean;
  includeSummary?: boolean;
}): ReportConfig {
  return {
    title: 'Parties Report',
    titleAr: 'تقرير الأطراف',
    type: 'party',
    format: options.format,
    columns: PartyReportColumns,
    includeHeader: options.includeHeader ?? true,
    includeSummary: options.includeSummary ?? true,
    pageSize: 'A4',
    orientation: 'portrait',
  };
}
```

### الخطوة 9: إنشاء ملف templates/treasury-report.ts
```typescript
// server/reports/templates/treasury-report.ts

import { ReportConfig, ReportColumn } from '../types';

export const TreasuryReportColumns: ReportColumn[] = [
  { key: 'code', title: 'Code', titleAr: 'الكود', width: 80, align: 'center' },
  { key: 'name', title: 'Name', titleAr: 'الاسم', width: 150 },
  { key: 'type', title: 'Type', titleAr: 'النوع', width: 100, align: 'center' },
  { key: 'currency', title: 'Currency', titleAr: 'العملة', width: 80, align: 'center' },
  { key: 'openingBalance', title: 'Opening', titleAr: 'الرصيد الافتتاحي', width: 120, format: 'currency' },
  { key: 'totalIn', title: 'Total In', titleAr: 'إجمالي الوارد', width: 120, format: 'currency', aggregation: 'sum' },
  { key: 'totalOut', title: 'Total Out', titleAr: 'إجمالي الصادر', width: 120, format: 'currency', aggregation: 'sum' },
  { key: 'currentBalance', title: 'Current', titleAr: 'الرصيد الحالي', width: 120, format: 'currency', aggregation: 'sum' },
];

export function createTreasuryReportConfig(options: {
  format: 'pdf' | 'excel' | 'csv';
  includeHeader?: boolean;
  includeSummary?: boolean;
}): ReportConfig {
  return {
    title: 'Treasury Report',
    titleAr: 'تقرير الخزائن',
    type: 'treasury',
    format: options.format,
    columns: TreasuryReportColumns,
    includeHeader: options.includeHeader ?? true,
    includeSummary: options.includeSummary ?? true,
    pageSize: 'A4',
    orientation: 'landscape',
  };
}
```

### الخطوة 10: إنشاء ملف report-builder.ts
```typescript
// server/reports/report-builder.ts

import { ReportConfig, ReportData, GeneratedReport, ReportFormatter, ReportFormat } from './types';
import { csvFormatter } from './formatters/csv-formatter';
import { excelFormatter } from './formatters/excel-formatter';
import { pdfFormatter } from './formatters/pdf-formatter';

class ReportBuilder {
  private formatters: Record<ReportFormat, ReportFormatter> = {
    csv: csvFormatter,
    excel: excelFormatter,
    pdf: pdfFormatter,
  };

  /**
   * توليد تقرير
   */
  async generate(config: ReportConfig, data: ReportData): Promise<GeneratedReport> {
    const formatter = this.formatters[config.format];
    if (!formatter) {
      throw new Error(`Unsupported format: ${config.format}`);
    }

    // حساب الملخص إذا كان مطلوباً
    if (config.includeSummary) {
      data.summary = this.calculateSummary(config, data);
    }

    // إضافة metadata
    data.metadata = {
      generatedAt: new Date(),
      totalRows: data.rows.length,
      filters: config.filters,
    };

    // توليد الملف
    const buffer = await formatter.format(config, data);
    const fileName = this.generateFileName(config);

    return {
      fileName,
      format: config.format,
      buffer,
      mimeType: formatter.getMimeType(),
      size: buffer.length,
    };
  }

  /**
   * حساب الملخص
   */
  private calculateSummary(config: ReportConfig, data: ReportData): Record<string, unknown> {
    const summary: Record<string, unknown> = {};

    for (const column of config.columns) {
      if (column.aggregation) {
        const values = data.rows
          .map((row) => row[column.key])
          .filter((v) => typeof v === 'number') as number[];

        switch (column.aggregation) {
          case 'sum':
            summary[column.key] = values.reduce((a, b) => a + b, 0);
            break;
          case 'avg':
            summary[column.key] = values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
            break;
          case 'count':
            summary[column.key] = values.length;
            break;
          case 'min':
            summary[column.key] = Math.min(...values);
            break;
          case 'max':
            summary[column.key] = Math.max(...values);
            break;
        }
      }
    }

    return summary;
  }

  /**
   * توليد اسم الملف
   */
  private generateFileName(config: ReportConfig): string {
    const timestamp = new Date().toISOString().slice(0, 10);
    const formatter = this.formatters[config.format];
    const extension = formatter.getExtension();
    
    return `${config.type}_report_${timestamp}.${extension}`;
  }

  /**
   * تسجيل formatter جديد
   */
  registerFormatter(format: ReportFormat, formatter: ReportFormatter): void {
    this.formatters[format] = formatter;
  }
}

export const reportBuilder = new ReportBuilder();
```

### الخطوة 11: إنشاء ملف index.ts
```typescript
// server/reports/index.ts

export * from './types';
export * from './report-builder';
export * from './formatters/csv-formatter';
export * from './formatters/excel-formatter';
export * from './formatters/pdf-formatter';
export * from './templates/voucher-report';
export * from './templates/party-report';
export * from './templates/treasury-report';

export { reportBuilder } from './report-builder';
```

### الخطوة 12: رفع التغييرات
```bash
git add server/reports/
git commit -m "feat(reports): إضافة نظام توليد التقارير

- إضافة formatters لـ PDF, Excel, CSV
- إضافة قوالب تقارير (السندات، الأطراف، الخزائن)
- إضافة ReportBuilder لتوليد التقارير
- دعم اللغة العربية"

git push origin feature/task16-reports-generator
```

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء مجلد `server/reports/`
- [ ] إنشاء ملف `types.ts`
- [ ] إنشاء ملف `formatters/csv-formatter.ts`
- [ ] إنشاء ملف `formatters/excel-formatter.ts`
- [ ] إنشاء ملف `formatters/pdf-formatter.ts`
- [ ] إنشاء ملف `templates/voucher-report.ts`
- [ ] إنشاء ملف `templates/party-report.ts`
- [ ] إنشاء ملف `templates/treasury-report.ts`
- [ ] إنشاء ملف `report-builder.ts`
- [ ] إنشاء ملف `index.ts`
- [ ] التأكد من عدم وجود أخطاء TypeScript
- [ ] رفع التغييرات إلى الفرع
