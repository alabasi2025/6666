import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Package,
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  FileText,
  ArrowRightLeft,
  TrendingDown,
  Loader2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  maintenance: "bg-yellow-500",
  disposed: "bg-gray-500",
  transferred: "bg-blue-500",
  idle: "bg-orange-500",
};

const statusLabels: Record<string, string> = {
  active: "نشط",
  maintenance: "قيد الصيانة",
  disposed: "مستبعد",
  transferred: "منقول",
  idle: "خامل",
};

interface AssetDetailsProps {
  assetId?: number;
}

export default function AssetDetails({ assetId }: AssetDetailsProps) {
  const [location, setLocation] = useLocation();
  
  // Extract id from URL if not passed as prop
  const id = assetId || parseInt(location.split('/').pop() || '0');

  // Fetch asset details
  const { data: asset, isLoading } = trpc.assets.getById.useQuery({
    id: id,
  });

  // Fetch movements for this asset
  const { data: movements = [] } = trpc.assets.movements.list.useQuery({
    assetId: id,
  });

  // Fetch depreciation history
  const { data: depreciationHistory = [] } = trpc.assets.depreciation.getHistory.useQuery({
    assetId: id,
  });

  if (isLoading) {
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
              {asset.nameAr}
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">{asset.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[asset.status || "active"]} text-white`}>
            {statusLabels[asset.status || "active"]}
          </Badge>
          <Button variant="outline" onClick={() => setLocation(`/dashboard/assets/edit/${asset.id}`)}>
            <Pencil className="w-4 h-4 ml-2" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تكلفة الشراء</p>
                <p className="text-2xl font-bold">
                  {asset.purchaseCost ? `${parseFloat(asset.purchaseCost).toLocaleString()} ر.س` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">القيمة الحالية</p>
                <p className="text-2xl font-bold">
                  {asset.currentValue ? `${parseFloat(asset.currentValue).toLocaleString()} ر.س` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مجمع الإهلاك</p>
                <p className="text-2xl font-bold">
                  {asset.accumulatedDepreciation ? `${parseFloat(asset.accumulatedDepreciation).toLocaleString()} ر.س` : "0 ر.س"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العمر الإنتاجي</p>
                <p className="text-2xl font-bold">
                  {asset.usefulLife ? `${asset.usefulLife} سنة` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <FileText className="w-4 h-4 ml-2" />
            المعلومات الأساسية
          </TabsTrigger>
          <TabsTrigger value="movements">
            <ArrowRightLeft className="w-4 h-4 ml-2" />
            الحركات
          </TabsTrigger>
          <TabsTrigger value="depreciation">
            <TrendingDown className="w-4 h-4 ml-2" />
            الإهلاك
          </TabsTrigger>
          <TabsTrigger value="specs">
            <Settings className="w-4 h-4 ml-2" />
            المواصفات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">الاسم بالإنجليزية</p>
                  <p className="font-medium">{asset.nameEn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الفئة</p>
                  <p className="font-medium">{asset.category?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المحطة</p>
                  <p className="font-medium">{asset.station?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الرقم التسلسلي</p>
                  <p className="font-medium font-mono">{asset.serialNumber || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الشركة المصنعة</p>
                  <p className="font-medium">{asset.manufacturer || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الموديل</p>
                  <p className="font-medium">{asset.model || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الشراء</p>
                  <p className="font-medium">
                    {asset.purchaseDate
                      ? format(new Date(asset.purchaseDate), "yyyy/MM/dd", { locale: ar })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ التشغيل</p>
                  <p className="font-medium">
                    {asset.commissionDate
                      ? format(new Date(asset.commissionDate), "yyyy/MM/dd", { locale: ar })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">انتهاء الضمان</p>
                  <p className="font-medium">
                    {asset.warrantyExpiry
                      ? format(new Date(asset.warrantyExpiry), "yyyy/MM/dd", { locale: ar })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الموقع</p>
                  <p className="font-medium">{asset.location || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طريقة الإهلاك</p>
                  <p className="font-medium">
                    {asset.depreciationMethod === "straight_line" && "القسط الثابت"}
                    {asset.depreciationMethod === "declining_balance" && "القسط المتناقص"}
                    {asset.depreciationMethod === "units_of_production" && "وحدات الإنتاج"}
                    {!asset.depreciationMethod && "-"}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="font-medium">{asset.description || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحركات</CardTitle>
              <CardDescription>جميع حركات الأصل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>نوع الحركة</TableHead>
                    <TableHead>من</TableHead>
                    <TableHead>إلى</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا توجد حركات مسجلة
                      </TableCell>
                    </TableRow>
                  ) : (
                    movements.map((movement: any) => (
                      <TableRow key={movement.id}>
                        <TableCell>
                          {movement.movementDate
                            ? format(new Date(movement.movementDate), "yyyy/MM/dd")
                            : "-"}
                        </TableCell>
                        <TableCell>{movement.movementType}</TableCell>
                        <TableCell>{movement.fromStation?.nameAr || "-"}</TableCell>
                        <TableCell>{movement.toStation?.nameAr || "-"}</TableCell>
                        <TableCell>
                          {movement.amount ? `${parseFloat(movement.amount).toLocaleString()} ر.س` : "-"}
                        </TableCell>
                        <TableCell>{movement.description || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation">
          <Card>
            <CardHeader>
              <CardTitle>سجل الإهلاك</CardTitle>
              <CardDescription>تاريخ إهلاك الأصل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفترة</TableHead>
                    <TableHead>مبلغ الإهلاك</TableHead>
                    <TableHead>القيمة الدفترية</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depreciationHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        لا يوجد سجل إهلاك
                      </TableCell>
                    </TableRow>
                  ) : (
                    depreciationHistory.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.period?.name || "-"}</TableCell>
                        <TableCell>
                          {record.amount ? `${parseFloat(record.amount).toLocaleString()} ر.س` : "-"}
                        </TableCell>
                        <TableCell>
                          {record.bookValue ? `${parseFloat(record.bookValue).toLocaleString()} ر.س` : "-"}
                        </TableCell>
                        <TableCell>
                          {record.createdAt
                            ? format(new Date(record.createdAt), "yyyy/MM/dd")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs">
          <Card>
            <CardHeader>
              <CardTitle>المواصفات الفنية</CardTitle>
            </CardHeader>
            <CardContent>
              {asset.specifications ? (
                <pre className="bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(asset.specifications, null, 2)}
                </pre>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  لا توجد مواصفات فنية مسجلة
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
