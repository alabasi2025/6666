import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * خصائص مكون FormField
 */
export interface FormFieldProps {
  /** معرف الحقل الفريد */
  id?: string;
  /** اسم الحقل */
  name?: string;
  /** عنوان الحقل */
  label?: string;
  /** نص المساعدة */
  helperText?: string;
  /** رسالة الخطأ */
  error?: string;
  /** هل الحقل مطلوب */
  required?: boolean;
  /** هل الحقل معطل */
  disabled?: boolean;
  /** اتجاه النص */
  dir?: "rtl" | "ltr";
  /** المحتوى الداخلي */
  children: React.ReactNode;
  /** أنماط CSS إضافية للحاوية */
  className?: string;
  /** أنماط CSS إضافية للعنوان */
  labelClassName?: string;
}

/**
 * مكون FormField
 * غلاف عام للحقول يوفر Label و Error message و Helper text
 * يدعم RTL بشكل كامل
 */
function FormField({
  id,
  name,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  children,
  className,
  labelClassName,
}: FormFieldProps) {
  const fieldId = id || name;
  const hasError = Boolean(error);

  return (
    <div
      data-slot="form-field"
      data-disabled={disabled}
      dir={dir}
      className={cn(
        "group flex flex-col gap-1.5 w-full",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      {/* عنوان الحقل */}
      {label && (
        <Label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            hasError && "text-destructive",
            labelClassName
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

      {/* محتوى الحقل */}
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              name: name,
              "aria-invalid": hasError,
              "aria-describedby": hasError
                ? `${fieldId}-error`
                : helperText
                ? `${fieldId}-helper`
                : undefined,
              disabled: disabled,
            });
          }
          return child;
        })}
      </div>

      {/* رسالة الخطأ */}
      {hasError && (
        <p
          id={`${fieldId}-error`}
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

      {/* نص المساعدة */}
      {!hasError && helperText && (
        <p
          id={`${fieldId}-helper`}
          className="text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}

export { FormField };
