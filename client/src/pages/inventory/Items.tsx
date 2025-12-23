// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
import { toast } from "sonner";
import {
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const itemTypeMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  spare_part: { label: "قطع غيار", variant: "default" },
  consumable: { label: "مستهلكات", variant: "secondary" },
  raw_material: { label: "مواد خام", variant: "warning" },
  finished_good: { label: "منتج نهائي", variant: "success" },
};

export default function Items() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    categoryId: "",
    type: "spare_part",
    unit: "",
    barcode: "",
    minStock: "",
    maxStock: "",
    reorderPoint: "",
    standardCost: "",
    description: "",
  });

  // Fetch items from API
  const { data: items = [], isLoading, refetch } = trpc.inventory.items.list.useQuery({
    businessId: 1,
    categoryId: filterCategory !== "all" ? parseInt(filterCategory) : undefined,
    type: filterType !== "all" ? filterType : undefined,
  });

  // Fetch categories
  const { data: categories = [] } = trpc.inventory.categories.list.useQuery({
    businessId: 1,
  });

  // Fetch dashboard stats
  const { data: stats } = trpc.inventory.dashboardStats.useQuery({
    businessId: 1,
  });

  // Mutations
  const createItem = trpc.inventory.items.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الصنف بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة الصنف");
    },
  });

  const updateItem = trpc.inventory.items.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الصنف بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الصنف");
    },
  });

  const deleteItem = trpc.inventory.items.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الصنف بنجاح");
      setShowDeleteDialog(false);
      setSelectedItem(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الصنف");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      categoryId: "",
      type: "spare_part",
      unit: "",
      barcode: "",
      minStock: "",
      maxStock: "",
      reorderPoint: "",
      standardCost: "",
      description: "",
    });
    setSelectedItem(null);
  };

  // Stats cards
  const statsCards = [
    {
      title: "إجمالي الأصناف",
      value: stats?.totalItems?.toLocaleString() || "0",
      icon: Package,
      color: "primary",
    },
    {
      title: "المستودعات",
      value: stats?.totalWarehouses?.toLocaleString() || "0",
      icon: Boxes,
      color: "success",
    },
    {
      title: "قيمة المخزون",
      value: `${((stats?.totalValue || 0) / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: "warning",
    },
    {
      title: "أصناف منخفضة",
      value: stats?.lowStockItems?.toLocaleString() || "0",
      icon: AlertTriangle,
      color: "destructive",
    },
  ];

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "code",
      title: "الكود",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "nameAr",
      title: "اسم الصنف",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.nameEn && <p className="text-xs text-muted-foreground">{row.nameEn}</p>}
        </div>
      ),
    },
    {
      key: "categoryId",
      title: "الفئة",
      render: (value) => {
        const category = categories.find((c: any) => c.id === value);
        return category?.nameAr || "-";
      },
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => <StatusBadge status={value} statusMap={itemTypeMap} />,
    },
    {
      key: "unit",
      title: "الوحدة",
    },
    {
      key: "minStock",
      title: "الحد الأدنى",
      align: "right",
      render: (value) => value || "-",
    },
    {
      key: "standardCost",
      title: "التكلفة",
      align: "right",
      render: (value) => value ? `${Number(value).toLocaleString()} ر.س` : "-",
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({
      code: item.code || "",
      nameAr: item.nameAr || "",
      nameEn: item.nameEn || "",
      categoryId: item.categoryId?.toString() || "",
      type: item.type || "spare_part",
      unit: item.unit || "",
      barcode: item.barcode || "",
      minStock: item.minStock || "",
      maxStock: item.maxStock || "",
      reorderPoint: item.reorderPoint || "",
      standardCost: item.standardCost || "",
      description: item.description || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      deleteItem.mutate({ id: selectedItem.id });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.nameAr || !formData.unit) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      businessId: 1,
    };

    if (selectedItem) {
      updateItem.mutate({ id: selectedItem.id, ...data });
    } else {
      createItem.mutate(data);
    }
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
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
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
        <CardHeader>
          <CardTitle>تصفية النتائج</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">الفئة</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nameAr}
                    </SelectItem>
                  ))}
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
                  <SelectItem value="spare_part">قطع غيار</SelectItem>
                  <SelectItem value="consumable">مستهلكات</SelectItem>
                  <SelectItem value="raw_material">مواد خام</SelectItem>
                  <SelectItem value="finished_good">منتج نهائي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        title="الأصناف"
        description="إدارة أصناف المخزون"
        columns={columns}
        data={items}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة صنف"
        searchPlaceholder="البحث في الأصناف..."
        searchKeys={["code", "nameAr", "barcode"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? "تعديل الصنف" : "إضافة صنف جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? "قم بتعديل بيانات الصنف" : "أدخل بيانات الصنف الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">الكود *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ITM-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الصنف *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">الوحدة *</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="قطعة / متر / كجم"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">الفئة</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">النوع</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spare_part">قطع غيار</SelectItem>
                    <SelectItem value="consumable">مستهلكات</SelectItem>
                    <SelectItem value="raw_material">مواد خام</SelectItem>
                    <SelectItem value="finished_good">منتج نهائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">الباركود</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="standardCost">التكلفة المعيارية</Label>
                <Input
                  id="standardCost"
                  type="number"
                  value={formData.standardCost}
                  onChange={(e) => setFormData({ ...formData, standardCost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">الحد الأدنى</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock">الحد الأقصى</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={formData.maxStock}
                  onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>
                {(createItem.isPending || updateItem.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedItem ? "حفظ التغييرات" : "إضافة"}
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
              هل أنت متأكد من حذف الصنف "{selectedItem?.nameAr}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteItem.isPending}>
              {deleteItem.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
