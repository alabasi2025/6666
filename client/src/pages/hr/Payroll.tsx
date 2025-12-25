import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calculator, FileText, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PayrollProps {
  businessId?: number;
}

export default function Payroll({ businessId }: PayrollProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const { data: payrollRuns, refetch } = trpc.hr.payroll.list.useQuery({
    businessId,
    year: parseInt(selectedYear),
  });

  const createMutation = trpc.hr.payroll.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء مسير الرواتب");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const calculateMutation = trpc.hr.payroll.calculate.useMutation({
    onSuccess: (data) => {
      toast.success(`تم حساب الرواتب لـ ${data.employeeCount} موظف`);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const month = parseInt((formData as any).get("month") as string);
    const year = parseInt((formData as any).get("year") as string);

    // حساب تواريخ الفترة
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    createMutation.mutate({
      businessId,
      code: `PAY-${year}-${month.toString().padStart(2, "0")}`,
      periodYear: year,
      periodMonth: month,
      periodStartDate: startDate.toISOString().split("T")[0],
      periodEndDate: endDate.toISOString().split("T")[0],
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "مسودة", variant: "outline" },
      calculated: { label: "محسوب", variant: "secondary" },
      approved: { label: "معتمد", variant: "default" },
      paid: { label: "مصروف", variant: "default" },
      cancelled: { label: "ملغي", variant: "destructive" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "0.00";
    return parseFloat(amount.toString()).toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مسيرات الرواتب</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              مسير رواتب جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إنشاء مسير رواتب جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">الشهر *</Label>
                  <Select name="month" defaultValue={(new Date().getMonth() + 1).toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((name, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year">السنة *</Label>
                  <Select name="year" defaultValue={currentYear.toString()}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending}>إنشاء</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{payrollRuns?.length || 0}</p>
                <p className="text-sm text-muted-foreground">مسيرات الرواتب</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    payrollRuns?.reduce((sum: number, p: any) => sum + parseFloat(p.totalNetSalary || "0"), 0) || 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">إجمالي المصروفات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calculator className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {payrollRuns?.filter((p: any) => p.status === "draft").length || 0}
                </p>
                <p className="text-sm text-muted-foreground">بانتظار الحساب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="السنة" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payroll Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>مسيرات الرواتب</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرمز</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>عدد الموظفين</TableHead>
                <TableHead>إجمالي الرواتب</TableHead>
                <TableHead>إجمالي البدلات</TableHead>
                <TableHead>إجمالي الخصومات</TableHead>
                <TableHead>صافي الرواتب</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRuns?.map((payroll: any) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-mono">{payroll.code}</TableCell>
                  <TableCell>
                    {monthNames[payroll.periodMonth - 1]} {payroll.periodYear}
                  </TableCell>
                  <TableCell>{payroll.employeeCount || 0}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(payroll.totalBasicSalary)}</TableCell>
                  <TableCell className="font-mono text-green-600">{formatCurrency(payroll.totalAllowances)}</TableCell>
                  <TableCell className="font-mono text-red-600">{formatCurrency(payroll.totalDeductions)}</TableCell>
                  <TableCell className="font-mono font-bold">{formatCurrency(payroll.totalNetSalary)}</TableCell>
                  <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                  <TableCell>
                    {payroll.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => calculateMutation.mutate({ payrollRunId: payroll.id, businessId } as any)}
                        disabled={calculateMutation.isPending}
                      >
                        <Calculator className="h-4 w-4 ml-1" />
                        حساب
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!payrollRuns || payrollRuns.length === 0) && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا يوجد مسيرات رواتب
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
