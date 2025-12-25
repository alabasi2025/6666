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
