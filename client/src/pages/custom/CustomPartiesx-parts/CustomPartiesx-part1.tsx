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
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Briefcase,
  Landmark,
  MoreVertical,
  Eye,
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
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

// أنواع الأطراف
const partyTypes = [
  { value: "customer", label: "عميل", icon: User, color: "text-blue-500" },
  { value: "supplier", label: "مورد", icon: Building2, color: "text-orange-500" },
  { value: "employee", label: "موظف", icon: Briefcase, color: "text-green-500" },
  { value: "partner", label: "شريك", icon: Users, color: "text-purple-500" },
  { value: "government", label: "جهة حكومية", icon: Landmark, color: "text-red-500" },
  { value: "other", label: "أخرى", icon: User, color: "text-slate-500" },
];

// Form Schema
const partySchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربية مطلوب"),
  nameEn: z.string().optional(),
  partyType: z.enum(["customer", "supplier", "employee", "partner", "government", "other"]),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  taxNumber: z.string().optional(),
  commercialRegister: z.string().optional(),
  creditLimit: z.string().optional(),
  currency: z.string().default("SAR"),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
});

type PartyFormData = z.infer<typeof partySchema>;

interface CustomPartiesProps {
  businessId: number;
  subSystemId?: number;
}

export default function CustomParties({ businessId, subSystemId }: CustomPartiesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatementDialogOpen, setIsStatementDialogOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<any>(null);
  const [selectedParty, setSelectedParty] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("all");

  const utils = trpc.useUtils();

  // جلب الأطراف
  const { data: parties = [], isLoading, refetch } = trpc.customSystem.parties.list.useQuery({
    businessId,
    subSystemId,
    partyType: filterType !== "all" ? filterType as any : undefined,
    search: searchQuery || undefined,
  });

  // جلب كشف حساب طرف
  const { data: statement = [] } = trpc.customSystem.parties.getStatement.useQuery(
    { partyId: selectedParty?.id || 0 },
    { enabled: !!selectedParty }
  );

  // إنشاء طرف
  const createMutation = trpc.customSystem.parties.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الطرف بنجاح");
      setIsDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // تحديث طرف
  const updateMutation = trpc.customSystem.parties.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الطرف بنجاح");
      setIsDialogOpen(false);
      setEditingParty(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // حذف طرف
  const deleteMutation = trpc.customSystem.parties.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الطرف بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const form = useForm<PartyFormData>({
    resolver: zodResolver(partySchema) as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      partyType: "customer",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      country: "السعودية",
      taxNumber: "",
      commercialRegister: "",
      creditLimit: "0",
      currency: "SAR",
      contactPerson: "",
      notes: "",
    },
  });

  const onSubmit = (data: PartyFormData) => {
    if (editingParty) {
      updateMutation.mutate({ id: editingParty.id, ...data });
    } else {
      createMutation.mutate({ businessId, subSystemId, ...data });
    }
  };

  const handleEdit = (party: any) => {
    setEditingParty(party);
    form.reset({
      code: party.code,
      nameAr: party.nameAr,
      nameEn: party.nameEn || "",
      partyType: party.partyType,
      phone: party.phone || "",
      mobile: party.mobile || "",
      email: party.email || "",
      address: party.address || "",
      city: party.city || "",
      country: party.country || "السعودية",
      taxNumber: party.taxNumber || "",
      commercialRegister: party.commercialRegister || "",
      creditLimit: party.creditLimit || "0",
      currency: party.currency || "SAR",
      contactPerson: party.contactPerson || "",
      notes: party.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الطرف؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleViewStatement = (party: any) => {
    setSelectedParty(party);
    setIsStatementDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingParty(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // تصفية الأطراف حسب النوع
  const filteredParties = parties.filter((party: any) => {
    if (activeTab === "all") return true;
    return party.partyType === activeTab;
  });

  // إحصائيات
  const stats = {
    total: parties.length,
    customers: parties.filter((p: any) => p.partyType === "customer").length,
    suppliers: parties.filter((p: any) => p.partyType === "supplier").length,
    employees: parties.filter((p: any) => p.partyType === "employee").length,
    totalBalance: parties.reduce((sum: number, p: any) => sum + parseFloat(p.currentBalance || "0"), 0),
  };

  const getPartyTypeConfig = (type: string) => {
    return partyTypes.find(t => t.value === type) || partyTypes[5];
  };

  const formatBalance = (balance: string | number) => {
    const num = parseFloat(String(balance) || "0");
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(num);
  };

  return (
    <div className="space-y-6 p-6">
      {/* العنوان والإحصائيات */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              إدارة الأطراف
            </h1>
            <p className="text-slate-400 mt-1">
              إدارة العملاء والموردين والموظفين والجهات
            </p>
          </div>
          <Button onClick={openNewDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة طرف جديد
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الأطراف</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">العملاء</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.customers}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الموردين</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.suppliers}</p>
                </div>
                <Building2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">الموظفين</p>
                  <p className="text-2xl font-bold text-green-500">{stats.employees}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الأرصدة</p>
                  <p className={cn(
                    "text-xl font-bold",
                    stats.totalBalance >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {formatBalance(stats.totalBalance)}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="بحث بالاسم أو الكود أو رقم الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-slate-900/50 border-slate-600"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* التبويبات والجدول */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900/50">
              <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
              <TabsTrigger value="customer">العملاء ({stats.customers})</TabsTrigger>
              <TabsTrigger value="supplier">الموردين ({stats.suppliers})</TabsTrigger>
              <TabsTrigger value="employee">الموظفين ({stats.employees})</TabsTrigger>
              <TabsTrigger value="partner">الشركاء</TabsTrigger>
              <TabsTrigger value="government">الجهات الحكومية</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredParties.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد أطراف</p>
              <Button variant="link" onClick={openNewDialog}>
                إضافة طرف جديد
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الهاتف</TableHead>
                  <TableHead className="text-right">المدينة</TableHead>
                  <TableHead className="text-right">الرصيد</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParties.map((party: any) => {
                  const typeConfig = getPartyTypeConfig(party.partyType);
                  const TypeIcon = typeConfig.icon;
                  const balance = parseFloat(party.currentBalance || "0");
                  
