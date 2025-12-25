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
