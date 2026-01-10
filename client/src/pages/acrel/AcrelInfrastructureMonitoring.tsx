// صفحة مراقبة البنية التحتية - عدادات ADW300
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Package,
  Sun,
  Loader2,
} from "lucide-react";

export default function AcrelInfrastructureMonitoring() {
  const [deviceType, setDeviceType] = useState<string | undefined>(undefined);

  const { data: metrics, isLoading } = trpc.developer.integrations.acrel.monitoring.getMetrics.useQuery({
    deviceType: deviceType as any,
  });

  const getDeviceTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      generator: Zap,
      cable: Activity,
      meter_panel: Package,
      solar_panel: Sun,
    };
    return icons[type] || Activity;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="w-8 h-8 text-purple-500" />
          مراقبة البنية التحتية
        </h1>
        <p className="text-muted-foreground mt-2">
          مراقبة المولدات، الكيابل، طبلات العدادات، والطاقة الشمسية عبر عدادات ADW300
        </p>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="max-w-xs">
            <Label>نوع الجهاز</Label>
            <Select value={deviceType || "all"} onValueChange={(v) => setDeviceType(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="generator">مولدات</SelectItem>
                <SelectItem value="cable">كيابل</SelectItem>
                <SelectItem value="meter_panel">طبلات العدادات</SelectItem>
                <SelectItem value="solar_panel">طاقة شمسية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics?.map((metric: any, idx: number) => {
            const Icon = getDeviceTypeIcon(metric.deviceType);
            return (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {metric.deviceId}
                  </CardTitle>
                  <Badge variant="outline">
                    {metric.deviceType === "generator" && "مولد"}
                    {metric.deviceType === "cable" && "كيبل"}
                    {metric.deviceType === "meter_panel" && "طبلة"}
                    {metric.deviceType === "solar_panel" && "طاقة شمسية"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        طاقة مصدرة
                      </p>
                      <p className="text-xl font-bold text-green-500">
                        {metric.exportedEnergy?.toFixed(2) || 0} kWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        طاقة مستوردة
                      </p>
                      <p className="text-xl font-bold text-orange-500">
                        {metric.importedEnergy?.toFixed(2) || 0} kWh
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">إجمالي الطاقة</p>
                    <p className="text-2xl font-bold">{metric.totalEnergy?.toFixed(2) || 0} kWh</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      آخر تحديث: {metric.timestamp ? new Date(metric.timestamp).toLocaleString("ar-SA") : "-"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && metrics?.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد بيانات مراقبة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

