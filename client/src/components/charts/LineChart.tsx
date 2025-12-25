/**
 * LineChart - رسم بياني خطي للاتجاهات
 * يستخدم لعرض البيانات المتغيرة عبر الزمن أو الفئات
 */

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LineChartProps, DEFAULT_CHART_COLORS } from './types';
import { cn } from '@/lib/utils';

export function LineChart({
  data,
  series,
  className,
  height = 300,
  xAxisKey = 'name',
  curved = true,
  showDots = true,
  strokeWidth = 2,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center text-muted-foreground', className)}
        style={{ height }}
      >
        لا توجد بيانات للعرض
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-muted"
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
          )}
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          )}
          {series.map((s, index) => (
            <Line
              key={s.dataKey}
              type={curved ? 'monotone' : 'linear'}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length]}
              strokeWidth={s.strokeWidth || strokeWidth}
              dot={showDots}
              activeDot={{ r: 6, strokeWidth: 2 }}
              isAnimationActive={animate}
              animationDuration={1000}
              animationEasing="ease-in-out"
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
