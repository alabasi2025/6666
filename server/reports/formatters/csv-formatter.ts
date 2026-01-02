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
