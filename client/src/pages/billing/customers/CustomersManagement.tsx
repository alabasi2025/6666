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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Search, RefreshCw, Users, Eye, Ban, CheckCircle, Key, Wallet, FileText, AlertTriangle, History, RefreshCcw } from "lucide-react";
import { useBusinessId } from "@/contexts/BusinessContext";

interface Customer {
  id: number;
  accountNumber: string;
  fullName: string;
  fullNameEn?: string;
  customerType: string;
  category: string;
  phone: string;
  phone2?: string;
  email?: string;
  nationalId?: string;
  address?: string;
  status: string;
  balance: string;
  isActive: boolean;
  createdAt: string;
  meters?: any[];
}

export default function CustomersManagement() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showLinkStationDialog, setShowLinkStationDialog] = useState(false);
  const [showLinkBranchDialog, setShowLinkBranchDialog] = useState(false);
  const [selectedStations, setSelectedStations] = useState<number[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [formSelectedBranches, setFormSelectedBranches] = useState<number[]>([]); // ✅ الفروع المختارة في النموذج
  
  const [formData, setFormData] = useState({
    accountNumber: "",
    fullName: "",
    fullNameEn: "",
    customerType: "individual",
    category: "residential",
    serviceTier: "basic" as "basic" | "premium" | "vip",
    phone: "",
    phone2: "",
    email: "",
    nationalId: "",
    address: "",
    branchId: undefined as number | undefined,
    stationId: undefined as number | undefined,
  });

  const [primaryBranchId, setPrimaryBranchId] = useState<number | null>(null);
  const [primaryStationId, setPrimaryStationId] = useState<number | null>(null);

  const [newPassword, setNewPassword] = useState("");

  const customersQuery = trpc.billing.getCustomers.useQuery();
  const createCustomerMutation = trpc.billing.createCustomer.useMutation();
  const updateCustomerMutation = trpc.billing.updateCustomer.useMutation();
  const deleteCustomerMutation = trpc.billing.deleteCustomer.useMutation();
  const toggleCustomerStatusMutation = trpc.billing.toggleCustomerStatus.useMutation();
  const resetCustomerPasswordMutation = trpc.billing.resetCustomerPassword.useMutation();
  
  // ✅ تحديث حالة العملاء
  const updateCustomerStatusMutation = trpc.customerSystem.updateCustomerStatus.useMutation();
  const updateAllCustomersStatusMutation = trpc.customerSystem.updateAllCustomersStatus.useMutation();
  const getCustomerStatusQuery = trpc.customerSystem.getCustomerStatus.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer }
  );
  const getCustomerStatusHistoryQuery = trpc.customerSystem.getCustomerStatusHistory.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer }
  );
  
  const businessId = useBusinessId();
  
  // استعلامات الربط
  const stationsQuery = trpc.station.list.useQuery();
  const branchesQuery = trpc.branch.list.useQuery();
  const linkStationsMutation = trpc.customerSystem.linkCustomerToStations.useMutation();
  const linkBranchesMutation = trpc.customerSystem.linkCustomerToBranches.useMutation();
  const customerStationsQuery = trpc.customerSystem.getCustomerStations.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer }
  );
  const customerBranchesQuery = trpc.customerSystem.getCustomerBranches.useQuery(
    { customerId: selectedCustomer?.id || 0 },
    { enabled: !!selectedCustomer }
  );

  useEffect(() => {
    if (customersQuery.data) {
      setCustomers(customersQuery.data as any);
    }
  }, [customersQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        accountNumber: (formData as any).accountNumber,
        fullName: (formData as any).fullName,
        fullNameEn: (formData as any).fullNameEn || undefined,
        customerType: (formData as any).customerType as any,
        category: (formData as any).category as any,
        serviceTier: (formData as any).serviceTier as any,
        phone: (formData as any).phone,
        phone2: (formData as any).phone2 || undefined,
        email: (formData as any).email || undefined,
        nationalId: (formData as any).nationalId || undefined,
        address: (formData as any).address || undefined,
        branchId: (formData as any).branchId || undefined,
        stationId: (formData as any).stationId || undefined,
      };
      
      if (editingCustomer) {
        await updateCustomerMutation.mutateAsync({ id: editingCustomer.id, ...data } as any);
      } else {
        const result = await createCustomerMutation.mutateAsync({ ...data, businessId } as any);
        
        // ✅ ربط الفروع المختارة بالعميل الجديد
        if (result?.id && formSelectedBranches.length > 0) {
          try {
            await linkBranchesMutation.mutateAsync({
              customerId: result.id,
              branchIds: formSelectedBranches,
            });
            toast({
              title: "تم بنجاح",
              description: `تم إنشاء العميل وربط ${formSelectedBranches.length} فرع(أ) بنجاح`,
            });
          } catch (linkError: any) {
            toast({
              title: "تحذير",
              description: `تم إنشاء العميل لكن فشل ربط الفروع: ${linkError.message}`,
              variant: "destructive",
            });
          }
        }
      }
      customersQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      accountNumber: (customer as any).accountNumber,
      fullName: (customer as any).fullName,
      fullNameEn: (customer as any).fullNameEn || "",
      customerType: (customer as any).customerType,
      category: (customer as any).category,
      serviceTier: (customer as any).serviceTier || "basic",
      phone: (customer as any).phone,
      phone2: (customer as any).phone2 || "",
      email: (customer as any).email || "",
      nationalId: (customer as any).nationalId || "",
      address: (customer as any).address || "",
      branchId: (customer as any).branchId,
      stationId: (customer as any).stationId,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      try {
        await deleteCustomerMutation.mutateAsync({ id } as any);
        customersQuery.refetch();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    const action = (customer as any).isActive ? "حظر" : "تفعيل";
    if (confirm(`هل أنت متأكد من ${action} هذا العميل؟`)) {
      try {
        await toggleCustomerStatusMutation.mutateAsync({ id: (customer as any).id, isActive: !(customer as any).isActive } as any);
        customersQuery.refetch();
      } catch (error) {
        console.error("Error toggling status:", error);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!selectedCustomer || !newPassword) return;
    try {
      await resetCustomerPasswordMutation.mutateAsync({ id: selectedCustomer.id, newPassword } as any);
      setShowResetPasswordDialog(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const handleLinkStations = async () => {
    if (!selectedCustomer || selectedStations.length === 0) return;
    try {
      await linkStationsMutation.mutateAsync({
        customerId: selectedCustomer.id,
        stationIds: selectedStations,
      });
      customerStationsQuery.refetch();
      setShowLinkStationDialog(false);
      setSelectedStations([]);
    } catch (error) {
      console.error("Error linking stations:", error);
    }
  };

  const handleLinkBranches = async () => {
    if (!selectedCustomer || selectedBranches.length === 0) return;
    try {
      await linkBranchesMutation.mutateAsync({
        customerId: selectedCustomer.id,
        branchIds: selectedBranches,
      });
      customerBranchesQuery.refetch();
      setShowLinkBranchDialog(false);
      setSelectedBranches([]);
    } catch (error) {
      console.error("Error linking branches:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      accountNumber: "",
      fullName: "",
      fullNameEn: "",
      customerType: "individual",
      category: "residential",
      serviceTier: "basic",
      phone: "",
      phone2: "",
      email: "",
      nationalId: "",
      address: "",
      branchId: undefined,
      stationId: undefined,
    });
    setEditingCustomer(null);
    setPrimaryBranchId(null);
    setPrimaryStationId(null);
    setFormSelectedBranches([]); // ✅ إعادة تعيين الفروع المختارة
  };

  const generateAccountNumber = () => {
    const num = Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData({ ...formData, accountNumber: num });
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      (customer as any).fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer as any).accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer as any).phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && (customer as any).isActive) ||
      (filterStatus === "inactive" && !(customer as any).isActive);
    const matchesCategory = filterCategory === "all" || (customer as any).category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusLabel = (status: string, isActive: boolean, balanceDue?: number) => {
    if (!isActive) return { label: "محظور", color: "bg-red-100 text-red-800", icon: Ban };
    const statuses: Record<string, { label: string; color: string; icon: any }> = {
      active: { label: "نشط", color: "bg-green-100 text-green-800", icon: CheckCircle },
      inactive: { label: "غير نشط", color: "bg-gray-100 text-gray-800", icon: Ban },
      suspended: { label: "موقوف", color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
      disconnected: { label: "مفصول", color: "bg-red-100 text-red-800", icon: Ban },
      pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
      closed: { label: "مغلق", color: "bg-gray-100 text-gray-800", icon: Ban },
    };
    return statuses[status] || { label: status, color: "bg-gray-100 text-gray-800", icon: AlertTriangle };
  };

  // ✅ تحديث حالة عميل واحد
  const handleUpdateCustomerStatus = async (customerId: number) => {
    try {
      await updateCustomerStatusMutation.mutateAsync({
        customerId,
        sendNotification: true,
      });
      customersQuery.refetch();
      if (selectedCustomer?.id === customerId) {
        getCustomerStatusQuery.refetch();
        getCustomerStatusHistoryQuery.refetch();
      }
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة العميل بنجاح",
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث حالة العميل",
        variant: "destructive",
      });
    }
  };

  // ✅ تحديث حالة جميع العملاء
  const handleUpdateAllCustomersStatus = async () => {
    if (!confirm("هل أنت متأكد من تحديث حالة جميع العملاء؟")) return;
    try {
      const result = await updateAllCustomersStatusMutation.mutateAsync({
        businessId,
        sendNotification: true,
      });
      customersQuery.refetch();
      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة ${result.totalUpdated} عميل من أصل ${result.totalProcessed}`,
      });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل تحديث حالة العملاء",
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      residential: "سكني",
      commercial: "تجاري",
      industrial: "صناعي",
      governmental: "حكومي",
      agricultural: "زراعي",
    };
    return categories[category] || category;
  };

  const getCustomerTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      individual: "فرد",
      company: "شركة",
      organization: "مؤسسة",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة العملاء</h1>
          <p className="text-muted-foreground">إضافة وتعديل وإدارة بيانات العملاء</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleUpdateAllCustomersStatus} disabled={updateAllCustomersStatusMutation.isPending}>
            <RefreshCcw className="h-4 w-4 ml-2" />
            {updateAllCustomersStatusMutation.isPending ? "جاري التحديث..." : "تحديث حالات العملاء"}
          </Button>
          <Button onClick={() => setActiveTab("add")}>
            <Users className="h-4 w-4 ml-2" />
            إضافة عميل
          </Button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-muted-foreground text-sm">إجمالي العملاء</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{customers.filter(c => c.isActive).length}</div>
            <p className="text-muted-foreground text-sm">العملاء النشطين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{customers.filter(c => !c.isActive).length}</div>
            <p className="text-muted-foreground text-sm">العملاء المحظورين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {customers.reduce((sum, c) => sum + parseFloat(c.balance || "0"), 0).toLocaleString()} ر.س
            </div>
            <p className="text-muted-foreground text-sm">إجمالي الأرصدة</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">العملاء</TabsTrigger>
          <TabsTrigger value="add">{editingCustomer ? "تعديل عميل" : "إضافة عميل"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                قائمة العملاء ({filteredCustomers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="residential">سكني</SelectItem>
                    <SelectItem value="commercial">تجاري</SelectItem>
                    <SelectItem value="industrial">صناعي</SelectItem>
                    <SelectItem value="governmental">حكومي</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">محظور</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => customersQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>الرصيد المستحق</TableHead>
                    <TableHead>العدادات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">لا يوجد عملاء</TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const balanceDue = parseFloat((customer as any).balanceDue || "0");
                      const status = getStatusLabel((customer as any).status, (customer as any).isActive, balanceDue);
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={(customer as any).id}>
                          <TableCell className="font-medium">{(customer as any).accountNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{(customer as any).fullName}</div>
                              {(customer as any).fullNameEn && <div className="text-xs text-muted-foreground">{(customer as any).fullNameEn}</div>}
                            </div>
                          </TableCell>
                          <TableCell>{getCustomerTypeLabel((customer as any).customerType)}</TableCell>
                          <TableCell>{getCategoryLabel((customer as any).category)}</TableCell>
                          <TableCell dir="ltr">{(customer as any).phone}</TableCell>
                          <TableCell className={parseFloat((customer as any).balance || "0") < 0 ? "text-red-600" : "text-green-600"}>
                            {parseFloat((customer as any).balance || "0").toLocaleString()} ر.س
                          </TableCell>
                          <TableCell className={balanceDue > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                            {balanceDue > 0 ? (
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {balanceDue.toLocaleString()} ر.س
                              </div>
                            ) : (
                              "0.00 ر.س"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{(customer as any).meters?.length || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setShowDetailsDialog(true); }} title="عرض التفاصيل">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleUpdateCustomerStatus((customer as any).id)} title="تحديث الحالة" disabled={updateCustomerStatusMutation.isPending}>
                                <RefreshCcw className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} title="تعديل">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(customer)} title={(customer as any).isActive ? "حظر" : "تفعيل"}>
                                {(customer as any).isActive ? <Ban className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete((customer as any).id)} className="text-red-500" title="حذف">
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
              <CardTitle>{editingCustomer ? "تعديل عميل" : "إضافة عميل جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>رقم الحساب *</Label>
                    <div className="flex gap-2">
                      <Input value={(formData as any).accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} required />
                      <Button type="button" variant="outline" onClick={generateAccountNumber}>توليد</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم الكامل *</Label>
                    <Input value={(formData as any).fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={(formData as any).fullNameEn} onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العميل</Label>
                    <Select value={(formData as any).customerType} onValueChange={(v) => setFormData({ ...formData, customerType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">فرد</SelectItem>
                        <SelectItem value="company">شركة</SelectItem>
                        <SelectItem value="organization">مؤسسة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الفئة</Label>
                    <Select value={(formData as any).category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">سكني</SelectItem>
                        <SelectItem value="commercial">تجاري</SelectItem>
                        <SelectItem value="industrial">صناعي</SelectItem>
                        <SelectItem value="governmental">حكومي</SelectItem>
                        <SelectItem value="agricultural">زراعي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>مستوى الخدمة</Label>
                    <Select value={(formData as any).serviceTier} onValueChange={(v) => setFormData({ ...formData, serviceTier: v as any })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">أساسي</SelectItem>
                        <SelectItem value="premium">مميز</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهاتف *</Label>
                    <Input value={(formData as any).phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم هاتف إضافي</Label>
                    <Input value={(formData as any).phone2} onChange={(e) => setFormData({ ...formData, phone2: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input type="email" value={(formData as any).email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهوية</Label>
                    <Input value={(formData as any).nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>الفروع المرتبطة</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-muted/50">
                      {branchesQuery.isLoading ? (
                        <p className="text-sm text-muted-foreground">جاري تحميل الفروع...</p>
                      ) : branchesQuery.data?.data && branchesQuery.data.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {branchesQuery.data.data.map((branch: any) => (
                            <label key={branch.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-background rounded cursor-pointer">
                              <Checkbox
                                checked={formSelectedBranches.includes(branch.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setFormSelectedBranches([...formSelectedBranches, branch.id]);
                                  } else {
                                    setFormSelectedBranches(formSelectedBranches.filter(id => id !== branch.id));
                                  }
                                }}
                              />
                              <span className="flex-1 text-sm font-medium">{branch.nameAr}</span>
                              {branch.city && (
                                <Badge variant="outline" className="text-xs">{branch.city}</Badge>
                              )}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">لا توجد فروع متاحة</p>
                      )}
                    </div>
                    {formSelectedBranches.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        تم اختيار {formSelectedBranches.length} فرع(أ)
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>المحطة</Label>
                    <Select value={formData.stationId?.toString() || "none"} onValueChange={(v) => setFormData({ ...formData, stationId: v === "none" ? undefined : parseInt(v) })}>
                      <SelectTrigger><SelectValue placeholder="اختر المحطة" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون محطة</SelectItem>
                        {stationsQuery.data?.data?.map((station: any) => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>العنوان</Label>
                    <Textarea value={(formData as any).address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingCustomer ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog تفاصيل العميل */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم الحساب</Label>
                  <p className="font-semibold">{selectedCustomer.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الاسم</Label>
                  <p className="font-semibold">{selectedCustomer.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">النوع</Label>
                  <p>{getCustomerTypeLabel(selectedCustomer.customerType)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الفئة</Label>
                  <p>{getCategoryLabel(selectedCustomer.category)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الهاتف</Label>
                  <p dir="ltr">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                  <p dir="ltr">{selectedCustomer.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">رقم الهوية</Label>
                  <p>{selectedCustomer.nationalId || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الرصيد</Label>
                  <p className={`font-semibold ${parseFloat(selectedCustomer.balance || "0") < 0 ? "text-red-600" : "text-green-600"}`}>
                    {parseFloat(selectedCustomer.balance || "0").toLocaleString()} ر.س
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الرصيد المستحق</Label>
                  <p className={`font-semibold ${getCustomerStatusQuery.data?.balanceDue && getCustomerStatusQuery.data.balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    {getCustomerStatusQuery.data?.balanceDue ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {getCustomerStatusQuery.data.balanceDue.toLocaleString()} ر.س
                      </div>
                    ) : (
                      "0.00 ر.س"
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  {(() => {
                    const status = getStatusLabel(selectedCustomer.status, selectedCustomer.isActive, getCustomerStatusQuery.data?.balanceDue);
                    const StatusIcon = status.icon;
                    return (
                      <Badge className={`${status.color} flex items-center gap-1 w-fit mt-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    );
                  })()}
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ التسجيل</Label>
                  <p>{new Date(selectedCustomer.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCustomer) {
                      handleUpdateCustomerStatus(selectedCustomer.id);
                    }
                  }}
                  disabled={updateCustomerStatusMutation.isPending}
                >
                  <RefreshCcw className="h-4 w-4 ml-2" />
                  {updateCustomerStatusMutation.isPending ? "جاري التحديث..." : "تحديث الحالة"}
                </Button>
              </div>
              
              {/* ✅ تاريخ تغييرات الحالة */}
              {getCustomerStatusHistoryQuery.data && getCustomerStatusHistoryQuery.data.data.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <History className="h-4 w-4" />
                      تاريخ تغييرات الحالة
                    </Label>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getCustomerStatusHistoryQuery.data.data.map((history: any, index: number) => {
                      const oldStatus = getStatusLabel(history.old_status, true, history.balance_due);
                      const newStatus = getStatusLabel(history.new_status, true, history.balance_due);
                      const OldStatusIcon = oldStatus.icon;
                      const NewStatusIcon = newStatus.icon;
                      return (
                        <div key={index} className="p-3 border rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <OldStatusIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{oldStatus.label}</span>
                              <span className="text-muted-foreground">→</span>
                              <NewStatusIcon className="h-4 w-4" />
                              <Badge className={`${newStatus.color} flex items-center gap-1`}>
                                {newStatus.label}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(history.changed_at).toLocaleString("ar-SA")}
                            </span>
                          </div>
                          {history.balance_due > 0 && (
                            <div className="text-sm text-muted-foreground">
                              الرصيد المستحق: <span className="font-semibold text-red-600">{parseFloat(history.balance_due || "0").toLocaleString()} ر.س</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {selectedCustomer.address && (
                <div>
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p>{selectedCustomer.address}</p>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">المحطات المرتبطة</Label>
                  <Button size="sm" variant="outline" onClick={() => setShowLinkStationDialog(true)}>
                    ربط محطات
                  </Button>
                </div>
                {customerStationsQuery.data && customerStationsQuery.data.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {customerStationsQuery.data.map((station: any) => (
                      <div key={station.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{station.name}</span>
                        <Badge variant="outline">{station.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد محطات مرتبطة</p>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">الفروع المرتبطة</Label>
                  <Button size="sm" variant="outline" onClick={() => setShowLinkBranchDialog(true)}>
                    ربط فروع
                  </Button>
                </div>
                {customerBranchesQuery.data && customerBranchesQuery.data.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {customerBranchesQuery.data.map((branch: any) => (
                      <div key={branch.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{branch.name}</span>
                        <Badge variant="outline">{branch.city}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد فروع مرتبطة</p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">العدادات المرتبطة</Label>
                {selectedCustomer.meters && selectedCustomer.meters.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {((selectedCustomer as any).meters || []).map((meter: any) => (
                      <div key={(meter as any).id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{(meter as any).meterNumber}</span>
                        <Badge variant="outline">{(meter as any).serviceType}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا توجد عدادات مرتبطة</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog ربط المحطات */}
      <Dialog open={showLinkStationDialog} onOpenChange={setShowLinkStationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط المحطات بالعميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>تصفية حسب الفرع (اختياري)</Label>
              <Select value={formData.branchId?.toString() || "all"} onValueChange={(v) => setFormData({ ...formData, branchId: v === "all" ? undefined : parseInt(v) })}>
                <SelectTrigger><SelectValue placeholder="كل الفروع" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفروع</SelectItem>
                  {branchesQuery.data?.data?.map((branch: any) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اختر المحطات</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {stationsQuery.data?.data?.filter((station: any) => !formData.branchId || station.branchId === formData.branchId).map((station: any) => (
                  <label key={station.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStations.includes(station.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStations([...selectedStations, station.id]);
                        } else {
                          setSelectedStations(selectedStations.filter(id => id !== station.id));
                          if (primaryStationId === station.id) setPrimaryStationId(null);
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{station.nameAr}</span>
                    {selectedStations.includes(station.id) && (
                      <label className="flex items-center gap-2 text-sm text-blue-600">
                        <input
                          type="radio"
                          name="primaryStation"
                          checked={primaryStationId === station.id}
                          onChange={() => setPrimaryStationId(station.id)}
                          className="h-4 w-4"
                        />
                        أساسي
                      </label>
                    )}
                    <Badge variant="outline">{station.type}</Badge>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkStationDialog(false)}>إلغاء</Button>
              <Button onClick={handleLinkStations} disabled={selectedStations.length === 0}>
                ربط ({selectedStations.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ربط الفروع */}
      <Dialog open={showLinkBranchDialog} onOpenChange={setShowLinkBranchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط الفروع بالعميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>اختر الفروع</Label>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {branchesQuery.data?.data?.map((branch: any) => (
                  <label key={branch.id} className="flex items-center space-x-2 space-x-reverse p-2 hover:bg-muted rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBranches.includes(branch.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBranches([...selectedBranches, branch.id]);
                        } else {
                          setSelectedBranches(selectedBranches.filter(id => id !== branch.id));
                          if (primaryBranchId === branch.id) setPrimaryBranchId(null);
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span className="flex-1">{branch.nameAr}</span>
                    {selectedBranches.includes(branch.id) && (
                      <label className="flex items-center gap-2 text-sm text-blue-600">
                        <input
                          type="radio"
                          name="primaryBranch"
                          checked={primaryBranchId === branch.id}
                          onChange={() => setPrimaryBranchId(branch.id)}
                          className="h-4 w-4"
                        />
                        أساسي
                      </label>
                    )}
                    <Badge variant="outline">{branch.city}</Badge>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLinkBranchDialog(false)}>إلغاء</Button>
              <Button onClick={handleLinkBranches} disabled={selectedBranches.length === 0}>
                ربط ({selectedBranches.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog إعادة تعيين كلمة المرور */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>العميل: <strong>{selectedCustomer?.fullName}</strong></p>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>إلغاء</Button>
              <Button onClick={handleResetPassword} disabled={!newPassword}>تعيين</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
