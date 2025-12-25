/**
 * @file index.ts
 * @description ملف التصدير الرئيسي لمكونات التخطيط (Layout Components)
 * @module components/layout
 */

// ============================================
// تصدير الأنواع
// ============================================
export type {
  // أنواع أساسية
  SpacingSize,
  ContainerSize,
  GapSize,
  Direction,
  JustifyContent,
  AlignItems,
  FlexWrap,
  Orientation,
  GridColumns,
  GridRows,
  CardVariant,
  BaseLayoutProps,
  // أنواع مُسماة
  LayoutSpacingSize,
  LayoutContainerSize,
  LayoutGapSize,
  LayoutDirection,
  LayoutJustifyContent,
  LayoutAlignItems,
  LayoutFlexWrap,
  LayoutOrientation,
  LayoutGridColumns,
  LayoutGridRows,
} from "./types";

// ============================================
// تصدير Container
// ============================================
export { Container } from "./Container";
export type { ContainerProps } from "./Container";

// ============================================
// تصدير Grid
// ============================================
export { Grid, GridItem } from "./Grid";
export type { GridProps, GridItemProps } from "./Grid";

// ============================================
// تصدير Flex
// ============================================
export { Flex, FlexItem } from "./Flex";
export type { FlexProps, FlexItemProps } from "./Flex";

// ============================================
// تصدير Card
// ============================================
export { 
  LayoutCard, 
  LayoutCardHeader, 
  LayoutCardBody, 
  LayoutCardFooter 
} from "./Card";
export type { 
  LayoutCardProps, 
  LayoutCardHeaderProps, 
  LayoutCardBodyProps, 
  LayoutCardFooterProps 
} from "./Card";

// ============================================
// تصدير Section
// ============================================
export { Section, SectionHeader, SectionContent } from "./Section";
export type { SectionProps, SectionHeaderProps, SectionContentProps } from "./Section";

// ============================================
// تصدير Divider
// ============================================
export { Divider, VerticalDivider } from "./Divider";
export type { DividerProps, VerticalDividerProps } from "./Divider";

// ============================================
// تصدير Spacer
// ============================================
export { Spacer, HSpacer, VSpacer, FlexSpacer } from "./Spacer";
export type { SpacerProps, HSpacerProps, VSpacerProps } from "./Spacer";

// ============================================
// تصدير Stack
// ============================================
export { Stack, HStack, VStack, ButtonGroup } from "./Stack";
export type { StackProps, HStackProps, VStackProps, ButtonGroupProps } from "./Stack";
