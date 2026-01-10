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
import { Search, RefreshCw, DollarSign, Printer, Eye, Receipt, CreditCard, Banknote, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: number;
  paymentNumber?: string;
  receiptNumber?: string;
  customerId: number;
  subscriptionAccountId?: number;
  subscriptionAccountNumber?: string;
  subscriptionAccountName?: string;
  subscriptionAccountType?: 'sts' | 'iot' | 'regular' | 'government_support';
  customerName: string;
  accountNumber: string;
  invoiceId?: number;
  invoiceNumber?: string;
  amount: string;
  paymentMethod?: string;
  paymentMethodId?: number;
  paymentDate: string;
  referenceNumber?: string;
  cashboxId?: number;
  cashboxName?: string;
  bankId?: number;
  bankName?: string;
  status?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

interface CustomerBalance {
  customerId: number;
  customerName: string;
  accountNumber: string;
  totalInvoices: string;
  totalPaid: string;
  balance: string;
  unpaidInvoices: number;
}

export default function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  
  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    cashboxId: "",
    bankId: "",
    notes: "",
  });

  const paymentsQuery = trpc.billing.getPayments.useQuery();
  const customersQuery = trpc.billing.getCustomers.useQuery();
  const invoicesQuery = trpc.billing.getInvoices.useQuery();
  const cashboxesQuery = trpc.billing.getCashboxes.useQuery();
  const createPaymentMutation = trpc.billing.createPayment.useMutation();

  useEffect(() => {
    if (paymentsQuery.data) {
      setPayments(paymentsQuery.data as any);
    }
  }, [paymentsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPaymentMutation.mutateAsync({
        customerId: parseInt((formData as any).customerId),
        invoiceId: (formData as any).invoiceId ? parseInt((formData as any).invoiceId) : undefined,
        amount: (formData as any).amount,
        paymentMethod: (formData as any).paymentMethod as any,
        paymentDate: (formData as any).paymentDate,
        referenceNumber: (formData as any).referenceNumber || undefined,
        cashboxId: (formData as any).cashboxId ? parseInt((formData as any).cashboxId) : undefined,
        bankId: (formData as any).bankId ? parseInt((formData as any).bankId) : undefined,
        notes: (formData as any).notes || undefined,
      } as any);
      paymentsQuery.refetch();
      resetForm();
      setActiveTab("list");
      setShowPaymentDialog(false);
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      invoiceId: "",
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      referenceNumber: "",
      cashboxId: "",
      bankId: "",
      notes: "",
    });
  };

  const openPaymentDialog = (customer?: CustomerBalance) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({ ...formData, customerId: (customer as any).customerId.toString() });
    }
    setShowPaymentDialog(true);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      (payment as any).receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment as any).accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === "all" || (payment as any).paymentMethod === filterMethod;
    const matchesDate = !filterDate || (payment as any).paymentDate.startsWith(filterDate);
    return matchesSearch && matchesMethod && matchesDate;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return <Banknote className="h-4 w-4" />;
      case "card": return <CreditCard className="h-4 w-4" />;
      case "bank_transfer": return <Building className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: "نقدي",
      card: "بطاقة",
      bank_transfer: "تحويل بنكي",
      check: "شيك",
      online: "إلكتروني",
    };
    return methods[method] || method;
  };

  const totalCollected = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

  // حساب أرصدة العملاء
  const customerBalances: CustomerBalance[] = customersQuery.data?.map(customer => {
    const customerInvoices = invoicesQuery.data?.filter(i => i.customerId === (customer as any).id) || [];
    const totalInvoices = customerInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
    const totalPaid = customerInvoices.reduce((sum, i) => sum + parseFloat(i.paidAmount || "0"), 0);
    const unpaidInvoices = customerInvoices.filter(i => i.status !== 'paid').length;
    return {
      customerId: (customer as any).id,
      customerName: (customer as any).fullName,
      accountNumber: (customer as any).accountNumber,
      totalInvoices: totalInvoices.toString(),
      totalPaid: totalPaid.toString(),
      balance: (totalInvoices - totalPaid).toString(),
      unpaidInvoices,
    };
  }).filter(c => parseFloat(c.balance) > 0) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المدفوعات والتحصيل</h1>
          <p className="text-muted-foreground">تحصيل المدفوعات وإصدار الإيصالات</p>
        </div>
        <Button onClick={() => openPaymentDialog()}>
          <DollarSign className="h-4 w-4 ml-2" />
          تحصيل دفعة
        </Button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-muted-foreground text-sm">إجمالي العمليات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString()} ر.س</div>
            <p className="text-muted-foreground text-sm">إجمالي التحصيل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{payments.filter(p => p.paymentMethod === "cash").length}</div>
            <p className="text-muted-foreground text-sm">مدفوعات نقدية</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{customerBalances.length}</div>
            <p className="text-muted-foreground text-sm">عملاء لديهم مستحقات</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="list">المدفوعات</TabsTrigger>
          <TabsTrigger value="balances">أرصدة العملاء</TabsTrigger>
          <TabsTrigger value="daily">التقرير اليومي</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                سجل المدفوعات ({filteredPayments.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-40" />
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الطريقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                    <SelectItem value="bank_transfer">تحويل</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => paymentsQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الإيصال</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>حساب المشترك</TableHead>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الصندوق</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">لا توجد مدفوعات</TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={(payment as any).id}>
                        <TableCell className="font-medium">{(payment as any).receiptNumber || (payment as any).paymentNumber || '-'}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{(payment as any).customerName}</div>
                            <div className="text-xs text-muted-foreground">{(payment as any).accountNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(payment as any).subscriptionAccountNumber ? (
                            <div>
                              <div className="font-medium text-sm">{(payment as any).subscriptionAccountNumber}</div>
                              {(payment as any).subscriptionAccountName && (
                                <div className="text-xs text-muted-foreground">{(payment as any).subscriptionAccountName}</div>
                              )}
                              {(payment as any).subscriptionAccountType && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {(payment as any).subscriptionAccountType === 'sts' ? 'STS' : 
                                   (payment as any).subscriptionAccountType === 'iot' ? 'IoT' : 
                                   (payment as any).subscriptionAccountType === 'regular' ? 'عادي' : 
                                   (payment as any).subscriptionAccountType === 'government_support' ? 'دعم حكومي' : 
                                   (payment as any).subscriptionAccountType}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{(payment as any).invoiceNumber || "-"}</TableCell>
                        <TableCell className="font-semibold text-green-600">{parseFloat((payment as any).amount || "0").toLocaleString()} ر.س</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon((payment as any).paymentMethod || (payment as any).paymentMethodId)}
                            {getPaymentMethodLabel((payment as any).paymentMethod || (payment as any).paymentMethodId)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date((payment as any).paymentDate).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>{(payment as any).cashboxName || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" title="طباعة الإيصال">
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="عرض التفاصيل">
                              <Eye className="h-4 w-4" />
                            </Button>
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

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                أرصدة العملاء المستحقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحساب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>إجمالي الفواتير</TableHead>
                    <TableHead>المدفوع</TableHead>
                    <TableHead>المستحق</TableHead>
                    <TableHead>فواتير غير مدفوعة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerBalances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">لا توجد مستحقات</TableCell>
                    </TableRow>
                  ) : (
                    customerBalances.map((customer) => (
                      <TableRow key={(customer as any).customerId}>
                        <TableCell className="font-medium">{(customer as any).accountNumber}</TableCell>
                        <TableCell>{(customer as any).customerName}</TableCell>
                        <TableCell>{parseFloat((customer as any).totalInvoices).toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-green-600">{parseFloat((customer as any).totalPaid).toLocaleString()} ر.س</TableCell>
                        <TableCell className="font-semibold text-red-600">{parseFloat((customer as any).balance).toLocaleString()} ر.س</TableCell>
                        <TableCell>
                          <Badge variant="outline">{(customer as any).unpaidInvoices}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => openPaymentDialog(customer)}>
                            <DollarSign className="h-4 w-4 ml-1" />
                            تحصيل
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التقرير اليومي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">
                      {payments.filter(p => p.paymentDate === new Date().toISOString().split("T")[0]).reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} ر.س
                    </div>
                    <p className="text-muted-foreground text-sm">تحصيل اليوم</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">
                      {payments.filter(p => p.paymentDate === new Date().toISOString().split("T")[0]).length}
                    </div>
                    <p className="text-muted-foreground text-sm">عدد العمليات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-600">
                      {payments.filter(p => p.paymentDate === new Date().toISOString().split("T")[0] && p.paymentMethod === "cash").reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} ر.س
                    </div>
                    <p className="text-muted-foreground text-sm">نقدي</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline">
                <Printer className="h-4 w-4 ml-2" />
                طباعة التقرير اليومي
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog تحصيل دفعة */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تحصيل دفعة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>العميل *</Label>
              <Select value={(formData as any).customerId} onValueChange={(v) => setFormData({ ...formData, customerId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                <SelectContent>
                  {customersQuery.data?.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الفاتورة (اختياري)</Label>
              <Select value={(formData as any).invoiceId} onValueChange={(v) => setFormData({ ...formData, invoiceId: v })}>
                <SelectTrigger><SelectValue placeholder="اختر الفاتورة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون فاتورة محددة</SelectItem>
                  {((invoicesQuery.data as any) || []).filter((i: any) => i.customerId?.toString() === (formData as any).customerId && i.status !== 'paid').map((i: any) => (
                    <SelectItem key={i.id} value={i.id?.toString()}>{(i as any).invoiceNo || i.invoiceNumber} - {parseFloat((i as any).balanceDue || '0').toLocaleString()} ر.س</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المبلغ *</Label>
                <Input type="number" step="0.01" value={(formData as any).amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>تاريخ الدفع *</Label>
                <Input type="date" value={(formData as any).paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>طريقة الدفع</Label>
              <Select value={(formData as any).paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="check">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData as any).paymentMethod === "cash" && (
              <div className="space-y-2">
                <Label>الصندوق</Label>
                <Select value={(formData as any).cashboxId} onValueChange={(v) => setFormData({ ...formData, cashboxId: v })}>
                  <SelectTrigger><SelectValue placeholder="اختر الصندوق" /></SelectTrigger>
                  <SelectContent>
                    {cashboxesQuery.data?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {((formData as any).paymentMethod === "bank_transfer" || (formData as any).paymentMethod === "check") && (
              <div className="space-y-2">
                <Label>رقم المرجع</Label>
                <Input value={(formData as any).referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} />
              </div>
            )}
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea value={(formData as any).notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setShowPaymentDialog(false); }}>إلغاء</Button>
              <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : "تحصيل"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
