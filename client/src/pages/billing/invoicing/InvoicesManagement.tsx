import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RefreshCw, FileText, CheckCircle, Printer, Eye, Download, DollarSign, Send } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  accountNumber: string;
  meterId: number;
  meterNumber: string;
  billingPeriodId: number;
  billingPeriodName: string;
  previousReading: string;
  currentReading: string;
  consumption: string;
  consumptionAmount: string;
  feesAmount: string;
  totalAmount: string;
  paidAmount: string;
  remainingAmount: string;
  status: string;
  dueDate: string;
  issueDate: string;
  isPaid: boolean;
  isApproved: boolean;
}

export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");

  const invoicesQuery = trpc.billing.getInvoices.useQuery();
  const periodsQuery = trpc.billing.getBillingPeriods.useQuery();
  const approveInvoicesMutation = trpc.billing.approveInvoices.useMutation();
  const sendInvoicesMutation = trpc.billing.sendInvoices.useMutation();

  useEffect(() => {
    if (invoicesQuery.data) {
      setInvoices(invoicesQuery.data as any);
    }
  }, [invoicesQuery.data]);

  const handleApprove = async () => {
    if (selectedInvoices.length === 0) return;
    if (confirm(`هل أنت متأكد من اعتماد ${selectedInvoices.length} فاتورة؟`)) {
      try {
        await approveInvoicesMutation.mutateAsync({ ids: selectedInvoices } as any);
        invoicesQuery.refetch();
        setSelectedInvoices([]);
      } catch (error) {
        console.error("Error approving invoices:", error);
      }
    }
  };

  const handleSendInvoices = async () => {
    if (selectedInvoices.length === 0) return;
    if (confirm(`هل أنت متأكد من إرسال ${selectedInvoices.length} فاتورة للعملاء؟`)) {
      try {
        await sendInvoicesMutation.mutateAsync({ ids: selectedInvoices } as any);
        invoicesQuery.refetch();
        setSelectedInvoices([]);
      } catch (error) {
        console.error("Error sending invoices:", error);
      }
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const selectableInvoices = filteredInvoices.filter(i => !i.isApproved);
    if (selectedInvoices.length === selectableInvoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(selectableInvoices.map(i => i.id));
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      (invoice as any).invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice as any).customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice as any).accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "paid" && (invoice as any).isPaid) ||
      (filterStatus === "unpaid" && !(invoice as any).isPaid) ||
      (filterStatus === "approved" && (invoice as any).isApproved) ||
      (filterStatus === "pending" && !(invoice as any).isApproved);
    const matchesPeriod = filterPeriod === "all" || (invoice as any).billingPeriodId.toString() === filterPeriod;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getStatusBadge = (invoice: Invoice) => {
    if (!(invoice as any).isApproved) {
      return <Badge className="bg-gray-100 text-gray-800">مسودة</Badge>;
    }
    if ((invoice as any).isPaid) {
      return <Badge className="bg-green-100 text-green-800">مدفوعة</Badge>;
    }
    const remaining = parseFloat((invoice as any).remainingAmount);
    const total = parseFloat((invoice as any).totalAmount);
    if (remaining < total && remaining > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">مدفوعة جزئياً</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">غير مدفوعة</Badge>;
  };

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
  const paidAmount = filteredInvoices.reduce((sum, i) => sum + parseFloat(i.paidAmount || "0"), 0);
  const unpaidAmount = totalAmount - paidAmount;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground">إدارة واعتماد وطباعة الفواتير</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
        </div>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
            <p className="text-muted-foreground text-sm">إجمالي الفواتير</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} ر.س</div>
            <p className="text-muted-foreground text-sm">إجمالي المبلغ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString()} ر.س</div>
            <p className="text-muted-foreground text-sm">المحصل</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{unpaidAmount.toLocaleString()} ر.س</div>
            <p className="text-muted-foreground text-sm">المتبقي</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قائمة الفواتير ({filteredInvoices.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedInvoices.length > 0 && (
              <>
                <Button variant="default" size="sm" onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 ml-1" />
                  اعتماد ({selectedInvoices.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleSendInvoices}>
                  <Send className="h-4 w-4 ml-1" />
                  إرسال
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
                <SelectItem value="pending">مسودة</SelectItem>
                <SelectItem value="approved">معتمدة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
                <SelectItem value="unpaid">غير مدفوعة</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
            </div>
            <Button variant="outline" size="icon" onClick={() => invoicesQuery.refetch()}>
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
                    checked={selectedInvoices.length > 0 && selectedInvoices.length === filteredInvoices.filter(i => !i.isApproved).length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>العداد</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>الاستهلاك</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>المدفوع</TableHead>
                <TableHead>المتبقي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoicesQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">جاري التحميل...</TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">لا توجد فواتير</TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={(invoice as any).id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedInvoices.includes((invoice as any).id)}
                        onCheckedChange={() => toggleSelection((invoice as any).id)}
                        disabled={(invoice as any).isApproved}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{(invoice as any).invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{(invoice as any).customerName}</div>
                        <div className="text-xs text-muted-foreground">{(invoice as any).accountNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{(invoice as any).meterNumber}</TableCell>
                    <TableCell>{(invoice as any).billingPeriodName}</TableCell>
                    <TableCell>{parseFloat((invoice as any).consumption).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">{parseFloat((invoice as any).totalAmount).toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-green-600">{parseFloat((invoice as any).paidAmount).toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-red-600">{parseFloat((invoice as any).remainingAmount).toLocaleString()} ر.س</TableCell>
                    <TableCell>{getStatusBadge(invoice)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedInvoice(invoice); setShowDetailsDialog(true); }} title="عرض التفاصيل">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="طباعة">
                          <Printer className="h-4 w-4" />
                        </Button>
                        {(invoice as any).isApproved && !(invoice as any).isPaid && (
                          <Button variant="ghost" size="icon" title="تحصيل">
                            <DollarSign className="h-4 w-4 text-green-500" />
                          </Button>
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

      {/* Dialog تفاصيل الفاتورة */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              {/* رأس الفاتورة */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold">فاتورة استهلاك</h3>
                  <p className="text-muted-foreground">رقم: {selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-left">
                  <p>تاريخ الإصدار: {new Date(selectedInvoice.issueDate).toLocaleDateString("ar-SA")}</p>
                  <p>تاريخ الاستحقاق: {new Date(selectedInvoice.dueDate).toLocaleDateString("ar-SA")}</p>
                </div>
              </div>

              {/* معلومات العميل */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">العميل</Label>
                  <p className="font-semibold">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-muted-foreground">رقم الحساب: {selectedInvoice.accountNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">العداد</Label>
                  <p className="font-semibold">{selectedInvoice.meterNumber}</p>
                </div>
              </div>

              {/* تفاصيل الاستهلاك */}
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">تفاصيل الاستهلاك</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">القراءة السابقة</Label>
                    <p>{parseFloat(selectedInvoice.previousReading).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">القراءة الحالية</Label>
                    <p>{parseFloat(selectedInvoice.currentReading).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاستهلاك</Label>
                    <p className="font-semibold">{parseFloat(selectedInvoice.consumption).toLocaleString()} ك.و.س</p>
                  </div>
                </div>
              </div>

              {/* المبالغ */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>قيمة الاستهلاك</span>
                  <span>{parseFloat(selectedInvoice.consumptionAmount).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الرسوم الإضافية</span>
                  <span>{parseFloat(selectedInvoice.feesAmount).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>الإجمالي</span>
                  <span>{parseFloat(selectedInvoice.totalAmount).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>المدفوع</span>
                  <span>{parseFloat(selectedInvoice.paidAmount).toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>المتبقي</span>
                  <span>{parseFloat(selectedInvoice.remainingAmount).toLocaleString()} ر.س</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Printer className="h-4 w-4 ml-2" />
                  طباعة
                </Button>
                {selectedInvoice.isApproved && !selectedInvoice.isPaid && (
                  <Button>
                    <DollarSign className="h-4 w-4 ml-2" />
                    تحصيل
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
