import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Download,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Stock status mapping
const stockStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  in_stock: { label: "متوفر", color: "text-success", bgColor: "bg-success/10" },
  low_stock: { label: "منخفض", color: "text-warning", bgColor: "bg-warning/10" },
  out_of_stock: { label: "نفذ", color: "text-destructive", bgColor: "bg-destructive/10" },
  overstock: { label: "فائض", color: "text-primary", bgColor: "bg-primary/10" },
};

// Mock stock balance data
const mockStockBalance = [
  {
    id: 1,
    itemCode: "ITM-001",
    itemName: "كابل نحاس 16مم",
    category: "كابلات",
    unit: "متر",
    warehouse: "المستودع الرئيسي",
    location: "R-A-01",
    currentStock: 2500,
    minStock: 500,
    maxStock: 5000,
    reorderPoint: 750,
    avgCost: 45.50,
    totalValue: 113750.00,
    stockStatus: "in_stock",
    lastMovement: "2024-06-15",
    daysOfStock: 45,
  },
  {
    id: 2,
    itemCode: "ITM-002",
    itemName: "قاطع كهربائي 100A",
    category: "كهربائي",
    unit: "قطعة",
    warehouse: "مستودع قطع الغيار",
    location: "R-B-05",
    currentStock: 25,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    avgCost: 350.00,
    totalValue: 8750.00,
    stockStatus: "low_stock",
    lastMovement: "2024-06-15",
    daysOfStock: 12,
  },
  {
    id: 3,
    itemCode: "ITM-003",
    itemName: "زيت محولات",
    category: "مستهلكات",
    unit: "لتر",
    warehouse: "المستودع الرئيسي",
    location: "R-C-10",
    currentStock: 5000,
    minStock: 1000,
    maxStock: 10000,
    reorderPoint: 2000,
    avgCost: 12.00,
    totalValue: 60000.00,
    stockStatus: "in_stock",
    lastMovement: "2024-06-14",
    daysOfStock: 90,
  },
  {
    id: 4,
    itemCode: "ITM-004",
    itemName: "مفتاح ربط كهربائي",
    category: "أدوات",
    unit: "قطعة",
    warehouse: "مستودع قطع الغيار",
    location: "R-D-02",
    currentStock: 0,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    avgCost: 280.00,
    totalValue: 0,
    stockStatus: "out_of_stock",
    lastMovement: "2024-05-28",
    daysOfStock: 0,
  },
  {
    id: 5,
    itemCode: "ITM-005",
    itemName: "عازل حراري",
    category: "سلامة",
    unit: "متر مربع",
    warehouse: "المستودع الرئيسي",
    location: "R-E-08",
    currentStock: 1200,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    avgCost: 85.00,
    totalValue: 102000.00,
    stockStatus: "overstock",
    lastMovement: "2024-06-12",
    daysOfStock: 180,
  },
  {
    id: 6,
    itemCode: "ITM-006",
    itemName: "محول كهربائي 50KVA",
    category: "محولات",
    unit: "قطعة",
    warehouse: "المستودع الرئيسي",
    location: "R-F-01",
    currentStock: 8,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    avgCost: 15000.00,
    totalValue: 120000.00,
    stockStatus: "low_stock",
    lastMovement: "2024-06-10",
    daysOfStock: 30,
  },
];

// Stats
const stats = [
  { title: "إجمالي الأصناف", value: "2,925", icon: Package, color: "primary" },
  { title: "قيمة المخزون", value: "4.2M ر.س", icon: DollarSign, color: "success" },
  { title: "تحت الحد الأدنى", value: "45", icon: AlertTriangle, color: "destructive" },
  { title: "فوق الحد الأقصى", value: "12", icon: TrendingUp, color: "warning" },
];

export default function StockBalance() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const columns: Column<typeof mockStockBalance[0]>[] = [
    {
      key: "itemCode",
      title: "الصنف",
      render: (value, row) => (
        <div>
          <p className="font-medium">{row.itemName}</p>
          <p className="text-xs text-muted-foreground font-mono">{value}</p>
        </div>
      ),
    },
    {
      key: "category",
      title: "التصنيف",
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "warehouse",
      title: "المستودع",
      render: (value, row) => (
        <div>
          <p className="text-sm">{value}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.location}</p>
        </div>
      ),
    },
    {
      key: "currentStock",
      title: "الرصيد الحالي",
      render: (value, row) => {
        const percentage = row.maxStock > 0 ? (value / row.maxStock) * 100 : 0;
        const statusInfo = stockStatusMap[row.stockStatus];
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={cn("font-bold ltr-nums", statusInfo?.color)}>{value.toLocaleString()}</span>
              <span className="text-muted-foreground">{row.unit}</span>
            </div>
            <Progress value={percentage} className={cn(
              "h-2",
              row.stockStatus === "out_of_stock" && "[&>div]:bg-destructive",
              row.stockStatus === "low_stock" && "[&>div]:bg-warning",
              row.stockStatus === "in_stock" && "[&>div]:bg-success",
              row.stockStatus === "overstock" && "[&>div]:bg-primary"
            )} />
          </div>
        );
      },
    },
    {
      key: "minStock",
      title: "الحدود",
      render: (value, row) => (
        <div className="text-xs">
          <p><span className="text-muted-foreground">أدنى:</span> <span className="ltr-nums">{value.toLocaleString()}</span></p>
          <p><span className="text-muted-foreground">أقصى:</span> <span className="ltr-nums">{row.maxStock.toLocaleString()}</span></p>
        </div>
      ),
    },
    {
      key: "avgCost",
      title: "متوسط التكلفة",
      render: (value) => (
        <span className="font-medium ltr-nums">{value.toLocaleString()} ر.س</span>
      ),
    },
    {
      key: "totalValue",
      title: "القيمة الإجمالية",
      render: (value) => (
        <span className="font-bold text-primary ltr-nums">{value.toLocaleString()} ر.س</span>
      ),
    },
    {
      key: "daysOfStock",
      title: "أيام المخزون",
      render: (value, row) => (
        <div className={cn(
          "text-center font-medium ltr-nums",
          value === 0 && "text-destructive",
          value > 0 && value < 30 && "text-warning",
          value >= 30 && value < 90 && "text-success",
          value >= 90 && "text-primary"
        )}>
          {value} يوم
        </div>
      ),
    },
    {
      key: "stockStatus",
      title: "الحالة",
      render: (value) => {
        const statusInfo = stockStatusMap[value];
        return (
          <Badge className={cn(statusInfo?.bgColor, statusInfo?.color, "border-0")}>
            {statusInfo?.label}
          </Badge>
        );
      },
    },
  ];

  // Filter data based on selections
  const filteredData = mockStockBalance.filter(item => {
    if (selectedWarehouse !== "all" && item.warehouse !== selectedWarehouse) return false;
    if (selectedStatus !== "all" && item.stockStatus !== selectedStatus) return false;
    return true;
  });

  // Calculate totals
  const totalValue = filteredData.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = filteredData.filter(item => item.stockStatus === "low_stock").length;
  const outOfStockCount = filteredData.filter(item => item.stockStatus === "out_of_stock").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
            destructive: "text-destructive bg-destructive/10",
          };

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصفية النتائج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع المستودعات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستودعات</SelectItem>
                  <SelectItem value="المستودع الرئيسي">المستودع الرئيسي</SelectItem>
                  <SelectItem value="مستودع قطع الغيار">مستودع قطع الغيار</SelectItem>
                  <SelectItem value="مستودع المحطة الشمالية">مستودع المحطة الشمالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="in_stock">متوفر</SelectItem>
                  <SelectItem value="low_stock">منخفض</SelectItem>
                  <SelectItem value="out_of_stock">نفذ</SelectItem>
                  <SelectItem value="overstock">فائض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => toast.info("جاري تصدير التقرير...")}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيمة المخزون المعروض</p>
                <p className="text-2xl font-bold text-primary ltr-nums">{totalValue.toLocaleString()} ر.س</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أصناف تحت الحد الأدنى</p>
                <p className="text-2xl font-bold text-warning ltr-nums">{lowStockCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-warning/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">أصناف نفذت</p>
                <p className="text-2xl font-bold text-destructive ltr-nums">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        title="أرصدة المخزون"
        description="عرض أرصدة جميع الأصناف في المستودعات"
        searchPlaceholder="بحث بالاسم أو الرمز..."
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد أصناف"
      />
    </div>
  );
}
