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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash2, Eye, Droplet, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

interface Tank {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  type: "receiving" | "main" | "rocket" | "generator";
  capacity: string;
  currentLevel: string | null;
  minLevel: string | null;
  linkedGeneratorId?: number | null;
  isActive: boolean | null;
  stationId: number;
}

const tankTypeLabels: Record<string, string> = {
  receiving: "خزان استلام",
  main: "خزان رئيسي",
  rocket: "خزان صاروخ",
  generator: "خزان مولد",
};

const tankTypeColors: Record<string, string> = {
  receiving: "bg-blue-500",
  main: "bg-green-500",
  rocket: "bg-orange-500",
  generator: "bg-purple-500",
};

export default function DieselTanks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "main" as "receiving" | "main" | "rocket" | "generator",
    capacity: "",
    currentLevel: "0",
    minLevel: "0",
    linkedGeneratorId: "",
    isActive: true,
    stationId: "",
  });

  const utils = trpc.useUtils();

  const { data: tanks = [], isLoading } = trpc.diesel.tanks.list.useQuery({
    businessId: user?.businessId ?? undefined,
  } as any);

  const { data: stations = [] } = trpc.station.list.useQuery({
    businessId: user?.businessId ?? undefined,
  } as any);

  const createMutation = trpc.diesel.tanks.create.useMutation({
    onSuccess: () => {
      utils.diesel.tanks.list.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إضافة الخزان بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.diesel.tanks.update.useMutation({
    onSuccess: () => {
      utils.diesel.tanks.list.invalidate();
      setIsEditOpen(false);
      resetForm();
      toast({ title: "تم تحديث الخزان بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.tanks.delete.useMutation({
    onSuccess: () => {
      utils.diesel.tanks.list.invalidate();
      toast({ title: "تم حذف الخزان بنجاح" });
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
      type: "main",
      capacity: "",
      currentLevel: "0",
      minLevel: "0",
      linkedGeneratorId: "",
      isActive: true,
      stationId: "",
    });
    setSelectedTank(null);
  };

  const handleAdd = () => {
    if (!formData.code || !formData.nameAr || !formData.capacity || !formData.stationId) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId || 1,
      stationId: parseInt(formData.stationId),
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      type: formData.type,
      capacity: parseFloat(formData.capacity),
      currentLevel: parseFloat(formData.currentLevel) || 0,
      minLevel: parseFloat(formData.minLevel) || 0,
      linkedGeneratorId: formData.linkedGeneratorId ? parseInt(formData.linkedGeneratorId) : undefined,
      isActive: formData.isActive,
    } as any);
  };

  const handleEdit = () => {
    if (!selectedTank) return;
    updateMutation.mutate({
      id: selectedTank.id,
      code: formData.code || undefined,
      nameAr: formData.nameAr || undefined,
      nameEn: formData.nameEn || undefined,
      type: formData.type,
      capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
      currentLevel: formData.currentLevel ? parseFloat(formData.currentLevel) : undefined,
      minLevel: formData.minLevel ? parseFloat(formData.minLevel) : undefined,
      linkedGeneratorId: formData.linkedGeneratorId ? parseInt(formData.linkedGeneratorId) : undefined,
      isActive: formData.isActive,
    } as any);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الخزان؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  const openEditDialog = (tank: Tank) => {
    setSelectedTank(tank as any);
    setFormData({
      code: tank.code,
      nameAr: tank.nameAr,
      nameEn: tank.nameEn || "",
      type: tank.type,
      capacity: tank.capacity,
      currentLevel: tank.currentLevel || "0",
      minLevel: tank.minLevel || "0",
      linkedGeneratorId: tank.linkedGeneratorId?.toString() || "",
      isActive: tank.isActive ?? true,
      stationId: tank.stationId.toString(),
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (tank: Tank) => {
    setSelectedTank(tank as any);
    setIsViewOpen(true);
  };

  const getLevelPercentage = (tank: Tank) => {
    const current = parseFloat(tank.currentLevel || "0");
    const capacity = parseFloat(tank.capacity);
    return capacity > 0 ? (current / capacity) * 100 : 0;
  };

  const isLowLevel = (tank: Tank) => {
    const current = parseFloat(tank.currentLevel || "0");
    const min = parseFloat(tank.minLevel || "0");
    return current <= min;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">خزانات الديزل</h1>
          <p className="text-muted-foreground">إدارة خزانات الديزل في المحطات</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة خزان
        </Button>
      </div>

      {/* ملخص الخزانات */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(tankTypeLabels).map(([type, label]) => {
          const typeTanks = tanks.filter((t: any) => t.type === type);
          const lowLevelCount = typeTanks.filter((t: any) => isLowLevel(t as any)).length;
          return (
            <Card key={type}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{typeTanks.length}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${tankTypeColors[type]}`} />
                </div>
                {lowLevelCount > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-orange-500 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {lowLevelCount} منخفض المستوى
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الخزانات</CardTitle>
          <CardDescription>جميع خزانات الديزل المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : tanks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد خزانات مسجلة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>المستوى الحالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tanks.map((tank: any) => {
                  const percentage = getLevelPercentage(tank as any);
                  const lowLevel = isLowLevel(tank as any);
                  return (
                    <TableRow key={tank.id}>
                      <TableCell className="font-mono">{tank.code}</TableCell>
                      <TableCell>{tank.nameAr}</TableCell>
                      <TableCell>
                        <Badge className={tankTypeColors[tank.type]}>
                          {tankTypeLabels[tank.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{parseFloat(tank.capacity).toLocaleString()} لتر</TableCell>
                      <TableCell>
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-xs">
                            <span>{parseFloat(tank.currentLevel || "0").toLocaleString()} لتر</span>
                            <span>{percentage.toFixed(0)}%</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className={lowLevel ? "bg-red-200" : ""} 
                          />
                          {lowLevel && (
                            <div className="flex items-center gap-1 text-red-500 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              منخفض
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tank.isActive ? "default" : "secondary"}>
                          {tank.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(tank as any)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(tank as any)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tank.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog إضافة خزان */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة خزان جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المحطة *</Label>
              <Select
                value={formData.stationId}
                onValueChange={(value) => setFormData({ ...formData, stationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحطة" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station: any) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TNK001"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="خزان الاستلام الرئيسي"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Main Receiving Tank"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tankTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>السعة (لتر) *</Label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="10000"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                placeholder="0"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                placeholder="1000"
                type="number"
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
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل خزان */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الخزان</DialogTitle>
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
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tankTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>السعة (لتر) *</Label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                type="number"
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
              {updateMutation.isPending ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض تفاصيل الخزان */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الخزان</DialogTitle>
          </DialogHeader>
          {selectedTank && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الكود</p>
                  <p className="font-mono">{selectedTank.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p>{selectedTank.nameAr}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">النوع</p>
                  <Badge className={tankTypeColors[selectedTank.type]}>
                    {tankTypeLabels[selectedTank.type]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant={selectedTank.isActive ? "default" : "secondary"}>
                    {selectedTank.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">مستوى الخزان</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المستوى الحالي</span>
                    <span className="font-bold">
                      {parseFloat(selectedTank.currentLevel || "0").toLocaleString()} لتر
                    </span>
                  </div>
                  <Progress value={getLevelPercentage(selectedTank)} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>الحد الأدنى: {parseFloat(selectedTank.minLevel || "0").toLocaleString()} لتر</span>
                    <span>السعة: {parseFloat(selectedTank.capacity).toLocaleString()} لتر</span>
                  </div>
                  {isLowLevel(selectedTank) && (
                    <div className="flex items-center gap-2 text-red-500 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>تحذير: مستوى الخزان منخفض!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEditDialog(selectedTank!); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
