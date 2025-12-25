import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, FormFieldProps } from "./FormField";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * خيار في القائمة المنسدلة
 */
export interface SelectOption {
  /** قيمة الخيار */
  value: string;
  /** النص المعروض */
  label: string;
  /** هل الخيار معطل */
  disabled?: boolean;
  /** أيقونة الخيار */
  icon?: React.ReactNode;
  /** مجموعة الخيار */
  group?: string;
}

/**
 * خصائص مكون FormSelect
 */
export interface FormSelectProps
  extends Omit<FormFieldProps, "children"> {
  /** القيمة المحددة */
  value?: string;
  /** القيمة الافتراضية */
  defaultValue?: string;
  /** دالة عند تغيير القيمة */
  onValueChange?: (value: string) => void;
  /** الخيارات المتاحة */
  options: SelectOption[];
  /** نص العنصر النائب */
  placeholder?: string;
  /** تفعيل البحث */
  searchable?: boolean;
  /** نص البحث */
  searchPlaceholder?: string;
  /** حجم القائمة */
  size?: "sm" | "default";
  /** أنماط CSS إضافية للقائمة */
  triggerClassName?: string;
}

/**
 * مكون FormSelect
 * قائمة منسدلة متقدمة مع دعم البحث والمجموعات
 */
function FormSelect({
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
  // Select specific props
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "اختر...",
  searchable = false,
  searchPlaceholder = "ابحث...",
  size = "default",
  triggerClassName,
}: FormSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // تصفية الخيارات بناءً على البحث
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  // تجميع الخيارات حسب المجموعة
  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];

    filteredOptions.forEach((option) => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = [];
        }
        groups[option.group].push(option);
      } else {
        ungrouped.push(option);
      }
    });

    return { groups, ungrouped };
  }, [filteredOptions]);

  // إعادة تعيين البحث عند إغلاق القائمة
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // الحصول على نص الخيار المحدد
  const selectedOption = options.find((opt) => opt.value === value);

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
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        open={open}
        onOpenChange={setOpen}
        dir={dir}
      >
        <SelectTrigger
          size={size}
          className={cn(
            "w-full",
            error && "border-destructive",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption && (
              <span className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          className="max-h-[300px]"
          position="popper"
          sideOffset={4}
        >
          {/* حقل البحث */}
          {searchable && (
            <div className="p-2 border-b sticky top-0 bg-popover z-10">
              <div className="relative">
                <SearchIcon
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 size-4 text-muted-foreground",
                    dir === "rtl" ? "right-2.5" : "left-2.5"
                  )}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    "h-8",
                    dir === "rtl" ? "pr-8" : "pl-8"
                  )}
                  dir={dir}
                />
              </div>
            </div>
          )}

          {/* عرض الخيارات */}
          {filteredOptions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              لا توجد نتائج
            </div>
          ) : (
            <>
              {/* الخيارات غير المجمعة */}
              {groupedOptions.ungrouped.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                </SelectItem>
              ))}

              {/* الخيارات المجمعة */}
              {Object.entries(groupedOptions.groups).map(
                ([groupName, groupOptions]) => (
                  <SelectGroup key={groupName}>
                    <SelectLabel>{groupName}</SelectLabel>
                    {groupOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export { FormSelect };
