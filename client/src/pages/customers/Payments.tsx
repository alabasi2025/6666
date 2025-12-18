import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard, Plus, Search, MoreVertical, Eye, Printer,
  Download, Receipt, Calendar, DollarSign, Banknote,
  CheckCircle, Clock, TrendingUp, Building2, Smartphone
} from "lucide-react";
import DataTable from "@/components/DataTable";

// Payment Method Badge
function PaymentMethodBadge({ method }: { method: string }) {
  const methodConfig: Record<string, { label: string; color: string; icon: typeof CreditCard }> = {
    cash: { label: "نقدي", color: "bg-green-500/10 text-green-500", icon: Banknote },
    bank_transfer: { label: "تحويل بنكي", color: "bg-blue-500/10 text-blue-500", icon: Building2 },
    sadad: { label: "سداد", color: "bg-purple-500/10 text-purple-500", icon: Smartphone },
    credit_card: { label: "بطاقة ائتمان", color: "bg-orange-500/10 text-orange-500", icon: CreditCard },
    check: { label: "شيك", color: "bg-gray-500/10 text-gray-500", icon: Receipt },
  };

  const config = methodConfig[method] || { label: method, color: "bg-gray-500/10 text-gray-500", icon: CreditCard };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "مؤكد", variant: "default" },
    pending: { label: "قيد المعالجة", variant: "outline" },
    rejected: { label: "مرفوض", variant: "destructive" },
    cancelled: { label: "ملغى", variant: "secondary" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Sample Data
const paymentsData = [
  {
    id: 1,
    receiptNumber: "RCP-2024-0512",
    customerName: "محمد أحمد العلي",
    customerAccount: "C-2024-001",
    amount: 977.50,
    method: "bank_transfer",
    reference: "TRF-123456789",
    invoices: ["INV-2024-1201"],
    status: "confirmed",
    date: "2024-12-10",
    collector: "أحمد محمد",
  },
  {
    id: 2,
    receiptNumber: "RCP-2024-0511",
    customerName: "مصنع الحديد الوطني",
    customerAccount: "C-2024-003",
    amount: 20000.00,
    method: "bank_transfer",
    reference: "TRF-987654321",
    invoices: ["INV-2024-1203"],
    status: "confirmed",
    date: "2024-12-08",
    collector: "خالد عبدالله",
  },
  {
    id: 3,
    receiptNumber: "RCP-2024-0510",
    customerName: "سارة عبدالله الحربي",
    customerAccount: "C-2024-006",
    amount: 676.20,
    method: "sadad",
    reference: "SADAD-456789123",
    invoices: ["INV-2024-1205"],
    status: "confirmed",
    date: "2024-12-05",
    collector: "النظام",
  },
  {
    id: 4,
    receiptNumber: "RCP-2024-0509",
    customerName: "شركة الفجر للتجارة",
    customerAccount: "C-2024-002",
    amount: 2000.00,
    method: "cash",
    reference: "CASH-789123456",
    invoices: ["INV-2024-1102"],
    status: "confirmed",
    date: "2024-12-03",
    collector: "أحمد محمد",
  },
  {
    id: 5,
    receiptNumber: "RCP-2024-0508",
    customerName: "وزارة التعليم",
    customerAccount: "C-2024-004",
    amount: 3421.25,
    method: "check",
    reference: "CHK-321654987",
    invoices: ["INV-2024-1101"],
    status: "pending",
    date: "2024-12-01",
    collector: "خالد عبدالله",
  },
  {
    id: 6,
    receiptNumber: "RCP-2024-0507",
    customerName: "مزرعة الواحة الخضراء",
    customerAccount: "C-2024-005",
    amount: 500.00,
    method: "credit_card",
    reference: "CC-147258369",
    invoices: ["INV-2024-1104"],
    status: "rejected",
    date: "2024-11-28",
    collector: "النظام",
  },
];

// Stats Data
const statsData = [
  { title: "إجمالي التحصيل اليوم", value: "45,678", subtitle: "ر.س", icon: CreditCard, color: "text-primary" },
  { title: "عدد العمليات", value: "156", subtitle: "عملية", icon: Receipt, color: "text-success" },
  { title: "نقدي", value: "12,450", subtitle: "ر.س", icon: Banknote, color: "text-warning" },
  { title: "إلكتروني", value: "33,228", subtitle: "ر.س", icon: Smartphone, color: "text-accent" },
];

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<typeof paymentsData[0] | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter payments
  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  // Table columns
  const columns = [
    {
      key: "receiptNumber",
      title: "رقم الإيصال",
      sortable: true,
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "customerName",
      title: "العميل",
      sortable: true,
      render: (value: string, row: typeof paymentsData[0]) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.customerAccount}</p>
        </div>
      ),
    },
    {
      key: "amount",
      title: "المبلغ",
      sortable: true,
      render: (value: number) => (
        <span className="font-mono ltr-nums font-bold text-success">{value.toLocaleString()} ر.س</span>
      ),
    },
    {
      key: "method",
      title: "طريقة الدفع",
      render: (value: string) => <PaymentMethodBadge method={value} />,
    },
    {
      key: "reference",
      title: "المرجع",
      render: (value: string) => <span className="font-mono text-xs">{value}</span>,
    },
    {
      key: "date",
      title: "التاريخ",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "status",
      title: "الحالة",
      sortable: true,
      render: (value: string) => <PaymentStatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (_: unknown, row: typeof paymentsData[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedPayment(row);
              setIsViewDialogOpen(true);
            }}>
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("جاري طباعة الإيصال...")}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة الإيصال
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("جاري تحميل الإيصال...")}>
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المدفوعات</h1>
          <p className="text-muted-foreground">تسجيل ومتابعة مدفوعات العملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("جاري تصدير المدفوعات...")}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button className="gradient-energy" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل دفعة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
                    <span className="text-sm text-muted-foreground">{stat.subtitle}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-muted/50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الإيصال أو اسم العميل أو المرجع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطرق</SelectItem>
                <SelectItem value="cash">نقدي</SelectItem>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="sadad">سداد</SelectItem>
                <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                <SelectItem value="check">شيك</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="pending">قيد المعالجة</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="cancelled">ملغى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            سجل المدفوعات ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredPayments}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات الدفعة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C-2024-001">C-2024-001 - محمد أحمد العلي</SelectItem>
                  <SelectItem value="C-2024-002">C-2024-002 - شركة الفجر للتجارة</SelectItem>
                  <SelectItem value="C-2024-003">C-2024-003 - مصنع الحديد الوطني</SelectItem>
                  <SelectItem value="C-2024-004">C-2024-004 - وزارة التعليم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفاتورة</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفاتورة (اختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INV-2024-1202">INV-2024-1202 - 4,084.80 ر.س</SelectItem>
                  <SelectItem value="INV-2024-1203">INV-2024-1203 - 20,020.00 ر.س (متبقي)</SelectItem>
                  <SelectItem value="INV-2024-1101">INV-2024-1101 - 3,421.25 ر.س</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع *</Label>
                <Select defaultValue="cash">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="sadad">سداد</SelectItem>
                    <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="check">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم المرجع</Label>
                <Input
                  placeholder="رقم الحوالة أو الشيك"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الدفع</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input placeholder="أي ملاحظات إضافية" />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="gradient-energy"
              onClick={() => {
                toast.success("تم تسجيل الدفعة بنجاح");
                setIsAddDialogOpen(false);
              }}
            >
              تسجيل الدفعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفاصيل الدفعة</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xl font-bold font-mono">{selectedPayment.receiptNumber}</p>
                  <p className="text-muted-foreground">
                    {new Date(selectedPayment.date).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <PaymentStatusBadge status={selectedPayment.status} />
              </div>

              <div className="p-4 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">المبلغ</p>
                <p className="text-3xl font-bold font-mono ltr-nums text-success">
                  {selectedPayment.amount.toLocaleString()} ر.س
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-medium">{selectedPayment.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedPayment.customerAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                  <PaymentMethodBadge method={selectedPayment.method} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رقم المرجع</p>
                  <p className="font-mono text-sm">{selectedPayment.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المحصل</p>
                  <p className="font-medium">{selectedPayment.collector}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">الفواتير المرتبطة</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPayment.invoices.map((inv) => (
                    <Badge key={inv} variant="outline" className="font-mono">
                      {inv}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => toast.info("جاري طباعة الإيصال...")}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button variant="outline" onClick={() => toast.info("جاري تحميل الإيصال...")}>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
