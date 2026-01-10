import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { Plus, Search, AlertCircle, CheckCircle, Clock, XCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type ComplaintStatus = "new" | "in_progress" | "resolved" | "closed" | "cancelled";
type ComplaintType = "billing" | "reading" | "meter_issue" | "service_quality" | "payment" | "disconnection" | "connection" | "other";
type ComplaintPriority = "low" | "medium" | "high" | "urgent";

const statusColors: Record<ComplaintStatus, string> = {
  new: "bg-blue-500",
  in_progress: "bg-yellow-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  cancelled: "bg-red-500",
};

const priorityColors: Record<ComplaintPriority, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-400",
  urgent: "bg-red-500",
};

const statusLabels: Record<ComplaintStatus, string> = {
  new: "جديد",
  in_progress: "قيد المعالجة",
  resolved: "تم الحل",
  closed: "مغلق",
  cancelled: "ملغي",
};

const priorityLabels: Record<ComplaintPriority, string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "عالي",
  urgent: "عاجل",
};

const complaintTypeLabels: Record<ComplaintType, string> = {
  billing: "الفوترة",
  reading: "القراءة",
  meter_issue: "مشكلة عداد",
  service_quality: "جودة الخدمة",
  payment: "الدفع",
  disconnection: "قطع الخدمة",
  connection: "توصيل الخدمة",
  other: "أخرى",
};

export default function ComplaintsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ComplaintType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerId: "",
    meterId: "",
    complaintType: "other" as ComplaintType,
    priority: "medium" as ComplaintPriority,
    subject: "",
    description: "",
  });

  const [updateData, setUpdateData] = useState({
    status: "in_progress" as ComplaintStatus,
    resolution: "",
    assignedTo: "",
  });

  // tRPC queries
  const { data: complaintsData, refetch } = trpc.customerSystem.getComplaints.useQuery({
    businessId: 1,
    status: statusFilter !== "all" ? statusFilter : undefined,
    complaintType: typeFilter !== "all" ? typeFilter : undefined,
    page: currentPage,
    limit: 20,
  });

  const createComplaintMutation = trpc.customerSystem.createComplaint.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء الشكوى بنجاح",
      });
      setIsCreateDialogOpen(false);
      resetFormData();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateComplaintMutation = trpc.customerSystem.updateComplaintStatus.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة الشكوى بنجاح",
      });
      setIsUpdateDialogOpen(false);
      setSelectedComplaint(null);
      refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetFormData = () => {
    setFormData({
      customerId: "",
      meterId: "",
      complaintType: "other",
      priority: "medium",
      subject: "",
      description: "",
    });
  };

  const handleCreateComplaint = () => {
    createComplaintMutation.mutate({
      businessId: 1,
      customerId: formData.customerId ? parseInt(formData.customerId) : undefined,
      meterId: formData.meterId ? parseInt(formData.meterId) : undefined,
      complaintType: formData.complaintType,
      priority: formData.priority,
      subject: formData.subject,
      description: formData.description,
    });
  };

  const handleUpdateComplaint = () => {
    if (!selectedComplaint) return;

    updateComplaintMutation.mutate({
      complaintId: selectedComplaint.id,
      status: updateData.status,
      resolution: updateData.resolution,
      assignedTo: updateData.assignedTo ? parseInt(updateData.assignedTo) : undefined,
    });
  };

  const openUpdateDialog = (complaint: any) => {
    setSelectedComplaint(complaint);
    setUpdateData({
      status: complaint.status,
      resolution: complaint.resolution || "",
      assignedTo: complaint.assignedTo?.toString() || "",
    });
    setIsUpdateDialogOpen(true);
  };

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الشكاوى</h1>
          <p className="text-muted-foreground mt-1">
            تتبع ومعالجة شكاوى العملاء
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة شكوى جديدة
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث عن شكوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: ComplaintStatus | "all") => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>النوع</Label>
              <Select
                value={typeFilter}
                onValueChange={(value: ComplaintType | "all") => setTypeFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="billing">الفوترة</SelectItem>
                  <SelectItem value="reading">القراءة</SelectItem>
                  <SelectItem value="meter_issue">مشكلة عداد</SelectItem>
                  <SelectItem value="service_quality">جودة الخدمة</SelectItem>
                  <SelectItem value="payment">الدفع</SelectItem>
                  <SelectItem value="disconnection">قطع الخدمة</SelectItem>
                  <SelectItem value="connection">توصيل الخدمة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الشكاوى</CardTitle>
          <CardDescription>
            عرض {complaintsData?.data.length || 0} من أصل {complaintsData?.total || 0} شكوى
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الشكوى</TableHead>
                <TableHead className="text-right">الموضوع</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintsData?.data.map((complaint: any) => (
                <TableRow key={complaint.id}>
                  <TableCell className="font-medium">{complaint.complaintNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{complaint.subject}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {complaint.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {complaintTypeLabels[complaint.complaintType as ComplaintType]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[complaint.priority as ComplaintPriority]}>
                      {priorityLabels[complaint.priority as ComplaintPriority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[complaint.status as ComplaintStatus]} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(complaint.status)}
                      {statusLabels[complaint.status as ComplaintStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(complaint.createdAt), "yyyy/MM/dd", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateDialog(complaint)}
                    >
                      تحديث
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {complaintsData && complaintsData.total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <span className="py-2 px-4">
                صفحة {currentPage} من {Math.ceil(complaintsData.total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= Math.ceil(complaintsData.total / 20)}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Complaint Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء شكوى جديدة</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الشكوى الجديدة
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم العميل (اختياري)</Label>
                <Input
                  type="number"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  placeholder="أدخل رقم العميل"
                />
              </div>

              <div className="space-y-2">
                <Label>رقم العداد (اختياري)</Label>
                <Input
                  type="number"
                  value={formData.meterId}
                  onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                  placeholder="أدخل رقم العداد"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الشكوى</Label>
                <Select
                  value={formData.complaintType}
                  onValueChange={(value: ComplaintType) => setFormData({ ...formData, complaintType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="billing">الفوترة</SelectItem>
                    <SelectItem value="reading">القراءة</SelectItem>
                    <SelectItem value="meter_issue">مشكلة عداد</SelectItem>
                    <SelectItem value="service_quality">جودة الخدمة</SelectItem>
                    <SelectItem value="payment">الدفع</SelectItem>
                    <SelectItem value="disconnection">قطع الخدمة</SelectItem>
                    <SelectItem value="connection">توصيل الخدمة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: ComplaintPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="urgent">عاجل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>الموضوع</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="أدخل موضوع الشكوى"
              />
            </div>

            <div className="space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أدخل تفاصيل الشكوى"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateComplaint} disabled={!formData.subject || !formData.description}>
              إنشاء الشكوى
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Complaint Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تحديث حالة الشكوى</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.complaintNumber} - {selectedComplaint?.subject}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={updateData.status}
                onValueChange={(value: ComplaintStatus) => setUpdateData({ ...updateData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="resolved">تم الحل</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(updateData.status === "resolved" || updateData.status === "closed") && (
              <div className="space-y-2">
                <Label>الحل</Label>
                <Textarea
                  value={updateData.resolution}
                  onChange={(e) => setUpdateData({ ...updateData, resolution: e.target.value })}
                  placeholder="أدخل تفاصيل الحل"
                  rows={4}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>تعيين إلى (رقم المستخدم)</Label>
              <Input
                type="number"
                value={updateData.assignedTo}
                onChange={(e) => setUpdateData({ ...updateData, assignedTo: e.target.value })}
                placeholder="أدخل رقم المستخدم"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateComplaint}>
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

