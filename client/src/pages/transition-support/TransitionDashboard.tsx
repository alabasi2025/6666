import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, AlertTriangle, Bell, FileText } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const TRANSITION_DASHBOARD_INFO = {
  title: "لوحة مراقبة استهلاك الدعم",
  description: "مراقبة استهلاك الدعم خلال المرحلة الانتقالية.",
  process: `1) عرض المؤشرات الرئيسية:
   - إجمالي العملاء في المرحلة الانتقالية
   - العملاء المعرضين للخطر
   - إجمالي الاستهلاك المدعوم
   - إجمالي مبلغ الدعم

2) عرض اتجاهات الاستهلاك:
   - اتجاه الاستهلاك (زيادة/ثابت/انخفاض)
   - نسبة استغلال الدعم
   - الاتجاهات الشهرية

3) عرض التنبيهات:
   - التنبيهات النشطة
   - التنبيهات الحرجة
   - التنبيهات المعترف بها`,
  mechanism: `- استعلامات tRPC مجمعة
- عرض البيانات في بطاقات ورسوم بيانية
- تحديث تلقائي للبيانات`,
  relatedScreens: [
    { name: "الإشعارات", path: "/dashboard/transition-support/notifications", description: "إدارة الإشعارات الاستباقية" },
    { name: "تعديلات الفوترة", path: "/dashboard/transition-support/billing", description: "تعديلات الفوترة للمرحلة الانتقالية" },
    { name: "التنبيهات", path: "/dashboard/transition-support/alerts", description: "إدارة التنبيهات" },
  ],
  businessLogic: "لوحة التحكم تعرض ملخص شامل لاستهلاك الدعم خلال المرحلة الانتقالية مع إمكانية التنقل السريع للوحدات المختلفة.",
};

export default function TransitionDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1; // TODO: Get from context

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch dashboard data
  const { data, isLoading } = trpc.transitionSupport.monitoring.getDashboard.useQuery({
    businessId,
    year: currentYear,
    month: currentMonth,
  });

  // Fetch alerts
  const { data: alertsData } = trpc.transitionSupport.monitoring.getAlerts.useQuery({
    businessId,
    severity: "critical",
    status: "active",
    limit: 5,
  });

  const currentPageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            لوحة مراقبة استهلاك الدعم
          </h1>
          <p className="text-muted-foreground mt-2">
            مراقبة استهلاك الدعم خلال المرحلة الانتقالية
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.total_customers || 0}</div>
            <p className="text-xs text-muted-foreground">
              في المرحلة الانتقالية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء المعرضين للخطر</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {data?.stats?.customers_at_risk || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              يحتاجون متابعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستهلاك المدعوم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(data?.stats?.supported_consumption || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">كيلووات/متر مكعب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ الدعم</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(data?.stats?.total_support_amount || 0).toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">للشهر الحالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {alertsData && alertsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              التنبيهات الحرجة
            </CardTitle>
            <CardDescription>
              التنبيهات التي تحتاج متابعة فورية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertsData.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{alert.title}</div>
                    <div className="text-sm text-muted-foreground">{alert.customer_name}</div>
                  </div>
                  <Badge variant="destructive">
                    {alert.severity === "critical" && "حرج"}
                    {alert.severity === "error" && "خطأ"}
                    {alert.severity === "warning" && "تحذير"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/transition-support/notifications"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات
            </CardTitle>
            <CardDescription>إدارة الإشعارات الاستباقية</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/transition-support/billing"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              تعديلات الفوترة
            </CardTitle>
            <CardDescription>تعديلات الفوترة للمرحلة الانتقالية</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/transition-support/alerts"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              التنبيهات
            </CardTitle>
            <CardDescription>إدارة التنبيهات</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

