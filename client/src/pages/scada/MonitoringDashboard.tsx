import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, Radio, Zap, Thermometer,
  Gauge, Power, RefreshCw, MapPin, Clock, TrendingUp,
  TrendingDown, CheckCircle, XCircle, Wifi, WifiOff,
  BarChart3, PieChart, Settings, Eye, Bell, Server,
  Cpu, HardDrive, MemoryStick, Signal, Battery
} from "lucide-react";
import { cn } from "@/lib/utils";

// Equipment Status Badge
function EquipmentStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    online: { label: "متصل", color: "bg-success/20 text-success", icon: CheckCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: XCircle },
    warning: { label: "تحذير", color: "bg-warning/20 text-warning", icon: AlertTriangle },
    maintenance: { label: "صيانة", color: "bg-blue-500/20 text-blue-500", icon: Settings },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: Radio };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Alert Severity Badge
function AlertSeverityBadge({ severity }: { severity: string }) {
  const severityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    critical: { label: "حرج", variant: "destructive" },
    high: { label: "عالي", variant: "destructive" },
    medium: { label: "متوسط", variant: "default" },
    low: { label: "منخفض", variant: "outline" },
    info: { label: "معلومات", variant: "secondary" },
  };

  const config = severityConfig[severity] || { label: severity, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Live Value Card Component
function LiveValueCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  status,
  min,
  max,
  current
}: { 
  title: string;
  value: string | number;
  unit: string;
  icon: typeof Thermometer;
  trend?: "up" | "down" | "stable";
  status?: "normal" | "warning" | "critical";
  min?: number;
  max?: number;
  current?: number;
}) {
  const statusColors = {
    normal: "text-success",
    warning: "text-warning",
    critical: "text-destructive",
  };

  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2 rounded-lg", status === "critical" ? "bg-destructive/20" : status === "warning" ? "bg-warning/20" : "bg-primary/20")}>
            <Icon className={cn("w-5 h-5", status ? statusColors[status] : "text-primary")} />
          </div>
          {trend && (
            <div className={cn("flex items-center gap-1 text-xs", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
              {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
              {trend === "up" ? "+2.5%" : trend === "down" ? "-1.8%" : "0%"}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-2xl font-bold ltr-nums", status ? statusColors[status] : "text-foreground")}>{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        {min !== undefined && max !== undefined && current !== undefined && (
          <div className="mt-3">
            <Progress value={(current / max) * 100} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Equipment Card Component
function EquipmentCard({ equipment }: { equipment: typeof equipmentData[0] }) {
  return (
    <Card className={cn("card-hover cursor-pointer transition-all", equipment.status === "offline" && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              equipment.status === "online" ? "bg-success/20" : 
              equipment.status === "warning" ? "bg-warning/20" : 
              equipment.status === "offline" ? "bg-destructive/20" : "bg-muted"
            )}>
              <equipment.icon className={cn(
                "w-6 h-6",
                equipment.status === "online" ? "text-success" : 
                equipment.status === "warning" ? "text-warning" : 
                equipment.status === "offline" ? "text-destructive" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <p className="font-medium">{equipment.name}</p>
              <p className="text-xs text-muted-foreground">{equipment.code}</p>
            </div>
          </div>
          <EquipmentStatusBadge status={equipment.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {equipment.readings.map((reading, idx) => (
            <div key={idx} className="bg-muted/30 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">{reading.label}</p>
              <p className={cn("font-mono font-bold ltr-nums", reading.status === "warning" ? "text-warning" : reading.status === "critical" ? "text-destructive" : "text-foreground")}>
                {reading.value} <span className="text-xs font-normal">{reading.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {equipment.location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {equipment.lastUpdate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sample Data
const overviewStats = [
  { title: "إجمالي المعدات", value: 156, icon: Radio, color: "primary" },
  { title: "متصل", value: 142, icon: Wifi, color: "success" },
  { title: "غير متصل", value: 8, icon: WifiOff, color: "destructive" },
  { title: "تحذيرات نشطة", value: 12, icon: AlertTriangle, color: "warning" },
];

const liveMetrics = [
  { title: "إجمالي الحمل", value: "45.8", unit: "MW", icon: Zap, trend: "up" as const, status: "normal" as const, min: 0, max: 100, current: 45.8 },
  { title: "متوسط درجة الحرارة", value: "42", unit: "°C", icon: Thermometer, trend: "up" as const, status: "warning" as const, min: 0, max: 80, current: 42 },
  { title: "الجهد الكهربائي", value: "13.2", unit: "kV", icon: Gauge, trend: "stable" as const, status: "normal" as const, min: 11, max: 15, current: 13.2 },
  { title: "معامل القدرة", value: "0.92", unit: "PF", icon: Activity, trend: "down" as const, status: "normal" as const, min: 0, max: 1, current: 0.92 },
  { title: "استهلاك اليوم", value: "1,245", unit: "MWh", icon: BarChart3, trend: "up" as const, status: "normal" as const },
  { title: "كفاءة النظام", value: "94.5", unit: "%", icon: PieChart, trend: "stable" as const, status: "normal" as const, min: 0, max: 100, current: 94.5 },
];

const equipmentData = [
  {
    id: 1,
    name: "المحول الرئيسي T-01",
    code: "TR-001",
    type: "transformer",
    icon: Zap,
    status: "online",
    location: "محطة الرياض الرئيسية",
    lastUpdate: "منذ دقيقة",
    readings: [
      { label: "درجة الحرارة", value: "45", unit: "°C", status: "normal" },
      { label: "الحمل", value: "78", unit: "%", status: "normal" },
      { label: "الجهد", value: "13.2", unit: "kV", status: "normal" },
      { label: "التيار", value: "245", unit: "A", status: "normal" },
    ],
  },
  {
    id: 2,
    name: "المحول T-02",
    code: "TR-002",
    type: "transformer",
    icon: Zap,
    status: "warning",
    location: "محطة الرياض الرئيسية",
    lastUpdate: "منذ 2 دقيقة",
    readings: [
      { label: "درجة الحرارة", value: "68", unit: "°C", status: "warning" },
      { label: "الحمل", value: "92", unit: "%", status: "warning" },
      { label: "الجهد", value: "13.1", unit: "kV", status: "normal" },
      { label: "التيار", value: "312", unit: "A", status: "warning" },
    ],
  },
  {
    id: 3,
    name: "المولد الاحتياطي G-01",
    code: "GEN-001",
    type: "generator",
    icon: Power,
    status: "offline",
    location: "محطة جدة الفرعية",
    lastUpdate: "منذ 15 دقيقة",
    readings: [
      { label: "درجة الحرارة", value: "--", unit: "°C", status: "normal" },
      { label: "الحمل", value: "0", unit: "%", status: "normal" },
      { label: "الوقود", value: "85", unit: "%", status: "normal" },
      { label: "ساعات التشغيل", value: "1,245", unit: "h", status: "normal" },
    ],
  },
  {
    id: 4,
    name: "لوحة التوزيع الرئيسية",
    code: "MDB-001",
    type: "panel",
    icon: Server,
    status: "online",
    location: "محطة الدمام",
    lastUpdate: "منذ 30 ثانية",
    readings: [
      { label: "الجهد L1", value: "220", unit: "V", status: "normal" },
      { label: "الجهد L2", value: "218", unit: "V", status: "normal" },
      { label: "الجهد L3", value: "221", unit: "V", status: "normal" },
      { label: "التردد", value: "60.0", unit: "Hz", status: "normal" },
    ],
  },
  {
    id: 5,
    name: "وحدة UPS المركزية",
    code: "UPS-001",
    type: "ups",
    icon: Battery,
    status: "online",
    location: "مركز البيانات",
    lastUpdate: "منذ دقيقة",
    readings: [
      { label: "مستوى البطارية", value: "98", unit: "%", status: "normal" },
      { label: "الحمل", value: "45", unit: "%", status: "normal" },
      { label: "وقت الاحتياطي", value: "45", unit: "min", status: "normal" },
      { label: "درجة الحرارة", value: "28", unit: "°C", status: "normal" },
    ],
  },
  {
    id: 6,
    name: "محطة الطاقة الشمسية",
    code: "PV-001",
    type: "solar",
    icon: Zap,
    status: "online",
    location: "المنطقة الصناعية",
    lastUpdate: "منذ دقيقة",
    readings: [
      { label: "الإنتاج", value: "2.4", unit: "MW", status: "normal" },
      { label: "الكفاءة", value: "18.5", unit: "%", status: "normal" },
      { label: "الإشعاع", value: "850", unit: "W/m²", status: "normal" },
      { label: "درجة اللوحة", value: "52", unit: "°C", status: "normal" },
    ],
  },
];

const recentAlerts = [
  {
    id: 1,
    title: "ارتفاع درجة حرارة المحول T-02",
    equipment: "TR-002",
    severity: "high",
    time: "منذ 5 دقائق",
    acknowledged: false,
  },
  {
    id: 2,
    title: "تجاوز حد الحمل في المحول T-02",
    equipment: "TR-002",
    severity: "medium",
    time: "منذ 8 دقائق",
    acknowledged: false,
  },
  {
    id: 3,
    title: "انقطاع الاتصال بالمولد G-01",
    equipment: "GEN-001",
    severity: "critical",
    time: "منذ 15 دقيقة",
    acknowledged: true,
  },
  {
    id: 4,
    title: "انخفاض معامل القدرة",
    equipment: "MDB-001",
    severity: "low",
    time: "منذ 30 دقيقة",
    acknowledged: true,
  },
  {
    id: 5,
    title: "صيانة مجدولة للمحول T-03",
    equipment: "TR-003",
    severity: "info",
    time: "منذ ساعة",
    acknowledged: true,
  },
];

const systemHealth = [
  { name: "استخدام المعالج", value: 45, icon: Cpu },
  { name: "استخدام الذاكرة", value: 62, icon: MemoryStick },
  { name: "مساحة التخزين", value: 38, icon: HardDrive },
  { name: "جودة الاتصال", value: 98, icon: Signal },
];

export default function MonitoringDashboard() {
  const [selectedStation, setSelectedStation] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto refresh simulation
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            لوحة المراقبة والتحكم
          </h1>
          <p className="text-muted-foreground">مراقبة حية لجميع المعدات والأنظمة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            آخر تحديث: {lastRefresh.toLocaleTimeString("ar-SA")}
          </div>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn("w-4 h-4 ml-2", autoRefresh && "animate-spin")} />
            {autoRefresh ? "تحديث تلقائي" : "تحديث يدوي"}
          </Button>
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر المحطة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المحطات</SelectItem>
              <SelectItem value="riyadh">محطة الرياض</SelectItem>
              <SelectItem value="jeddah">محطة جدة</SelectItem>
              <SelectItem value="dammam">محطة الدمام</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <Card key={index} className={cn("card-hover", stat.color === "destructive" && "border-destructive/50")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={cn(
                    "text-3xl font-bold ltr-nums",
                    stat.color === "success" && "text-success",
                    stat.color === "destructive" && "text-destructive",
                    stat.color === "warning" && "text-warning"
                  )}>{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive",
                  stat.color === "warning" && "bg-warning/20 text-warning"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="equipment">المعدات</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
          <TabsTrigger value="system">صحة النظام</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Live Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              القراءات الحية
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {liveMetrics.map((metric, index) => (
                <LiveValueCard key={index} {...metric} />
              ))}
            </div>
          </div>

          {/* Equipment Grid & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Equipment Overview */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                المعدات الرئيسية
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipmentData.slice(0, 4).map((equipment) => (
                  <EquipmentCard key={equipment.id} equipment={equipment} />
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-warning" />
                التنبيهات الأخيرة
              </h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {recentAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "p-4 hover:bg-muted/30 transition-colors",
                          !alert.acknowledged && "bg-muted/20"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <AlertSeverityBadge severity={alert.severity} />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-mono">{alert.equipment}</span>
                          <span>{alert.time}</span>
                        </div>
                        {!alert.acknowledged && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => toast.success("تم تأكيد استلام التنبيه")}
                          >
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تأكيد الاستلام
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">جميع المعدات</h3>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="نوع المعدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="transformer">محولات</SelectItem>
                  <SelectItem value="generator">مولدات</SelectItem>
                  <SelectItem value="panel">لوحات توزيع</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="online">متصل</SelectItem>
                  <SelectItem value="offline">غير متصل</SelectItem>
                  <SelectItem value="warning">تحذير</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentData.map((equipment) => (
              <EquipmentCard key={equipment.id} equipment={equipment} />
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">سجل التنبيهات</h3>
            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الخطورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => toast.success("تم تأكيد جميع التنبيهات")}>
                <CheckCircle className="w-4 h-4 ml-2" />
                تأكيد الكل
              </Button>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={cn(
                      "p-4 hover:bg-muted/30 transition-colors flex items-center justify-between",
                      !alert.acknowledged && "bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        alert.severity === "critical" && "bg-destructive/20 text-destructive",
                        alert.severity === "high" && "bg-destructive/20 text-destructive",
                        alert.severity === "medium" && "bg-warning/20 text-warning",
                        alert.severity === "low" && "bg-muted text-muted-foreground",
                        alert.severity === "info" && "bg-blue-500/20 text-blue-500"
                      )}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{alert.title}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono">{alert.equipment}</span>
                          <span>•</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertSeverityBadge severity={alert.severity} />
                      {alert.acknowledged ? (
                        <Badge variant="outline" className="text-success">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          مؤكد
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.success("تم تأكيد استلام التنبيه")}
                        >
                          تأكيد
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <h3 className="text-lg font-semibold">صحة النظام</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemHealth.map((item, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الاستخدام</span>
                      <span className={cn(
                        "font-bold ltr-nums",
                        item.value > 80 ? "text-destructive" : item.value > 60 ? "text-warning" : "text-success"
                      )}>{item.value}%</span>
                    </div>
                    <Progress 
                      value={item.value} 
                      className={cn(
                        "h-2",
                        item.value > 80 ? "[&>div]:bg-destructive" : item.value > 60 ? "[&>div]:bg-warning" : "[&>div]:bg-success"
                      )} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Server Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                حالة الخوادم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: "خادم التطبيقات", status: "online", uptime: "99.99%", load: "45%" },
                  { name: "خادم قاعدة البيانات", status: "online", uptime: "99.95%", load: "62%" },
                  { name: "خادم SCADA", status: "online", uptime: "99.98%", load: "38%" },
                ].map((server, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{server.name}</span>
                      <EquipmentStatusBadge status={server.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">وقت التشغيل</p>
                        <p className="font-mono text-success">{server.uptime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الحمل</p>
                        <p className="font-mono">{server.load}</p>
                      </div>
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
