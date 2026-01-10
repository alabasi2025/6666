/**
 * تتبع الأرقام التسلسلية
 * Serial Numbers Tracking
 * 
 * نظام شامل لتتبع الأرقام التسلسلية للأصناف المخزنية
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";
import { 
  Plus, Search, Eye, Package, AlertTriangle, CheckCircle, 
  XCircle, Loader2, Barcode, History, Download
} from "lucide-react";

export default function SerialNumbersTracking() {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = useBusinessId();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [itemFilter, setItemFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<any>(null);
  const [newSerial, setNewSerial] = useState({
    itemId: "",
    serialNumber: "",
    warehouseId: "",
    manufacturer: "",
    notes: "",
  });
  
  const { data, isLoading, refetch } = trpc.serialNumbers.list.useQuery({
    businessId,
    search: searchTerm || undefined,
    status: statusFilter && statusFilter !== "all" ? statusFilter as any : undefined,
    itemId: itemFilter && itemFilter !== "all" ? parseInt(itemFilter) : undefined,
    page,
    limit: 20,
  });
  
  const { data: stats } = trpc.serialNumbers.getStats.useQuery({ businessId });
  
  const { data: items } = trpc.inventory.items.list.useQuery({ businessId, limit: 999 });
  const { data: warehouses } = trpc.inventory.warehouses.list.useQuery({ businessId });
  
  const createMutation = trpc.serialNumbers.create.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم إضافة الرقم التسلسلي بنجاح" });
      refetch();
      setShowAddDialog(false);
      setNewSerial({
        itemId: "",
        serialNumber: "",
        warehouseId: "",
        manufacturer: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });
  
  const issueMutation = trpc.serialNumbers.issue.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم صرف الصنف بنجاح" });
      refetch();
    },
  });
  
  const defectMutation = trpc.serialNumbers.markDefective.useMutation({
    onSuccess: () => {
      toast({ title: "نجاح", description: "تم تسجيل الصنف كتالف" });
      refetch();
    },
  });
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      businessId,
      itemId: parseInt(newSerial.itemId),
      serialNumber: newSerial.serialNumber,
      warehouseId: parseInt(newSerial.warehouseId),
      manufacturer: newSerial.manufacturer || undefined,
      notes: newSerial.notes || undefined,
    });
  };
  
  const getStatusBadge = (status: string) => {
    const config = {
      in_stock: { label: "في المخزون", variant: "default" as const, icon: Package },
      issued: { label: "مصروف", variant: "secondary" as const, icon: CheckCircle },
      installed: { label: "مركب", variant: "default" as const, icon: CheckCircle },
      defective: { label: "تالف", variant: "destructive" as const, icon: AlertTriangle },
      returned: { label: "مرتجع", variant: "secondary" as const, icon: XCircle },
      scrapped: { label: "مستبعد", variant: "outline" as const, icon: XCircle },
    };
    
    const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.in_stock;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };
  
  const currentPageInfo = resolvePageInfo(location);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Barcode className="w-8 h-8" />
            تتبع الأرقام التسلسلية
          </h1>
          <p className="text-muted-foreground mt-2">
            نظام شامل لتتبع الأرقام التسلسلية للأصناف المخزنية (عدادات، معدات، إلخ)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة رقم تسلسلي
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats?.map((stat: any) => (
          <Card key={stat.status}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getStatusBadge(stat.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والفلترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>بحث بالرقم التسلسلي</Label>
              <Input
                placeholder="ابحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>الصنف</Label>
              <Select value={itemFilter} onValueChange={setItemFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="جميع الأصناف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأصناف</SelectItem>
                  {items?.items?.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="in_stock">في المخزون</SelectItem>
                  <SelectItem value="issued">مصروف</SelectItem>
                  <SelectItem value="installed">مركب</SelectItem>
                  <SelectItem value="defective">تالف</SelectItem>
                  <SelectItem value="returned">مرتجع</SelectItem>
                  <SelectItem value="scrapped">مستبعد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">
                <Search className="w-4 h-4 ml-2" />
                بحث
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>قائمة الأرقام التسلسلية ({data?.total || 0})</CardTitle>
            <CardDescription>جميع الأرقام التسلسلية المسجلة في النظام</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرقم التسلسلي</TableHead>
                    <TableHead>الصنف</TableHead>
                    <TableHead>المستودع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الاستلام</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.serialNumbers?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        لا توجد أرقام تسلسلية مسجلة
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.serialNumbers?.map((serial: any) => (
                      <TableRow key={serial.id}>
                        <TableCell className="font-mono font-semibold">
                          {serial.serial_number}
                        </TableCell>
                        <TableCell>{serial.item_name}</TableCell>
                        <TableCell>{serial.warehouse_name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(serial.status)}</TableCell>
                        <TableCell>
                          {serial.received_date 
                            ? new Date(serial.received_date).toLocaleDateString('ar-SA')
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSerial(serial);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  عرض {((page - 1) * 20) + 1} إلى {Math.min(page * 20, data?.total || 0)} من {data?.total || 0}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= (data?.total || 0)}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة رقم تسلسلي جديد</DialogTitle>
            <DialogDescription>
              تسجيل رقم تسلسلي لصنف مخزني (عداد، معدة، إلخ)
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الصنف *</Label>
                  <Select
                    value={newSerial.itemId}
                    onValueChange={(value) => setNewSerial({ ...newSerial, itemId: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر الصنف" />
                    </SelectTrigger>
                    <SelectContent>
                      {items?.items?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name_ar} ({item.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>المستودع *</Label>
                  <Select
                    value={newSerial.warehouseId}
                    onValueChange={(value) => setNewSerial({ ...newSerial, warehouseId: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses?.warehouses?.map((warehouse: any) => (
                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                          {warehouse.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>الرقم التسلسلي * (Serial Number / Barcode)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newSerial.serialNumber}
                    onChange={(e) => setNewSerial({ ...newSerial, serialNumber: e.target.value })}
                    placeholder="أدخل الرقم التسلسلي أو امسح الباركود"
                    className="font-mono"
                  />
                  <Button type="button" variant="outline">
                    <Barcode className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>الشركة المصنعة (اختياري)</Label>
                <Input
                  value={newSerial.manufacturer}
                  onChange={(e) => setNewSerial({ ...newSerial, manufacturer: e.target.value })}
                  placeholder="مثال: ABB, Schneider, Siemens"
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>ملاحظات (اختياري)</Label>
                <Input
                  value={newSerial.notes}
                  onChange={(e) => setNewSerial({ ...newSerial, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية..."
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || !newSerial.itemId || !newSerial.serialNumber || !newSerial.warehouseId}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Barcode className="w-5 h-5" />
              تفاصيل الرقم التسلسلي
            </DialogTitle>
          </DialogHeader>
          {selectedSerial && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الرقم التسلسلي</Label>
                  <p className="font-mono font-bold text-lg">{selectedSerial.serial_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div className="mt-1">{getStatusBadge(selectedSerial.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">الصنف</Label>
                  <p className="font-semibold">{selectedSerial.item_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">المستودع</Label>
                  <p className="font-semibold">{selectedSerial.warehouse_name || "-"}</p>
                </div>
              </div>
              
              <Separator />
              
              <Tabs defaultValue="info">
                <TabsList>
                  <TabsTrigger value="info">المعلومات</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="w-4 h-4 ml-2" />
                    السجل
                  </TabsTrigger>
                  <TabsTrigger value="actions">الإجراءات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">الشركة المصنعة</Label>
                      <p>{selectedSerial.manufacturer || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">تاريخ الاستلام</Label>
                      <p>
                        {selectedSerial.received_date 
                          ? new Date(selectedSerial.received_date).toLocaleDateString('ar-SA')
                          : "-"
                        }
                      </p>
                    </div>
                    {selectedSerial.customer_name && (
                      <>
                        <div>
                          <Label className="text-muted-foreground">العميل</Label>
                          <p>{selectedSerial.customer_name}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">تاريخ التركيب</Label>
                          <p>
                            {selectedSerial.installed_date 
                              ? new Date(selectedSerial.installed_date).toLocaleDateString('ar-SA')
                              : "-"
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="history">
                  <p className="text-muted-foreground text-center py-8">
                    سجل الحركات سيتم عرضه هنا...
                  </p>
                </TabsContent>
                
                <TabsContent value="actions">
                  <div className="space-y-2">
                    {selectedSerial.status === "in_stock" && (
                      <Button className="w-full" onClick={() => {}}>
                        صرف الصنف
                      </Button>
                    )}
                    {selectedSerial.status !== "defective" && selectedSerial.status !== "scrapped" && (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {}}
                      >
                        <AlertTriangle className="w-4 h-4 ml-2" />
                        تسجيل كتالف
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

