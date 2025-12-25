/**
 * @file Stack.tsx
 * @description مكون التكديس (Stack) عمودي/أفقي
 * @module components/layout/Stack
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { StackProps, GapSize, AlignItems, JustifyContent } from "./types";

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
 * خريطة محاذاة العناصر إلى فئات CSS
 */
const alignClasses: Record<AlignItems, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  baseline: "items-baseline",
  stretch: "items-stretch",
};

/**
 * خريطة محاذاة المحتوى إلى فئات CSS
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
 * مكون التكديس
 * 
 * @description يوفر تكديساً للعناصر عمودياً أو أفقياً مع فجوات ومحاذاة
 * 
 * @example
 * ```tsx
 * // تكديس عمودي (افتراضي)
 * <Stack gap="md">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 *   <div>عنصر 3</div>
 * </Stack>
 * 
 * // تكديس أفقي
 * <Stack direction="horizontal" gap="lg" align="center">
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 * </Stack>
 * 
 * // تكديس مع فاصل
 * <Stack gap="md" divider>
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 *   <div>عنصر 3</div>
 * </Stack>
 * 
 * // تكديس مع فاصل مخصص
 * <Stack gap="md" divider={<CustomDivider />}>
 *   <div>عنصر 1</div>
 *   <div>عنصر 2</div>
 * </Stack>
 * ```
 */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      children,
      direction = "vertical",
      gap = "md",
      align = "stretch",
      justify = "start",
      wrap = false,
      divider,
      ...props
    },
    ref
  ) => {
    const isHorizontal = direction === "horizontal";

    // معالجة الفاصل بين العناصر
    const childrenArray = React.Children.toArray(children).filter(Boolean);
    
    const renderChildren = () => {
      if (!divider || childrenArray.length <= 1) {
        return children;
      }

      // إنشاء الفاصل الافتراضي أو استخدام الفاصل المخصص
      const dividerElement = divider === true ? (
        <div
          data-slot="stack-divider"
          className={cn(
            "shrink-0 bg-border",
            isHorizontal ? "w-px self-stretch" : "h-px w-full"
          )}
        />
      ) : (
        divider
      );

      // إدراج الفاصل بين العناصر
      return childrenArray.reduce<React.ReactNode[]>((acc, child, index) => {
        if (index === 0) {
          return [child];
        }
        return [
          ...acc,
          React.cloneElement(dividerElement as React.ReactElement, {
            key: `divider-${index}`,
          }),
          child,
        ];
      }, []);
    };

    return (
      <div
        ref={ref}
        data-slot="stack"
        className={cn(
          "flex",
          isHorizontal ? "flex-row" : "flex-col",
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {renderChildren()}
      </div>
    );
  }
);

Stack.displayName = "Stack";

/**
 * مكون تكديس أفقي مختصر
 * 
 * @description تكديس أفقي بسيط للعناصر
 */
interface HStackProps extends Omit<StackProps, "direction"> {}

const HStack = React.forwardRef<HTMLDivElement, HStackProps>(
  ({ ...props }, ref) => {
    return <Stack ref={ref} direction="horizontal" {...props} />;
  }
);

HStack.displayName = "HStack";

/**
 * مكون تكديس عمودي مختصر
 * 
 * @description تكديس عمودي بسيط للعناصر
 */
interface VStackProps extends Omit<StackProps, "direction"> {}

const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ ...props }, ref) => {
    return <Stack ref={ref} direction="vertical" {...props} />;
  }
);

VStack.displayName = "VStack";

/**
 * مكون مجموعة الأزرار
 * 
 * @description تكديس أفقي مخصص لمجموعة من الأزرار
 */
interface ButtonGroupProps {
  /** العناصر الفرعية (الأزرار) */
  children: React.ReactNode;
  /** الفجوة بين الأزرار */
  gap?: GapSize;
  /** محاذاة الأزرار */
  align?: AlignItems;
  /** محاذاة المحتوى */
  justify?: JustifyContent;
  /** التفاف الأزرار */
  wrap?: boolean;
  /** فئات CSS إضافية */
  className?: string;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      children,
      gap = "sm",
      align = "center",
      justify = "start",
      wrap = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="button-group"
        role="group"
        className={cn(
          "flex flex-row",
          gapClasses[gap],
          alignClasses[align],
          justifyClasses[justify],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = "ButtonGroup";

export { Stack, HStack, VStack, ButtonGroup };
export type { StackProps, HStackProps, VStackProps, ButtonGroupProps };
