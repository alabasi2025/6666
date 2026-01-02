/**
 * مكون شريط أدوات الجدول
 * @module tables/TableToolbar
 */

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  RefreshCw,
  Download,
  Filter,
  X,
  Settings2,
  Columns,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TableToolbarProps } from "./types";

/**
 * مكون شريط أدوات الجدول الرئيسي
 */
export const TableToolbar = memo(function TableToolbar({
  title,
  description,
  searchable = true,
  searchValue = "",
  searchPlaceholder = "بحث...",
  onSearchChange,
  filterable = false,
  activeFiltersCount = 0,
  onFilterClick,
  onAdd,
  addButtonText = "إضافة جديد",
  onRefresh,
  loading = false,
  onExport,
  extraButtons,
  selectedCount = 0,
  bulkActions,
  className,
}: TableToolbarProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearchValue(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearchValue("");
    onSearchChange?.("");
  }, [onSearchChange]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* العنوان والأزرار الرئيسية */}
      {(title || onAdd || onRefresh || onExport) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* العنوان والوصف */}
          <div>
            {title && (
              <h2 className="text-xl font-semibold">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>

          {/* الأزرار الرئيسية */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={loading}
                title="تحديث"
              >
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              </Button>
            )}
            {onExport && (
              <Button
                variant="outline"
                size="icon"
                onClick={onExport}
                title="تصدير"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            {extraButtons}
            {onAdd && (
              <Button onClick={onAdd} className="gradient-energy">
                <Plus className="w-4 h-4 ml-2" />
                {addButtonText}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* شريط البحث والفلاتر */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* البحث */}
        {searchable && onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={localSearchValue}
              onChange={handleSearchChange}
              className="pr-10 pl-10"
            />
            {localSearchValue && (
              <button
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* زر الفلترة */}
        {filterable && onFilterClick && (
          <Button
            variant="outline"
            onClick={onFilterClick}
            className="relative"
          >
            <Filter className="w-4 h-4 ml-2" />
            فلترة
            {activeFiltersCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* شريط الإجراءات الجماعية */}
      {selectedCount > 0 && bulkActions && (
        <BulkActionsBar
          selectedCount={selectedCount}
          actions={bulkActions}
        />
      )}
    </div>
  );
});

/**
 * مكون شريط الإجراءات الجماعية
 */
function BulkActionsBar({
  selectedCount,
  actions,
}: {
  selectedCount: number;
  actions: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
      <span className="text-sm font-medium">
        تم تحديد {selectedCount} عنصر
      </span>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

/**
 * مكون شريط أدوات بسيط
 */
export function SimpleToolbar({
  onSearch,
  searchPlaceholder = "بحث...",
  onAdd,
  addButtonText = "إضافة",
  className,
}: {
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addButtonText?: string;
  className?: string;
}) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {onSearch && (
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearch}
            className="pr-10"
          />
        </div>
      )}
      {onAdd && (
        <Button onClick={onAdd}>
          <Plus className="w-4 h-4 ml-2" />
          {addButtonText}
        </Button>
      )}
    </div>
  );
}

/**
 * مكون شريط أدوات متقدم
 */
export function AdvancedToolbar({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = "بحث...",
  filters,
  onFiltersChange,
  columns,
  visibleColumns,
  onColumnsChange,
  onAdd,
  addButtonText = "إضافة جديد",
  onRefresh,
  loading = false,
  onExport,
  exportFormats = ["csv", "excel"],
  selectedCount = 0,
  bulkActions,
  className,
}: {
  title?: string;
  description?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onFiltersChange?: (filters: any) => void;
  columns?: { key: string; title: string }[];
  visibleColumns?: string[];
  onColumnsChange?: (columns: string[]) => void;
  onAdd?: () => void;
  addButtonText?: string;
  onRefresh?: () => void;
  loading?: boolean;
  onExport?: (format: string) => void;
  exportFormats?: string[];
  selectedCount?: number;
  bulkActions?: React.ReactNode;
  className?: string;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showColumns, setShowColumns] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      {/* الصف الأول: العنوان والأزرار */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
          )}
          {columns && onColumnsChange && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowColumns(!showColumns)}
            >
              <Columns className="w-4 h-4" />
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="icon" onClick={() => onExport("csv")}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onAdd && (
            <Button onClick={onAdd}>
              <Plus className="w-4 h-4 ml-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* الصف الثاني: البحث والفلاتر */}
      <div className="flex flex-col sm:flex-row gap-4">
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pr-10"
            />
          </div>
        )}
        {filters && (
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 ml-2" />
            فلاتر
          </Button>
        )}
      </div>

      {/* الفلاتر */}
      {showFilters && filters && (
        <div className="p-4 border rounded-lg bg-muted/30">{filters}</div>
      )}

      {/* اختيار الأعمدة */}
      {showColumns && columns && onColumnsChange && (
        <ColumnSelector
          columns={columns}
          visibleColumns={visibleColumns || columns.map((c) => c.key)}
          onChange={onColumnsChange}
        />
      )}

      {/* الإجراءات الجماعية */}
      {selectedCount > 0 && bulkActions && (
        <BulkActionsBar selectedCount={selectedCount} actions={bulkActions} />
      )}
    </div>
  );
}

/**
 * مكون اختيار الأعمدة
 */
function ColumnSelector({
  columns,
  visibleColumns,
  onChange,
}: {
  columns: { key: string; title: string }[];
  visibleColumns: string[];
  onChange: (columns: string[]) => void;
}) {
  const toggleColumn = (key: string) => {
    if (visibleColumns.includes(key)) {
      onChange(visibleColumns.filter((c) => c !== key));
    } else {
      onChange([...visibleColumns, key]);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <h3 className="font-medium mb-3">الأعمدة المرئية</h3>
      <div className="flex flex-wrap gap-2">
        {columns.map((column) => (
          <Button
            key={column.key}
            variant={visibleColumns.includes(column.key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleColumn(column.key)}
          >
            {column.title}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * مكون شريط أدوات الإعدادات
 */
export function SettingsToolbar({
  onSettings,
  onColumns,
  onDensity,
  density = "normal",
  className,
}: {
  onSettings?: () => void;
  onColumns?: () => void;
  onDensity?: (density: "compact" | "normal" | "comfortable") => void;
  density?: "compact" | "normal" | "comfortable";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onColumns && (
        <Button variant="ghost" size="icon" onClick={onColumns} title="الأعمدة">
          <Columns className="w-4 h-4" />
        </Button>
      )}
      {onDensity && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const densities: ("compact" | "normal" | "comfortable")[] = [
              "compact",
              "normal",
              "comfortable",
            ];
            const currentIndex = densities.indexOf(density);
            const nextIndex = (currentIndex + 1) % densities.length;
            onDensity(densities[nextIndex]);
          }}
        >
          {density === "compact" ? "مضغوط" : density === "normal" ? "عادي" : "مريح"}
        </Button>
      )}
      {onSettings && (
        <Button variant="ghost" size="icon" onClick={onSettings} title="الإعدادات">
          <Settings2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export default TableToolbar;
