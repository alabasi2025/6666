/**
 * @fileoverview مكون طباعة السند (قبض/صرف)
 * @module components/print/VoucherPrint
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PrintLayout } from "./PrintLayout";
import type {
  VoucherPrintProps,
  VoucherType,
  PaymentMethod,
  voucherTypeLabels,
  paymentMethodLabels,
} from "./types";

/**
 * تسميات أنواع السندات
 */
const VOUCHER_TYPE_LABELS: Record<VoucherType, string> = {
  receipt: "سند قبض",
  payment: "سند صرف",
};

/**
 * تسميات طرق الدفع
 */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "نقدي",
  check: "شيك",
  transfer: "تحويل بنكي",
  card: "بطاقة",
};

/**
 * تنسيق التاريخ
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * تنسيق المبلغ
 */
function formatAmount(amount: number, currency = "ر.س"): string {
  return `${amount.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

/**
 * تحويل الرقم إلى كلمات عربية (مبسط)
 */
function numberToArabicWords(num: number): string {
  // هذه دالة مبسطة - يمكن استبدالها بمكتبة متخصصة
  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "عشرة",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const hundreds = [
    "",
    "مائة",
    "مائتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];

  if (num === 0) return "صفر";

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let result = "";

  // معالجة الآلاف
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000);
    if (thousands === 1) result += "ألف ";
    else if (thousands === 2) result += "ألفان ";
    else if (thousands <= 10) result += ones[thousands] + " آلاف ";
    else result += thousands + " ألف ";
  }

  // معالجة المئات
  const remainder = intPart % 1000;
  if (remainder >= 100) {
    result += hundreds[Math.floor(remainder / 100)] + " ";
  }

  // معالجة العشرات والآحاد
  const tensAndOnes = remainder % 100;
  if (tensAndOnes > 0) {
    if (tensAndOnes < 10) {
      result += ones[tensAndOnes] + " ";
    } else if (tensAndOnes < 20) {
      result += ones[tensAndOnes - 10] + " عشر ";
    } else {
      const onesDigit = tensAndOnes % 10;
      const tensDigit = Math.floor(tensAndOnes / 10);
      if (onesDigit > 0) {
        result += ones[onesDigit] + " و";
      }
      result += tens[tensDigit] + " ";
    }
  }

  result += "ريال";

  // إضافة الهللات
  if (decPart > 0) {
    result += ` و${decPart} هللة`;
  }

  return result.trim();
}

/**
 * مكون طباعة السند
 */
export const VoucherPrint = forwardRef<HTMLDivElement, VoucherPrintProps>(
  ({ voucher, companyInfo, showSignatures = true, copies = 1, className }, ref) => {
    const isReceipt = voucher.voucherType === "receipt";
    const voucherTitle = VOUCHER_TYPE_LABELS[voucher.voucherType];
    const amountInWords =
      voucher.amountInWords || numberToArabicWords(voucher.amount);

    return (
      <PrintLayout
        ref={ref}
        companyInfo={companyInfo}
        title={voucherTitle}
        paperSize="A4"
        showHeader={true}
        showFooter={true}
        className={className}
      >
        <div className="voucher-content space-y-6">
          {/* معلومات السند الأساسية */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">رقم السند:</span>
                <span className="font-bold text-lg">{voucher.voucherNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">التاريخ:</span>
                <span>{formatDate(voucher.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">الخزينة:</span>
                <span>{voucher.treasuryName || "-"}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">طريقة الدفع:</span>
                <span>{PAYMENT_METHOD_LABELS[voucher.paymentMethod]}</span>
              </div>
              {voucher.paymentMethod === "check" && (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">رقم الشيك:</span>
                    <span>{voucher.checkNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">تاريخ الشيك:</span>
                    <span>{formatDate(voucher.checkDate)}</span>
                  </div>
                </>
              )}
              {voucher.paymentMethod === "transfer" && voucher.bankReference && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">رقم المرجع:</span>
                  <span>{voucher.bankReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* معلومات الطرف */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-600">
                {isReceipt ? "استلمنا من السيد/السادة:" : "صرفنا إلى السيد/السادة:"}
              </span>
              <span className="font-bold text-lg flex-1 border-b border-dashed border-gray-400 pb-1">
                {voucher.partyName || "_______________"}
              </span>
            </div>
          </div>

          {/* المبلغ */}
          <div className="p-6 bg-gray-100 rounded-lg border-2 border-gray-300">
            <div className="text-center space-y-3">
              <div className="text-sm text-gray-600">المبلغ</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatAmount(voucher.amount, voucher.currency)}
              </div>
              <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                <span className="font-medium">فقط:</span> {amountInWords} لا غير
              </div>
            </div>
          </div>

          {/* البيان */}
          <div className="p-4 border rounded-lg">
            <div className="font-medium text-gray-600 mb-2">وذلك عن:</div>
            <div className="min-h-[60px] p-3 bg-gray-50 rounded border border-dashed">
              {voucher.description || "_______________________________________________"}
            </div>
          </div>

          {/* ملاحظات */}
          {voucher.notes && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="font-medium text-gray-600 mb-2">ملاحظات:</div>
              <div className="text-sm text-gray-700">{voucher.notes}</div>
            </div>
          )}

          {/* التوقيعات */}
          {showSignatures && (
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="space-y-12">
                  <div className="h-16 border-b border-gray-400"></div>
                  <div className="font-medium text-gray-600">
                    {isReceipt ? "المستلم" : "المستفيد"}
                  </div>
                </div>
                <div className="space-y-12">
                  <div className="h-16 border-b border-gray-400"></div>
                  <div className="font-medium text-gray-600">أمين الصندوق</div>
                </div>
                <div className="space-y-12">
                  <div className="h-16 border-b border-gray-400"></div>
                  <div className="font-medium text-gray-600">المدير المالي</div>
                </div>
              </div>
            </div>
          )}

          {/* معلومات الإنشاء */}
          {voucher.createdBy && (
            <div className="text-xs text-gray-400 text-left mt-4">
              أنشئ بواسطة: {voucher.createdBy}
            </div>
          )}
        </div>
      </PrintLayout>
    );
  }
);

VoucherPrint.displayName = "VoucherPrint";

export default VoucherPrint;
