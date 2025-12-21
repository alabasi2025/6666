import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  Calculator,
  Search,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Depreciation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Fetch assets with depreciation info
  const { data: assets = [], isLoading } = trpc.assets.list.useQuery({
    businessId: 1,
  });

  // Fetch depreciation history
  const { data: depreciationHistory = [] } = trpc.assets.depreciation.getHistory.useQuery({
    businessId: 1,
    year: parseInt(selectedYear),
  });

  // Calculate depreciation mutation
  const calculateMutation = trpc.assets.depreciation.calculate.useMutation({
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [["assets"]] });
      toast({ 
        title: "تم حساب الإهلاك بنجاح",
        description: `تم حساب الإهلاك لـ ${result.processedCount || 0} أصل`
      });
      setShowCalculateDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Filter assets that have depreciation
  const depreciableAssets = assets.filter((asset: any) => 
    asset.purchaseCost && asset.usefulLife && asset.status === "active"
  );

  const filteredAssets = depreciableAssets.filter((asset: any) =>
    asset.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalPurchaseCost = depreciableAssets.reduce((sum: number, asset: any) => 
    sum + (parseFloat(asset.purchaseCost) || 0), 0
  );
  const totalCurrentValue = depreciableAssets.reduce((sum: number, asset: any) => 
    sum + (parseFloat(asset.currentValue) || 0), 0
  );
  const totalAccumulatedDepreciation = depreciableAssets.reduce((sum: number, asset: any) => 
    sum + (parseFloat(asset.accumulatedDepreciation) || 0), 0
  );

  const handleCalculateDepreciation = () => {
    calculateMutation.mutate({
      businessId: 1,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingDown className="w-8 h-8 text-primary" />
            إدارة الإهلاك
          </h1>
          <p className="text-muted-foreground mt-1">
            حساب ومتابعة إهلاك الأصول الثابتة
          </p>
        </div>
        <Button onClick={() => setShowCalculateDialog(true)} className="gradient-energy">
          <Calculator className="w-4 h-4 ml-2" />
          حساب الإهلاك
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الأصول القابلة للإهلاك</p>
                <p className="text-2xl font-bold">{depreciableAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي تكلفة الشراء</p>
                <p className="text-2xl font-bold">{totalPurchaseCost.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القيمة الحالية</p>
                <p className="text-2xl font-bold">{totalCurrentValue.toLocaleString()} ر.س</p>
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
                <p className="text-2xl font-bold">{totalAccumulatedDepreciation.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الأصول القابلة للإهلاك</CardTitle>
              <CardDescription>
                {filteredAssets.length} أصل
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرمز</TableHead>
                <TableHead>اسم الأصل</TableHead>
                <TableHead>تكلفة الشراء</TableHead>
                <TableHead>القيمة الحالية</TableHead>
                <TableHead>مجمع الإهلاك</TableHead>
                <TableHead>العمر الإنتاجي</TableHead>
                <TableHead>طريقة الإهلاك</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد أصول قابلة للإهلاك
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset: any) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono">{asset.code}</TableCell>
                    <TableCell className="font-medium">{asset.nameAr}</TableCell>
                    <TableCell>
                      {asset.purchaseCost ? `${parseFloat(asset.purchaseCost).toLocaleString()} ر.س` : "-"}
                    </TableCell>
                    <TableCell>
                      {asset.currentValue ? `${parseFloat(asset.currentValue).toLocaleString()} ر.س` : "-"}
                    </TableCell>
                    <TableCell>
                      {asset.accumulatedDepreciation ? `${parseFloat(asset.accumulatedDepreciation).toLocaleString()} ر.س` : "0 ر.س"}
                    </TableCell>
                    <TableCell>{asset.usefulLife ? `${asset.usefulLife} سنة` : "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {asset.depreciationMethod === "straight_line" && "القسط الثابت"}
                        {asset.depreciationMethod === "declining_balance" && "القسط المتناقص"}
                        {asset.depreciationMethod === "units_of_production" && "وحدات الإنتاج"}
                        {!asset.depreciationMethod && "غير محدد"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Depreciation History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>سجل الإهلاك</CardTitle>
              <CardDescription>تاريخ عمليات الإهلاك</CardDescription>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الأصل</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>مبلغ الإهلاك</TableHead>
                <TableHead>القيمة الدفترية</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depreciationHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    لا يوجد سجل إهلاك لهذه السنة
                  </TableCell>
                </TableRow>
              ) : (
                depreciationHistory.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{record.asset?.nameAr || "-"}</p>
                        <p className="text-sm text-muted-foreground">{record.asset?.code}</p>
                      </div>
                    </TableCell>
                    <TableCell>{record.period?.name || "-"}</TableCell>
                    <TableCell>
                      {record.amount ? `${parseFloat(record.amount).toLocaleString()} ر.س` : "-"}
                    </TableCell>
                    <TableCell>
                      {record.bookValue ? `${parseFloat(record.bookValue).toLocaleString()} ر.س` : "-"}
                    </TableCell>
                    <TableCell>
                      {record.createdAt
                        ? format(new Date(record.createdAt), "yyyy/MM/dd", { locale: ar })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Calculate Depreciation Dialog */}
      <Dialog open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              حساب الإهلاك
            </DialogTitle>
            <DialogDescription>
              سيتم حساب الإهلاك لجميع الأصول النشطة القابلة للإهلاك
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>عدد الأصول:</strong> {depreciableAssets.length} أصل
              </p>
              <p className="text-sm">
                <strong>إجمالي القيمة:</strong> {totalCurrentValue.toLocaleString()} ر.س
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalculateDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCalculateDepreciation}
              className="gradient-energy"
              disabled={calculateMutation.isPending}
            >
              {calculateMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 ml-2" />
              )}
              تنفيذ الحساب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
