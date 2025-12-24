/**
 * @fileoverview مكون عرض حالة التحميل
 * @module components/shared/LoadingSpinner
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** حجم المؤشر */
  size?: "sm" | "md" | "lg" | "xl";
  /** نص التحميل */
  text?: string;
  /** عرض كامل الشاشة */
  fullScreen?: boolean;
  /** كلاسات إضافية */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function LoadingSpinner({
  size = "md",
  text = "جاري التحميل...",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * مكون تحميل للجداول
 */
export function TableLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text="جاري تحميل البيانات..." />
    </div>
  );
}

/**
 * مكون تحميل للبطاقات
 */
export function CardLoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" />
    </div>
  );
}

/**
 * مكون تحميل للأزرار
 */
export function ButtonLoadingSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}
