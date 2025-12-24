// @ts-nocheck
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  FolderKanban, Plus, Search, Calendar, Users,
  DollarSign, Clock, CheckCircle, AlertTriangle, Pause,
  Play, Eye, Edit, Trash2, Target, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

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

export default function ProjectsList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    description: "",
    startDate: "",
    endDate: "",
    budget: "",
    status: "planning",
    priority: "medium",
    location: "",
  });

  // Fetch projects
  const { data: projects = [], isLoading, refetch } = trpc.projects.list.useQuery({
    businessId: 1,
    status: statusFilter !== "all" ? statusFilter : undefined,
    priority: priorityFilter !== "all" ? priorityFilter : undefined,
  });

  // Fetch stats
  const { data: stats } = trpc.projects.stats.useQuery({ businessId: 1 });

  // Mutations
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المشروع بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء المشروع");
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المشروع بنجاح");
      setEditingProject(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث المشروع");
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المشروع بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المشروع");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      nameEn: "",
      description: "",
      startDate: "",
      endDate: "",
      budget: "",
      status: "planning",
      priority: "medium",
      location: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.code || !formData.nameAr) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    const data = {
      businessId: 1,
      code: formData.code,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn || undefined,
      description: formData.description || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      status: formData.status,
      priority: formData.priority,
      location: formData.location || undefined,
    };

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      code: project.code || "",
      nameAr: project.nameAr || "",
      nameEn: project.nameEn || "",
      description: project.description || "",
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
      budget: project.budget?.toString() || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      location: project.location || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredProjects = projects.filter((project: any) => {
    if (searchQuery && !project.nameAr?.includes(searchQuery) && !project.code?.includes(searchQuery)) {
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
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ar-SA");
  };

  const projectStats = [
    { label: "إجمالي المشاريع", value: stats?.total || 0, icon: FolderKanban, color: "primary" },
    { label: "قيد التنفيذ", value: stats?.active || 0, icon: Play, color: "success" },
    { label: "متوقفة", value: stats?.onHold || 0, icon: Pause, color: "warning" },
    { label: "مكتملة", value: stats?.completed || 0, icon: CheckCircle, color: "accent" },
  ];

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
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}>
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

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>المشاريع</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد مشاريع
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>اسم المشروع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>التقدم</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>الميزانية</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project: any) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-mono">{project.code}</TableCell>
                    <TableCell>{project.nameAr}</TableCell>
                    <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                    <TableCell><PriorityBadge priority={project.priority} /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress || 0} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">{project.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                    <TableCell>{formatDate(project.endDate)}</TableCell>
                    <TableCell>{project.budget ? formatCurrency(parseFloat(project.budget)) : "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setLocation(`/dashboard/projects/${project.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingProject} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingProject(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? "تعديل المشروع" : "إضافة مشروع جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>كود المشروع *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="PRJ-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم المشروع (عربي) *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="اسم المشروع"
              />
            </div>
            <div className="space-y-2">
              <Label>اسم المشروع (إنجليزي)</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Project Name"
              />
            </div>
            <div className="space-y-2">
              <Label>الموقع</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="الموقع"
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ البداية</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الميزانية</Label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">تخطيط</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="on_hold">متوقف</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">حرج</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="low">منخفض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف المشروع..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingProject(null); resetForm(); }}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              {editingProject ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
