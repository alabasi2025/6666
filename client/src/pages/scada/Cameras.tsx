import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Camera, Search, Plus, Edit, Trash2, Loader2,
  CheckCircle, XCircle, Video, Eye, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    active: { label: "نشط", color: "bg-success/20 text-success", icon: CheckCircle },
    online: { label: "متصل", color: "bg-success/20 text-success", icon: CheckCircle },
    inactive: { label: "غير نشط", color: "bg-destructive/20 text-destructive", icon: XCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: XCircle },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Camera };
  const Icon = (config as any).icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${(config as any).color}`}>
      <Icon className="w-3 h-3" />
      {(config as any).label}
    </span>
  );
}

interface CameraForm {
  code: string;
  nameAr: string;
  nameEn: string;
  location: string;
  streamUrl: string;
  status: string;
}

const defaultForm: CameraForm = {
  code: "",
  nameAr: "",
  nameEn: "",
  location: "",
  streamUrl: "",
  status: "active",
};

export default function Cameras() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<any>(null);
  const [form, setForm] = useState<CameraForm>(defaultForm);
  const [viewCamera, setViewCamera] = useState<any>(null);

  // Fetch cameras (using equipment with type 'camera')
  const { data: cameras = [], isLoading, refetch } = trpc.scada.equipment.list.useQuery({
    businessId: 1,
    type: "camera",
  } as any);

  // Create mutation
  const createMutation = trpc.scada.equipment.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["scada", "equipment"]] });
      toast({ title: "تم إضافة الكاميرا بنجاح" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = trpc.scada.equipment.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["scada", "equipment"]] });
      toast({ title: "تم تحديث الكاميرا بنجاح" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = trpc.scada.equipment.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["scada", "equipment"]] });
      toast({ title: "تم حذف الكاميرا بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setEditingCamera(null);
  };

  const handleOpenDialog = (camera?: any) => {
    if (camera) {
      setEditingCamera(camera);
      setForm({
        code: camera.code || "",
        nameAr: camera.nameAr || "",
        nameEn: camera.nameEn || "",
        location: camera.location || "",
        streamUrl: camera.streamUrl || "",
        status: camera.status || "active",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.code || !form.nameAr) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const data = {
      ...form,
      businessId: 1,
      type: "camera",
    };

    if (editingCamera) {
      updateMutation.mutate({ id: editingCamera.id, ...data } as any);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الكاميرا؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  // Filter cameras
  const filteredCameras = (cameras as any[]).filter((camera: any) => {
    const matchesSearch =
      camera.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || camera.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { label: "إجمالي الكاميرات", value: cameras.length, icon: Camera, color: "primary" },
    { label: "نشطة", value: (cameras as any[]).filter((c: any) => c.status === "active" || c.status === "online").length, icon: CheckCircle, color: "success" },
    { label: "غير نشطة", value: (cameras as any[]).filter((c: any) => c.status === "inactive" || c.status === "offline").length, icon: XCircle, color: "destructive" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Camera className="w-7 h-7 text-primary" />
            إدارة الكاميرات
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة كاميرات المراقبة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 ml-2" />
            كاميرا جديدة
          </Button>
        </div>
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
                placeholder="بحث في الكاميرات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="online">متصل</SelectItem>
                <SelectItem value="offline">غير متصل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد كاميرات</p>
                <Button variant="link" onClick={() => handleOpenDialog()}>
                  إضافة كاميرا جديدة
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          (filteredCameras as any[]).map((camera: any) => (
            <Card key={camera.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                <Video className="w-12 h-12 text-muted-foreground" />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={camera.status || "active"} />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{camera.nameAr}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{camera.code}</p>
                <p className="text-sm text-muted-foreground">{camera.location || "-"}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewCamera(camera)}
                  >
                    <Eye className="w-4 h-4 ml-2" />
                    مشاهدة
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(camera)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(camera.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCamera ? "تعديل الكاميرا" : "إضافة كاميرا جديدة"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكود *</Label>
                <Input 
                  placeholder="CAM-001" 
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="online">متصل</SelectItem>
                    <SelectItem value="offline">غير متصل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربية *</Label>
              <Input 
                placeholder="اسم الكاميرا" 
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزية</Label>
              <Input 
                placeholder="Camera Name" 
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input 
                placeholder="موقع الكاميرا" 
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط البث</Label>
              <Input 
                placeholder="rtsp://..." 
                value={form.streamUrl}
                onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              )}
              {editingCamera ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Camera Dialog */}
      <Dialog open={!!viewCamera} onOpenChange={() => setViewCamera(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewCamera?.nameAr}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">البث المباشر غير متاح</p>
                {viewCamera?.streamUrl && (
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    {viewCamera.streamUrl}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الرمز</p>
                <p className="font-medium">{viewCamera?.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <StatusBadge status={viewCamera?.status || "active"} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الموقع</p>
                <p className="font-medium">{viewCamera?.location || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p className="font-medium">
                  {viewCamera?.updatedAt
                    ? new Date(viewCamera.updatedAt).toLocaleString("ar-SA")
                    : "-"}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCamera(null)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
