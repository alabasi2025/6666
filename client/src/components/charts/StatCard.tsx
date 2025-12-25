/**
 * StatCard - بطاقة إحصائية مع أيقونة
 * تستخدم لعرض الإحصائيات الرئيسية مع دعم الاتجاه (صعود/هبوط)
 */

import { StatCardProps } from './types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  trend,
  className,
  loading = false,
  onClick,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm p-6',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          {/* المحتوى الرئيسي */}
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              {trend && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-medium',
                    trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(trend.value)}%
                  {trend.label && (
                    <span className="text-muted-foreground mr-1">
                      {trend.label}
                    </span>
                  )}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {/* الأيقونة */}
          {icon && (
            <div
              className={cn(
                'rounded-lg p-3',
                iconBgColor
              )}
            >
              <div className={cn('h-5 w-5', iconColor)}>{icon}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StatCard;
