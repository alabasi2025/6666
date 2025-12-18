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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Warehouse,
  MapPin,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Building2,
  Boxes,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const warehouseStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  inactive: { label: "غير نشط", variant: "secondary" },
  maintenance: { label: "صيانة", variant: "warning" },
  full: { label: "ممتلئ", variant: "destructive" },
};

// Warehouse type mapping
const warehouseTypeMap: Record<string, string> = {
  main: "رئيسي",
  branch: "فرعي",
  transit: "عبور",
  spare_parts: "قطع غيار",
  consumables: "مستهلكات",
  equipment: "معدات",
};

// Mock warehouses data
const mockWarehouses = [
  {
    id: 1,
    code: "WH-001",
    name: "المستودع الرئيسي",
    type: "main",
    status: "active",
    location: "محطة التوليد الرئيسية",
    address: "الرياض - المنطقة الصناعية",
    capacity: 10000,
    usedCapacity: 7500,
    itemsCount: 1250,
    categoriesCount: 45,
    manager: "أحمد محمد",
    phone: "0501234567",
    lastInventory: "2024-05-15",
  },
  {
    id: 2,
    code: "WH-002",
    name: "مستودع قطع الغيار",
    type: "spare_parts",
    status: "active",
    location: "محطة التوليد الرئيسية",
    address: "الرياض - المنطقة الصناعية",
    capacity: 5000,
    usedCapacity: 3200,
    itemsCount: 850,
    categoriesCount: 32,
    manager: "خالد عمر",
    phone: "0507654321",
    lastInventory: "2024-05-20",
  },
  {
    id: 3,
    code: "WH-003",
    name: "مستودع المحطة الشمالية",
    type: "branch",
    status: "active",
    location: "محطة التوزيع الشمالية",
    address: "الدمام - الحي الصناعي",
    capacity: 3000,
    usedCapacity: 2100,
    itemsCount: 420,
    categoriesCount: 28,
    manager: "سالم أحمد",
    phone: "0509876543",
    lastInventory: "2024-05-10",
  },
  {
    id: 4,
    code: "WH-004",
    name: "مستودع المستهلكات",
    type: "consumables",
    status: "maintenance",
    location: "محطة التوليد الرئيسية",
    address: "الرياض - المنطقة الصناعية",
    capacity: 2000,
    usedCapacity: 1800,
    itemsCount: 320,
    categoriesCount: 15,
    manager: "محمد علي",
    phone: "0503456789",
    lastInventory: "2024-04-25",
  },
  {
    id: 5,
    code: "WH-005",
    name: "مستودع العبور",
    type: "transit",
    status: "active",
    location: "المقر الرئيسي",
    address: "الرياض - طريق الملك فهد",
    capacity: 1500,
    usedCapacity: 450,
    itemsCount: 85,
    categoriesCount: 12,
    manager: "فهد سعد",
    phone: "0502345678",
    lastInventory: "2024-06-01",
  },
];

// Stats
const stats = [
  { title: "إجمالي المستودعات", value: "8", icon: Warehouse, color: "primary" },
  { title: "إجمالي الأصناف", value: "2,925", icon: Package, color: "success" },
  { title: "نسبة الإشغال", value: "68%", icon: BarChart3, color: "warning" },
  { title: "تحت الحد الأدنى", value: "45", icon: AlertTriangle, color: "destructive" },
];

export default function Warehouses() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const columns: Column<typeof mockWarehouses[0]>[] = [
    {
      key: "code",
      title: "الرمز",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "name",
      title: "اسم المستودع",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {row.location}
          </p>
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => (
        <Badge variant="outline">
          {warehouseTypeMap[value] || value}
        </Badge>
      ),
    },
    {
      key: "usedCapacity",
      title: "الإشغال",
      render: (value, row) => {
        const percentage = Math.round((value / row.capacity) * 100);
        const color = percentage >= 90 ? "destructive" : percentage >= 70 ? "warning" : "success";
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="ltr-nums">{percentage}%</span>
              <span className="text-muted-foreground ltr-nums">{value.toLocaleString()} / {row.capacity.toLocaleString()}</span>
            </div>
            <Progress value={percentage} className={cn(
              "h-2",
              color === "destructive" && "[&>div]:bg-destructive",
              color === "warning" && "[&>div]:bg-warning",
              color === "success" && "[&>div]:bg-success"
            )} />
          </div>
        );
      },
    },
    {
      key: "itemsCount",
      title: "الأصناف",
      render: (value, row) => (
        <div className="text-center">
          <p className="font-bold ltr-nums">{value.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{row.categoriesCount} تصنيف</p>
        </div>
      ),
    },
    {
      key: "manager",
      title: "المسؤول",
      render: (value, row) => (
        <div>
          <p className="text-sm">{value}</p>
          <p className="text-xs text-muted-foreground ltr-nums">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "lastInventory",
      title: "آخر جرد",
      render: (value) => (
        <span className="text-sm">{new Date(value).toLocaleDateString("ar-SA")}</span>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={warehouseStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedWarehouse(null);
    setShowDialog(true);
  };

  const handleView = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowDetailsDialog(true);
  };

  const handleEdit = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWarehouse) {
      toast.success("تم تحديث بيانات المستودع بنجاح");
    } else {
      toast.success("تم إضافة المستودع بنجاح");
    }
    setShowDialog(false);
    setSelectedWarehouse(null);
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

      {/* Data Table */}
      <DataTable
        data={mockWarehouses}
        columns={columns}
        title="إدارة المستودعات"
        description="عرض وإدارة جميع المستودعات ومواقع التخزين"
        searchPlaceholder="بحث بالاسم أو الرمز..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد مستودعات"
      />

      {/* Add/Edit Warehouse Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWarehouse ? "تعديل بيانات المستودع" : "إضافة مستودع جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedWarehouse
                ? "قم بتعديل بيانات المستودع"
                : "أدخل بيانات المستودع الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز المستودع *</Label>
                <Input
                  id="code"
                  placeholder="WH-XXX"
                  defaultValue={selectedWarehouse?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">اسم المستودع *</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسم المستودع"
                  defaultValue={selectedWarehouse?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">نوع المستودع *</Label>
                <Select defaultValue={selectedWarehouse?.type || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(warehouseTypeMap).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">الحالة *</Label>
                <Select defaultValue={selectedWarehouse?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(warehouseStatusMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="3">محطة التوزيع الجنوبية</SelectItem>
                    <SelectItem value="4">المقر الرئيسي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">السعة الإجمالية</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="0"
                  defaultValue={selectedWarehouse?.capacity}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  placeholder="أدخل العنوان التفصيلي"
                  defaultValue={selectedWarehouse?.address}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">المسؤول</Label>
                <Input
                  id="manager"
                  placeholder="اسم المسؤول"
                  defaultValue={selectedWarehouse?.manager}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  placeholder="05XXXXXXXX"
                  defaultValue={selectedWarehouse?.phone}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedWarehouse ? "حفظ التغييرات" : "إضافة المستودع"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Warehouse Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل المستودع</DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/10">
                  <Warehouse className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedWarehouse.name}</h3>
                  <p className="text-muted-foreground font-mono">{selectedWarehouse.code}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedWarehouse.status} statusMap={warehouseStatusMap} />
                    <Badge variant="outline">{warehouseTypeMap[selectedWarehouse.type]}</Badge>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Boxes className="w-6 h-6 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedWarehouse.itemsCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">صنف</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Package className="w-6 h-6 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedWarehouse.categoriesCount}</p>
                    <p className="text-xs text-muted-foreground">تصنيف</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto text-warning mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{Math.round((selectedWarehouse.usedCapacity / selectedWarehouse.capacity) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">نسبة الإشغال</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-6 h-6 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold ltr-nums">{selectedWarehouse.capacity.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">السعة الكلية</p>
                  </CardContent>
                </Card>
              </div>

              {/* Capacity Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">سعة التخزين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>المستخدم: <span className="font-bold ltr-nums">{selectedWarehouse.usedCapacity.toLocaleString()}</span></span>
                      <span>المتاح: <span className="font-bold ltr-nums">{(selectedWarehouse.capacity - selectedWarehouse.usedCapacity).toLocaleString()}</span></span>
                    </div>
                    <Progress 
                      value={(selectedWarehouse.usedCapacity / selectedWarehouse.capacity) * 100} 
                      className="h-3"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الموقع</Label>
                  <p className="font-medium">{selectedWarehouse.location}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p className="font-medium">{selectedWarehouse.address}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">المسؤول</Label>
                  <p className="font-medium">{selectedWarehouse.manager}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">رقم الهاتف</Label>
                  <p className="font-medium ltr-nums">{selectedWarehouse.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">آخر جرد</Label>
                  <p className="font-medium">{new Date(selectedWarehouse.lastInventory).toLocaleDateString("ar-SA")}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy" onClick={() => { setShowDetailsDialog(false); handleEdit(selectedWarehouse); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
