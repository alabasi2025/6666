import { useState } from "react";
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
import { Plus, Search, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type RequestStatus = "pending" | "registered" | "material_specified" | "material_issued" | "installation_assigned" | "completed" | "cancelled";
type ServiceType = "electricity" | "water" | "gas";
type MeterCategory = "offline" | "sts" | "iot" | "any";

const statusColors: Record<RequestStatus, string> = {
  pending: "bg-blue-500",
  registered: "bg-cyan-500",
  material_specified: "bg-purple-500",
  material_issued: "bg-indigo-500",
  installation_assigned: "bg-orange-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<RequestStatus, string> = {
  pending: "قيد الانتظار",
  registered: "تم التسجيل",
  material_specified: "تم تحديد المواد",
  material_issued: "تم إصدار المواد",
  installation_assigned: "تم تعيين التركيب",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export default function SubscriptionRequestsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [formData, setFormData] = useState({
    stationId: "",
    customerName: "",
    customerMobile: "",
    customerAddress: "",
    serviceType: "electricity" as ServiceType,
    meterCategory: "offline" as MeterCategory,
    requestDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // tRPC queries
  const { data: requestsData, refetch } = trpc.customerSystem.getSubscriptionRequests.useQuery({
    businessId: 1,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page: currentPage,
    limit: 20,
  });

  const { data: stations } = trpc.station.list.useQuery();

  const createRequestMutation = trpc.customerSystem.createSubscriptionRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء طلب الاشتراك بنجاح",
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

  const registerRequestMutation = trpc.customerSystem.registerSubscriptionRequest.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تسجيل بيانات الطلب بنجاح",
      });
      setIsRegisterDialogOpen(false);
      setSelectedRequest(null);
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
      stationId: "",
      customerName: "",
      customerMobile: "",
      customerAddress: "",
      serviceType: "electricity",
      meterCategory: "offline",
      requestDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleCreateRequest = () => {
    createRequestMutation.mutate({
      businessId: 1,
      stationId: parseInt(formData.stationId),
      customerName: formData.customerName,
      customerMobile: formData.customerMobile,
      customerAddress: formData.customerAddress,
      serviceType: formData.serviceType,
      meterCategory: formData.meterCategory,
      requestDate: formData.requestDate,
      notes: formData.notes,
    });
  };

  const handleRegister = () => {
    if (!selectedRequest) return;

    registerRequestMutation.mutate({
      requestId: selectedRequest.id,
      registeredBy: 1, // ✅ سيتم جلب user ID من context في المستقبل
    });
  };

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">طلبات الاشتراك</h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة طلبات الاشتراك الجديدة
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          طلب اشتراك جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="ابحث عن طلب..."
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
                onValueChange={(value: RequestStatus | "all") => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="registered">تم التسجيل</SelectItem>
                  <SelectItem value="material_specified">تم تحديد المواد</SelectItem>
                  <SelectItem value="material_issued">تم إصدار المواد</SelectItem>
                  <SelectItem value="installation_assigned">تم تعيين التركيب</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة طلبات الاشتراك</CardTitle>
          <CardDescription>
            عرض {requestsData?.data.length || 0} من أصل {requestsData?.total || 0} طلب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">رقم الجوال</TableHead>
                <TableHead className="text-right">نوع الخدمة</TableHead>
                <TableHead className="text-right">نوع العداد</TableHead>
                <TableHead className="text-right">تاريخ الطلب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsData?.data.map((request: any) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.requestNumber}</TableCell>
                  <TableCell>{request.customerName}</TableCell>
                  <TableCell className="font-mono">{request.customerMobile || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {request.serviceType === "electricity" ? "كهرباء" : request.serviceType === "water" ? "ماء" : "غاز"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {request.meterCategory === "offline" ? "Offline" : request.meterCategory === "sts" ? "STS" : request.meterCategory === "iot" ? "IoT" : "أي نوع"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.requestDate), "yyyy/MM/dd", { locale: ar })}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[request.status as RequestStatus]} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(request.status)}
                      {statusLabels[request.status as RequestStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsRegisterDialogOpen(true);
                        }}
                      >
                        تسجيل
                      </Button>
                    )}
                    {request.status !== "pending" && request.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: Navigate to details page
                          toast({ title: "قريباً", description: "صفحة التفاصيل قيد التطوير" });
                        }}
                      >
                        التفاصيل
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {requestsData && requestsData.total > 20 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              <span className="py-2 px-4">
                صفحة {currentPage} من {Math.ceil(requestsData.total / 20)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= Math.ceil(requestsData.total / 20)}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>طلب اشتراك جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات العميل وتفاصيل الطلب
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
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
                  {(stations as any)?.map((station: any) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم العميل *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>رقم الجوال</Label>
                <Input
                  value={formData.customerMobile}
                  onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>العنوان</Label>
              <Textarea
                value={formData.customerAddress}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                placeholder="أدخل عنوان العميل"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>نوع الخدمة</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value: ServiceType) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">كهرباء</SelectItem>
                    <SelectItem value="water">ماء</SelectItem>
                    <SelectItem value="gas">غاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نوع العداد المطلوب</Label>
                <Select
                  value={formData.meterCategory}
                  onValueChange={(value: MeterCategory) => setFormData({ ...formData, meterCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="sts">STS</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                    <SelectItem value="any">أي نوع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>تاريخ الطلب</Label>
                <Input
                  type="date"
                  value={formData.requestDate}
                  onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateRequest} disabled={!formData.stationId || !formData.customerName}>
              إنشاء الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Request Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تسجيل بيانات الطلب</DialogTitle>
            <DialogDescription>
              {selectedRequest?.requestNumber} - {selectedRequest?.customerName}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">العميل:</span> {selectedRequest?.customerName}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">الجوال:</span> {selectedRequest?.customerMobile || "-"}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">العنوان:</span> {selectedRequest?.customerAddress || "-"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              بتسجيل الطلب، سيتم تحديث حالته إلى "تم التسجيل" وسيكون جاهزاً للمرحلة التالية (تحديد المواد).
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleRegister}>
              تسجيل الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

