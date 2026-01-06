import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function GovernmentSupportCustomers() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>بيانات الدعم</CardTitle>
              <CardDescription>إدارة بيانات المستفيدين من الدعم الحكومي</CardDescription>
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
