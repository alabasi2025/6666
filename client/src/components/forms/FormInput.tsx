import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { FormField, FormFieldProps } from "./FormField";
import { EyeIcon, EyeOffIcon, SearchIcon, XIcon } from "lucide-react";

/**
 * أنواع حقول الإدخال المدعومة
 */
type InputType =
  | "text"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "search";

/**
 * خصائص مكون FormInput
 */
export interface FormInputProps
  extends Omit<React.ComponentProps<"input">, "type" | "size" | "dir">,
    Omit<FormFieldProps, "children"> {
  /** نوع حقل الإدخال */
  type?: InputType;
  /** حجم الحقل */
  size?: "sm" | "default" | "lg";
  /** أيقونة في بداية الحقل */
  startIcon?: React.ReactNode;
  /** أيقونة في نهاية الحقل */
  endIcon?: React.ReactNode;
  /** إظهار زر مسح المحتوى */
  clearable?: boolean;
  /** دالة عند مسح المحتوى */
  onClear?: () => void;
  /** أنماط CSS إضافية للحقل */
  inputClassName?: string;
}

/**
 * مكون FormInput
 * حقل إدخال نص متقدم مع دعم RTL وأيقونات وإظهار/إخفاء كلمة المرور
 */
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
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
      // Input specific props
      type = "text",
      size = "default",
      startIcon,
      endIcon,
      clearable = false,
      onClear,
      inputClassName,
      value,
      onChange,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");

    // تحديث القيمة الداخلية عند تغيير القيمة الخارجية
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
      // إنشاء حدث تغيير وهمي
      const event = {
        target: { value: "", name },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // تحديد نوع الإدخال الفعلي
    const actualType = type === "password" && showPassword ? "text" : type;

    // تحديد ما إذا كان يجب إظهار زر المسح
    const showClearButton = clearable && internalValue && !disabled;

    // تحديد ما إذا كان يجب إظهار زر إظهار/إخفاء كلمة المرور
    const showPasswordToggle = type === "password" && !disabled;

    // تحديد الأيقونة الافتراضية للبحث
    const defaultStartIcon =
      type === "search" ? <SearchIcon className="size-4" /> : startIcon;

    // حساب الأنماط بناءً على الحجم
    const sizeClasses = {
      sm: "h-8 text-sm px-2.5",
      default: "h-9 text-sm px-3",
      lg: "h-11 text-base px-4",
    };

    const hasStartIcon = Boolean(defaultStartIcon);
    const hasEndIcon =
      Boolean(endIcon) || showClearButton || showPasswordToggle;

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
        <div className="relative flex items-center">
          {/* أيقونة البداية */}
          {hasStartIcon && (
            <div
              className={cn(
                "absolute text-muted-foreground pointer-events-none",
                dir === "rtl" ? "right-3" : "left-3"
              )}
            >
              {defaultStartIcon}
            </div>
          )}

          {/* حقل الإدخال */}
          <Input
            ref={ref}
            type={actualType}
            value={internalValue}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            dir={dir}
            className={cn(
              sizeClasses[size],
              hasStartIcon && (dir === "rtl" ? "pr-10" : "pl-10"),
              hasEndIcon && (dir === "rtl" ? "pl-10" : "pr-10"),
              inputClassName
            )}
            {...props}
          />

          {/* أيقونات النهاية */}
          <div
            className={cn(
              "absolute flex items-center gap-1",
              dir === "rtl" ? "left-2" : "right-2"
            )}
          >
            {/* زر مسح المحتوى */}
            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="مسح"
              >
                <XIcon className="size-4" />
              </button>
            )}

            {/* زر إظهار/إخفاء كلمة المرور */}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            )}

            {/* أيقونة مخصصة */}
            {endIcon && !showPasswordToggle && (
              <span className="text-muted-foreground">{endIcon}</span>
            )}
          </div>
        </div>
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
