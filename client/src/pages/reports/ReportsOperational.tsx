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
import { Activity, Download, Loader2, Wrench, Package, Building2 } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "التقارير التشغيلية",
  description: "تقارير تشغيلية شاملة للنظام.",
  process: `1) اختيار نوع التقرير:
   - تقارير الصيانة
   - تقارير المخزون
   - تقارير المشاريع

2) عرض التقرير:
   - البيانات التشغيلية
   - الرسوم البيانية
   - إمكانية التصدير`,
  mechanism: `- استعلامات tRPC للتقارير التشغيلية
- عرض البيانات في جداول ورسوم بيانية
- إمكانية التصدير`,
  relatedScreens: [
    { name: "التقارير المالية", path: "/dashboard/reports/financial", description: "التقارير المالية" },
    { name: "التحليلات", path: "/dashboard/reports/analytics", description: "التحليلات" },
  ],
  businessLogic: "تقارير تشغيلية شاملة مع تحليل البيانات.",
};

export default function ReportsOperational() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  const [reportType, setReportType] = useState("maintenance");
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: maintenanceReport, isLoading: isLoadingMaintenance } = trpc.reports.maintenance.workOrders.useQuery(
    {
      businessId,
      startDate,
      endDate,
    },
    { enabled: reportType === "maintenance" }
  );

  const { data: inventoryReport, isLoading: isLoadingInventory } = trpc.reports.inventory.stockStatus.useQuery(
    {
      businessId,
    },
    { enabled: reportType === "inventory" }
  );

  const { data: projectsReport, isLoading: isLoadingProjects } = trpc.reports.projects.status.useQuery(
    {
      businessId,
    },
    { enabled: reportType === "projects" }
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
            <Activity className="w-8 h-8 text-blue-500" />
            التقارير التشغيلية
          </h1>
          <p className="text-muted-foreground mt-2">
            تقارير تشغيلية شاملة للنظام
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
                  <SelectItem value="maintenance">تقارير الصيانة</SelectItem>
                  <SelectItem value="inventory">تقارير المخزون</SelectItem>
                  <SelectItem value="projects">تقارير المشاريع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportType !== "inventory" && reportType !== "projects" && (
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
              <Button onClick={handleExport} variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Report */}
      {reportType === "maintenance" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              تقرير أوامر العمل
            </CardTitle>
            <CardDescription>
              من {new Date(startDate).toLocaleDateString("ar-SA")} إلى {new Date(endDate).toLocaleDateString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMaintenance ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : maintenanceReport && maintenanceReport.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الأمر</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الفني</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التكلفة المقدرة</TableHead>
                    <TableHead>التكلفة الفعلية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceReport.map((wo: any) => (
                    <TableRow key={wo.id}>
                      <TableCell>{wo.work_order_number}</TableCell>
                      <TableCell>{wo.work_order_type}</TableCell>
                      <TableCell>{wo.customer_name || "-"}</TableCell>
                      <TableCell>{wo.technician_name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={wo.status === "completed" ? "default" : "secondary"}>
                          {wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseFloat(wo.estimated_cost || "0").toLocaleString()} ريال</TableCell>
                      <TableCell>{parseFloat(wo.actual_cost || "0").toLocaleString()} ريال</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Report */}
      {reportType === "inventory" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              تقرير حالة المخزون
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingInventory ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : inventoryReport && inventoryReport.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>اسم الصنف</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>المستودع</TableHead>
                    <TableHead>الكمية المتاحة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>قيمة المخزون</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryReport.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>{item.name_ar}</TableCell>
                      <TableCell>{item.category_name || "-"}</TableCell>
                      <TableCell>{item.warehouse_name || "-"}</TableCell>
                      <TableCell>{parseFloat(item.quantity_available || "0").toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.stock_status === "low"
                              ? "destructive"
                              : item.stock_status === "high"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.stock_status === "low" ? "منخفض" : item.stock_status === "high" ? "مرتفع" : "عادي"}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseFloat(item.stock_value || "0").toLocaleString()} ريال</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Projects Report */}
      {reportType === "projects" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              تقرير حالة المشاريع
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : projectsReport && projectsReport.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>اسم المشروع</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>نسبة الإنجاز</TableHead>
                    <TableHead>المهام المكتملة</TableHead>
                    <TableHead>الميزانية المقدرة</TableHead>
                    <TableHead>التكلفة الفعلية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectsReport.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.code}</TableCell>
                      <TableCell>{project.name_ar}</TableCell>
                      <TableCell>{project.project_type}</TableCell>
                      <TableCell>
                        <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseFloat(project.completion_percentage || "0").toFixed(1)}%</TableCell>
                      <TableCell>
                        {project.completed_tasks || 0} / {project.task_count || 0}
                      </TableCell>
                      <TableCell>{parseFloat(project.estimated_budget || "0").toLocaleString()} ريال</TableCell>
                      <TableCell>{parseFloat(project.actual_cost || "0").toLocaleString()} ريال</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

