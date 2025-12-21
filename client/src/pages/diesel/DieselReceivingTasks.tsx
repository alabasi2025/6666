import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Eye, Play, CheckCircle, Clock, Truck, MapPin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReceivingTask {
  id: number;
  taskNumber: string;
  taskDate: string;
  employeeId: number;
  tankerId: number;
  supplierId: number;
  status: string;
  startTime?: string;
  arrivalAtSupplierTime?: string;
  loadingStartTime?: string;
  loadingEndTime?: string;
  departureFromSupplierTime?: string;
  arrivalAtStationTime?: string;
  unloadingStartTime?: string;
  unloadingEndTime?: string;
  completionTime?: string;
  supplierPumpReadingBefore?: number;
  supplierPumpReadingAfter?: number;
  supplierPumpReadingBeforeImage?: string;
  supplierPumpReadingAfterImage?: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceImage?: string;
  supplierInvoiceAmount?: number;
  quantityFromSupplier?: number;
  compartment1Quantity?: number;
  compartment2Quantity?: number;
  intakePumpReadingBefore?: number;
  intakePumpReadingAfter?: number;
  intakePumpReadingBeforeImage?: string;
  intakePumpReadingAfterImage?: string;
  quantityReceivedAtStation?: number;
  quantityDifference?: number;
  notes?: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "في الانتظار", color: "bg-gray-500" },
  started: { label: "بدأت", color: "bg-blue-500" },
  at_supplier: { label: "عند المورد", color: "bg-yellow-500" },
  loading: { label: "جاري التحميل", color: "bg-orange-500" },
  returning: { label: "في الطريق", color: "bg-purple-500" },
  at_station: { label: "في المحطة", color: "bg-indigo-500" },
  unloading: { label: "جاري التفريغ", color: "bg-pink-500" },
  completed: { label: "مكتملة", color: "bg-green-500" },
  cancelled: { label: "ملغاة", color: "bg-red-500" },
};

export default function DieselReceivingTasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ReceivingTask | null>(null);
  const [formData, setFormData] = useState({
    taskDate: new Date().toISOString().split("T")[0],
    employeeId: "",
    tankerId: "",
    supplierId: "",
    notes: "",
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["diesel-receiving-tasks"],
    queryFn: () => trpc.diesel.receivingTasks.list.query({ businessId: user?.businessId }),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["diesel-suppliers"],
    queryFn: () => trpc.diesel.suppliers.list.query({ businessId: user?.businessId, isActive: true }),
  });

  const { data: tankers = [] } = useQuery({
    queryKey: ["diesel-tankers"],
    queryFn: () => trpc.diesel.tankers.list.query({ businessId: user?.businessId, isActive: true }),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: () => trpc.hr.employees.list.query({ businessId: user?.businessId }),
  });

  const { data: stations = [] } = useQuery({
    queryKey: ["stations"],
    queryFn: () => trpc.stations.list.query({ businessId: user?.businessId }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => trpc.diesel.receivingTasks.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-receiving-tasks"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إنشاء المهمة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => trpc.diesel.receivingTasks.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diesel-receiving-tasks"] });
      toast({ title: "تم حذف المهمة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      taskDate: new Date().toISOString().split("T")[0],
      employeeId: "",
      tankerId: "",
      supplierId: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    if (!formData.employeeId || !formData.tankerId || !formData.supplierId) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId,
      stationId: stations[0]?.id || 1,
      taskDate: formData.taskDate,
      employeeId: parseInt(formData.employeeId),
      tankerId: parseInt(formData.tankerId),
      supplierId: parseInt(formData.supplierId),
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      deleteMutation.mutate(id);
    }
  };

  const openViewDialog = (task: ReceivingTask) => {
    setSelectedTask(task);
    setIsViewOpen(true);
  };

  const getSupplierName = (id: number) => {
    const supplier = suppliers.find((s: any) => s.id === id);
    return supplier?.nameAr || "-";
  };

  const getTankerCode = (id: number) => {
    const tanker = tankers.find((t: any) => t.id === id);
    return tanker?.code || "-";
  };

  const getEmployeeName = (id: number) => {
    const employee = employees.find((e: any) => e.id === id);
    return employee?.nameAr || "-";
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ar });
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours} ساعة ${mins} دقيقة`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مهام استلام الديزل</h1>
          <p className="text-muted-foreground">إدارة وتتبع مهام استلام الديزل من الموردين</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="ml-2 h-4 w-4" />
          مهمة جديدة
        </Button>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المهام</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">قيد التنفيذ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {tasks.filter((t: ReceivingTask) => !["completed", "cancelled", "pending"].includes(t.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">مكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {tasks.filter((t: ReceivingTask) => t.status === "completed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">في الانتظار</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">
              {tasks.filter((t: ReceivingTask) => t.status === "pending").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المهام</CardTitle>
          <CardDescription>جميع مهام استلام الديزل</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد مهام مسجلة
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم المهمة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead>الوايت</TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: ReceivingTask) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono">{task.taskNumber}</TableCell>
                    <TableCell>{format(new Date(task.taskDate), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{getSupplierName(task.supplierId)}</TableCell>
                    <TableCell>{getTankerCode(task.tankerId)}</TableCell>
                    <TableCell>{getEmployeeName(task.employeeId)}</TableCell>
                    <TableCell>
                      {task.quantityReceivedAtStation 
                        ? `${task.quantityReceivedAtStation.toLocaleString()} لتر`
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={statusLabels[task.status]?.color || "bg-gray-500"}>
                        {statusLabels[task.status]?.label || task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(task)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {task.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog إضافة مهمة */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء مهمة استلام ديزل جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>تاريخ المهمة *</Label>
              <Input
                type="date"
                value={formData.taskDate}
                onChange={(e) => setFormData({ ...formData, taskDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>المورد *</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المورد" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الوايت *</Label>
              <Select
                value={formData.tankerId}
                onValueChange={(value) => setFormData({ ...formData, tankerId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوايت" />
                </SelectTrigger>
                <SelectContent>
                  {tankers.map((tanker: any) => (
                    <SelectItem key={tanker.id} value={tanker.id.toString()}>
                      {tanker.code} - {tanker.plateNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموظف المسؤول *</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee: any) => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المهمة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض تفاصيل المهمة */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل مهمة الاستلام</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* معلومات أساسية */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="text-xl font-bold">{selectedTask.taskNumber}</h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedTask.taskDate), "dd MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <Badge className={statusLabels[selectedTask.status]?.color || "bg-gray-500"}>
                  {statusLabels[selectedTask.status]?.label || selectedTask.status}
                </Badge>
              </div>

              {/* معلومات المهمة */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" /> المورد
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">{getSupplierName(selectedTask.supplierId)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" /> الوايت
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">{getTankerCode(selectedTask.tankerId)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">الموظف</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-bold">{getEmployeeName(selectedTask.employeeId)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* الجدول الزمني */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" /> الجدول الزمني
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>بدء المهمة</span>
                      <span className="font-mono">{formatDateTime(selectedTask.startTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>الوصول للمورد</span>
                      <span className="font-mono">{formatDateTime(selectedTask.arrivalAtSupplierTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>بدء التحميل</span>
                      <span className="font-mono">{formatDateTime(selectedTask.loadingStartTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>انتهاء التحميل</span>
                      <span className="font-mono">{formatDateTime(selectedTask.loadingEndTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>المغادرة من المورد</span>
                      <span className="font-mono">{formatDateTime(selectedTask.departureFromSupplierTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>الوصول للمحطة</span>
                      <span className="font-mono">{formatDateTime(selectedTask.arrivalAtStationTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>بدء التفريغ</span>
                      <span className="font-mono">{formatDateTime(selectedTask.unloadingStartTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>انتهاء التفريغ</span>
                      <span className="font-mono">{formatDateTime(selectedTask.unloadingEndTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>اكتمال المهمة</span>
                      <span className="font-mono">{formatDateTime(selectedTask.completionTime)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 bg-muted rounded px-2">
                      <span className="font-bold">إجمالي مدة الرحلة</span>
                      <span className="font-bold">{calculateDuration(selectedTask.startTime, selectedTask.completionTime)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* قراءات الطرمبات والكميات */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>قراءات طرمبة المورد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>القراءة قبل:</span>
                      <span className="font-mono">{selectedTask.supplierPumpReadingBefore?.toLocaleString() || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>القراءة بعد:</span>
                      <span className="font-mono">{selectedTask.supplierPumpReadingAfter?.toLocaleString() || "-"}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>الكمية:</span>
                      <span>{selectedTask.quantityFromSupplier?.toLocaleString() || "-"} لتر</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>قراءات طرمبة المحطة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>القراءة قبل:</span>
                      <span className="font-mono">{selectedTask.intakePumpReadingBefore?.toLocaleString() || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>القراءة بعد:</span>
                      <span className="font-mono">{selectedTask.intakePumpReadingAfter?.toLocaleString() || "-"}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>الكمية المستلمة:</span>
                      <span>{selectedTask.quantityReceivedAtStation?.toLocaleString() || "-"} لتر</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* الفرق والفاتورة */}
              {selectedTask.status === "completed" && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>فاتورة المورد</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>رقم الفاتورة:</span>
                        <span>{selectedTask.supplierInvoiceNumber || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>المبلغ:</span>
                        <span>{selectedTask.supplierInvoiceAmount?.toLocaleString() || "-"} ريال</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>الفرق</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span>فرق الكمية:</span>
                        <span className={`font-bold ${(selectedTask.quantityDifference || 0) > 0 ? "text-red-500" : "text-green-500"}`}>
                          {selectedTask.quantityDifference?.toLocaleString() || "0"} لتر
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* الملاحظات */}
              {selectedTask.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle>ملاحظات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedTask.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
