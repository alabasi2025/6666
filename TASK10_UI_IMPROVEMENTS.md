# 📋 المهمة 10: تحسينات واجهة المستخدم (UI Components)

## 🎯 الهدف
إنشاء مكونات UI مشتركة وقابلة لإعادة الاستخدام لتحسين تجربة المستخدم وتوحيد التصميم.

---

## 📁 الفرع
```
feature/task10-ui-improvements
```

---

## ✅ الملفات المسموح إنشاؤها (فقط)
```
client/src/components/shared/LoadingSpinner.tsx (جديد)
client/src/components/shared/EmptyState.tsx (جديد)
client/src/components/shared/ErrorBoundary.tsx (جديد)
client/src/components/shared/ConfirmDialog.tsx (جديد)
client/src/components/shared/DataTable.tsx (جديد)
client/src/components/shared/StatsCard.tsx (جديد)
client/src/components/shared/index.ts (جديد)
```

---

## 🚫 الملفات الممنوع تعديلها
```
❌ drizzle/schema.ts
❌ server/**/*
❌ client/src/pages/**/*
❌ docs/**/*
```

---

## 📝 الخطوات التفصيلية

### الخطوة 1: استنساخ المستودع والانتقال للفرع
```bash
gh repo clone alabasi2025/6666
cd 6666
git checkout feature/task10-ui-improvements
git pull origin feature/task10-ui-improvements
mkdir -p client/src/components/shared
```

### الخطوة 2: إنشاء مكون التحميل

**الملف:** `client/src/components/shared/LoadingSpinner.tsx`

```tsx
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
```

### الخطوة 3: إنشاء مكون الحالة الفارغة

**الملف:** `client/src/components/shared/EmptyState.tsx`

```tsx
/**
 * @fileoverview مكون عرض الحالة الفارغة
 * @module components/shared/EmptyState
 */

import { LucideIcon, FileX, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  /** أيقونة مخصصة */
  icon?: LucideIcon;
  /** العنوان */
  title: string;
  /** الوصف */
  description?: string;
  /** نص زر الإجراء */
  actionLabel?: string;
  /** دالة الإجراء */
  onAction?: () => void;
  /** نوع الحالة الفارغة */
  type?: "no-data" | "no-results" | "error";
  /** كلاسات إضافية */
  className?: string;
}

const defaultIcons: Record<string, LucideIcon> = {
  "no-data": FileX,
  "no-results": Search,
  "error": FileX,
};

const defaultTitles: Record<string, string> = {
  "no-data": "لا توجد بيانات",
  "no-results": "لا توجد نتائج",
  "error": "حدث خطأ",
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  type = "no-data",
  className,
}: EmptyStateProps) {
  const Icon = icon || defaultIcons[type];
  const displayTitle = title || defaultTitles[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="h-4 w-4 ml-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * حالة فارغة للجداول
 */
export function TableEmptyState({
  title = "لا توجد بيانات",
  description,
  actionLabel,
  onAction,
}: Omit<EmptyStateProps, "type">) {
  return (
    <EmptyState
      type="no-data"
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
    />
  );
}

/**
 * حالة لا توجد نتائج بحث
 */
export function NoSearchResults({
  searchTerm,
  onClear,
}: {
  searchTerm: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      type="no-results"
      title="لا توجد نتائج"
      description={`لم يتم العثور على نتائج لـ "${searchTerm}"`}
      actionLabel={onClear ? "مسح البحث" : undefined}
      onAction={onClear}
    />
  );
}
```

### الخطوة 4: إنشاء مكون معالجة الأخطاء

**الملف:** `client/src/components/shared/ErrorBoundary.tsx`

```tsx
/**
 * @fileoverview مكون معالجة الأخطاء
 * @module components/shared/ErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 rounded-full bg-destructive/10 p-3 w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle>حدث خطأ غير متوقع</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                نعتذر، حدث خطأ أثناء تحميل هذا المحتوى. يرجى المحاولة مرة أخرى.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="mt-4 p-4 bg-muted rounded-lg text-xs text-right overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              <Button onClick={this.handleRetry}>
                <RefreshCw className="h-4 w-4 ml-2" />
                إعادة المحاولة
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * مكون عرض خطأ API
 */
export function ApiError({
  message = "حدث خطأ أثناء تحميل البيانات",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">خطأ</h3>
      <p className="text-muted-foreground max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 ml-2" />
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
```

### الخطوة 5: إنشاء مكون تأكيد الحذف

**الملف:** `client/src/components/shared/ConfirmDialog.tsx`

```tsx
/**
 * @fileoverview مكون حوار التأكيد
 * @module components/shared/ConfirmDialog
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonLoadingSpinner } from "./LoadingSpinner";

interface ConfirmDialogProps {
  /** حالة الفتح */
  open: boolean;
  /** دالة الإغلاق */
  onOpenChange: (open: boolean) => void;
  /** العنوان */
  title: string;
  /** الوصف */
  description: string;
  /** نص زر التأكيد */
  confirmLabel?: string;
  /** نص زر الإلغاء */
  cancelLabel?: string;
  /** دالة التأكيد */
  onConfirm: () => void;
  /** حالة التحميل */
  isLoading?: boolean;
  /** نوع الحوار */
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  onConfirm,
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading ? (
              <>
                <ButtonLoadingSpinner className="ml-2" />
                جاري التنفيذ...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * حوار تأكيد الحذف
 */
export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تأكيد الحذف"
      description={`هل أنت متأكد من حذف "${itemName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      confirmLabel="حذف"
      onConfirm={onConfirm}
      isLoading={isLoading}
      variant="destructive"
    />
  );
}
```

### الخطوة 6: إنشاء مكون بطاقة الإحصائيات

**الملف:** `client/src/components/shared/StatsCard.tsx`

```tsx
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
```

### الخطوة 7: إنشاء ملف التصدير

**الملف:** `client/src/components/shared/index.ts`

```typescript
/**
 * @fileoverview تصدير جميع المكونات المشتركة
 * @module components/shared
 */

export * from "./LoadingSpinner";
export * from "./EmptyState";
export * from "./ErrorBoundary";
export * from "./ConfirmDialog";
export * from "./StatsCard";
```

### الخطوة 8: التحقق والرفع
```bash
npx tsc --noEmit
git add client/src/components/shared/
git commit -m "feat(ui): إضافة مكونات UI مشتركة قابلة لإعادة الاستخدام"
git push origin feature/task10-ui-improvements
```

---

## 📊 معايير القبول

| المعيار | الحالة |
|:---|:---:|
| LoadingSpinner.tsx مكتمل | ⬜ |
| EmptyState.tsx مكتمل | ⬜ |
| ErrorBoundary.tsx مكتمل | ⬜ |
| ConfirmDialog.tsx مكتمل | ⬜ |
| StatsCard.tsx مكتمل | ⬜ |
| index.ts للتصدير | ⬜ |
| نصوص عربية | ⬜ |
| تعليقات JSDoc | ⬜ |
| لا أخطاء TypeScript | ⬜ |

---

## ⏱️ الوقت المتوقع
3-4 ساعات

---

## 📞 عند الانتهاء
أخبر المنسق بأن المهمة 10 جاهزة للدمج.
