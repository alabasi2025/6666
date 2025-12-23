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
import { Building2, Plus, Search, Edit, Trash2, MoreHorizontal, Phone, Mail, Globe, FileText, Eye } from "lucide-react";
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
    systemType: "both" as "energy" | "custom" | "both",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxNumber: "",
    commercialRegister: "",
    currency: "SAR",
  });

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
      systemType: "both",
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
    
    if (!formData.code || !formData.nameAr) {
      toast.error("يرجى إدخال الكود والاسم العربي");
      return;
    }

    await createMutation.mutateAsync({
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      type: formData.type,
      systemType: formData.systemType,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      taxNumber: formData.taxNumber || undefined,
      currency: formData.currency,
    });
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
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الشركة؟")) {
      await deleteMutation.mutateAsync({ id });
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

  const filteredBusinesses = businesses?.filter((b: Business) => 
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
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="text-right"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الشركة</Label>
                    <Select
                      value={formData.type}
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

                {/* نوع النظام */}
                <div className="space-y-2">
                  <Label htmlFor="systemType">نوع النظام *</Label>
                  <Select
                    value={formData.systemType}
                    onValueChange={(value: "energy" | "custom" | "both") => 
                      setFormData({ ...formData, systemType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع النظام" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energy">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          نظام كهرباء - إدارة الطاقة المتكامل
                        </div>
                      </SelectItem>
                      <SelectItem value="custom">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                          نظام مخصص - حسابات وملاحظات ومذكرات
                        </div>
                      </SelectItem>
                      <SelectItem value="both">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span>
                          كلا النظامين - الوصول الكامل
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {
                      formData.systemType === "energy" 
                        ? "نظام إدارة الطاقة المتكامل يشمل: العملاء، الفوترة، الصيانة، SCADA والمزيد"
                        : formData.systemType === "custom"
                        ? "نظام مخصص يشمل: الحسابات المالية، الملاحظات، المذكرات والتعاميم"
                        : "الوصول الكامل لكلا النظامين: نظام الطاقة والنظام المخصص"
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                    <Input
                      id="nameAr"
                      placeholder="اسم الشركة بالعربي"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="nameEn"
                      placeholder="Company Name in English"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="05xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="info@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">الموقع الإلكتروني</Label>
                    <div className="relative">
                      <Globe className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="website"
                        placeholder="www.company.com"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">العملة</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        <SelectItem value="EUR">يورو (EUR)</SelectItem>
                        <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                        <SelectItem value="KWD">دينار كويتي (KWD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    placeholder="عنوان الشركة الكامل"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              {/* Legal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات القانونية</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="taxNumber"
                        placeholder="رقم التسجيل الضريبي"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="commercialRegister">السجل التجاري</Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="commercialRegister"
                        placeholder="رقم السجل التجاري"
                        value={formData.commercialRegister}
                        onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                        className="pr-10"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  className="gradient-energy"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري الإضافة...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة الشركة
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{businesses?.length || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي الشركات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Businesses Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الشركات</CardTitle>
          <CardDescription>جميع الشركات المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد شركات مسجلة</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول شركة
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الاسم</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">نوع النظام</TableHead>
                    <TableHead className="text-right">الهاتف</TableHead>
                    <TableHead className="text-right">البريد</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business: Business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-mono">{business.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{business.nameAr}</p>
                          {business.nameEn && (
                            <p className="text-sm text-muted-foreground">{business.nameEn}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(business.type) as any}>
                          {getTypeLabel(business.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSystemTypeBadgeColor(business.systemType || "energy")}>
                          {getSystemTypeLabel(business.systemType || "energy")}
                        </Badge>
                      </TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {business.phone || "-"}
                      </TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {business.email || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.isActive ? "default" : "secondary"}>
                          {business.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(business)} title="عرض">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(business)} title="تعديل">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(business.id)} title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              تعديل الشركة
            </DialogTitle>
            <DialogDescription>
              تعديل بيانات الشركة
            </DialogDescription>
          </DialogHeader>
          
          {editingBusiness && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">كود الشركة</Label>
                    <Input
                      id="edit-code"
                      value={editingBusiness.code}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, code: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">نوع الشركة</Label>
                    <Select
                      value={editingBusiness.type}
                      onValueChange={(value: "holding" | "subsidiary" | "branch") => 
                        setEditingBusiness({ ...editingBusiness, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holding">شركة قابضة</SelectItem>
                        <SelectItem value="subsidiary">شركة تابعة</SelectItem>
                        <SelectItem value="branch">فرع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nameAr">الاسم بالعربي</Label>
                    <Input
                      id="edit-nameAr"
                      value={editingBusiness.nameAr}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, nameAr: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="edit-nameEn"
                      value={editingBusiness.nameEn || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, nameEn: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-systemType">نوع النظام</Label>
                  <Select
                    value={editingBusiness.systemType}
                    onValueChange={(value: "energy" | "custom" | "both") => 
                      setEditingBusiness({ ...editingBusiness, systemType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="energy">نظام كهرباء</SelectItem>
                      <SelectItem value="custom">نظام مخصص</SelectItem>
                      <SelectItem value="both">كلا النظامين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">الهاتف</Label>
                    <Input
                      id="edit-phone"
                      value={editingBusiness.phone || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingBusiness.email || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, email: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Textarea
                    id="edit-address"
                    value={editingBusiness.address || ""}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الحالة</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={editingBusiness.isActive}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-isActive">الشركة نشطة</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              عرض بيانات الشركة
            </DialogTitle>
          </DialogHeader>
          
          {viewingBusiness && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">كود الشركة</Label>
                    <p className="font-medium">{viewingBusiness.code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">نوع الشركة</Label>
                    <p className="font-medium">{getTypeLabel(viewingBusiness.type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم بالعربي</Label>
                    <p className="font-medium">{viewingBusiness.nameAr}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم بالإنجليزي</Label>
                    <p className="font-medium">{viewingBusiness.nameEn || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">نوع النظام</Label>
                    <p className="font-medium">{getSystemTypeLabel(viewingBusiness.systemType || "both")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">العملة</Label>
                    <p className="font-medium">{viewingBusiness.currency}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">الهاتف</Label>
                    <p className="font-medium">{viewingBusiness.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{viewingBusiness.email || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">العنوان</Label>
                    <p className="font-medium">{viewingBusiness.address || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الحالة</h3>
                <Badge variant={viewingBusiness.isActive ? "default" : "secondary"}>
                  {viewingBusiness.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(viewingBusiness); }}>
                  تعديل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
