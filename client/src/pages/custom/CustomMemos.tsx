import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Mail, 
  Plus, 
  Search,
  Eye,
  Trash2,
  Send,
  FileText,
  Clock,
  CheckCircle,
  Archive
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const memoTypes = [
  { value: "internal", label: "داخلية" },
  { value: "external", label: "خارجية" },
  { value: "circular", label: "تعميم" },
  { value: "directive", label: "توجيه" },
];

const priorities = [
  { value: "low", label: "منخفضة", color: "bg-gray-500" },
  { value: "medium", label: "متوسطة", color: "bg-blue-500" },
  { value: "high", label: "عالية", color: "bg-orange-500" },
  { value: "urgent", label: "عاجلة", color: "bg-red-500" },
];

const statuses = [
  { value: "draft", label: "مسودة", icon: FileText, color: "text-gray-500" },
  { value: "sent", label: "مرسلة", icon: Send, color: "text-blue-500" },
  { value: "received", label: "مستلمة", icon: CheckCircle, color: "text-green-500" },
  { value: "archived", label: "مؤرشفة", icon: Archive, color: "text-muted-foreground" },
];

export default function CustomMemos() {
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    memoNumber: "",
    memoDate: new Date().toISOString().split("T")[0],
    subject: "",
    content: "",
    memoType: "internal" as "internal" | "external" | "circular" | "directive",
    fromDepartment: "",
    toDepartment: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    responseRequired: false,
    responseDeadline: "",
  });

  const businessId = 1;

  const { data: memos = [], refetch } = trpc.customSystem.memos.list.useQuery({ 
    businessId,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
  });
  
  const createMemo = trpc.customSystem.memos.create.useMutation({
    onSuccess: () => {
      
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      
    },
  });

  const updateMemo = trpc.customSystem.memos.update.useMutation({
    onSuccess: () => {
      
      refetch();
    },
  });

  const deleteMemo = trpc.customSystem.memos.delete.useMutation({
    onSuccess: () => {
      
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      memoNumber: "",
      memoDate: new Date().toISOString().split("T")[0],
      subject: "",
      content: "",
      memoType: "internal",
      fromDepartment: "",
      toDepartment: "",
      priority: "medium",
      responseRequired: false,
      responseDeadline: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMemo.mutate({ ...formData, businessId } as any);
  };

  const viewMemo = (memo: any) => {
    setSelectedMemo(memo);
    setIsViewDialogOpen(true);
  };

  const sendMemo = (id: number) => {
    updateMemo.mutate({ id, status: "sent" } as any);
  };

  const archiveMemo = (id: number) => {
    updateMemo.mutate({ id, status: "archived" } as any);
  };

  const filteredMemos = memos.filter(
    (memo) =>
      memo.subject.includes(searchTerm) ||
      memo.memoNumber.includes(searchTerm)
  );

  // Generate memo number
  const generateMemoNumber = () => {
    const year = new Date().getFullYear();
    const count = memos.length + 1;
    return `MEMO-${year}-${count.toString().padStart(4, "0")}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            المذكرات
          </h1>
          <p className="text-muted-foreground">إدارة المذكرات والتعاميم</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({ ...formData, memoNumber: generateMemoNumber() })}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مذكرة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة مذكرة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="memoNumber">رقم المذكرة *</Label>
                  <Input
                    id="memoNumber"
                    value={(formData as any).memoNumber}
                    onChange={(e) => setFormData({ ...formData, memoNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoDate">التاريخ *</Label>
                  <Input
                    id="memoDate"
                    type="date"
                    value={(formData as any).memoDate}
                    onChange={(e) => setFormData({ ...formData, memoDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoType">نوع المذكرة</Label>
                  <Select
                    value={(formData as any).memoType}
                    onValueChange={(value: any) => setFormData({ ...formData, memoType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {memoTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع *</Label>
                <Input
                  id="subject"
                  value={(formData as any).subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="موضوع المذكرة"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromDepartment">من</Label>
                  <Input
                    id="fromDepartment"
                    value={(formData as any).fromDepartment}
                    onChange={(e) => setFormData({ ...formData, fromDepartment: e.target.value })}
                    placeholder="القسم المرسل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toDepartment">إلى</Label>
                  <Input
                    id="toDepartment"
                    value={(formData as any).toDepartment}
                    onChange={(e) => setFormData({ ...formData, toDepartment: e.target.value })}
                    placeholder="القسم المستلم"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">المحتوى</Label>
                <Textarea
                  id="content"
                  value={(formData as any).content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="نص المذكرة..."
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select
                    value={(formData as any).priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${p.color}`} />
                            {p.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseDeadline">موعد الرد</Label>
                  <Input
                    id="responseDeadline"
                    type="date"
                    value={(formData as any).responseDeadline}
                    onChange={(e) => setFormData({ ...formData, responseDeadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMemo.isPending}>
                  {createMemo.isPending ? "جاري الإنشاء..." : "إنشاء المذكرة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statuses.map((status) => {
          const count = memos.filter((m) => m.status === status.value).length;
          const Icon = status.icon;
          return (
            <Card 
              key={status.value}
              className={`cursor-pointer transition-colors ${statusFilter === status.value ? 'border-primary' : ''}`}
              onClick={() => setStatusFilter(statusFilter === status.value ? "all" : status.value)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${status.color}`} />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{status.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالموضوع أو الرقم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        {statusFilter !== "all" && (
          <Button variant="ghost" onClick={() => setStatusFilter("all")}>
            إظهار الكل
          </Button>
        )}
      </div>

      {/* Memos Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم المذكرة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الموضوع</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMemos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد مذكرات
                  </TableCell>
                </TableRow>
              ) : (
                filteredMemos.map((memo) => {
                  const typeInfo = memoTypes.find((t) => t.value === memo.memoType);
                  const priorityInfo = priorities.find((p) => p.value === memo.priority);
                  const statusInfo = statuses.find((s) => s.value === memo.status);
                  const StatusIcon = statusInfo?.icon || FileText;
                  
                  return (
                    <TableRow key={memo.id}>
                      <TableCell className="font-mono">{memo.memoNumber}</TableCell>
                      <TableCell>{new Date(memo.memoDate).toLocaleDateString("ar-SA")}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{memo.subject}</TableCell>
                      <TableCell>{typeInfo?.label}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <div className={`w-2 h-2 rounded-full ${priorityInfo?.color}`} />
                          {priorityInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`gap-1 ${statusInfo?.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => viewMemo(memo)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {memo.status === "draft" && (
                            <Button variant="ghost" size="icon" onClick={() => sendMemo(memo.id)}>
                              <Send className="h-4 w-4 text-blue-500" />
                            </Button>
                          )}
                          {memo.status !== "archived" && (
                            <Button variant="ghost" size="icon" onClick={() => archiveMemo(memo.id)}>
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => deleteMemo.mutate({ id: memo.id } as any)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Memo Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>عرض المذكرة</DialogTitle>
          </DialogHeader>
          {selectedMemo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">رقم المذكرة:</span>
                  <span className="font-mono mr-2">{selectedMemo.memoNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="mr-2">{new Date(selectedMemo.memoDate).toLocaleDateString("ar-SA")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">من:</span>
                  <span className="mr-2">{selectedMemo.fromDepartment || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">إلى:</span>
                  <span className="mr-2">{selectedMemo.toDepartment || "-"}</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">الموضوع</h3>
                <p>{selectedMemo.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">المحتوى</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {selectedMemo.content || "لا يوجد محتوى"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
