/**
 * @file Section.tsx
 * @description مكون القسم (Section) مع عنوان ووصف
 * @module components/layout/Section
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import type { SectionProps, SpacingSize } from "./types";

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
 * خريطة ألوان الخلفية إلى فئات CSS
 */
const backgroundClasses: Record<string, string> = {
  default: "bg-background",
  muted: "bg-muted",
  accent: "bg-accent",
  transparent: "bg-transparent",
};

/**
 * مكون القسم
 * 
 * @description يوفر قسماً منظماً مع عنوان ووصف وإجراء اختياري
 * 
 * @example
 * ```tsx
 * // قسم بسيط
 * <Section title="عنوان القسم">
 *   <p>محتوى القسم</p>
 * </Section>
 * 
 * // قسم مع وصف وإجراء
 * <Section 
 *   title="عنوان القسم" 
 *   description="وصف القسم"
 *   action={<Button>إجراء</Button>}
 * >
 *   <p>محتوى القسم</p>
 * </Section>
 * 
 * // قسم مع خلفية وفواصل
 * <Section 
 *   title="قسم مميز" 
 *   background="muted"
 *   dividerTop
 *   dividerBottom
 *   paddingY="xl"
 * >
 *   <p>محتوى القسم</p>
 * </Section>
 * ```
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      className,
      children,
      title,
      description,
      action,
      padding,
      paddingY = "lg",
      background = "transparent",
      dividerTop = false,
      dividerBottom = false,
      ...props
    },
    ref
  ) => {
    const hasHeader = title || description || action;

    return (
      <section
        ref={ref}
        data-slot="section"
        className={cn(
          "w-full",
          backgroundClasses[background],
          padding && paddingClasses[padding],
          !padding && paddingY && paddingYClasses[paddingY],
          dividerTop && "border-t",
          dividerBottom && "border-b",
          className
        )}
        {...props}
      >
        {hasHeader && (
          <div className="flex flex-col gap-1 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="space-y-1">
              {title && (
                <h2 className="text-2xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {action && (
              <div className="flex-shrink-0">
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

/**
 * مكون رأس القسم المنفصل
 * 
 * @description يوفر رأس قسم منفصل يمكن استخدامه بشكل مستقل
 */
interface SectionHeaderProps {
  /** العنوان */
  title?: React.ReactNode;
  /** الوصف */
  description?: React.ReactNode;
  /** الإجراء */
  action?: React.ReactNode;
  /** فئات CSS إضافية */
  className?: string;
  /** العناصر الفرعية */
  children?: React.ReactNode;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      className,
      children,
      title,
      description,
      action,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="section-header"
        className={cn(
          "flex flex-col gap-1 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          {title && (
            <h2 className="text-2xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground">
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

SectionHeader.displayName = "SectionHeader";

/**
 * مكون محتوى القسم
 * 
 * @description يوفر منطقة المحتوى الرئيسية للقسم
 */
interface SectionContentProps {
  /** فئات CSS إضافية */
  className?: string;
  /** العناصر الفرعية */
  children?: React.ReactNode;
}

const SectionContent = React.forwardRef<HTMLDivElement, SectionContentProps>(
  (
    {
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-slot="section-content"
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionContent.displayName = "SectionContent";

export { Section, SectionHeader, SectionContent };
export type { SectionProps, SectionHeaderProps, SectionContentProps };
