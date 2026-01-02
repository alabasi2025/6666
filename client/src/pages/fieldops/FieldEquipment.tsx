import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Search, Truck, Edit, Wrench } from "lucide-react";

interface FieldEquipmentProps {
  businessId?: number;
}

export default function FieldEquipment({ businessId }: FieldEquipmentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);

  const { data: equipment, isLoading, refetch } = trpc.fieldOps.equipment.list.useQuery({ businessId });
  const { data: teams } = trpc.fieldOps.teams.list.useQuery({ businessId });

  const createMutation = trpc.fieldOps.equipment.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة المعدة بنجاح"); setIsCreateOpen(false); refetch(); },
    onError: (error) => { toast.error("حدث خطأ: " + error.message); },
  });

  const updateMutation = trpc.fieldOps.equipment.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث المعدة بنجاح"); setEditingEquipment(null); refetch(); },
    onError: (error) => { toast.error("حدث خطأ: " + error.message); },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId,
      equipmentCode: `EQ-${Date.now()}`,
      nameAr: (formData as any).get("nameAr") as string,
      nameEn: (formData as any).get("nameEn") as string || undefined,
      equipmentType: (formData as any).get("equipmentType") as any,
      serialNumber: (formData as any).get("serialNumber") as string || undefined,
      brand: (formData as any).get("brand") as string || undefined,
      assignedTeamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingEquipment.id,
      data: {
        nameAr: (formData as any).get("nameAr") as string,
        nameEn: (formData as any).get("nameEn") as string || undefined,
        status: (formData as any).get("status") as any,
        condition: (formData as any).get("condition") as any,
        assignedTeamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      available: { label: "متاحة", variant: "default" },
      in_use: { label: "قيد الاستخدام", variant: "secondary" },
      maintenance: { label: "صيانة", variant: "outline" },
      retired: { label: "متقاعدة", variant: "destructive" },
      lost: { label: "مفقودة", variant: "destructive" },
    };
    const config = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={(config as any).variant}>{(config as any).label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, string> = { tool: "أداة", vehicle: "مركبة", device: "جهاز", safety: "سلامة", measuring: "قياس" };
    return <Badge variant="outline">{map[type] || type}</Badge>;
  };

  const filtered = equipment?.filter((eq) => eq.nameAr.includes(searchTerm) || eq.code?.includes(searchTerm));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">المعدات الميدانية</h1><p className="text-muted-foreground">إدارة المعدات والأدوات</p></div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 ml-2" />إضافة معدة</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة معدة جديدة</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>الاسم (عربي) *</Label><Input name="nameAr" required /></div>
                <div className="space-y-2"><Label>الاسم (إنجليزي)</Label><Input name="nameEn" /></div>
                <div className="space-y-2"><Label>النوع *</Label>
                  <Select name="equipmentType" required><SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                    <SelectContent><SelectItem value="tool">أداة</SelectItem><SelectItem value="vehicle">مركبة</SelectItem><SelectItem value="device">جهاز</SelectItem><SelectItem value="safety">سلامة</SelectItem><SelectItem value="measuring">قياس</SelectItem></SelectContent>
                  </Select></div>
                <div className="space-y-2"><Label>الرقم التسلسلي</Label><Input name="serialNumber" /></div>
                <div className="space-y-2"><Label>العلامة التجارية</Label><Input name="brand" /></div>
                <div className="space-y-2"><Label>الفريق</Label>
                  <Select name="teamId"><SelectTrigger><SelectValue placeholder="اختر الفريق" /></SelectTrigger>
                    <SelectContent>{teams?.map((t) => <SelectItem key={t.id} value={t.id.toString()}>{t.nameAr}</SelectItem>)}</SelectContent>
                  </Select></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>إلغاء</Button><Button type="submit" disabled={createMutation.isPending}>إضافة</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative max-w-md"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="بحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10" /></div>
      </CardContent></Card>

      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-24 bg-muted rounded"></div></CardContent></Card>)}</div>
      : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eq) => (
            <Card key={eq.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2"><div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5" />{eq.nameAr}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingEquipment(eq)}><Edit className="h-4 w-4" /></Button>
              </div></CardHeader>
              <CardContent><div className="space-y-2">
                <p className="text-sm text-muted-foreground font-mono">{eq.code}</p>
                <div className="flex gap-2">{getStatusBadge(eq.status || "available")}{getTypeBadge(eq.equipmentType)}</div>
                {(eq as any).serialNumber && <p className="text-sm text-muted-foreground">الرقم التسلسلي: {(eq as any).serialNumber}</p>}
              </div></CardContent>
            </Card>
          ))}
        </div>
      ) : <Card><CardContent className="py-12 text-center text-muted-foreground"><Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>لا توجد معدات</p></CardContent></Card>}

      <Dialog open={!!editingEquipment} onOpenChange={() => setEditingEquipment(null)}>
        <DialogContent><DialogHeader><DialogTitle>تعديل المعدة</DialogTitle></DialogHeader>
          {editingEquipment && <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>الاسم (عربي)</Label><Input name="nameAr" defaultValue={editingEquipment.nameAr} /></div>
              <div className="space-y-2"><Label>الحالة</Label>
                <Select name="status" defaultValue={editingEquipment.status}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="available">متاحة</SelectItem><SelectItem value="in_use">قيد الاستخدام</SelectItem><SelectItem value="maintenance">صيانة</SelectItem></SelectContent>
                </Select></div>
              <div className="space-y-2"><Label>الحالة الفنية</Label>
                <Select name="condition" defaultValue={editingEquipment.condition}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="excellent">ممتازة</SelectItem><SelectItem value="good">جيدة</SelectItem><SelectItem value="fair">مقبولة</SelectItem><SelectItem value="poor">سيئة</SelectItem></SelectContent>
                </Select></div>
            </div>
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingEquipment(null)}>إلغاء</Button><Button type="submit" disabled={updateMutation.isPending}>تحديث</Button></div>
          </form>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
