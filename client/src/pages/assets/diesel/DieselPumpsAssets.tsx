import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Gauge, Plus, Edit, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function DieselPumpsAssets() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPump, setEditingPump] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    stationId: "",
    type: "intake",
    serialNumber: "",
    currentReading: "0",
  });

  const utils = trpc.useUtils();
  const { data: pumps, isLoading } = trpc.diesel.pumpMeters.list.useQuery();
  const { data: stations } = trpc.station.list.useQuery();

  const createMutation = trpc.diesel.pumpMeters.createMeter.useMutation({
    onSuccess: () => {
      toast({ title: "تم إضافة الطرمبة بنجاح" });
      utils.diesel.pumpMeters.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.diesel.pumpMeters.updateMeter.useMutation({
    onSuccess: () => {
      toast({ title: "تم تحديث الطرمبة بنجاح" });
      utils.diesel.pumpMeters.list.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.pumpMeters.deleteMeter.useMutation({
    onSuccess: () => {
      toast({ title: "تم حذف الطرمبة بنجاح" });
      utils.diesel.pumpMeters.list.invalidate();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "", nameAr: "", nameEn: "", stationId: "",
      type: "intake", serialNumber: "", currentReading: "0",
    });
    setEditingPump(null);
  };

  const handleSubmit = () => {
    const data = {
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      stationId: formData.stationId ? parseInt(formData.stationId) : undefined,
      type: formData.type as "supplier" | "intake" | "output",
      serialNumber: formData.serialNumber || undefined,
      currentReading: formData.currentReading || "0",
    };
    if (editingPump) { updateMutation.mutate({ id: editingPump.id, ...data } as any); }
    else { createMutation.mutate(data); }
  };

  const handleEdit = (pump: any) => {
    setEditingPump(pump);
    setFormData({
      code: pump.code, nameAr: pump.nameAr, nameEn: pump.nameEn || "",
      stationId: pump.stationId?.toString() || "", type: pump.type,
      serialNumber: pump.serialNumber || "", currentReading: pump.currentReading?.toString() || "0",
    });
    setIsDialogOpen(true);
  };

  const getPumpTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      supplier: "طرمبة المورد",
      intake: "طرمبة دخول",
      output: "طرمبة خروج",
    };
    return types[type] || type;
  };

  const getPumpTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      supplier: "bg-purple-100 text-purple-800",
      intake: "bg-blue-100 text-blue-800",
      output: "bg-green-100 text-green-800",
    };
    return colors[type] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طرمبات الديزل</h1>
          <p className="text-muted-foreground">إدارة طرمبات وعدادات الديزل</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="ml-2 h-4 w-4" />إضافة طرمبة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPump ? "تعديل طرمبة" : "إضافة طرمبة جديدة"}</DialogTitle>
              <DialogDescription>أدخل بيانات الطرمبة</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكود</Label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="PMP-001" />
                </div>
                <div className="space-y-2">
                  <Label>نوع الطرمبة</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="intake">طرمبة دخول (بعداد)</SelectItem>
                      <SelectItem value="output">طرمبة خروج (بعداد)</SelectItem>
                      <SelectItem value="supplier">طرمبة المورد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الاسم بالعربي</Label>
                  <Input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} placeholder="طرمبة دخول 1" />
                </div>
                <div className="space-y-2">
                  <Label>الاسم بالإنجليزي</Label>
                  <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} placeholder="Intake Pump 1" />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الرقم التسلسلي</Label>
                  <Input value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} placeholder="SN-123456" />
                </div>
                <div className="space-y-2">
                  <Label>القراءة الحالية</Label>
                  <Input type="number" value={formData.currentReading} onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })} placeholder="0" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingPump ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطرمبات</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pumps?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طرمبات الدخول</CardTitle>
            <Gauge className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pumps?.filter((p: any) => p.type === "intake").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طرمبات الخروج</CardTitle>
            <Gauge className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pumps?.filter((p: any) => p.type === "output").length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طرمبات الموردين</CardTitle>
            <Gauge className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pumps?.filter((p: any) => p.type === "supplier").length || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الطرمبات</CardTitle>
          <CardDescription>جميع طرمبات الديزل المسجلة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">جاري التحميل...</p>
          ) : pumps?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد طرمبات مسجلة</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرقم التسلسلي</TableHead>
                  <TableHead>القراءة الحالية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pumps?.map((pump: any) => (
                  <TableRow key={pump.id}>
                    <TableCell className="font-medium">{pump.code}</TableCell>
                    <TableCell>{pump.nameAr}</TableCell>
                    <TableCell><Badge className={getPumpTypeBadgeColor(pump.type)}>{getPumpTypeLabel(pump.type)}</Badge></TableCell>
                    <TableCell>{pump.serialNumber || "-"}</TableCell>
                    <TableCell>{pump.currentReading || 0} لتر</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(pump)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { if (confirm("هل أنت متأكد من حذف هذه الطرمبة؟")) { deleteMutation.mutate({ id: pump.id } as any); } }}>
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
