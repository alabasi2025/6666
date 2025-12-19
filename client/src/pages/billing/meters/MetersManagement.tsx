import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Search, RefreshCw, Gauge, QrCode, Link, Eye, UserPlus } from "lucide-react";

interface Meter {
  id: number;
  meterNumber: string;
  serialNumber?: string;
  meterType: string;
  serviceType: string;
  status: string;
  installationDate?: string;
  lastReadingDate?: string;
  lastReadingValue?: string;
  cabinetId?: number;
  customerId?: number;
  tariffId?: number;
  multiplier: string;
  digits: number;
  isActive: boolean;
  cabinet?: { name: string; square?: { name: string; area?: { name: string } } };
  customer?: { fullName: string; accountNumber: string };
  tariff?: { name: string };
}

export default function MetersManagement() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCabinetId, setFilterCabinetId] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    meterNumber: "",
    serialNumber: "",
    meterType: "single_phase",
    serviceType: "electricity",
    status: "new",
    installationDate: "",
    cabinetId: "",
    tariffId: "",
    multiplier: "1",
    digits: "5",
    initialReading: "0",
  });

  const [linkData, setLinkData] = useState({
    customerId: "",
    installationDate: "",
    initialReading: "0",
  });

  const metersQuery = trpc.billing.getMeters.useQuery();
  const cabinetsQuery = trpc.billing.getCabinets.useQuery();
  const tariffsQuery = trpc.billing.getTariffs.useQuery();
  const customersQuery = trpc.billing.getCustomers.useQuery();
  const createMeterMutation = trpc.billing.createMeter.useMutation();
  const updateMeterMutation = trpc.billing.updateMeter.useMutation();
  const deleteMeterMutation = trpc.billing.deleteMeter.useMutation();
  const linkMeterToCustomerMutation = trpc.billing.linkMeterToCustomer.useMutation();

  useEffect(() => {
    if (metersQuery.data) {
      setMeters(metersQuery.data);
    }
  }, [metersQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        meterNumber: formData.meterNumber,
        serialNumber: formData.serialNumber || undefined,
        meterType: formData.meterType as any,
        serviceType: formData.serviceType as any,
        status: formData.status as any,
        installationDate: formData.installationDate || undefined,
        cabinetId: formData.cabinetId ? parseInt(formData.cabinetId) : undefined,
        tariffId: formData.tariffId ? parseInt(formData.tariffId) : undefined,
        multiplier: parseFloat(formData.multiplier),
        digits: parseInt(formData.digits),
      };
      
      if (editingMeter) {
        await updateMeterMutation.mutateAsync({ id: editingMeter.id, ...data });
      } else {
        await createMeterMutation.mutateAsync(data);
      }
      metersQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving meter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCustomer = async () => {
    if (!selectedMeter || !linkData.customerId) return;
    setLoading(true);
    try {
      await linkMeterToCustomerMutation.mutateAsync({
        meterId: selectedMeter.id,
        customerId: parseInt(linkData.customerId),
        installationDate: linkData.installationDate || undefined,
        initialReading: parseFloat(linkData.initialReading),
      });
      metersQuery.refetch();
      setShowLinkDialog(false);
      setLinkData({ customerId: "", installationDate: "", initialReading: "0" });
    } catch (error) {
      console.error("Error linking meter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meter: Meter) => {
    setEditingMeter(meter);
    setFormData({
      meterNumber: meter.meterNumber,
      serialNumber: meter.serialNumber || "",
      meterType: meter.meterType,
      serviceType: meter.serviceType,
      status: meter.status,
      installationDate: meter.installationDate || "",
      cabinetId: meter.cabinetId?.toString() || "",
      tariffId: meter.tariffId?.toString() || "",
      multiplier: meter.multiplier,
      digits: meter.digits.toString(),
      initialReading: "0",
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العداد؟")) {
      try {
        await deleteMeterMutation.mutateAsync({ id });
        metersQuery.refetch();
      } catch (error) {
        console.error("Error deleting meter:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      meterNumber: "",
      serialNumber: "",
      meterType: "single_phase",
      serviceType: "electricity",
      status: "new",
      installationDate: "",
      cabinetId: "",
      tariffId: "",
      multiplier: "1",
      digits: "5",
      initialReading: "0",
    });
    setEditingMeter(null);
  };

  const filteredMeters = meters.filter((meter) => {
    const matchesSearch =
      meter.meterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || meter.status === filterStatus;
    const matchesCabinet = filterCabinetId === "all" || meter.cabinetId?.toString() === filterCabinetId;
    return matchesSearch && matchesStatus && matchesCabinet;
  });

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, { label: string; color: string }> = {
      new: { label: "جديد", color: "bg-blue-100 text-blue-800" },
      active: { label: "نشط", color: "bg-green-100 text-green-800" },
      inactive: { label: "غير نشط", color: "bg-gray-100 text-gray-800" },
      suspended: { label: "موقوف", color: "bg-yellow-100 text-yellow-800" },
      disconnected: { label: "مفصول", color: "bg-red-100 text-red-800" },
      faulty: { label: "معطل", color: "bg-orange-100 text-orange-800" },
    };
    return statuses[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const getMeterTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      single_phase: "أحادي الطور",
      three_phase: "ثلاثي الطور",
      prepaid: "مسبق الدفع",
      smart: "ذكي",
      mechanical: "ميكانيكي",
    };
    return types[type] || type;
  };

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      electricity: "كهرباء",
      water: "ماء",
      gas: "غاز",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة العدادات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وربط العدادات بالعملاء</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab("add")}>
            <Gauge className="h-4 w-4 ml-2" />
            إضافة عداد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="list">العدادات</TabsTrigger>
          <TabsTrigger value="add">{editingMeter ? "تعديل عداد" : "إضافة عداد"}</TabsTrigger>
          <TabsTrigger value="unlinked">غير مربوطة</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                قائمة العدادات ({filteredMeters.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="new">جديد</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                    <SelectItem value="suspended">موقوف</SelectItem>
                    <SelectItem value="disconnected">مفصول</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCabinetId} onValueChange={setFilterCabinetId}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الكابينة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الكابينات</SelectItem>
                    {cabinetsQuery.data?.map((cab: any) => (
                      <SelectItem key={cab.id} value={cab.id.toString()}>{cab.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => metersQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>الرقم التسلسلي</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الكابينة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>آخر قراءة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredMeters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">لا توجد عدادات</TableCell>
                    </TableRow>
                  ) : (
                    filteredMeters.map((meter) => {
                      const status = getStatusLabel(meter.status);
                      return (
                        <TableRow key={meter.id}>
                          <TableCell className="font-medium">{meter.meterNumber}</TableCell>
                          <TableCell>{meter.serialNumber || "-"}</TableCell>
                          <TableCell>{getMeterTypeLabel(meter.meterType)}</TableCell>
                          <TableCell>{getServiceTypeLabel(meter.serviceType)}</TableCell>
                          <TableCell>{meter.cabinet?.name || "-"}</TableCell>
                          <TableCell>
                            {meter.customer ? (
                              <div>
                                <div className="font-medium">{meter.customer.fullName}</div>
                                <div className="text-xs text-muted-foreground">{meter.customer.accountNumber}</div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-orange-600">غير مربوط</Badge>
                            )}
                          </TableCell>
                          <TableCell>{meter.lastReadingValue || "0"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(meter)} title="تعديل">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {!meter.customerId && (
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedMeter(meter); setShowLinkDialog(true); }} title="ربط بعميل">
                                  <UserPlus className="h-4 w-4 text-blue-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedMeter(meter); setShowQRDialog(true); }} title="QR Code">
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(meter.id)} className="text-red-500" title="حذف">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingMeter ? "تعديل عداد" : "إضافة عداد جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>رقم العداد *</Label>
                    <Input value={formData.meterNumber} onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })} required placeholder="MTR-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>الرقم التسلسلي</Label>
                    <Input value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العداد</Label>
                    <Select value={formData.meterType} onValueChange={(v) => setFormData({ ...formData, meterType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_phase">أحادي الطور</SelectItem>
                        <SelectItem value="three_phase">ثلاثي الطور</SelectItem>
                        <SelectItem value="prepaid">مسبق الدفع</SelectItem>
                        <SelectItem value="smart">ذكي</SelectItem>
                        <SelectItem value="mechanical">ميكانيكي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الخدمة</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">كهرباء</SelectItem>
                        <SelectItem value="water">ماء</SelectItem>
                        <SelectItem value="gas">غاز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الحالة</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">جديد</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="suspended">موقوف</SelectItem>
                        <SelectItem value="disconnected">مفصول</SelectItem>
                        <SelectItem value="faulty">معطل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الكابينة</Label>
                    <Select value={formData.cabinetId} onValueChange={(v) => setFormData({ ...formData, cabinetId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر الكابينة" /></SelectTrigger>
                      <SelectContent>
                        {cabinetsQuery.data?.map((cab: any) => (
                          <SelectItem key={cab.id} value={cab.id.toString()}>{cab.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التعرفة</Label>
                    <Select value={formData.tariffId} onValueChange={(v) => setFormData({ ...formData, tariffId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر التعرفة" /></SelectTrigger>
                      <SelectContent>
                        {tariffsQuery.data?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>معامل الضرب</Label>
                    <Input type="number" step="0.01" value={formData.multiplier} onChange={(e) => setFormData({ ...formData, multiplier: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد الخانات</Label>
                    <Input type="number" value={formData.digits} onChange={(e) => setFormData({ ...formData, digits: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التركيب</Label>
                    <Input type="date" value={formData.installationDate} onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingMeter ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unlinked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>العدادات غير المربوطة بعملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم العداد</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الكابينة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meters.filter(m => !m.customerId).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">جميع العدادات مربوطة بعملاء</TableCell>
                    </TableRow>
                  ) : (
                    meters.filter(m => !m.customerId).map((meter) => {
                      const status = getStatusLabel(meter.status);
                      return (
                        <TableRow key={meter.id}>
                          <TableCell className="font-medium">{meter.meterNumber}</TableCell>
                          <TableCell>{getMeterTypeLabel(meter.meterType)}</TableCell>
                          <TableCell>{meter.cabinet?.name || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>{status.label}</span>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedMeter(meter); setShowLinkDialog(true); }}>
                              <UserPlus className="h-4 w-4 ml-2" />
                              ربط بعميل
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog ربط العداد بعميل */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط العداد بعميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">العداد: <strong>{selectedMeter?.meterNumber}</strong></p>
            </div>
            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select value={linkData.customerId} onValueChange={(v) => setLinkData({ ...linkData, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  {customersQuery.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.fullName} - {c.accountNumber}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>تاريخ التركيب</Label>
              <Input type="date" value={linkData.installationDate} onChange={(e) => setLinkData({ ...linkData, installationDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>القراءة الافتتاحية</Label>
              <Input type="number" value={linkData.initialReading} onChange={(e) => setLinkData({ ...linkData, initialReading: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>إلغاء</Button>
              <Button onClick={handleLinkCustomer} disabled={loading || !linkData.customerId}>
                {loading ? "جاري الربط..." : "ربط"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code للعداد</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{selectedMeter?.meterNumber}</p>
            <Button variant="outline">طباعة QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
