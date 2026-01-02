/**
 * @fileoverview مكون تخطيط الطباعة العام
 * @module components/print/PrintLayout
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PrintHeader } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";
import type { PrintLayoutProps, PaperSize, PaperOrientation } from "./types";

/**
 * الحصول على أنماط حجم الورق
 */
function getPaperStyles(
  size: PaperSize,
  orientation: PaperOrientation
): string {
  const sizes: Record<PaperSize, { width: string; height: string }> = {
    A4: { width: "210mm", height: "297mm" },
    A5: { width: "148mm", height: "210mm" },
    Letter: { width: "8.5in", height: "11in" },
    Legal: { width: "8.5in", height: "14in" },
  };

  const { width, height } = sizes[size];

  if (orientation === "landscape") {
    return `w-[${height}] min-h-[${width}]`;
  }

  return `w-[${width}] min-h-[${height}]`;
}

/**
 * مكون تخطيط الطباعة
 * يوفر هيكل موحد لجميع المستندات المطبوعة
 */
export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  (
    {
      children,
      paperSize = "A4",
      orientation = "portrait",
      showHeader = true,
      showFooter = true,
      companyInfo,
      title,
      currentPage,
      totalPages,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "print-layout bg-white text-gray-900",
          "p-8 mx-auto",
          getPaperStyles(paperSize, orientation),
          // أنماط الطباعة
          "print:p-0 print:m-0 print:shadow-none",
          // أنماط العرض
          "shadow-lg",
          className
        )}
        dir="rtl"
      >
        {/* أنماط الطباعة المضمنة */}
        <style>
          {`
            @media print {
              @page {
                size: ${paperSize} ${orientation};
                margin: 15mm;
              }
              
              .print-layout {
                width: 100% !important;
                min-height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
              }
              
              .no-print {
                display: none !important;
              }
              
              .print-break-before {
                page-break-before: always;
              }
              
              .print-break-after {
                page-break-after: always;
              }
              
              .print-avoid-break {
                page-break-inside: avoid;
              }
            }
            
            @media screen {
              .print-layout {
                font-family: 'Tajawal', 'Cairo', 'Noto Sans Arabic', sans-serif;
              }
            }
          `}
        </style>

        {/* رأس الصفحة */}
        {showHeader && companyInfo && (
          <PrintHeader companyInfo={companyInfo} title={title} />
        )}

        {/* المحتوى الرئيسي */}
        <main className="print-content flex-1">{children}</main>

        {/* تذييل الصفحة */}
        {showFooter && (
          <PrintFooter currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    );
  }
);

PrintLayout.displayName = "PrintLayout";

export default PrintLayout;
