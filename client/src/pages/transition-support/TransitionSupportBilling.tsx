import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Edit,
  DollarSign,
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "تعديلات الفوترة",
  description: "تعديلات الفوترة للمرحلة الانتقالية.",
  process: `1) عرض تعديلات الفوترة:
   - التعديلات المطبقة على الفواتير
   - التعديلات المعلقة
   - سجل التعديلات

2) إدارة التعديلات:
   - إنشاء تعديلات جديدة
   - الموافقة على التعديلات
   - رفض التعديلات`,
  mechanism: `- استعلامات tRPC لتعديلات الفوترة
- عرض البيانات في جدول
- إدارة التعديلات عبر mutations`,
  relatedScreens: [
    { name: "لوحة المراقبة", path: "/dashboard/transition-support/dashboard", description: "ملخص المرحلة الانتقالية" },
    { name: "الإشعارات", path: "/dashboard/transition-support/notifications", description: "إدارة الإشعارات" },
  ],
  businessLogic: "إدارة تعديلات الفوترة خلال المرحلة الانتقالية.",
};

export default function TransitionSupportBilling() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: invoices, isLoading } = trpc.billing.invoices.list.useQuery({
    businessId,
    limit: 100,
  });

  const pageInfo = resolvePageInfo(location);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "معلق", variant: "secondary" as const, icon: Clock },
      approved: { label: "موافق", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "مرفوض", variant: "destructive" as const, icon: XCircle },
      applied: { label: "مطبق", variant: "default" as const, icon: CheckCircle },
    };
    
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  // تصفية الفواتير حسب الحالة
  const filteredInvoices = invoices?.data?.filter((inv: any) => {
    if (statusFilter === "all") return true;
    return inv.status === statusFilter;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-orange-500" />
            تعديلات الفوترة
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة التعديلات على الفواتير خلال المرحلة الانتقالية
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              <div className="text-sm text-muted-foreground mt-1">إجمالي الفواتير</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredInvoices.filter((inv: any) => inv.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">معلقة</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredInvoices.filter((inv: any) => inv.status === "approved" || inv.status === "applied").length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">موافق عليها</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredInvoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || "0"), 0).toLocaleString()} ريال
              </div>
              <div className="text-sm text-muted-foreground mt-1">إجمالي المبلغ</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="approved">موافق</SelectItem>
                  <SelectItem value="applied">مطبق</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>الفواتير التي تحتاج تعديلات خلال المرحلة الانتقالية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number || `INV-${invoice.id}`}</TableCell>
                    <TableCell>{invoice.customer_name || "-"}</TableCell>
                    <TableCell>
                      {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString("ar-SA") : "-"}
                    </TableCell>
                    <TableCell>
                      {parseFloat(invoice.total_amount || "0").toLocaleString()} ريال
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status || "pending")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              لا توجد فواتير
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

