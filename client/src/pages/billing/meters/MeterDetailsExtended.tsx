import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Gauge, Package, Shield, Zap } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function MeterDetailsExtended() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const meterId = parseInt(params.id || "0");

  const [isSealDialogOpen, setIsSealDialogOpen] = useState(false);
  const [isBreakerDialogOpen, setIsBreakerDialogOpen] = useState(false);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  // Fetch meter details
  const { data: meters } = trpc.customerSystem.getMeters.useQuery({ page: 1, limit: 1000 });
  const meter = meters?.data?.find((m: any) => m.id === meterId);

  // Fetch seals
  const { data: seals, refetch: refetchSeals } = trpc.customerSystem.getMeterSeals.useQuery(
    { meterId },
    { enabled: !!meterId }
  );

  // Fetch breakers
  const { data: breakers, refetch: refetchBreakers } = trpc.customerSystem.getMeterBreakers.useQuery(
    { meterId },
    { enabled: !!meterId }
  );

  // Fetch inventory items
  const { data: inventoryItems, refetch: refetchInventory } = trpc.customerSystem.getMeterInventoryItems.useQuery(
    { meterId },
    { enabled: !!meterId }
  );

  // Mutations
  const addSealMutation = trpc.customerSystem.addMeterSeal.useMutation({
    onSuccess: () => {
      toast({ title: "تم بنجاح", description: "تم إضافة الختم بنجاح" });
      setIsSealDialogOpen(false);
      resetSealForm();
      refetchSeals();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const addBreakerMutation = trpc.customerSystem.addMeterBreaker.useMutation({
    onSuccess: () => {
      toast({ title: "تم بنجاح", description: "تم إضافة القاطع بنجاح" });
      setIsBreakerDialogOpen(false);
      resetBreakerForm();
      refetchBreakers();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const addInventoryItemMutation = trpc.customerSystem.addMeterInventoryItem.useMutation({
    onSuccess: () => {
      toast({ title: "تم بنجاح", description: "تم ربط الصنف بنجاح" });
      setIsInventoryDialogOpen(false);
      resetInventoryForm();
      refetchInventory();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Form states
  const [sealForm, setSealForm] = useState({
    sealName: "",
    sealColor: "",
    sealNumber: "",
    sealType: "",
    installationDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [breakerForm, setBreakerForm] = useState({
    breakerType: "",
    breakerCapacity: "",
    breakerBrand: "",
    breakerModel: "",
    serialNumber: "",
    installationDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [inventoryForm, setInventoryForm] = useState({
    itemId: "",
    itemType: "other" as "meter" | "ct" | "cable" | "seal" | "breaker" | "other",
    quantity: "1",
    unitCost: "",
    installationDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const resetSealForm = () => {
    setSealForm({
      sealName: "",
      sealColor: "",
      sealNumber: "",
      sealType: "",
      installationDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const resetBreakerForm = () => {
    setBreakerForm({
      breakerType: "",
      breakerCapacity: "",
      breakerBrand: "",
      breakerModel: "",
      serialNumber: "",
      installationDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      itemId: "",
      itemType: "other",
      quantity: "1",
      unitCost: "",
      installationDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const handleAddSeal = () => {
    addSealMutation.mutate({
      meterId,
      ...sealForm,
    });
  };

  const handleAddBreaker = () => {
    addBreakerMutation.mutate({
      meterId,
      ...breakerForm,
    });
  };

  const handleAddInventoryItem = () => {
    addInventoryItemMutation.mutate({
      meterId,
      itemId: parseInt(inventoryForm.itemId),
      itemType: inventoryForm.itemType,
      quantity: parseFloat(inventoryForm.quantity),
      unitCost: inventoryForm.unitCost ? parseFloat(inventoryForm.unitCost) : undefined,
      installationDate: inventoryForm.installationDate,
      notes: inventoryForm.notes,
    });
  };

  if (!meter) {
    return (
      <div className="p-6" dir="rtl">
        <div className="text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation("/dashboard/customers/meters")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل العداد</h1>
            <p className="text-muted-foreground mt-1">
              {meter.meterNumber} - {meter.serialNumber}
            </p>
          </div>
        </div>
        <Badge className="text-lg px-4 py-2">
          {meter.status === "active" ? "نشط" : meter.status === "inactive" ? "غير نشط" : meter.status}
        </Badge>
      </div>

      {/* Meter Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            معلومات العداد الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">رقم العداد</Label>
              <p className="font-semibold">{meter.meterNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">الرقم التسلسلي</Label>
              <p className="font-semibold">{meter.serialNumber || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">النوع</Label>
              <p className="font-semibold">{meter.meterType}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">الفئة</Label>
              <p className="font-semibold">{meter.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">الماركة</Label>
              <p className="font-semibold">{meter.brand || "-"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">الموديل</Label>
              <p className="font-semibold">{meter.model || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Seals, Breakers, Inventory */}
      <Tabs defaultValue="seals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seals">
            <Shield className="h-4 w-4 ml-2" />
            الختومات ({seals?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="breakers">
            <Zap className="h-4 w-4 ml-2" />
            القواطع ({breakers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 ml-2" />
            المخزون ({inventoryItems?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Seals Tab */}
        <TabsContent value="seals">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الختومات المركبة</CardTitle>
                <Button onClick={() => setIsSealDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة ختم
                </Button>
              </div>
              <CardDescription>
                عرض وإدارة الختومات المركبة على العداد
              </CardDescription>
            </CardHeader>
            <CardContent>
              {seals && seals.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اسم الختم</TableHead>
                      <TableHead className="text-right">اللون</TableHead>
                      <TableHead className="text-right">الرقم</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">تاريخ التركيب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seals.map((seal: any) => (
                      <TableRow key={seal.id}>
                        <TableCell>{seal.sealName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {seal.sealColor && (
                              <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: seal.sealColor }}
                              />
                            )}
                            {seal.sealColor || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{seal.sealNumber}</TableCell>
                        <TableCell>{seal.sealType || "-"}</TableCell>
                        <TableCell>
                          {seal.installationDate
                            ? format(new Date(seal.installationDate), "yyyy/MM/dd", { locale: ar })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={seal.status === "installed" ? "default" : "secondary"}
                          >
                            {seal.status === "installed" ? "مركب" : seal.status === "removed" ? "تم الإزالة" : "تالف"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد ختومات مركبة على هذا العداد
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakers Tab */}
        <TabsContent value="breakers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>القواطع المركبة</CardTitle>
                <Button onClick={() => setIsBreakerDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة قاطع
                </Button>
              </div>
              <CardDescription>
                عرض وإدارة القواطع المركبة على العداد
              </CardDescription>
            </CardHeader>
            <CardContent>
              {breakers && breakers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">السعة</TableHead>
                      <TableHead className="text-right">الماركة</TableHead>
                      <TableHead className="text-right">الموديل</TableHead>
                      <TableHead className="text-right">الرقم التسلسلي</TableHead>
                      <TableHead className="text-right">تاريخ التركيب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {breakers.map((breaker: any) => (
                      <TableRow key={breaker.id}>
                        <TableCell>{breaker.breakerType || "-"}</TableCell>
                        <TableCell className="font-semibold">{breaker.breakerCapacity || "-"}</TableCell>
                        <TableCell>{breaker.breakerBrand || "-"}</TableCell>
                        <TableCell>{breaker.breakerModel || "-"}</TableCell>
                        <TableCell className="font-mono">{breaker.serialNumber || "-"}</TableCell>
                        <TableCell>
                          {breaker.installationDate
                            ? format(new Date(breaker.installationDate), "yyyy/MM/dd", { locale: ar })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={breaker.status === "installed" ? "default" : "secondary"}
                          >
                            {breaker.status === "installed" ? "مركب" : breaker.status === "removed" ? "تم الإزالة" : breaker.status === "maintenance" ? "صيانة" : "تالف"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد قواطع مركبة على هذا العداد
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>الأصناف من المخزون</CardTitle>
                <Button onClick={() => setIsInventoryDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  ربط صنف
                </Button>
              </div>
              <CardDescription>
                الأصناف المربوطة بهذا العداد من المخزون
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryItems && inventoryItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الصنف</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">تكلفة الوحدة</TableHead>
                      <TableHead className="text-right">التكلفة الإجمالية</TableHead>
                      <TableHead className="text-right">تاريخ التركيب</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryItems.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.itemId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.itemType}</Badge>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unitCost ? `${item.unitCost} ر.س` : "-"}</TableCell>
                        <TableCell className="font-semibold">{item.totalCost ? `${item.totalCost} ر.س` : "-"}</TableCell>
                        <TableCell>
                          {item.installationDate
                            ? format(new Date(item.installationDate), "yyyy/MM/dd", { locale: ar })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "installed" ? "default" : "secondary"}
                          >
                            {item.status === "installed" ? "مركب" : item.status === "removed" ? "تم الإزالة" : "مستبدل"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد أصناف مربوطة من المخزون
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Seal Dialog */}
      <Dialog open={isSealDialogOpen} onOpenChange={setIsSealDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ختم جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل الختم الجديد لتركيبه على العداد
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم الختم</Label>
                <Input
                  value={sealForm.sealName}
                  onChange={(e) => setSealForm({ ...sealForm, sealName: e.target.value })}
                  placeholder="مثال: ختم رئيسي"
                />
              </div>

              <div className="space-y-2">
                <Label>لون الختم</Label>
                <Input
                  value={sealForm.sealColor}
                  onChange={(e) => setSealForm({ ...sealForm, sealColor: e.target.value })}
                  placeholder="مثال: أحمر"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الختم *</Label>
                <Input
                  value={sealForm.sealNumber}
                  onChange={(e) => setSealForm({ ...sealForm, sealNumber: e.target.value })}
                  placeholder="أدخل رقم الختم"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>نوع الختم</Label>
                <Input
                  value={sealForm.sealType}
                  onChange={(e) => setSealForm({ ...sealForm, sealType: e.target.value })}
                  placeholder="مثال: بلاستيك"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input
                type="date"
                value={sealForm.installationDate}
                onChange={(e) => setSealForm({ ...sealForm, installationDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={sealForm.notes}
                onChange={(e) => setSealForm({ ...sealForm, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSealDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddSeal} disabled={!sealForm.sealNumber}>
              إضافة الختم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Breaker Dialog */}
      <Dialog open={isBreakerDialogOpen} onOpenChange={setIsBreakerDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة قاطع جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل القاطع الجديد لتركيبه على العداد
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع القاطع</Label>
                <Input
                  value={breakerForm.breakerType}
                  onChange={(e) => setBreakerForm({ ...breakerForm, breakerType: e.target.value })}
                  placeholder="مثال: أوتوماتيكي"
                />
              </div>

              <div className="space-y-2">
                <Label>سعة القاطع (Ampere)</Label>
                <Input
                  value={breakerForm.breakerCapacity}
                  onChange={(e) => setBreakerForm({ ...breakerForm, breakerCapacity: e.target.value })}
                  placeholder="مثال: 32A"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الماركة</Label>
                <Input
                  value={breakerForm.breakerBrand}
                  onChange={(e) => setBreakerForm({ ...breakerForm, breakerBrand: e.target.value })}
                  placeholder="مثال: Schneider"
                />
              </div>

              <div className="space-y-2">
                <Label>الموديل</Label>
                <Input
                  value={breakerForm.breakerModel}
                  onChange={(e) => setBreakerForm({ ...breakerForm, breakerModel: e.target.value })}
                  placeholder="مثال: C32"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الرقم التسلسلي</Label>
                <Input
                  value={breakerForm.serialNumber}
                  onChange={(e) => setBreakerForm({ ...breakerForm, serialNumber: e.target.value })}
                  placeholder="أدخل الرقم التسلسلي"
                />
              </div>

              <div className="space-y-2">
                <Label>تاريخ التركيب</Label>
                <Input
                  type="date"
                  value={breakerForm.installationDate}
                  onChange={(e) => setBreakerForm({ ...breakerForm, installationDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={breakerForm.notes}
                onChange={(e) => setBreakerForm({ ...breakerForm, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBreakerDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddBreaker}>
              إضافة القاطع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Item Dialog */}
      <Dialog open={isInventoryDialogOpen} onOpenChange={setIsInventoryDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>ربط صنف من المخزون</DialogTitle>
            <DialogDescription>
              ربط صنف موجود في المخزون بهذا العداد
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>رقم الصنف *</Label>
                <Input
                  type="number"
                  value={inventoryForm.itemId}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, itemId: e.target.value })}
                  placeholder="أدخل رقم الصنف"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>نوع الصنف</Label>
                <select
                  value={inventoryForm.itemType}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, itemType: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="meter">عداد</option>
                  <option value="ct">CT</option>
                  <option value="cable">كابل</option>
                  <option value="seal">ختم</option>
                  <option value="breaker">قاطع</option>
                  <option value="other">أخرى</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الكمية *</Label>
                <Input
                  type="number"
                  step="0.001"
                  value={inventoryForm.quantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                  placeholder="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>تكلفة الوحدة (ر.س)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={inventoryForm.unitCost}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, unitCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input
                type="date"
                value={inventoryForm.installationDate}
                onChange={(e) => setInventoryForm({ ...inventoryForm, installationDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={inventoryForm.notes}
                onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                placeholder="أدخل أي ملاحظات إضافية"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInventoryDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddInventoryItem} disabled={!inventoryForm.itemId || !inventoryForm.quantity}>
              ربط الصنف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

