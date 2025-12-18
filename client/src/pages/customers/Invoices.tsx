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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Receipt, Plus, Search, MoreVertical, Eye, Printer,
  Download, Send, CreditCard, Calendar, DollarSign,
  AlertTriangle, CheckCircle, Clock, FileText,
  TrendingUp, BarChart3, Mail
} from "lucide-react";
import DataTable from "@/components/DataTable";
import { useLocation } from "wouter";

// Invoice Status Badge
function InvoiceStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    paid: { label: "مدفوعة", variant: "default" },
    unpaid: { label: "غير مدفوعة", variant: "destructive" },
    partial: { label: "مدفوعة جزئياً", variant: "outline" },
    overdue: { label: "متأخرة", variant: "destructive" },
    cancelled: { label: "ملغاة", variant: "secondary" },
    draft: { label: "مسودة", variant: "secondary" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Sample Data
const invoicesData = [
  {
    id: 1,
    invoiceNumber: "INV-2024-1201",
    customerName: "محمد أحمد العلي",
    customerAccount: "C-2024-001",
    period: "نوفمبر 2024",
    consumption: 1420,
    amount: 850.00,
    tax: 127.50,
    total: 977.50,
    status: "paid",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    paidDate: "2024-12-10",
    paidAmount: 977.50,
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-1202",
    customerName: "شركة الفجر للتجارة",
    customerAccount: "C-2024-002",
    period: "نوفمبر 2024",
    consumption: 4440,
    amount: 3552.00,
    tax: 532.80,
    total: 4084.80,
    status: "unpaid",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    paidDate: null,
    paidAmount: 0,
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-1203",
    customerName: "مصنع الحديد الوطني",
    customerAccount: "C-2024-003",
    period: "نوفمبر 2024",
    consumption: 58000,
    amount: 34800.00,
    tax: 5220.00,
    total: 40020.00,
    status: "partial",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    paidDate: null,
    paidAmount: 20000.00,
  },
  {
    id: 4,
    invoiceNumber: "INV-2024-1101",
    customerName: "وزارة التعليم",
    customerAccount: "C-2024-004",
    period: "أكتوبر 2024",
    consumption: 4250,
    amount: 2975.00,
    tax: 446.25,
    total: 3421.25,
    status: "overdue",
    issueDate: "2024-11-01",
    dueDate: "2024-11-15",
    paidDate: null,
    paidAmount: 0,
  },
  {
    id: 5,
    invoiceNumber: "INV-2024-1204",
    customerName: "مزرعة الواحة الخضراء",
    customerAccount: "C-2024-005",
    period: "نوفمبر 2024",
    consumption: 1200,
    amount: 480.00,
    tax: 72.00,
    total: 552.00,
    status: "draft",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    paidDate: null,
    paidAmount: 0,
  },
  {
    id: 6,
    invoiceNumber: "INV-2024-1205",
    customerName: "سارة عبدالله الحربي",
    customerAccount: "C-2024-006",
    period: "نوفمبر 2024",
    consumption: 980,
    amount: 588.00,
    tax: 88.20,
    total: 676.20,
    status: "paid",
    issueDate: "2024-12-01",
    dueDate: "2024-12-15",
    paidDate: "2024-12-05",
    paidAmount: 676.20,
  },
];

// Stats Data
const statsData = [
  { title: "إجمالي الفواتير", value: "45,678", subtitle: "ر.س", icon: Receipt, color: "text-primary" },
  { title: "المحصل", value: "38,450", subtitle: "ر.س", icon: CheckCircle, color: "text-success" },
  { title: "غير المحصل", value: "7,228", subtitle: "ر.س", icon: Clock, color: "text-warning" },
  { title: "المتأخرة", value: "3,421", subtitle: "ر.س", icon: AlertTriangle, color: "text-destructive" },
];

export default function Invoices() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoicesData[0] | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Filter invoices
  const filteredInvoices = invoicesData.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerAccount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Table columns
  const columns = [
    {
      key: "invoiceNumber",
      title: "رقم الفاتورة",
      sortable: true,
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "customerName",
      title: "العميل",
      sortable: true,
      render: (value: string, row: typeof invoicesData[0]) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.customerAccount}</p>
        </div>
      ),
    },
    {
      key: "period",
      title: "الفترة",
      sortable: true,
    },
    {
      key: "consumption",
      title: "الاستهلاك",
      sortable: true,
      render: (value: number) => <span className="font-mono ltr-nums">{value.toLocaleString()} ك.و.س</span>,
    },
    {
      key: "total",
      title: "المبلغ الإجمالي",
      sortable: true,
      render: (value: number) => <span className="font-mono ltr-nums font-bold">{value.toLocaleString()} ر.س</span>,
    },
    {
      key: "dueDate",
      title: "تاريخ الاستحقاق",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "status",
      title: "الحالة",
      sortable: true,
      render: (value: string) => <InvoiceStatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (_: unknown, row: typeof invoicesData[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setSelectedInvoice(row);
              setIsViewDialogOpen(true);
            }}>
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("جاري طباعة الفاتورة...")}>
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("جاري تحميل الفاتورة...")}>
              <Download className="w-4 h-4 ml-2" />
              تحميل PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("تم إرسال الفاتورة للعميل")}>
              <Mail className="w-4 h-4 ml-2" />
              إرسال للعميل
            </DropdownMenuItem>
            {row.status !== "paid" && (
              <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/payments?invoice=${row.id}`)}>
                <CreditCard className="w-4 h-4 ml-2" />
                تسجيل دفعة
              </DropdownMenuItem>
            )}
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
          <h1 className="text-2xl font-bold text-foreground">الفواتير</h1>
          <p className="text-muted-foreground">إدارة ومتابعة فواتير العملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("جاري تصدير الفواتير...")}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button className="gradient-energy" onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إصدار فواتير
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
                placeholder="بحث برقم الفاتورة أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                <SelectItem value="partial">مدفوعة جزئياً</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            قائمة الفواتير ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredInvoices}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Generate Invoices Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إصدار فواتير جديدة</DialogTitle>
            <DialogDescription>
              اختر الفترة والعملاء لإصدار الفواتير
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>فترة الفوترة *</Label>
              <Select defaultValue="2024-12">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-12">ديسمبر 2024</SelectItem>
                  <SelectItem value="2024-11">نوفمبر 2024</SelectItem>
                  <SelectItem value="2024-10">أكتوبر 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>نطاق العملاء *</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="residential">العملاء السكنيين</SelectItem>
                  <SelectItem value="commercial">العملاء التجاريين</SelectItem>
                  <SelectItem value="industrial">العملاء الصناعيين</SelectItem>
                  <SelectItem value="government">الجهات الحكومية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الاستحقاق</Label>
              <Input
                type="date"
                defaultValue="2024-12-15"
              />
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-2">ملخص الإصدار</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد العملاء</span>
                  <span className="font-mono">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي الاستهلاك</span>
                  <span className="font-mono">2,456,780 ك.و.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي المبالغ</span>
                  <span className="font-mono font-bold">1,845,600 ر.س</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="gradient-energy"
              onClick={() => {
                toast.success("تم إصدار الفواتير بنجاح");
                setIsGenerateDialogOpen(false);
              }}
            >
              إصدار الفواتير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-2xl font-bold font-mono">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-muted-foreground">{selectedInvoice.period}</p>
                </div>
                <InvoiceStatusBadge status={selectedInvoice.status} />
              </div>

              <Separator />

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-medium">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvoice.customerAccount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإصدار</p>
                  <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString("ar-SA")}</p>
                  <p className="text-sm text-muted-foreground">
                    الاستحقاق: {new Date(selectedInvoice.dueDate).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Invoice Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الاستهلاك</span>
                  <span className="font-mono ltr-nums">{selectedInvoice.consumption.toLocaleString()} ك.و.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قيمة الاستهلاك</span>
                  <span className="font-mono ltr-nums">{selectedInvoice.amount.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ضريبة القيمة المضافة (15%)</span>
                  <span className="font-mono ltr-nums">{selectedInvoice.tax.toLocaleString()} ر.س</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="font-mono ltr-nums">{selectedInvoice.total.toLocaleString()} ر.س</span>
                </div>
                {selectedInvoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-success">
                      <span>المدفوع</span>
                      <span className="font-mono ltr-nums">{selectedInvoice.paidAmount.toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between text-destructive font-bold">
                      <span>المتبقي</span>
                      <span className="font-mono ltr-nums">
                        {(selectedInvoice.total - selectedInvoice.paidAmount).toLocaleString()} ر.س
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => toast.info("جاري طباعة الفاتورة...")}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button variant="outline" onClick={() => toast.info("جاري تحميل الفاتورة...")}>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل PDF
                </Button>
                {selectedInvoice.status !== "paid" && (
                  <Button className="gradient-energy" onClick={() => {
                    setIsViewDialogOpen(false);
                    setLocation(`/dashboard/customers/payments?invoice=${selectedInvoice.id}`);
                  }}>
                    <CreditCard className="w-4 h-4 ml-2" />
                    تسجيل دفعة
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
