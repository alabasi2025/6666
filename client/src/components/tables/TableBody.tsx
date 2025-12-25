/**
 * مكون جسم الجدول
 * @module tables/TableBody
 */

import { memo } from "react";
import { TableBody as UITableBody } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TableBodyProps } from "./types";
import { DataTableRow, EmptyRow, LoadingRow, SkeletonRow } from "./TableRow";

/**
 * مكون جسم الجدول مع دعم التحميل والبيانات الفارغة
 */
export const DataTableBody = memo(function DataTableBody<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  emptyIcon,
  selectable = false,
  selectedKeys = new Set(),
  onSelectRow,
  hasActions = false,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  onRowClick,
  getRowClassName,
  className,
}: TableBodyProps<T>) {
  // حساب عدد الأعمدة الكلي
  const visibleColumns = columns.filter((col) => !col.hidden);
  const totalColumns =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (hasActions ? 1 : 0);

  // حالة التحميل
  if (loading) {
    return (
      <UITableBody className={className}>
        <LoadingRow colSpan={totalColumns} />
      </UITableBody>
    );
  }

  // حالة البيانات الفارغة
  if (data.length === 0) {
    return (
      <UITableBody className={className}>
        <EmptyRow
          colSpan={totalColumns}
          message={emptyMessage}
          icon={emptyIcon}
        />
      </UITableBody>
    );
  }

  return (
    <UITableBody className={className}>
      {data.map((row, index) => {
        const rowId = getRowId(row);
        const isSelected = selectedKeys.has(rowId);
        const rowClassName = getRowClassName?.(row, index);

        return (
          <DataTableRow
            key={rowId}
            row={row}
            index={index}
            columns={columns}
            rowId={rowId}
            selectable={selectable}
            isSelected={isSelected}
            onSelect={() => onSelectRow?.(row)}
            hasActions={hasActions}
            onView={onView ? () => onView(row) : undefined}
            onEdit={onEdit ? () => onEdit(row) : undefined}
            onDelete={onDelete ? () => onDelete(row) : undefined}
            customActions={customActions}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={rowClassName}
          />
        );
      })}
    </UITableBody>
  );
});

/**
 * مكون جسم الجدول مع الهيكل العظمي
 */
export function SkeletonTableBody({
  rows = 5,
  columns,
  selectable = false,
  hasActions = false,
  className,
}: {
  rows?: number;
  columns: number;
  selectable?: boolean;
  hasActions?: boolean;
  className?: string;
}) {
  return (
    <UITableBody className={className}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow
          key={index}
          columns={columns}
          selectable={selectable}
          hasActions={hasActions}
        />
      ))}
    </UITableBody>
  );
}

/**
 * مكون جسم الجدول مع التجميع
 */
export function GroupedTableBody<T extends Record<string, any>>({
  groups,
  columns,
  getRowId,
  renderGroupHeader,
  selectable = false,
  selectedKeys = new Set(),
  onSelectRow,
  hasActions = false,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  onRowClick,
  getRowClassName,
  className,
}: {
  groups: { key: string; label: string; rows: T[] }[];
  columns: TableBodyProps<T>["columns"];
  getRowId: (row: T) => string | number;
  renderGroupHeader?: (group: { key: string; label: string; rows: T[] }) => React.ReactNode;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectRow?: (row: T) => void;
  hasActions?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: TableBodyProps<T>["customActions"];
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string;
  className?: string;
}) {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const totalColumns =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (hasActions ? 1 : 0);

  return (
    <UITableBody className={className}>
      {groups.map((group) => (
        <>
          {/* رأس المجموعة */}
          <tr key={`group-${group.key}`} className="bg-muted/30">
            <td colSpan={totalColumns} className="px-4 py-2 font-semibold">
              {renderGroupHeader ? renderGroupHeader(group) : (
                <span>{group.label} ({group.rows.length})</span>
              )}
            </td>
          </tr>
          {/* صفوف المجموعة */}
          {group.rows.map((row, index) => {
            const rowId = getRowId(row);
            const isSelected = selectedKeys.has(rowId);
            const rowClassName = getRowClassName?.(row, index);

            return (
              <DataTableRow
                key={rowId}
                row={row}
                index={index}
                columns={columns}
                rowId={rowId}
                selectable={selectable}
                isSelected={isSelected}
                onSelect={() => onSelectRow?.(row)}
                hasActions={hasActions}
                onView={onView ? () => onView(row) : undefined}
                onEdit={onEdit ? () => onEdit(row) : undefined}
                onDelete={onDelete ? () => onDelete(row) : undefined}
                customActions={customActions}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={rowClassName}
              />
            );
          })}
        </>
      ))}
    </UITableBody>
  );
}

/**
 * مكون جسم الجدول مع التوسيع
 */
export function ExpandableTableBody<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  expandedKeys,
  onToggleExpand,
  renderExpandedContent,
  selectable = false,
  selectedKeys = new Set(),
  onSelectRow,
  hasActions = false,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  onRowClick,
  getRowClassName,
  className,
}: {
  data: T[];
  columns: TableBodyProps<T>["columns"];
  getRowId: (row: T) => string | number;
  expandedKeys: Set<string | number>;
  onToggleExpand: (rowId: string | number) => void;
  renderExpandedContent: (row: T) => React.ReactNode;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectRow?: (row: T) => void;
  hasActions?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: TableBodyProps<T>["customActions"];
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string;
  className?: string;
}) {
  const visibleColumns = columns.filter((col) => !col.hidden);
  const totalColumns =
    visibleColumns.length +
    (selectable ? 1 : 0) +
    (hasActions ? 1 : 0) +
    1; // +1 لزر التوسيع

  return (
    <UITableBody className={className}>
      {data.map((row, index) => {
        const rowId = getRowId(row);
        const isExpanded = expandedKeys.has(rowId);
        const isSelected = selectedKeys.has(rowId);
        const rowClassName = getRowClassName?.(row, index);

        return (
          <>
            <DataTableRow
              key={rowId}
              row={row}
              index={index}
              columns={columns}
              rowId={rowId}
              selectable={selectable}
              isSelected={isSelected}
              onSelect={() => onSelectRow?.(row)}
              hasActions={hasActions}
              onView={onView ? () => onView(row) : undefined}
              onEdit={onEdit ? () => onEdit(row) : undefined}
              onDelete={onDelete ? () => onDelete(row) : undefined}
              customActions={customActions}
              onClick={() => {
                onToggleExpand(rowId);
                onRowClick?.(row);
              }}
              className={cn(rowClassName, isExpanded && "border-b-0")}
            />
            {isExpanded && (
              <tr key={`expanded-${rowId}`}>
                <td colSpan={totalColumns} className="bg-muted/20 p-4">
                  {renderExpandedContent(row)}
                </td>
              </tr>
            )}
          </>
        );
      })}
    </UITableBody>
  );
}

/**
 * مكون جسم الجدول الافتراضي (للقوائم الطويلة)
 */
export function VirtualizedTableBody<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  rowHeight = 48,
  visibleRows = 10,
  selectable = false,
  selectedKeys = new Set(),
  onSelectRow,
  hasActions = false,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  onRowClick,
  getRowClassName,
  className,
}: {
  data: T[];
  columns: TableBodyProps<T>["columns"];
  getRowId: (row: T) => string | number;
  rowHeight?: number;
  visibleRows?: number;
  selectable?: boolean;
  selectedKeys?: Set<string | number>;
  onSelectRow?: (row: T) => void;
  hasActions?: boolean;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  customActions?: TableBodyProps<T>["customActions"];
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string;
  className?: string;
}) {
  // ملاحظة: هذا تنفيذ مبسط - للإنتاج يفضل استخدام مكتبة مثل react-virtual
  const containerHeight = rowHeight * visibleRows;

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ maxHeight: containerHeight }}
    >
      <UITableBody>
        {data.map((row, index) => {
          const rowId = getRowId(row);
          const isSelected = selectedKeys.has(rowId);
          const rowClassName = getRowClassName?.(row, index);

          return (
            <DataTableRow
              key={rowId}
              row={row}
              index={index}
              columns={columns}
              rowId={rowId}
              selectable={selectable}
              isSelected={isSelected}
              onSelect={() => onSelectRow?.(row)}
              hasActions={hasActions}
              onView={onView ? () => onView(row) : undefined}
              onEdit={onEdit ? () => onEdit(row) : undefined}
              onDelete={onDelete ? () => onDelete(row) : undefined}
              customActions={customActions}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={rowClassName}
            />
          );
        })}
      </UITableBody>
    </div>
  );
}

export default DataTableBody;
