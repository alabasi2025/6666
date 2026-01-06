/**
 * شاشة محرك التسعير
 * Pricing Engine Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, Edit, Trash2, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";
import CreateRuleForm from "@/components/engines/CreateRuleForm";

const PRICING_ENGINE_INFO: EngineInfo = {
  title: "محرك التسعير المرن",
  description: "إدارة قواعد التسعير الديناميكية للعدادات والاشتراكات",
  process: `هذه الشاشة تتيح للمستخدم:
- حساب السعر بناءً على نوع العداد ونوع الاستخدام
- عرض جميع قواعد التسعير المحددة في النظام
- إضافة قواعد تسعير جديدة
- تعديل وحذف قواعد التسعير الموجودة
- تفعيل أو تعطيل قواعد التسعير`,
  mechanism: `1. عند تحميل الصفحة، يتم جلب قواعد التسعير من قاعدة البيانات
2. يمكن للمستخدم اختيار نوع العداد (تقليدي، STS، IoT) ونوع الاستخدام (سكني، تجاري، صناعي)
3. عند النقر على "احسب السعر"، يتم البحث عن قاعدة التسعير المناسبة وحساب السعر
4. يتم عرض النتيجة مع تفاصيل رسوم الاشتراك ومبلغ التأمين
5. يمكن للمستخدم إضافة قواعد جديدة من خلال النقر على "إضافة قاعدة تسعير"
6. يتم حفظ القاعدة في قاعدة البيانات وتحديث القائمة تلقائياً`,
  relatedScreens: [
    {
      name: "العملاء والاشتراكات",
      path: "/dashboard/customers/subscriptions",
      description: "عرض الاشتراكات التي تستخدم قواعد التسعير"
    },
    {
      name: "الفواتير",
      path: "/dashboard/customers/invoices",
      description: "عرض الفواتير التي تم حسابها بناءً على قواعد التسعير"
    },
    {
      name: "العدادات",
      path: "/dashboard/customers/meters",
      description: "عرض أنواع العدادات المختلفة"
    }
  ],
  businessLogic: `محرك التسعير المرن يعمل كالتالي:
1. عند حساب السعر:
   - يتم البحث عن قاعدة التسعير المناسبة بناءً على نوع العداد ونوع الاستخدام
   - إذا وُجدت قاعدة نشطة، يتم استخدامها لحساب السعر
   - إذا لم توجد قاعدة، يتم استخدام القيم الافتراضية

2. قواعد التسعير:
   - كل قاعدة تحدد رسوم الاشتراك ومبلغ التأمين (إن وجد)
   - يمكن تفعيل أو تعطيل القاعدة حسب الحاجة
   - يمكن تحديد ملاحظات لكل قاعدة

3. حساب السعر النهائي:
   - رسوم الاشتراك (إجباري)
   - مبلغ التأمين (إذا كان مطلوباً)
   - المجموع = رسوم الاشتراك + مبلغ التأمين

4. يتم استخدام هذه القواعد تلقائياً عند:
   - إنشاء اشتراك جديد
   - تجديد اشتراك
   - ترقية اشتراك
   - إنشاء فاتورة`
};

export default function PricingEngine() {
  const { toast } = useToast();
  const [businessId] = useState(1);
  const [meterType, setMeterType] = useState<"traditional" | "sts" | "iot">("sts");
  const [usageType, setUsageType] = useState<"residential" | "commercial" | "industrial">("residential");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // جلب قواعد التسعير
  const { data: rules, refetch: refetchRules } = trpc.pricing.rules.list.useQuery({
    businessId,
    activeOnly: false,
  });

  // حساب السعر
  const { data: calculatedPrice, refetch: calculatePrice } = trpc.pricing.calculate.useQuery(
    {
      businessId,
      meterType,
      usageType,
    },
    {
      enabled: false,
    }
  );

  // إنشاء قاعدة جديدة
  const createRule = trpc.pricing.rules.create.useMutation({
    onSuccess: () => {
      toast({
        title: "نجح",
        description: "تم إنشاء قاعدة التسعير بنجاح",
      });
      setIsCreateDialogOpen(false);
      refetchRules();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // حذف قاعدة (سيتم إضافتها لاحقاً في API)
  const deleteRule = {
    mutate: (data: { id: number }) => {
      toast({
        title: "قريباً",
        description: "ميزة الحذف قيد التطوير",
      });
    },
  };

  const handleCalculate = () => {
    calculatePrice();
  };

  const handleCreateRule = (data: any) => {
    createRule.mutate({
      businessId,
      ...data,
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-500" />
            محرك التسعير المرن
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة قواعد التسعير الديناميكية للعدادات والاشتراكات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EngineInfoDialog info={PRICING_ENGINE_INFO} />
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                إضافة قاعدة تسعير
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة قاعدة تسعير جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات قاعدة التسعير الجديدة
                </DialogDescription>
              </DialogHeader>
              <CreateRuleForm onSubmit={handleCreateRule} />
            </DialogContent>
          </Dialog>
        </div>

      </div>

      {/* حاسبة السعر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            حاسبة السعر
          </CardTitle>
          <CardDescription>احسب السعر بناءً على نوع العداد ونوع الاستخدام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>نوع العداد</Label>
              <Select value={meterType} onValueChange={(v: any) => setMeterType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="traditional">تقليدي</SelectItem>
                  <SelectItem value="sts">STS</SelectItem>
                  <SelectItem value="iot">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع الاستخدام</Label>
              <Select value={usageType} onValueChange={(v: any) => setUsageType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleCalculate} className="w-full">
                احسب السعر
              </Button>
            </div>
          </div>

          {calculatedPrice && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <h3 className="font-semibold mb-3">نتيجة الحساب:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رسوم الاشتراك</p>
                  <p className="text-2xl font-bold">{calculatedPrice.subscriptionFee} ريال</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ التأمين</p>
                  <p className="text-2xl font-bold">
                    {calculatedPrice.depositRequired ? `${calculatedPrice.depositAmount} ريال` : "غير مطلوب"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">المجموع</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {calculatedPrice.subscriptionFee + (calculatedPrice.depositRequired ? calculatedPrice.depositAmount : 0)} ريال
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* قائمة قواعد التسعير */}
      <Card>
        <CardHeader>
          <CardTitle>قواعد التسعير</CardTitle>
          <CardDescription>جميع قواعد التسعير المحددة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع العداد</TableHead>
                <TableHead>نوع الاستخدام</TableHead>
                <TableHead>رسوم الاشتراك</TableHead>
                <TableHead>مبلغ التأمين</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {rule.meterType === "traditional" ? "تقليدي" : rule.meterType === "sts" ? "STS" : "IoT"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rule.usageType === "residential" ? "سكني" : rule.usageType === "commercial" ? "تجاري" : "صناعي"}
                  </TableCell>
                  <TableCell>{rule.subscriptionFee} ريال</TableCell>
                  <TableCell>
                    {rule.depositRequired ? `${rule.depositAmount} ريال` : "غير مطلوب"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRule.mutate({ id: rule.id })}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!rules || rules.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    لا توجد قواعد تسعير
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

