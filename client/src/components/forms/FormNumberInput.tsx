import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, FormFieldProps } from "./FormField";
import { MinusIcon, PlusIcon } from "lucide-react";

/**
 * خصائص مكون FormNumberInput
 */
export interface FormNumberInputProps
  extends Omit<FormFieldProps, "children"> {
  /** القيمة الحالية */
  value?: number;
  /** القيمة الافتراضية */
  defaultValue?: number;
  /** دالة عند تغيير القيمة */
  onValueChange?: (value: number | undefined) => void;
  /** الحد الأدنى */
  min?: number;
  /** الحد الأقصى */
  max?: number;
  /** مقدار الزيادة/النقصان */
  step?: number;
  /** عدد الخانات العشرية */
  precision?: number;
  /** تنسيق العرض */
  format?: "number" | "currency" | "percentage";
  /** رمز العملة */
  currencySymbol?: string;
  /** موضع رمز العملة */
  currencyPosition?: "start" | "end";
  /** إظهار أزرار الزيادة/النقصان */
  showControls?: boolean;
  /** موضع أزرار التحكم */
  controlsPosition?: "sides" | "right";
  /** نص العنصر النائب */
  placeholder?: string;
  /** حجم الحقل */
  size?: "sm" | "default" | "lg";
  /** السماح بالقيم السالبة */
  allowNegative?: boolean;
  /** فاصل الآلاف */
  thousandSeparator?: string;
  /** فاصل العشرية */
  decimalSeparator?: string;
  /** أنماط CSS إضافية للحقل */
  inputClassName?: string;
}

/**
 * تنسيق الرقم للعرض
 */
function formatNumber(
  value: number | undefined,
  options: {
    precision?: number;
    format?: "number" | "currency" | "percentage";
    currencySymbol?: string;
    currencyPosition?: "start" | "end";
    thousandSeparator?: string;
    decimalSeparator?: string;
  }
): string {
  if (value === undefined || isNaN(value)) return "";

  const {
    precision = 0,
    format = "number",
    currencySymbol = "ر.س",
    currencyPosition = "end",
    thousandSeparator = ",",
    decimalSeparator = ".",
  } = options;

  // تنسيق الرقم
  let formatted = value.toFixed(precision);

  // إضافة فاصل الآلاف
  const parts = formatted.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  formatted = parts.join(decimalSeparator);

  // إضافة رمز العملة أو النسبة المئوية
  if (format === "currency") {
    return currencyPosition === "start"
      ? `${currencySymbol} ${formatted}`
      : `${formatted} ${currencySymbol}`;
  }

  if (format === "percentage") {
    return `${formatted}%`;
  }

  return formatted;
}

/**
 * تحليل النص إلى رقم
 */
function parseNumber(
  text: string,
  options: {
    thousandSeparator?: string;
    decimalSeparator?: string;
    allowNegative?: boolean;
  }
): number | undefined {
  const {
    thousandSeparator = ",",
    decimalSeparator = ".",
    allowNegative = true,
  } = options;

  // إزالة الأحرف غير الرقمية
  let cleaned = text
    .replace(new RegExp(`[${thousandSeparator}]`, "g"), "")
    .replace(new RegExp(`[${decimalSeparator}]`, "g"), ".")
    .replace(/[^\d.-]/g, "");

  // التعامل مع السالب
  if (!allowNegative) {
    cleaned = cleaned.replace(/-/g, "");
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * مكون FormNumberInput
 * حقل إدخال رقمي متقدم مع تنسيق وأزرار تحكم
 */
const FormNumberInput = React.forwardRef<HTMLInputElement, FormNumberInputProps>(
  (
    {
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
      // NumberInput specific props
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      precision = 0,
      format = "number",
      currencySymbol = "ر.س",
      currencyPosition = "end",
      showControls = true,
      controlsPosition = "sides",
      placeholder,
      size = "default",
      allowNegative = true,
      thousandSeparator = ",",
      decimalSeparator = ".",
      inputClassName,
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number | undefined>(
      value ?? defaultValue
    );
    const [displayValue, setDisplayValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);

    // تحديث القيمة الداخلية عند تغيير القيمة الخارجية
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // تحديث قيمة العرض
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(
          formatNumber(internalValue, {
            precision,
            format,
            currencySymbol,
            currencyPosition,
            thousandSeparator,
            decimalSeparator,
          })
        );
      }
    }, [
      internalValue,
      isFocused,
      precision,
      format,
      currencySymbol,
      currencyPosition,
      thousandSeparator,
      decimalSeparator,
    ]);

    // تقييد القيمة ضمن الحدود
    const clampValue = (val: number): number => {
      if (min !== undefined && val < min) return min;
      if (max !== undefined && val > max) return max;
      return val;
    };

    // تحديث القيمة
    const updateValue = (newValue: number | undefined) => {
      if (newValue !== undefined) {
        newValue = clampValue(newValue);
        newValue = parseFloat(newValue.toFixed(precision));
      }
      setInternalValue(newValue);
      onValueChange?.(newValue);
    };

    // معالجة التغيير في حقل الإدخال
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value;
      setDisplayValue(text);

      const parsed = parseNumber(text, {
        thousandSeparator,
        decimalSeparator,
        allowNegative,
      });
      updateValue(parsed);
    };

    // معالجة التركيز
    const handleFocus = () => {
      setIsFocused(true);
      if (internalValue !== undefined) {
        setDisplayValue(internalValue.toString());
      }
    };

    // معالجة فقدان التركيز
    const handleBlur = () => {
      setIsFocused(false);
    };

    // زيادة القيمة
    const increment = () => {
      const newValue = (internalValue ?? 0) + step;
      updateValue(newValue);
    };

    // نقصان القيمة
    const decrement = () => {
      const newValue = (internalValue ?? 0) - step;
      updateValue(newValue);
    };

    // معالجة ضغط المفاتيح
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        increment();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        decrement();
      }
    };

    // حساب الأنماط بناءً على الحجم
    const sizeClasses = {
      sm: "h-8 text-sm",
      default: "h-9 text-sm",
      lg: "h-11 text-base",
    };

    const buttonSizeClasses = {
      sm: "h-8 w-8",
      default: "h-9 w-9",
      lg: "h-11 w-11",
    };

    const isAtMin = min !== undefined && internalValue !== undefined && internalValue <= min;
    const isAtMax = max !== undefined && internalValue !== undefined && internalValue >= max;

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
        <div
          className={cn(
            "flex items-center",
            controlsPosition === "sides" && "gap-1"
          )}
        >
          {/* زر النقصان (الجانب) */}
          {showControls && controlsPosition === "sides" && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || isAtMin}
              onClick={decrement}
              className={cn(buttonSizeClasses[size], "shrink-0")}
              aria-label="نقصان"
            >
              <MinusIcon className="size-4" />
            </Button>
          )}

          {/* حقل الإدخال */}
          <div className="relative flex-1">
            <Input
              ref={ref}
              type="text"
              inputMode="decimal"
              value={displayValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              dir="ltr"
              className={cn(
                sizeClasses[size],
                "text-center",
                showControls && controlsPosition === "right" && "pr-20",
                inputClassName
              )}
            />

            {/* أزرار التحكم (اليمين) */}
            {showControls && controlsPosition === "right" && (
              <div className="absolute top-0 bottom-0 right-0 flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || isAtMin}
                  onClick={decrement}
                  className={cn(
                    "h-full w-9 rounded-none border-r",
                    "hover:bg-muted"
                  )}
                  aria-label="نقصان"
                >
                  <MinusIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled || isAtMax}
                  onClick={increment}
                  className={cn(
                    "h-full w-9 rounded-r-md rounded-l-none",
                    "hover:bg-muted"
                  )}
                  aria-label="زيادة"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* زر الزيادة (الجانب) */}
          {showControls && controlsPosition === "sides" && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || isAtMax}
              onClick={increment}
              className={cn(buttonSizeClasses[size], "shrink-0")}
              aria-label="زيادة"
            >
              <PlusIcon className="size-4" />
            </Button>
          )}
        </div>
      </FormField>
    );
  }
);

FormNumberInput.displayName = "FormNumberInput";

export { FormNumberInput };
