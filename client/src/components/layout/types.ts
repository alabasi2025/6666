/**
 * @file types.ts
 * @description أنواع TypeScript لمكونات التخطيط (Layout Components)
 * @module components/layout/types
 */

import * as React from "react";

// ============================================
// أنواع الحجم والمسافات
// ============================================

/**
 * أحجام المسافات المتاحة
 */
export type SpacingSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

/**
 * أحجام الحاوية (Container)
 */
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

/**
 * أحجام الفجوات (Gap)
 */
export type GapSize = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

// ============================================
// أنواع التخطيط والمحاذاة
// ============================================

/**
 * اتجاه التخطيط
 */
export type Direction = "row" | "column" | "row-reverse" | "column-reverse";

/**
 * محاذاة العناصر على المحور الرئيسي
 */
export type JustifyContent = 
  | "start" 
  | "end" 
  | "center" 
  | "between" 
  | "around" 
  | "evenly";

/**
 * محاذاة العناصر على المحور الثانوي
 */
export type AlignItems = "start" | "end" | "center" | "baseline" | "stretch";

/**
 * التفاف العناصر
 */
export type FlexWrap = "wrap" | "nowrap" | "wrap-reverse";

/**
 * اتجاه الفاصل
 */
export type Orientation = "horizontal" | "vertical";

// ============================================
// أنواع الشبكة (Grid)
// ============================================

/**
 * عدد الأعمدة في الشبكة
 */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "auto";

/**
 * عدد الصفوف في الشبكة
 */
export type GridRows = 1 | 2 | 3 | 4 | 5 | 6 | "auto" | "none";

// ============================================
// خصائص المكونات الأساسية
// ============================================

/**
 * خصائص أساسية مشتركة لجميع المكونات
 */
export interface BaseLayoutProps {
  /** معرف العنصر */
  id?: string;
  /** فئات CSS إضافية */
  className?: string;
  /** العناصر الفرعية */
  children?: React.ReactNode;
  /** نمط CSS مخصص */
  style?: React.CSSProperties;
  /** خاصية data-testid للاختبار */
  "data-testid"?: string;
}

// ============================================
// خصائص Container
// ============================================

/**
 * خصائص مكون الحاوية (Container)
 */
export interface ContainerProps extends BaseLayoutProps {
  /** حجم الحاوية الأقصى */
  size?: ContainerSize;
  /** توسيط الحاوية */
  centered?: boolean;
  /** الحشو الداخلي */
  padding?: SpacingSize;
  /** الحشو الأفقي */
  paddingX?: SpacingSize;
  /** الحشو العمودي */
  paddingY?: SpacingSize;

}

// ============================================
// خصائص Grid
// ============================================

/**
 * خصائص مكون الشبكة (Grid)
 */
export interface GridProps extends BaseLayoutProps {
  /** عدد الأعمدة */
  cols?: GridColumns;
  /** عدد الأعمدة على الشاشات الصغيرة */
  colsSm?: GridColumns;
  /** عدد الأعمدة على الشاشات المتوسطة */
  colsMd?: GridColumns;
  /** عدد الأعمدة على الشاشات الكبيرة */
  colsLg?: GridColumns;
  /** عدد الأعمدة على الشاشات الكبيرة جداً */
  colsXl?: GridColumns;
  /** عدد الصفوف */
  rows?: GridRows;
  /** الفجوة بين العناصر */
  gap?: GapSize;
  /** الفجوة الأفقية */
  gapX?: GapSize;
  /** الفجوة العمودية */
  gapY?: GapSize;
  /** محاذاة العناصر */
  alignItems?: AlignItems;
  /** محاذاة المحتوى */
  justifyItems?: JustifyContent;

}

/**
 * خصائص عنصر الشبكة (Grid Item)
 */
export interface GridItemProps extends BaseLayoutProps {
  /** امتداد الأعمدة */
  colSpan?: number | "full";
  /** امتداد الصفوف */
  rowSpan?: number;
  /** بداية العمود */
  colStart?: number;
  /** نهاية العمود */
  colEnd?: number;
  /** بداية الصف */
  rowStart?: number;
  /** نهاية الصف */
  rowEnd?: number;
}

// ============================================
// خصائص Flex
// ============================================

/**
 * خصائص مكون التخطيط المرن (Flex)
 */
export interface FlexProps extends BaseLayoutProps {
  /** اتجاه التخطيط */
  direction?: Direction;
  /** محاذاة العناصر على المحور الرئيسي */
  justify?: JustifyContent;
  /** محاذاة العناصر على المحور الثانوي */
  align?: AlignItems;
  /** التفاف العناصر */
  wrap?: FlexWrap;
  /** الفجوة بين العناصر */
  gap?: GapSize;
  /** الفجوة الأفقية */
  gapX?: GapSize;
  /** الفجوة العمودية */
  gapY?: GapSize;
  /** ملء المساحة المتاحة */
  grow?: boolean;
  /** تقليص العناصر */
  shrink?: boolean;
  /** تخطيط مضمن (inline) */
  inline?: boolean;

}

/**
 * خصائص عنصر Flex (Flex Item)
 */
export interface FlexItemProps extends BaseLayoutProps {
  /** معامل النمو */
  grow?: number | boolean;
  /** معامل التقليص */
  shrink?: number | boolean;
  /** الحجم الأساسي */
  basis?: string | number;
  /** محاذاة ذاتية */
  alignSelf?: AlignItems | "auto";
  /** ترتيب العنصر */
  order?: number;
}

// ============================================
// خصائص Card
// ============================================

/**
 * متغيرات البطاقة
 */
export type CardVariant = "default" | "outlined" | "elevated" | "filled" | "ghost";

/**
 * خصائص مكون البطاقة (Card)
 */
export interface LayoutCardProps extends BaseLayoutProps {
  /** نوع البطاقة */
  variant?: CardVariant;
  /** الحشو الداخلي */
  padding?: SpacingSize;
  /** نصف قطر الحواف */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  /** قابلية التحويم */
  hoverable?: boolean;
  /** قابلية النقر */
  clickable?: boolean;
  /** معالج النقر */
  onClick?: () => void;

}

/**
 * خصائص رأس البطاقة
 */
export interface LayoutCardHeaderProps extends BaseLayoutProps {
  /** العنوان */
  title?: React.ReactNode;
  /** الوصف */
  description?: React.ReactNode;
  /** الإجراء */
  action?: React.ReactNode;
  /** الأيقونة */
  icon?: React.ReactNode;
}

/**
 * خصائص جسم البطاقة
 */
export interface LayoutCardBodyProps extends BaseLayoutProps {
  /** الحشو الداخلي */
  padding?: SpacingSize;
}

/**
 * خصائص تذييل البطاقة
 */
export interface LayoutCardFooterProps extends BaseLayoutProps {
  /** محاذاة المحتوى */
  justify?: JustifyContent;
  /** فاصل علوي */
  divider?: boolean;
}

// ============================================
// خصائص Section
// ============================================

/**
 * خصائص مكون القسم (Section)
 */
export interface SectionProps extends BaseLayoutProps {
  /** العنوان */
  title?: React.ReactNode;
  /** الوصف */
  description?: React.ReactNode;
  /** الإجراء */
  action?: React.ReactNode;
  /** الحشو الداخلي */
  padding?: SpacingSize;
  /** الحشو العمودي */
  paddingY?: SpacingSize;
  /** لون الخلفية */
  background?: "default" | "muted" | "accent" | "transparent";
  /** فاصل علوي */
  dividerTop?: boolean;
  /** فاصل سفلي */
  dividerBottom?: boolean;
}

// ============================================
// خصائص Divider
// ============================================

/**
 * خصائص مكون الفاصل (Divider)
 */
export interface DividerProps extends Omit<BaseLayoutProps, "children"> {
  /** اتجاه الفاصل */
  orientation?: Orientation;
  /** نص الفاصل */
  label?: React.ReactNode;
  /** موضع النص */
  labelPosition?: "start" | "center" | "end";
  /** نوع الفاصل */
  variant?: "solid" | "dashed" | "dotted";
  /** سمك الفاصل */
  thickness?: "thin" | "medium" | "thick";
  /** لون الفاصل */
  color?: "default" | "muted" | "accent" | "primary";
  /** الهامش */
  spacing?: SpacingSize;
  /** زخرفي (لا يؤثر على إمكانية الوصول) */
  decorative?: boolean;
}

// ============================================
// خصائص Spacer
// ============================================

/**
 * خصائص مكون المسافة (Spacer)
 */
export interface SpacerProps extends Omit<BaseLayoutProps, "children"> {
  /** حجم المسافة */
  size?: SpacingSize;
  /** المسافة الأفقية */
  x?: SpacingSize;
  /** المسافة العمودية */
  y?: SpacingSize;
  /** ملء المساحة المتاحة */
  grow?: boolean;
  /** الاتجاه */
  axis?: "horizontal" | "vertical" | "both";
}

// ============================================
// خصائص Stack
// ============================================

/**
 * خصائص مكون التكديس (Stack)
 */
export interface StackProps extends BaseLayoutProps {
  /** اتجاه التكديس */
  direction?: "horizontal" | "vertical";
  /** الفجوة بين العناصر */
  gap?: GapSize;
  /** محاذاة العناصر */
  align?: AlignItems;
  /** محاذاة المحتوى */
  justify?: JustifyContent;
  /** التفاف العناصر */
  wrap?: boolean;
  /** فاصل بين العناصر */
  divider?: boolean | React.ReactNode;

}

// ============================================
// تصدير جميع الأنواع
// ============================================

export type {
  SpacingSize as LayoutSpacingSize,
  ContainerSize as LayoutContainerSize,
  GapSize as LayoutGapSize,
  Direction as LayoutDirection,
  JustifyContent as LayoutJustifyContent,
  AlignItems as LayoutAlignItems,
  FlexWrap as LayoutFlexWrap,
  Orientation as LayoutOrientation,
  GridColumns as LayoutGridColumns,
  GridRows as LayoutGridRows,
};
