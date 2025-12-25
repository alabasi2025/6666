/**
 * مكون حوار التأكيد (ConfirmDialog)
 * نافذة منبثقة للتأكيد على إجراء معين مع أزرار تأكيد وإلغاء
 */

import * as React from "react";
import { cn } from "@/lib/utils";
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
import { buttonVariants } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { ConfirmDialogProps } from "./types";

/**
 * مكون حوار التأكيد
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="تأكيد الحذف"
 *   description="هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
 *   confirmText="حذف"
 *   cancelText="إلغاء"
 *   confirmVariant="destructive"
 *   onConfirm={handleDelete}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title = "تأكيد",
  description,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  onConfirm,
  onCancel,
  loading = false,
  confirmVariant = "default",
  icon,
  className,
}: ConfirmDialogProps) {
  // حالة التحميل الداخلية
  const [isLoading, setIsLoading] = React.useState(false);

  // الحالة الفعلية للتحميل
  const actualLoading = loading || isLoading;

  // معالجة التأكيد
  const handleConfirm = React.useCallback(async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in confirm action:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, onOpenChange]);

  // معالجة الإلغاء
  const handleCancel = React.useCallback(() => {
    if (actualLoading) return;
    onCancel?.();
    onOpenChange(false);
  }, [actualLoading, onCancel, onOpenChange]);

  // الأيقونة الافتراضية
  const defaultIcon =
    confirmVariant === "destructive" ? (
      <AlertTriangle className="size-6 text-destructive" />
    ) : null;

  const displayIcon = icon ?? defaultIcon;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={cn("sm:max-w-md", className)}>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {displayIcon && (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                {displayIcon}
              </div>
            )}
            <div className="flex-1 space-y-2">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription>{description}</AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={actualLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={actualLoading}
            className={cn(
              confirmVariant === "destructive" &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {actualLoading && <Loader2 className="size-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook لإدارة حالة حوار التأكيد
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, confirm } = useConfirmDialog();
 *
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={(open) => !open && close()}
 *   onConfirm={confirm}
 *   // ...
 * />
 * ```
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const open = React.useCallback(() => {
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  const confirm = React.useCallback(() => {
    setIsOpen(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  return {
    isOpen,
    open,
    close,
    confirm,
    setIsOpen,
  };
}

export default ConfirmDialog;
