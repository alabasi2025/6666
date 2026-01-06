import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function TrialBalanceReport() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>ميزان المراجعة</CardTitle>
              <CardDescription>تقرير ميزان المراجعة الشامل</CardDescription>
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
