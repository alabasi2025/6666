/**
 * صفحة عامة للمهام الميدانية
 * Field Tasks Page
 * 
 * تعرض المهام حسب نوع المهمة (متحصلين، كهربائيين، مدير محطة)
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, Search, Filter, Clock, User, 
  CheckCircle, XCircle, Eye, Loader2, Wallet, Zap, Users
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";

interface FieldTasksProps {
  taskType?: "collectors" | "electricians" | "station-manager";
}

export default function FieldTasks({ taskType }: FieldTasksProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const businessId = 1;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // تحديد نوع المهمة من المسار
  const getTaskTypeFromPath = () => {
    if (location.includes("collectors")) return "collectors";
    if (location.includes("electricians")) return "electricians";
    if (location.includes("station-manager")) return "station-manager";
    return taskType || "collectors";
  };

  const currentTaskType = getTaskTypeFromPath();

  const getTaskTypeLabel = () => {
    const labels = {
      collectors: "مهام المتحصلين",
      electricians: "مهام الكهربائيين",
      "station-manager": "مهام مدير المحطة",
    };
    return labels[currentTaskType as keyof typeof labels] || "المهام الميدانية";
  };

  const getTaskTypeIcon = () => {
    const icons = {
      collectors: Wallet,
      electricians: Zap,
      "station-manager": Users,
    };
    return icons[currentTaskType as keyof typeof icons] || ClipboardList;
  };

  const Icon = getTaskTypeIcon();

  const { data: operations, isLoading } = trpc.fieldOps.operations.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter : undefined,
    operationType: currentTaskType,
  } as any);

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: "معلق", variant: "secondary" as const },
      scheduled: { label: "مجدول", variant: "default" as const },
      in_progress: { label: "قيد التنفيذ", variant: "default" as const },
      completed: { label: "مكتمل", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "ملغي", variant: "destructive" as const, icon: XCircle },
    };
    
    const { label, variant, icon: StatusIcon } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {StatusIcon && <StatusIcon className="w-3 h-3" />}
        {label}
      </Badge>
    );
  };

  const currentPageInfo = resolvePageInfo(location);

  const filteredOperations = operations?.data?.filter((op: any) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        op.operation_number?.toLowerCase().includes(searchLower) ||
        op.description?.toLowerCase().includes(searchLower) ||
        op.location?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon className="w-8 h-8 text-blue-500" />
            {getTaskTypeLabel()}
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة ومتابعة {getTaskTypeLabel().toLowerCase()}
          </p>
        </div>
        <EngineInfoDialog info={currentPageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>الفلترة والبحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="ابحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المهام</CardTitle>
          <CardDescription>
            {filteredOperations.length} مهمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredOperations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم المهمة</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>التاريخ المخطط</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOperations.map((task: any) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.operation_number || `TASK-${task.id}`}</TableCell>
                    <TableCell>{task.description || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        {task.location || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.scheduled_date ? new Date(task.scheduled_date).toLocaleDateString("ar-SA") : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status || "pending")}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد مهام</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

