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
