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
  Calendar,
  Plus,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "الحصص",
  description: "إدارة الحصص الشهرية لنظام الدعم الحكومي.",
  process: `1) عرض قائمة الحصص:
   - الحصص الوطنية والإقليمية والفئوية
   - الحصص الفردية للعملاء
   - عرض الميزانية المخصصة والمستخدمة

2) إدارة الحصص:
   - إنشاء حصص جديدة
   - حساب الحصص الشهرية تلقائياً
   - توزيع الحصص على العملاء`,
  mechanism: `- استعلامات tRPC للحصص
- عرض البيانات في جدول مع إحصائيات
- إنشاء وتحديث الحصص عبر mutations`,
  relatedScreens: [
    { name: "لوحة التحكم", path: "/dashboard/government-support/dashboard", description: "ملخص نظام الدعم الحكومي" },
    { name: "بيانات الدعم", path: "/dashboard/government-support/customers", description: "إدارة بيانات الدعم" },
  ],
  businessLogic: "إدارة شاملة للحصص الشهرية مع تتبع الميزانية والاستخدام.",
};

export default function GovernmentSupportQuotas() {
  const [location] = useLocation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [quotaTypeFilter, setQuotaTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const businessId = 1;

  const { data, isLoading, refetch } = trpc.governmentSupport.quotas.list.useQuery({
    businessId,
    year,
    month,
    quotaType: quotaTypeFilter !== "all" ? (quotaTypeFilter as any) : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    page,
    limit: 20,
  });

  const createMutation = trpc.governmentSupport.quotas.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحصة بنجاح");
      refetch();
      setShowCreateDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "فشل في إنشاء الحصة");
    },
  });

  const calculateMutation = trpc.governmentSupport.quotas.calculateMonthly.useMutation({
    onSuccess: () => {
      toast.success("تم حساب الحصص الشهرية بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل في حساب الحصص");
    },
  });

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quotaType: "national" as const,
    category: "",
    region: "",
    totalQuota: 0,
    totalBudget: 0,
    description: "",
  });

  const resetForm = () => {
    setFormData({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      quotaType: "national",
      category: "",
      region: "",
      totalQuota: 0,
      totalBudget: 0,
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId,
      ...formData,
    });
  };

  const getQuotaTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      national: "وطنية",
      regional: "إقليمية",
      category: "فئوية",
      individual: "فردية",
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "مسودة", variant: "outline" },
      active: { label: "نشطة", variant: "default" },
      closed: { label: "مغلقة", variant: "secondary" },
      cancelled: { label: "ملغاة", variant: "destructive" },
    };
    const statusInfo = statusMap[status] || { label: status, variant: "default" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-500" />
            الحصص
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة الحصص الشهرية لنظام الدعم الحكومي
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => calculateMutation.mutate({ businessId, year, month })}
            disabled={calculateMutation.isPending}
            variant="outline"
          >
            {calculateMutation.isPending ? "جاري الحساب..." : "حساب الحصص الشهرية"}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 ml-2" />
            إنشاء حصة جديدة
          </Button>
          <EngineInfoDialog info={pageInfo} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>السنة</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              />
            </div>
            <div>
              <Label>الشهر</Label>
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={quotaTypeFilter} onValueChange={setQuotaTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الحصة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="national">وطنية</SelectItem>
                <SelectItem value="regional">إقليمية</SelectItem>
                <SelectItem value="category">فئوية</SelectItem>
                <SelectItem value="individual">فردية</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="active">نشطة</SelectItem>
                <SelectItem value="closed">مغلقة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
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
            <CardTitle className="text-sm font-medium">إجمالي الحصص</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.quotas?.reduce((sum: number, q: any) => sum + parseFloat(q.total_quota || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدم</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data?.quotas?.reduce((sum: number, q: any) => sum + parseFloat(q.used_quota || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data?.quotas?.reduce((sum: number, q: any) => sum + parseFloat(q.remaining_quota || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الميزانية</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data?.quotas?.reduce((sum: number, q: any) => sum + parseFloat(q.total_budget || 0), 0).toLocaleString() || 0} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الحصص</CardTitle>
          <CardDescription>عرض وإدارة الحصص الشهرية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : data?.quotas && data.quotas.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفترة</TableHead>
                    <TableHead>نوع الحصة</TableHead>
                    <TableHead>الفئة/المنطقة</TableHead>
                    <TableHead>إجمالي الحصة</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>المتبقي</TableHead>
                    <TableHead>الميزانية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.quotas.map((quota: any) => {
                    const usedPercent = parseFloat(quota.total_quota || 0) > 0
                      ? (parseFloat(quota.used_quota || 0) / parseFloat(quota.total_quota || 0)) * 100
                      : 0;
                    return (
                      <TableRow key={quota.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {quota.year}/{quota.month}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getQuotaTypeLabel(quota.quota_type)}</Badge>
                        </TableCell>
                        <TableCell>
                          {quota.category || quota.region || "-"}
                        </TableCell>
                        <TableCell>
                          {parseFloat(quota.total_quota || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{parseFloat(quota.used_quota || 0).toLocaleString()}</span>
                            <span className="text-xs text-muted-foreground">
                              ({usedPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {parseFloat(quota.remaining_quota || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {parseFloat(quota.total_budget || 0).toLocaleString()} ر.س
                        </TableCell>
                        <TableCell>{getStatusBadge(quota.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد حصص
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

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء حصة جديدة</DialogTitle>
            <DialogDescription>
              إنشاء حصة جديدة لنظام الدعم الحكومي
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>السنة</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>
              <div>
                <Label>الشهر</Label>
                <Select
                  value={formData.month.toString()}
                  onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع الحصة</Label>
                <Select
                  value={formData.quotaType}
                  onValueChange={(value: any) => setFormData({ ...formData, quotaType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national">وطنية</SelectItem>
                    <SelectItem value="regional">إقليمية</SelectItem>
                    <SelectItem value="category">فئوية</SelectItem>
                    <SelectItem value="individual">فردية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.quotaType === "category" && (
                <div>
                  <Label>الفئة</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="أدخل الفئة..."
                  />
                </div>
              )}
              {formData.quotaType === "regional" && (
                <div>
                  <Label>المنطقة</Label>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="أدخل المنطقة..."
                  />
                </div>
              )}
              <div>
                <Label>إجمالي الحصة</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalQuota}
                  onChange={(e) => setFormData({ ...formData, totalQuota: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>إجمالي الميزانية (ر.س)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Label>الوصف</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحصة..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحصة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

