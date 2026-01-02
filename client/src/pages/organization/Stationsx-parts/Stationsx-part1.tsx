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
