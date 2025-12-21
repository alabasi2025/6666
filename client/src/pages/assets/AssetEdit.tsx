import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowRight,
  Save,
  Loader2,
  Package,
} from "lucide-react";

interface AssetEditProps {
  assetId?: number;
}

export default function AssetEdit({ assetId }: AssetEditProps) {
  const [location, setLocation] = useLocation();
  
  // Extract id from URL if not passed as prop
  const id = assetId || parseInt(location.split('/').pop() || '0');

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    categoryId: "",
    stationId: "",
    description: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    purchaseCost: "",
    currentValue: "",
    location: "",
    status: "active",
    usefulLife: "",
    depreciationMethod: "",
  });

  // Fetch asset details
  const { data: asset, isLoading: isLoadingAsset } = trpc.assets.getById.useQuery({
    id: id,
  });

  // Fetch categories
  const { data: categories = [] } = trpc.assets.categories.list.useQuery({
    businessId: 1,
  });

  // Fetch stations
  const { data: stations = [] } = trpc.station.list.useQuery({
    businessId: 1,
  });

  // Update mutation
  const updateAsset = trpc.assets.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الأصل بنجاح");
      setLocation("/dashboard/assets");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الأصل");
    },
  });

  // Load asset data into form when fetched
  useEffect(() => {
    if (asset) {
      setFormData({
        code: asset.code || "",
        nameAr: asset.nameAr || "",
        nameEn: asset.nameEn || "",
        categoryId: asset.categoryId?.toString() || "",
        stationId: asset.stationId?.toString() || "",
        description: asset.description || "",
        serialNumber: asset.serialNumber || "",
        model: asset.model || "",
        manufacturer: asset.manufacturer || "",
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : "",
        purchaseCost: asset.purchaseCost || "",
        currentValue: asset.currentValue || "",
        location: asset.location || "",
        status: asset.status || "active",
        usefulLife: asset.usefulLife?.toString() || "",
        depreciationMethod: asset.depreciationMethod || "",
      });
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.nameAr) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    updateAsset.mutate({
      id: id,
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
      stationId: formData.stationId ? parseInt(formData.stationId) : undefined,
      description: formData.description || undefined,
      serialNumber: formData.serialNumber || undefined,
      model: formData.model || undefined,
      manufacturer: formData.manufacturer || undefined,
      purchaseDate: formData.purchaseDate || undefined,
      purchaseCost: formData.purchaseCost || undefined,
      currentValue: formData.currentValue || undefined,
      location: formData.location || undefined,
      status: formData.status,
      usefulLife: formData.usefulLife ? parseInt(formData.usefulLife) : undefined,
      depreciationMethod: formData.depreciationMethod || undefined,
    });
  };

  if (isLoadingAsset) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">الأصل غير موجود</p>
        <Button onClick={() => setLocation("/dashboard/assets")}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للقائمة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/dashboard/assets")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              تعديل الأصل
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">{asset.code}</p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات الأصل</CardTitle>
            <CardDescription>قم بتعديل بيانات الأصل</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">رقم الأصل *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="AST-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم الأصل (عربي) *</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مولد كهربائي"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم الأصل (إنجليزي)</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Generator"
                />
              </div>
            </div>

            {/* Category and Station */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>الفئة</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون فئة</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>المحطة</Label>
                <Select
                  value={formData.stationId}
                  onValueChange={(value) => setFormData({ ...formData, stationId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون محطة</SelectItem>
                    {stations.map((station: any) => (
                      <SelectItem key={station.id} value={station.id.toString()}>
                        {station.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="idle">غير نشط</SelectItem>
                    <SelectItem value="maintenance">صيانة</SelectItem>
                    <SelectItem value="disposed">مستبعد</SelectItem>
                    <SelectItem value="transferred">منقول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Technical Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">الرقم التسلسلي</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="SN-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">الشركة المصنعة</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="Caterpillar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">الموديل</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="CAT-500"
                />
              </div>
            </div>

            {/* Financial Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">تاريخ الشراء</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseCost">تكلفة الشراء (ر.س)</Label>
                <Input
                  id="purchaseCost"
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentValue">القيمة الحالية (ر.س)</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Depreciation Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usefulLife">العمر الإنتاجي (سنوات)</Label>
                <Input
                  id="usefulLife"
                  type="number"
                  value={formData.usefulLife}
                  onChange={(e) => setFormData({ ...formData, usefulLife: e.target.value })}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label>طريقة الإهلاك</Label>
                <Select
                  value={formData.depreciationMethod}
                  onValueChange={(value) => setFormData({ ...formData, depreciationMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الإهلاك" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون إهلاك</SelectItem>
                    <SelectItem value="straight_line">القسط الثابت</SelectItem>
                    <SelectItem value="declining_balance">القسط المتناقص</SelectItem>
                    <SelectItem value="units_of_production">وحدات الإنتاج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="المبنى الرئيسي - الطابق 1"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف تفصيلي للأصل..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/dashboard/assets")}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={updateAsset.isPending}>
                {updateAsset.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التعديلات
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
