import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AttendanceProps {
  businessId?: number;
}

export default function Attendance({ businessId }: AttendanceProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: employees } = trpc.hr.employees.list.useQuery({ businessId, status: "active" });
  const { data: attendance, refetch } = trpc.hr.attendance.list.useQuery({
    businessId,
    employeeId: selectedEmployee !== "all" ? parseInt(selectedEmployee) : undefined,
  });

  const checkInMutation = trpc.hr.attendance.checkIn.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الحضور بنجاح");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const checkOutMutation = trpc.hr.attendance.checkOut.useMutation({
    onSuccess: (data) => {
      toast.success(`تم تسجيل الانصراف - إجمالي الساعات: ${data.totalHours}`);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCheckIn = (employeeId: number) => {
    checkInMutation.mutate({
      employeeId,
      businessId,
      checkInMethod: "manual",
    } as any);
  };

  const handleCheckOut = (employeeId: number) => {
    checkOutMutation.mutate({
      employeeId,
      checkOutMethod: "manual",
    } as any);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      present: { label: "حاضر", variant: "default" },
      absent: { label: "غائب", variant: "destructive" },
      late: { label: "متأخر", variant: "secondary" },
      early_leave: { label: "انصراف مبكر", variant: "outline" },
      on_leave: { label: "إجازة", variant: "secondary" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const formatTime = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  // Get today's attendance for each employee
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance?.filter((a: any) => 
    new Date(a.attendanceDate).toISOString().split("T")[0] === todayStr
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الحضور والانصراف</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LogIn className="h-5 w-5 text-green-500" />
              تسجيل حضور
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select onValueChange={(val) => handleCheckIn(parseInt(val))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LogOut className="h-5 w-5 text-orange-500" />
              تسجيل انصراف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select onValueChange={(val) => handleCheckOut(parseInt(val))}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees?.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            حضور اليوم ({new Date().toLocaleDateString("ar-SA")})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {todayAttendance?.filter((a: any) => a.status === "present").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">حاضرين</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {todayAttendance?.filter((a: any) => a.status === "late").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">متأخرين</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {(employees?.length || 0) - (todayAttendance?.length || 0)}
              </p>
              <p className="text-sm text-muted-foreground">غائبين</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {employees?.length || 0}
              </p>
              <p className="text-sm text-muted-foreground">إجمالي</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع الموظفين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموظفين</SelectItem>
                {employees?.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.firstName} {emp.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الموظف</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>وقت الحضور</TableHead>
                <TableHead>وقت الانصراف</TableHead>
                <TableHead>إجمالي الساعات</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>طريقة التسجيل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance?.map((record: any) => {
                const emp = employees?.find((e: any) => e.id === record.employeeId);
                return (
                  <TableRow key={record.id}>
                    <TableCell>
                      {emp ? `${emp.firstName} ${emp.lastName}` : `موظف #${record.employeeId}`}
                    </TableCell>
                    <TableCell>
                      {new Date(record.attendanceDate).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell className="text-green-600 font-mono">
                      {formatTime(record.checkInTime)}
                    </TableCell>
                    <TableCell className="text-orange-600 font-mono">
                      {formatTime(record.checkOutTime)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {record.totalHours ? `${record.totalHours} ساعة` : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {record.checkInMethod === "manual" ? "يدوي" : 
                         record.checkInMethod === "biometric" ? "بصمة" :
                         record.checkInMethod === "gps" ? "GPS" : record.checkInMethod}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {(!attendance || attendance.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا يوجد سجلات حضور
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
