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
                  
                  return (
                    <TableRow key={party.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-mono text-slate-300">{party.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                          <div>
                            <p className="font-medium text-white">{party.nameAr}</p>
                            {party.nameEn && (
                              <p className="text-xs text-slate-400">{party.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-slate-600", typeConfig.color)}>
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {party.mobile || party.phone || "-"}
                      </TableCell>
                      <TableCell className="text-slate-300">{party.city || "-"}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : "text-slate-400"
                        )}>
                          {formatBalance(balance)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={party.isActive ? "default" : "secondary"}>
                          {party.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewStatement(party)}>
                              <FileText className="h-4 w-4 ml-2" />
                              كشف حساب
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(party)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(party.id)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* نافذة إضافة/تعديل طرف */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingParty ? "تعديل طرف" : "إضافة طرف جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingParty ? "قم بتعديل بيانات الطرف" : "أدخل بيانات الطرف الجديد"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* البيانات الأساسية */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكود *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: C001" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الطرف *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {partyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={cn("h-4 w-4", type.color)} />
                                {type.label}
                              </div>
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
                <FormField
                  control={form.control}
                  name="nameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالعربية *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="الاسم بالعربية" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم بالإنجليزية</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name in English" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* بيانات التواصل */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">بيانات التواصل</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم الهاتف" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الجوال</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم الجوال" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="example@email.com" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>جهة الاتصال</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="اسم جهة الاتصال" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* العنوان */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">العنوان</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="المدينة" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الدولة</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="الدولة" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>العنوان التفصيلي</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="العنوان بالتفصيل" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* البيانات التجارية */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">البيانات التجارية</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرقم الضريبي</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="الرقم الضريبي" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commercialRegister"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السجل التجاري</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="رقم السجل التجاري" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>حد الائتمان</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="0" className="bg-slate-900/50 border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العملة</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900/50 border-slate-600">
                              <SelectValue placeholder="اختر العملة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                            <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                            <SelectItem value="EUR">يورو (EUR)</SelectItem>
                            <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* ملاحظات */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملاحظات</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="ملاحظات إضافية..." className="bg-slate-900/50 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  )}
                  {editingParty ? "تحديث" : "إنشاء"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* نافذة كشف الحساب */}
      <Dialog open={isStatementDialogOpen} onOpenChange={setIsStatementDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              كشف حساب: {selectedParty?.nameAr}
            </DialogTitle>
            <DialogDescription>
              الرصيد الحالي: {formatBalance(selectedParty?.currentBalance || 0)}
            </DialogDescription>
          </DialogHeader>

          {statement.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد حركات لهذا الطرف</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">المرجع</TableHead>
                  <TableHead className="text-right">مدين</TableHead>
                  <TableHead className="text-right">دائن</TableHead>
                  <TableHead className="text-right">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.map((tx: any) => (
                  <TableRow key={tx.id} className="border-slate-700">
                    <TableCell className="text-slate-300">
                      {format(new Date(tx.transactionDate), "yyyy/MM/dd", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.transactionType}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{tx.referenceNumber || "-"}</TableCell>
                    <TableCell className="text-red-500">
                      {tx.transactionType === "payment" ? formatBalance(tx.amount) : "-"}
                    </TableCell>
                    <TableCell className="text-green-500">
                      {tx.transactionType === "receipt" ? formatBalance(tx.amount) : "-"}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {formatBalance(tx.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatementDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
