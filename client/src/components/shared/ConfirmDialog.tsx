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
