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
import { toast } from "sonner";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RefreshCw,
  Package,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  User,
  Warehouse,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Movement type mapping
const movementTypeMap: Record<string, { label: string; icon: any; color: string }> = {
  receive: { label: "استلام", icon: ArrowDownToLine, color: "text-success" },
  issue: { label: "صرف", icon: ArrowUpFromLine, color: "text-destructive" },
  transfer: { label: "تحويل", icon: ArrowLeftRight, color: "text-primary" },
  adjustment: { label: "تعديل", icon: RefreshCw, color: "text-warning" },
  return: { label: "مرتجع", icon: ArrowDownToLine, color: "text-info" },
};

// Status mapping
const movementStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  completed: { label: "مكتمل", variant: "success" },
  pending: { label: "قيد الانتظار", variant: "warning" },
  cancelled: { label: "ملغي", variant: "destructive" },
  draft: { label: "مسودة", variant: "secondary" },
};

// Mock movements data
const mockMovements = [
  {
    id: 1,
    code: "MOV-2024-001",
    type: "receive",
    status: "completed",
    date: "2024-06-15T10:30:00",
    itemCode: "ITM-001",
    itemName: "كابل نحاس 16مم",
    quantity: 500,
    unit: "متر",
    fromWarehouse: null,
    toWarehouse: "المستودع الرئيسي",
    reference: "PO-2024-125",
    referenceType: "أمر شراء",
    cost: 22750.00,
    createdBy: "أحمد محمد",
    notes: "استلام من المورد",
  },
  {
    id: 2,
    code: "MOV-2024-002",
    type: "issue",
    status: "completed",
    date: "2024-06-15T14:00:00",
    itemCode: "ITM-002",
    itemName: "قاطع كهربائي 100A",
    quantity: 5,
    unit: "قطعة",
    fromWarehouse: "مستودع قطع الغيار",
    toWarehouse: null,
    reference: "WO-2024-089",
    referenceType: "أمر عمل",
    cost: 1825.00,
    createdBy: "خالد عمر",
    notes: "صرف لأمر العمل",
  },
  {
    id: 3,
    code: "MOV-2024-003",
    type: "transfer",
    status: "pending",
    date: "2024-06-15T16:30:00",
    itemCode: "ITM-003",
    itemName: "زيت محولات",
    quantity: 200,
    unit: "لتر",
    fromWarehouse: "المستودع الرئيسي",
    toWarehouse: "مستودع المحطة الشمالية",
    reference: "TR-2024-015",
    referenceType: "طلب تحويل",
    cost: 2500.00,
    createdBy: "سالم أحمد",
    notes: "تحويل للمحطة الشمالية",
  },
  {
    id: 4,
    code: "MOV-2024-004",
    type: "adjustment",
    status: "completed",
    date: "2024-06-14T09:00:00",
    itemCode: "ITM-005",
    itemName: "عازل حراري",
    quantity: -50,
    unit: "متر مربع",
    fromWarehouse: "المستودع الرئيسي",
    toWarehouse: null,
    reference: "ADJ-2024-008",
    referenceType: "تعديل جرد",
    cost: -4250.00,
    createdBy: "محمد علي",
    notes: "تعديل بناءً على الجرد الفعلي",
  },
  {
    id: 5,
    code: "MOV-2024-005",
    type: "return",
    status: "completed",
    date: "2024-06-13T11:15:00",
    itemCode: "ITM-004",
    itemName: "مفتاح ربط كهربائي",
    quantity: 2,
    unit: "قطعة",
    fromWarehouse: null,
    toWarehouse: "مستودع قطع الغيار",
    reference: "WO-2024-075",
    referenceType: "أمر عمل",
    cost: 590.00,
    createdBy: "فهد سعد",
    notes: "مرتجع من أمر العمل",
  },
];

// Stats
const stats = [
  { title: "حركات اليوم", value: "45", icon: RefreshCw, color: "primary" },
  { title: "استلام", value: "12", icon: ArrowDownToLine, color: "success" },
  { title: "صرف", value: "28", icon: ArrowUpFromLine, color: "destructive" },
  { title: "تحويل", value: "5", icon: ArrowLeftRight, color: "warning" },
];

export default function Movements() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [movementType, setMovementType] = useState<string>("receive");

  const columns: Column<typeof mockMovements[0]>[] = [
    {
      key: "code",
      title: "رقم الحركة",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => {
        const typeInfo = movementTypeMap[value];
        const Icon = typeInfo?.icon || Package;
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", typeInfo?.color)} />
            <span>{typeInfo?.label}</span>
          </div>
        );
      },
    },
    {
      key: "date",
      title: "التاريخ",
      render: (value) => (
        <div>
          <p className="text-sm">{new Date(value).toLocaleDateString("ar-SA")}</p>
          <p className="text-xs text-muted-foreground">{new Date(value).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      ),
    },
    {
      key: "itemName",
      title: "الصنف",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.itemCode}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "الكمية",
      render: (value, row) => (
        <div className={cn(
          "text-center font-bold ltr-nums",
          value > 0 ? "text-success" : "text-destructive"
        )}>
          <span>{value > 0 ? "+" : ""}{value.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground font-normal">{row.unit}</p>
        </div>
      ),
    },
    {
      key: "fromWarehouse",
      title: "من / إلى",
      render: (value, row) => (
        <div className="text-sm">
          {value && <p className="text-destructive">من: {value}</p>}
          {row.toWarehouse && <p className="text-success">إلى: {row.toWarehouse}</p>}
        </div>
      ),
    },
    {
      key: "reference",
      title: "المرجع",
      render: (value, row) => (
        <div>
          <p className="font-mono text-sm">{value}</p>
          <p className="text-xs text-muted-foreground">{row.referenceType}</p>
        </div>
      ),
    },
    {
      key: "cost",
      title: "التكلفة",
      render: (value) => (
        <span className={cn(
          "font-medium ltr-nums",
          value >= 0 ? "text-success" : "text-destructive"
        )}>
          {value.toLocaleString()} ر.س
        </span>
      ),
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
    toast.info(`عرض تفاصيل الحركة ${movement.code}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم تسجيل الحركة بنجاح");
    setShowDialog(false);
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setMovementType("receive"); setShowDialog(true); }} className="bg-success hover:bg-success/90">
          <ArrowDownToLine className="w-4 h-4 ml-2" />
          استلام
        </Button>
        <Button onClick={() => { setMovementType("issue"); setShowDialog(true); }} variant="destructive">
          <ArrowUpFromLine className="w-4 h-4 ml-2" />
          صرف
        </Button>
        <Button onClick={() => { setMovementType("transfer"); setShowDialog(true); }} className="gradient-energy">
          <ArrowLeftRight className="w-4 h-4 ml-2" />
          تحويل
        </Button>
        <Button onClick={() => { setMovementType("adjustment"); setShowDialog(true); }} variant="outline">
          <RefreshCw className="w-4 h-4 ml-2" />
          تعديل
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={mockMovements}
        columns={columns}
        title="حركات المخزون"
        description="تتبع جميع حركات المخزون (استلام، صرف، تحويل، تعديل)"
        searchPlaceholder="بحث برقم الحركة أو الصنف..."
        onAdd={handleAdd}
        onView={handleView}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد حركات"
      />

      {/* Add Movement Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {movementTypeMap[movementType]?.icon && (
                <span className={movementTypeMap[movementType]?.color}>
                  {(() => {
                    const Icon = movementTypeMap[movementType]?.icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </span>
              )}
              {movementType === "receive" && "استلام مخزون"}
              {movementType === "issue" && "صرف مخزون"}
              {movementType === "transfer" && "تحويل مخزون"}
              {movementType === "adjustment" && "تعديل مخزون"}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الحركة
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item">الصنف *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">كابل نحاس 16مم (ITM-001)</SelectItem>
                    <SelectItem value="2">قاطع كهربائي 100A (ITM-002)</SelectItem>
                    <SelectItem value="3">زيت محولات (ITM-003)</SelectItem>
                    <SelectItem value="4">مفتاح ربط كهربائي (ITM-004)</SelectItem>
                    <SelectItem value="5">عازل حراري (ITM-005)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="0"
                  required
                />
              </div>
              
              {(movementType === "issue" || movementType === "transfer" || movementType === "adjustment") && (
                <div className="space-y-2">
                  <Label htmlFor="fromWarehouse">من المستودع *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المستودع الرئيسي</SelectItem>
                      <SelectItem value="2">مستودع قطع الغيار</SelectItem>
                      <SelectItem value="3">مستودع المحطة الشمالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(movementType === "receive" || movementType === "transfer") && (
                <div className="space-y-2">
                  <Label htmlFor="toWarehouse">إلى المستودع *</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المستودع الرئيسي</SelectItem>
                      <SelectItem value="2">مستودع قطع الغيار</SelectItem>
                      <SelectItem value="3">مستودع المحطة الشمالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="reference">المرجع</Label>
                <Input
                  id="reference"
                  placeholder="رقم أمر الشراء أو أمر العمل"
                />
              </div>
              
              {movementType === "receive" && (
                <div className="space-y-2">
                  <Label htmlFor="cost">التكلفة</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              )}
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className={cn(
                movementType === "receive" && "bg-success hover:bg-success/90",
                movementType === "issue" && "bg-destructive hover:bg-destructive/90",
                movementType === "transfer" && "gradient-energy",
                movementType === "adjustment" && ""
              )}>
                تأكيد الحركة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
