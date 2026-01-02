/**
 * مكون خلية الجدول
 * @module tables/TableCell
 */

import { memo } from "react";
import { TableCell as UITableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TableCellProps, getNestedValue } from "./types";

/**
 * مكون خلية الجدول مع دعم التنسيقات المتعددة
 */
export const TableCell = memo(function TableCell({
  value,
  column,
  row,
  rowIndex,
  className,
}: TableCellProps) {
  // الحصول على القيمة من المسار المتداخل إذا لزم الأمر
  const cellValue = typeof column.key === "string" && column.key.includes(".")
    ? getNestedValue(row, column.key)
    : value;

  // تحديد المحتوى المعروض
  const content = column.render
    ? column.render(cellValue, row, rowIndex)
    : formatValue(cellValue);

  return (
    <UITableCell
      className={cn(
        // المحاذاة
        column.align === "center" && "text-center",
        column.align === "right" && "text-left",
        // العرض
        column.width && `w-[${column.width}]`,
        column.minWidth && `min-w-[${column.minWidth}]`,
        column.maxWidth && `max-w-[${column.maxWidth}]`,
        // فئات مخصصة
        column.cellClassName,
        className
      )}
      style={{
        width: typeof column.width === "number" ? `${column.width}px` : column.width,
        minWidth: typeof column.minWidth === "number" ? `${column.minWidth}px` : column.minWidth,
        maxWidth: typeof column.maxWidth === "number" ? `${column.maxWidth}px` : column.maxWidth,
      }}
    >
      {content}
    </UITableCell>
  );
});

/**
 * تنسيق القيمة للعرض
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "نعم" : "لا";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("ar-SA");
  }

  if (typeof value === "number") {
    return value.toLocaleString("ar-SA");
  }

  return String(value);
}

/**
 * مكون خلية نص مع قطع
 */
export function TruncatedCell({
  value,
  maxLength = 50,
  className,
}: {
  value: string;
  maxLength?: number;
  className?: string;
}) {
  const truncated = value.length > maxLength
    ? `${value.substring(0, maxLength)}...`
    : value;

  return (
    <span
      className={cn("block truncate", className)}
      title={value.length > maxLength ? value : undefined}
    >
      {truncated}
    </span>
  );
}

/**
 * مكون خلية تاريخ
 */
export function DateCell({
  value,
  format = "short",
  className,
}: {
  value: Date | string | number;
  format?: "short" | "medium" | "long" | "full";
  className?: string;
}) {
  const date = value instanceof Date ? value : new Date(value);
  
  const formatOptionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: "numeric", month: "numeric", year: "numeric" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  };
  const formatOptions = formatOptionsMap[format];

  return (
    <span className={className}>
      {date.toLocaleDateString("ar-SA", formatOptions)}
    </span>
  );
}

/**
 * مكون خلية تاريخ ووقت
 */
export function DateTimeCell({
  value,
  className,
}: {
  value: Date | string | number;
  className?: string;
}) {
  const date = value instanceof Date ? value : new Date(value);

  return (
    <span className={className}>
      {date.toLocaleDateString("ar-SA")} {date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

/**
 * مكون خلية رقم
 */
export function NumberCell({
  value,
  decimals = 0,
  prefix,
  suffix,
  className,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const formatted = value.toLocaleString("ar-SA", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

/**
 * مكون خلية عملة
 */
export function CurrencyCell({
  value,
  currency = "SAR",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const formatted = value.toLocaleString("ar-SA", {
    style: "currency",
    currency,
  });

  return (
    <span className={className}>
      {formatted}
    </span>
  );
}

/**
 * مكون خلية نسبة مئوية
 */
export function PercentageCell({
  value,
  decimals = 0,
  className,
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const formatted = value.toLocaleString("ar-SA", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={className}>
      {formatted}
    </span>
  );
}

/**
 * مكون خلية رابط
 */
export function LinkCell({
  href,
  children,
  external = false,
  className,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn("text-primary hover:underline", className)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

/**
 * مكون خلية صورة
 */
export function ImageCell({
  src,
  alt,
  size = 32,
  rounded = true,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  rounded?: boolean;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "object-cover",
        rounded && "rounded-full",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * مكون خلية أفاتار
 */
export function AvatarCell({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  if (src) {
    return (
      <ImageCell src={src} alt={name} size={size} rounded className={className} />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

export default TableCell;
