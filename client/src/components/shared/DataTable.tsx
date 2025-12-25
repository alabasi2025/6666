/**
 * @fileoverview مكون جدول البيانات المشترك
 * @module components/shared/DataTable
 */

import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TableLoadingSpinner } from "./LoadingSpinner";
import { TableEmptyState } from "./EmptyState";

export interface Column<T> {
  /** معرف العمود */
  id: string;
  /** عنوان العمود */
  header: string;
  /** دالة الوصول للقيمة */
  accessor: keyof T | ((row: T) => ReactNode);
  /** كلاسات إضافية للخلية */
  className?: string;
  /** محاذاة النص */
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  /** الأعمدة */
  columns: Column<T>[];
  /** البيانات */
  data: T[];
  /** حالة التحميل */
  isLoading?: boolean;
  /** رسالة الحالة الفارغة */
  emptyMessage?: string;
  /** وصف الحالة الفارغة */
  emptyDescription?: string;
  /** نص زر الإضافة */
  emptyActionLabel?: string;
  /** دالة الإضافة */
  onEmptyAction?: () => void;
  /** دالة النقر على الصف */
  onRowClick?: (row: T) => void;
  /** كلاسات إضافية */
  className?: string;
  /** مفتاح فريد للصف */
  rowKey: keyof T;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "لا توجد بيانات",
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  className,
  rowKey,
}: DataTableProps<T>) {
  const getCellValue = (row: T, accessor: Column<T>["accessor"]): ReactNode => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor] as ReactNode;
  };

  const getAlignClass = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "left":
        return "text-left";
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-right";
    }
  };

  if (isLoading) {
    return <TableLoadingSpinner />;
  }

  if (data.length === 0) {
    return (
      <TableEmptyState
        title={emptyMessage}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn(getAlignClass(column.align), column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={String(row[rowKey])}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={cn(getAlignClass(column.align), column.className)}
                >
                  {getCellValue(row, column.accessor)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * مكون ترقيم الصفحات
 */
export interface PaginationProps {
  /** الصفحة الحالية */
  currentPage: number;
  /** إجمالي الصفحات */
  totalPages: number;
  /** دالة تغيير الصفحة */
  onPageChange: (page: number) => void;
  /** عدد العناصر في الصفحة */
  pageSize?: number;
  /** إجمالي العناصر */
  totalItems?: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 10,
  totalItems,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-muted-foreground">
        {totalItems && (
          <span>
            عرض {startItem} - {endItem} من {totalItems}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          السابق
        </button>
        <span className="text-sm">
          صفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
        >
          التالي
        </button>
      </div>
    </div>
  );
}
