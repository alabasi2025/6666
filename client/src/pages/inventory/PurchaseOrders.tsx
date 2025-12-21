import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ShoppingCart,
  Search,
  Loader2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const orderStatuses = [
  { value: "draft", label: "مسودة", color: "bg-gray-500" },
  { value: "pending", label: "قيد الانتظار", color: "bg-yellow-500" },
  { value: "approved", label: "معتمد", color: "bg-blue-500" },
  { value: "ordered", label: "تم الطلب", color: "bg-purple-500" },
  { value: "received", label: "تم الاستلام", color: "bg-green-500" },
  { value: "cancelled", label: "ملغي", color: "bg-red-500" },
];

export default function PurchaseOrders() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch purchase orders
  const { data: orders = [], isLoading } = trpc.inventory.purchaseOrders.list.useQuery({
    businessId: 1,
  });

  // Fetch suppliers
  const { data: suppliers = [] } = trpc.inventory.suppliers.list.useQuery({
    businessId: 1,
  });

  // Fetch warehouses
  const { data: warehouses = [] } = trpc.inventory.warehouses.list.useQuery({
    businessId: 1,
  });

  // Create mutation
  const createMutation = trpc.inventory.purchaseOrders.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "purchaseOrders", "list"]] });
      toast({ title: "تم إنشاء أمر الشراء بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  // Update status mutation
  const updateStatusMutation = trpc.inventory.purchaseOrders.updateStatus.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "purchaseOrders", "list"]] });
      toast({ title: "تم تحديث حالة الأمر بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier?.nameAr?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      businessId: 1,
      supplierId: parseInt(formData.get("supplierId") as string),
      warehouseId: parseInt(formData.get("warehouseId") as string),
      orderDate: formData.get("orderDate") as string,
      expectedDeliveryDate: formData.get("expectedDeliveryDate") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as any,
    });
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find((s) => s.value === status) || { label: status, color: "bg-gray-500" };
  };

  // Stats
  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
  const approvedOrders = orders.filter((o: any) => o.status === "approved").length;
  const totalValue = orders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0);

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
            <ShoppingCart className="w-8 h-8 text-primary" />
            أوامر الشراء
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة طلبات الشراء من الموردين
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gradient-energy">
          <Plus className="w-4 h-4 ml-2" />
          أمر شراء جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأوامر</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيد الانتظار</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">معتمدة</p>
                <p className="text-2xl font-bold">{approvedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القيمة</p>
                <p className="text-2xl font-bold">{totalValue.toLocaleString()} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>قائمة أوامر الشراء</CardTitle>
              <CardDescription>
                {filteredOrders.length} أمر شراء
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الأمر</TableHead>
                <TableHead>المورد</TableHead>
                <TableHead>المستودع</TableHead>
                <TableHead>تاريخ الطلب</TableHead>
                <TableHead>التسليم المتوقع</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد أوامر شراء
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: any) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.supplier?.nameAr || "-"}</TableCell>
                      <TableCell>{order.warehouse?.nameAr || "-"}</TableCell>
                      <TableCell>
                        {order.orderDate
                          ? format(new Date(order.orderDate), "yyyy/MM/dd", { locale: ar })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {order.expectedDeliveryDate
                          ? format(new Date(order.expectedDeliveryDate), "yyyy/MM/dd", { locale: ar })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {order.totalAmount ? `${parseFloat(order.totalAmount).toLocaleString()} ر.س` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} text-white`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(order.id, "approved")}
                                title="اعتماد"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                title="إلغاء"
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إنشاء أمر شراء جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات أمر الشراء
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">المورد *</Label>
                <Select name="supplierId" required>
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
                <Label htmlFor="warehouseId">المستودع *</Label>
                <Select name="warehouseId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستودع" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse: any) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {warehouse.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">تاريخ الطلب *</Label>
                <Input
                  id="orderDate"
                  name="orderDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">تاريخ التسليم المتوقع</Label>
                <Input
                  id="expectedDeliveryDate"
                  name="expectedDeliveryDate"
                  type="date"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="أدخل أي ملاحظات"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                className="gradient-energy"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                إنشاء الأمر
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل أمر الشراء</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">المورد</p>
                  <p className="font-medium">{selectedOrder.supplier?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المستودع</p>
                  <p className="font-medium">{selectedOrder.warehouse?.nameAr || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                  <p className="font-medium">
                    {selectedOrder.orderDate
                      ? format(new Date(selectedOrder.orderDate), "yyyy/MM/dd")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge className={`${getStatusInfo(selectedOrder.status).color} text-white`}>
                    {getStatusInfo(selectedOrder.status).label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المبلغ الإجمالي</p>
                  <p className="font-medium">
                    {selectedOrder.totalAmount
                      ? `${parseFloat(selectedOrder.totalAmount).toLocaleString()} ر.س`
                      : "-"}
                  </p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">ملاحظات</p>
                  <p className="font-medium">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
