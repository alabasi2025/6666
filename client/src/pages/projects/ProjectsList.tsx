import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FolderKanban, Plus, Search, Filter, Calendar, Users,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  Play, MoreVertical, Eye, Edit, Trash2, BarChart3,
  TrendingUp, Target, Briefcase, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

// Project Status Badge
function ProjectStatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
    planning: { label: "تخطيط", color: "bg-blue-500/20 text-blue-500", icon: Target },
    in_progress: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary", icon: Play },
    on_hold: { label: "متوقف", color: "bg-warning/20 text-warning", icon: Pause },
    completed: { label: "مكتمل", color: "bg-success/20 text-success", icon: CheckCircle },
    cancelled: { label: "ملغي", color: "bg-destructive/20 text-destructive", icon: AlertTriangle },
  };

  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500", icon: FolderKanban };
  const Icon = config.icon;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// Priority Badge
function PriorityBadge({ priority }: { priority: string }) {
  const priorityConfig: Record<string, { label: string; color: string }> = {
    critical: { label: "حرج", color: "bg-red-500 text-white" },
    high: { label: "عالي", color: "bg-orange-500 text-white" },
    medium: { label: "متوسط", color: "bg-yellow-500 text-black" },
    low: { label: "منخفض", color: "bg-green-500 text-white" },
  };

  const config = priorityConfig[priority] || { label: priority, color: "bg-gray-500 text-white" };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

// Sample Projects Data
const projectsData = [
  {
    id: 1,
    name: "توسعة محطة الرياض الرئيسية",
    code: "PRJ-2024-001",
    description: "مشروع توسعة المحطة لزيادة القدرة الإنتاجية بنسبة 50%",
    status: "in_progress",
    priority: "high",
    progress: 65,
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    budget: 5000000,
    spent: 3250000,
    manager: "أحمد محمد",
    team: 12,
    tasks: { total: 45, completed: 29 },
    location: "الرياض",
    client: "شركة الكهرباء السعودية",
  },
  {
    id: 2,
    name: "تحديث نظام SCADA",
    code: "PRJ-2024-002",
    description: "تحديث وتطوير نظام المراقبة والتحكم في جميع المحطات",
    status: "in_progress",
    priority: "critical",
    progress: 40,
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    budget: 2500000,
    spent: 1000000,
    manager: "سارة أحمد",
    team: 8,
    tasks: { total: 32, completed: 13 },
    location: "جميع المحطات",
    client: "داخلي",
  },
  {
    id: 3,
    name: "إنشاء محطة جدة الفرعية",
    code: "PRJ-2024-003",
    description: "إنشاء محطة فرعية جديدة في منطقة جدة الصناعية",
    status: "planning",
    priority: "medium",
    progress: 15,
    startDate: "2024-06-01",
    endDate: "2025-06-30",
    budget: 8000000,
    spent: 400000,
    manager: "خالد العمري",
    team: 20,
    tasks: { total: 60, completed: 9 },
    location: "جدة",
    client: "شركة الكهرباء السعودية",
  },
  {
    id: 4,
    name: "تركيب العدادات الذكية",
    code: "PRJ-2024-004",
    description: "استبدال العدادات التقليدية بعدادات ذكية في المنطقة الشرقية",
    status: "in_progress",
    priority: "high",
    progress: 78,
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    budget: 3500000,
    spent: 2730000,
    manager: "فاطمة الزهراني",
    team: 15,
    tasks: { total: 50, completed: 39 },
    location: "الدمام",
    client: "داخلي",
  },
  {
    id: 5,
    name: "صيانة شبكة التوزيع",
    code: "PRJ-2024-005",
    description: "صيانة شاملة لشبكة التوزيع في المنطقة الوسطى",
    status: "completed",
    priority: "medium",
    progress: 100,
    startDate: "2024-01-01",
    endDate: "2024-04-30",
    budget: 1500000,
    spent: 1420000,
    manager: "محمد السعيد",
    team: 10,
    tasks: { total: 28, completed: 28 },
    location: "الرياض",
    client: "داخلي",
  },
  {
    id: 6,
    name: "تطوير تطبيق العملاء",
    code: "PRJ-2024-006",
    description: "تطوير تطبيق جوال للعملاء لإدارة الفواتير والاستهلاك",
    status: "on_hold",
    priority: "low",
    progress: 25,
    startDate: "2024-04-01",
    endDate: "2024-10-31",
    budget: 800000,
    spent: 200000,
    manager: "نورة القحطاني",
    team: 5,
    tasks: { total: 20, completed: 5 },
    location: "الرياض",
    client: "داخلي",
  },
];

const projectStats = [
  { label: "إجمالي المشاريع", value: 12, icon: FolderKanban, color: "primary" },
  { label: "قيد التنفيذ", value: 6, icon: Play, color: "success" },
  { label: "متوقفة", value: 2, icon: Pause, color: "warning" },
  { label: "مكتملة", value: 4, icon: CheckCircle, color: "accent" },
];

export default function ProjectsList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProjects = projectsData.filter(project => {
    if (searchQuery && !project.name.includes(searchQuery) && !project.code.includes(searchQuery)) {
      return false;
    }
    if (statusFilter !== "all" && project.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== "all" && project.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-SA");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-primary" />
            إدارة المشاريع
          </h1>
          <p className="text-muted-foreground">إدارة وتتبع جميع مشاريع الشركة</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 ml-2" />
          مشروع جديد
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {projectStats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold ltr-nums">{stat.value}</p>
                </div>
                <div className={cn(
                  "p-3 rounded-xl",
                  stat.color === "primary" && "bg-primary/20 text-primary",
                  stat.color === "success" && "bg-success/20 text-success",
                  stat.color === "warning" && "bg-warning/20 text-warning",
                  stat.color === "accent" && "bg-accent/20 text-accent-foreground"
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المشاريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="planning">تخطيط</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                <SelectItem value="on_hold">متوقف</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card 
            key={project.id} 
            className="card-hover cursor-pointer"
            onClick={() => setLocation(`/dashboard/projects/view/${project.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-mono mb-1">{project.code}</p>
                  <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                </div>
                <PriorityBadge priority={project.priority} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              
              <div className="flex items-center justify-between">
                <ProjectStatusBadge status={project.status} />
                <span className="text-sm font-medium ltr-nums">{project.progress}%</span>
              </div>
              
              <Progress value={project.progress} className="h-2" />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.endDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{project.team} عضو</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>{project.tasks.completed}/{project.tasks.total} مهمة</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">الميزانية</span>
                  <span className="font-medium ltr-nums">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">المصروف</span>
                  <span className={cn(
                    "font-medium ltr-nums",
                    project.spent > project.budget * 0.9 && "text-destructive"
                  )}>
                    {formatCurrency(project.spent)}
                  </span>
                </div>
                <Progress 
                  value={(project.spent / project.budget) * 100} 
                  className={cn(
                    "h-1.5 mt-2",
                    project.spent > project.budget * 0.9 && "[&>div]:bg-destructive"
                  )}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
                    {project.manager.charAt(0)}
                  </div>
                  <span className="text-sm">{project.manager}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  setLocation(`/dashboard/projects/view/${project.id}`);
                }}>
                  <Eye className="w-4 h-4 ml-1" />
                  عرض
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا توجد مشاريع</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على مشاريع تطابق معايير البحث</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مشروع جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Project Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5" />
              إضافة مشروع جديد
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المشروع *</Label>
                <Input placeholder="أدخل اسم المشروع" />
              </div>
              <div className="space-y-2">
                <Label>كود المشروع *</Label>
                <Input placeholder="PRJ-2024-XXX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>وصف المشروع</Label>
              <Textarea placeholder="أدخل وصف المشروع" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ البداية *</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>تاريخ النهاية المتوقع *</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الميزانية (ريال) *</Label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>الأولوية *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">حرج</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>مدير المشروع *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مدير المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">أحمد محمد</SelectItem>
                    <SelectItem value="2">سارة أحمد</SelectItem>
                    <SelectItem value="3">خالد العمري</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الموقع</Label>
                <Input placeholder="موقع المشروع" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>العميل</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر العميل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">داخلي</SelectItem>
                  <SelectItem value="sec">شركة الكهرباء السعودية</SelectItem>
                  <SelectItem value="other">عميل آخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={() => {
              toast.success("تم إضافة المشروع بنجاح");
              setShowAddDialog(false);
            }}>
              إضافة المشروع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
