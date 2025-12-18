import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { RefreshCw, Search, Bell, Webhook, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  completed: "مكتمل",
  failed: "فشل",
};

export default function Events() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: events, isLoading, refetch } = trpc.developer.events.list.useQuery({
    businessId: 1,
    status: statusFilter !== "all" ? statusFilter : undefined,
    limit: 100,
  });

  const { data: subscriptions } = trpc.developer.subscriptions.list.useQuery({ businessId: 1 });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ar-SA", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">نظام الأحداث</h1>
          <p className="text-muted-foreground">مراقبة وإدارة أحداث النظام</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">الأحداث</TabsTrigger>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="failed">فشل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نوع الحدث</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>الكيان</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell>
                    </TableRow>
                  ) : events?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد أحداث</TableCell>
                    </TableRow>
                  ) : (
                    events?.map((event: any) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.eventType}</TableCell>
                        <TableCell>{event.eventSource}</TableCell>
                        <TableCell>{event.aggregateType ? `${event.aggregateType}#${event.aggregateId}` : "-"}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[event.status]}>{statusLabels[event.status]}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(event.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>اشتراكات الأحداث</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المشترك</TableHead>
                    <TableHead>نوع الحدث</TableHead>
                    <TableHead>نوع المعالج</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد اشتراكات</TableCell>
                    </TableRow>
                  ) : (
                    subscriptions?.map((sub: any) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.subscriberName}</TableCell>
                        <TableCell>{sub.eventType}</TableCell>
                        <TableCell><Badge variant="outline">{sub.handlerType}</Badge></TableCell>
                        <TableCell>{sub.priority}</TableCell>
                        <TableCell>
                          <Badge className={sub.isActive ? "bg-green-500" : "bg-gray-500"}>
                            {sub.isActive ? "نشط" : "معطل"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
