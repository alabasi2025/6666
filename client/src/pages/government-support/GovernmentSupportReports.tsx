import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import {
  Shield,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  BarChart3,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "التقارير",
  description: "تقارير صندوق الدعم الحكومي.",
  process: `1) اختيار نوع التقرير:
   - التقرير الشهري
   - تقرير صندوق الدعم
   - تقارير حسب الفئة
   - تقارير حسب المنطقة

2) عرض التقرير:
   - البيانات المالية
   - الإحصائيات
   - إمكانية التصدير`,
  mechanism: `- استعلامات tRPC للتقارير
- عرض البيانات في جداول
- إمكانية التصدير`,
  relatedScreens: [
    { name: "لوحة التحكم", path: "/dashboard/government-support/dashboard", description: "ملخص نظام الدعم الحكومي" },
    { name: "بيانات الدعم", path: "/dashboard/government-support/customers", description: "إدارة بيانات الدعم" },
  ],
  businessLogic: "تقارير شاملة لصندوق الدعم الحكومي مع تحليل البيانات.",
};

export default function GovernmentSupportReports() {
  const [location] = useLocation();
  const [reportType, setReportType] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const businessId = 1;

  const { data: monthlyReport, isLoading: monthlyLoading } = trpc.governmentSupport.reports.getMonthlyReport.useQuery({
    businessId,
    year,
    month,
  }, { enabled: reportType === "monthly" });

  const { data: fundReport, isLoading: fundLoading } = trpc.governmentSupport.reports.getFundReport.useQuery({
    businessId,
    startDate,
    endDate,
  }, { enabled: reportType === "fund" });

  const pageInfo = resolvePageInfo(location);
  const isLoading = monthlyLoading || fundLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            التقارير
          </h1>
          <p className="text-muted-foreground mt-2">
            تقارير صندوق الدعم الحكومي
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>معايير التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>نوع التقرير</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">التقرير الشهري</SelectItem>
                  <SelectItem value="fund">تقرير الصندوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === "monthly" && (
              <>
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
              </>
            )}
            {reportType === "fund" && (
              <>
                <div>
                  <Label>من تاريخ</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="flex items-end">
              <Button onClick={() => {}} variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Report */}
      {reportType === "monthly" && monthlyReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{monthlyReport.total_customers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {monthlyReport.active_customers || 0} نشط
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الاستهلاك</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {parseFloat(monthlyReport.total_consumption || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">كيلووات/متر مكعب</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">الاستهلاك المدعوم</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {parseFloat(monthlyReport.supported_consumption || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">كيلووات/متر مكعب</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مبلغ الدعم</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {parseFloat(monthlyReport.total_support_amount || 0).toLocaleString()} ر.س
                </div>
                <p className="text-xs text-muted-foreground">للشهر الحالي</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>التقرير الشهري</CardTitle>
              <CardDescription>
                تقرير شامل لشهر {month}/{year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي العملاء المدعومين</p>
                    <p className="text-2xl font-bold">{monthlyReport.total_customers || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">العملاء النشطين</p>
                    <p className="text-2xl font-bold text-green-600">{monthlyReport.active_customers || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الاستهلاك</p>
                    <p className="text-2xl font-bold">{parseFloat(monthlyReport.total_consumption || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الاستهلاك المدعوم</p>
                    <p className="text-2xl font-bold text-green-600">
                      {parseFloat(monthlyReport.supported_consumption || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ الدعم</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {parseFloat(monthlyReport.total_support_amount || 0).toLocaleString()} ر.س
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Fund Report */}
      {reportType === "fund" && fundReport && (
        <Card>
          <CardHeader>
            <CardTitle>تقرير صندوق الدعم</CardTitle>
            <CardDescription>
              من {new Date(startDate).toLocaleDateString("ar-SA")} إلى {new Date(endDate).toLocaleDateString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الميزانية</p>
                <p className="text-2xl font-bold">{parseFloat(fundReport.totalBudget || 0).toLocaleString()} ر.س</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستخدم</p>
                <p className="text-2xl font-bold text-red-600">{parseFloat(fundReport.usedBudget || 0).toLocaleString()} ر.س</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-2xl font-bold text-green-600">{parseFloat(fundReport.remainingBudget || 0).toLocaleString()} ر.س</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نسبة الاستخدام</p>
                <p className="text-2xl font-bold">
                  {parseFloat(fundReport.utilization || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">جاري التحميل...</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

