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
