/**
 * @fileoverview أنواع TypeScript لقوالب الطباعة
 * @module components/print/types
 */

import { ReactNode } from "react";

// ==================== أنواع معلومات الشركة ====================

/**
 * معلومات الشركة للطباعة
 */
export interface CompanyInfo {
  /** اسم الشركة */
  name: string;
  /** اسم الشركة بالإنجليزية (اختياري) */
  nameEn?: string;
  /** الشعار (رابط الصورة) */
  logo?: string;
  /** العنوان */
  address?: string;
  /** رقم الهاتف */
  phone?: string;
  /** البريد الإلكتروني */
  email?: string;
  /** الموقع الإلكتروني */
  website?: string;
  /** الرقم الضريبي */
  taxNumber?: string;
  /** السجل التجاري */
  commercialRegister?: string;
}

// ==================== أنواع التخطيط ====================

/**
 * حجم الورق للطباعة
 */
export type PaperSize = "A4" | "A5" | "Letter" | "Legal";

/**
 * اتجاه الورق
 */
export type PaperOrientation = "portrait" | "landscape";

/**
 * خصائص تخطيط الطباعة
 */
export interface PrintLayoutProps {
  /** المحتوى */
  children: ReactNode;
  /** حجم الورق */
  paperSize?: PaperSize;
  /** اتجاه الورق */
  orientation?: PaperOrientation;
  /** إظهار الرأس */
  showHeader?: boolean;
  /** إظهار التذييل */
  showFooter?: boolean;
  /** معلومات الشركة */
  companyInfo?: CompanyInfo;
  /** عنوان المستند */
  title?: string;
  /** رقم الصفحة الحالية */
  currentPage?: number;
  /** إجمالي الصفحات */
  totalPages?: number;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع الرأس والتذييل ====================

/**
 * خصائص رأس الطباعة
 */
export interface PrintHeaderProps {
  /** معلومات الشركة */
  companyInfo: CompanyInfo;
  /** عنوان المستند */
  title?: string;
  /** رقم المستند */
  documentNumber?: string;
  /** تاريخ المستند */
  date?: Date | string;
  /** فئة CSS إضافية */
  className?: string;
}

/**
 * خصائص تذييل الطباعة
 */
export interface PrintFooterProps {
  /** رقم الصفحة الحالية */
  currentPage?: number;
  /** إجمالي الصفحات */
  totalPages?: number;
  /** نص إضافي */
  additionalText?: string;
  /** إظهار التاريخ والوقت */
  showDateTime?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع السندات ====================

/**
 * نوع السند
 */
export type VoucherType = "receipt" | "payment";

/**
 * طريقة الدفع
 */
export type PaymentMethod = "cash" | "check" | "transfer" | "card";

/**
 * بيانات السند للطباعة
 */
export interface VoucherData {
  /** رقم السند */
  voucherNumber: string;
  /** نوع السند */
  voucherType: VoucherType;
  /** تاريخ السند */
  date: Date | string;
  /** المبلغ */
  amount: number;
  /** العملة */
  currency?: string;
  /** المبلغ كتابة */
  amountInWords?: string;
  /** اسم الطرف */
  partyName?: string;
  /** طريقة الدفع */
  paymentMethod: PaymentMethod;
  /** رقم الشيك (إذا كانت طريقة الدفع شيك) */
  checkNumber?: string;
  /** تاريخ الشيك */
  checkDate?: Date | string;
  /** اسم البنك */
  bankName?: string;
  /** رقم المرجع البنكي */
  bankReference?: string;
  /** البيان */
  description?: string;
  /** ملاحظات */
  notes?: string;
  /** اسم الخزينة */
  treasuryName?: string;
  /** اسم المستخدم المنشئ */
  createdBy?: string;
}

/**
 * خصائص طباعة السند
 */
export interface VoucherPrintProps {
  /** بيانات السند */
  voucher: VoucherData;
  /** معلومات الشركة */
  companyInfo: CompanyInfo;
  /** إظهار التوقيعات */
  showSignatures?: boolean;
  /** عدد النسخ */
  copies?: number;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع التقارير ====================

/**
 * عمود الجدول
 */
export interface TableColumn<T = unknown> {
  /** مفتاح العمود */
  key: string;
  /** عنوان العمود */
  title: string;
  /** عرض العمود */
  width?: string | number;
  /** محاذاة النص */
  align?: "left" | "center" | "right";
  /** دالة التنسيق */
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

/**
 * بيانات التقرير
 */
export interface ReportData<T = Record<string, unknown>> {
  /** عنوان التقرير */
  title: string;
  /** العنوان الفرعي */
  subtitle?: string;
  /** فترة التقرير */
  period?: {
    from: Date | string;
    to: Date | string;
  };
  /** أعمدة الجدول */
  columns: TableColumn<T>[];
  /** بيانات الجدول */
  data: T[];
  /** ملخص التقرير */
  summary?: Record<string, string | number>;
  /** ملاحظات */
  notes?: string;
}

/**
 * خصائص طباعة التقرير
 */
export interface ReportPrintProps<T = Record<string, unknown>> {
  /** بيانات التقرير */
  report: ReportData<T>;
  /** معلومات الشركة */
  companyInfo: CompanyInfo;
  /** إظهار الترقيم */
  showRowNumbers?: boolean;
  /** إظهار الإجماليات */
  showTotals?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع الفواتير ====================

/**
 * بند الفاتورة
 */
export interface InvoiceItem {
  /** رقم البند */
  lineNumber?: number;
  /** كود الصنف */
  itemCode?: string;
  /** وصف الصنف */
  description: string;
  /** الكمية */
  quantity: number;
  /** الوحدة */
  unit?: string;
  /** سعر الوحدة */
  unitPrice: number;
  /** نسبة الخصم */
  discountPercent?: number;
  /** قيمة الخصم */
  discountAmount?: number;
  /** نسبة الضريبة */
  taxPercent?: number;
  /** قيمة الضريبة */
  taxAmount?: number;
  /** الإجمالي */
  total: number;
}

/**
 * بيانات الفاتورة
 */
export interface InvoiceData {
  /** رقم الفاتورة */
  invoiceNumber: string;
  /** نوع الفاتورة */
  invoiceType: "sales" | "purchase" | "return";
  /** تاريخ الفاتورة */
  date: Date | string;
  /** تاريخ الاستحقاق */
  dueDate?: Date | string;
  /** بيانات العميل/المورد */
  party: {
    name: string;
    address?: string;
    phone?: string;
    taxNumber?: string;
  };
  /** بنود الفاتورة */
  items: InvoiceItem[];
  /** المجموع الفرعي */
  subtotal: number;
  /** إجمالي الخصم */
  totalDiscount?: number;
  /** إجمالي الضريبة */
  totalTax?: number;
  /** الإجمالي النهائي */
  grandTotal: number;
  /** العملة */
  currency?: string;
  /** المبلغ المدفوع */
  paidAmount?: number;
  /** المبلغ المتبقي */
  remainingAmount?: number;
  /** طريقة الدفع */
  paymentMethod?: PaymentMethod;
  /** ملاحظات */
  notes?: string;
  /** الشروط والأحكام */
  terms?: string;
}

/**
 * خصائص طباعة الفاتورة
 */
export interface InvoicePrintProps {
  /** بيانات الفاتورة */
  invoice: InvoiceData;
  /** معلومات الشركة */
  companyInfo: CompanyInfo;
  /** إظهار التوقيعات */
  showSignatures?: boolean;
  /** إظهار الباركود */
  showBarcode?: boolean;
  /** إظهار QR Code */
  showQRCode?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع الإيصالات ====================

/**
 * بيانات الإيصال
 */
export interface ReceiptData {
  /** رقم الإيصال */
  receiptNumber: string;
  /** تاريخ الإيصال */
  date: Date | string;
  /** اسم العميل */
  customerName?: string;
  /** البنود */
  items: {
    description: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  /** المجموع الفرعي */
  subtotal: number;
  /** الخصم */
  discount?: number;
  /** الضريبة */
  tax?: number;
  /** الإجمالي */
  total: number;
  /** المبلغ المدفوع */
  paidAmount: number;
  /** الباقي */
  change?: number;
  /** طريقة الدفع */
  paymentMethod: PaymentMethod;
  /** اسم الكاشير */
  cashierName?: string;
  /** ملاحظات */
  notes?: string;
}

/**
 * خصائص طباعة الإيصال
 */
export interface ReceiptPrintProps {
  /** بيانات الإيصال */
  receipt: ReceiptData;
  /** معلومات الشركة */
  companyInfo: CompanyInfo;
  /** عرض الإيصال (للطابعات الحرارية) */
  width?: "58mm" | "80mm" | "full";
  /** إظهار الباركود */
  showBarcode?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

// ==================== أنواع Hook الطباعة ====================

/**
 * خيارات الطباعة
 */
export interface PrintOptions {
  /** عنوان نافذة الطباعة */
  title?: string;
  /** تأخير قبل الطباعة (بالمللي ثانية) */
  delay?: number;
  /** إغلاق النافذة بعد الطباعة */
  closeAfterPrint?: boolean;
  /** أنماط CSS إضافية */
  styles?: string;
  /** دالة تنفذ قبل الطباعة */
  onBeforePrint?: () => void;
  /** دالة تنفذ بعد الطباعة */
  onAfterPrint?: () => void;
}

/**
 * قيمة إرجاع Hook الطباعة
 */
export interface UsePrintReturn {
  /** مرجع العنصر للطباعة */
  printRef: React.RefObject<HTMLDivElement>;
  /** دالة تشغيل الطباعة */
  handlePrint: () => void;
  /** حالة الطباعة */
  isPrinting: boolean;
}

// ==================== أنواع مساعدة ====================

/**
 * تسميات أنواع السندات
 */
export const voucherTypeLabels: Record<VoucherType, string> = {
  receipt: "سند قبض",
  payment: "سند صرف",
};

/**
 * تسميات طرق الدفع
 */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "نقدي",
  check: "شيك",
  transfer: "تحويل بنكي",
  card: "بطاقة",
};

/**
 * تسميات أنواع الفواتير
 */
export const invoiceTypeLabels: Record<InvoiceData["invoiceType"], string> = {
  sales: "فاتورة مبيعات",
  purchase: "فاتورة مشتريات",
  return: "فاتورة مرتجع",
};

/**
 * أبعاد أحجام الورق (بالمليمتر)
 */
export const paperSizes: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
};
