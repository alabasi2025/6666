import { useState } from "react";
import { trpc } from "@/lib/trpc";
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
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

const movementTypes = [
  { value: "purchase", label: "شراء", color: "bg-green-500" },
  { value: "transfer", label: "نقل", color: "bg-blue-500" },
  { value: "maintenance", label: "صيانة", color: "bg-yellow-500" },
  { value: "upgrade", label: "ترقية", color: "bg-purple-500" },
  { value: "revaluation", label: "إعادة تقييم", color: "bg-indigo-500" },
  { value: "impairment", label: "اضمحلال", color: "bg-red-500" },
  { value: "disposal", label: "استبعاد", color: "bg-gray-500" },
  { value: "depreciation", label: "إهلاك", color: "bg-orange-500" },
];

export default function AssetMovements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);

  // Fetch movements
  const { data: movements = [], isLoading } = trpc.assets.movements.list.useQuery({
    businessId: 1,
  });

  // Fetch assets for dropdown
  const { data: assets = [] } = trpc.assets.list.useQuery({
    businessId: 1,
  });

  // Fetch stations for dropdown
  const { data: stations = [] } = trpc.assets.stations.list.useQuery({
    businessId: 1,
  });

  // Create mutation
  const createMutation = trpc.assets.movements.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [["assets", "movements", "list"]] });
      toast({ title: "تم تسجيل الحركة بنجاح" });
      setShowDialog(false);
    },
    onError: (error) => {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    },
  });

  const filteredMovements = (movements as any[]).filter((mov: any) => {
    const matchesSearch =
      mov.asset?.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.asset?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || mov.movementType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createMutation.mutate({
      assetId: parseInt((formData as any).get("assetId") as string),
      movementType: (formData as any).get("movementType") as any,
      movementDate: (formData as any).get("movementDate") as string,
      fromStationId: (formData as any).get("fromStationId") ? parseInt((formData as any).get("fromStationId") as string) : undefined,
      toStationId: (formData as any).get("toStationId") ? parseInt((formData as any).get("toStationId") as string) : undefined,
      amount: (formData as any).get("amount") as string || undefined,
      description: (formData as any).get("description") as string || undefined,
    } as any);
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypes.find((t) => t.value === type) || { label: type, color: "bg-gray-500" };
  };

  // Stats
  const stats = [
    { title: "إجمالي الحركات", value: movements.length, icon: ArrowRightLeft, color: "text-primary bg-primary/10" },
    { title: "حركات النقل", value: (movements as any[]).filter((m: any) => m.movementType === "transfer").length, icon: ArrowRightLeft, color: "text-blue-500 bg-blue-500/10" },
    { title: "حركات الصيانة", value: (movements as any[]).filter((m: any) => m.movementType === "maintenance").length, icon: Clock, color: "text-yellow-500 bg-yellow-500/10" },
    { title: "حركات الإهلاك", value: (movements as any[]).filter((m: any) => m.movementType === "depreciation").length, icon: CheckCircle, color: "text-orange-500 bg-orange-500/10" },
  ];

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
            حركات الأصول
          </h1>
          <p className="text-muted-foreground mt-1">
            تتبع جميع حركات الأصول من نقل وصيانة وإهلاك
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="gradient-energy">
          <Plus className="w-4 h-4 ml-2" />
          تسجيل حركة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
                <TableHead>الأصل</TableHead>
                <TableHead>نوع الحركة</TableHead>
                <TableHead>من</TableHead>
                <TableHead>إلى</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الوصف</TableHead>
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
                  return (
                    <TableRow key={movement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {movement.movementDate
                            ? format(new Date(movement.movementDate), "yyyy/MM/dd", { locale: ar })
                            : "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{movement.asset?.nameAr || "-"}</p>
                          <p className="text-sm text-muted-foreground">{movement.asset?.code}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${typeInfo.color} text-white`}>
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {movement.fromStation?.nameAr || "-"}
                      </TableCell>
                      <TableCell>
                        {movement.toStation?.nameAr || "-"}
                      </TableCell>
                      <TableCell>
                        {movement.amount ? `${parseFloat(movement.amount).toLocaleString()} ر.س` : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {movement.description || "-"}
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
              أدخل بيانات حركة الأصل
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assetId">الأصل *</Label>
                <Select name="assetId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الأصل" />
                  </SelectTrigger>
                  <SelectContent>
                    {(assets as any[]).map((asset: any) => (
                      <SelectItem key={(asset as any).id} value={(asset as any).id.toString()}>
                        {(asset as any).nameAr} ({(asset as any).code})
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
                <Label htmlFor="amount">المبلغ</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromStationId">من محطة</Label>
                <Select name="fromStationId">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    {(stations as any[]).map((station: any) => (
                      <SelectItem key={(station as any).id} value={(station as any).id.toString()}>
                        {(station as any).nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toStationId">إلى محطة</Label>
                <Select name="toStationId">
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحطة الوجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    {(stations as any[]).map((station: any) => (
                      <SelectItem key={(station as any).id} value={(station as any).id.toString()}>
                        {(station as any).nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="أدخل وصف الحركة"
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
