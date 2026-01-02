import { useParams, useNavigate } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  Wrench,
  Calendar,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  MapPin,
  FileText,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  assigned: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  assigned: "تم التعيين",
  in_progress: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const typeLabels: Record<string, string> = {
  preventive: "وقائية",
  corrective: "تصحيحية",
  emergency: "طارئة",
  inspection: "فحص",
};

export default function WorkOrderDetails() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work order details
  const { data: workOrder, isLoading } = trpc.maintenance.workOrders.getById.useQuery({
    id: parseInt(id || "0"),
  });

  // Fetch technicians for assignment
  const { data: technicians = [] } = trpc.maintenance.technicians.list.useQuery({
    businessId: 1,
  });

  // Update status mutation
  const updateStatusMutation = trpc.maintenance.workOrders.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["maintenance", "workOrders"]] });
      toast({ title: "تم تحديث حالة أمر العمل بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Update status mutation
  const updateStatusMutation2 = trpc.maintenance.workOrders.updateStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["maintenance", "workOrders"]] });
      toast({ title: "تم تحديث حالة أمر العمل بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (workOrder) {
      updateStatusMutation2.mutate({
        id: (workOrder as any).id,
        status: newStatus as any,
      } as any);
    }
  };

  const handleAssignTechnician = (technicianId: string) => {
    if (workOrder) {
      updateStatusMutation.mutate({
        id: (workOrder as any).id,
        assignedTo: parseInt(technicianId),
      } as any);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">أمر العمل غير موجود</p>
        <Button onClick={() => navigate("/dashboard/maintenance/work-orders")}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard/maintenance/work-orders")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Wrench className="w-8 h-8 text-primary" />
              أمر العمل #{(workOrder as any).orderNumber || (workOrder as any).id}
            </h1>
            <p className="text-muted-foreground mt-1">{(workOrder as any).title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[(workOrder as any).status || "pending"]} text-white`}>
            {statusLabels[(workOrder as any).status || "pending"]}
          </Badge>
          <Badge className={`${priorityColors[(workOrder as any).priority || "medium"]} text-white`}>
            {priorityLabels[(workOrder as any).priority || "medium"]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                تفاصيل أمر العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">نوع الصيانة</p>
                  <p className="font-medium">{typeLabels[(workOrder as any).type || "corrective"]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأصل</p>
                  <p className="font-medium">{(workOrder as any).asset?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">
                    {(workOrder as any).createdAt
                      ? format(new Date((workOrder as any).createdAt), "yyyy/MM/dd HH:mm", { locale: ar })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الاستحقاق</p>
                  <p className="font-medium">
                    {(workOrder as any).scheduledEnd
                      ? format(new Date((workOrder as any).scheduledEnd), "yyyy/MM/dd", { locale: ar })
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">الوصف</p>
                <p className="font-medium whitespace-pre-wrap">
                  {(workOrder as any).description || "لا يوجد وصف"}
                </p>
              </div>

              {(workOrder as any).description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ملاحظات</p>
                    <p className="font-medium whitespace-pre-wrap">{(workOrder as any).description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                الجدول الزمني
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">تم إنشاء أمر العمل</p>
                    <p className="text-sm text-muted-foreground">
                      {(workOrder as any).createdAt
                        ? format(new Date((workOrder as any).createdAt), "yyyy/MM/dd HH:mm")
                        : "-"}
                    </p>
                  </div>
                </div>

                {(workOrder as any).assignedTo && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">تم تعيين الفني</p>
                      <p className="text-sm text-muted-foreground">
                        {(workOrder as any).assignedToUser?.nameAr || "فني"}
                      </p>
                    </div>
                  </div>
                )}

                {(workOrder as any).startedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">بدء العمل</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date((workOrder as any).startedAt), "yyyy/MM/dd HH:mm")}
                      </p>
                    </div>
                  </div>
                )}

                {(workOrder as any).completedAt && (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">اكتمال العمل</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date((workOrder as any).completedAt), "yyyy/MM/dd HH:mm")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">تغيير الحالة</label>
                <Select
                  value={(workOrder as any).status || "pending"}
                  onValueChange={handleStatusChange}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تعيين فني</label>
                <Select
                  value={(workOrder as any).assignedTo?.toString() || ""}
                  onValueChange={handleAssignTechnician}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفني" />
                  </SelectTrigger>
                  <SelectContent>
                    {(technicians as any[]).map((tech: any) => (
                      <SelectItem key={tech.id} value={tech.id.toString()}>
                        {tech.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Technician */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                الفني المعين
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(workOrder as any).assignedToUser ? (
                <div className="space-y-2">
                  <p className="font-medium">{(workOrder as any).assignedToUser?.nameAr}</p>
                  {(workOrder as any).assignedToUser?.phone && (
                    <p className="text-sm text-muted-foreground">
                      {(workOrder as any).assignedToUser?.phone}
                    </p>
                  )}
                  {(workOrder as any).assignedToUser?.specialization && (
                    <Badge variant="outline">{(workOrder as any).assignedToUser?.specialization}</Badge>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">لم يتم تعيين فني بعد</p>
              )}
            </CardContent>
          </Card>

          {/* Asset Info */}
          {(workOrder as any).assetData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  معلومات الأصل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">اسم الأصل</p>
                  <p className="font-medium">{(workOrder as any).assetData?.nameAr}</p>
                </div>
                {(workOrder as any).assetData?.code && (
                  <div>
                    <p className="text-sm text-muted-foreground">الرمز</p>
                    <p className="font-mono">{(workOrder as any).assetData?.code}</p>
                  </div>
                )}
                {(workOrder as any).assetData?.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {(workOrder as any).assetData?.location}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cost Info */}
          <Card>
            <CardHeader>
              <CardTitle>التكاليف</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">التكلفة المقدرة</span>
                <span className="font-medium">
                  {(workOrder as any).estimatedCost
                    ? `${parseFloat((workOrder as any).estimatedCost).toLocaleString()} ر.س`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التكلفة الفعلية</span>
                <span className="font-medium">
                  {(workOrder as any).actualCost
                    ? `${parseFloat((workOrder as any).actualCost).toLocaleString()} ر.س`
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
