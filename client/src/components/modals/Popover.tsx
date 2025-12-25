/**
 * مكون النافذة المنبثقة الصغيرة (Popover)
 * نافذة منبثقة صغيرة تظهر بجانب عنصر معين
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Popover as PopoverPrimitive,
  PopoverContent as PopoverContentPrimitive,
  PopoverTrigger as PopoverTriggerPrimitive,
  PopoverAnchor,
} from "@/components/ui/popover";
import { PopoverProps, PopoverPlacement } from "./types";

/**
 * تحويل موضع Popover إلى خصائص Radix
 */
function getPlacementProps(placement: PopoverPlacement): {
  side: "top" | "bottom" | "left" | "right";
  align: "start" | "center" | "end";
} {
  const [side, align] = placement.split("-") as [
    "top" | "bottom" | "left" | "right",
    "start" | "center" | "end" | undefined
  ];
  return {
    side,
    align: align ?? "center",
  };
}

/**
 * مكون النافذة المنبثقة الصغيرة
 *
 * @example
 * ```tsx
 * // استخدام بسيط
 * <PopoverComponent
 *   trigger={<Button>افتح القائمة</Button>}
 *   placement="bottom-start"
 * >
 *   <div className="p-4">
 *     <p>محتوى النافذة المنبثقة</p>
 *   </div>
 * </PopoverComponent>
 *
 * // مع تحكم خارجي
 * const [open, setOpen] = useState(false);
 *
 * <PopoverComponent
 *   trigger={<Button>افتح</Button>}
 *   open={open}
 *   onOpenChange={setOpen}
 * >
 *   <div>...</div>
 * </PopoverComponent>
 * ```
 */
export function PopoverComponent({
  trigger,
  children,
  placement = "bottom",
  open,
  onOpenChange,
  className,
  offset = 4,
}: PopoverProps) {
  const { side, align } = getPlacementProps(placement);

  return (
    <PopoverPrimitive open={open} onOpenChange={onOpenChange}>
      <PopoverTriggerPrimitive asChild>{trigger}</PopoverTriggerPrimitive>
      <PopoverContentPrimitive
        side={side}
        align={align}
        sideOffset={offset}
        className={cn("w-auto min-w-[200px]", className)}
      >
        {children}
      </PopoverContentPrimitive>
    </PopoverPrimitive>
  );
}

/**
 * مكون محتوى النافذة المنبثقة مع هيدر
 */
export function PopoverHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="popover-header"
      className={cn("border-b px-3 py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * مكون عنوان النافذة المنبثقة
 */
export function PopoverTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      data-slot="popover-title"
      className={cn("font-medium leading-none", className)}
      {...props}
    >
      {children}
    </h4>
  );
}

/**
 * مكون وصف النافذة المنبثقة
 */
export function PopoverDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * مكون محتوى النافذة المنبثقة
 */
export function PopoverBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="popover-body"
      className={cn("p-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * مكون فوتر النافذة المنبثقة
 */
export function PopoverFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="popover-footer"
      className={cn("border-t px-3 py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Hook لإدارة حالة النافذة المنبثقة
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, toggle } = usePopover();
 *
 * <PopoverComponent
 *   trigger={<Button onClick={toggle}>افتح</Button>}
 *   open={isOpen}
 *   onOpenChange={(open) => !open && close()}
 * >
 *   <div>...</div>
 * </PopoverComponent>
 * ```
 */
export function usePopover() {
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

// إعادة تصدير المكونات الأساسية
export {
  PopoverPrimitive as PopoverRoot,
  PopoverTriggerPrimitive as PopoverTrigger,
  PopoverContentPrimitive as PopoverContent,
  PopoverAnchor,
};

export { PopoverComponent as Popover };
export default PopoverComponent;
