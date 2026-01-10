import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "تتبع الاستهلاك",
  description: "تتبع استهلاك الدعم للعملاء في نظام الدعم الحكومي.",
  process: `1) عرض سجل الاستهلاك:
   - الاستهلاك المدعوم وغير المدعوم
   - مبلغ الدعم المقدم
   - الحصص المستخدمة والمتبقية

2) تتبع الاستهلاك:
   - عرض الاستهلاك حسب الفترة
   - تحليل اتجاهات الاستهلاك
   - مراقبة الحصص المتبقية`,
  mechanism: `- استعلامات tRPC لتتبع الاستهلاك
- عرض البيانات في جدول مع إحصائيات
- فلترة حسب الفترة والعميل`,
  relatedScreens: [
    { name: "لوحة التحكم", path: "/dashboard/government-support/dashboard", description: "ملخص نظام الدعم الحكومي" },
    { name: "بيانات الدعم", path: "/dashboard/government-support/customers", description: "إدارة بيانات الدعم" },
  ],
  businessLogic: "تتبع شامل لاستهلاك الدعم مع تحليل الاتجاهات والمراقبة.",
};

export default function GovernmentSupportConsumption() {
  const [location] = useLocation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const businessId = 1;

  const { data, isLoading, refetch } = trpc.governmentSupport.consumption.getHistory.useQuery({
    businessId,
    year,
    month,
    customerId,
    page,
    limit: 20,
  });

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            تتبع الاستهلاك
          </h1>
          <p className="text-muted-foreground mt-2">
            تتبع استهلاك الدعم للعملاء في نظام الدعم الحكومي
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>السنة</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
            <div>
              <Label>الشهر</Label>
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>رقم العميل (اختياري)</Label>
              <Input
                type="number"
                value={customerId || ""}
                onChange={(e) => setCustomerId(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="جميع العملاء"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} variant="outline" className="w-full">
                تحديث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الاستهلاك</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.reduce((sum: number, item: any) => sum + parseFloat(item.total_consumption || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستهلاك المدعوم</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.reduce((sum: number, item: any) => sum + parseFloat(item.supported_consumption || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستهلاك غير المدعوم</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.reduce((sum: number, item: any) => sum + parseFloat(item.unsupported_consumption || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ الدعم</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.reduce((sum: number, item: any) => sum + parseFloat(item.support_amount || 0), 0).toLocaleString() || 0} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الاستهلاك</CardTitle>
          <CardDescription>عرض تفاصيل استهلاك الدعم</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : data && data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>إجمالي الاستهلاك</TableHead>
                    <TableHead>مدعوم</TableHead>
                    <TableHead>غير مدعوم</TableHead>
                    <TableHead>مبلغ الدعم</TableHead>
                    <TableHead>الحصة المستخدمة</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {item.customer_name || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {item.year}/{item.month}
                        </div>
                      </TableCell>
                      <TableCell>{parseFloat(item.total_consumption || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500">
                          {parseFloat(item.supported_consumption || 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {parseFloat(item.unsupported_consumption || 0).toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-blue-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          {parseFloat(item.support_amount || 0).toLocaleString()} ر.س
                        </div>
                      </TableCell>
                      <TableCell>{parseFloat(item.quota_used || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={item.status === "calculated" ? "default" : "secondary"}>
                          {item.status === "calculated" ? "محسوب" : item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

