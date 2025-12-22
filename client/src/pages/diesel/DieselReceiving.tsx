import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Truck, Plus, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

export default function DieselReceiving() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string>("");
  
  const [formData, setFormData] = useState({
    stationId: "",
    supplierId: "",
    tankerId: "",
    receivingTankId: "",
    quantityOrdered: "",
    quantityReceived: "",
    meterReadingBefore: "",
    meterReadingAfter: "",
    notes: "",
    distributionToTanks: [] as { tankId: number; quantity: string }[],
  });

  const utils = trpc.useUtils();
  const { data: stations } = trpc.getStations.useQuery();
  const { data: suppliers } = trpc.diesel.getDieselSuppliers.useQuery();
  const { data: tankers } = trpc.diesel.getDieselTankers.useQuery();
  const { data: tanks } = trpc.diesel.getDieselTanks.useQuery();
  const { data: receivingTasks, isLoading } = trpc.diesel.getDieselReceivingTasks.useQuery();
  const { data: stationConfig } = trpc.diesel.getStationDieselConfig.useQuery(
    { stationId: parseInt(formData.stationId) },
    { enabled: !!formData.stationId }
  );

  const createMutation = trpc.diesel.createDieselReceivingTask.useMutation({
    onSuccess: () => {
      toast({ title: "تم إنشاء مهمة الاستلام بنجاح" });
      utils.diesel.getDieselReceivingTasks.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = trpc.diesel.completeDieselReceivingTask.useMutation({
    onSuccess: () => {
      toast({ title: "تم إكمال مهمة الاستلام بنجاح" });
      utils.diesel.getDieselReceivingTasks.invalidate();
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // فلترة الخزانات حسب المحطة ونوع الاستلام
  const receivingTanks = tanks?.filter((t: any) => 
    t.stationId === parseInt(formData.stationId) && t.type === "receiving"
  ) || [];

  const allStationTanks = tanks?.filter((t: any) => 
    t.stationId === parseInt(formData.stationId)
  ) || [];

  const resetForm = () => {
    setFormData({
      stationId: "", supplierId: "", tankerId: "", receivingTankId: "",
      quantityOrdered: "", quantityReceived: "", meterReadingBefore: "",
      meterReadingAfter: "", notes: "", distributionToTanks: [],
    });
  };

  const handleSubmit = () => {
    const data = {
      stationId: parseInt(formData.stationId),
      supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
      tankerId: formData.tankerId ? parseInt(formData.tankerId) : undefined,
      receivingTankId: formData.receivingTankId ? parseInt(formData.receivingTankId) : undefined,
      quantityOrdered: formData.quantityOrdered,
      quantityReceived: formData.quantityReceived || undefined,
      meterReadingBefore: formData.meterReadingBefore || undefined,
      meterReadingAfter: formData.meterReadingAfter || undefined,
      notes: formData.notes || undefined,
    };
    createMutation.mutate(data);
  };

  const addDistributionTank = () => {
    setFormData({
      ...formData,
      distributionToTanks: [...formData.distributionToTanks, { tankId: 0, quantity: "" }],
    });
  };

  const updateDistribution = (index: number, field: string, value: any) => {
    const updated = [...formData.distributionToTanks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, distributionToTanks: updated });
  };

  const removeDistribution = (index: number) => {
    setFormData({
      ...formData,
      distributionToTanks: formData.distributionToTanks.filter((_, i) => i !== index),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
      pending: { label: "قيد الانتظار", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "جاري التنفيذ", icon: AlertCircle, className: "bg-blue-100 text-blue-800" },
      completed: { label: "مكتمل", icon: CheckCircle, className: "bg-green-100 text-green-800" },
      cancelled: { label: "ملغي", icon: AlertCircle, className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="ml-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // حساب الكمية من العداد
  const calculatedQuantity = formData.meterReadingBefore && formData.meterReadingAfter
    ? parseFloat(formData.meterReadingAfter) - parseFloat(formData.meterReadingBefore)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">استلام الديزل</h1>
          <p className="text-muted-foreground">إدارة عمليات استلام الديزل في المحطات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="ml-2 h-4 w-4" />استلام جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>عملية استلام ديزل جديدة</DialogTitle>
              <DialogDescription>أدخل بيانات عملية الاستلام</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* المحطة */}
              <div className="space-y-2">
                <Label>المحطة *</Label>
                <Select value={formData.stationId} onValueChange={(value) => setFormData({ ...formData, stationId: value, receivingTankId: "" })}>
                  <SelectTrigger><SelectValue placeholder="اختر المحطة" /></SelectTrigger>
                  <SelectContent>
                    {stations?.map((station: any) => (
                      <SelectItem key={station.id} value={station.id.toString()}>{station.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* المورد */}
                <div className="space-y-2">
                  <Label>المورد</Label>
                  <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                    <SelectTrigger><SelectValue placeholder="اختر المورد" /></SelectTrigger>
                    <SelectContent>
                      {suppliers?.map((supplier: any) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>{supplier.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* الوايت */}
                <div className="space-y-2">
                  <Label>الوايت</Label>
                  <Select value={formData.tankerId} onValueChange={(value) => setFormData({ ...formData, tankerId: value })}>
                    <SelectTrigger><SelectValue placeholder="اختر الوايت" /></SelectTrigger>
                    <SelectContent>
                      {tankers?.map((tanker: any) => (
                        <SelectItem key={tanker.id} value={tanker.id.toString()}>
                          {tanker.plateNumber} - {tanker.capacity} لتر
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* خزان الاستلام */}
              {formData.stationId && (
                <div className="space-y-2">
                  <Label>خزان الاستلام</Label>
                  <Select value={formData.receivingTankId} onValueChange={(value) => setFormData({ ...formData, receivingTankId: value })}>
                    <SelectTrigger><SelectValue placeholder="اختر خزان الاستلام" /></SelectTrigger>
                    <SelectContent>
                      {receivingTanks.map((tank: any) => (
                        <SelectItem key={tank.id} value={tank.id.toString()}>
                          {tank.nameAr} (السعة: {tank.capacity} لتر)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* الكميات */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الكمية المطلوبة (لتر) *</Label>
                  <Input
                    type="number"
                    value={formData.quantityOrdered}
                    onChange={(e) => setFormData({ ...formData, quantityOrdered: e.target.value })}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>الكمية المستلمة (لتر)</Label>
                  <Input
                    type="number"
                    value={formData.quantityReceived}
                    onChange={(e) => setFormData({ ...formData, quantityReceived: e.target.value })}
                    placeholder="سيتم تحديدها عند الاستلام"
                  />
                </div>
              </div>

              {/* قراءات العداد */}
              {stationConfig?.config?.hasIntakePump && stationConfig?.config?.intakePumpHasMeter && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">قراءات عداد الطرمبة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>القراءة قبل</Label>
                        <Input
                          type="number"
                          value={formData.meterReadingBefore}
                          onChange={(e) => setFormData({ ...formData, meterReadingBefore: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>القراءة بعد</Label>
                        <Input
                          type="number"
                          value={formData.meterReadingAfter}
                          onChange={(e) => setFormData({ ...formData, meterReadingAfter: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الكمية المحسوبة</Label>
                        <Input
                          type="number"
                          value={calculatedQuantity || ""}
                          disabled
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* توزيع على الخزانات */}
              {formData.stationId && receivingTanks.length > 1 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      توزيع الكمية على الخزانات
                      <Button variant="outline" size="sm" onClick={addDistributionTank}>
                        <Plus className="ml-1 h-3 w-3" />إضافة
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formData.distributionToTanks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        سيتم الاستلام في خزان واحد. اضغط إضافة لتوزيع الكمية.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {formData.distributionToTanks.map((dist, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <Select
                              value={dist.tankId?.toString() || ""}
                              onValueChange={(value) => updateDistribution(index, "tankId", parseInt(value))}
                            >
                              <SelectTrigger className="flex-1"><SelectValue placeholder="اختر الخزان" /></SelectTrigger>
                              <SelectContent>
                                {receivingTanks.map((tank: any) => (
                                  <SelectItem key={tank.id} value={tank.id.toString()}>{tank.nameAr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={dist.quantity}
                              onChange={(e) => updateDistribution(index, "quantity", e.target.value)}
                              placeholder="الكمية"
                              className="w-32"
                            />
                            <Button variant="ghost" size="sm" onClick={() => removeDistribution(index)}>حذف</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ملاحظات */}
              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                إنشاء مهمة الاستلام
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العمليات</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{receivingTasks?.length || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivingTasks?.filter((t: any) => t.status === "pending").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">جاري التنفيذ</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivingTasks?.filter((t: any) => t.status === "in_progress").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {receivingTasks?.filter((t: any) => t.status === "completed").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلتر المحطة */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <Label>فلترة حسب المحطة:</Label>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-64"><SelectValue placeholder="جميع المحطات" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المحطات</SelectItem>
                {stations?.map((station: any) => (
                  <SelectItem key={station.id} value={station.id.toString()}>{station.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول العمليات */}
      <Card>
        <CardHeader>
          <CardTitle>عمليات الاستلام</CardTitle>
          <CardDescription>جميع عمليات استلام الديزل</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">جاري التحميل...</p>
          ) : receivingTasks?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">لا يوجد عمليات استلام</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العملية</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المحطة</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>الكمية المطلوبة</TableHead>
                  <TableHead>الكمية المستلمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receivingTasks
                  ?.filter((task: any) => !selectedStation || task.stationId === parseInt(selectedStation))
                  .map((task: any) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">#{task.id}</TableCell>
                      <TableCell>{new Date(task.createdAt).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{stations?.find((s: any) => s.id === task.stationId)?.nameAr || "-"}</TableCell>
                      <TableCell>{suppliers?.find((s: any) => s.id === task.supplierId)?.nameAr || "-"}</TableCell>
                      <TableCell>{task.quantityOrdered} لتر</TableCell>
                      <TableCell>{task.quantityReceived ? `${task.quantityReceived} لتر` : "-"}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                          {task.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => completeMutation.mutate({ id: task.id, quantityReceived: task.quantityOrdered })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
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
