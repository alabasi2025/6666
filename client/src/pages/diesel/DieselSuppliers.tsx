import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Eye, MapPin, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface Supplier {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  contactPerson?: string;
  isActive: boolean;
}

export default function DieselSuppliers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    phone: "",
    address: "",
    latitude: "",
    longitude: "",
    contactPerson: "",
    isActive: true,
  });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["diesel-suppliers"],
    queryFn: () => trpc.diesel.suppliers.list.query({ businessId: user?.businessId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.suppliers.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-suppliers"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إضافة المورد بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.suppliers.update.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-suppliers"] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: "تم تحديث المورد بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trpc.diesel.suppliers.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-suppliers"] });
      toast({ title: "تم حذف المورد بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      phone: "",
      address: "",
      latitude: "",
      longitude: "",
      contactPerson: "",
      isActive: true,
    });
    setSelectedSupplier(null);
  };

  const handleAdd = () => {
    if (!formData.code || !formData.nameAr) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId,
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    });
  };

  const handleEdit = () => {
    if (!selectedSupplier) return;
    updateMutation.mutate({
      id: selectedSupplier.id,
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      code: supplier.code,
      nameAr: supplier.nameAr,
      nameEn: supplier.nameEn || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      latitude: supplier.latitude?.toString() || "",
      longitude: supplier.longitude?.toString() || "",
      contactPerson: supplier.contactPerson || "",
      isActive: supplier.isActive,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsViewOpen(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">موردي الديزل</h1>
          <p className="text-muted-foreground">إدارة موردي الديزل والوقود</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مورد
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>جميع موردي الديزل المسجلين في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : suppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد موردين مسجلين
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>جهة الاتصال</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier: Supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-mono">{supplier.code}</TableCell>
                    <TableCell>{supplier.nameAr}</TableCell>
                    <TableCell dir="ltr">{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.contactPerson || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={supplier.isActive ? "default" : "secondary"}>
                        {supplier.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(supplier)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog إضافة مورد */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة مورد جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SUP001"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="محمود الحجة"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Mahmoud Al-Hujja"
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+966xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>جهة الاتصال</Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="اسم الشخص المسؤول"
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="العنوان الكامل"
              />
            </div>
            <div className="space-y-2">
              <Label>خط العرض</Label>
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="24.7136"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>خط الطول</Label>
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="46.6753"
                dir="ltr"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل مورد */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المورد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الهاتف</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>جهة الاتصال</Label>
              <Input
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>العنوان</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>خط العرض</Label>
              <Input
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>خط الطول</Label>
              <Input
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض المورد */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المورد</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">الكود</Label>
                  <p className="font-mono">{selectedSupplier.code}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">الحالة</Label>
                  <Badge variant={selectedSupplier.isActive ? "default" : "secondary"}>
                    {selectedSupplier.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">الاسم بالعربي</Label>
                  <p>{selectedSupplier.nameAr}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">الاسم بالإنجليزي</Label>
                  <p>{selectedSupplier.nameEn || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" /> الهاتف
                  </Label>
                  <p dir="ltr">{selectedSupplier.phone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> جهة الاتصال
                  </Label>
                  <p>{selectedSupplier.contactPerson || "-"}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> العنوان
                  </Label>
                  <p>{selectedSupplier.address || "-"}</p>
                </div>
                {(selectedSupplier.latitude || selectedSupplier.longitude) && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-muted-foreground">الإحداثيات</Label>
                    <p dir="ltr">
                      {selectedSupplier.latitude}, {selectedSupplier.longitude}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEditDialog(selectedSupplier!); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
