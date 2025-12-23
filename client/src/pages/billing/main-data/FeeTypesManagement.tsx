// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Search, RefreshCw, Receipt } from "lucide-react";

interface FeeType {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  feeType: string;
  amount: string;
  isRecurring: boolean;
  isActive: boolean;
}

export default function FeeTypesManagement() {
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    description: "",
    feeType: "fixed",
    amount: "0",
    isRecurring: false,
  });

  const feeTypesQuery = trpc.billing.getFeeTypes.useQuery();
  const createFeeTypeMutation = trpc.billing.createFeeType.useMutation();
  const updateFeeTypeMutation = trpc.billing.updateFeeType.useMutation();
  const deleteFeeTypeMutation = trpc.billing.deleteFeeType.useMutation();

  useEffect(() => {
    if (feeTypesQuery.data) {
      setFeeTypes(feeTypesQuery.data);
    }
  }, [feeTypesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        description: formData.description || undefined,
        feeType: formData.feeType as any,
        amount: parseFloat(formData.amount),
        isRecurring: formData.isRecurring,
      };
      
      if (editingFeeType) {
        await updateFeeTypeMutation.mutateAsync({ id: editingFeeType.id, ...data });
      } else {
        await createFeeTypeMutation.mutateAsync(data);
      }
      feeTypesQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving fee type:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feeType: FeeType) => {
    setEditingFeeType(feeType);
    setFormData({
      code: feeType.code,
      name: feeType.name,
      nameEn: feeType.nameEn || "",
      description: feeType.description || "",
      feeType: feeType.feeType,
      amount: feeType.amount,
      isRecurring: feeType.isRecurring,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا النوع؟")) {
      try {
        await deleteFeeTypeMutation.mutateAsync({ id });
        feeTypesQuery.refetch();
      } catch (error) {
        console.error("Error deleting fee type:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      nameEn: "",
      description: "",
      feeType: "fixed",
      amount: "0",
      isRecurring: false,
    });
    setEditingFeeType(null);
  };

  const filteredFeeTypes = feeTypes.filter((ft) =>
    ft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ft.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFeeTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fixed: "مبلغ ثابت",
      percentage: "نسبة مئوية",
      per_unit: "لكل وحدة",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">أنواع الرسوم</h1>
          <p className="text-muted-foreground">إضافة وتعديل أنواع الرسوم الإضافية</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">أنواع الرسوم</TabsTrigger>
          <TabsTrigger value="add">{editingFeeType ? "تعديل" : "إضافة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                قائمة أنواع الرسوم
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => feeTypesQuery.refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>متكرر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeTypesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredFeeTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">لا توجد أنواع رسوم</TableCell>
                    </TableRow>
                  ) : (
                    filteredFeeTypes.map((ft) => (
                      <TableRow key={ft.id}>
                        <TableCell className="font-medium">{ft.code}</TableCell>
                        <TableCell>{ft.name}</TableCell>
                        <TableCell>{getFeeTypeLabel(ft.feeType)}</TableCell>
                        <TableCell>{ft.feeType === "percentage" ? `${ft.amount}%` : `${ft.amount} ر.س`}</TableCell>
                        <TableCell>{ft.isRecurring ? "نعم" : "لا"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${ft.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {ft.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(ft)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(ft.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{editingFeeType ? "تعديل نوع رسوم" : "إضافة نوع رسوم جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الكود *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="FEE-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الرسم</Label>
                    <Select value={formData.feeType} onValueChange={(v) => setFormData({ ...formData, feeType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                        <SelectItem value="percentage">نسبة مئوية</SelectItem>
                        <SelectItem value="per_unit">لكل وحدة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ / النسبة</Label>
                    <Input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>رسم متكرر</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch checked={formData.isRecurring} onCheckedChange={(v) => setFormData({ ...formData, isRecurring: v })} />
                      <span className="text-sm">{formData.isRecurring ? "نعم" : "لا"}</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>الوصف</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingFeeType ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
