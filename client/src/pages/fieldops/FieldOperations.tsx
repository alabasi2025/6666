import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Plus, Search, Filter, MapPin, Clock, User, 
  Play, Pause, CheckCircle, XCircle, Eye, Edit, Trash2
} from "lucide-react";

interface FieldOperationsProps {
  businessId: number;
}

export default function FieldOperations({ businessId }: FieldOperationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [editingOperation, setEditingOperation] = useState<any>(null);

  const { data: operations, isLoading, refetch } = trpc.fieldOps.operations.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter : undefined,
    operationType: typeFilter !== "all" ? typeFilter : undefined,
  });

  const { data: teams } = trpc.fieldOps.teams.list.useQuery({ businessId });
  const { data: workers } = trpc.fieldOps.workers.list.useQuery({ businessId });

  const createMutation = trpc.fieldOps.operations.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء العملية بنجاح");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateStatusMutation = trpc.fieldOps.operations.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة العملية");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.fieldOps.operations.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث العملية بنجاح");
      setEditingOperation(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.fieldOps.operations.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف العملية بنجاح");
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
      operationNumber: `OP-${Date.now()}`,
      operationType: formData.get("operationType") as any,
      priority: formData.get("priority") as any,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      address: formData.get("address") as string,
      scheduledDate: formData.get("scheduledDate") as string,
      assignedTeamId: formData.get("teamId") ? Number(formData.get("teamId")) : undefined,
      assignedWorkerId: formData.get("workerId") ? Number(formData.get("workerId")) : undefined,
      estimatedDuration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
    });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus as any });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "مسودة", variant: "outline" },
      scheduled: { label: "مجدولة", variant: "secondary" },
      assigned: { label: "معينة", variant: "secondary" },
      in_progress: { label: "قيد التنفيذ", variant: "default" },
      waiting_customer: { label: "بانتظار العميل", variant: "outline" },
      on_hold: { label: "معلقة", variant: "destructive" },
      completed: { label: "مكتملة", variant: "default" },
      cancelled: { label: "ملغاة", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: "منخفضة", className: "bg-gray-100 text-gray-800" },
      medium: { label: "متوسطة", className: "bg-blue-100 text-blue-800" },
      high: { label: "عالية", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "عاجلة", className: "bg-red-100 text-red-800" },
    };
    const config = priorityMap[priority] || { label: priority, className: "" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      installation: "تركيب",
      maintenance: "صيانة",
      inspection: "فحص",
      disconnection: "فصل",
      reconnection: "إعادة توصيل",
      meter_reading: "قراءة عداد",
      collection: "تحصيل",
      repair: "إصلاح",
      replacement: "استبدال",
    };
    return <Badge variant="outline">{typeMap[type] || type}</Badge>;
  };

  const filteredOperations = operations?.filter((op) =>
    op.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.operationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة العمليات الميدانية</h1>
          <p className="text-muted-foreground">إنشاء ومتابعة العمليات الميدانية</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              عملية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء عملية ميدانية جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان العملية *</Label>
                  <Input id="title" name="title" required placeholder="أدخل عنوان العملية" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operationType">نوع العملية *</Label>
                  <Select name="operationType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العملية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installation">تركيب</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="inspection">فحص</SelectItem>
                      <SelectItem value="disconnection">فصل</SelectItem>
                      <SelectItem value="reconnection">إعادة توصيل</SelectItem>
                      <SelectItem value="meter_reading">قراءة عداد</SelectItem>
                      <SelectItem value="collection">تحصيل</SelectItem>
                      <SelectItem value="repair">إصلاح</SelectItem>
                      <SelectItem value="replacement">استبدال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">تاريخ التنفيذ</Label>
                  <Input id="scheduledDate" name="scheduledDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamId">الفريق المكلف</Label>
                  <Select name="teamId">
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
                  <Label htmlFor="workerId">العامل المكلف</Label>
                  <Select name="workerId">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العامل" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers?.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id.toString()}>
                          {worker.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">المدة المتوقعة (دقيقة)</Label>
                  <Input id="duration" name="duration" type="number" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input id="address" name="address" placeholder="أدخل العنوان" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea id="description" name="description" placeholder="وصف تفصيلي للعملية" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء العملية"}
                </Button>
              </div>
            </form>
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
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="scheduled">مجدولة</SelectItem>
                <SelectItem value="assigned">معينة</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="installation">تركيب</SelectItem>
                <SelectItem value="maintenance">صيانة</SelectItem>
                <SelectItem value="inspection">فحص</SelectItem>
                <SelectItem value="repair">إصلاح</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العمليات ({filteredOperations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredOperations && filteredOperations.length > 0 ? (
            <div className="space-y-4">
              {filteredOperations.map((op) => (
                <div
                  key={op.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {op.operationNumber}
                        </span>
                        {getStatusBadge(op.status || "scheduled")}
                        {getTypeBadge(op.operationType || "maintenance")}
                        {getPriorityBadge(op.priority || "medium")}
                      </div>
                      <h3 className="font-medium text-lg">{op.title}</h3>
                      {op.description && (
                        <p className="text-sm text-muted-foreground mt-1">{op.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {op.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {op.address}
                          </span>
                        )}
                        {op.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(op.scheduledDate).toLocaleDateString("ar-SA")}
                          </span>
                        )}
                        {op.assignedWorkerId && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            عامل #{op.assignedWorkerId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {op.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(op.id, "in_progress")}
                        >
                          <Play className="h-4 w-4 ml-1" />
                          بدء
                        </Button>
                      )}
                      {op.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(op.id, "on_hold")}
                          >
                            <Pause className="h-4 w-4 ml-1" />
                            تعليق
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(op.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            إكمال
                          </Button>
                        </>
                      )}
                      {op.status === "on_hold" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(op.id, "in_progress")}
                        >
                          <Play className="h-4 w-4 ml-1" />
                          استئناف
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOperation(op)}
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingOperation(op)}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
                            deleteMutation.mutate({ id: op.id });
                          }
                        }}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد عمليات</p>
              <Button variant="link" onClick={() => setIsCreateOpen(true)}>
                إنشاء عملية جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operation Details Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العملية</DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم العملية</Label>
                  <p className="font-mono">{selectedOperation.operationNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div>{getStatusBadge(selectedOperation.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">النوع</Label>
                  <div>{getTypeBadge(selectedOperation.operationType)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">الأولوية</Label>
                  <div>{getPriorityBadge(selectedOperation.priority)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p className="font-medium">{selectedOperation.title}</p>
                </div>
                {selectedOperation.description && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">الوصف</Label>
                    <p>{selectedOperation.description}</p>
                  </div>
                )}
                {selectedOperation.address && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">الموقع</Label>
                    <p>{selectedOperation.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Operation Dialog */}
      <Dialog open={!!editingOperation} onOpenChange={() => setEditingOperation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العملية</DialogTitle>
          </DialogHeader>
          {editingOperation && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateMutation.mutate({
                id: editingOperation.id,
                data: {
                  title: formData.get("title") as string,
                  description: formData.get("description") as string || undefined,
                  address: formData.get("address") as string || undefined,
                  operationType: formData.get("operationType") as any,
                  priority: formData.get("priority") as any,
                  scheduledDate: formData.get("scheduledDate") as string || undefined,
                  assignedTeamId: formData.get("teamId") ? Number(formData.get("teamId")) : undefined,
                  assignedWorkerId: formData.get("workerId") ? Number(formData.get("workerId")) : undefined,
                },
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">عنوان العملية *</Label>
                  <Input id="edit-title" name="title" required defaultValue={editingOperation.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-operationType">نوع العملية *</Label>
                  <Select name="operationType" defaultValue={editingOperation.operationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installation">تركيب</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="inspection">فحص</SelectItem>
                      <SelectItem value="disconnection">فصل</SelectItem>
                      <SelectItem value="reconnection">إعادة توصيل</SelectItem>
                      <SelectItem value="meter_reading">قراءة عداد</SelectItem>
                      <SelectItem value="collection">تحصيل</SelectItem>
                      <SelectItem value="repair">إصلاح</SelectItem>
                      <SelectItem value="replacement">استبدال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">الأولوية</Label>
                  <Select name="priority" defaultValue={editingOperation.priority || "medium"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">تاريخ التنفيذ</Label>
                  <Input id="edit-scheduledDate" name="scheduledDate" type="date" defaultValue={editingOperation.scheduledDate?.split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-teamId">الفريق المكلف</Label>
                  <Select name="teamId" defaultValue={editingOperation.assignedTeamId?.toString()}>
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
                  <Label htmlFor="edit-workerId">العامل المكلف</Label>
                  <Select name="workerId" defaultValue={editingOperation.assignedWorkerId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العامل" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers?.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id.toString()}>
                          {worker.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Input id="edit-address" name="address" defaultValue={editingOperation.address} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingOperation.description} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingOperation(null)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
