import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, Warehouse, Package, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Type mapping
const warehouseTypeMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  main: { label: "رئيسي", variant: "success" },
  sub: { label: "فرعي", variant: "default" },
  transit: { label: "عبور", variant: "warning" },
  quarantine: { label: "حجر", variant: "destructive" },
};

type WarehousesProps = {
  businessId?: number;
};

export default function Warehouses({ businessId = 1 }: WarehousesProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);

  const resolvedBusinessId = businessId ?? 1;

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "main",
    address: "",
    phone: "",
    managerId: "",
    description: "",
    accountId: "",
  });

  // Fetch warehouses from API
  const { data: warehouses = [], isLoading, refetch } = trpc.inventory.warehouses.list.useQuery({
    businessId: resolvedBusinessId,
  } as any);

  // Fetch dashboard stats
  const { data: stats } = trpc.inventory.dashboardStats.useQuery({
    businessId: resolvedBusinessId,
  } as any);

  // Fetch inventory sub accounts from Chart of Accounts (دليل الحسابات)
  const { data: inventoryAccounts = [], isLoading: accountsLoading } = trpc.accounting.accounts.list.useQuery({
    businessId: resolvedBusinessId,
    systemModule: "inventory",
    accountType: "sub",
    isActive: true,
  } as any);

  // Mutations
  const createWarehouse = trpc.inventory.warehouses.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المستودع بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المستودع");
    },
  });

  const updateWarehouse = trpc.inventory.warehouses.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستودع بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث المستودع");
    },
  });

  const deleteWarehouse = trpc.inventory.warehouses.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستودع بنجاح");
      setShowDeleteDialog(false);
      setSelectedWarehouse(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المستودع");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      type: "main",
      address: "",
      phone: "",
      managerId: "",
      description: "",
      accountId: "",
    });
    setSelectedWarehouse(null);
  };

  // Stats cards
  const statsCards = [
    { title: "إجمالي المستودعات", value: stats?.totalWarehouses?.toString() || "0", icon: Warehouse, color: "primary" },
    { title: "إجمالي الأصناف", value: stats?.totalItems?.toLocaleString() || "0", icon: Package, color: "success" },
    { title: "قيمة المخزون", value: `${((stats?.totalValue || 0) / 1000).toFixed(0)}K`, icon: BarChart3, color: "warning" },
    { title: "أصناف منخفضة", value: stats?.lowStockItems?.toString() || "0", icon: AlertTriangle, color: "destructive" },
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
      title: "اسم المستودع",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          {row.nameEn && <p className="text-xs text-muted-foreground">{row.nameEn}</p>}
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => <StatusBadge status={value} statusMap={warehouseTypeMap} />,
    },
    {
      key: "address",
      title: "العنوان",
      render: (value) => value || "-",
    },
    {
      key: "phone",
      title: "الهاتف",
      render: (value) => value || "-",
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (warehouse: any) => {
    const linkedAccount = (inventoryAccounts as any[]).find(
      (a: any) => a.linkedEntityType === "warehouse" && a.linkedEntityId === warehouse.id
    );
    setSelectedWarehouse(warehouse);
    setFormData({
      code: warehouse.code || "",
      nameAr: warehouse.nameAr || "",
      nameEn: warehouse.nameEn || "",
      type: warehouse.type || "main",
      address: warehouse.address || "",
      phone: warehouse.phone || "",
      managerId: warehouse.managerId?.toString() || "",
      description: warehouse.description || "",
      accountId: linkedAccount?.id ? linkedAccount.id.toString() : "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedWarehouse) {
      deleteWarehouse.mutate({ id: selectedWarehouse.id } as any);
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
      managerId: (formData as any).managerId ? parseInt((formData as any).managerId) : undefined,
      businessId: resolvedBusinessId,
    };

    if (selectedWarehouse) {
      updateWarehouse.mutate({
        id: selectedWarehouse.id,
        ...data,
        accountId: (formData as any).accountId ? parseInt((formData as any).accountId) : null,
      } as any);
    } else {
      const accountId = (formData as any).accountId ? parseInt((formData as any).accountId) : undefined;
      createWarehouse.mutate({ ...(data as any), accountId } as any);
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
      {/* Stats */}
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
        title="المستودعات"
        description="إدارة مستودعات المخزون"
        columns={columns}
        data={warehouses}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة مستودع"
        searchPlaceholder="البحث في المستودعات..."
        searchKeys={["code", "nameAr", "address"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedWarehouse ? "تعديل المستودع" : "إضافة مستودع جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedWarehouse ? "قم بتعديل بيانات المستودع" : "أدخل بيانات المستودع الجديد"}
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
                    placeholder="WH-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">النوع</Label>
                  <Select
                    value={(formData as any).type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">رئيسي</SelectItem>
                      <SelectItem value="sub">فرعي</SelectItem>
                      <SelectItem value="transit">عبور</SelectItem>
                      <SelectItem value="quarantine">حجر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم المستودع *</Label>
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
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={(formData as any).address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>حساب المخزون (فرعي)</Label>
                <Select
                  value={(formData as any).accountId}
                  onValueChange={(value) => setFormData({ ...formData, accountId: value === "none" ? "" : value })}
                  disabled={accountsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={accountsLoading ? "جاري تحميل الحسابات..." : "اختر حساب المخزون"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="none">بدون</SelectItem>
                    {(inventoryAccounts as any[]).map((acc: any) => {
                      const isUsedByOtherWarehouse =
                        acc.linkedEntityType === "warehouse" &&
                        acc.linkedEntityId &&
                        acc.linkedEntityId !== selectedWarehouse?.id;
                      return (
                        <SelectItem key={acc.id} value={acc.id.toString()} disabled={isUsedByOtherWarehouse}>
                          <span className="font-mono text-primary">{acc.code}</span>
                          {" - "}
                          <span>{acc.nameAr}</span>
                          {isUsedByOtherWarehouse ? " (مستخدم)" : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  يتم عرض الحسابات الفرعية فقط ضمن <span className="font-semibold">نظام المخزون</span> من دليل الحسابات.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={(formData as any).phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createWarehouse.isPending || updateWarehouse.isPending}>
                {(createWarehouse.isPending || updateWarehouse.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedWarehouse ? "حفظ التغييرات" : "إضافة"}
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
              هل أنت متأكد من حذف المستودع "{selectedWarehouse?.nameAr}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteWarehouse.isPending}>
              {deleteWarehouse.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
