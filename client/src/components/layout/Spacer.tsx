/**
 * @file Spacer.tsx
 * @description مكون المسافة (Spacer) قابل للتخصيص
 * @module components/layout/Spacer
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SpacerProps, SpacingSize } from "./types";

/**
 * خريطة أحجام المسافة إلى قيم بالبكسل
 */
const spacingSizes: Record<SpacingSize, string> = {
  none: "0",
  xs: "0.25rem",    // 4px
  sm: "0.5rem",     // 8px
  md: "1rem",       // 16px
  lg: "1.5rem",     // 24px
  xl: "2rem",       // 32px
  "2xl": "3rem",    // 48px
  "3xl": "4rem",    // 64px
};

/**
 * خريطة أحجام المسافة الأفقية إلى فئات CSS
 */
const widthClasses: Record<SpacingSize, string> = {
  none: "w-0",
  xs: "w-1",
  sm: "w-2",
  md: "w-4",
  lg: "w-6",
  xl: "w-8",
  "2xl": "w-12",
  "3xl": "w-16",
};

/**
 * خريطة أحجام المسافة العمودية إلى فئات CSS
 */
const heightClasses: Record<SpacingSize, string> = {
  none: "h-0",
  xs: "h-1",
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
  xl: "h-8",
  "2xl": "h-12",
  "3xl": "h-16",
};

/**
 * مكون المسافة
 * 
 * @description يوفر مسافة فارغة قابلة للتخصيص بين العناصر
 * 
 * @example
 * ```tsx
 * // مسافة عمودية
 * <Spacer size="lg" />
 * 
 * // مسافة أفقية
 * <Spacer x="md" />
 * 
 * // مسافة في كلا الاتجاهين
 * <Spacer x="sm" y="lg" />
 * 
 * // مسافة تملأ المساحة المتاحة (في Flex)
 * <Flex>
 *   <div>يسار</div>
 *   <Spacer grow />
 *   <div>يمين</div>
 * </Flex>
 * ```
 */
const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  (
    {
      className,
      size,
      x,
      y,
      grow = false,
      axis = "vertical",
      ...props
    },
    ref
  ) => {
    // إذا كان grow مفعلاً، نستخدم flex-grow
    if (grow) {
      return (
        <div
          ref={ref}
          data-slot="spacer"
          aria-hidden="true"
          className={cn("flex-grow", className)}
          {...props}
        />
      );
    }

    // تحديد الأبعاد بناءً على المعاملات
    const computedX = x || (axis === "horizontal" || axis === "both" ? size : undefined);
    const computedY = y || (axis === "vertical" || axis === "both" ? size : undefined);

    // استخدام فئات CSS إذا كانت متاحة
    const useClasses = computedX || computedY;

    if (useClasses) {
      return (
        <div
          ref={ref}
          data-slot="spacer"
          aria-hidden="true"
          className={cn(
            "shrink-0",
            computedX && widthClasses[computedX],
            computedY && heightClasses[computedY],
            className
          )}
          {...props}
        />
      );
    }

    // مسافة افتراضية
    return (
      <div
        ref={ref}
        data-slot="spacer"
        aria-hidden="true"
        className={cn("h-4 shrink-0", className)}
        {...props}
      />
    );
  }
);

Spacer.displayName = "Spacer";

/**
 * مكون مسافة أفقية مختصر
 * 
 * @description مسافة أفقية بسيطة
 */
interface HSpacerProps {
  /** حجم المسافة */
  size?: SpacingSize;
  /** فئات CSS إضافية */
  className?: string;
}

const HSpacer = React.forwardRef<HTMLDivElement, HSpacerProps>(
  ({ size = "md", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="h-spacer"
        aria-hidden="true"
        className={cn("shrink-0", widthClasses[size], className)}
        {...props}
      />
    );
  }
);

HSpacer.displayName = "HSpacer";

/**
 * مكون مسافة عمودية مختصر
 * 
 * @description مسافة عمودية بسيطة
 */
interface VSpacerProps {
  /** حجم المسافة */
  size?: SpacingSize;
  /** فئات CSS إضافية */
  className?: string;
}

const VSpacer = React.forwardRef<HTMLDivElement, VSpacerProps>(
  ({ size = "md", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="v-spacer"
        aria-hidden="true"
        className={cn("w-full shrink-0", heightClasses[size], className)}
        {...props}
      />
    );
  }
);

VSpacer.displayName = "VSpacer";

/**
 * مكون مسافة مرنة
 * 
 * @description مسافة تملأ المساحة المتاحة في حاوية Flex
 */
const FlexSpacer = React.forwardRef<HTMLDivElement, { className?: string }>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="flex-spacer"
        aria-hidden="true"
        className={cn("flex-grow", className)}
        {...props}
      />
    );
  }
);

FlexSpacer.displayName = "FlexSpacer";

export { Spacer, HSpacer, VSpacer, FlexSpacer };
export type { SpacerProps, HSpacerProps, VSpacerProps };
