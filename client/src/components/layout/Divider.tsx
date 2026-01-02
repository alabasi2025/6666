/**
 * @file Divider.tsx
 * @description مكون الفاصل (Divider) أفقي/عمودي مع نص اختياري
 * @module components/layout/Divider
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { DividerProps, Orientation, SpacingSize } from "./types";

/**
 * خريطة أنواع الفاصل إلى فئات CSS
 */
const variantClasses: Record<string, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

/**
 * خريطة سمك الفاصل إلى فئات CSS
 */
const thicknessClasses: Record<string, { horizontal: string; vertical: string }> = {
  thin: {
    horizontal: "border-t",
    vertical: "border-l",
  },
  medium: {
    horizontal: "border-t-2",
    vertical: "border-l-2",
  },
  thick: {
    horizontal: "border-t-4",
    vertical: "border-l-4",
  },
};

/**
 * خريطة ألوان الفاصل إلى فئات CSS
 */
const colorClasses: Record<string, string> = {
  default: "border-border",
  muted: "border-muted",
  accent: "border-accent",
  primary: "border-primary",
};

/**
 * خريطة المسافات إلى فئات CSS
 */
const spacingClasses: Record<SpacingSize, { horizontal: string; vertical: string }> = {
  none: { horizontal: "my-0", vertical: "mx-0" },
  xs: { horizontal: "my-1", vertical: "mx-1" },
  sm: { horizontal: "my-2", vertical: "mx-2" },
  md: { horizontal: "my-4", vertical: "mx-4" },
  lg: { horizontal: "my-6", vertical: "mx-6" },
  xl: { horizontal: "my-8", vertical: "mx-8" },
  "2xl": { horizontal: "my-12", vertical: "mx-12" },
  "3xl": { horizontal: "my-16", vertical: "mx-16" },
};

/**
 * خريطة موضع النص إلى فئات CSS
 */
const labelPositionClasses: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

/**
 * مكون الفاصل
 * 
 * @description يوفر فاصلاً أفقياً أو عمودياً مع نص اختياري
 * 
 * @example
 * ```tsx
 * // فاصل أفقي بسيط
 * <Divider />
 * 
 * // فاصل مع نص
 * <Divider label="أو" />
 * 
 * // فاصل عمودي
 * <Divider orientation="vertical" />
 * 
 * // فاصل مخصص
 * <Divider 
 *   variant="dashed" 
 *   thickness="medium" 
 *   color="primary"
 *   spacing="lg"
 * />
 * ```
 */
const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = "horizontal",
      label,
      labelPosition = "center",
      variant = "solid",
      thickness = "thin",
      color = "default",
      spacing = "md",
      decorative = true,
      ...props
    },
    ref
  ) => {
    const isHorizontal = orientation === "horizontal";

    // فاصل بدون نص
    if (!label) {
      return (
        <div
          ref={ref}
          data-slot="divider"
          role={decorative ? "none" : "separator"}
          aria-orientation={decorative ? undefined : orientation}
          className={cn(
            "shrink-0",
            variantClasses[variant],
            colorClasses[color],
            isHorizontal
              ? cn(
                  "w-full",
                  thicknessClasses[thickness].horizontal,
                  spacingClasses[spacing].horizontal
                )
              : cn(
                  "h-full self-stretch",
                  thicknessClasses[thickness].vertical,
                  spacingClasses[spacing].vertical
                ),
            className
          )}
          {...props}
        />
      );
    }

    // فاصل مع نص (أفقي فقط)
    return (
      <div
        ref={ref}
        data-slot="divider"
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "horizontal"}
        className={cn(
          "flex items-center w-full",
          spacingClasses[spacing].horizontal,
          labelPositionClasses[labelPosition],
          className
        )}
        {...props}
      >
        {(labelPosition === "center" || labelPosition === "end") && (
          <div
            className={cn(
              "flex-1",
              variantClasses[variant],
              colorClasses[color],
              thicknessClasses[thickness].horizontal
            )}
          />
        )}
        <span className="px-3 text-sm text-muted-foreground whitespace-nowrap">
          {label}
        </span>
        {(labelPosition === "center" || labelPosition === "start") && (
          <div
            className={cn(
              "flex-1",
              variantClasses[variant],
              colorClasses[color],
              thicknessClasses[thickness].horizontal
            )}
          />
        )}
      </div>
    );
  }
);

Divider.displayName = "Divider";

/**
 * مكون فاصل عمودي مختصر
 * 
 * @description فاصل عمودي بسيط للاستخدام في الصفوف
 */
interface VerticalDividerProps {
  /** فئات CSS إضافية */
  className?: string;
  /** ارتفاع الفاصل */
  height?: string | number;
  /** لون الفاصل */
  color?: "default" | "muted" | "accent" | "primary";
}

const VerticalDivider = React.forwardRef<HTMLDivElement, VerticalDividerProps>(
  (
    {
      className,
      height = "1rem",
      color = "default",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="vertical-divider"
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "w-px shrink-0",
          colorClasses[color],
          "bg-current",
          className
        )}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
        }}
        {...props}
      />
    );
  }
);

VerticalDivider.displayName = "VerticalDivider";

export { Divider, VerticalDivider };
export type { DividerProps, VerticalDividerProps };
