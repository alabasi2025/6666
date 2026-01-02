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
      setMeters(metersQuery.data as any);
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
        await updateMeterMutation.mutateAsync({ id: editingMeter.id, ...data } as any);
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
      } as any);
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
        await deleteMeterMutation.mutateAsync({ id } as any);
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
