/**
 * شاشة محرك الإسناد الذكي
 * Smart Assignment Engine Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Users, Navigation, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const ASSIGNMENT_ENGINE_INFO: EngineInfo = {
  title: "محرك الإسناد الذكي",
  description: "إسناد المهام تلقائياً للعاملين الميدانيين بناءً على الموقع والمهارات",
  process: `هذه الشاشة تتيح للمستخدم:
- البحث عن الفنيين الأقرب لموقع معين
- عرض تاريخ الإسنادات السابقة
- إعادة إسناد المهام
- متابعة حالة المهام الميدانية`,
  mechanism: `1. عند إنشاء مهمة ميدانية جديدة، يتم تحديد موقع المهمة (إحداثيات GPS)
2. النظام يبحث عن جميع العمال الميدانيين المتاحين
3. يتم حساب المسافة بين موقع المهمة وموقع كل عامل باستخدام صيغة Haversine
4. يتم ترتيب العمال حسب:
   - المسافة (الأقرب أولاً)
   - المهارات المطلوبة
   - حالة التوفر
5. يتم إسناد المهمة للعامل الأنسب تلقائياً
6. يمكن إعادة إسناد المهمة يدوياً إذا لزم الأمر`,
  relatedScreens: [
    {
      name: "العمليات الميدانية",
      path: "/dashboard/fieldops/operations",
      description: "إدارة العمليات الميدانية التي يتم إسنادها"
    },
    {
      name: "العمال الميدانيين",
      path: "/dashboard/fieldops/workers",
      description: "إدارة العمال الميدانيين وإحداثيات مواقعهم"
    },
    {
      name: "أوامر العمل",
      path: "/dashboard/maintenance/work-orders",
      description: "عرض أوامر العمل التي يتم إسنادها للعمال"
    }
  ],
  businessLogic: `محرك الإسناد الذكي يعمل كالتالي:

1. حساب المسافة:
   - يستخدم صيغة Haversine لحساب المسافة بين نقطتين على الكرة الأرضية
   - يأخذ في الاعتبار خطوط العرض والطول
   - النتيجة بالكيلومترات

2. معايير الإسناد:
   - المسافة: الأقرب أولاً
   - المهارات: يجب أن يمتلك العامل المهارات المطلوبة
   - التوفر: يجب أن يكون العامل متاحاً (غير مشغول)
   - الأولوية: المهام العاجلة تحصل على أولوية أعلى

3. أنواع الإسناد:
   - إسناد تلقائي: عند إنشاء مهمة جديدة
   - إسناد عاجل: للمهام الطارئة
   - إعادة إسناد: عند الحاجة لتغيير العامل المسؤول

4. تحديث الموقع:
   - يمكن تحديث موقع العامل في الوقت الفعلي
   - النظام يستخدم آخر موقع معروف للعامل

5. الفوائد:
   - تقليل وقت الاستجابة
   - تحسين كفاءة العمال
   - توزيع عادل للمهام
   - توفير الوقت والجهد`
};

export default function AssignmentEngine() {
  const { toast } = useToast();
  const [businessId] = useState(1);
  const [latitude, setLatitude] = useState("24.7136");
  const [longitude, setLongitude] = useState("46.6753");

  // جلب الفنيين الأقرب
  const { data: nearestWorkers, refetch: refetchNearest } = trpc.smartAssignment.getNearest.useQuery(
    {
      businessId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      limit: 5,
    },
    {
      enabled: false,
    }
  );

  const handleFindNearest = () => {
    if (!latitude || !longitude) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الإحداثيات",
        variant: "destructive",
      });
      return;
    }
    refetchNearest();
  };

  // بيانات تجريبية
  const assignments = [
    {
      id: 1,
      operationType: "طارئة",
      location: "الرياض - حي النرجس",
      assignedWorker: "أحمد محمد",
      distance: 2.5,
      status: "assigned",
      assignedAt: new Date("2026-01-06T10:30:00"),
    },
    {
      id: 2,
      operationType: "صيانة",
      location: "الرياض - حي العليا",
      assignedWorker: "خالد علي",
      distance: 5.2,
      status: "in_progress",
      assignedAt: new Date("2026-01-06T09:15:00"),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="w-8 h-8 text-lime-500" />
            محرك الإسناد الذكي
          </h1>
          <p className="text-muted-foreground mt-2">
            إسناد المهام للفنيين الأقرب تلقائياً بناءً على الموقع الجغرافي
          </p>
        </div>
        <EngineInfoDialog info={ASSIGNMENT_ENGINE_INFO} />
      </div>

      {/* البحث عن الفنيين الأقرب */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            البحث عن الفنيين الأقرب
          </CardTitle>
          <CardDescription>أدخل إحداثيات الموقع للعثور على الفنيين الأقرب</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>خط العرض (Latitude)</Label>
              <Input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="24.7136"
              />
            </div>
            <div>
              <Label>خط الطول (Longitude)</Label>
              <Input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="46.6753"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleFindNearest} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                البحث
              </Button>
            </div>
          </div>

          {nearestWorkers && nearestWorkers.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">الفنيون الأقرب:</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفني</TableHead>
                    <TableHead>المسافة (كم)</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nearestWorkers.map((worker: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{worker.name || `فني ${index + 1}`}</TableCell>
                      <TableCell>{worker.distance?.toFixed(2) || "N/A"} كم</TableCell>
                      <TableCell>
                        <Badge variant={worker.status === "available" ? "default" : "secondary"}>
                          {worker.status === "available" ? "متاح" : "مشغول"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          إسناد
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الإسنادات الحديثة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            الإسنادات الحديثة
          </CardTitle>
          <CardDescription>آخر الإسنادات التي تمت تلقائياً</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع العملية</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>الفني المخصص</TableHead>
                <TableHead>المسافة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإسناد</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <Badge variant="outline">{assignment.operationType}</Badge>
                  </TableCell>
                  <TableCell>{assignment.location}</TableCell>
                  <TableCell>{assignment.assignedWorker}</TableCell>
                  <TableCell>{assignment.distance} كم</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assignment.status === "completed"
                          ? "default"
                          : assignment.status === "in_progress"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {assignment.status === "assigned" ? "مخصص" : assignment.status === "in_progress" ? "قيد التنفيذ" : "مكتمل"}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.assignedAt.toLocaleString("ar-SA")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
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

