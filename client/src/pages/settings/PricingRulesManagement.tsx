/**
 * إدارة قواعد التسعير
 * Pricing Rules Management
 * 
 * واجهة شاملة لإدارة قواعد التسعير للاشتراكات والعدادات
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";
import { 
  Plus, Edit, Trash2, DollarSign, Loader2, History,
  Zap, Home, Building2, Factory
} from "lucide-react";

interface PricingRule {
  id: number;
  meterType: "traditional" | "sts" | "iot";
  usageType: "residential" | "commercial" | "industrial";
  subscriptionFee: number;
  depositAmount: number;
  depositRequired: boolean;
  active: boolean;
  notes?: string;
  createdAt: Date;
}

export default function PricingRulesManagement() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = useBusinessId();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [newRule, setNewRule] = useState({
    meterType: "traditional" as const,
    usageType: "residential" as const,
    subscriptionFee: 5000,
    depositAmount: 35000,
    depositRequired: true,
    notes: "",
  });
  
  const { data: rules, isLoading, refetch } = trpc.pricing.rules.list.useQuery({ businessId });
  
  const createMutation = trpc.pricing.rules.create.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم إنشاء قاعدة التسعير بنجاح" });
      refetch();
      setShowCreateDialog(false);
      setNewRule({
        meterType: "traditional",
        usageType: "residential",
        subscriptionFee: 5000,
        depositAmount: 35000,
        depositRequired: true,
        notes: "",
      });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const updateMutation = trpc.pricing.rules.update.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم تحديث قاعدة التسعير بنجاح" });
      refetch();
      setShowEditDialog(false);
      setEditingRule(null);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteMutation = trpc.pricing.rules.delete.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم حذف قاعدة التسعير بنجاح" });
      refetch();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId,
      ...newRule,
      createdBy: 1, // TODO: Get from context
    });
  };
  
  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setShowEditDialog(true);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    
    updateMutation.mutate({
      id: editingRule.id,
      subscriptionFee: editingRule.subscriptionFee,
      depositAmount: editingRule.depositAmount,
      depositRequired: editingRule.depositRequired,
      active: editingRule.active,
      notes: editingRule.notes,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه القاعدة؟")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const getMeterTypeLabel = (type: string) => {
    const labels = {
      traditional: "تقليدي",
      sts: "STS",
      iot: "IoT ذكي",
    };
    return labels[type as keyof typeof labels] || type;
  };
  
  const getUsageTypeLabel = (type: string) => {
    const labels = {
      residential: "سكني",
      commercial: "تجاري",
      industrial: "صناعي",
    };
    return labels[type as keyof typeof labels] || type;
  };
  
  const getUsageTypeIcon = (type: string) => {
    const icons = {
      residential: <Home className="w-4 h-4" />,
      commercial: <Building2 className="w-4 h-4" />,
      industrial: <Factory className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || null;
  };
  
  const currentPageInfo = resolvePageInfo(location);
  
  // Group rules by meter type
  const groupedRules = rules?.reduce((acc: any, rule: any) => {
    if (!acc[rule.meterType]) {
      acc[rule.meterType] = [];
    }
    acc[rule.meterType].push(rule);
    return acc;
  }, {});
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة قواعد التسعير</h1>
          <p className="text-muted-foreground mt-2">
            تحديد أسعار الاشتراكات والتأمينات حسب نوع العداد ونوع الاستخدام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة قاعدة جديدة
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="traditional" className="space-y-4">
          <TabsList>
            <TabsTrigger value="traditional">
              <Zap className="w-4 h-4 ml-2" />
              تقليدي
            </TabsTrigger>
            <TabsTrigger value="sts">
              <Zap className="w-4 h-4 ml-2" />
              STS
            </TabsTrigger>
            <TabsTrigger value="iot">
              <Zap className="w-4 h-4 ml-2" />
              IoT ذكي
            </TabsTrigger>
          </TabsList>
          
          {["traditional", "sts", "iot"].map((meterType) => (
            <TabsContent key={meterType} value={meterType}>
              <Card>
                <CardHeader>
                  <CardTitle>قواعد التسعير - {getMeterTypeLabel(meterType)}</CardTitle>
                  <CardDescription>
                    أسعار الاشتراك والتأمين للعدادات من نوع {getMeterTypeLabel(meterType)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>نوع الاستخدام</TableHead>
                        <TableHead>رسوم الاشتراك</TableHead>
                        <TableHead>مبلغ التأمين</TableHead>
                        <TableHead>التأمين مطلوب</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedRules && groupedRules[meterType] && groupedRules[meterType].length > 0 ? (
                        groupedRules[meterType].map((rule: any) => (
                          <TableRow key={rule.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getUsageTypeIcon(rule.usageType)}
                                {getUsageTypeLabel(rule.usageType)}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {parseFloat(rule.subscriptionFee).toFixed(2)} ريال
                            </TableCell>
                            <TableCell className="font-semibold">
                              {parseFloat(rule.depositAmount).toFixed(2)} ريال
                            </TableCell>
                            <TableCell>
                              {rule.depositRequired ? (
                                <Badge variant="default">نعم</Badge>
                              ) : (
                                <Badge variant="secondary">لا</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {rule.active ? (
                                <Badge variant="default" className="bg-green-600">نشط</Badge>
                              ) : (
                                <Badge variant="secondary">معطل</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(rule)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(rule.id)}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            لا توجد قواعد تسعير لهذا النوع
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة قاعدة تسعير جديدة</DialogTitle>
            <DialogDescription>
              حدد نوع العداد ونوع الاستخدام والتكاليف
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع العداد</Label>
                  <Select
                    value={newRule.meterType}
                    onValueChange={(value: any) => setNewRule({ ...newRule, meterType: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">تقليدي</SelectItem>
                      <SelectItem value="sts">STS</SelectItem>
                      <SelectItem value="iot">IoT ذكي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>نوع الاستخدام</Label>
                  <Select
                    value={newRule.usageType}
                    onValueChange={(value: any) => setNewRule({ ...newRule, usageType: value })}
                  >
                    <SelectTrigger className="mt-2">
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
                  <Label>رسوم الاشتراك (ريال)</Label>
                  <Input
                    type="number"
                    value={newRule.subscriptionFee}
                    onChange={(e) => setNewRule({ ...newRule, subscriptionFee: parseFloat(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>مبلغ التأمين (ريال)</Label>
                  <Input
                    type="number"
                    value={newRule.depositAmount}
                    onChange={(e) => setNewRule({ ...newRule, depositAmount: parseFloat(e.target.value) })}
                    className="mt-2"
                    disabled={newRule.meterType === "sts"}
                  />
                  {newRule.meterType === "sts" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      عدادات STS لا تتطلب تأمين
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  checked={newRule.depositRequired && newRule.meterType !== "sts"}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, depositRequired: checked })}
                  disabled={newRule.meterType === "sts"}
                />
                <Label>التأمين مطلوب</Label>
              </div>
              
              <div>
                <Label>ملاحظات (اختياري)</Label>
                <Input
                  value={newRule.notes}
                  onChange={(e) => setNewRule({ ...newRule, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  className="mt-2"
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">ملخص التكاليف:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>رسوم الاشتراك:</span>
                    <span className="font-semibold">{newRule.subscriptionFee.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مبلغ التأمين:</span>
                    <span className="font-semibold">
                      {(newRule.depositRequired && newRule.meterType !== "sts" ? newRule.depositAmount : 0).toFixed(2)} ريال
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t">
                    <span>الإجمالي:</span>
                    <span className="text-blue-600">
                      {(newRule.subscriptionFee + (newRule.depositRequired && newRule.meterType !== "sts" ? newRule.depositAmount : 0)).toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ القاعدة"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog - Similar structure */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل قاعدة التسعير</DialogTitle>
          </DialogHeader>
          {editingRule && (
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>رسوم الاشتراك (ريال)</Label>
                    <Input
                      type="number"
                      value={editingRule.subscriptionFee}
                      onChange={(e) => setEditingRule({ ...editingRule, subscriptionFee: parseFloat(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>مبلغ التأمين (ريال)</Label>
                    <Input
                      type="number"
                      value={editingRule.depositAmount}
                      onChange={(e) => setEditingRule({ ...editingRule, depositAmount: parseFloat(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={editingRule.depositRequired}
                    onCheckedChange={(checked) => setEditingRule({ ...editingRule, depositRequired: checked })}
                  />
                  <Label>التأمين مطلوب</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={editingRule.active}
                    onCheckedChange={(checked) => setEditingRule({ ...editingRule, active: checked })}
                  />
                  <Label>القاعدة نشطة</Label>
                </div>
                
                <div>
                  <Label>ملاحظات</Label>
                  <Input
                    value={editingRule.notes || ""}
                    onChange={(e) => setEditingRule({ ...editingRule, notes: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التعديلات"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

