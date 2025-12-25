import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertTriangle, Bell, CheckCircle, Clock,
  Search, Eye, XCircle, Loader2, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Alert Type Badge
function AlertTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; color: string }> = {
    info: { label: "معلومات", color: "bg-blue-500/20 text-blue-500" },
    warning: { label: "تحذير", color: "bg-warning/20 text-warning" },
    critical: { label: "حرج", color: "bg-orange-500/20 text-orange-500" },
    emergency: { label: "طوارئ", color: "bg-destructive/20 text-destructive" },
  };

  const config = typeConfig[type] || { label: type, color: "bg-gray-500/20 text-gray-500" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(config as any).color}`}>
      {(config as any).label}
    </span>
  );
}

// Alert Status Badge
function AlertStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "نشط", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
    acknowledged: { label: "تم الاستلام", color: "bg-warning/20 text-warning", icon: Eye },
    resolved: { label: "تم الحل", color: "bg-success/20 text-success", icon: CheckCircle },
    dismissed: { label: "مرفوض", color: "bg-gray-500/20 text-gray-500", icon: XCircle },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Bell };
  const Icon = (config as any).icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${(config as any).color}`}>
      <Icon className="w-3 h-3" />
      {(config as any).label}
    </span>
  );
}

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [formData, setFormData] = useState({
    alertType: "warning",
    title: "",
    message: "",
    priority: "medium",
  });

  // Fetch alerts
  const { data: alerts = [], isLoading, refetch } = trpc.scada.alerts.list.useQuery({
    businessId: 1,
    type: typeFilter !== "all" ? typeFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  // Fetch stats
  const { data: stats } = trpc.scada.alerts.stats.useQuery({ businessId: 1 } as any);

  // Mutations
  const createMutation = trpc.scada.alerts.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التنبيه بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const updateStatusMutation = trpc.scada.alerts.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة التنبيه");
      setSelectedAlert(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const deleteMutation = trpc.scada.alerts.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التنبيه");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const resetForm = () => {
    setFormData({
      alertType: "warning",
      title: "",
      message: "",
      priority: "medium",
    });
  };

  const handleSubmit = () => {
    if (!(formData as any).title) {
      toast.error("يرجى إدخال عنوان التنبيه");
      return;
    }

    createMutation.mutate({
      businessId: 1,
      alertType: (formData as any).alertType as any,
      title: (formData as any).title,
      message: (formData as any).message || undefined,
      priority: (formData as any).priority as any,
    } as any);
  };

  const handleAcknowledge = (id: number) => {
    updateStatusMutation.mutate({ id, status: "acknowledged" } as any);
  };

  const handleResolve = (id: number) => {
    updateStatusMutation.mutate({ id, status: "resolved" } as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا التنبيه؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  const filteredAlerts = (alerts as any[]).filter((alert: any) => {
    if (searchQuery && !alert.title?.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("ar-SA");
  };

  const statCards = [
    { label: "إجمالي التنبيهات", value: stats?.total || 0, icon: Bell, color: "primary" },
    { label: "نشطة", value: stats?.active || 0, icon: AlertTriangle, color: "destructive" },
    { label: "تم الاستلام", value: stats?.acknowledged || 0, icon: Eye, color: "warning" },
    { label: "تم الحل", value: stats?.resolved || 0, icon: CheckCircle, color: "success" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            إدارة التنبيهات
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة تنبيهات النظام</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          تنبيه جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold ltr-nums">{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التنبيهات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="info">معلومات</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="emergency">طوارئ</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="acknowledged">تم الاستلام</SelectItem>
                <SelectItem value="resolved">تم الحل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
              <p>لا توجد تنبيهات</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredAlerts as any[]).map((alert: any) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        {alert.message && (
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell><AlertTypeBadge type={alert.alertType} /></TableCell>
                    <TableCell><AlertStatusBadge status={alert.status} /></TableCell>
                    <TableCell className="text-sm">{formatDate(alert.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {alert.status === "active" && (
                          <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                            استلام
                          </Button>
                        )}
                        {alert.status === "acknowledged" && (
                          <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                            حل
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(alert.id)}>
                          <XCircle className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة تنبيه جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>العنوان *</Label>
              <Input
                value={(formData as any).title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="عنوان التنبيه"
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={(formData as any).alertType} onValueChange={(value) => setFormData({ ...formData, alertType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">معلومات</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="emergency">طوارئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الرسالة</Label>
              <Textarea
                value={(formData as any).message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="تفاصيل التنبيه..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
