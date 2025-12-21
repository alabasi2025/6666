import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Search,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string;
  parentId?: number;
  depreciationMethod?: string;
  usefulLife?: number;
  salvagePercentage?: string;
  isActive: boolean;
  assetsCount?: number;
}

export default function AssetCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch categories
  const { data: categories = [], isLoading } = trpc.assets.categories.list.useQuery({
    businessId: 1,
  });

  // Create mutation
  const createMutation = trpc.assets.categories.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["assets", "categories", "list"]] });
      toast({ title: "تم إضافة الفئة بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = trpc.assets.categories.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["assets", "categories", "list"]] });
      toast({ title: "تم تحديث الفئة بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = trpc.assets.categories.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["assets", "categories", "list"]] });
      toast({ title: "تم حذف الفئة بنجاح" });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const filteredCategories = categories.filter(
    (cat: Category) =>
      cat.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      code: formData.get("code") as string,
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string || undefined,
      parentId: formData.get("parentId") ? parseInt(formData.get("parentId") as string) : undefined,
      depreciationMethod: formData.get("depreciationMethod") as "straight_line" | "declining_balance" | "units_of_production" || undefined,
      usefulLife: formData.get("usefulLife") ? parseInt(formData.get("usefulLife") as string) : undefined,
      salvagePercentage: formData.get("salvagePercentage") as string || undefined,
    };

    if (selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        ...data,
        isActive: (e.currentTarget.querySelector("#isActive") as HTMLInputElement)?.checked ?? true,
      });
    } else {
      createMutation.mutate({
        businessId: 1,
        ...data,
      });
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowDialog(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate({ id: selectedCategory.id });
    }
  };

  const openAddDialog = () => {
    setSelectedCategory(null);
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderTree className="w-8 h-8 text-primary" />
            فئات الأصول
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة فئات وتصنيفات الأصول الثابتة
          </p>
        </div>
        <Button onClick={openAddDialog} className="gradient-energy">
          <Plus className="w-4 h-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة الفئات</CardTitle>
              <CardDescription>
                {filteredCategories.length} فئة مسجلة
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرمز</TableHead>
                <TableHead>الاسم بالعربية</TableHead>
                <TableHead>الاسم بالإنجليزية</TableHead>
                <TableHead>طريقة الإهلاك</TableHead>
                <TableHead>العمر الإنتاجي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد فئات مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category: Category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono">{category.code}</TableCell>
                    <TableCell className="font-medium">{category.nameAr}</TableCell>
                    <TableCell>{category.nameEn || "-"}</TableCell>
                    <TableCell>
                      {category.depreciationMethod === "straight_line" && "القسط الثابت"}
                      {category.depreciationMethod === "declining_balance" && "القسط المتناقص"}
                      {category.depreciationMethod === "units_of_production" && "وحدات الإنتاج"}
                      {!category.depreciationMethod && "-"}
                    </TableCell>
                    <TableCell>
                      {category.usefulLife ? `${category.usefulLife} سنة` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? "قم بتعديل بيانات الفئة"
                : "أدخل بيانات الفئة الجديدة"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الفئة *</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="CAT-001"
                  defaultValue={selectedCategory?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">الاسم بالعربية *</Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  placeholder="أدخل اسم الفئة"
                  defaultValue={selectedCategory?.nameAr}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  placeholder="Enter category name"
                  defaultValue={selectedCategory?.nameEn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">الفئة الأم</Label>
                <Select name="parentId" defaultValue={selectedCategory?.parentId?.toString() || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة الأم (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">بدون فئة أم</SelectItem>
                    {categories
                      .filter((c: Category) => c.id !== selectedCategory?.id)
                      .map((cat: Category) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.nameAr}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="depreciationMethod">طريقة الإهلاك</Label>
                <Select name="depreciationMethod" defaultValue={selectedCategory?.depreciationMethod || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الإهلاك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="straight_line">القسط الثابت</SelectItem>
                    <SelectItem value="declining_balance">القسط المتناقص</SelectItem>
                    <SelectItem value="units_of_production">وحدات الإنتاج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="usefulLife">العمر الإنتاجي (سنوات)</Label>
                <Input
                  id="usefulLife"
                  name="usefulLife"
                  type="number"
                  placeholder="10"
                  defaultValue={selectedCategory?.usefulLife}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salvagePercentage">نسبة القيمة المتبقية (%)</Label>
                <Input
                  id="salvagePercentage"
                  name="salvagePercentage"
                  type="number"
                  step="0.01"
                  placeholder="10"
                  defaultValue={selectedCategory?.salvagePercentage}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  defaultChecked={selectedCategory?.isActive ?? true}
                />
                <Label htmlFor="isActive">فئة نشطة</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="gradient-energy"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedCategory ? "حفظ التغييرات" : "إضافة الفئة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الفئة "{selectedCategory?.nameAr}"؟
              {selectedCategory?.assetsCount && selectedCategory.assetsCount > 0 && (
                <span className="block mt-2 text-warning">
                  تحذير: هذه الفئة تحتوي على {selectedCategory?.assetsCount} أصل
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف الفئة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
