import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Gauge, Search, Plus, Edit, Trash2, Loader2,
  CheckCircle, XCircle, Thermometer, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "نشط", color: "bg-success/20 text-success", icon: CheckCircle },
    inactive: { label: "غير نشط", color: "bg-destructive/20 text-destructive", icon: XCircle },
    maintenance: { label: "صيانة", color: "bg-warning/20 text-warning", icon: Activity },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Gauge };
  const Icon = (config as any).icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${(config as any).color}`}>
      <Icon className="w-3 h-3" />
      {(config as any).label}
    </span>
  );
}

export default function Sensors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingSensor, setEditingSensor] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "temperature",
    unit: "",
    minValue: "",
    maxValue: "",
    warningThreshold: "",
    criticalThreshold: "",
    location: "",
    status: "active",
  });

  // Fetch sensors
  const { data: sensors = [], isLoading, refetch } = trpc.scada.sensors.list.useQuery({
    businessId: 1,
  });

  // Mutations
  const createMutation = trpc.scada.sensors.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المستشعر بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const updateMutation = trpc.scada.sensors.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستشعر بنجاح");
      setEditingSensor(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const deleteMutation = trpc.scada.sensors.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستشعر");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      type: "temperature",
      unit: "",
      minValue: "",
      maxValue: "",
      warningThreshold: "",
      criticalThreshold: "",
      location: "",
      status: "active",
    });
  };

  const handleSubmit = () => {
    if (!(formData as any).code || !(formData as any).nameAr) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const data = {
      businessId: 1,
      code: (formData as any).code,
      nameAr: (formData as any).nameAr,
      nameEn: (formData as any).nameEn || undefined,
      type: (formData as any).type,
      unit: (formData as any).unit || undefined,
      minValue: (formData as any).minValue ? parseFloat((formData as any).minValue) : undefined,
      maxValue: (formData as any).maxValue ? parseFloat((formData as any).maxValue) : undefined,
      warningThreshold: (formData as any).warningThreshold ? parseFloat((formData as any).warningThreshold) : undefined,
      criticalThreshold: (formData as any).criticalThreshold ? parseFloat((formData as any).criticalThreshold) : undefined,
      location: (formData as any).location || undefined,
      status: (formData as any).status,
    };

    if (editingSensor) {
      updateMutation.mutate({ id: editingSensor.id, data } as any);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (sensor: any) => {
    setEditingSensor(sensor);
    setFormData({
      code: sensor.code || "",
      nameAr: sensor.nameAr || "",
      nameEn: sensor.nameEn || "",
      type: sensor.type || "temperature",
      unit: sensor.unit || "",
      minValue: sensor.minValue?.toString() || "",
      maxValue: sensor.maxValue?.toString() || "",
      warningThreshold: sensor.warningThreshold?.toString() || "",
      criticalThreshold: sensor.criticalThreshold?.toString() || "",
      location: sensor.location || "",
      status: sensor.status || "active",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستشعر؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  const filteredSensors = (sensors as any[]).filter((sensor: any) => {
    if (searchQuery && !sensor.nameAr?.includes(searchQuery) && !sensor.code?.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== "all" && sensor.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const sensorTypes = [
    { value: "temperature", label: "درجة الحرارة" },
    { value: "humidity", label: "الرطوبة" },
    { value: "pressure", label: "الضغط" },
    { value: "voltage", label: "الجهد" },
    { value: "current", label: "التيار" },
    { value: "power", label: "القدرة" },
    { value: "flow", label: "التدفق" },
    { value: "level", label: "المستوى" },
  ];

  const statCards = [
    { label: "إجمالي المستشعرات", value: sensors.length, icon: Gauge, color: "primary" },
    { label: "نشطة", value: (sensors as any[]).filter((s: any) => s.status === "active").length, icon: CheckCircle, color: "success" },
    { label: "غير نشطة", value: (sensors as any[]).filter((s: any) => s.status === "inactive").length, icon: XCircle, color: "destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Gauge className="w-7 h-7 text-primary" />
            إدارة المستشعرات
          </h1>
          <p className="text-muted-foreground">إدارة ومراقبة مستشعرات النظام</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          مستشعر جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold ltr-nums">{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المستشعرات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sensors Table */}
      <Card>
        <CardHeader>
          <CardTitle>المستشعرات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredSensors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مستشعرات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredSensors as any[]).map((sensor: any) => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-mono">{sensor.code}</TableCell>
                    <TableCell>{sensor.nameAr}</TableCell>
                    <TableCell>{sensorTypes.find(t => t.value === sensor.type)?.label || sensor.type}</TableCell>
                    <TableCell>{sensor.unit || "-"}</TableCell>
                    <TableCell><StatusBadge status={sensor.status} /></TableCell>
                    <TableCell>{sensor.location || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(sensor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sensor.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingSensor} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingSensor(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSensor ? "تعديل المستشعر" : "إضافة مستشعر جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={(formData as any).code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="SEN-001"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (عربي) *</Label>
              <Input
                value={(formData as any).nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="اسم المستشعر"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (إنجليزي)</Label>
              <Input
                value={(formData as any).nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Sensor Name"
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={(formData as any).type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sensorTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الوحدة</Label>
              <Input
                value={(formData as any).unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="°C, V, A, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={(formData as any).status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى</Label>
              <Input
                type="number"
                value={(formData as any).minValue}
                onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأقصى</Label>
              <Input
                type="number"
                value={(formData as any).maxValue}
                onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>حد التحذير</Label>
              <Input
                type="number"
                value={(formData as any).warningThreshold}
                onChange={(e) => setFormData({ ...formData, warningThreshold: e.target.value })}
                placeholder="80"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الحرج</Label>
              <Input
                type="number"
                value={(formData as any).criticalThreshold}
                onChange={(e) => setFormData({ ...formData, criticalThreshold: e.target.value })}
                placeholder="95"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>الموقع</Label>
              <Input
                value={(formData as any).location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="موقع المستشعر"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingSensor(null); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {editingSensor ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
