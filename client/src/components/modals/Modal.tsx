/**
 * مكون النافذة المنبثقة الأساسية (Modal)
 * نافذة منبثقة قابلة للتخصيص مع دعم للأحجام المختلفة والهيدر والفوتر
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
import { ModalProps, MODAL_SIZE_CLASSES, ModalContextValue } from "./types";

/**
 * سياق النافذة المنبثقة للوصول إلى وظائف الإغلاق من المكونات الفرعية
 */
const ModalContext = React.createContext<ModalContextValue | null>(null);

/**
 * Hook للوصول إلى سياق النافذة المنبثقة
 */
export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a Modal component");
  }
  return context;
};

/**
 * مكون النافذة المنبثقة الأساسية
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="عنوان النافذة"
 *   description="وصف النافذة"
 *   size="md"
 * >
 *   <p>محتوى النافذة</p>
 * </Modal>
 * ```
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  size = "md",
  showCloseButton = true,
  preventOutsideClose = false,
  preventEscapeClose = false,
  header,
  footer,
}: ModalProps) {
  // إنشاء قيمة السياق
  const contextValue = React.useMemo<ModalContextValue>(
    () => ({
      close: () => onOpenChange(false),
      isOpen: open,
    }),
    [onOpenChange, open]
  );

  // معالجة النقر خارج النافذة
  const handleInteractOutside = React.useCallback(
    (e: Event) => {
      if (preventOutsideClose) {
        e.preventDefault();
      }
    },
    [preventOutsideClose]
  );

  // معالجة الضغط على Escape
  const handleEscapeKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (preventEscapeClose) {
        e.preventDefault();
      }
    },
    [preventEscapeClose]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "w-full max-w-[calc(100%-2rem)]",
            MODAL_SIZE_CLASSES[size],
            className
          )}
          showCloseButton={showCloseButton}
          onInteractOutside={handleInteractOutside}
          onEscapeKeyDown={handleEscapeKeyDown}
        >
          {/* الهيدر */}
          {(title || description || header) && (
            <DialogHeader>
              {header || (
                <>
                  {title && <DialogTitle>{title}</DialogTitle>}
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </>
              )}
            </DialogHeader>
          )}

          {/* المحتوى */}
          {children}

          {/* الفوتر */}
          {footer && <DialogFooter>{footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

/**
 * مكون هيدر النافذة المنبثقة
 */
export function ModalHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  );
}

/**
 * مكون عنوان النافذة المنبثقة
 */
export function ModalTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  );
}

/**
 * مكون وصف النافذة المنبثقة
 */
export function ModalDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  );
}

/**
 * مكون فوتر النافذة المنبثقة
 */
export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  );
}

/**
 * مكون محتوى النافذة المنبثقة
 */
export function ModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="modal-body"
      className={cn("flex-1 overflow-auto py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Modal;
