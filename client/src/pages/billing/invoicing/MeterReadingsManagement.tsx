import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Trash2, Search, RefreshCw, FileText, CheckCircle, XCircle, Upload, Download, Eye, Zap, Loader2 } from "lucide-react";

interface MeterReading {
  id: number;
  meterId: number;
  meterNumber: string;
  customerName: string;
  billingPeriodId: number;
  billingPeriodName: string;
  previousReading: string;
  currentReading: string;
  consumption: string;
  readingDate: string;
  readingType: string;
  status: string;
  notes?: string;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
}

export default function MeterReadingsManagement() {
  const [readings, setReadings] = useState<MeterReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [selectedReadings, setSelectedReadings] = useState<number[]>([]);
  const [showBulkEntryDialog, setShowBulkEntryDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [selectedReading, setSelectedReading] = useState<MeterReading | null>(null);
  const [editingReading, setEditingReading] = useState<MeterReading | null>(null);
  
  const [formData, setFormData] = useState({
    meterId: "",
    billingPeriodId: "",
    currentReading: "",
    readingDate: new Date().toISOString().split("T")[0],
    readingType: "manual",
    notes: "",
  });

  const [bulkReadings, setBulkReadings] = useState<{meterId: number; meterNumber: string; currentReading: string}[]>([]);

  const readingsQuery = trpc.billing.getMeterReadings.useQuery();
  const metersQuery = trpc.billing.getMeters.useQuery();
  const periodsQuery = trpc.billing.getBillingPeriods.useQuery();
  const createReadingMutation = trpc.billing.createMeterReading.useMutation();
  const approveReadingsMutation = trpc.billing.approveReadings.useMutation();
  const rejectReadingsMutation = trpc.billing.rejectReadings.useMutation();
  const deleteReadingMutation = trpc.billing.createMeterReading.useMutation();

  const handleDeleteReading = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه القراءة؟")) {
      try {
        await deleteReadingMutation.mutateAsync({ id } as any);
        readingsQuery.refetch();
      } catch (error) {
        console.error("Error deleting reading:", error);
      }
    }
  };

  useEffect(() => {
    if (readingsQuery.data) {
      setReadings(readingsQuery.data as any);
    }
  }, [readingsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReadingMutation.mutateAsync({
        meterId: parseInt((formData as any).meterId),
        billingPeriodId: parseInt((formData as any).billingPeriodId),
        currentReading: (formData as any).currentReading,
        readingDate: (formData as any).readingDate,
        readingType: (formData as any).readingType as any,
        notes: (formData as any).notes || undefined,
      } as any);
      readingsQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving reading:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (selectedReadings.length === 0) return;
    if (confirm(`هل أنت متأكد من اعتماد ${selectedReadings.length} قراءة؟`)) {
      try {
        await approveReadingsMutation.mutateAsync({ ids: selectedReadings } as any);
        readingsQuery.refetch();
        setSelectedReadings([]);
      } catch (error) {
        console.error("Error approving readings:", error);
      }
    }
  };

  const handleReject = async () => {
    if (selectedReadings.length === 0) return;
    if (confirm(`هل أنت متأكد من رفض ${selectedReadings.length} قراءة؟`)) {
      try {
        await rejectReadingsMutation.mutateAsync({ ids: selectedReadings } as any);
        readingsQuery.refetch();
        setSelectedReadings([]);
      } catch (error) {
        console.error("Error rejecting readings:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      meterId: "",
      billingPeriodId: "",
      currentReading: "",
      readingDate: new Date().toISOString().split("T")[0],
      readingType: "manual",
      notes: "",
    });
  };

  const [pullingReading, setPullingReading] = useState<number | null>(null);

  const handlePullAcrelReading = async (meterId: number, meterNumber: string) => {
    setPullingReading(meterId);
    try {
      // البحث عن عداد ACREL المرتبط
      const meter = (metersQuery.data as any)?.find((m: any) => m.id === meterId);
      if (!meter || meter.externalIntegrationType !== "acrel" || !meter.acrelMeterId) {
        alert("هذا العداد غير مرتبط بـ ACREL");
        setPullingReading(null);
        return;
      }

      // سحب القراءة من ACREL
      const reading = await trpc.developer.integrations.acrel.meters.getReading.query({
        meterId: parseInt(meter.acrelMeterId),
      });

      if (reading) {
        // حفظ القراءة في النظام
        const activePeriods = periodsQuery.data?.filter((p: any) => p.status === "reading_phase" || p.status === "active") || [];
        const currentPeriod = activePeriods[0]; // استخدام الفترة النشطة
        if (currentPeriod) {
          await createReadingMutation.mutateAsync({
            meterId,
            billingPeriodId: currentPeriod.id,
            currentReading: (reading as any).energy?.toString() || (reading as any).totalEnergy?.toString() || "0",
            readingDate: new Date().toISOString().split("T")[0],
            readingType: "automatic",
            notes: `قراءة تلقائية من ACREL - ${new Date().toLocaleString("ar-SA")}`,
          } as any);
          readingsQuery.refetch();
          alert("تم سحب القراءة من ACREL بنجاح");
        } else {
          alert("لا توجد فترة فوترة نشطة");
        }
      }
    } catch (error: any) {
      console.error("Error pulling ACREL reading:", error);
      alert("فشل في سحب القراءة: " + (error.message || "خطأ غير معروف"));
    } finally {
      setPullingReading(null);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedReadings(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingReadings = filteredReadings.filter(r => !r.isApproved);
    if (selectedReadings.length === pendingReadings.length) {
      setSelectedReadings([]);
    } else {
      setSelectedReadings(pendingReadings.map(r => r.id));
    }
  };

  const filteredReadings = readings.filter((reading) => {
    const matchesSearch =
      (reading as any).meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reading as any).customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "approved" && (reading as any).isApproved) ||
      (filterStatus === "pending" && !(reading as any).isApproved);
    const matchesPeriod = filterPeriod === "all" || (reading as any).billingPeriodId.toString() === filterPeriod;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getReadingTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      manual: "يدوي",
      automatic: "تلقائي",
      estimated: "تقديري",
    };
    return types[type] || type;
  };

  const activePeriods = periodsQuery.data?.filter(p => p.status === "reading_phase" || p.status === "active") || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">قراءات العدادات</h1>
          <p className="text-muted-foreground">إدخال واعتماد قراءات العدادات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBulkEntryDialog(true)}>
            <Upload className="h-4 w-4 ml-2" />
            إدخال جماعي
          </Button>
          <Button onClick={() => setActiveTab("add")}>
            <FileText className="h-4 w-4 ml-2" />
            إضافة قراءة
          </Button>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{readings.length}</div>
            <p className="text-muted-foreground text-sm">إجمالي القراءات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{readings.filter(r => !r.isApproved).length}</div>
            <p className="text-muted-foreground text-sm">قراءات معلقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{readings.filter(r => r.isApproved).length}</div>
            <p className="text-muted-foreground text-sm">قراءات معتمدة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {readings.reduce((sum, r) => sum + parseFloat(r.consumption || "0"), 0).toLocaleString()}
            </div>
            <p className="text-muted-foreground text-sm">إجمالي الاستهلاك</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">القراءات</TabsTrigger>
          <TabsTrigger value="add">إضافة قراءة</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                قائمة القراءات ({filteredReadings.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                {selectedReadings.length > 0 && (
                  <>
                    <Button variant="default" size="sm" onClick={handleApprove}>
                      <CheckCircle className="h-4 w-4 ml-1" />
                      اعتماد ({selectedReadings.length})
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleReject}>
                      <XCircle className="h-4 w-4 ml-1" />
                      رفض
                    </Button>
                  </>
                )}
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفترات</SelectItem>
                    {periodsQuery.data?.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="approved">معتمد</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => readingsQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedReadings.length > 0 && selectedReadings.length === filteredReadings.filter(r => !r.isApproved).length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>القراءة السابقة</TableHead>
                    <TableHead>القراءة الحالية</TableHead>
                    <TableHead>الاستهلاك</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {readingsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredReadings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">لا توجد قراءات</TableCell>
                    </TableRow>
                  ) : (
                    filteredReadings.map((reading) => (
                      <TableRow key={(reading as any).id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedReadings.includes((reading as any).id)}
                            onCheckedChange={() => toggleSelection((reading as any).id)}
                            disabled={(reading as any).isApproved}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{(reading as any).meterNumber}</TableCell>
                        <TableCell>{(reading as any).customerName}</TableCell>
                        <TableCell>{(reading as any).billingPeriodName}</TableCell>
                        <TableCell>{parseFloat((reading as any).previousReading).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat((reading as any).currentReading).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">{parseFloat((reading as any).consumption).toLocaleString()}</TableCell>
                        <TableCell>{getReadingTypeLabel((reading as any).readingType)}</TableCell>
                        <TableCell>{new Date((reading as any).readingDate).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>
                          {(reading as any).isApproved ? (
                            <Badge className="bg-green-100 text-green-800">معتمد</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedReading(reading)} title="عرض">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {/* زر سحب قراءة ACREL - يظهر فقط للعدادات المرتبطة بـ ACREL */}
                            {(() => {
                              const meter = (metersQuery.data as any)?.find((m: any) => m.id === (reading as any).meterId);
                              if (meter && meter.externalIntegrationType === "acrel" && !(reading as any).isApproved) {
                                return (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handlePullAcrelReading((reading as any).meterId, (reading as any).meterNumber)}
                                    title="سحب قراءة من ACREL"
                                    disabled={pullingReading === (reading as any).meterId}
                                    className="text-blue-500"
                                  >
                                    {pullingReading === (reading as any).meterId ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Zap className="h-4 w-4" />
                                    )}
                                  </Button>
                                );
                              }
                              return null;
                            })()}
                            {!(reading as any).isApproved && (
                              <>
                                <Button variant="ghost" size="icon" onClick={() => setEditingReading(reading)} title="تعديل">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteReading((reading as any).id)} className="text-red-500" title="حذف">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>إضافة قراءة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>فترة الفوترة *</Label>
                    <Select value={(formData as any).billingPeriodId} onValueChange={(v) => setFormData({ ...formData, billingPeriodId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الفترة" /></SelectTrigger>
                      <SelectContent>
                        {activePeriods.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>العداد *</Label>
                      {(() => {
                        const selectedMeter = metersQuery.data?.find((m: any) => m.id.toString() === (formData as any).meterId);
                        if (selectedMeter && (selectedMeter as any).externalIntegrationType === "acrel") {
                          return (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handlePullAcrelReading(parseInt((formData as any).meterId), (selectedMeter as any).meterNumber)}
                              disabled={pullingReading === parseInt((formData as any).meterId)}
                              className="text-xs"
                            >
                              {pullingReading === parseInt((formData as any).meterId) ? (
                                <>
                                  <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                                  جاري السحب...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-3 w-3 ml-1" />
                                  سحب من ACREL
                                </>
                              )}
                            </Button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Select value={(formData as any).meterId} onValueChange={(v) => setFormData({ ...formData, meterId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر العداد" /></SelectTrigger>
                      <SelectContent>
                        {metersQuery.data?.map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>
                            {m.meterNumber} - {m.customerName}
                            {(m as any).externalIntegrationType === "acrel" && (
                              <span className="text-xs text-blue-500 mr-1"> (ACREL)</span>
                            )}
                            {(m as any).externalIntegrationType === "sts" && (
                              <span className="text-xs text-green-500 mr-1"> (STS)</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>القراءة الحالية *</Label>
                    <Input type="number" value={(formData as any).currentReading} onChange={(e) => setFormData({ ...formData, currentReading: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ القراءة *</Label>
                    <Input type="date" value={(formData as any).readingDate} onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع القراءة</Label>
                    <Select value={(formData as any).readingType} onValueChange={(v) => setFormData({ ...formData, readingType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">يدوي</SelectItem>
                        <SelectItem value="automatic">تلقائي</SelectItem>
                        <SelectItem value="estimated">تقديري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>ملاحظات</Label>
                    <Textarea value={(formData as any).notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog الإدخال الجماعي */}
      <Dialog open={showBulkEntryDialog} onOpenChange={setShowBulkEntryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إدخال قراءات جماعي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>فترة الفوترة</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="اختر الفترة" /></SelectTrigger>
                  <SelectContent>
                    {activePeriods.map(p => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ القراءة</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>القراءة السابقة</TableHead>
                    <TableHead>القراءة الحالية</TableHead>
                    <TableHead>الاستهلاك</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metersQuery.data?.slice(0, 5).map(meter => (
                    <TableRow key={(meter as any).id}>
                      <TableCell>{(meter as any).meterNumber}</TableCell>
                      <TableCell>{(meter as any).customerName}</TableCell>
                      <TableCell>{(meter as any).lastReading || 0}</TableCell>
                      <TableCell>
                        <Input type="number" className="w-32" placeholder="القراءة" />
                      </TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBulkEntryDialog(false)}>إلغاء</Button>
              <Button>حفظ الكل</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Reading Dialog */}
      <Dialog open={!!selectedReading} onOpenChange={() => setSelectedReading(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              تفاصيل القراءة
            </DialogTitle>
          </DialogHeader>
          {selectedReading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم العداد</Label>
                  <p className="font-medium font-mono">{selectedReading.meterNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">العميل</Label>
                  <p className="font-medium">{selectedReading.customerName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الفترة</Label>
                  <p className="font-medium">{selectedReading.billingPeriodName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ القراءة</Label>
                  <p className="font-medium">{new Date(selectedReading.readingDate).toLocaleDateString("ar-SA")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">القراءة السابقة</Label>
                  <p className="font-medium">{parseFloat(selectedReading.previousReading).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">القراءة الحالية</Label>
                  <p className="font-medium">{parseFloat(selectedReading.currentReading).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الاستهلاك</Label>
                  <p className="font-medium text-lg">{parseFloat(selectedReading.consumption).toLocaleString()} ك.و.س</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">نوع القراءة</Label>
                  <p className="font-medium">{getReadingTypeLabel(selectedReading.readingType)}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div className="mt-1">
                    {selectedReading.isApproved ? (
                      <Badge className="bg-green-100 text-green-800">معتمد</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>
                    )}
                  </div>
                </div>
                {selectedReading.notes && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">ملاحظات</Label>
                    <p className="font-medium">{selectedReading.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedReading(null)}>
                  إغلاق
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
