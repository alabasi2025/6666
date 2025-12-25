/**
 * مكون الدرج الجانبي (Drawer)
 * درج جانبي قابل للسحب من أي اتجاه (يمين، يسار، أعلى، أسفل)
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Drawer as DrawerPrimitive,
  DrawerContent as DrawerContentPrimitive,
  DrawerHeader as DrawerHeaderPrimitive,
  DrawerFooter as DrawerFooterPrimitive,
  DrawerTitle as DrawerTitlePrimitive,
  DrawerDescription as DrawerDescriptionPrimitive,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DrawerProps, DrawerDirection } from "./types";

/**
 * خريطة فئات CSS حسب الاتجاه
 */
const DIRECTION_CLASSES: Record<DrawerDirection, string> = {
  left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r",
  right: "inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l",
  top: "inset-x-0 top-0 w-full border-b",
  bottom: "inset-x-0 bottom-0 w-full border-t",
};

/**
 * مكون الدرج الجانبي
 *
 * @example
 * ```tsx
 * // درج من اليمين
 * <Drawer
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   direction="right"
 *   title="تفاصيل المريض"
 *   description="عرض وتعديل بيانات المريض"
 * >
 *   <div className="p-4">
 *     <p>محتوى الدرج</p>
 *   </div>
 * </Drawer>
 *
 * // درج من اليسار
 * <Drawer
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   direction="left"
 *   title="القائمة الجانبية"
 * >
 *   <nav>...</nav>
 * </Drawer>
 * ```
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  direction = "right",
  showCloseButton = true,
  header,
  footer,
}: DrawerProps) {
  return (
    <DrawerPrimitive open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContentPrimitive
        className={cn(
          "fixed z-50 flex flex-col bg-background",
          DIRECTION_CLASSES[direction],
          className
        )}
      >
        {/* زر الإغلاق */}
        {showCloseButton && (
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 size-8 rounded-full"
            >
              <X className="size-4" />
              <span className="sr-only">إغلاق</span>
            </Button>
          </DrawerClose>
        )}

        {/* الهيدر */}
        {(title || description || header) && (
          <DrawerHeaderPrimitive className="border-b px-6 py-4">
            {header || (
              <>
                {title && (
                  <DrawerTitlePrimitive className="text-lg font-semibold">
                    {title}
                  </DrawerTitlePrimitive>
                )}
                {description && (
                  <DrawerDescriptionPrimitive className="text-sm text-muted-foreground">
                    {description}
                  </DrawerDescriptionPrimitive>
                )}
              </>
            )}
          </DrawerHeaderPrimitive>
        )}

        {/* المحتوى */}
        <div className="flex-1 overflow-auto">{children}</div>

        {/* الفوتر */}
        {footer && (
          <DrawerFooterPrimitive className="border-t px-6 py-4">
            {footer}
          </DrawerFooterPrimitive>
        )}
      </DrawerContentPrimitive>
    </DrawerPrimitive>
  );
}

/**
 * مكون هيدر الدرج
 */
export function DrawerHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DrawerHeaderPrimitive
      className={cn("border-b px-6 py-4", className)}
      {...props}
    >
      {children}
    </DrawerHeaderPrimitive>
  );
}

/**
 * مكون عنوان الدرج
 */
export function DrawerTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DrawerTitlePrimitive
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </DrawerTitlePrimitive>
  );
}

/**
 * مكون وصف الدرج
 */
export function DrawerDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DrawerDescriptionPrimitive
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </DrawerDescriptionPrimitive>
  );
}

/**
 * مكون محتوى الدرج
 */
export function DrawerBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="drawer-body"
      className={cn("flex-1 overflow-auto p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * مكون فوتر الدرج
 */
export function DrawerFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DrawerFooterPrimitive
      className={cn("border-t px-6 py-4", className)}
      {...props}
    >
      {children}
    </DrawerFooterPrimitive>
  );
}

/**
 * Hook لإدارة حالة الدرج
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = useDrawer();
 *
 * <Button onClick={open}>فتح الدرج</Button>
 *
 * <Drawer
 *   open={isOpen}
 *   onOpenChange={(open) => !open && close()}
 *   // ...
 * />
 * ```
 */
export function useDrawer() {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}

export default Drawer;
