/**
 * @fileoverview مكون طباعة الإيصال (للطابعات الحرارية)
 * @module components/print/ReceiptPrint
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { ReceiptPrintProps, PaymentMethod } from "./types";

/**
 * تسميات طرق الدفع
 */
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "نقدي",
  check: "شيك",
  transfer: "تحويل",
  card: "بطاقة",
};

/**
 * تنسيق التاريخ والوقت
 */
function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * تنسيق المبلغ
 */
function formatAmount(amount: number): string {
  return amount.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * مكون طباعة الإيصال
 * مصمم للطابعات الحرارية (58mm أو 80mm)
 */
export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  (
    {
      receipt,
      companyInfo,
      width = "80mm",
      showBarcode = false,
      className,
    },
    ref
  ) => {
    // تحديد عرض الإيصال
    const widthClass =
      width === "58mm"
        ? "w-[58mm]"
        : width === "80mm"
        ? "w-[80mm]"
        : "w-full max-w-md";

    return (
      <div
        ref={ref}
        className={cn(
          "receipt-print bg-white text-gray-900 mx-auto p-2",
          widthClass,
          "font-mono text-xs",
          className
        )}
        dir="rtl"
      >
        {/* أنماط الطباعة */}
        <style>
          {`
            @media print {
              @page {
                size: ${width === "full" ? "auto" : width} auto;
                margin: 0;
              }
              
              .receipt-print {
                width: 100% !important;
                padding: 2mm !important;
                margin: 0 !important;
              }
            }
          `}
        </style>

        {/* رأس الإيصال */}
        <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
          {companyInfo.logo && (
            <img
              src={companyInfo.logo}
              alt={companyInfo.name}
              className="h-10 w-10 mx-auto mb-1 object-contain"
            />
          )}
          <div className="font-bold text-sm">{companyInfo.name}</div>
          {companyInfo.address && (
            <div className="text-[10px] text-gray-600">{companyInfo.address}</div>
          )}
          {companyInfo.phone && (
            <div className="text-[10px] text-gray-600" dir="ltr">
              {companyInfo.phone}
            </div>
          )}
          {companyInfo.taxNumber && (
            <div className="text-[10px] text-gray-600">
              الرقم الضريبي: {companyInfo.taxNumber}
            </div>
          )}
        </div>

        {/* معلومات الإيصال */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[10px]">
          <div className="flex justify-between">
            <span>رقم الإيصال:</span>
            <span className="font-bold">{receipt.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>التاريخ:</span>
            <span>{formatDateTime(receipt.date)}</span>
          </div>
          {receipt.customerName && (
            <div className="flex justify-between">
              <span>العميل:</span>
              <span>{receipt.customerName}</span>
            </div>
          )}
          {receipt.cashierName && (
            <div className="flex justify-between">
              <span>الكاشير:</span>
              <span>{receipt.cashierName}</span>
            </div>
          )}
        </div>

        {/* عنوان الفاتورة */}
        <div className="text-center font-bold mb-2">فاتورة ضريبية مبسطة</div>

        {/* البنود */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-right py-1">الصنف</th>
                <th className="text-center py-1 w-8">الكمية</th>
                <th className="text-center py-1 w-12">السعر</th>
                <th className="text-left py-1 w-14">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-1 text-right">{item.description}</td>
                  <td className="py-1 text-center">{item.quantity}</td>
                  <td className="py-1 text-center">{formatAmount(item.price)}</td>
                  <td className="py-1 text-left">{formatAmount(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ملخص الأسعار */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[10px]">
          <div className="flex justify-between">
            <span>المجموع الفرعي:</span>
            <span>{formatAmount(receipt.subtotal)}</span>
          </div>
          {receipt.discount !== undefined && receipt.discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>الخصم:</span>
              <span>- {formatAmount(receipt.discount)}</span>
            </div>
          )}
          {receipt.tax !== undefined && receipt.tax > 0 && (
            <div className="flex justify-between">
              <span>الضريبة (15%):</span>
              <span>{formatAmount(receipt.tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-gray-300">
            <span>الإجمالي:</span>
            <span>{formatAmount(receipt.total)}</span>
          </div>
        </div>

        {/* معلومات الدفع */}
        <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[10px]">
          <div className="flex justify-between">
            <span>طريقة الدفع:</span>
            <span>{PAYMENT_METHOD_LABELS[receipt.paymentMethod]}</span>
          </div>
          <div className="flex justify-between">
            <span>المدفوع:</span>
            <span>{formatAmount(receipt.paidAmount)}</span>
          </div>
          {receipt.change !== undefined && receipt.change > 0 && (
            <div className="flex justify-between font-bold">
              <span>الباقي:</span>
              <span>{formatAmount(receipt.change)}</span>
            </div>
          )}
        </div>

        {/* ملاحظات */}
        {receipt.notes && (
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2 text-[10px]">
            <div className="text-gray-600">{receipt.notes}</div>
          </div>
        )}

        {/* الباركود */}
        {showBarcode && (
          <div className="text-center mb-2">
            <div className="h-8 bg-gray-200 flex items-center justify-center text-[8px] text-gray-500">
              [باركود: {receipt.receiptNumber}]
            </div>
          </div>
        )}

        {/* تذييل الإيصال */}
        <div className="text-center text-[10px] text-gray-600">
          <div>شكراً لتسوقكم معنا</div>
          <div>نتمنى لكم يوماً سعيداً</div>
          {companyInfo.website && (
            <div dir="ltr" className="mt-1">
              {companyInfo.website}
            </div>
          )}
        </div>

        {/* خط القطع */}
        <div className="mt-3 border-t border-dashed border-gray-400 pt-1 text-center text-[8px] text-gray-400">
          ✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - ✂
        </div>
      </div>
    );
  }
);

ReceiptPrint.displayName = "ReceiptPrint";

export default ReceiptPrint;
