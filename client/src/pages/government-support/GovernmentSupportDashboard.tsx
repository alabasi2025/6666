import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const GOV_SUPPORT_DASHBOARD_INFO = {
  title: "لوحة تحكم الدعم الحكومي",
  description: "ملخص شامل لنظام الدعم الحكومي.",
  process: `1) عرض المؤشرات الرئيسية:
   - إجمالي العملاء المدعومين
   - العملاء النشطين
   - إجمالي الاستهلاك المدعوم
   - إجمالي مبلغ الدعم
   - نسبة استغلال الميزانية

2) عرض الإحصائيات الشهرية:
   - الاستهلاك المدعوم للشهر الحالي
   - مبلغ الدعم للشهر الحالي
   - الحصص المتبقية

3) التنقل السريع:
   - إدارة بيانات الدعم
   - إدارة الحصص
   - تتبع الاستهلاك
   - التقارير`,
  mechanism: `- استعلامات tRPC مجمعة
- عرض البيانات في بطاقات
- تحديث تلقائي للبيانات`,
  relatedScreens: [
    { name: "بيانات الدعم", path: "/dashboard/government-support/customers", description: "إدارة بيانات الدعم للمشتركين" },
    { name: "الحصص", path: "/dashboard/government-support/quotas", description: "إدارة الحصص الشهرية" },
    { name: "تتبع الاستهلاك", path: "/dashboard/government-support/consumption", description: "تتبع استهلاك الدعم" },
    { name: "التقارير", path: "/dashboard/government-support/reports", description: "تقارير صندوق الدعم" },
  ],
  businessLogic: "لوحة التحكم تعرض ملخص شامل لنظام الدعم الحكومي مع إمكانية التنقل السريع للوحدات المختلفة.",
};

export default function GovernmentSupportDashboard() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = useBusinessId();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Determine current page based on location
  const isCustomersPage = location.includes("/customers");
  const isQuotasPage = location.includes("/quotas");
  const isConsumptionPage = location.includes("/consumption");
  const isReportsPage = location.includes("/reports");
  const isDashboard = !isCustomersPage && !isQuotasPage && !isConsumptionPage && !isReportsPage;

  // Fetch monthly report
  const { data: monthlyReport, isLoading } = trpc.governmentSupport.reports.getMonthlyReport.useQuery({
    businessId,
    year: currentYear,
    month: currentMonth,
  });

  // Fetch support customers count
  const { data: customersData } = trpc.governmentSupport.customers.list.useQuery({
    businessId,
    status: "active",
    limit: 1,
  });

  // Fetch customers list for customers page
  const { data: customersList } = trpc.governmentSupport.customers.list.useQuery({
    businessId,
    page: 1,
    limit: 50,
  }, { enabled: isCustomersPage });

  const currentPageInfo = resolvePageInfo(location);

  // Render different content based on current path
  if (isCustomersPage) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-500" />
              بيانات الدعم
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة بيانات الدعم للمشتركين
            </p>
          </div>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء المدعومين</CardTitle>
            <CardDescription>عرض وإدارة بيانات الدعم للعملاء</CardDescription>
          </CardHeader>
          <CardContent>
            {customersList?.data ? (
              <div className="space-y-2">
                {customersList.data.map((customer: any) => (
                  <div key={customer.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{customer.name_ar || customer.name}</h3>
                        <p className="text-sm text-muted-foreground">رقم العداد: {customer.meter_number}</p>
                      </div>
                      <Badge>{customer.status === "active" ? "نشط" : "غير نشط"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">لا توجد بيانات</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isQuotasPage) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-500" />
              الحصص
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة الحصص الشهرية
            </p>
          </div>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>الحصص الشهرية</CardTitle>
            <CardDescription>إدارة الحصص المخصصة للعملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">قيد التطوير - سيتم إضافة إدارة الحصص قريباً</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConsumptionPage) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              تتبع الاستهلاك
            </h1>
            <p className="text-muted-foreground mt-2">
              تتبع استهلاك الدعم
            </p>
          </div>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>تتبع الاستهلاك المدعوم</CardTitle>
            <CardDescription>مراقبة استهلاك الدعم للعملاء</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">قيد التطوير - سيتم إضافة تتبع الاستهلاك قريباً</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isReportsPage) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              التقارير
            </h1>
            <p className="text-muted-foreground mt-2">
              تقارير صندوق الدعم
            </p>
          </div>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>تقارير الدعم الحكومي</CardTitle>
            <CardDescription>عرض التقارير الشهرية والسنوية</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الاستهلاك المدعوم</p>
                    <p className="text-2xl font-bold">{parseFloat(monthlyReport.supported_consumption || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ الدعم</p>
                    <p className="text-2xl font-bold">{parseFloat(monthlyReport.total_support_amount || 0).toFixed(2)} ر.س</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-500" />
            لوحة تحكم الدعم الحكومي
          </h1>
          <p className="text-muted-foreground mt-2">
            ملخص شامل لنظام الدعم الحكومي
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء المدعومين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customersData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyReport?.active_customers || 0} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستهلاك المدعوم (هذا الشهر)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(monthlyReport?.supported_consumption || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">كيلووات/متر مكعب</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ الدعم (هذا الشهر)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(monthlyReport?.total_support_amount || 0).toFixed(2)} ر.س
            </div>
            <p className="text-xs text-muted-foreground">للشهر الحالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الاستهلاك</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {parseFloat(monthlyReport?.total_consumption || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">كيلووات/متر مكعب</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/government-support/customers"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              بيانات الدعم
            </CardTitle>
            <CardDescription>إدارة بيانات الدعم للمشتركين</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/government-support/quotas"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              الحصص
            </CardTitle>
            <CardDescription>إدارة الحصص الشهرية</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/government-support/consumption"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              تتبع الاستهلاك
            </CardTitle>
            <CardDescription>تتبع استهلاك الدعم</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={() => window.location.href = "/dashboard/government-support/reports"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              التقارير
            </CardTitle>
            <CardDescription>تقارير صندوق الدعم</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

