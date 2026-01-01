import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Wallet,
  User,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ArrowDownCircle,
  Coins,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentVoucherProps {
  subSystemId?: number;
}

export default function PaymentVoucher({ subSystemId }: PaymentVoucherProps) {
  const params = useParams();
  const id = subSystemId || (params.id ? parseInt(params.id) : undefined);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    treasuryId: "",
    currencyId: "",
    destinationType: "person" as "person" | "company" | "intermediary",
    destinationName: "",
    destinationIntermediaryId: "",
    description: "",
    voucherDate: new Date().toISOString().split("T")[0],
  });

  // Fetch data
  const { data: subSystem } = trpc.customSystem.subSystems.getById.useQuery(
    { id: id || 0 },
    { enabled: !!id }
  );

  const { data: treasuries, isLoading: treasuriesLoading } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1, subSystemId: id },
    { enabled: !!id }
  );

  const { data: currencies } = trpc.customSystem.currencies.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  const { data: intermediaryAccounts } = trpc.customSystem.intermediaryAccounts.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  const { data: paymentVouchers, refetch: refetchVouchers, isLoading: vouchersLoading } = 
    trpc.customSystem.paymentVouchers.list.useQuery(
      { businessId: 1, subSystemId: id },
      { enabled: !!id }
    );

  // Get selected treasury currencies
  const selectedTreasury = treasuries?.find((t: any) => t.id === parseInt(formData.treasuryId));
  const treasuryCurrencies = selectedTreasury?.currencies || [];

  // Create mutation
  const createMutation = trpc.customSystem.paymentVouchers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء سند الصرف بنجاح");
      setIsAddDialogOpen(false);
      resetForm();
      refetchVouchers();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      treasuryId: "",
      currencyId: "",
      destinationType: "person",
      destinationName: "",
      destinationIntermediaryId: "",
      description: "",
      voucherDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.treasuryId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.destinationType !== "intermediary" && !formData.destinationName) {
      toast.error("يرجى إدخال اسم المستفيد");
      return;
    }

    if (formData.destinationType === "intermediary" && !formData.destinationIntermediaryId) {
      toast.error("يرجى اختيار الحساب الوسيط");
      return;
    }

    createMutation.mutate({
      businessId: 1,
      subSystemId: id || 0,
      amount: formData.amount,
      treasuryId: parseInt(formData.treasuryId),
      currencyId: formData.currencyId ? parseInt(formData.currencyId) : undefined,
      destinationType: formData.destinationType,
      destinationName: formData.destinationType !== "intermediary" ? formData.destinationName : undefined,
      destinationIntermediaryId: formData.destinationType === "intermediary" 
        ? parseInt(formData.destinationIntermediaryId) 
        : undefined,
      description: formData.description,
    } as any);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 ml-1" />
            مؤكد
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 ml-1" />
            معلق
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 ml-1" />
            ملغي
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredVouchers = paymentVouchers?.filter((voucher: any) => {
    const matchesSearch = 
      voucher.voucherNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.destinationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ArrowDownCircle className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">سندات الصرف</h1>
            <p className="text-zinc-400 text-sm">{subSystem?.nameAr || "النظام الفرعي"}</p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-lg shadow-red-500/30"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء سند صرف
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/20 to-rose-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers
                    ?.filter((v: any) => v.status === "confirmed")
                    .reduce((sum: number, v: any) => sum + parseFloat(v.amount || "0"), 0)
                    .toLocaleString("ar-SA")} 
                </p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">سندات مؤكدة</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.filter((v: any) => v.status === "confirmed").length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">سندات معلقة</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.filter((v: any) => v.status === "pending").length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">إجمالي السندات</p>
                <p className="text-2xl font-bold text-white">
                  {paymentVouchers?.length || 0}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="بحث برقم السند أو اسم المستفيد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-zinc-800/50 border-zinc-700 text-white">
                <SelectValue placeholder="حالة السند" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => refetchVouchers()}
              className="border-zinc-700 text-zinc-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-400" />
            قائمة سندات الصرف
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vouchersLoading ? (
            <div className="text-center py-8 text-zinc-500">جاري التحميل...</div>
          ) : filteredVouchers?.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد سندات صرف</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 text-right">رقم السند</TableHead>
                    <TableHead className="text-zinc-400 text-right">التاريخ</TableHead>
                    <TableHead className="text-zinc-400 text-right">المستفيد</TableHead>
                    <TableHead className="text-zinc-400 text-right">الخزينة</TableHead>
                    <TableHead className="text-zinc-400 text-right">المبلغ</TableHead>
                    <TableHead className="text-zinc-400 text-right">الحالة</TableHead>
                    <TableHead className="text-zinc-400 text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVouchers?.map((voucher: any) => (
                    <TableRow key={voucher.id} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell className="text-white font-medium">
                        {voucher.voucherNumber}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(voucher.createdAt).toLocaleDateString("ar-SA")}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {voucher.destinationType === "person" ? (
                            <User className="h-4 w-4 text-blue-400" />
                          ) : voucher.destinationType === "company" ? (
                            <Building2 className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Wallet className="h-4 w-4 text-orange-400" />
                          )}
                          {voucher.destinationName || "حساب وسيط"}
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {voucher.treasury?.nameAr || "-"}
                      </TableCell>
                      <TableCell className="text-red-400 font-bold">
                        {parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency?.code || ""}
                      </TableCell>
                      <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVoucher(voucher);
                              setIsViewDialogOpen(true);
                            }}
                            className="text-zinc-400 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ArrowDownCircle className="h-6 w-6 text-red-400" />
              إنشاء سند صرف جديد
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Treasury Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400">الخزينة *</Label>
              <Select
                value={formData.treasuryId}
                onValueChange={(value) => {
                  setFormData({ ...formData, treasuryId: value, currencyId: "" });
                }}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="اختر الخزينة" />
                </SelectTrigger>
                <SelectContent>
                  {treasuries?.map((treasury: any) => (
                    <SelectItem key={treasury.id} value={treasury.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        {treasury.nameAr} ({treasury.code})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Currency Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400">العملة</Label>
              <Select
                value={formData.currencyId}
                onValueChange={(value) => setFormData({ ...formData, currencyId: value })}
                disabled={!formData.treasuryId || treasuryCurrencies.length === 0}
              >
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  {treasuryCurrencies.map((tc: any) => (
                    <SelectItem key={tc.currencyId} value={tc.currencyId.toString()}>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        {tc.currency?.code} - {tc.currency?.nameAr}
                        {tc.isDefault && <Badge className="mr-2 text-xs">افتراضي</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-zinc-400">المبلغ *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-zinc-400">التاريخ</Label>
              <Input
                type="date"
                value={formData.voucherDate}
                onChange={(e) => setFormData({ ...formData, voucherDate: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>

            {/* Destination Type */}
            <div className="space-y-2 col-span-2">
              <Label className="text-zinc-400">نوع المستفيد *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.destinationType === "person" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "person", destinationIntermediaryId: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "person"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <User className="h-4 w-4 ml-2" />
                  شخص
                </Button>
                <Button
                  type="button"
                  variant={formData.destinationType === "company" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "company", destinationIntermediaryId: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "company"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <Building2 className="h-4 w-4 ml-2" />
                  شركة
                </Button>
                <Button
                  type="button"
                  variant={formData.destinationType === "intermediary" ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, destinationType: "intermediary", destinationName: "" })}
                  className={cn(
                    "flex-1",
                    formData.destinationType === "intermediary"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "border-zinc-700 text-zinc-400"
                  )}
                >
                  <Wallet className="h-4 w-4 ml-2" />
                  حساب وسيط
                </Button>
              </div>
            </div>

            {/* Destination Name or Intermediary */}
            {formData.destinationType !== "intermediary" ? (
              <div className="space-y-2 col-span-2">
                <Label className="text-zinc-400">
                  {formData.destinationType === "person" ? "اسم الشخص" : "اسم الشركة"} *
                </Label>
                <Input
                  placeholder={formData.destinationType === "person" ? "أدخل اسم الشخص" : "أدخل اسم الشركة"}
                  value={formData.destinationName}
                  onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            ) : (
              <div className="space-y-2 col-span-2">
                <Label className="text-zinc-400">الحساب الوسيط *</Label>
                <Select
                  value={formData.destinationIntermediaryId}
                  onValueChange={(value) => setFormData({ ...formData, destinationIntermediaryId: value })}
                >
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                    <SelectValue placeholder="اختر الحساب الوسيط" />
                  </SelectTrigger>
                  <SelectContent>
                    {intermediaryAccounts?.map((account: any) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 col-span-2">
              <Label className="text-zinc-400">البيان / الوصف</Label>
              <Textarea
                placeholder="أدخل وصف السند..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-zinc-800/50 border-zinc-700 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              className="border-zinc-700 text-zinc-400"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء السند"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-400" />
              تفاصيل سند الصرف
            </DialogTitle>
          </DialogHeader>

          {selectedVoucher && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-zinc-500 text-sm">رقم السند</p>
                  <p className="text-white font-bold">{selectedVoucher.voucherNumber}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">التاريخ</p>
                  <p className="text-white">
                    {new Date(selectedVoucher.createdAt).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">المبلغ</p>
                  <p className="text-red-400 font-bold text-lg">
                    {parseFloat(selectedVoucher.amount).toLocaleString("ar-SA")} {selectedVoucher.currency?.code || ""}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">الحالة</p>
                  {getStatusBadge(selectedVoucher.status)}
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">الخزينة</p>
                  <p className="text-white">{selectedVoucher.treasury?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-sm">المستفيد</p>
                  <p className="text-white">{selectedVoucher.destinationName || "حساب وسيط"}</p>
                </div>
              </div>
              {selectedVoucher.description && (
                <div>
                  <p className="text-zinc-500 text-sm">البيان</p>
                  <p className="text-white">{selectedVoucher.description}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="border-zinc-700 text-zinc-400"
            >
              إغلاق
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
