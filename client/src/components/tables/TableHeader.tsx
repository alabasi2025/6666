/**
 * مكون رأس الجدول
 * @module tables/TableHeader
 */

import { memo } from "react";
import {
  TableHeader as UITableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableHeaderProps, SortDirection } from "./types";

/**
 * مكون رأس الجدول مع دعم الترتيب
 */
export const DataTableHeader = memo(function DataTableHeader<T>({
  columns,
  sortState,
  onSort,
  selectable = false,
  isAllSelected = false,
  isPartiallySelected = false,
  onSelectAll,
  hasActions = false,
  actionsTitle = "إجراءات",
  className,
}: TableHeaderProps<T>) {
  return (
    <UITableHeader className={className}>
      <TableRow className="bg-muted/50 hover:bg-muted/50">
        {/* خلية تحديد الكل */}
        {selectable && (
          <TableHead className="w-[50px] text-center">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) {
                  (el as any).indeterminate = isPartiallySelected && !isAllSelected;
                }
              }}
              onCheckedChange={() => onSelectAll?.()}
              aria-label="تحديد الكل"
            />
          </TableHead>
        )}

        {/* رؤوس الأعمدة */}
        {columns.map((column) => {
          if (column.hidden) return null;

          const isSorted = sortState?.columnKey === column.key;
          const sortDirection = isSorted ? sortState?.direction : null;

          return (
            <TableHead
              key={column.key as string}
              className={cn(
                "font-semibold whitespace-nowrap",
                column.align === "center" && "text-center",
                column.align === "right" && "text-left",
                column.headerClassName
              )}
              style={{
                width: typeof column.width === "number" ? `${column.width}px` : column.width,
                minWidth: typeof column.minWidth === "number" ? `${column.minWidth}px` : column.minWidth,
                maxWidth: typeof column.maxWidth === "number" ? `${column.maxWidth}px` : column.maxWidth,
              }}
            >
              {column.sortable !== false && onSort ? (
                <SortableHeader
                  title={column.title}
                  columnKey={column.key as string}
                  sortDirection={sortDirection}
                  onSort={onSort}
                  tooltip={column.tooltip}
                />
              ) : (
                <span title={column.tooltip}>{column.title}</span>
              )}
            </TableHead>
          );
        })}

        {/* رأس عمود الإجراءات */}
        {hasActions && (
          <TableHead className="w-[100px] text-center">
            {actionsTitle}
          </TableHead>
        )}
      </TableRow>
    </UITableHeader>
  );
});

/**
 * مكون رأس قابل للترتيب
 */
interface SortableHeaderProps {
  title: string;
  columnKey: string;
  sortDirection: SortDirection;
  onSort: (columnKey: string) => void;
  tooltip?: string;
}

function SortableHeader({
  title,
  columnKey,
  sortDirection,
  onSort,
  tooltip,
}: SortableHeaderProps) {
  return (
    <button
      className="flex items-center gap-2 hover:text-primary transition-colors"
      onClick={() => onSort(columnKey)}
      title={tooltip}
    >
      {title}
      <SortIcon direction={sortDirection} />
    </button>
  );
}

/**
 * مكون أيقونة الترتيب
 */
function SortIcon({ direction }: { direction: SortDirection }) {
  if (!direction) {
    return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
  }

  return direction === "asc" ? (
    <ArrowUp className="w-4 h-4 text-primary" />
  ) : (
    <ArrowDown className="w-4 h-4 text-primary" />
  );
}

/**
 * مكون رأس مجموعة أعمدة
 */
export function ColumnGroupHeader({
  title,
  colSpan,
  className,
}: {
  title: string;
  colSpan: number;
  className?: string;
}) {
  return (
    <TableHead
      colSpan={colSpan}
      className={cn("text-center font-bold border-b-2", className)}
    >
      {title}
    </TableHead>
  );
}

/**
 * مكون رأس متعدد المستويات
 */
export function MultiLevelHeader({
  groups,
  columns,
  className,
}: {
  groups: { title: string; columns: string[] }[];
  columns: { key: string; title: string }[];
  className?: string;
}) {
  return (
    <UITableHeader className={className}>
      {/* صف المجموعات */}
      <TableRow className="bg-muted/70">
        {groups.map((group) => (
          <TableHead
            key={group.title}
            colSpan={group.columns.length}
            className="text-center font-bold border-b-2 border-border"
          >
            {group.title}
          </TableHead>
        ))}
      </TableRow>
      {/* صف الأعمدة */}
      <TableRow className="bg-muted/50">
        {columns.map((column) => (
          <TableHead key={column.key} className="font-semibold">
            {column.title}
          </TableHead>
        ))}
      </TableRow>
    </UITableHeader>
  );
}

/**
 * مكون رأس ثابت
 */
export function StickyHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <UITableHeader
      className={cn(
        "sticky top-0 z-10 bg-background shadow-sm",
        className
      )}
    >
      {children}
    </UITableHeader>
  );
}

/**
 * مكون رأس مع فلتر
 */
export function FilterableHeader({
  title,
  columnKey,
  sortDirection,
  onSort,
  filterValue,
  onFilterChange,
  filterPlaceholder = "فلترة...",
  className,
}: {
  title: string;
  columnKey: string;
  sortDirection?: SortDirection;
  onSort?: (columnKey: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  className?: string;
}) {
  return (
    <TableHead className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {onSort ? (
          <button
            className="flex items-center gap-2 hover:text-primary transition-colors"
            onClick={() => onSort(columnKey)}
          >
            {title}
            <SortIcon direction={sortDirection || null} />
          </button>
        ) : (
          <span>{title}</span>
        )}
      </div>
      {onFilterChange && (
        <input
          type="text"
          value={filterValue || ""}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={filterPlaceholder}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}
    </TableHead>
  );
}

/**
 * مكون رأس قابل لتغيير الحجم
 */
export function ResizableHeader({
  title,
  width,
  minWidth = 50,
  maxWidth = 500,
  onResize,
  className,
}: {
  title: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
  className?: string;
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + diff));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <TableHead
      className={cn("relative", className)}
      style={{ width }}
    >
      {title}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-primary"
        onMouseDown={handleMouseDown}
      />
    </TableHead>
  );
}

export default DataTableHeader;
