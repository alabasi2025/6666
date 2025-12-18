import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  TrendingDown,
  Calculator,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Play,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock depreciation data
const mockDepreciation = [
  {
    id: 1,
    assetCode: "AST-000001",
    assetName: "محول كهربائي 500 كيلو فولت",
    category: "محولات",
    acquisitionDate: "2020-01-15",
    acquisitionCost: 5000000,
    usefulLife: 25,
    depreciationMethod: "straight_line",
    depreciationRate: 4,
    accumulatedDepreciation: 800000,
    bookValue: 4200000,
    monthlyDepreciation: 16666.67,
    yearsRemaining: 21,
    depreciationPercent: 16,
  },
  {
    id: 2,
    assetCode: "AST-000002",
    assetName: "مولد ديزل احتياطي 1000 كيلو واط",
    category: "مولدات",
    acquisitionDate: "2019-06-20",
    acquisitionCost: 3500000,
    usefulLife: 20,
    depreciationMethod: "straight_line",
    depreciationRate: 5,
    accumulatedDepreciation: 875000,
    bookValue: 2625000,
    monthlyDepreciation: 14583.33,
    yearsRemaining: 15,
    depreciationPercent: 25,
  },
  {
    id: 3,
    assetCode: "AST-000003",
    assetName: "لوحة توزيع رئيسية",
    category: "لوحات كهربائية",
    acquisitionDate: "2018-03-10",
    acquisitionCost: 850000,
    usefulLife: 15,
    depreciationMethod: "straight_line",
    depreciationRate: 6.67,
    accumulatedDepreciation: 340000,
    bookValue: 510000,
    monthlyDepreciation: 4722.22,
    yearsRemaining: 9,
    depreciationPercent: 40,
  },
  {
    id: 4,
    assetCode: "AST-000005",
    assetName: "قاطع دائرة 220 فولت",
    category: "قواطع",
    acquisitionDate: "2015-08-25",
    acquisitionCost: 120000,
    usefulLife: 10,
    depreciationMethod: "straight_line",
    depreciationRate: 10,
    accumulatedDepreciation: 108000,
    bookValue: 12000,
    monthlyDepreciation: 1000,
    yearsRemaining: 1,
    depreciationPercent: 90,
  },
  {
    id: 5,
    assetCode: "AST-000007",
    assetName: "محول جهد متوسط",
    category: "محولات",
    acquisitionDate: "2021-11-01",
    acquisitionCost: 2800000,
    usefulLife: 25,
    depreciationMethod: "straight_line",
    depreciationRate: 4,
    accumulatedDepreciation: 336000,
    bookValue: 2464000,
    monthlyDepreciation: 9333.33,
    yearsRemaining: 22,
    depreciationPercent: 12,
  },
];

// Mock depreciation schedule
const mockSchedule = [
  { period: "يناير 2024", amount: 46305.55, accumulated: 2459000, bookValue: 9841000 },
  { period: "فبراير 2024", amount: 46305.55, accumulated: 2505305.55, bookValue: 9794694.45 },
  { period: "مارس 2024", amount: 46305.55, accumulated: 2551611.1, bookValue: 9748388.9 },
  { period: "أبريل 2024", amount: 46305.55, accumulated: 2597916.65, bookValue: 9702083.35 },
  { period: "مايو 2024", amount: 46305.55, accumulated: 2644222.2, bookValue: 9655777.8 },
  { period: "يونيو 2024", amount: 46305.55, accumulated: 2690527.75, bookValue: 9609472.25 },
];

// Stats
const stats = [
  { 
    title: "إجمالي تكلفة الأصول", 
    value: "12.3M", 
    subValue: "ر.س",
    icon: DollarSign, 
    color: "primary" 
  },
  { 
    title: "مجمع الإهلاك", 
    value: "2.46M", 
    subValue: "ر.س",
    icon: TrendingDown, 
    color: "warning" 
  },
  { 
    title: "صافي القيمة الدفترية", 
    value: "9.84M", 
    subValue: "ر.س",
    icon: Calculator, 
    color: "success" 
  },
  { 
    title: "إهلاك الشهر الحالي", 
    value: "46.3K", 
    subValue: "ر.س",
    icon: Calendar, 
    color: "accent" 
  },
];

export default function Depreciation() {
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2024-06");

  const columns: Column<typeof mockDepreciation[0]>[] = [
    {
      key: "assetCode",
      title: "رمز الأصل",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "assetName",
      title: "اسم الأصل",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      key: "acquisitionCost",
      title: "تكلفة الاقتناء",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums">
          {value.toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "accumulatedDepreciation",
      title: "مجمع الإهلاك",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums text-warning">
          {value.toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "bookValue",
      title: "القيمة الدفترية",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums text-success">
          {value.toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "depreciationPercent",
      title: "نسبة الإهلاك",
      align: "center",
      render: (value, row) => (
        <div className="w-full max-w-[120px]">
          <div className="flex justify-between text-xs mb-1">
            <span>{value}%</span>
            <span className="text-muted-foreground">{row.yearsRemaining} سنة متبقية</span>
          </div>
          <Progress 
            value={value} 
            className={cn(
              "h-2",
              value >= 90 ? "[&>div]:bg-destructive" : 
              value >= 70 ? "[&>div]:bg-warning" : 
              "[&>div]:bg-success"
            )}
          />
        </div>
      ),
    },
    {
      key: "monthlyDepreciation",
      title: "الإهلاك الشهري",
      align: "right",
      render: (value) => (
        <span className="font-mono ltr-nums">
          {value.toLocaleString()} ر.س
        </span>
      ),
    },
    {
      key: "depreciationMethod",
      title: "طريقة الإهلاك",
      render: (value) => (
        <Badge variant="outline">
          {value === "straight_line" ? "القسط الثابت" : "القسط المتناقص"}
        </Badge>
      ),
    },
  ];

  const handleViewSchedule = (asset: any) => {
    setSelectedAsset(asset);
    setShowScheduleDialog(true);
  };

  const handleRunDepreciation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`تم تشغيل الإهلاك لفترة ${selectedPeriod}`);
    setShowRunDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
            accent: "text-accent bg-accent/10",
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
                    <p className="text-2xl font-bold ltr-nums">
                      {stat.value}
                      <span className="text-sm font-normal text-muted-foreground mr-1">{stat.subValue}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            عمليات الإهلاك
          </CardTitle>
          <CardDescription>تشغيل وإدارة عمليات الإهلاك الدورية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button className="gradient-energy" onClick={() => setShowRunDialog(true)}>
              <Play className="w-4 h-4 ml-2" />
              تشغيل الإهلاك الشهري
            </Button>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 ml-2" />
              تقرير الإهلاك
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 ml-2" />
              جدول الإهلاك السنوي
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Schedule Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            جدول الإهلاك - 2024
          </CardTitle>
          <CardDescription>ملخص الإهلاك الشهري للسنة الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">الفترة</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">مبلغ الإهلاك</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">مجمع الإهلاك</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">القيمة الدفترية</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {mockSchedule.map((row, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{row.period}</td>
                    <td className="py-3 px-4 font-mono ltr-nums">{row.amount.toLocaleString()} ر.س</td>
                    <td className="py-3 px-4 font-mono ltr-nums text-warning">{row.accumulated.toLocaleString()} ر.س</td>
                    <td className="py-3 px-4 font-mono ltr-nums text-success">{row.bookValue.toLocaleString()} ر.س</td>
                    <td className="py-3 px-4 text-center">
                      {index < 5 ? (
                        <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          مكتمل
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                          <AlertTriangle className="w-3 h-3 ml-1" />
                          قيد الانتظار
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        data={mockDepreciation}
        columns={columns}
        title="تفاصيل إهلاك الأصول"
        description="عرض تفصيلي لإهلاك كل أصل"
        searchPlaceholder="بحث برمز أو اسم الأصل..."
        onView={handleViewSchedule}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد أصول مسجلة"
      />

      {/* Run Depreciation Dialog */}
      <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              تشغيل الإهلاك الشهري
            </DialogTitle>
            <DialogDescription>
              حدد الفترة المحاسبية لتشغيل عملية الإهلاك
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRunDepreciation}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="period">الفترة المحاسبية</Label>
                <Input
                  id="period"
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              </div>
              <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد الأصول</span>
                  <span className="font-medium">5 أصول</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي الإهلاك المتوقع</span>
                  <span className="font-medium font-mono ltr-nums">46,305.55 ر.س</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-sm">سيتم إنشاء قيود محاسبية تلقائياً</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRunDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                <Play className="w-4 h-4 ml-2" />
                تشغيل الإهلاك
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asset Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جدول إهلاك الأصل</DialogTitle>
            <DialogDescription>
              {selectedAsset?.assetName} ({selectedAsset?.assetCode})
            </DialogDescription>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">تكلفة الاقتناء</p>
                  <p className="font-bold font-mono ltr-nums">{selectedAsset.acquisitionCost.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">مجمع الإهلاك</p>
                  <p className="font-bold font-mono ltr-nums text-warning">{selectedAsset.accumulatedDepreciation.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">القيمة الدفترية</p>
                  <p className="font-bold font-mono ltr-nums text-success">{selectedAsset.bookValue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">السنوات المتبقية</p>
                  <p className="font-bold">{selectedAsset.yearsRemaining} سنة</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">نسبة الإهلاك</p>
                <Progress value={selectedAsset.depreciationPercent} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1 text-left ltr-nums">{selectedAsset.depreciationPercent}%</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy">
              <BarChart3 className="w-4 h-4 ml-2" />
              تصدير الجدول
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
