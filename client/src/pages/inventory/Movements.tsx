// @ts-nocheck
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
  ArrowRightLeft,
  Search,
  Loader2,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const movementTypes = [
  { value: "in", label: "إدخال", color: "bg-green-500", icon: ArrowDownCircle },
  { value: "out", label: "إخراج", color: "bg-red-500", icon: ArrowUpCircle },
  { value: "transfer", label: "تحويل", color: "bg-blue-500", icon: RefreshCw },
  { value: "adjustment", label: "تسوية", color: "bg-yellow-500", icon: RefreshCw },
];

export default function Movements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);

  // Fetch movements
  const { data: movements = [], isLoading } = trpc.inventory.movements.list.useQuery({
    businessId: 1,
  });

  // Fetch items for dropdown
  const { data: items = [] } = trpc.inventory.items.list.useQuery({
    businessId: 1,
  });

  // Fetch warehouses for dropdown
  const { data: warehouses = [] } = trpc.inventory.warehouses.list.useQuery({
    businessId: 1,
  });

  // Create mutation
  const createMutation = trpc.inventory.movements.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["inventory", "movements", "list"]] });
      queryClient.invalidateQueries({ queryKey: [["inventory", "items", "list"]] });
      toast({ title: "تم تسجيل الحركة بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const filteredMovements = movements.filter((mov: any) => {
    const matchesSearch =
      mov.item?.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || mov.movementType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      itemId: parseInt(formData.get("itemId") as string),
      warehouseId: parseInt(formData.get("warehouseId") as string),
      movementType: formData.get("movementType") as any,
      quantity: parseFloat(formData.get("quantity") as string),
      unitCost: formData.get("unitCost") as string || undefined,
      reference: formData.get("reference") as string || undefined,
      notes: formData.get("notes") as string || undefined,
      movementDate: formData.get("movementDate") as string,
    });
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find((t) => t.value === type) || { label: type, color: "bg-gray-500", icon: RefreshCw };
  };

  // Stats
  const totalIn = movements.filter((m: any) => m.movementType === "in").reduce((sum: number, m: any) => sum + (m.quantity || 0), 0);
  const totalOut = movements.filter((m: any) => m.movementType === "out").reduce((sum: number, m: any) => sum + (m.quantity || 0), 0);

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
            <ArrowRightLeft className="w-8 h-8 text-primary" />
            حركات المخزون
          </h1>
          <p className="text-muted-foreground mt-1">
            تتبع جميع حركات الإدخال والإخراج والتحويل
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gradient-energy">
          <Plus className="w-4 h-4 ml-2" />
          تسجيل حركة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الحركات</p>
                <p className="text-2xl font-bold">{movements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإدخال</p>
                <p className="text-2xl font-bold">{totalIn.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإخراج</p>
                <p className="text-2xl font-bold">{totalOut.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">صافي الحركة</p>
                <p className="text-2xl font-bold">{(totalIn - totalOut).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>سجل الحركات</CardTitle>
              <CardDescription>
                {filteredMovements.length} حركة مسجلة
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="نوع الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {movementTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
                <TableHead>التاريخ</TableHead>
                <TableHead>الصنف</TableHead>
                <TableHead>نوع الحركة</TableHead>
                <TableHead>المستودع</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>المرجع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد حركات مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((movement: any) => {
                  const typeInfo = getMovementTypeInfo(movement.movementType);
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {movement.movementDate
                          ? format(new Date(movement.movementDate), "yyyy/MM/dd", { locale: ar })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movement.item?.nameAr || "-"}</p>
                          <p className="text-sm text-muted-foreground">{movement.item?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} text-white`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.warehouse?.nameAr || "-"}</TableCell>
                      <TableCell className="font-medium">
                        {movement.quantity?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        {movement.unitCost ? `${parseFloat(movement.unitCost).toLocaleString()} ر.س` : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.reference || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Movement Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تسجيل حركة جديدة</DialogTitle>
            <DialogDescription>
              أدخل بيانات حركة المخزون
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemId">الصنف *</Label>
                <Select name="itemId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصنف" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item: any) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.nameAr} ({item.code})
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
                <Label htmlFor="movementType">نوع الحركة *</Label>
                <Select name="movementType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {movementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">الكمية *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">تكلفة الوحدة</Label>
                <Input
                  id="unitCost"
                  name="unitCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="movementDate">تاريخ الحركة *</Label>
                <Input
                  id="movementDate"
                  name="movementDate"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">المرجع</Label>
                <Input
                  id="reference"
                  name="reference"
                  placeholder="رقم الفاتورة أو أمر الشراء"
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
                تسجيل الحركة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
