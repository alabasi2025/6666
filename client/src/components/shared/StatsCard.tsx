/**
 * @fileoverview مكون بطاقة الإحصائيات
 * @module components/shared/StatsCard
 */

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  /** العنوان */
  title: string;
  /** القيمة */
  value: string | number;
  /** الأيقونة */
  icon: LucideIcon;
  /** الوصف أو التغيير */
  description?: string;
  /** اتجاه التغيير */
  trend?: "up" | "down" | "neutral";
  /** نسبة التغيير */
  trendValue?: string;
  /** لون الخلفية */
  bgColor?: string;
  /** لون النص */
  textColor?: string;
  /** لون التدرج */
  gradientColor?: string;
  /** كلاسات إضافية */
  className?: string;
}

const trendColors = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: "text-muted-foreground",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  bgColor = "bg-primary/10",
  textColor = "text-primary",
  gradientColor,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {gradientColor && (
        <div className={cn("h-1", gradientColor)} />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {(description || trendValue) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {trend && trendValue && (
                  <span className={trendColors[trend]}>
                    {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
                    {trendValue}
                  </span>
                )}
                {description}
              </p>
            )}
          </div>
          <div className={cn("p-3 rounded-full", bgColor)}>
            <Icon className={cn("h-6 w-6", textColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * شبكة بطاقات الإحصائيات
 */
export function StatsGrid({
  children,
  columns = 4,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
}) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns])}>
      {children}
    </div>
  );
}
