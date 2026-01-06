import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function GovernmentSupportQuotas() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>الحصص</CardTitle>
              <CardDescription>إدارة حصص الدعم الحكومي الشهرية</CardDescription>
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
