import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export default function Analytics() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <PieChart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>التحليلات</CardTitle>
              <CardDescription>تحليلات متقدمة ورسوم بيانية تفاعلية</CardDescription>
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
