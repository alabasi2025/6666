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
import { Plus, Edit, Trash2, Search, RefreshCw, Grid3X3 } from "lucide-react";

interface Square {
  id: number;
  areaId: number;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  area?: { name: string };
}

export default function SquaresManagement() {
  const [squares, setSquares] = useState<Square[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSquare, setEditingSquare] = useState<Square | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [filterAreaId, setFilterAreaId] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    areaId: "",
    code: "",
    name: "",
    nameEn: "",
    description: "",
  });

  const squaresQuery = trpc.billing.getSquares.useQuery();
  const areasQuery = trpc.billing.getAreas.useQuery();
  const createSquareMutation = trpc.billing.createSquare.useMutation();
  const updateSquareMutation = trpc.billing.updateSquare.useMutation();
  const deleteSquareMutation = trpc.billing.deleteSquare.useMutation();

  useEffect(() => {
    if (squaresQuery.data) {
      setSquares(squaresQuery.data);
    }
  }, [squaresQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingSquare) {
        await updateSquareMutation.mutateAsync({
          id: editingSquare.id,
          areaId: parseInt(formData.areaId),
          code: formData.code,
          name: formData.name,
          nameEn: formData.nameEn || undefined,
          description: formData.description || undefined,
        });
      } else {
        await createSquareMutation.mutateAsync({
          areaId: parseInt(formData.areaId),
          code: formData.code,
          name: formData.name,
          nameEn: formData.nameEn || undefined,
          description: formData.description || undefined,
        });
      }
      squaresQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving square:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (square: Square) => {
    setEditingSquare(square);
    setFormData({
      areaId: square.areaId.toString(),
      code: square.code,
      name: square.name,
      nameEn: square.nameEn || "",
      description: square.description || "",
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المربع؟")) {
      try {
        await deleteSquareMutation.mutateAsync({ id });
        squaresQuery.refetch();
      } catch (error) {
        console.error("Error deleting square:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      areaId: "",
      code: "",
      name: "",
      nameEn: "",
      description: "",
    });
    setEditingSquare(null);
  };

  const filteredSquares = squares.filter((square) => {
    const matchesSearch =
      square.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      square.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = filterAreaId === "all" || square.areaId.toString() === filterAreaId;
    return matchesSearch && matchesArea;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المربعات</h1>
          <p className="text-muted-foreground">إضافة وتعديل وإدارة المربعات داخل المناطق</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">المربعات</TabsTrigger>
          <TabsTrigger value="add">{editingSquare ? "تعديل مربع" : "إضافة مربع"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                قائمة المربعات
              </CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterAreaId} onValueChange={setFilterAreaId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="فلترة حسب المنطقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المناطق</SelectItem>
                    {areasQuery.data?.map((area: any) => (
                      <SelectItem key={area.id} value={area.id.toString()}>
                        {area.name}
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => squaresQuery.refetch()}
                >
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
                    <TableHead>المنطقة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {squaresQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredSquares.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        لا توجد مربعات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSquares.map((square) => (
                      <TableRow key={square.id}>
                        <TableCell className="font-medium">{square.code}</TableCell>
                        <TableCell>{square.name}</TableCell>
                        <TableCell>{square.nameEn || "-"}</TableCell>
                        <TableCell>{square.area?.name || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              square.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {square.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(square)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(square.id)}
                              className="text-red-500 hover:text-red-700"
                            >
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
              <CardTitle>{editingSquare ? "تعديل مربع" : "إضافة مربع جديد"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="areaId">المنطقة *</Label>
                    <Select
                      value={formData.areaId}
                      onValueChange={(value) => setFormData({ ...formData, areaId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنطقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {areasQuery.data?.map((area: any) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">كود المربع *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      placeholder="مثال: SQ-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المربع *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="اسم المربع بالعربية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="Square Name in English"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف المربع"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setActiveTab("list");
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "جاري الحفظ..." : editingSquare ? "تحديث" : "حفظ"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
