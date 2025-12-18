import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FolderTree,
  Package,
  AlertTriangle,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock categories data
const mockCategories = [
  {
    id: 1,
    code: "CAT-001",
    nameAr: "محولات",
    nameEn: "Transformers",
    parentId: null,
    parentName: null,
    depreciationRate: 4,
    usefulLife: 25,
    accountCode: "1510",
    accountName: "المحولات الكهربائية",
    assetsCount: 45,
    totalValue: "125000000",
    isActive: true,
    description: "المحولات الكهربائية بجميع أنواعها وقدراتها",
  },
  {
    id: 2,
    code: "CAT-002",
    nameAr: "مولدات",
    nameEn: "Generators",
    parentId: null,
    parentName: null,
    depreciationRate: 5,
    usefulLife: 20,
    accountCode: "1520",
    accountName: "المولدات الكهربائية",
    assetsCount: 28,
    totalValue: "85000000",
    isActive: true,
    description: "مولدات الكهرباء الرئيسية والاحتياطية",
  },
  {
    id: 3,
    code: "CAT-003",
    nameAr: "لوحات كهربائية",
    nameEn: "Electrical Panels",
    parentId: null,
    parentName: null,
    depreciationRate: 6.67,
    usefulLife: 15,
    accountCode: "1530",
    accountName: "اللوحات الكهربائية",
    assetsCount: 120,
    totalValue: "45000000",
    isActive: true,
    description: "لوحات التوزيع والتحكم الكهربائية",
  },
  {
    id: 4,
    code: "CAT-004",
    nameAr: "كابلات",
    nameEn: "Cables",
    parentId: null,
    parentName: null,
    depreciationRate: 5,
    usefulLife: 20,
    accountCode: "1540",
    accountName: "الكابلات الكهربائية",
    assetsCount: 350,
    totalValue: "32000000",
    isActive: true,
    description: "الكابلات الكهربائية بجميع المقاسات",
  },
  {
    id: 5,
    code: "CAT-005",
    nameAr: "قواطع",
    nameEn: "Circuit Breakers",
    parentId: 3,
    parentName: "لوحات كهربائية",
    depreciationRate: 10,
    usefulLife: 10,
    accountCode: "1531",
    accountName: "قواطع الدائرة",
    assetsCount: 580,
    totalValue: "18000000",
    isActive: true,
    description: "قواطع الدائرة الكهربائية",
  },
  {
    id: 6,
    code: "CAT-006",
    nameAr: "عدادات",
    nameEn: "Meters",
    parentId: null,
    parentName: null,
    depreciationRate: 10,
    usefulLife: 10,
    accountCode: "1550",
    accountName: "العدادات الكهربائية",
    assetsCount: 15000,
    totalValue: "75000000",
    isActive: true,
    description: "عدادات قياس الاستهلاك الكهربائي",
  },
  {
    id: 7,
    code: "CAT-007",
    nameAr: "مكثفات",
    nameEn: "Capacitors",
    parentId: null,
    parentName: null,
    depreciationRate: 6.67,
    usefulLife: 15,
    accountCode: "1560",
    accountName: "المكثفات الكهربائية",
    assetsCount: 85,
    totalValue: "12000000",
    isActive: true,
    description: "مكثفات تصحيح معامل القدرة",
  },
  {
    id: 8,
    code: "CAT-008",
    nameAr: "أجهزة قياس",
    nameEn: "Measuring Devices",
    parentId: null,
    parentName: null,
    depreciationRate: 20,
    usefulLife: 5,
    accountCode: "1570",
    accountName: "أجهزة القياس",
    assetsCount: 250,
    totalValue: "8500000",
    isActive: true,
    description: "أجهزة القياس والاختبار الكهربائية",
  },
];

// Stats
const stats = [
  { title: "إجمالي الفئات", value: "8", icon: FolderTree, color: "primary" },
  { title: "إجمالي الأصول", value: "16,458", icon: Package, color: "success" },
  { title: "متوسط الإهلاك", value: "8.4%", icon: Percent, color: "warning" },
];

export default function AssetCategories() {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const columns: Column<typeof mockCategories[0]>[] = [
    {
      key: "code",
      title: "الرمز",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "nameAr",
      title: "اسم الفئة",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.parentName && (
            <p className="text-xs text-muted-foreground">← {row.parentName}</p>
          )}
        </div>
      ),
    },
    {
      key: "assetsCount",
      title: "عدد الأصول",
      align: "center",
      render: (value) => (
        <Badge variant="secondary" className="font-mono">
          {value.toLocaleString()}
        </Badge>
      ),
    },
    {
      key: "totalValue",
      title: "إجمالي القيمة",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums">
          {Number(value).toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "depreciationRate",
      title: "معدل الإهلاك",
      align: "center",
      render: (value) => (
        <span className="font-mono">{value}%</span>
      ),
    },
    {
      key: "usefulLife",
      title: "العمر الإنتاجي",
      align: "center",
      render: (value) => (
        <span>{value} سنة</span>
      ),
    },
    {
      key: "accountCode",
      title: "الحساب المحاسبي",
      render: (value, row) => (
        <div>
          <p className="font-mono text-sm">{value}</p>
          <p className="text-xs text-muted-foreground">{row.accountName}</p>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "الحالة",
      align: "center",
      render: (value) => (
        <Badge
          variant="outline"
          className={cn(
            value
              ? "bg-success/20 text-success border-success/30"
              : "bg-muted text-muted-foreground"
          )}
        >
          {value ? "نشط" : "غير نشط"}
        </Badge>
      ),
    },
  ];

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowDialog(true);
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setShowDialog(true);
  };

  const handleDelete = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      toast.success("تم تحديث الفئة بنجاح");
    } else {
      toast.success("تم إضافة الفئة بنجاح");
    }
    setShowDialog(false);
    setSelectedCategory(null);
  };

  const confirmDelete = () => {
    toast.success(`تم حذف الفئة ${selectedCategory?.nameAr} بنجاح`);
    setShowDeleteDialog(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
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
        data={mockCategories}
        columns={columns}
        title="فئات الأصول"
        description="تصنيف الأصول حسب النوع مع إعدادات الإهلاك"
        searchPlaceholder="بحث بالرمز أو الاسم..."
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد فئات مسجلة"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "تعديل فئة" : "إضافة فئة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "قم بتعديل بيانات الفئة"
                : "أدخل بيانات الفئة الجديدة"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الفئة *</Label>
                <Input
                  id="code"
                  placeholder="CAT-XXX"
                  defaultValue={selectedCategory?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                <Input
                  id="nameAr"
                  placeholder="أدخل اسم الفئة"
                  defaultValue={selectedCategory?.nameAr}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  placeholder="Enter category name"
                  defaultValue={selectedCategory?.nameEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent">الفئة الأم</Label>
                <Select defaultValue={selectedCategory?.parentId?.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الأم (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون فئة أم</SelectItem>
                    {mockCategories
                      .filter((c) => c.id !== selectedCategory?.id)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nameAr}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depreciationRate">معدل الإهلاك السنوي (%)</Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  step="0.01"
                  placeholder="10"
                  defaultValue={selectedCategory?.depreciationRate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usefulLife">العمر الإنتاجي (سنوات)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  placeholder="10"
                  defaultValue={selectedCategory?.usefulLife}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountCode">رمز الحساب المحاسبي</Label>
                <Input
                  id="accountCode"
                  placeholder="1510"
                  defaultValue={selectedCategory?.accountCode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">اسم الحساب المحاسبي</Label>
                <Input
                  id="accountName"
                  placeholder="اسم الحساب"
                  defaultValue={selectedCategory?.accountName}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف الفئة"
                  defaultValue={selectedCategory?.description}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  defaultChecked={selectedCategory?.isActive ?? true}
                />
                <Label htmlFor="isActive">فئة نشطة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedCategory ? "حفظ التغييرات" : "إضافة الفئة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الفئة "{selectedCategory?.nameAr}"؟
              {selectedCategory?.assetsCount > 0 && (
                <span className="block mt-2 text-warning">
                  تحذير: هذه الفئة تحتوي على {selectedCategory?.assetsCount} أصل
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف الفئة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
