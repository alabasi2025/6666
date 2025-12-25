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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";

// Status mapping
const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  draft: { label: "مسودة", variant: "secondary" },
  posted: { label: "مرحّل", variant: "success" },
  reversed: { label: "معكوس", variant: "destructive" },
};

// Type mapping
const typeMap: Record<string, string> = {
  manual: "يدوي",
  automatic: "آلي",
  adjustment: "تسوية",
  closing: "إقفال",
};

export default function JournalEntries() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    type: "manual",
    description: "",
    lines: [
      { accountId: "", debit: "", credit: "", description: "" },
      { accountId: "", debit: "", credit: "", description: "" },
    ],
  });

  // Fetch entries from API
  const { data: entries = [], isLoading, refetch } = trpc.accounting.journalEntries.list.useQuery({
    businessId: 1,
    status: filterStatus !== "all" ? filterStatus : undefined,
  } as any);

  // Fetch accounts for selection
  const { data: accounts = [] } = trpc.accounting.accounts.list.useQuery({
    businessId: 1,
  } as any);

  // Mutations
  const createEntry = trpc.accounting.journalEntries.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء القيد بنجاح");
      setShowAddDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء القيد");
    },
  });

  const postEntry = trpc.accounting.journalEntries.post.useMutation({
    onSuccess: () => {
      toast.success("تم ترحيل القيد بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء ترحيل القيد");
    },
  });

  const deleteEntry = trpc.accounting.journalEntries.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القيد بنجاح");
      setShowDeleteDialog(false);
      setSelectedEntry(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء حذف القيد");
    },
  });

  const resetForm = () => {
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      type: "manual",
      description: "",
      lines: [
        { accountId: "", debit: "", credit: "", description: "" },
        { accountId: "", debit: "", credit: "", description: "" },
      ],
    });
    setSelectedEntry(null);
  };

  // Table columns
  const columns: Column<any>[] = [
    {
      key: "entryNumber",
      title: "رقم القيد",
      render: (value) => (
        <span className="font-mono text-primary">{value}</span>
      ),
    },
    {
      key: "entryDate",
      title: "التاريخ",
      render: (value) => value ? new Date(value).toLocaleDateString("ar-SA") : "-",
    },
    {
      key: "type",
      title: "النوع",
      render: (value) => typeMap[value] || value,
    },
    {
      key: "description",
      title: "الوصف",
      render: (value) => value || "-",
    },
    {
      key: "totalDebit",
      title: "المدين",
      align: "right",
      render: (value) => (
        <span className="font-mono text-success">
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "totalCredit",
      title: "الدائن",
      align: "right",
      render: (value) => (
        <span className="font-mono text-destructive">
          {value ? Number(value).toLocaleString() : "0"} ر.س
        </span>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (value) => <StatusBadge status={value} statusMap={statusMap} />,
    },
  ];

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleView = (entry: any) => {
    setSelectedEntry(entry);
    // Could open a details dialog here
  };

  const handlePost = (entry: any) => {
    if (entry.status !== "draft") {
      toast.error("لا يمكن ترحيل قيد غير مسودة");
      return;
    }
    postEntry.mutate({ id: entry.id } as any);
  };

  const handleDelete = (entry: any) => {
    if (entry.status !== "draft") {
      toast.error("لا يمكن حذف قيد مرحّل");
      return;
    }
    setSelectedEntry(entry);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedEntry) {
      deleteEntry.mutate({ id: selectedEntry.id } as any);
    }
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...(formData as any).lines, { accountId: "", debit: "", credit: "", description: "" }],
    });
  };

  const removeLine = (index: number) => {
    if ((formData as any).lines.length <= 2) {
      toast.error("يجب أن يحتوي القيد على سطرين على الأقل");
      return;
    }
    const newLines = (formData as any).lines.filter((_, i) => i !== index);
    setFormData({ ...formData, lines: newLines });
  };

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...(formData as any).lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    const totalDebit = (formData as any).lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = (formData as any).lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { totalDebit, totalCredit, isBalanced } = calculateTotals();
    
    if (!isBalanced) {
      toast.error("مجموع المدين يجب أن يساوي مجموع الدائن");
      return;
    }

    if (totalDebit === 0) {
      toast.error("يجب إدخال مبالغ في القيد");
      return;
    }

    const validLines = (formData as any).lines.filter(line => 
      line.accountId && (parseFloat(line.debit) > 0 || parseFloat(line.credit) > 0)
    );

    if (validLines.length < 2) {
      toast.error("يجب إدخال سطرين على الأقل بحسابات ومبالغ صحيحة");
      return;
    }

    createEntry.mutate({
      businessId: 1,
      entryDate: (formData as any).entryDate,
      periodId: 1, // TODO: get from context
      type: (formData as any).type,
      description: (formData as any).description,
      lines: validLines.map(line => ({
        accountId: parseInt(line.accountId),
        debit: line.debit || "0",
        credit: line.credit || "0",
        description: line.description,
      })),
    } as any);
  };

  const { totalDebit, totalCredit, isBalanced } = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="draft">مسودة</SelectItem>
              <SelectItem value="posted">مرحّل</SelectItem>
              <SelectItem value="reversed">معكوس</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="القيود اليومية"
        description="إدارة القيود المحاسبية"
        columns={columns}
        data={entries}
        onAdd={handleAdd}
        onView={handleView}
        onDelete={handleDelete}
        addButtonText="إنشاء قيد"
        searchPlaceholder="البحث في القيود..."
        searchKeys={["entryNumber", "description"]}
        customActions={[{
          id: 'post',
          label: 'ترحيل',
          icon: undefined,
          onClick: (row: any) => handlePost(row),
          isVisible: (row: any) => row.status === 'draft',
        }]}
      />

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء قيد محاسبي جديد</DialogTitle>
            <DialogDescription>أدخل بيانات القيد المحاسبي</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryDate">التاريخ *</Label>
                  <Input
                    id="entryDate"
                    type="date"
                    value={(formData as any).entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">النوع</Label>
                  <Select
                    value={(formData as any).type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">يدوي</SelectItem>
                      <SelectItem value="adjustment">تسوية</SelectItem>
                      <SelectItem value="closing">إقفال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={(formData as any).description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Lines */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>سطور القيد</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة سطر
                  </Button>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-right">الحساب</th>
                        <th className="p-2 text-right">مدين</th>
                        <th className="p-2 text-right">دائن</th>
                        <th className="p-2 text-right">البيان</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData as any).lines.map((line, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <Select
                              value={line.accountId}
                              onValueChange={(value) => updateLine(index, "accountId", value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الحساب" />
                              </SelectTrigger>
                              <SelectContent>
                                {(accounts as any[]).map((acc: any) => (
                                  <SelectItem key={acc.id} value={acc.id.toString()}>
                                    {acc.code} - {acc.nameAr}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={line.debit}
                              onChange={(e) => updateLine(index, "debit", e.target.value)}
                              placeholder="0.00"
                              className="text-left"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={line.credit}
                              onChange={(e) => updateLine(index, "credit", e.target.value)}
                              placeholder="0.00"
                              className="text-left"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={line.description}
                              onChange={(e) => updateLine(index, "description", e.target.value)}
                              placeholder="البيان"
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLine(index)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted font-bold">
                      <tr>
                        <td className="p-2 text-right">المجموع</td>
                        <td className="p-2 text-left font-mono">{totalDebit.toLocaleString()}</td>
                        <td className="p-2 text-left font-mono">{totalCredit.toLocaleString()}</td>
                        <td className="p-2" colSpan={2}>
                          {isBalanced ? (
                            <span className="text-success">متوازن ✓</span>
                          ) : (
                            <span className="text-destructive">غير متوازن ✗</span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" disabled={createEntry.isPending || !isBalanced}>
                {createEntry.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                إنشاء القيد
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
              هل أنت متأكد من حذف القيد "{selectedEntry?.entryNumber}"؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteEntry.isPending}>
              {deleteEntry.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
