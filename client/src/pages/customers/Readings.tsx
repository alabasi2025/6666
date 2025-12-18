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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Activity, Plus, Search, Calendar, Gauge, Upload,
  Download, CheckCircle, AlertTriangle, Clock,
  TrendingUp, TrendingDown, BarChart3, FileText,
  Camera, MapPin, User
} from "lucide-react";
import DataTable from "@/components/DataTable";

// Reading Status Badge
function ReadingStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "مؤكدة", variant: "default" },
    pending: { label: "قيد المراجعة", variant: "outline" },
    estimated: { label: "تقديرية", variant: "secondary" },
    rejected: { label: "مرفوضة", variant: "destructive" },
    anomaly: { label: "غير طبيعية", variant: "destructive" },
  };

  const config = statusConfig[status] || { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Reading Method Badge
function ReadingMethodBadge({ method }: { method: string }) {
  const methodConfig: Record<string, { label: string; color: string }> = {
    manual: { label: "يدوي", color: "bg-blue-500/10 text-blue-500" },
    automatic: { label: "آلي", color: "bg-green-500/10 text-green-500" },
    estimated: { label: "تقديري", color: "bg-orange-500/10 text-orange-500" },
    smart: { label: "ذكي", color: "bg-purple-500/10 text-purple-500" },
  };

  const config = methodConfig[method] || { label: method, color: "bg-gray-500/10 text-gray-500" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Sample Data
const readingsData = [
  {
    id: 1,
    meterNumber: "MTR-001-2024",
    customerName: "محمد أحمد العلي",
    previousReading: 44260,
    currentReading: 45680,
    consumption: 1420,
    readingDate: "2024-12-01",
    method: "manual",
    status: "confirmed",
    reader: "أحمد محمد",
    notes: "",
  },
  {
    id: 2,
    meterNumber: "MTR-002-2024",
    customerName: "محمد أحمد العلي",
    previousReading: 11820,
    currentReading: 12340,
    consumption: 520,
    readingDate: "2024-12-01",
    method: "manual",
    status: "confirmed",
    reader: "أحمد محمد",
    notes: "",
  },
  {
    id: 3,
    meterNumber: "MTR-003-2024",
    customerName: "شركة الفجر للتجارة",
    previousReading: 152340,
    currentReading: 156780,
    consumption: 4440,
    readingDate: "2024-12-01",
    method: "automatic",
    status: "confirmed",
    reader: "النظام",
    notes: "",
  },
  {
    id: 4,
    meterNumber: "MTR-004-2024",
    customerName: "مصنع الحديد الوطني",
    previousReading: 2398000,
    currentReading: 2456000,
    consumption: 58000,
    readingDate: "2024-12-01",
    method: "smart",
    status: "confirmed",
    reader: "النظام",
    notes: "",
  },
  {
    id: 5,
    meterNumber: "MTR-005-2024",
    customerName: "مزرعة الواحة الخضراء",
    previousReading: 8920,
    currentReading: 0,
    consumption: 0,
    readingDate: "2024-12-01",
    method: "estimated",
    status: "estimated",
    reader: "النظام",
    notes: "العداد معطل - قراءة تقديرية",
  },
  {
    id: 6,
    meterNumber: "MTR-006-2024",
    customerName: "وزارة التعليم",
    previousReading: 85200,
    currentReading: 89450,
    consumption: 4250,
    readingDate: "2024-11-28",
    method: "manual",
    status: "pending",
    reader: "خالد عبدالله",
    notes: "بحاجة للمراجعة",
  },
  {
    id: 7,
    meterNumber: "MTR-007-2024",
    customerName: "سارة عبدالله الحربي",
    previousReading: 12500,
    currentReading: 25800,
    consumption: 13300,
    readingDate: "2024-12-01",
    method: "manual",
    status: "anomaly",
    reader: "أحمد محمد",
    notes: "استهلاك غير طبيعي - يحتاج تحقق",
  },
];

// Reading Rounds Data
const readingRoundsData = [
  {
    id: 1,
    roundNumber: "RND-2024-12-001",
    area: "حي النزهة - الرياض",
    totalMeters: 245,
    completedReadings: 245,
    status: "completed",
    reader: "أحمد محمد",
    startDate: "2024-12-01",
    endDate: "2024-12-01",
  },
  {
    id: 2,
    roundNumber: "RND-2024-12-002",
    area: "حي العليا - الرياض",
    totalMeters: 180,
    completedReadings: 175,
    status: "in_progress",
    reader: "خالد عبدالله",
    startDate: "2024-12-01",
    endDate: null,
  },
  {
    id: 3,
    roundNumber: "RND-2024-12-003",
    area: "المنطقة الصناعية - الدمام",
    totalMeters: 120,
    completedReadings: 0,
    status: "scheduled",
    reader: "محمد سعيد",
    startDate: "2024-12-05",
    endDate: null,
  },
];

// Stats Data
const statsData = [
  { title: "قراءات اليوم", value: "1,245", icon: Activity, color: "text-primary" },
  { title: "القراءات المؤكدة", value: "1,180", icon: CheckCircle, color: "text-success" },
  { title: "قيد المراجعة", value: "45", icon: Clock, color: "text-warning" },
  { title: "قراءات غير طبيعية", value: "20", icon: AlertTriangle, color: "text-destructive" },
];

export default function Readings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("readings");

  // Filter readings
  const filteredReadings = readingsData.filter((reading) => {
    const matchesSearch =
      reading.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || reading.status === statusFilter;
    const matchesMethod = methodFilter === "all" || reading.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Readings Table Columns
  const readingsColumns = [
    {
      key: "meterNumber",
      title: "رقم العداد",
      sortable: true,
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "customerName",
      title: "العميل",
      sortable: true,
    },
    {
      key: "previousReading",
      title: "القراءة السابقة",
      sortable: true,
      render: (value: number) => <span className="font-mono ltr-nums">{value.toLocaleString()}</span>,
    },
    {
      key: "currentReading",
      title: "القراءة الحالية",
      sortable: true,
      render: (value: number) => <span className="font-mono ltr-nums font-bold">{value.toLocaleString()}</span>,
    },
    {
      key: "consumption",
      title: "الاستهلاك",
      sortable: true,
      render: (value: number, row: typeof readingsData[0]) => (
        <div className="flex items-center gap-2">
          <span className={`font-mono ltr-nums ${row.status === "anomaly" ? "text-destructive" : ""}`}>
            {value.toLocaleString()}
          </span>
          {row.status === "anomaly" && <AlertTriangle className="w-4 h-4 text-destructive" />}
        </div>
      ),
    },
    {
      key: "readingDate",
      title: "التاريخ",
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
    {
      key: "method",
      title: "الطريقة",
      render: (value: string) => <ReadingMethodBadge method={value} />,
    },
    {
      key: "status",
      title: "الحالة",
      sortable: true,
      render: (value: string) => <ReadingStatusBadge status={value} />,
    },
    {
      key: "reader",
      title: "القارئ",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      ),
    },
  ];

  // Reading Rounds Table Columns
  const roundsColumns = [
    {
      key: "roundNumber",
      title: "رقم الجولة",
      render: (value: string) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "area",
      title: "المنطقة",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "reader",
      title: "القارئ",
    },
    {
      key: "progress",
      title: "التقدم",
      render: (_: unknown, row: typeof readingRoundsData[0]) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(row.completedReadings / row.totalMeters) * 100}%` }}
            />
          </div>
          <span className="text-sm font-mono ltr-nums">
            {row.completedReadings}/{row.totalMeters}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value: string) => {
        const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
          completed: { label: "مكتملة", variant: "default" },
          in_progress: { label: "جارية", variant: "secondary" },
          scheduled: { label: "مجدولة", variant: "outline" },
        };
        const { label, variant } = config[value] || { label: value, variant: "outline" };
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: "startDate",
      title: "تاريخ البدء",
      render: (value: string) => new Date(value).toLocaleDateString("ar-SA"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">تسجيل القراءات</h1>
          <p className="text-muted-foreground">تسجيل ومتابعة قراءات العدادات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.info("جاري تصدير القراءات...")}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={() => toast.info("جاري استيراد القراءات...")}>
            <Upload className="w-4 h-4 ml-2" />
            استيراد
          </Button>
          <Button className="gradient-energy" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            تسجيل قراءة
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="readings">القراءات</TabsTrigger>
          <TabsTrigger value="rounds">جولات القراءة</TabsTrigger>
        </TabsList>

        {/* Readings Tab */}
        <TabsContent value="readings" className="mt-6 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث برقم العداد أو اسم العميل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="طريقة القراءة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الطرق</SelectItem>
                    <SelectItem value="manual">يدوي</SelectItem>
                    <SelectItem value="automatic">آلي</SelectItem>
                    <SelectItem value="smart">ذكي</SelectItem>
                    <SelectItem value="estimated">تقديري</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="confirmed">مؤكدة</SelectItem>
                    <SelectItem value="pending">قيد المراجعة</SelectItem>
                    <SelectItem value="estimated">تقديرية</SelectItem>
                    <SelectItem value="anomaly">غير طبيعية</SelectItem>
                    <SelectItem value="rejected">مرفوضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Readings Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                سجل القراءات ({filteredReadings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={readingsColumns}
                data={filteredReadings}
                searchable={false}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Rounds Tab */}
        <TabsContent value="rounds" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>جولات القراءة</CardTitle>
                <CardDescription>إدارة ومتابعة جولات قراءة العدادات</CardDescription>
              </div>
              <Button className="gradient-energy" onClick={() => toast.info("جاري إنشاء جولة جديدة...")}>
                <Plus className="w-4 h-4 ml-2" />
                جولة جديدة
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={roundsColumns}
                data={readingRoundsData}
                searchable={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Reading Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تسجيل قراءة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات قراءة العداد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>العداد *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العداد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MTR-001-2024">MTR-001-2024 - محمد أحمد العلي</SelectItem>
                  <SelectItem value="MTR-002-2024">MTR-002-2024 - محمد أحمد العلي</SelectItem>
                  <SelectItem value="MTR-003-2024">MTR-003-2024 - شركة الفجر للتجارة</SelectItem>
                  <SelectItem value="MTR-004-2024">MTR-004-2024 - مصنع الحديد الوطني</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>القراءة السابقة</Label>
                <Input
                  type="number"
                  value="45680"
                  disabled
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>القراءة الحالية *</Label>
                <Input
                  type="number"
                  placeholder="أدخل القراءة"
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ القراءة *</Label>
                <Input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>طريقة القراءة</Label>
                <Select defaultValue="manual">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">يدوي</SelectItem>
                    <SelectItem value="automatic">آلي</SelectItem>
                    <SelectItem value="smart">ذكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>صورة العداد</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">اضغط لرفع صورة أو اسحب الملف هنا</p>
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
                toast.success("تم تسجيل القراءة بنجاح");
                setIsAddDialogOpen(false);
              }}
            >
              تسجيل القراءة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
