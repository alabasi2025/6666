import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Search, Zap } from "lucide-react";

interface MeterLocationMapProps {
  businessId: number;
  onMeterSelect?: (meter: any) => void;
}

export default function MeterLocationMap({ businessId, onMeterSelect }: MeterLocationMapProps) {
  const [centerLat, setCenterLat] = useState(24.7136); // الرياض
  const [centerLon, setCenterLon] = useState(46.6753);
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedMeter, setSelectedMeter] = useState<any>(null);

  const metersNearbyQuery = trpc.customerSystem.getMetersByLocation.useQuery({
    businessId,
    centerLatitude: centerLat,
    centerLongitude: centerLon,
    radiusKm,
  });

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenterLat(position.coords.latitude);
          setCenterLon(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("تعذر الحصول على الموقع الحالي");
        }
      );
    } else {
      alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
    }
  };

  const handleMeterClick = (meter: any) => {
    setSelectedMeter(meter);
    if (onMeterSelect) {
      onMeterSelect(meter);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      suspended: "bg-yellow-500",
      disconnected: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="space-y-4">
      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            بحث العدادات حسب الموقع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>خط العرض</Label>
              <Input
                type="number"
                step="0.000001"
                value={centerLat}
                onChange={(e) => setCenterLat(parseFloat(e.target.value))}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>خط الطول</Label>
              <Input
                type="number"
                step="0.000001"
                value={centerLon}
                onChange={(e) => setCenterLon(parseFloat(e.target.value))}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>نصف القطر (كم)</Label>
              <Input
                type="number"
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleGetCurrentLocation} className="w-full">
                <Navigation className="h-4 w-4 ml-2" />
                موقعي الحالي
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نتائج البحث */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>العدادات القريبة ({metersNearbyQuery.data?.total || 0})</span>
            <Button size="sm" variant="outline" onClick={() => metersNearbyQuery.refetch()}>
              <Search className="h-4 w-4 ml-2" />
              بحث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metersNearbyQuery.isLoading ? (
            <p className="text-center py-8">جاري البحث...</p>
          ) : metersNearbyQuery.data?.data?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد عدادات في هذا النطاق
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metersNearbyQuery.data?.data?.map((meter: any) => (
                <div
                  key={meter.id}
                  onClick={() => handleMeterClick(meter)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedMeter?.id === meter.id
                      ? "bg-primary/10 border-primary"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${getStatusColor(meter.status)}`}
                        />
                        <span className="font-semibold">{meter.meterNumber}</span>
                        {meter.serialNumber && (
                          <Badge variant="outline" className="text-xs">
                            {meter.serialNumber}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {meter.customerId && (
                          <p className="text-muted-foreground">
                            العميل: {meter.customer?.fullName || "غير محدد"}
                          </p>
                        )}
                        {meter.address && (
                          <p className="text-muted-foreground">
                            <MapPin className="h-3 w-3 inline ml-1" />
                            {meter.address}
                          </p>
                        )}
                        {meter.location && (
                          <p className="text-muted-foreground">
                            الموقع: {meter.location}
                          </p>
                        )}
                        {meter.neighborhood && (
                          <p className="text-muted-foreground">
                            الحي: {meter.neighborhood}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge variant="secondary" className="mb-2">
                        {meter.distance} كم
                      </Badge>
                      <div className="text-xs text-muted-foreground" dir="ltr">
                        {parseFloat(meter.latitude).toFixed(6)}, <br />
                        {parseFloat(meter.longitude).toFixed(6)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل العداد المحدد */}
      {selectedMeter && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-base">تفاصيل العداد المحدد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">رقم العداد</Label>
                <p className="font-semibold">{selectedMeter.meterNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">الحالة</Label>
                <p>
                  <Badge variant="outline">{selectedMeter.status}</Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">نوع الخدمة</Label>
                <p>{selectedMeter.meterType || "كهرباء"}</p>
              </div>
              {selectedMeter.customer && (
                <>
                  <div>
                    <Label className="text-muted-foreground">العميل</Label>
                    <p className="font-semibold">{selectedMeter.customer.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">رقم الحساب</Label>
                    <p>{selectedMeter.customer.accountNumber}</p>
                  </div>
                </>
              )}
              <div>
                <Label className="text-muted-foreground">المسافة</Label>
                <p className="font-semibold text-primary">{selectedMeter.distance} كم</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps?q=${selectedMeter.latitude},${selectedMeter.longitude}`,
                    "_blank"
                  )
                }
              >
                <MapPin className="h-4 w-4 ml-2" />
                عرض في خرائط جوجل
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ملاحظة */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Zap className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                نصيحة: يمكنك استخدام موقعك الحالي للبحث عن العدادات القريبة
              </p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                استخدم زر "موقعي الحالي" للبحث عن العدادات في محيطك، أو أدخل الإحداثيات يدوياً للبحث في موقع معين.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

