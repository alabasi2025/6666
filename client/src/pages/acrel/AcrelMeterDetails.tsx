// صفحة تفاصيل عداد ACREL
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Zap,
  Activity,
  Thermometer,
  AlertTriangle,
  ToggleRight,
  Loader2,
  RefreshCw,
  Wifi,
  ArrowLeft,
} from "lucide-react";

export default function AcrelMeterDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const meterId = params.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("info");

  // Fetch meter reading
  const { data: reading, isLoading: loadingReading, refetch } = trpc.developer.integrations.acrel.meters.getReading.useQuery(
    { meterId },
    { enabled: !!meterId, refetchInterval: 30000 } // تحديث كل 30 ثانية
  );

  // Fetch payment info
  const { data: paymentMode } = trpc.developer.integrations.acrel.payment.getMode.useQuery(
    { meterId },
    { enabled: !!meterId }
  );

  // Fetch credit info (if credit mode)
  const { data: creditInfo } = trpc.developer.integrations.acrel.payment.getCreditInfo.useQuery(
    { meterId },
    { enabled: !!meterId && paymentMode?.paymentMode === "credit" }
  );

  if (loadingReading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const meterType = reading?.meterType;
  const isADW300 = meterType === "ADW300";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/dashboard/acrel/meters")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Smartphone className="w-8 h-8 text-blue-500" />
              تفاصيل عداد ACREL
            </h1>
            <p className="text-muted-foreground mt-2">
              {reading?.stsMeterId || reading?.acrelMeterId || meterId}
            </p>
          </div>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">معلومات</TabsTrigger>
          <TabsTrigger value="readings">القراءات</TabsTrigger>
          {isADW300 && <TabsTrigger value="sensors">الحساسات</TabsTrigger>}
          <TabsTrigger value="payment">نظام الدفع</TabsTrigger>
        </TabsList>

        {/* معلومات العامة */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العداد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">نوع العداد</p>
                  <p className="text-lg font-semibold">
                    {meterType === "ADL200" ? "ADL200 - مشتركين (سنجل فاز)" : "ADW300 - مراقبة (ثري فاز)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">نوع الطور</p>
                  <p className="text-lg font-semibold">
                    {reading?.phaseType === "single" ? "Single Phase (سنجل فاز)" : "Three Phase (ثري فاز)"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">حالة الاتصال</p>
                  <Badge className="bg-green-500 gap-1">
                    <Wifi className="w-3 h-3" />
                    متصل
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">آخر قراءة</p>
                  <p className="text-lg font-semibold">
                    {reading?.timestamp ? new Date(reading.timestamp).toLocaleString("ar-SA") : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* القراءات */}
        <TabsContent value="readings">
          <Card>
            <CardHeader>
              <CardTitle>القراءات الحية</CardTitle>
              <CardDescription>
                {isADW300 ? "قراءات Three Phase مع الطاقة المصدرة والمستوردة" : "قراءات Single Phase"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isADW300 ? (
                // ADL200 - Single Phase
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">الجهد</p>
                      <p className="text-2xl font-bold">{reading?.reading?.voltage || 0} V</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">التيار</p>
                      <p className="text-2xl font-bold">{reading?.reading?.current || 0} A</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">القدرة</p>
                      <p className="text-2xl font-bold">{reading?.reading?.power || 0} W</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">الطاقة</p>
                      <p className="text-2xl font-bold">{reading?.reading?.energy || 0} kWh</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">التردد</p>
                      <p className="text-2xl font-bold">{reading?.reading?.frequency || 0} Hz</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">معامل القدرة</p>
                      <p className="text-2xl font-bold">{reading?.reading?.powerFactor || 0}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                // ADW300 - Three Phase
                <div className="space-y-6">
                  {/* الطاقة */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      الطاقة
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="border-green-500">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">الطاقة المصدرة</p>
                          <p className="text-2xl font-bold text-green-500">
                            {reading?.reading?.exportedEnergy || 0} kWh
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-orange-500">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">الطاقة المستوردة</p>
                          <p className="text-2xl font-bold text-orange-500">
                            {reading?.reading?.importedEnergy || 0} kWh
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-blue-500">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">إجمالي الطاقة</p>
                          <p className="text-2xl font-bold text-blue-500">
                            {reading?.reading?.totalEnergy || 0} kWh
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* الجهد */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">الجهد (Three Phase)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L1</p>
                          <p className="text-xl font-bold">{reading?.reading?.voltageL1 || 0} V</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L2</p>
                          <p className="text-xl font-bold">{reading?.reading?.voltageL2 || 0} V</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L3</p>
                          <p className="text-xl font-bold">{reading?.reading?.voltageL3 || 0} V</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">المتوسط</p>
                          <p className="text-xl font-bold text-primary">{reading?.reading?.voltageAvg || 0} V</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* التيار */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">التيار (بعد محول التيار)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L1</p>
                          <p className="text-xl font-bold">{reading?.reading?.currentL1 || 0} A</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L2</p>
                          <p className="text-xl font-bold">{reading?.reading?.currentL2 || 0} A</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L3</p>
                          <p className="text-xl font-bold">{reading?.reading?.currentL3 || 0} A</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">المتوسط</p>
                          <p className="text-xl font-bold text-primary">{reading?.reading?.currentAvg || 0} A</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* القدرة */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">القدرة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L1</p>
                          <p className="text-xl font-bold">{reading?.reading?.powerL1 || 0} W</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L2</p>
                          <p className="text-xl font-bold">{reading?.reading?.powerL2 || 0} W</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">L3</p>
                          <p className="text-xl font-bold">{reading?.reading?.powerL3 || 0} W</p>
                        </CardContent>
                      </Card>
                      <Card className="border-primary">
                        <CardContent className="p-4">
                          <p className="text-sm text-muted-foreground">الإجمالي</p>
                          <p className="text-xl font-bold text-primary">{reading?.reading?.powerTotal || 0} W</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* الحساسات (ADW300 فقط) */}
        {isADW300 && (
          <TabsContent value="sensors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* حساسات الحرارة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="w-5 h-5" />
                    حساسات الحرارة (4 منافذ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">حساس 1</p>
                      <p className="text-xl font-bold">{reading?.reading?.temperature1 || 0}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حساس 2</p>
                      <p className="text-xl font-bold">{reading?.reading?.temperature2 || 0}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حساس 3</p>
                      <p className="text-xl font-bold">{reading?.reading?.temperature3 || 0}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">حساس 4</p>
                      <p className="text-xl font-bold">{reading?.reading?.temperature4 || 0}°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* التسرب والقاطع */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    التسرب والقاطع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">تيار التسرب</p>
                    <p className="text-xl font-bold">{reading?.reading?.leakageCurrent || 0} A</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حالة القاطع (قراءة فقط)</p>
                    <Badge
                      className={
                        reading?.reading?.breakerStatus === "on"
                          ? "bg-green-500"
                          : reading?.reading?.breakerStatus === "off"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }
                    >
                      <ToggleRight className="w-4 h-4 mr-1" />
                      {reading?.reading?.breakerStatus === "on" ? "شغال" : reading?.reading?.breakerStatus === "off" ? "طافي" : "رحلة"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* نظام الدفع */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>نظام الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground">نوع الدفع الحالي</p>
                <Badge className="text-lg px-4 py-2 mt-2">
                  {paymentMode?.paymentMode === "postpaid" && "دفع آجل"}
                  {paymentMode?.paymentMode === "prepaid" && "دفع مسبق"}
                  {paymentMode?.paymentMode === "credit" && "ائتمان"}
                </Badge>
              </div>

              {paymentMode?.paymentMode === "prepaid" && (
                <div>
                  <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                  <p className="text-3xl font-bold text-green-500">
                    {paymentMode?.balance?.toFixed(2) || "0.00"} ر.س
                  </p>
                </div>
              )}

              {paymentMode?.paymentMode === "credit" && creditInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">حد الائتمان</p>
                    <p className="text-2xl font-bold">{creditInfo.creditLimit?.toFixed(2) || 0} ر.س</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الدين الحالي</p>
                    <p className="text-2xl font-bold text-red-500">{creditInfo.currentDebt?.toFixed(2) || 0} ر.س</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الائتمان المتبقي</p>
                    <p className="text-2xl font-bold text-green-500">{creditInfo.remainingCredit?.toFixed(2) || 0} ر.س</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الإطفاء التلقائي</p>
                    <Badge className={creditInfo.autoDisconnect ? "bg-red-500" : "bg-gray-500"}>
                      {creditInfo.autoDisconnect ? "مفعل" : "معطل"}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

