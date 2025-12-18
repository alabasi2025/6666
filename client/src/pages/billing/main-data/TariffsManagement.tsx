import { useState, useEffect } from "react";
import { trpc } from "../../../_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Search, RefreshCw, DollarSign, Plus, X } from "lucide-react";

interface TariffSlab {
  from: number;
  to: number;
  price: number;
}

interface Tariff {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  tariffType: string;
  serviceType: string;
  slabs?: TariffSlab[];
  fixedCharge: string;
  vatRate: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive: boolean;
}

export default function TariffsManagement() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    description: "",
    tariffType: "standard",
    serviceType: "electricity",
    fixedCharge: "0",
    vatRate: "15",
    effectiveFrom: "",
    effectiveTo: "",
  });

  const [slabs, setSlabs] = useState<TariffSlab[]>([
    { from: 0, to: 1000, price: 0.18 },
    { from: 1001, to: 2000, price: 0.30 },
  ]);

  const tariffsQuery = trpc.billing.getTariffs.useQuery();
  const createTariffMutation = trpc.billing.createTariff.useMutation();
  const updateTariffMutation = trpc.billing.updateTariff.useMutation();
  const deleteTariffMutation = trpc.billing.deleteTariff.useMutation();

  useEffect(() => {
    if (tariffsQuery.data) {
      setTariffs(tariffsQuery.data);
    }
  }, [tariffsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        description: formData.description || undefined,
        tariffType: formData.tariffType as any,
        serviceType: formData.serviceType as any,
        slabs: slabs,
        fixedCharge: parseFloat(formData.fixedCharge),
        vatRate: parseFloat(formData.vatRate),
        effectiveFrom: formData.effectiveFrom || undefined,
        effectiveTo: formData.effectiveTo || undefined,
      };
      
      if (editingTariff) {
        await updateTariffMutation.mutateAsync({ id: editingTariff.id, ...data });
      } else {
        await createTariffMutation.mutateAsync(data);
      }
      tariffsQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving tariff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tariff: Tariff) => {
    setEditingTariff(tariff);
    setFormData({
      code: tariff.code,
      name: tariff.name,
      nameEn: tariff.nameEn || "",
      description: tariff.description || "",
      tariffType: tariff.tariffType,
      serviceType: tariff.serviceType,
      fixedCharge: tariff.fixedCharge,
      vatRate: tariff.vatRate,
      effectiveFrom: tariff.effectiveFrom || "",
      effectiveTo: tariff.effectiveTo || "",
    });
    setSlabs(tariff.slabs || [{ from: 0, to: 1000, price: 0.18 }]);
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه التعرفة؟")) {
      try {
        await deleteTariffMutation.mutateAsync({ id });
        tariffsQuery.refetch();
      } catch (error) {
        console.error("Error deleting tariff:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      nameEn: "",
      description: "",
      tariffType: "standard",
      serviceType: "electricity",
      fixedCharge: "0",
      vatRate: "15",
      effectiveFrom: "",
      effectiveTo: "",
    });
    setSlabs([{ from: 0, to: 1000, price: 0.18 }]);
    setEditingTariff(null);
  };

  const addSlab = () => {
    const lastSlab = slabs[slabs.length - 1];
    setSlabs([...slabs, { from: lastSlab.to + 1, to: lastSlab.to + 1000, price: 0 }]);
  };

  const removeSlab = (index: number) => {
    setSlabs(slabs.filter((_, i) => i !== index));
  };

  const updateSlab = (index: number, field: keyof TariffSlab, value: number) => {
    const newSlabs = [...slabs];
    newSlabs[index][field] = value;
    setSlabs(newSlabs);
  };

  const filteredTariffs = tariffs.filter((tariff) =>
    tariff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tariff.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTariffTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      standard: "قياسية",
      custom: "مخصصة",
      promotional: "ترويجية",
      contract: "تعاقدية",
    };
    return types[type] || type;
  };

  const getServiceTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      electricity: "كهرباء",
      water: "ماء",
      gas: "غاز",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة التعرفة</h1>
          <p className="text-muted-foreground">إضافة وتعديل شرائح الأسعار والتعرفة</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">التعرفات</TabsTrigger>
          <TabsTrigger value="add">{editingTariff ? "تعديل تعرفة" : "إضافة تعرفة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                قائمة التعرفات
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-9 w-64" />
                </div>
                <Button variant="outline" size="icon" onClick={() => tariffsQuery.refetch()}>
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
                    <TableHead>الخدمة</TableHead>
                    <TableHead>الرسوم الثابتة</TableHead>
                    <TableHead>الضريبة</TableHead>
                    <TableHead>الشرائح</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariffsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredTariffs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">لا توجد تعرفات</TableCell>
                    </TableRow>
                  ) : (
                    filteredTariffs.map((tariff) => (
                      <TableRow key={tariff.id}>
                        <TableCell className="font-medium">{tariff.code}</TableCell>
                        <TableCell>{tariff.name}</TableCell>
                        <TableCell>{getTariffTypeLabel(tariff.tariffType)}</TableCell>
                        <TableCell>{getServiceTypeLabel(tariff.serviceType)}</TableCell>
                        <TableCell>{tariff.fixedCharge} ر.س</TableCell>
                        <TableCell>{tariff.vatRate}%</TableCell>
                        <TableCell>{tariff.slabs?.length || 0} شريحة</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${tariff.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {tariff.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(tariff)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(tariff.id)} className="text-red-500">
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
              <CardTitle>{editingTariff ? "تعديل تعرفة" : "إضافة تعرفة جديدة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>كود التعرفة *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="TAR-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم التعرفة *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع التعرفة</Label>
                    <Select value={formData.tariffType} onValueChange={(v) => setFormData({ ...formData, tariffType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">قياسية</SelectItem>
                        <SelectItem value="custom">مخصصة</SelectItem>
                        <SelectItem value="promotional">ترويجية</SelectItem>
                        <SelectItem value="contract">تعاقدية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الخدمة</Label>
                    <Select value={formData.serviceType} onValueChange={(v) => setFormData({ ...formData, serviceType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">كهرباء</SelectItem>
                        <SelectItem value="water">ماء</SelectItem>
                        <SelectItem value="gas">غاز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>الرسوم الثابتة</Label>
                    <Input type="number" step="0.01" value={formData.fixedCharge} onChange={(e) => setFormData({ ...formData, fixedCharge: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نسبة الضريبة %</Label>
                    <Input type="number" step="0.01" value={formData.vatRate} onChange={(e) => setFormData({ ...formData, vatRate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ البداية</Label>
                    <Input type="date" value={formData.effectiveFrom} onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ النهاية</Label>
                    <Input type="date" value={formData.effectiveTo} onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>الوصف</Label>
                    <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                </div>

                {/* شرائح التعرفة */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">شرائح الأسعار</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addSlab}>
                      <Plus className="h-4 w-4 ml-1" /> إضافة شريحة
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 space-y-3">
                    {slabs.map((slab, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">من (كيلوواط)</Label>
                            <Input type="number" value={slab.from} onChange={(e) => updateSlab(index, "from", parseFloat(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">إلى (كيلوواط)</Label>
                            <Input type="number" value={slab.to} onChange={(e) => updateSlab(index, "to", parseFloat(e.target.value))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">السعر (ر.س/كيلوواط)</Label>
                            <Input type="number" step="0.01" value={slab.price} onChange={(e) => updateSlab(index, "price", parseFloat(e.target.value))} />
                          </div>
                        </div>
                        {slabs.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSlab(index)} className="text-red-500">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingTariff ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
