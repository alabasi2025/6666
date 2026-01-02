import { useState } from "react";
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
import { Plus, Edit, Trash2, Eye, Truck, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

interface Tanker {
  id: number;
  code: string;
  plateNumber: string;
  capacity: string;
  compartment1Capacity?: string | null;
  compartment2Capacity?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  isActive: boolean | null;
}

export default function DieselTankers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTanker, setSelectedTanker] = useState<Tanker | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    plateNumber: "",
    capacity: "",
    compartment1Capacity: "",
    compartment2Capacity: "",
    driverName: "",
    driverPhone: "",
    isActive: true,
  });

  const utils = trpc.useUtils();

  const { data: tankers = [], isLoading } = trpc.diesel.tankers.list.useQuery({
    businessId: user?.businessId ?? undefined,
  });

  const createMutation = trpc.diesel.tankers.create.useMutation({
    onSuccess: () => {
      utils.diesel.tankers.list.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إضافة الوايت بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.diesel.tankers.update.useMutation({
    onSuccess: () => {
      utils.diesel.tankers.list.invalidate();
      setIsEditOpen(false);
      resetForm();
      toast({ title: "تم تحديث الوايت بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.tankers.delete.useMutation({
    onSuccess: () => {
      utils.diesel.tankers.list.invalidate();
      toast({ title: "تم حذف الوايت بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      plateNumber: "",
      capacity: "",
      compartment1Capacity: "",
      compartment2Capacity: "",
      driverName: "",
      driverPhone: "",
      isActive: true,
    });
    setSelectedTanker(null);
  };

  const handleAdd = () => {
    if (!(formData as any).code || !(formData as any).plateNumber || !(formData as any).capacity) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId || 1,
      code: (formData as any).code,
      plateNumber: (formData as any).plateNumber,
      capacity: parseFloat((formData as any).capacity),
      compartment1Capacity: (formData as any).compartment1Capacity ? parseFloat((formData as any).compartment1Capacity) : undefined,
      compartment2Capacity: (formData as any).compartment2Capacity ? parseFloat((formData as any).compartment2Capacity) : undefined,
      driverName: (formData as any).driverName || undefined,
      driverPhone: (formData as any).driverPhone || undefined,
      isActive: (formData as any).isActive,
    } as any);
  };

  const handleEdit = () => {
    if (!selectedTanker) return;
    updateMutation.mutate({
      id: selectedTanker.id,
      code: (formData as any).code || undefined,
      plateNumber: (formData as any).plateNumber || undefined,
      capacity: (formData as any).capacity ? parseFloat((formData as any).capacity) : undefined,
      compartment1Capacity: (formData as any).compartment1Capacity ? parseFloat((formData as any).compartment1Capacity) : undefined,
      compartment2Capacity: (formData as any).compartment2Capacity ? parseFloat((formData as any).compartment2Capacity) : undefined,
      driverName: (formData as any).driverName || undefined,
      driverPhone: (formData as any).driverPhone || undefined,
      isActive: (formData as any).isActive,
    } as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الوايت؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  const openEditDialog = (tanker: Tanker) => {
    setSelectedTanker(tanker);
    setFormData({
      code: tanker.code,
      plateNumber: tanker.plateNumber,
      capacity: tanker.capacity,
      compartment1Capacity: tanker.compartment1Capacity || "",
      compartment2Capacity: tanker.compartment2Capacity || "",
      driverName: tanker.driverName || "",
      driverPhone: tanker.driverPhone || "",
      isActive: tanker.isActive ?? true,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (tanker: Tanker) => {
    setSelectedTanker(tanker);
    setIsViewOpen(true);
  };

  // حساب السعة الإجمالية من العينين
  const calculateTotalCapacity = () => {
    const c1 = parseFloat((formData as any).compartment1Capacity) || 0;
    const c2 = parseFloat((formData as any).compartment2Capacity) || 0;
    if (c1 > 0 || c2 > 0) {
      setFormData({ ...formData, capacity: (c1 + c2).toString() });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">الوايتات (صهاريج الديزل)</h1>
          <p className="text-muted-foreground">إدارة صهاريج نقل الديزل</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة وايت
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الوايتات</CardTitle>
          <CardDescription>جميع صهاريج الديزل المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : tankers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد وايتات مسجلة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>رقم اللوحة</TableHead>
                  <TableHead>السعة الكلية</TableHead>
                  <TableHead>عين 1</TableHead>
                  <TableHead>عين 2</TableHead>
                  <TableHead>السائق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tankers.map((tanker) => (
                  <TableRow key={tanker.id}>
                    <TableCell className="font-mono">{tanker.code}</TableCell>
                    <TableCell>{tanker.plateNumber}</TableCell>
                    <TableCell>{parseFloat(tanker.capacity).toLocaleString()} لتر</TableCell>
                    <TableCell>{tanker.compartment1Capacity ? `${parseFloat(tanker.compartment1Capacity).toLocaleString()} لتر` : "-"}</TableCell>
                    <TableCell>{tanker.compartment2Capacity ? `${parseFloat(tanker.compartment2Capacity).toLocaleString()} لتر` : "-"}</TableCell>
                    <TableCell>{tanker.driverName || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={tanker.isActive ? "default" : "secondary"}>
                        {tanker.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(tanker as any)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tanker as any)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tanker.id)}
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

      {/* Dialog إضافة وايت */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة وايت جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={(formData as any).code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TAN001"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم اللوحة *</Label>
              <Input
                value={(formData as any).plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="أ ب ج 1234"
              />
            </div>
            <div className="space-y-2">
              <Label>سعة عين 1 (لتر)</Label>
              <Input
                value={(formData as any).compartment1Capacity}
                onChange={(e) => setFormData({ ...formData, compartment1Capacity: e.target.value })}
                onBlur={calculateTotalCapacity}
                placeholder="3070"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>سعة عين 2 (لتر)</Label>
              <Input
                value={(formData as any).compartment2Capacity}
                onChange={(e) => setFormData({ ...formData, compartment2Capacity: e.target.value })}
                onBlur={calculateTotalCapacity}
                placeholder="2970"
                type="number"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>السعة الكلية (لتر) *</Label>
              <Input
                value={(formData as any).capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="6040"
                type="number"
              />
              <p className="text-xs text-muted-foreground">يتم حسابها تلقائياً من مجموع العينين</p>
            </div>
            <div className="space-y-2">
              <Label>اسم السائق</Label>
              <Input
                value={(formData as any).driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="اسم السائق"
              />
            </div>
            <div className="space-y-2">
              <Label>هاتف السائق</Label>
              <Input
                value={(formData as any).driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="+966xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={(formData as any).isActive}
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
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل وايت */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الوايت</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={(formData as any).code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم اللوحة *</Label>
              <Input
                value={(formData as any).plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>سعة عين 1 (لتر)</Label>
              <Input
                value={(formData as any).compartment1Capacity}
                onChange={(e) => setFormData({ ...formData, compartment1Capacity: e.target.value })}
                onBlur={calculateTotalCapacity}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>سعة عين 2 (لتر)</Label>
              <Input
                value={(formData as any).compartment2Capacity}
                onChange={(e) => setFormData({ ...formData, compartment2Capacity: e.target.value })}
                onBlur={calculateTotalCapacity}
                type="number"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>السعة الكلية (لتر) *</Label>
              <Input
                value={(formData as any).capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم السائق</Label>
              <Input
                value={(formData as any).driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>هاتف السائق</Label>
              <Input
                value={(formData as any).driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={(formData as any).isActive}
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
              {updateMutation.isPending ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض تفاصيل الوايت */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الوايت</DialogTitle>
          </DialogHeader>
          {selectedTanker && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الكود</p>
                <p className="font-mono">{selectedTanker.code}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">رقم اللوحة</p>
                <p className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  {selectedTanker.plateNumber}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">السعة الكلية</p>
                <p className="font-bold text-lg">{parseFloat(selectedTanker.capacity).toLocaleString()} لتر</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge variant={selectedTanker.isActive ? "default" : "secondary"}>
                  {selectedTanker.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
              <div className="col-span-2 border rounded-lg p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">تفاصيل العينين</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-background rounded">
                    <p className="text-xs text-muted-foreground">عين 1</p>
                    <p className="text-xl font-bold">
                      {selectedTanker.compartment1Capacity 
                        ? `${parseFloat(selectedTanker.compartment1Capacity).toLocaleString()} لتر` 
                        : "-"}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-background rounded">
                    <p className="text-xs text-muted-foreground">عين 2</p>
                    <p className="text-xl font-bold">
                      {selectedTanker.compartment2Capacity 
                        ? `${parseFloat(selectedTanker.compartment2Capacity).toLocaleString()} لتر` 
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">اسم السائق</p>
                <p className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {selectedTanker.driverName || "-"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">هاتف السائق</p>
                <p dir="ltr" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {selectedTanker.driverPhone || "-"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEditDialog(selectedTanker!); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
