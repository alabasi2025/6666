// client/src/pages/settings/PaymentGatewaysSettings.tsx
// صفحة إعدادات بوابات الدفع

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  TestTube,
  CheckCircle,
  XCircle,
  Save,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const PAYMENT_GATEWAYS_INFO = {
  title: "إعدادات بوابات الدفع",
  description: "إدارة وتكوين بوابات الدفع الإلكتروني.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: paymentGateways.gateways.list لجلب بوابات الدفع
   - عرض البوابات في جدول

2) إضافة بوابة دفع جديدة:
   - النقر على "إضافة بوابة"
   - اختيار نوع البوابة (credit_card, bank_transfer, wallet, crypto)
   - إدخال بيانات API (API Key, API Secret, Merchant ID)
   - إعداد Webhook Secret
   - اختيار وضع الاختبار (Test Mode)
   - حفظ التكوين

3) اختبار البوابة:
   - النقر على "اختبار" بجانب البوابة
   - التحقق من الاتصال مع API البوابة`,
  mechanism: `- استعلام tRPC: paymentGateways.gateways.list.useQuery()
- نموذج CRUD مع التحقق من البيانات
- اختبار الاتصال مع API البوابة`,
  relatedScreens: [
    { name: "المعاملات", path: "/dashboard/payment-gateways/transactions", description: "معاملات الدفع" },
    { name: "الإعدادات العامة", path: "/dashboard/settings", description: "الإعدادات العامة" },
  ],
  businessLogic: "بوابات الدفع تتيح قبول المدفوعات الإلكترونية من العملاء. يجب تكوين كل بوابة بشكل صحيح لضمان عملها.",
};

export default function PaymentGatewaysSettings() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [selectedGatewayType, setSelectedGatewayType] = useState<string>("");

  const businessId = useBusinessId();

  const [formData, setFormData] = useState({
    gatewayName: "",
    gatewayType: "credit_card" as const,
    apiKey: "",
    apiSecret: "",
    merchantId: "",
    webhookSecret: "",
    apiUrl: "",
    testMode: true,
    sandboxApiKey: "",
    sandboxApiSecret: "",
    description: "",
    isDefault: false,
  });

  // Fetch gateways
  const { data: gateways, isLoading, refetch } = trpc.developer.integrations.paymentGateways.gateways.list.useQuery({
    businessId,
  });

  // Create/Update mutation
  const configureMutation = trpc.developer.integrations.paymentGateways.gateways.configure.useMutation({
    onSuccess: () => {
      toast.success(editingGateway ? "تم تحديث البوابة بنجاح" : "تم إضافة البوابة بنجاح");
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في حفظ البوابة: " + error.message);
    },
  });

  // Test mutation
  const testMutation = trpc.developer.integrations.paymentGateways.gateways.test.useMutation({
    onSuccess: () => {
      toast.success("تم اختبار البوابة بنجاح");
    },
    onError: (error) => {
      toast.error("فشل في اختبار البوابة: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      gatewayName: "",
      gatewayType: "credit_card",
      apiKey: "",
      apiSecret: "",
      merchantId: "",
      webhookSecret: "",
      apiUrl: "",
      testMode: true,
      sandboxApiKey: "",
      sandboxApiSecret: "",
      description: "",
      isDefault: false,
    });
    setEditingGateway(null);
    setSelectedGatewayType("");
  };

  const handleEdit = (gateway: any) => {
    setEditingGateway(gateway);
    setFormData({
      gatewayName: gateway.gateway_name || "",
      gatewayType: gateway.gateway_type || "credit_card",
      apiKey: gateway.api_key || "",
      apiSecret: gateway.api_secret || "",
      merchantId: gateway.merchant_id || "",
      webhookSecret: gateway.webhook_secret || "",
      apiUrl: gateway.api_url || "",
      testMode: gateway.test_mode || false,
      sandboxApiKey: gateway.sandbox_api_key || "",
      sandboxApiSecret: gateway.sandbox_api_secret || "",
      description: gateway.description || "",
      isDefault: gateway.is_default || false,
    });
    setSelectedGatewayType(gateway.gateway_type || "credit_card");
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    configureMutation.mutate({
      businessId,
      ...formData,
    });
  };

  const handleTest = (gatewayId: number) => {
    testMutation.mutate({ gatewayId });
  };

  const getGatewayTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      credit_card: "بطاقة ائتمانية",
      bank_transfer: "تحويل بنكي",
      wallet: "محفظة إلكترونية",
      crypto: "عملة مشفرة",
      other: "أخرى",
    };
    return labels[type] || type;
  };

  const currentPageInfo = resolvePageInfo("/dashboard/settings/payment-gateways");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-blue-500" />
            إعدادات بوابات الدفع
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة وتكوين بوابات الدفع الإلكتروني
          </p>
        </div>
        <div className="flex gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة بوابة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingGateway ? "تعديل بوابة الدفع" : "إضافة بوابة دفع جديدة"}
                </DialogTitle>
                <DialogDescription>
                  قم بتكوين بوابة الدفع مع إدخال بيانات API المطلوبة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>اسم البوابة *</Label>
                    <Input
                      value={formData.gatewayName}
                      onChange={(e) => setFormData({ ...formData, gatewayName: e.target.value })}
                      placeholder="مثال: Moyasar"
                      required
                    />
                  </div>
                  <div>
                    <Label>نوع البوابة *</Label>
                    <Select
                      value={formData.gatewayType}
                      onValueChange={(value: any) => {
                        setFormData({ ...formData, gatewayType: value });
                        setSelectedGatewayType(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">بطاقة ائتمانية</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                        <SelectItem value="crypto">عملة مشفرة</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>رابط API</Label>
                  <Input
                    value={formData.apiUrl}
                    onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                    placeholder="https://api.example.com"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">بيانات API للإنتاج</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        placeholder="pk_live_..."
                      />
                    </div>
                    <div>
                      <Label>API Secret</Label>
                      <Input
                        type="password"
                        value={formData.apiSecret}
                        onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                        placeholder="sk_live_..."
                      />
                    </div>
                    <div>
                      <Label>Merchant ID</Label>
                      <Input
                        value={formData.merchantId}
                        onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                        placeholder="merchant_..."
                      />
                    </div>
                    <div>
                      <Label>Webhook Secret</Label>
                      <Input
                        type="password"
                        value={formData.webhookSecret}
                        onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                        placeholder="whsec_..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={formData.testMode}
                    onChange={(e) => setFormData({ ...formData, testMode: e.target.checked })}
                  />
                  <Label htmlFor="testMode">وضع الاختبار (Test Mode)</Label>
                </div>

                {formData.testMode && (
                  <div className="space-y-2 border p-4 rounded-lg">
                    <h3 className="font-semibold">بيانات API للاختبار (Sandbox)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Sandbox API Key</Label>
                        <Input
                          type="password"
                          value={formData.sandboxApiKey}
                          onChange={(e) => setFormData({ ...formData, sandboxApiKey: e.target.value })}
                          placeholder="pk_test_..."
                        />
                      </div>
                      <div>
                        <Label>Sandbox API Secret</Label>
                        <Input
                          type="password"
                          value={formData.sandboxApiSecret}
                          onChange={(e) => setFormData({ ...formData, sandboxApiSecret: e.target.value })}
                          placeholder="sk_test_..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>الوصف</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف البوابة..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  />
                  <Label htmlFor="isDefault">البوابة الافتراضية</Label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={configureMutation.isLoading}>
                    {configureMutation.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        حفظ
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Gateways List */}
      <Card>
        <CardHeader>
          <CardTitle>بوابات الدفع</CardTitle>
          <CardDescription>قائمة بوابات الدفع المكونة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الوضع</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gateways?.map((gateway: any) => (
                  <TableRow key={gateway.id}>
                    <TableCell className="font-medium">{gateway.gateway_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getGatewayTypeLabel(gateway.gateway_type)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={gateway.is_active ? "default" : "secondary"}>
                        {gateway.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            غير نشط
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={gateway.test_mode ? "outline" : "default"}>
                        {gateway.test_mode ? "اختبار" : "إنتاج"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(gateway.id)}
                          disabled={testMutation.isLoading}
                        >
                          <TestTube className="w-4 h-4 mr-1" />
                          اختبار
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(gateway)}>
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
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

