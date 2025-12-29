import { useState } from "react";
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
} from "lucide-react";
import { AccountsPage as AccountsPageV2 } from "../CustomSystem/v2";
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

        {/* Balance */}
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">الرصيد الحالي</span>
            <span className={cn(
              "text-xl font-bold",
              parseFloat(treasury.currentBalance || "0") >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {parseFloat(treasury.currentBalance || "0").toLocaleString("ar-SA")} {treasury.currency}
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

// Voucher Row Component
function VoucherRow({ voucher, type, onView }: any) {
  const isReceipt = type === "receipt";
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isReceipt ? "bg-green-500/20" : "bg-red-500/20"
        )}>
          {isReceipt ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>
        <div>
          <p className="font-medium text-white">{voucher.voucherNumber}</p>
          <p className="text-sm text-slate-400">
            {isReceipt ? voucher.sourceName : voucher.destinationName}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-left">
          <p className={cn(
            "font-bold",
            isReceipt ? "text-green-500" : "text-red-500"
          )}>
            {isReceipt ? "+" : "-"}{parseFloat(voucher.amount).toLocaleString("ar-SA")} {voucher.currency}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(voucher.voucherDate).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <Badge variant="outline" className={cn(
          voucher.status === "confirmed" ? "bg-green-500/20 text-green-500 border-green-500/30" :
          voucher.status === "cancelled" ? "bg-red-500/20 text-red-500 border-red-500/30" :
          "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        )}>
          {voucher.status === "confirmed" ? "مؤكد" : voucher.status === "cancelled" ? "ملغي" : "مسودة"}
        </Badge>
        {voucher.isReconciled && (
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            مطابق
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={() => onView(voucher)}>
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
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
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<"receipt" | "payment">("receipt");
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);

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
    currency: "YER",
    openingBalance: "0",
    description: "",
  });

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    toSubSystemId: 0,
    fromTreasuryId: 0,
    toTreasuryId: 0,
    amount: "",
    description: "",
  });

  // New Voucher Form State
  const [newVoucher, setNewVoucher] = useState({
    amount: "",
    sourceType: "person" as "person" | "entity" | "intermediary" | "other",
    sourceName: "",
    sourceIntermediaryId: undefined as number | undefined,
    destinationType: "person" as "person" | "entity" | "intermediary" | "other",
    destinationName: "",
    destinationIntermediaryId: undefined as number | undefined,
    treasuryId: 0,
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

  // تحميل السندات فقط عند الحاجة (تبويب نظرة عامة أو السندات)
  const { data: receiptVouchers, refetch: refetchReceipts } = trpc.customSystem.receiptVouchers.list.useQuery(
    { businessId: 1, subSystemId: parseInt(id || "0") },
    { enabled: !!id && (activeTab === "overview" || activeTab === "vouchers"), staleTime: 30000 }
  );

  const { data: paymentVouchers, refetch: refetchPayments } = trpc.customSystem.paymentVouchers.list.useQuery(
    { businessId: 1, subSystemId: parseInt(id || "0") },
    { enabled: !!id && (activeTab === "overview" || activeTab === "vouchers"), staleTime: 30000 }
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

  const createReceiptMutation = trpc.customSystem.receiptVouchers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء سند القبض بنجاح");
      setIsAddVoucherOpen(false);
      resetVoucherForm();
      refetchReceipts();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const createPaymentMutation = trpc.customSystem.paymentVouchers.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء سند الصرف بنجاح");
      setIsAddVoucherOpen(false);
      resetVoucherForm();
      refetchPayments();
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
      currency: "YER",
      openingBalance: "0",
      description: "",
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

  const resetVoucherForm = () => {
    setNewVoucher({
      amount: "",
      sourceType: "person",
      sourceName: "",
      sourceIntermediaryId: undefined,
      destinationType: "person",
      destinationName: "",
      destinationIntermediaryId: undefined,
      treasuryId: 0,
      description: "",
    });
  };

  // Handlers
  const handleEditTreasury = (treasury: any) => {
    setEditingTreasury(treasury);
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
      currency: treasury.currency || "YER",
      openingBalance: treasury.openingBalance || "0",
      description: treasury.description || "",
    });
    setIsAddTreasuryOpen(true);
  };

  const handleSaveTreasury = () => {
    if (!newTreasury.code || !newTreasury.nameAr) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
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
        currency: newTreasury.currency,
        description: newTreasury.description || undefined,
      } as any);
    } else {
      // إنشاء صندوق جديد
      createTreasuryMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        ...newTreasury,
        openingBalance: newTreasury.openingBalance || "0",
        currentBalance: newTreasury.openingBalance || "0",
      } as any);
    }
  };

  const handleCreateTreasury = () => {
    handleSaveTreasury();
  };

  const handleCreateVoucher = () => {
    if (voucherType === "receipt") {
      createReceiptMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        amount: newVoucher.amount,
        sourceType: newVoucher.sourceType,
        sourceName: newVoucher.sourceName,
        sourceIntermediaryId: newVoucher.sourceIntermediaryId,
        treasuryId: newVoucher.treasuryId,
        description: newVoucher.description,
      } as any);
    } else {
      createPaymentMutation.mutate({
        businessId: 1,
        subSystemId: parseInt(id || "0"),
        amount: newVoucher.amount,
        destinationType: newVoucher.destinationType,
        destinationName: newVoucher.destinationName,
        destinationIntermediaryId: newVoucher.destinationIntermediaryId,
        treasuryId: newVoucher.treasuryId,
        description: newVoucher.description,
      } as any);
    }
  };

  const handleDeleteTreasury = (treasuryId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟")) {
      deleteTreasuryMutation.mutate({ id: treasuryId } as any);
    }
  };

  // Calculate Stats
  const totalBalance = treasuries?.reduce((sum: number, t: any) => sum + parseFloat(t.currentBalance || "0"), 0) || 0;
  const totalReceipts = receiptVouchers?.filter((v: any) => v.status === "confirmed").reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;
  const totalPayments = paymentVouchers?.filter((v: any) => v.status === "confirmed").reduce((sum: number, v: any) => sum + parseFloat(v.amount), 0) || 0;

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

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">إجمالي القبض</p>
                <p className="text-2xl font-bold text-white">{totalReceipts.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">إجمالي الصرف</p>
                <p className="text-2xl font-bold text-white">{totalPayments.toLocaleString("ar-SA")} ر.س</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
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

      {/* Main Content */}
      <div className="w-full">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Receipts */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">آخر سندات القبض</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("vouchers")}>
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {receiptVouchers?.slice(0, 5).map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="receipt" onView={() => {}} />
                ))}
                {(!receiptVouchers || receiptVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات قبض</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">آخر سندات الصرف</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("vouchers")}>
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {paymentVouchers?.slice(0, 5).map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="payment" onView={() => {}} />
                ))}
                {(!paymentVouchers || paymentVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات صرف</p>
                )}
              </CardContent>
            </Card>
          </div>

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

          {/* Treasuries Tab */}
          {activeTab === "treasuries" && (
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الكود</Label>
                      <Input
                        value={newTreasury.code}
                        onChange={(e) => setNewTreasury({ ...newTreasury, code: e.target.value })}
                        placeholder="CASH-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الخزينة</Label>
                      <Select
                        value={newTreasury.treasuryType}
                        onValueChange={(v: any) => setNewTreasury({ ...newTreasury, treasuryType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">صندوق نقدي</SelectItem>
                          <SelectItem value="bank">حساب بنكي</SelectItem>
                          <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                          <SelectItem value="exchange">صراف</SelectItem>
                        </SelectContent>
                      </Select>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العملة</Label>
                      <Select
                        value={newTreasury.currency}
                        onValueChange={(v) => setNewTreasury({ ...newTreasury, currency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YER">ريال يمني</SelectItem>
                          <SelectItem value="SAR">ريال سعودي</SelectItem>
                          <SelectItem value="USD">دولار أمريكي</SelectItem>
                        </SelectContent>
                      </Select>
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

          {/* Vouchers Tab */}
          {activeTab === "vouchers" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">السندات</h2>
                <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                onClick={() => {
                  setVoucherType("receipt");
                  setIsAddVoucherOpen(true);
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                سند قبض
              </Button>
              <Button
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => {
                  setVoucherType("payment");
                  setIsAddVoucherOpen(true);
                }}
              >
                <Plus className="ml-2 h-4 w-4" />
                سند صرف
              </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Receipt Vouchers */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-green-500 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  سندات القبض
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {receiptVouchers?.map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="receipt" onView={() => {}} />
                ))}
                {(!receiptVouchers || receiptVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات قبض</p>
                )}
              </CardContent>
            </Card>

            {/* Payment Vouchers */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  سندات الصرف
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {paymentVouchers?.map((voucher: any) => (
                  <VoucherRow key={voucher.id} voucher={voucher} type="payment" onView={() => {}} />
                ))}
                {(!paymentVouchers || paymentVouchers.length === 0) && (
                  <p className="text-center text-slate-400 py-4">لا توجد سندات صرف</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Voucher Dialog */}
          <Dialog open={isAddVoucherOpen} onOpenChange={setIsAddVoucherOpen}>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {voucherType === "receipt" ? "إنشاء سند قبض" : "إنشاء سند صرف"}
                </DialogTitle>
                <DialogDescription>
                  {voucherType === "receipt" 
                    ? "سند قبض لاستلام مبلغ في الخزينة" 
                    : "سند صرف لصرف مبلغ من الخزينة"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المبلغ</Label>
                    <Input
                      type="number"
                      value={newVoucher.amount}
                      onChange={(e) => setNewVoucher({ ...newVoucher, amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الخزينة</Label>
                    <Select
                      value={newVoucher.treasuryId.toString()}
                      onValueChange={(v) => setNewVoucher({ ...newVoucher, treasuryId: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الخزينة" />
                      </SelectTrigger>
                      <SelectContent>
                        {treasuries?.map((t: any) => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {voucherType === "receipt" ? (
                  <>
                    <div className="space-y-2">
                      <Label>نوع المصدر</Label>
                      <Select
                        value={newVoucher.sourceType}
                        onValueChange={(v: any) => setNewVoucher({ ...newVoucher, sourceType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="person">شخص</SelectItem>
                          <SelectItem value="entity">جهة</SelectItem>
                          <SelectItem value="intermediary">حساب وسيط</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newVoucher.sourceType === "intermediary" ? (
                      <div className="space-y-2">
                        <Label>الحساب الوسيط</Label>
                        <Select
                          value={newVoucher.sourceIntermediaryId?.toString() || ""}
                          onValueChange={(v) => setNewVoucher({ ...newVoucher, sourceIntermediaryId: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedIntermediaryAccounts.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                {acc.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>اسم المصدر</Label>
                        <Input
                          value={newVoucher.sourceName}
                          onChange={(e) => setNewVoucher({ ...newVoucher, sourceName: e.target.value })}
                          placeholder="اسم الشخص أو الجهة"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>نوع الوجهة</Label>
                      <Select
                        value={newVoucher.destinationType}
                        onValueChange={(v: any) => setNewVoucher({ ...newVoucher, destinationType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="person">شخص</SelectItem>
                          <SelectItem value="entity">جهة</SelectItem>
                          <SelectItem value="intermediary">حساب وسيط</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newVoucher.destinationType === "intermediary" ? (
                      <div className="space-y-2">
                        <Label>الحساب الوسيط</Label>
                        <Select
                          value={newVoucher.destinationIntermediaryId?.toString() || ""}
                          onValueChange={(v) => setNewVoucher({ ...newVoucher, destinationIntermediaryId: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحساب الوسيط" />
                          </SelectTrigger>
                          <SelectContent>
                            {relatedIntermediaryAccounts.map((acc: any) => (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                {acc.nameAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label>اسم الوجهة</Label>
                        <Input
                          value={newVoucher.destinationName}
                          onChange={(e) => setNewVoucher({ ...newVoucher, destinationName: e.target.value })}
                          placeholder="اسم الشخص أو الجهة"
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea
                    value={newVoucher.description}
                    onChange={(e) => setNewVoucher({ ...newVoucher, description: e.target.value })}
                    placeholder="وصف السند..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddVoucherOpen(false)}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleCreateVoucher} 
                  disabled={createReceiptMutation.isPending || createPaymentMutation.isPending}
                  className={voucherType === "receipt" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {(createReceiptMutation.isPending || createPaymentMutation.isPending) && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                  إنشاء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
      </div>
    </div>
  );
}
