import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tabs as TabsUI,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { TabsNavProps } from "./types";

/**
 * مكون علامات التبويب
 * يدعم أنماط متعددة واتجاهات مختلفة
 */
export function TabsNav({
  tabs,
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  variant = "default",
  className,
}: TabsNavProps) {
  const initialValue = defaultValue || tabs[0]?.value;

  return (
    <TabsUI
      data-slot="tabs-nav"
      value={value}
      defaultValue={initialValue}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn(
        orientation === "vertical" && "flex gap-4",
        className
      )}
    >
      <TabsList
        className={cn(
          // أنماط مختلفة
          variant === "outline" && "bg-transparent border rounded-lg p-1",
          variant === "pills" && "bg-transparent gap-2",
          // الاتجاه العمودي
          orientation === "vertical" && "flex-col h-auto items-stretch"
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
              className={cn(
                "gap-2",
                // أنماط مختلفة
                variant === "outline" &&
                  "data-[state=active]:border data-[state=active]:border-primary data-[state=active]:bg-primary/10",
                variant === "pills" &&
                  "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                // الاتجاه العمودي
                orientation === "vertical" && "justify-start w-full"
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* محتوى التبويبات */}
      <div className={cn(orientation === "vertical" && "flex-1")}>
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            className={cn(orientation === "vertical" && "mt-0")}
          >
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </TabsUI>
  );
}

export default TabsNav;
