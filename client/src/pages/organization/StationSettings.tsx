// client/src/pages/organization/StationSettings.tsx
// صفحة إعدادات المحطة

import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Building2,
  MapPin,
  Zap,
  Calendar,
  User,
  Save,
  RefreshCw,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const STATION_SETTINGS_INFO = {
  title: "إعدادات المحطة",
  description: "إدارة إعدادات المحطة وتكوينها.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: station.getById لجلب بيانات المحطة
   - عرض الإعدادات الحالية في نموذج قابل للتعديل

2) تحديث الإعدادات:
   - تعديل الحقول المطلوبة
   - النقر على "حفظ" لحفظ التغييرات
   - حفظ التغييرات عبر tRPC: station.update`,
  mechanism: `- استعلام tRPC: station.getById.useQuery()
- نموذج تعديل مع التحقق من البيانات
- حفظ التغييرات عبر tRPC: station.update.useMutation()`,
  relatedScreens: [
    { name: "المحطات", path: "/dashboard/organization/stations", description: "قائمة المحطات" },
  ],
  businessLogic: "إعدادات المحطة تحدد خصائص وتكوين المحطة بما في ذلك السعة، الجهد، الموقع، والحالة.",
};

export default function StationSettings() {
  const [location, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const stationId = params?.id ? parseInt(params.id) : undefined;

  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "generation" as const,
    status: "operational" as const,
    capacity: "",
    capacityUnit: "MW",
    voltageLevel: "",
    address: "",
    latitude: "",
    longitude: "",
    commissionDate: "",
    managerId: "none",
    notes: "",
  });

  // Fetch station data
  const { data: station, isLoading } = trpc.station.getById.useQuery(
    { id: stationId! },
    { enabled: !!stationId }
  );

  // Update form when station data loads
  useEffect(() => {
    if (station) {
      setFormData({
        code: station.code || "",
        nameAr: station.nameAr || "",
        nameEn: station.nameEn || "",
        type: station.type || "generation",
        status: station.status || "operational",
        capacity: station.capacity?.toString() || "",
        capacityUnit: station.capacityUnit || "MW",
        voltageLevel: station.voltageLevel || "",
        address: station.address || "",
        latitude: station.latitude?.toString() || "",
        longitude: station.longitude?.toString() || "",
        commissionDate: station.commissionDate || "",
        managerId: station.managerId?.toString() || "none",
        notes: station.metadata?.notes || "",
      });
    }
  }, [station]);

  // Fetch branches for selects
  const { data: branches } = trpc.branch.list.useQuery();
  // TODO: Fetch users when users.list is available
  const users: any[] = [];

  // Update mutation
  const updateMutation = trpc.station.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث إعدادات المحطة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل تحديث الإعدادات: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationId) return;

    updateMutation.mutate({
      id: stationId,
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      type: formData.type,
      status: formData.status,
      capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
      capacityUnit: formData.capacityUnit,
      voltageLevel: formData.voltageLevel || undefined,
      address: formData.address || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      commissionDate: formData.commissionDate || undefined,
      managerId: formData.managerId && formData.managerId !== "none" ? parseInt(formData.managerId) : undefined,
      metadata: formData.notes ? { notes: formData.notes } : undefined,
    });
  };

  const currentPageInfo = resolvePageInfo(location);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">المحطة غير موجودة</p>
            <Button onClick={() => setLocation("/dashboard/organization/stations")} className="mt-4">
              العودة لقائمة المحطات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" />
            إعدادات المحطة
          </h1>
          <p className="text-muted-foreground mt-2">
            {station.nameAr} - {station.code}
          </p>
        </div>
        <div className="flex gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Button variant="outline" onClick={() => setLocation("/dashboard/organization/stations")}>
            العودة للقائمة
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="technical">تقني</TabsTrigger>
            <TabsTrigger value="location">موقع</TabsTrigger>
            <TabsTrigger value="management">إدارة</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>المعلومات الأساسية للمحطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>كود المحطة *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>الاسم بالعربية *</Label>
                    <Input
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>الاسم بالإنجليزية</Label>
                    <Input
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>نوع المحطة *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generation">توليد</SelectItem>
                        <SelectItem value="transmission">نقل</SelectItem>
                        <SelectItem value="distribution">توزيع</SelectItem>
                        <SelectItem value="substation">محطة فرعية</SelectItem>
                        <SelectItem value="solar">طاقة شمسية</SelectItem>
                        <SelectItem value="wind">طاقة رياح</SelectItem>
                        <SelectItem value="hydro">طاقة مائية</SelectItem>
                        <SelectItem value="thermal">طاقة حرارية</SelectItem>
                        <SelectItem value="storage">تخزين</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>الحالة *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">تشغيلي</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="offline">غير متصل</SelectItem>
                        <SelectItem value="construction">تحت الإنشاء</SelectItem>
                        <SelectItem value="decommissioned">متوقف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>تاريخ التشغيل</Label>
                    <Input
                      type="date"
                      value={formData.commissionDate}
                      onChange={(e) => setFormData({ ...formData, commissionDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Settings */}
          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات التقنية</CardTitle>
                <CardDescription>المعلومات التقنية للمحطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>السعة</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                      />
                      <Select
                        value={formData.capacityUnit}
                        onValueChange={(value) => setFormData({ ...formData, capacityUnit: value })}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MW">MW</SelectItem>
                          <SelectItem value="KW">KW</SelectItem>
                          <SelectItem value="W">W</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>مستوى الجهد</Label>
                    <Input
                      value={formData.voltageLevel}
                      onChange={(e) => setFormData({ ...formData, voltageLevel: e.target.value })}
                      placeholder="مثال: 33 KV"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Settings */}
          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الموقع</CardTitle>
                <CardDescription>الموقع الجغرافي للمحطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>العنوان</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="العنوان الكامل"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>خط العرض (Latitude)</Label>
                    <Input
                      type="number"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="مثال: 24.7136"
                      step="0.00000001"
                    />
                  </div>
                  <div>
                    <Label>خط الطول (Longitude)</Label>
                    <Input
                      type="number"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="مثال: 46.6753"
                      step="0.00000001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Settings */}
          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإدارة</CardTitle>
                <CardDescription>إعدادات إدارة المحطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>مدير المحطة</Label>
                  <Select
                    value={formData.managerId}
                    onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدير" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد</SelectItem>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.nameAr || user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => setLocation("/dashboard/organization/stations")}>
            إلغاء
          </Button>
          <Button type="submit" disabled={updateMutation.isLoading}>
            {updateMutation.isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ التغييرات
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

