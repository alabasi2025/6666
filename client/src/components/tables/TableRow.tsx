/**
 * مكون صف الجدول
 * @module tables/TableRow
 */

import { memo } from "react";
import { TableRow as UITableRow, TableCell as UITableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableRowProps, getNestedValue } from "./types";
import { TableCell } from "./TableCell";

/**
 * مكون صف الجدول مع دعم التحديد والإجراءات
 */
export const DataTableRow = memo(function DataTableRow<T extends Record<string, any>>({
  row,
  index,
  columns,
  rowId,
  selectable = false,
  isSelected = false,
  onSelect,
  hasActions = false,
  onView,
  onEdit,
  onDelete,
  customActions = [],
  onClick,
  className,
}: TableRowProps<T>) {
  const handleRowClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <UITableRow
      data-state={isSelected ? "selected" : undefined}
      className={cn(
        "hover:bg-muted/30 transition-colors",
        isSelected && "bg-muted/50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={handleRowClick}
    >
      {/* خلية التحديد */}
      {selectable && (
        <UITableCell className="w-[50px] text-center" onClick={handleCheckboxClick}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect?.()}
            aria-label="تحديد الصف"
          />
        </UITableCell>
      )}

      {/* خلايا البيانات */}
      {columns.map((column) => {
        if (column.hidden) return null;

        const value = getNestedValue(row, column.key as string);

        return (
          <TableCell
            key={column.key as string}
            value={value}
            column={column}
            row={row}
            rowIndex={index}
          />
        );
      })}

      {/* خلية الإجراءات */}
      {hasActions && (onView || onEdit || onDelete || customActions.length > 0) && (
        <UITableCell className="w-[100px] text-center">
          <RowActions
            row={row}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            customActions={customActions}
          />
        </UITableCell>
      )}
    </UITableRow>
  );
});

/**
 * مكون إجراءات الصف
 */
interface RowActionsProps<T> {
  row: T;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: TableRowProps<T>["customActions"];
}

function RowActions<T>({
  row,
  onView,
  onEdit,
  onDelete,
  customActions = [],
}: RowActionsProps<T>) {
  // فلترة الإجراءات المخصصة المرئية
  const visibleCustomActions = customActions.filter(
    (action) => !action.isVisible || action.isVisible(row)
  );

  // إذا كان هناك أقل من 4 إجراءات، نعرضها مباشرة
  const totalActions = (onView ? 1 : 0) + (onEdit ? 1 : 0) + (onDelete ? 1 : 0) + visibleCustomActions.length;

  if (totalActions <= 3) {
    return (
      <div className="flex items-center justify-center gap-1">
        {onView && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            title="عرض"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
        {visibleCustomActions.map((action) => {
          const isEnabled = !action.isEnabled || action.isEnabled(row);
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                action.iconColor && `text-${action.iconColor}`
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (isEnabled) {
                  action.onClick(row);
                }
              }}
              disabled={!isEnabled}
              title={action.title}
            >
              {action.icon}
            </Button>
          );
        })}
      </div>
    );
  }

  // إذا كان هناك أكثر من 3 إجراءات، نستخدم قائمة منسدلة
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {onView && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
          >
            <Eye className="w-4 h-4 ml-2" />
            عرض
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="w-4 h-4 ml-2" />
            تعديل
          </DropdownMenuItem>
        )}
        {visibleCustomActions.map((action) => {
          const isEnabled = !action.isEnabled || action.isEnabled(row);
          return (
            <DropdownMenuItem
              key={action.id}
              onClick={(e) => {
                e.stopPropagation();
                if (isEnabled) {
                  action.onClick(row);
                }
              }}
              disabled={!isEnabled}
            >
              {action.icon && <span className="ml-2">{action.icon}</span>}
              {action.title}
            </DropdownMenuItem>
          );
        })}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * مكون صف فارغ
 */
export function EmptyRow({
  colSpan,
  message = "لا توجد بيانات",
  icon,
}: {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <UITableRow>
      <UITableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          {icon}
          <span>{message}</span>
        </div>
      </UITableCell>
    </UITableRow>
  );
}

/**
 * مكون صف التحميل
 */
export function LoadingRow({
  colSpan,
  message = "جاري التحميل...",
}: {
  colSpan: number;
  message?: string;
}) {
  return (
    <UITableRow>
      <UITableCell colSpan={colSpan} className="h-32 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">{message}</span>
        </div>
      </UITableCell>
    </UITableRow>
  );
}

/**
 * مكون صف الهيكل العظمي
 */
export function SkeletonRow({
  columns,
  selectable = false,
  hasActions = false,
}: {
  columns: number;
  selectable?: boolean;
  hasActions?: boolean;
}) {
  const totalCells = columns + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  return (
    <UITableRow>
      {Array.from({ length: totalCells }).map((_, index) => (
        <UITableCell key={index}>
          <div className="h-4 bg-muted rounded animate-pulse" />
        </UITableCell>
      ))}
    </UITableRow>
  );
}

export default DataTableRow;
