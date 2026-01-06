/**
 * شاشة فحص صحة المحركات
 * Engines Health Check Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const HEALTH_CHECK_INFO: EngineInfo = {
  title: "فحص صحة المحركات",
  description: "فحص ومراقبة حالة جميع المحركات الأساسية في النظام",
  process: `هذه الشاشة تعرض:
- حالة كل محرك (سليم، تحذير، خطأ)
- تفاصيل المشاكل إن وجدت
- التوصيات لإصلاح المشاكل
- آخر وقت تحديث`,
  mechanism: `1. يتم فحص كل محرك على حدة:
   - محرك القيود المحاسبية: التحقق من وجود الحسابات المطلوبة والفترات المحاسبية
   - محرك التسوية: التحقق من وجود حسابات وسيطة
   - محرك التسعير: التحقق من وجود قواعد تسعير نشطة
   - محرك الجدولة: التحقق من وجود خطط صيانة
   - محرك الإسناد: التحقق من وجود عمال ميدانيين بإحداثيات GPS

2. يتم تحديد الحالة:
   - سليم (ok): جميع المتطلبات متوفرة
   - تحذير (warning): بعض المتطلبات مفقودة لكن المحرك يعمل
   - خطأ (error): متطلبات أساسية مفقودة والمحرك لا يعمل

3. يتم تحديث الحالة تلقائياً كل 30 ثانية

4. يمكن تحديث الحالة يدوياً عبر زر التحديث`,
  relatedScreens: [
    {
      name: "محرك القيود المحاسبية",
      path: "/dashboard/engines/auto-journal",
      description: "عرض القيود المحاسبية التلقائية"
    },
    {
      name: "محرك التسعير",
      path: "/dashboard/engines/pricing",
      description: "إدارة قواعد التسعير"
    },
    {
      name: "محرك التسوية",
      path: "/dashboard/engines/reconciliation",
      description: "إدارة التسويات المالية"
    },
    {
      name: "محرك الجدولة",
      path: "/dashboard/engines/scheduling",
      description: "جدولة الصيانة الوقائية"
    },
    {
      name: "محرك الإسناد",
      path: "/dashboard/engines/assignment",
      description: "إسناد المهام للعمال الميدانيين"
    }
  ],
  businessLogic: `نظام فحص الصحة يعمل كالتالي:

1. التحقق من المتطلبات:
   - كل محرك له متطلبات محددة يجب توفرها
   - يتم فحص هذه المتطلبات تلقائياً

2. محرك القيود المحاسبية:
   - يجب وجود حسابات محاسبية أساسية (عملاء، إيرادات، صندوق، بنك)
   - يجب وجود فترة محاسبية نشطة
   - يجب وجود مستخدمين

3. محرك التسوية:
   - يجب وجود حسابات وسيطة (Clearing Accounts)
   - يجب وجود حسابات محاسبية دائمة

4. محرك التسعير:
   - يجب وجود قواعد تسعير نشطة على الأقل
   - يجب وجود أنواع عدادات وأنواع استخدام

5. محرك الجدولة:
   - يجب وجود خطط صيانة وقائية
   - يجب وجود أصول مرتبطة بالخطط

6. محرك الإسناد:
   - يجب وجود عمال ميدانيين
   - يجب وجود إحداثيات GPS للعمال
   - يجب وجود عمليات ميدانية

7. الحالة الإجمالية:
   - سليم: جميع المحركات سليمة
   - متدهور: بعض المحركات لديها تحذيرات
   - غير سليم: بعض المحركات لديها أخطاء

8. الفوائد:
   - اكتشاف المشاكل مبكراً
   - توجيه المستخدم لإصلاح المشاكل
   - ضمان عمل النظام بشكل صحيح`
};

export default function HealthCheck() {
  const { toast } = useToast();
  const [businessId] = useState(1);

  // فحص صحة المحركات
  const { data: health, refetch, isLoading } = trpc.health.engines.useQuery(
    { businessId },
    {
      refetchInterval: 30000, // تحديث كل 30 ثانية
    }
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ok":
        return <Badge variant="default" className="bg-emerald-500">سليم</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-500">تحذير</Badge>;
      case "error":
        return <Badge variant="destructive">خطأ</Badge>;
      default:
        return <Badge variant="outline">غير معروف</Badge>;
    }
  };

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case "healthy":
        return "text-emerald-500";
      case "degraded":
        return "text-yellow-500";
      case "unhealthy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const engineNames: Record<string, string> = {
    AutoJournal: "محرك القيود المحاسبية",
    Reconciliation: "محرك التسوية",
    Pricing: "محرك التسعير",
    PreventiveScheduling: "محرك الجدولة الوقائية",
    SmartAssignment: "محرك الإسناد الذكي",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-500" />
            فحص صحة المحركات
          </h1>
          <p className="text-muted-foreground mt-2">
            مراقبة حالة جميع المحركات الأساسية في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EngineInfoDialog info={HEALTH_CHECK_INFO} />
          <Button onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* الحالة العامة */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              الحالة العامة
              <span className={getOverallStatusColor(health.overall)}>
                {health.overall === "healthy" ? "سليم" : health.overall === "degraded" ? "متراجع" : "غير سليم"}
              </span>
            </CardTitle>
            <CardDescription>
              آخر تحديث: {new Date(health.timestamp).toLocaleString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.overall === "healthy" ? "ok" : health.overall === "degraded" ? "warning" : "error")}
              <span className="text-lg font-semibold">
                {health.overall === "healthy"
                  ? "جميع المحركات تعمل بشكل طبيعي"
                  : health.overall === "degraded"
                  ? "بعض المحركات تحتاج إلى انتباه"
                  : "هناك مشاكل في بعض المحركات"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* تفاصيل المحركات */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {health?.engines.map((engine) => (
          <Card key={engine.engine}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(engine.status)}
                  {engineNames[engine.engine] || engine.engine}
                </CardTitle>
                {getStatusBadge(engine.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{engine.message}</p>
              {engine.details && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {Object.entries(engine.details).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Activity className="w-8 h-8 animate-pulse mx-auto mb-2" />
            <p className="text-muted-foreground">جاري فحص المحركات...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

