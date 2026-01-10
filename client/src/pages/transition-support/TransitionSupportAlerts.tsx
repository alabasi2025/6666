import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "التنبيهات",
  description: "إدارة التنبيهات للمرحلة الانتقالية.",
  process: `1) عرض التنبيهات:
   - التنبيهات النشطة والحرجة
   - التنبيهات المعترف بها والمحلولة
   - تصنيف حسب الخطورة

2) إدارة التنبيهات:
   - الاعتراف بالتنبيهات
   - حل التنبيهات
   - تصفية حسب الحالة والخطورة`,
  mechanism: `- استعلامات tRPC للتنبيهات
- عرض البيانات في جدول
- إدارة التنبيهات عبر mutations`,
  relatedScreens: [
    { name: "لوحة المراقبة", path: "/dashboard/transition-support/dashboard", description: "ملخص المرحلة الانتقالية" },
    { name: "الإشعارات", path: "/dashboard/transition-support/notifications", description: "إدارة الإشعارات" },
  ],
  businessLogic: "إدارة شاملة للتنبيهات مع إمكانية الاعتراف والحل.",
};

export default function TransitionSupportAlerts() {
  const [location] = useLocation();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const businessId = 1;

  const { data, isLoading, refetch } = trpc.transitionSupport.monitoring.getAlerts.useQuery({
    businessId,
    severity: severityFilter !== "all" ? (severityFilter as any) : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    limit: 100,
  });

  // Note: acknowledgeAlert and resolveAlert mutations need to be added to transitionSupportRouter
  // For now, we'll show the buttons but they won't work until the backend is updated
  const handleAcknowledge = (id: number) => {
    toast.info("سيتم إضافة هذه الوظيفة قريباً");
  };

  const handleResolve = (id: number) => {
    toast.info("سيتم إضافة هذه الوظيفة قريباً");
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      critical: { label: "حرج", variant: "destructive" },
      error: { label: "خطأ", variant: "destructive" },
      warning: { label: "تحذير", variant: "secondary" },
      info: { label: "معلومات", variant: "outline" },
    };
    const severityInfo = severityMap[severity] || { label: severity, variant: "default" as const };
    return <Badge variant={severityInfo.variant}>{severityInfo.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "نشط", variant: "destructive" },
      acknowledged: { label: "معترف به", variant: "secondary" },
      resolved: { label: "محلول", variant: "default" },
      dismissed: { label: "مرفوض", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            التنبيهات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة التنبيهات للمرحلة الانتقالية
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الخطورات</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="info">معلومات</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="acknowledged">معترف به</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
                <SelectItem value="dismissed">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline">
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التنبيهات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نشط</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.filter((a: any) => a.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معترف به</CardTitle>
            <CheckCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.filter((a: any) => a.status === "acknowledged").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">محلول</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.filter((a: any) => a.status === "resolved").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة التنبيهات</CardTitle>
          <CardDescription>عرض وإدارة جميع التنبيهات</CardDescription>
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
                    <TableHead>العنوان</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الخطورة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((alert: any) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {alert.customer_name || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{alert.message || alert.description || "-"}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {alert.triggered_at ? new Date(alert.triggered_at).toLocaleDateString("ar-SA") : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {alert.status === "active" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledge(alert.id)}
                                title="اعتراف"
                              >
                                <CheckCircle className="h-4 w-4 text-yellow-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolve(alert.id)}
                                title="حل"
                              >
                                <XCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تنبيهات
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

