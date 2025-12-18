import { useState } from "react";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  FileText,
  ShoppingCart,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Plus,
  Trash2,
  Calendar,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Status mapping
const poStatusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  pending_approval: { label: "بانتظار الاعتماد", variant: "warning" },
  approved: { label: "معتمد", variant: "default" },
  sent: { label: "مرسل للمورد", variant: "default" },
  partial: { label: "استلام جزئي", variant: "warning" },
  completed: { label: "مكتمل", variant: "success" },
  cancelled: { label: "ملغي", variant: "destructive" },
};

// Mock purchase orders data
const mockPurchaseOrders = [
  {
    id: 1,
    code: "PO-2024-001",
    date: "2024-06-15",
    supplier: "شركة الكابلات السعودية",
    supplierCode: "SUP-001",
    status: "completed",
    itemsCount: 3,
    totalAmount: 125000,
    taxAmount: 18750,
    grandTotal: 143750,
    deliveryDate: "2024-06-20",
    receivedDate: "2024-06-19",
    createdBy: "أحمد محمد",
    approvedBy: "خالد عمر",
    notes: "طلب عاجل للمشروع الجديد",
  },
  {
    id: 2,
    code: "PO-2024-002",
    date: "2024-06-14",
    supplier: "شركة المعدات الكهربائية",
    supplierCode: "SUP-002",
    status: "partial",
    itemsCount: 5,
    totalAmount: 89000,
    taxAmount: 13350,
    grandTotal: 102350,
    deliveryDate: "2024-06-21",
    receivedDate: null,
    createdBy: "سالم أحمد",
    approvedBy: "خالد عمر",
    notes: "",
  },
  {
    id: 3,
    code: "PO-2024-003",
    date: "2024-06-13",
    supplier: "شركة المحولات العربية",
    supplierCode: "SUP-004",
    status: "approved",
    itemsCount: 2,
    totalAmount: 250000,
    taxAmount: 37500,
    grandTotal: 287500,
    deliveryDate: "2024-06-30",
    receivedDate: null,
    createdBy: "محمد علي",
    approvedBy: "فهد سعد",
    notes: "محولات للمحطة الجديدة",
  },
  {
    id: 4,
    code: "PO-2024-004",
    date: "2024-06-12",
    supplier: "شركة الأدوات الصناعية",
    supplierCode: "SUP-003",
    status: "pending_approval",
    itemsCount: 8,
    totalAmount: 45000,
    taxAmount: 6750,
    grandTotal: 51750,
    deliveryDate: "2024-06-25",
    receivedDate: null,
    createdBy: "أحمد محمد",
    approvedBy: null,
    notes: "أدوات صيانة دورية",
  },
  {
    id: 5,
    code: "PO-2024-005",
    date: "2024-06-10",
    supplier: "شركة الكابلات السعودية",
    supplierCode: "SUP-001",
    status: "draft",
    itemsCount: 4,
    totalAmount: 78000,
    taxAmount: 11700,
    grandTotal: 89700,
    deliveryDate: null,
    receivedDate: null,
    createdBy: "سالم أحمد",
    approvedBy: null,
    notes: "",
  },
];

// Mock PO items
const mockPOItems = [
  { id: 1, itemCode: "ITM-001", itemName: "كابل نحاس 16مم", unit: "متر", quantity: 500, unitPrice: 45.50, total: 22750 },
  { id: 2, itemCode: "ITM-002", itemName: "قاطع كهربائي 100A", unit: "قطعة", quantity: 50, unitPrice: 350.00, total: 17500 },
  { id: 3, itemCode: "ITM-003", itemName: "زيت محولات", unit: "لتر", quantity: 1000, unitPrice: 12.00, total: 12000 },
];

// Stats
const stats = [
  { title: "أوامر الشراء", value: "156", icon: FileText, color: "primary" },
  { title: "بانتظار الاعتماد", value: "12", icon: Clock, color: "warning" },
  { title: "قيد التوريد", value: "8", icon: Truck, color: "default" },
  { title: "إجمالي المشتريات", value: "2.5M", icon: DollarSign, color: "success" },
];

export default function PurchaseOrders() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  const columns: Column<typeof mockPurchaseOrders[0]>[] = [
    {
      key: "code",
      title: "رقم الأمر",
      render: (value) => <span className="font-mono text-primary">{value}</span>,
    },
    {
      key: "date",
      title: "التاريخ",
      render: (value) => (
        <span className="text-sm">{new Date(value).toLocaleDateString("ar-SA")}</span>
      ),
    },
    {
      key: "supplier",
      title: "المورد",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.supplierCode}</p>
        </div>
      ),
    },
    {
      key: "itemsCount",
      title: "الأصناف",
      render: (value) => (
        <div className="flex items-center gap-1">
          <Package className="w-4 h-4 text-muted-foreground" />
          <span className="ltr-nums">{value}</span>
        </div>
      ),
    },
    {
      key: "grandTotal",
      title: "الإجمالي",
      render: (value) => (
        <span className="font-bold text-primary ltr-nums">{value.toLocaleString()} ر.س</span>
      ),
    },
    {
      key: "deliveryDate",
      title: "تاريخ التسليم",
      render: (value) => (
        <span className="text-sm">
          {value ? new Date(value).toLocaleDateString("ar-SA") : "-"}
        </span>
      ),
    },
    {
      key: "createdBy",
      title: "المنشئ",
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={poStatusMap} />,
    },
  ];

  const handleAdd = () => {
    setSelectedPO(null);
    setOrderItems([]);
    setShowDialog(true);
  };

  const handleView = (po: any) => {
    setSelectedPO(po);
    setShowDetailsDialog(true);
  };

  const handleEdit = (po: any) => {
    setSelectedPO(po);
    setOrderItems(mockPOItems);
    setShowDialog(true);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), itemCode: "", itemName: "", unit: "", quantity: 0, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPO) {
      toast.success("تم تحديث أمر الشراء بنجاح");
    } else {
      toast.success("تم إنشاء أمر الشراء بنجاح");
    }
    setShowDialog(false);
    setSelectedPO(null);
  };

  const handleApprove = (po: any) => {
    toast.success(`تم اعتماد أمر الشراء ${po.code}`);
  };

  const handleSend = (po: any) => {
    toast.success(`تم إرسال أمر الشراء ${po.code} للمورد`);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const colorClasses = {
            primary: "text-primary bg-primary/10",
            success: "text-success bg-success/10",
            warning: "text-warning bg-warning/10",
            default: "text-muted-foreground bg-muted",
          };

          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl", colorClasses[stat.color as keyof typeof colorClasses])}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold ltr-nums">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Table */}
      <DataTable
        data={mockPurchaseOrders}
        columns={columns}
        title="أوامر الشراء"
        description="إدارة جميع أوامر الشراء والتوريد"
        searchPlaceholder="بحث برقم الأمر أو المورد..."
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onRefresh={() => toast.info("جاري تحديث البيانات...")}
        emptyMessage="لا توجد أوامر شراء"
      />

      {/* Add/Edit PO Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPO ? "تعديل أمر الشراء" : "إنشاء أمر شراء جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedPO
                ? `تعديل أمر الشراء ${selectedPO.code}`
                : "أدخل بيانات أمر الشراء الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">المورد *</Label>
                  <Select defaultValue={selectedPO?.supplierCode || ""}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUP-001">شركة الكابلات السعودية</SelectItem>
                      <SelectItem value="SUP-002">شركة المعدات الكهربائية</SelectItem>
                      <SelectItem value="SUP-003">شركة الأدوات الصناعية</SelectItem>
                      <SelectItem value="SUP-004">شركة المحولات العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">تاريخ التسليم المتوقع</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    defaultValue={selectedPO?.deliveryDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">المستودع *</Label>
                  <Select defaultValue="">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">المستودع الرئيسي</SelectItem>
                      <SelectItem value="2">مستودع قطع الغيار</SelectItem>
                      <SelectItem value="3">مستودع المحطة الشمالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>الأصناف</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة صنف
                  </Button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الصنف</TableHead>
                        <TableHead>الوحدة</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            لم يتم إضافة أصناف بعد
                          </TableCell>
                        </TableRow>
                      ) : (
                        orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select defaultValue={item.itemCode}>
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="اختر الصنف" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ITM-001">كابل نحاس 16مم</SelectItem>
                                  <SelectItem value="ITM-002">قاطع كهربائي 100A</SelectItem>
                                  <SelectItem value="ITM-003">زيت محولات</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{item.unit || "قطعة"}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                className="w-24"
                                defaultValue={item.quantity}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                className="w-28"
                                defaultValue={item.unitPrice}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-medium ltr-nums">{item.total.toLocaleString()} ر.س</span>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  placeholder="أدخل أي ملاحظات إضافية"
                  defaultValue={selectedPO?.notes}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" variant="secondary">
                حفظ كمسودة
              </Button>
              <Button type="submit" className="gradient-energy">
                {selectedPO ? "حفظ التغييرات" : "إنشاء وإرسال للاعتماد"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PO Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل أمر الشراء</DialogTitle>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-6 py-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-primary/10">
                    <ShoppingCart className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-mono">{selectedPO.code}</h3>
                    <p className="text-muted-foreground">{new Date(selectedPO.date).toLocaleDateString("ar-SA")}</p>
                    <StatusBadge status={selectedPO.status} statusMap={poStatusMap} />
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">الإجمالي</p>
                  <p className="text-2xl font-bold text-primary ltr-nums">{selectedPO.grandTotal.toLocaleString()} ر.س</p>
                </div>
              </div>

              {/* Supplier Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    المورد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">اسم المورد</Label>
                      <p className="font-medium">{selectedPO.supplier}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">رمز المورد</Label>
                      <p className="font-mono">{selectedPO.supplierCode}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    الأصناف ({selectedPO.itemsCount})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الصنف</TableHead>
                        <TableHead>الوحدة</TableHead>
                        <TableHead>الكمية</TableHead>
                        <TableHead>سعر الوحدة</TableHead>
                        <TableHead>الإجمالي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockPOItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              <p className="text-xs text-muted-foreground font-mono">{item.itemCode}</p>
                            </div>
                          </TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="ltr-nums">{item.quantity.toLocaleString()}</TableCell>
                          <TableCell className="ltr-nums">{item.unitPrice.toLocaleString()} ر.س</TableCell>
                          <TableCell className="font-medium ltr-nums">{item.total.toLocaleString()} ر.س</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع</span>
                    <span className="ltr-nums">{selectedPO.totalAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الضريبة (15%)</span>
                    <span className="ltr-nums">{selectedPO.taxAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-bold">الإجمالي</span>
                    <span className="font-bold text-primary ltr-nums">{selectedPO.grandTotal.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>

              {/* Dates & Users */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">تاريخ التسليم المتوقع</Label>
                  <p>{selectedPO.deliveryDate ? new Date(selectedPO.deliveryDate).toLocaleDateString("ar-SA") : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">تاريخ الاستلام</Label>
                  <p>{selectedPO.receivedDate ? new Date(selectedPO.receivedDate).toLocaleDateString("ar-SA") : "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">أنشئ بواسطة</Label>
                  <p>{selectedPO.createdBy}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">اعتمد بواسطة</Label>
                  <p>{selectedPO.approvedBy || "-"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              إغلاق
            </Button>
            {selectedPO?.status === "pending_approval" && (
              <Button className="bg-success hover:bg-success/90" onClick={() => handleApprove(selectedPO)}>
                <CheckCircle className="w-4 h-4 ml-2" />
                اعتماد
              </Button>
            )}
            {selectedPO?.status === "approved" && (
              <Button className="gradient-energy" onClick={() => handleSend(selectedPO)}>
                <Truck className="w-4 h-4 ml-2" />
                إرسال للمورد
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
