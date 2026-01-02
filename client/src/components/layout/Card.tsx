/**
 * @file Card.tsx
 * @description مكون البطاقة (Card) مع رأس وجسم وتذييل
 * @module components/layout/Card
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { 
  LayoutCardProps, 
  LayoutCardHeaderProps, 
  LayoutCardBodyProps, 
  LayoutCardFooterProps,
  CardVariant,
  SpacingSize,
  JustifyContent
} from "./types";

/**
 * خريطة متغيرات البطاقة إلى فئات CSS
 */
const variantClasses: Record<CardVariant, string> = {
  default: "bg-card text-card-foreground border shadow-sm",
  outlined: "bg-transparent border-2 border-border",
  elevated: "bg-card text-card-foreground shadow-lg",
  filled: "bg-muted text-muted-foreground",
  ghost: "bg-transparent",
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
 * خريطة نصف قطر الحواف إلى فئات CSS
 */
const radiusClasses: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * مكون البطاقة
 * 
 * @description يوفر بطاقة قابلة للتخصيص مع متغيرات متعددة
 * 
 * @example
 * ```tsx
 * // بطاقة بسيطة
 * <LayoutCard>
 *   <LayoutCardHeader title="عنوان البطاقة" />
 *   <LayoutCardBody>محتوى البطاقة</LayoutCardBody>
 *   <LayoutCardFooter>تذييل البطاقة</LayoutCardFooter>
 * </LayoutCard>
 * 
 * // بطاقة قابلة للنقر
 * <LayoutCard variant="outlined" hoverable clickable onClick={() => {}}>
 *   <LayoutCardBody>انقر هنا</LayoutCardBody>
 * </LayoutCard>
 * ```
 */
const LayoutCard = React.forwardRef<HTMLDivElement, LayoutCardProps>(
  (
    {
      className,
      children,
      variant = "default",
      padding = "none",
      radius = "lg",
      hoverable = false,
      clickable = false,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="layout-card"
        className={cn(
          "flex flex-col overflow-hidden",
          variantClasses[variant],
          paddingClasses[padding],
          radiusClasses[radius],
          hoverable && "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
          clickable && "cursor-pointer",
          className
        )}
        onClick={clickable ? onClick : undefined}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyDown={clickable ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LayoutCard.displayName = "LayoutCard";

/**
 * مكون رأس البطاقة
 * 
 * @description يوفر رأس البطاقة مع عنوان ووصف وإجراء اختياري
 * 
 * @example
 * ```tsx
 * <LayoutCardHeader 
 *   title="عنوان البطاقة" 
 *   description="وصف البطاقة"
 *   action={<Button>إجراء</Button>}
 *   icon={<Icon />}
 * />
 * ```
 */
const LayoutCardHeader = React.forwardRef<HTMLDivElement, LayoutCardHeaderProps>(
  (
    {
      className,
      children,
      title,
      description,
      action,
      icon,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="layout-card-header"
        className={cn(
          "flex items-start gap-4 p-4 pb-0",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold leading-none tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    );
  }
);

LayoutCardHeader.displayName = "LayoutCardHeader";

/**
 * خريطة أحجام حشو الجسم
 */
const bodyPaddingClasses: Record<SpacingSize, string> = {
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
 * مكون جسم البطاقة
 * 
 * @description يوفر منطقة المحتوى الرئيسية للبطاقة
 * 
 * @example
 * ```tsx
 * <LayoutCardBody padding="lg">
 *   <p>محتوى البطاقة</p>
 * </LayoutCardBody>
 * ```
 */
const LayoutCardBody = React.forwardRef<HTMLDivElement, LayoutCardBodyProps>(
  (
    {
      className,
      children,
      padding = "md",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="layout-card-body"
        className={cn(
          "flex-1",
          bodyPaddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LayoutCardBody.displayName = "LayoutCardBody";

/**
 * خريطة محاذاة التذييل
 */
const footerJustifyClasses: Record<JustifyContent, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

/**
 * مكون تذييل البطاقة
 * 
 * @description يوفر منطقة التذييل للبطاقة مع خيارات المحاذاة
 * 
 * @example
 * ```tsx
 * <LayoutCardFooter justify="end" divider>
 *   <Button variant="outline">إلغاء</Button>
 *   <Button>حفظ</Button>
 * </LayoutCardFooter>
 * ```
 */
const LayoutCardFooter = React.forwardRef<HTMLDivElement, LayoutCardFooterProps>(
  (
    {
      className,
      children,
      justify = "end",
      divider = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="layout-card-footer"
        className={cn(
          "flex items-center gap-2 p-4 pt-0",
          footerJustifyClasses[justify],
          divider && "border-t pt-4 mt-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

LayoutCardFooter.displayName = "LayoutCardFooter";

export { LayoutCard, LayoutCardHeader, LayoutCardBody, LayoutCardFooter };
export type { LayoutCardProps, LayoutCardHeaderProps, LayoutCardBodyProps, LayoutCardFooterProps };
