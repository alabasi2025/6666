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
import { useAuth } from "@/lib/auth";

interface Tank {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string;
  tankType: string;
  capacity: number;
  currentLevel: number;
  minLevel?: number;
  maxLevel?: number;
  location?: string;
  isActive: boolean;
}

const tankTypeLabels: Record<string, string> = {
  receiving: "خزان استلام",
  main: "خزان رئيسي",
  rocket: "خزان صاروخ",
  generator: "خزان مولد",
};

export default function DieselTanks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    tankType: "main",
    capacity: "",
    currentLevel: "0",
    minLevel: "",
    maxLevel: "",
    location: "",
    isActive: true,
  });

  const { data: tanks = [], isLoading } = useQuery({
    queryKey: ["diesel-tanks"],
    queryFn: () => trpc.diesel.tanks.list.query({ businessId: user?.businessId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.tanks.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tanks"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إضافة الخزان بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.tanks.update.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tanks"] });
      setIsEditOpen(false);
      resetForm();
      toast({ title: "تم تحديث الخزان بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trpc.diesel.tanks.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-tanks"] });
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
      tankType: "main",
      capacity: "",
      currentLevel: "0",
      minLevel: "",
      maxLevel: "",
      location: "",
      isActive: true,
    });
    setSelectedTank(null);
  };

  const handleAdd = () => {
    if (!formData.code || !formData.nameAr || !formData.capacity) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId,
      stationId: 1, // TODO: اختيار المحطة
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      tankType: formData.tankType,
      capacity: parseFloat(formData.capacity),
      currentLevel: parseFloat(formData.currentLevel) || 0,
      minLevel: formData.minLevel ? parseFloat(formData.minLevel) : undefined,
      maxLevel: formData.maxLevel ? parseFloat(formData.maxLevel) : undefined,
      location: formData.location || undefined,
      isActive: formData.isActive,
    });
  };

  const handleEdit = () => {
    if (!selectedTank) return;
    updateMutation.mutate({
      id: selectedTank.id,
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      tankType: formData.tankType,
      capacity: parseFloat(formData.capacity),
      currentLevel: parseFloat(formData.currentLevel) || 0,
      minLevel: formData.minLevel ? parseFloat(formData.minLevel) : undefined,
      maxLevel: formData.maxLevel ? parseFloat(formData.maxLevel) : undefined,
      location: formData.location || undefined,
      isActive: formData.isActive,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الخزان؟")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (tank: Tank) => {
    setSelectedTank(tank);
    setFormData({
      code: tank.code,
      nameAr: tank.nameAr,
      nameEn: tank.nameEn || "",
      tankType: tank.tankType,
      capacity: tank.capacity.toString(),
      currentLevel: tank.currentLevel.toString(),
      minLevel: tank.minLevel?.toString() || "",
      maxLevel: tank.maxLevel?.toString() || "",
      location: tank.location || "",
      isActive: tank.isActive,
    });
    setIsEditOpen(true);
  };

  const openViewDialog = (tank: Tank) => {
    setSelectedTank(tank);
    setIsViewOpen(true);
  };

  const getLevelPercentage = (tank: Tank) => {
    return Math.round((tank.currentLevel / tank.capacity) * 100);
  };

  const getLevelColor = (tank: Tank) => {
    const percentage = getLevelPercentage(tank);
    if (percentage < 20) return "bg-red-500";
    if (percentage < 40) return "bg-orange-500";
    if (percentage < 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const isLowLevel = (tank: Tank) => {
    if (tank.minLevel) {
      return tank.currentLevel <= tank.minLevel;
    }
    return getLevelPercentage(tank) < 20;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">خزانات الديزل</h1>
          <p className="text-muted-foreground">إدارة خزانات الديزل في المحطة</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة خزان
        </Button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي السعة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {tanks.reduce((sum: number, t: Tank) => sum + t.capacity, 0).toLocaleString()} لتر
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">الكمية الحالية</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {tanks.reduce((sum: number, t: Tank) => sum + t.currentLevel, 0).toLocaleString()} لتر
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">نسبة الامتلاء</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {tanks.length > 0 
                ? Math.round((tanks.reduce((sum: number, t: Tank) => sum + t.currentLevel, 0) / 
                    tanks.reduce((sum: number, t: Tank) => sum + t.capacity, 0)) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" /> منخفض المستوى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {tanks.filter((t: Tank) => isLowLevel(t)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* بطاقات الخزانات */}
      <div className="grid grid-cols-3 gap-4">
        {tanks.map((tank: Tank) => (
          <Card key={tank.id} className={isLowLevel(tank) ? "border-red-500 border-2" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className={`h-5 w-5 ${getLevelColor(tank).replace("bg-", "text-")}`} />
                    {tank.nameAr}
                  </CardTitle>
                  <CardDescription>{tank.code} - {tankTypeLabels[tank.tankType]}</CardDescription>
                </div>
                <Badge variant={tank.isActive ? "default" : "secondary"}>
                  {tank.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>المستوى الحالي</span>
                  <span className="font-bold">{getLevelPercentage(tank)}%</span>
                </div>
                <Progress value={getLevelPercentage(tank)} className={getLevelColor(tank)} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{tank.currentLevel.toLocaleString()} لتر</span>
                  <span>من {tank.capacity.toLocaleString()} لتر</span>
                </div>
              </div>
              
              {isLowLevel(tank) && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>مستوى منخفض - يحتاج إعادة تعبئة</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => openViewDialog(tank)}>
                  <Eye className="h-4 w-4 ml-1" /> عرض
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(tank)}>
                  <Edit className="h-4 w-4 ml-1" /> تعديل
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(tank.id)}>
                  <Trash2 className="h-4 w-4 ml-1 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tanks.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          لا يوجد خزانات مسجلة
        </div>
      )}

      {/* Dialog إضافة خزان */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة خزان جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TANK001"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.tankType}
                onValueChange={(value) => setFormData({ ...formData, tankType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receiving">خزان استلام</SelectItem>
                  <SelectItem value="main">خزان رئيسي</SelectItem>
                  <SelectItem value="rocket">خزان صاروخ</SelectItem>
                  <SelectItem value="generator">خزان مولد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="الخزان الرئيسي 1"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Main Tank 1"
              />
            </div>
            <div className="space-y-2">
              <Label>السعة (لتر) *</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                type="number"
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                type="number"
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأقصى (لتر)</Label>
              <Input
                type="number"
                value={formData.maxLevel}
                onChange={(e) => setFormData({ ...formData, maxLevel: e.target.value })}
                placeholder="9500"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="المنطقة الشمالية"
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
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.tankType}
                onValueChange={(value) => setFormData({ ...formData, tankType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receiving">خزان استلام</SelectItem>
                  <SelectItem value="main">خزان رئيسي</SelectItem>
                  <SelectItem value="rocket">خزان صاروخ</SelectItem>
                  <SelectItem value="generator">خزان مولد</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>السعة (لتر) *</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                type="number"
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                type="number"
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأقصى (لتر)</Label>
              <Input
                type="number"
                value={formData.maxLevel}
                onChange={(e) => setFormData({ ...formData, maxLevel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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

      {/* Dialog عرض الخزان */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الخزان</DialogTitle>
          </DialogHeader>
          {selectedTank && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Droplet className={`h-12 w-12 ${getLevelColor(selectedTank).replace("bg-", "text-")}`} />
                <div>
                  <h3 className="text-xl font-bold">{selectedTank.nameAr}</h3>
                  <p className="text-muted-foreground">{selectedTank.code}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>نوع الخزان:</span>
                  <span className="font-bold">{tankTypeLabels[selectedTank.tankType]}</span>
                </div>
                <div className="flex justify-between">
                  <span>السعة:</span>
                  <span className="font-bold">{selectedTank.capacity.toLocaleString()} لتر</span>
                </div>
                <div className="flex justify-between">
                  <span>المستوى الحالي:</span>
                  <span className="font-bold">{selectedTank.currentLevel.toLocaleString()} لتر</span>
                </div>
                <div className="flex justify-between">
                  <span>نسبة الامتلاء:</span>
                  <span className="font-bold">{getLevelPercentage(selectedTank)}%</span>
                </div>
                {selectedTank.minLevel && (
                  <div className="flex justify-between">
                    <span>الحد الأدنى:</span>
                    <span>{selectedTank.minLevel.toLocaleString()} لتر</span>
                  </div>
                )}
                {selectedTank.maxLevel && (
                  <div className="flex justify-between">
                    <span>الحد الأقصى:</span>
                    <span>{selectedTank.maxLevel.toLocaleString()} لتر</span>
                  </div>
                )}
                {selectedTank.location && (
                  <div className="flex justify-between">
                    <span>الموقع:</span>
                    <span>{selectedTank.location}</span>
                  </div>
                )}
              </div>

              <Progress value={getLevelPercentage(selectedTank)} className={getLevelColor(selectedTank)} />
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
