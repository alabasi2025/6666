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
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  walletProvider: z.string().optional(),
  walletNumber: z.string().optional(),
  currency: z.string().default("SAR"),
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

  // Form
  const form = useForm<TreasuryFormValues>({
    resolver: zodResolver(treasuryFormSchema) as any as any as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      treasuryType: "cash",
      currency: "SAR",
      openingBalance: "0",
      description: "",
    },
  });

  const watchTreasuryType = form.watch("treasuryType");

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
      currency: (treasury as any).currency,
      openingBalance: (treasury as any).openingBalance || "0",
      description: (treasury as any).description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الخزينة؟")) {
      deleteMutation.mutate({ id } as any);
    }
  };

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
