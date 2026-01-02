import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * خصائص مكون FormCheckbox
 */
export interface FormCheckboxProps {
  /** معرف الحقل الفريد */
  id?: string;
  /** اسم الحقل */
  name?: string;
  /** عنوان خانة الاختيار */
  label?: string;
  /** وصف إضافي */
  description?: string;
  /** رسالة الخطأ */
  error?: string;
  /** هل الحقل مطلوب */
  required?: boolean;
  /** هل الحقل معطل */
  disabled?: boolean;
  /** حالة التحديد */
  checked?: boolean;
  /** القيمة الافتراضية */
  defaultChecked?: boolean;
  /** دالة عند تغيير الحالة */
  onCheckedChange?: (checked: boolean) => void;
  /** اتجاه النص */
  dir?: "rtl" | "ltr";
  /** حجم خانة الاختيار */
  size?: "sm" | "default" | "lg";
  /** أنماط CSS إضافية */
  className?: string;
}

/**
 * مكون FormCheckbox
 * خانة اختيار مع عنوان ووصف ودعم RTL
 */
function FormCheckbox({
  id,
  name,
  label,
  description,
  error,
  required = false,
  disabled = false,
  checked,
  defaultChecked,
  onCheckedChange,
  dir = "rtl",
  size = "default",
  className,
}: FormCheckboxProps) {
  const fieldId = id || name || React.useId();
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
    <div
      data-slot="form-checkbox"
      dir={dir}
      className={cn(
        "group flex flex-col gap-1",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={fieldId}
          name={name}
          checked={checked}
          defaultChecked={defaultChecked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${fieldId}-error`
              : description
              ? `${fieldId}-description`
              : undefined
          }
          className={cn(
            sizeClasses[size],
            hasError && "border-destructive"
          )}
        />

        {(label || description) && (
          <div className="flex flex-col gap-0.5 leading-none">
            {label && (
              <Label
                htmlFor={fieldId}
                className={cn(
                  labelSizeClasses[size],
                  "font-medium cursor-pointer",
                  hasError && "text-destructive"
                )}
              >
                {label}
                {required && (
                  <span className="text-destructive mr-1" aria-hidden="true">
                    *
                  </span>
                )}
              </Label>
            )}

            {description && (
              <p
                id={`${fieldId}-description`}
                className={cn(
                  "text-muted-foreground",
                  size === "sm" ? "text-xs" : "text-sm"
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* رسالة الخطأ */}
      {hasError && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-sm text-destructive flex items-center gap-1 mr-7"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * خصائص مجموعة خانات الاختيار
 */
export interface CheckboxGroupProps {
  /** عنوان المجموعة */
  label?: string;
  /** رسالة الخطأ */
  error?: string;
  /** هل المجموعة مطلوبة */
  required?: boolean;
  /** هل المجموعة معطلة */
  disabled?: boolean;
  /** اتجاه النص */
  dir?: "rtl" | "ltr";
  /** اتجاه العرض */
  orientation?: "horizontal" | "vertical";
  /** المحتوى الداخلي */
  children: React.ReactNode;
  /** أنماط CSS إضافية */
  className?: string;
}

/**
 * مكون CheckboxGroup
 * مجموعة خانات اختيار
 */
function CheckboxGroup({
  label,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  orientation = "vertical",
  children,
  className,
}: CheckboxGroupProps) {
  const groupId = React.useId();
  const hasError = Boolean(error);

  return (
    <div
      data-slot="checkbox-group"
      role="group"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={hasError ? `${groupId}-error` : undefined}
      dir={dir}
      className={cn(
        "flex flex-col gap-2",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* عنوان المجموعة */}
      {label && (
        <Label
          id={`${groupId}-label`}
          className={cn(
            "text-sm font-medium",
            hasError && "text-destructive"
          )}
        >
          {label}
          {required && (
            <span className="text-destructive mr-1" aria-hidden="true">
              *
            </span>
          )}
        </Label>
      )}

      {/* خانات الاختيار */}
      <div
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap"
        )}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              disabled: disabled || (child.props as any).disabled,
            });
          }
          return child;
        })}
      </div>

      {/* رسالة الخطأ */}
      {hasError && (
        <p
          id={`${groupId}-error`}
          role="alert"
          className="text-sm text-destructive flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4 shrink-0"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export { FormCheckbox, CheckboxGroup };
