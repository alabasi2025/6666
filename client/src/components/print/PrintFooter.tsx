/**
 * @fileoverview مكون تذييل الطباعة
 * @module components/print/PrintFooter
 */

import { cn } from "@/lib/utils";
import type { PrintFooterProps } from "./types";

/**
 * تنسيق التاريخ والوقت الحالي
 */
function formatDateTime(): string {
  return new Date().toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * مكون تذييل الطباعة
 * يعرض رقم الصفحة ومعلومات إضافية
 */
export function PrintFooter({
  currentPage,
  totalPages,
  additionalText,
  showDateTime = true,
  className,
}: PrintFooterProps) {
  return (
    <footer
      className={cn(
        "print-footer border-t border-gray-300 pt-3 mt-6 text-xs text-gray-500",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {/* النص الإضافي أو التاريخ والوقت */}
        <div>
          {additionalText && <span>{additionalText}</span>}
          {showDateTime && !additionalText && (
            <span>تاريخ الطباعة: {formatDateTime()}</span>
          )}
        </div>

        {/* رقم الصفحة */}
        {currentPage !== undefined && totalPages !== undefined && (
          <div className="font-medium">
            صفحة {currentPage} من {totalPages}
          </div>
        )}
      </div>

      {/* خط فاصل وملاحظة */}
      <div className="mt-2 text-center text-gray-400">
        <span>هذا المستند تم إنشاؤه إلكترونياً</span>
      </div>
    </footer>
  );
}

export default PrintFooter;
