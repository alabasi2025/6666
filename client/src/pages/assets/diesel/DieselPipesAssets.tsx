// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pipette, Plus, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function DieselPipesAssets() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPipe, setEditingPipe] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    stationId: "",
    material: "iron",
    diameter: "",
    length: "",
    condition: "good",
  });

  const utils = trpc.useUtils();
  const { data: pipes, isLoading } = trpc.diesel.assets.pipes.list.useQuery();
  const { data: stations } = trpc.station.list.useQuery();

  const createMutation = trpc.diesel.assets.pipes.create.useMutation({
    onSuccess: () => {
      toast({ title: "تم إضافة المواصير بنجاح" });
      utils.diesel.assets.pipes.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.diesel.assets.pipes.update.useMutation({
    onSuccess: () => {
      toast({ title: "تم تحديث المواصير بنجاح" });
      utils.diesel.assets.pipes.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.assets.pipes.delete.useMutation({
    onSuccess: () => {
      toast({ title: "تم حذف المواصير بنجاح" });
      utils.diesel.assets.pipes.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "", nameAr: "", nameEn: "", stationId: "",
      material: "iron", diameter: "", length: "", condition: "good",
    });
    setEditingPipe(null);
  };

  const handleSubmit = () => {
    const data = {
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      stationId: parseInt(formData.stationId),
      material: formData.material as "iron" | "plastic" | "copper" | "stainless_steel",
      diameter: formData.diameter || undefined,
      length: formData.length || undefined,
      condition: formData.condition as "good" | "fair" | "poor" | "needs_replacement",
    };
    if (editingPipe) { updateMutation.mutate({ id: editingPipe.id, ...data }); }
    else { createMutation.mutate(data); }
  };

  const handleEdit = (pipe: any) => {
    setEditingPipe(pipe);
    setFormData({
      code: pipe.code, nameAr: pipe.nameAr, nameEn: pipe.nameEn || "",
      stationId: pipe.stationId?.toString() || "", material: pipe.material || "iron",
      diameter: pipe.diameter?.toString() || "", length: pipe.length?.toString() || "",
      condition: pipe.condition || "good",
    });
    setIsDialogOpen(true);
  };

  const getMaterialLabel = (material: string) => {
    const materials: Record<string, string> = {
      iron: "حديد", plastic: "بلاستيك",
      copper: "نحاس", stainless_steel: "ستانلس ستيل",
    };
    return materials[material] || material;
  };

  const getConditionLabel = (condition: string) => {
    const conditions: Record<string, string> = {
      good: "جيدة", fair: "متوسطة",
      poor: "سيئة", needs_replacement: "تحتاج استبدال",
    };
    return conditions[condition] || condition;
  };

  const getConditionBadgeColor = (condition: string) => {
    const colors: Record<string, string> = {
      good: "bg-green-100 text-green-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-orange-100 text-orange-800",
      needs_replacement: "bg-red-100 text-red-800",
    };
    return colors[condition] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مواصير التسليك</h1>
          <p className="text-muted-foreground">إدارة مواصير نقل الديزل</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="ml-2 h-4 w-4" />إضافة مواصير</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPipe ? "تعديل مواصير" : "إضافة مواصير جديدة"}</DialogTitle>
              <DialogDescription>أدخل بيانات المواصير</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكود</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="PIP-001" />
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
                  <Input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} placeholder="مواصير التسليك الرئيسية" />
                </div>
                <div className="space-y-2">
                  <Label>الاسم بالإنجليزي</Label>
                  <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} placeholder="Main Pipes" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>مادة المواصير</Label>
                  <Select value={formData.material} onValueChange={(value) => setFormData({ ...formData, material: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iron">حديد</SelectItem>
                      <SelectItem value="plastic">بلاستيك</SelectItem>
                      <SelectItem value="copper">نحاس</SelectItem>
                      <SelectItem value="stainless_steel">ستانلس ستيل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">جيدة</SelectItem>
                      <SelectItem value="fair">متوسطة</SelectItem>
                      <SelectItem value="poor">سيئة</SelectItem>
                      <SelectItem value="needs_replacement">تحتاج استبدال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>القطر (سم)</Label>
                  <Input type="number" value={formData.diameter} onChange={(e) => setFormData({ ...formData, diameter: e.target.value })} placeholder="5" />
                </div>
                <div className="space-y-2">
                  <Label>الطول (متر)</Label>
                  <Input type="number" value={formData.length} onChange={(e) => setFormData({ ...formData, length: e.target.value })} placeholder="10" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPipe ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المواصير</CardTitle>
            <Pipette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pipes?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة جيدة</CardTitle>
            <Pipette className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pipes?.filter((p: any) => p.condition === "good").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحتاج صيانة</CardTitle>
            <Pipette className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pipes?.filter((p: any) => p.condition === "fair" || p.condition === "poor").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحتاج استبدال</CardTitle>
            <Pipette className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pipes?.filter((p: any) => p.condition === "needs_replacement").length || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المواصير</CardTitle>
          <CardDescription>جميع مواصير التسليك المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">جاري التحميل...</p>
          ) : pipes?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد مواصير مسجلة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المادة</TableHead>
                  <TableHead>القطر</TableHead>
                  <TableHead>الطول</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipes?.map((pipe: any) => (
                  <TableRow key={pipe.id}>
                    <TableCell className="font-medium">{pipe.code}</TableCell>
                    <TableCell>{pipe.nameAr}</TableCell>
                    <TableCell>{getMaterialLabel(pipe.material)}</TableCell>
                    <TableCell>{pipe.diameter ? `${pipe.diameter} سم` : "-"}</TableCell>
                    <TableCell>{pipe.length ? `${pipe.length} متر` : "-"}</TableCell>
                    <TableCell><Badge className={getConditionBadgeColor(pipe.condition)}>{getConditionLabel(pipe.condition)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pipe)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("هل أنت متأكد من حذف هذه المواصير؟")) { deleteMutation.mutate({ id: pipe.id }); } }}>
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
