import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Thermometer, Gauge, Droplets, Wind, Zap, Activity,
  Radio, Wifi, WifiOff, Search, RefreshCw, Settings,
  TrendingUp, TrendingDown, Clock, MapPin, Battery,
  Signal, AlertTriangle, CheckCircle, Eye, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sensor Status Badge
function SensorStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    online: { label: "متصل", color: "bg-success/20 text-success" },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive" },
    warning: { label: "تحذير", color: "bg-warning/20 text-warning" },
    calibrating: { label: "معايرة", color: "bg-blue-500/20 text-blue-500" },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Sensor Type Icon
function SensorTypeIcon({ type }: { type: string }) {
  const iconMap: Record<string, typeof Thermometer> = {
    temperature: Thermometer,
    pressure: Gauge,
    humidity: Droplets,
    flow: Wind,
    voltage: Zap,
    current: Activity,
    power: Zap,
    level: Droplets,
  };

  const Icon = iconMap[type] || Radio;
  return <Icon className="w-5 h-5" />;
}

// Sample Sensors Data
const sensorsData = [
  {
    id: 1,
    name: "مستشعر درجة حرارة المحول T-01",
    code: "TEMP-TR01-001",
    type: "temperature",
    equipment: "TR-001",
    location: "محطة الرياض الرئيسية",
    status: "online",
    value: 45.2,
    unit: "°C",
    min: 0,
    max: 100,
    normalMin: 20,
    normalMax: 65,
    lastUpdate: "منذ 30 ثانية",
    trend: "stable",
    battery: 85,
    signalStrength: 95,
  },
  {
    id: 2,
    name: "مستشعر درجة حرارة المحول T-02",
    code: "TEMP-TR02-001",
    type: "temperature",
    equipment: "TR-002",
    location: "محطة الرياض الرئيسية",
    status: "warning",
    value: 68.5,
    unit: "°C",
    min: 0,
    max: 100,
    normalMin: 20,
    normalMax: 65,
    lastUpdate: "منذ دقيقة",
    trend: "up",
    battery: 72,
    signalStrength: 88,
  },
  {
    id: 3,
    name: "مستشعر الضغط - خط الزيت",
    code: "PRES-OIL-001",
    type: "pressure",
    equipment: "TR-001",
    location: "محطة الرياض الرئيسية",
    status: "online",
    value: 2.4,
    unit: "bar",
    min: 0,
    max: 5,
    normalMin: 1.5,
    normalMax: 3.5,
    lastUpdate: "منذ 45 ثانية",
    trend: "stable",
    battery: 90,
    signalStrength: 92,
  },
  {
    id: 4,
    name: "مستشعر الرطوبة - غرفة التحكم",
    code: "HUM-CR-001",
    type: "humidity",
    equipment: "CR-001",
    location: "مركز التحكم",
    status: "online",
    value: 45,
    unit: "%",
    min: 0,
    max: 100,
    normalMin: 30,
    normalMax: 60,
    lastUpdate: "منذ دقيقتين",
    trend: "down",
    battery: 95,
    signalStrength: 98,
  },
  {
    id: 5,
    name: "مستشعر الجهد - اللوحة الرئيسية",
    code: "VOLT-MDB-001",
    type: "voltage",
    equipment: "MDB-001",
    location: "محطة الدمام",
    status: "online",
    value: 220.5,
    unit: "V",
    min: 180,
    max: 260,
    normalMin: 210,
    normalMax: 230,
    lastUpdate: "منذ 15 ثانية",
    trend: "stable",
    battery: null,
    signalStrength: 100,
  },
  {
    id: 6,
    name: "مستشعر التيار - الخط الرئيسي",
    code: "CURR-LINE-001",
    type: "current",
    equipment: "LINE-001",
    location: "محطة الرياض الرئيسية",
    status: "online",
    value: 245,
    unit: "A",
    min: 0,
    max: 500,
    normalMin: 0,
    normalMax: 400,
    lastUpdate: "منذ 20 ثانية",
    trend: "up",
    battery: null,
    signalStrength: 96,
  },
  {
    id: 7,
    name: "مستشعر مستوى الوقود - المولد",
    code: "LVL-GEN-001",
    type: "level",
    equipment: "GEN-001",
    location: "محطة جدة الفرعية",
    status: "offline",
    value: 85,
    unit: "%",
    min: 0,
    max: 100,
    normalMin: 20,
    normalMax: 100,
    lastUpdate: "منذ 15 دقيقة",
    trend: "stable",
    battery: 45,
    signalStrength: 0,
  },
  {
    id: 8,
    name: "مستشعر تدفق الهواء - التبريد",
    code: "FLOW-COOL-001",
    type: "flow",
    equipment: "COOL-001",
    location: "محطة الرياض الرئيسية",
    status: "online",
    value: 1250,
    unit: "m³/h",
    min: 0,
    max: 2000,
    normalMin: 800,
    normalMax: 1800,
    lastUpdate: "منذ دقيقة",
    trend: "stable",
    battery: 78,
    signalStrength: 91,
  },
];

const sensorStats = [
  { label: "إجمالي المستشعرات", value: 156, icon: Radio, color: "primary" },
  { label: "متصل", value: 148, icon: Wifi, color: "success" },
  { label: "غير متصل", value: 5, icon: WifiOff, color: "destructive" },
  { label: "تحذيرات", value: 3, icon: AlertTriangle, color: "warning" },
];

export default function Sensors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const filteredSensors = sensorsData.filter(sensor => {
    if (searchQuery && !sensor.name.includes(searchQuery) && !sensor.code.includes(searchQuery)) {
      return false;
    }
    if (typeFilter !== "all" && sensor.type !== typeFilter) {
      return false;
    }
    if (statusFilter !== "all" && sensor.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const getValueStatus = (sensor: typeof sensorsData[0]) => {
    if (sensor.value < sensor.normalMin || sensor.value > sensor.normalMax) {
      return "warning";
    }
    return "normal";
  };

  const getValuePercentage = (sensor: typeof sensorsData[0]) => {
    return ((sensor.value - sensor.min) / (sensor.max - sensor.min)) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-7 h-7 text-primary" />
            أجهزة الاستشعار
          </h1>
          <p className="text-muted-foreground">مراقبة وإدارة جميع أجهزة الاستشعار في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 ml-2" />
            إعدادات
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {sensorStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={cn(
                    "text-3xl font-bold ltr-nums",
                    stat.color === "destructive" && "text-destructive",
                    stat.color === "warning" && "text-warning",
                    stat.color === "success" && "text-success"
                  )}>{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "success" && "bg-success/20 text-success"
                )}>
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
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المستشعرات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="temperature">درجة الحرارة</SelectItem>
                <SelectItem value="pressure">الضغط</SelectItem>
                <SelectItem value="humidity">الرطوبة</SelectItem>
                <SelectItem value="voltage">الجهد</SelectItem>
                <SelectItem value="current">التيار</SelectItem>
                <SelectItem value="flow">التدفق</SelectItem>
                <SelectItem value="level">المستوى</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="online">متصل</SelectItem>
                <SelectItem value="offline">غير متصل</SelectItem>
                <SelectItem value="warning">تحذير</SelectItem>
                <SelectItem value="calibrating">معايرة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sensors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSensors.map((sensor) => {
          const valueStatus = getValueStatus(sensor);
          const valuePercentage = getValuePercentage(sensor);
          
          return (
            <Card 
              key={sensor.id} 
              className={cn(
                "card-hover cursor-pointer transition-all",
                sensor.status === "offline" && "opacity-60",
                sensor.status === "warning" && "border-warning/50"
              )}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    sensor.status === "online" ? "bg-primary/20 text-primary" :
                    sensor.status === "warning" ? "bg-warning/20 text-warning" :
                    "bg-muted text-muted-foreground"
                  )}>
                    <SensorTypeIcon type={sensor.type} />
                  </div>
                  <SensorStatusBadge status={sensor.status} />
                </div>

                {/* Name & Code */}
                <h4 className="font-medium text-sm mb-1 line-clamp-1">{sensor.name}</h4>
                <p className="text-xs text-muted-foreground font-mono mb-3">{sensor.code}</p>

                {/* Value */}
                <div className="mb-3">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={cn(
                      "text-3xl font-bold ltr-nums",
                      valueStatus === "warning" ? "text-warning" : "text-foreground"
                    )}>
                      {sensor.value}
                    </span>
                    <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                    {sensor.trend === "up" && <TrendingUp className="w-4 h-4 text-destructive" />}
                    {sensor.trend === "down" && <TrendingDown className="w-4 h-4 text-success" />}
                  </div>
                  <Progress 
                    value={valuePercentage} 
                    className={cn(
                      "h-2",
                      valueStatus === "warning" && "[&>div]:bg-warning"
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{sensor.min} {sensor.unit}</span>
                    <span>{sensor.max} {sensor.unit}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sensor.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {sensor.lastUpdate}
                    </span>
                    <div className="flex items-center gap-2">
                      {sensor.battery !== null && (
                        <span className={cn(
                          "flex items-center gap-1",
                          sensor.battery < 20 && "text-destructive"
                        )}>
                          <Battery className="w-3 h-3" />
                          {sensor.battery}%
                        </span>
                      )}
                      <span className={cn(
                        "flex items-center gap-1",
                        sensor.signalStrength < 50 && "text-warning",
                        sensor.signalStrength === 0 && "text-destructive"
                      )}>
                        <Signal className="w-3 h-3" />
                        {sensor.signalStrength}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 ml-1" />
                    تفاصيل
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <BarChart3 className="w-4 h-4 ml-1" />
                    الرسم البياني
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSensors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Radio className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد مستشعرات</h3>
            <p className="text-muted-foreground">لم يتم العثور على مستشعرات تطابق معايير البحث</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
