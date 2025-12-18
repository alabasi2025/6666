import { useState, useEffect } from "react";
import { trpc } from "../../../_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, Search, RefreshCw, Calendar, Play, CheckCircle, FileText, Calculator, ArrowRight, AlertCircle } from "lucide-react";

interface BillingPeriod {
  id: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  status: string;
  totalMeters: number;
  readingsCount: number;
  approvedReadingsCount: number;
  invoicesCount: number;
  totalAmount: string;
  collectedAmount: string;
  createdAt: string;
}

export default function BillingPeriodsManagement() {
  const [periods, setPeriods] = useState<BillingPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPeriod, setEditingPeriod] = useState<BillingPeriod | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod | null>(null);
  const [showWorkflowDialog, setShowWorkflowDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    startDate: "",
    endDate: "",
    dueDate: "",
  });

  const periodsQuery = trpc.billing.getBillingPeriods.useQuery();
  const createPeriodMutation = trpc.billing.createBillingPeriod.useMutation();
  const updatePeriodMutation = trpc.billing.updateBillingPeriod.useMutation();
  const deletePeriodMutation = trpc.billing.deleteBillingPeriod.useMutation();
  const updatePeriodStatusMutation = trpc.billing.updateBillingPeriodStatus.useMutation();
  const generateInvoicesMutation = trpc.billing.generateInvoices.useMutation();

  useEffect(() => {
    if (periodsQuery.data) {
      setPeriods(periodsQuery.data);
    }
  }, [periodsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        dueDate: formData.dueDate,
      };
      
      if (editingPeriod) {
        await updatePeriodMutation.mutateAsync({ id: editingPeriod.id, ...data });
      } else {
        await createPeriodMutation.mutateAsync(data);
      }
      periodsQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving period:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (period: BillingPeriod, newStatus: string) => {
    try {
      await updatePeriodStatusMutation.mutateAsync({ id: period.id, status: newStatus as any });
      periodsQuery.refetch();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleGenerateInvoices = async (period: BillingPeriod) => {
    if (confirm("هل أنت متأكد من توليد الفواتير لهذه الفترة؟")) {
      setLoading(true);
      try {
        await generateInvoicesMutation.mutateAsync({ billingPeriodId: period.id });
        periodsQuery.refetch();
      } catch (error) {
        console.error("Error generating invoices:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (period: BillingPeriod) => {
    setEditingPeriod(period);
    setFormData({
      code: period.code,
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      dueDate: period.dueDate,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الفترة؟")) {
      try {
        await deletePeriodMutation.mutateAsync({ id });
        periodsQuery.refetch();
      } catch (error) {
        console.error("Error deleting period:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: "", name: "", startDate: "", endDate: "", dueDate: "" });
    setEditingPeriod(null);
  };

  const generateCode = () => {
    const date = new Date();
    const code = `BP-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
    setFormData({ ...formData, code });
  };

  const filteredPeriods = periods.filter((period) => {
    const matchesSearch =
      period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      period.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || period.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; step: number }> = {
      pending: { label: "معلق", color: "bg-gray-100 text-gray-800", step: 0 },
      active: { label: "نشط", color: "bg-blue-100 text-blue-800", step: 1 },
      reading_phase: { label: "مرحلة القراءات", color: "bg-yellow-100 text-yellow-800", step: 2 },
      billing_phase: { label: "مرحلة الفوترة", color: "bg-orange-100 text-orange-800", step: 3 },
      closed: { label: "مغلق", color: "bg-green-100 text-green-800", step: 4 },
    };
    return statuses[status] || { label: status, color: "bg-gray-100 text-gray-800", step: 0 };
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: Record<string, string> = {
      pending: "active",
      active: "reading_phase",
      reading_phase: "billing_phase",
      billing_phase: "closed",
    };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels: Record<string, string> = {
      pending: "تفعيل الفترة",
      active: "بدء مرحلة القراءات",
      reading_phase: "بدء مرحلة الفوترة",
      billing_phase: "إغلاق الفترة",
    };
    return labels[currentStatus];
  };

  const workflowSteps = [
    { id: "pending", label: "إنشاء الفترة", icon: Calendar },
    { id: "active", label: "تفعيل", icon: Play },
    { id: "reading_phase", label: "القراءات", icon: FileText },
    { id: "billing_phase", label: "الفوترة", icon: Calculator },
    { id: "closed", label: "إغلاق", icon: CheckCircle },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">فترات الفوترة</h1>
          <p className="text-muted-foreground">إدارة فترات الفوترة وسير العمل</p>
        </div>
        <Button onClick={() => setActiveTab("add")}>
          <Calendar className="h-4 w-4 ml-2" />
          إضافة فترة
        </Button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{periods.length}</div>
            <p className="text-muted-foreground text-sm">إجمالي الفترات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {periods.filter(p => p.status === "active" || p.status === "reading_phase" || p.status === "billing_phase").length}
            </div>
            <p className="text-muted-foreground text-sm">فترات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {periods.reduce((sum, p) => sum + parseFloat(p.totalAmount || "0"), 0).toLocaleString()} ر.س
            </div>
            <p className="text-muted-foreground text-sm">إجمالي الفواتير</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">
              {periods.reduce((sum, p) => sum + parseFloat(p.collectedAmount || "0"), 0).toLocaleString()} ر.س
            </div>
            <p className="text-muted-foreground text-sm">إجمالي التحصيل</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">فترات الفوترة</TabsTrigger>
          <TabsTrigger value="add">{editingPeriod ? "تعديل فترة" : "إضافة فترة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                قائمة فترات الفوترة
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="reading_phase">مرحلة القراءات</SelectItem>
                    <SelectItem value="billing_phase">مرحلة الفوترة</SelectItem>
                    <SelectItem value="closed">مغلق</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => periodsQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                    <TableHead>القراءات</TableHead>
                    <TableHead>الفواتير</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredPeriods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">لا توجد فترات</TableCell>
                    </TableRow>
                  ) : (
                    filteredPeriods.map((period) => {
                      const statusInfo = getStatusInfo(period.status);
                      const readingProgress = period.totalMeters > 0 ? (period.readingsCount / period.totalMeters) * 100 : 0;
                      return (
                        <TableRow key={period.id}>
                          <TableCell className="font-medium">{period.code}</TableCell>
                          <TableCell>{period.name}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(period.startDate).toLocaleDateString("ar-SA")}</div>
                              <div className="text-muted-foreground">{new Date(period.endDate).toLocaleDateString("ar-SA")}</div>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(period.dueDate).toLocaleDateString("ar-SA")}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{period.approvedReadingsCount}/{period.readingsCount}/{period.totalMeters}</div>
                              <Progress value={readingProgress} className="h-1" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{period.invoicesCount}</div>
                              <div className="text-xs text-muted-foreground">{parseFloat(period.totalAmount || "0").toLocaleString()} ر.س</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>{statusInfo.label}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedPeriod(period); setShowWorkflowDialog(true); }} title="سير العمل">
                                <Play className="h-4 w-4 text-blue-500" />
                              </Button>
                              {period.status === "billing_phase" && (
                                <Button variant="ghost" size="icon" onClick={() => handleGenerateInvoices(period)} title="توليد الفواتير">
                                  <Calculator className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(period)} title="تعديل" disabled={period.status !== "pending"}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(period.id)} className="text-red-500" title="حذف" disabled={period.status !== "pending"}>
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
              <CardTitle>{editingPeriod ? "تعديل فترة فوترة" : "إضافة فترة فوترة جديدة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الكود *</Label>
                    <div className="flex gap-2">
                      <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                      <Button type="button" variant="outline" onClick={generateCode}>توليد</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اسم الفترة *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="فترة يناير 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ البداية *</Label>
                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ النهاية *</Label>
                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق *</Label>
                    <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingPeriod ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog سير العمل */}
      <Dialog open={showWorkflowDialog} onOpenChange={setShowWorkflowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>سير عمل فترة الفوترة</DialogTitle>
            <DialogDescription>{selectedPeriod?.name}</DialogDescription>
          </DialogHeader>
          {selectedPeriod && (
            <div className="space-y-6">
              {/* خطوات سير العمل */}
              <div className="flex items-center justify-between">
                {workflowSteps.map((step, index) => {
                  const statusInfo = getStatusInfo(selectedPeriod.status);
                  const isActive = step.id === selectedPeriod.status;
                  const isCompleted = statusInfo.step > workflowSteps.findIndex(s => s.id === step.id);
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className={`flex flex-col items-center ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? "bg-blue-100" : isCompleted ? "bg-green-100" : "bg-gray-100"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs mt-1">{step.label}</span>
                      </div>
                      {index < workflowSteps.length - 1 && (
                        <ArrowRight className={`h-4 w-4 mx-2 ${isCompleted ? "text-green-600" : "text-gray-300"}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* معلومات الفترة */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-muted-foreground">القراءات</Label>
                  <p className="font-semibold">{selectedPeriod.readingsCount} / {selectedPeriod.totalMeters}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">القراءات المعتمدة</Label>
                  <p className="font-semibold">{selectedPeriod.approvedReadingsCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الفواتير</Label>
                  <p className="font-semibold">{selectedPeriod.invoicesCount}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">إجمالي المبلغ</Label>
                  <p className="font-semibold">{parseFloat(selectedPeriod.totalAmount || "0").toLocaleString()} ر.س</p>
                </div>
              </div>

              {/* إجراءات */}
              {selectedPeriod.status !== "closed" && (
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">الخطوة التالية</p>
                    <p className="text-sm text-muted-foreground">{getNextStatusLabel(selectedPeriod.status)}</p>
                  </div>
                  <Button onClick={() => {
                    const nextStatus = getNextStatus(selectedPeriod.status);
                    if (nextStatus) {
                      handleStatusChange(selectedPeriod, nextStatus);
                      setShowWorkflowDialog(false);
                    }
                  }}>
                    <ArrowRight className="h-4 w-4 ml-2" />
                    {getNextStatusLabel(selectedPeriod.status)}
                  </Button>
                </div>
              )}

              {selectedPeriod.status === "billing_phase" && (
                <div className="flex justify-center">
                  <Button variant="default" size="lg" onClick={() => handleGenerateInvoices(selectedPeriod)} disabled={loading}>
                    <Calculator className="h-4 w-4 ml-2" />
                    {loading ? "جاري التوليد..." : "توليد الفواتير"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
