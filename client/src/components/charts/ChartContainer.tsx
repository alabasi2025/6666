/**
 * ChartContainer - حاوية عامة للرسوم البيانية
 * توفر إطاراً موحداً لجميع الرسوم البيانية مع دعم العنوان والتحميل والأخطاء
 */

import { ChartContainerProps } from './types';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  loading = false,
  error = null,
  height = 300,
  actions,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {/* رأس الحاوية */}
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between p-4 pb-2">
          <div>
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* محتوى الرسم البياني */}
      <div
        className="p-4 pt-2"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">جاري التحميل...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">{children}</div>
        )}
      </div>
    </div>
  );
}

export default ChartContainer;
