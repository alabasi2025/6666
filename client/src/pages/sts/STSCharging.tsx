import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const STS_CHARGING_INFO = {
  title: "شحن رصيد عدادات STS",
  description: "شحن رصيد عدادات STS وإنشاء التوكنات.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: sts.charging.list لجلب طلبات الشحن
   - عرض الطلبات في جدول مع الحالة

2) إنشاء طلب شحن جديد:
   - اختيار العداد STS
   - إدخال المبلغ المطلوب شحنه
   - اختيار طريقة الدفع (إن وُجدت)
   - حفظ الطلب عبر tRPC: sts.charging.createCharge

3) الحصول على التوكن:
   - بعد إنشاء الطلب، يتم إنشاء التوكن تلقائياً
   - عرض التوكن في واجهة مناسبة
   - إمكانية إرسال التوكن عبر SMS/Email/WhatsApp

4) التحقق من حالة الشحن:
   - النقر على "التحقق" للتحقق من حالة الطلب
   - تحديث الحالة بناءً على استجابة API`,
  mechanism: `- استعلام tRPC: sts.charging.createCharge.useMutation()
- توليد رقم طلب فريد
- استدعاء API مقدم الخدمة لإنشاء التوكن
- حفظ التوكن في قاعدة البيانات
- إرسال التوكن للعميل`,
  relatedScreens: [
    { name: "إدارة عدادات STS", path: "/dashboard/sts/meters", description: "إدارة العدادات - يجب أن يكون العداد مسجل قبل الشحن" },
    { name: "التوكنات", path: "/dashboard/sts/tokens", description: "عرض جميع التوكنات المُنشأة" },
    { name: "إعدادات API", path: "/dashboard/sts/integration", description: "إعدادات التكامل مع API مقدم الخدمة" },
  ],
  businessLogic: "شحن رصيد عداد STS يتم عن طريق إنشاء توكن يحتوي على المبلغ المشحون. العميل يستخدم التوكن لشحن العداد.",
};

export default function STSCharging() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);
  const [chargeAmount, setChargeAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const businessId = 1; // TODO: Get from context

  // Get meterId from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const meterId = params.get("meterId");
    if (meterId) {
      setSelectedMeterId(parseInt(meterId));
    }
  }, [location]);

  // Fetch STS meters
  const { data: metersData } = trpc.sts.meters.list.useQuery({
    businessId,
    status: "active",
  });

  // Fetch charge requests
  const { data, isLoading, refetch } = trpc.sts.charging.list.useQuery({
    businessId,
    stsMeterId: selectedMeterId || undefined,
  });

  // Create charge mutation
  const createChargeMutation = trpc.sts.charging.createCharge.useMutation({
    onSuccess: (result) => {
      toast.success("تم إنشاء طلب الشحن بنجاح");
      setChargeAmount("");
      setPaymentMethod("");
      refetch();
      // Navigate to token view
      if (result.id) {
        // TODO: Show token dialog or navigate to token page
      }
    },
    onError: (error) => {
      toast.error("فشل في إنشاء طلب الشحن: " + error.message);
    },
  });

  // Verify charge mutation
  const verifyChargeMutation = trpc.sts.charging.verifyCharge.useMutation({
    onSuccess: () => {
      toast.success("تم التحقق من حالة الشحن");
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في التحقق: " + error.message);
    },
  });

  const handleCreateCharge = () => {
    if (!selectedMeterId || !chargeAmount || parseFloat(chargeAmount) <= 0) {
      toast.error("الرجاء إدخال المبلغ بشكل صحيح");
      return;
    }

    // Get customer ID from selected meter
    const selectedMeter = metersData?.meters?.find((m: any) => m.id === selectedMeterId);
    if (!selectedMeter) {
      toast.error("العداد المحدد غير موجود");
      return;
    }

    createChargeMutation.mutate({
      businessId,
      customerId: selectedMeter.customer_id,
      stsMeterId: selectedMeterId,
      amount: parseFloat(chargeAmount),
      paymentMethod: paymentMethod || undefined,
    });
  };

  const handleVerify = (chargeRequestId: number) => {
    verifyChargeMutation.mutate({ chargeRequestId });
  };

  const currentPageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-green-500" />
            شحن رصيد عدادات STS
          </h1>
          <p className="text-muted-foreground mt-2">
            شحن رصيد عدادات STS وإنشاء التوكنات
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      {/* Create Charge Form */}
      <Card>
        <CardHeader>
          <CardTitle>إنشاء طلب شحن جديد</CardTitle>
          <CardDescription>
            اختر العداد وأدخل المبلغ المطلوب شحنه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>اختر العداد STS</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={selectedMeterId || ""}
                onChange={(e) => setSelectedMeterId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">اختر العداد</option>
                {metersData?.meters?.map((meter: any) => (
                  <option key={meter.id} value={meter.id}>
                    {meter.sts_meter_number} - {meter.customer_name || "غير مرتبط"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>المبلغ (ر.س)</Label>
              <Input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>طريقة الدفع</Label>
              <Input
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="نقد/تحويل/بطاقة"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleCreateCharge}
              disabled={createChargeMutation.isLoading || !selectedMeterId || !chargeAmount}
            >
              {createChargeMutation.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  إنشاء طلب الشحن
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charge Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الشحن</CardTitle>
          <CardDescription>
            قائمة بجميع طلبات الشحن
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>العداد</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.requests?.map((request: any) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.request_number}</TableCell>
                    <TableCell>{request.customer_name || "-"}</TableCell>
                    <TableCell>{request.sts_meter_number || "-"}</TableCell>
                    <TableCell>{parseFloat(request.amount || 0).toFixed(2)} ر.س</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "failed"
                            ? "destructive"
                            : request.status === "processing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {request.status === "pending" && "قيد الانتظار"}
                        {request.status === "processing" && "قيد المعالجة"}
                        {request.status === "completed" && "مكتمل"}
                        {request.status === "failed" && "فشل"}
                        {request.status === "cancelled" && "ملغى"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === "pending" || request.status === "processing" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerify(request.id)}
                            disabled={verifyChargeMutation.isLoading}
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            التحقق
                          </Button>
                        ) : request.status === "completed" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/dashboard/sts/tokens?chargeRequestId=${request.id}`)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            عرض التوكن
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

