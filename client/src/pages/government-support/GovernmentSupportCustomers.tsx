import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  Search,
  Edit,
  Plus,
  Shield,
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "بيانات الدعم",
  description: "إدارة بيانات الدعم للمشتركين في نظام الدعم الحكومي.",
  process: `1) عرض قائمة العملاء المدعومين:
   - البحث والفلترة حسب الحالة والفئة
   - عرض بيانات الدعم لكل عميل
   - عرض الحصص المستخدمة والمتبقية

2) إدارة بيانات الدعم:
   - تعديل بيانات الدعم للعملاء
   - تحديث الحصص والنسب
   - إدارة تواريخ البدء والانتهاء`,
  mechanism: `- استعلامات tRPC للعملاء المدعومين
- عرض البيانات في جدول مع إمكانية البحث
- تحديث بيانات الدعم عبر mutations`,
  relatedScreens: [
    { name: "لوحة التحكم", path: "/dashboard/government-support/dashboard", description: "ملخص نظام الدعم الحكومي" },
    { name: "الحصص", path: "/dashboard/government-support/quotas", description: "إدارة الحصص الشهرية" },
    { name: "تتبع الاستهلاك", path: "/dashboard/government-support/consumption", description: "تتبع استهلاك الدعم" },
  ],
  businessLogic: "إدارة شاملة لبيانات الدعم الحكومي للعملاء مع إمكانية التعديل والمتابعة.",
};

export default function GovernmentSupportCustomers() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const businessId = 1;

  const { data, isLoading, refetch } = trpc.governmentSupport.customers.list.useQuery({
    businessId,
    page,
    limit: 20,
    search: searchTerm || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    supportCategory: categoryFilter !== "all" ? categoryFilter : undefined,
  });

  const updateMutation = trpc.governmentSupport.customers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الدعم بنجاح");
      refetch();
      setShowEditDialog(false);
      setEditingCustomer(null);
    },
    onError: (error) => {
      toast.error(error.message || "فشل في تحديث البيانات");
    },
  });

  const [formData, setFormData] = useState({
    supportType: "electricity" as const,
    supportCategory: "low_income" as const,
    supportPercentage: 0,
    maxSupportAmount: 0,
    monthlyQuota: 0,
    status: "active" as const,
    startDate: "",
    endDate: "",
    notes: "",
  });

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      supportType: customer.support_type || "electricity",
      supportCategory: customer.support_category || "low_income",
      supportPercentage: parseFloat(customer.support_percentage || 0),
      maxSupportAmount: parseFloat(customer.max_support_amount || 0),
      monthlyQuota: parseFloat(customer.monthly_quota || 0),
      status: customer.status || "active",
      startDate: customer.start_date ? new Date(customer.start_date).toISOString().split("T")[0] : "",
      endDate: customer.end_date ? new Date(customer.end_date).toISOString().split("T")[0] : "",
      notes: customer.notes || "",
    });
    setShowEditDialog(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    updateMutation.mutate({
      id: editingCustomer.id,
      ...formData,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "نشط", variant: "default" },
      suspended: { label: "معلق", variant: "secondary" },
      expired: { label: "منتهي", variant: "destructive" },
      cancelled: { label: "ملغي", variant: "outline" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      low_income: "أسر محدودة الدخل",
      disabled: "ذوي الإعاقة",
      elderly: "كبار السن",
      widow: "أرامل",
      orphan: "أيتام",
      other: "أخرى",
    };
    return categoryMap[category] || category;
  };

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            بيانات الدعم
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة بيانات الدعم للمشتركين في نظام الدعم الحكومي
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو رقم الحساب..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="فئة الدعم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="low_income">أسر محدودة الدخل</SelectItem>
                <SelectItem value="disabled">ذوي الإعاقة</SelectItem>
                <SelectItem value="elderly">كبار السن</SelectItem>
                <SelectItem value="widow">أرامل</SelectItem>
                <SelectItem value="orphan">أيتام</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline">
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نشط</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.customers?.filter((c: any) => c.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معلق</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.customers?.filter((c: any) => c.status === "suspended").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتهي</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data?.customers?.filter((c: any) => c.status === "expired").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء المدعومين</CardTitle>
          <CardDescription>عرض وإدارة بيانات الدعم للعملاء</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : data?.customers && data.customers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العميل</TableHead>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>نوع الدعم</TableHead>
                    <TableHead>فئة الدعم</TableHead>
                    <TableHead>نسبة الدعم</TableHead>
                    <TableHead>الحصة الشهرية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.customer_name || "غير محدد"}</div>
                          {customer.customer_phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.customer_phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{customer.account_number || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.support_type === "electricity" && "كهرباء"}
                          {customer.support_type === "water" && "مياه"}
                          {customer.support_type === "gas" && "غاز"}
                          {customer.support_type === "mixed" && "مختلط"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getCategoryLabel(customer.support_category)}</TableCell>
                      <TableCell>{parseFloat(customer.support_percentage || 0).toFixed(1)}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          {parseFloat(customer.monthly_quota || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد بيانات
            </div>
          )}

          {/* Pagination */}
          {data && data.total > data.limit && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                عرض {((page - 1) * data.limit) + 1} - {Math.min(page * data.limit, data.total)} من {data.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * data.limit >= data.total}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الدعم</DialogTitle>
            <DialogDescription>
              تعديل بيانات الدعم للعميل: {editingCustomer?.customer_name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>نوع الدعم</Label>
                <Select
                  value={formData.supportType}
                  onValueChange={(value: any) => setFormData({ ...formData, supportType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">كهرباء</SelectItem>
                    <SelectItem value="water">مياه</SelectItem>
                    <SelectItem value="gas">غاز</SelectItem>
                    <SelectItem value="mixed">مختلط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>فئة الدعم</Label>
                <Select
                  value={formData.supportCategory}
                  onValueChange={(value: any) => setFormData({ ...formData, supportCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_income">أسر محدودة الدخل</SelectItem>
                    <SelectItem value="disabled">ذوي الإعاقة</SelectItem>
                    <SelectItem value="elderly">كبار السن</SelectItem>
                    <SelectItem value="widow">أرامل</SelectItem>
                    <SelectItem value="orphan">أيتام</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نسبة الدعم (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.supportPercentage}
                  onChange={(e) => setFormData({ ...formData, supportPercentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>الحد الأقصى للدعم (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.maxSupportAmount}
                  onChange={(e) => setFormData({ ...formData, maxSupportAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>الحصة الشهرية</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.monthlyQuota}
                  onChange={(e) => setFormData({ ...formData, monthlyQuota: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="suspended">معلق</SelectItem>
                    <SelectItem value="expired">منتهي</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>تاريخ البدء</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>ملاحظات</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ملاحظات إضافية..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingCustomer(null);
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

