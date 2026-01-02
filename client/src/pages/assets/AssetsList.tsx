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
  Wrench,
  Filter,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Asset status mapping
const assetStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  idle: { label: "غير نشط", variant: "secondary" },
  maintenance: { label: "صيانة", variant: "warning" },
  disposed: { label: "مستبعد", variant: "destructive" },
  transferred: { label: "منقول", variant: "default" },
};

export default function AssetsList() {
  const [, setLocation] = useLocation();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    categoryId: "",
    stationId: "",
    description: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    purchaseCost: "",
    location: "",
    status: "active",
  });

  // Fetch assets from API
  const { data: assets = [], isLoading, refetch } = trpc.assets.list.useQuery({
    businessId: 1,
    status: filterStatus !== "all" ? filterStatus : undefined,
    categoryId: filterCategory !== "all" ? parseInt(filterCategory) : undefined,
  } as any);

  // Fetch categories
  const { data: categories = [] } = trpc.assets.categories.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch stations
  const { data: stations = [] } = trpc.station.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch dashboard stats
  const { data: stats } = trpc.assets.dashboardStats.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createAsset = trpc.assets.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الأصل بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة الأصل");
    },
  });

  const updateAsset = trpc.assets.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الأصل بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الأصل");
    },
  });

  const deleteAsset = trpc.assets.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الأصل بنجاح");
      setShowDeleteDialog(false);
      setSelectedAsset(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الأصل");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      categoryId: "",
      stationId: "",
      description: "",
      serialNumber: "",
      model: "",
      manufacturer: "",
      purchaseDate: "",
      purchaseCost: "",
      location: "",
      status: "active",
    });
    setSelectedAsset(null);
  };

  // Stats cards data
  const statsCards = [
    {
      title: "إجمالي الأصول",
      value: stats?.totalAssets?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "primary",
    },
    {
      title: "قيمة الأصول",
      value: `${((stats?.totalValue || 0) / 1000000).toFixed(1)}M`,
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "success",
    },
    {
      title: "الإهلاك المتراكم",
      value: `${((stats?.totalDepreciation || 0) / 1000000).toFixed(1)}M`,
      change: "-3%",
      trend: "down",
      icon: TrendingDown,
      color: "warning",
    },
    {
      title: "الأصول النشطة",
      value: stats?.activeAssets?.toLocaleString() || "0",
      change: "+5",
      trend: "up",
      icon: Wrench,
      color: "destructive",
    },
  ];

  // Table columns
  const columns: Column<any>[] = [
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
          <p className="text-xs text-muted-foreground">{row.location || "-"}</p>
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
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "currentValue",
      title: "القيمة الحالية",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums text-success">
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "purchaseDate",
      title: "تاريخ الشراء",
      render: (value) => value ? new Date(value).toLocaleDateString("ar-SA") : "-",
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleView = (asset: any) => {
    setLocation(`/dashboard/assets/view/${asset.id}`);
  };

  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setFormData({
      code: asset.code || "",
      nameAr: asset.nameAr || "",
      nameEn: asset.nameEn || "",
      categoryId: asset.categoryId?.toString() || "",
      stationId: asset.stationId?.toString() || "",
      description: asset.description || "",
      serialNumber: asset.serialNumber || "",
      model: asset.model || "",
      manufacturer: asset.manufacturer || "",
      purchaseDate: asset.purchaseDate || "",
      purchaseCost: asset.purchaseCost || "",
      location: asset.location || "",
      status: asset.status || "active",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (asset: any) => {
    setSelectedAsset(asset);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAsset) {
      deleteAsset.mutate({ id: selectedAsset.id } as any);
    }
  };

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.nameAr || !formData.categoryId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      ...formData,
      categoryId: parseInt(formData.categoryId),
      stationId: formData.stationId ? parseInt(formData.stationId) : null,
      businessId: 1,
    };

    if (selectedAsset) {
      updateAsset.mutate({ id: selectedAsset.id, ...data } as any);
    } else {
      createAsset.mutate(data as any);
    }
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterCategory("all");
  };

  const hasActiveFilters = filterStatus !== "all" || filterCategory !== "all";

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
            <div>
              <Label className="mb-2 block">الحالة</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                  <SelectItem value="idle">غير نشط</SelectItem>
                  <SelectItem value="disposed">مستبعد</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        title="قائمة الأصول"
        description="إدارة جميع الأصول الثابتة للمنشأة"
        columns={columns}
        data={assets}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة أصل جديد"
        searchPlaceholder="البحث في الأصول..."
        searchKeys={["code", "nameAr", "location"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAsset ? "تعديل الأصل" : "إضافة أصل جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedAsset
                ? "قم بتعديل بيانات الأصل"
                : "أدخل بيانات الأصل الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAsset}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رقم الأصل *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="AST-000001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الأصل *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="اسم الأصل بالعربية"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Asset name in English"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">الفئة *</Label>
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
                <Label htmlFor="stationId">المحطة</Label>
                <Select
                  value={formData.stationId}
                  onValueChange={(value) => setFormData({ ...formData, stationId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون محطة</SelectItem>
                    {stations.map((station: any) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {station.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">الرقم التسلسلي</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="SN-123456"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">الموديل</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="موديل الأصل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="اسم الشركة المصنعة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">تاريخ الشراء</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseCost">تكلفة الشراء</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="موقع الأصل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="idle">غير نشط</SelectItem>
                    <SelectItem value="disposed">مستبعد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الأصل..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createAsset.isPending || updateAsset.isPending}>
                {(createAsset.isPending || updateAsset.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
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
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الأصل "{selectedAsset?.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteAsset.isPending}>
              {deleteAsset.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
