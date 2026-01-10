// client/src/pages/inventory/InventoryAudit.tsx
// صفحة الجرد الدوري للمخزون

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Download,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Package,
  Warehouse,
  Calendar,
  Users,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const INVENTORY_AUDIT_INFO = {
  title: "الجرد الدوري للمخزون",
  description: "إجراء الجرد الدوري للمخزون ومقارنة الأرصدة الفعلية مع النظام.",
  process: `1) عند تحميل الصفحة:
   - استدعاء tRPC: inventory.stockBalance.list لجلب أرصدة المخزون
   - عرض الأرصدة في جدول

2) بدء جرد جديد:
   - النقر على "بدء جرد جديد"
   - اختيار المستودع والفترة الزمنية
   - تسجيل القراءات الفعلية
   - حفظ الجرد

3) معالجة الفروقات:
   - مقارنة الأرصدة الفعلية مع النظام
   - تسجيل الفروقات
   - إنشاء حركة تعديل`,
  mechanism: `- استعلام tRPC: inventory.stockBalance.list.useQuery()
- نموذج لبدء الجرد
- حفظ نتائج الجرد
- معالجة الفروقات تلقائياً`,
  relatedScreens: [
    { name: "أرصدة المخزون", path: "/dashboard/inventory/stock-balance", description: "عرض أرصدة المخزون" },
    { name: "الحركات", path: "/dashboard/inventory/movements", description: "حركات المخزون" },
  ],
  businessLogic: "الجرد الدوري يساعد في التأكد من دقة أرصدة المخزون ومعالجة الفروقات بين النظام والواقع.",
};

interface AuditItem {
  id: number;
  itemId: number;
  itemName: string;
  itemCode: string;
  systemBalance: number;
  actualBalance: number;
  difference: number;
  unit: string;
}

interface Audit {
  id: number;
  warehouseId: number;
  warehouseName: string;
  auditDate: string;
  auditNumber: string;
  status: "draft" | "in_progress" | "completed" | "approved";
  totalItems: number;
  itemsWithDifference: number;
  totalDifference: number;
  createdBy: string;
  createdAt: string;
}

export default function InventoryAudit() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");

  const businessId = useBusinessId();

  const [auditForm, setAuditForm] = useState({
    warehouseId: "",
    auditDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Fetch data
  const { data: warehouses } = trpc.inventory.warehouses.list.useQuery({ businessId });
  const { data: stockBalance } = trpc.inventory.stockBalance.list.useQuery({
    businessId,
    warehouseId: warehouseFilter !== "all" ? parseInt(warehouseFilter) : undefined,
  });

  // Mock audits data (TODO: Create backend API)
  const [audits, setAudits] = useState<Audit[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

  const handleStartAudit = () => {
    if (!auditForm.warehouseId) {
      toast.error("الرجاء اختيار المستودع");
      return;
    }

    // Create audit items from stock balance
    const items: AuditItem[] = (stockBalance?.items || []).map((item: any) => ({
      id: Date.now() + Math.random(),
      itemId: item.id,
      itemName: item.name_ar || item.name,
      itemCode: item.code || "",
      systemBalance: parseFloat(item.quantity || "0"),
      actualBalance: parseFloat(item.quantity || "0"),
      difference: 0,
      unit: item.unit || "قطعة",
    }));

    setAuditItems(items);
    setIsDialogOpen(true);
    toast.success("تم بدء الجرد، يمكنك الآن تسجيل القراءات الفعلية");
  };

  const handleSaveAudit = () => {
    const warehouse = warehouses?.warehouses?.find((w: any) => w.id === parseInt(auditForm.warehouseId));
    
    const audit: Audit = {
      id: Date.now(),
      warehouseId: parseInt(auditForm.warehouseId),
      warehouseName: warehouse?.name_ar || "",
      auditDate: auditForm.auditDate,
      auditNumber: `AUDIT-${Date.now()}`,
      status: "draft",
      totalItems: auditItems.length,
      itemsWithDifference: auditItems.filter(item => item.difference !== 0).length,
      totalDifference: auditItems.reduce((sum, item) => sum + item.difference, 0),
      createdBy: "المستخدم الحالي", // TODO: Get from context
      createdAt: new Date().toISOString(),
    };

    setAudits([audit, ...audits]);
    setIsDialogOpen(false);
    setAuditItems([]);
    toast.success("تم حفظ الجرد بنجاح");
  };

  const handleUpdateActualBalance = (itemId: number, value: string) => {
    setAuditItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const actual = parseFloat(value) || 0;
          return {
            ...item,
            actualBalance: actual,
            difference: actual - item.systemBalance,
          };
        }
        return item;
      })
    );
  };

  const filteredAudits = useMemo(() => {
    let filtered = audits;

    if (searchTerm) {
      filtered = filtered.filter(
        (audit) =>
          audit.auditNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          audit.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((audit) => audit.status === statusFilter);
    }

    if (warehouseFilter !== "all") {
      filtered = filtered.filter((audit) => audit.warehouseId === parseInt(warehouseFilter));
    }

    return filtered;
  }, [audits, searchTerm, statusFilter, warehouseFilter]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      draft: { label: "مسودة", variant: "outline" },
      in_progress: { label: "قيد التنفيذ", variant: "secondary" },
      completed: { label: "مكتمل", variant: "default" },
      approved: { label: "معتمد", variant: "default" },
    };
    const badge = badges[status] || { label: status, variant: "outline" };
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const currentPageInfo = resolvePageInfo("/dashboard/inventory/audit");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-blue-500" />
            الجرد الدوري للمخزون
          </h1>
          <p className="text-muted-foreground mt-2">
            إجراء الجرد الدوري ومقارنة الأرصدة الفعلية مع النظام
          </p>
        </div>
        <div className="flex gap-2">
          <EngineInfoDialog info={currentPageInfo} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleStartAudit}>
                <Plus className="w-4 h-4 mr-2" />
                بدء جرد جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>الجرد الدوري للمخزون</DialogTitle>
                <DialogDescription>
                  تسجيل القراءات الفعلية ومقارنتها مع أرصدة النظام
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>المستودع *</Label>
                    <Select
                      value={auditForm.warehouseId}
                      onValueChange={(v) => setAuditForm({ ...auditForm, warehouseId: v })}
                      disabled={auditItems.length > 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستودع" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.warehouses?.map((w: any) => (
                          <SelectItem key={w.id} value={w.id.toString()}>
                            {w.name_ar || w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>تاريخ الجرد *</Label>
                    <Input
                      type="date"
                      value={auditForm.auditDate}
                      onChange={(e) => setAuditForm({ ...auditForm, auditDate: e.target.value })}
                    />
                  </div>
                </div>

                {auditItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>بنود الجرد ({auditItems.length} صنف)</Label>
                    <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>الرمز</TableHead>
                            <TableHead>الصنف</TableHead>
                            <TableHead>رصيد النظام</TableHead>
                            <TableHead>الرصيد الفعلي</TableHead>
                            <TableHead>الفرق</TableHead>
                            <TableHead>الوحدة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-mono">{item.itemCode}</TableCell>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{item.systemBalance.toLocaleString()}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={item.actualBalance}
                                  onChange={(e) => handleUpdateActualBalance(item.id, e.target.value)}
                                  className="w-24"
                                  step="0.01"
                                />
                              </TableCell>
                              <TableCell>
                                <span className={item.difference === 0 ? "text-green-600" : item.difference > 0 ? "text-blue-600" : "text-red-600"}>
                                  {item.difference > 0 ? "+" : ""}
                                  {item.difference.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell>{item.unit}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div>
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={auditForm.notes}
                    onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
                    rows={3}
                    placeholder="ملاحظات حول الجرد..."
                  />
                </div>

                {auditItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ملخص الجرد</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                          <p className="text-2xl font-bold">{auditItems.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">أصناف بفروقات</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {auditItems.filter(item => item.difference !== 0).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">إجمالي الفروقات</p>
                          <p className="text-2xl font-bold text-red-600">
                            {auditItems.reduce((sum, item) => sum + item.difference, 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveAudit} disabled={auditItems.length === 0}>
                  <Save className="w-4 h-4 mr-2" />
                  حفظ الجرد
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي عمليات الجرد</p>
                <p className="text-2xl font-bold">{audits.length}</p>
              </div>
              <ClipboardCheck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الجردات المكتملة</p>
                <p className="text-2xl font-bold text-green-600">
                  {audits.filter(a => a.status === "completed" || a.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-orange-600">
                  {audits.filter(a => a.status === "in_progress").length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الجردات بفروقات</p>
                <p className="text-2xl font-bold text-red-600">
                  {audits.filter(a => a.itemsWithDifference > 0).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الجرد أو المستودع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="approved">معتمد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المستودع</Label>
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستودعات</SelectItem>
                  {warehouses?.warehouses?.map((w: any) => (
                    <SelectItem key={w.id} value={w.id.toString()}>
                      {w.name_ar || w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audits Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الجردات</CardTitle>
          <CardDescription>
            {filteredAudits.length} عملية جرد
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAudits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عمليات جرد
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الجرد</TableHead>
                  <TableHead>المستودع</TableHead>
                  <TableHead>تاريخ الجرد</TableHead>
                  <TableHead>عدد الأصناف</TableHead>
                  <TableHead>أصناف بفروقات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.auditNumber}</TableCell>
                    <TableCell>{audit.warehouseName}</TableCell>
                    <TableCell>
                      {new Date(audit.auditDate).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>{audit.totalItems}</TableCell>
                    <TableCell>
                      <Badge variant={audit.itemsWithDifference > 0 ? "destructive" : "default"}>
                        {audit.itemsWithDifference}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(audit.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <ClipboardCheck className="w-4 h-4 mr-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

