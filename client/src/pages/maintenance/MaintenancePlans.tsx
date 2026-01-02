import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Frequency mapping
const frequencyMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  daily: { label: "يومي", variant: "default" },
  weekly: { label: "أسبوعي", variant: "secondary" },
  monthly: { label: "شهري", variant: "success" },
  quarterly: { label: "ربع سنوي", variant: "warning" },
  yearly: { label: "سنوي", variant: "destructive" },
};

export default function MaintenancePlans() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    description: "",
    frequency: "monthly",
    assetCategoryId: "",
    estimatedHours: "",
    estimatedCost: "",
    isActive: true,
  });

  // Fetch plans from API
  const { data: plans = [], isLoading, refetch } = trpc.maintenance.plans.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch asset categories
  const { data: categories = [] } = trpc.assets.categories.list.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createPlan = trpc.maintenance.plans.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء خطة الصيانة بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الخطة");
    },
  });

  const updatePlan = trpc.maintenance.plans.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث خطة الصيانة بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الخطة");
    },
  });

  const deletePlan = trpc.maintenance.plans.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف خطة الصيانة بنجاح");
      setShowDeleteDialog(false);
      setSelectedPlan(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الخطة");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      description: "",
      frequency: "monthly",
      assetCategoryId: "",
      estimatedHours: "",
      estimatedCost: "",
      isActive: true,
    });
    setSelectedPlan(null);
  };

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
      title: "اسم الخطة",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.nameEn && <p className="text-xs text-muted-foreground">{row.nameEn}</p>}
        </div>
      ),
    },
    {
      key: "frequency",
      title: "التكرار",
      render: (value) => <StatusBadge status={value} statusMap={frequencyMap} />,
    },
    {
      key: "assetCategoryId",
      title: "فئة الأصول",
      render: (value) => {
        const category = categories.find((c: any) => c.id === value);
        return category?.nameAr || "-";
      },
    },
    {
      key: "estimatedHours",
      title: "الساعات المقدرة",
      align: "right",
      render: (value) => value ? `${value} ساعة` : "-",
    },
    {
      key: "estimatedCost",
      title: "التكلفة المقدرة",
      align: "right",
      render: (value) => value ? `${Number(value).toLocaleString()} ر.س` : "-",
    },
    {
      key: "isActive",
      title: "الحالة",
      render: (value) => (
        <StatusBadge 
          status={value ? "active" : "inactive"} 
          statusMap={{
            active: { label: "نشط", variant: "success" },
            inactive: { label: "غير نشط", variant: "secondary" },
          }} 
        />
      ),
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setFormData({
      code: plan.code || "",
      nameAr: plan.nameAr || "",
      nameEn: plan.nameEn || "",
      description: plan.description || "",
      frequency: plan.frequency || "monthly",
      assetCategoryId: plan.assetCategoryId?.toString() || "",
      estimatedHours: plan.estimatedHours || "",
      estimatedCost: plan.estimatedCost || "",
      isActive: plan.isActive ?? true,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (plan: any) => {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      deletePlan.mutate({ id: selectedPlan.id } as any);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(formData as any).code || !(formData as any).nameAr) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const data = {
      ...formData,
      assetCategoryId: (formData as any).assetCategoryId ? parseInt((formData as any).assetCategoryId) : undefined,
      businessId: 1,
    };

    if (selectedPlan) {
      updatePlan.mutate({ id: selectedPlan.id, ...data } as any);
    } else {
      createPlan.mutate(data as any);
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
      {/* Data Table */}
      <DataTable
        title="خطط الصيانة"
        description="إدارة خطط الصيانة الوقائية"
        columns={columns}
        data={plans}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إنشاء خطة"
        searchPlaceholder="البحث في الخطط..."
        searchKeys={["code", "nameAr"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "تعديل خطة الصيانة" : "إنشاء خطة صيانة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan ? "قم بتعديل بيانات الخطة" : "أدخل بيانات خطة الصيانة"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">الكود *</Label>
                  <Input
                    id="code"
                    value={(formData as any).code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="MP-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">التكرار</Label>
                  <Select
                    value={(formData as any).frequency}
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                      <SelectItem value="quarterly">ربع سنوي</SelectItem>
                      <SelectItem value="yearly">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الخطة *</Label>
                <Input
                  id="nameAr"
                  value={(formData as any).nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  value={(formData as any).nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCategoryId">فئة الأصول</Label>
                <Select
                  value={(formData as any).assetCategoryId}
                  onValueChange={(value) => setFormData({ ...formData, assetCategoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">الساعات المقدرة</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={(formData as any).estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">التكلفة المقدرة</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    value={(formData as any).estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">نشط</Label>
                <Switch
                  id="isActive"
                  checked={(formData as any).isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createPlan.isPending || updatePlan.isPending}>
                {(createPlan.isPending || updatePlan.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedPlan ? "حفظ التغييرات" : "إنشاء"}
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
              هل أنت متأكد من حذف خطة الصيانة "{selectedPlan?.nameAr}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deletePlan.isPending}>
              {deletePlan.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
