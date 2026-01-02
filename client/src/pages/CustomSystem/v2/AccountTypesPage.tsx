/**
 * صفحة إدارة أنواع الحسابات المخصصة
 * Custom Account Types Management Page
 */

import { useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

interface AccountTypeFormData {
  typeCode: string;
  typeNameAr: string;
  typeNameEn?: string;
  description?: string;
  color?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
}

const defaultFormData: AccountTypeFormData = {
  typeCode: "",
  typeNameAr: "",
  typeNameEn: "",
  description: "",
  color: "#3b82f6",
  icon: "",
  displayOrder: 0,
  isActive: true,
};

interface AccountTypesPageProps {
  subSystemId?: number;
}

export default function AccountTypesPage({ subSystemId }: AccountTypesPageProps = {}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AccountTypeFormData>(defaultFormData);

  // Debug: Log subSystemId
  console.log("[AccountTypesPage] subSystemId:", subSystemId);

  // Queries
  const { data: accountTypes, isLoading, refetch } = trpc.customAccountTypes.list.useQuery({
    subSystemId: subSystemId && subSystemId > 0 ? subSystemId : undefined,
    includeInactive: true,
  });

  // Debug: Log accountTypes
  console.log("[AccountTypesPage] accountTypes:", accountTypes);

  // Mutations
  const createMutation = trpc.customAccountTypes.create.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إنشاء نوع الحساب بنجاح",
      });
      refetch();
      handleCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.customAccountTypes.update.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث نوع الحساب بنجاح",
      });
      refetch();
      handleCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.customAccountTypes.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم حذف نوع الحساب بنجاح",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = trpc.customAccountTypes.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleOpenDialog = (type?: any) => {
    if (type) {
      setEditingId(type.id);
      setFormData({
        typeCode: type.typeCode,
        typeNameAr: type.typeNameAr,
        typeNameEn: type.typeNameEn || "",
        description: type.description || "",
        color: type.color || "#3b82f6",
        icon: type.icon || "",
        displayOrder: type.displayOrder,
        isActive: type.isActive,
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        subSystemId, // إضافة subSystemId عند الإنشاء
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">أنواع الحسابات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة أنواع الحسابات المخصصة في النظام
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة نوع جديد
        </Button>
      </div>

      {/* Account Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة أنواع الحسابات</CardTitle>
          <CardDescription>
            يمكنك إضافة وتعديل أنواع الحسابات حسب احتياجك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : !accountTypes || accountTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد أنواع حسابات
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الكود</TableHead>
                  <TableHead className="text-right">الاسم بالعربية</TableHead>
                  <TableHead className="text-right">الاسم بالإنجليزية</TableHead>
                  <TableHead className="text-right">اللون</TableHead>
                  <TableHead className="text-right">الترتيب</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-mono">{type.typeCode}</TableCell>
                    <TableCell className="font-semibold">{type.typeNameAr}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {type.typeNameEn || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: type.color || "#3b82f6" }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {type.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{type.displayOrder}</TableCell>
                    <TableCell>
                      {type.isSystemType ? (
                        <Badge variant="secondary">نظامي</Badge>
                      ) : (
                        <Badge variant="outline">مخصص</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={type.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleActive(type.id, checked)
                        }
                        disabled={toggleActiveMutation.isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!type.isSystemType && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDialog(type)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(type.id)}
                              disabled={deleteMutation.isLoading}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "تعديل نوع الحساب" : "إضافة نوع حساب جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "قم بتعديل معلومات نوع الحساب"
                : "قم بإضافة نوع حساب جديد للنظام"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Type Code */}
              <div className="space-y-2">
                <Label htmlFor="typeCode">كود النوع *</Label>
                <Input
                  id="typeCode"
                  value={formData.typeCode}
                  onChange={(e) =>
                    setFormData({ ...formData, typeCode: e.target.value })
                  }
                  placeholder="مثال: iron_works"
                  required
                  disabled={!!editingId}
                />
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="displayOrder">الترتيب</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name Arabic */}
              <div className="space-y-2">
                <Label htmlFor="typeNameAr">الاسم بالعربية *</Label>
                <Input
                  id="typeNameAr"
                  value={formData.typeNameAr}
                  onChange={(e) =>
                    setFormData({ ...formData, typeNameAr: e.target.value })
                  }
                  placeholder="مثال: أعمال الحديدة"
                  required
                />
              </div>

              {/* Name English */}
              <div className="space-y-2">
                <Label htmlFor="typeNameEn">الاسم بالإنجليزية</Label>
                <Input
                  id="typeNameEn"
                  value={formData.typeNameEn}
                  onChange={(e) =>
                    setFormData({ ...formData, typeNameEn: e.target.value })
                  }
                  placeholder="Example: Iron Works"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">اللون</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Icon */}
              <div className="space-y-2">
                <Label htmlFor="icon">الأيقونة</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="مثال: Building"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="وصف اختياري لنوع الحساب"
                rows={3}
              />
            </div>

            {/* Is Active */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label htmlFor="isActive">نشط</Label>
                <p className="text-sm text-muted-foreground">
                  هل تريد تفعيل هذا النوع؟
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {editingId ? "تحديث" : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
