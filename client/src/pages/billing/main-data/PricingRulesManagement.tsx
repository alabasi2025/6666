import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Search, RefreshCw, DollarSign, Plus, X, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PricingRule {
  id: number;
  businessId: number;
  meterType: "traditional" | "sts" | "iot";
  usageType: "residential" | "commercial" | "industrial";
  subscriptionFee: number;
  depositAmount: number;
  depositRequired: boolean;
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PricingRulesManagement() {
  const { toast } = useToast();
  const businessId = useBusinessId();
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMeterType, setFilterMeterType] = useState<string>("all");
  const [filterUsageType, setFilterUsageType] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    meterType: "traditional" as "traditional" | "sts" | "iot",
    usageType: "residential" as "residential" | "commercial" | "industrial",
    subscriptionFee: "",
    depositAmount: "",
    depositRequired: true,
    notes: "",
  });

  const rulesQuery = trpc.pricing.rules.list.useQuery(
    { businessId, activeOnly: filterActive !== null ? filterActive : true },
    { enabled: !!businessId }
  );
  const createRuleMutation = trpc.pricing.rules.create.useMutation();
  const updateRuleMutation = trpc.pricing.rules.update.useMutation();
  const deleteRuleMutation = trpc.pricing.rules.delete.useMutation();
  const calculateQuery = trpc.pricing.calculate.useQuery(
    {
      businessId: businessId || 1,
      meterType: formData.meterType,
      usageType: formData.usageType,
    },
    { enabled: false }
  );

  useEffect(() => {
    if (rulesQuery.data) {
      setRules(rulesQuery.data as PricingRule[]);
    }
  }, [rulesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) {
      toast({
        title: "خطأ",
        description: "يجب تحديد الشركة أولاً",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        businessId,
        meterType: formData.meterType,
        usageType: formData.usageType,
        subscriptionFee: parseFloat(formData.subscriptionFee) || 0,
        depositAmount: parseFloat(formData.depositAmount) || 0,
        depositRequired: formData.depositRequired,
        notes: formData.notes || undefined,
      };

      if (editingRule) {
        await updateRuleMutation.mutateAsync({
          id: editingRule.id,
          ...data,
        } as any);
        toast({
          title: "نجح",
          description: "تم تحديث قاعدة التسعير بنجاح",
        });
      } else {
        await createRuleMutation.mutateAsync(data as any);
        toast({
          title: "نجح",
          description: "تم إنشاء قاعدة التسعير بنجاح",
        });
      }
      rulesQuery.refetch();
      resetForm();
      setShowDialog(false);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حفظ قاعدة التسعير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف قاعدة التسعير هذه؟")) return;

    try {
      await deleteRuleMutation.mutateAsync({ id });
      toast({
        title: "نجح",
        description: "تم حذف قاعدة التسعير بنجاح",
      });
      rulesQuery.refetch();
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حذف قاعدة التسعير",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      meterType: rule.meterType,
      usageType: rule.usageType,
      subscriptionFee: rule.subscriptionFee.toString(),
      depositAmount: rule.depositAmount.toString(),
      depositRequired: rule.depositRequired,
      notes: rule.notes || "",
    });
    setShowDialog(true);
  };

  const handleCalculate = async () => {
    if (!businessId) {
      toast({
        title: "خطأ",
        description: "يجب تحديد الشركة أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await calculateQuery.refetch();
      setCalculationResult(result.data);
      setShowCalculateDialog(true);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في حساب التسعير",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      meterType: "traditional",
      usageType: "residential",
      subscriptionFee: "",
      depositAmount: "",
      depositRequired: true,
      notes: "",
    });
    setEditingRule(null);
  };

  const filteredRules = rules.filter((rule) => {
    const matchesMeterType = filterMeterType === "all" || rule.meterType === filterMeterType;
    const matchesUsageType = filterUsageType === "all" || rule.usageType === filterUsageType;
    const matchesActive = filterActive === null || rule.active === filterActive;
    return matchesMeterType && matchesUsageType && matchesActive;
  });

  const getMeterTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      traditional: "تقليدي",
      sts: "STS",
      iot: "IoT",
    };
    return labels[type] || type;
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      residential: "سكني",
      commercial: "تجاري",
      industrial: "صناعي",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">قواعد التسعير</h1>
          <p className="text-muted-foreground">إدارة قواعد التسعير للاشتراكات والعدادات</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowCalculateDialog(false);
              setCalculationResult(null);
              setFormData({
                meterType: "traditional",
                usageType: "residential",
                subscriptionFee: "",
                depositAmount: "",
                depositRequired: true,
                notes: "",
              });
              handleCalculate();
            }}
          >
            <Calculator className="h-4 w-4 ml-2" />
            حساب التسعير
          </Button>
          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة قاعدة جديدة
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>نوع العداد</Label>
              <Select value={filterMeterType} onValueChange={setFilterMeterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="traditional">تقليدي</SelectItem>
                  <SelectItem value="sts">STS</SelectItem>
                  <SelectItem value="iot">IoT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع الاستخدام</Label>
              <Select value={filterUsageType} onValueChange={setFilterUsageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="residential">سكني</SelectItem>
                  <SelectItem value="commercial">تجاري</SelectItem>
                  <SelectItem value="industrial">صناعي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select
                value={filterActive === null ? "all" : filterActive ? "active" : "inactive"}
                onValueChange={(value) => {
                  setFilterActive(value === "all" ? null : value === "active");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قواعد التسعير ({filteredRules.length})</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rulesQuery.refetch()}
              disabled={rulesQuery.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${rulesQuery.isLoading ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rulesQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
            </div>
          ) : rulesQuery.error ? (
            <div className="text-center py-8">
              <p className="text-destructive font-semibold mb-2">حدث خطأ أثناء جلب البيانات</p>
              <p className="text-muted-foreground text-sm">{rulesQuery.error.message}</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-semibold mb-2">لا توجد قواعد تسعير</p>
              <p className="text-sm">يمكنك إضافة قاعدة تسعير جديدة</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع العداد</TableHead>
                  <TableHead>نوع الاستخدام</TableHead>
                  <TableHead>رسم الاشتراك</TableHead>
                  <TableHead>التأمين</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.map((rule) => {
                  const total = rule.subscriptionFee + (rule.depositRequired ? rule.depositAmount : 0);
                  return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">
                        {getMeterTypeLabel(rule.meterType)}
                      </TableCell>
                      <TableCell>{getUsageTypeLabel(rule.usageType)}</TableCell>
                      <TableCell>{rule.subscriptionFee.toLocaleString()} ر.س</TableCell>
                      <TableCell>
                        {rule.depositRequired ? `${rule.depositAmount.toLocaleString()} ر.س` : "-"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {total.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        {rule.active ? (
                          <Badge className="bg-green-500">نشط</Badge>
                        ) : (
                          <Badge variant="secondary">غير نشط</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "تعديل قاعدة التسعير" : "إضافة قاعدة تسعير جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>نوع العداد *</Label>
                <Select
                  value={formData.meterType}
                  onValueChange={(value: any) => setFormData({ ...formData, meterType: value })}
                >
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
                <Label>نوع الاستخدام *</Label>
                <Select
                  value={formData.usageType}
                  onValueChange={(value: any) => setFormData({ ...formData, usageType: value })}
                >
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>رسم الاشتراك (ريال) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.subscriptionFee}
                  onChange={(e) => setFormData({ ...formData, subscriptionFee: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>التأمين (ريال)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                  disabled={formData.meterType === "sts"}
                />
                {formData.meterType === "sts" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    STS لا يحتاج تأمين
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="depositRequired"
                checked={formData.depositRequired && formData.meterType !== "sts"}
                onCheckedChange={(checked) => setFormData({ ...formData, depositRequired: checked })}
                disabled={formData.meterType === "sts"}
              />
              <Label htmlFor="depositRequired">التأمين مطلوب</Label>
            </div>

            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                إلغاء
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "جاري الحفظ..." : editingRule ? "تحديث" : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Calculate Pricing Dialog */}
      <Dialog open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حساب التسعير</DialogTitle>
          </DialogHeader>
          {calculationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع العداد</Label>
                  <p className="font-semibold">{getMeterTypeLabel(formData.meterType)}</p>
                </div>
                <div>
                  <Label>نوع الاستخدام</Label>
                  <p className="font-semibold">{getUsageTypeLabel(formData.usageType)}</p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>رسم الاشتراك:</span>
                  <span className="font-semibold">{calculationResult.subscriptionFee?.toLocaleString()} ر.س</span>
                </div>
                {calculationResult.depositRequired && (
                  <div className="flex justify-between">
                    <span>التأمين:</span>
                    <span className="font-semibold">{calculationResult.depositAmount?.toLocaleString()} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>الإجمالي:</span>
                  <span>{calculationResult.total?.toLocaleString()} ر.س</span>
                </div>
              </div>
              {calculationResult.ruleId && (
                <p className="text-sm text-muted-foreground">
                  تم الحساب بناءً على قاعدة التسعير رقم {calculationResult.ruleId}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowCalculateDialog(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
