import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, Plus, Search, Edit, Trash2, Building2, Phone, Mail, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Branch {
  id: number;
  businessId: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  type: "main" | "regional" | "local";
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  managerId?: number | null;
  isActive: boolean;
  createdAt: Date;
}

export default function Branches() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    businessId: "",
    code: "",
    nameAr: "",
    nameEn: "",
    type: "regional" as "main" | "regional" | "local",
    address: "",
    phone: "",
    email: "",
  });

  const { data: branches, isLoading, refetch } = trpc.branch.list.useQuery();
  const { data: businesses } = trpc.business.list.useQuery();

  const createMutation = trpc.branch.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الفرع بنجاح");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إضافة الفرع");
    },
  });

  const updateMutation = trpc.branch.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفرع بنجاح");
      setEditingBranch(null);
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث الفرع");
    },
  });

  const deleteMutation = trpc.branch.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفرع بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف الفرع");
    },
  });

  const resetForm = () => {
    setFormData({
      businessId: "",
      code: "",
      nameAr: "",
      nameEn: "",
      type: "regional",
      address: "",
      phone: "",
      email: "",
    });
    setEditingBranch(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!(formData as any).businessId || !(formData as any).code || !(formData as any).nameAr) {
      toast.error("يرجى إدخال الشركة والكود والاسم العربي");
      return;
    }

    if (editingBranch) {
      await updateMutation.mutateAsync({
        id: editingBranch.id,
        code: (formData as any).code,
        nameAr: (formData as any).nameAr,
        nameEn: (formData as any).nameEn || undefined,
        type: (formData as any).type,
        address: (formData as any).address || undefined,
        phone: (formData as any).phone || undefined,
        email: (formData as any).email || undefined,
      } as any);
    } else {
      await createMutation.mutateAsync({
        businessId: parseInt((formData as any).businessId),
        code: (formData as any).code,
        nameAr: (formData as any).nameAr,
        nameEn: (formData as any).nameEn || undefined,
        type: (formData as any).type,
        address: (formData as any).address || undefined,
        phone: (formData as any).phone || undefined,
        email: (formData as any).email || undefined,
      } as any);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      businessId: branch.businessId.toString(),
      code: branch.code,
      nameAr: branch.nameAr,
      nameEn: branch.nameEn || "",
      type: branch.type,
      address: branch.address || "",
      phone: branch.phone || "",
      email: branch.email || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الفرع؟")) {
      await deleteMutation.mutateAsync({ id } as any);
    }
  };

  const filteredBranches = branches?.filter((branch) => {
    const matchesSearch =
      branch.nameAr.includes(searchQuery) ||
      branch.code.includes(searchQuery) ||
      (branch.nameEn && branch.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBusiness = selectedBusiness === "all" || branch.businessId.toString() === selectedBusiness;
    return matchesSearch && matchesBusiness;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "main":
        return "رئيسي";
      case "regional":
        return "إقليمي";
      case "local":
        return "محلي";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "main":
        return "bg-blue-500";
      case "regional":
        return "bg-green-500";
      case "local":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getBusinessName = (businessId: number) => {
    const business = businesses?.find((b) => b.id === businessId);
    return business?.nameAr || "غير محدد";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">إدارة الفروع</h1>
            <p className="text-muted-foreground">إدارة فروع الشركات في النظام</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة فرع جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                {editingBranch ? "تعديل الفرع" : "إضافة فرع جديد"}
              </DialogTitle>
              <DialogDescription>
                {editingBranch ? "قم بتعديل بيانات الفرع" : "أدخل بيانات الفرع الجديد لإضافته للنظام"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessId">الشركة *</Label>
                    <Select
                      value={(formData as any).businessId}
                      onValueChange={(value) => setFormData({ ...formData, businessId: value })}
                      disabled={!!editingBranch}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشركة" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses?.map((business) => (
                          <SelectItem key={business.id} value={business.id.toString()}>
                            {business.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">كود الفرع *</Label>
                    <Input
                      id="code"
                      placeholder="مثال: BR-001"
                      value={(formData as any).code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">نوع الفرع</Label>
                  <Select
                    value={(formData as any).type}
                    onValueChange={(value: "main" | "regional" | "local") =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">فرع رئيسي</SelectItem>
                      <SelectItem value="regional">فرع إقليمي</SelectItem>
                      <SelectItem value="local">فرع محلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                    <Input
                      id="nameAr"
                      placeholder="اسم الفرع بالعربي"
                      value={(formData as any).nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="nameEn"
                      placeholder="Branch Name in English"
                      value={(formData as any).nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* معلومات الاتصال */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">معلومات الاتصال</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      placeholder="05xxxxxxxx"
                      value={(formData as any).phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="branch@company.com"
                      value={(formData as any).email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    placeholder="عنوان الفرع الكامل"
                    value={(formData as any).address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBranch ? "تحديث الفرع" : "إضافة الفرع"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GitBranch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الفروع</p>
              <p className="text-2xl font-bold">{branches?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفروع الرئيسية</p>
              <p className="text-2xl font-bold">{branches?.filter((b) => b.type === "main").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <GitBranch className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفروع الإقليمية</p>
              <p className="text-2xl font-bold">{branches?.filter((b) => b.type === "regional").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <GitBranch className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الفروع النشطة</p>
              <p className="text-2xl font-bold">{branches?.filter((b) => b.isActive).length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفروع</CardTitle>
          <CardDescription>جميع الفروع المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع الشركات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الشركات</SelectItem>
                {businesses?.map((business) => (
                  <SelectItem key={business.id} value={business.id.toString()}>
                    {business.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredBranches && filteredBranches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الشركة</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-mono">{branch.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{branch.nameAr}</p>
                        {branch.nameEn && (
                          <p className="text-sm text-muted-foreground">{branch.nameEn}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getBusinessName(branch.businessId)}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(branch.type)}>{getTypeLabel(branch.type)}</Badge>
                    </TableCell>
                    <TableCell>{(branch as any).phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={branch.isActive ? "default" : "secondary"}>
                        {branch.isActive ? "نشط" : "معطل"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(branch as any)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(branch.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد فروع مسجلة</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                إضافة أول فرع
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
