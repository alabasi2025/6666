/**
 * تقرير الأداء الشهري
 * Monthly Performance Report
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

export default function MonthlyPerformanceReport() {
  const [location] = useLocation();
  const businessId = 1;
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  const { data, isLoading, refetch } = trpc.reports.performance.monthly.useQuery({
    businessId,
    year,
    month,
  });
  
  const currentPageInfo = resolvePageInfo(location);
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            تقرير الأداء الشهري
          </h1>
          <p className="text-muted-foreground mt-2">تحليل شامل للأداء الشهري</p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>اختيار الفترة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label>السنة:</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-32 mt-2"
              />
            </div>
            <div>
              <Label>الشهر:</Label>
              <Input
                type="number"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-32 mt-2"
              />
            </div>
            <Button onClick={() => refetch()} className="mt-6">
              <TrendingUp className="w-4 h-4 ml-2" />
              عرض التقرير
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">إجمالي العملاء</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{data.total_customers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">العملاء النشطون</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{data.active_customers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">إجمالي العدادات</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{data.total_meters}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">القراءات المسجلة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{data.total_readings}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">الفواتير المصدرة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{data.total_invoices}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">إجمالي الفوترة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-blue-600">{parseFloat(data.total_billed || "0").toFixed(2)} ر.س</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">المدفوعات المستلمة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{data.total_payments}</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">المبالغ المحصلة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{parseFloat(data.total_collected || "0").toFixed(2)} ر.س</div></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">أوامر العمل المكتملة</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-orange-600">{data.completed_work_orders}/{data.total_work_orders}</div></CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

