/**
 * @fileoverview مكون طباعة التقرير
 * @module components/print/ReportPrint
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PrintLayout } from "./PrintLayout";
import type { ReportPrintProps, TableColumn } from "./types";

/**
 * تنسيق التاريخ
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * الحصول على قيمة من كائن باستخدام المفتاح
 */
function getValue<T>(obj: T, key: string): unknown {
  return (obj as Record<string, unknown>)[key];
}

/**
 * تنسيق القيمة للعرض
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") {
    return value.toLocaleString("ar-SA");
  }
  if (value instanceof Date) {
    return formatDate(value);
  }
  return String(value);
}

/**
 * مكون طباعة التقرير
 */
export const ReportPrint = forwardRef<HTMLDivElement, ReportPrintProps>(
  (
    {
      report,
      companyInfo,
      showRowNumbers = true,
      showTotals = true,
      className,
    },
    ref
  ) => {
    // حساب الأعمدة مع إضافة عمود الترقيم
    const columns: TableColumn[] = showRowNumbers
      ? [{ key: "_rowNumber", title: "#", width: "40px", align: "center" }, ...report.columns]
      : report.columns;

    return (
      <PrintLayout
        ref={ref}
        companyInfo={companyInfo}
        title={report.title}
        paperSize="A4"
        showHeader={true}
        showFooter={true}
        className={className}
      >
        <div className="report-content space-y-6">
          {/* معلومات التقرير */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
              {report.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{report.subtitle}</p>
              )}
            </div>
            {report.period && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">الفترة:</span>{" "}
                {formatDate(report.period.from)} - {formatDate(report.period.to)}
              </div>
            )}
          </div>

          {/* جدول البيانات */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              {/* رأس الجدول */}
              <thead>
                <tr className="bg-gray-100">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "border border-gray-300 px-3 py-2 font-bold text-gray-800",
                        column.align === "center" && "text-center",
                        column.align === "left" && "text-left",
                        column.align === "right" && "text-right"
                      )}
                      style={{ width: column.width }}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* جسم الجدول */}
              <tbody>
                {report.data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="border border-gray-300 px-3 py-8 text-center text-gray-500"
                    >
                      لا توجد بيانات للعرض
                    </td>
                  </tr>
                ) : (
                  report.data.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={cn(
                        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50",
                        "hover:bg-gray-100"
                      )}
                    >
                      {columns.map((column) => {
                        const value =
                          column.key === "_rowNumber"
                            ? rowIndex + 1
                            : getValue(row, column.key);

                        const displayValue = column.render
                          ? column.render(value, row, rowIndex)
                          : formatValue(value);

                        return (
                          <td
                            key={column.key}
                            className={cn(
                              "border border-gray-300 px-3 py-2",
                              column.align === "center" && "text-center",
                              column.align === "left" && "text-left",
                              column.align === "right" && "text-right"
                            )}
                          >
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>

              {/* تذييل الجدول (الإجماليات) */}
              {showTotals && report.summary && (
                <tfoot>
                  <tr className="bg-gray-200 font-bold">
                    <td
                      colSpan={showRowNumbers ? 2 : 1}
                      className="border border-gray-300 px-3 py-2"
                    >
                      الإجمالي
                    </td>
                    {columns.slice(showRowNumbers ? 2 : 1).map((column) => {
                      const summaryValue = report.summary?.[column.key];
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "border border-gray-300 px-3 py-2",
                            column.align === "center" && "text-center",
                            column.align === "left" && "text-left",
                            column.align === "right" && "text-right"
                          )}
                        >
                          {summaryValue !== undefined
                            ? formatValue(summaryValue)
                            : "-"}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* عدد السجلات */}
          <div className="text-sm text-gray-600">
            إجمالي السجلات: {report.data.length}
          </div>

          {/* ملخص التقرير */}
          {report.summary && Object.keys(report.summary).length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-bold text-gray-800 mb-3">ملخص التقرير</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(report.summary).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 bg-white rounded border text-center"
                  >
                    <div className="text-xs text-gray-500 mb-1">{key}</div>
                    <div className="font-bold text-gray-900">
                      {formatValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ملاحظات */}
          {report.notes && (
            <div className="p-4 border rounded-lg bg-yellow-50">
              <div className="font-medium text-gray-600 mb-2">ملاحظات:</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {report.notes}
              </div>
            </div>
          )}
        </div>
      </PrintLayout>
    );
  }
);

ReportPrint.displayName = "ReportPrint";

export default ReportPrint;
