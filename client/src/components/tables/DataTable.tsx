/**
 * مكون جدول البيانات المتقدم
 * @module tables/DataTable
 */

import { useState, useMemo, useCallback, memo } from "react";
import { Table } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DataTableProps,
  SortState,
  FilterState,
  ColumnDefinition,
  getNestedValue,
  applyFilter,
} from "./types";
import { DataTableHeader } from "./TableHeader";
import { DataTableBody } from "./TableBody";
import { TablePagination } from "./TablePagination";
import { TableToolbar } from "./TableToolbar";
import { TableFilter } from "./TableFilter";
import { TableExport, QuickExportButton } from "./TableExport";

/**
 * مكون جدول البيانات المتقدم
 * يدعم الترتيب والفلترة والتصفح والتحديد والتصدير
 */
export const DataTable = memo(function DataTable<T extends Record<string, any>>({
  // البيانات والأعمدة
  data,
  columns,
  getRowId = (row) => row.id,
  loading = false,
  emptyMessage = "لا توجد بيانات",
  emptyIcon,

  // البحث
  searchable = true,
  searchPlaceholder = "بحث...",
  searchKeys,
  searchValue: controlledSearchValue,
  onSearchChange,
  searchDebounce = 300,

  // الترتيب
  sortable = true,
  sortState: controlledSortState,
  onSortChange,
  multiSort = false,

  // الفلترة
  filterable = false,
  filterStates: controlledFilterStates,
  onFilterChange,

  // التصفح
  paginated = true,
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  paginationState: controlledPaginationState,
  onPageChange,
  onPageSizeChange,

  // التحديد
  selectable = false,
  selectionMode = "multiple",
  selectedRows: controlledSelectedRows,
  onSelectionChange,
  isRowSelectable,

  // الإجراءات
  actions = true,
  actionsTitle = "إجراءات",
  actionsWidth,
  onView,
  onEdit,
  onDelete,
  customActions = [],

  // شريط الأدوات
  title,
  description,
  addButtonText = "إضافة جديد",
  onAdd,
  onRefresh,
  onExport,
  extraButtons,
  showToolbar = true,

  // التصدير
  exportable = false,
  exportFileName = "export",
  exportColumns,
  exportFormats = ["csv", "excel"],

  // التنسيق
  className,
  containerClassName,
  bordered = true,
  striped = false,
  compact = false,
  stickyHeader = false,
  height,
  maxHeight,
  onRowClick,
  onRowDoubleClick,
  getRowClassName,
  isRowExpandable,
  renderExpandedRow,
}: DataTableProps<T>) {
  // الحالة الداخلية
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [internalSortState, setInternalSortState] = useState<SortState | null>(null);
  const [internalFilterStates, setInternalFilterStates] = useState<FilterState[]>([]);
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string | number>>(
    new Set()
  );
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // استخدام الحالة المتحكم بها أو الداخلية
  const searchValue = controlledSearchValue ?? internalSearchValue;
  const sortState = controlledSortState ?? internalSortState;
  const filterStates = controlledFilterStates ?? internalFilterStates;
  const currentPage = controlledPaginationState?.currentPage ?? internalCurrentPage;
  const pageSize = controlledPaginationState?.pageSize ?? internalPageSize;

  // حساب الصفوف المحددة
  const selectedKeys = useMemo(() => {
    if (controlledSelectedRows) {
      return new Set(controlledSelectedRows.map((row) => getRowId(row)));
    }
    return internalSelectedKeys;
  }, [controlledSelectedRows, internalSelectedKeys, getRowId]);

  // فلترة البيانات بناءً على البحث
  const searchedData = useMemo(() => {
    if (!searchValue) return data;

    const query = searchValue.toLowerCase();
    const keysToSearch = searchKeys || columns.map((col) => col.key as string);

    return data.filter((row) =>
      keysToSearch.some((key) => {
        const value = getNestedValue(row, key);
        return value?.toString().toLowerCase().includes(query);
      })
    );
  }, [data, searchValue, searchKeys, columns]);

  // فلترة البيانات بناءً على الفلاتر
  const filteredData = useMemo(() => {
    if (filterStates.length === 0) return searchedData;

    return searchedData.filter((row) =>
      filterStates.every((filter) => {
        const column = columns.find((col) => col.key === filter.columnKey);
        const value = column?.getFilterValue
          ? column.getFilterValue(row)
          : getNestedValue(row, filter.columnKey);
        return applyFilter(value, filter);
      })
    );
  }, [searchedData, filterStates, columns]);

  // ترتيب البيانات
  const sortedData = useMemo(() => {
    if (!sortState || !sortState.direction) return filteredData;

    const column = columns.find((col) => col.key === sortState.columnKey);

    return [...filteredData].sort((a, b) => {
      const aValue = column?.getSortValue
        ? column.getSortValue(a)
        : getNestedValue(a, sortState.columnKey);
      const bValue = column?.getSortValue
        ? column.getSortValue(b)
        : getNestedValue(b, sortState.columnKey);

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortState.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns]);

  // تقسيم البيانات إلى صفحات
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;

    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, paginated, currentPage, pageSize]);

  // حساب معلومات التصفح
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // معالجات الأحداث
  const handleSearchChange = useCallback(
    (value: string) => {
      if (onSearchChange) {
        onSearchChange(value);
      } else {
        setInternalSearchValue(value);
      }
      // إعادة تعيين الصفحة عند البحث
      if (!controlledPaginationState) {
        setInternalCurrentPage(1);
      }
    },
    [onSearchChange, controlledPaginationState]
  );

  const handleSort = useCallback(
    (columnKey: string) => {
      const newSortState: SortState | null = (() => {
        if (sortState?.columnKey !== columnKey) {
          return { columnKey, direction: "asc" as const };
        }
        if (sortState.direction === "asc") {
          return { columnKey, direction: "desc" as const };
        }
        return null;
      })();

      if (onSortChange) {
        onSortChange(newSortState);
      } else {
        setInternalSortState(newSortState);
      }
    },
    [sortState, onSortChange]
  );

  const handleFilterChange = useCallback(
    (states: FilterState[]) => {
      if (onFilterChange) {
        onFilterChange(states);
      } else {
        setInternalFilterStates(states);
      }
      // إعادة تعيين الصفحة عند الفلترة
      if (!controlledPaginationState) {
        setInternalCurrentPage(1);
      }
    },
    [onFilterChange, controlledPaginationState]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setInternalCurrentPage(page);
      }
    },
    [onPageChange]
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      if (onPageSizeChange) {
        onPageSizeChange(size);
      } else {
        setInternalPageSize(size);
        setInternalCurrentPage(1);
      }
    },
    [onPageSizeChange]
  );

  const handleSelectRow = useCallback(
    (row: T) => {
      const rowId = getRowId(row);

      if (onSelectionChange) {
        const currentSelected = controlledSelectedRows || [];
        const isSelected = currentSelected.some((r) => getRowId(r) === rowId);

        if (selectionMode === "single") {
          onSelectionChange(isSelected ? [] : [row]);
        } else {
          onSelectionChange(
            isSelected
              ? currentSelected.filter((r) => getRowId(r) !== rowId)
              : [...currentSelected, row]
          );
        }
      } else {
        setInternalSelectedKeys((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(rowId)) {
            newSet.delete(rowId);
          } else {
            if (selectionMode === "single") {
              newSet.clear();
            }
            newSet.add(rowId);
          }
          return newSet;
        });
      }
    },
    [getRowId, onSelectionChange, controlledSelectedRows, selectionMode]
  );

  const handleSelectAll = useCallback(() => {
    const selectableRows = paginatedData.filter(
      (row) => !isRowSelectable || isRowSelectable(row)
    );
    const allSelected = selectableRows.every((row) =>
      selectedKeys.has(getRowId(row))
    );

    if (onSelectionChange) {
      if (allSelected) {
        const currentSelected = controlledSelectedRows || [];
        onSelectionChange(
          currentSelected.filter(
            (row) => !selectableRows.some((r) => getRowId(r) === getRowId(row))
          )
        );
      } else {
        const currentSelected = controlledSelectedRows || [];
        const newSelected = [...currentSelected];
        selectableRows.forEach((row) => {
          if (!newSelected.some((r) => getRowId(r) === getRowId(row))) {
            newSelected.push(row);
          }
        });
        onSelectionChange(newSelected);
      }
    } else {
      setInternalSelectedKeys((prev) => {
        const newSet = new Set(prev);
        if (allSelected) {
          selectableRows.forEach((row) => newSet.delete(getRowId(row)));
        } else {
          selectableRows.forEach((row) => newSet.add(getRowId(row)));
        }
        return newSet;
      });
    }
  }, [
    paginatedData,
    selectedKeys,
    getRowId,
    isRowSelectable,
    onSelectionChange,
    controlledSelectedRows,
  ]);

  // حساب حالة التحديد
  const selectableRows = paginatedData.filter(
    (row) => !isRowSelectable || isRowSelectable(row)
  );
  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedKeys.has(getRowId(row)));
  const isPartiallySelected =
    selectableRows.some((row) => selectedKeys.has(getRowId(row))) && !isAllSelected;

  // الأعمدة المرئية
  const visibleColumns = columns.filter((col) => !col.hidden);

  // معالج التصدير
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    } else if (exportable) {
      setShowExportDialog(true);
    }
  }, [onExport, exportable]);

  return (
    <Card className={cn("w-full", containerClassName)}>
      {/* شريط الأدوات */}
      {showToolbar && (
        <CardHeader className="pb-4">
          <TableToolbar
            title={title}
            description={description}
            searchable={searchable}
            searchValue={searchValue}
            searchPlaceholder={searchPlaceholder}
            onSearchChange={handleSearchChange}
            filterable={filterable}
            activeFiltersCount={filterStates.length}
            onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
            onAdd={onAdd}
            addButtonText={addButtonText}
            onRefresh={onRefresh}
            loading={loading}
            onExport={exportable || onExport ? handleExport : undefined}
            extraButtons={extraButtons}
            selectedCount={selectedKeys.size}
          />
        </CardHeader>
      )}

      <CardContent>
        {/* لوحة الفلاتر */}
        {filterable && showFilterPanel && (
          <div className="mb-4">
            <TableFilter
              columns={columns.filter((col) => col.filterable !== false)}
              filterStates={filterStates}
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilterPanel(false)}
            />
          </div>
        )}

        {/* الجدول */}
        <div
          className={cn(
            "rounded-lg overflow-hidden",
            bordered && "border border-border"
          )}
          style={{
            height: height,
            maxHeight: maxHeight,
          }}
        >
          <div className={cn("overflow-x-auto", maxHeight && "overflow-y-auto")}>
            <Table className={cn(striped && "table-striped", compact && "table-compact")}>
              <DataTableHeader
                columns={visibleColumns}
                sortState={sortState}
                onSort={sortable ? handleSort : undefined}
                selectable={selectable}
                isAllSelected={isAllSelected}
                isPartiallySelected={isPartiallySelected}
                onSelectAll={handleSelectAll}
                hasActions={actions && (!!onView || !!onEdit || !!onDelete || customActions.length > 0)}
                actionsTitle={actionsTitle}
                className={stickyHeader ? "sticky top-0 z-10 bg-background" : undefined}
              />
              <DataTableBody
                data={paginatedData}
                columns={visibleColumns}
                getRowId={getRowId}
                loading={loading}
                emptyMessage={emptyMessage}
                emptyIcon={emptyIcon}
                selectable={selectable}
                selectedKeys={selectedKeys}
                onSelectRow={handleSelectRow}
                hasActions={actions && (!!onView || !!onEdit || !!onDelete || customActions.length > 0)}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                customActions={customActions}
                onRowClick={onRowClick}
                getRowClassName={getRowClassName}
              />
            </Table>
          </div>
        </div>

        {/* التصفح */}
        {paginated && totalItems > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </CardContent>

      {/* نافذة التصدير */}
      {exportable && (
        <TableExport
          data={sortedData}
          columns={columns}
          fileName={exportFileName}
          formats={exportFormats}
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </Card>
  );
});

/**
 * مكون شارة الحالة
 */
export function StatusBadge({
  status,
  statusMap,
}: {
  status: string;
  statusMap: Record<
    string,
    { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }
  >;
}) {
  const config = statusMap[status] || { label: status, variant: "secondary" as const };

  const variantClasses = {
    default: "bg-primary/20 text-primary border-primary/30",
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    destructive: "bg-destructive/20 text-destructive border-destructive/30",
    secondary: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", variantClasses[config.variant])}
    >
      {config.label}
    </Badge>
  );
}

export default DataTable;
