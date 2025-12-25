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

