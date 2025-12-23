import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, X, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeavesProps {
  businessId?: number;
}

export default function Leaves({ businessId }: LeavesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leaveRequests, refetch } = trpc.hr.leaveRequests.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: leaveTypes } = trpc.hr.leaveTypes.list.useQuery({ businessId });
  const { data: employees } = trpc.hr.employees.list.useQuery({ businessId });

  const createMutation = trpc.hr.leaveRequests.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلب الإجازة");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const approveMutation = trpc.hr.leaveRequests.approve.useMutation({
    onSuccess: () => {
      toast.success("تم الموافقة على الطلب");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const rejectMutation = trpc.hr.leaveRequests.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض الطلب");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    createMutation.mutate({
      businessId,
      employeeId: parseInt(formData.get("employeeId") as string),
      leaveTypeId: parseInt(formData.get("leaveTypeId") as string),
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      totalDays,
      reason: formData.get("reason") as string || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "قيد الانتظار", variant: "secondary" },
      approved: { label: "موافق عليه", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
      cancelled: { label: "ملغي", variant: "outline" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const pendingCount = leaveRequests?.filter((r: any) => r.status === "pending").length || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الإجازات</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>طلب إجازة جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employeeId">الموظف *</Label>
                <Select name="employeeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leaveTypeId">نوع الإجازة *</Label>
                <Select name="leaveTypeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes?.map((type: any) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">من تاريخ *</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="endDate">إلى تاريخ *</Label>
                  <Input id="endDate" name="endDate" type="date" required />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">السبب</Label>
                <Textarea id="reason" name="reason" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending}>إرسال الطلب</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">طلبات معلقة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leaveRequests?.filter((r: any) => r.status === "approved").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">موافق عليها</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {leaveRequests?.filter((r: any) => r.status === "rejected").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">مرفوضة</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leaveRequests?.length || 0}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="approved">موافق عليها</SelectItem>
              <SelectItem value="rejected">مرفوضة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>نوع الإجازة</TableHead>
                <TableHead>من</TableHead>
                <TableHead>إلى</TableHead>
                <TableHead>عدد الأيام</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests?.map((request: any) => {
                const emp = employees?.find((e: any) => e.id === request.employeeId);
                const leaveType = leaveTypes?.find((t: any) => t.id === request.leaveTypeId);
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      {emp ? `${emp.firstName} ${emp.lastName}` : `موظف #${request.employeeId}`}
                    </TableCell>
                    <TableCell>{leaveType?.nameAr || "-"}</TableCell>
                    <TableCell>{new Date(request.startDate).toLocaleDateString("ar-SA")}</TableCell>
                    <TableCell>{new Date(request.endDate).toLocaleDateString("ar-SA")}</TableCell>
                    <TableCell>{request.totalDays} يوم</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.status === "pending" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600"
                            onClick={() => approveMutation.mutate({ id: request.id, approvedBy: 1 })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600"
                            onClick={() => {
                              const reason = prompt("سبب الرفض:");
                              if (reason) {
                                rejectMutation.mutate({ id: request.id, rejectionReason: reason });
                              }
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!leaveRequests || leaveRequests.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا يوجد طلبات إجازات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
