import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Info,
  Settings,
  Zap,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

export default function STSPaymentSettings() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const meterId = (params as any)?.id ? parseInt((params as any).id) : undefined;
  const { toast } = useToast();

  const [paymentMode, setPaymentMode] = useState<"postpaid" | "prepaid" | "credit">("postpaid");
  const [creditLimit, setCreditLimit] = useState("");
  const [autoDisconnect, setAutoDisconnect] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const businessId = useBusinessId();

  // Fetch meter info
  const { data: meterData, isLoading, refetch } = trpc.developer.integrations.sts.meters.getInfo.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId }
  );

  // Fetch payment mode
  const { data: paymentModeData, refetch: refetchPaymentMode } = trpc.developer.integrations.sts.payment.getMode.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId }
  );

  // Fetch credit info
  const { data: creditInfo, refetch: refetchCreditInfo } = trpc.developer.integrations.sts.payment.getCreditInfo.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId && paymentMode === "credit" }
  );

  // Fetch prepaid balance
  const { data: prepaidBalance, refetch: refetchPrepaidBalance } = trpc.developer.integrations.sts.payment.getPrepaidBalance.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId && paymentMode === "prepaid" }
  );

  // Set payment mode mutation
  const setPaymentModeMutation = trpc.developer.integrations.sts.payment.setMode.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث نوع الدفع بنجاح");
      refetchPaymentMode();
      refetch();
    },
    onError: (error) => {
      toast.error("فشل تحديث نوع الدفع: " + error.message);
    },
    onSettled: () => setIsSaving(false),
  });

  // Set credit limit mutation
  const setCreditLimitMutation = trpc.developer.integrations.sts.payment.setCreditLimit.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حد الائتمان بنجاح");
      refetchCreditInfo();
    },
    onError: (error) => {
      toast.error("فشل تحديث حد الائتمان: " + error.message);
    },
    onSettled: () => setIsSaving(false),
  });

  useEffect(() => {
    if (paymentModeData) {
      setPaymentMode(paymentModeData.mode || "postpaid");
    }
  }, [paymentModeData]);

  useEffect(() => {
    if (creditInfo) {
      setCreditLimit(creditInfo.creditLimit?.toString() || "");
      setAutoDisconnect(creditInfo.autoDisconnect ?? true);
    }
  }, [creditInfo]);

  const handleSavePaymentMode = async () => {
    if (!meterId) return;
    setIsSaving(true);
    await setPaymentModeMutation.mutateAsync({
      meterId,
      mode: paymentMode,
    });
  };

  const handleSaveCreditLimit = async () => {
    if (!meterId || !creditLimit || parseFloat(creditLimit) <= 0) {
      toast.error("الرجاء إدخال حد ائتمان صحيح");
      return;
    }
    setIsSaving(true);
    await setCreditLimitMutation.mutateAsync({
      meterId,
      creditLimit: parseFloat(creditLimit),
      autoDisconnect,
    });
  };

  const currentPageInfo = resolvePageInfo(useLocation()[0]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mr-2">جاري التحميل...</p>
      </div>
    );
  }

  if (!meterId || !meterData) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">العداد غير موجود</h1>
        <p className="text-muted-foreground">الرجاء التأكد من معرف العداد.</p>
        <Button onClick={() => setLocation("/dashboard/sts/meters")} className="mt-4">
          العودة إلى قائمة العدادات
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            إعدادات الدفع - عداد STS #{meterData.meterNumber}
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة نوع الدفع وحد الائتمان للعداد
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      <Tabs defaultValue="payment-mode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment-mode">
            <CreditCard className="h-4 w-4 ml-2" />
            نوع الدفع
          </TabsTrigger>
          <TabsTrigger value="credit-settings">
            <DollarSign className="h-4 w-4 ml-2" />
            إعدادات الائتمان
          </TabsTrigger>
          <TabsTrigger value="prepaid-balance">
            <Zap className="h-4 w-4 ml-2" />
            الرصيد المسبق
          </TabsTrigger>
        </TabsList>

        {/* Payment Mode Tab */}
        <TabsContent value="payment-mode">
          <Card>
            <CardHeader>
              <CardTitle>نوع الدفع</CardTitle>
              <CardDescription>
                اختر نوع الدفع للعداد: دفع آجل، دفع مسبق، أو ائتمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نوع الدفع الحالي</Label>
                <Select value={paymentMode} onValueChange={(value: any) => setPaymentMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postpaid">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>دفع آجل (Postpaid)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="prepaid">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>دفع مسبق (Prepaid)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="credit">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>ائتمان (Credit)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  <span className="font-medium">معلومات عن نوع الدفع:</span>
                </div>
                {paymentMode === "postpaid" && (
                  <p className="text-sm text-muted-foreground">
                    الدفع الآجل: يتم استهلاك الطاقة أولاً، ثم يتم إصدار فواتير شهرية للعميل.
                  </p>
                )}
                {paymentMode === "prepaid" && (
                  <p className="text-sm text-muted-foreground">
                    الدفع المسبق: العميل يشحن رصيداً (يولد كيلوهات)، ويستهلك من الكيلوهات المولدة.
                    <br />
                    <strong>ملاحظة:</strong> STS يولد كيلوهات وليس رصيد نقدي.
                  </p>
                )}
                {paymentMode === "credit" && (
                  <p className="text-sm text-muted-foreground">
                    الائتمان: العميل يضع تأمين، ويتم إصدار فواتير على أساس الدفع الآجل.
                    <br />
                    عند الوصول لحد الائتمان، يتم إطفاء العداد تلقائياً.
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePaymentMode} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      حفظ نوع الدفع
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit Settings Tab */}
        <TabsContent value="credit-settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الائتمان</CardTitle>
              <CardDescription>
                إعداد حد الائتمان والإطفاء التلقائي (لعدادات الائتمان فقط)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMode !== "credit" ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">نوع الدفع الحالي ليس ائتمان</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    يجب تغيير نوع الدفع إلى "ائتمان" أولاً لاستخدام هذه الإعدادات.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="credit-limit">حد الائتمان (ريال) *</Label>
                    <Input
                      id="credit-limit"
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      placeholder="500.00"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      الحد الأقصى للدين المسموح به قبل إطفاء العداد تلقائياً
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="auto-disconnect">الإطفاء التلقائي</Label>
                      <p className="text-xs text-muted-foreground">
                        إطفاء العداد تلقائياً عند الوصول لحد الائتمان
                      </p>
                    </div>
                    <Switch
                      id="auto-disconnect"
                      checked={autoDisconnect}
                      onCheckedChange={setAutoDisconnect}
                    />
                  </div>

                  {creditInfo && (
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">الدين الحالي:</span>
                        <Badge variant={creditInfo.currentDebt && creditInfo.currentDebt >= (creditInfo.creditLimit || 0) ? "destructive" : "default"}>
                          {creditInfo.currentDebt?.toFixed(2) || "0.00"} ر.س
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">حد الائتمان:</span>
                        <span className="text-sm">{creditInfo.creditLimit?.toFixed(2) || "0.00"} ر.س</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">المتبقي:</span>
                        <span className="text-sm">
                          {((creditInfo.creditLimit || 0) - (creditInfo.currentDebt || 0)).toFixed(2)} ر.س
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleSaveCreditLimit} disabled={isSaving || !creditLimit}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          حفظ إعدادات الائتمان
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prepaid Balance Tab */}
        <TabsContent value="prepaid-balance">
          <Card>
            <CardHeader>
              <CardTitle>الرصيد المسبق</CardTitle>
              <CardDescription>
                عرض الرصيد المتبقي (الكيلوهات) للعداد (لعدادات الدفع المسبق فقط)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMode !== "prepaid" ? (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">نوع الدفع الحالي ليس دفع مسبق</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    يجب تغيير نوع الدفع إلى "دفع مسبق" أولاً لعرض الرصيد.
                  </p>
                </div>
              ) : (
                <>
                  {prepaidBalance && (
                    <div className="bg-muted p-6 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">الكيلوهات المتبقية:</span>
                        <Badge variant="default" className="text-lg px-4 py-2">
                          {prepaidBalance.remainingKWH?.toFixed(2) || "0.00"} KWH
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">آخر شحن:</span>
                        <span className="text-sm">
                          {prepaidBalance.lastRechargeDate
                            ? new Date(prepaidBalance.lastRechargeDate).toLocaleDateString("ar-SA")
                            : "غير متاح"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">آخر كيلوهات مشحونة:</span>
                        <span className="text-sm">
                          {prepaidBalance.lastRechargeKWH?.toFixed(2) || "0.00"} KWH
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={() => refetchPrepaidBalance()} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      تحديث الرصيد
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

