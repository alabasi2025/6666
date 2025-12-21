import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  GanttChartSquare,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors: Record<string, string> = {
  planning: "bg-gray-400",
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

export default function GanttChart() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch projects
  const { data: projects = [], isLoading } = trpc.projects.list.useQuery({
    businessId: 1,
  });

  // Fetch gantt data
  const { data: ganttData = [] } = trpc.projects.ganttData.useQuery({
    businessId: 1,
    projectId: selectedProject !== "all" ? parseInt(selectedProject) : undefined,
  });

  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Calculate bar position and width
  const calculateBarStyle = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const monthStartTime = monthStart.getTime();
    const monthEndTime = monthEnd.getTime();
    const totalDays = daysInMonth.length;
    
    // Calculate start position
    let startOffset = differenceInDays(start, monthStart);
    if (startOffset < 0) startOffset = 0;
    if (startOffset > totalDays) return null; // Not visible
    
    // Calculate end position
    let endOffset = differenceInDays(end, monthStart);
    if (endOffset < 0) return null; // Not visible
    if (endOffset > totalDays) endOffset = totalDays;
    
    const left = (startOffset / totalDays) * 100;
    const width = ((endOffset - startOffset + 1) / totalDays) * 100;
    
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
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
            <GanttChartSquare className="w-8 h-8 text-primary" />
            مخطط جانت
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض الجدول الزمني للمشاريع والمهام
          </p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="اختر المشروع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المشاريع</SelectItem>
            {projects.map((project: any) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.nameAr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-medium">دليل الألوان:</span>
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${statusColors[key]}`}></div>
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الجدول الزمني</CardTitle>
              <CardDescription>
                {format(currentDate, "MMMM yyyy", { locale: ar })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                اليوم
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Days Header */}
            <div className="min-w-[800px]">
              <div className="flex border-b">
                <div className="w-64 flex-shrink-0 p-2 font-medium border-l bg-muted/50">
                  المشروع / المهمة
                </div>
                <div className="flex-1 flex">
                  {daysInMonth.map((day, index) => (
                    <div
                      key={index}
                      className={`flex-1 text-center text-xs p-1 border-l ${
                        day.getDay() === 5 || day.getDay() === 6 ? "bg-muted/30" : ""
                      }`}
                    >
                      <div className="font-medium">{format(day, "d")}</div>
                      <div className="text-muted-foreground">{format(day, "EEE", { locale: ar })}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects and Tasks */}
              {ganttData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  لا توجد مشاريع أو مهام لعرضها
                </div>
              ) : (
                ganttData.map((item: any) => {
                  const barStyle = item.startDate && item.endDate
                    ? calculateBarStyle(item.startDate, item.endDate)
                    : null;

                  return (
                    <div key={`${item.type}-${item.id}`} className="flex border-b hover:bg-muted/20">
                      <div className={`w-64 flex-shrink-0 p-2 border-l ${item.type === "task" ? "pr-8" : ""}`}>
                        <div className="flex items-center gap-2">
                          {item.type === "project" ? (
                            <Calendar className="w-4 h-4 text-primary" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground"></div>
                          )}
                          <span className={`truncate ${item.type === "project" ? "font-medium" : "text-sm"}`}>
                            {item.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 relative h-10">
                        {barStyle && (
                          <div
                            className={`absolute top-2 h-6 rounded ${statusColors[item.status || "planning"]} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                            style={barStyle}
                            title={`${item.name}: ${item.startDate} - ${item.endDate}`}
                          >
                            <span className="text-xs text-white px-1 truncate block leading-6">
                              {item.progress !== undefined ? `${item.progress}%` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي المشاريع</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
              <p className="text-3xl font-bold text-blue-500">
                {projects.filter((p: any) => p.status === "in_progress").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">مكتملة</p>
              <p className="text-3xl font-bold text-green-500">
                {projects.filter((p: any) => p.status === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">متأخرة</p>
              <p className="text-3xl font-bold text-red-500">
                {projects.filter((p: any) => {
                  if (!p.endDate) return false;
                  return new Date(p.endDate) < new Date() && p.status !== "completed";
                }).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
