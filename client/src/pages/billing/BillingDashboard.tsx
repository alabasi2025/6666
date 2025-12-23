// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Gauge, FileText, DollarSign, TrendingUp, TrendingDown, 
  Calendar, AlertCircle, CheckCircle, Clock, ArrowRight,
  Zap, Droplet, Flame, Building, MapPin
} from "lucide-react";

export default function BillingDashboard() {
  const customersQuery = trpc.billing.getCustomers.useQuery();
  const metersQuery = trpc.billing.getMeters.useQuery();
  const invoicesQuery = trpc.billing.getInvoices.useQuery();
  const paymentsQuery = trpc.billing.getPayments.useQuery();
  const periodsQuery = trpc.billing.getBillingPeriods.useQuery();
  const areasQuery = trpc.billing.getAreas.useQuery();

  const customers = customersQuery.data || [];
  const meters = metersQuery.data || [];
  const invoices = invoicesQuery.data || [];
  const payments = paymentsQuery.data || [];
  const periods = periodsQuery.data || [];
  const areas = areasQuery.data || [];

  // حسابات الإحصائيات
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const totalMeters = meters.length;
  const activeMeters = meters.filter(m => m.status === "active").length;
  
  const totalInvoicesAmount = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
  const totalPaidAmount = invoices.reduce((sum, i) => sum + parseFloat(i.paidAmount || "0"), 0);
  const totalUnpaidAmount = totalInvoicesAmount - totalPaidAmount;
  const collectionRate = totalInvoicesAmount > 0 ? (totalPaidAmount / totalInvoicesAmount) * 100 : 0;

  const unpaidInvoices = invoices.filter(i => i.status !== 'paid');
  const overdueInvoices = unpaidInvoices.filter(i => new Date(i.dueDate) < new Date());

  const activePeriod = periods.find(p => p.status === "active" || p.status === "reading_phase" || p.status === "billing_phase");

  // إحصائيات حسب نوع الخدمة
  const metersByService = {
    electricity: meters.filter(m => m.serviceType === "electricity").length,
    water: meters.filter(m => m.serviceType === "water").length,
    gas: meters.filter(m => m.serviceType === "gas").length,
  };

  // إحصائيات حسب فئة العميل
  const customersByCategory = {
    residential: customers.filter(c => c.type === "residential").length,
    commercial: customers.filter(c => c.type === "commercial").length,
    industrial: customers.filter(c => c.type === "industrial").length,
    governmental: customers.filter(c => c.type === "government").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نظام الفوترة والعملاء</h1>
          <p className="text-muted-foreground">لوحة التحكم الرئيسية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 ml-2" />
            التقارير
          </Button>
        </div>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{activeCustomers} نشط</span>
              {" • "}
              <span className="text-red-600">{totalCustomers - activeCustomers} محظور</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العدادات</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeters}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{activeMeters} نشط</span>
              {" • "}
              <span className="text-gray-600">{totalMeters - activeMeters} غير نشط</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoicesAmount.toLocaleString()} ر.س</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">نسبة التحصيل</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate.toFixed(1)}%</div>
            <Progress value={collectionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* الصف الثاني */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">المحصّل</p>
                <p className="text-2xl font-bold text-green-700">{totalPaidAmount.toLocaleString()} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">المستحقات</p>
                <p className="text-2xl font-bold text-red-700">{totalUnpaidAmount.toLocaleString()} ر.س</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">فواتير متأخرة</p>
                <p className="text-2xl font-bold text-orange-700">{overdueInvoices.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فترة الفوترة النشطة وإحصائيات أخرى */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* فترة الفوترة النشطة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              فترة الفوترة النشطة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activePeriod ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{activePeriod.name}</p>
                    <p className="text-sm text-muted-foreground">فترة {activePeriod.periodNumber || activePeriod.id}</p>
                  </div>
                  <Badge className={
                    activePeriod.status === "active" ? "bg-blue-100 text-blue-800" :
                    activePeriod.status === "reading_phase" ? "bg-yellow-100 text-yellow-800" :
                    activePeriod.status === "billing_phase" ? "bg-orange-100 text-orange-800" :
                    "bg-gray-100 text-gray-800"
                  }>
                    {activePeriod.status === "active" ? "نشط" :
                     activePeriod.status === "reading_phase" ? "مرحلة القراءات" :
                     activePeriod.status === "billing_phase" ? "مرحلة الفوترة" :
                     activePeriod.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">من</p>
                    <p>{new Date(activePeriod.startDate).toLocaleDateString("ar-SA")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">إلى</p>
                    <p>{new Date(activePeriod.endDate).toLocaleDateString("ar-SA")}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>تقدم القراءات</span>
                    <span>{activePeriod.readMeters || 0} / {activePeriod.totalMeters || totalMeters}</span>
                  </div>
                  <Progress value={activePeriod.totalMeters ? ((activePeriod.readMeters || 0) / activePeriod.totalMeters) * 100 : 0} />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد فترة فوترة نشطة</p>
                <Button variant="link" className="mt-2">إنشاء فترة جديدة</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* العدادات حسب نوع الخدمة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              العدادات حسب نوع الخدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  <span>كهرباء</span>
                </div>
                <span className="font-bold text-yellow-600">{metersByService.electricity}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Droplet className="h-6 w-6 text-blue-600" />
                  <span>مياه</span>
                </div>
                <span className="font-bold text-blue-600">{metersByService.water}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Flame className="h-6 w-6 text-orange-600" />
                  <span>غاز</span>
                </div>
                <span className="font-bold text-orange-600">{metersByService.gas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* العملاء حسب الفئة والمناطق */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* العملاء حسب الفئة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              العملاء حسب الفئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>سكني</span>
                <div className="flex items-center gap-2">
                  <Progress value={(customersByCategory.residential / totalCustomers) * 100} className="w-32 h-2" />
                  <span className="font-medium w-8">{customersByCategory.residential}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>تجاري</span>
                <div className="flex items-center gap-2">
                  <Progress value={(customersByCategory.commercial / totalCustomers) * 100} className="w-32 h-2" />
                  <span className="font-medium w-8">{customersByCategory.commercial}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>صناعي</span>
                <div className="flex items-center gap-2">
                  <Progress value={(customersByCategory.industrial / totalCustomers) * 100} className="w-32 h-2" />
                  <span className="font-medium w-8">{customersByCategory.industrial}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>حكومي</span>
                <div className="flex items-center gap-2">
                  <Progress value={(customersByCategory.governmental / totalCustomers) * 100} className="w-32 h-2" />
                  <span className="font-medium w-8">{customersByCategory.governmental}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المناطق */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              المناطق
            </CardTitle>
          </CardHeader>
          <CardContent>
            {areas.length > 0 ? (
              <div className="space-y-3">
                {areas.slice(0, 5).map((area: any) => (
                  <div key={area.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{area.name}</span>
                    <Badge variant="outline">{area.squaresCount || 0} مربع</Badge>
                  </div>
                ))}
                {areas.length > 5 && (
                  <Button variant="link" className="w-full">عرض المزيد ({areas.length - 5})</Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد مناطق</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* الإجراءات السريعة */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>إضافة عميل</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Gauge className="h-6 w-6" />
              <span>إضافة عداد</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>إدخال قراءات</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span>تحصيل دفعة</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
