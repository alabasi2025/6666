import * as React from "react";
import { cn } from "@/lib/utils";
import { TabsContent } from "@/components/ui/tabs";
import { TabPanelProps } from "./types";

/**
 * مكون لوحة علامة التبويب
 * يعرض محتوى علامة التبويب المحددة
 */
export function TabPanel({ value, children, className }: TabPanelProps) {
  return (
    <TabsContent
      data-slot="tab-panel"
      value={value}
      className={cn("mt-4", className)}
    >
      {children}
    </TabsContent>
  );
}

export default TabPanel;
