import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  ClipboardList,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Package,
  Play,
  Pause,
  XCircle,
  FileText,
  MessageSquare,
  History,
  DollarSign,
  Timer,
  Camera,
  Paperclip,
  Send,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: "مسودة", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "قيد الانتظار", color: "bg-warning/20 text-warning", icon: Clock },
  assigned: { label: "تم التعيين", color: "bg-primary/20 text-primary", icon: User },
  in_progress: { label: "قيد التنفيذ", color: "bg-primary/20 text-primary", icon: Play },
  on_hold: { label: "معلق", color: "bg-warning/20 text-warning", icon: Pause },
  completed: { label: "مكتمل", color: "bg-success/20 text-success", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-destructive/20 text-destructive", icon: XCircle },
  closed: { label: "مغلق", color: "bg-muted text-muted-foreground", icon: CheckCircle },
};

// Type mapping
const typeMap: Record<string, { label: string; color: string }> = {
  corrective: { label: "تصحيحية", color: "bg-destructive/20 text-destructive" },
  preventive: { label: "وقائية", color: "bg-success/20 text-success" },
  predictive: { label: "تنبؤية", color: "bg-primary/20 text-primary" },
  emergency: { label: "طارئة", color: "bg-warning/20 text-warning" },
  inspection: { label: "فحص", color: "bg-accent/20 text-accent" },
};

// Priority mapping
const priorityMap: Record<string, { label: string; color: string }> = {
  low: { label: "منخفضة", color: "bg-muted text-muted-foreground" },
  medium: { label: "متوسطة", color: "bg-primary/20 text-primary" },
  high: { label: "عالية", color: "bg-warning/20 text-warning" },
  critical: { label: "حرجة", color: "bg-destructive/20 text-destructive" },
};

// Mock work order data
const mockWorkOrder = {
  id: 1,
  workOrderNumber: "WO-2024-001",
  title: "صيانة محول كهربائي T-05",
  description: "فحص وصيانة المحول بسبب ارتفاع درجة الحرارة المسجلة من أجهزة الاستشعار. يجب فحص نظام التبريد والزيت والعوازل.",
  type: "corrective",
  priority: "high",
  status: "in_progress",
  progress: 65,
  asset: {
    code: "AST-000001",
    name: "محول كهربائي 500 كيلو فولت",
    category: "محولات",
    location: "محطة التوليد الرئيسية - المبنى A",
  },
  station: {
    name: "محطة التوليد الرئيسية",
    branch: "الفرع الرئيسي",
  },
  assignedTo: {
    name: "أحمد محمد",
    role: "فني صيانة كهربائية",
    phone: "0501234567",
    email: "ahmed@company.com",
  },
  team: "فريق الصيانة الكهربائية",
  dates: {
    created: "2024-06-15T09:00:00",
    scheduled: "2024-06-16T08:00:00",
    started: "2024-06-16T08:30:00",
    due: "2024-06-18T17:00:00",
    completed: null,
  },
  time: {
    estimated: 8,
    actual: 5.5,
  },
  cost: {
    estimated: 5000,
    labor: 2000,
    parts: 1800,
    other: 400,
    total: 4200,
  },
  createdBy: {
    name: "مدير الصيانة",
    date: "2024-06-15T09:00:00",
  },
};

// Mock tasks
const mockTasks = [
  { id: 1, title: "فحص مستوى الزيت", status: "completed", assignee: "أحمد محمد", completedAt: "2024-06-16T10:00:00" },
  { id: 2, title: "فحص نظام التبريد", status: "completed", assignee: "أحمد محمد", completedAt: "2024-06-16T11:30:00" },
  { id: 3, title: "فحص العوازل", status: "in_progress", assignee: "أحمد محمد", completedAt: null },
  { id: 4, title: "اختبار الجهد", status: "pending", assignee: "أحمد محمد", completedAt: null },
  { id: 5, title: "تقرير الصيانة النهائي", status: "pending", assignee: "أحمد محمد", completedAt: null },
];

// Mock parts used
const mockParts = [
  { id: 1, code: "PRT-001", name: "زيت محولات", quantity: 20, unit: "لتر", unitCost: 50, totalCost: 1000 },
  { id: 2, code: "PRT-002", name: "فلتر زيت", quantity: 2, unit: "قطعة", unitCost: 200, totalCost: 400 },
  { id: 3, code: "PRT-003", name: "حشوات عازلة", quantity: 4, unit: "قطعة", unitCost: 100, totalCost: 400 },
];

// Mock comments
const mockComments = [
  { id: 1, user: "أحمد محمد", text: "تم البدء في العمل. المحول يحتاج تغيير الزيت بشكل كامل.", date: "2024-06-16T08:30:00" },
  { id: 2, user: "مدير الصيانة", text: "تمت الموافقة على طلب قطع الغيار الإضافية.", date: "2024-06-16T10:15:00" },
  { id: 3, user: "أحمد محمد", text: "تم الانتهاء من فحص نظام التبريد. النظام يعمل بشكل جيد.", date: "2024-06-16T11:30:00" },
];

// Mock history
const mockHistory = [
  { id: 1, action: "إنشاء أمر العمل", user: "مدير الصيانة", date: "2024-06-15T09:00:00", details: "تم إنشاء أمر العمل" },
  { id: 2, action: "تعيين الفني", user: "مدير الصيانة", date: "2024-06-15T09:15:00", details: "تم تعيين أحمد محمد" },
  { id: 3, action: "تغيير الحالة", user: "النظام", date: "2024-06-16T08:30:00", details: "من 'قيد الانتظار' إلى 'قيد التنفيذ'" },
  { id: 4, action: "إضافة قطع غيار", user: "أحمد محمد", date: "2024-06-16T09:00:00", details: "تم إضافة 3 أصناف" },
];

export default function WorkOrderDetails() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/dashboard/maintenance/work-orders/view/:id");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAddPartDialog, setShowAddPartDialog] = useState(false);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newComment, setNewComment] = useState("");

  const workOrder = mockWorkOrder;
  const StatusIcon = statusMap[workOrder.status]?.icon || Clock;

  const handleStatusChange = (newStatus: string) => {
    toast.success(`تم تغيير الحالة إلى: ${statusMap[newStatus]?.label}`);
    setShowStatusDialog(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      toast.success("تم إضافة التعليق");
      setNewComment("");
    }
  };

  const handleCompleteTask = (taskId: number) => {
    toast.success("تم إكمال المهمة");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/maintenance/work-orders")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{workOrder.workOrderNumber}</h1>
              <Badge variant="outline" className={statusMap[workOrder.status]?.color}>
                <StatusIcon className="w-3 h-3 ml-1" />
                {statusMap[workOrder.status]?.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{workOrder.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowStatusDialog(true)}>
            تغيير الحالة
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 ml-2" />
            طباعة
          </Button>
          <Button className="gradient-energy">
            <Wrench className="w-4 h-4 ml-2" />
            تحديث التقدم
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">نسبة الإنجاز</span>
            <span className="text-sm font-bold ltr-nums">{workOrder.progress}%</span>
          </div>
          <Progress value={workOrder.progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="tasks">المهام</TabsTrigger>
              <TabsTrigger value="parts">القطع</TabsTrigger>
              <TabsTrigger value="comments">التعليقات</TabsTrigger>
              <TabsTrigger value="history">السجل</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات أمر العمل</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">الوصف</Label>
                    <p className="mt-1">{workOrder.description}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">نوع الصيانة</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={typeMap[workOrder.type]?.color}>
                          {typeMap[workOrder.type]?.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">الأولوية</Label>
                      <div className="mt-1">
                        <Badge variant="outline" className={priorityMap[workOrder.priority]?.color}>
                          {priorityMap[workOrder.priority]?.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    معلومات الأصل
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">رمز الأصل</Label>
                      <p className="font-mono text-primary">{workOrder.asset.code}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">اسم الأصل</Label>
                      <p>{workOrder.asset.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">الفئة</Label>
                      <p>{workOrder.asset.category}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">الموقع</Label>
                      <p>{workOrder.asset.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>قائمة المهام</CardTitle>
                  <Button size="sm" onClick={() => setShowAddTaskDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة مهمة
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          task.status === "completed" && "bg-success/5 border-success/20"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            task.status === "completed" ? "bg-success/20 text-success" :
                            task.status === "in_progress" ? "bg-primary/20 text-primary" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {task.status === "completed" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : task.status === "in_progress" ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className={cn("font-medium", task.status === "completed" && "line-through text-muted-foreground")}>
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{task.assignee}</p>
                          </div>
                        </div>
                        {task.status !== "completed" && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteTask(task.id)}>
                            إكمال
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parts Tab */}
            <TabsContent value="parts" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>القطع والمواد المستخدمة</CardTitle>
                  <Button size="sm" onClick={() => setShowAddPartDialog(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة قطعة
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">الرمز</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">الاسم</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">الكمية</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">سعر الوحدة</th>
                          <th className="text-right py-2 px-3 font-medium text-muted-foreground">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockParts.map((part) => (
                          <tr key={part.id} className="border-b border-border/50">
                            <td className="py-2 px-3 font-mono text-sm">{part.code}</td>
                            <td className="py-2 px-3">{part.name}</td>
                            <td className="py-2 px-3 text-center">{part.quantity} {part.unit}</td>
                            <td className="py-2 px-3 font-mono ltr-nums">{part.unitCost} ر.س</td>
                            <td className="py-2 px-3 font-mono ltr-nums font-medium">{part.totalCost} ر.س</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                          <td colSpan={4} className="py-2 px-3 font-medium text-left">الإجمالي</td>
                          <td className="py-2 px-3 font-mono ltr-nums font-bold">
                            {mockParts.reduce((sum, p) => sum + p.totalCost, 0)} ر.س
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>التعليقات والملاحظات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.date).toLocaleString("ar-SA")}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="أضف تعليقاً..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button onClick={handleAddComment} className="gradient-energy">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    سجل التغييرات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 right-4 w-px bg-border" />
                    <div className="space-y-6">
                      {mockHistory.map((item, index) => (
                        <div key={item.id} className="relative flex gap-4 pr-8">
                          <div className="absolute right-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                          <div className="flex-1">
                            <p className="font-medium">{item.action}</p>
                            <p className="text-sm text-muted-foreground">{item.details}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              <span>{item.user}</span>
                              <span>•</span>
                              <span>{new Date(item.date).toLocaleString("ar-SA")}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Assigned To */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                المسؤول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{workOrder.assignedTo.name}</p>
                  <p className="text-sm text-muted-foreground">{workOrder.assignedTo.role}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">الفريق: <span className="text-foreground">{workOrder.team}</span></p>
                <p className="text-muted-foreground">الهاتف: <span className="text-foreground ltr-nums">{workOrder.assignedTo.phone}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                التواريخ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الإنشاء</span>
                <span className="font-mono text-sm">{new Date(workOrder.dates.created).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ البدء المجدول</span>
                <span className="font-mono text-sm">{new Date(workOrder.dates.scheduled).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ البدء الفعلي</span>
                <span className="font-mono text-sm">{new Date(workOrder.dates.started).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الاستحقاق</span>
                <span className="font-mono text-sm text-warning">{new Date(workOrder.dates.due).toLocaleDateString("ar-SA")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-primary" />
                الوقت
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الوقت المقدر</span>
                <span className="font-mono">{workOrder.time.estimated} ساعات</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الوقت الفعلي</span>
                <span className="font-mono">{workOrder.time.actual} ساعات</span>
              </div>
              <Progress value={(workOrder.time.actual / workOrder.time.estimated) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                التكلفة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">التكلفة المقدرة</span>
                <span className="font-mono ltr-nums">{workOrder.cost.estimated.toLocaleString()} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">العمالة</span>
                <span className="font-mono ltr-nums">{workOrder.cost.labor.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">القطع</span>
                <span className="font-mono ltr-nums">{workOrder.cost.parts.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">أخرى</span>
                <span className="font-mono ltr-nums">{workOrder.cost.other.toLocaleString()} ر.س</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>الإجمالي الفعلي</span>
                <span className="font-mono ltr-nums text-success">{workOrder.cost.total.toLocaleString()} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير حالة أمر العمل</DialogTitle>
            <DialogDescription>اختر الحالة الجديدة لأمر العمل</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusMap).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={showAddPartDialog} onOpenChange={setShowAddPartDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة قطعة غيار</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>القطعة</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر القطعة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">زيت محولات</SelectItem>
                  <SelectItem value="2">فلتر زيت</SelectItem>
                  <SelectItem value="3">حشوات عازلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الكمية</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPartDialog(false)}>إلغاء</Button>
            <Button className="gradient-energy" onClick={() => { toast.success("تم إضافة القطعة"); setShowAddPartDialog(false); }}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة مهمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>عنوان المهمة</Label>
              <Input placeholder="أدخل عنوان المهمة" />
            </div>
            <div className="space-y-2">
              <Label>تعيين إلى</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفني" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">أحمد محمد</SelectItem>
                  <SelectItem value="2">خالد عمر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>إلغاء</Button>
            <Button className="gradient-energy" onClick={() => { toast.success("تم إضافة المهمة"); setShowAddTaskDialog(false); }}>
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
