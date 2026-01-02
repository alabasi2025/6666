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
