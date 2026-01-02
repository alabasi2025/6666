/**
 * مكون التلميح (Tooltip)
 * تلميح يظهر عند التمرير فوق عنصر معين
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { TooltipProps, TooltipPlacement } from "./types";

/**
 * مكون التلميح
 *
 * @example
 * ```tsx
 * // استخدام بسيط
 * <TooltipComponent content="هذا تلميح">
 *   <Button>مرر فوقي</Button>
 * </TooltipComponent>
 *
 * // مع موضع مخصص
 * <TooltipComponent content="تلميح من اليسار" placement="left">
 *   <Button>مرر فوقي</Button>
 * </TooltipComponent>
 *
 * // مع محتوى مخصص
 * <TooltipComponent
 *   content={
 *     <div className="flex items-center gap-2">
 *       <Icon />
 *       <span>تلميح مع أيقونة</span>
 *     </div>
 *   }
 * >
 *   <Button>مرر فوقي</Button>
 * </TooltipComponent>
 * ```
 */
export function TooltipComponent({
  children,
  content,
  placement = "top",
  className,
  delayDuration = 200,
  disabled = false,
}: TooltipProps) {
  // إذا كان التلميح معطلاً، أعد العنصر الفرعي فقط
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive>
        <TooltipTriggerPrimitive asChild>{children}</TooltipTriggerPrimitive>
        <TooltipContentPrimitive
          side={placement}
          className={cn(className)}
        >
          {content}
        </TooltipContentPrimitive>
      </TooltipPrimitive>
    </TooltipProvider>
  );
}

/**
 * مكون تلميح بسيط للنصوص
 *
 * @example
 * ```tsx
 * <SimpleTooltip text="هذا تلميح بسيط">
 *   <Button>مرر فوقي</Button>
 * </SimpleTooltip>
 * ```
 */
export function SimpleTooltip({
  children,
  text,
  placement = "top",
  disabled = false,
}: {
  children: React.ReactNode;
  text: string;
  placement?: TooltipPlacement;
  disabled?: boolean;
}) {
  return (
    <TooltipComponent
      content={text}
      placement={placement}
      disabled={disabled || !text}
    >
      {children}
    </TooltipComponent>
  );
}

/**
 * مكون تلميح مع اختصار لوحة المفاتيح
 *
 * @example
 * ```tsx
 * <KeyboardTooltip text="حفظ" shortcut="Ctrl+S">
 *   <Button>حفظ</Button>
 * </KeyboardTooltip>
 * ```
 */
export function KeyboardTooltip({
  children,
  text,
  shortcut,
  placement = "top",
}: {
  children: React.ReactNode;
  text: string;
  shortcut: string;
  placement?: TooltipPlacement;
}) {
  return (
    <TooltipComponent
      content={
        <div className="flex items-center gap-2">
          <span>{text}</span>
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
            {shortcut}
          </kbd>
        </div>
      }
      placement={placement}
    >
      {children}
    </TooltipComponent>
  );
}

/**
 * مكون تلميح للأيقونات
 *
 * @example
 * ```tsx
 * <IconTooltip text="إعدادات">
 *   <Button variant="ghost" size="icon">
 *     <SettingsIcon />
 *   </Button>
 * </IconTooltip>
 * ```
 */
export function IconTooltip({
  children,
  text,
  placement = "top",
}: {
  children: React.ReactNode;
  text: string;
  placement?: TooltipPlacement;
}) {
  return (
    <TooltipComponent content={text} placement={placement} delayDuration={100}>
      {children}
    </TooltipComponent>
  );
}

/**
 * مكون تلميح للنصوص المقتطعة
 * يظهر التلميح فقط إذا كان النص مقتطعاً
 *
 * @example
 * ```tsx
 * <TruncatedTooltip text="نص طويل جداً سيتم اقتطاعه">
 *   <span className="truncate w-20">{text}</span>
 * </TruncatedTooltip>
 * ```
 */
export function TruncatedTooltip({
  children,
  text,
  placement = "top",
}: {
  children: React.ReactNode;
  text: string;
  placement?: TooltipPlacement;
}) {
  const [isTruncated, setIsTruncated] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (element) {
      setIsTruncated(element.scrollWidth > element.clientWidth);
    }
  }, [text]);

  return (
    <TooltipComponent
      content={text}
      placement={placement}
      disabled={!isTruncated}
    >
      <div ref={ref} className="truncate">
        {children}
      </div>
    </TooltipComponent>
  );
}

/**
 * مكون تلميح مع تأخير مخصص
 *
 * @example
 * ```tsx
 * <DelayedTooltip text="تلميح مع تأخير" delay={500}>
 *   <Button>مرر فوقي</Button>
 * </DelayedTooltip>
 * ```
 */
export function DelayedTooltip({
  children,
  text,
  delay = 500,
  placement = "top",
}: {
  children: React.ReactNode;
  text: string;
  delay?: number;
  placement?: TooltipPlacement;
}) {
  return (
    <TooltipComponent
      content={text}
      placement={placement}
      delayDuration={delay}
    >
      {children}
    </TooltipComponent>
  );
}

// إعادة تصدير المكونات الأساسية
export {
  TooltipPrimitive as TooltipRoot,
  TooltipTriggerPrimitive as TooltipTrigger,
  TooltipContentPrimitive as TooltipContent,
  TooltipProvider,
};

export { TooltipComponent as Tooltip };
export default TooltipComponent;
