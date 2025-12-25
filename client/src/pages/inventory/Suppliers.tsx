import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  Truck,
  Search,
  Loader2,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  isActive: boolean;
}

export default function Suppliers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Fetch suppliers
  const { data: suppliers = [], isLoading } = trpc.inventory.suppliers.list.useQuery({
    businessId: 1,
  });

  // Create mutation
  const createMutation = trpc.inventory.suppliers.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "suppliers", "list"]] });
      toast({ title: "تم إضافة المورد بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = trpc.inventory.suppliers.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "suppliers", "list"]] });
      toast({ title: "تم تحديث المورد بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = trpc.inventory.suppliers.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "suppliers", "list"]] });
      toast({ title: "تم حذف المورد بنجاح" });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const filteredSuppliers = suppliers.filter(
    (supplier: Supplier) =>
      supplier.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      code: (formData as any).get("code") as string,
      nameAr: (formData as any).get("nameAr") as string,
      nameEn: (formData as any).get("nameEn") as string || undefined,
      contactPerson: (formData as any).get("contactPerson") as string || undefined,
      phone: (formData as any).get("phone") as string || undefined,
      email: (formData as any).get("email") as string || undefined,
      address: (formData as any).get("address") as string || undefined,
      taxNumber: (formData as any).get("taxNumber") as string || undefined,
    };

    if (selectedSupplier) {
      updateMutation.mutate({
        id: selectedSupplier.id,
        ...data,
        isActive: (e.currentTarget.querySelector("#isActive") as HTMLInputElement)?.checked ?? true,
      } as any);
    } else {
      createMutation.mutate({
        businessId: 1,
        ...data,
      } as any);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDialog(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedSupplier) {
      deleteMutation.mutate({ id: selectedSupplier.id } as any);
    }
  };

  const openAddDialog = () => {
    setSelectedSupplier(null);
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Truck className="w-8 h-8 text-primary" />
            الموردين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات الموردين والمتعاملين
          </p>
        </div>
        <Button onClick={openAddDialog} className="gradient-energy">
          <Plus className="w-4 h-4 ml-2" />
          إضافة مورد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الموردين</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موردين نشطين</p>
                <p className="text-2xl font-bold">
                  {(suppliers as any[]).filter((s: any) => s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موردين غير نشطين</p>
                <p className="text-2xl font-bold">
                  {(suppliers as any[]).filter((s: any) => !s.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة الموردين</CardTitle>
              <CardDescription>
                {filteredSuppliers.length} مورد مسجل
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرمز</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>جهة الاتصال</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا يوجد موردين مسجلين
                  </TableCell>
                </TableRow>
              ) : (
                (filteredSuppliers as any[]).map((supplier: any) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono">{supplier.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.nameAr}</p>
                        {supplier.nameEn && (
                          <p className="text-sm text-muted-foreground">{supplier.nameEn}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.contactPerson || "-"}</TableCell>
                    <TableCell>
                      {supplier.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {supplier.phone}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {supplier.email ? (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {supplier.email}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(supplier)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? "تعديل المورد" : "إضافة مورد جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier ? "قم بتعديل بيانات المورد" : "أدخل بيانات المورد الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز المورد *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="SUP-001"
                  defaultValue={selectedSupplier?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  placeholder="اسم المورد"
                  defaultValue={selectedSupplier?.nameAr}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  placeholder="Supplier Name"
                  defaultValue={selectedSupplier?.nameEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">جهة الاتصال</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="اسم المسؤول"
                  defaultValue={selectedSupplier?.contactPerson}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="05xxxxxxxx"
                  defaultValue={selectedSupplier?.phone}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  defaultValue={selectedSupplier?.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  name="taxNumber"
                  placeholder="الرقم الضريبي"
                  defaultValue={selectedSupplier?.taxNumber}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="العنوان الكامل"
                  defaultValue={selectedSupplier?.address}
                  rows={2}
                />
              </div>
              {selectedSupplier && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    defaultChecked={selectedSupplier?.isActive ?? true}
                  />
                  <Label htmlFor="isActive">مورد نشط</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                className="gradient-energy"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedSupplier ? "حفظ التغييرات" : "إضافة المورد"}
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
              هل أنت متأكد من حذف المورد "{selectedSupplier?.nameAr}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف المورد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
