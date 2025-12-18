import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Filter, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample Gantt Data
const ganttData = [
  { id: 1, name: "توسعة محطة الرياض", tasks: [
    { id: 101, name: "تصميم المخططات", start: "2024-01-15", end: "2024-02-28", progress: 100, status: "completed", assignee: "محمد علي" },
    { id: 102, name: "الحصول على التصاريح", start: "2024-02-01", end: "2024-03-15", progress: 100, status: "completed", assignee: "سارة أحمد" },
    { id: 103, name: "تجهيز الموقع", start: "2024-03-01", end: "2024-04-15", progress: 100, status: "completed", assignee: "خالد العمري" },
    { id: 104, name: "تركيب الأساسات", start: "2024-04-01", end: "2024-05-30", progress: 100, status: "completed", assignee: "فريق الإنشاءات" },
    { id: 105, name: "تركيب المحولات", start: "2024-05-15", end: "2024-08-15", progress: 60, status: "in_progress", assignee: "فريق الكهرباء" },
    { id: 106, name: "تمديد الكابلات", start: "2024-07-01", end: "2024-09-30", progress: 40, status: "in_progress", assignee: "فريق الكهرباء" },
    { id: 107, name: "تركيب نظام SCADA", start: "2024-09-01", end: "2024-11-15", progress: 0, status: "pending", assignee: "فريق التحكم" },
    { id: 108, name: "الاختبارات والتشغيل", start: "2024-11-01", end: "2024-12-15", progress: 0, status: "pending", assignee: "فريق الجودة" },
    { id: 109, name: "التسليم النهائي", start: "2024-12-15", end: "2024-12-31", progress: 0, status: "pending", assignee: "أحمد محمد" },
  ]},
  { id: 2, name: "تحديث نظام SCADA", tasks: [
    { id: 201, name: "تحليل المتطلبات", start: "2024-03-01", end: "2024-04-15", progress: 100, status: "completed", assignee: "سارة أحمد" },
    { id: 202, name: "تصميم النظام", start: "2024-04-01", end: "2024-05-31", progress: 100, status: "completed", assignee: "فريق التطوير" },
    { id: 203, name: "التطوير والبرمجة", start: "2024-05-15", end: "2024-08-31", progress: 50, status: "in_progress", assignee: "فريق التطوير" },
    { id: 204, name: "الاختبارات", start: "2024-08-15", end: "2024-09-30", progress: 0, status: "pending", assignee: "فريق الجودة" },
  ]},
  { id: 3, name: "تركيب العدادات الذكية", tasks: [
    { id: 301, name: "شراء العدادات", start: "2024-02-01", end: "2024-03-31", progress: 100, status: "completed", assignee: "قسم المشتريات" },
    { id: 302, name: "تركيب المرحلة الأولى", start: "2024-03-15", end: "2024-05-31", progress: 100, status: "completed", assignee: "فريق التركيب" },
    { id: 303, name: "تركيب المرحلة الثانية", start: "2024-05-15", end: "2024-07-31", progress: 80, status: "in_progress", assignee: "فريق التركيب" },
    { id: 304, name: "تركيب المرحلة الثالثة", start: "2024-07-15", end: "2024-08-31", progress: 20, status: "in_progress", assignee: "فريق التركيب" },
  ]},
];

const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export default function GanttChart() {
  const [selectedProject, setSelectedProject] = useState("all");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewStartMonth, setViewStartMonth] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const year = 2024;
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const totalDays = daysInMonth.reduce((a, b) => a + b, 0);
  const dayWidth = 3 * zoomLevel;
  const chartWidth = totalDays * dayWidth;

  const getDatePosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    return dayOfYear * dayWidth;
  };

  const getBarWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return days * dayWidth;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success";
      case "in_progress": return "bg-primary";
      case "pending": return "bg-muted-foreground/30";
      default: return "bg-gray-400";
    }
  };

  const filteredData = useMemo(() => {
    let data = ganttData;
    if (selectedProject !== "all") {
      data = data.filter(p => p.id.toString() === selectedProject);
    }
    if (searchQuery) {
      data = data.map(project => ({
        ...project,
        tasks: project.tasks.filter(task => 
          task.name.includes(searchQuery) || task.assignee.includes(searchQuery)
        )
      })).filter(p => p.tasks.length > 0);
    }
    return data;
  }, [selectedProject, searchQuery]);

  const allTasks = filteredData.flatMap(p => p.tasks.map(t => ({ ...t, projectName: p.name })));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            مخطط جانت
          </h1>
          <p className="text-muted-foreground">عرض الجدول الزمني للمشاريع والمهام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في المهام..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المشاريع</SelectItem>
                {ganttData.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <div className="flex">
            {/* Task Names Column */}
            <div className="w-64 flex-shrink-0 border-l bg-muted/30">
              {/* Header */}
              <div className="h-16 border-b flex items-center px-4 font-semibold bg-muted/50">
                المهام
              </div>
              {/* Tasks */}
              <div className="divide-y">
                {allTasks.map((task) => (
                  <div key={task.id} className="h-12 flex items-center px-4 hover:bg-muted/50">
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{task.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{task.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 overflow-x-auto">
              <div style={{ width: chartWidth, minWidth: "100%" }}>
                {/* Timeline Header */}
                <div className="h-16 border-b flex bg-muted/50">
                  {months.map((month, index) => {
                    const monthWidth = daysInMonth[index] * dayWidth;
                    return (
                      <div 
                        key={month} 
                        className="border-l first:border-l-0 flex flex-col"
                        style={{ width: monthWidth }}
                      >
                        <div className="h-8 flex items-center justify-center font-semibold text-sm border-b">
                          {month} {year}
                        </div>
                        <div className="h-8 flex">
                          {Array.from({ length: Math.ceil(daysInMonth[index] / 7) }, (_, weekIndex) => (
                            <div 
                              key={weekIndex} 
                              className="flex-1 flex items-center justify-center text-xs text-muted-foreground border-l first:border-l-0"
                            >
                              أ{weekIndex + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Task Bars */}
                <div className="relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {months.map((month, index) => (
                      <div 
                        key={month}
                        className="border-l first:border-l-0 border-dashed border-muted"
                        style={{ width: daysInMonth[index] * dayWidth }}
                      />
                    ))}
                  </div>

                  {/* Today Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                    style={{ left: getDatePosition(new Date().toISOString().split('T')[0]) }}
                  >
                    <div className="absolute -top-6 -translate-x-1/2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                      اليوم
                    </div>
                  </div>

                  {/* Task Bars */}
                  {allTasks.map((task, index) => (
                    <div key={task.id} className="h-12 relative flex items-center">
                      <div
                        className={cn(
                          "absolute h-7 rounded-md flex items-center overflow-hidden cursor-pointer transition-all hover:opacity-80",
                          getStatusColor(task.status)
                        )}
                        style={{
                          left: getDatePosition(task.start),
                          width: getBarWidth(task.start, task.end),
                        }}
                        title={`${task.name}\n${task.assignee}\n${task.progress}%`}
                      >
                        {/* Progress Fill */}
                        {task.status === "in_progress" && (
                          <div 
                            className="absolute inset-y-0 right-0 bg-primary/30"
                            style={{ width: `${100 - task.progress}%` }}
                          />
                        )}
                        <span className="px-2 text-xs font-medium text-white truncate relative z-10">
                          {task.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm font-medium">دليل الألوان:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-success" />
              <span className="text-sm">مكتمل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary" />
              <span className="text-sm">قيد التنفيذ</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted-foreground/30" />
              <span className="text-sm">معلق</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-destructive" />
              <span className="text-sm">اليوم</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary ltr-nums">{allTasks.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي المهام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success ltr-nums">{allTasks.filter(t => t.status === "completed").length}</p>
            <p className="text-sm text-muted-foreground">مكتملة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary ltr-nums">{allTasks.filter(t => t.status === "in_progress").length}</p>
            <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground ltr-nums">{allTasks.filter(t => t.status === "pending").length}</p>
            <p className="text-sm text-muted-foreground">معلقة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
