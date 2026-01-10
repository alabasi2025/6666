/**
 * معالج تجميع المكونات
 * Component Assembly Wizard
 */

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";

export default function ComponentAssemblyWizard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <Layers className="w-8 h-8" />
        معالج تجميع المكونات
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>سيتم التطوير قريباً</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

