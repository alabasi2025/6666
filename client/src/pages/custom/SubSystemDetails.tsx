import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Wallet,
  Receipt,
  ArrowLeftRight,
  FileCheck,
  Settings,
  RefreshCw,
  Loader2,
  Plus,
  Building2,
  CreditCard,
  Smartphone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Send,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Link2,
  Unlink,
  Zap,
  Package,
  Users,
  ShoppingCart,
  FileText,
  BookOpen,
  Store,
  Activity,
  Coins,
  BarChart3,
} from "lucide-react";
import {
  AccountsPage as AccountsPageV2,
  AccountTypesPage,
  JournalEntriesPage,
  CurrenciesPage,
  ExchangeRatesPage,
} from "../CustomSystem/v2";
import CustomNotes from "./CustomNotes";
import CustomMemos from "./CustomMemos";
import CustomTreasuries from "./CustomTreasuries";
import PaymentVoucher from "./PaymentVoucher";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Treasury Type Icons
const treasuryTypeIcons = {
  cash: Wallet,
  bank: Building2,
  wallet: Smartphone,
  exchange: DollarSign,
};

const treasuryTypeLabels = {
  cash: "صندوق نقدي",
  bank: "حساب بنكي",
  wallet: "محفظة إلكترونية",
  exchange: "صراف",
};

// تصميم البطاقات لاختيار نوع الخزينة (نفس الواجهة المحسنة في الشاشة الرئيسية)
const treasuryTypesUI = {
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

const treasuryTypeColors = {
  cash: "bg-green-500/20 text-green-500 border-green-500/30",
  bank: "bg-blue-500/20 text-blue-500 border-blue-500/30",
  wallet: "bg-purple-500/20 text-purple-500 border-purple-500/30",
  exchange: "bg-orange-500/20 text-orange-500 border-orange-500/30",
};

// Treasury Card Component
function TreasuryCard({ treasury, onEdit, onDelete }: any) {
  const Icon = treasuryTypeIcons[treasury.treasuryType as keyof typeof treasuryTypeIcons] || Wallet;
  const typeLabel = treasuryTypeLabels[treasury.treasuryType as keyof typeof treasuryTypeLabels] || treasury.treasuryType;
  const typeColor = treasuryTypeColors[treasury.treasuryType as keyof typeof treasuryTypeColors] || "bg-slate-500/20 text-slate-500";
  
  // جلب العملات المتعددة
  const currencies = treasury.currencies || (treasury.currency ? [treasury.currency] : []);
  const defaultCurrency = treasury.defaultCurrency || treasury.currency || currencies[0] || "";

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", typeColor)}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{treasury.nameAr}</CardTitle>
              <CardDescription className="text-slate-400">
                {treasury.code}
                {treasury.nameEn && ` • ${treasury.nameEn}`}
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
                onClick={() => onDelete(treasury.id)} 
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
        <Badge variant="outline" className={cn("mb-3", typeColor)}>
          {typeLabel}
        </Badge>
        
        {/* Bank/Wallet Details */}
        {treasury.treasuryType === "bank" && treasury.bankName && (
          <p className="text-slate-400 text-sm mb-2">
            <span className="text-slate-500">البنك:</span> {treasury.bankName}
          </p>
        )}
        {treasury.treasuryType === "wallet" && treasury.walletProvider && (
          <p className="text-slate-400 text-sm mb-2">
            <span className="text-slate-500">المزود:</span> {treasury.walletProvider}
          </p>
        )}
        
        {/* عرض العملات المتعددة */}
        {currencies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {currencies.map((curr: string) => (
              <Badge 
                key={curr} 
                variant="outline" 
                className={cn(
                  "text-xs",
                  curr === defaultCurrency 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                    : "bg-slate-700/50 text-slate-400 border-slate-600"
                )}
              >
                {curr}
                {curr === defaultCurrency && " ✓"}
              </Badge>
            ))}
          </div>
        )}

        {/* Balance */}
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">الرصيد الحالي</span>
            <span className={cn(
              "text-xl font-bold",
              parseFloat(treasury.currentBalance || "0") >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {parseFloat(treasury.currentBalance || "0").toLocaleString("ar-SA")} {defaultCurrency}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant={treasury.isActive ? "default" : "secondary"} className={cn(
            treasury.isActive ? "bg-green-500/20 text-green-500" : "bg-slate-700 text-slate-400"
          )}>
            {treasury.isActive ? "نشط" : "غير نشط"}
          </Badge>
          <span className="text-xs text-slate-500">
            {new Date(treasury.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Component
interface SubSystemDetailsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function SubSystemDetails({ activeTab: externalActiveTab, onTabChange }: SubSystemDetailsProps = {}) {
  const [, params] = useRoute("/custom/sub-systems/:id");
  const id = (params as any)?.id;
  const [, setLocation] = useLocation();
  const [internalActiveTab, setInternalActiveTab] = useState("overview");
  
  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  const setActiveTab = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };
  const [isAddTreasuryOpen, setIsAddTreasuryOpen] = useState(false);
  const [editingTreasury, setEditingTreasury] = useState<any>(null);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(true);

  // New Treasury Form State
  const [newTreasury, setNewTreasury] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    treasuryType: "cash" as "cash" | "bank" | "wallet" | "exchange",
    bankName: "",
    accountNumber: "",
    iban: "",
    walletProvider: "",
    walletNumber: "",
    currencies: [] as string[],
    defaultCurrency: "" as string,
    openingBalance: "0",
    description: "",
    accountId: null as number | null,
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountSubTypes, setAccountSubTypes] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountCurrencies, setAccountCurrencies] = useState<any[]>([]);
  const [currenciesLoading, setCurrenciesLoading] = useState(false);

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    toSubSystemId: 0,
    fromTreasuryId: 0,
    toTreasuryId: 0,
    amount: "",
    description: "",
  });

  // API Queries - تحسين الأداء بتحميل البيانات حسب الحاجة
  const { data: subSystem, isLoading: subSystemLoading, refetch: refetchSubSystem } = trpc.customSystem.subSystems.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id, staleTime: 30000 }
  );

  const { data: treasuries, isLoading: treasuriesLoading, refetch: refetchTreasuries } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1, subSystemId: parseInt(id || "0") },
    { enabled: !!id, staleTime: 30000 }
  );

  // تحميل الحسابات الوسيطة فقط في تبويب نظرة عامة
  const { data: intermediaryAccounts } = trpc.customSystem.intermediaryAccounts.list.useQuery(
    { businessId: 1 },
    { enabled: !!id && activeTab === "overview", staleTime: 60000 }
  );

  // تحميل كل الأنظمة الفرعية فقط عند فتح نموذج التحويل
  const { data: allSubSystems } = trpc.customSystem.subSystems.list.useQuery(
    { businessId: 1 },
    { enabled: !!id && (activeTab === "transfers" || isAddTransferOpen), staleTime: 60000 }
  );

  // تحميل التحويلات فقط في تبويب التحويلات
  const { data: transfers, refetch: refetchTransfers } = trpc.customSystem.transfers.list.useQuery(
    { businessId: 1, subSystemId: parseInt(id || "0") },
    { enabled: !!id && activeTab === "transfers", staleTime: 30000 }
  );

  const { data: targetTreasuries } = trpc.customSystem.treasuries.list.useQuery(
    { businessId: 1, subSystemId: newTransfer.toSubSystemId },
    { enabled: newTransfer.toSubSystemId > 0, staleTime: 30000 }
  );

  // Reconciliation Queries - تحميل فقط في تبويب المطابقة
  const { data: reconciliations, refetch: refetchReconciliations } = trpc.customSystem.reconciliations.list.useQuery(
    { businessId: 1 },
    { enabled: !!id && activeTab === "reconciliation", staleTime: 30000 }
  );

  const { data: unreconciledTransfers, refetch: refetchUnreconciled } = trpc.customSystem.transfers.getUnreconciled.useQuery(
    { businessId: 1, subSystemId: parseInt(id || "0") },
    { enabled: !!id && activeTab === "reconciliation", staleTime: 30000 }
  );

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

  // تحميل الحسابات الخاصة بالنظام الفرعي + الحسابات المشتركة (subSystemId IS NULL)
  useEffect(() => {
    (async () => {
      setAccountsLoading(true);
      try {
        const subSystemId = parseInt(id || "0");
        const res = await axios.get("/api/custom-system/v2/accounts", {
          params: {
            subSystemId: subSystemId > 0 ? subSystemId : undefined,
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
  }, [id]);

  // ربط نوع الخزينة بنوع الحساب الفرعي
  const treasuryToSubTypeCode: Record<string, string> = {
    cash: "cash",
    bank: "bank",
    wallet: "wallet",
    exchange: "exchange",
  };

  const filteredAccounts = useMemo(() => {
    const code = treasuryToSubTypeCode[newTreasury.treasuryType] || "";
    const subTypeId = accountSubTypes.find((s: any) => s.code === code)?.id;

    // عرض الحسابات التي تطابق نوع الحساب الفرعي فقط
    if (!subTypeId) return [];
    const base = accounts.filter((acc: any) => acc.accountSubTypeId === subTypeId);
    const selected = accounts.find((acc: any) => acc.id === newTreasury.accountId);
    // إذا كان الحساب المحدد غير موجود في الفلترة الحالية، أضفه لكي لا يختفي من القائمة عند التعديل
    if (selected && !base.some((acc: any) => acc.id === selected.id)) {
      return [selected, ...base];
    }
    return base;
  }, [accounts, accountSubTypes, newTreasury.treasuryType, newTreasury.accountId]);

  // جلب عملات الحساب المختار
  useEffect(() => {
    if (!newTreasury.accountId) {
      setAccountCurrencies([]);
      setNewTreasury((prev) => ({ ...prev, currency: "" }));
      return;
    }
    setCurrenciesLoading(true);
    axios
      .get(`/api/custom-system/v2/accounts/${newTreasury.accountId}`)
      .then((res) => {
        const currs = (res.data?.currencies || [])
          .filter((c: any) => c.code)
          .map((c: any) => c.code);
        setAccountCurrencies(currs);
        if (currs.length > 0) {
          setNewTreasury((prev) => ({ ...prev, currency: currs[0] }));
        } else {
          setNewTreasury((prev) => ({ ...prev, currency: "" }));
        }
      })
      .catch(() => {
        setAccountCurrencies([]);
        setNewTreasury((prev) => ({ ...prev, currency: "" }));
      })
      .finally(() => setCurrenciesLoading(false));
  }, [newTreasury.accountId]);

  // Mutations
  const createTreasuryMutation = trpc.customSystem.treasuries.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الخزينة بنجاح");
      setIsAddTreasuryOpen(false);
      resetTreasuryForm();
      refetchTreasuries();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateTreasuryMutation = trpc.customSystem.treasuries.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الخزينة بنجاح");
      setIsAddTreasuryOpen(false);
      setEditingTreasury(null);
      resetTreasuryForm();
      refetchTreasuries();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const createTransferMutation = trpc.customSystem.transfers.create.useMutation({
    onSuccess: (data) => {
      toast.success(`تم إنشاء التحويل بنجاح - سند صرف: ${data.paymentVoucherNumber} | سند قبض: ${data.receiptVoucherNumber}`);
      setIsAddTransferOpen(false);
      resetTransferForm();
      refetchTransfers();
      refetchTreasuries();
      refetchReceipts();
      refetchPayments();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteTreasuryMutation = trpc.customSystem.treasuries.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخزينة بنجاح");
      refetchTreasuries();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Reconciliation Mutations
  const autoReconcileMutation = trpc.customSystem.reconciliations.autoReconcile.useMutation({
    onSuccess: (data) => {
      if (data.count > 0) {
        toast.success(`تم العثور على ${data.count} مطابقة محتملة`);
      } else {
        toast.info("لم يتم العثور على مطابقات جديدة");
      }
      refetchReconciliations();
      refetchUnreconciled();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const confirmReconciliationMutation = trpc.customSystem.reconciliations.confirm.useMutation({
    onSuccess: () => {
      toast.success("تم تأكيد المطابقة بنجاح");
      refetchReconciliations();
      refetchUnreconciled();
      refetchReceipts();
      refetchPayments();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const rejectReconciliationMutation = trpc.customSystem.reconciliations.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض المطابقة");
      refetchReconciliations();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Reset Forms
  const resetTreasuryForm = () => {
    setNewTreasury({
      code: "",
      nameAr: "",
      nameEn: "",
      treasuryType: "cash",
      bankName: "",
      accountNumber: "",
      iban: "",
      walletProvider: "",
      walletNumber: "",
      currencies: [],
      defaultCurrency: "",
      openingBalance: "0",
      description: "",
      accountId: null,
    });
  };

  const resetTransferForm = () => {
    setNewTransfer({
      toSubSystemId: 0,
      fromTreasuryId: 0,
      toTreasuryId: 0,
      amount: "",
      description: "",
    });
  };

  const handleCreateTransfer = () => {
    if (!newTransfer.toSubSystemId || !newTransfer.fromTreasuryId || !newTransfer.toTreasuryId || !newTransfer.amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createTransferMutation.mutate({
      businessId: 1,
      fromSubSystemId: parseInt(id || "0"),
      toSubSystemId: newTransfer.toSubSystemId,
      fromTreasuryId: newTransfer.fromTreasuryId,
      toTreasuryId: newTransfer.toTreasuryId,
      amount: newTransfer.amount,
      description: newTransfer.description,
      transferDate: new Date().toISOString().split("T")[0],
    } as any);
  };

  // Handlers
  const handleEditTreasury = (treasury: any) => {
    setEditingTreasury(treasury);
    // جلب العملات المحفوظة للخزينة
    const treasuryCurrencies = treasury.currencies || (treasury.currency ? [treasury.currency] : []);
    const treasuryDefaultCurrency = treasury.defaultCurrency || treasury.currency || "";
    
    setNewTreasury({
      code: treasury.code || "",
      nameAr: treasury.nameAr || "",
      nameEn: treasury.nameEn || "",
      treasuryType: treasury.treasuryType || "cash",
      bankName: treasury.bankName || "",
      accountNumber: treasury.accountNumber || "",
      iban: treasury.iban || "",
      walletProvider: treasury.walletProvider || "",
      walletNumber: treasury.walletNumber || "",
      currencies: treasuryCurrencies,
      defaultCurrency: treasuryDefaultCurrency,
      openingBalance: treasury.openingBalance || "0",
      description: treasury.description || "",
      accountId: treasury.accountId || null,
    });
    // عند التعديل، اجلب العملات للحساب المرتبط (إن وجد)
    if (treasury.accountId) {
      setCurrenciesLoading(true);
      axios
        .get(`/api/custom-system/v2/accounts/${treasury.accountId}`)
        .then((res) => {
          const currs = (res.data?.currencies || [])
            .filter((c: any) => c.code)
            .map((c: any) => c.code);
          setAccountCurrencies(currs);
        })
        .catch(() => {
          setAccountCurrencies([]);
        })
        .finally(() => setCurrenciesLoading(false));
    } else {
      setAccountCurrencies([]);
    }
    setIsAddTreasuryOpen(true);
  };

  const handleSaveTreasury = () => {
    if (!newTreasury.code || !newTreasury.nameAr) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    if (newTreasury.currencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    if (editingTreasury) {
      // تحديث الصندوق
      updateTreasuryMutation.mutate({
        id: editingTreasury.id,
        code: newTreasury.code,
        nameAr: newTreasury.nameAr,
        nameEn: newTreasury.nameEn,
        treasuryType: newTreasury.treasuryType,
        bankName: newTreasury.bankName || undefined,
        accountNumber: newTreasury.accountNumber || undefined,
        iban: newTreasury.iban || undefined,
        walletProvider: newTreasury.walletProvider || undefined,
        walletNumber: newTreasury.walletNumber || undefined,
        currencies: newTreasury.currencies,
        defaultCurrency: newTreasury.defaultCurrency || newTreasury.currencies[0],
        description: newTreasury.description || undefined,
        accountId: newTreasury.accountId || null,
      } as any);
    } else {
      // إنشاء صندوق جديد
      createTreasuryMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        ...newTreasury,
        defaultCurrency: newTreasury.defaultCurrency || newTreasury.currencies[0],
        openingBalance: newTreasury.openingBalance || "0",
        currentBalance: newTreasury.openingBalance || "0",
        accountId: newTreasury.accountId || null,
      } as any);
    }
  };

  const handleCreateTreasury = () => {
    handleSaveTreasury();
  };

  const handleDeleteTreasury = (treasuryId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟")) {
      deleteTreasuryMutation.mutate({ id: treasuryId } as any);
    }
  };

  // Calculate Stats
  const totalBalance = treasuries?.reduce((sum: number, t: any) => sum + parseFloat(t.currentBalance || "0"), 0) || 0;

  // Get related intermediary accounts for this sub system
  const relatedIntermediaryAccounts = intermediaryAccounts?.filter(
    (acc: any) => acc.fromSubSystemId === parseInt(id || "0") || acc.toSubSystemId === parseInt(id || "0")
  ) || [];

  if (subSystemLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!subSystem) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">النظام الفرعي غير موجود</p>
        <Button onClick={() => setLocation("/custom/sub-systems")} className="mt-4">
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للأنظمة الفرعية
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/custom/sub-systems")}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{subSystem.nameAr}</h1>
            <p className="text-slate-400">{subSystem.code} {subSystem.nameEn && `• ${subSystem.nameEn}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => {
            refetchSubSystem();
            refetchTreasuries();
            refetchReceipts();
            refetchPayments();
          }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Settings className="ml-2 h-4 w-4" />
            إعدادات النظام
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400">إجمالي الرصيد</p>
                <p className="text-2xl font-bold text-white">{totalBalance.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400">عدد الخزائن</p>
                <p className="text-2xl font-bold text-white">{treasuries?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "" : "text-slate-400 hover:text-white"}
          >
            نظرة عامة
          </Button>
          <Button
            variant={activeTab === "treasuries" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("treasuries")}
            className={activeTab === "treasuries" ? "" : "text-slate-400 hover:text-white"}
          >
            <Wallet className="ml-2 h-4 w-4" />
            الخزائن
          </Button>
          <Button
            variant={activeTab === "transfers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("transfers")}
            className={activeTab === "transfers" ? "" : "text-slate-400 hover:text-white"}
          >
            <ArrowLeftRight className="ml-2 h-4 w-4" />
            التحويلات
          </Button>
          <Button
            variant={activeTab === "reconciliation" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("reconciliation")}
            className={activeTab === "reconciliation" ? "" : "text-slate-400 hover:text-white"}
          >
            <FileCheck className="ml-2 h-4 w-4" />
            المطابقة
          </Button>

          <Button
            variant={activeTab === "journal-entries" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("journal-entries")}
            className={activeTab === "journal-entries" ? "" : "text-slate-400 hover:text-white"}
          >
            <BookOpen className="ml-2 h-4 w-4" />
            القيود اليومية
          </Button>
          <Button
            variant={activeTab === "accounts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("accounts")}
            className={activeTab === "accounts" ? "" : "text-slate-400 hover:text-white"}
          >
            <CreditCard className="ml-2 h-4 w-4" />
            دليل الحسابات
          </Button>
          <Button
            variant={activeTab === "account-types" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("account-types")}
            className={activeTab === "account-types" ? "" : "text-slate-400 hover:text-white"}
          >
            <Settings className="ml-2 h-4 w-4" />
            أنواع الحسابات
          </Button>
          <Button
            variant={activeTab === "currencies" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("currencies")}
            className={activeTab === "currencies" ? "" : "text-slate-400 hover:text-white"}
          >
            <Coins className="ml-2 h-4 w-4" />
            العملات
          </Button>
          <Button
            variant={activeTab === "exchange-rates" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("exchange-rates")}
            className={activeTab === "exchange-rates" ? "" : "text-slate-400 hover:text-white"}
          >
            <RefreshCw className="ml-2 h-4 w-4" />
            أسعار الصرف
          </Button>
          <Button
            variant={reportsExpanded ? "default" : "ghost"}
            size="sm"
            onClick={() => setReportsExpanded((prev) => !prev)}
            className={reportsExpanded ? "" : "text-slate-400 hover:text-white"}
          >
            <FileText className="ml-2 h-4 w-4" />
            التقارير
          </Button>
          {reportsExpanded && (
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant={activeTab === "ledger-report" ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("ledger-report")}
                className={cn(
                  "border-slate-700",
                  activeTab === "ledger-report" ? "" : "bg-slate-800/60 text-slate-200"
                )}
              >
                <BookOpen className="ml-2 h-4 w-4" />
                كشف حساب
              </Button>
              <Button
                variant={activeTab === "trial-balance-report" ? "default" : "secondary"}
                size="sm"
                onClick={() => setActiveTab("trial-balance-report")}
                className={cn(
                  "border-slate-700",
                  activeTab === "trial-balance-report" ? "" : "bg-slate-800/60 text-slate-200"
                )}
              >
                <BarChart3 className="ml-2 h-4 w-4" />
                ميزان المراجعة
              </Button>
            </div>
          )}
          <Button
            variant={activeTab === "inventory" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("inventory")}
            className={activeTab === "inventory" ? "" : "text-slate-400 hover:text-white"}
          >
            <Package className="ml-2 h-4 w-4" />
            المخزون
          </Button>
          <Button
            variant={activeTab === "suppliers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("suppliers")}
            className={activeTab === "suppliers" ? "" : "text-slate-400 hover:text-white"}
          >
            <Users className="ml-2 h-4 w-4" />
            الموردين
          </Button>
          <Button
            variant={activeTab === "purchases" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("purchases")}
            className={activeTab === "purchases" ? "" : "text-slate-400 hover:text-white"}
          >
            <ShoppingCart className="ml-2 h-4 w-4" />
            المشتريات
          </Button>
          <Button
            variant={activeTab === "notes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("notes")}
            className={activeTab === "notes" ? "" : "text-slate-400 hover:text-white"}
          >
            <FileText className="ml-2 h-4 w-4" />
            الملاحظات
          </Button>
          <Button
            variant={activeTab === "memos" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("memos")}
            className={activeTab === "memos" ? "" : "text-slate-400 hover:text-white"}
          >
            <BookOpen className="ml-2 h-4 w-4" />
            المذكرات
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
          {/* Intermediary Accounts */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">الحسابات الوسيطة المرتبطة</CardTitle>
              <CardDescription>حسابات التحويل بين هذا النظام والأنظمة الأخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {relatedIntermediaryAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedIntermediaryAccounts.map((acc: any) => {
                    const isFrom = acc.fromSubSystemId === parseInt(id || "0");
                    const otherSystem = allSubSystems?.find((s: any) => 
                      s.id === (isFrom ? acc.toSubSystemId : acc.fromSubSystemId)
                    );
                    
                    return (
                      <div key={acc.id} className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowLeftRight className="h-4 w-4 text-purple-500" />
                          <span className="font-medium text-white">{acc.nameAr}</span>
                        </div>
                        <p className="text-sm text-slate-400">
                          {isFrom ? "إلى" : "من"}: {otherSystem?.nameAr || "غير معروف"}
                        </p>
                        <p className={cn(
                          "text-lg font-bold mt-2",
                          parseFloat(acc.balance) >= 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {parseFloat(acc.balance).toLocaleString("ar-SA")} {acc.currency}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-4">لا توجد حسابات وسيطة مرتبطة</p>
              )}
            </CardContent>
          </Card>
            </div>
          )}

          {/* Treasuries Tab - استخدام الواجهة الجديدة مع دعم العملات المتعددة */}
          {activeTab === "treasuries" && (
            <CustomTreasuries subSystemId={parseInt(id || "0")} />
          )}

          {/* Payment Voucher Tab - سند الصرف */}
          {activeTab === "payment-voucher" && (
            <PaymentVoucher subSystemId={parseInt(id || "0")} />
          )}

          {/* OLD Treasuries Tab - محذوف واستبدل بالواجهة الجديدة */}
          {false && activeTab === "treasuries_old" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">الخزائن</h2>
                <Button onClick={() => setIsAddTreasuryOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خزينة
                </Button>
              </div>

              {/* Add/Edit Treasury Dialog */}
              <Dialog open={isAddTreasuryOpen} onOpenChange={(open) => {
                setIsAddTreasuryOpen(open);
                if (!open) {
                  setEditingTreasury(null);
                  resetTreasuryForm();
                }
              }}>
                <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingTreasury ? "تعديل الخزينة" : "إضافة خزينة جديدة"}</DialogTitle>
                  <DialogDescription>{editingTreasury ? "قم بتعديل بيانات الخزينة" : "أضف خزينة جديدة لهذا النظام الفرعي"}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>نوع الخزينة</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(treasuryTypesUI).map(([key, config]) => {
                        const Icon = (config as any).icon;
                        const isActive = newTreasury.treasuryType === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setNewTreasury({ ...newTreasury, treasuryType: key as any })}
                            className={cn(
                              "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 bg-slate-800/60",
                              isActive
                                ? `${(config as any).borderColor} ${(config as any).bgColor}`
                                : "border-slate-700 hover:border-slate-600"
                            )}
                          >
                            <Icon className={cn("h-6 w-6", isActive ? (config as any).color : "text-slate-400")} />
                            <span className={cn("text-xs", isActive ? "text-white" : "text-slate-400")}>
                              {(config as any).label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكود</Label>
                      <Input
                        value={newTreasury.code}
                        onChange={(e) => setNewTreasury({ ...newTreasury, code: e.target.value })}
                        placeholder="CASH-001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الاسم بالعربي</Label>
                      <Input
                        value={newTreasury.nameAr}
                        onChange={(e) => setNewTreasury({ ...newTreasury, nameAr: e.target.value })}
                        placeholder="الصندوق الرئيسي"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الاسم بالإنجليزي</Label>
                      <Input
                        value={newTreasury.nameEn}
                        onChange={(e) => setNewTreasury({ ...newTreasury, nameEn: e.target.value })}
                        placeholder="Main Cash"
                      />
                    </div>
                  </div>
                  
                  {newTreasury.treasuryType === "bank" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>اسم البنك</Label>
                          <Input
                            value={newTreasury.bankName}
                            onChange={(e) => setNewTreasury({ ...newTreasury, bankName: e.target.value })}
                            placeholder="البنك الأهلي"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>رقم الحساب</Label>
                          <Input
                            value={newTreasury.accountNumber}
                            onChange={(e) => setNewTreasury({ ...newTreasury, accountNumber: e.target.value })}
                            placeholder="1234567890"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>IBAN</Label>
                        <Input
                          value={newTreasury.iban}
                          onChange={(e) => setNewTreasury({ ...newTreasury, iban: e.target.value })}
                          placeholder="SA..."
                        />
                      </div>
                    </>
                  )}

                  {newTreasury.treasuryType === "wallet" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>مزود المحفظة</Label>
                        <Input
                          value={newTreasury.walletProvider}
                          onChange={(e) => setNewTreasury({ ...newTreasury, walletProvider: e.target.value })}
                          placeholder="STC Pay"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>رقم المحفظة</Label>
                        <Input
                          value={newTreasury.walletNumber}
                          onChange={(e) => setNewTreasury({ ...newTreasury, walletNumber: e.target.value })}
                          placeholder="05xxxxxxxx"
                        />
                      </div>
                    </div>
                  )}

                  {/* العملات المتعددة */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>العملات المتاحة</Label>
                      {accountCurrencies.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (newTreasury.currencies.length === accountCurrencies.length) {
                              setNewTreasury({ ...newTreasury, currencies: [], defaultCurrency: "" });
                            } else {
                              setNewTreasury({ ...newTreasury, currencies: [...accountCurrencies], defaultCurrency: newTreasury.defaultCurrency || accountCurrencies[0] });
                            }
                          }}
                        >
                          {newTreasury.currencies.length === accountCurrencies.length ? "إلغاء الكل" : "تحديد الكل"}
                        </Button>
                      )}
                    </div>
                    {currenciesLoading ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>جاري تحميل العملات...</span>
                      </div>
                    ) : accountCurrencies.length === 0 ? (
                      <p className="text-sm text-slate-400">اختر حساباً أولاً لعرض العملات المتاحة</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {accountCurrencies.map((code) => {
                          const isSelected = newTreasury.currencies.includes(code);
                          const isDefault = newTreasury.defaultCurrency === code;
                          return (
                            <div
                              key={code}
                              className={cn(
                                "p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center gap-1",
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : "border-slate-700 hover:border-slate-600 bg-slate-800/60"
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  const newCurrencies = newTreasury.currencies.filter(c => c !== code);
                                  setNewTreasury({
                                    ...newTreasury,
                                    currencies: newCurrencies,
                                    defaultCurrency: newTreasury.defaultCurrency === code ? (newCurrencies[0] || "") : newTreasury.defaultCurrency
                                  });
                                } else {
                                  setNewTreasury({
                                    ...newTreasury,
                                    currencies: [...newTreasury.currencies, code],
                                    defaultCurrency: newTreasury.defaultCurrency || code
                                  });
                                }
                              }}
                            >
                              <span className={cn("font-bold", isSelected ? "text-emerald-400" : "text-slate-400")}>
                                {code}
                              </span>
                              {isSelected && (
                                <Badge
                                  variant={isDefault ? "default" : "outline"}
                                  className={cn(
                                    "text-xs cursor-pointer",
                                    isDefault ? "bg-emerald-500" : "hover:bg-emerald-500/20"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTreasury({ ...newTreasury, defaultCurrency: code });
                                  }}
                                >
                                  {isDefault ? "الافتراضية" : "تعيين افتراضي"}
                                </Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {newTreasury.currencies.length > 0 && (
                      <p className="text-xs text-slate-400">
                        العملات المحددة: {newTreasury.currencies.join(", ")} | الافتراضية: {newTreasury.defaultCurrency}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>الرصيد الافتتاحي</Label>
                    <Input
                      type="number"
                      value={newTreasury.openingBalance}
                      onChange={(e) => setNewTreasury({ ...newTreasury, openingBalance: e.target.value })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الحساب في دليل الحسابات</Label>
                    <Select
                      value={newTreasury.accountId ? newTreasury.accountId.toString() : ""}
                      onValueChange={(v) => setNewTreasury({ ...newTreasury, accountId: v ? parseInt(v) : null })}
                      disabled={accountsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={accountsLoading ? "جاري التحميل..." : "اختر الحساب"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {filteredAccounts.length === 0 && (
                          <SelectItem value="__none" disabled>
                            {accountsLoading ? "جاري التحميل..." : "لا توجد حسابات متاحة"}
                          </SelectItem>
                        )}
                        {filteredAccounts.map((acc: any) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>
                            <span className="font-mono text-blue-400">{acc.accountCode}</span>
                            {" - "}
                            <span>{acc.accountNameAr}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">
                      تظهر الحسابات التي نوعها الفرعي يطابق نوع الخزينة. في حال عدم وجود مطابق، تظهر كل الحسابات كخيار احتياطي.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      value={newTreasury.description}
                      onChange={(e) => setNewTreasury({ ...newTreasury, description: e.target.value })}
                      placeholder="وصف الخزينة..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setIsAddTreasuryOpen(false);
                    setEditingTreasury(null);
                    resetTreasuryForm();
                  }}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={handleSaveTreasury} 
                    disabled={createTreasuryMutation.isPending || updateTreasuryMutation.isPending}
                  >
                    {(createTreasuryMutation.isPending || updateTreasuryMutation.isPending) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    {editingTreasury ? "حفظ التعديلات" : "إنشاء"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {treasuriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : treasuries && treasuries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {treasuries.map((treasury: any) => (
                  <TreasuryCard
                    key={treasury.id}
                    treasury={treasury}
                    onEdit={handleEditTreasury}
                    onDelete={handleDeleteTreasury}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-slate-600 mb-4" />
                  <p className="text-slate-400 text-lg mb-2">لا توجد خزائن</p>
                  <p className="text-slate-500 text-sm mb-4">أضف خزينة جديدة للبدء</p>
                  <Button onClick={() => setIsAddTreasuryOpen(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة خزينة
                  </Button>
                </CardContent>
              </Card>
            )}
            </div>
          )}

          {/* Transfers Tab */}
          {activeTab === "transfers" && (
            <div className="space-y-4">
              {/* Transfer Actions */}
              <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">التحويلات بين الأنظمة</h3>
              <p className="text-sm text-slate-400">إدارة التحويلات المالية بين هذا النظام والأنظمة الفرعية الأخرى</p>
            </div>
            <Dialog open={isAddTransferOpen} onOpenChange={setIsAddTransferOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Send className="h-4 w-4 ml-2" />
                  تحويل جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">تحويل مالي جديد</DialogTitle>
                  <DialogDescription>تحويل مبلغ من هذا النظام إلى نظام فرعي آخر</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Target Sub System */}
                  <div className="space-y-2">
                    <Label>النظام المستهدف *</Label>
                    <Select
                      value={newTransfer.toSubSystemId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, toSubSystemId: parseInt(v), toTreasuryId: 0 })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="اختر النظام المستهدف" />
                      </SelectTrigger>
                      <SelectContent>
                        {allSubSystems?.filter(s => s.id !== parseInt(id || "0")).map((sys) => (
                          <SelectItem key={sys.id} value={sys.id.toString()}>
                            {sys.nameAr} ({sys.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Source Treasury */}
                  <div className="space-y-2">
                    <Label>الخزينة المصدر (من هذا النظام) *</Label>
                    <Select
                      value={newTransfer.fromTreasuryId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, fromTreasuryId: parseInt(v) })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="اختر الخزينة المصدر" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasuries?.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr} - رصيد: {parseFloat(t.currentBalance || "0").toLocaleString("ar-SA")} {t.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Treasury */}
                  <div className="space-y-2">
                    <Label>الخزينة المستهدفة *</Label>
                    <Select
                      value={newTransfer.toTreasuryId.toString()}
                      onValueChange={(v) => setNewTransfer({ ...newTransfer, toTreasuryId: parseInt(v) })}
                      disabled={!newTransfer.toSubSystemId}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder={newTransfer.toSubSystemId ? "اختر الخزينة المستهدفة" : "اختر النظام أولاً"} />
                      </SelectTrigger>
                      <SelectContent>
                        {targetTreasuries?.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr} - رصيد: {parseFloat(t.currentBalance || "0").toLocaleString("ar-SA")} {t.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>المبلغ *</Label>
                    <Input
                      type="number"
                      value={newTransfer.amount}
                      onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                      placeholder="0.00"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      value={newTransfer.description}
                      onChange={(e) => setNewTransfer({ ...newTransfer, description: e.target.value })}
                      placeholder="وصف التحويل..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      <strong>ملاحظة:</strong> سيتم إنشاء سند صرف في هذا النظام وسند قبض في النظام المستهدف عبر حساب وسيط.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTransferOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateTransfer}
                    disabled={createTransferMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {createTransferMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 ml-2 animate-spin" /> جاري التحويل...</>
                    ) : (
                      <><Send className="h-4 w-4 ml-2" /> تنفيذ التحويل</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Outgoing Transfers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                التحويلات الصادرة
              </CardTitle>
              <CardDescription>المبالغ المحولة من هذا النظام إلى أنظمة أخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {(transfers as any)?.outgoing && (transfers as any).outgoing.length > 0 ? (
                <div className="space-y-3">
                  {((transfers as any).outgoing || []).map((transfer: any) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transfer.voucherNumber}</p>
                          <p className="text-sm text-slate-400">{transfer.description || 'تحويل بين الأنظمة'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-red-400 font-bold">-{parseFloat(transfer.amount).toLocaleString("ar-SA")} {transfer.currency}</p>
                        <p className="text-xs text-slate-500">{new Date(transfer.voucherDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        transfer.isReconciled 
                          ? "bg-green-500/20 text-green-500 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                      )}>
                        {transfer.isReconciled ? "مطابق" : "بانتظار المطابقة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingDown className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">لا توجد تحويلات صادرة</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incoming Transfers */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                التحويلات الواردة
              </CardTitle>
              <CardDescription>المبالغ المحولة إلى هذا النظام من أنظمة أخرى</CardDescription>
            </CardHeader>
            <CardContent>
              {(transfers as any)?.incoming && (transfers as any).incoming.length > 0 ? (
                <div className="space-y-3">
                  {((transfers as any).incoming || []).map((transfer: any) => (
                    <div key={transfer.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{transfer.voucherNumber}</p>
                          <p className="text-sm text-slate-400">{transfer.description || 'تحويل بين الأنظمة'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-green-400 font-bold">+{parseFloat(transfer.amount).toLocaleString("ar-SA")} {transfer.currency}</p>
                        <p className="text-xs text-slate-500">{new Date(transfer.voucherDate).toLocaleDateString("ar-SA")}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        transfer.isReconciled 
                          ? "bg-green-500/20 text-green-500 border-green-500/30" 
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                      )}>
                        {transfer.isReconciled ? "مطابق" : "بانتظار المطابقة"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">لا توجد تحويلات واردة</p>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          )}

          {/* Reconciliation Tab */}
          {activeTab === "reconciliation" && (
            <div className="space-y-4">
              {/* بطاقة المطابقة التلقائية */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/50 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">المطابقة التلقائية</CardTitle>
                    <CardDescription>البحث عن سندات قبض وصرف متطابقة تلقائياً</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => autoReconcileMutation.mutate({ businessId: 1 } as any)}
                  disabled={autoReconcileMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {autoReconcileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 ml-2" />
                  )}
                  بحث عن مطابقات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "pending").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">بانتظار التأكيد</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "confirmed").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">مؤكدة</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {reconciliations?.filter(r => r.status === "rejected").length || 0}
                  </p>
                  <p className="text-sm text-slate-400">مرفوضة</p>
                </div>
              </div>
            </CardContent>
              </Card>

              {/* التحويلات بانتظار المطابقة */}
              <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Unlink className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <CardTitle className="text-white">التحويلات بانتظار المطابقة</CardTitle>
                  <CardDescription>سندات لم يتم مطابقتها بعد</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {unreconciledTransfers && (unreconciledTransfers.outgoing?.length > 0 || unreconciledTransfers.incoming?.length > 0) ? (
                <div className="space-y-4">
                  {/* الصادرة */}
                  {unreconciledTransfers.outgoing?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        سندات صرف صادرة
                      </h4>
                      <div className="space-y-2">
                        {unreconciledTransfers.outgoing.map((voucher: any) => (
                          <div key={voucher.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <TrendingDown className="h-5 w-5 text-red-500" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{voucher.voucherNumber}</p>
                                <p className="text-sm text-slate-400">{voucher.destinationName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="font-bold text-red-500">-{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}</p>
                                <p className="text-xs text-slate-500">{new Date(voucher.voucherDate).toLocaleDateString("ar-SA")}</p>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <Clock className="h-3 w-3 ml-1" />
                                بانتظار
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* الواردة */}
                  {unreconciledTransfers.incoming?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        سندات قبض واردة
                      </h4>
                      <div className="space-y-2">
                        {unreconciledTransfers.incoming.map((voucher: any) => (
                          <div key={voucher.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-yellow-500/20">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{voucher.voucherNumber}</p>
                                <p className="text-sm text-slate-400">{voucher.sourceName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-left">
                                <p className="font-bold text-green-500">+{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}</p>
                                <p className="text-xs text-slate-500">{new Date(voucher.voucherDate).toLocaleDateString("ar-SA")}</p>
                              </div>
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                <Clock className="h-3 w-3 ml-1" />
                                بانتظار
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد تحويلات بانتظار المطابقة</p>
                  <p className="text-slate-500 text-sm mt-2">جميع التحويلات مطابقة</p>
                </div>
              )}
            </CardContent>
              </Card>

              {/* المطابقات المقترحة */}
              <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-white">المطابقات المقترحة</CardTitle>
                  <CardDescription>مطابقات تم اكتشافها تلقائياً بانتظار التأكيد</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reconciliations?.filter(r => r.status === "pending").length > 0 ? (
                <div className="space-y-3">
                  {reconciliations?.filter(r => r.status === "pending").map((rec: any) => (
                    <div key={rec.id} className="p-4 bg-slate-800/30 rounded-lg border border-blue-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "text-xs",
                            rec.confidenceScore === "high" ? "bg-green-500/20 text-green-500 border-green-500/30" :
                            rec.confidenceScore === "medium" ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" :
                            "bg-red-500/20 text-red-500 border-red-500/30"
                          )}>
                            {rec.confidenceScore === "high" ? "ثقة عالية" :
                             rec.confidenceScore === "medium" ? "ثقة متوسطة" : "ثقة منخفضة"}
                          </Badge>
                          <span className="text-lg font-bold text-white">
                            {parseFloat(rec.amount).toLocaleString("ar-SA")} {rec.currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                            onClick={() => rejectReconciliationMutation.mutate({ id: rec.id } as any)}
                            disabled={rejectReconciliationMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 ml-1" />
                            رفض
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => confirmReconciliationMutation.mutate({ id: rec.id } as any)}
                            disabled={confirmReconciliationMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 ml-1" />
                            تأكيد
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-400">سند صرف</span>
                          </div>
                          <p className="text-white font-medium">PV-{String(rec.paymentVoucherId).padStart(6, '0')}</p>
                        </div>
                        <div className="flex items-center">
                          <ArrowLeftRight className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="flex-1 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-400">سند قبض</span>
                          </div>
                          <p className="text-white font-medium">RV-{String(rec.receiptVoucherId).padStart(6, '0')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">لا توجد مطابقات مقترحة</p>
                  <p className="text-slate-500 text-sm mt-2">
                    انقر على "بحث عن مطابقات" للبحث عن سندات متطابقة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

              {/* المطابقات المؤكدة */}
              {reconciliations?.filter(r => r.status === "confirmed").length > 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white">المطابقات المؤكدة</CardTitle>
                    <CardDescription>مطابقات تم تأكيدها</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reconciliations?.filter(r => r.status === "confirmed").map((rec: any) => (
                    <div key={rec.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">PV-{String(rec.paymentVoucherId).padStart(6, '0')}</span>
                          <ArrowLeftRight className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-slate-400">RV-{String(rec.receiptVoucherId).padStart(6, '0')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{parseFloat(rec.amount).toLocaleString("ar-SA")} {rec.currency}</span>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 ml-1" />
                          مؤكد
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
              )}
            </div>
          )}

          {/* Accounts Tab - دليل الحسابات */}
          {activeTab === "accounts" && (
            <div className="space-y-4">
              <AccountsPageV2 subSystemId={parseInt(id || "0")} />
            </div>
          )}

          {/* Account Types Tab - أنواع الحسابات */}
          {activeTab === "account-types" && (
            <div className="space-y-4">
              <AccountTypesPage subSystemId={parseInt(id || "0")} />
            </div>
          )}

          {/* Journal Entries Tab - القيود اليومية */}
          {activeTab === "journal-entries" && (
            <div className="space-y-4">
              <JournalEntriesPage />
            </div>
          )}

          {/* Currencies Tab - العملات */}
          {activeTab === "currencies" && (
            <div className="space-y-4">
              <CurrenciesPage />
            </div>
          )}

          {/* Exchange Rates Tab - أسعار الصرف */}
          {activeTab === "exchange-rates" && (
            <div className="space-y-4">
              <ExchangeRatesPage />
            </div>
          )}

          {/* Reports Tab - كشف حساب */}
          {activeTab === "ledger-report" && (
            <div className="space-y-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-sky-400" />
                    كشف حساب
                  </CardTitle>
                  <CardDescription>عرض حركات الحساب لفترة محددة</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">
                    سيتم توفير تقرير كشف الحساب ضمن النظام المخصص قريباً.
                  </p>
                  <Button variant="outline" disabled className="cursor-not-allowed text-slate-400">
                    قيد التطوير
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reports Tab - ميزان المراجعة */}
          {activeTab === "trial-balance-report" && (
            <div className="space-y-4">
              <Card className="bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-400" />
                    ميزان المراجعة
                  </CardTitle>
                  <CardDescription>تجميع أرصدة الحسابات (مدين/دائن) لفترة محددة</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 mb-3">
                    سيتم توفير تقرير ميزان المراجعة ضمن النظام المخصص قريباً.
                  </p>
                  <Button variant="outline" disabled className="cursor-not-allowed text-slate-400">
                    قيد التطوير
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}


          {/* Inventory Tab - نظام المخزون */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 flex items-center justify-center">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">نظام المخزون</CardTitle>
                      <CardDescription>إدارة المخزون والمنتجات</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-slate-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400 text-lg">صفحة نظام المخزون قيد التطوير</p>
                    <p className="text-slate-500 text-sm mt-2">سيتم إضافة ميزات إدارة المخزون قريباً</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Suppliers Tab - نظام الموردين */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">نظام الموردين</CardTitle>
                      <CardDescription>إدارة الموردين والشركات</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-rose-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400 text-lg">صفحة نظام الموردين قيد التطوير</p>
                    <p className="text-slate-500 text-sm mt-2">سيتم إضافة ميزات إدارة الموردين قريباً</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Purchases Tab - نظام المشتريات */}
          {activeTab === "purchases" && (
            <div className="space-y-4">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">نظام المشتريات</CardTitle>
                      <CardDescription>إدارة المشتريات والطلبات</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-lime-400 mx-auto mb-4 opacity-50" />
                    <p className="text-slate-400 text-lg">صفحة نظام المشتريات قيد التطوير</p>
                    <p className="text-slate-500 text-sm mt-2">سيتم إضافة ميزات إدارة المشتريات قريباً</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <CustomNotes />
            </div>
          )}

          {/* Memos Tab */}
          {activeTab === "memos" && (
            <div className="space-y-4">
              <CustomMemos />
            </div>
          )}
      </div>
    </div>
  );
}
