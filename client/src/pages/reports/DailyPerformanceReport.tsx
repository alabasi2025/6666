/**
 * تقرير الأداء اليومي
 * Daily Performance Report
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, Users, Zap, FileText, DollarSign, Wrench, Calendar } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

export default function DailyPerformanceReport() {
  const [location] = useLocation();
  const businessId = 1;
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data, isLoading, refetch } = trpc.reports.performance.daily.useQuery({
    businessId,
    date: selectedDate,
  });
  
  const currentPageInfo = resolvePageInfo(location);
  
  const metrics = [
    { label: "إجمالي العملاء", value: data?.total_customers || 0, icon: Users, color: "text-blue-600" },
    { label: "إجمالي العدادات", value: data?.total_meters || 0, icon: Zap, color: "text-yellow-600" },
    { label: "القراءات المسجلة", value: data?.readings_taken || 0, icon: FileText, color: "text-green-600" },
    { label: "الفواتير المصدرة", value: data?.invoices_generated || 0, icon: FileText, color: "text-purple-600" },
    { label: "الإيرادات", value: `${parseFloat(data?.total_revenue || "0").toFixed(2)} ريال`, icon: DollarSign, color: "text-emerald-600" },
    { label: "المدفوعات المستلمة", value: data?.payments_received || 0, icon: DollarSign, color: "text-teal-600" },
    { label: "المبالغ المحصلة", value: `${parseFloat(data?.total_collected || "0").toFixed(2)} ريال`, icon: DollarSign, color: "text-green-600" },
    { label: "أوامر العمل المكتملة", value: data?.work_orders_completed || 0, icon: Wrench, color: "text-orange-600" },
  ];
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            تقرير الأداء اليومي
          </h1>
          <p className="text-muted-foreground mt-2">
            ملخص شامل لأداء النظام اليومي
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>اختيار التاريخ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>التاريخ:</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={() => refetch()}>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className={`text-2xl font-bold mt-2 ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                  <metric.icon className={`w-12 h-12 ${metric.color} opacity-20`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

