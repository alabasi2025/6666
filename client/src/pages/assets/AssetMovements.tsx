import { useState } from "react";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  ArrowLeftRight,
  Package,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Movement status mapping
const movementStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  pending: { label: "قيد الانتظار", variant: "warning" },
  approved: { label: "معتمد", variant: "success" },
  in_transit: { label: "قيد النقل", variant: "default" },
  completed: { label: "مكتمل", variant: "success" },
  rejected: { label: "مرفوض", variant: "destructive" },
  cancelled: { label: "ملغي", variant: "secondary" },
};

// Movement type mapping
const movementTypeMap: Record<string, { label: string; color: string }> = {
  transfer: { label: "نقل", color: "bg-primary/20 text-primary" },
  disposal: { label: "استبعاد", color: "bg-destructive/20 text-destructive" },
  maintenance: { label: "صيانة", color: "bg-warning/20 text-warning" },
  inspection: { label: "فحص", color: "bg-success/20 text-success" },
  revaluation: { label: "إعادة تقييم", color: "bg-accent/20 text-accent" },
};

// Mock movements data
const mockMovements = [
  {
    id: 1,
    movementNumber: "MOV-2024-001",
    assetCode: "AST-000001",
    assetName: "محول كهربائي 500 كيلو فولت",
    type: "transfer",
    fromLocation: "المستودع الرئيسي",
    toLocation: "محطة التوليد الرئيسية",
    requestDate: "2024-06-01",
    completionDate: "2024-06-05",
    reason: "تركيب جديد في المحطة",
    requestedBy: "أحمد محمد",
    approvedBy: "المدير الفني",
    status: "completed",
  },
  {
    id: 2,
    movementNumber: "MOV-2024-002",
    assetCode: "AST-000003",
    assetName: "لوحة توزيع رئيسية",
    type: "maintenance",
    fromLocation: "محطة التوزيع الشمالية",
    toLocation: "ورشة الصيانة",
    requestDate: "2024-06-10",
    completionDate: null,
    reason: "صيانة دورية مجدولة",
    requestedBy: "خالد عمر",
    approvedBy: "مدير الصيانة",
    status: "in_transit",
  },
  {
    id: 3,
    movementNumber: "MOV-2024-003",
    assetCode: "AST-000005",
    assetName: "قاطع دائرة 220 فولت",
    type: "disposal",
    fromLocation: "محطة التوزيع الشمالية",
    toLocation: "مستودع الأصول المستبعدة",
    requestDate: "2024-06-15",
    completionDate: "2024-06-20",
    reason: "انتهاء العمر الافتراضي",
    requestedBy: "سالم أحمد",
    approvedBy: "المدير المالي",
    status: "completed",
  },
  {
    id: 4,
    movementNumber: "MOV-2024-004",
    assetCode: "AST-000007",
    assetName: "محول جهد متوسط",
    type: "inspection",
    fromLocation: "محطة التوليد الرئيسية",
    toLocation: "محطة التوليد الرئيسية",
    requestDate: "2024-06-18",
    completionDate: null,
    reason: "فحص سنوي إلزامي",
    requestedBy: "محمد علي",
    approvedBy: null,
    status: "pending",
  },
  {
    id: 5,
    movementNumber: "MOV-2024-005",
    assetCode: "AST-000002",
    assetName: "مولد ديزل احتياطي",
    type: "revaluation",
    fromLocation: "محطة التوليد الرئيسية",
    toLocation: "محطة التوليد الرئيسية",
    requestDate: "2024-06-20",
    completionDate: "2024-06-22",
    reason: "إعادة تقييم سنوية",
    requestedBy: "المحاسب",
    approvedBy: "المدير المالي",
    status: "completed",
  },
];

// Stats
const stats = [
  { title: "إجمالي الحركات", value: "156", icon: ArrowLeftRight, color: "primary" },
  { title: "قيد الانتظار", value: "12", icon: Clock, color: "warning" },
  { title: "مكتملة هذا الشهر", value: "28", icon: CheckCircle, color: "success" },
  { title: "مرفوضة", value: "3", icon: XCircle, color: "destructive" },
];

export default function AssetMovements() {
  const [showDialog, setShowDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter data
  const filteredMovements = mockMovements.filter((movement) => {
    if (filterType !== "all" && movement.type !== filterType) return false;
    if (filterStatus !== "all" && movement.status !== filterStatus) return false;
    return true;
  });

  const columns: Column<typeof mockMovements[0]>[] = [
    {
      key: "movementNumber",
      title: "رقم الحركة",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "assetName",
      title: "الأصل",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.assetCode}</p>
        </div>
      ),
    },
    {
      key: "type",
      title: "نوع الحركة",
      render: (value) => (
        <Badge variant="outline" className={movementTypeMap[value]?.color}>
          {movementTypeMap[value]?.label}
        </Badge>
      ),
    },
    {
      key: "fromLocation",
      title: "من",
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "toLocation",
      title: "إلى",
      render: (value) => (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: "requestDate",
      title: "تاريخ الطلب",
      render: (value) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "requestedBy",
      title: "مقدم الطلب",
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={movementStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedMovement(null);
    setShowDialog(true);
  };

  const handleView = (movement: any) => {
    setSelectedMovement(movement);
    setShowApproveDialog(true);
  };

  const handleEdit = (movement: any) => {
    setSelectedMovement(movement);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMovement) {
      toast.success("تم تحديث الحركة بنجاح");
    } else {
      toast.success("تم إنشاء طلب الحركة بنجاح");
    }
    setShowDialog(false);
    setSelectedMovement(null);
  };

  const handleApprove = () => {
    toast.success(`تم اعتماد الحركة ${selectedMovement?.movementNumber}`);
    setShowApproveDialog(false);
    setSelectedMovement(null);
  };

  const handleReject = () => {
    toast.error(`تم رفض الحركة ${selectedMovement?.movementNumber}`);
    setShowApproveDialog(false);
    setSelectedMovement(null);
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>نوع الحركة</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {Object.entries(movementTypeMap).map(([key, { label }]) => (
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
                  {Object.entries(movementStatusMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filteredMovements}
        columns={columns}
        title="حركات الأصول"
        description="سجل جميع حركات نقل واستبعاد وصيانة الأصول"
        searchPlaceholder="بحث برقم الحركة أو اسم الأصل..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد حركات مسجلة"
      />

      {/* Add/Edit Movement Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMovement ? "تعديل حركة" : "طلب حركة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {selectedMovement
                ? "قم بتعديل بيانات الحركة"
                : "أدخل بيانات طلب الحركة الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset">الأصل *</Label>
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
                <Label htmlFor="type">نوع الحركة *</Label>
                <Select defaultValue={selectedMovement?.type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(movementTypeMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromLocation">من الموقع *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">المستودع الرئيسي</SelectItem>
                    <SelectItem value="station1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="station2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="workshop">ورشة الصيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toLocation">إلى الموقع *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">المستودع الرئيسي</SelectItem>
                    <SelectItem value="station1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="station2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="workshop">ورشة الصيانة</SelectItem>
                    <SelectItem value="disposal">مستودع الأصول المستبعدة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestDate">تاريخ الطلب</Label>
                <Input
                  id="requestDate"
                  type="date"
                  defaultValue={selectedMovement?.requestDate || new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDate">التاريخ المتوقع للتنفيذ</Label>
                <Input
                  id="expectedDate"
                  type="date"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reason">سبب الحركة *</Label>
                <Textarea
                  id="reason"
                  placeholder="أدخل سبب طلب الحركة"
                  defaultValue={selectedMovement?.reason}
                  rows={3}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedMovement ? "حفظ التغييرات" : "إرسال الطلب"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الحركة</DialogTitle>
            <DialogDescription>
              مراجعة واعتماد طلب الحركة
            </DialogDescription>
          </DialogHeader>
          {selectedMovement && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الحركة</p>
                  <p className="font-mono font-medium">{selectedMovement.movementNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نوع الحركة</p>
                  <Badge variant="outline" className={movementTypeMap[selectedMovement.type]?.color}>
                    {movementTypeMap[selectedMovement.type]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأصل</p>
                  <p className="font-medium">{selectedMovement.assetName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <StatusBadge status={selectedMovement.status} statusMap={movementStatusMap} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">من</p>
                  <p className="font-medium">{selectedMovement.fromLocation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">إلى</p>
                  <p className="font-medium">{selectedMovement.toLocation}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">السبب</p>
                <p className="font-medium">{selectedMovement.reason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              إغلاق
            </Button>
            {selectedMovement?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  <XCircle className="w-4 h-4 ml-2" />
                  رفض
                </Button>
                <Button className="gradient-energy" onClick={handleApprove}>
                  <CheckCircle className="w-4 h-4 ml-2" />
                  اعتماد
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
