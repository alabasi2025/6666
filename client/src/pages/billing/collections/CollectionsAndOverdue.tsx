// client/src/pages/billing/collections/CollectionsAndOverdue.tsx
// صفحة التحصيل والمتأخرات

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Send,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const COLLECTIONS_INFO = {
  title: "التحصيل والمتأخرات",
  description: "إدارة الفواتير المتأخرة وعمليات التحصيل.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: billing.getInvoices لجلب جميع الفواتير
   - حساب الفواتير المتأخرة (overdue)
   - حساب إجمالي المبالغ المستحقة
   - عرض الإحصائيات

2) فلترة الفواتير:
   - حسب الحالة (paid, partial, overdue)
   - حسب الفترة الزمنية
   - حسب المبلغ
   - حسب العميل

3) إجراءات التحصيل:
   - إرسال تذكير للعميل
   - تسجيل دفعة
   - طباعة كشف حساب
   - تصدير البيانات`,
  mechanism: `- استعلام tRPC: billing.getInvoices.useQuery()
- حساب الفواتير المتأخرة بناءً على dueDate
- فلترة وترتيب الفواتير
- إجراءات التحصيل عبر tRPC mutations`,
  relatedScreens: [
    { name: "المدفوعات", path: "/dashboard/billing/payments", description: "إدارة المدفوعات" },
    { name: "الفواتير", path: "/dashboard/billing/invoices", description: "إدارة الفواتير" },
  ],
  businessLogic: "التحصيل والمتأخرات يساعد في تتبع الفواتير غير المدفوعة وإدارة عمليات التحصيل بشكل فعال.",
};

interface OverdueInvoice {
  id: number;
  invoiceNo: string;
  customerId: number;
  customerName: string;
  accountNumber: string;
  phone?: string;
  email?: string;
  totalAmount: string;
  paidAmount: string;
  balanceDue: string;
  dueDate: string;
  daysOverdue: number;
  status: string;
}

export default function CollectionsAndOverdue() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [daysFilter, setDaysFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OverdueInvoice | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    notes: "",
  });

  // Fetch data
  const { data: invoices, isLoading, refetch } = trpc.billing.getInvoices.useQuery();
  const { data: customers } = trpc.billing.getCustomers.useQuery();
  const { data: cashboxes } = trpc.billing.getCashboxes.useQuery();
  const createPaymentMutation = trpc.billing.createPayment.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الدفعة بنجاح");
      setShowPaymentDialog(false);
      refetch();
    },
    onError: (error) => {
      toast.error("فشل تسجيل الدفعة: " + error.message);
    },
  });

  // Calculate overdue invoices
  const overdueInvoices = useMemo(() => {
    if (!invoices) return [];
    
    const today = new Date();
    return invoices
      .filter((inv: any) => {
        const dueDate = new Date(inv.dueDate);
        const balance = parseFloat(inv.balanceDue || "0");
        return dueDate < today && balance > 0;
      })
      .map((inv: any) => {
        const dueDate = new Date(inv.dueDate);
        const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: inv.id,
          invoiceNo: inv.invoiceNo || inv.invoiceNumber,
          customerId: inv.customerId,
          customerName: inv.customerName || inv.customer_name,
          accountNumber: inv.accountNumber || inv.account_number,
          phone: inv.phone,
          email: inv.email,
          totalAmount: inv.totalAmount || inv.total_amount,
          paidAmount: inv.paidAmount || inv.paid_amount,
          balanceDue: inv.balanceDue || inv.balance_due,
          dueDate: inv.dueDate || inv.due_date,
          daysOverdue: daysDiff,
          status: inv.status,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [invoices]);

  // Statistics
  const stats = useMemo(() => {
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.balanceDue), 0);
    const totalInvoices = overdueInvoices.length;
    const avgDaysOverdue = totalInvoices > 0
      ? overdueInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / totalInvoices
      : 0;
    const criticalOverdue = overdueInvoices.filter(inv => inv.daysOverdue > 90).length;
    
    return {
      totalOverdue,
      totalInvoices,
      avgDaysOverdue: Math.round(avgDaysOverdue),
      criticalOverdue,
    };
  }, [overdueInvoices]);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let filtered = overdueInvoices;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    // Days filter
    if (daysFilter !== "all") {
      const days = parseInt(daysFilter);
      filtered = filtered.filter((inv) => {
        if (daysFilter === "0-30") return inv.daysOverdue <= 30;
        if (daysFilter === "31-60") return inv.daysOverdue > 30 && inv.daysOverdue <= 60;
        if (daysFilter === "61-90") return inv.daysOverdue > 60 && inv.daysOverdue <= 90;
        if (daysFilter === "90+") return inv.daysOverdue > 90;
        return true;
      });
    }

    // Customer filter
    if (selectedCustomer) {
      filtered = filtered.filter((inv) => inv.customerId === selectedCustomer);
    }

    return filtered;
  }, [overdueInvoices, searchTerm, statusFilter, daysFilter, selectedCustomer]);

  const handleRecordPayment = (invoice: OverdueInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.balanceDue,
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: "",
      notes: "",
    });
    setShowPaymentDialog(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    await createPaymentMutation.mutateAsync({
      customerId: selectedInvoice.customerId,
      invoiceId: selectedInvoice.id,
      amount: paymentForm.amount,
      paymentMethod: paymentForm.paymentMethod as any,
      paymentDate: paymentForm.paymentDate,
      referenceNumber: paymentForm.referenceNumber || undefined,
      cashboxId: paymentForm.paymentMethod === "cash" ? cashboxes?.[0]?.id : undefined,
      notes: paymentForm.notes || undefined,
    } as any);
  };

  const handleSendReminder = async (invoice: OverdueInvoice) => {
    // TODO: إرسال تذكير عبر messagingRouter
    toast.info("جاري إرسال التذكير...");
  };

  const getOverdueBadge = (days: number) => {
    if (days <= 30) return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">متأخر {days} يوم</Badge>;
    if (days <= 60) return <Badge variant="outline" className="bg-orange-50 text-orange-700">متأخر {days} يوم</Badge>;
    if (days <= 90) return <Badge variant="outline" className="bg-red-50 text-red-700">متأخر {days} يوم</Badge>;
    return <Badge variant="destructive">حرج: {days} يوم</Badge>;
  };

  const currentPageInfo = resolvePageInfo("/dashboard/billing/collections");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-red-500" />
            التحصيل والمتأخرات
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة الفواتير المتأخرة وعمليات التحصيل
          </p>
        </div>
        <div className="flex gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المتأخرات</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalOverdue.toLocaleString()} ر.س
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد الفواتير المتأخرة</p>
                <p className="text-2xl font-bold">{stats.totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط التأخير</p>
                <p className="text-2xl font-bold">{stats.avgDaysOverdue} يوم</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">فواتير حرجة</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalOverdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالفاتورة أو العميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="generated">مولدة</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>مدة التأخير</Label>
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="0-30">0-30 يوم</SelectItem>
                  <SelectItem value="31-60">31-60 يوم</SelectItem>
                  <SelectItem value="61-90">61-90 يوم</SelectItem>
                  <SelectItem value="90+">أكثر من 90 يوم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العميل</Label>
              <Select
                value={selectedCustomer?.toString() || "all"}
                onValueChange={(v) => setSelectedCustomer(v === "all" ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  {customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.fullName || c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overdue Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>الفواتير المتأخرة</CardTitle>
          <CardDescription>
            {filteredInvoices.length} فاتورة متأخرة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد فواتير متأخرة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ المستحق</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>مدة التأخير</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-xs text-muted-foreground">{invoice.accountNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-red-600">
                      {parseFloat(invoice.balanceDue).toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>{getOverdueBadge(invoice.daysOverdue)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRecordPayment(invoice)}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          تسجيل دفعة
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(invoice)}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          تذكير
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

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
            <DialogDescription>
              تسجيل دفعة للفاتورة {selectedInvoice?.invoiceNo}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div>
              <Label>المبلغ *</Label>
              <Input
                type="number"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>طريقة الدفع *</Label>
              <Select
                value={paymentForm.paymentMethod}
                onValueChange={(v) => setPaymentForm({ ...paymentForm, paymentMethod: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>تاريخ الدفع *</Label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>رقم المرجع</Label>
              <Input
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                placeholder="رقم المرجع (اختياري)"
              />
            </div>
            <div>
              <Label>ملاحظات</Label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                placeholder="ملاحظات (اختياري)"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createPaymentMutation.isLoading}>
                {createPaymentMutation.isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

