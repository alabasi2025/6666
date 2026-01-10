// صفحة إدارة عدادات ACREL
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useBusinessId } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Smartphone,
  Plus,
  Search,
  Eye,
  Settings,
  Wifi,
  WifiOff,
  Zap,
  Activity,
  RefreshCw,
  Loader2,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

const ACREL_METERS_INFO = {
  title: "إدارة عدادات ACREL",
  description: "إدارة عدادات ACREL IoT (ADL200 للمشتركين و ADW300 للمراقبة)",
  process: `1) عرض قائمة جميع عدادات ACREL
2) فلترة حسب نوع العداد (ADL200/ADW300)
3) فلترة حسب نوع الدفع (آجل/مسبق/ائتمان)
4) عرض حالة الاتصال (متصل/منقطع)
5) إضافة/تعديل/حذف عداد`,
  mechanism: `- استعلام: trpc.developer.integrations.acrel.meters.list
- عرض في جدول تفاعلي
- فلترة وبحث`,
  relatedScreens: [
    { name: "تفاصيل العداد", path: "/dashboard/acrel/meters/:id", description: "عرض قراءات ومعلومات العداد" },
    { name: "محولات التيار", path: "/dashboard/acrel/ct-configuration", description: "إعداد محولات التيار للـ ADW300" },
    { name: "المراقبة", path: "/dashboard/acrel/monitoring", description: "مراقبة البنية التحتية" },
  ],
  businessLogic: "عدادات ACREL تدعم نوعين: ADL200 (سنجل فاز للمشتركين) و ADW300 (ثري فاز للمراقبة مع محولات تيار وحساسات)",
};

export default function AcrelMeters() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [meterTypeFilter, setMeterTypeFilter] = useState<string>("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const businessId = useBusinessId();

  // Fetch meters
  const { data: meters, isLoading, refetch } = trpc.developer.integrations.acrel.meters.list.useQuery({
    businessId,
    meterType: meterTypeFilter !== "all" ? (meterTypeFilter as any) : undefined,
    paymentMode: paymentModeFilter !== "all" ? (paymentModeFilter as any) : undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
  });

  const filteredMeters = meters?.filter((meter: any) => {
    if (!searchTerm) return true;
    return (
      meter.acrel_meter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meter.meter_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getMeterTypeBadge = (type: string) => {
    if (type === "ADL200") {
      return <Badge className="bg-blue-500">ADL200 - مشتركين</Badge>;
    } else if (type === "ADW300") {
      return <Badge className="bg-purple-500">ADW300 - مراقبة</Badge>;
    }
    return <Badge variant="outline">{type}</Badge>;
  };

  const getPaymentModeBadge = (mode: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      postpaid: { label: "دفع آجل", color: "bg-green-500" },
      prepaid: { label: "دفع مسبق", color: "bg-orange-500" },
      credit: { label: "ائتمان", color: "bg-yellow-500" },
    };
    const badge = badges[mode] || { label: mode, color: "bg-gray-500" };
    return <Badge className={badge.color}>{badge.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; icon: any; color: string }> = {
      online: { label: "متصل", icon: Wifi, color: "bg-green-500" },
      offline: { label: "منقطع", icon: WifiOff, color: "bg-red-500" },
      maintenance: { label: "صيانة", icon: Settings, color: "bg-yellow-500" },
    };
    const badge = badges[status] || { label: status, icon: Activity, color: "bg-gray-500" };
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} gap-1`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </Badge>
    );
  };

  const currentPageInfo = resolvePageInfo("/dashboard/acrel/meters") || ACREL_METERS_INFO;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-blue-500" />
            إدارة عدادات ACREL
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة عدادات ACREL IoT-EMS (ADL200 و ADW300)
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر والبحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>نوع العداد</Label>
              <Select value={meterTypeFilter} onValueChange={setMeterTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="ADL200">ADL200 - مشتركين</SelectItem>
                  <SelectItem value="ADW300">ADW300 - مراقبة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>نوع الدفع</Label>
              <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="postpaid">دفع آجل</SelectItem>
                  <SelectItem value="prepaid">دفع مسبق</SelectItem>
                  <SelectItem value="credit">ائتمان</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="online">متصل</SelectItem>
                  <SelectItem value="offline">منقطع</SelectItem>
                  <SelectItem value="maintenance">صيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>بحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم العداد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meters Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>عدادات ACREL</CardTitle>
              <CardDescription>
                {filteredMeters?.length || 0} عداد
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العداد</TableHead>
                  <TableHead>معرف ACREL</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>نوع الطور</TableHead>
                  <TableHead>نوع الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الاتصال</TableHead>
                  <TableHead>الرصيد/الائتمان</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeters?.map((meter: any) => (
                  <TableRow key={meter.id}>
                    <TableCell className="font-medium">{meter.meter_number || "-"}</TableCell>
                    <TableCell className="font-mono text-sm">{meter.acrel_meter_id}</TableCell>
                    <TableCell>{getMeterTypeBadge(meter.meter_type)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {meter.phase_type === "single" ? "سنجل فاز" : "ثري فاز"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPaymentModeBadge(meter.payment_mode)}</TableCell>
                    <TableCell>{getStatusBadge(meter.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {meter.connection_type === "wifi" && <Wifi className="w-3 h-3" />}
                        {meter.connection_type === "rs485" && <Zap className="w-3 h-3" />}
                        {meter.connection_type === "mqtt" && <Activity className="w-3 h-3" />}
                        {meter.connection_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {meter.payment_mode === "prepaid" && (
                        <div className="text-sm">
                          <span className="font-semibold">{parseFloat(meter.current_balance || 0).toFixed(2)}</span> ر.س
                        </div>
                      )}
                      {meter.payment_mode === "credit" && (
                        <div className="text-sm">
                          <div>حد: {parseFloat(meter.credit_limit || 0).toFixed(2)} ر.س</div>
                          <div className="text-red-500">دين: {parseFloat(meter.current_debt || 0).toFixed(2)} ر.س</div>
                        </div>
                      )}
                      {meter.payment_mode === "postpaid" && <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/dashboard/acrel/meters/${meter.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          تفاصيل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (meter.meter_type === "ADW300") {
                              setLocation(`/dashboard/acrel/ct-configuration?meterId=${meter.id}`);
                            } else {
                              toast({ title: "محولات التيار متاحة فقط لـ ADW300" });
                            }
                          }}
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          إعدادات
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredMeters?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد عدادات ACREL</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي العدادات</p>
                <p className="text-2xl font-bold">{meters?.length || 0}</p>
              </div>
              <Smartphone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدادات متصلة</p>
                <p className="text-2xl font-bold text-green-500">
                  {meters?.filter((m: any) => m.status === "online").length || 0}
                </p>
              </div>
              <Wifi className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ADL200 (مشتركين)</p>
                <p className="text-2xl font-bold">
                  {meters?.filter((m: any) => m.meter_type === "ADL200").length || 0}
                </p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ADW300 (مراقبة)</p>
                <p className="text-2xl font-bold">
                  {meters?.filter((m: any) => m.meter_type === "ADW300").length || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

