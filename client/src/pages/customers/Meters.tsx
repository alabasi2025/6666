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
import { toast } from "sonner";
import {
  Gauge, Plus, Search, MoreVertical, Eye, Edit,
  Trash2, MapPin, Calendar, Activity, AlertTriangle,
  CheckCircle, Clock, Zap, Settings, History
} from "lucide-react";
import DataTable from "@/components/DataTable";
import { useLocation } from "wouter";

// Meter Status Badge
function MeterStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "نشط", variant: "default" },
    inactive: { label: "غير نشط", variant: "secondary" },
    faulty: { label: "معطل", variant: "destructive" },
    maintenance: { label: "تحت الصيانة", variant: "outline" },
    disconnected: { label: "مفصول", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Meter Type Badge
function MeterTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; color: string; icon: typeof Zap }> = {
    electricity: { label: "كهرباء", color: "bg-yellow-500/10 text-yellow-500", icon: Zap },
    water: { label: "مياه", color: "bg-blue-500/10 text-blue-500", icon: Activity },
    gas: { label: "غاز", color: "bg-orange-500/10 text-orange-500", icon: Activity },
  };

  const config = typeConfig[type] || { label: type, color: "bg-gray-500/10 text-gray-500", icon: Gauge };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Sample Data
const metersData = [
  {
    id: 1,
    meterNumber: "MTR-001-2024",
    serialNumber: "SN-ABC123456",
    type: "electricity",
    customerName: "محمد أحمد العلي",
    customerAccount: "C-2024-001",
    location: "حي النزهة، الرياض",
    installLocation: "المبنى الرئيسي - الدور الأرضي",
    status: "active",
    lastReading: 45680,
    lastReadingDate: "2024-12-01",
    installDate: "2024-01-15",
    meterModel: "Landis+Gyr E350",
    multiplier: 1,
    maxLoad: 100,
  },
  {
    id: 2,
    meterNumber: "MTR-002-2024",
    serialNumber: "SN-DEF789012",
    type: "electricity",
    customerName: "محمد أحمد العلي",
    customerAccount: "C-2024-001",
    location: "حي النزهة، الرياض",
    installLocation: "الملحق",
    status: "active",
    lastReading: 12340,
    lastReadingDate: "2024-12-01",
    installDate: "2024-03-20",
    meterModel: "Itron ACE6000",
    multiplier: 1,
    maxLoad: 50,
  },
  {
    id: 3,
    meterNumber: "MTR-003-2024",
    serialNumber: "SN-GHI345678",
    type: "electricity",
    customerName: "شركة الفجر للتجارة",
    customerAccount: "C-2024-002",
    location: "حي العليا، الرياض",
    installLocation: "المبنى الرئيسي",
    status: "active",
    lastReading: 156780,
    lastReadingDate: "2024-12-01",
    installDate: "2024-02-20",
    meterModel: "Schneider PM5560",
    multiplier: 10,
    maxLoad: 500,
  },
  {
    id: 4,
    meterNumber: "MTR-004-2024",
    serialNumber: "SN-JKL901234",
    type: "electricity",
    customerName: "مصنع الحديد الوطني",
    customerAccount: "C-2024-003",
    location: "المنطقة الصناعية، الدمام",
    installLocation: "خط الإنتاج الرئيسي",
    status: "active",
    lastReading: 2456000,
    lastReadingDate: "2024-12-01",
    installDate: "2023-06-10",
    meterModel: "ABB A44",
    multiplier: 100,
    maxLoad: 2000,
  },
  {
    id: 5,
    meterNumber: "MTR-005-2024",
    serialNumber: "SN-MNO567890",
    type: "electricity",
    customerName: "مزرعة الواحة الخضراء",
    customerAccount: "C-2024-005",
    location: "طريق المزارع، القصيم",
    installLocation: "مضخة الري الرئيسية",
    status: "faulty",
    lastReading: 8920,
    lastReadingDate: "2024-09-15",
    installDate: "2024-03-05",
    meterModel: "Landis+Gyr E350",
    multiplier: 1,
    maxLoad: 75,
  },
  {
    id: 6,
    meterNumber: "MTR-006-2024",
    serialNumber: "SN-PQR123789",
    type: "electricity",
    customerName: "وزارة التعليم",
    customerAccount: "C-2024-004",
    location: "حي الوزارات، الرياض",
    installLocation: "المبنى الإداري",
    status: "maintenance",
    lastReading: 89450,
    lastReadingDate: "2024-11-28",
    installDate: "2023-01-01",
    meterModel: "Itron ACE6000",
    multiplier: 10,
    maxLoad: 300,
  },
];

// Stats Data
const statsData = [
  { title: "إجمالي العدادات", value: "12,456", icon: Gauge, color: "text-primary" },
  { title: "العدادات النشطة", value: "11,892", icon: CheckCircle, color: "text-success" },
  { title: "العدادات المعطلة", value: "124", icon: AlertTriangle, color: "text-destructive" },
  { title: "تحت الصيانة", value: "440", icon: Settings, color: "text-warning" },
];

export default function Meters() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<typeof metersData[0] | null>(null);

  // Filter meters
  const filteredMeters = metersData.filter((meter) => {
    const matchesSearch =
      meter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || meter.status === statusFilter;
    const matchesType = typeFilter === "all" || meter.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Table columns
  const columns = [
    {
      key: "meterNumber",
      title: "رقم العداد",
      sortable: true,
      render: (value: string, row: typeof metersData[0]) => (
        <div>
          <span className="font-mono text-primary">{value}</span>
          <p className="text-xs text-muted-foreground">{row.serialNumber}</p>
        </div>
      ),
    },
    {
      key: "type",
      title: "النوع",
      sortable: true,
      render: (value: string) => <MeterTypeBadge type={value} />,
    },
    {
      key: "customerName",
      title: "العميل",
      sortable: true,
      render: (value: string, row: typeof metersData[0]) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.customerAccount}</p>
        </div>
      ),
    },
    {
      key: "installLocation",
      title: "موقع التركيب",
      render: (value: string, row: typeof metersData[0]) => (
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm">{value}</p>
            <p className="text-xs text-muted-foreground">{row.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: "lastReading",
      title: "آخر قراءة",
      sortable: true,
      render: (value: number, row: typeof metersData[0]) => (
        <div>
          <span className="font-mono ltr-nums">{value.toLocaleString()}</span>
          <p className="text-xs text-muted-foreground">
            {new Date(row.lastReadingDate).toLocaleDateString("ar-SA")}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      sortable: true,
      render: (value: string) => <MeterStatusBadge status={value} />,
    },
    {
      key: "actions",
      title: "الإجراءات",
      render: (_: unknown, row: typeof metersData[0]) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/meters/view/${row.id}`)}>
              <Eye className="w-4 h-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setSelectedMeter(row);
              setIsAddDialogOpen(true);
            }}>
              <Edit className="w-4 h-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(`/dashboard/customers/readings?meter=${row.id}`)}>
              <Activity className="w-4 h-4 ml-2" />
              القراءات
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("جاري فتح سجل الصيانة...")}>
              <History className="w-4 h-4 ml-2" />
              سجل الصيانة
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => toast.error("تم فصل العداد")}>
              <Trash2 className="w-4 h-4 ml-2" />
              فصل
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
          <h1 className="text-2xl font-bold text-foreground">إدارة العدادات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة عدادات العملاء</p>
        </div>
        <Button className="gradient-energy" onClick={() => {
          setSelectedMeter(null);
          setIsAddDialogOpen(true);
        }}>
          <Plus className="w-4 h-4 ml-2" />
          تركيب عداد جديد
        </Button>
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
                placeholder="بحث برقم العداد أو الرقم التسلسلي أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="نوع العداد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="electricity">كهرباء</SelectItem>
                <SelectItem value="water">مياه</SelectItem>
                <SelectItem value="gas">غاز</SelectItem>
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
                <SelectItem value="faulty">معطل</SelectItem>
                <SelectItem value="maintenance">تحت الصيانة</SelectItem>
                <SelectItem value="disconnected">مفصول</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meters Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            قائمة العدادات ({filteredMeters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredMeters}
            searchable={false}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Meter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMeter ? "تعديل بيانات العداد" : "تركيب عداد جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedMeter ? "قم بتعديل بيانات العداد" : "أدخل بيانات العداد الجديد"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم العداد *</Label>
                <Input
                  defaultValue={selectedMeter?.meterNumber || ""}
                  placeholder="MTR-XXX-XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>الرقم التسلسلي *</Label>
                <Input
                  defaultValue={selectedMeter?.serialNumber || ""}
                  placeholder="SN-XXXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع العداد *</Label>
                <Select defaultValue={selectedMeter?.type || "electricity"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electricity">كهرباء</SelectItem>
                    <SelectItem value="water">مياه</SelectItem>
                    <SelectItem value="gas">غاز</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>موديل العداد</Label>
                <Input
                  defaultValue={selectedMeter?.meterModel || ""}
                  placeholder="اسم الشركة والموديل"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select defaultValue={selectedMeter?.customerAccount || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C-2024-001">C-2024-001 - محمد أحمد العلي</SelectItem>
                  <SelectItem value="C-2024-002">C-2024-002 - شركة الفجر للتجارة</SelectItem>
                  <SelectItem value="C-2024-003">C-2024-003 - مصنع الحديد الوطني</SelectItem>
                  <SelectItem value="C-2024-004">C-2024-004 - وزارة التعليم</SelectItem>
                  <SelectItem value="C-2024-005">C-2024-005 - مزرعة الواحة الخضراء</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>موقع التركيب *</Label>
              <Input
                defaultValue={selectedMeter?.installLocation || ""}
                placeholder="وصف موقع تركيب العداد"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>معامل الضرب</Label>
                <Input
                  type="number"
                  defaultValue={selectedMeter?.multiplier || 1}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>الحمل الأقصى (كيلوواط)</Label>
                <Input
                  type="number"
                  defaultValue={selectedMeter?.maxLoad || ""}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>القراءة الافتتاحية</Label>
                <Input
                  type="number"
                  defaultValue={selectedMeter?.lastReading || 0}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ التركيب</Label>
                <Input
                  type="date"
                  defaultValue={selectedMeter?.installDate || new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select defaultValue={selectedMeter?.status || "active"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="maintenance">تحت الصيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="gradient-energy"
              onClick={() => {
                toast.success(selectedMeter ? "تم تحديث بيانات العداد" : "تم تركيب العداد بنجاح");
                setIsAddDialogOpen(false);
              }}
            >
              {selectedMeter ? "حفظ التغييرات" : "تركيب العداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
