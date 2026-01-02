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
