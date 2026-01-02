/**
 * AreaChart - رسم بياني مساحي
 * يستخدم لعرض البيانات المتراكمة أو الاتجاهات مع تأثير التعبئة
 */

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AreaChartProps, DEFAULT_CHART_COLORS } from './types';
import { cn } from '@/lib/utils';

export function AreaChart({
  data,
  series,
  className,
  height = 300,
  xAxisKey = 'name',
  curved = true,
  stacked = false,
  fillOpacity = 0.3,
  gradientFill = true,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  animate = true,
}: AreaChartProps) {
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
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          {/* تعريف التدرجات اللونية */}
          <defs>
            {series.map((s, index) => {
              const color = s.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
              return (
                <linearGradient
                  key={`gradient-${s.dataKey}`}
                  id={`gradient-${s.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              );
            })}
          </defs>

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
              iconType="square"
            />
          )}
          {series.map((s, index) => {
            const color = s.color || DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length];
            return (
              <Area
                key={s.dataKey}
                type={curved ? 'monotone' : 'linear'}
                dataKey={s.dataKey}
                name={s.name}
                stroke={color}
                strokeWidth={2}
                fill={gradientFill ? `url(#gradient-${s.dataKey})` : color}
                fillOpacity={gradientFill ? 1 : s.fillOpacity || fillOpacity}
                stackId={stacked ? 'stack' : undefined}
                isAnimationActive={animate}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AreaChart;
