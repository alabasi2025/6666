import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  FileText,
  Check,
  X,
  Calendar,
  MoreVertical,
  Eye,
  Printer,
  Download,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Source/Destination Types
const sourceTypes = [
  { value: "person", label: "شخص" },
  { value: "entity", label: "جهة" },
  { value: "intermediary", label: "حساب وسيط" },
  { value: "other", label: "أخرى" },
];

// Status Config
const statusConfig = {
  draft: { label: "مسودة", color: "bg-slate-500/20 text-slate-400" },
  confirmed: { label: "مؤكد", color: "bg-green-500/20 text-green-500" },
  cancelled: { label: "ملغي", color: "bg-red-500/20 text-red-500" },
};

// Form Schema for Receipt Voucher
const receiptVoucherSchema = z.object({
  voucherDate: z.string().min(1, "التاريخ مطلوب"),
  amount: z.string().min(1, "المبلغ مطلوب"),
  currency: z.string().default("SAR"),
  subSystemId: z.number().optional(),
  sourceType: z.enum(["person", "entity", "intermediary", "other"]),
  sourceName: z.string().optional(),
  sourceIntermediaryId: z.number().optional(),
  treasuryId: z.number({ required_error: "الخزينة مطلوبة" }),
  description: z.string().optional(),
});

// Form Schema for Payment Voucher
const paymentVoucherSchema = z.object({
  voucherDate: z.string().min(1, "التاريخ مطلوب"),
  amount: z.string().min(1, "المبلغ مطلوب"),
  currency: z.string().default("SAR"),
  subSystemId: z.number().optional(),
  treasuryId: z.number({ required_error: "الخزينة مطلوبة" }),
  destinationType: z.enum(["person", "entity", "intermediary", "other"]),
  destinationName: z.string().optional(),
  destinationIntermediaryId: z.number().optional(),
  description: z.string().optional(),
});

type ReceiptVoucherFormValues = z.infer<typeof receiptVoucherSchema>;
type PaymentVoucherFormValues = z.infer<typeof paymentVoucherSchema>;

// Voucher Row Component
function VoucherRow({ voucher, type, onEdit, onDelete, onConfirm, onCancel, treasuries }: any) {
  const isReceipt = type === "receipt";
  const treasury = treasuries?.find((t: any) => t.id === voucher.treasuryId);
  const status = statusConfig[voucher.status as keyof typeof statusConfig];

  return (
    <TableRow className="hover:bg-slate-800/50">
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          {isReceipt ? (
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          )}
          {voucher.voucherNumber}
        </div>
      </TableCell>
      <TableCell className="text-slate-400">
        {format(new Date(voucher.voucherDate), "dd/MM/yyyy", { locale: ar })}
      </TableCell>
      <TableCell className={cn("font-bold", isReceipt ? "text-green-500" : "text-red-500")}>
        {isReceipt ? "+" : "-"}{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}
      </TableCell>
      <TableCell className="text-slate-400">
        {isReceipt ? voucher.sourceName : voucher.destinationName}
      </TableCell>
      <TableCell className="text-slate-400">
        {treasury?.nameAr || "-"}
      </TableCell>
      <TableCell>
        <Badge className={status?.color}>
          {status?.label}
        </Badge>
        {voucher.isReconciled && (
          <Badge className="mr-2 bg-blue-500/20 text-blue-500">مطابق</Badge>
        )}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="ml-2 h-4 w-4" />
              عرض
            </DropdownMenuItem>
            {voucher.status === "draft" && (
              <>
                <DropdownMenuItem onClick={() => onEdit(voucher)} className="cursor-pointer">
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfirm(voucher.id)} className="cursor-pointer text-green-500">
                  <Check className="ml-2 h-4 w-4" />
                  تأكيد
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={() => onDelete(voucher.id)} 
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </>
            )}
            {voucher.status === "confirmed" && (
              <DropdownMenuItem onClick={() => onCancel(voucher.id)} className="cursor-pointer text-red-400">
                <X className="ml-2 h-4 w-4" />
                إلغاء
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-slate-800" />
            <DropdownMenuItem className="cursor-pointer">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Main Component
export default function CustomVouchers() {
  const [activeTab, setActiveTab] = useState<"receipt" | "payment">("receipt");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Forms
  const receiptForm = useForm<ReceiptVoucherFormValues>({
    resolver: zodResolver(receiptVoucherSchema),
    defaultValues: {
      voucherDate: new Date().toISOString().split("T")[0],
      amount: "",
      currency: "SAR",
      sourceType: "person",
      sourceName: "",
      description: "",
    },
  });

  const paymentForm = useForm<PaymentVoucherFormValues>({
    resolver: zodResolver(paymentVoucherSchema),
    defaultValues: {
      voucherDate: new Date().toISOString().split("T")[0],
      amount: "",
      currency: "SAR",
      destinationType: "person",
      destinationName: "",
      description: "",
    },
  });

  const watchReceiptSourceType = receiptForm.watch("sourceType");
  const watchPaymentDestType = paymentForm.watch("destinationType");

  // API Queries
  const { data: receiptVouchers, isLoading: loadingReceipts, refetch: refetchReceipts } = 
    trpc.customSystem.receiptVouchers.list.useQuery({ businessId: 1 }, { enabled: true });

  const { data: paymentVouchers, isLoading: loadingPayments, refetch: refetchPayments } = 
    trpc.customSystem.paymentVouchers.list.useQuery({ businessId: 1 }, { enabled: true });

  const { data: treasuries } = trpc.customSystem.treasuries.list.useQuery({ businessId: 1 }, { enabled: true });
  const { data: subSystems } = trpc.customSystem.subSystems.list.useQuery({ businessId: 1 }, { enabled: true });
  const { data: intermediaryAccounts } = trpc.customSystem.intermediaryAccounts.list.useQuery({ businessId: 1 }, { enabled: true });

  // Mutations for Receipt Vouchers
  const createReceiptMutation = trpc.customSystem.receiptVouchers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء سند القبض بنجاح");
      setIsDialogOpen(false);
      receiptForm.reset();
      refetchReceipts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updateReceiptMutation = trpc.customSystem.receiptVouchers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث سند القبض بنجاح");
      setIsDialogOpen(false);
      setEditingVoucher(null);
      receiptForm.reset();
      refetchReceipts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deleteReceiptMutation = trpc.customSystem.receiptVouchers.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف سند القبض بنجاح");
      refetchReceipts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const confirmReceiptMutation = trpc.customSystem.receiptVouchers.confirm.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد سند القبض بنجاح");
      refetchReceipts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  // Mutations for Payment Vouchers
  const createPaymentMutation = trpc.customSystem.paymentVouchers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء سند الصرف بنجاح");
      setIsDialogOpen(false);
      paymentForm.reset();
      refetchPayments();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updatePaymentMutation = trpc.customSystem.paymentVouchers.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث سند الصرف بنجاح");
      setIsDialogOpen(false);
      setEditingVoucher(null);
      paymentForm.reset();
      refetchPayments();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deletePaymentMutation = trpc.customSystem.paymentVouchers.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف سند الصرف بنجاح");
      refetchPayments();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const confirmPaymentMutation = trpc.customSystem.paymentVouchers.confirm.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد سند الصرف بنجاح");
      refetchPayments();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  // Handlers
  const handleEdit = (voucher: any) => {
    setEditingVoucher(voucher);
    if (activeTab === "receipt") {
      receiptForm.reset({
        voucherDate: voucher.voucherDate,
        amount: voucher.amount,
        currency: voucher.currency,
        subSystemId: voucher.subSystemId,
        sourceType: voucher.sourceType,
        sourceName: voucher.sourceName || "",
        sourceIntermediaryId: voucher.sourceIntermediaryId,
        treasuryId: voucher.treasuryId,
        description: voucher.description || "",
      });
    } else {
      paymentForm.reset({
        voucherDate: voucher.voucherDate,
        amount: voucher.amount,
        currency: voucher.currency,
        subSystemId: voucher.subSystemId,
        treasuryId: voucher.treasuryId,
        destinationType: voucher.destinationType,
        destinationName: voucher.destinationName || "",
        destinationIntermediaryId: voucher.destinationIntermediaryId,
        description: voucher.description || "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا السند؟")) {
      if (activeTab === "receipt") {
        deleteReceiptMutation.mutate({ id });
      } else {
        deletePaymentMutation.mutate({ id });
      }
    }
  };

  const handleConfirm = (id: number) => {
    if (activeTab === "receipt") {
      confirmReceiptMutation.mutate({ id });
    } else {
      confirmPaymentMutation.mutate({ id });
    }
  };

  const handleCancel = (id: number) => {
    if (confirm("هل أنت متأكد من إلغاء هذا السند؟")) {
      // TODO: Implement cancel mutation
      toast.info("سيتم تنفيذ الإلغاء قريباً");
    }
  };

  const onSubmitReceipt = (data: ReceiptVoucherFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      amount: data.amount,
    };

    if (editingVoucher) {
      updateReceiptMutation.mutate({ id: editingVoucher.id, ...payload });
    } else {
      createReceiptMutation.mutate(payload);
    }
  };

  const onSubmitPayment = (data: PaymentVoucherFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      amount: data.amount,
    };

    if (editingVoucher) {
      updatePaymentMutation.mutate({ id: editingVoucher.id, ...payload });
    } else {
      createPaymentMutation.mutate(payload);
    }
  };

  // Calculate totals
  const receiptTotal = receiptVouchers?.filter((v: any) => v.status === "confirmed")
    .reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;
  const paymentTotal = paymentVouchers?.filter((v: any) => v.status === "confirmed")
    .reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;

  const isLoading = activeTab === "receipt" ? loadingReceipts : loadingPayments;
  const vouchers = activeTab === "receipt" ? receiptVouchers : paymentVouchers;
  const refetch = activeTab === "receipt" ? refetchReceipts : refetchPayments;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">سندات القبض والصرف</h1>
          <p className="text-slate-400">إدارة جميع السندات المالية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button 
            onClick={() => {
              setEditingVoucher(null);
              if (activeTab === "receipt") {
                receiptForm.reset();
              } else {
                paymentForm.reset();
              }
              setIsDialogOpen(true);
            }}
            className={cn(
              "bg-gradient-to-r",
              activeTab === "receipt" 
                ? "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            )}
          >
            <Plus className="ml-2 h-4 w-4" />
            {activeTab === "receipt" ? "سند قبض جديد" : "سند صرف جديد"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">إجمالي القبض</p>
                <p className="text-2xl font-bold text-green-500">+{receiptTotal.toLocaleString("ar-SA")}</p>
              </div>
              <ArrowDownCircle className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-red-500">-{paymentTotal.toLocaleString("ar-SA")}</p>
              </div>
              <ArrowUpCircle className="h-10 w-10 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border",
          receiptTotal - paymentTotal >= 0 
            ? "bg-blue-500/10 border-blue-500/30" 
            : "bg-orange-500/10 border-orange-500/30"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">صافي الحركة</p>
                <p className={cn(
                  "text-2xl font-bold",
                  receiptTotal - paymentTotal >= 0 ? "text-blue-500" : "text-orange-500"
                )}>
                  {(receiptTotal - paymentTotal).toLocaleString("ar-SA")}
                </p>
              </div>
              <FileText className={cn(
                "h-10 w-10",
                receiptTotal - paymentTotal >= 0 ? "text-blue-500/50" : "text-orange-500/50"
              )} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "receipt" | "payment")}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger 
              value="receipt" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
            >
              <ArrowDownCircle className="ml-2 h-4 w-4" />
              سندات القبض ({receiptVouchers?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500"
            >
              <ArrowUpCircle className="ml-2 h-4 w-4" />
              سندات الصرف ({paymentVouchers?.length || 0})
            </TabsTrigger>
          </TabsList>
          <div className="relative w-full md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        {/* Vouchers Table */}
        <Card className="bg-slate-900/50 border-slate-800 mt-4">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : !vouchers || vouchers.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">لا توجد سندات</p>
                <p className="text-slate-500 text-sm">قم بإضافة سند جديد للبدء</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">رقم السند</TableHead>
                    <TableHead className="text-slate-400">التاريخ</TableHead>
                    <TableHead className="text-slate-400">المبلغ</TableHead>
                    <TableHead className="text-slate-400">{activeTab === "receipt" ? "من" : "إلى"}</TableHead>
                    <TableHead className="text-slate-400">الخزينة</TableHead>
                    <TableHead className="text-slate-400">الحالة</TableHead>
                    <TableHead className="text-slate-400 w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vouchers.map((voucher: any) => (
                    <VoucherRow
                      key={voucher.id}
                      voucher={voucher}
                      type={activeTab}
                      treasuries={treasuries}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Dialog for Receipt Voucher */}
      <Dialog open={isDialogOpen && activeTab === "receipt"} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingVoucher(null);
          receiptForm.reset();
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowDownCircle className="h-5 w-5 text-green-500" />
              {editingVoucher ? "تعديل سند القبض" : "سند قبض جديد"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingVoucher ? "قم بتعديل بيانات سند القبض" : "أدخل بيانات سند القبض الجديد"}
            </DialogDescription>
          </DialogHeader>
          <Form {...receiptForm}>
            <form onSubmit={receiptForm.handleSubmit(onSubmitReceipt)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={receiptForm.control}
                  name="voucherDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">التاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={receiptForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={receiptForm.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">نوع المصدر (من)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر نوع المصدر" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {sourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchReceiptSourceType === "intermediary" ? (
                <FormField
                  control={receiptForm.control}
                  name="sourceIntermediaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">الحساب الوسيط</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          {intermediaryAccounts?.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.nameAr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={receiptForm.control}
                  name="sourceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">اسم المصدر</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم الشخص أو الجهة" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={receiptForm.control}
                name="treasuryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الخزينة (إلى)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {treasuries?.map((treasury: any) => (
                          <SelectItem key={treasury.id} value={treasury.id.toString()}>
                            {treasury.nameAr} ({treasury.currentBalance} {treasury.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={receiptForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">البيان</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف السند..." className="bg-slate-800 border-slate-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createReceiptMutation.isPending || updateReceiptMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600"
                >
                  {(createReceiptMutation.isPending || updateReceiptMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingVoucher ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Payment Voucher */}
      <Dialog open={isDialogOpen && activeTab === "payment"} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingVoucher(null);
          paymentForm.reset();
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-red-500" />
              {editingVoucher ? "تعديل سند الصرف" : "سند صرف جديد"}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingVoucher ? "قم بتعديل بيانات سند الصرف" : "أدخل بيانات سند الصرف الجديد"}
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={paymentForm.control}
                  name="voucherDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">التاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">المبلغ</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} placeholder="0.00" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={paymentForm.control}
                name="treasuryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الخزينة (من)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر الخزينة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {treasuries?.map((treasury: any) => (
                          <SelectItem key={treasury.id} value={treasury.id.toString()}>
                            {treasury.nameAr} ({treasury.currentBalance} {treasury.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={paymentForm.control}
                name="destinationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">نوع الوجهة (إلى)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder="اختر نوع الوجهة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        {sourceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchPaymentDestType === "intermediary" ? (
                <FormField
                  control={paymentForm.control}
                  name="destinationIntermediaryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">الحساب الوسيط</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          {intermediaryAccounts?.map((acc: any) => (
                            <SelectItem key={acc.id} value={acc.id.toString()}>{acc.nameAr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={paymentForm.control}
                  name="destinationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">اسم الوجهة</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="اسم الشخص أو الجهة" className="bg-slate-800 border-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={paymentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">البيان</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف السند..." className="bg-slate-800 border-slate-700" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPaymentMutation.isPending || updatePaymentMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-rose-600"
                >
                  {(createPaymentMutation.isPending || updatePaymentMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  {editingVoucher ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
