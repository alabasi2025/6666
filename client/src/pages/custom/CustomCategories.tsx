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
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Tag,
  DollarSign,
  Receipt,
  Banknote,
  ArrowUpCircle,
  ArrowDownCircle,
  CircleDot,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// أنواع التصنيفات
const categoryTypes = [
  { value: "income", label: "إيراد", icon: TrendingUp, color: "text-green-500", bgColor: "bg-green-500/10" },
  { value: "expense", label: "مصروف", icon: TrendingDown, color: "text-red-500", bgColor: "bg-red-500/10" },
  { value: "both", label: "إيراد ومصروف", icon: CircleDot, color: "text-blue-500", bgColor: "bg-blue-500/10" },
];

// Form Schema
const categorySchema = z.object({
  code: z.string().min(1, "الكود مطلوب"),
  nameAr: z.string().min(1, "الاسم بالعربية مطلوب"),
  nameEn: z.string().optional(),
  categoryType: z.enum(["income", "expense", "both"]),
  parentId: z.number().optional().nullable(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CustomCategoriesProps {
  businessId: number;
  subSystemId?: number;
}

// مكون عرض التصنيف في الشجرة
interface CategoryTreeItemProps {
  category: any;
  level: number;
  onEdit: (category: any) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
}

function CategoryTreeItem({ category, level, onEdit, onDelete, onAddChild }: CategoryTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const typeConfig = categoryTypes.find(t => t.value === category.categoryType) || categoryTypes[2];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-700/30 transition-colors group",
          level > 0 && "mr-6"
        )}
        style={{ marginRight: level * 24 }}
      >
        {/* أيقونة التوسيع */}
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-slate-600/50 rounded"
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        {/* أيقونة المجلد */}
        {hasChildren ? (
          isOpen ? (
            <FolderOpen className="h-5 w-5 text-yellow-500" />
          ) : (
            <Folder className="h-5 w-5 text-yellow-500" />
          )
        ) : (
          <Tag className={cn("h-4 w-4", typeConfig.color)} />
        )}

        {/* الكود والاسم */}
        <span className="font-mono text-xs text-slate-500">{category.code}</span>
        <span className="font-medium text-white flex-1">{category.nameAr}</span>

        {/* نوع التصنيف */}
        <Badge variant="outline" className={cn("border-slate-600 text-xs", typeConfig.color)}>
          <TypeIcon className="h-3 w-3 ml-1" />
          {typeConfig.label}
        </Badge>

        {/* الحالة */}
        {!category.isActive && (
          <Badge variant="secondary" className="text-xs">غير نشط</Badge>
        )}

        {/* قائمة الإجراءات */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddChild(category.id)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة تصنيف فرعي
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(category.id)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* التصنيفات الفرعية */}
      {hasChildren && isOpen && (
        <div className="border-r border-slate-700/50 mr-3">
          {category.children.map((child: any) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomCategories({ businessId, subSystemId }: CustomCategoriesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  // جلب التصنيفات (قائمة مسطحة)
  const { data: categories = [], isLoading, refetch } = trpc.customSystem.expenseCategories.list.useQuery({
    businessId,
    subSystemId,
    categoryType: activeTab !== "all" ? activeTab as any : undefined,
  });

  // جلب التصنيفات (شجرة هرمية)
  const { data: categoryTree = [] } = trpc.customSystem.expenseCategories.getTree.useQuery({
    businessId,
  } as any);

  // إنشاء تصنيف
  const createMutation = trpc.customSystem.expenseCategories.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء التصنيف بنجاح");
      setIsDialogOpen(false);
      setSelectedParentId(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // تحديث تصنيف
  const updateMutation = trpc.customSystem.expenseCategories.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      setIsDialogOpen(false);
      setEditingCategory(null);
      form.reset();
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  // حذف تصنيف
  const deleteMutation = trpc.customSystem.expenseCategories.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      code: "",
      nameAr: "",
      nameEn: "",
      categoryType: "expense",
      parentId: null,
      description: "",
      isActive: true,
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    const payload = {
      ...data,
      parentId: data.parentId || selectedParentId || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...payload });
    } else {
      createMutation.mutate({ businessId, subSystemId, ...payload });
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setSelectedParentId(null);
    form.reset({
      code: category.code,
      nameAr: category.nameAr,
      nameEn: category.nameEn || "",
      categoryType: category.categoryType,
      parentId: category.parentId,
      description: category.description || "",
      isActive: category.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا التصنيف؟ سيتم حذف جميع التصنيفات الفرعية أيضاً.")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleAddChild = (parentId: number) => {
    setEditingCategory(null);
    setSelectedParentId(parentId);
    const parent = categories.find((c: any) => c.id === parentId);
    form.reset({
      code: "",
      nameAr: "",
      nameEn: "",
      categoryType: parent?.categoryType || "expense",
      parentId: parentId,
      description: "",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCategory(null);
    setSelectedParentId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  // تصفية التصنيفات حسب النوع
  const filteredCategories = categories.filter((category: any) => {
    if (activeTab === "all") return true;
    return category.categoryType === activeTab;
  });

  // تصفية الشجرة حسب النوع
  const filteredTree = activeTab === "all" 
    ? categoryTree 
    : categoryTree.filter((c: any) => c.categoryType === activeTab);

  // إحصائيات
  const stats = {
    total: categories.length,
    income: categories.filter((c: any) => c.categoryType === "income").length,
    expense: categories.filter((c: any) => c.categoryType === "expense").length,
    both: categories.filter((c: any) => c.categoryType === "both").length,
    active: categories.filter((c: any) => c.isActive).length,
  };

  const getCategoryTypeConfig = (type: string) => {
    return categoryTypes.find(t => t.value === type) || categoryTypes[2];
  };

  // الحصول على التصنيفات الرئيسية فقط (للقائمة المنسدلة)
  const parentCategories = categories.filter((c: any) => !c.parentId);

  return (
    <div className="space-y-6 p-6">
      {/* العنوان والإحصائيات */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FolderTree className="h-7 w-7 text-primary" />
              إدارة التصنيفات
            </h1>
            <p className="text-slate-400 mt-1">
              تصنيفات الإيرادات والمصروفات
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "tree" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("tree")}
            >
              <FolderTree className="h-4 w-4 ml-1" />
              شجري
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              <Tag className="h-4 w-4 ml-1" />
              جدول
            </Button>
            <Button onClick={openNewDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة تصنيف
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي التصنيفات</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <FolderTree className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تصنيفات الإيرادات</p>
                  <p className="text-2xl font-bold text-green-500">{stats.income}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تصنيفات المصروفات</p>
                  <p className="text-2xl font-bold text-red-500">{stats.expense}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">تصنيفات مشتركة</p>
                  <p className="text-2xl font-bold text-blue-500">{stats.both}</p>
                </div>
                <CircleDot className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">التصنيفات النشطة</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.active}</p>
                </div>
                <Tag className="h-8 w-8 text-emerald-500" />
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
                placeholder="بحث بالاسم أو الكود..."
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

      {/* التبويبات والمحتوى */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900/50">
              <TabsTrigger value="all">الكل ({stats.total})</TabsTrigger>
              <TabsTrigger value="income" className="text-green-500">
                <TrendingUp className="h-4 w-4 ml-1" />
                الإيرادات ({stats.income})
              </TabsTrigger>
              <TabsTrigger value="expense" className="text-red-500">
                <TrendingDown className="h-4 w-4 ml-1" />
                المصروفات ({stats.expense})
              </TabsTrigger>
              <TabsTrigger value="both" className="text-blue-500">
                <CircleDot className="h-4 w-4 ml-1" />
                مشتركة ({stats.both})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد تصنيفات</p>
              <Button variant="link" onClick={openNewDialog}>
                إضافة تصنيف جديد
              </Button>
            </div>
          ) : viewMode === "tree" ? (
            /* عرض شجري */
            <div className="space-y-1">
              {filteredTree.map((category: any) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  level={0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                />
              ))}
            </div>
          ) : (
            /* عرض جدول */
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">التصنيف الأب</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category: any) => {
                  const typeConfig = getCategoryTypeConfig(category.categoryType);
                  const TypeIcon = typeConfig.icon;
                  const parent = categories.find((c: any) => c.id === category.parentId);

                  return (
                    <TableRow key={category.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-mono text-slate-300">{category.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className={cn("h-4 w-4", typeConfig.color)} />
                          <div>
                            <p className="font-medium text-white">{category.nameAr}</p>
                            {category.nameEn && (
                              <p className="text-xs text-slate-400">{category.nameEn}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("border-slate-600", typeConfig.color)}>
                          <TypeIcon className="h-3 w-3 ml-1" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {parent ? parent.nameAr : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "نشط" : "غير نشط"}
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
                            <DropdownMenuItem onClick={() => handleAddChild(category.id)}>
                              <Plus className="h-4 w-4 ml-2" />
                              إضافة تصنيف فرعي
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="h-4 w-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(category.id)}
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

      {/* نافذة إضافة/تعديل تصنيف */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? "تعديل تصنيف" : selectedParentId ? "إضافة تصنيف فرعي" : "إضافة تصنيف جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "قم بتعديل بيانات التصنيف" 
                : selectedParentId 
                  ? `إضافة تصنيف فرعي تحت: ${categories.find((c: any) => c.id === selectedParentId)?.nameAr}`
                  : "أدخل بيانات التصنيف الجديد"
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* الكود والنوع */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكود *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: INC-001" className="bg-slate-900/50 border-slate-600" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع التصنيف *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600">
                            <SelectValue placeholder="اختر النوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryTypes.map((type) => (
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

              {/* الاسم */}
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

              {/* التصنيف الأب */}
              {!selectedParentId && (
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>التصنيف الأب (اختياري)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value && value !== "none" ? parseInt(value) : null)} 
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-900/50 border-slate-600">
                            <SelectValue placeholder="اختر التصنيف الأب (اختياري)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون تصنيف أب (رئيسي)</SelectItem>
                          {parentCategories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.code} - {cat.nameAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* الوصف */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="وصف التصنيف..." className="bg-slate-900/50 border-slate-600" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الحالة */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-slate-600 bg-slate-900/50"
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">تصنيف نشط</FormLabel>
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
                  {editingCategory ? "تحديث" : "إنشاء"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
