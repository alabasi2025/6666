import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormFieldProps } from "./FormField";

/**
 * خصائص مكون FormTextarea
 */
export interface FormTextareaProps
  extends Omit<React.ComponentProps<"textarea">, "size" | "dir">,
    Omit<FormFieldProps, "children"> {
  /** الحد الأقصى لعدد الأحرف */
  maxLength?: number;
  /** إظهار عداد الأحرف */
  showCharCount?: boolean;
  /** الحد الأدنى للارتفاع (بالصفوف) */
  minRows?: number;
  /** الحد الأقصى للارتفاع (بالصفوف) */
  maxRows?: number;
  /** تغيير الحجم تلقائياً */
  autoResize?: boolean;
  /** أنماط CSS إضافية للحقل */
  textareaClassName?: string;
}

/**
 * مكون FormTextarea
 * منطقة نص متعددة الأسطر مع دعم RTL وعداد الأحرف والتغيير التلقائي للحجم
 */
const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
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
      // Textarea specific props
      maxLength,
      showCharCount = false,
      minRows = 3,
      maxRows = 10,
      autoResize = false,
      textareaClassName,
      value,
      onChange,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      (value as string) || ""
    );
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

    // دمج المراجع
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // تحديث القيمة الداخلية عند تغيير القيمة الخارجية
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value as string);
      }
    }, [value]);

    // تغيير الحجم تلقائياً
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || !autoResize) return;

      // إعادة تعيين الارتفاع لحساب الارتفاع الجديد
      textarea.style.height = "auto";

      // حساب ارتفاع السطر
      const lineHeight = parseInt(
        getComputedStyle(textarea).lineHeight || "20"
      );
      const paddingTop = parseInt(getComputedStyle(textarea).paddingTop || "8");
      const paddingBottom = parseInt(
        getComputedStyle(textarea).paddingBottom || "8"
      );

      const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom;

      // تعيين الارتفاع الجديد
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight
      );
      textarea.style.height = `${newHeight}px`;
    }, [autoResize, minRows, maxRows]);

    // تغيير الحجم عند تغيير القيمة
    React.useEffect(() => {
      adjustHeight();
    }, [internalValue, adjustHeight]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // التحقق من الحد الأقصى للأحرف
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      setInternalValue(newValue);
      onChange?.(e);
    };

    // حساب عدد الأحرف
    const charCount = internalValue.length;
    const isNearLimit = maxLength && charCount >= maxLength * 0.9;
    const isAtLimit = maxLength && charCount >= maxLength;

    return (
      <FormField
        id={id}
        name={name}
        label={label}
        helperText={
          showCharCount && maxLength
            ? undefined
            : helperText
        }
        error={error}
        required={required}
        disabled={disabled}
        dir={dir}
        className={className}
        labelClassName={labelClassName}
      >
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            dir={dir}
            rows={minRows}
            maxLength={maxLength}
            className={cn(
              autoResize && "resize-none overflow-hidden",
              !autoResize && "resize-y",
              textareaClassName
            )}
            style={{
              minHeight: autoResize ? undefined : `${minRows * 1.5}rem`,
            }}
            {...props}
          />

          {/* عداد الأحرف */}
          {showCharCount && maxLength && (
            <div
              className={cn(
                "absolute bottom-2 text-xs",
                dir === "rtl" ? "left-2" : "right-2",
                isAtLimit
                  ? "text-destructive"
                  : isNearLimit
                  ? "text-warning"
                  : "text-muted-foreground"
              )}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* نص المساعدة مع عداد الأحرف */}
        {showCharCount && maxLength && helperText && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
