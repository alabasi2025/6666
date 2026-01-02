import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Warehouse,
} from "lucide-react";

type StockBalanceProps = {
  businessId?: number;
};

export default function StockBalance({ businessId = 1 }: StockBalanceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const resolvedBusinessId = businessId ?? 1;

  // Fetch items with stock info
  const { data: items = [], isLoading } = trpc.inventory.items.list.useQuery({
    businessId: resolvedBusinessId,
  });

  // Fetch warehouses
  const { data: warehouses = [] } = trpc.inventory.warehouses.list.useQuery({
    businessId: resolvedBusinessId,
  });

  // Fetch stock balance
  const { data: stockBalance = [] } = trpc.inventory.stockBalances.list.useQuery({
    businessId: resolvedBusinessId,
    warehouseId: filterWarehouse !== "all" ? parseInt(filterWarehouse) : undefined,
  });

  // Calculate stock status
  const getStockStatus = (item: any) => {
    const currentQty = item.currentQuantity || 0;
    const minQty = item.minimumQuantity || 0;
    const maxQty = item.maximumQuantity || 100;

    if (currentQty <= 0) {
      return { status: "out", label: "نفذ", color: "bg-red-500", icon: AlertTriangle };
    } else if (currentQty <= minQty) {
      return { status: "low", label: "منخفض", color: "bg-yellow-500", icon: TrendingDown };
    } else if (currentQty >= maxQty * 0.9) {
      return { status: "high", label: "مرتفع", color: "bg-blue-500", icon: Package };
    }
    return { status: "normal", label: "طبيعي", color: "bg-green-500", icon: CheckCircle };
  };

  const filteredItems = (items as any[]).filter((item: any) => {
    const matchesSearch =
      item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    
    const status = getStockStatus(item);
    return matchesSearch && status.status === filterStatus;
  });

  // Stats
  const totalItems = items.length;
  const outOfStock = (items as any[]).filter((i: any) => (i.currentQuantity || 0) <= 0).length;
  const lowStock = (items as any[]).filter((i: any) => {
    const qty = i.currentQuantity || 0;
    const min = i.minimumQuantity || 0;
    return qty > 0 && qty <= min;
  }).length;
  const totalValue = items.reduce((sum: number, item: any) => {
    return sum + ((item.currentQuantity || 0) * (parseFloat(item.unitCost) || 0));
  }, 0);

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
            <Warehouse className="w-8 h-8 text-primary" />
            رصيد المخزون
          </h1>
          <p className="text-muted-foreground mt-1">
            متابعة أرصدة المخزون الحالية
          </p>
        </div>
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
                <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نفذ من المخزون</p>
                <p className="text-2xl font-bold">{outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مخزون منخفض</p>
                <p className="text-2xl font-bold">{lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(outOfStock > 0 || lowStock > 0) && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-medium">تنبيهات المخزون</p>
                <p className="text-sm text-muted-foreground">
                  يوجد {outOfStock} صنف نفذ من المخزون و {lowStock} صنف بمستوى منخفض
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>أرصدة الأصناف</CardTitle>
              <CardDescription>
                {filteredItems.length} صنف
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="المستودع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستودعات</SelectItem>
                  {(warehouses as any[]).map((warehouse: any) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="out">نفذ</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="normal">طبيعي</SelectItem>
                  <SelectItem value="high">مرتفع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرمز</TableHead>
                <TableHead>الصنف</TableHead>
                <TableHead>الكمية الحالية</TableHead>
                <TableHead>الحد الأدنى</TableHead>
                <TableHead>الحد الأقصى</TableHead>
                <TableHead>مستوى المخزون</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>القيمة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد أصناف
                  </TableCell>
                </TableRow>
              ) : (
                (filteredItems as any[]).map((item: any) => {
                  const status = getStockStatus(item);
                  const currentQty = item.currentQuantity || 0;
                  const maxQty = item.maximumQuantity || 100;
                  const percentage = Math.min((currentQty / maxQty) * 100, 100);
                  const value = currentQty * (parseFloat(item.unitCost) || 0);

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.nameAr}</p>
                          <p className="text-sm text-muted-foreground">{item.unit || "وحدة"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {currentQty.toLocaleString()}
                      </TableCell>
                      <TableCell>{item.minimumQuantity || 0}</TableCell>
                      <TableCell>{item.maximumQuantity || "-"}</TableCell>
                      <TableCell className="w-40">
                        <div className="space-y-1">
                          <Progress 
                            value={percentage} 
                            className={`h-2 ${
                              status.status === "out" ? "[&>div]:bg-red-500" :
                              status.status === "low" ? "[&>div]:bg-yellow-500" :
                              status.status === "high" ? "[&>div]:bg-blue-500" :
                              "[&>div]:bg-green-500"
                            }`}
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            {percentage.toFixed(0)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {value > 0 ? `${value.toLocaleString()} ر.س` : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
