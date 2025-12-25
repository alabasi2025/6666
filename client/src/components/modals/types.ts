/**
 * أنواع TypeScript لمكونات النوافذ المنبثقة
 * Modal Components Types
 */

import * as React from "react";

/**
 * الأحجام المتاحة للنوافذ المنبثقة
 */
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * اتجاهات الدرج الجانبي
 */
export type DrawerDirection = "left" | "right" | "top" | "bottom";

/**
 * أنواع التنبيهات
 */
export type AlertType = "success" | "error" | "warning" | "info";

/**
 * موضع النافذة المنبثقة الصغيرة
 */
export type PopoverPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

/**
 * موضع التلميح
 */
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * الخصائص الأساسية المشتركة للنوافذ المنبثقة
 */
export interface BaseModalProps {
  /** حالة فتح/إغلاق النافذة */
  open: boolean;
  /** دالة تُستدعى عند تغيير حالة الفتح/الإغلاق */
  onOpenChange: (open: boolean) => void;
  /** العنوان الرئيسي */
  title?: string;
  /** الوصف أو النص التوضيحي */
  description?: string;
  /** المحتوى الداخلي */
  children?: React.ReactNode;
  /** فئات CSS إضافية */
  className?: string;
}

/**
 * خصائص النافذة المنبثقة الأساسية (Modal)
 */
export interface ModalProps extends BaseModalProps {
  /** حجم النافذة */
  size?: ModalSize;
  /** إظهار زر الإغلاق */
  showCloseButton?: boolean;
  /** منع الإغلاق عند النقر خارج النافذة */
  preventOutsideClose?: boolean;
  /** منع الإغلاق عند الضغط على Escape */
  preventEscapeClose?: boolean;
  /** محتوى الهيدر المخصص */
  header?: React.ReactNode;
  /** محتوى الفوتر المخصص */
  footer?: React.ReactNode;
}

/**
 * خصائص حوار التأكيد (ConfirmDialog)
 */
export interface ConfirmDialogProps extends Omit<BaseModalProps, "children"> {
  /** نص زر التأكيد */
  confirmText?: string;
  /** نص زر الإلغاء */
  cancelText?: string;
  /** دالة تُستدعى عند التأكيد */
  onConfirm: () => void | Promise<void>;
  /** دالة تُستدعى عند الإلغاء */
  onCancel?: () => void;
  /** حالة التحميل */
  loading?: boolean;
  /** نوع زر التأكيد (خطر أو عادي) */
  confirmVariant?: "default" | "destructive";
  /** أيقونة مخصصة */
  icon?: React.ReactNode;
}

/**
 * خصائص حوار التنبيه (AlertDialog)
 */
export interface AlertDialogProps extends Omit<BaseModalProps, "children"> {
  /** نوع التنبيه */
  type?: AlertType;
  /** نص زر الإغلاق */
  closeText?: string;
  /** دالة تُستدعى عند الإغلاق */
  onClose?: () => void;
  /** أيقونة مخصصة (تتجاوز الأيقونة الافتراضية للنوع) */
  icon?: React.ReactNode;
}

/**
 * خصائص نافذة النموذج (FormModal)
 */
export interface FormModalProps extends BaseModalProps {
  /** حجم النافذة */
  size?: ModalSize;
  /** نص زر الإرسال */
  submitText?: string;
  /** نص زر الإلغاء */
  cancelText?: string;
  /** دالة تُستدعى عند الإرسال */
  onSubmit: (e: React.FormEvent) => void | Promise<void>;
  /** دالة تُستدعى عند الإلغاء */
  onCancel?: () => void;
  /** حالة التحميل */
  loading?: boolean;
  /** تعطيل زر الإرسال */
  submitDisabled?: boolean;
  /** إظهار زر الإغلاق */
  showCloseButton?: boolean;
}

/**
 * خصائص الدرج الجانبي (Drawer)
 */
export interface DrawerProps extends BaseModalProps {
  /** اتجاه الدرج */
  direction?: DrawerDirection;
  /** إظهار زر الإغلاق */
  showCloseButton?: boolean;
  /** محتوى الهيدر المخصص */
  header?: React.ReactNode;
  /** محتوى الفوتر المخصص */
  footer?: React.ReactNode;
}

/**
 * خصائص النافذة المنبثقة الصغيرة (Popover)
 */
export interface PopoverProps {
  /** العنصر المُفعِّل */
  trigger: React.ReactNode;
  /** المحتوى */
  children: React.ReactNode;
  /** موضع النافذة */
  placement?: PopoverPlacement;
  /** حالة الفتح (للتحكم الخارجي) */
  open?: boolean;
  /** دالة تغيير حالة الفتح (للتحكم الخارجي) */
  onOpenChange?: (open: boolean) => void;
  /** فئات CSS إضافية */
  className?: string;
  /** المسافة من العنصر المُفعِّل */
  offset?: number;
}

/**
 * خصائص التلميح (Tooltip)
 */
export interface TooltipProps {
  /** العنصر المُفعِّل */
  children: React.ReactNode;
  /** محتوى التلميح */
  content: React.ReactNode;
  /** موضع التلميح */
  placement?: TooltipPlacement;
  /** فئات CSS إضافية */
  className?: string;
  /** تأخير الظهور بالميلي ثانية */
  delayDuration?: number;
  /** تعطيل التلميح */
  disabled?: boolean;
}

/**
 * خصائص سياق النافذة المنبثقة
 */
export interface ModalContextValue {
  /** إغلاق النافذة */
  close: () => void;
  /** حالة الفتح */
  isOpen: boolean;
}

/**
 * خريطة أحجام النوافذ المنبثقة
 */
export const MODAL_SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  full: "sm:max-w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-2rem)]",
};

/**
 * خريطة ألوان أنواع التنبيهات
 */
export const ALERT_TYPE_STYLES: Record<
  AlertType,
  { bg: string; text: string; border: string }
> = {
  success: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
};
