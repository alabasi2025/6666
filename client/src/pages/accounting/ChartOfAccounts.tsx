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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Wallet, TrendingUp, TrendingDown, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// Account type mapping
const accountTypeMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  asset: { label: "أصول", variant: "success" },
  liability: { label: "خصوم", variant: "warning" },
  equity: { label: "حقوق ملكية", variant: "default" },
  revenue: { label: "إيرادات", variant: "success" },
  expense: { label: "مصروفات", variant: "destructive" },
};

// Nature mapping
const natureMap: Record<string, string> = {
  debit: "مدين",
  credit: "دائن",
};

export default function ChartOfAccounts() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "asset",
    nature: "debit",
    parentId: "",
    description: "",
    isActive: true,
  });

  // Fetch accounts from API
  const { data: accounts = [], isLoading, refetch } = trpc.accounting.accounts.list.useQuery({
    businessId: 1,
  } as any);

  // Fetch dashboard stats
  const { data: stats } = trpc.accounting.dashboardStats.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createAccount = trpc.accounting.accounts.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحساب بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
    },
  });

  const updateAccount = trpc.accounting.accounts.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحساب بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الحساب");
    },
  });

  const deleteAccount = trpc.accounting.accounts.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحساب بنجاح");
      setShowDeleteDialog(false);
      setSelectedAccount(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف الحساب");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      type: "asset",
      nature: "debit",
      parentId: "",
      description: "",
      isActive: true,
    });
    setSelectedAccount(null);
  };

  // Stats cards
  const statsCards = [
    { title: "إجمالي الحسابات", value: stats?.totalAccounts?.toString() || "0", icon: Wallet, color: "primary" },
    { title: "إجمالي القيود", value: stats?.totalEntries?.toString() || "0", icon: Calculator, color: "success" },
    { title: "قيود معلقة", value: stats?.pendingEntries?.toString() || "0", icon: TrendingUp, color: "warning" },
    { title: "الفترة الحالية", value: stats?.currentPeriod?.period?.toString() || "-", icon: TrendingDown, color: "destructive" },
  ];

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "code",
      title: "رقم الحساب",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "nameAr",
      title: "اسم الحساب",
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
      render: (value) => <StatusBadge status={value} statusMap={accountTypeMap} />,
    },
    {
      key: "nature",
      title: "الطبيعة",
      render: (value) => natureMap[value] || value,
    },
    {
      key: "currentBalance",
      title: "الرصيد الحالي",
      align: "right",
      render: (value) => (
        <span className={cn("font-mono", Number(value) >= 0 ? "text-success" : "text-destructive")}>
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
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

  const handleEdit = (account: any) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code || "",
      nameAr: account.nameAr || "",
      nameEn: account.nameEn || "",
      type: account.type || "asset",
      nature: account.nature || "debit",
      parentId: account.parentId?.toString() || "",
      description: account.description || "",
      isActive: account.isActive ?? true,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (account: any) => {
    setSelectedAccount(account);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAccount) {
      deleteAccount.mutate({ id: selectedAccount.id } as any);
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
      parentId: (formData as any).parentId ? parseInt((formData as any).parentId) : undefined,
      businessId: 1,
    };

    if (selectedAccount) {
      updateAccount.mutate({ id: selectedAccount.id, ...data } as any);
    } else {
      createAccount.mutate(data as any);
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
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <DataTable
        title="دليل الحسابات"
        description="إدارة شجرة الحسابات المحاسبية"
        columns={columns}
        data={accounts}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة حساب"
        searchPlaceholder="البحث في الحسابات..."
        searchKeys={["code", "nameAr"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedAccount ? "تعديل الحساب" : "إضافة حساب جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedAccount ? "قم بتعديل بيانات الحساب" : "أدخل بيانات الحساب الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">رقم الحساب *</Label>
                  <Input
                    id="code"
                    value={(formData as any).code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="1001"
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
                      <SelectItem value="asset">أصول</SelectItem>
                      <SelectItem value="liability">خصوم</SelectItem>
                      <SelectItem value="equity">حقوق ملكية</SelectItem>
                      <SelectItem value="revenue">إيرادات</SelectItem>
                      <SelectItem value="expense">مصروفات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الحساب *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nature">الطبيعة</Label>
                  <Select
                    value={(formData as any).nature}
                    onValueChange={(value) => setFormData({ ...formData, nature: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">مدين</SelectItem>
                      <SelectItem value="credit">دائن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentId">الحساب الأب</Label>
                  <Select
                    value={(formData as any).parentId}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب الأب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون</SelectItem>
                      {(accounts as any[]).filter((a: any) => a.id !== selectedAccount?.id).map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id.toString()}>
                          {acc.code} - {acc.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={createAccount.isPending || updateAccount.isPending}>
                {(createAccount.isPending || updateAccount.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedAccount ? "حفظ التغييرات" : "إضافة"}
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
              هل أنت متأكد من حذف الحساب "{selectedAccount?.nameAr}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteAccount.isPending}>
              {deleteAccount.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
