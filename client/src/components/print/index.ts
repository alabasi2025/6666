/**
 * @fileoverview ملف التصدير الرئيسي لمكونات الطباعة
 * @module components/print
 */

// ==================== المكونات ====================

export { PrintLayout } from "./PrintLayout";
export { PrintHeader } from "./PrintHeader";
export { PrintFooter } from "./PrintFooter";
export { VoucherPrint } from "./VoucherPrint";
export { ReportPrint } from "./ReportPrint";
export { InvoicePrint } from "./InvoicePrint";
export { ReceiptPrint } from "./ReceiptPrint";

// ==================== Hooks ====================

export { usePrint, printContent } from "./usePrint";

// ==================== الأنواع ====================

export type {
  // أنواع معلومات الشركة
  CompanyInfo,
  
  // أنواع التخطيط
  PaperSize,
  PaperOrientation,
  PrintLayoutProps,
  
  // أنواع الرأس والتذييل
  PrintHeaderProps,
  PrintFooterProps,
  
  // أنواع السندات
  VoucherType,
  PaymentMethod,
  VoucherData,
  VoucherPrintProps,
  
  // أنواع التقارير
  TableColumn,
  ReportData,
  ReportPrintProps,
  
  // أنواع الفواتير
  InvoiceItem,
  InvoiceData,
  InvoicePrintProps,
  
  // أنواع الإيصالات
  ReceiptData,
  ReceiptPrintProps,
  
  // أنواع Hook الطباعة
  PrintOptions,
  UsePrintReturn,
} from "./types";

// ==================== الثوابت ====================

export {
  voucherTypeLabels,
  paymentMethodLabels,
  invoiceTypeLabels,
  paperSizes,
} from "./types";
