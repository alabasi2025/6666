/**
 * معالج الفحص والقبول
 * Inspection & Acceptance Wizard
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function InspectionWizard() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <ClipboardCheck className="w-8 h-8" />
        معالج الفحص والقبول
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>سيتم التطوير قريباً</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

