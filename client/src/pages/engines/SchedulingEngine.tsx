/**
 * شاشة محرك الجدولة الوقائية
 * Preventive Scheduling Engine Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Play, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const SCHEDULING_ENGINE_INFO: EngineInfo = {
  title: "محرك الجدولة الوقائية",
  description: "جدولة الصيانة الوقائية تلقائياً بناءً على الخطط المحددة",
  process: `هذه الشاشة تتيح للمستخدم:
- عرض إحصائيات الجدولة (عدد الخطط المستحقة، أوامر العمل المجدولة)
- تشغيل عملية الجدولة يدوياً
- عرض أوامر العمل التي تم إنشاؤها تلقائياً
- متابعة حالة الصيانة الوقائية`,
  mechanism: `1. النظام يفحص جميع خطط الصيانة الوقائية النشطة
2. لكل خطة، يتم التحقق من:
   - نوع الجدولة (حسب الوقت أو حسب الاستخدام)
   - آخر تاريخ صيانة
   - الفترة المحددة للصيانة
3. إذا كانت الصيانة مستحقة، يتم إنشاء أمر عمل تلقائياً
4. يتم تعيين تاريخ الصيانة بناءً على نوع الجدولة:
   - حسب الوقت: تاريخ الصيانة = آخر صيانة + الفترة
   - حسب الاستخدام: تاريخ الصيانة = عند الوصول لاستخدام معين
5. يتم إرسال إشعارات للفنيين المسؤولين
6. يمكن جدولة الصيانة تلقائياً عبر Cron Jobs`,
  relatedScreens: [
    {
      name: "خطط الصيانة",
      path: "/dashboard/maintenance/plans",
      description: "إدارة خطط الصيانة الوقائية"
    },
    {
      name: "أوامر العمل",
      path: "/dashboard/maintenance/work-orders",
      description: "عرض أوامر العمل الناتجة عن الجدولة"
    },
    {
      name: "الأصول",
      path: "/dashboard/assets",
      description: "إدارة الأصول التي تحتاج صيانة وقائية"
    }
  ],
  businessLogic: `محرك الجدولة الوقائية يعمل كالتالي:

1. خطط الصيانة الوقائية:
   - كل خطة مرتبطة بأصل معين
   - تحدد نوع الجدولة (حسب الوقت أو حسب الاستخدام)
   - تحدد الفترة المطلوبة (مثل: كل 30 يوم أو كل 1000 ساعة)

2. أنواع الجدولة:
   - حسب الوقت: يتم الجدولة بناءً على آخر تاريخ صيانة + الفترة
   - حسب الاستخدام: يتم الجدولة عند الوصول لاستخدام معين (مثل: عدد ساعات التشغيل)

3. عملية الجدولة:
   - يتم فحص جميع الخطط النشطة
   - يتم حساب التاريخ المستحق للصيانة
   - إذا كان التاريخ مستحق، يتم إنشاء أمر عمل
   - يتم تعيين الفني المسؤول

4. Cron Jobs:
   - يمكن جدولة الصيانة تلقائياً عبر Cron Jobs
   - يتم تشغيل الجدولة يومياً أو أسبوعياً حسب الإعدادات

5. الفوائد:
   - منع الأعطال قبل حدوثها
   - توفير الوقت والجهد
   - تحسين أداء الأصول
   - تقليل التكاليف`
};

export default function SchedulingEngine() {
  const { toast } = useToast();
  const [businessId] = useState(1);

  // جدولة الصيانة الوقائية
  const scheduleMutation = trpc.preventiveScheduling.schedule.useMutation({
    onSuccess: (data) => {
      toast({
        title: "نجح",
        description: `تم جدولة ${data.scheduled} أمر عمل بنجاح`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSchedule = () => {
    scheduleMutation.mutate({ businessId });
  };

  // بيانات تجريبية
  const scheduledWorkOrders = [
    {
      id: 1,
      assetName: "مولد كهربائي - المحطة الرئيسية",
      planName: "صيانة دورية شهرية",
      scheduledDate: new Date("2026-01-15"),
      status: "pending",
    },
    {
      id: 2,
      assetName: "محول توزيع - المنطقة الشمالية",
      planName: "فحص ربع سنوي",
      scheduledDate: new Date("2026-01-20"),
      status: "approved",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-orange-500" />
            محرك الجدولة الوقائية
          </h1>
          <p className="text-muted-foreground mt-2">
            جدولة أعمال الصيانة الوقائية تلقائياً
          </p>
        </div>
        <EngineInfoDialog info={SCHEDULING_ENGINE_INFO} />
        <Button onClick={handleSchedule} disabled={scheduleMutation.isLoading}>
          <Play className="w-4 h-4 mr-2" />
          تشغيل الجدولة الآن
        </Button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أوامر العمل المجدولة</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مكتملة</p>
                <p className="text-2xl font-bold">45</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">خطط نشطة</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أوامر العمل المجدولة */}
      <Card>
        <CardHeader>
          <CardTitle>أوامر العمل المجدولة</CardTitle>
          <CardDescription>أوامر العمل التي تم إنشاؤها تلقائياً من خطط الصيانة</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الأصل</TableHead>
                <TableHead>خطة الصيانة</TableHead>
                <TableHead>التاريخ المجدول</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledWorkOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.assetName}</TableCell>
                  <TableCell>{order.planName}</TableCell>
                  <TableCell>{order.scheduledDate.toLocaleDateString("ar-SA")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "default"
                          : order.status === "approved"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {order.status === "pending" ? "قيد الانتظار" : order.status === "approved" ? "معتمد" : "مكتمل"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      عرض
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

