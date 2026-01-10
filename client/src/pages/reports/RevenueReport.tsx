/**
 * تقرير الإيرادات التفصيلي
 * Revenue Report
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign, Download } from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

export default function RevenueReport() {
  const [location] = useLocation();
  const businessId = 1;
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<"day" | "month" | "customer" | "service_type">("month");
  
  const { data, isLoading, refetch } = trpc.reports.revenue.detailed.useQuery({
    businessId,
    startDate,
    endDate,
    groupBy,
  });
  
  const currentPageInfo = resolvePageInfo(location);
  
  const totals = data?.reduce((acc: any, row: any) => ({
    invoices: acc.invoices + parseInt(row.invoice_count || 0),
    subtotal: acc.subtotal + parseFloat(row.subtotal || 0),
    vat: acc.vat + parseFloat(row.vat_amount || 0),
    total: acc.total + parseFloat(row.total_amount || 0),
    collected: acc.collected + parseFloat(row.collected || 0),
    outstanding: acc.outstanding + parseFloat(row.outstanding || 0),
  }), { invoices: 0, subtotal: 0, vat: 0, total: 0, collected: 0, outstanding: 0 });
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            تقرير الإيرادات التفصيلي
          </h1>
          <p className="text-muted-foreground mt-2">تحليل مفصل للإيرادات والمتحصلات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
          <EngineInfoDialog info={currentPageInfo} />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>معايير التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>تجميع حسب</Label>
              <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="month">الشهر</SelectItem>
                  <SelectItem value="customer">العميل</SelectItem>
                  <SelectItem value="service_type">نوع الخدمة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={() => refetch()} className="w-full">عرض</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {totals && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">الفواتير</div>
              <div className="text-2xl font-bold mt-1">{totals.invoices}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">المبلغ</div>
              <div className="text-2xl font-bold mt-1">{totals.subtotal.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">الضريبة</div>
              <div className="text-2xl font-bold mt-1">{totals.vat.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">الإجمالي</div>
              <div className="text-2xl font-bold mt-1 text-blue-600">{totals.total.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">المحصل</div>
              <div className="text-2xl font-bold mt-1 text-green-600">{totals.collected.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground">المتبقي</div>
              <div className="text-2xl font-bold mt-1 text-red-600">{totals.outstanding.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>التفاصيل</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفترة/المجموعة</TableHead>
                  <TableHead>الفواتير</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الضريبة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>المحصل</TableHead>
                  <TableHead>المتبقي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-semibold">
                        {row.period || row.customer_name || row.service_type || "-"}
                      </TableCell>
                      <TableCell>{row.invoice_count}</TableCell>
                      <TableCell>{parseFloat(row.subtotal || 0).toFixed(2)}</TableCell>
                      <TableCell>{parseFloat(row.vat_amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{parseFloat(row.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-green-600">{parseFloat(row.collected || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">{parseFloat(row.outstanding || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      لا توجد بيانات للفترة المحددة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

