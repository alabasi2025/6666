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
  DialogTrigger,
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
  ArrowLeftRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Link2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  MoreVertical,
  Eye,
  Unlink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Confidence Score Config
const confidenceConfig = {
  high: { label: "عالية", color: "bg-green-500/20 text-green-500", icon: CheckCircle2 },
  medium: { label: "متوسطة", color: "bg-yellow-500/20 text-yellow-500", icon: AlertCircle },
  low: { label: "منخفضة", color: "bg-red-500/20 text-red-500", icon: Clock },
};

// Status Config
const statusConfig = {
  pending: { label: "معلق", color: "bg-yellow-500/20 text-yellow-500" },
  confirmed: { label: "مؤكد", color: "bg-green-500/20 text-green-500" },
  rejected: { label: "مرفوض", color: "bg-red-500/20 text-red-500" },
};

// Form Schema for Intermediary Account
const intermediaryAccountSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربي مطلوب"),
  nameEn: z.string().optional(),
  fromSubSystemId: z.number({ message: "النظام المصدر مطلوب" }),
  toSubSystemId: z.number({ message: "النظام الهدف مطلوب" }),
  currency: z.string().default("SAR"),
});

type IntermediaryAccountFormValues = z.infer<typeof intermediaryAccountSchema>;

// Intermediary Account Card
function IntermediaryAccountCard({ account, subSystems, onEdit, onDelete }: any) {
  const fromSystem = subSystems?.find((s: any) => s.id === account.fromSubSystemId);
  const toSystem = subSystems?.find((s: any) => s.id === account.toSubSystemId);
  const balance = parseFloat(account.balance || "0");

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{account.nameAr}</CardTitle>
              <CardDescription className="text-slate-400">{account.code}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem onClick={() => onEdit(account)} className="cursor-pointer">
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(account.id)} 
                className="text-red-400 focus:text-red-400 cursor-pointer"
              >
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {/* Systems Link */}
        <div className="flex items-center justify-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-4">
          <div className="text-center">
            <p className="text-xs text-slate-500">من</p>
            <p className="text-sm font-medium text-white">{fromSystem?.nameAr || "غير محدد"}</p>
          </div>
          <ArrowLeftRight className="h-5 w-5 text-slate-500" />
          <div className="text-center">
            <p className="text-xs text-slate-500">إلى</p>
            <p className="text-sm font-medium text-white">{toSystem?.nameAr || "غير محدد"}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg">
          <span className="text-slate-400 text-sm">الرصيد</span>
          <span className={cn(
            "text-lg font-bold",
            balance >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {balance.toLocaleString("ar-SA")} {account.currency}
          </span>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant={account.isActive ? "default" : "secondary"} className={cn(
            account.isActive ? "bg-green-500/20 text-green-500" : "bg-slate-700 text-slate-400"
          )}>
            {account.isActive ? "نشط" : "غير نشط"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

// Reconciliation Row
function ReconciliationRow({ reconciliation, onConfirm, onReject }: any) {
  const confidence = confidenceConfig[reconciliation.confidenceScore as keyof typeof confidenceConfig];
  const status = statusConfig[reconciliation.status as keyof typeof statusConfig];
  const ConfidenceIcon = confidence?.icon || AlertCircle;

  return (
    <TableRow className="hover:bg-slate-800/50">
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-blue-500" />
          #{reconciliation.id}
        </div>
      </TableCell>
      <TableCell className="text-slate-400">
        <div className="flex flex-col">
          <span className="text-green-500">قبض: {reconciliation.paymentVoucher?.voucherNumber}</span>
          <span className="text-red-500">صرف: {reconciliation.receiptVoucher?.voucherNumber}</span>
        </div>
      </TableCell>
      <TableCell className="text-white font-bold">
        {parseFloat(reconciliation.amount).toLocaleString("ar-SA")} {reconciliation.currency}
      </TableCell>
      <TableCell>
        <Badge className={cn("flex items-center gap-1 w-fit", confidence?.color)}>
          <ConfidenceIcon className="h-3 w-3" />
          {confidence?.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={status?.color}>{status?.label}</Badge>
      </TableCell>
      <TableCell>
        {reconciliation.status === "pending" && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onConfirm(reconciliation.id)}
              className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onReject(reconciliation.id)}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

// Main Component
export default function CustomReconciliation() {
  const [activeTab, setActiveTab] = useState<"accounts" | "reconciliations">("accounts");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  // Form
  const form = useForm<IntermediaryAccountFormValues>({
    resolver: zodResolver(intermediaryAccountSchema) as any as any as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      currency: "SAR",
    },
  });

  // API Queries
  const { data: intermediaryAccounts, isLoading: loadingAccounts, refetch: refetchAccounts } = 
    trpc.customSystem.intermediaryAccounts.list.useQuery({ businessId: 1 }, { enabled: true });

  const { data: reconciliations, isLoading: loadingReconciliations, refetch: refetchReconciliations } = 
    trpc.customSystem.reconciliations.list.useQuery({ businessId: 1 }, { enabled: true });

  const { data: subSystems } = trpc.customSystem.subSystems.list.useQuery({ businessId: 1 }, { enabled: true });

  // Mutations
  const createAccountMutation = trpc.customSystem.intermediaryAccounts.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحساب الوسيط بنجاح");
      setIsDialogOpen(false);
      form.reset();
      refetchAccounts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const updateAccountMutation = trpc.customSystem.intermediaryAccounts.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحساب الوسيط بنجاح");
      setIsDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      refetchAccounts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const deleteAccountMutation = trpc.customSystem.intermediaryAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحساب الوسيط بنجاح");
      refetchAccounts();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const autoReconcileMutation = trpc.customSystem.reconciliations.autoReconcile.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إنشاء ${data.count} مطابقة جديدة`);
      refetchReconciliations();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const confirmReconciliationMutation = trpc.customSystem.reconciliations.confirm.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد المطابقة بنجاح");
      refetchReconciliations();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  const rejectReconciliationMutation = trpc.customSystem.reconciliations.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض المطابقة");
      refetchReconciliations();
    },
    onError: (error) => toast.error("حدث خطأ: " + error.message),
  });

  // Handlers
  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    form.reset({
      code: account.code,
      nameAr: account.nameAr,
      nameEn: account.nameEn || "",
      fromSubSystemId: account.fromSubSystemId,
      toSubSystemId: account.toSubSystemId,
      currency: account.currency,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteAccount = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الحساب الوسيط؟")) {
      deleteAccountMutation.mutate({ id } as any);
    }
  };

  const onSubmit = (data: IntermediaryAccountFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
    };

    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, ...payload } as any);
    } else {
      createAccountMutation.mutate(payload);
    }
  };

  // Stats
  const pendingCount = reconciliations?.filter((r: any) => r.status === "pending").length || 0;
  const confirmedCount = reconciliations?.filter((r: any) => r.status === "confirmed").length || 0;

  const isLoading = activeTab === "accounts" ? loadingAccounts : loadingReconciliations;
  const refetch = activeTab === "accounts" ? refetchAccounts : refetchReconciliations;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الحسابات الوسيطة والمطابقة</h1>
          <p className="text-slate-400">إدارة الحسابات الوسيطة والمطابقة التلقائية بين الأنظمة الفرعية</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          {activeTab === "accounts" ? (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingAccount(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  <Plus className="ml-2 h-4 w-4" />
                  حساب وسيط جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingAccount ? "تعديل الحساب الوسيط" : "حساب وسيط جديد"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    الحساب الوسيط يربط بين نظامين فرعيين لتسهيل التحويلات والمطابقة
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">الكود</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="INT-001" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">العملة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر العملة" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                <SelectItem value="SAR">ريال سعودي</SelectItem>
                                <SelectItem value="USD">دولار أمريكي</SelectItem>
                                <SelectItem value="YER">ريال يمني</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control as any}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالعربي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="حساب وسيط..." className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="fromSubSystemId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">من نظام</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر النظام" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {subSystems?.map((sys: any) => (
                                  <SelectItem key={sys.id} value={sys.id.toString()}>{sys.nameAr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="toSubSystemId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">إلى نظام</FormLabel>
                            <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر النظام" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {subSystems?.map((sys: any) => (
                                  <SelectItem key={sys.id} value={sys.id.toString()}>{sys.nameAr}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-700">
                        إلغاء
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        {(createAccountMutation.isPending || updateAccountMutation.isPending) && (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                        {editingAccount ? "تحديث" : "إضافة"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
              disabled={autoReconcileMutation.isPending}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            >
              {autoReconcileMutation.isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="ml-2 h-4 w-4" />
              )}
              مطابقة تلقائية
            </Button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">كيف تعمل الحسابات الوسيطة؟</h3>
              <p className="text-slate-400 text-sm">
                عند تحويل مبلغ من نظام فرعي إلى آخر، يتم إنشاء سند صرف في النظام المصدر وسند قبض في النظام الهدف.
                الحساب الوسيط يربط بين السندين ويتم مطابقتهما تلقائياً بناءً على المبلغ والتاريخ.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">الحسابات الوسيطة</p>
                <p className="text-2xl font-bold text-white">{intermediaryAccounts?.length || 0}</p>
              </div>
              <ArrowLeftRight className="h-10 w-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">مطابقات معلقة</p>
                <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">مطابقات مؤكدة</p>
                <p className="text-2xl font-bold text-green-500">{confirmedCount}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "accounts" | "reconciliations")}>
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            الحسابات الوسيطة ({intermediaryAccounts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reconciliations" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
            <Link2 className="ml-2 h-4 w-4" />
            المطابقات ({reconciliations?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          {loadingAccounts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : !intermediaryAccounts || intermediaryAccounts.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">لا توجد حسابات وسيطة</p>
                <p className="text-slate-500 text-sm mb-4">قم بإضافة حساب وسيط لربط الأنظمة الفرعية</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة حساب وسيط
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(intermediaryAccounts as any[]).map((account: any) => (
                <IntermediaryAccountCard
                  key={account.id}
                  account={account}
                  subSystems={subSystems}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reconciliations" className="mt-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-0">
              {loadingReconciliations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : !reconciliations || reconciliations.length === 0 ? (
                <div className="py-12 text-center">
                  <Link2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد مطابقات</p>
                  <p className="text-slate-500 text-sm mb-4">اضغط على "مطابقة تلقائية" للبحث عن سندات متطابقة</p>
                  <Button 
                    onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
                    disabled={autoReconcileMutation.isPending}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600"
                  >
                    {autoReconcileMutation.isPending ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="ml-2 h-4 w-4" />
                    )}
                    مطابقة تلقائية
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">#</TableHead>
                      <TableHead className="text-slate-400">السندات</TableHead>
                      <TableHead className="text-slate-400">المبلغ</TableHead>
                      <TableHead className="text-slate-400">نسبة الثقة</TableHead>
                      <TableHead className="text-slate-400">الحالة</TableHead>
                      <TableHead className="text-slate-400 w-24">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reconciliations as any[]).map((reconciliation: any) => (
                      <ReconciliationRow
                        key={reconciliation.id}
                        reconciliation={reconciliation}
                        onConfirm={(id: number) => confirmReconciliationMutation.mutate({ id } as any)}
                        onReject={(id: number) => rejectReconciliationMutation.mutate({ id } as any)}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
