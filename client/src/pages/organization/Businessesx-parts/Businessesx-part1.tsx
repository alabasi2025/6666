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
import { Building2, Plus, Search, Edit, Trash2, MoreHorizontal, Phone, Mail, Globe, FileText, Eye, Zap, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Business {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  type: "holding" | "subsidiary" | "branch";
  systemType: "energy" | "custom" | "both";
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  taxNumber?: string | null;
  commercialRegister?: string | null;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export default function Businesses() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [viewingBusiness, setViewingBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "subsidiary" as "holding" | "subsidiary" | "branch",
    hasEnergySystem: true,
    hasCustomSystem: true,
    address: "",
    phone: "",
    email: "",
    website: "",
    taxNumber: "",
    commercialRegister: "",
    currency: "SAR",
  });

  // تحويل checkboxes إلى systemType
  const getSystemType = (hasEnergy: boolean, hasCustom: boolean): "energy" | "custom" | "both" => {
    if (hasEnergy && hasCustom) return "both";
    if (hasEnergy) return "energy";
    if (hasCustom) return "custom";
    return "both"; // افتراضي
  };

  const { data: businesses, isLoading, refetch } = trpc.business.list.useQuery();
  
  const createMutation = trpc.business.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الشركة بنجاح");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل إضافة الشركة");
    },
  });

  const updateMutation = trpc.business.update.useMutation({
    onSuccess: () => {
      toast.success("تم تعديل الشركة بنجاح");
      setIsEditDialogOpen(false);
      setEditingBusiness(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تعديل الشركة");
    },
  });

  const deleteMutation = trpc.business.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الشركة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف الشركة");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      type: "subsidiary",
      hasEnergySystem: true,
      hasCustomSystem: true,
      address: "",
      phone: "",
      email: "",
      website: "",
      taxNumber: "",
      commercialRegister: "",
      currency: "SAR",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(formData as any).code || !(formData as any).nameAr) {
      toast.error("يرجى إدخال الكود والاسم العربي");
      return;
    }

    if (!(formData as any).hasEnergySystem && !(formData as any).hasCustomSystem) {
      toast.error("يجب اختيار نظام واحد على الأقل");
      return;
    }

    await createMutation.mutateAsync({
      code: (formData as any).code,
      nameAr: (formData as any).nameAr,
      nameEn: (formData as any).nameEn || undefined,
      type: (formData as any).type,
      systemType: getSystemType((formData as any).hasEnergySystem, (formData as any).hasCustomSystem),
      address: (formData as any).address || undefined,
      phone: (formData as any).phone || undefined,
      email: (formData as any).email || undefined,
      taxNumber: (formData as any).taxNumber || undefined,
      currency: (formData as any).currency,
    } as any);
  };

  const handleView = (business: Business) => {
    setViewingBusiness(business);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (business: Business) => {
    setEditingBusiness(business);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    await updateMutation.mutateAsync({
      id: editingBusiness.id,
      code: editingBusiness.code,
      nameAr: editingBusiness.nameAr,
      nameEn: editingBusiness.nameEn || undefined,
      type: editingBusiness.type,
      systemType: editingBusiness.systemType,
      address: editingBusiness.address || undefined,
      phone: editingBusiness.phone || undefined,
      email: editingBusiness.email || undefined,
      taxNumber: editingBusiness.taxNumber || undefined,
      currency: editingBusiness.currency,
      isActive: editingBusiness.isActive,
    } as any);
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشركة؟")) {
      await deleteMutation.mutateAsync({ id } as any);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "holding": return "شركة قابضة";
      case "subsidiary": return "شركة تابعة";
      case "branch": return "فرع";
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "holding": return "default";
      case "subsidiary": return "secondary";
      case "branch": return "outline";
      default: return "default";
    }
  };

  const getSystemTypeLabel = (systemType: string) => {
    switch (systemType) {
      case "energy": return "نظام كهرباء";
      case "custom": return "نظام مخصص";
      case "both": return "كلا النظامين";
      default: return systemType;
    }
  };

  const getSystemTypeBadgeColor = (systemType: string) => {
    switch (systemType) {
      case "energy": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "custom": return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      case "both": return "bg-green-500/20 text-green-500 border-green-500/30";
      default: return "";
    }
  };

  const filteredBusinesses = businesses?.filter((b: any) => 
    b.nameAr.includes(searchQuery) || 
    b.code.includes(searchQuery) ||
    (b.nameEn && b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            إدارة الشركات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة الشركات والمستأجرين في النظام
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-energy">
              <Plus className="w-4 h-4 ml-2" />
              إضافة شركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                إضافة شركة جديدة
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات الشركة الجديدة لإضافتها للنظام
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">كود الشركة *</Label>
                    <Input
                      id="code"
                      placeholder="مثال: COMP001"
                      value={(formData as any).code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الشركة</Label>
                    <Select
                      value={(formData as any).type}
                      onValueChange={(value: "holding" | "subsidiary" | "branch") => 
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holding">شركة قابضة</SelectItem>
                        <SelectItem value="subsidiary">شركة تابعة</SelectItem>
                        <SelectItem value="branch">فرع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* نوع النظام - Checkboxes */}
                <div className="space-y-3">
                  <Label>الأنظمة المتاحة *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* نظام الطاقة */}
                    <div 
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        (formData as any).hasEnergySystem 
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : 'border-muted hover:border-yellow-500/50'
                      }`}
                      onClick={() => setFormData({ ...formData, hasEnergySystem: !(formData as any).hasEnergySystem })}
                    >
                      <Checkbox 
                        checked={(formData as any).hasEnergySystem}
                        onCheckedChange={(checked) => setFormData({ ...formData, hasEnergySystem: !!checked })}
                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
