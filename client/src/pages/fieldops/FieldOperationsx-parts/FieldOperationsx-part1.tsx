import { useState } from "react";
import { useLocation } from "wouter";
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
  businessId?: number;
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
  } as any);

  const { data: teams } = trpc.fieldOps.teams.list.useQuery({ businessId } as any);
  const { data: workers } = trpc.fieldOps.workers.list.useQuery({ businessId } as any);

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

  const deleteMutation = trpc.fieldOps.operations.update.useMutation({
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
      operationType: (formData as any).get("operationType") as any,
      priority: (formData as any).get("priority") as any,
      title: (formData as any).get("title") as string,
      description: (formData as any).get("description") as string,
      address: (formData as any).get("address") as string,
      scheduledDate: (formData as any).get("scheduledDate") as string,
      assignedTeamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
      assignedWorkerId: (formData as any).get("workerId") ? Number((formData as any).get("workerId")) : undefined,
      estimatedDuration: (formData as any).get("duration") ? Number((formData as any).get("duration")) : undefined,
    });
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus as any } as any);
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
    return <Badge variant={(config as any).variant}>{(config as any).label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; className: string }> = {
      low: { label: "منخفضة", className: "bg-gray-100 text-gray-800" },
      medium: { label: "متوسطة", className: "bg-blue-100 text-blue-800" },
      high: { label: "عالية", className: "bg-orange-100 text-orange-800" },
      urgent: { label: "عاجلة", className: "bg-red-100 text-red-800" },
    };
    const config = priorityMap[priority] || { label: priority, className: "" };
    return <Badge className={(config as any).className}>{(config as any).label}</Badge>;
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
