import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { SidebarItemProps } from "./types";

/**
 * مكون عنصر الشريط الجانبي
 * يدعم الأيقونات، الشارات، والعناصر الفرعية
 */
export function SidebarItem({
  item,
  collapsed = false,
  level = 0,
  className,
}: SidebarItemProps) {
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else {
      item.onClick?.();
    }
  };

  const buttonContent = (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-10 px-3",
        item.active && "bg-accent text-accent-foreground",
        item.disabled && "opacity-50 cursor-not-allowed",
        collapsed && "justify-center px-2",
        className
      )}
      disabled={item.disabled}
      onClick={handleClick}
      asChild={!!item.href && !hasChildren}
    >
      {item.href && !hasChildren ? (
        <a href={item.href} className="flex items-center gap-3 w-full">
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                item.active && "text-primary"
              )}
            />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm">{item.label}</span>
              {item.badge !== undefined && (
                <Badge variant={item.badgeVariant || "secondary"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </a>
      ) : (
        <span className="flex items-center gap-3 w-full">
          {Icon && (
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                item.active && "text-primary"
              )}
            />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm">{item.label}</span>
              {item.badge !== undefined && !hasChildren && (
                <Badge variant={item.badgeVariant || "secondary"} className="ml-auto">
                  {item.badge}
                </Badge>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
              )}
            </>
          )}
        </span>
      )}
    </Button>
  );

  // إذا كان مطوياً، نعرض tooltip
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{item.label}</p>
          {item.badge !== undefined && (
            <Badge variant={item.badgeVariant || "secondary"} className="ml-2">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // إذا كان لديه عناصر فرعية
  if (hasChildren) {
    return (
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>{buttonContent}</CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 mr-3 border-r pr-3">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                collapsed={collapsed}
                level={level + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return buttonContent;
}

export default SidebarItem;
