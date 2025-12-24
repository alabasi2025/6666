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
import { Edit, Trash2, Search, RefreshCw, Users, Eye, Ban, CheckCircle, Key, Wallet, FileText } from "lucide-react";

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
  
  const [formData, setFormData] = useState({
    accountNumber: "",
    fullName: "",
    fullNameEn: "",
    customerType: "individual",
    category: "residential",
    phone: "",
    phone2: "",
    email: "",
    nationalId: "",
    address: "",
  });

  const [newPassword, setNewPassword] = useState("");

  const customersQuery = trpc.billing.getCustomers.useQuery();
  const createCustomerMutation = trpc.billing.createCustomer.useMutation();
  const updateCustomerMutation = trpc.billing.updateCustomer.useMutation();
  const deleteCustomerMutation = trpc.billing.deleteCustomer.useMutation();
  const toggleCustomerStatusMutation = trpc.billing.toggleCustomerStatus.useMutation();
  const resetCustomerPasswordMutation = trpc.billing.resetCustomerPassword.useMutation();

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
        accountNumber: formData.accountNumber,
        fullName: formData.fullName,
        fullNameEn: formData.fullNameEn || undefined,
        customerType: formData.customerType as any,
        category: formData.category as any,
        phone: formData.phone,
        phone2: formData.phone2 || undefined,
        email: formData.email || undefined,
        nationalId: formData.nationalId || undefined,
        address: formData.address || undefined,
      };
      
      if (editingCustomer) {
        await updateCustomerMutation.mutateAsync({ id: editingCustomer.id, ...data });
      } else {
        await createCustomerMutation.mutateAsync(data);
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
      accountNumber: customer.accountNumber,
      fullName: customer.fullName,
      fullNameEn: customer.fullNameEn || "",
      customerType: customer.customerType,
      category: customer.category,
      phone: customer.phone,
      phone2: customer.phone2 || "",
      email: customer.email || "",
      nationalId: customer.nationalId || "",
      address: customer.address || "",
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      try {
        await deleteCustomerMutation.mutateAsync({ id });
        customersQuery.refetch();
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    const action = customer.isActive ? "حظر" : "تفعيل";
    if (confirm(`هل أنت متأكد من ${action} هذا العميل؟`)) {
      try {
        await toggleCustomerStatusMutation.mutateAsync({ id: customer.id, isActive: !customer.isActive });
        customersQuery.refetch();
      } catch (error) {
        console.error("Error toggling status:", error);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!selectedCustomer || !newPassword) return;
    try {
      await resetCustomerPasswordMutation.mutateAsync({ id: selectedCustomer.id, newPassword });
      setShowResetPasswordDialog(false);
      setNewPassword("");
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      accountNumber: "",
      fullName: "",
      fullNameEn: "",
      customerType: "individual",
      category: "residential",
      phone: "",
      phone2: "",
      email: "",
      nationalId: "",
      address: "",
    });
    setEditingCustomer(null);
  };

  const generateAccountNumber = () => {
    const num = Math.floor(100000000 + Math.random() * 900000000).toString();
    setFormData({ ...formData, accountNumber: num });
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && customer.isActive) ||
      (filterStatus === "inactive" && !customer.isActive);
    const matchesCategory = filterCategory === "all" || customer.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusLabel = (status: string, isActive: boolean) => {
    if (!isActive) return { label: "محظور", color: "bg-red-100 text-red-800" };
    const statuses: Record<string, { label: string; color: string }> = {
      active: { label: "نشط", color: "bg-green-100 text-green-800" },
      pending: { label: "معلق", color: "bg-yellow-100 text-yellow-800" },
      suspended: { label: "موقوف", color: "bg-orange-100 text-orange-800" },
    };
    return statuses[status] || { label: status, color: "bg-gray-100 text-gray-800" };
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
        <Button onClick={() => setActiveTab("add")}>
          <Users className="h-4 w-4 ml-2" />
          إضافة عميل
        </Button>
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
                    <TableHead>العدادات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customersQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">لا يوجد عملاء</TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const status = getStatusLabel(customer.status, customer.isActive);
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.accountNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.fullName}</div>
                              {customer.fullNameEn && <div className="text-xs text-muted-foreground">{customer.fullNameEn}</div>}
                            </div>
                          </TableCell>
                          <TableCell>{getCustomerTypeLabel(customer.customerType)}</TableCell>
                          <TableCell>{getCategoryLabel(customer.category)}</TableCell>
                          <TableCell dir="ltr">{customer.phone}</TableCell>
                          <TableCell className={parseFloat(customer.balance) < 0 ? "text-red-600" : "text-green-600"}>
                            {parseFloat(customer.balance).toLocaleString()} ر.س
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{customer.meters?.length || 0}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>{status.label}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setShowDetailsDialog(true); }} title="عرض التفاصيل">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} title="تعديل">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedCustomer(customer); setShowResetPasswordDialog(true); }} title="إعادة تعيين كلمة المرور">
                                <Key className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(customer)} title={customer.isActive ? "حظر" : "تفعيل"}>
                                {customer.isActive ? <Ban className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} className="text-red-500" title="حذف">
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
                      <Input value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} required />
                      <Button type="button" variant="outline" onClick={generateAccountNumber}>توليد</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم الكامل *</Label>
                    <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={formData.fullNameEn} onChange={(e) => setFormData({ ...formData, fullNameEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع العميل</Label>
                    <Select value={formData.customerType} onValueChange={(v) => setFormData({ ...formData, customerType: v })}>
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
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
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
                    <Label>رقم الهاتف *</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم هاتف إضافي</Label>
                    <Input value={formData.phone2} onChange={(e) => setFormData({ ...formData, phone2: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>البريد الإلكتروني</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الهوية</Label>
                    <Input value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>العنوان</Label>
                    <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
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
                  <Label className="text-muted-foreground">الرصيد</Label>
                  <p className={`font-semibold ${parseFloat(selectedCustomer.balance) < 0 ? "text-red-600" : "text-green-600"}`}>
                    {parseFloat(selectedCustomer.balance).toLocaleString()} ر.س
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ التسجيل</Label>
                  <p>{new Date(selectedCustomer.createdAt).toLocaleDateString("ar-SA")}</p>
                </div>
              </div>
              {selectedCustomer.address && (
                <div>
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p>{selectedCustomer.address}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">العدادات المرتبطة</Label>
                {selectedCustomer.meters && selectedCustomer.meters.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedCustomer.meters.map((meter: any) => (
                      <div key={meter.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span>{meter.meterNumber}</span>
                        <Badge variant="outline">{meter.serviceType}</Badge>
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
