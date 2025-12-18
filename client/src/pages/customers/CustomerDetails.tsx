import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  UserCircle, ArrowRight, Edit, Phone, Mail, MapPin,
  Gauge, Receipt, CreditCard, Calendar, Building2,
  FileText, AlertTriangle, CheckCircle, Clock,
  TrendingUp, TrendingDown, History, Plus, Eye
} from "lucide-react";
import DataTable from "@/components/DataTable";
import { useLocation } from "wouter";

// Sample Customer Data
const customerData = {
  id: 1,
  accountNumber: "C-2024-001",
  name: "محمد أحمد العلي",
  type: "residential",
  phone: "0501234567",
  email: "mohammed@email.com",
  address: "حي النزهة، شارع الملك فهد، الرياض",
  city: "الرياض",
  district: "النزهة",
  postalCode: "12345",
  nationalId: "1234567890",
  status: "active",
  createdAt: "2024-01-15",
  tariffCategory: "التعرفة العادية",
  billingCycle: "شهرية",
  paymentMethod: "تحويل بنكي",
  creditLimit: 5000,
  balance: 1250.50,
  totalConsumption: 45680,
  avgMonthlyConsumption: 1520,
};

// Sample Meters Data
const metersData = [
  {
    id: 1,
    meterNumber: "MTR-001-2024",
    type: "electricity",
    location: "المبنى الرئيسي",
    status: "active",
    lastReading: 45680,
    lastReadingDate: "2024-12-01",
    installDate: "2024-01-15",
  },
  {
    id: 2,
    meterNumber: "MTR-002-2024",
    type: "electricity",
    location: "الملحق",
    status: "active",
    lastReading: 12340,
    lastReadingDate: "2024-12-01",
    installDate: "2024-03-20",
  },
];

// Sample Invoices Data
const invoicesData = [
  {
    id: 1,
    invoiceNumber: "INV-2024-1201",
    period: "نوفمبر 2024",
    amount: 850.00,
    consumption: 1420,
    status: "paid",
    dueDate: "2024-12-15",
    paidDate: "2024-12-10",
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-1101",
    period: "أكتوبر 2024",
    amount: 920.50,
    consumption: 1580,
    status: "paid",
    dueDate: "2024-11-15",
    paidDate: "2024-11-12",
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-1001",
    period: "سبتمبر 2024",
    amount: 780.00,
    consumption: 1320,
    status: "paid",
    dueDate: "2024-10-15",
    paidDate: "2024-10-08",
  },
];

// Sample Payments Data
const paymentsData = [
  {
    id: 1,
    receiptNumber: "RCP-2024-0512",
    date: "2024-12-10",
    amount: 850.00,
    method: "تحويل بنكي",
    reference: "TRF-123456",
    invoices: ["INV-2024-1201"],
  },
  {
    id: 2,
    receiptNumber: "RCP-2024-0498",
    date: "2024-11-12",
    amount: 920.50,
    method: "سداد",
    reference: "SADAD-789012",
    invoices: ["INV-2024-1101"],
  },
  {
    id: 3,
    receiptNumber: "RCP-2024-0456",
    date: "2024-10-08",
    amount: 780.00,
    method: "نقدي",
    reference: "CASH-345678",
    invoices: ["INV-2024-1001"],
  },
];

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "نشط", variant: "default" },
    inactive: { label: "غير نشط", variant: "secondary" },
    suspended: { label: "موقوف", variant: "destructive" },
    paid: { label: "مدفوعة", variant: "default" },
    unpaid: { label: "غير مدفوعة", variant: "destructive" },
    partial: { label: "مدفوعة جزئياً", variant: "outline" },
    overdue: { label: "متأخرة", variant: "destructive" },
  };

  const { label, variant } = config[status] || { label: status, variant: "outline" };
  return <Badge variant={variant}>{label}</Badge>;
}

export default function CustomerDetails() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("info");

  // Meters Table Columns
  const metersColumns = [
    {
      key: "meterNumber",
      title: "رقم العداد",
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "location",
      title: "الموقع",
    },
    {
      key: "lastReading",
      title: "آخر قراءة",
      render: (value: number) => <span className="font-mono ltr-nums">{value.toLocaleString()}</span>,
    },
    {
      key: "lastReadingDate",
      title: "تاريخ القراءة",
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value: string) => <StatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "",
      render: (_: unknown, row: typeof metersData[0]) => (
        <Button variant="ghost" size="sm" onClick={() => setLocation(`/dashboard/customers/meters/view/${row.id}`)}>
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  // Invoices Table Columns
  const invoicesColumns = [
    {
      key: "invoiceNumber",
      title: "رقم الفاتورة",
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "period",
      title: "الفترة",
    },
    {
      key: "consumption",
      title: "الاستهلاك",
      render: (value: number) => <span className="font-mono ltr-nums">{value.toLocaleString()} ك.و.س</span>,
    },
    {
      key: "amount",
      title: "المبلغ",
      render: (value: number) => <span className="font-mono ltr-nums">{value.toLocaleString()} ر.س</span>,
    },
    {
      key: "dueDate",
      title: "تاريخ الاستحقاق",
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value: string) => <StatusBadge status={value} />,
    },
  ];

  // Payments Table Columns
  const paymentsColumns = [
    {
      key: "receiptNumber",
      title: "رقم الإيصال",
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "date",
      title: "التاريخ",
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "amount",
      title: "المبلغ",
      render: (value: number) => <span className="font-mono ltr-nums text-success">{value.toLocaleString()} ر.س</span>,
    },
    {
      key: "method",
      title: "طريقة الدفع",
    },
    {
      key: "reference",
      title: "المرجع",
      render: (value: string) => <span className="font-mono text-xs">{value}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/customers/list")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{customerData.name}</h1>
            <StatusBadge status={customerData.status} />
          </div>
          <p className="text-muted-foreground">رقم الحساب: {customerData.accountNumber}</p>
        </div>
        <Button variant="outline" onClick={() => toast.info("جاري فتح نموذج التعديل...")}>
          <Edit className="w-4 h-4 ml-2" />
          تعديل
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className={`text-2xl font-bold ltr-nums ${customerData.balance > 0 ? "text-success" : customerData.balance < 0 ? "text-destructive" : ""}`}>
                  {customerData.balance.toLocaleString()} ر.س
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الاستهلاك</p>
                <p className="text-2xl font-bold ltr-nums">{customerData.totalConsumption.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">ك.و.س</p>
              </div>
              <div className="p-3 rounded-xl bg-warning/10 text-warning">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">متوسط الاستهلاك الشهري</p>
                <p className="text-2xl font-bold ltr-nums">{customerData.avgMonthlyConsumption.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">ك.و.س</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10 text-accent">
                <Gauge className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد العدادات</p>
                <p className="text-2xl font-bold">{metersData.length}</p>
                <p className="text-xs text-muted-foreground">عداد</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 text-success">
                <Gauge className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info">المعلومات</TabsTrigger>
          <TabsTrigger value="meters">العدادات</TabsTrigger>
          <TabsTrigger value="invoices">الفواتير</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الاسم</p>
                    <p className="font-medium">{customerData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهوية</p>
                    <p className="font-medium font-mono">{customerData.nationalId}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">نوع العميل</p>
                    <p className="font-medium">سكني</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                    <p className="font-medium">{new Date(customerData.createdAt).toLocaleDateString("ar-SA")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  معلومات الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono ltr-nums">{customerData.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customerData.email}</span>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p>{customerData.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {customerData.city} - {customerData.district} - {customerData.postalCode}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  معلومات الفوترة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">فئة التعرفة</p>
                    <p className="font-medium">{customerData.tariffCategory}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">دورة الفوترة</p>
                    <p className="font-medium">{customerData.billingCycle}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الدفع</p>
                    <p className="font-medium">{customerData.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حد الائتمان</p>
                    <p className="font-medium font-mono ltr-nums">{customerData.creditLimit.toLocaleString()} ر.س</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  ملخص الاستهلاك
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">إجمالي الاستهلاك</span>
                    <span className="font-bold font-mono ltr-nums">{customerData.totalConsumption.toLocaleString()} ك.و.س</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">متوسط شهري</span>
                    <span className="font-bold font-mono ltr-nums">{customerData.avgMonthlyConsumption.toLocaleString()} ك.و.س</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">الرصيد الحالي</span>
                    <span className={`font-bold font-mono ltr-nums ${customerData.balance > 0 ? "text-success" : "text-destructive"}`}>
                      {customerData.balance.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Meters Tab */}
        <TabsContent value="meters" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>العدادات</CardTitle>
                <CardDescription>قائمة العدادات المسجلة للعميل</CardDescription>
              </div>
              <Button className="gradient-energy" onClick={() => toast.info("جاري فتح نموذج إضافة عداد...")}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة عداد
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={metersColumns}
                data={metersData}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>الفواتير</CardTitle>
                <CardDescription>سجل فواتير العميل</CardDescription>
              </div>
              <Button className="gradient-energy" onClick={() => toast.info("جاري إصدار فاتورة جديدة...")}>
                <Plus className="w-4 h-4 ml-2" />
                إصدار فاتورة
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={invoicesColumns}
                data={invoicesData}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>المدفوعات</CardTitle>
                <CardDescription>سجل مدفوعات العميل</CardDescription>
              </div>
              <Button className="gradient-energy" onClick={() => toast.info("جاري تسجيل دفعة جديدة...")}>
                <Plus className="w-4 h-4 ml-2" />
                تسجيل دفعة
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={paymentsColumns}
                data={paymentsData}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                سجل النشاطات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "2024-12-10", action: "تم استلام دفعة بمبلغ 850 ر.س", type: "payment" },
                  { date: "2024-12-01", action: "تم تسجيل قراءة العداد MTR-001-2024", type: "reading" },
                  { date: "2024-12-01", action: "تم إصدار فاتورة INV-2024-1201", type: "invoice" },
                  { date: "2024-11-12", action: "تم استلام دفعة بمبلغ 920.50 ر.س", type: "payment" },
                  { date: "2024-11-01", action: "تم تسجيل قراءة العداد MTR-001-2024", type: "reading" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                    <div className={`p-2 rounded-full ${
                      item.type === "payment" ? "bg-success/10 text-success" :
                      item.type === "invoice" ? "bg-warning/10 text-warning" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {item.type === "payment" ? <CreditCard className="w-4 h-4" /> :
                       item.type === "invoice" ? <Receipt className="w-4 h-4" /> :
                       <Gauge className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
