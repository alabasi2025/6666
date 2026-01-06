import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function OperationalReports() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>التقارير التشغيلية</CardTitle>
              <CardDescription>تقارير الأداء التشغيلي والإنتاجية</CardDescription>
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
