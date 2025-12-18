import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Search, Users, Edit, UserPlus } from "lucide-react";

interface FieldTeamsProps {
  businessId: number;
}

export default function FieldTeams({ businessId }: FieldTeamsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);

  const { data: teams, isLoading, refetch } = trpc.fieldOps.teams.list.useQuery({ businessId });
  const { data: workers } = trpc.fieldOps.workers.list.useQuery({ businessId });

  const createMutation = trpc.fieldOps.teams.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الفريق بنجاح");
      setIsCreateOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.fieldOps.teams.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الفريق بنجاح");
      setEditingTeam(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      businessId,
      code: `TEAM-${Date.now()}`,
      nameAr: formData.get("nameAr") as string,
      nameEn: formData.get("nameEn") as string || undefined,
      teamType: formData.get("teamType") as any,
      leaderId: formData.get("leaderId") ? Number(formData.get("leaderId")) : undefined,
      maxMembers: formData.get("maxMembers") ? Number(formData.get("maxMembers")) : 10,
      workingArea: formData.get("workingArea") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingTeam.id,
      data: {
        nameAr: formData.get("nameAr") as string,
        nameEn: formData.get("nameEn") as string || undefined,
        teamType: formData.get("teamType") as any,
        status: formData.get("status") as any,
        leaderId: formData.get("leaderId") ? Number(formData.get("leaderId")) : undefined,
        maxMembers: formData.get("maxMembers") ? Number(formData.get("maxMembers")) : undefined,
        workingArea: formData.get("workingArea") as string || undefined,
        notes: formData.get("notes") as string || undefined,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      active: { label: "نشط", variant: "default" },
      inactive: { label: "غير نشط", variant: "secondary" },
      on_leave: { label: "في إجازة", variant: "destructive" },
    };
    const config = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, string> = {
      installation: "تركيب",
      maintenance: "صيانة",
      inspection: "فحص",
      collection: "تحصيل",
      mixed: "متعدد",
    };
    return <Badge variant="outline">{typeMap[type] || type}</Badge>;
  };

  const filteredTeams = teams?.filter((team) =>
    team.nameAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const TeamForm = ({ team, onSubmit, isLoading: formLoading }: { team?: any; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; isLoading: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameAr">اسم الفريق (عربي) *</Label>
          <Input id="nameAr" name="nameAr" required defaultValue={team?.nameAr} placeholder="أدخل اسم الفريق" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">اسم الفريق (إنجليزي)</Label>
          <Input id="nameEn" name="nameEn" defaultValue={team?.nameEn} placeholder="Enter team name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="teamType">نوع الفريق *</Label>
          <Select name="teamType" defaultValue={team?.teamType || "mixed"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="installation">تركيب</SelectItem>
              <SelectItem value="maintenance">صيانة</SelectItem>
              <SelectItem value="inspection">فحص</SelectItem>
              <SelectItem value="collection">تحصيل</SelectItem>
              <SelectItem value="mixed">متعدد</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {team && (
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select name="status" defaultValue={team?.status || "active"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="on_leave">في إجازة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="leaderId">قائد الفريق</Label>
          <Select name="leaderId" defaultValue={team?.leaderId?.toString() || ""}>
            <SelectTrigger>
              <SelectValue placeholder="اختر قائد الفريق" />
            </SelectTrigger>
            <SelectContent>
              {workers?.filter(w => w.workerType === "supervisor" || w.workerType === "engineer").map((worker) => (
                <SelectItem key={worker.id} value={worker.id.toString()}>
                  {worker.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxMembers">الحد الأقصى للأعضاء</Label>
          <Input id="maxMembers" name="maxMembers" type="number" defaultValue={team?.maxMembers || 10} />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="workingArea">منطقة العمل</Label>
          <Input id="workingArea" name="workingArea" defaultValue={team?.workingArea} placeholder="أدخل منطقة العمل" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات</Label>
        <Textarea id="notes" name="notes" defaultValue={team?.notes} placeholder="ملاحظات إضافية" rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => team ? setEditingTeam(null) : setIsCreateOpen(false)}>
          إلغاء
        </Button>
        <Button type="submit" disabled={formLoading}>
          {formLoading ? "جاري الحفظ..." : team ? "تحديث" : "إنشاء"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفرق الميدانية</h1>
          <p className="text-muted-foreground">إدارة فرق العمل الميدانية</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              فريق جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء فريق جديد</DialogTitle>
            </DialogHeader>
            <TeamForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن فريق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.nameAr}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setEditingTeam(team)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">{team.code}</span>
                    {getStatusBadge(team.status || "active")}
                    {getTypeBadge(team.teamType || "mixed")}
                  </div>
                  {team.workingArea && (
                    <p className="text-sm text-muted-foreground">
                      منطقة العمل: {team.workingArea}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      الأعضاء: 0 / {team.maxMembers}
                    </span>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4 ml-1" />
                      إضافة عضو
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد فرق</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)}>
              إنشاء فريق جديد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الفريق</DialogTitle>
          </DialogHeader>
          {editingTeam && <TeamForm team={editingTeam} onSubmit={handleUpdate} isLoading={updateMutation.isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
