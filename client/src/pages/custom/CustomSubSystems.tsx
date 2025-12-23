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
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  Wallet,
  ArrowLeftRight,
  FileText,
  MoreVertical,
  Palette,
  Settings,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Color Options
const colorOptions = [
  { value: "blue", label: "أزرق", class: "bg-blue-500" },
  { value: "green", label: "أخضر", class: "bg-green-500" },
  { value: "purple", label: "بنفسجي", class: "bg-purple-500" },
  { value: "orange", label: "برتقالي", class: "bg-orange-500" },
  { value: "red", label: "أحمر", class: "bg-red-500" },
  { value: "yellow", label: "أصفر", class: "bg-yellow-500" },
  { value: "pink", label: "وردي", class: "bg-pink-500" },
  { value: "teal", label: "فيروزي", class: "bg-teal-500" },
];

// Icon Options
const iconOptions = [
  { value: "wallet", label: "محفظة", icon: Wallet },
  { value: "layers", label: "طبقات", icon: Layers },
  { value: "file-text", label: "ملف", icon: FileText },
  { value: "settings", label: "إعدادات", icon: Settings },
  { value: "arrow-left-right", label: "تحويل", icon: ArrowLeftRight },
];

// Form Schema
const subSystemFormSchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربي مطلوب"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  color: z.string().default("blue"),
  icon: z.string().default("layers"),
});

type SubSystemFormValues = z.infer<typeof subSystemFormSchema>;

// Sub System Card Component
function SubSystemCard({ subSystem, stats, onEdit, onDelete, onOpen }: any) {
  const colorClass = colorOptions.find(c => c.value === subSystem.color)?.class || "bg-blue-500";
  const IconComponent = iconOptions.find(i => i.value === subSystem.icon)?.icon || Layers;

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">{subSystem.nameAr}</CardTitle>
              <CardDescription className="text-slate-400">
                {subSystem.code}
                {subSystem.nameEn && ` • ${subSystem.nameEn}`}
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
              <DropdownMenuItem onClick={() => onEdit(subSystem)} className="cursor-pointer">
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(subSystem.id)} 
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
        {subSystem.description && (
          <p className="text-slate-400 text-sm mb-4">{subSystem.description}</p>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{stats?.treasuries || 0}</p>
            <p className="text-xs text-slate-400">خزائن</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-500">{stats?.receipts || 0}</p>
            <p className="text-xs text-slate-400">سندات قبض</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{stats?.payments || 0}</p>
            <p className="text-xs text-slate-400">سندات صرف</p>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">إجمالي الرصيد</span>
            <span className={cn(
              "text-lg font-bold",
              (stats?.balance || 0) >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {(stats?.balance || 0).toLocaleString("ar-SA")} ر.س
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center justify-between">
          <Badge variant={subSystem.isActive ? "default" : "secondary"} className={cn(
            subSystem.isActive ? "bg-green-500/20 text-green-500" : "bg-slate-700 text-slate-400"
          )}>
            {subSystem.isActive ? "نشط" : "غير نشط"}
          </Badge>
          <span className="text-xs text-slate-500">
            {new Date(subSystem.createdAt).toLocaleDateString("ar-SA")}
          </span>
        </div>

        {/* Enter Button */}
        <Button 
          className="w-full mt-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          onClick={() => onOpen(subSystem.id)}
        >
          <ExternalLink className="ml-2 h-4 w-4" />
          الدخول للنظام
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Component
export default function CustomSubSystems() {
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubSystem, setEditingSubSystem] = useState<any>(null);

  // Form
  const form = useForm<SubSystemFormValues>({
    resolver: zodResolver(subSystemFormSchema),
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      description: "",
      color: "blue",
      icon: "layers",
    },
  });

  // API Queries
  const { data: subSystems, isLoading, refetch } = trpc.customSystem.subSystems.list.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  const { data: stats } = trpc.customSystem.subSystems.stats.useQuery(
    { businessId: 1 },
    { enabled: true }
  );

  // Mutations
  const createMutation = trpc.customSystem.subSystems.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء النظام الفرعي بنجاح");
      setIsDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.customSystem.subSystems.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث النظام الفرعي بنجاح");
      setIsDialogOpen(false);
      setEditingSubSystem(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.customSystem.subSystems.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف النظام الفرعي بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Handlers
  const handleEdit = (subSystem: any) => {
    setEditingSubSystem(subSystem);
    form.reset({
      code: subSystem.code,
      nameAr: subSystem.nameAr,
      nameEn: subSystem.nameEn || "",
      description: subSystem.description || "",
      color: subSystem.color || "blue",
      icon: subSystem.icon || "layers",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا النظام الفرعي؟ سيتم حذف جميع البيانات المرتبطة به.")) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = (data: SubSystemFormValues) => {
    const payload = {
      ...data,
      businessId: 1,
    };

    if (editingSubSystem) {
      updateMutation.mutate({ id: editingSubSystem.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Get stats for each sub system
  const getSubSystemStats = (subSystemId: number) => {
    return stats?.find((s: any) => s.subSystemId === subSystemId) || {
      treasuries: 0,
      receipts: 0,
      payments: 0,
      balance: 0,
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">الأنظمة الفرعية</h1>
          <p className="text-slate-400">إدارة الأنظمة الفرعية المستقلة داخل النظام المخصص</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} className="border-slate-700">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingSubSystem(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="ml-2 h-4 w-4" />
                إضافة نظام فرعي
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingSubSystem ? "تعديل النظام الفرعي" : "إضافة نظام فرعي جديد"}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingSubSystem ? "قم بتعديل بيانات النظام الفرعي" : "أدخل بيانات النظام الفرعي الجديد"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Code */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الكود</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: SYS-001" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Color */}
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">اللون</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                className={cn(
                                  "w-8 h-8 rounded-lg transition-all",
                                  color.class,
                                  field.value === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900" : ""
                                )}
                                title={color.label}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name Arabic */}
                    <FormField
                      control={form.control}
                      name="nameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالعربي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="مثال: الحسابات الشخصية" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Name English */}
                    <FormField
                      control={form.control}
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">الاسم بالإنجليزي</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Personal Accounts" className="bg-slate-800 border-slate-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Icon */}
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الأيقونة</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {iconOptions.map((icon) => {
                            const IconComp = icon.icon;
                            return (
                              <button
                                key={icon.value}
                                type="button"
                                onClick={() => field.onChange(icon.value)}
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all border",
                                  field.value === icon.value 
                                    ? "bg-blue-500/20 border-blue-500 text-blue-500" 
                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                                )}
                                title={icon.label}
                              >
                                <IconComp className="h-5 w-5" />
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">الوصف</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="وصف النظام الفرعي..." className="bg-slate-800 border-slate-700" />
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
                      {editingSubSystem ? "تحديث" : "إضافة"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">ما هي الأنظمة الفرعية؟</h3>
              <p className="text-slate-400 text-sm">
                الأنظمة الفرعية هي وحدات محاسبية مستقلة تماماً. لكل نظام فرعي خزائنه الخاصة وسنداته وتقاريره.
                يمكنك إنشاء أنظمة فرعية للحسابات الشخصية، المشاريع، الفروع، أو أي تصنيف آخر تحتاجه.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub Systems Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : !subSystems || subSystems.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">لا توجد أنظمة فرعية</p>
            <p className="text-slate-500 text-sm mb-4">قم بإضافة نظام فرعي جديد للبدء</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة نظام فرعي
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subSystems.map((subSystem: any) => (
            <SubSystemCard
              key={subSystem.id}
              subSystem={subSystem}
              stats={getSubSystemStats(subSystem.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onOpen={(id: number) => setLocation(`/custom/sub-systems/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
