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
import {
  Package,
  Barcode,
  Tag,
  Warehouse,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Boxes,
  History,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const itemStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  inactive: { label: "غير نشط", variant: "secondary" },
  discontinued: { label: "متوقف", variant: "destructive" },
  pending: { label: "قيد المراجعة", variant: "warning" },
};

// Stock status mapping
const stockStatusMap: Record<string, { label: string; color: string }> = {
  in_stock: { label: "متوفر", color: "text-success" },
  low_stock: { label: "منخفض", color: "text-warning" },
  out_of_stock: { label: "نفذ", color: "text-destructive" },
  overstock: { label: "فائض", color: "text-primary" },
};

// Category mapping
const categoryMap: Record<string, string> = {
  electrical: "كهربائي",
  mechanical: "ميكانيكي",
  safety: "سلامة",
  tools: "أدوات",
  consumables: "مستهلكات",
  spare_parts: "قطع غيار",
  cables: "كابلات",
  transformers: "محولات",
};

// Mock items data
const mockItems = [
  {
    id: 1,
    code: "ITM-001",
    barcode: "6281000000001",
    name: "كابل نحاس 16مم",
    nameEn: "Copper Cable 16mm",
    category: "cables",
    unit: "متر",
    status: "active",
    stockStatus: "in_stock",
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    reorderPoint: 750,
    avgCost: 45.50,
    lastCost: 48.00,
    warehouse: "المستودع الرئيسي",
    location: "R-A-01",
    supplier: "شركة الكابلات السعودية",
    lastMovement: "2024-06-10",
  },
  {
    id: 2,
    code: "ITM-002",
    barcode: "6281000000002",
    name: "قاطع كهربائي 100A",
    nameEn: "Circuit Breaker 100A",
    category: "electrical",
    unit: "قطعة",
    status: "active",
    stockStatus: "low_stock",
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    avgCost: 350.00,
    lastCost: 365.00,
    warehouse: "مستودع قطع الغيار",
    location: "R-B-05",
    supplier: "شركة المعدات الكهربائية",
    lastMovement: "2024-06-08",
  },
  {
    id: 3,
    code: "ITM-003",
    barcode: "6281000000003",
    name: "زيت محولات",
    nameEn: "Transformer Oil",
    category: "consumables",
    unit: "لتر",
    status: "active",
    stockStatus: "in_stock",
    currentStock: 5000,
    minStock: 1000,
    maxStock: 10000,
    reorderPoint: 2000,
    avgCost: 12.00,
    lastCost: 12.50,
    warehouse: "المستودع الرئيسي",
    location: "R-C-10",
    supplier: "شركة الزيوت الصناعية",
    lastMovement: "2024-06-05",
  },
  {
    id: 4,
    code: "ITM-004",
    barcode: "6281000000004",
    name: "مفتاح ربط كهربائي",
    nameEn: "Electric Wrench",
    category: "tools",
    unit: "قطعة",
    status: "active",
    stockStatus: "out_of_stock",
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    avgCost: 280.00,
    lastCost: 295.00,
    warehouse: "مستودع قطع الغيار",
    location: "R-D-02",
    supplier: "شركة الأدوات الصناعية",
    lastMovement: "2024-05-28",
  },
  {
    id: 5,
    code: "ITM-005",
    barcode: "6281000000005",
    name: "عازل حراري",
    nameEn: "Thermal Insulator",
    category: "safety",
    unit: "متر مربع",
    status: "active",
    stockStatus: "overstock",
    currentStock: 1200,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    avgCost: 85.00,
    lastCost: 82.00,
    warehouse: "المستودع الرئيسي",
    location: "R-E-08",
    supplier: "شركة مواد العزل",
    lastMovement: "2024-06-12",
  },
];

// Stats
const stats = [
  { title: "إجمالي الأصناف", value: "2,925", icon: Package, color: "primary" },
  { title: "تحت الحد الأدنى", value: "45", icon: AlertTriangle, color: "destructive" },
  { title: "قيمة المخزون", value: "4.2M", icon: DollarSign, color: "success" },
  { title: "حركات اليوم", value: "128", icon: TrendingUp, color: "warning" },
];

export default function Items() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const columns: Column<typeof mockItems[0]>[] = [
    {
      key: "code",
      title: "الرمز",
      render: (value, row) => (
        <div>
          <span className="font-mono text-primary">{value}</span>
          <p className="text-xs text-muted-foreground ltr-nums">{row.barcode}</p>
        </div>
      ),
    },
    {
      key: "name",
      title: "اسم الصنف",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.nameEn}</p>
        </div>
      ),
    },
    {
      key: "category",
      title: "التصنيف",
      render: (value) => (
        <Badge variant="outline">
          {categoryMap[value] || value}
        </Badge>
      ),
    },
    {
      key: "currentStock",
      title: "الرصيد الحالي",
      render: (value, row) => {
        const stockStatus = row.stockStatus;
        const statusInfo = stockStatusMap[stockStatus];
        return (
          <div className="text-center">
            <p className={cn("font-bold ltr-nums", statusInfo?.color)}>{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{row.unit}</p>
          </div>
        );
      },
    },
    {
      key: "stockStatus",
      title: "حالة المخزون",
      render: (value) => {
        const statusInfo = stockStatusMap[value];
        const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
          in_stock: "default",
          low_stock: "outline",
          out_of_stock: "destructive",
          overstock: "secondary",
        };
        return (
          <Badge variant={variants[value] || "default"} className={cn(
            value === "in_stock" && "bg-success/10 text-success border-success/20",
            value === "low_stock" && "bg-warning/10 text-warning border-warning/20"
          )}>
            {statusInfo?.label}
          </Badge>
        );
      },
    },
    {
      key: "avgCost",
      title: "متوسط التكلفة",
      render: (value) => (
        <span className="font-medium ltr-nums">{value.toFixed(2)} ر.س</span>
      ),
    },
    {
      key: "warehouse",
      title: "المستودع",
      render: (value, row) => (
        <div>
          <p className="text-sm">{value}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.location}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={itemStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedItem(null);
    setShowDialog(true);
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setShowDetailsDialog(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      toast.success("تم تحديث بيانات الصنف بنجاح");
    } else {
      toast.success("تم إضافة الصنف بنجاح");
    }
    setShowDialog(false);
    setSelectedItem(null);
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
        data={mockItems}
        columns={columns}
        title="الأصناف"
        description="إدارة جميع الأصناف والمواد في المخزون"
        searchPlaceholder="بحث بالاسم أو الرمز أو الباركود..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد أصناف"
      />

      {/* Add/Edit Item Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "تعديل بيانات الصنف" : "إضافة صنف جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem
                ? "قم بتعديل بيانات الصنف"
                : "أدخل بيانات الصنف الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="stock">المخزون</TabsTrigger>
                <TabsTrigger value="pricing">التسعير</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">رمز الصنف *</Label>
                    <Input
                      id="code"
                      placeholder="ITM-XXX"
                      defaultValue={selectedItem?.code}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">الباركود</Label>
                    <Input
                      id="barcode"
                      placeholder="أدخل الباركود"
                      defaultValue={selectedItem?.barcode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الصنف (عربي) *</Label>
                    <Input
                      id="name"
                      placeholder="أدخل اسم الصنف"
                      defaultValue={selectedItem?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">اسم الصنف (إنجليزي)</Label>
                    <Input
                      id="nameEn"
                      placeholder="Enter item name"
                      defaultValue={selectedItem?.nameEn}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف *</Label>
                    <Select defaultValue={selectedItem?.category || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryMap).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">وحدة القياس *</Label>
                    <Select defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الوحدة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">قطعة</SelectItem>
                        <SelectItem value="meter">متر</SelectItem>
                        <SelectItem value="sqm">متر مربع</SelectItem>
                        <SelectItem value="liter">لتر</SelectItem>
                        <SelectItem value="kg">كيلوجرام</SelectItem>
                        <SelectItem value="box">صندوق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      placeholder="أدخل وصف الصنف"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">المستودع *</Label>
                    <Select defaultValue="">
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
                  <div className="space-y-2">
                    <Label htmlFor="location">موقع التخزين</Label>
                    <Input
                      id="location"
                      placeholder="R-A-01"
                      defaultValue={selectedItem?.location}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">الحد الأدنى</Label>
                    <Input
                      id="minStock"
                      type="number"
                      placeholder="0"
                      defaultValue={selectedItem?.minStock}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">الحد الأقصى</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      placeholder="0"
                      defaultValue={selectedItem?.maxStock}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderPoint">نقطة إعادة الطلب</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      placeholder="0"
                      defaultValue={selectedItem?.reorderPoint}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">الرصيد الافتتاحي</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      placeholder="0"
                      defaultValue={selectedItem?.currentStock}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="pricing" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="avgCost">متوسط التكلفة</Label>
                    <Input
                      id="avgCost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={selectedItem?.avgCost}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastCost">آخر تكلفة</Label>
                    <Input
                      id="lastCost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      defaultValue={selectedItem?.lastCost}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">المورد الافتراضي</Label>
                    <Select defaultValue="">
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">شركة الكابلات السعودية</SelectItem>
                        <SelectItem value="2">شركة المعدات الكهربائية</SelectItem>
                        <SelectItem value="3">شركة الأدوات الصناعية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedItem ? "حفظ التغييرات" : "إضافة الصنف"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Item Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الصنف</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">المعلومات</TabsTrigger>
                <TabsTrigger value="stock">المخزون</TabsTrigger>
                <TabsTrigger value="movements">الحركات</TabsTrigger>
                <TabsTrigger value="history">السجل</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-primary/10">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                    <p className="text-muted-foreground">{selectedItem.nameEn}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-primary">{selectedItem.code}</span>
                      <Badge variant="outline">{categoryMap[selectedItem.category]}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">الباركود</Label>
                    <p className="font-mono ltr-nums">{selectedItem.barcode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">وحدة القياس</Label>
                    <p className="font-medium">{selectedItem.unit}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">المستودع</Label>
                    <p className="font-medium">{selectedItem.warehouse}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">موقع التخزين</Label>
                    <p className="font-mono">{selectedItem.location}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">المورد</Label>
                    <p className="font-medium">{selectedItem.supplier}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">آخر حركة</Label>
                    <p className="font-medium">{new Date(selectedItem.lastMovement).toLocaleDateString("ar-SA")}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stock" className="space-y-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Boxes className="w-6 h-6 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold ltr-nums">{selectedItem.currentStock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">الرصيد الحالي</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingDown className="w-6 h-6 mx-auto text-destructive mb-2" />
                      <p className="text-2xl font-bold ltr-nums">{selectedItem.minStock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">الحد الأدنى</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto text-success mb-2" />
                      <p className="text-2xl font-bold ltr-nums">{selectedItem.maxStock.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">الحد الأقصى</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto text-warning mb-2" />
                      <p className="text-2xl font-bold ltr-nums">{selectedItem.reorderPoint.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">نقطة إعادة الطلب</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">التكلفة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-muted-foreground">متوسط التكلفة</Label>
                        <p className="text-xl font-bold ltr-nums">{selectedItem.avgCost.toFixed(2)} ر.س</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">آخر تكلفة</Label>
                        <p className="text-xl font-bold ltr-nums">{selectedItem.lastCost.toFixed(2)} ر.س</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">قيمة المخزون</Label>
                        <p className="text-xl font-bold text-primary ltr-nums">
                          {(selectedItem.currentStock * selectedItem.avgCost).toLocaleString()} ر.س
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="movements" className="py-4">
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>سيتم عرض آخر حركات الصنف هنا</p>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="py-4">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>سيتم عرض سجل التغييرات هنا</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy" onClick={() => { setShowDetailsDialog(false); handleEdit(selectedItem); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
