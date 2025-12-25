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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Server, Search, Plus, Edit, Trash2, Loader2,
  CheckCircle, XCircle, Settings, Wifi, WifiOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "نشط", color: "bg-success/20 text-success", icon: CheckCircle },
    online: { label: "متصل", color: "bg-success/20 text-success", icon: Wifi },
    inactive: { label: "غير نشط", color: "bg-destructive/20 text-destructive", icon: XCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: WifiOff },
    maintenance: { label: "صيانة", color: "bg-warning/20 text-warning", icon: Settings },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Server };
  const Icon = (config as any).icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${(config as any).color}`}>
      <Icon className="w-3 h-3" />
      {(config as any).label}
    </span>
  );
}

export default function Equipment() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    location: "",
    installationDate: "",
    status: "active",
    description: "",
  });

  // Fetch equipment
  const { data: equipment = [], isLoading, refetch } = trpc.scada.equipment.list.useQuery({
    businessId: 1,
  });

  // Mutations
  const createMutation = trpc.scada.equipment.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المعدة بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const updateMutation = trpc.scada.equipment.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المعدة بنجاح");
      setEditingEquipment(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ");
    },
  });

  const deleteMutation = trpc.scada.equipment.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المعدة");
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
      type: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      location: "",
      installationDate: "",
      status: "active",
      description: "",
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
      type: (formData as any).type || undefined,
      manufacturer: (formData as any).manufacturer || undefined,
      model: (formData as any).model || undefined,
      serialNumber: (formData as any).serialNumber || undefined,
      location: (formData as any).location || undefined,
      installationDate: (formData as any).installationDate || undefined,
      status: (formData as any).status,
      description: (formData as any).description || undefined,
    };

    if (editingEquipment) {
      updateMutation.mutate({ id: editingEquipment.id, data } as any);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingEquipment(item);
    setFormData({
      code: item.code || "",
      nameAr: item.nameAr || "",
      nameEn: item.nameEn || "",
      type: item.type || "",
      manufacturer: item.manufacturer || "",
      model: item.model || "",
      serialNumber: item.serialNumber || "",
      location: item.location || "",
      installationDate: item.installationDate ? new Date(item.installationDate).toISOString().split('T')[0] : "",
      status: item.status || "active",
      description: item.description || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المعدة؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  const filteredEquipment = (equipment as any[]).filter((item: any) => {
    if (searchQuery && !item.nameAr?.includes(searchQuery) && !item.code?.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const statCards = [
    { label: "إجمالي المعدات", value: equipment.length, icon: Server, color: "primary" },
    { label: "متصلة", value: (equipment as any[]).filter((e: any) => e.status === "active" || e.status === "online").length, icon: Wifi, color: "success" },
    { label: "غير متصلة", value: (equipment as any[]).filter((e: any) => e.status === "inactive" || e.status === "offline").length, icon: WifiOff, color: "destructive" },
    { label: "صيانة", value: (equipment as any[]).filter((e: any) => e.status === "maintenance").length, icon: Settings, color: "warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Server className="w-7 h-7 text-primary" />
            إدارة المعدات
          </h1>
          <p className="text-muted-foreground">إدارة ومراقبة معدات النظام</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
          <Plus className="w-4 h-4 ml-2" />
          معدة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  stat.color === "warning" && "bg-warning/20 text-warning",
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
                placeholder="بحث في المعدات..."
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

      {/* Equipment Table */}
      <Card>
        <CardHeader>
          <CardTitle>المعدات</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد معدات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الشركة المصنعة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(filteredEquipment as any[]).map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{item.code}</TableCell>
                    <TableCell>{item.nameAr}</TableCell>
                    <TableCell>{item.type || "-"}</TableCell>
                    <TableCell>{item.manufacturer || "-"}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell>{item.location || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
      <Dialog open={showAddDialog || !!editingEquipment} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingEquipment(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEquipment ? "تعديل المعدة" : "إضافة معدة جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={(formData as any).code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="EQP-001"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (عربي) *</Label>
              <Input
                value={(formData as any).nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="اسم المعدة"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم (إنجليزي)</Label>
              <Input
                value={(formData as any).nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Equipment Name"
              />
            </div>
            <div className="space-y-2">
              <Label>النوع</Label>
              <Input
                value={(formData as any).type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="نوع المعدة"
              />
            </div>
            <div className="space-y-2">
              <Label>الشركة المصنعة</Label>
              <Input
                value={(formData as any).manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                placeholder="الشركة المصنعة"
              />
            </div>
            <div className="space-y-2">
              <Label>الموديل</Label>
              <Input
                value={(formData as any).model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="رقم الموديل"
              />
            </div>
            <div className="space-y-2">
              <Label>الرقم التسلسلي</Label>
              <Input
                value={(formData as any).serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="الرقم التسلسلي"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input
                type="date"
                value={(formData as any).installationDate}
                onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
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
              <Label>الموقع</Label>
              <Input
                value={(formData as any).location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="موقع المعدة"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={(formData as any).description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف المعدة..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingEquipment(null); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {editingEquipment ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
