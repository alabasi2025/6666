import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Fuel, 
  Truck, 
  Package, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2
} from "lucide-react";

export default function DieselDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة تحكم الديزل</h1>
        <p className="text-muted-foreground">نظرة عامة على إدارة الديزل في جميع المحطات</p>
      </div>

      {/* إحصائيات عامة */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المخزون</CardTitle>
            <Fuel className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 لتر</div>
            <p className="text-xs text-muted-foreground">في جميع المحطات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات الاستلام اليوم</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">عملية استلام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستهلاك اليومي</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 لتر</div>
            <p className="text-xs text-muted-foreground">متوسط الاستهلاك</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">محطة تحتاج تزويد</p>
          </CardContent>
        </Card>
      </div>

      {/* حالة العمليات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات قيد التنفيذ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عمليات مكتملة اليوم</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوايتات النشطة</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* الأصول */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>حالة الخزانات</CardTitle>
            <CardDescription>ملخص حالة خزانات الديزل في جميع المحطات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">إجمالي الخزانات</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">خزانات ممتلئة</span>
                <span className="font-bold text-green-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">خزانات متوسطة</span>
                <span className="font-bold text-yellow-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">خزانات منخفضة</span>
                <span className="font-bold text-red-500">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>حالة المحطات</CardTitle>
            <CardDescription>توزيع الديزل على المحطات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">إجمالي المحطات</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">محطات مكتفية</span>
                <span className="font-bold text-green-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">محطات تحتاج تزويد</span>
                <span className="font-bold text-orange-500">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">محطات حرجة</span>
                <span className="font-bold text-red-500">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* آخر العمليات */}
      <Card>
        <CardHeader>
          <CardTitle>آخر عمليات الاستلام</CardTitle>
          <CardDescription>أحدث عمليات استلام الديزل في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-right font-medium">المحطة</th>
                  <th className="p-3 text-right font-medium">الكمية</th>
                  <th className="p-3 text-right font-medium">المورد</th>
                  <th className="p-3 text-right font-medium">التاريخ</th>
                  <th className="p-3 text-right font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    لا يوجد عمليات استلام مسجلة
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
