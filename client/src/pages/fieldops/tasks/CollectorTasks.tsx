import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function CollectorTasks() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>مهام المتحصلين</CardTitle>
              <CardDescription>إدارة مهام التحصيل الميدانية</CardDescription>
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
