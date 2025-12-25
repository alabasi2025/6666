import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FormField, FormFieldProps } from "./FormField";
import { CalendarIcon, XIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { ar, enUS } from "date-fns/locale";

/**
 * نوع التقويم
 */
type CalendarType = "gregorian" | "hijri";

/**
 * خصائص مكون FormDatePicker
 */
export interface FormDatePickerProps
  extends Omit<FormFieldProps, "children"> {
  /** التاريخ المحدد */
  value?: Date;
  /** القيمة الافتراضية */
  defaultValue?: Date;
  /** دالة عند تغيير التاريخ */
  onValueChange?: (date: Date | undefined) => void;
  /** نوع التقويم */
  calendarType?: CalendarType;
  /** نص العنصر النائب */
  placeholder?: string;
  /** تنسيق التاريخ */
  dateFormat?: string;
  /** الحد الأدنى للتاريخ */
  minDate?: Date;
  /** الحد الأقصى للتاريخ */
  maxDate?: Date;
  /** الأيام المعطلة */
  disabledDays?: Date[] | ((date: Date) => boolean);
  /** إظهار زر المسح */
  clearable?: boolean;
  /** إظهار زر اليوم */
  showTodayButton?: boolean;
  /** أنماط CSS إضافية للزر */
  triggerClassName?: string;
}

/**
 * تحويل التاريخ الميلادي إلى هجري (تقريبي)
 */
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((date.getTime() - new Date(1970, 0, 1).getTime()) / 86400000) + 2440588;
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month, day };
}

/**
 * تنسيق التاريخ الهجري
 */
function formatHijriDate(date: Date): string {
  const hijri = gregorianToHijri(date);
  const months = [
    "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];
  return `${hijri.day} ${months[hijri.month - 1]} ${hijri.year}`;
}

/**
 * مكون FormDatePicker
 * منتقي تاريخ متقدم مع دعم التقويم الهجري والميلادي
 */
function FormDatePicker({
  // FormField props
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  className,
  labelClassName,
  // DatePicker specific props
  value,
  defaultValue,
  onValueChange,
  calendarType = "gregorian",
  placeholder = "اختر تاريخ...",
  dateFormat = "PPP",
  minDate,
  maxDate,
  disabledDays,
  clearable = true,
  showTodayButton = true,
  triggerClassName,
}: FormDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value || defaultValue
  );

  // تحديث التاريخ المحدد عند تغيير القيمة الخارجية
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value);
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onValueChange?.(date);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    onValueChange?.(undefined);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    onValueChange?.(today);
    setOpen(false);
  };

  // تنسيق التاريخ للعرض
  const formatDisplayDate = (date: Date): string => {
    if (calendarType === "hijri") {
      return formatHijriDate(date);
    }
    return format(date, dateFormat, {
      locale: dir === "rtl" ? ar : enUS,
    });
  };

  // حساب الأيام المعطلة
  const getDisabledDays = React.useCallback(
    (date: Date): boolean => {
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (typeof disabledDays === "function") return disabledDays(date);
      if (Array.isArray(disabledDays)) {
        return disabledDays.some(
          (d) => d.toDateString() === date.toDateString()
        );
      }
      return false;
    },
    [minDate, maxDate, disabledDays]
  );

  const hasError = Boolean(error);

  return (
    <FormField
      id={id}
      name={name}
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      dir={dir}
      className={className}
      labelClassName={labelClassName}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-start font-normal",
              !selectedDate && "text-muted-foreground",
              hasError && "border-destructive",
              triggerClassName
            )}
          >
            <CalendarIcon className="ml-2 size-4" />
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}

            {/* زر المسح */}
            {clearable && selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e as any);
                  }
                }}
                className="mr-auto p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="مسح التاريخ"
              >
                <XIcon className="size-4" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={getDisabledDays}
            initialFocus
            dir={dir}
          />

          {/* زر اليوم */}
          {showTodayButton && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleToday}
              >
                اليوم
              </Button>
            </div>
          )}

          {/* عرض التاريخ الهجري */}
          {calendarType === "gregorian" && selectedDate && (
            <div className="px-3 pb-2 text-xs text-muted-foreground text-center">
              {formatHijriDate(selectedDate)} هـ
            </div>
          )}
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

/**
 * خصائص مكون FormDateRangePicker
 */
export interface FormDateRangePickerProps
  extends Omit<FormFieldProps, "children"> {
  /** نطاق التاريخ المحدد */
  value?: { from: Date; to: Date };
  /** دالة عند تغيير النطاق */
  onValueChange?: (range: { from: Date; to: Date } | undefined) => void;
  /** نص العنصر النائب */
  placeholder?: string;
  /** تنسيق التاريخ */
  dateFormat?: string;
  /** الحد الأدنى للتاريخ */
  minDate?: Date;
  /** الحد الأقصى للتاريخ */
  maxDate?: Date;
  /** أنماط CSS إضافية للزر */
  triggerClassName?: string;
}

/**
 * مكون FormDateRangePicker
 * منتقي نطاق تاريخ
 */
function FormDateRangePicker({
  // FormField props
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  className,
  labelClassName,
  // DateRangePicker specific props
  value,
  onValueChange,
  placeholder = "اختر نطاق التاريخ...",
  dateFormat = "PP",
  minDate,
  maxDate,
  triggerClassName,
}: FormDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<
    { from: Date | undefined; to: Date | undefined } | undefined
  >(value ? { from: value.from, to: value.to } : undefined);

  // تحديث النطاق المحدد عند تغيير القيمة الخارجية
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedRange({ from: value.from, to: value.to });
    }
  }, [value]);

  const handleSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      onValueChange?.({ from: range.from, to: range.to });
    }
  };

  const hasError = Boolean(error);
  const locale = dir === "rtl" ? ar : enUS;

  // تنسيق النطاق للعرض
  const formatRangeDisplay = (): string => {
    if (!selectedRange?.from) return placeholder;
    if (!selectedRange.to) {
      return format(selectedRange.from, dateFormat, { locale });
    }
    return `${format(selectedRange.from, dateFormat, { locale })} - ${format(
      selectedRange.to,
      dateFormat,
      { locale }
    )}`;
  };

  return (
    <FormField
      id={id}
      name={name}
      label={label}
      helperText={helperText}
      error={error}
      required={required}
      disabled={disabled}
      dir={dir}
      className={className}
      labelClassName={labelClassName}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-start font-normal",
              !selectedRange?.from && "text-muted-foreground",
              hasError && "border-destructive",
              triggerClassName
            )}
          >
            <CalendarIcon className="ml-2 size-4" />
            {formatRangeDisplay()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selectedRange as any}
            onSelect={handleSelect as any}
            numberOfMonths={2}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            dir={dir}
          />
        </PopoverContent>
      </Popover>
    </FormField>
  );
}

export { FormDatePicker, FormDateRangePicker };
