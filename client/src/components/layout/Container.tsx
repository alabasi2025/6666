/**
 * @file Container.tsx
 * @description مكون الحاوية المركزية (Container) مع عرض أقصى قابل للتخصيص
 * @module components/layout/Container
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ContainerProps, ContainerSize, SpacingSize } from "./types";

/**
 * خريطة أحجام الحاوية إلى فئات CSS
 */
const containerSizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

/**
 * خريطة أحجام الحشو إلى فئات CSS
 */
const paddingClasses: Record<SpacingSize, string> = {
  none: "p-0",
  xs: "p-1",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
  "3xl": "p-16",
};

/**
 * خريطة أحجام الحشو الأفقي إلى فئات CSS
 */
const paddingXClasses: Record<SpacingSize, string> = {
  none: "px-0",
  xs: "px-1",
  sm: "px-2",
  md: "px-4",
  lg: "px-6",
  xl: "px-8",
  "2xl": "px-12",
  "3xl": "px-16",
};

/**
 * خريطة أحجام الحشو العمودي إلى فئات CSS
 */
const paddingYClasses: Record<SpacingSize, string> = {
  none: "py-0",
  xs: "py-1",
  sm: "py-2",
  md: "py-4",
  lg: "py-6",
  xl: "py-8",
  "2xl": "py-12",
  "3xl": "py-16",
};

/**
 * مكون الحاوية المركزية
 * 
 * @description يوفر حاوية مركزية مع عرض أقصى قابل للتخصيص وحشو داخلي
 * 
 * @example
 * ```tsx
 * // حاوية بسيطة
 * <Container>
 *   <p>محتوى الحاوية</p>
 * </Container>
 * 
 * // حاوية بحجم مخصص
 * <Container size="lg" padding="lg">
 *   <p>محتوى الحاوية</p>
 * </Container>
 * 
 * // حاوية مع توسيط
 * <Container centered>
 *   <p>محتوى القسم</p>
 * </Container>
 * ```
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      children,
      size = "xl",
      centered = true,
      padding,
      paddingX = "md",
      paddingY,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="container"
        className={cn(
          "w-full",
          containerSizeClasses[size],
          centered && "mx-auto",
          padding && paddingClasses[padding],
          !padding && paddingX && paddingXClasses[paddingX],
          !padding && paddingY && paddingYClasses[paddingY],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export { Container };
export type { ContainerProps };
