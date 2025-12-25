import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Breadcrumb as BreadcrumbUI,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, Home } from "lucide-react";
import { BreadcrumbNavProps, BreadcrumbItemType } from "./types";

/**
 * مكون مسار التنقل
 * يعرض مسار التنقل الحالي مع دعم الاختصار
 */
export function BreadcrumbNav({
  items,
  separator,
  maxItems = 4,
  className,
}: BreadcrumbNavProps) {
  // إذا كان عدد العناصر أكبر من الحد الأقصى، نختصرها
  const shouldCollapse = items.length > maxItems;
  
  let visibleItems: BreadcrumbItemType[] = items;
  let collapsedItems: BreadcrumbItemType[] = [];

  if (shouldCollapse) {
    // نعرض العنصر الأول والأخيرين، ونخفي الباقي
    const firstItem = items[0];
    const lastItems = items.slice(-2);
    collapsedItems = items.slice(1, -2);
    visibleItems = [firstItem, ...lastItems];
  }

  const renderSeparator = () => {
    if (separator) {
      return (
        <BreadcrumbSeparator>
          {separator}
        </BreadcrumbSeparator>
      );
    }
    return <BreadcrumbSeparator><ChevronLeft className="h-3.5 w-3.5" /></BreadcrumbSeparator>;
  };

  return (
    <BreadcrumbUI data-slot="breadcrumb-nav" className={cn(className)}>
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === visibleItems.length - 1;
          const Icon = item.icon;
          const showEllipsis = shouldCollapse && index === 0;

          return (
            <React.Fragment key={item.id}>
              <BreadcrumbItem>
                {isLast ? (
                  // العنصر الأخير (الصفحة الحالية)
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  // عناصر الروابط
                  <BreadcrumbLink
                    href={item.href}
                    onClick={item.onClick}
                    className="flex items-center gap-1.5"
                  >
                    {isFirst && !Icon && <Home className="h-3.5 w-3.5" />}
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* عرض العناصر المخفية */}
              {showEllipsis && collapsedItems.length > 0 && (
                <>
                  {renderSeparator()}
                  <BreadcrumbItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center gap-1">
                        <BreadcrumbEllipsis />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {collapsedItems.map((collapsedItem) => (
                          <DropdownMenuItem
                            key={collapsedItem.id}
                            onClick={collapsedItem.onClick}
                            asChild={!!collapsedItem.href}
                          >
                            {collapsedItem.href ? (
                              <a
                                href={collapsedItem.href}
                                className="flex items-center gap-2"
                              >
                                {collapsedItem.icon && (
                                  <collapsedItem.icon className="h-4 w-4" />
                                )}
                                {collapsedItem.label}
                              </a>
                            ) : (
                              <span className="flex items-center gap-2">
                                {collapsedItem.icon && (
                                  <collapsedItem.icon className="h-4 w-4" />
                                )}
                                {collapsedItem.label}
                              </span>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </BreadcrumbItem>
                </>
              )}

              {!isLast && renderSeparator()}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbUI>
  );
}

export default BreadcrumbNav;
