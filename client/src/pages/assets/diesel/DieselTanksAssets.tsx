import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function DieselTanksAssets() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    stationId: "",
    type: "receiving",
    material: "plastic",
    brand: "",
    color: "",
    capacity: "",
    height: "",
    diameter: "",
    deadStock: "0",
    minLevel: "0",
    openingsCount: "1",
  });

  const utils = trpc.useUtils();
  const { data: tanks, isLoading } = trpc.diesel.getDieselTanks.useQuery();
  const { data: stations } = trpc.getStations.useQuery();

  const createMutation = trpc.diesel.createDieselTank.useMutation({
    onSuccess: () => {
      toast({ title: "تم إضافة الخزان بنجاح" });
      utils.diesel.getDieselTanks.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.diesel.updateDieselTank.useMutation({
    onSuccess: () => {
      toast({ title: "تم تحديث الخزان بنجاح" });
      utils.diesel.getDieselTanks.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.deleteDieselTank.useMutation({
    onSuccess: () => {
      toast({ title: "تم حذف الخزان بنجاح" });
      utils.diesel.getDieselTanks.invalidate();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "", nameAr: "", nameEn: "", stationId: "", type: "receiving",
      material: "plastic", brand: "", color: "", capacity: "", height: "",
      diameter: "", deadStock: "0", minLevel: "0", openingsCount: "1",
    });
    setEditingTank(null);
  };

  const handleSubmit = () => {
    const effectiveCapacity = parseFloat(formData.capacity) - parseFloat(formData.deadStock || "0");
    const data = {
      code: formData.code, nameAr: formData.nameAr, nameEn: formData.nameEn || undefined,
      stationId: parseInt(formData.stationId),
      type: formData.type as "receiving" | "main" | "pre_output" | "generator",
      material: formData.material as "plastic" | "iron" | "stainless_steel" | "fiberglass",
      brand: formData.brand || undefined, color: formData.color || undefined,
      capacity: formData.capacity, height: formData.height || undefined,
      diameter: formData.diameter || undefined, deadStock: formData.deadStock || "0",
      effectiveCapacity: effectiveCapacity.toString(), minLevel: formData.minLevel || "0",
      openingsCount: parseInt(formData.openingsCount) || 1,
    };
    if (editingTank) { updateMutation.mutate({ id: editingTank.id, ...data }); }
    else { createMutation.mutate(data); }
  };

  const handleEdit = (tank: any) => {
    setEditingTank(tank);
    setFormData({
      code: tank.code, nameAr: tank.nameAr, nameEn: tank.nameEn || "",
      stationId: tank.stationId?.toString() || "", type: tank.type,
      material: tank.material || "plastic", brand: tank.brand || "",
      color: tank.color || "", capacity: tank.capacity?.toString() || "",
      height: tank.height?.toString() || "", diameter: tank.diameter?.toString() || "",
      deadStock: tank.deadStock?.toString() || "0", minLevel: tank.minLevel?.toString() || "0",
      openingsCount: tank.openingsCount?.toString() || "1",
    });
    setIsDialogOpen(true);
  };

  const getTankTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      receiving: "خزان استلام", main: "خزان رئيسي",
      pre_output: "خزان قبل طرمبة الخروج", generator: "خزان مولد",
    };
    return types[type] || type;
  };

  const getMaterialLabel = (material: string) => {
    const materials: Record<string, string> = {
      plastic: "بلاستيك", iron: "حديد",
      stainless_steel: "ستانلس ستيل", fiberglass: "فايبر جلاس",
    };
    return materials[material] || material;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">خزانات الديزل</h1>
          <p className="text-muted-foreground">إدارة خزانات الديزل في المحطات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="ml-2 h-4 w-4" />إضافة خزان</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTank ? "تعديل خزان" : "إضافة خزان جديد"}</DialogTitle>
              <DialogDescription>أدخل بيانات الخزان</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكود</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="TNK-001" />
                </div>
                <div className="space-y-2">
                  <Label>المحطة</Label>
                  <Select value={formData.stationId} onValueChange={(value) => setFormData({ ...formData, stationId: value })}>
                    <SelectTrigger><SelectValue placeholder="اختر المحطة" /></SelectTrigger>
                    <SelectContent>
                      {stations?.map((station: any) => (
                        <SelectItem key={station.id} value={station.id.toString()}>{station.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم بالعربي</Label>
                  <Input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} placeholder="خزان استلام 1" />
                </div>
                <div className="space-y-2">
                  <Label>الاسم بالإنجليزي</Label>
                  <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} placeholder="Receiving Tank 1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الخزان</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receiving">خزان استلام</SelectItem>
                      <SelectItem value="main">خزان رئيسي</SelectItem>
                      <SelectItem value="pre_output">خزان قبل طرمبة الخروج</SelectItem>
                      <SelectItem value="generator">خزان مولد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>مادة الخزان</Label>
                  <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plastic">بلاستيك</SelectItem>
                      <SelectItem value="iron">حديد</SelectItem>
                      <SelectItem value="stainless_steel">ستانلس ستيل</SelectItem>
                      <SelectItem value="fiberglass">فايبر جلاس</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الماركة</Label>
                  <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} placeholder="الماركة" />
                </div>
                <div className="space-y-2">
                  <Label>اللون</Label>
                  <Input value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} placeholder="أسود" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>السعة (لتر)</Label>
                  <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>الارتفاع (سم)</Label>
                  <Input type="number" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} placeholder="200" />
                </div>
                <div className="space-y-2">
                  <Label>القطر (سم)</Label>
                  <Input type="number" value={formData.diameter} onChange={(e) => setFormData({ ...formData, diameter: e.target.value })} placeholder="150" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الكمية الميتة (لتر)</Label>
                  <Input type="number" value={formData.deadStock} onChange={(e) => setFormData({ ...formData, deadStock: e.target.value })} placeholder="200" />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأدنى (لتر)</Label>
                  <Input type="number" value={formData.minLevel} onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })} placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label>عدد الفتحات</Label>
                  <Input type="number" value={formData.openingsCount} onChange={(e) => setFormData({ ...formData, openingsCount: e.target.value })} placeholder="3" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTank ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخزانات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tanks?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">خزانات الاستلام</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tanks?.filter((t: any) => t.type === "receiving").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخزانات الرئيسية</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tanks?.filter((t: any) => t.type === "main").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">خزانات المولدات</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{tanks?.filter((t: any) => t.type === "generator").length || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الخزانات</CardTitle>
          <CardDescription>جميع خزانات الديزل المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">جاري التحميل...</p>
          ) : tanks?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد خزانات مسجلة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المادة</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>الكمية الميتة</TableHead>
                  <TableHead>السعة الفعلية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tanks?.map((tank: any) => (
                  <TableRow key={tank.id}>
                    <TableCell className="font-medium">{tank.code}</TableCell>
                    <TableCell>{tank.nameAr}</TableCell>
                    <TableCell><Badge variant="outline">{getTankTypeLabel(tank.type)}</Badge></TableCell>
                    <TableCell>{getMaterialLabel(tank.material)}</TableCell>
                    <TableCell>{tank.capacity} لتر</TableCell>
                    <TableCell>{tank.deadStock || 0} لتر</TableCell>
                    <TableCell>{tank.effectiveCapacity || tank.capacity} لتر</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tank)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("هل أنت متأكد من حذف هذا الخزان؟")) { deleteMutation.mutate({ id: tank.id }); } }}>
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
    </div>
  );
}
