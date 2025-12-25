/**
 * أنواع TypeScript لمكونات الرسوم البيانية
 * Types for Chart Components
 */

import { ReactNode } from 'react';

/**
 * نقطة بيانات أساسية للرسوم البيانية
 */
export interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/**
 * نقطة بيانات للرسوم البيانية متعددة السلاسل
 */
export interface MultiSeriesDataPoint {
  name: string;
  [key: string]: string | number;
}

/**
 * تكوين سلسلة البيانات
 */
export interface SeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  fillOpacity?: number;
}

/**
 * خصائص حاوية الرسم البياني
 */
export interface ChartContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  error?: string | null;
  height?: number | string;
  actions?: ReactNode;
}

/**
 * خصائص أساسية مشتركة للرسوم البيانية
 */
export interface BaseChartProps {
  data: DataPoint[] | MultiSeriesDataPoint[];
  className?: string;
  height?: number;
  loading?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
}

/**
 * خصائص الرسم البياني الخطي
 */
export interface LineChartProps extends BaseChartProps {
  data: MultiSeriesDataPoint[];
  series: SeriesConfig[];
  xAxisKey?: string;
  curved?: boolean;
  showDots?: boolean;
  strokeWidth?: number;
}

/**
 * خصائص الرسم البياني الشريطي
 */
export interface BarChartProps extends BaseChartProps {
  data: MultiSeriesDataPoint[];
  series: SeriesConfig[];
  xAxisKey?: string;
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
  barSize?: number;
  barGap?: number;
}

/**
 * خصائص الرسم البياني الدائري
 */
export interface PieChartProps extends BaseChartProps {
  data: DataPoint[];
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  showLabels?: boolean;
  labelType?: 'name' | 'value' | 'percent' | 'namePercent';
}

/**
 * خصائص الرسم البياني الحلقي (Doughnut)
 */
export interface DoughnutChartProps extends PieChartProps {
  centerLabel?: string;
  centerValue?: string | number;
}

/**
 * خصائص الرسم البياني المساحي
 */
export interface AreaChartProps extends BaseChartProps {
  data: MultiSeriesDataPoint[];
  series: SeriesConfig[];
  xAxisKey?: string;
  curved?: boolean;
  stacked?: boolean;
  fillOpacity?: number;
  gradientFill?: boolean;
}

/**
 * خصائص بطاقة الإحصائيات
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * ألوان افتراضية للرسوم البيانية
 */
export const DEFAULT_CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
];

/**
 * تكوين محور الرسم البياني
 */
export interface AxisConfig {
  show?: boolean;
  label?: string;
  tickFormatter?: (value: number | string) => string;
  domain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
}

/**
 * تكوين التلميح (Tooltip)
 */
export interface TooltipConfig {
  formatter?: (value: number, name: string) => [string, string];
  labelFormatter?: (label: string) => string;
}

/**
 * تكوين وسيلة الإيضاح (Legend)
 */
export interface LegendConfig {
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}
