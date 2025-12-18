import { useState } from "react";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ClipboardList,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  User,
  Calendar,
  MapPin,
  Package,
  Plus,
  Filter,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Work order status mapping
const workOrderStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  assigned: { label: "تم التعيين", variant: "default" },
  in_progress: { label: "قيد التنفيذ", variant: "default" },
  on_hold: { label: "معلق", variant: "warning" },
  completed: { label: "مكتمل", variant: "success" },
  cancelled: { label: "ملغي", variant: "destructive" },
  closed: { label: "مغلق", variant: "secondary" },
};

// Work order type mapping
const workOrderTypeMap: Record<string, { label: string; color: string; icon: any }> = {
  corrective: { label: "تصحيحية", color: "bg-destructive/20 text-destructive", icon: Wrench },
  preventive: { label: "وقائية", color: "bg-success/20 text-success", icon: CheckCircle },
  predictive: { label: "تنبؤية", color: "bg-primary/20 text-primary", icon: BarChart3 },
  emergency: { label: "طارئة", color: "bg-warning/20 text-warning", icon: AlertTriangle },
  inspection: { label: "فحص", color: "bg-accent/20 text-accent", icon: ClipboardList },
};

// Priority mapping
const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-muted text-muted-foreground" },
  medium: { label: "متوسطة", color: "bg-primary/20 text-primary" },
  high: { label: "عالية", color: "bg-warning/20 text-warning" },
  critical: { label: "حرجة", color: "bg-destructive/20 text-destructive" },
};

// Mock work orders data
const mockWorkOrders = [
  {
    id: 1,
    workOrderNumber: "WO-2024-001",
    title: "صيانة محول كهربائي T-05",
    description: "فحص وصيانة المحول بسبب ارتفاع درجة الحرارة",
    type: "corrective",
    priority: "high",
    status: "in_progress",
    assetCode: "AST-000001",
    assetName: "محول كهربائي 500 كيلو فولت",
    stationName: "محطة التوليد الرئيسية",
    assignedTo: "أحمد محمد",
    assignedTeam: "فريق الصيانة الكهربائية",
    createdDate: "2024-06-15",
    scheduledDate: "2024-06-16",
    dueDate: "2024-06-18",
    completedDate: null,
    estimatedHours: 8,
    actualHours: 6,
    estimatedCost: 5000,
    actualCost: 4200,
    createdBy: "مدير الصيانة",
  },
  {
    id: 2,
    workOrderNumber: "WO-2024-002",
    title: "صيانة دورية للمولد G-01",
    description: "صيانة دورية مجدولة للمولد الاحتياطي",
    type: "preventive",
    priority: "medium",
    status: "pending",
    assetCode: "AST-000002",
    assetName: "مولد ديزل احتياطي 1000 كيلو واط",
    stationName: "محطة التوليد الرئيسية",
    assignedTo: "خالد عمر",
    assignedTeam: "فريق الصيانة الميكانيكية",
    createdDate: "2024-06-14",
    scheduledDate: "2024-06-20",
    dueDate: "2024-06-22",
    completedDate: null,
    estimatedHours: 12,
    actualHours: null,
    estimatedCost: 8000,
    actualCost: null,
    createdBy: "نظام الصيانة الدورية",
  },
  {
    id: 3,
    workOrderNumber: "WO-2024-003",
    title: "إصلاح قاطع دائرة CB-15",
    description: "القاطع لا يعمل بشكل صحيح - يحتاج استبدال",
    type: "emergency",
    priority: "critical",
    status: "completed",
    assetCode: "AST-000005",
    assetName: "قاطع دائرة 220 فولت",
    stationName: "محطة التوزيع الشمالية",
    assignedTo: "سالم أحمد",
    assignedTeam: "فريق الطوارئ",
    createdDate: "2024-06-10",
    scheduledDate: "2024-06-10",
    dueDate: "2024-06-10",
    completedDate: "2024-06-10",
    estimatedHours: 4,
    actualHours: 3,
    estimatedCost: 2500,
    actualCost: 2800,
    createdBy: "مشغل المحطة",
  },
  {
    id: 4,
    workOrderNumber: "WO-2024-004",
    title: "فحص سنوي للوحة التوزيع",
    description: "فحص سنوي إلزامي للوحة التوزيع الرئيسية",
    type: "inspection",
    priority: "medium",
    status: "assigned",
    assetCode: "AST-000003",
    assetName: "لوحة توزيع رئيسية",
    stationName: "محطة التوزيع الشمالية",
    assignedTo: "محمد علي",
    assignedTeam: "فريق الفحص والاختبار",
    createdDate: "2024-06-12",
    scheduledDate: "2024-06-25",
    dueDate: "2024-06-30",
    completedDate: null,
    estimatedHours: 6,
    actualHours: null,
    estimatedCost: 3000,
    actualCost: null,
    createdBy: "مدير الجودة",
  },
  {
    id: 5,
    workOrderNumber: "WO-2024-005",
    title: "تحليل اهتزازات المحول T-03",
    description: "تحليل تنبؤي بناءً على بيانات الاستشعار",
    type: "predictive",
    priority: "low",
    status: "draft",
    assetCode: "AST-000007",
    assetName: "محول جهد متوسط",
    stationName: "محطة التوليد الرئيسية",
    assignedTo: null,
    assignedTeam: null,
    createdDate: "2024-06-18",
    scheduledDate: null,
    dueDate: "2024-07-15",
    completedDate: null,
    estimatedHours: 4,
    actualHours: null,
    estimatedCost: 1500,
    actualCost: null,
    createdBy: "نظام المراقبة التنبؤية",
  },
];

// Stats
const stats = [
  { title: "إجمالي أوامر العمل", value: "156", icon: ClipboardList, color: "primary" },
  { title: "قيد التنفيذ", value: "23", icon: Play, color: "warning" },
  { title: "مكتملة هذا الشهر", value: "45", icon: CheckCircle, color: "success" },
  { title: "متأخرة", value: "5", icon: AlertTriangle, color: "destructive" },
];

export default function WorkOrdersList() {
  const [, setLocation] = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Filter data based on tab and filters
  const filteredWorkOrders = mockWorkOrders.filter((wo) => {
    // Tab filter
    if (activeTab === "pending" && !["pending", "assigned"].includes(wo.status)) return false;
    if (activeTab === "in_progress" && wo.status !== "in_progress") return false;
    if (activeTab === "completed" && !["completed", "closed"].includes(wo.status)) return false;
    if (activeTab === "overdue") {
      const dueDate = new Date(wo.dueDate);
      const today = new Date();
      if (wo.status === "completed" || wo.status === "closed" || wo.status === "cancelled" || dueDate >= today) return false;
    }

    // Additional filters
    if (filterType !== "all" && wo.type !== filterType) return false;
    if (filterStatus !== "all" && wo.status !== filterStatus) return false;
    if (filterPriority !== "all" && wo.priority !== filterPriority) return false;

    return true;
  });

  const columns: Column<typeof mockWorkOrders[0]>[] = [
    {
      key: "workOrderNumber",
      title: "رقم الأمر",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "title",
      title: "العنوان",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description}</p>
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => {
        const typeInfo = workOrderTypeMap[value];
        const Icon = typeInfo?.icon || Wrench;
        return (
          <Badge variant="outline" className={cn("gap-1", typeInfo?.color)}>
            <Icon className="w-3 h-3" />
            {typeInfo?.label}
          </Badge>
        );
      },
    },
    {
      key: "priority",
      title: "الأولوية",
      render: (value) => (
        <Badge variant="outline" className={priorityMap[value]?.color}>
          {priorityMap[value]?.label}
        </Badge>
      ),
    },
    {
      key: "assetName",
      title: "الأصل",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm">{value}</p>
            <p className="text-xs text-muted-foreground font-mono">{row.assetCode}</p>
          </div>
        </div>
      ),
    },
    {
      key: "stationName",
      title: "الموقع",
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "assignedTo",
      title: "المسؤول",
      render: (value, row) => (
        value ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-3 h-3 text-primary" />
            </div>
            <div>
              <p className="text-sm">{value}</p>
              <p className="text-xs text-muted-foreground">{row.assignedTeam}</p>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">غير معين</span>
        )
      ),
    },
    {
      key: "dueDate",
      title: "تاريخ الاستحقاق",
      render: (value, row) => {
        const dueDate = new Date(value);
        const today = new Date();
        const isOverdue = dueDate < today && !["completed", "closed", "cancelled"].includes(row.status);
        return (
          <div className="flex items-center gap-1">
            <Calendar className={cn("w-3 h-3", isOverdue ? "text-destructive" : "text-muted-foreground")} />
            <span className={cn("text-sm", isOverdue && "text-destructive font-medium")}>
              {dueDate.toLocaleDateString("ar-SA")}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={workOrderStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedWorkOrder(null);
    setShowDialog(true);
  };

  const handleView = (workOrder: any) => {
    setLocation(`/dashboard/maintenance/work-orders/view/${workOrder.id}`);
  };

  const handleEdit = (workOrder: any) => {
    setSelectedWorkOrder(workOrder);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkOrder) {
      toast.success("تم تحديث أمر العمل بنجاح");
    } else {
      toast.success("تم إنشاء أمر العمل بنجاح");
    }
    setShowDialog(false);
    setSelectedWorkOrder(null);
  };

  const handleStatusChange = (workOrder: any, newStatus: string) => {
    toast.success(`تم تغيير حالة أمر العمل إلى: ${workOrderStatusMap[newStatus]?.label}`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
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
                    <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
          <TabsTrigger value="overdue" className="text-destructive">متأخرة</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع الصيانة</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {Object.entries(workOrderTypeMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {Object.entries(workOrderStatusMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأولويات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  {Object.entries(priorityMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفترة</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفترات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="quarter">هذا الربع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filteredWorkOrders}
        columns={columns}
        title="أوامر العمل"
        description="إدارة ومتابعة أوامر العمل والصيانة"
        searchPlaceholder="بحث برقم الأمر أو العنوان..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد أوامر عمل"
      />

      {/* Add/Edit Work Order Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedWorkOrder ? "تعديل أمر عمل" : "إنشاء أمر عمل جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkOrder
                ? "قم بتعديل بيانات أمر العمل"
                : "أدخل بيانات أمر العمل الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">عنوان أمر العمل *</Label>
                <Input
                  id="title"
                  placeholder="أدخل عنوان أمر العمل"
                  defaultValue={selectedWorkOrder?.title}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف تفصيلي لأمر العمل"
                  defaultValue={selectedWorkOrder?.description}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع الصيانة *</Label>
                <Select defaultValue={selectedWorkOrder?.type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(workOrderTypeMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية *</Label>
                <Select defaultValue={selectedWorkOrder?.priority || "medium"}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="asset">الأصل</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأصل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AST-000001">AST-000001 - محول كهربائي</SelectItem>
                    <SelectItem value="AST-000002">AST-000002 - مولد ديزل</SelectItem>
                    <SelectItem value="AST-000003">AST-000003 - لوحة توزيع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="station">المحطة *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="3">محطة التوزيع الجنوبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">تعيين إلى</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفني" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">أحمد محمد</SelectItem>
                    <SelectItem value="2">خالد عمر</SelectItem>
                    <SelectItem value="3">سالم أحمد</SelectItem>
                    <SelectItem value="4">محمد علي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">فريق العمل</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفريق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">فريق الصيانة الكهربائية</SelectItem>
                    <SelectItem value="2">فريق الصيانة الميكانيكية</SelectItem>
                    <SelectItem value="3">فريق الطوارئ</SelectItem>
                    <SelectItem value="4">فريق الفحص والاختبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">تاريخ البدء المجدول</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  defaultValue={selectedWorkOrder?.scheduledDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">تاريخ الاستحقاق *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  defaultValue={selectedWorkOrder?.dueDate}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedHours">الساعات المقدرة</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  placeholder="0"
                  defaultValue={selectedWorkOrder?.estimatedHours}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">التكلفة المقدرة (ر.س)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="0"
                  defaultValue={selectedWorkOrder?.estimatedCost}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedWorkOrder ? "حفظ التغييرات" : "إنشاء أمر العمل"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
