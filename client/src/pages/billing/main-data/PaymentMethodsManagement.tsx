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
import { Edit, Trash2, Search, RefreshCw, CreditCard } from "lucide-react";

interface PaymentMethod {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  methodType: string;
  isActive: boolean;
}

export default function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    methodType: "cash",
  });

  const methodsQuery = trpc.billing.getPaymentMethods.useQuery();
  const createMethodMutation = trpc.billing.createPaymentMethod.useMutation();
  const updateMethodMutation = trpc.billing.updatePaymentMethod.useMutation();
  const deleteMethodMutation = trpc.billing.deletePaymentMethod.useMutation();

  useEffect(() => {
    if (methodsQuery.data) {
      setPaymentMethods(methodsQuery.data);
    }
  }, [methodsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        methodType: formData.methodType as any,
      };
      
      if (editingMethod) {
        await updateMethodMutation.mutateAsync({ id: editingMethod.id, ...data });
      } else {
        await createMethodMutation.mutateAsync(data);
      }
      methodsQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving payment method:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      code: method.code,
      name: method.name,
      nameEn: method.nameEn || "",
      methodType: method.methodType,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف طريقة الدفع هذه؟")) {
      try {
        await deleteMethodMutation.mutateAsync({ id });
        methodsQuery.refetch();
      } catch (error) {
        console.error("Error deleting payment method:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: "", name: "", nameEn: "", methodType: "cash" });
    setEditingMethod(null);
  };

  const filteredMethods = paymentMethods.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cash: "نقدي",
      card: "بطاقة",
      bank_transfer: "تحويل بنكي",
      check: "شيك",
      online: "إلكتروني",
      sadad: "سداد",
      wallet: "محفظة",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">طرق الدفع</h1>
          <p className="text-muted-foreground">إضافة وتعديل طرق الدفع المتاحة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">طرق الدفع</TabsTrigger>
          <TabsTrigger value="add">{editingMethod ? "تعديل" : "إضافة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                قائمة طرق الدفع
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => methodsQuery.refetch()}>
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
                    <TableHead>الاسم بالإنجليزية</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {methodsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredMethods.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">لا توجد طرق دفع</TableCell>
                    </TableRow>
                  ) : (
                    filteredMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.code}</TableCell>
                        <TableCell>{method.name}</TableCell>
                        <TableCell>{method.nameEn || "-"}</TableCell>
                        <TableCell>{getMethodTypeLabel(method.methodType)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${method.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {method.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(method)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(method.id)} className="text-red-500">
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
              <CardTitle>{editingMethod ? "تعديل طريقة دفع" : "إضافة طريقة دفع جديدة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكود *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="PM-001" />
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
                    <Label>نوع الدفع</Label>
                    <Select value={formData.methodType} onValueChange={(v) => setFormData({ ...formData, methodType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدي</SelectItem>
                        <SelectItem value="card">بطاقة</SelectItem>
                        <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="check">شيك</SelectItem>
                        <SelectItem value="online">إلكتروني</SelectItem>
                        <SelectItem value="sadad">سداد</SelectItem>
                        <SelectItem value="wallet">محفظة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingMethod ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
