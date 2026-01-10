import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Download, Loader2, TrendingUp, DollarSign, Users, Zap } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "التحليلات",
  description: "تحليلات شاملة للبيانات.",
  process: `1) اختيار نوع التحليل:
   - تحليل الإيرادات
   - تحليل الأداء
   - تحليل الاتجاهات

2) عرض التحليل:
   - المؤشرات الرئيسية
   - الإحصائيات
   - إمكانية التصدير`,
  mechanism: `- استعلامات tRPC للتحليلات
- عرض البيانات في رسوم بيانية
- إمكانية التصدير`,
  relatedScreens: [
    { name: "التقارير المالية", path: "/dashboard/reports/financial", description: "التقارير المالية" },
    { name: "التقارير التشغيلية", path: "/dashboard/reports/operational", description: "التقارير التشغيلية" },
  ],
  businessLogic: "تحليلات شاملة للبيانات مع رسوم بيانية.",
};

export default function ReportsAnalytics() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  const [analysisType, setAnalysisType] = useState("revenue");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: revenueData, isLoading: isLoadingRevenue } = trpc.reports.revenue.detailed.useQuery(
    {
      businessId,
      startDate,
      endDate,
      groupBy: "month",
    },
    { enabled: analysisType === "revenue" }
  );

  const { data: profitLoss, isLoading: isLoadingProfitLoss } = trpc.reports.revenue.profitLoss.useQuery(
    {
      businessId,
      startDate,
      endDate,
    },
    { enabled: analysisType === "profit" }
  );

  const { data: executiveDashboard, isLoading: isLoadingDashboard } = trpc.reports.dashboards.executive.useQuery(
    {
      businessId,
    },
    { enabled: analysisType === "performance" }
  );

  const pageInfo = resolvePageInfo(location);

  const handleExport = () => {
    toast({ title: "قيد التطوير", description: "سيتم إضافة التصدير قريباً" });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PieChart className="w-8 h-8 text-blue-500" />
            التحليلات
          </h1>
          <p className="text-muted-foreground mt-2">
            تحليلات شاملة للبيانات
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>معايير التحليل</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>نوع التحليل</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">تحليل الإيرادات</SelectItem>
                  <SelectItem value="profit">تحليل الأرباح والخسائر</SelectItem>
                  <SelectItem value="performance">تحليل الأداء</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            <div className="flex items-end">
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analysis */}
      {analysisType === "revenue" && (
        <>
          {isLoadingRevenue ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : revenueData && revenueData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">إجمالي الإيرادات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {revenueData.reduce((sum: number, item: any) => sum + parseFloat(item.total_amount || "0"), 0).toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">المحصل</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {revenueData.reduce((sum: number, item: any) => sum + parseFloat(item.collected || "0"), 0).toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">المتبقي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {revenueData.reduce((sum: number, item: any) => sum + parseFloat(item.outstanding || "0"), 0).toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </>
      )}

      {/* Profit/Loss Analysis */}
      {analysisType === "profit" && (
        <>
          {isLoadingProfitLoss ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : profitLoss ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    إجمالي الإيرادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {parseFloat(profitLoss.total_revenue?.toString() || "0").toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    إجمالي المصروفات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {parseFloat(profitLoss.total_expenses?.toString() || "0").toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    صافي الربح
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${parseFloat(profitLoss.net_profit?.toString() || "0") >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {parseFloat(profitLoss.net_profit?.toString() || "0").toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </>
      )}

      {/* Performance Analysis */}
      {analysisType === "performance" && (
        <>
          {isLoadingDashboard ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : executiveDashboard ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    إجمالي العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {executiveDashboard.total_customers || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    إجمالي العدادات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {executiveDashboard.total_meters || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    الإيرادات الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {parseFloat(executiveDashboard.monthly_revenue?.toString() || "0").toLocaleString()} ريال
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    المشاريع النشطة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {executiveDashboard.active_projects || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </>
      )}
    </div>
  );
}

