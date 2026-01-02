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
