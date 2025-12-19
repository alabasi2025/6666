import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, Search, RefreshCw, Box } from "lucide-react";

interface Cabinet {
  id: number;
  squareId: number;
  code: string;
  name: string;
  nameEn?: string;
  cabinetType: string;
  capacity?: number;
  currentLoad?: number;
  latitude?: string;
  longitude?: string;
  isActive: boolean;
  square?: { name: string; area?: { name: string } };
}

export default function CabinetsManagement() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [filterSquareId, setFilterSquareId] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    squareId: "",
    code: "",
    name: "",
    nameEn: "",
    cabinetType: "distribution",
    capacity: "",
    latitude: "",
    longitude: "",
  });

  const cabinetsQuery = trpc.billing.getCabinets.useQuery();
  const squaresQuery = trpc.billing.getSquares.useQuery();
  const createCabinetMutation = trpc.billing.createCabinet.useMutation();
  const updateCabinetMutation = trpc.billing.updateCabinet.useMutation();
  const deleteCabinetMutation = trpc.billing.deleteCabinet.useMutation();

  useEffect(() => {
    if (cabinetsQuery.data) {
      setCabinets(cabinetsQuery.data);
    }
  }, [cabinetsQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        squareId: parseInt(formData.squareId),
        code: formData.code,
        name: formData.name,
        nameEn: formData.nameEn || undefined,
        cabinetType: formData.cabinetType as "main" | "sub" | "distribution",
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };
      
      if (editingCabinet) {
        await updateCabinetMutation.mutateAsync({ id: editingCabinet.id, ...data });
      } else {
        await createCabinetMutation.mutateAsync(data);
      }
      cabinetsQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving cabinet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    setFormData({
      squareId: cabinet.squareId.toString(),
      code: cabinet.code,
      name: cabinet.name,
      nameEn: cabinet.nameEn || "",
      cabinetType: cabinet.cabinetType,
      capacity: cabinet.capacity?.toString() || "",
      latitude: cabinet.latitude || "",
      longitude: cabinet.longitude || "",
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الكابينة؟")) {
      try {
        await deleteCabinetMutation.mutateAsync({ id });
        cabinetsQuery.refetch();
      } catch (error) {
        console.error("Error deleting cabinet:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      squareId: "",
      code: "",
      name: "",
      nameEn: "",
      cabinetType: "distribution",
      capacity: "",
      latitude: "",
      longitude: "",
    });
    setEditingCabinet(null);
  };

  const filteredCabinets = cabinets.filter((cabinet) => {
    const matchesSearch =
      cabinet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cabinet.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSquare = filterSquareId === "all" || cabinet.squareId.toString() === filterSquareId;
    return matchesSearch && matchesSquare;
  });

  const getCabinetTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      main: "رئيسية",
      sub: "فرعية",
      distribution: "توزيع",
    };
    return types[type] || type;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة الكابينات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وإدارة كابينات التوزيع</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">الكابينات</TabsTrigger>
          <TabsTrigger value="add">{editingCabinet ? "تعديل كابينة" : "إضافة كابينة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                قائمة الكابينات
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterSquareId} onValueChange={setFilterSquareId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب المربع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المربعات</SelectItem>
                    {squaresQuery.data?.map((square: any) => (
                      <SelectItem key={square.id} value={square.id.toString()}>
                        {square.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 w-48"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={() => cabinetsQuery.refetch()}>
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
                    <TableHead>المربع</TableHead>
                    <TableHead>السعة</TableHead>
                    <TableHead>الحمل الحالي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cabinetsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : filteredCabinets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">لا توجد كابينات</TableCell>
                    </TableRow>
                  ) : (
                    filteredCabinets.map((cabinet) => (
                      <TableRow key={cabinet.id}>
                        <TableCell className="font-medium">{cabinet.code}</TableCell>
                        <TableCell>{cabinet.name}</TableCell>
                        <TableCell>{getCabinetTypeLabel(cabinet.cabinetType)}</TableCell>
                        <TableCell>{cabinet.square?.name || "-"}</TableCell>
                        <TableCell>{cabinet.capacity || "-"}</TableCell>
                        <TableCell>{cabinet.currentLoad || 0}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${cabinet.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {cabinet.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => handleEdit(cabinet)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleDelete(cabinet.id)} className="text-red-500">
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
              <CardTitle>{editingCabinet ? "تعديل كابينة" : "إضافة كابينة جديدة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>المربع *</Label>
                    <Select value={formData.squareId} onValueChange={(v) => setFormData({ ...formData, squareId: v })}>
                      <SelectTrigger><SelectValue placeholder="اختر المربع" /></SelectTrigger>
                      <SelectContent>
                        {squaresQuery.data?.map((sq: any) => (
                          <SelectItem key={sq.id} value={sq.id.toString()}>{sq.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>كود الكابينة *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required placeholder="CAB-001" />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم الكابينة *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم بالإنجليزية</Label>
                    <Input value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الكابينة</Label>
                    <Select value={formData.cabinetType} onValueChange={(v) => setFormData({ ...formData, cabinetType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">رئيسية</SelectItem>
                        <SelectItem value="sub">فرعية</SelectItem>
                        <SelectItem value="distribution">توزيع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>السعة</Label>
                    <Input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>خط العرض</Label>
                    <Input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>خط الطول</Label>
                    <Input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { resetForm(); setActiveTab("list"); }}>إلغاء</Button>
                  <Button type="submit" disabled={loading}>{loading ? "جاري الحفظ..." : editingCabinet ? "تحديث" : "حفظ"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
