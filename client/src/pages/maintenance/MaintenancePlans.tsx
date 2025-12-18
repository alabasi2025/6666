import { useState } from "react";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  CalendarDays,
  Repeat,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const planStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  paused: { label: "متوقف", variant: "warning" },
  draft: { label: "مسودة", variant: "secondary" },
  completed: { label: "مكتمل", variant: "default" },
};

// Frequency mapping
const frequencyMap: Record<string, { label: string; color: string }> = {
  daily: { label: "يومي", color: "bg-destructive/20 text-destructive" },
  weekly: { label: "أسبوعي", color: "bg-warning/20 text-warning" },
  monthly: { label: "شهري", color: "bg-primary/20 text-primary" },
  quarterly: { label: "ربع سنوي", color: "bg-success/20 text-success" },
  semi_annual: { label: "نصف سنوي", color: "bg-accent/20 text-accent" },
  annual: { label: "سنوي", color: "bg-muted text-muted-foreground" },
};

// Mock maintenance plans
const mockPlans = [
  {
    id: 1,
    code: "PM-001",
    name: "صيانة دورية للمحولات",
    description: "فحص شامل للمحولات يشمل الزيت والعوازل ونظام التبريد",
    type: "preventive",
    frequency: "monthly",
    status: "active",
    assetCategory: "محولات",
    assetsCount: 15,
    lastExecution: "2024-06-01",
    nextExecution: "2024-07-01",
    estimatedDuration: 4,
    estimatedCost: 3000,
    tasksCount: 8,
    createdBy: "مدير الصيانة",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    code: "PM-002",
    name: "فحص المولدات الاحتياطية",
    description: "اختبار تشغيل وفحص مستوى الوقود والزيت",
    type: "preventive",
    frequency: "weekly",
    status: "active",
    assetCategory: "مولدات",
    assetsCount: 5,
    lastExecution: "2024-06-10",
    nextExecution: "2024-06-17",
    estimatedDuration: 2,
    estimatedCost: 500,
    tasksCount: 5,
    createdBy: "مدير الصيانة",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    code: "PM-003",
    name: "صيانة لوحات التوزيع",
    description: "فحص القواطع والوصلات والتأريض",
    type: "preventive",
    frequency: "quarterly",
    status: "active",
    assetCategory: "لوحات توزيع",
    assetsCount: 25,
    lastExecution: "2024-04-01",
    nextExecution: "2024-07-01",
    estimatedDuration: 6,
    estimatedCost: 5000,
    tasksCount: 12,
    createdBy: "مدير الصيانة",
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    code: "PM-004",
    name: "فحص أنظمة الإنذار",
    description: "اختبار أجهزة الإنذار والكشف عن الحريق",
    type: "preventive",
    frequency: "semi_annual",
    status: "paused",
    assetCategory: "أنظمة السلامة",
    assetsCount: 50,
    lastExecution: "2024-01-15",
    nextExecution: "2024-07-15",
    estimatedDuration: 8,
    estimatedCost: 8000,
    tasksCount: 15,
    createdBy: "مدير السلامة",
    createdAt: "2024-01-01",
  },
  {
    id: 5,
    code: "PM-005",
    name: "صيانة سنوية شاملة",
    description: "صيانة سنوية شاملة لجميع المعدات الرئيسية",
    type: "preventive",
    frequency: "annual",
    status: "draft",
    assetCategory: "جميع الأصول",
    assetsCount: 200,
    lastExecution: null,
    nextExecution: "2025-01-01",
    estimatedDuration: 40,
    estimatedCost: 50000,
    tasksCount: 50,
    createdBy: "مدير الصيانة",
    createdAt: "2024-06-01",
  },
];

// Stats
const stats = [
  { title: "الخطط النشطة", value: "12", icon: Play, color: "success" },
  { title: "مجدولة هذا الأسبوع", value: "8", icon: Calendar, color: "primary" },
  { title: "متأخرة", value: "2", icon: AlertTriangle, color: "destructive" },
  { title: "معدل الالتزام", value: "94%", icon: CheckCircle, color: "success" },
];

export default function MaintenancePlans() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const columns: Column<typeof mockPlans[0]>[] = [
    {
      key: "code",
      title: "الرمز",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "name",
      title: "اسم الخطة",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.description}</p>
        </div>
      ),
    },
    {
      key: "frequency",
      title: "التكرار",
      render: (value) => (
        <Badge variant="outline" className={cn("gap-1", frequencyMap[value]?.color)}>
          <Repeat className="w-3 h-3" />
          {frequencyMap[value]?.label}
        </Badge>
      ),
    },
    {
      key: "assetCategory",
      title: "فئة الأصول",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm">{value}</p>
            <p className="text-xs text-muted-foreground">{row.assetsCount} أصل</p>
          </div>
        </div>
      ),
    },
    {
      key: "lastExecution",
      title: "آخر تنفيذ",
      render: (value) => (
        value ? (
          <span className="text-sm">{new Date(value).toLocaleDateString("ar-SA")}</span>
        ) : (
          <span className="text-muted-foreground text-sm">لم ينفذ بعد</span>
        )
      ),
    },
    {
      key: "nextExecution",
      title: "التنفيذ القادم",
      render: (value, row) => {
        const nextDate = new Date(value);
        const today = new Date();
        const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0 && row.status === "active";
        const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
        return (
          <div className="flex items-center gap-1">
            <CalendarDays className={cn(
              "w-3 h-3",
              isOverdue ? "text-destructive" : isUpcoming ? "text-warning" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm",
              isOverdue && "text-destructive font-medium",
              isUpcoming && "text-warning"
            )}>
              {nextDate.toLocaleDateString("ar-SA")}
            </span>
          </div>
        );
      },
    },
    {
      key: "estimatedDuration",
      title: "المدة المقدرة",
      render: (value) => (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">{value} ساعات</span>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={planStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedPlan(null);
    setShowDialog(true);
  };

  const handleView = (plan: any) => {
    setSelectedPlan(plan);
    setShowScheduleDialog(true);
  };

  const handleEdit = (plan: any) => {
    setSelectedPlan(plan);
    setShowDialog(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan) {
      toast.success("تم تحديث خطة الصيانة بنجاح");
    } else {
      toast.success("تم إنشاء خطة الصيانة بنجاح");
    }
    setShowDialog(false);
    setSelectedPlan(null);
  };

  const handleToggleStatus = (plan: any) => {
    const newStatus = plan.status === "active" ? "paused" : "active";
    toast.success(`تم ${newStatus === "active" ? "تفعيل" : "إيقاف"} خطة الصيانة`);
  };

  const handleExecuteNow = (plan: any) => {
    toast.success("تم إنشاء أوامر العمل للتنفيذ الفوري");
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

      {/* Data Table */}
      <DataTable
        data={mockPlans}
        columns={columns}
        title="خطط الصيانة الدورية"
        description="إدارة خطط الصيانة الوقائية والدورية"
        searchPlaceholder="بحث بالرمز أو الاسم..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد خطط صيانة"
/>

      {/* Add/Edit Plan Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "تعديل خطة صيانة" : "إنشاء خطة صيانة جديدة"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan
                ? "قم بتعديل بيانات خطة الصيانة"
                : "أدخل بيانات خطة الصيانة الجديدة"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الخطة *</Label>
                <Input
                  id="code"
                  placeholder="PM-XXX"
                  defaultValue={selectedPlan?.code}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">اسم الخطة *</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسم الخطة"
                  defaultValue={selectedPlan?.name}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف تفصيلي للخطة"
                  defaultValue={selectedPlan?.description}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">التكرار *</Label>
                <Select defaultValue={selectedPlan?.frequency || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التكرار" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyMap).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCategory">فئة الأصول *</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transformers">محولات</SelectItem>
                    <SelectItem value="generators">مولدات</SelectItem>
                    <SelectItem value="panels">لوحات توزيع</SelectItem>
                    <SelectItem value="cables">كابلات</SelectItem>
                    <SelectItem value="safety">أنظمة السلامة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء *</Label>
                <Input
                  id="startDate"
                  type="date"
                  defaultValue={selectedPlan?.nextExecution}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team">فريق العمل</Label>
                <Select defaultValue="">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفريق" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">فريق الصيانة الكهربائية</SelectItem>
                    <SelectItem value="2">فريق الصيانة الميكانيكية</SelectItem>
                    <SelectItem value="3">فريق الفحص والاختبار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">المدة المقدرة (ساعات)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  placeholder="0"
                  defaultValue={selectedPlan?.estimatedDuration}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">التكلفة المقدرة (ر.س)</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  placeholder="0"
                  defaultValue={selectedPlan?.estimatedCost}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoGenerate">إنشاء أوامر العمل تلقائياً</Label>
                  <Switch id="autoGenerate" defaultChecked />
                </div>
                <p className="text-xs text-muted-foreground">
                  سيتم إنشاء أوامر العمل تلقائياً حسب الجدول المحدد
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedPlan ? "حفظ التغييرات" : "إنشاء الخطة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جدول التنفيذ - {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              عرض جدول التنفيذ القادم للخطة
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">آخر تنفيذ</p>
                    <p className="text-lg font-medium">
                      {selectedPlan?.lastExecution
                        ? new Date(selectedPlan.lastExecution).toLocaleDateString("ar-SA")
                        : "لم ينفذ بعد"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">التنفيذ القادم</p>
                    <p className="text-lg font-medium text-primary">
                      {selectedPlan?.nextExecution
                        ? new Date(selectedPlan.nextExecution).toLocaleDateString("ar-SA")
                        : "-"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">التنفيذات القادمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map((i) => {
                      const baseDate = selectedPlan?.nextExecution
                        ? new Date(selectedPlan.nextExecution)
                        : new Date();
                      const freq = selectedPlan?.frequency || "monthly";
                      const multiplierMap: Record<string, number> = {
                        daily: 1,
                        weekly: 7,
                        monthly: 30,
                        quarterly: 90,
                        semi_annual: 180,
                        annual: 365,
                      };
                      const multiplier = multiplierMap[freq] || 30;
                      const nextDate = new Date(baseDate.getTime() + i * multiplier * 24 * 60 * 60 * 1000);
                      return (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{nextDate.toLocaleDateString("ar-SA")}</span>
                          </div>
                          <Badge variant="outline">
                            {frequencyMap[selectedPlan?.frequency || "monthly"]?.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              إغلاق
            </Button>
            <Button className="gradient-energy" onClick={() => { handleExecuteNow(selectedPlan); setShowScheduleDialog(false); }}>
              <RefreshCw className="w-4 h-4 ml-2" />
              تنفيذ الآن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
