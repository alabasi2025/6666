/**
 * @file Flex.tsx
 * @description مكون التخطيط المرن (Flex) مع خيارات متعددة للمحاذاة والاتجاه
 * @module components/layout/Flex
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { FlexProps, FlexItemProps, Direction, JustifyContent, AlignItems, FlexWrap, GapSize } from "./types";

/**
 * خريطة اتجاه التخطيط إلى فئات CSS
 */
const directionClasses: Record<Direction, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

/**
 * خريطة محاذاة المحور الرئيسي إلى فئات CSS
 */
const justifyClasses: Record<JustifyContent, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * خريطة محاذاة المحور الثانوي إلى فئات CSS
 */
const alignClasses: Record<AlignItems, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  baseline: "items-baseline",
  stretch: "items-stretch",
};

/**
 * خريطة التفاف العناصر إلى فئات CSS
 */
const wrapClasses: Record<FlexWrap, string> = {
  wrap: "flex-wrap",
  nowrap: "flex-nowrap",
  "wrap-reverse": "flex-wrap-reverse",
};

/**
 * خريطة أحجام الفجوات إلى فئات CSS
 */
const gapClasses: Record<GapSize, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  "2xl": "gap-12",
};

/**
 * خريطة أحجام الفجوات الأفقية
 */
const gapXClasses: Record<GapSize, string> = {
  none: "gap-x-0",
  xs: "gap-x-1",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
  "2xl": "gap-x-12",
};

/**
 * خريطة أحجام الفجوات العمودية
 */
const gapYClasses: Record<GapSize, string> = {
  none: "gap-y-0",
  xs: "gap-y-1",
  sm: "gap-y-2",
  md: "gap-y-4",
  lg: "gap-y-6",
  xl: "gap-y-8",
  "2xl": "gap-y-12",
};

/**
 * مكون التخطيط المرن
 * 
 * @description يوفر تخطيط Flexbox مع خيارات متعددة للمحاذاة والاتجاه
 * 
 * @example
 * ```tsx
 * // تخطيط أفقي بسيط
 * <Flex gap="md">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 * </Flex>
 * 
 * // تخطيط عمودي مع توسيط
 * <Flex direction="column" align="center" justify="center">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 * </Flex>
 * 
 * // تخطيط مع توزيع متساوي
 * <Flex justify="between" align="center">
 *   <div>يسار</div>
 *   <div>يمين</div>
 * </Flex>
 * ```
 */
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      children,
      direction = "row",
      justify = "start",
      align = "stretch",
      wrap = "nowrap",
      gap,
      gapX,
      gapY,
      grow = false,
      shrink = true,
      inline = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="flex"
        className={cn(
          inline ? "inline-flex" : "flex",
          directionClasses[direction],
          justifyClasses[justify],
          alignClasses[align],
          wrapClasses[wrap],
          gap && !gapX && !gapY && gapClasses[gap],
          gapX && gapXClasses[gapX],
          gapY && gapYClasses[gapY],
          grow && "flex-grow",
          !shrink && "flex-shrink-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";

/**
 * خريطة محاذاة العنصر الذاتية
 */
const alignSelfClasses: Record<AlignItems | "auto", string> = {
  auto: "self-auto",
  start: "self-start",
  end: "self-end",
  center: "self-center",
  baseline: "self-baseline",
  stretch: "self-stretch",
};

/**
 * مكون عنصر Flex
 * 
 * @description يوفر تحكماً في سلوك العنصر داخل حاوية Flex
 * 
 * @example
 * ```tsx
 * <Flex gap="md">
 *   <FlexItem grow>يملأ المساحة المتبقية</FlexItem>
 *   <FlexItem shrink={false}>لا يتقلص</FlexItem>
 * </Flex>
 * ```
 */
const FlexItem = React.forwardRef<HTMLDivElement, FlexItemProps>(
  (
    {
      className,
      children,
      grow,
      shrink,
      basis,
      alignSelf,
      order,
      ...props
    },
    ref
  ) => {
    const growClass = grow === true ? "flex-grow" : grow === false ? "flex-grow-0" : typeof grow === "number" ? `flex-grow-[${grow}]` : "";
    const shrinkClass = shrink === true ? "flex-shrink" : shrink === false ? "flex-shrink-0" : typeof shrink === "number" ? `flex-shrink-[${shrink}]` : "";

    return (
      <div
        ref={ref}
        data-slot="flex-item"
        className={cn(
          growClass,
          shrinkClass,
          alignSelf && alignSelfClasses[alignSelf],
          order !== undefined && `order-${order}`,
          className
        )}
        style={{
          ...(basis !== undefined ? { flexBasis: typeof basis === "number" ? `${basis}px` : basis } : {}),
          ...(typeof grow === "number" && grow > 1 ? { flexGrow: grow } : {}),
          ...(typeof shrink === "number" && shrink > 1 ? { flexShrink: shrink } : {}),
          ...(order !== undefined && order > 12 ? { order } : {}),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FlexItem.displayName = "FlexItem";

export { Flex, FlexItem };
export type { FlexProps, FlexItemProps };
