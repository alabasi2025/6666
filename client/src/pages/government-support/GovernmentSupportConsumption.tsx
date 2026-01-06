import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function GovernmentSupportConsumption() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>تتبع الاستهلاك</CardTitle>
              <CardDescription>متابعة استهلاك حصص الدعم الحكومي</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            هذه الصفحة قيد التطوير
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
