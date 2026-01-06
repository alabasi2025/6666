import { useState } from "react";
import { useLocation } from "wouter";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Link2, Smartphone } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const STS_METER_INFO = {
  title: "إدارة عدادات STS",
  description: "إدارة عدادات STS (Smart Token System) وربطها بالعملاء.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: sts.meters.list لجلب جميع عدادات STS
   - عرض العدادات في جدول مع معلومات: رقم العداد، العميل، الحالة، الرصيد
   - تطبيق فلاتر حسب العميل والحالة

2) إضافة عداد STS جديد:
   - النقر على "إضافة عداد STS"
   - فتح نموذج يحتوي على:
     * رقم العداد STS (مطلوب، فريد)
     * العميل (اختيار من قائمة)
     * العداد الأساسي (اختياري - ربط بعداد موجود)
     * معلومات العداد: الرقم التسلسلي، الصانع، الموديل
     * إعدادات API (اختياري)
   - حفظ العداد عبر tRPC: sts.meters.create

3) ربط عداد STS بعميل:
   - النقر على "ربط" في صف العداد
   - اختيار العميل والعداد الأساسي
   - حفظ الربط

4) تحديث حالة العداد:
   - تغيير الحالة (نشط/غير نشط/معطل/منقطع)
   - تحديث تلقائي للقائمة`,
  mechanism: `- استعلام tRPC: sts.meters.list.useQuery()
- نموذج CRUD مع التحقق من البيانات
- ربط بالعملاء والعدادات الأساسية
- تحديث فوري للقائمة بعد الحفظ`,
  relatedScreens: [
    { name: "شحن الرصيد", path: "/dashboard/sts/charging", description: "شحن رصيد عداد STS" },
    { name: "التوكنات", path: "/dashboard/sts/tokens", description: "عرض وإدارة التوكنات" },
    { name: "إعدادات API", path: "/dashboard/sts/integration", description: "إعدادات التكامل مع API مقدم الخدمة" },
    { name: "العملاء", path: "/dashboard/customers", description: "مصدر العملاء - يجب أن يكون العميل مسجل قبل ربط العداد" },
  ],
  businessLogic: "عدادات STS تسمح بشحن الرصيد عن بُعد باستخدام التوكنات. يجب ربط كل عداد STS بعميل وعداد أساسي.",
};

export default function STSManagement() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    meterId: "",
    stsMeterNumber: "",
    serialNumber: "",
    manufacturer: "",
    model: "",
    apiConfigId: "",
    installationDate: "",
    notes: "",
  });

  const businessId = 1; // TODO: Get from context

  // Fetch STS meters
  const { data, isLoading, refetch } = trpc.sts.meters.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    search: search || undefined,
  });

  // Fetch customers for dropdown
  const { data: customers } = trpc.customerSystem.getCustomers.useQuery({
    businessId,
    limit: 1000,
  });

  // Create mutation
  const createMutation = trpc.sts.meters.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء عداد STS بنجاح");
      setIsCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في إنشاء العداد: " + error.message);
    },
  });

  // Link mutation
  const linkMutation = trpc.sts.meters.linkToCustomer.useMutation({
    onSuccess: () => {
      toast.success("تم ربط العداد بنجاح");
      setIsLinkDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في ربط العداد: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      customerId: "",
      meterId: "",
      stsMeterNumber: "",
      serialNumber: "",
      manufacturer: "",
      model: "",
      apiConfigId: "",
      installationDate: "",
      notes: "",
    });
  };

  const handleCreate = () => {
    if (!formData.stsMeterNumber || !formData.customerId) {
      toast.error("الرجاء إدخال جميع الحقول المطلوبة");
      return;
    }

    createMutation.mutate({
      businessId,
      customerId: parseInt(formData.customerId),
      meterId: formData.meterId ? parseInt(formData.meterId) : undefined,
      stsMeterNumber: formData.stsMeterNumber,
      serialNumber: formData.serialNumber || undefined,
      manufacturer: formData.manufacturer || undefined,
      model: formData.model || undefined,
      apiConfigId: formData.apiConfigId ? parseInt(formData.apiConfigId) : undefined,
      installationDate: formData.installationDate || undefined,
      notes: formData.notes || undefined,
    });
  };

  const handleLink = (meterId: number, customerId: number, meterIdBase?: number) => {
    linkMutation.mutate({
      id: meterId,
      customerId,
      meterId: meterIdBase,
    });
  };

  const currentPageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-blue-500" />
            إدارة عدادات STS
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة عدادات STS (Smart Token System) وربطها بالعملاء
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة عداد STS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة عداد STS جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات عداد STS الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>رقم العداد STS *</Label>
                  <Input
                    value={formData.stsMeterNumber}
                    onChange={(e) => setFormData({ ...formData, stsMeterNumber: e.target.value })}
                    placeholder="STS-123456"
                  />
                </div>
                <div>
                  <Label>العميل *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.nameAr || customer.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>الرقم التسلسلي</Label>
                  <Input
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="SN123456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الصانع</Label>
                    <Input
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="اسم الصانع"
                    />
                  </div>
                  <div>
                    <Label>الموديل</Label>
                    <Input
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="الموديل"
                    />
                  </div>
                </div>
                <div>
                  <Label>تاريخ التركيب</Label>
                  <Input
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Input
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleCreate} disabled={createMutation.isLoading}>
                    حفظ
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="بحث برقم العداد أو اسم العميل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="حالة العداد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="faulty">معطل</SelectItem>
                <SelectItem value="disconnected">منقطع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة عدادات STS</CardTitle>
          <CardDescription>
            إجمالي: {data?.total || 0} عداد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العداد STS</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>الرقم التسلسلي</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.meters?.map((meter: any) => (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">{meter.sts_meter_number}</TableCell>
                    <TableCell>{meter.customer_name || "غير مرتبط"}</TableCell>
                    <TableCell>{meter.serial_number || "-"}</TableCell>
                    <TableCell>{parseFloat(meter.current_balance || 0).toFixed(2)} ر.س</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          meter.status === "active"
                            ? "default"
                            : meter.status === "faulty"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {meter.status === "active" && "نشط"}
                        {meter.status === "inactive" && "غير نشط"}
                        {meter.status === "faulty" && "معطل"}
                        {meter.status === "disconnected" && "منقطع"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMeter(meter.id);
                            setIsLinkDialogOpen(true);
                          }}
                        >
                          <Link2 className="w-4 h-4 mr-1" />
                          ربط
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/dashboard/sts/charging?meterId=${meter.id}`)}
                        >
                          شحن
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

