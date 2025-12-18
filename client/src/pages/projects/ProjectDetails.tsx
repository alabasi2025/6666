import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  FolderKanban, ArrowRight, Calendar, Users, DollarSign,
  Clock, CheckCircle, Target, ListTodo, FileText, Plus, Edit,
  User, MapPin, Building, Phone, Mail, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation, useParams } from "wouter";

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    planning: { label: "تخطيط", color: "bg-blue-500/20 text-blue-500" },
    in_progress: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary" },
    on_hold: { label: "متوقف", color: "bg-warning/20 text-warning" },
    completed: { label: "مكتمل", color: "bg-success/20 text-success" },
    todo: { label: "للتنفيذ", color: "bg-blue-500/20 text-blue-500" },
    done: { label: "منجز", color: "bg-success/20 text-success" },
    pending: { label: "معلق", color: "bg-gray-500/20 text-gray-500" },
  };
  const config = statusConfig[status] || { label: status, color: "bg-gray-500/20 text-gray-500" };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; color: string }> = {
    critical: { label: "حرج", color: "bg-red-500 text-white" },
    high: { label: "عالي", color: "bg-orange-500 text-white" },
    medium: { label: "متوسط", color: "bg-yellow-500 text-black" },
    low: { label: "منخفض", color: "bg-green-500 text-white" },
  };
  const c = config[priority] || { label: priority, color: "bg-gray-500 text-white" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.color}`}>{c.label}</span>;
}

const projectData = {
  id: 1, name: "توسعة محطة الرياض الرئيسية", code: "PRJ-2024-001",
  description: "مشروع توسعة المحطة لزيادة القدرة الإنتاجية بنسبة 50%",
  status: "in_progress", priority: "high", progress: 65,
  startDate: "2024-01-15", endDate: "2024-12-31",
  budget: 5000000, spent: 3250000,
  manager: { name: "أحمد محمد", email: "ahmed@company.com", phone: "0501234567" },
  location: "الرياض", client: "شركة الكهرباء السعودية",
};

const tasksData = [
  { id: 1, title: "تصميم المخططات الهندسية", status: "done", priority: "high", assignee: "محمد علي", dueDate: "2024-02-15", progress: 100 },
  { id: 2, title: "الحصول على التصاريح", status: "done", priority: "high", assignee: "سارة أحمد", dueDate: "2024-03-01", progress: 100 },
  { id: 3, title: "تركيب المحولات", status: "in_progress", priority: "critical", assignee: "فريق الكهرباء", dueDate: "2024-07-15", progress: 60 },
  { id: 4, title: "تمديد الكابلات", status: "in_progress", priority: "high", assignee: "فريق الكهرباء", dueDate: "2024-08-30", progress: 40 },
  { id: 5, title: "تركيب نظام SCADA", status: "todo", priority: "high", assignee: "فريق التحكم", dueDate: "2024-09-30", progress: 0 },
  { id: 6, title: "الاختبارات والتشغيل", status: "todo", priority: "critical", assignee: "فريق الجودة", dueDate: "2024-11-30", progress: 0 },
];

const teamData = [
  { id: 1, name: "أحمد محمد", role: "مدير المشروع", department: "إدارة المشاريع", tasks: 5 },
  { id: 2, name: "محمد علي", role: "مهندس تصميم", department: "الهندسة", tasks: 8 },
  { id: 3, name: "سارة أحمد", role: "منسق المشروع", department: "إدارة المشاريع", tasks: 12 },
  { id: 4, name: "خالد العمري", role: "مشرف موقع", department: "العمليات", tasks: 15 },
];

const milestonesData = [
  { id: 1, name: "اكتمال التصميم", date: "2024-02-28", status: "completed" },
  { id: 2, name: "بدء الإنشاءات", date: "2024-03-15", status: "completed" },
  { id: 3, name: "تركيب المعدات الرئيسية", date: "2024-08-31", status: "in_progress" },
  { id: 4, name: "التشغيل التجريبي", date: "2024-11-30", status: "pending" },
  { id: 5, name: "التسليم النهائي", date: "2024-12-31", status: "pending" },
];

export default function ProjectDetails() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const formatCurrency = (amount: number) => new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("ar-SA");

  const budgetUsage = (projectData.spent / projectData.budget) * 100;
  const remainingBudget = projectData.budget - projectData.spent;
  const daysRemaining = Math.ceil((new Date(projectData.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/projects/list")}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>المشاريع</span>
            <ArrowRight className="w-4 h-4" />
            <span>{projectData.code}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{projectData.name}</h1>
            <StatusBadge status={projectData.status} />
            <PriorityBadge priority={projectData.priority} />
          </div>
        </div>
        <Button variant="outline"><Edit className="w-4 h-4 ml-2" />تعديل</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20 text-primary"><Target className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">التقدم</p><p className="text-2xl font-bold ltr-nums">{projectData.progress}%</p></div>
          </div>
          <Progress value={projectData.progress} className="h-2 mt-3" />
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/20 text-success"><DollarSign className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">الميزانية المتبقية</p><p className="text-xl font-bold ltr-nums">{formatCurrency(remainingBudget)}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20 text-warning"><Clock className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">الأيام المتبقية</p><p className="text-2xl font-bold ltr-nums">{daysRemaining} يوم</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20 text-accent-foreground"><CheckCircle className="w-5 h-5" /></div>
            <div><p className="text-sm text-muted-foreground">المهام المكتملة</p><p className="text-2xl font-bold ltr-nums">{tasksData.filter(t => t.status === "done").length}/{tasksData.length}</p></div>
          </div>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="tasks">المهام</TabsTrigger>
          <TabsTrigger value="team">الفريق</TabsTrigger>
          <TabsTrigger value="milestones">المعالم</TabsTrigger>
          <TabsTrigger value="budget">الميزانية</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5" />معلومات المشروع</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{projectData.description}</p>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div><p className="text-sm text-muted-foreground">تاريخ البداية</p><p className="font-medium">{formatDate(projectData.startDate)}</p></div>
                  <div><p className="text-sm text-muted-foreground">تاريخ النهاية</p><p className="font-medium">{formatDate(projectData.endDate)}</p></div>
                  <div><p className="text-sm text-muted-foreground">الموقع</p><p className="font-medium flex items-center gap-1"><MapPin className="w-4 h-4" />{projectData.location}</p></div>
                  <div><p className="text-sm text-muted-foreground">العميل</p><p className="font-medium flex items-center gap-1"><Building className="w-4 h-4" />{projectData.client}</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" />مدير المشروع</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">{projectData.manager.name.charAt(0)}</div>
                  <div><h3 className="font-semibold text-lg">{projectData.manager.name}</h3><p className="text-sm text-muted-foreground">مدير المشروع</p></div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" /><span>{projectData.manager.email}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" /><span className="ltr-nums">{projectData.manager.phone}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">قائمة المهام</h2>
            <Button><Plus className="w-4 h-4 ml-2" />إضافة مهمة</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" />للتنفيذ ({tasksData.filter(t => t.status === "todo").length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasksData.filter(t => t.status === "todo").map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2"><p className="font-medium text-sm">{task.title}</p><PriorityBadge priority={task.priority} /></div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{task.assignee}</span><span>{formatDate(task.dueDate)}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" />قيد التنفيذ ({tasksData.filter(t => t.status === "in_progress").length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasksData.filter(t => t.status === "in_progress").map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2"><p className="font-medium text-sm">{task.title}</p><PriorityBadge priority={task.priority} /></div>
                      <Progress value={task.progress} className="h-1.5 my-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{task.assignee}</span><span>{task.progress}%</span></div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" />مكتمل ({tasksData.filter(t => t.status === "done").length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {tasksData.filter(t => t.status === "done").map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:bg-muted/50 opacity-75">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2"><p className="font-medium text-sm line-through">{task.title}</p><CheckCircle className="w-4 h-4 text-success" /></div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{task.assignee}</span><span>{formatDate(task.dueDate)}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">فريق المشروع ({teamData.length} أعضاء)</h2>
            <Button><Plus className="w-4 h-4 ml-2" />إضافة عضو</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamData.map((member) => (
              <Card key={member.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold">{member.name.charAt(0)}</div>
                    <div className="flex-1"><h3 className="font-semibold">{member.name}</h3><p className="text-sm text-muted-foreground">{member.role}</p></div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{member.department}</span>
                    <span className="font-medium">{member.tasks} مهمة</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">معالم المشروع</h2>
            <Button><Plus className="w-4 h-4 ml-2" />إضافة معلم</Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                {milestonesData.map((milestone, index) => (
                  <div key={milestone.id} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={cn("w-4 h-4 rounded-full border-2", milestone.status === "completed" && "bg-success border-success", milestone.status === "in_progress" && "bg-primary border-primary", milestone.status === "pending" && "bg-muted border-muted-foreground")} />
                      {index < milestonesData.length - 1 && <div className={cn("w-0.5 flex-1 mt-2", milestone.status === "completed" ? "bg-success" : "bg-muted")} />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <h3 className={cn("font-medium", milestone.status === "completed" && "text-success")}>{milestone.name}</h3>
                        <StatusBadge status={milestone.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{formatDate(milestone.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">الميزانية الإجمالية</p><p className="text-2xl font-bold text-primary ltr-nums">{formatCurrency(projectData.budget)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">المصروف حتى الآن</p><p className="text-2xl font-bold text-warning ltr-nums">{formatCurrency(projectData.spent)}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">المتبقي</p><p className="text-2xl font-bold text-success ltr-nums">{formatCurrency(remainingBudget)}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>توزيع الميزانية</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[{ category: "المواد والمعدات", budget: 2000000, spent: 1500000 }, { category: "العمالة", budget: 1500000, spent: 1000000 }, { category: "المقاولين", budget: 1000000, spent: 500000 }, { category: "الإدارة والمصاريف", budget: 500000, spent: 250000 }].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2"><span className="font-medium">{item.category}</span><span className="text-sm text-muted-foreground ltr-nums">{formatCurrency(item.spent)} / {formatCurrency(item.budget)}</span></div>
                    <Progress value={(item.spent / item.budget) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
