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
import { Plus, Edit, Trash2, Eye, Truck, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface Tanker {
  id: number;
  code: string;
  plateNumber: string;
  capacity: number;
  compartment1Capacity?: number;
  compartment2Capacity?: number;
  driverName?: string;
  driverPhone?: string;
  isActive: boolean;
}

export default function DieselTankers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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

  const { data: tankers = [], isLoading } = useQuery({
    queryKey: ["diesel-tankers"],
    queryFn: () => trpc.diesel.tankers.list.query({ businessId: user?.businessId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.tankers.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tankers"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إضافة الوايت بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.tankers.update.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tankers"] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: "تم تحديث الوايت بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trpc.diesel.tankers.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tankers"] });
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
    if (!formData.code || !formData.plateNumber || !formData.capacity) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId,
      code: formData.code,
      plateNumber: formData.plateNumber,
      capacity: parseFloat(formData.capacity),
      compartment1Capacity: formData.compartment1Capacity ? parseFloat(formData.compartment1Capacity) : undefined,
      compartment2Capacity: formData.compartment2Capacity ? parseFloat(formData.compartment2Capacity) : undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      isActive: formData.isActive,
    });
  };

  const handleEdit = () => {
    if (!selectedTanker) return;
    updateMutation.mutate({
      id: selectedTanker.id,
      code: formData.code,
      plateNumber: formData.plateNumber,
      capacity: parseFloat(formData.capacity),
      compartment1Capacity: formData.compartment1Capacity ? parseFloat(formData.compartment1Capacity) : undefined,
      compartment2Capacity: formData.compartment2Capacity ? parseFloat(formData.compartment2Capacity) : undefined,
      driverName: formData.driverName || undefined,
      driverPhone: formData.driverPhone || undefined,
      isActive: formData.isActive,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الوايت؟")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (tanker: Tanker) => {
    setSelectedTanker(tanker);
    setFormData({
      code: tanker.code,
      plateNumber: tanker.plateNumber,
      capacity: tanker.capacity.toString(),
      compartment1Capacity: tanker.compartment1Capacity?.toString() || "",
      compartment2Capacity: tanker.compartment2Capacity?.toString() || "",
      driverName: tanker.driverName || "",
      driverPhone: tanker.driverPhone || "",
      isActive: tanker.isActive,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (tanker: Tanker) => {
    setSelectedTanker(tanker);
    setIsViewOpen(true);
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
                  <TableHead>العين 1</TableHead>
                  <TableHead>العين 2</TableHead>
                  <TableHead>السائق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tankers.map((tanker: Tanker) => (
                  <TableRow key={tanker.id}>
                    <TableCell className="font-mono">{tanker.code}</TableCell>
                    <TableCell dir="ltr">{tanker.plateNumber}</TableCell>
                    <TableCell>{tanker.capacity.toLocaleString()} لتر</TableCell>
                    <TableCell>{tanker.compartment1Capacity?.toLocaleString() || "-"} لتر</TableCell>
                    <TableCell>{tanker.compartment2Capacity?.toLocaleString() || "-"} لتر</TableCell>
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
                          onClick={() => openViewDialog(tanker)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(tanker)}
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
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TNK001"
              />
            </div>
            <div className="space-y-2">
              <Label>رقم اللوحة *</Label>
              <Input
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="ABC 1234"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>السعة الكلية (لتر) *</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="6040"
              />
            </div>
            <div className="space-y-2">
              <Label>سعة العين 1 (لتر)</Label>
              <Input
                type="number"
                value={formData.compartment1Capacity}
                onChange={(e) => setFormData({ ...formData, compartment1Capacity: e.target.value })}
                placeholder="3070"
              />
            </div>
            <div className="space-y-2">
              <Label>سعة العين 2 (لتر)</Label>
              <Input
                type="number"
                value={formData.compartment2Capacity}
                onChange={(e) => setFormData({ ...formData, compartment2Capacity: e.target.value })}
                placeholder="2970"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم السائق</Label>
              <Input
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="اسم السائق"
              />
            </div>
            <div className="space-y-2">
              <Label>هاتف السائق</Label>
              <Input
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="+966xxxxxxxxx"
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
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
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم اللوحة *</Label>
              <Input
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>السعة الكلية (لتر) *</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>سعة العين 1 (لتر)</Label>
              <Input
                type="number"
                value={formData.compartment1Capacity}
                onChange={(e) => setFormData({ ...formData, compartment1Capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>سعة العين 2 (لتر)</Label>
              <Input
                type="number"
                value={formData.compartment2Capacity}
                onChange={(e) => setFormData({ ...formData, compartment2Capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>اسم السائق</Label>
              <Input
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>هاتف السائق</Label>
              <Input
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div className="flex items-center gap-2">
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

      {/* Dialog عرض الوايت */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الوايت</DialogTitle>
          </DialogHeader>
          {selectedTanker && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Truck className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="text-xl font-bold">{selectedTanker.code}</h3>
                  <p className="text-muted-foreground">{selectedTanker.plateNumber}</p>
                </div>
                <Badge variant={selectedTanker.isActive ? "default" : "secondary"} className="mr-auto">
                  {selectedTanker.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">السعة الكلية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedTanker.capacity.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">لتر</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">العين 1</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedTanker.compartment1Capacity?.toLocaleString() || "-"}</p>
                    <p className="text-sm text-muted-foreground">لتر</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">العين 2</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedTanker.compartment2Capacity?.toLocaleString() || "-"}</p>
                    <p className="text-sm text-muted-foreground">لتر</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" /> السائق
                  </Label>
                  <p>{selectedTanker.driverName || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" /> هاتف السائق
                  </Label>
                  <p dir="ltr">{selectedTanker.driverPhone || "-"}</p>
                </div>
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
