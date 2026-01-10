import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

interface TariffSlot {
  tariffId: string;
  name: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  pricePerKWH: number;
  isActive: boolean;
}

export default function AcrelMultiTariffSchedule() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const meterId = (params as any)?.id ? parseInt((params as any).id) : undefined;
  const { toast } = useToast();

  const [tariffSlots, setTariffSlots] = useState<TariffSlot[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<TariffSlot>({
    tariffId: "",
    name: "",
    startTime: "00:00",
    endTime: "23:59",
    pricePerKWH: 0.18,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const businessId = useBusinessId();

  // Fetch meter info
  const { data: meterData, isLoading: isLoadingMeter } = trpc.developer.integrations.acrel.meters.getInfo.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId }
  );

  // Fetch tariff schedule
  const { data: scheduleData, isLoading: isLoadingSchedule, refetch: refetchSchedule } = trpc.developer.integrations.acrel.tariff.getSchedule.useQuery(
    { meterId: meterId! },
    { enabled: !!meterId }
  );

  // Set tariff schedule mutation
  const setScheduleMutation = trpc.developer.integrations.acrel.tariff.setSchedule.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ جدول التعرفات بنجاح");
      setIsEditDialogOpen(false);
      refetchSchedule();
    },
    onError: (error) => {
      toast.error("فشل حفظ جدول التعرفات: " + error.message);
    },
    onSettled: () => setIsSaving(false),
  });

  useEffect(() => {
    if (scheduleData?.tariffs) {
      setTariffSlots(scheduleData.tariffs);
    }
  }, [scheduleData]);

  const handleAddSlot = () => {
    if (tariffSlots.length >= 8) {
      toast.error("الحد الأقصى للتعرفات هو 8 تعرفات");
      return;
    }
    setEditingIndex(null);
    setFormData({
      tariffId: `tariff_${Date.now()}`,
      name: "",
      startTime: "00:00",
      endTime: "23:59",
      pricePerKWH: 0.18,
      isActive: true,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSlot = (index: number) => {
    setEditingIndex(index);
    setFormData(tariffSlots[index]);
    setIsEditDialogOpen(true);
  };

  const handleDeleteSlot = (index: number) => {
    const newSlots = tariffSlots.filter((_, i) => i !== index);
    setTariffSlots(newSlots);
    handleSaveSchedule(newSlots);
  };

  const handleSaveSlot = () => {
    // Validate time range
    if (formData.startTime >= formData.endTime) {
      toast.error("وقت البداية يجب أن يكون قبل وقت النهاية");
      return;
    }

    // Validate price
    if (formData.pricePerKWH <= 0) {
      toast.error("سعر الكيلووات ساعة يجب أن يكون أكبر من صفر");
      return;
    }

    // Validate name
    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم التعرفة");
      return;
    }

    // Check for overlapping time slots
    const overlaps = tariffSlots.some((slot, index) => {
      if (editingIndex !== null && index === editingIndex) return false;
      return (
        (formData.startTime >= slot.startTime && formData.startTime < slot.endTime) ||
        (formData.endTime > slot.startTime && formData.endTime <= slot.endTime) ||
        (formData.startTime <= slot.startTime && formData.endTime >= slot.endTime)
      );
    });

    if (overlaps) {
      toast.error("هناك تعارض في الأوقات مع تعرفة أخرى");
      return;
    }

    let newSlots: TariffSlot[];
    if (editingIndex !== null) {
      newSlots = tariffSlots.map((slot, index) =>
        index === editingIndex ? formData : slot
      );
    } else {
      newSlots = [...tariffSlots, formData];
    }

    // Sort by start time
    newSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    setTariffSlots(newSlots);
    setIsEditDialogOpen(false);
    handleSaveSchedule(newSlots);
  };

  const handleSaveSchedule = async (slots: TariffSlot[] = tariffSlots) => {
    if (!meterId) return;
    if (slots.length === 0) {
      toast.error("يجب إضافة تعرفة واحدة على الأقل");
      return;
    }
    setIsSaving(true);
    await setScheduleMutation.mutateAsync({
      meterId,
      tariffs: slots,
    });
  };

  const currentPageInfo = resolvePageInfo(useLocation()[0]);

  if (isLoadingMeter || isLoadingSchedule) {
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
        <Button onClick={() => setLocation("/dashboard/acrel/meters")} className="mt-4">
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
            <Clock className="w-8 h-8 text-primary" />
            التعرفات المتعددة - عداد ACREL #{meterData.meterNumber || meterId}
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة جدول التعرفات المتعددة (حتى 8 تعرفات خلال اليوم)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleSaveSchedule()} disabled={isSaving || tariffSlots.length === 0}>
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ الجدول
              </>
            )}
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>جدول التعرفات</CardTitle>
              <CardDescription>
                يمكنك إضافة حتى 8 تعرفات مختلفة خلال اليوم (24 ساعة)
              </CardDescription>
            </div>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddSlot} disabled={tariffSlots.length >= 8}>
                  <Plus className="w-4 h-4 mr-2" />
                  إضافة تعرفة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingIndex !== null ? "تعديل تعرفة" : "إضافة تعرفة جديدة"}
                  </DialogTitle>
                  <DialogDescription>
                    أدخل بيانات التعرفة (الاسم، الوقت، والسعر)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>اسم التعرفة *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: تعرفة الطاقة الشمسية"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>وقت البداية</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>وقت النهاية</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>سعر الكيلووات ساعة (ريال)</Label>
                    <Input
                      type="number"
                      value={formData.pricePerKWH}
                      onChange={(e) => setFormData({ ...formData, pricePerKWH: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      placeholder="0.18"
                    />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">مثال:</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      تعرفة الطاقة الشمسية: 06:00 - 10:00 بسعر 0.12 ريال/كيلو
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleSaveSlot}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {tariffSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد تعرفات محددة</p>
              <p className="text-sm text-muted-foreground mt-2">
                أضف تعرفة واحدة على الأقل لتفعيل التعرفات المتعددة
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>اسم التعرفة</TableHead>
                  <TableHead>وقت البداية</TableHead>
                  <TableHead>وقت النهاية</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>سعر الكيلووات ساعة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffSlots.map((slot, index) => {
                  const start = new Date(`2000-01-01T${slot.startTime}`);
                  const end = new Date(`2000-01-01T${slot.endTime}`);
                  const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
                  const hours = Math.floor(duration / 60);
                  const minutes = duration % 60;

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{slot.name}</TableCell>
                      <TableCell>{slot.startTime}</TableCell>
                      <TableCell>{slot.endTime}</TableCell>
                      <TableCell>
                        {hours > 0 ? `${hours} ساعة ` : ""}
                        {minutes > 0 ? `${minutes} دقيقة` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {slot.pricePerKWH.toFixed(3)} ر.س/KWH
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={slot.isActive ? "default" : "secondary"}>
                          {slot.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSlot(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteSlot(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {tariffSlots.length > 0 && (
            <div className="mt-4 bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium">ملاحظات:</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>عند استهلاك الطاقة من عداد ACREL، سيتم حساب الفاتورة بناءً على التعرفة الحالية للوقت</li>
                <li>إذا لم يتم تحديد تعرفة لوقت معين، سيتم استخدام التعرفة الافتراضية</li>
                <li>يمكنك تعديل أو حذف أي تعرفة في أي وقت</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

