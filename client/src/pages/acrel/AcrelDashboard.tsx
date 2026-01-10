/**
 * ACREL Dashboard - لوحة تحكم شاملة لعدادات ACREL
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Gauge,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const ACREL_DASHBOARD_INFO = {
  title: "لوحة تحكم ACREL IoT",
  description: "لوحة تحكم شاملة لمراقبة وإدارة عدادات ACREL IoT",
  process: `1) عرض إحصائيات شاملة للعدادات
2) عرض التنبيهات الحالية
3) عرض الرسوم البيانية للاستهلاك
4) روابط سريعة للعمليات الشائعة`,
  mechanism: `- استعلامات tRPC متعددة
- تحديث تلقائي كل دقيقة
- عرض البيانات الحية`,
  relatedScreens: [
    { name: "إدارة العدادات", path: "/dashboard/acrel/meters", description: "قائمة جميع عدادات ACREL" },
    { name: "المراقبة", path: "/dashboard/acrel/monitoring", description: "مراقبة البنية التحتية" },
    { name: "الأوامر", path: "/dashboard/acrel/commands", description: "إرسال أوامر التحكم" },
  ],
  businessLogic: "لوحة التحكم توفر نظرة شاملة على حالة جميع عدادات ACREL، مع التنبيهات والإحصائيات المهمة.",
};

export default function AcrelDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const businessId = useBusinessId();

  // Fetch meters list
  const { data: meters, isLoading } = trpc.developer.integrations.acrel.meters.list.useQuery({
    businessId,
  });

  // Calculate statistics
  const stats = {
    total: meters?.length || 0,
    online: meters?.filter((m: any) => m.status === "online")?.length || 0,
    offline: meters?.filter((m: any) => m.status === "offline")?.length || 0,
    adl200: meters?.filter((m: any) => m.meter_type === "ADL200")?.length || 0,
    adw300: meters?.filter((m: any) => m.meter_type === "ADW300")?.length || 0,
    postpaid: meters?.filter((m: any) => m.payment_mode === "postpaid")?.length || 0,
    prepaid: meters?.filter((m: any) => m.payment_mode === "prepaid")?.length || 0,
    credit: meters?.filter((m: any) => m.payment_mode === "credit")?.length || 0,
  };
  
  const filteredMeters = meters || [];

  // Get recent alerts (mock - سيتم ربطها بالـ API لاحقاً)
  const recentAlerts = [
    { id: 1, meterId: "ACR-001", type: "credit_limit", message: "عداد #ACR-001 اقترب من حد الائتمان", severity: "warning" },
    { id: 2, meterId: "ACR-015", type: "offline", message: "عداد #ACR-015 غير متصل منذ 2 ساعة", severity: "error" },
    { id: 3, meterId: "ACR-022", type: "high_temperature", message: "عداد #ACR-022 - ارتفاع درجة الحرارة", severity: "warning" },
  ];

  const pageInfo = resolvePageInfo("/dashboard/acrel/dashboard");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            لوحة تحكم ACREL IoT
          </h1>
          <p className="text-muted-foreground mt-2">
            مراقبة وإدارة عدادات ACREL الذكية
          </p>
        </div>
        <EngineInfoDialog info={pageInfo || ACREL_DASHBOARD_INFO} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Meters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              إجمالي العدادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ADL200: {stats.adl200} | ADW300: {stats.adw300}
            </p>
          </CardContent>
        </Card>

        {/* Online Meters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              العدادات المتصلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.online}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.online / stats.total) * 100).toFixed(1) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        {/* Offline Meters */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-red-500" />
              العدادات غير المتصلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.offline}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? ((stats.offline / stats.total) * 100).toFixed(1) : 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        {/* Payment Modes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              أنواع الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>آجل:</span>
                <span className="font-semibold">{stats.postpaid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>مسبق:</span>
                <span className="font-semibold">{stats.prepaid}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ائتمان:</span>
                <span className="font-semibold">{stats.credit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              التنبيهات الحالية
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard/acrel/commands")}>
              إدارة الأوامر
            </Button>
          </div>
          <CardDescription>التنبيهات والإشعارات التي تحتاج انتباه</CardDescription>
        </CardHeader>
        <CardContent>
          {recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>لا توجد تنبيهات حالياً</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    alert.severity === "error"
                      ? "bg-red-50 border-red-200 dark:bg-red-950/20"
                      : "bg-orange-50 border-orange-200 dark:bg-orange-950/20"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 ${
                      alert.severity === "error" ? "text-red-500" : "text-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{alert.meterId}</span>
                      <Badge variant={alert.severity === "error" ? "destructive" : "outline"}>
                        {alert.type === "credit_limit" && "حد الائتمان"}
                        {alert.type === "offline" && "غير متصل"}
                        {alert.type === "high_temperature" && "حرارة مرتفعة"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(`/dashboard/acrel/meters/${alert.meterId}`)}
                  >
                    عرض
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setLocation("/dashboard/acrel/meters")}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-5 w-5 text-blue-500" />
              إدارة العدادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              عرض وإدارة جميع عدادات ACREL
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setLocation("/dashboard/acrel/monitoring")}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              المراقبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              مراقبة البنية التحتية
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setLocation("/dashboard/acrel/commands")}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              الأوامر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إرسال أوامر التحكم
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => setLocation("/dashboard/acrel/ct-configuration")}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              محولات التيار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              إعداد محولات التيار (CT)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Meters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              آخر العدادات النشطة
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard/acrel/meters")}>
              عرض الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">جاري التحميل...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMeters?.slice(0, 5).map((meter: any) => (
                <div
                  key={meter.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => setLocation(`/dashboard/acrel/meters/${meter.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      meter.status === "online" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-semibold">{meter.acrel_meter_id || meter.meter_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {meter.meter_type} • {meter.payment_mode === "postpaid" && "آجل"}
                        {meter.payment_mode === "prepaid" && "مسبق"}
                        {meter.payment_mode === "credit" && "ائتمان"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={meter.status === "online" ? "default" : "destructive"}>
                      {meter.status === "online" ? "متصل" : "غير متصل"}
                    </Badge>
                    <Badge variant="outline">{meter.meter_type}</Badge>
                  </div>
                </div>
              ))}
              {(!meters || meters.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Gauge className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد عدادات ACREL</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setLocation("/dashboard/acrel/meters")}
                  >
                    إضافة عداد
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
