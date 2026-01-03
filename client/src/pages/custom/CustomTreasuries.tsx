import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
  Coins,
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
import { useRoute } from "wouter";

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
  currencies: z.array(z.string()).min(1, "يجب اختيار عملة واحدة على الأقل"),
  defaultCurrency: z.string().optional(),
  openingBalance: z.string().default("0"),
  description: z.string().optional(),
});

type TreasuryFormValues = z.infer<typeof treasuryFormSchema>;

// Treasury Card Component
function TreasuryCard({ treasury, accountLookup, onEdit, onDelete }: any) {
  const config = treasuryTypes[(treasury as any).treasuryType as keyof typeof treasuryTypes];
  const Icon = config?.icon || Wallet;
  const balance = parseFloat((treasury as any).currentBalance || "0");
  const isPositive = balance >= 0;
  const accountId: number | undefined = (treasury as any).accountId ?? undefined;
  const linkedAccount =
    typeof accountId === "number" && accountId > 0
      ? (accountLookup?.get ? accountLookup.get(accountId) : accountLookup?.[accountId]) ?? null
      : null;

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
              {linkedAccount && (
                <CardDescription className="text-slate-500 text-xs mt-1">
                  الحساب:{" "}
                  <span className="font-mono text-slate-300">{linkedAccount.accountCode}</span>
                  {" - "}
                  <span className="text-slate-400">{linkedAccount.accountNameAr}</span>
                </CardDescription>
              )}
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
                {balance.toLocaleString("ar-SA")} {(treasury as any).defaultCurrency || (treasury as any).currency}
              </span>
            </div>
          </div>

          {/* Currency Balances */}
          {(treasury as any).currencyBalances && (treasury as any).currencyBalances.length > 0 && (
            <div className="space-y-2">
              <span className="text-slate-500 text-xs">أرصدة العملات:</span>
              <div className="grid gap-2">
                {(treasury as any).currencyBalances.map((cb: any) => {
                  const bal = parseFloat(cb.currentBalance || "0");
                  const isPos = bal >= 0;
                  return (
                    <div 
                      key={cb.code}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md text-sm",
                        cb.isDefault ? "bg-emerald-900/30 border border-emerald-700/50" : "bg-slate-800/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Coins className="h-3 w-3 text-slate-400" />
                        <span className={cb.isDefault ? "text-emerald-400 font-medium" : "text-slate-300"}>
                          {cb.code}
                          {cb.isDefault && " (افتراضي)"}
                        </span>
                      </div>
                      <span className={cn(
                        "font-bold",
                        isPos ? "text-green-400" : "text-red-400"
                      )}>
                        {bal.toLocaleString("ar-SA")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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

// Props interface
interface CustomTreasuriesProps {
  subSystemId?: number;
}

// Main Component
export default function CustomTreasuries({ subSystemId: propSubSystemId }: CustomTreasuriesProps) {
  // Get subSystemId from URL if available (fallback)
  const [matchSubSystemTreasuries, params] = useRoute("/custom/sub-systems/:id/treasuries");
  const urlSubSystemId = propSubSystemId || (params?.id ? parseInt(params.id) : undefined);
  
  // Debug logging
  console.log("[CustomTreasuries] propSubSystemId:", propSubSystemId, "urlSubSystemId:", urlSubSystemId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTreasury, setEditingTreasury] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountSubTypes, setAccountSubTypes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountCurrencies, setAccountCurrencies] = useState<string[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);
  const [systemCurrencies, setSystemCurrencies] = useState<string[]>([]);

  // Form - تعيين subSystemId من URL إذا كان متاحاً
  const form = useForm<TreasuryFormValues>({
    resolver: zodResolver(treasuryFormSchema) as any as any as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      treasuryType: "cash",
      currencies: [],
      defaultCurrency: undefined,
      openingBalance: "0",
      description: "",
      accountId: undefined,
      subSystemId: urlSubSystemId,
    },
  });

  const watchTreasuryType = form.watch("treasuryType");
  const watchSubSystemId = form.watch("subSystemId");

  const accountsById = useMemo(() => {
    const map = new Map<number, any>();
    (accounts || []).forEach((a: any) => {
      if (a && typeof a.id === "number") map.set(a.id, a);
    });
    return map;
  }, [accounts]);

  // جلب قائمة العملات العامة (لاستخدامها كبديل عند غياب عملات الحساب)
  useEffect(() => {
    axios
      .get("/api/custom-system/v2/currencies")
      .then((res) => {
        const codes = (res.data || [])
          .filter((c: any) => c.code)
          .map((c: any) => c.code);
        setSystemCurrencies(codes);
      })
      .catch(() => setSystemCurrencies([]));
  }, []);

  // API Queries - استخدام subSystemId من URL إذا كان متاحاً
  const { data: treasuries, isLoading, refetch } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1, subSystemId: urlSubSystemId },
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
      currencies: (treasury as any).currencies || [],
      defaultCurrency: (treasury as any).defaultCurrency || undefined,
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
          const fallback = currs.length > 0 ? currs : systemCurrencies;
          setAccountCurrencies(fallback);
          // تعيين العملات المحفوظة إذا كانت موجودة
          const savedCurrencies = (treasury as any).currencies || [];
          if (savedCurrencies.length > 0) {
            form.setValue("currencies", savedCurrencies);
            form.setValue("defaultCurrency", (treasury as any).defaultCurrency || savedCurrencies[0]);
          } else if (currs.length > 0) {
            // إذا لم تكن هناك عملات محفوظة، نضع العملة القديمة إن وجدت
            const oldCurrency = (treasury as any).currency;
            if (oldCurrency && currs.includes(oldCurrency)) {
              form.setValue("currencies", [oldCurrency]);
              form.setValue("defaultCurrency", oldCurrency);
            } else {
              form.setValue("currencies", []);
              form.setValue("defaultCurrency", undefined);
            }
          } else {
            form.setValue("currencies", []);
            form.setValue("defaultCurrency", undefined);
          }
        })
        .catch(() => {
          setAccountCurrencies(systemCurrencies);
          form.setValue("currencies", []);
          form.setValue("defaultCurrency", undefined);
        })
        .finally(() => setCurrenciesLoading(false));
    } else {
      setAccountCurrencies(systemCurrencies);
      form.setValue("currencies", []);
      form.setValue("defaultCurrency", undefined);
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

  // تحميل الحسابات بحسب النظام الفرعي - استخدام urlSubSystemId أو watchSubSystemId
  const effectiveSubSystemId = urlSubSystemId || (watchSubSystemId && watchSubSystemId > 0 ? watchSubSystemId : undefined);
  
  useEffect(() => {
    (async () => {
      setAccountsLoading(true);
      try {
        const res = await axios.get("/api/custom-system/v2/accounts", {
          params: {
            subSystemId: effectiveSubSystemId,
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
  }, [effectiveSubSystemId]);

  const onSubmit = (data: TreasuryFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
      openingBalance: data.openingBalance || "0",
      currentBalance: data.openingBalance || "0",
      // استخدام urlSubSystemId إذا كان متاحاً
      subSystemId: urlSubSystemId || data.subSystemId,
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
    // استبعاد الحسابات "الرئيسية/التجميعية" (التي لديها أبناء) وإظهار الحسابات القابلة للاستخدام فقط
    const parentIds = new Set<number>();
    accounts.forEach((acc: any) => {
      const pid = acc?.parentAccountId;
      if (typeof pid === "number" && pid > 0) parentIds.add(pid);
    });

    const base = accounts.filter((acc: any) => {
      const isSub = (acc.level && acc.level > 1) || (acc.parentAccountId && acc.parentAccountId > 0);
      const hasChildren = parentIds.has(acc.id);
      const allowsEntry = acc.allowManualEntry !== false;
      return isSub && !hasChildren && allowsEntry && acc.accountSubTypeId === subTypeId;
    });
    const selectedId = form.watch("accountId");
    const selected = accounts.find((acc: any) => acc.id === selectedId);
    if (selected && !base.some((acc: any) => acc.id === selected.id)) {
      return [selected, ...base];
    }
    return base;
  }, [accounts, accountSubTypes, watchTreasuryType, form.watch("accountId")]);

  // جلب عملات الحساب المختار
  useEffect(() => {
    const accId = form.watch("accountId");
    const currentCurrencies = form.watch("currencies") || [];
    if (!accId) {
      setAccountCurrencies(systemCurrencies);
      form.setValue("currencies", []);
      form.setValue("defaultCurrency", undefined);
      return;
    }
    setCurrenciesLoading(true);
    axios
      .get(`/api/custom-system/v2/accounts/${accId}`)
      .then((res) => {
        const currs = (res.data?.currencies || [])
          .filter((c: any) => c.code)
          .map((c: any) => c.code);
        const fallback = currs.length > 0 ? currs : systemCurrencies;
        setAccountCurrencies(fallback);
        if (currs.length === 0) {
          toast.warning("الحساب المختار بلا عملات. سيتم عرض عملات النظام العامة مؤقتاً.");
        }
        if (fallback.length === 0) {
          form.setValue("currencies", []);
          form.setValue("defaultCurrency", undefined);
          return;
        }
        // لا نغير العملات المحددة إذا كانت موجودة بالفعل
        if (currentCurrencies.length === 0 && fallback.length > 0) {
          // فقط إذا لم يكن هناك عملات محددة
          form.setValue("currencies", []);
          form.setValue("defaultCurrency", undefined);
        }
      })
      .catch(() => {
        setAccountCurrencies(systemCurrencies);
        form.setValue("currencies", []);
        form.setValue("defaultCurrency", undefined);
      })
      .finally(() => setCurrenciesLoading(false));
  }, [watchTreasuryType, form.watch("accountId"), systemCurrencies]);

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
          <h1 className="text-2xl font-bold text-white">
            إدارة الخزائن
            {urlSubSystemId && subSystems && (
              <span className="text-emerald-400 mr-2">
                - {subSystems.find((s: any) => s.id === urlSubSystemId)?.nameAr}
              </span>
            )}
          </h1>
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
            <DialogContent className="bg-slate-900 border-slate-800 max-w-3xl p-0 max-h-[90vh] overflow-hidden">
              <div className="flex flex-col max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b border-slate-800">
                  <DialogTitle className="text-white">
                    {editingTreasury ? "تعديل الخزينة" : "إضافة خزينة جديدة"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    {editingTreasury ? "قم بتعديل بيانات الخزينة" : "أدخل بيانات الخزينة الجديدة"}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    id="treasury-form"
                    onSubmit={form.handleSubmit(onSubmit as any)}
                    className="flex-1 overflow-y-auto p-6 space-y-6"
                  >
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

                  {/* Accounting Link (Account + SubSystem) */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-white font-medium">الربط المحاسبي</h3>
                        <p className="text-slate-400 text-xs">
                          اختر حساب الخزينة من دليل الحسابات. يتم إظهار الحسابات الفرعية فقط المطابقة لنوع الخزينة.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* ربط الخزينة بالحساب (يُفلتر حسب النوع الفرعي) */}
                      <FormField
                        control={form.control as any}
                        name="accountId"
                        render={({ field }) => {
                          const selected = accounts.find((a: any) => a.id === field.value);
                          return (
                            <FormItem>
                              <FormLabel className="text-slate-300">
                                الحساب في دليل الحسابات <span className="text-red-400">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={(val) => field.onChange(parseInt(val))}
                                value={field.value ? String(field.value) : ""}
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
                                      {accountsLoading ? "جاري التحميل..." : "لا توجد حسابات مطابقة لنوع الخزينة"}
                                    </SelectItem>
                                  )}
                                  {filteredAccounts.map((acc: any) => (
                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                      <div className="flex flex-col gap-1">
                                        <span className="font-mono text-blue-400">{acc.accountCode}</span>
                                        <span className="text-sm text-slate-200">{acc.accountNameAr}</span>
                                        <span className="text-xs text-slate-500">
                                          نوع فرعي: {accountSubTypes.find((s) => s.id === acc.accountSubTypeId)?.nameAr || "غير محدد"}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-slate-400 text-xs">
                                {selected
                                  ? `المختار: ${selected.accountCode} - ${selected.accountNameAr}`
                                  : "ملاحظة: لن تظهر الحسابات الرئيسية/التجميعية في هذه القائمة."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />

                      {/* Sub System - مخفي إذا كان محدداً من URL */}
                      {!urlSubSystemId ? (
                        <FormField
                          control={form.control as any}
                          name="subSystemId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">النظام الفرعي (اختياري)</FormLabel>
                              <Select
                                onValueChange={(v) => field.onChange(v === "0" ? undefined : parseInt(v))}
                                value={field.value ? field.value.toString() : "0"}
                              >
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
                      ) : (
                        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg h-fit">
                          <span className="text-slate-400 text-sm">النظام الفرعي: </span>
                          <span className="text-emerald-400 font-medium">
                            {subSystems?.find((s: any) => s.id === urlSubSystemId)?.nameAr || `نظام #${urlSubSystemId}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Code */}
                    <FormField
                      control={form.control as any}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            الكود <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: CASH-001" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Currencies - Multi Select with Checkboxes */}
                    <FormField
                      control={form.control as any}
                      name="currencies"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-slate-300">
                              العملات المسموحة <span className="text-red-400">*</span>
                            </FormLabel>
                            {accountCurrencies.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs text-blue-400 hover:text-blue-300 h-6 px-2"
                                onClick={() => {
                                  if (field.value?.length === accountCurrencies.length) {
                                    // إلغاء تحديد الكل
                                    field.onChange([]);
                                    form.setValue("defaultCurrency", undefined);
                                  } else {
                                    // تحديد الكل
                                    field.onChange([...accountCurrencies]);
                                    if (!form.watch("defaultCurrency")) {
                                      form.setValue("defaultCurrency", accountCurrencies[0]);
                                    }
                                  }
                                }}
                              >
                                {field.value?.length === accountCurrencies.length ? "إلغاء الكل" : "تحديد الكل"}
                              </Button>
                            )}
                          </div>
                          <FormControl>
                            <div className="space-y-3">
                              {/* عرض العملات المختارة */}
                              {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 bg-emerald-900/20 border border-emerald-700/30 rounded-lg">
                                  <span className="text-emerald-400 text-xs font-medium w-full mb-1">العملات المختارة ({field.value.length}):</span>
                                  {field.value.map((curr: string) => (
                                    <Badge
                                      key={curr}
                                      variant="secondary"
                                      className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer flex items-center gap-1 px-3 py-1"
                                      onClick={() => {
                                        const newValue = field.value.filter((c: string) => c !== curr);
                                        field.onChange(newValue);
                                        if (form.watch("defaultCurrency") === curr) {
                                          form.setValue("defaultCurrency", newValue[0] || undefined);
                                        }
                                      }}
                                    >
                                      <Coins className="h-3 w-3" />
                                      {curr}
                                      <span className="ml-1 text-emerald-200 hover:text-white">×</span>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              {/* عرض العملات المتاحة كمربعات اختيار */}
                              <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg">
                                {currenciesLoading ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-5 w-5 animate-spin text-blue-400 mr-2" />
                                    <span className="text-slate-400 text-sm">جاري تحميل العملات...</span>
                                  </div>
                                ) : accountCurrencies.length === 0 ? (
                                  <div className="text-center py-4">
                                    <Coins className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                                    <span className="text-slate-500 text-sm block">
                                      {form.watch("accountId") 
                                        ? "لا توجد عملات مرتبطة بهذا الحساب"
                                        : "اختر حساباً أولاً لعرض العملات المتاحة"}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <span className="text-slate-400 text-xs font-medium block mb-2">
                                      العملات المتاحة للحساب ({accountCurrencies.length}):
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {accountCurrencies.map((code) => {
                                        const isSelected = field.value?.includes(code);
                                        return (
                                          <div
                                            key={code}
                                            onClick={() => {
                                              if (isSelected) {
                                                const newValue = field.value.filter((c: string) => c !== code);
                                                field.onChange(newValue);
                                                if (form.watch("defaultCurrency") === code) {
                                                  form.setValue("defaultCurrency", newValue[0] || undefined);
                                                }
                                              } else {
                                                const newValue = [...(field.value || []), code];
                                                field.onChange(newValue);
                                                if (!form.watch("defaultCurrency")) {
                                                  form.setValue("defaultCurrency", code);
                                                }
                                              }
                                            }}
                                            className={`
                                              flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200
                                              ${isSelected 
                                                ? "bg-blue-600/20 border-2 border-blue-500 text-blue-300" 
                                                : "bg-slate-700/50 border-2 border-transparent hover:border-slate-600 text-slate-300 hover:text-white"
                                              }
                                            `}
                                          >
                                            <div className={`
                                              w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                              ${isSelected 
                                                ? "bg-blue-500 border-blue-500" 
                                                : "border-slate-500 bg-transparent"
                                              }
                                            `}>
                                              {isSelected && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                            </div>
                                            <Coins className={`h-4 w-4 ${isSelected ? "text-blue-400" : "text-slate-500"}`} />
                                            <span className="font-medium">{code}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-slate-400 text-xs">
                            انقر على العملة لتحديدها أو إلغاء تحديدها. يمكنك اختيار عملة واحدة أو أكثر.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Default Currency */}
                    <FormField
                      control={form.control as any}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">العملة الافتراضية</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || ""}
                            disabled={!form.watch("currencies") || form.watch("currencies").length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-800 border-slate-700">
                                <SelectValue placeholder="اختر العملة الافتراضية" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-slate-800">
                              {(form.watch("currencies") || []).map((code: string) => (
                                <SelectItem key={code} value={code}>
                                  {code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-slate-400 text-xs">
                            العملة التي ستستخدم بشكل افتراضي في العمليات
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Arabic */}
                    <FormField
                      control={form.control as any}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">
                            الاسم بالعربي <span className="text-red-400">*</span>
                          </FormLabel>
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
                            <Select onValueChange={field.onChange} value={field.value || ""}>
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
                  </form>
                </Form>

                <div className="p-6 pt-4 border-t border-slate-800 bg-slate-900">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-slate-700"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      form="treasury-form"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-gradient-to-r from-blue-500 to-purple-600"
                    >
                      {(createMutation.isPending || updateMutation.isPending) && (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      )}
                      {editingTreasury ? "تحديث" : "إضافة"}
                    </Button>
                  </div>
                </div>
              </div>
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
              accountLookup={accountsById}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

