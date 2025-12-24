// @ts-nocheck
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Activity, AlertTriangle, Radio, Zap, Thermometer,
  Gauge, Power, RefreshCw, MapPin, Clock, TrendingUp,
  TrendingDown, CheckCircle, XCircle, Wifi, WifiOff,
  BarChart3, Settings, Eye, Bell, Server,
  Cpu, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

// Equipment Status Badge
function EquipmentStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    online: { label: "متصل", color: "bg-success/20 text-success", icon: CheckCircle },
    active: { label: "نشط", color: "bg-success/20 text-success", icon: CheckCircle },
    offline: { label: "غير متصل", color: "bg-destructive/20 text-destructive", icon: XCircle },
    inactive: { label: "غير نشط", color: "bg-destructive/20 text-destructive", icon: XCircle },
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

// Alert Type Badge
function AlertTypeBadge({ type }: { type: string }) {
  const typeConfig: Record<string, { label: string; color: string }> = {
    info: { label: "معلومات", color: "bg-blue-500/20 text-blue-500" },
    warning: { label: "تحذير", color: "bg-warning/20 text-warning" },
    critical: { label: "حرج", color: "bg-orange-500/20 text-orange-500" },
    emergency: { label: "طوارئ", color: "bg-destructive/20 text-destructive" },
  };

  const config = typeConfig[type] || { label: type, color: "bg-gray-500/20 text-gray-500" };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

export default function MonitoringDashboard() {
  const [selectedStation, setSelectedStation] = useState("all");

  // Fetch SCADA dashboard data
  const { data: dashboardData, isLoading, refetch } = trpc.scada.dashboard.useQuery({ businessId: 1 });
  const { data: stats } = trpc.scada.stats.useQuery({ businessId: 1 });

  const handleRefresh = () => {
    refetch();
    toast.success("تم تحديث البيانات");
  };

  const statCards = [
    { 
      label: "إجمالي المعدات", 
      value: stats?.totalEquipment || 0, 
      icon: Server, 
      color: "primary",
      subLabel: `${stats?.onlineEquipment || 0} متصل`
    },
    { 
      label: "المستشعرات", 
      value: stats?.totalSensors || 0, 
      icon: Gauge, 
      color: "success",
      subLabel: `${stats?.activeSensors || 0} نشط`
    },
    { 
      label: "التنبيهات النشطة", 
      value: stats?.activeAlerts || 0, 
      icon: Bell, 
      color: "warning",
      subLabel: `${stats?.criticalAlerts || 0} حرج`
    },
    { 
      label: "معدات غير متصلة", 
      value: stats?.offlineEquipment || 0, 
      icon: WifiOff, 
      color: "destructive",
      subLabel: "تحتاج مراجعة"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            لوحة المراقبة والتحكم
          </h1>
          <p className="text-muted-foreground">مراقبة حية لجميع المعدات والمستشعرات</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر المحطة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المحطات</SelectItem>
              <SelectItem value="1">محطة الرياض</SelectItem>
              <SelectItem value="2">محطة جدة</SelectItem>
              <SelectItem value="3">محطة الدمام</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold ltr-nums">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subLabel}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "destructive" && "bg-destructive/20 text-destructive"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                حالة المعدات
              </CardTitle>
              <CardDescription>آخر تحديث: الآن</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.equipment?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد معدات مسجلة
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.equipment?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          item.status === "active" || item.status === "online" 
                            ? "bg-success/20 text-success" 
                            : "bg-destructive/20 text-destructive"
                        )}>
                          <Power className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.nameAr}</p>
                          <p className="text-xs text-muted-foreground">{item.code}</p>
                        </div>
                      </div>
                      <EquipmentStatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sensors Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                المستشعرات
              </CardTitle>
              <CardDescription>قراءات حية</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.sensors?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد مستشعرات مسجلة
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.sensors?.map((sensor: any) => (
                    <div key={sensor.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-primary" />
                          <span className="font-medium">{sensor.nameAr}</span>
                        </div>
                        <EquipmentStatusBadge status={sensor.status} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={50} className="flex-1 h-2" />
                        <span className="text-sm font-mono">-- {sensor.unit || ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                التنبيهات النشطة
              </CardTitle>
              <CardDescription>التنبيهات التي تحتاج انتباه</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData?.alerts?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success" />
                  <p>لا توجد تنبيهات نشطة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData?.alerts?.map((alert: any) => (
                    <div key={alert.id} className={cn(
                      "flex items-center justify-between p-4 rounded-lg border",
                      alert.alertType === "critical" || alert.alertType === "emergency" 
                        ? "border-destructive/50 bg-destructive/10" 
                        : "border-warning/50 bg-warning/10"
                    )}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={cn(
                          "w-5 h-5",
                          alert.alertType === "critical" || alert.alertType === "emergency" 
                            ? "text-destructive" 
                            : "text-warning"
                        )} />
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTypeBadge type={alert.alertType} />
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
