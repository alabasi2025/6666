import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { SidebarProps } from "./types";
import { SidebarItem } from "./SidebarItem";

/**
 * مكون الشريط الجانبي
 * يدعم الطي، العناصر المتداخلة، والتخصيص الكامل
 */
export function Sidebar({
  items,
  collapsed = false,
  onCollapsedChange,
  collapsible = true,
  width = 280,
  collapsedWidth = 64,
  header,
  footer,
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  React.useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-slot="custom-sidebar"
        data-collapsed={isCollapsed}
        className={cn(
          "flex flex-col h-full bg-background border-l transition-all duration-300 ease-in-out",
          className
        )}
        style={{ width: currentWidth }}
      >
        {/* الرأس */}
        <div className="flex items-center h-16 px-3 border-b shrink-0">
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleToggle}
              aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          )}
          {!isCollapsed && header && (
            <div className="flex-1 mr-3 overflow-hidden">{header}</div>
          )}
        </div>

        {/* المحتوى */}
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {items.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                collapsed={isCollapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* التذييل */}
        {footer && (
          <div
            className={cn(
              "border-t p-3 shrink-0",
              isCollapsed && "flex justify-center"
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}

export default Sidebar;
