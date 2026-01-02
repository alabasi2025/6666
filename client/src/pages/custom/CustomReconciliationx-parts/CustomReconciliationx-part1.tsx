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
