/**
 * معالج الترحيل إلى IoT
 * IoT Migration Wizard
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wifi } from "lucide-react";

export default function IoTMigrationWizard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Wifi className="w-8 h-8" />
        معالج الترحيل إلى IoT
      </h1>
      <p className="text-muted-foreground mb-8">
        ترحيل عداد تقليدي إلى عداد IoT ذكي
      </p>
      <Card>
        <CardHeader>
          <CardTitle>سيتم التطوير قريباً</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            معالج متعدد الخطوات لترحيل العملاء من العدادات التقليدية إلى عدادات IoT الذكية
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

