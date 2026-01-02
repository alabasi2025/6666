/**
 * مكون حوار التنبيه (AlertDialog)
 * نافذة منبثقة لعرض رسائل التنبيه بأنواع مختلفة (نجاح، خطأ، تحذير، معلومات)
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  LucideIcon,
} from "lucide-react";
import { AlertDialogProps, AlertType, ALERT_TYPE_STYLES } from "./types";

/**
 * خريطة الأيقونات حسب نوع التنبيه
 */
const ALERT_ICONS: Record<AlertType, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

/**
 * مكون حوار التنبيه
 *
 * @example
 * ```tsx
 * // تنبيه نجاح
 * <AlertDialogComponent
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   type="success"
 *   title="تم بنجاح"
 *   description="تم حفظ البيانات بنجاح."
 * />
 *
 * // تنبيه خطأ
 * <AlertDialogComponent
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   type="error"
 *   title="حدث خطأ"
 *   description="فشل في حفظ البيانات. يرجى المحاولة مرة أخرى."
 * />
 * ```
 */
export function AlertDialogComponent({
  open,
  onOpenChange,
  title,
  description,
  type = "info",
  closeText = "حسناً",
  onClose,
  icon,
  className,
}: AlertDialogProps) {
  // الحصول على الأيقونة والأنماط
  const IconComponent = ALERT_ICONS[type];
  const styles = ALERT_TYPE_STYLES[type];

  // معالجة الإغلاق
  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange(false);
  }, [onClose, onOpenChange]);

  // الأيقونة المعروضة
  const displayIcon = icon ?? <IconComponent className="size-6" />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", className)}
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex flex-col items-center gap-4 text-center">
            {/* الأيقونة */}
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                styles.bg,
                styles.text
              )}
            >
              {displayIcon}
            </div>

            {/* العنوان */}
            {title && (
              <DialogTitle className="text-xl">{title}</DialogTitle>
            )}

            {/* الوصف */}
            {description && (
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} className="min-w-[100px]">
            {closeText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook لإدارة حالة حوار التنبيه
 *
 * @example
 * ```tsx
 * const alert = useAlertDialog();
 *
 * // عرض تنبيه نجاح
 * alert.success("تم بنجاح", "تم حفظ البيانات بنجاح.");
 *
 * // عرض تنبيه خطأ
 * alert.error("حدث خطأ", "فشل في حفظ البيانات.");
 * ```
 */
export function useAlertDialog() {
  const [state, setState] = React.useState<{
    open: boolean;
    type: AlertType;
    title: string;
    description?: string;
  }>({
    open: false,
    type: "info",
    title: "",
    description: undefined,
  });

  const show = React.useCallback(
    (type: AlertType, title: string, description?: string) => {
      setState({ open: true, type, title, description });
    },
    []
  );

  const close = React.useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const success = React.useCallback(
    (title: string, description?: string) => {
      show("success", title, description);
    },
    [show]
  );

  const error = React.useCallback(
    (title: string, description?: string) => {
      show("error", title, description);
    },
    [show]
  );

  const warning = React.useCallback(
    (title: string, description?: string) => {
      show("warning", title, description);
    },
    [show]
  );

  const info = React.useCallback(
    (title: string, description?: string) => {
      show("info", title, description);
    },
    [show]
  );

  return {
    ...state,
    show,
    close,
    success,
    error,
    warning,
    info,
    onOpenChange: (open: boolean) => {
      if (!open) close();
    },
  };
}

/**
 * مكون تنبيه النجاح
 */
export function SuccessAlert(
  props: Omit<AlertDialogProps, "type">
) {
  return <AlertDialogComponent {...props} type="success" />;
}

/**
 * مكون تنبيه الخطأ
 */
export function ErrorAlert(
  props: Omit<AlertDialogProps, "type">
) {
  return <AlertDialogComponent {...props} type="error" />;
}

/**
 * مكون تنبيه التحذير
 */
export function WarningAlert(
  props: Omit<AlertDialogProps, "type">
) {
  return <AlertDialogComponent {...props} type="warning" />;
}

/**
 * مكون تنبيه المعلومات
 */
export function InfoAlert(
  props: Omit<AlertDialogProps, "type">
) {
  return <AlertDialogComponent {...props} type="info" />;
}

export { AlertDialogComponent as AlertDialog };
export default AlertDialogComponent;
