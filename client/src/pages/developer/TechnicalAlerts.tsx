import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle, CheckCircle, Bell, Shield } from "lucide-react";

const severityColors: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  error: "bg-orange-500",
  critical: "bg-red-500",
};

const statusColors: Record<string, string> = {
  active: "bg-red-500",
  acknowledged: "bg-yellow-500",
  resolved: "bg-green-500",
};

export default function TechnicalAlerts() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { data: alerts, isLoading, refetch } = trpc.developer.alerts.list.useQuery({
    businessId: 1,
    status: statusFilter !== "all" ? statusFilter : undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
  });

  const { data: rules } = trpc.developer.alerts.rules.list.useQuery({ businessId: 1 } as any);

  const acknowledgeMutation = trpc.developer.alerts.acknowledge.useMutation({
    onSuccess: () => { toast.success("تم الإقرار بالتنبيه"); refetch(); },
  });

  const resolveMutation = trpc.developer.alerts.resolve.useMutation({
    onSuccess: () => { toast.success("تم حل التنبيه"); refetch(); },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-SA", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">التنبيهات التقنية</h1>
          <p className="text-muted-foreground">مراقبة وإدارة تنبيهات النظام</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ml-2" />تحديث
        </Button>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          <TabsTrigger value="rules">قواعد التنبيه</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="acknowledged">تم الإقرار</SelectItem>
                    <SelectItem value="resolved">تم الحل</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الخطورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المستويات</SelectItem>
                    <SelectItem value="info">معلومات</SelectItem>
                    <SelectItem value="warning">تحذير</SelectItem>
                    <SelectItem value="error">خطأ</SelectItem>
                    <SelectItem value="critical">حرج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التنبيه</TableHead>
                    <TableHead>الخطورة</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
                  ) : alerts?.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد تنبيهات</TableCell></TableRow>
                  ) : (
                    alerts?.map((alert: any) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">{alert.message}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity === "critical" ? "حرج" : alert.severity === "error" ? "خطأ" : alert.severity === "warning" ? "تحذير" : "معلومات"}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.source || "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[alert.status]}>
                            {alert.status === "active" ? "نشط" : alert.status === "acknowledged" ? "تم الإقرار" : "تم الحل"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(alert.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {alert.status === "active" && (
                              <Button size="sm" variant="outline" onClick={() => acknowledgeMutation.mutate({ id: alert.id } as any)}>
                                إقرار
                              </Button>
                            )}
                            {alert.status !== "resolved" && (
                              <Button size="sm" variant="outline" onClick={() => resolveMutation.mutate({ id: alert.id } as any)}>
                                حل
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader><CardTitle>قواعد التنبيه</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>القاعدة</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الخطورة</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules?.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">لا توجد قواعد</TableCell></TableRow>
                  ) : (
                    rules?.map((rule: any) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="font-medium">{rule.nameAr}</div>
                          <div className="text-sm text-muted-foreground">{rule.code}</div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{rule.category}</Badge></TableCell>
                        <TableCell><Badge className={severityColors[rule.severity]}>{rule.severity}</Badge></TableCell>
                        <TableCell>
                          <Badge className={rule.isActive ? "bg-green-500" : "bg-gray-500"}>
                            {rule.isActive ? "نشط" : "معطل"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
