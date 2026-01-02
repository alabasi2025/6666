import { useMemo, useState } from "react";
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
  { value: "receipt", label: "استلام", color: "bg-green-500", icon: ArrowDownCircle },
  { value: "issue", label: "صرف", color: "bg-red-500", icon: ArrowUpCircle },
  { value: "transfer_in", label: "تحويل وارد", color: "bg-blue-500", icon: RefreshCw },
  { value: "transfer_out", label: "تحويل صادر", color: "bg-indigo-500", icon: RefreshCw },
  { value: "adjustment_in", label: "تسوية زيادة", color: "bg-emerald-500", icon: ArrowDownCircle },
  { value: "adjustment_out", label: "تسوية نقص", color: "bg-amber-500", icon: ArrowUpCircle },
  { value: "return", label: "مرتجع", color: "bg-teal-500", icon: ArrowDownCircle },
  { value: "scrap", label: "هالك", color: "bg-slate-500", icon: ArrowUpCircle },
];

type MovementsProps = {
  businessId?: number;
};

export default function Movements({ businessId = 1 }: MovementsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);

  const resolvedBusinessId = businessId ?? 1;

  // Fetch movements
  const { data: movements = [], isLoading } = trpc.inventory.movements.list.useQuery({
    businessId: resolvedBusinessId,
    limit: 200,
  });

  // Fetch items for dropdown
  const { data: items = [] } = trpc.inventory.items.list.useQuery({
    businessId: resolvedBusinessId,
  });

  // Fetch warehouses for dropdown
  const { data: warehouses = [] } = trpc.inventory.warehouses.list.useQuery({
    businessId: resolvedBusinessId,
  });

  const itemsMap = useMemo(
    () => new Map((items as any[]).map((i: any) => [i.id, i])),
    [items]
  );
  const warehousesMap = useMemo(
    () => new Map((warehouses as any[]).map((w: any) => [w.id, w])),
    [warehouses]
  );

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

  const enrichedMovements = useMemo(() => {
    return (movements as any[]).map((mov) => {
      const item = itemsMap.get(mov.itemId);
      const warehouse = warehousesMap.get(mov.warehouseId);
      return {
        ...mov,
        itemName: item?.nameAr || "-",
        itemCode: item?.code || "",
        warehouseName: warehouse?.nameAr || "-",
      };
    });
  }, [itemsMap, movements, warehousesMap]);

  const filteredMovements = enrichedMovements.filter((mov: any) => {
    const matchesSearch = `${mov.itemName} ${mov.itemCode}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || mov.movementType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      businessId: resolvedBusinessId,
      itemId: parseInt((formData as any).get("itemId") as string),
      warehouseId: parseInt((formData as any).get("warehouseId") as string),
      movementType: (formData as any).get("movementType") as any,
      quantity: (formData as any).get("quantity") as string,
      unitCost: (formData as any).get("unitCost") as string || undefined,
      documentNumber: (formData as any).get("documentNumber") as string || undefined,
      notes: (formData as any).get("notes") as string || undefined,
      movementDate: (formData as any).get("movementDate") as string,
    } as any);
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find((t) => t.value === type) || { label: type, color: "bg-gray-500", icon: RefreshCw };
  };

  // Stats
  const inboundTypes = ["receipt", "transfer_in", "adjustment_in", "return"];
  const outboundTypes = ["issue", "transfer_out", "adjustment_out", "scrap"];
  const totalIn = (movements as any[]).filter((m: any) => inboundTypes.includes(m.movementType))
    .reduce((sum: number, m: any) => sum + parseFloat(m.quantity || "0"), 0);
  const totalOut = (movements as any[]).filter((m: any) => outboundTypes.includes(m.movementType))
    .reduce((sum: number, m: any) => sum + parseFloat(m.quantity || "0"), 0);

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
                (filteredMovements as any[]).map((movement: any) => {
                  const typeInfo = getMovementTypeInfo(movement.movementType);
                  const Icon = (typeInfo as any).icon || RefreshCw;
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {movement.movementDate
                          ? format(new Date(movement.movementDate), "yyyy/MM/dd", { locale: ar })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movement.itemName}</p>
                          <p className="text-sm text-muted-foreground">{movement.itemCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} text-white flex items-center gap-1`}>
                          <Icon className="w-4 h-4" />
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{movement.warehouseName}</TableCell>
                      <TableCell className="font-medium">
                        {Number(movement.quantity || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {movement.unitCost ? `${parseFloat(movement.unitCost).toLocaleString()} ر.س` : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {movement.documentNumber || movement.notes || "-"}
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
                    {(items as any[]).map((item: any) => (
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
                    {(warehouses as any[]).map((warehouse: any) => (
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
                <Label htmlFor="documentNumber">رقم المستند / المرجع</Label>
                <Input
                  id="documentNumber"
                  name="documentNumber"
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
