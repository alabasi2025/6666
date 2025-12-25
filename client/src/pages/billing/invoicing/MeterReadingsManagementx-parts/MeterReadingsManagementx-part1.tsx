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
import { Edit, Trash2, Search, RefreshCw, FileText, CheckCircle, XCircle, Upload, Download, Eye } from "lucide-react";

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
