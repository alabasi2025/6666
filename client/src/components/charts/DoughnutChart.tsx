/**
 * DoughnutChart - رسم بياني حلقي
 * مشابه للرسم الدائري لكن مع فراغ في المنتصف لعرض قيمة مركزية
 */

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DoughnutChartProps, DEFAULT_CHART_COLORS } from './types';
import { cn } from '@/lib/utils';

export function DoughnutChart({
  data,
  className,
  height = 300,
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_CHART_COLORS,
  innerRadius = 60,
  outerRadius = 80,
  paddingAngle = 2,
  showLabels = false,
  labelType = 'percent',
  showLegend = true,
  showTooltip = true,
  animate = true,
  centerLabel,
  centerValue,
}: DoughnutChartProps) {
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
    <div className={cn('w-full relative', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            dataKey={dataKey}
            nameKey={nameKey}
            isAnimationActive={animate}
            animationDuration={1000}
            animationEasing="ease-in-out"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()}`,
                name,
              ]}
            />
          )}
          {showLegend && (
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* النص المركزي */}
      {(centerLabel || centerValue) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: showLegend ? '40px' : '0' }}
        >
          {centerValue !== undefined && (
            <span className="text-2xl font-bold text-foreground">
              {typeof centerValue === 'number'
                ? centerValue.toLocaleString()
                : centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-sm text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

export default DoughnutChart;
