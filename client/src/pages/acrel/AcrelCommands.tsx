/**
 * ACREL Commands - إرسال أوامر التحكم لعدادات ACREL
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Power,
  PowerOff,
  DollarSign,
  Settings,
  Send,
  History,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const ACREL_COMMANDS_INFO = {
  title: "أوامر التحكم ACREL",
  description: "إرسال أوامر التحكم المباشرة لعدادات ACREL",
  process: `1) اختيار العداد
2) اختيار نوع الأمر
3) إدخال البارامترات (إن وُجدت)
4) معاينة الأمر
5) إرسال وتأكيد`,
  mechanism: `- استدعاء API مباشر عبر acrelService
- تسجيل جميع الأوامر في acrel_command_logs
- معالجة الأخطاء والإعادة`,
  relatedScreens: [
    { name: "سجل الأوامر", path: "/dashboard/acrel/command-history", description: "عرض سجل جميع الأوامر" },
    { name: "إدارة العدادات", path: "/dashboard/acrel/meters", description: "العودة لقائمة العدادات" },
  ],
  businessLogic: "الأوامر تُرسل فوراً للعداد عبر API. يتم تسجيل الأمر والرد في قاعدة البيانات.",
};

type CommandType =
  | "disconnect"
  | "reconnect"
  | "set_tariff"
  | "recharge"
  | "set_credit_limit"
  | "set_payment_mode"
  | "configure_wifi"
  | "enable_mqtt"
  | "configure_ct";

export default function AcrelCommands() {
  const { toast } = useToast();
  const businessId = useBusinessId();
  const [selectedMeterId, setSelectedMeterId] = useState<number | null>(null);
  const [commandType, setCommandType] = useState<CommandType>("disconnect");
  const [parameters, setParameters] = useState<any>({});

  // Fetch meters
  const { data: meters } = trpc.developer.integrations.acrel.meters.list.useQuery({
    businessId,
  });

  // Mutations
  const disconnectMutation = trpc.developer.integrations.acrel.meters.disconnect.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم فصل العداد بنجاح" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const reconnectMutation = trpc.developer.integrations.acrel.meters.reconnect.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم إعادة توصيل العداد بنجاح" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const rechargeMutation = trpc.developer.integrations.acrel.payment.recharge.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم شحن الرصيد بنجاح" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const setCreditLimitMutation = trpc.developer.integrations.acrel.payment.setCreditLimit.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم تعيين حد الائتمان بنجاح" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setSelectedMeterId(null);
    setCommandType("disconnect");
    setParameters({});
  };

  const handleSendCommand = async () => {
    if (!selectedMeterId) {
      toast({ title: "خطأ", description: "يرجى اختيار العداد", variant: "destructive" });
      return;
    }

    try {
      switch (commandType) {
        case "disconnect":
          await disconnectMutation.mutateAsync({
            meterId: selectedMeterId,
            reason: parameters.reason || "تعليق بناءً على طلب",
          });
          break;

        case "reconnect":
          await reconnectMutation.mutateAsync({
            meterId: selectedMeterId,
          });
          break;

        case "recharge":
          await rechargeMutation.mutateAsync({
            meterId: selectedMeterId,
            amount: parseFloat(parameters.amount || 0),
          });
          break;

        case "set_credit_limit":
          await setCreditLimitMutation.mutateAsync({
            meterId: selectedMeterId,
            creditLimit: parseFloat(parameters.creditLimit || 0),
            autoDisconnect: parameters.autoDisconnect !== false,
          });
          break;

        default:
          toast({ title: "خطأ", description: "نوع الأمر غير مدعوم حالياً", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Command failed:", error);
    }
  };

  const pageInfo = resolvePageInfo("/dashboard/acrel/commands");
  const isPending =
    disconnectMutation.isPending ||
    reconnectMutation.isPending ||
    rechargeMutation.isPending ||
    setCreditLimitMutation.isPending;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            أوامر التحكم ACREL
          </h1>
          <p className="text-muted-foreground mt-2">
            إرسال أوامر التحكم المباشرة لعدادات ACREL IoT
          </p>
        </div>
        <EngineInfoDialog info={pageInfo || ACREL_COMMANDS_INFO} />
      </div>

      {/* Command Form */}
      <Card>
        <CardHeader>
          <CardTitle>إرسال أمر جديد</CardTitle>
          <CardDescription>اختر العداد ونوع الأمر والبارامترات المطلوبة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select Meter */}
          <div className="space-y-2">
            <Label>اختر العداد *</Label>
            <Select
              value={selectedMeterId?.toString() || ""}
              onValueChange={(v) => setSelectedMeterId(v ? parseInt(v) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر عداد ACREL" />
              </SelectTrigger>
              <SelectContent>
                {meters?.map((meter: any) => (
                  <SelectItem key={meter.id} value={meter.id.toString()}>
                    {meter.acrel_meter_id || meter.meter_number} ({meter.meter_type}) -{" "}
                    <span className={meter.status === "online" ? "text-green-600" : "text-red-600"}>
                      {meter.status === "online" ? "متصل" : "غير متصل"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Command Type */}
          <div className="space-y-2">
            <Label>نوع الأمر *</Label>
            <Select
              value={commandType}
              onValueChange={(v) => {
                setCommandType(v as CommandType);
                setParameters({});
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disconnect">
                  <div className="flex items-center gap-2">
                    <PowerOff className="h-4 w-4 text-red-500" />
                    فصل العداد
                  </div>
                </SelectItem>
                <SelectItem value="reconnect">
                  <div className="flex items-center gap-2">
                    <Power className="h-4 w-4 text-green-500" />
                    إعادة التوصيل
                  </div>
                </SelectItem>
                <SelectItem value="recharge">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-500" />
                    شحن الرصيد
                  </div>
                </SelectItem>
                <SelectItem value="set_credit_limit">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-500" />
                    تعيين حد الائتمان
                  </div>
                </SelectItem>
                <SelectItem value="set_tariff">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    تغيير التعرفة
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Command Parameters */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">البارامترات</Label>

            {commandType === "disconnect" && (
              <div className="space-y-2">
                <Label>سبب الفصل (اختياري)</Label>
                <Textarea
                  value={parameters.reason || ""}
                  onChange={(e) => setParameters({ ...parameters, reason: e.target.value })}
                  placeholder="مثال: تأخر في السداد، صيانة، إلخ"
                  rows={3}
                />
              </div>
            )}

            {commandType === "reconnect" && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 inline mr-1 text-green-500" />
                  لا توجد بارامترات مطلوبة. سيتم إعادة توصيل العداد فوراً.
                </p>
              </div>
            )}

            {commandType === "recharge" && (
              <div className="space-y-2">
                <Label>المبلغ (ريال) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={parameters.amount || ""}
                  onChange={(e) => setParameters({ ...parameters, amount: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم إضافة هذا المبلغ لرصيد العداد
                </p>
              </div>
            )}

            {commandType === "set_credit_limit" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>حد الائتمان الأقصى (ريال) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={parameters.creditLimit || ""}
                    onChange={(e) => setParameters({ ...parameters, creditLimit: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoDisconnect"
                    checked={parameters.autoDisconnect !== false}
                    onChange={(e) => setParameters({ ...parameters, autoDisconnect: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="autoDisconnect" className="cursor-pointer">
                    فصل تلقائي عند الوصول للحد
                  </Label>
                </div>
              </div>
            )}

            {commandType === "set_tariff" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-blue-500" />
                  استخدم صفحة "التعرفات المتعددة" لإعداد جدول التعرفات المتقدم
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={resetForm}>
              إلغاء
            </Button>
            <Button onClick={handleSendCommand} disabled={!selectedMeterId || isPending}>
              {isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  إرسال الأمر
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Commands */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              آخر الأوامر المرسلة
            </CardTitle>
            <Button variant="outline" size="sm">
              عرض جميع الأوامر
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>قريباً - سيتم عرض سجل الأوامر هنا</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
