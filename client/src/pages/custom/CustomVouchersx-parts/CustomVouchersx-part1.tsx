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
  treasuryId: z.number({ message: "الخزينة مطلوبة" }),
  description: z.string().optional(),
});

// Form Schema for Payment Voucher
const paymentVoucherSchema = z.object({
  voucherDate: z.string().min(1, "التاريخ مطلوب"),
  amount: z.string().min(1, "المبلغ مطلوب"),
  currency: z.string().default("SAR"),
  subSystemId: z.number().optional(),
  treasuryId: z.number({ message: "الخزينة مطلوبة" }),
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
  const treasury = treasuries?.find((t: any) => t.id === (voucher as any).treasuryId);
  const status = statusConfig[(voucher as any).status as keyof typeof statusConfig];

  return (
    <TableRow className="hover:bg-slate-800/50">
      <TableCell className="font-medium text-white">
        <div className="flex items-center gap-2">
          {isReceipt ? (
            <ArrowDownCircle className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowUpCircle className="h-4 w-4 text-red-500" />
          )}
          {(voucher as any).voucherNumber}
        </div>
      </TableCell>
      <TableCell className="text-slate-400">
        {format(new Date((voucher as any).voucherDate), "dd/MM/yyyy", { locale: ar })}
      </TableCell>
      <TableCell className={cn("font-bold", isReceipt ? "text-green-500" : "text-red-500")}>
        {isReceipt ? "+" : "-"}{parseFloat((voucher as any).amount).toLocaleString("ar-SA")} {(voucher as any).currency}
      </TableCell>
      <TableCell className="text-slate-400">
        {isReceipt ? (voucher as any).sourceName : (voucher as any).destinationName}
      </TableCell>
      <TableCell className="text-slate-400">
        {treasury?.nameAr || "-"}
      </TableCell>
      <TableCell>
        <Badge className={status?.color}>
          {status?.label}
        </Badge>
        {(voucher as any).isReconciled && (
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
            {(voucher as any).status === "draft" && (
              <>
                <DropdownMenuItem onClick={() => onEdit(voucher)} className="cursor-pointer">
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfirm((voucher as any).id)} className="cursor-pointer text-green-500">
                  <Check className="ml-2 h-4 w-4" />
                  تأكيد
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem 
                  onClick={() => onDelete((voucher as any).id)} 
                  className="text-red-400 focus:text-red-400 cursor-pointer"
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              </>
            )}
            {(voucher as any).status === "confirmed" && (
              <DropdownMenuItem onClick={() => onCancel((voucher as any).id)} className="cursor-pointer text-red-400">
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
    resolver: zodResolver(receiptVoucherSchema) as any as any as any,
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
    resolver: zodResolver(paymentVoucherSchema) as any as any as any,
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
