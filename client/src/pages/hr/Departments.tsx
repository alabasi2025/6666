import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, Briefcase, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DepartmentsProps {
  businessId?: number;
}

export default function Departments({ businessId }: DepartmentsProps) {
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const [isJobOpen, setIsJobOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [viewingDept, setViewingDept] = useState<any>(null);
  const [viewingJob, setViewingJob] = useState<any>(null);

  const { data: departments, refetch: refetchDepts } = trpc.hr.departments.list.useQuery({ businessId });
  const { data: jobTitles, refetch: refetchJobs } = trpc.hr.jobTitles.list.useQuery({ businessId });

  const createDeptMutation = trpc.hr.departments.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة القسم بنجاح");
      setIsDeptOpen(false);
      refetchDepts();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateDeptMutation = trpc.hr.departments.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث القسم");
      setIsDeptOpen(false);
      setSelectedDept(null);
      refetchDepts();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteDeptMutation = trpc.hr.departments.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القسم");
      refetchDepts();
    },
    onError: (error) => toast.error(error.message),
  });

  const createJobMutation = trpc.hr.jobTitles.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المسمى الوظيفي");
      setIsJobOpen(false);
      refetchJobs();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateJobMutation = trpc.hr.jobTitles.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المسمى الوظيفي");
      setIsJobOpen(false);
      setSelectedJob(null);
      refetchJobs();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteJobMutation = trpc.hr.jobTitles.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المسمى الوظيفي");
      refetchJobs();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDeptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      businessId,
      code: (formData as any).get("code") as string,
      nameAr: (formData as any).get("nameAr") as string,
      nameEn: (formData as any).get("nameEn") as string || undefined,
    };

    if (selectedDept) {
      updateDeptMutation.mutate({ id: selectedDept.id, ...data } as any);
    } else {
      createDeptMutation.mutate(data);
    }
  };

  const handleJobSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      businessId,
      code: (formData as any).get("code") as string,
      titleAr: (formData as any).get("titleAr") as string,
      titleEn: (formData as any).get("titleEn") as string || undefined,
      description: (formData as any).get("description") as string || undefined,
    };

    if (selectedJob) {
      updateJobMutation.mutate({ id: selectedJob.id, ...data } as any);
    } else {
      createJobMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الهيكل التنظيمي</h1>
      </div>

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="h-4 w-4" />
            الأقسام
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            المسميات الوظيفية
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الأقسام ({departments?.length || 0})</CardTitle>
              <Dialog open={isDeptOpen} onOpenChange={setIsDeptOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedDept(null)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة قسم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedDept ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="code">رمز القسم *</Label>
                      <Input id="code" name="code" defaultValue={selectedDept?.code} required />
                    </div>
                    <div>
                      <Label htmlFor="nameAr">اسم القسم (عربي) *</Label>
                      <Input id="nameAr" name="nameAr" defaultValue={selectedDept?.nameAr} required />
                    </div>
                    <div>
                      <Label htmlFor="nameEn">اسم القسم (إنجليزي)</Label>
                      <Input id="nameEn" name="nameEn" defaultValue={selectedDept?.nameEn} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDeptOpen(false)}>إلغاء</Button>
                      <Button type="submit">{selectedDept ? "تحديث" : "إضافة"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرمز</TableHead>
                    <TableHead>الاسم (عربي)</TableHead>
                    <TableHead>الاسم (إنجليزي)</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments?.map((dept: any) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-mono">{dept.code}</TableCell>
                      <TableCell>{dept.nameAr}</TableCell>
                      <TableCell>{dept.nameEn || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={dept.isActive ? "default" : "secondary"}>
                          {dept.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingDept(dept)}
                            title="عرض"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedDept(dept);
                              setIsDeptOpen(true);
                            }}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا القسم؟")) {
                                deleteDeptMutation.mutate({ id: dept.id } as any);
                              }
                            }}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!departments || departments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا يوجد أقسام
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Job Titles Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>المسميات الوظيفية ({jobTitles?.length || 0})</CardTitle>
              <Dialog open={isJobOpen} onOpenChange={setIsJobOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedJob(null)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مسمى
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedJob ? "تعديل المسمى" : "إضافة مسمى وظيفي"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleJobSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="code">الرمز *</Label>
                      <Input id="code" name="code" defaultValue={selectedJob?.code} required />
                    </div>
                    <div>
                      <Label htmlFor="titleAr">المسمى (عربي) *</Label>
                      <Input id="titleAr" name="titleAr" defaultValue={selectedJob?.titleAr} required />
                    </div>
                    <div>
                      <Label htmlFor="titleEn">المسمى (إنجليزي)</Label>
                      <Input id="titleEn" name="titleEn" defaultValue={selectedJob?.titleEn} />
                    </div>
                    <div>
                      <Label htmlFor="description">الوصف</Label>
                      <Input id="description" name="description" defaultValue={selectedJob?.description} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsJobOpen(false)}>إلغاء</Button>
                      <Button type="submit">{selectedJob ? "تحديث" : "إضافة"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرمز</TableHead>
                    <TableHead>المسمى (عربي)</TableHead>
                    <TableHead>المسمى (إنجليزي)</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobTitles?.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono">{job.code}</TableCell>
                      <TableCell>{job.titleAr}</TableCell>
                      <TableCell>{job.titleEn || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={job.isActive ? "default" : "secondary"}>
                          {job.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingJob(job)}
                            title="عرض"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedJob(job);
                              setIsJobOpen(true);
                            }}
                            title="تعديل"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا المسمى؟")) {
                                deleteJobMutation.mutate({ id: job.id } as any);
                              }
                            }}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!jobTitles || jobTitles.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        لا يوجد مسميات وظيفية
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Department Dialog */}
      <Dialog open={!!viewingDept} onOpenChange={() => setViewingDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              تفاصيل القسم
            </DialogTitle>
          </DialogHeader>
          {viewingDept && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رمز القسم</Label>
                  <p className="font-medium font-mono">{viewingDept.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div className="mt-1">
                    <Badge variant={viewingDept.isActive ? "default" : "secondary"}>
                      {viewingDept.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">الاسم (عربي)</Label>
                  <p className="font-medium">{viewingDept.nameAr}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الاسم (إنجليزي)</Label>
                  <p className="font-medium">{viewingDept.nameEn || "-"}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingDept(null)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setViewingDept(null); setSelectedDept(viewingDept); setIsDeptOpen(true); }}>
                  تعديل
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Job Title Dialog */}
      <Dialog open={!!viewingJob} onOpenChange={() => setViewingJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              تفاصيل المسمى الوظيفي
            </DialogTitle>
          </DialogHeader>
          {viewingJob && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">الرمز</Label>
                  <p className="font-medium font-mono">{viewingJob.code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div className="mt-1">
                    <Badge variant={viewingJob.isActive ? "default" : "secondary"}>
                      {viewingJob.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">المسمى (عربي)</Label>
                  <p className="font-medium">{viewingJob.titleAr}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">المسمى (إنجليزي)</Label>
                  <p className="font-medium">{viewingJob.titleEn || "-"}</p>
                </div>
                {viewingJob.description && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">الوصف</Label>
                    <p className="font-medium">{viewingJob.description}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setViewingJob(null)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setViewingJob(null); setSelectedJob(viewingJob); setIsJobOpen(true); }}>
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
