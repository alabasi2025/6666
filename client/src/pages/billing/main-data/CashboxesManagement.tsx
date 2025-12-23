// @ts-nocheck
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Search, RefreshCw, Wallet } from "lucide-react";

interface Cashbox {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  balance: string;
  currency: string;
  isActive: boolean;
}

export default function CashboxesManagement() {
  const [cashboxes, setCashboxes] = useState<Cashbox[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCashbox, setEditingCashbox] = useState<Cashbox | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    balance: "0",
    currency: "SAR",
  });

  const cashboxesQuery = trpc.billing.getCashboxes.useQuery();
  const createCashboxMutation = trpc.billing.createCashbox.useMutation();
  const updateCashboxMutation = trpc.billing.updateCashbox.useMutation();
  const deleteCashboxMutation = trpc.billing.deleteCashbox.useMutation();

  useEffect(() => {
    if (cashboxesQuery.data) {
      setCashboxes(cashboxesQuery.data);
    }
  }, [cashboxesQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
      };
      
      if (editingCashbox) {
        await updateCashboxMutation.mutateAsync({ id: editingCashbox.id, ...data });
      } else {
        await createCashboxMutation.mutateAsync(data);
      }
      cashboxesQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving cashbox:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cashbox: Cashbox) => {
    setEditingCashbox(cashbox);
    setFormData({
      code: cashbox.code,
      name: cashbox.name,
      nameEn: cashbox.nameEn || "",
      balance: cashbox.balance,
      currency: cashbox.currency,
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الصندوق؟")) {
      try {
        await deleteCashboxMutation.mutateAsync({ id });
        cashboxesQuery.refetch();
      } catch (error) {
        console.error("Error deleting cashbox:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: "", name: "", nameEn: "", balance: "0", currency: "SAR" });
    setEditingCashbox(null);
  };

  const filteredCashboxes = cashboxes.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الصناديق</h1>
          <p className="text-muted-foreground">إضافة وتعديل صناديق النقد</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">الصناديق</TabsTrigger>
          <TabsTrigger value="add">{editingCashbox ? "تعديل" : "إضافة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                قائمة الصناديق
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => cashboxesQuery.refetch()}>
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
                    <TableHead>الرصيد</TableHead>
                    <TableHead>العملة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashboxesQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredCashboxes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">لا توجد صناديق</TableCell>
                    </TableRow>
                  ) : (
                    filteredCashboxes.map((cashbox) => (
                      <TableRow key={cashbox.id}>
                        <TableCell className="font-medium">{cashbox.code}</TableCell>
                        <TableCell>{cashbox.name}</TableCell>
                        <TableCell className="font-semibold">{parseFloat(cashbox.balance).toLocaleString()} {cashbox.currency}</TableCell>
                        <TableCell>{cashbox.currency}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${cashbox.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {cashbox.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(cashbox)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(cashbox.id)} className="text-red-500">
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
              <CardTitle>{editingCashbox ? "تعديل صندوق" : "إضافة صندوق جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكود *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="CB-001" />
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
                    <Label>الرصيد الافتتاحي</Label>
                    <Input type="number" step="0.01" value={formData.balance} onChange={(e) => setFormData({ ...formData, balance: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>العملة</Label>
                    <Input value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingCashbox ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
