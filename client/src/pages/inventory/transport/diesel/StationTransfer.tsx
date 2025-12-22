import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Plus, ArrowLeftRight, Building2 } from "lucide-react";

export default function StationTransfer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نقل من محطة لمحطة</h1>
          <p className="text-muted-foreground">إدارة عمليات نقل الديزل بين المحطات</p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة عملية نقل
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العمليات</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات نشطة</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات مكتملة</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المحطات المشاركة</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل عمليات النقل بين المحطات</CardTitle>
          <CardDescription>جميع عمليات نقل الديزل من محطة إلى أخرى</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-medium">رقم العملية</th>
                  <th className="p-3 text-right font-medium">المحطة المصدر</th>
                  <th className="p-3 text-right font-medium">المحطة الهدف</th>
                  <th className="p-3 text-right font-medium">الكمية (لتر)</th>
                  <th className="p-3 text-right font-medium">التاريخ</th>
                  <th className="p-3 text-right font-medium">الحالة</th>
                  <th className="p-3 text-right font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    لا يوجد عمليات نقل مسجلة
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
