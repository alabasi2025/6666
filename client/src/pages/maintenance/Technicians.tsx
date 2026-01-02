import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DataTable, Column, StatusBadge } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Status mapping
const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "نشط", variant: "success" },
  inactive: { label: "غير نشط", variant: "secondary" },
  on_leave: { label: "إجازة", variant: "warning" },
};

export default function Technicians() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    nameAr: "",
    phone: "",
    email: "",
    specialization: "",
  });

  // Fetch technicians from API
  const { data: technicians = [], isLoading, refetch } = trpc.maintenance.technicians.list.useQuery({
    businessId: 1,
  });

  // Mutations
  const createTechnician = trpc.maintenance.technicians.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الفني بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة الفني");
    },
  });

  const updateTechnician = trpc.maintenance.technicians.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الفني بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث البيانات");
    },
  });

  const deleteTechnician = trpc.maintenance.technicians.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الفني بنجاح");
      setShowDeleteDialog(false);
      setSelectedTechnician(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحذف");
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      nameAr: "",
      phone: "",
      email: "",
      specialization: "",
    });
    setSelectedTechnician(null);
  };

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "employeeNumber",
      title: "الرقم الوظيفي",
      render: (value) => (
        <span className="font-mono text-primary">{value || "-"}</span>
      ),
    },
    {
      key: "firstName",
      title: "الاسم",
      render: (value, row) => (
        <div>
          <p className="font-medium">{value} {row.lastName}</p>
        </div>
      ),
    },
    {
      key: "phone",
      title: "الهاتف",
      render: (value) => value || "-",
    },
    {
      key: "email",
      title: "البريد الإلكتروني",
      render: (value) => value || "-",
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value || "active"} statusMap={statusMap} />,
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (technician: any) => {
    setSelectedTechnician(technician);
    setFormData({
      code: technician.employeeNumber || "",
      nameAr: technician.firstName || "",
      phone: technician.phone || "",
      email: technician.email || "",
      specialization: technician.specialization || "",
    });
    setShowAddDialog(true);
  };

  const handleDelete = (technician: any) => {
    setSelectedTechnician(technician);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedTechnician) {
      deleteTechnician.mutate({ id: selectedTechnician.id } as any);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(formData as any).nameAr) {
      toast.error("يرجى إدخال اسم الفني");
      return;
    }

    const data = {
      ...formData,
      businessId: 1,
    };

    if (selectedTechnician) {
      updateTechnician.mutate({ id: selectedTechnician.id, ...data } as any);
    } else {
      createTechnician.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <DataTable
        title="الفنيين"
        description="إدارة فنيي الصيانة"
        columns={columns}
        data={technicians}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="إضافة فني"
        searchPlaceholder="البحث في الفنيين..."
        searchKeys={["firstName", "phone", "email"]}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedTechnician ? "تعديل بيانات الفني" : "إضافة فني جديد"}
            </DialogTitle>
            <DialogDescription>
              {selectedTechnician ? "قم بتعديل بيانات الفني" : "أدخل بيانات الفني الجديد"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">الرقم الوظيفي</Label>
                  <Input
                    id="code"
                    value={(formData as any).code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="EMP-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameAr">الاسم *</Label>
                  <Input
                    id="nameAr"
                    value={(formData as any).nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">الهاتف</Label>
                <Input
                  id="phone"
                  value={(formData as any).phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={(formData as any).email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">التخصص</Label>
                <Input
                  id="specialization"
                  value={(formData as any).specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="كهرباء / ميكانيكا / ..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createTechnician.isPending || updateTechnician.isPending}>
                {(createTechnician.isPending || updateTechnician.isPending) && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                )}
                {selectedTechnician ? "حفظ التغييرات" : "إضافة"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف الفني "{selectedTechnician?.firstName}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteTechnician.isPending}>
              {deleteTechnician.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
