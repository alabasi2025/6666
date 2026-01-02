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
