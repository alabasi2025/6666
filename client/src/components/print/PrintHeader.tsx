/**
 * @fileoverview مكون رأس الطباعة
 * @module components/print/PrintHeader
 */

import { cn } from "@/lib/utils";
import type { PrintHeaderProps } from "./types";

/**
 * تنسيق التاريخ للعرض
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * مكون رأس الطباعة
 * يعرض شعار ومعلومات الشركة مع عنوان المستند
 */
export function PrintHeader({
  companyInfo,
  title,
  documentNumber,
  date,
  className,
}: PrintHeaderProps) {
  return (
    <header
      className={cn(
        "print-header border-b-2 border-gray-800 pb-4 mb-6",
        className
      )}
    >
      {/* القسم العلوي: الشعار ومعلومات الشركة */}
      <div className="flex items-start justify-between gap-4">
        {/* الشعار واسم الشركة */}
        <div className="flex items-center gap-4">
          {companyInfo.logo && (
            <img
              src={companyInfo.logo}
              alt={companyInfo.name}
              className="h-16 w-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {companyInfo.name}
            </h1>
            {companyInfo.nameEn && (
              <p className="text-sm text-gray-600" dir="ltr">
                {companyInfo.nameEn}
              </p>
            )}
          </div>
        </div>

        {/* معلومات الاتصال */}
        <div className="text-left text-sm text-gray-600 space-y-1">
          {companyInfo.address && (
            <p className="flex items-center gap-1">
              <span className="font-medium">العنوان:</span>
              <span>{companyInfo.address}</span>
            </p>
          )}
          {companyInfo.phone && (
            <p className="flex items-center gap-1">
              <span className="font-medium">هاتف:</span>
              <span dir="ltr">{companyInfo.phone}</span>
            </p>
          )}
          {companyInfo.email && (
            <p className="flex items-center gap-1">
              <span className="font-medium">بريد:</span>
              <span dir="ltr">{companyInfo.email}</span>
            </p>
          )}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="flex justify-between mt-3 text-xs text-gray-500">
        <div className="flex gap-4">
          {companyInfo.taxNumber && (
            <span>
              <span className="font-medium">الرقم الضريبي:</span>{" "}
              {companyInfo.taxNumber}
            </span>
          )}
          {companyInfo.commercialRegister && (
            <span>
              <span className="font-medium">السجل التجاري:</span>{" "}
              {companyInfo.commercialRegister}
            </span>
          )}
        </div>
        {companyInfo.website && (
          <span dir="ltr">{companyInfo.website}</span>
        )}
      </div>

      {/* عنوان المستند */}
      {(title || documentNumber || date) && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <div className="flex items-center justify-between">
            {title && (
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            )}
            <div className="flex gap-6 text-sm">
              {documentNumber && (
                <div>
                  <span className="font-medium text-gray-600">رقم المستند:</span>{" "}
                  <span className="font-bold">{documentNumber}</span>
                </div>
              )}
              {date && (
                <div>
                  <span className="font-medium text-gray-600">التاريخ:</span>{" "}
                  <span>{formatDate(date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default PrintHeader;
