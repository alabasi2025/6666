import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Search, User, Phone, Mail, Edit, MapPin, Eye, Trash2 } from "lucide-react";

interface FieldWorkersProps {
  businessId?: number;
}

export default function FieldWorkers({ businessId }: FieldWorkersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [viewingWorker, setViewingWorker] = useState<any>(null);

  const { data: workers, isLoading, refetch } = trpc.fieldOps.workers.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { data: teams } = trpc.fieldOps.teams.list.useQuery({ businessId });

  const createMutation = trpc.fieldOps.workers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة العامل بنجاح");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.fieldOps.workers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات العامل بنجاح");
      setEditingWorker(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.fieldOps.workers.update.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العامل بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId,
      employeeNumber: `EMP-${Date.now()}`,
      nameAr: (formData as any).get("nameAr") as string,
      nameEn: (formData as any).get("nameEn") as string || undefined,
      phone: (formData as any).get("phone") as string || undefined,
      email: (formData as any).get("email") as string || undefined,
      teamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
      workerType: (formData as any).get("workerType") as any,
      specialization: (formData as any).get("specialization") as string || undefined,
      dailyRate: (formData as any).get("dailyRate") ? Number((formData as any).get("dailyRate")) : undefined,
      operationRate: (formData as any).get("operationRate") ? Number((formData as any).get("operationRate")) : undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingWorker.id,
      data: {
        nameAr: (formData as any).get("nameAr") as string,
        nameEn: (formData as any).get("nameEn") as string || undefined,
        phone: (formData as any).get("phone") as string || undefined,
        email: (formData as any).get("email") as string || undefined,
        teamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
        workerType: (formData as any).get("workerType") as any,
        status: (formData as any).get("status") as any,
        specialization: (formData as any).get("specialization") as string || undefined,
        dailyRate: (formData as any).get("dailyRate") ? Number((formData as any).get("dailyRate")) : undefined,
        operationRate: (formData as any).get("operationRate") ? Number((formData as any).get("operationRate")) : undefined,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "متاح", variant: "default" },
      busy: { label: "مشغول", variant: "secondary" },
      on_leave: { label: "في إجازة", variant: "outline" },
      inactive: { label: "غير نشط", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={(config as any).variant}>{(config as any).label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      technician: "فني",
      engineer: "مهندس",
      supervisor: "مشرف",
      driver: "سائق",
      helper: "مساعد",
    };
    return <Badge variant="outline">{typeMap[type] || type}</Badge>;
  };

  const filteredWorkers = workers?.filter((worker) =>
    worker.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.phone?.includes(searchTerm)
  );

  const WorkerForm = ({ worker, onSubmit, isLoading: formLoading }: { worker?: any; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isLoading: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">الاسم (عربي) *</Label>
          <Input id="nameAr" name="nameAr" required defaultValue={worker?.nameAr} placeholder="أدخل الاسم" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">الاسم (إنجليزي)</Label>
          <Input id="nameEn" name="nameEn" defaultValue={worker?.nameEn} placeholder="Enter name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input id="phone" name="phone" defaultValue={worker?.phone} placeholder="05xxxxxxxx" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input id="email" name="email" type="email" defaultValue={worker?.email} placeholder="email@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workerType">نوع العامل *</Label>
          <Select name="workerType" defaultValue={worker?.workerType || "technician"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technician">فني</SelectItem>
              <SelectItem value="engineer">مهندس</SelectItem>
              <SelectItem value="supervisor">مشرف</SelectItem>
              <SelectItem value="driver">سائق</SelectItem>
              <SelectItem value="helper">مساعد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {worker && (
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select name="status" defaultValue={worker?.status || "available"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="on_leave">في إجازة</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="teamId">الفريق</Label>
          <Select name="teamId" defaultValue={worker?.teamId?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفريق" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialization">التخصص</Label>
          <Input id="specialization" name="specialization" defaultValue={worker?.specialization} placeholder="أدخل التخصص" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dailyRate">الأجر اليومي (ر.س)</Label>
          <Input id="dailyRate" name="dailyRate" type="number" defaultValue={worker?.dailyRate} placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="operationRate">أجر العملية (ر.س)</Label>
          <Input id="operationRate" name="operationRate" type="number" defaultValue={worker?.operationRate} placeholder="0.00" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => worker ? setEditingWorker(null) : setIsCreateOpen(false)}>
          إلغاء
        </Button>
        <Button type="submit" disabled={formLoading}>
          {formLoading ? "جاري الحفظ..." : worker ? "تحديث" : "إضافة"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">العاملين الميدانيين</h1>
          <p className="text-muted-foreground">إدارة العاملين في الفرق الميدانية</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عامل
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة عامل جديد</DialogTitle>
            </DialogHeader>
            <WorkerForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن عامل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="available">متاح</SelectItem>
                <SelectItem value="busy">مشغول</SelectItem>
                <SelectItem value="on_leave">في إجازة</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkers && filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {worker.nameAr.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{worker.nameAr}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewingWorker(worker)} title="عرض">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingWorker(worker)} title="تعديل">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا العامل؟")) {
                              deleteMutation.mutate({ id: worker.id } as any);
                            }
                          }}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">{worker.employeeNumber}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(worker.status || "available")}
                      {getTypeBadge(worker.workerType || "technician")}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  {worker.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{worker.phone}</span>
                    </div>
                  )}
                  {worker.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{worker.email}</span>
                    </div>
                  )}
                  {worker.currentLocationLat && worker.currentLocationLng && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>موقع محدث</span>
                    </div>
                  )}
                </div>
                {worker.specialization && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">التخصص: {worker.specialization}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا يوجد عاملين</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>
              إضافة عامل جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingWorker} onOpenChange={() => setEditingWorker(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات العامل</DialogTitle>
          </DialogHeader>
          {editingWorker && <WorkerForm worker={editingWorker} onSubmit={handleUpdate} isLoading={updateMutation.isPending} />}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingWorker} onOpenChange={() => setViewingWorker(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              عرض بيانات العامل
            </DialogTitle>
          </DialogHeader>
          {viewingWorker && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {viewingWorker.nameAr.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{viewingWorker.nameAr}</h3>
                  {viewingWorker.nameEn && <p className="text-muted-foreground">{viewingWorker.nameEn}</p>}
                  <p className="text-sm text-muted-foreground font-mono">{viewingWorker.employeeNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">نوع العامل</Label>
                    <div className="mt-1">{getTypeBadge(viewingWorker.workerType || "technician")}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الحالة</Label>
                    <div className="mt-1">{getStatusBadge(viewingWorker.status || "available")}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">التخصص</Label>
                    <p className="font-medium">{viewingWorker.specialization || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الفريق</Label>
                    <p className="font-medium">{teams?.find((t) => t.id === viewingWorker.teamId)?.nameAr || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">رقم الهاتف</Label>
                    <p className="font-medium" dir="ltr">{viewingWorker.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{viewingWorker.email || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الأجور</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">الأجر اليومي</Label>
                    <p className="font-medium">{viewingWorker.dailyRate ? `${viewingWorker.dailyRate} ر.س` : "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">أجر العملية</Label>
                    <p className="font-medium">{viewingWorker.operationRate ? `${viewingWorker.operationRate} ر.س` : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingWorker(null)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setViewingWorker(null); setEditingWorker(viewingWorker); }}>
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
