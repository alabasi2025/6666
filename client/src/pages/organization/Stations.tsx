import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Radio, Plus, Search, Edit, Trash2, Zap, Activity, MapPin, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Station {
  id: number;
  businessId: number;
  branchId: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  type: "generation" | "distribution" | "generation_distribution" | "solar";
  status: "operational" | "maintenance" | "offline" | "construction" | "decommissioned";
  capacity?: string | null;
  capacityUnit?: string | null;
  voltageLevel?: string | null;
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  isActive: boolean;
  createdAt: Date;
}

export default function Stations() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [formData, setFormData] = useState({
    businessId: "",
    branchId: "",
    code: "",
    nameAr: "",
    nameEn: "",
    type: "generation" as Station["type"],
    status: "operational" as Station["status"],
    capacity: "",
    capacityUnit: "MW",
    voltageLevel: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const { data: stations, isLoading, refetch } = trpc.station.list.useQuery();
  const { data: businesses } = trpc.business.list.useQuery();
  const { data: branches } = trpc.branch.list.useQuery();

  const createMutation = trpc.station.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المحطة بنجاح");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إضافة المحطة");
    },
  });

  const updateMutation = trpc.station.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المحطة بنجاح");
      setEditingStation(null);
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث المحطة");
    },
  });

  const deleteMutation = trpc.station.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المحطة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف المحطة");
    },
  });

  const resetForm = () => {
    setFormData({
      businessId: "",
      branchId: "",
      code: "",
      nameAr: "",
      nameEn: "",
      type: "generation",
      status: "operational",
      capacity: "",
      capacityUnit: "MW",
      voltageLevel: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setEditingStation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessId || !formData.branchId || !formData.code || !formData.nameAr) {
      toast.error("يرجى إدخال الشركة والفرع والكود والاسم العربي");
      return;
    }

    if (editingStation) {
      await updateMutation.mutateAsync({
        id: editingStation.id,
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        type: formData.type,
        status: formData.status,
        capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
        capacityUnit: formData.capacityUnit,
        voltageLevel: formData.voltageLevel || undefined,
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      } as any);
    } else {
      await createMutation.mutateAsync({
        businessId: parseInt(formData.businessId),
        branchId: parseInt(formData.branchId),
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        type: formData.type,
        status: formData.status,
        capacity: formData.capacity ? parseFloat(formData.capacity) : undefined,
        capacityUnit: formData.capacityUnit,
        voltageLevel: formData.voltageLevel || undefined,
        address: formData.address || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      } as any);
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station as any);
    setFormData({
      businessId: station.businessId.toString(),
      branchId: station.branchId.toString(),
      code: station.code,
      nameAr: station.nameAr,
      nameEn: station.nameEn || "",
      type: station.type,
      status: station.status,
      capacity: station.capacity || "",
      capacityUnit: station.capacityUnit || "MW",
      voltageLevel: station.voltageLevel || "",
      address: station.address || "",
      latitude: station.latitude || "",
      longitude: station.longitude || "",
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المحطة؟")) {
      await deleteMutation.mutateAsync({ id } as any);
    }
  };

  const filteredStations = stations?.filter((station) => {
    const matchesSearch =
      station.nameAr.includes(searchQuery) ||
      station.code.includes(searchQuery) ||
      (station.nameEn && station.nameEn.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBranch = selectedBranch === "all" || station.branchId.toString() === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      generation: "توليد",
      distribution: "توزيع",
      generation_distribution: "توليد وتوزيع",
      solar: "طاقة شمسية",
    };
    return types[type] || type;
  };

  const getStatusLabel = (status: string) => {
    const statuses: Record<string, string> = {
      operational: "تعمل",
      maintenance: "صيانة",
      offline: "متوقفة",
      construction: "قيد الإنشاء",
      decommissioned: "خارج الخدمة",
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      operational: "bg-green-500",
      maintenance: "bg-yellow-500",
      offline: "bg-red-500",
      construction: "bg-blue-500",
      decommissioned: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getBranchName = (branchId: number) => {
    const branch = branches?.find((b) => b.id === branchId);
    return branch?.nameAr || "غير محدد";
  };

  const filteredBranches = formData.businessId
    ? branches?.filter((b) => b.businessId === parseInt(formData.businessId))
    : branches;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">إدارة المحطات</h1>
            <p className="text-muted-foreground">إدارة محطات الطاقة في النظام</p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة محطة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                {editingStation ? "تعديل المحطة" : "إضافة محطة جديدة"}
              </DialogTitle>
              <DialogDescription>
                {editingStation ? "قم بتعديل بيانات المحطة" : "أدخل بيانات المحطة الجديدة لإضافتها للنظام"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessId">الشركة *</Label>
                    <Select
                      value={formData.businessId}
                      onValueChange={(value) => setFormData({ ...formData, businessId: value, branchId: "" })}
                      disabled={!!editingStation}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشركة" />
                      </SelectTrigger>
                      <SelectContent>
                        {businesses?.map((business) => (
                          <SelectItem key={business.id} value={business.id.toString()}>
                            {business.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchId">الفرع *</Label>
                    <Select
                      value={formData.branchId}
                      onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                      disabled={!!editingStation || !formData.businessId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرع" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredBranches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            {branch.nameAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">كود المحطة *</Label>
                    <Input
                      id="code"
                      placeholder="مثال: ST-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع المحطة *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Station["type"]) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generation">توليد</SelectItem>
                        <SelectItem value="distribution">توزيع</SelectItem>
                        <SelectItem value="generation_distribution">توليد وتوزيع</SelectItem>
                        <SelectItem value="solar">طاقة شمسية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                    <Input
                      id="nameAr"
                      placeholder="اسم المحطة بالعربي"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="nameEn"
                      placeholder="Station Name in English"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* المواصفات الفنية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">المواصفات الفنية</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Station["status"]) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">تعمل</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="offline">متوقفة</SelectItem>
                        <SelectItem value="construction">قيد الإنشاء</SelectItem>
                        <SelectItem value="decommissioned">خارج الخدمة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">السعة</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacityUnit">وحدة السعة</Label>
                    <Select
                      value={formData.capacityUnit}
                      onValueChange={(value) => setFormData({ ...formData, capacityUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MW">ميجاواط (MW)</SelectItem>
                        <SelectItem value="KW">كيلوواط (KW)</SelectItem>
                        <SelectItem value="GW">جيجاواط (GW)</SelectItem>
                        <SelectItem value="MVA">ميجا فولت أمبير (MVA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voltageLevel">مستوى الجهد</Label>
                  <Input
                    id="voltageLevel"
                    placeholder="مثال: 132 KV"
                    value={formData.voltageLevel}
                    onChange={(e) => setFormData({ ...formData, voltageLevel: e.target.value })}
                  />
                </div>
              </div>

              {/* الموقع */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">الموقع</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    placeholder="عنوان المحطة"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">خط العرض</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.00000001"
                      placeholder="24.7136"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">خط الطول</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.00000001"
                      placeholder="46.6753"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingStation ? "تحديث المحطة" : "إضافة المحطة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المحطات</p>
              <p className="text-2xl font-bold">{stations?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المحطات العاملة</p>
              <p className="text-2xl font-bold">{stations?.filter((s) => s.status === "operational").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Settings className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تحت الصيانة</p>
              <p className="text-2xl font-bold">{stations?.filter((s) => s.status === "maintenance").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي السعة</p>
              <p className="text-2xl font-bold">
                {stations?.reduce((sum, s) => sum + (parseFloat(s.capacity || "0") || 0), 0).toFixed(0) || 0} MW
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المحطات</CardTitle>
          <CardDescription>جميع المحطات المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع الفروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredStations && filteredStations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-mono">{station.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{station.nameAr}</p>
                        {station.nameEn && (
                          <p className="text-sm text-muted-foreground">{station.nameEn}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getBranchName(station.branchId)}</TableCell>
                    <TableCell>{getTypeLabel(station.type)}</TableCell>
                    <TableCell>
                      {station.capacity ? `${station.capacity} ${(station as any).capacityUnit || "MW"}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(station.status)}>{getStatusLabel(station.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(station as any)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(station.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد محطات مسجلة</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                إضافة أول محطة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
