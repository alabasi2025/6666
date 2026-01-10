/**
 * معالج تسوية عملية ميدانية
 * Field Operation Settlement Wizard
 */

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

export default function FieldSettlementWizard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FileCheck className="w-8 h-8" />
        معالج التسوية الميدانية
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>سيتم التطوير قريباً</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

