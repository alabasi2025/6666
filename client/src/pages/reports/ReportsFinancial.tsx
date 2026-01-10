import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "التقارير المالية",
  description: "تقارير مالية شاملة للنظام.",
  process: `1) اختيار نوع التقرير:
   - قائمة الدخل
   - الميزانية العمومية
   - قائمة التدفقات النقدية

2) عرض التقرير:
   - البيانات المالية
   - الرسوم البيانية
   - إمكانية التصدير`,
  mechanism: `- استعلامات tRPC للتقارير المالية
- عرض البيانات في جداول ورسوم بيانية
- إمكانية التصدير`,
  relatedScreens: [
    { name: "ميزان المراجعة", path: "/dashboard/accounting/trial-balance", description: "ميزان المراجعة" },
    { name: "دفتر الأستاذ", path: "/dashboard/accounting/general-ledger", description: "دفتر الأستاذ" },
  ],
  businessLogic: "تقارير مالية شاملة مع تحليل البيانات.",
};

export default function ReportsFinancial() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  const [reportType, setReportType] = useState("income_statement");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: incomeStatement, isLoading: isLoadingIncome } = trpc.accounting.reports.incomeStatement.useQuery(
    {
      businessId,
      startDate,
      endDate,
    },
    { enabled: reportType === "income_statement" }
  );

  const { data: balanceSheet, isLoading: isLoadingBalance } = trpc.accounting.reports.balanceSheet.useQuery(
    {
      businessId,
      asOfDate,
    },
    { enabled: reportType === "balance_sheet" }
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
            <DollarSign className="w-8 h-8 text-blue-500" />
            التقارير المالية
          </h1>
          <p className="text-muted-foreground mt-2">
            تقارير مالية شاملة للنظام
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
                  <SelectItem value="income_statement">قائمة الدخل</SelectItem>
                  <SelectItem value="balance_sheet">الميزانية العمومية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType === "income_statement" ? (
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
            ) : (
              <div>
                <Label>حتى تاريخ</Label>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-end">
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Statement */}
      {reportType === "income_statement" && (
        <Card>
          <CardHeader>
            <CardTitle>قائمة الدخل (الأرباح والخسائر)</CardTitle>
            <CardDescription>
              من {new Date(startDate).toLocaleDateString("ar-SA")} إلى {new Date(endDate).toLocaleDateString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingIncome ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : incomeStatement ? (
              <div className="space-y-6">
                {/* Revenues */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">الإيرادات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الحساب</TableHead>
                        <TableHead>اسم الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeStatement.revenues?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.nameAr}</TableCell>
                          <TableCell className="text-left font-medium text-green-600">
                            {parseFloat(item.currentBalance || "0").toLocaleString()} ريال
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={2}>إجمالي الإيرادات</TableCell>
                        <TableCell className="text-left text-green-600">
                          {parseFloat(incomeStatement.totalRevenue?.toString() || "0").toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Expenses */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">المصروفات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الحساب</TableHead>
                        <TableHead>اسم الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeStatement.expenses?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.nameAr}</TableCell>
                          <TableCell className="text-left font-medium text-red-600">
                            {parseFloat(item.currentBalance || "0").toLocaleString()} ريال
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={2}>إجمالي المصروفات</TableCell>
                        <TableCell className="text-left text-red-600">
                          {parseFloat(incomeStatement.totalExpense?.toString() || "0").toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Net Income */}
                <div className="border-t-2 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>صافي الدخل</span>
                    <Badge
                      variant={parseFloat(incomeStatement.netIncome?.toString() || "0") >= 0 ? "default" : "destructive"}
                      className="text-lg px-4 py-2"
                    >
                      {parseFloat(incomeStatement.netIncome?.toString() || "0").toLocaleString()} ريال
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Balance Sheet */}
      {reportType === "balance_sheet" && (
        <Card>
          <CardHeader>
            <CardTitle>الميزانية العمومية</CardTitle>
            <CardDescription>
              حتى تاريخ {new Date(asOfDate).toLocaleDateString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : balanceSheet ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Assets */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">الأصول</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الحساب</TableHead>
                        <TableHead>اسم الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceSheet.assets?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.nameAr}</TableCell>
                          <TableCell className="text-left font-medium">
                            {parseFloat(item.currentBalance || "0").toLocaleString()} ريال
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={2}>إجمالي الأصول</TableCell>
                        <TableCell className="text-left text-blue-600">
                          {parseFloat(balanceSheet.totalAssets?.toString() || "0").toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">الخصوم وحقوق الملكية</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>كود الحساب</TableHead>
                        <TableHead>اسم الحساب</TableHead>
                        <TableHead className="text-left">المبلغ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balanceSheet.liabilities?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.nameAr}</TableCell>
                          <TableCell className="text-left font-medium">
                            {parseFloat(item.currentBalance || "0").toLocaleString()} ريال
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={2}>إجمالي الخصوم</TableCell>
                        <TableCell className="text-left text-orange-600">
                          {parseFloat(balanceSheet.totalLiabilities?.toString() || "0").toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted font-bold">
                        <TableCell colSpan={2}>حقوق الملكية</TableCell>
                        <TableCell className="text-left text-green-600">
                          {parseFloat(balanceSheet.totalEquity?.toString() || "0").toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-primary/10 font-bold text-lg">
                        <TableCell colSpan={2}>إجمالي الخصوم وحقوق الملكية</TableCell>
                        <TableCell className="text-left">
                          {(parseFloat(balanceSheet.totalLiabilities?.toString() || "0") + 
                            parseFloat(balanceSheet.totalEquity?.toString() || "0")).toLocaleString()} ريال
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

