import { useParams, useNavigate } from "react-router-dom";
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
import { Progress } from "@/components/ui/progress";
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
  FolderKanban,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  ListTodo,
  Loader2,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors: Record<string, string> = {
  planning: "bg-gray-500",
  in_progress: "bg-blue-500",
  on_hold: "bg-yellow-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  planning: "تخطيط",
  in_progress: "قيد التنفيذ",
  on_hold: "متوقف",
  completed: "مكتمل",
  cancelled: "ملغي",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch project details
  const { data: project, isLoading } = trpc.projects.getById.useQuery({
    id: parseInt(id || "0"),
  });

  // Fetch project phases
  const { data: phases = [] } = trpc.projects.phases.list.useQuery({
    projectId: parseInt(id || "0"),
  });

  // Fetch project tasks
  const { data: tasks = [] } = trpc.projects.tasks.list.useQuery({
    projectId: parseInt(id || "0"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">المشروع غير موجود</p>
        <Button onClick={() => navigate("/dashboard/projects")}>
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للقائمة
        </Button>
      </div>
    );
  }

  // Calculate stats
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard/projects")}>
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FolderKanban className="w-8 h-8 text-primary" />
              {project.nameAr}
            </h1>
            <p className="text-muted-foreground mt-1 font-mono">{project.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${statusColors[project.status || "planning"]} text-white`}>
            {statusLabels[project.status || "planning"]}
          </Badge>
          <Badge className={`${priorityColors[project.priority || "medium"]} text-white`}>
            {priorityLabels[project.priority || "medium"]}
          </Badge>
          <Button variant="outline" onClick={() => navigate(`/dashboard/projects/edit/${project.id}`)}>
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
                <p className="text-sm text-muted-foreground">الميزانية</p>
                <p className="text-2xl font-bold">
                  {project.budget ? `${parseFloat(project.budget).toLocaleString()} ر.س` : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                <p className="text-2xl font-bold">
                  {project.startDate
                    ? format(new Date(project.startDate), "yyyy/MM/dd")
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الانتهاء</p>
                <p className="text-2xl font-bold">
                  {project.endDate
                    ? format(new Date(project.endDate), "yyyy/MM/dd")
                    : "-"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نسبة الإنجاز</p>
                <p className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم الإجمالي</span>
              <span>{completedTasks} / {totalTasks} مهمة مكتملة</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <FolderKanban className="w-4 h-4 ml-2" />
            المعلومات الأساسية
          </TabsTrigger>
          <TabsTrigger value="phases">
            <ListTodo className="w-4 h-4 ml-2" />
            المراحل
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <CheckCircle className="w-4 h-4 ml-2" />
            المهام
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
                  <p className="font-medium">{project.nameEn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مدير المشروع</p>
                  <p className="font-medium">{project.manager?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العميل</p>
                  <p className="font-medium">{project.customer?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المصروفات الفعلية</p>
                  <p className="font-medium">
                    {project.actualCost
                      ? `${parseFloat(project.actualCost).toLocaleString()} ر.س`
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="font-medium">{project.description || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases">
          <Card>
            <CardHeader>
              <CardTitle>مراحل المشروع</CardTitle>
              <CardDescription>{phases.length} مرحلة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المرحلة</TableHead>
                    <TableHead>تاريخ البدء</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>نسبة الإنجاز</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {phases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد مراحل مسجلة
                      </TableCell>
                    </TableRow>
                  ) : (
                    phases.map((phase: any) => (
                      <TableRow key={phase.id}>
                        <TableCell className="font-medium">{phase.nameAr}</TableCell>
                        <TableCell>
                          {phase.startDate
                            ? format(new Date(phase.startDate), "yyyy/MM/dd")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {phase.endDate
                            ? format(new Date(phase.endDate), "yyyy/MM/dd")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[phase.status || "planning"]} text-white`}>
                            {statusLabels[phase.status || "planning"]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={phase.progress || 0} className="w-20 h-2" />
                            <span className="text-sm">{phase.progress || 0}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>مهام المشروع</CardTitle>
              <CardDescription>{tasks.length} مهمة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المهمة</TableHead>
                    <TableHead>المسؤول</TableHead>
                    <TableHead>تاريخ الاستحقاق</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا توجد مهام مسجلة
                      </TableCell>
                    </TableRow>
                  ) : (
                    tasks.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{task.assignee?.nameAr || "-"}</TableCell>
                        <TableCell>
                          {task.dueDate
                            ? format(new Date(task.dueDate), "yyyy/MM/dd")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${priorityColors[task.priority || "medium"]} text-white`}>
                            {priorityLabels[task.priority || "medium"]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[task.status || "planning"]} text-white`}>
                            {statusLabels[task.status || "planning"]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
