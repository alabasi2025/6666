/**
 * @fileoverview مكون طباعة الفاتورة
 * @module components/print/InvoicePrint
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PrintLayout } from "./PrintLayout";
import type { InvoicePrintProps, InvoiceData, PaymentMethod } from "./types";

/**
 * تسميات أنواع الفواتير
 */
const INVOICE_TYPE_LABELS: Record<InvoiceData["invoiceType"], string> = {
  sales: "فاتورة مبيعات",
  purchase: "فاتورة مشتريات",
  return: "فاتورة مرتجع",
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
 * مكون طباعة الفاتورة
 */
export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  (
    {
      invoice,
      companyInfo,
      showSignatures = true,
      showBarcode = false,
      showQRCode = false,
      className,
    },
    ref
  ) => {
    const invoiceTitle = INVOICE_TYPE_LABELS[invoice.invoiceType];
    const currency = invoice.currency || "ر.س";

    return (
      <PrintLayout
        ref={ref}
        companyInfo={companyInfo}
        title={invoiceTitle}
        paperSize="A4"
        showHeader={true}
        showFooter={true}
        className={className}
      >
        <div className="invoice-content space-y-6">
          {/* معلومات الفاتورة والعميل */}
          <div className="grid grid-cols-2 gap-6">
            {/* معلومات الفاتورة */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
                بيانات الفاتورة
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الفاتورة:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span>{formatDate(invoice.date)}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الاستحقاق:</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                )}
                {invoice.paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">طريقة الدفع:</span>
                    <span>{PAYMENT_METHOD_LABELS[invoice.paymentMethod]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* معلومات العميل/المورد */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
                {invoice.invoiceType === "purchase"
                  ? "بيانات المورد"
                  : "بيانات العميل"}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-bold">{invoice.party.name}</span>
                </div>
                {invoice.party.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">العنوان:</span>
                    <span>{invoice.party.address}</span>
                  </div>
                )}
                {invoice.party.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span dir="ltr">{invoice.party.phone}</span>
                  </div>
                )}
                {invoice.party.taxNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">الرقم الضريبي:</span>
                    <span>{invoice.party.taxNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* جدول البنود */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-2 text-center w-10">
                    #
                  </th>
                  {invoice.items[0]?.itemCode !== undefined && (
                    <th className="border border-gray-300 px-2 py-2 text-center w-20">
                      الكود
                    </th>
                  )}
                  <th className="border border-gray-300 px-2 py-2">الوصف</th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-16">
                    الكمية
                  </th>
                  {invoice.items[0]?.unit && (
                    <th className="border border-gray-300 px-2 py-2 text-center w-16">
                      الوحدة
                    </th>
                  )}
                  <th className="border border-gray-300 px-2 py-2 text-center w-24">
                    السعر
                  </th>
                  {invoice.items.some((item) => item.discountAmount) && (
                    <th className="border border-gray-300 px-2 py-2 text-center w-20">
                      الخصم
                    </th>
                  )}
                  {invoice.items.some((item) => item.taxAmount) && (
                    <th className="border border-gray-300 px-2 py-2 text-center w-20">
                      الضريبة
                    </th>
                  )}
                  <th className="border border-gray-300 px-2 py-2 text-center w-24">
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {item.lineNumber || index + 1}
                    </td>
                    {invoice.items[0]?.itemCode !== undefined && (
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.itemCode || "-"}
                      </td>
                    )}
                    <td className="border border-gray-300 px-2 py-2">
                      {item.description}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {item.quantity.toLocaleString("ar-SA")}
                    </td>
                    {invoice.items[0]?.unit && (
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.unit || "-"}
                      </td>
                    )}
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {formatAmount(item.unitPrice, currency)}
                    </td>
                    {invoice.items.some((i) => i.discountAmount) && (
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.discountAmount
                          ? formatAmount(item.discountAmount, currency)
                          : "-"}
                      </td>
                    )}
                    {invoice.items.some((i) => i.taxAmount) && (
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.taxAmount
                          ? formatAmount(item.taxAmount, currency)
                          : "-"}
                      </td>
                    )}
                    <td className="border border-gray-300 px-2 py-2 text-center font-medium">
                      {formatAmount(item.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ملخص الفاتورة */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between p-2 border-b">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span>{formatAmount(invoice.subtotal, currency)}</span>
              </div>
              {invoice.totalDiscount !== undefined && invoice.totalDiscount > 0 && (
                <div className="flex justify-between p-2 border-b text-red-600">
                  <span>الخصم:</span>
                  <span>- {formatAmount(invoice.totalDiscount, currency)}</span>
                </div>
              )}
              {invoice.totalTax !== undefined && invoice.totalTax > 0 && (
                <div className="flex justify-between p-2 border-b">
                  <span className="text-gray-600">الضريبة (15%):</span>
                  <span>{formatAmount(invoice.totalTax, currency)}</span>
                </div>
              )}
              <div className="flex justify-between p-3 bg-gray-100 rounded font-bold text-lg">
                <span>الإجمالي النهائي:</span>
                <span>{formatAmount(invoice.grandTotal, currency)}</span>
              </div>
              {invoice.paidAmount !== undefined && (
                <>
                  <div className="flex justify-between p-2 border-b text-green-600">
                    <span>المدفوع:</span>
                    <span>{formatAmount(invoice.paidAmount, currency)}</span>
                  </div>
                  {invoice.remainingAmount !== undefined &&
                    invoice.remainingAmount > 0 && (
                      <div className="flex justify-between p-2 border-b text-orange-600 font-medium">
                        <span>المتبقي:</span>
                        <span>{formatAmount(invoice.remainingAmount, currency)}</span>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          {/* ملاحظات */}
          {invoice.notes && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="font-medium text-gray-600 mb-2">ملاحظات:</div>
              <div className="text-sm text-gray-700">{invoice.notes}</div>
            </div>
          )}

          {/* الشروط والأحكام */}
          {invoice.terms && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="font-medium text-gray-600 mb-2">
                الشروط والأحكام:
              </div>
              <div className="text-xs text-gray-600 whitespace-pre-wrap">
                {invoice.terms}
              </div>
            </div>
          )}

          {/* التوقيعات */}
          {showSignatures && (
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="space-y-12">
                  <div className="h-16 border-b border-gray-400"></div>
                  <div className="font-medium text-gray-600">توقيع البائع</div>
                </div>
                <div className="space-y-12">
                  <div className="h-16 border-b border-gray-400"></div>
                  <div className="font-medium text-gray-600">توقيع المشتري</div>
                </div>
              </div>
            </div>
          )}

          {/* الباركود و QR Code */}
          {(showBarcode || showQRCode) && (
            <div className="flex justify-center gap-8 mt-6 pt-4 border-t">
              {showBarcode && (
                <div className="text-center">
                  <div className="h-12 w-48 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    [باركود: {invoice.invoiceNumber}]
                  </div>
                </div>
              )}
              {showQRCode && (
                <div className="text-center">
                  <div className="h-24 w-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    [QR Code]
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PrintLayout>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";

export default InvoicePrint;
