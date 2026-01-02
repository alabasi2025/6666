import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package, Wrench, UserCircle, DollarSign,
  Activity, AlertTriangle, CreditCard, Receipt,
  Zap, ClipboardList, ShoppingCart, BarChart3,
  TrendingUp, TrendingDown, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: React.ElementType;
  color: string;
  isLoading?: boolean;
}

function StatsCard({ stat }: { stat: StatCardProps }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            {stat.isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin mt-2" />
            ) : (
              <p className="text-2xl font-bold mt-2 ltr-nums">{stat.value}</p>
            )}
            {stat.change && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm",
                stat.trend === "up" ? "text-success" : "text-destructive"
              )}>
                {stat.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            stat.color === "primary" && "bg-primary/10 text-primary",
            stat.color === "warning" && "bg-warning/10 text-warning",
            stat.color === "success" && "bg-success/10 text-success",
            stat.color === "accent" && "bg-accent/10 text-accent"
          )}>
            <stat.icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const [, setLocation] = useLocation();

  // Fetch stats from API
  const { data: assetsStats, isLoading: assetsLoading } = trpc.assets.categories.list.useQuery({ businessId: 1 } as any);
  const { data: maintenanceStats, isLoading: maintenanceLoading } = trpc.maintenance.workOrders.list.useQuery({ businessId: 1 } as any);
  const { data: customersData, isLoading: customersLoading } = trpc.billing.getCustomers.useQuery({ businessId: 1 } as any);
  const { data: accountingStats, isLoading: accountingLoading } = trpc.accounting.dashboardStats.useQuery({ businessId: 1 } as any);
  const { data: scadaStats, isLoading: scadaLoading } = trpc.scada.alerts.list.useQuery({ businessId: 1 } as any);
  const { data: recentAlerts = [], isLoading: alertsLoading } = trpc.scada.alerts.list.useQuery({ businessId: 1 } as any);

  // Build stats data
  const statsData: StatCardProps[] = [
    {
      title: "إجمالي الأصول",
      value: (assetsStats as any)?.length?.toLocaleString() || "0",
      change: "+12%",
      trend: "up",
      icon: Package,
      color: "primary",
      isLoading: assetsLoading,
    },
    {
      title: "أوامر العمل النشطة",
      value: (maintenanceStats as any)?.length?.toLocaleString() || "0",
      change: "0",
      trend: "down",
      icon: Wrench,
      color: "warning",
      isLoading: maintenanceLoading,
    },
    {
      title: "العملاء",
      value: customersData?.length?.toLocaleString() || "0",
      change: "+23%",
      trend: "up",
      icon: UserCircle,
      color: "success",
      isLoading: customersLoading,
    },
    {
      title: "الإيرادات الشهرية",
      value: (accountingStats as any)?.totalRevenue 
        ? `${((accountingStats as any).totalRevenue / 1000000).toFixed(1)}M` 
        : "0",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "accent",
      isLoading: accountingLoading,
    },
  ];

  // Build recent activities from real data
  const recentActivities = recentAlerts.slice(0, 5).map((alert: any, index: number) => ({
    id: alert.id || index,
    type: "alert",
    title: alert.message || alert.title || "تنبيه جديد",
    time: alert.createdAt ? new Date(alert.createdAt).toLocaleString("ar-SA") : "منذ قليل",
    status: alert.severity === "critical" ? "warning" : alert.acknowledged ? "completed" : "pending",
  }));

  // Add default activity if no alerts
  if (recentActivities.length === 0) {
    recentActivities.push({
      id: 1,
      type: "asset",
      title: "النظام يعمل بشكل طبيعي",
      time: new Date().toLocaleString("ar-SA"),
      status: "completed",
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مرحباً بك في لوحة التحكم</h1>
          <p className="text-muted-foreground">إليك نظرة عامة على أداء النظام اليوم</p>
        </div>
        <Button className="gradient-energy">
          <BarChart3 className="w-4 h-4 ml-2" />
          تقرير شامل
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(statsData as any).map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              النشاطات الأخيرة
            </CardTitle>
            <CardDescription>آخر التحديثات والإجراءات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {(recentActivities as any[]).map((activity: any) => (
                  <div 
                    key={activity.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      activity.status === "completed" && "bg-success/20 text-success",
                      activity.status === "pending" && "bg-warning/20 text-warning",
                      activity.status === "warning" && "bg-destructive/20 text-destructive"
                    )}>
                      {activity.type === "work_order" && <Wrench className="w-5 h-5" />}
                      {activity.type === "payment" && <CreditCard className="w-5 h-5" />}
                      {activity.type === "alert" && <AlertTriangle className="w-5 h-5" />}
                      {(activity as any).accountType === "asset" && <Package className="w-5 h-5" />}
                      {activity.type === "invoice" && <Receipt className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      activity.status === "completed" && "badge-success",
                      activity.status === "pending" && "badge-warning",
                      activity.status === "warning" && "badge-danger"
                    )}>
                      {activity.status === "completed" && "مكتمل"}
                      {activity.status === "pending" && "قيد الانتظار"}
                      {activity.status === "warning" && "تحذير"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ClipboardList, label: "أمر عمل جديد", path: "/dashboard/maintenance/work-orders" },
                { icon: UserCircle, label: "عميل جديد", path: "/dashboard/billing/customers" },
                { icon: Receipt, label: "فاتورة جديدة", path: "/dashboard/billing/invoices" },
                { icon: Package, label: "تسجيل أصل", path: "/dashboard/assets" },
                { icon: ShoppingCart, label: "طلب شراء", path: "/dashboard/inventory/purchase-orders" },
                { icon: BarChart3, label: "تقرير مالي", path: "/dashboard/accounting/trial-balance" },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50 transition-colors"
                  onClick={() => setLocation(action.path)}
                >
                  <action.icon className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: "المعدات النشطة", 
                value: scadaLoading ? "..." : `${(scadaStats as any)?.activeEquipment || 0}/${(scadaStats as any)?.totalEquipment || 0}`, 
                status: "good" 
              },
              { 
                label: "التنبيهات الحرجة", 
                value: scadaLoading ? "..." : ((scadaStats as any)?.criticalAlerts || 0).toString(), 
                status: ((scadaStats as any)?.criticalAlerts || 0) > 0 ? "warning" : "good" 
              },
              { 
                label: "أوامر العمل المفتوحة", 
                value: maintenanceLoading ? "..." : ((maintenanceStats as any)?.length || 0).toString(), 
                status: "normal" 
              },
              { 
                label: "نسبة التشغيل", 
                value: scadaLoading ? "..." : `${(scadaStats as any)?.operationalRate || 98.5}%`, 
                status: "good" 
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground ltr-nums">{item.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
                <div className={cn(
                  "w-2 h-2 rounded-full mx-auto mt-2",
                  item.status === "good" && "bg-success",
                  item.status === "warning" && "bg-warning",
                  item.status === "normal" && "bg-primary"
                )} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
