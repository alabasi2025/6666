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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Bell,
  Plus,
  Send,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "الإشعارات",
  description: "إدارة الإشعارات الاستباقية للمرحلة الانتقالية.",
  process: `1) عرض قائمة الإشعارات:
   - الإشعارات المرسلة والمعلقة
   - حالة الإرسال (مرسل، تم التسليم، فشل)
   - أنواع الإشعارات المختلفة

2) إدارة الإشعارات:
   - إنشاء إشعارات جديدة
   - إرسال الإشعارات للعملاء
   - تتبع حالة الإرسال`,
  mechanism: `- استعلامات tRPC للإشعارات
- عرض البيانات في جدول
- إنشاء وإرسال الإشعارات عبر mutations`,
  relatedScreens: [
    { name: "لوحة المراقبة", path: "/dashboard/transition-support/dashboard", description: "ملخص المرحلة الانتقالية" },
    { name: "التنبيهات", path: "/dashboard/transition-support/alerts", description: "إدارة التنبيهات" },
  ],
  businessLogic: "إدارة شاملة للإشعارات الاستباقية مع تتبع حالة الإرسال.",
};

export default function TransitionSupportNotifications() {
  const [location] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const businessId = 1;

  const { data, isLoading, refetch } = trpc.transitionSupport.notifications.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    notificationType: typeFilter !== "all" ? typeFilter : undefined,
    page,
    limit: 20,
  });

  const createMutation = trpc.transitionSupport.notifications.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الإشعار بنجاح");
      refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "فشل في إنشاء الإشعار");
    },
  });

  const sendMutation = trpc.transitionSupport.notifications.send.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الإشعار بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل في إرسال الإشعار");
    },
  });

  const [formData, setFormData] = useState({
    customerId: 0,
    notificationType: "quota_warning" as const,
    priority: "medium" as const,
    title: "",
    message: "",
    sendVia: "all" as const,
  });

  const resetForm = () => {
    setFormData({
      customerId: 0,
      notificationType: "quota_warning",
      priority: "medium",
      title: "",
      message: "",
      sendVia: "all",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId,
      ...formData,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "معلق", variant: "outline" },
      sent: { label: "مرسل", variant: "default" },
      delivered: { label: "تم التسليم", variant: "default" },
      failed: { label: "فشل", variant: "destructive" },
      read: { label: "مقروء", variant: "secondary" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      quota_warning: "تحذير الحصة",
      quota_exceeded: "تجاوز الحصة",
      consumption_increase: "زيادة الاستهلاك",
      support_ending: "انتهاء الدعم",
      custom: "مخصص",
    };
    return typeMap[type] || type;
  };

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8 text-orange-500" />
            الإشعارات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة الإشعارات الاستباقية للمرحلة الانتقالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إشعار جديد
          </Button>
          <EngineInfoDialog info={pageInfo} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="sent">مرسل</SelectItem>
                <SelectItem value="delivered">تم التسليم</SelectItem>
                <SelectItem value="failed">فشل</SelectItem>
                <SelectItem value="read">مقروء</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الإشعار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="quota_warning">تحذير الحصة</SelectItem>
                <SelectItem value="quota_exceeded">تجاوز الحصة</SelectItem>
                <SelectItem value="consumption_increase">زيادة الاستهلاك</SelectItem>
                <SelectItem value="support_ending">انتهاء الدعم</SelectItem>
                <SelectItem value="custom">مخصص</SelectItem>
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
            <CardTitle className="text-sm font-medium">إجمالي الإشعارات</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مرسل</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.notifications?.filter((n: any) => n.status === "sent" || n.status === "delivered").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معلق</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.notifications?.filter((n: any) => n.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فشل</CardTitle>
            <Bell className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.notifications?.filter((n: any) => n.status === "failed").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الإشعارات</CardTitle>
          <CardDescription>عرض وإدارة الإشعارات المرسلة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : data?.notifications && data.notifications.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الرسالة</TableHead>
                    <TableHead>طريقة الإرسال</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.notifications.map((notification: any) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {notification.customer_name || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(notification.notification_type)}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{notification.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{notification.message}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {notification.send_via?.includes("sms") && <MessageSquare className="h-4 w-4" />}
                          {notification.send_via?.includes("email") && <Mail className="h-4 w-4" />}
                          {notification.send_via?.includes("whatsapp") && <Smartphone className="h-4 w-4" />}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        {notification.created_at ? new Date(notification.created_at).toLocaleDateString("ar-SA") : "-"}
                      </TableCell>
                      <TableCell>
                        {notification.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendMutation.mutate({ id: notification.id })}
                            disabled={sendMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد إشعارات
            </div>
          )}

          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                عرض {((page - 1) * data.limit) + 1} - {Math.min(page * data.limit, data.total)} من {data.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * data.limit >= data.total}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء إشعار جديد</DialogTitle>
            <DialogDescription>
              إنشاء إشعار استباقي للعميل
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>رقم العميل</Label>
                <Input
                  type="number"
                  value={formData.customerId || ""}
                  onChange={(e) => setFormData({ ...formData, customerId: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label>نوع الإشعار</Label>
                <Select
                  value={formData.notificationType}
                  onValueChange={(value: any) => setFormData({ ...formData, notificationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quota_warning">تحذير الحصة</SelectItem>
                    <SelectItem value="quota_exceeded">تجاوز الحصة</SelectItem>
                    <SelectItem value="consumption_increase">زيادة الاستهلاك</SelectItem>
                    <SelectItem value="support_ending">انتهاء الدعم</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>الأولوية</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="urgent">عاجلة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>طريقة الإرسال</Label>
                <Select
                  value={formData.sendVia}
                  onValueChange={(value: any) => setFormData({ ...formData, sendVia: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">البريد الإلكتروني</SelectItem>
                    <SelectItem value="whatsapp">واتساب</SelectItem>
                    <SelectItem value="all">الكل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>العنوان</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>الرسالة</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء الإشعار"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

