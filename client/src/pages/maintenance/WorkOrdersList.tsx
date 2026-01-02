import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Wrench, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const workOrderStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  in_progress: { label: "قيد التنفيذ", variant: "default" },
  completed: { label: "مكتمل", variant: "success" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

// Priority mapping
const priorityMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  low: { label: "منخفضة", variant: "secondary" },
  medium: { label: "متوسطة", variant: "default" },
  high: { label: "عالية", variant: "warning" },
  critical: { label: "حرجة", variant: "destructive" },
};

// Type mapping
const typeMap: Record<string, string> = {
  preventive: "وقائية",
  corrective: "تصحيحية",
  emergency: "طارئة",
  inspection: "فحص",
};

export default function WorkOrdersList() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "preventive",
    priority: "medium",
    assetId: "",
    assignedTo: "",
    scheduledStart: "",
    estimatedHours: "",
  });

  // Fetch work orders from API
  const { data: workOrders = [], isLoading, refetch } = trpc.maintenance.workOrders.list.useQuery({
    businessId: 1,
    status: filterStatus !== "all" ? filterStatus : undefined,
    type: filterType !== "all" ? filterType : undefined,
  } as any);

  // Fetch dashboard stats
  const { data: stats } = trpc.maintenance.dashboardStats.useQuery({
    businessId: 1,
  } as any);

  // Fetch assets for selection
  const { data: assets = [] } = trpc.assets.list.useQuery({
    businessId: 1,
    status: "active",
  } as any);

  // Fetch technicians
  const { data: technicians = [] } = trpc.maintenance.technicians.list.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createWorkOrder = trpc.maintenance.workOrders.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء أمر العمل بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء أمر العمل");
    },
  });

  const deleteWorkOrder = trpc.maintenance.workOrders.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف أمر العمل بنجاح");
      setShowDeleteDialog(false);
      setSelectedOrder(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف أمر العمل");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "preventive",
      priority: "medium",
      assetId: "",
      assignedTo: "",
      scheduledStart: "",
      estimatedHours: "",
    });
    setSelectedOrder(null);
  };

  // Stats cards
  const statsCards = [
    { title: "إجمالي الأوامر", value: stats?.totalWorkOrders?.toString() || "0", icon: Wrench, color: "primary" },
    { title: "قيد الانتظار", value: stats?.pendingOrders?.toString() || "0", icon: Clock, color: "warning" },
    { title: "مكتملة", value: stats?.completedOrders?.toString() || "0", icon: CheckCircle, color: "success" },
    { title: "خطط نشطة", value: stats?.activePlans?.toString() || "0", icon: AlertTriangle, color: "destructive" },
  ];

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "orderNumber",
      title: "رقم الأمر",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "title",
      title: "العنوان",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{typeMap[row.type] || row.type}</p>
        </div>
      ),
    },
    {
      key: "priority",
      title: "الأولوية",
      render: (value) => <StatusBadge status={value} statusMap={priorityMap} />,
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={workOrderStatusMap} />,
    },
    {
      key: "scheduledStart",
      title: "الموعد المحدد",
      render: (value) => value ? new Date(value).toLocaleDateString("ar-SA") : "-",
    },
    {
      key: "estimatedHours",
      title: "الساعات المقدرة",
      align: "right",
      render: (value) => value ? `${value} ساعة` : "-",
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleView = (order: any) => {
    setLocation(`/dashboard/maintenance/work-orders/${order.id}`);
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setFormData({
      title: order.title || "",
      description: order.description || "",
      type: order.type || "preventive",
      priority: order.priority || "medium",
      assetId: order.assetId?.toString() || "",
      assignedTo: order.assignedTo?.toString() || "",
      scheduledStart: order.scheduledStart || "",
      estimatedHours: order.estimatedHours || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (order: any) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedOrder) {
      deleteWorkOrder.mutate({ id: selectedOrder.id } as any);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(formData as any).title) {
      toast.error("يرجى إدخال عنوان أمر العمل");
      return;
    }

    const data = {
      ...formData,
      assetId: (formData as any).assetId ? parseInt((formData as any).assetId) : undefined,
      assignedTo: (formData as any).assignedTo ? parseInt((formData as any).assignedTo) : undefined,
      businessId: 1,
    };

    createWorkOrder.mutate(data as any);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
            destructive: "text-destructive bg-destructive/10",
          };

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">النوع</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="preventive">وقائية</SelectItem>
                  <SelectItem value="corrective">تصحيحية</SelectItem>
                  <SelectItem value="emergency">طارئة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        title="أوامر العمل"
        description="إدارة أوامر عمل الصيانة"
        columns={columns}
        data={workOrders}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إنشاء أمر عمل"
        searchPlaceholder="البحث في أوامر العمل..."
        searchKeys={["orderNumber", "title"]}
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إنشاء أمر عمل جديد</DialogTitle>
            <DialogDescription>أدخل بيانات أمر العمل</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={(formData as any).title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">النوع</Label>
                  <Select
                    value={(formData as any).type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">وقائية</SelectItem>
                      <SelectItem value="corrective">تصحيحية</SelectItem>
                      <SelectItem value="emergency">طارئة</SelectItem>
                      <SelectItem value="inspection">فحص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select
                    value={(formData as any).priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="critical">حرجة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetId">الأصل</Label>
                <Select
                  value={(formData as any).assetId}
                  onValueChange={(value) => setFormData({ ...formData, assetId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assets as any[]).map((asset: any) => (
                      <SelectItem key={(asset as any).id} value={(asset as any).id.toString()}>
                        {(asset as any).nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">الفني المسؤول</Label>
                <Select
                  value={(formData as any).assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفني" />
                  </SelectTrigger>
                  <SelectContent>
                    {(technicians as any[]).map((tech: any) => (
                      <SelectItem key={tech.id} value={tech.id.toString()}>
                        {tech.firstName} {tech.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart">الموعد المحدد</Label>
                  <Input
                    id="scheduledStart"
                    type="date"
                    value={(formData as any).scheduledStart}
                    onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">الساعات المقدرة</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={(formData as any).estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={(formData as any).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createWorkOrder.isPending}>
                {createWorkOrder.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                إنشاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف أمر العمل "{selectedOrder?.orderNumber}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteWorkOrder.isPending}>
              {deleteWorkOrder.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
