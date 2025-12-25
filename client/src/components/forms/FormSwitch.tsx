import * as React from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

/**
 * خصائص مكون FormSwitch
 */
export interface FormSwitchProps {
  /** معرف الحقل الفريد */
  id?: string;
  /** اسم الحقل */
  name?: string;
  /** عنوان المفتاح */
  label?: string;
  /** وصف إضافي */
  description?: string;
  /** رسالة الخطأ */
  error?: string;
  /** هل الحقل مطلوب */
  required?: boolean;
  /** هل الحقل معطل */
  disabled?: boolean;
  /** حالة التفعيل */
  checked?: boolean;
  /** القيمة الافتراضية */
  defaultChecked?: boolean;
  /** دالة عند تغيير الحالة */
  onCheckedChange?: (checked: boolean) => void;
  /** اتجاه النص */
  dir?: "rtl" | "ltr";
  /** حجم المفتاح */
  size?: "sm" | "default" | "lg";
  /** موضع العنوان */
  labelPosition?: "start" | "end";
  /** نص حالة التفعيل */
  onLabel?: string;
  /** نص حالة الإيقاف */
  offLabel?: string;
  /** إظهار حالة النص */
  showStateLabel?: boolean;
  /** أنماط CSS إضافية */
  className?: string;
}

/**
 * مكون FormSwitch
 * مفتاح تبديل on/off مع عنوان ووصف ودعم RTL
 */
function FormSwitch({
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
  labelPosition = "end",
  onLabel = "مفعّل",
  offLabel = "معطّل",
  showStateLabel = false,
  className,
}: FormSwitchProps) {
  const fieldId = id || name || React.useId();
  const hasError = Boolean(error);
  const [isChecked, setIsChecked] = React.useState(
    checked ?? defaultChecked ?? false
  );

  // تحديث الحالة عند تغيير القيمة الخارجية
  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  // حساب الأنماط بناءً على الحجم
  const switchSizeClasses = {
    sm: "h-4 w-7 [&>span]:size-3 [&>span]:data-[state=checked]:translate-x-[calc(100%-2px)]",
    default: "",
    lg: "h-6 w-11 [&>span]:size-5 [&>span]:data-[state=checked]:translate-x-[calc(100%-2px)]",
  };

  const labelSizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  // ترتيب العناصر بناءً على موضع العنوان
  const isLabelFirst = labelPosition === "start";

  return (
    <div
      data-slot="form-switch"
      dir={dir}
      className={cn(
        "group flex flex-col gap-1",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isLabelFirst && "flex-row-reverse justify-end"
        )}
      >
        <Switch
          id={fieldId}
          name={name}
          checked={isChecked}
          defaultChecked={defaultChecked}
          onCheckedChange={handleChange}
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
            switchSizeClasses[size],
            hasError && "data-[state=unchecked]:border-destructive"
          )}
        />

        {(label || description || showStateLabel) && (
          <div className="flex flex-col gap-0.5 leading-none">
            <div className="flex items-center gap-2">
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

              {showStateLabel && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    isChecked
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isChecked ? onLabel : offLabel}
                </span>
              )}
            </div>

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
          className="text-sm text-destructive flex items-center gap-1 mr-11"
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
 * خصائص مجموعة مفاتيح التبديل
 */
export interface SwitchGroupProps {
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
 * مكون SwitchGroup
 * مجموعة مفاتيح تبديل
 */
function SwitchGroup({
  label,
  error,
  required = false,
  disabled = false,
  dir = "rtl",
  orientation = "vertical",
  children,
  className,
}: SwitchGroupProps) {
  const groupId = React.useId();
  const hasError = Boolean(error);

  return (
    <div
      data-slot="switch-group"
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

      {/* مفاتيح التبديل */}
      <div
        className={cn(
          "flex gap-4",
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

/**
 * خصائص مكون SwitchCard
 */
export interface SwitchCardProps extends FormSwitchProps {
  /** أيقونة البطاقة */
  icon?: React.ReactNode;
}

/**
 * مكون SwitchCard
 * مفتاح تبديل بتصميم بطاقة
 */
function SwitchCard({
  icon,
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  className,
  ...props
}: SwitchCardProps) {
  const [isChecked, setIsChecked] = React.useState(
    checked ?? defaultChecked ?? false
  );

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = (newChecked: boolean) => {
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
        isChecked ? "border-primary bg-primary/5" : "border-input",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className={cn(
              "flex items-center justify-center size-10 rounded-lg",
              isChecked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}
          >
            {icon}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {label && <span className="font-medium">{label}</span>}
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </div>
      </div>

      <FormSwitch
        checked={isChecked}
        onCheckedChange={handleChange}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

export { FormSwitch, SwitchGroup, SwitchCard };
