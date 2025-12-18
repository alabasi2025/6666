import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserCircle, Plus, Search, Filter, MoreVertical,
  Eye, Edit, Trash2, Phone, Mail, MapPin, Gauge,
  Receipt, CreditCard, AlertTriangle, CheckCircle,
  Clock, Building2, FileText, Download, Upload
} from "lucide-react";
import DataTable from "@/components/DataTable";
import { useLocation } from "wouter";

// Customer Status Badge
function CustomerStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "نشط", variant: "default" },
    inactive: { label: "غير نشط", variant: "secondary" },
    suspended: { label: "موقوف", variant: "destructive" },
    pending: { label: "قيد المراجعة", variant: "outline" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Customer Type Badge
function CustomerTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; color: string }> = {
    residential: { label: "سكني", color: "bg-blue-500/10 text-blue-500" },
    commercial: { label: "تجاري", color: "bg-green-500/10 text-green-500" },
    industrial: { label: "صناعي", color: "bg-orange-500/10 text-orange-500" },
    government: { label: "حكومي", color: "bg-purple-500/10 text-purple-500" },
    agricultural: { label: "زراعي", color: "bg-emerald-500/10 text-emerald-500" },
  };

  const config = typeConfig[type] || { label: type, color: "bg-gray-500/10 text-gray-500" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Sample Data
const customersData = [
  {
    id: 1,
    accountNumber: "C-2024-001",
    name: "محمد أحمد العلي",
    type: "residential",
    phone: "0501234567",
    email: "mohammed@email.com",
    address: "حي النزهة، شارع الملك فهد، الرياض",
    nationalId: "1234567890",
    metersCount: 2,
    balance: 1250.50,
    status: "active",
    createdAt: "2024-01-15",
    lastPayment: "2024-12-01",
  },
  {
    id: 2,
    accountNumber: "C-2024-002",
    name: "شركة الفجر للتجارة",
    type: "commercial",
    phone: "0112345678",
    email: "info@alfajr.com",
    address: "حي العليا، برج المملكة، الرياض",
    commercialReg: "1010123456",
    metersCount: 5,
    balance: -5420.00,
    status: "active",
    createdAt: "2024-02-20",
    lastPayment: "2024-11-15",
  },
  {
    id: 3,
    accountNumber: "C-2024-003",
    name: "مصنع الحديد الوطني",
    type: "industrial",
    phone: "0138765432",
    email: "contact@nationalsteel.com",
    address: "المنطقة الصناعية الثانية، الدمام",
    commercialReg: "2050987654",
    metersCount: 8,
    balance: 25000.00,
    status: "active",
    createdAt: "2023-06-10",
    lastPayment: "2024-12-05",
  },
  {
    id: 4,
    accountNumber: "C-2024-004",
    name: "وزارة التعليم - فرع الرياض",
    type: "government",
    phone: "0114567890",
    email: "riyadh@moe.gov.sa",
    address: "حي الوزارات، الرياض",
    governmentId: "GOV-EDU-001",
    metersCount: 15,
    balance: 0,
    status: "active",
    createdAt: "2023-01-01",
    lastPayment: "2024-12-10",
  },
  {
    id: 5,
    accountNumber: "C-2024-005",
    name: "مزرعة الواحة الخضراء",
    type: "agricultural",
    phone: "0509876543",
    email: "farm@alwaha.com",
    address: "طريق المزارع، القصيم",
    nationalId: "0987654321",
    metersCount: 3,
    balance: 850.75,
    status: "suspended",
    createdAt: "2024-03-05",
    lastPayment: "2024-09-20",
  },
  {
    id: 6,
    accountNumber: "C-2024-006",
    name: "سارة عبدالله الحربي",
    type: "residential",
    phone: "0551234567",
    email: "sara@email.com",
    address: "حي الربوة، جدة",
    nationalId: "1122334455",
    metersCount: 1,
    balance: 320.00,
    status: "active",
    createdAt: "2024-05-12",
    lastPayment: "2024-11-28",
  },
];

// Stats Data
const statsData = [
  { title: "إجمالي العملاء", value: "8,492", icon: UserCircle, color: "text-primary" },
  { title: "العملاء النشطين", value: "7,856", icon: CheckCircle, color: "text-success" },
  { title: "العملاء الموقوفين", value: "124", icon: AlertTriangle, color: "text-destructive" },
  { title: "إجمالي المديونية", value: "2.4M ر.س", icon: CreditCard, color: "text-warning" },
];

export default function CustomersList() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customersData[0] | null>(null);

  // Filter customers
  const filteredCustomers = customersData.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    const matchesType = typeFilter === "all" || customer.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Table columns
  const columns = [
    {
      key: "accountNumber",
      title: "رقم الحساب",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "name",
      title: "اسم العميل",
      sortable: true,
      render: (value: string, row: typeof customersData[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{value}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      sortable: true,
      render: (value: string) => <CustomerTypeBadge type={value} />,
    },
    {
      key: "phone",
      title: "الهاتف",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono ltr-nums">{value}</span>
        </div>
      ),
    },
    {
      key: "metersCount",
      title: "العدادات",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "balance",
      title: "الرصيد",
      sortable: true,
      render: (value: number) => (
        <span className={`font-mono ltr-nums ${value < 0 ? "text-destructive" : value > 0 ? "text-success" : ""}`}>
          {value.toLocaleString("ar-SA")} ر.س
        </span>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      sortable: true,
      render: (value: string) => <CustomerStatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (_: unknown, row: typeof customersData[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/view/${row.id}`)}>
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedCustomer(row);
              setIsAddDialogOpen(true);
            }}>
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/meters?customer=${row.id}`)}>
              <Gauge className="w-4 h-4 ml-2" />
              العدادات
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/invoices?customer=${row.id}`)}>
              <Receipt className="w-4 h-4 ml-2" />
              الفواتير
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => toast.error("تم إيقاف العميل")}>
              <Trash2 className="w-4 h-4 ml-2" />
              إيقاف
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
          <h1 className="text-2xl font-bold text-foreground">إدارة العملاء</h1>
          <p className="text-muted-foreground">إدارة ملفات العملاء وحساباتهم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("جاري تصدير البيانات...")}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={() => toast.info("جاري استيراد البيانات...")}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
          <Button className="gradient-energy" onClick={() => {
            setSelectedCustomer(null);
            setIsAddDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 ml-2" />
            عميل جديد
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
                  <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
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
                placeholder="بحث بالاسم أو رقم الحساب أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="نوع العميل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="residential">سكني</SelectItem>
                <SelectItem value="commercial">تجاري</SelectItem>
                <SelectItem value="industrial">صناعي</SelectItem>
                <SelectItem value="government">حكومي</SelectItem>
                <SelectItem value="agricultural">زراعي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            قائمة العملاء ({filteredCustomers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredCustomers}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer ? "قم بتعديل بيانات العميل" : "أدخل بيانات العميل الجديد"}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
              <TabsTrigger value="contact">معلومات الاتصال</TabsTrigger>
              <TabsTrigger value="billing">الفوترة</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع العميل *</Label>
                  <Select defaultValue={selectedCustomer?.type || "residential"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">سكني</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                      <SelectItem value="industrial">صناعي</SelectItem>
                      <SelectItem value="government">حكومي</SelectItem>
                      <SelectItem value="agricultural">زراعي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>رقم الحساب</Label>
                  <Input
                    value={selectedCustomer?.accountNumber || ""}
                    placeholder="يتم توليده تلقائياً"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>اسم العميل *</Label>
                <Input
                  defaultValue={selectedCustomer?.name || ""}
                  placeholder="أدخل اسم العميل"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهوية / السجل التجاري *</Label>
                  <Input
                    defaultValue={selectedCustomer?.nationalId || selectedCustomer?.commercialReg || ""}
                    placeholder="أدخل رقم الهوية أو السجل التجاري"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select defaultValue={selectedCustomer?.status || "active"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="suspended">موقوف</SelectItem>
                      <SelectItem value="pending">قيد المراجعة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رقم الهاتف *</Label>
                  <Input
                    defaultValue={selectedCustomer?.phone || ""}
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    defaultValue={selectedCustomer?.email || ""}
                    placeholder="email@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>العنوان *</Label>
                <Input
                  defaultValue={selectedCustomer?.address || ""}
                  placeholder="أدخل العنوان الكامل"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>المدينة</Label>
                  <Select defaultValue="riyadh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="riyadh">الرياض</SelectItem>
                      <SelectItem value="jeddah">جدة</SelectItem>
                      <SelectItem value="dammam">الدمام</SelectItem>
                      <SelectItem value="makkah">مكة المكرمة</SelectItem>
                      <SelectItem value="madinah">المدينة المنورة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الحي</Label>
                  <Input placeholder="اسم الحي" />
                </div>
                <div className="space-y-2">
                  <Label>الرمز البريدي</Label>
                  <Input placeholder="12345" dir="ltr" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>فئة التعرفة</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">التعرفة العادية</SelectItem>
                      <SelectItem value="commercial">التعرفة التجارية</SelectItem>
                      <SelectItem value="industrial">التعرفة الصناعية</SelectItem>
                      <SelectItem value="government">التعرفة الحكومية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>دورة الفوترة</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">شهرية</SelectItem>
                      <SelectItem value="bimonthly">كل شهرين</SelectItem>
                      <SelectItem value="quarterly">ربع سنوية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>طريقة الدفع المفضلة</Label>
                  <Select defaultValue="bank">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank">تحويل بنكي</SelectItem>
                      <SelectItem value="card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="sadad">سداد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>حد الائتمان</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات الفوترة</Label>
                <Input placeholder="أي ملاحظات خاصة بالفوترة" />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="gradient-energy"
              onClick={() => {
                toast.success(selectedCustomer ? "تم تحديث بيانات العميل" : "تم إضافة العميل بنجاح");
                setIsAddDialogOpen(false);
              }}
            >
              {selectedCustomer ? "حفظ التغييرات" : "إضافة العميل"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
