import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowRight,
  Edit,
  Trash2,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Wrench,
  FileText,
  History,
  AlertTriangle,
  TrendingDown,
  QrCode,
  Printer,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock asset data
const mockAsset = {
  id: 1,
  code: "AST-000001",
  nameAr: "محول كهربائي 500 كيلو فولت",
  nameEn: "500KV Electrical Transformer",
  description: "محول كهربائي عالي الجهد للاستخدام في محطات التوليد الرئيسية. يتميز بكفاءة عالية وعمر افتراضي طويل.",
  categoryId: 1,
  categoryName: "محولات",
  businessId: 1,
  businessName: "شركة الكهرباء الوطنية",
  branchId: 1,
  branchName: "الفرع الرئيسي",
  stationId: 1,
  stationName: "محطة التوليد الرئيسية",
  status: "active",
  serialNumber: "TR-2023-001-XYZ",
  manufacturer: "ABB",
  model: "POWER-500",
  purchaseDate: "2023-01-15",
  purchaseCost: "2500000",
  currentValue: "2250000",
  accumulatedDepreciation: "250000",
  usefulLife: 25,
  salvageValue: "250000",
  depreciationMethod: "straight_line",
  warrantyExpiry: "2028-01-15",
  location: "المبنى A - الطابق 1 - الغرفة 101",
  gpsCoordinates: "24.7136° N, 46.6753° E",
  barcode: "1234567890123",
  qrCode: "AST-000001",
  lastMaintenanceDate: "2024-06-15",
  nextMaintenanceDate: "2024-12-15",
  createdAt: "2023-01-15T10:00:00Z",
  updatedAt: "2024-06-15T14:30:00Z",
  createdBy: "أحمد محمد",
};

// Mock maintenance history
const maintenanceHistory = [
  {
    id: 1,
    orderNumber: "WO-2024-001",
    type: "preventive",
    description: "صيانة دورية - فحص الزيت والعوازل",
    date: "2024-06-15",
    cost: "15000",
    technician: "محمد علي",
    status: "completed",
  },
  {
    id: 2,
    orderNumber: "WO-2024-002",
    type: "corrective",
    description: "إصلاح تسريب زيت",
    date: "2024-03-20",
    cost: "8500",
    technician: "أحمد سالم",
    status: "completed",
  },
  {
    id: 3,
    orderNumber: "WO-2023-015",
    type: "preventive",
    description: "صيانة دورية - فحص شامل",
    date: "2023-12-10",
    cost: "12000",
    technician: "خالد عمر",
    status: "completed",
  },
];

// Mock movement history
const movementHistory = [
  {
    id: 1,
    type: "transfer",
    fromLocation: "المستودع الرئيسي",
    toLocation: "محطة التوليد الرئيسية",
    date: "2023-01-20",
    reason: "تركيب جديد",
    approvedBy: "المدير الفني",
  },
  {
    id: 2,
    type: "inspection",
    fromLocation: "محطة التوليد الرئيسية",
    toLocation: "محطة التوليد الرئيسية",
    date: "2024-01-15",
    reason: "فحص سنوي",
    approvedBy: "مدير الصيانة",
  },
];

// Mock depreciation schedule
const depreciationSchedule = [
  { year: 2023, openingValue: "2500000", depreciation: "90000", closingValue: "2410000" },
  { year: 2024, openingValue: "2410000", depreciation: "90000", closingValue: "2320000" },
  { year: 2025, openingValue: "2320000", depreciation: "90000", closingValue: "2230000" },
  { year: 2026, openingValue: "2230000", depreciation: "90000", closingValue: "2140000" },
  { year: 2027, openingValue: "2140000", depreciation: "90000", closingValue: "2050000" },
];

// Mock documents
const documents = [
  { id: 1, name: "شهادة الضمان", type: "pdf", size: "1.2 MB", uploadDate: "2023-01-15" },
  { id: 2, name: "دليل المستخدم", type: "pdf", size: "5.8 MB", uploadDate: "2023-01-15" },
  { id: 3, name: "تقرير الفحص الأولي", type: "pdf", size: "2.1 MB", uploadDate: "2023-01-20" },
  { id: 4, name: "صورة الأصل", type: "jpg", size: "3.5 MB", uploadDate: "2023-01-20" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "bg-success/20 text-success border-success/30" },
  inactive: { label: "غير نشط", color: "bg-muted text-muted-foreground border-border" },
  maintenance: { label: "تحت الصيانة", color: "bg-warning/20 text-warning border-warning/30" },
  disposed: { label: "مستبعد", color: "bg-destructive/20 text-destructive border-destructive/30" },
};

const maintenanceTypeConfig: Record<string, { label: string; color: string }> = {
  preventive: { label: "وقائية", color: "bg-primary/20 text-primary" },
  corrective: { label: "تصحيحية", color: "bg-warning/20 text-warning" },
  emergency: { label: "طارئة", color: "bg-destructive/20 text-destructive" },
};

export default function AssetDetails() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const assetId = params.id;

  // In real app, fetch asset data using assetId
  const asset = mockAsset;

  const handleBack = () => {
    setLocation("/dashboard/assets");
  };

  const handleEdit = () => {
    setLocation(`/dashboard/assets/edit/${assetId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{asset.nameAr}</h1>
              <Badge variant="outline" className={cn("font-medium", statusConfig[asset.status].color)}>
                {statusConfig[asset.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{asset.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <QrCode className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="w-4 h-4 ml-2" />
            تعديل
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تكلفة الشراء</p>
                <p className="text-xl font-bold ltr-nums">
                  {Number(asset.purchaseCost).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                <p className="text-xl font-bold ltr-nums text-success">
                  {Number(asset.currentValue).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العمر الإنتاجي</p>
                <p className="text-xl font-bold">{asset.usefulLife} سنة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الصيانة القادمة</p>
                <p className="text-xl font-bold">
                  {new Date(asset.nextMaintenanceDate).toLocaleDateString("ar-SA")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="details"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Package className="w-4 h-4 ml-2" />
            التفاصيل
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Wrench className="w-4 h-4 ml-2" />
            سجل الصيانة
          </TabsTrigger>
          <TabsTrigger
            value="depreciation"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <TrendingDown className="w-4 h-4 ml-2" />
            الإهلاك
          </TabsTrigger>
          <TabsTrigger
            value="movements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <History className="w-4 h-4 ml-2" />
            الحركات
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <FileText className="w-4 h-4 ml-2" />
            المستندات
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الأصل</p>
                    <p className="font-medium font-mono">{asset.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الرقم التسلسلي</p>
                    <p className="font-medium font-mono">{asset.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الفئة</p>
                    <p className="font-medium">{asset.categoryName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الشركة المصنعة</p>
                    <p className="font-medium">{asset.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الموديل</p>
                    <p className="font-medium">{asset.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الشراء</p>
                    <p className="font-medium">
                      {new Date(asset.purchaseDate).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">الوصف</p>
                  <p className="text-sm">{asset.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  معلومات الموقع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الشركة</p>
                    <p className="font-medium">{asset.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الفرع</p>
                    <p className="font-medium">{asset.branchName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المحطة</p>
                    <p className="font-medium">{asset.stationName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الإحداثيات</p>
                    <p className="font-medium font-mono text-sm">{asset.gpsCoordinates}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">الموقع التفصيلي</p>
                  <p className="font-medium">{asset.location}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  المعلومات المالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">تكلفة الشراء</p>
                    <p className="font-medium ltr-nums">
                      {Number(asset.purchaseCost).toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                    <p className="font-medium ltr-nums text-success">
                      {Number(asset.currentValue).toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الإهلاك المتراكم</p>
                    <p className="font-medium ltr-nums text-destructive">
                      {Number(asset.accumulatedDepreciation).toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">قيمة الخردة</p>
                    <p className="font-medium ltr-nums">
                      {Number(asset.salvageValue).toLocaleString()} ر.س
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">طريقة الإهلاك</p>
                    <p className="font-medium">القسط الثابت</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">العمر الإنتاجي</p>
                    <p className="font-medium">{asset.usefulLife} سنة</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warranty & Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  الضمان والصيانة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">انتهاء الضمان</p>
                    <p className="font-medium">
                      {new Date(asset.warrantyExpiry).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حالة الضمان</p>
                    <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                      ساري
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">آخر صيانة</p>
                    <p className="font-medium">
                      {new Date(asset.lastMaintenanceDate).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الصيانة القادمة</p>
                    <p className="font-medium text-warning">
                      {new Date(asset.nextMaintenanceDate).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سجل الصيانة</CardTitle>
                <Button className="gradient-energy">
                  <Wrench className="w-4 h-4 ml-2" />
                  أمر عمل جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الأمر</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الفني</TableHead>
                    <TableHead>التكلفة</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.orderNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={maintenanceTypeConfig[item.type].color}>
                          {maintenanceTypeConfig[item.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{item.technician}</TableCell>
                      <TableCell className="ltr-nums">{Number(item.cost).toLocaleString()} ر.س</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                          مكتمل
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Depreciation Tab */}
        <TabsContent value="depreciation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>جدول الإهلاك</CardTitle>
              <CardDescription>
                طريقة الإهلاك: القسط الثابت | معدل الإهلاك السنوي: {((1 / asset.usefulLife) * 100).toFixed(2)}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>السنة</TableHead>
                    <TableHead>القيمة الافتتاحية</TableHead>
                    <TableHead>الإهلاك السنوي</TableHead>
                    <TableHead>القيمة الختامية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depreciationSchedule.map((item) => (
                    <TableRow key={item.year}>
                      <TableCell className="font-medium">{item.year}</TableCell>
                      <TableCell className="ltr-nums">{Number(item.openingValue).toLocaleString()} ر.س</TableCell>
                      <TableCell className="ltr-nums text-destructive">
                        ({Number(item.depreciation).toLocaleString()}) ر.س
                      </TableCell>
                      <TableCell className="ltr-nums font-medium">
                        {Number(item.closingValue).toLocaleString()} ر.س
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحركات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>النوع</TableHead>
                    <TableHead>من</TableHead>
                    <TableHead>إلى</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>الموافقة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movementHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {item.type === "transfer" ? "نقل" : "فحص"}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.fromLocation}</TableCell>
                      <TableCell>{item.toLocation}</TableCell>
                      <TableCell>{new Date(item.date).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.approvedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>المستندات المرفقة</CardTitle>
                <Button className="gradient-energy">
                  <FileText className="w-4 h-4 ml-2" />
                  رفع مستند
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الملف</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحجم</TableHead>
                    <TableHead>تاريخ الرفع</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{new Date(doc.uploadDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
