/**
 * PieChart - رسم بياني دائري للنسب
 * يستخدم لعرض توزيع النسب المئوية
 */

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PieChartProps, DEFAULT_CHART_COLORS } from './types';
import { cn } from '@/lib/utils';

// دالة لحساب موضع التسمية
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (
  props: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
    value: number;
  },
  labelType: 'name' | 'value' | 'percent' | 'namePercent'
) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  let label = '';
  switch (labelType) {
    case 'name':
      label = name;
      break;
    case 'value':
      label = `${value}`;
      break;
    case 'percent':
      label = `${(percent * 100).toFixed(0)}%`;
      break;
    case 'namePercent':
      label = `${name}: ${(percent * 100).toFixed(0)}%`;
      break;
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {label}
    </text>
  );
};

export function PieChart({
  data,
  className,
  height = 300,
  dataKey = 'value',
  nameKey = 'name',
  colors = DEFAULT_CHART_COLORS,
  innerRadius = 0,
  outerRadius = 80,
  paddingAngle = 2,
  showLabels = false,
  labelType = 'percent',
  showLegend = true,
  showTooltip = true,
  animate = true,
}: PieChartProps) {
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
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? (props) => renderCustomizedLabel(props as any, labelType) : undefined}
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
    </div>
  );
}

export default PieChart;
