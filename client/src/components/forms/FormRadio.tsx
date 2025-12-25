import * as React from "react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormField, FormFieldProps } from "./FormField";

/**
 * خيار في مجموعة الراديو
 */
export interface RadioOption {
  /** قيمة الخيار */
  value: string;
  /** النص المعروض */
  label: string;
  /** وصف إضافي */
  description?: string;
  /** هل الخيار معطل */
  disabled?: boolean;
  /** أيقونة الخيار */
  icon?: React.ReactNode;
}

/**
 * خصائص مكون FormRadio
 */
export interface FormRadioProps
  extends Omit<FormFieldProps, "children"> {
  /** القيمة المحددة */
  value?: string;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** دالة عند تغيير القيمة */
  onValueChange?: (value: string) => void;
  /** الخيارات المتاحة */
  options: RadioOption[];
  /** اتجاه العرض */
  orientation?: "horizontal" | "vertical";
  /** حجم أزرار الراديو */
  size?: "sm" | "default" | "lg";
  /** أنماط CSS إضافية للمجموعة */
  groupClassName?: string;
}

/**
 * مكون FormRadio
 * مجموعة أزرار راديو مع دعم RTL والأيقونات والأوصاف
 */
function FormRadio({
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
  // Radio specific props
  value,
  defaultValue,
  onValueChange,
  options,
  orientation = "vertical",
  size = "default",
  groupClassName,
}: FormRadioProps) {
  const groupId = id || name || React.useId();
  const hasError = Boolean(error);

  // حساب الأنماط بناءً على الحجم
  const sizeClasses = {
    sm: "size-3.5",
    default: "size-4",
    lg: "size-5",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  return (
    <FormField
      id={groupId}
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
      <RadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        dir={dir}
        className={cn(
          orientation === "horizontal"
            ? "flex flex-row flex-wrap gap-4"
            : "flex flex-col gap-3",
          groupClassName
        )}
        aria-invalid={hasError}
      >
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isDisabled = disabled || option.disabled;

          return (
            <div
              key={option.value}
              className={cn(
                "flex items-start gap-3",
                isDisabled && "opacity-50 pointer-events-none"
              )}
            >
              <RadioGroupItem
                id={optionId}
                value={option.value}
                disabled={isDisabled}
                className={cn(
                  sizeClasses[size],
                  hasError && "border-destructive"
                )}
              />

              <div className="flex flex-col gap-0.5 leading-none">
                <Label
                  htmlFor={optionId}
                  className={cn(
                    labelSizeClasses[size],
                    "font-medium cursor-pointer flex items-center gap-2",
                    isDisabled && "cursor-not-allowed"
                  )}
                >
                  {option.icon}
                  {option.label}
                </Label>

                {option.description && (
                  <p
                    className={cn(
                      "text-muted-foreground",
                      size === "sm" ? "text-xs" : "text-sm"
                    )}
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </FormField>
  );
}

/**
 * خصائص مكون RadioCard
 */
export interface RadioCardProps {
  /** قيمة الخيار */
  value: string;
  /** النص المعروض */
  label: string;
  /** وصف إضافي */
  description?: string;
  /** هل الخيار معطل */
  disabled?: boolean;
  /** أيقونة الخيار */
  icon?: React.ReactNode;
  /** هل الخيار محدد */
  checked?: boolean;
  /** أنماط CSS إضافية */
  className?: string;
}

/**
 * مكون RadioCard
 * بطاقة راديو مع تصميم بطاقة
 */
function RadioCard({
  value,
  label,
  description,
  disabled = false,
  icon,
  checked = false,
  className,
}: RadioCardProps) {
  const cardId = React.useId();

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
        checked
          ? "border-primary bg-primary/5"
          : "border-input hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <RadioGroupItem
        id={cardId}
        value={value}
        disabled={disabled}
        className="mt-0.5"
      />

      <div className="flex flex-col gap-1">
        <Label
          htmlFor={cardId}
          className="font-medium cursor-pointer flex items-center gap-2"
        >
          {icon}
          {label}
        </Label>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * خصائص مجموعة بطاقات الراديو
 */
export interface RadioCardGroupProps
  extends Omit<FormFieldProps, "children"> {
  /** القيمة المحددة */
  value?: string;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** دالة عند تغيير القيمة */
  onValueChange?: (value: string) => void;
  /** الخيارات المتاحة */
  options: RadioOption[];
  /** عدد الأعمدة */
  columns?: 1 | 2 | 3 | 4;
  /** أنماط CSS إضافية للمجموعة */
  groupClassName?: string;
}

/**
 * مكون RadioCardGroup
 * مجموعة بطاقات راديو
 */
function RadioCardGroup({
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
  // RadioCardGroup specific props
  value,
  defaultValue,
  onValueChange,
  options,
  columns = 1,
  groupClassName,
}: RadioCardGroupProps) {
  const groupId = id || name || React.useId();
  const hasError = Boolean(error);

  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <FormField
      id={groupId}
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
      <RadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        dir={dir}
        className={cn("grid gap-3", gridClasses[columns], groupClassName)}
        aria-invalid={hasError}
      >
        {options.map((option) => (
          <RadioCard
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            disabled={disabled || option.disabled}
            icon={option.icon}
            checked={value === option.value}
          />
        ))}
      </RadioGroup>
    </FormField>
  );
}

export { FormRadio, RadioCard, RadioCardGroup };
