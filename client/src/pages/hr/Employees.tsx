import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Link2, Unlink, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EmployeesProps {
  businessId: number;
}

export default function Employees({ businessId }: EmployeesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const { data: employees, refetch } = trpc.hr.employees.list.useQuery({
    businessId,
    status: statusFilter !== "all" ? statusFilter : undefined,
    departmentId: departmentFilter !== "all" ? parseInt(departmentFilter) : undefined,
  });

  const { data: departments } = trpc.hr.departments.list.useQuery({ businessId });
  const { data: jobTitles } = trpc.hr.jobTitles.list.useQuery({ businessId });
  const { data: fieldWorkers } = trpc.fieldOps.workers.list.useQuery({ businessId });
  const { data: unlinkedEmployees } = trpc.hr.employees.getUnlinked.useQuery({ businessId });

  const createMutation = trpc.hr.employees.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الموظف بنجاح");
      setIsOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.hr.employees.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الموظف");
      setIsOpen(false);
      setSelectedEmployee(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.hr.employees.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الموظف");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const linkMutation = trpc.hr.employees.linkToFieldWorker.useMutation({
    onSuccess: () => {
      toast.success("تم ربط الموظف بالعامل الميداني");
      setIsLinkOpen(false);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const unlinkMutation = trpc.hr.employees.unlinkFromFieldWorker.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء الربط");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      businessId,
      employeeNumber: formData.get("employeeNumber") as string,
      firstName: formData.get("firstName") as string,
      middleName: formData.get("middleName") as string || undefined,
      lastName: formData.get("lastName") as string,
      idNumber: formData.get("idNumber") as string,
      mobile: formData.get("mobile") as string,
      email: formData.get("email") as string || undefined,
      hireDate: formData.get("hireDate") as string,
      departmentId: formData.get("departmentId") ? parseInt(formData.get("departmentId") as string) : undefined,
      jobTitleId: formData.get("jobTitleId") ? parseInt(formData.get("jobTitleId") as string) : undefined,
      status: formData.get("status") as any || "active",
    };

    if (selectedEmployee) {
      updateMutation.mutate({ id: selectedEmployee.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "نشط", variant: "default" },
      inactive: { label: "غير نشط", variant: "secondary" },
      terminated: { label: "منتهي", variant: "destructive" },
      suspended: { label: "موقوف", variant: "outline" },
      on_leave: { label: "في إجازة", variant: "secondary" },
    };
    const s = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const filteredEmployees = employees?.filter((emp: any) =>
    emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber?.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedEmployee(null)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة موظف
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="employeeNumber">رقم الموظف *</Label>
                  <Input id="employeeNumber" name="employeeNumber" defaultValue={selectedEmployee?.employeeNumber} required />
                </div>
                <div>
                  <Label htmlFor="idNumber">رقم الهوية *</Label>
                  <Input id="idNumber" name="idNumber" defaultValue={selectedEmployee?.idNumber} required />
                </div>
                <div>
                  <Label htmlFor="firstName">الاسم الأول *</Label>
                  <Input id="firstName" name="firstName" defaultValue={selectedEmployee?.firstName} required />
                </div>
                <div>
                  <Label htmlFor="middleName">الاسم الأوسط</Label>
                  <Input id="middleName" name="middleName" defaultValue={selectedEmployee?.middleName} />
                </div>
                <div>
                  <Label htmlFor="lastName">اسم العائلة *</Label>
                  <Input id="lastName" name="lastName" defaultValue={selectedEmployee?.lastName} required />
                </div>
                <div>
                  <Label htmlFor="mobile">الجوال *</Label>
                  <Input id="mobile" name="mobile" defaultValue={selectedEmployee?.mobile} required />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedEmployee?.email} />
                </div>
                <div>
                  <Label htmlFor="hireDate">تاريخ التعيين *</Label>
                  <Input id="hireDate" name="hireDate" type="date" defaultValue={selectedEmployee?.hireDate?.split("T")[0]} required />
                </div>
                <div>
                  <Label htmlFor="departmentId">القسم</Label>
                  <Select name="departmentId" defaultValue={selectedEmployee?.departmentId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>{dept.nameAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="jobTitleId">المسمى الوظيفي</Label>
                  <Select name="jobTitleId" defaultValue={selectedEmployee?.jobTitleId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المسمى" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTitles?.map((title: any) => (
                        <SelectItem key={title.id} value={title.id.toString()}>{title.titleAr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select name="status" defaultValue={selectedEmployee?.status || "active"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="on_leave">في إجازة</SelectItem>
                      <SelectItem value="suspended">موقوف</SelectItem>
                      <SelectItem value="terminated">منتهي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {selectedEmployee ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الرقم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="on_leave">في إجازة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {departments?.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>{dept.nameAr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين ({filteredEmployees?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الموظف</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>الجوال</TableHead>
                <TableHead>تاريخ التعيين</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الربط الميداني</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees?.map((emp: any) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono">{emp.employeeNumber}</TableCell>
                  <TableCell>{emp.firstName} {emp.middleName} {emp.lastName}</TableCell>
                  <TableCell>{departments?.find((d: any) => d.id === emp.departmentId)?.nameAr || "-"}</TableCell>
                  <TableCell dir="ltr">{emp.mobile}</TableCell>
                  <TableCell>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("ar-SA") : "-"}</TableCell>
                  <TableCell>{getStatusBadge(emp.status)}</TableCell>
                  <TableCell>
                    {emp.fieldWorkerId ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        مرتبط
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500">
                        غير مرتبط
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setViewingEmployee(emp);
                          setIsViewOpen(true);
                        }}
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsOpen(true);
                        }}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {emp.fieldWorkerId ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => unlinkMutation.mutate({ employeeId: emp.id })}
                          title="إلغاء الربط"
                        >
                          <Unlink className="h-4 w-4 text-orange-500" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsLinkOpen(true);
                          }}
                          title="ربط بعامل ميداني"
                        >
                          <Link2 className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
                            deleteMutation.mutate({ id: emp.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredEmployees || filteredEmployees.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا يوجد موظفين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Link to Field Worker Dialog */}
      <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ربط الموظف بعامل ميداني</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              اختر العامل الميداني لربطه بالموظف: {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </p>
            <div className="space-y-2">
              {fieldWorkers?.filter((w: any) => !w.employeeId).map((worker: any) => (
                <Button
                  key={worker.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    linkMutation.mutate({
                      employeeId: selectedEmployee.id,
                      fieldWorkerId: worker.id,
                    });
                  }}
                >
                  {worker.nameAr} - {worker.employeeNumber}
                </Button>
              ))}
              {(!fieldWorkers || fieldWorkers.filter((w: any) => !w.employeeId).length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  لا يوجد عاملين ميدانيين متاحين للربط
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Employee Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              عرض بيانات الموظف
            </DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">رقم الموظف</Label>
                    <p className="font-medium font-mono">{viewingEmployee.employeeNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">رقم الهوية</Label>
                    <p className="font-medium">{viewingEmployee.idNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم الكامل</Label>
                    <p className="font-medium">{viewingEmployee.firstName} {viewingEmployee.middleName} {viewingEmployee.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">القسم</Label>
                    <p className="font-medium">{departments?.find((d: any) => d.id === viewingEmployee.departmentId)?.nameAr || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">المسمى الوظيفي</Label>
                    <p className="font-medium">{jobTitles?.find((j: any) => j.id === viewingEmployee.jobTitleId)?.titleAr || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">تاريخ التعيين</Label>
                    <p className="font-medium">{viewingEmployee.hireDate ? new Date(viewingEmployee.hireDate).toLocaleDateString("ar-SA") : "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">الجوال</Label>
                    <p className="font-medium" dir="ltr">{viewingEmployee.mobile}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{viewingEmployee.email || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الحالة</h3>
                <div className="flex items-center gap-4">
                  {getStatusBadge(viewingEmployee.status)}
                  {viewingEmployee.fieldWorkerId ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      مرتبط بعامل ميداني
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-500">
                      غير مرتبط
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setIsViewOpen(false); setSelectedEmployee(viewingEmployee); setIsOpen(true); }}>
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
