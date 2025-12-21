import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Eye, Truck, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/_core/hooks/useAuth";

interface ReceivingTask {
  id: number;
  taskNumber: string;
  taskDate: string;
  status: string;
  supplierId: number;
  tankerId: number;
  employeeId: number;
  stationId: number;
  quantityFromSupplier?: string | null;
  quantityReceivedAtStation?: string | null;
  notes?: string | null;
}

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  started: "بدأت",
  at_supplier: "عند المورد",
  loading: "جاري التحميل",
  returning: "في طريق العودة",
  at_station: "وصل المحطة",
  unloading: "جاري التفريغ",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const statusColors: Record<string, string> = {
  pending: "bg-gray-500",
  started: "bg-blue-500",
  at_supplier: "bg-yellow-500",
  loading: "bg-orange-500",
  returning: "bg-indigo-500",
  at_station: "bg-purple-500",
  unloading: "bg-pink-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function DieselReceivingTasks() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ReceivingTask | null>(null);
  const [formData, setFormData] = useState({
    taskNumber: "",
    taskDate: new Date().toISOString().split("T")[0],
    supplierId: "",
    tankerId: "",
    employeeId: "",
    stationId: "",
    notes: "",
  });

  const utils = trpc.useUtils();

  const { data: tasks = [], isLoading } = trpc.diesel.receivingTasks.list.useQuery({
    businessId: user?.businessId ?? undefined,
  });

  const { data: suppliers = [] } = trpc.diesel.suppliers.list.useQuery({
    businessId: user?.businessId ?? undefined,
  });

  const { data: tankers = [] } = trpc.diesel.tankers.list.useQuery({
    businessId: user?.businessId ?? undefined,
  });

  const { data: stations = [] } = trpc.station.list.useQuery({
    businessId: user?.businessId ?? undefined,
  });

  const createMutation = trpc.diesel.receivingTasks.create.useMutation({
    onSuccess: () => {
      utils.diesel.receivingTasks.list.invalidate();
      setIsAddOpen(false);
      resetForm();
      toast({ title: "تم إنشاء المهمة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.diesel.receivingTasks.delete.useMutation({
    onSuccess: () => {
      utils.diesel.receivingTasks.list.invalidate();
      toast({ title: "تم حذف المهمة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      taskNumber: "",
      taskDate: new Date().toISOString().split("T")[0],
      supplierId: "",
      tankerId: "",
      employeeId: "",
      stationId: "",
      notes: "",
    });
    setSelectedTask(null);
  };

  const generateTaskNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `DRT-${year}${month}${day}-${random}`;
  };

  const handleAdd = () => {
    if (!formData.taskNumber || !formData.supplierId || !formData.tankerId || !formData.stationId) {
      toast({ title: "خطأ", description: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      businessId: user?.businessId || 1,
      stationId: parseInt(formData.stationId),
      taskNumber: formData.taskNumber,
      taskDate: formData.taskDate,
      supplierId: parseInt(formData.supplierId),
      tankerId: parseInt(formData.tankerId),
      employeeId: user?.id || 1,
      notes: formData.notes || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
      deleteMutation.mutate({ id });
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

  const getTankerInfo = (id: number) => {
    const tanker = tankers.find((t: any) => t.id === id);
    return tanker ? `${tanker.code} - ${tanker.plateNumber}` : "-";
  };

  const getStationName = (id: number) => {
    const station = stations.find((s: any) => s.id === id);
    return station?.nameAr || "-";
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مهام استلام الديزل</h1>
          <p className="text-muted-foreground">إدارة وتتبع مهام استلام الديزل من الموردين</p>
        </div>
        <Button onClick={() => { 
          resetForm(); 
          setFormData(prev => ({ ...prev, taskNumber: generateTaskNumber() }));
          setIsAddOpen(true); 
        }}>
          <Plus className="ml-2 h-4 w-4" />
          إنشاء مهمة جديدة
        </Button>
      </div>

      {/* ملخص الحالات */}
      <div className="grid grid-cols-5 gap-4">
        {["pending", "started", "loading", "returning", "completed"].map((status) => {
          const count = tasks.filter((t: any) => t.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{statusLabels[status]}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                  <TableHead>المحطة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono">{task.taskNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(task.taskDate).toLocaleDateString("ar-SA")}
                      </div>
                    </TableCell>
                    <TableCell>{getSupplierName(task.supplierId)}</TableCell>
                    <TableCell>{getTankerInfo(task.tankerId)}</TableCell>
                    <TableCell>{getStationName(task.stationId)}</TableCell>
                    <TableCell>
                      {task.quantityFromSupplier 
                        ? `${parseFloat(task.quantityFromSupplier).toLocaleString()} لتر` 
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>
                        {statusLabels[task.status]}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(task.id)}
                          disabled={task.status !== "pending" && task.status !== "cancelled"}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Dialog إنشاء مهمة */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء مهمة استلام جديدة</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>رقم المهمة *</Label>
              <Input
                value={formData.taskNumber}
                onChange={(e) => setFormData({ ...formData, taskNumber: e.target.value })}
                placeholder="DRT-20241222-001"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ *</Label>
              <Input
                type="date"
                value={formData.taskDate}
                onChange={(e) => setFormData({ ...formData, taskDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>المحطة *</Label>
              <Select
                value={formData.stationId}
                onValueChange={(value) => setFormData({ ...formData, stationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحطة" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station: any) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="col-span-2 space-y-2">
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
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        {tanker.code} - {tanker.plateNumber} ({parseFloat(tanker.capacity).toLocaleString()} لتر)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>ملاحظات</Label>
              <Input
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
        <DialogContent className="max-w-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل المهمة</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">رقم المهمة</p>
                  <p className="text-xl font-mono font-bold">{selectedTask.taskNumber}</p>
                </div>
                <Badge className={`${statusColors[selectedTask.status]} text-lg px-4 py-2`}>
                  {statusLabels[selectedTask.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedTask.taskDate).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">المحطة</p>
                  <p>{getStationName(selectedTask.stationId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">المورد</p>
                  <p>{getSupplierName(selectedTask.supplierId)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الوايت</p>
                  <p className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    {getTankerInfo(selectedTask.tankerId)}
                  </p>
                </div>
              </div>

              {(selectedTask.quantityFromSupplier || selectedTask.quantityReceivedAtStation) && (
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2">الكميات</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">من المورد</p>
                      <p className="text-lg font-bold">
                        {selectedTask.quantityFromSupplier 
                          ? `${parseFloat(selectedTask.quantityFromSupplier).toLocaleString()} لتر`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المستلمة في المحطة</p>
                      <p className="text-lg font-bold">
                        {selectedTask.quantityReceivedAtStation 
                          ? `${parseFloat(selectedTask.quantityReceivedAtStation).toLocaleString()} لتر`
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTask.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ملاحظات</p>
                  <p className="p-3 bg-muted rounded">{selectedTask.notes}</p>
                </div>
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
