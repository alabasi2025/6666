import { useState, useEffect } from "react";
import { trpc } from "../../../_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, RefreshCw, MapPin } from "lucide-react";

interface Area {
  id: number;
  code: string;
  name: string;
  nameEn?: string;
  description?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AreasManagement() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nameEn: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const areasQuery = trpc.billing.getAreas.useQuery();
  const createAreaMutation = trpc.billing.createArea.useMutation();
  const updateAreaMutation = trpc.billing.updateArea.useMutation();
  const deleteAreaMutation = trpc.billing.deleteArea.useMutation();

  useEffect(() => {
    if (areasQuery.data) {
      setAreas(areasQuery.data);
    }
  }, [areasQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingArea) {
        await updateAreaMutation.mutateAsync({
          id: editingArea.id,
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        });
      } else {
        await createAreaMutation.mutateAsync({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        });
      }
      areasQuery.refetch();
      resetForm();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving area:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      code: area.code,
      name: area.name,
      nameEn: area.nameEn || "",
      description: area.description || "",
      address: area.address || "",
      latitude: area.latitude || "",
      longitude: area.longitude || "",
    });
    setActiveTab("add");
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المنطقة؟")) {
      try {
        await deleteAreaMutation.mutateAsync({ id });
        areasQuery.refetch();
      } catch (error) {
        console.error("Error deleting area:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      nameEn: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setEditingArea(null);
    setShowDialog(false);
  };

  const filteredAreas = areas.filter(
    (area) =>
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">إدارة المناطق</h1>
          <p className="text-muted-foreground">إضافة وتعديل وإدارة المناطق الجغرافية</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="list">المناطق</TabsTrigger>
          <TabsTrigger value="add">{editingArea ? "تعديل منطقة" : "إضافة منطقة"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                قائمة المناطق
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => areasQuery.refetch()}
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
                    <TableHead>العنوان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areasQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredAreas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        لا توجد مناطق
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAreas.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell className="font-medium">{area.code}</TableCell>
                        <TableCell>{area.name}</TableCell>
                        <TableCell>{area.nameEn || "-"}</TableCell>
                        <TableCell>{area.address || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              area.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {area.isActive ? "نشط" : "غير نشط"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(area)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(area.id)}
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
              <CardTitle>{editingArea ? "تعديل منطقة" : "إضافة منطقة جديدة"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">كود المنطقة *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                      placeholder="مثال: AREA-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المنطقة *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="اسم المنطقة بالعربية"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزية</Label>
                    <Input
                      id="nameEn"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="Area Name in English"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="description">الوصف</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="وصف المنطقة"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="address">العنوان</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="العنوان التفصيلي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latitude">خط العرض</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="مثال: 24.7136"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">خط الطول</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="مثال: 46.6753"
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
                    {loading ? "جاري الحفظ..." : editingArea ? "تحديث" : "حفظ"}
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
