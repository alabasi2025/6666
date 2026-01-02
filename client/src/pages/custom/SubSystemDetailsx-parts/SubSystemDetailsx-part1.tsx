import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
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
export default function SubSystemDetails() {
  const [, params] = useRoute("/custom-system/sub-systems/:id");
  const id = (params as any)?.id;
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddTreasuryOpen, setIsAddTreasuryOpen] = useState(false);
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
    currency: "SAR",
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
