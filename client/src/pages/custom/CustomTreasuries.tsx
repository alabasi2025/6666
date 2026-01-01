import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import axios from "axios";
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
  FormDescription,
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
  Wallet,
  Building2,
  Smartphone,
  Store,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  RefreshCw,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Treasury Types Configuration
const treasuryTypes = {
  cash: {
    label: "صندوق",
    icon: Wallet,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  bank: {
    label: "بنك",
    icon: Building2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  wallet: {
    label: "محفظة إلكترونية",
    icon: Smartphone,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  exchange: {
    label: "صراف",
    icon: Store,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
};

// Wallet Providers
const walletProviders = [
  { value: "stc_pay", label: "STC Pay" },
  { value: "apple_pay", label: "Apple Pay" },
  { value: "urpay", label: "URPay" },
  { value: "alinma_pay", label: "Alinma Pay" },
  { value: "other", label: "أخرى" },
];

// Form Schema
const treasuryFormSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربي مطلوب"),
  nameEn: z.string().optional(),
  treasuryType: z.enum(["cash", "bank", "wallet", "exchange"]),
  subSystemId: z.number().optional(),
  accountId: z.number({ required_error: "يجب اختيار الحساب من الدليل" }),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  walletProvider: z.string().optional(),
  walletNumber: z.string().optional(),
  currency: z.string().default(""),
  openingBalance: z.string().default("0"),
  description: z.string().optional(),
});

type TreasuryFormValues = z.infer<typeof treasuryFormSchema>;

// Treasury Card Component
function TreasuryCard({ treasury, onEdit, onDelete }: any) {
  const config = treasuryTypes[(treasury as any).treasuryType as keyof typeof treasuryTypes];
  const Icon = config?.icon || Wallet;
  const balance = parseFloat((treasury as any).currentBalance || "0");
  const isPositive = balance >= 0;

  return (
    <Card className={cn(
      "bg-slate-900/50 border transition-all hover:shadow-lg hover:shadow-slate-900/50",
      config?.borderColor
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config?.bgColor)}>
              <Icon className={cn("h-6 w-6", config?.color)} />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{(treasury as any).nameAr}</CardTitle>
              <CardDescription className="text-slate-400">
                {(treasury as any).code} • {config?.label}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem onClick={() => onEdit(treasury)} className="cursor-pointer">
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete((treasury as any).id)} 
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
        <div className="space-y-4">
          {/* Balance */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-400 text-sm">الرصيد الحالي</span>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {balance.toLocaleString("ar-SA")} {(treasury as any).currency}
              </span>
            </div>
          </div>

          {/* Additional Info based on type */}
          {(treasury as any).treasuryType === "bank" && (treasury as any).bankName && (
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">البنك:</span> {(treasury as any).bankName}
              {(treasury as any).accountNumber && (
                <span className="mr-4">
                  <span className="text-slate-500">رقم الحساب:</span> {(treasury as any).accountNumber}
                </span>
              )}
            </div>
          )}

          {(treasury as any).treasuryType === "wallet" && (treasury as any).walletProvider && (
            <div className="text-sm text-slate-400">
              <span className="text-slate-500">المزود:</span> {
                walletProviders.find(p => p.value === (treasury as any).walletProvider)?.label || (treasury as any).walletProvider
              }
              {(treasury as any).walletNumber && (
                <span className="mr-4">
                  <span className="text-slate-500">الرقم:</span> {(treasury as any).walletNumber}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function CustomTreasuries() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTreasury, setEditingTreasury] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountSubTypes, setAccountSubTypes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountCurrencies, setAccountCurrencies] = useState<string[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);

  // Form
  const form = useForm<TreasuryFormValues>({
    resolver: zodResolver(treasuryFormSchema) as any as any as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      treasuryType: "cash",
      currency: "",
      openingBalance: "0",
      description: "",
      accountId: undefined,
    },
  });

  const watchTreasuryType = form.watch("treasuryType");
  const watchSubSystemId = form.watch("subSystemId");

  // API Queries
  const { data: treasuries, isLoading, refetch } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  const { data: subSystems } = trpc.customSystem.subSystems.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  // Mutations
  const createMutation = trpc.customSystem.treasuries.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الخزينة بنجاح");
      setIsDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.customSystem.treasuries.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الخزينة بنجاح");
      setIsDialogOpen(false);
      setEditingTreasury(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.customSystem.treasuries.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخزينة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Handlers
  const handleEdit = (treasury: any) => {
    setEditingTreasury(treasury);
    form.reset({
      code: (treasury as any).code,
      nameAr: (treasury as any).nameAr,
      nameEn: (treasury as any).nameEn || "",
      treasuryType: (treasury as any).treasuryType,
      subSystemId: (treasury as any).subSystemId,
      bankName: (treasury as any).bankName || "",
      accountNumber: (treasury as any).accountNumber || "",
      iban: (treasury as any).iban || "",
      swiftCode: (treasury as any).swiftCode || "",
      walletProvider: (treasury as any).walletProvider || "",
      walletNumber: (treasury as any).walletNumber || "",
      currency: (treasury as any).currency || "",
      openingBalance: (treasury as any).openingBalance || "0",
      description: (treasury as any).description || "",
      accountId: (treasury as any).accountId || null,
    });
    // جلب عملات الحساب المرتبط أثناء التعديل
    if ((treasury as any).accountId) {
      setCurrenciesLoading(true);
      axios
        .get(`/api/custom-system/v2/accounts/${(treasury as any).accountId}`)
        .then((res) => {
          const currs = (res.data?.currencies || [])
            .filter((c: any) => c.code)
            .map((c: any) => c.code);
          setAccountCurrencies(currs);
          if (currs.length > 0 && currs.includes((treasury as any).currency)) {
            form.setValue("currency", (treasury as any).currency);
          } else if (currs.length > 0) {
            form.setValue("currency", currs[0]);
          } else {
            form.setValue("currency", "");
          }
        })
        .catch(() => {
          setAccountCurrencies([]);
          form.setValue("currency", "");
        })
        .finally(() => setCurrenciesLoading(false));
    } else {
      setAccountCurrencies([]);
      form.setValue("currency", "");
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

  // تحميل الأنواع الفرعية للحسابات (صندوق/بنك/محفظة/صراف)
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/custom-system/v2/account-sub-types", {
          params: { isActive: true },
        });
        setAccountSubTypes(res.data || []);
      } catch {
        setAccountSubTypes([]);
      }
    })();
  }, []);

  // تحميل الحسابات بحسب النظام الفرعي
  useEffect(() => {
    (async () => {
      setAccountsLoading(true);
      try {
        const subSystemParam = watchSubSystemId && watchSubSystemId > 0 ? watchSubSystemId : undefined;
        const res = await axios.get("/api/custom-system/v2/accounts", {
          params: {
            subSystemId: subSystemParam,
            includeInactive: true,
          },
        });
        setAccounts(res.data || []);
      } catch {
        setAccounts([]);
      } finally {
        setAccountsLoading(false);
      }
    })();
  }, [watchSubSystemId]);

  const onSubmit = (data: TreasuryFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      openingBalance: data.openingBalance || "0",
      currentBalance: data.openingBalance || "0",
    };

    if (editingTreasury) {
      updateMutation.mutate({ id: editingTreasury.id, ...payload } as any);
    } else {
      createMutation.mutate(payload);
    }
  };

  // ربط نوع الخزينة بنوع الحساب الفرعي
  const treasuryToSubTypeCode: Record<string, string> = {
    cash: "cash",
    bank: "bank",
    wallet: "wallet",
    exchange: "exchange",
  };

  const filteredAccounts = useMemo(() => {
    const code = treasuryToSubTypeCode[watchTreasuryType] || "";
    const subTypeId = accountSubTypes.find((s) => s.code === code)?.id;

    // عرض الحسابات التي تطابق نوع الحساب الفرعي فقط
    if (!subTypeId) return [];
    const base = accounts.filter((acc: any) => acc.accountSubTypeId === subTypeId);
    const selectedId = watch("accountId");
    const selected = accounts.find((acc: any) => acc.id === selectedId);
    if (selected && !base.some((acc: any) => acc.id === selected.id)) {
      return [selected, ...base];
    }
    return base;
  }, [accounts, accountSubTypes, watchTreasuryType, watch("accountId")]);

  // جلب عملات الحساب المختار
  useEffect(() => {
    const accId = watch("accountId");
    const currentCurrency = watch("currency");
    if (!accId) {
      setAccountCurrencies([]);
      setValue("currency", "");
      return;
    }
    setCurrenciesLoading(true);
    axios
      .get(`/api/custom-system/v2/accounts/${accId}`)
      .then((res) => {
        const currs = (res.data?.currencies || [])
          .filter((c: any) => c.code)
          .map((c: any) => c.code);
        setAccountCurrencies(currs);
        if (currs.length > 0) {
          // إذا كانت العملة الحالية ضمن العملات المتاحة، احتفظ بها
          if (currentCurrency && currs.includes(currentCurrency)) {
            setValue("currency", currentCurrency);
          } else {
            setValue("currency", currs[0]);
          }
        } else {
          setValue("currency", "");
        }
      })
      .catch(() => {
        setAccountCurrencies([]);
        setValue("currency", "");
      })
      .finally(() => setCurrenciesLoading(false));
  }, [watchTreasuryType, watch("accountId"), watch("currency")]);

  // Filter treasuries
  const filteredTreasuries = treasuries?.filter((t: any) => {
    const matchesTab = activeTab === "all" || t.treasuryType === activeTab;
    const matchesSearch = t.nameAr.includes(searchQuery) || 
                         t.code.includes(searchQuery) ||
                         (t.nameEn && t.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  }) || [];

  // Calculate totals
  const totals = treasuries?.reduce((acc: any, t: any) => {
    const balance = parseFloat(t.currentBalance || "0");
    acc.total += balance;
    acc[t.treasuryType] = (acc[t.treasuryType] || 0) + balance;
    return acc;
  }, { total: 0, cash: 0, bank: 0, wallet: 0, exchange: 0 }) || { total: 0 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">إدارة الخزائن</h1>
          <p className="text-slate-400">إدارة الصناديق والبنوك والمحافظ الإلكترونية والصرافين</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTreasury(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="ml-2 h-4 w-4" />
                إضافة خزينة
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingTreasury ? "تعديل الخزينة" : "إضافة خزينة جديدة"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingTreasury ? "قم بتعديل بيانات الخزينة" : "أدخل بيانات الخزينة الجديدة"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                  {/* Treasury Type */}
                  <FormField
                    control={form.control as any}
                    name="treasuryType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">نوع الخزينة</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(treasuryTypes).map(([key, config]) => {
                            const Icon = (config as any).icon;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => field.onChange(key)}
                                className={cn(
                                  "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                  field.value === key
                                    ? `${(config as any).borderColor} ${(config as any).bgColor}`
                                    : "border-slate-700 hover:border-slate-600"
                                )}
                              >
                                <Icon className={cn("h-6 w-6", field.value === key ? (config as any).color : "text-slate-400")} />
                                <span className={cn("text-xs", field.value === key ? "text-white" : "text-slate-400")}>
                                  {(config as any).label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Code */}
                    <FormField
                      control={form.control as any}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الكود</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: CASH-001" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currency */}
                    <FormField
                      control={form.control as any}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">العملة</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={currenciesLoading || accountCurrencies.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue
                                  placeholder={
                                    currenciesLoading
                                      ? "جاري التحميل..."
                                      : accountCurrencies.length === 0
                                        ? "لا توجد عملات مرتبطة بالحساب"
                                        : "اختر العملة"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              {accountCurrencies.length === 0 && (
                                <SelectItem value="__none" disabled>
                                  {currenciesLoading ? "جاري التحميل..." : "لا توجد عملات مرتبطة بالحساب"}
                                </SelectItem>
                              )}
                              {accountCurrencies.map((code) => (
                                <SelectItem key={code} value={code}>
                                  {code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name Arabic */}
                    <FormField
                      control={form.control as any}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالعربي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: الصندوق الرئيسي" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name English */}
                    <FormField
                      control={form.control as any}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالإنجليزي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Example: Main Cash" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Sub System */}
                  <FormField
                    control={form.control as any}
                    name="subSystemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">النظام الفرعي (اختياري)</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="اختر النظام الفرعي" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800">
                            <SelectItem value="0">بدون نظام فرعي</SelectItem>
                            {subSystems?.map((sys: any) => (
                              <SelectItem key={sys.id} value={sys.id.toString()}>
                                {sys.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Selection Field */}
                  <FormField
                    control={form.control as any}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الحساب المحاسبي (اختياري)</FormLabel>
                        <Select 
                          onValueChange={(v) => field.onChange(v === "0" ? null : parseInt(v))} 
                          value={field.value?.toString() || "0"}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-800 border-slate-700">
                              <SelectValue placeholder="اختر حساباً من الدليل" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-900 border-slate-800 max-h-[300px]">
                            <SelectItem value="0">
                              <span className="text-slate-400">بدون حساب محاسبي</span>
                            </SelectItem>
                            {accounts?.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                <span className="font-mono text-blue-400">{acc.accountCode}</span>
                                {" - "}
                                <span>{acc.accountNameAr}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs text-slate-400">
                          اربط هذا الصندوق بحساب محاسبي من دليل الحسابات
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bank Fields */}
                  {watchTreasuryType === "bank" && (
                    <>
                      <FormField
                        control={form.control as any}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">اسم البنك</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: البنك الأهلي" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control as any}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">رقم الحساب</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="رقم الحساب" className="bg-slate-800 border-slate-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                          name="iban"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">IBAN</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SA..." className="bg-slate-800 border-slate-700" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}

                  {/* Wallet Fields */}
                  {watchTreasuryType === "wallet" && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control as any}
                        name="walletProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">مزود المحفظة</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                  <SelectValue placeholder="اختر المزود" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-slate-900 border-slate-800">
                                {walletProviders.map((provider) => (
                                  <SelectItem key={provider.value} value={provider.value}>
                                    {provider.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control as any}
                        name="walletNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-300">رقم المحفظة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="05xxxxxxxx" className="bg-slate-800 border-slate-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

              {/* ربط الخزينة بالحساب (يُفلتر حسب النوع الفرعي) */}
              <FormField
                control={form.control as any}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">الحساب في دليل الحسابات</FormLabel>
                    <FormDescription className="text-slate-400">
                      تظهر الحسابات التي نوعها الفرعي يطابق نوع الخزينة (صندوق/بنك/محفظة/صراف).
                    </FormDescription>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value ? String(field.value) : undefined}
                      disabled={accountsLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700">
                          <SelectValue placeholder={accountsLoading ? "جاري التحميل..." : "اختر الحساب"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800 max-h-72">
                        {filteredAccounts.length === 0 && (
                          <SelectItem value="-1" disabled>
                            {accountsLoading ? "جاري التحميل..." : "لا توجد حسابات مطابقة"}
                          </SelectItem>
                        )}
                        {filteredAccounts.map((acc: any) => (
                          <SelectItem key={acc.id} value={String(acc.id)}>
                            {acc.accountCode} - {acc.accountNameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

                  {/* Opening Balance */}
                  <FormField
                    control={form.control as any}
                    name="openingBalance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الرصيد الافتتاحي</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0.00" className="bg-slate-800 border-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control as any}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الوصف</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="وصف الخزينة..." className="bg-slate-800 border-slate-700" />
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
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {editingTreasury ? "تحديث" : "إضافة"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">إجمالي الأرصدة</p>
                <p className="text-2xl font-bold text-white">{totals.total.toLocaleString("ar-SA")}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        {Object.entries(treasuryTypes).map(([key, config]) => {
          const Icon = (config as any).icon;
          return (
            <Card key={key} className={cn("bg-slate-900/50 border", (config as any).borderColor)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{(config as any).label}</p>
                    <p className={cn("text-xl font-bold", (config as any).color)}>
                      {(totals[key] || 0).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", (config as any).bgColor)}>
                    <Icon className={cn("h-5 w-5", (config as any).color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-800/50">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">الكل</TabsTrigger>
            <TabsTrigger value="cash" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
              صناديق
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-500">
              بنوك
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500">
              محافظ
            </TabsTrigger>
            <TabsTrigger value="exchange" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
              صرافين
            </TabsTrigger>
          </TabsList>
        </Tabs>
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

      {/* Treasury Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : filteredTreasuries.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد خزائن</p>
            <p className="text-slate-500 text-sm">قم بإضافة خزينة جديدة للبدء</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredTreasuries as any[]).map((treasury: any) => (
            <TreasuryCard
              key={(treasury as any).id}
              treasury={treasury}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

