/**
 * مكون فلترة الجدول
 * @module tables/TableFilter
 */

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Filter, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TableFilterProps,
  FilterState,
  FilterOperator,
  FilterType,
  ColumnDefinition,
} from "./types";

/**
 * عوامل المقارنة حسب نوع الفلتر
 */
const operatorsByType: Record<FilterType, { value: FilterOperator; label: string }[]> = {
  text: [
    { value: "contains", label: "يحتوي على" },
    { value: "equals", label: "يساوي" },
    { value: "notEquals", label: "لا يساوي" },
    { value: "startsWith", label: "يبدأ بـ" },
    { value: "endsWith", label: "ينتهي بـ" },
    { value: "isEmpty", label: "فارغ" },
    { value: "isNotEmpty", label: "غير فارغ" },
  ],
  number: [
    { value: "equals", label: "يساوي" },
    { value: "notEquals", label: "لا يساوي" },
    { value: "greaterThan", label: "أكبر من" },
    { value: "lessThan", label: "أصغر من" },
    { value: "greaterThanOrEqual", label: "أكبر من أو يساوي" },
    { value: "lessThanOrEqual", label: "أصغر من أو يساوي" },
    { value: "between", label: "بين" },
  ],
  date: [
    { value: "equals", label: "يساوي" },
    { value: "notEquals", label: "لا يساوي" },
    { value: "greaterThan", label: "بعد" },
    { value: "lessThan", label: "قبل" },
    { value: "between", label: "بين" },
  ],
  select: [
    { value: "equals", label: "يساوي" },
    { value: "notEquals", label: "لا يساوي" },
  ],
  boolean: [
    { value: "equals", label: "يساوي" },
  ],
};

/**
 * مكون فلترة الجدول الرئيسي
 */
export const TableFilter = memo(function TableFilter({
  columns,
  filterStates,
  onFilterChange,
  onClose,
  isOpen = true,
  className,
}: TableFilterProps) {
  const filterableColumns = columns.filter((col) => col.filterable !== false);

  const handleAddFilter = useCallback(() => {
    if (filterableColumns.length === 0) return;

    const firstColumn = filterableColumns[0];
    const filterType = firstColumn.filterType || "text";
    const operators = operatorsByType[filterType];

    const newFilter: FilterState = {
      columnKey: firstColumn.key as string,
      operator: operators[0].value,
      value: "",
    };

    onFilterChange([...filterStates, newFilter]);
  }, [filterableColumns, filterStates, onFilterChange]);

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const newFilters = filterStates.filter((_, i) => i !== index);
      onFilterChange(newFilters);
    },
    [filterStates, onFilterChange]
  );

  const handleUpdateFilter = useCallback(
    (index: number, updates: Partial<FilterState>) => {
      const newFilters = filterStates.map((filter, i) =>
        i === index ? { ...filter, ...updates } : filter
      );
      onFilterChange(newFilters);
    },
    [filterStates, onFilterChange]
  );

  const handleClearAll = useCallback(() => {
    onFilterChange([]);
  }, [onFilterChange]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "p-4 border rounded-lg bg-card space-y-4",
        className
      )}
    >
      {/* رأس الفلتر */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">الفلاتر</span>
          {filterStates.length > 0 && (
            <Badge variant="secondary">{filterStates.length}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filterStates.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              مسح الكل
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* قائمة الفلاتر */}
      <div className="space-y-3">
        {filterStates.map((filter, index) => {
          const column = filterableColumns.find(
            (col) => col.key === filter.columnKey
          );
          if (!column) return null;

          return (
            <FilterRow
              key={index}
              filter={filter}
              column={column}
              columns={filterableColumns}
              onUpdate={(updates) => handleUpdateFilter(index, updates)}
              onRemove={() => handleRemoveFilter(index)}
            />
          );
        })}
      </div>

      {/* زر إضافة فلتر */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddFilter}
        className="w-full"
      >
        <Plus className="w-4 h-4 ml-2" />
        إضافة فلتر
      </Button>
    </div>
  );
});

/**
 * مكون صف الفلتر
 */
interface FilterRowProps {
  filter: FilterState;
  column: ColumnDefinition;
  columns: ColumnDefinition[];
  onUpdate: (updates: Partial<FilterState>) => void;
  onRemove: () => void;
}

function FilterRow({
  filter,
  column,
  columns,
  onUpdate,
  onRemove,
}: FilterRowProps) {
  const filterType = column.filterType || "text";
  const operators = operatorsByType[filterType];
  const needsValue = !["isEmpty", "isNotEmpty"].includes(filter.operator);
  const needsSecondValue = filter.operator === "between";

  const handleColumnChange = (columnKey: string) => {
    const newColumn = columns.find((col) => col.key === columnKey);
    if (!newColumn) return;

    const newFilterType = newColumn.filterType || "text";
    const newOperators = operatorsByType[newFilterType];

    onUpdate({
      columnKey,
      operator: newOperators[0].value,
      value: "",
      value2: undefined,
    });
  };

  return (
    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
      {/* اختيار العمود */}
      <div className="flex-1 min-w-[120px]">
        <Label className="text-xs text-muted-foreground mb-1 block">العمود</Label>
        <Select value={filter.columnKey} onValueChange={handleColumnChange}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col.key as string} value={col.key as string}>
                {col.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* اختيار العامل */}
      <div className="flex-1 min-w-[120px]">
        <Label className="text-xs text-muted-foreground mb-1 block">الشرط</Label>
        <Select
          value={filter.operator}
          onValueChange={(value) => onUpdate({ operator: value as FilterOperator })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* إدخال القيمة */}
      {needsValue && (
        <div className="flex-1 min-w-[120px]">
          <Label className="text-xs text-muted-foreground mb-1 block">القيمة</Label>
          <FilterValueInput
            filterType={filterType}
            value={filter.value}
            onChange={(value) => onUpdate({ value })}
            options={column.filterOptions}
          />
        </div>
      )}

      {/* إدخال القيمة الثانية (للنطاقات) */}
      {needsSecondValue && (
        <div className="flex-1 min-w-[120px]">
          <Label className="text-xs text-muted-foreground mb-1 block">إلى</Label>
          <FilterValueInput
            filterType={filterType}
            value={filter.value2}
            onChange={(value) => onUpdate({ value2: value })}
            options={column.filterOptions}
          />
        </div>
      )}

      {/* زر الحذف */}
      <div className="pt-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * مكون إدخال قيمة الفلتر
 */
interface FilterValueInputProps {
  filterType: FilterType;
  value: any;
  onChange: (value: any) => void;
  options?: { value: any; label: string }[];
}

function FilterValueInput({
  filterType,
  value,
  onChange,
  options,
}: FilterValueInputProps) {
  switch (filterType) {
    case "select":
      return (
        <Select value={value?.toString() || ""} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="اختر..." />
          </SelectTrigger>
          <SelectContent>
            {options?.map((opt) => (
              <SelectItem key={opt.value?.toString()} value={opt.value?.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "boolean":
      return (
        <Select value={value?.toString() || ""} onValueChange={(v) => onChange(v === "true")}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="اختر..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">نعم</SelectItem>
            <SelectItem value="false">لا</SelectItem>
          </SelectContent>
        </Select>
      );

    case "date":
      return <DateFilterInput value={value} onChange={onChange} />;

    case "number":
      return (
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")}
          className="h-9"
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
      );
  }
}

/**
 * مكون إدخال تاريخ للفلتر
 */
function DateFilterInput({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-right font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="ml-2 h-4 w-4" />
          {date ? date.toLocaleDateString("ar-SA") : "اختر تاريخ"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onChange(newDate?.toISOString());
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * مكون فلتر سريع
 */
export function QuickFilter({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label className="text-sm whitespace-nowrap">{label}:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">الكل</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * مكون شريط الفلاتر السريعة
 */
export function QuickFiltersBar({
  filters,
  values,
  onChange,
  className,
}: {
  filters: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {filters.map((filter) => (
        <QuickFilter
          key={filter.key}
          label={filter.label}
          value={values[filter.key] || ""}
          options={filter.options}
          onChange={(value) => onChange(filter.key, value)}
        />
      ))}
    </div>
  );
}

/**
 * مكون شارات الفلاتر النشطة
 */
export function ActiveFiltersBadges({
  filters,
  columns,
  onRemove,
  onClearAll,
  className,
}: {
  filters: FilterState[];
  columns: ColumnDefinition[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {filters.map((filter, index) => {
        const column = columns.find((col) => col.key === filter.columnKey);
        if (!column) return null;

        const filterType = column.filterType || "text";
        const operators = operatorsByType[filterType];
        const operator = operators.find((op) => op.value === filter.operator);

        return (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 pr-1"
          >
            <span>{column.title}</span>
            <span className="text-muted-foreground">{operator?.label}</span>
            {filter.value && <span>"{filter.value}"</span>}
            <button
              className="ml-1 hover:text-destructive"
              onClick={() => onRemove(index)}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        );
      })}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        مسح الكل
      </Button>
    </div>
  );
}

export default TableFilter;
