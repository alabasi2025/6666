/**
 * @file Grid.tsx
 * @description مكون الشبكة (Grid) مع أعمدة متجاوبة
 * @module components/layout/Grid
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GridProps, GridItemProps, GridColumns, GridRows, GapSize, AlignItems, JustifyContent } from "./types";

/**
 * خريطة عدد الأعمدة إلى فئات CSS
 */
const gridColsClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
  auto: "grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
};

/**
 * خريطة عدد الأعمدة للشاشات الصغيرة
 */
const gridColsSmClasses: Record<GridColumns, string> = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
  7: "sm:grid-cols-7",
  8: "sm:grid-cols-8",
  9: "sm:grid-cols-9",
  10: "sm:grid-cols-10",
  11: "sm:grid-cols-11",
  12: "sm:grid-cols-12",
  auto: "sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
};

/**
 * خريطة عدد الأعمدة للشاشات المتوسطة
 */
const gridColsMdClasses: Record<GridColumns, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
  7: "md:grid-cols-7",
  8: "md:grid-cols-8",
  9: "md:grid-cols-9",
  10: "md:grid-cols-10",
  11: "md:grid-cols-11",
  12: "md:grid-cols-12",
  auto: "md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
};

/**
 * خريطة عدد الأعمدة للشاشات الكبيرة
 */
const gridColsLgClasses: Record<GridColumns, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
  9: "lg:grid-cols-9",
  10: "lg:grid-cols-10",
  11: "lg:grid-cols-11",
  12: "lg:grid-cols-12",
  auto: "lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
};

/**
 * خريطة عدد الأعمدة للشاشات الكبيرة جداً
 */
const gridColsXlClasses: Record<GridColumns, string> = {
  1: "xl:grid-cols-1",
  2: "xl:grid-cols-2",
  3: "xl:grid-cols-3",
  4: "xl:grid-cols-4",
  5: "xl:grid-cols-5",
  6: "xl:grid-cols-6",
  7: "xl:grid-cols-7",
  8: "xl:grid-cols-8",
  9: "xl:grid-cols-9",
  10: "xl:grid-cols-10",
  11: "xl:grid-cols-11",
  12: "xl:grid-cols-12",
  auto: "xl:grid-cols-[repeat(auto-fit,minmax(0,1fr))]",
};

/**
 * خريطة عدد الصفوف إلى فئات CSS
 */
const gridRowsClasses: Record<GridRows, string> = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
  auto: "grid-rows-[auto]",
  none: "grid-rows-none",
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
 * خريطة محاذاة العناصر
 */
const alignItemsClasses: Record<AlignItems, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  baseline: "items-baseline",
  stretch: "items-stretch",
};

/**
 * خريطة محاذاة المحتوى
 */
const justifyItemsClasses: Record<JustifyContent, string> = {
  start: "justify-items-start",
  end: "justify-items-end",
  center: "justify-items-center",
  between: "justify-items-stretch",
  around: "justify-items-stretch",
  evenly: "justify-items-stretch",
};

/**
 * مكون الشبكة
 * 
 * @description يوفر تخطيط شبكة CSS مع أعمدة متجاوبة
 * 
 * @example
 * ```tsx
 * // شبكة بسيطة
 * <Grid cols={3} gap="md">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 *   <div>عنصر 3</div>
 * </Grid>
 * 
 * // شبكة متجاوبة
 * <Grid cols={1} colsMd={2} colsLg={4} gap="lg">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 *   <div>عنصر 3</div>
 *   <div>عنصر 4</div>
 * </Grid>
 * ```
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      children,
      cols = 1,
      colsSm,
      colsMd,
      colsLg,
      colsXl,
      rows,
      gap = "md",
      gapX,
      gapY,
      alignItems,
      justifyItems,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="grid"
        className={cn(
          "grid",
          gridColsClasses[cols],
          colsSm && gridColsSmClasses[colsSm],
          colsMd && gridColsMdClasses[colsMd],
          colsLg && gridColsLgClasses[colsLg],
          colsXl && gridColsXlClasses[colsXl],
          rows && gridRowsClasses[rows],
          gap && !gapX && !gapY && gapClasses[gap],
          gapX && gapXClasses[gapX],
          gapY && gapYClasses[gapY],
          alignItems && alignItemsClasses[alignItems],
          justifyItems && justifyItemsClasses[justifyItems],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

/**
 * خريطة امتداد الأعمدة
 */
const colSpanClasses: Record<number | "full", string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
  full: "col-span-full",
};

/**
 * خريطة امتداد الصفوف
 */
const rowSpanClasses: Record<number, string> = {
  1: "row-span-1",
  2: "row-span-2",
  3: "row-span-3",
  4: "row-span-4",
  5: "row-span-5",
  6: "row-span-6",
};

/**
 * مكون عنصر الشبكة
 * 
 * @description يوفر تحكماً في موضع وامتداد العنصر داخل الشبكة
 * 
 * @example
 * ```tsx
 * <Grid cols={4} gap="md">
 *   <GridItem colSpan={2}>يمتد على عمودين</GridItem>
 *   <GridItem>عنصر عادي</GridItem>
 *   <GridItem>عنصر عادي</GridItem>
 * </Grid>
 * ```
 */
const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      className,
      children,
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="grid-item"
        className={cn(
          colSpan && colSpanClasses[colSpan],
          rowSpan && rowSpanClasses[rowSpan],
          colStart && `col-start-${colStart}`,
          colEnd && `col-end-${colEnd}`,
          rowStart && `row-start-${rowStart}`,
          rowEnd && `row-end-${rowEnd}`,
          className
        )}
        style={{
          ...(colStart && !colSpanClasses[colSpan as keyof typeof colSpanClasses] ? { gridColumnStart: colStart } : {}),
          ...(colEnd ? { gridColumnEnd: colEnd } : {}),
          ...(rowStart ? { gridRowStart: rowStart } : {}),
          ...(rowEnd ? { gridRowEnd: rowEnd } : {}),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";

export { Grid, GridItem };
export type { GridProps, GridItemProps };
