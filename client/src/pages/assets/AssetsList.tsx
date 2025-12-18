import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wrench,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Asset status mapping
const assetStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  inactive: { label: "غير نشط", variant: "secondary" },
  maintenance: { label: "صيانة", variant: "warning" },
  disposed: { label: "مستبعد", variant: "destructive" },
  transferred: { label: "منقول", variant: "default" },
};

// Mock data for demo (will be replaced with real API data)
const mockAssets = [
  {
    id: 1,
    code: "AST-000001",
    nameAr: "محول كهربائي 500 كيلو فولت",
    categoryName: "محولات",
    stationName: "محطة التوليد الرئيسية",
    status: "active",
    purchaseDate: "2023-01-15",
    purchaseCost: "2500000",
    currentValue: "2250000",
    location: "المبنى A - الطابق 1",
  },
  {
    id: 2,
    code: "AST-000002",
    nameAr: "مولد ديزل احتياطي",
    categoryName: "مولدات",
    stationName: "محطة التوليد الرئيسية",
    status: "active",
    purchaseDate: "2022-06-20",
    purchaseCost: "1800000",
    currentValue: "1500000",
    location: "المبنى B - الطابق الأرضي",
  },
  {
    id: 3,
    code: "AST-000003",
    nameAr: "لوحة توزيع رئيسية",
    categoryName: "لوحات كهربائية",
    stationName: "محطة التوزيع الشمالية",
    status: "maintenance",
    purchaseDate: "2021-03-10",
    purchaseCost: "450000",
    currentValue: "350000",
    location: "غرفة التحكم",
  },
  {
    id: 4,
    code: "AST-000004",
    nameAr: "كابل نحاسي 1000 متر",
    categoryName: "كابلات",
    stationName: "محطة التوزيع الجنوبية",
    status: "active",
    purchaseDate: "2023-08-05",
    purchaseCost: "120000",
    currentValue: "115000",
    location: "المستودع الرئيسي",
  },
  {
    id: 5,
    code: "AST-000005",
    nameAr: "قاطع دائرة 220 فولت",
    categoryName: "قواطع",
    stationName: "محطة التوزيع الشمالية",
    status: "disposed",
    purchaseDate: "2019-11-25",
    purchaseCost: "85000",
    currentValue: "0",
    location: "مستبعد",
  },
  {
    id: 6,
    code: "AST-000006",
    nameAr: "عداد ذكي صناعي",
    categoryName: "عدادات",
    stationName: "محطة التوزيع الشرقية",
    status: "active",
    purchaseDate: "2024-01-10",
    purchaseCost: "25000",
    currentValue: "24000",
    location: "موقع العميل",
  },
  {
    id: 7,
    code: "AST-000007",
    nameAr: "محول جهد متوسط",
    categoryName: "محولات",
    stationName: "محطة التوليد الرئيسية",
    status: "active",
    purchaseDate: "2022-09-15",
    purchaseCost: "1200000",
    currentValue: "1050000",
    location: "المبنى A - الطابق 2",
  },
  {
    id: 8,
    code: "AST-000008",
    nameAr: "مكثف تصحيح معامل القدرة",
    categoryName: "مكثفات",
    stationName: "محطة التوزيع الغربية",
    status: "maintenance",
    purchaseDate: "2021-07-20",
    purchaseCost: "180000",
    currentValue: "140000",
    location: "غرفة المكثفات",
  },
];

// Stats cards data
const statsCards = [
  {
    title: "إجمالي الأصول",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "primary",
  },
  {
    title: "قيمة الأصول",
    value: "45.2M",
    change: "+8%",
    trend: "up",
    icon: TrendingUp,
    color: "success",
  },
  {
    title: "الإهلاك السنوي",
    value: "4.5M",
    change: "-3%",
    trend: "down",
    icon: TrendingDown,
    color: "warning",
  },
  {
    title: "تحت الصيانة",
    value: "23",
    change: "+5",
    trend: "up",
    icon: Wrench,
    color: "destructive",
  },
];

export default function AssetsList() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Filter data
  const filteredAssets = mockAssets.filter((asset) => {
    if (filterStatus !== "all" && asset.status !== filterStatus) return false;
    if (filterCategory !== "all" && asset.categoryName !== filterCategory) return false;
    return true;
  });

  // Get unique categories
  const categories = Array.from(new Set(mockAssets.map((a) => a.categoryName)));

  // Table columns
  const columns: Column<typeof mockAssets[0]>[] = [
    {
      key: "code",
      title: "رقم الأصل",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "nameAr",
      title: "اسم الأصل",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.location}</p>
        </div>
      ),
    },
    {
      key: "categoryName",
      title: "الفئة",
    },
    {
      key: "stationName",
      title: "المحطة",
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={assetStatusMap} />,
    },
    {
      key: "purchaseCost",
      title: "تكلفة الشراء",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums">
          {Number(value).toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "currentValue",
      title: "القيمة الحالية",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums text-success">
          {Number(value).toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "purchaseDate",
      title: "تاريخ الشراء",
      render: (value) => new Date(value).toLocaleDateString("ar-SA"),
    },
  ];

  const handleAdd = () => {
    setSelectedAsset(null);
    setShowAddDialog(true);
  };

  const handleView = (asset: any) => {
    setLocation(`/dashboard/assets/view/${asset.id}`);
  };

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setShowAddDialog(true);
  };

  const handleDelete = (asset: any) => {
    setSelectedAsset(asset);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast.success(`تم حذف الأصل ${selectedAsset?.code} بنجاح`);
    setShowDeleteDialog(false);
    setSelectedAsset(null);
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsset) {
      toast.success("تم تحديث الأصل بنجاح");
    } else {
      toast.success("تم إضافة الأصل بنجاح");
    }
    setShowAddDialog(false);
    setSelectedAsset(null);
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
  };

  const hasActiveFilters = filterStatus !== "all" || filterCategory !== "all";

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
            <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground ltr-nums">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        stat.trend === "up" ? "text-success" : "text-destructive"
                      )}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              تصفية النتائج
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 ml-1" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {Object.entries(assetStatusMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={filteredAssets}
        columns={columns}
        title="سجل الأصول الثابتة"
        description="قائمة بجميع الأصول المسجلة في النظام"
        searchPlaceholder="بحث برقم الأصل أو الاسم..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        onExport={() => toast.info("جاري تصدير البيانات...")}
        emptyMessage="لا توجد أصول مسجلة"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAsset ? "تعديل أصل" : "إضافة أصل جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedAsset
                ? "قم بتعديل بيانات الأصل"
                : "أدخل بيانات الأصل الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAsset}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رقم الأصل</Label>
                <Input
                  id="code"
                  placeholder="سيتم توليده تلقائياً"
                  defaultValue={selectedAsset?.code}
                  disabled={!selectedAsset}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الأصل *</Label>
                <Input
                  id="nameAr"
                  placeholder="أدخل اسم الأصل"
                  defaultValue={selectedAsset?.nameAr}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة *</Label>
                <Select defaultValue={selectedAsset?.categoryName || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="station">المحطة</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="station1">محطة التوليد الرئيسية</SelectItem>
                    <SelectItem value="station2">محطة التوزيع الشمالية</SelectItem>
                    <SelectItem value="station3">محطة التوزيع الجنوبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">تاريخ الشراء</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  defaultValue={selectedAsset?.purchaseDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseCost">تكلفة الشراء</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  placeholder="0.00"
                  defaultValue={selectedAsset?.purchaseCost}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">الرقم التسلسلي</Label>
                <Input
                  id="serialNumber"
                  placeholder="أدخل الرقم التسلسلي"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                <Input
                  id="manufacturer"
                  placeholder="أدخل اسم الشركة المصنعة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">الموديل</Label>
                <Input
                  id="model"
                  placeholder="أدخل الموديل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usefulLife">العمر الإنتاجي (سنوات)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  placeholder="10"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  placeholder="أدخل موقع الأصل"
                  defaultValue={selectedAsset?.location}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف الأصل"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedAsset ? "حفظ التغييرات" : "إضافة الأصل"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الأصل "{selectedAsset?.nameAr}"؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف الأصل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
