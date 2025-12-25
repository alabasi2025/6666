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
