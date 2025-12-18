import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { toast } from "sonner";

type EntryStatus = "draft" | "posted" | "reversed";

interface JournalEntryLine {
  id: number;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  costCenter?: string;
}

interface JournalEntry {
  id: number;
  entryNumber: string;
  date: string;
  description: string;
  reference: string;
  status: EntryStatus;
  totalDebit: number;
  totalCredit: number;
  createdBy: string;
  createdAt: string;
  postedAt?: string;
  lines: JournalEntryLine[];
}

// بيانات تجريبية
const mockEntries: JournalEntry[] = [
  {
    id: 1,
    entryNumber: "JE-2024-0001",
    date: "2024-01-15",
    description: "قيد افتتاحي للسنة المالية 2024",
    reference: "REF-001",
    status: "posted",
    totalDebit: 15000000,
    totalCredit: 15000000,
    createdBy: "محمد أحمد",
    createdAt: "2024-01-15 09:00",
    postedAt: "2024-01-15 10:30",
    lines: [
      { id: 1, accountCode: "1111", accountName: "النقدية بالصندوق", description: "رصيد افتتاحي", debit: 500000, credit: 0 },
      { id: 2, accountCode: "1112", accountName: "النقدية بالبنك", description: "رصيد افتتاحي", debit: 1000000, credit: 0 },
      { id: 3, accountCode: "1121", accountName: "مدينون تجاريون", description: "رصيد افتتاحي", debit: 2000000, credit: 0 },
      { id: 4, accountCode: "121", accountName: "الأراضي", description: "رصيد افتتاحي", debit: 3000000, credit: 0 },
      { id: 5, accountCode: "122", accountName: "المباني", description: "رصيد افتتاحي", debit: 4000000, credit: 0 },
      { id: 6, accountCode: "123", accountName: "المعدات", description: "رصيد افتتاحي", debit: 2000000, credit: 0 },
      { id: 7, accountCode: "124", accountName: "المركبات", description: "رصيد افتتاحي", debit: 1000000, credit: 0 },
      { id: 8, accountCode: "113", accountName: "المخزون", description: "رصيد افتتاحي", debit: 1500000, credit: 0 },
      { id: 9, accountCode: "211", accountName: "الدائنون", description: "رصيد افتتاحي", debit: 0, credit: 1500000 },
      { id: 10, accountCode: "221", accountName: "قروض طويلة الأجل", description: "رصيد افتتاحي", debit: 0, credit: 4000000 },
      { id: 11, accountCode: "31", accountName: "رأس المال", description: "رصيد افتتاحي", debit: 0, credit: 5000000 },
      { id: 12, accountCode: "32", accountName: "الأرباح المحتجزة", description: "رصيد افتتاحي", debit: 0, credit: 4500000 },
    ]
  },
  {
    id: 2,
    entryNumber: "JE-2024-0002",
    date: "2024-01-20",
    description: "تحصيل فواتير كهرباء من العملاء",
    reference: "INV-2024-001",
    status: "posted",
    totalDebit: 250000,
    totalCredit: 250000,
    createdBy: "سارة محمد",
    createdAt: "2024-01-20 11:30",
    postedAt: "2024-01-20 14:00",
    lines: [
      { id: 1, accountCode: "1112", accountName: "النقدية بالبنك", description: "تحصيل فواتير", debit: 250000, credit: 0 },
      { id: 2, accountCode: "1121", accountName: "مدينون تجاريون", description: "تحصيل فواتير", debit: 0, credit: 250000 },
    ]
  },
  {
    id: 3,
    entryNumber: "JE-2024-0003",
    date: "2024-01-25",
    description: "شراء قطع غيار للصيانة",
    reference: "PO-2024-015",
    status: "posted",
    totalDebit: 75000,
    totalCredit: 75000,
    createdBy: "أحمد علي",
    createdAt: "2024-01-25 10:00",
    postedAt: "2024-01-25 11:30",
    lines: [
      { id: 1, accountCode: "113", accountName: "المخزون", description: "قطع غيار", debit: 75000, credit: 0 },
      { id: 2, accountCode: "211", accountName: "الدائنون", description: "مستحق للمورد", debit: 0, credit: 75000 },
    ]
  },
  {
    id: 4,
    entryNumber: "JE-2024-0004",
    date: "2024-01-28",
    description: "صرف رواتب شهر يناير",
    reference: "PAY-2024-01",
    status: "posted",
    totalDebit: 450000,
    totalCredit: 450000,
    createdBy: "محمد أحمد",
    createdAt: "2024-01-28 09:00",
    postedAt: "2024-01-28 16:00",
    lines: [
      { id: 1, accountCode: "521", accountName: "الرواتب", description: "رواتب يناير", debit: 450000, credit: 0 },
      { id: 2, accountCode: "1112", accountName: "النقدية بالبنك", description: "تحويل رواتب", debit: 0, credit: 450000 },
    ]
  },
  {
    id: 5,
    entryNumber: "JE-2024-0005",
    date: "2024-02-01",
    description: "إيرادات مبيعات كهرباء - فبراير",
    reference: "REV-2024-02",
    status: "draft",
    totalDebit: 850000,
    totalCredit: 850000,
    createdBy: "سارة محمد",
    createdAt: "2024-02-01 08:30",
    lines: [
      { id: 1, accountCode: "1121", accountName: "مدينون تجاريون", description: "فواتير فبراير", debit: 850000, credit: 0 },
      { id: 2, accountCode: "41", accountName: "مبيعات الكهرباء", description: "إيرادات فبراير", debit: 0, credit: 850000 },
    ]
  },
  {
    id: 6,
    entryNumber: "JE-2024-0006",
    date: "2024-02-05",
    description: "مصروفات صيانة المحولات",
    reference: "WO-2024-023",
    status: "draft",
    totalDebit: 125000,
    totalCredit: 125000,
    createdBy: "أحمد علي",
    createdAt: "2024-02-05 14:00",
    lines: [
      { id: 1, accountCode: "512", accountName: "مصروفات الصيانة", description: "صيانة محولات", debit: 125000, credit: 0 },
      { id: 2, accountCode: "113", accountName: "المخزون", description: "قطع غيار مستخدمة", debit: 0, credit: 125000 },
    ]
  },
];

const statusConfig: Record<EntryStatus, { label: string; variant: "success" | "warning" | "error" }> = {
  draft: { label: "مسودة", variant: "warning" },
  posted: { label: "مرحّل", variant: "success" },
  reversed: { label: "ملغي", variant: "error" },
};

export default function JournalEntries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  
  // نموذج القيد الجديد
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    reference: "",
    lines: [
      { accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
      { accountCode: "", accountName: "", description: "", debit: 0, credit: 0 },
    ] as JournalEntryLine[],
  });

  // فلترة القيود
  const filteredEntries = mockEntries.filter(entry => {
    const matchesSearch = searchTerm === "" ||
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.includes(searchTerm) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || entry.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // حساب الإحصائيات
  const stats = {
    totalEntries: mockEntries.length,
    draftEntries: mockEntries.filter(e => e.status === "draft").length,
    postedEntries: mockEntries.filter(e => e.status === "posted").length,
    totalDebit: mockEntries.reduce((sum, e) => sum + e.totalDebit, 0),
  };

  const handleView = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handlePost = (entry: JournalEntry) => {
    toast.success(`تم ترحيل القيد: ${entry.entryNumber}`);
  };

  const handleDelete = (entry: JournalEntry) => {
    toast.success(`تم حذف القيد: ${entry.entryNumber}`);
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { accountCode: "", accountName: "", description: "", debit: 0, credit: 0 } as JournalEntryLine],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 2) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index),
      });
    }
  };

  const updateLine = (index: number, field: string, value: string | number) => {
    const newLines = [...formData.lines];
    (newLines[index] as any)[field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = formData.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSave = () => {
    if (!isBalanced) {
      toast.error("القيد غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن");
      return;
    }
    toast.success("تم حفظ القيد بنجاح");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            القيود اليومية
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة القيود المحاسبية اليومية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القيود</p>
                <p className="text-xl font-bold">{stats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيود مسودة</p>
                <p className="text-xl font-bold">{stats.draftEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">قيود مرحّلة</p>
                <p className="text-xl font-bold">{stats.postedEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الحركات</p>
                <p className="text-xl font-bold">{(stats.totalDebit / 1000000).toFixed(1)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* البحث والفلترة */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث برقم القيد أو الوصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EntryStatus | "all")}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="posted">مرحّل</SelectItem>
                <SelectItem value="reversed">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول القيود */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم القيد</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">المرجع</TableHead>
                <TableHead className="text-right">المدين</TableHead>
                <TableHead className="text-right">الدائن</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono font-medium">{entry.entryNumber}</TableCell>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                  <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                  <TableCell className="font-mono">{entry.totalDebit.toLocaleString()}</TableCell>
                  <TableCell className="font-mono">{entry.totalCredit.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={entry.status === "posted" ? "default" : entry.status === "draft" ? "secondary" : "destructive"}
                      className={entry.status === "posted" ? "bg-green-500/20 text-green-400" : entry.status === "draft" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}
                    >
                      {statusConfig[entry.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleView(entry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {entry.status === "draft" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handlePost(entry)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(entry)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* نافذة عرض تفاصيل القيد */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>تفاصيل القيد: {selectedEntry?.entryNumber}</span>
              <Badge 
                variant={selectedEntry?.status === "posted" ? "default" : selectedEntry?.status === "draft" ? "secondary" : "destructive"}
                className={selectedEntry?.status === "posted" ? "bg-green-500/20 text-green-400" : selectedEntry?.status === "draft" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}
              >
                {statusConfig[selectedEntry?.status || "draft"].label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              {/* معلومات القيد */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">التاريخ</p>
                  <p className="font-medium">{selectedEntry.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المرجع</p>
                  <p className="font-medium font-mono">{selectedEntry.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">أنشأه</p>
                  <p className="font-medium">{selectedEntry.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">{selectedEntry.createdAt}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">الوصف</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>

              {/* بنود القيد */}
              <div>
                <h4 className="font-semibold mb-3">بنود القيد</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رمز الحساب</TableHead>
                      <TableHead className="text-right">اسم الحساب</TableHead>
                      <TableHead className="text-right">البيان</TableHead>
                      <TableHead className="text-right">مدين</TableHead>
                      <TableHead className="text-right">دائن</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-mono">{line.accountCode}</TableCell>
                        <TableCell>{line.accountName}</TableCell>
                        <TableCell>{line.description}</TableCell>
                        <TableCell className="font-mono text-green-500">
                          {line.debit > 0 ? line.debit.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-red-500">
                          {line.credit > 0 ? line.credit.toLocaleString() : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="text-left">الإجمالي</TableCell>
                      <TableCell className="font-mono text-green-500">
                        {selectedEntry.totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-red-500">
                        {selectedEntry.totalCredit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة إضافة قيد جديد */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة قيد يومي جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* معلومات القيد */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>التاريخ</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>المرجع</Label>
                <Input
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="رقم المرجع"
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>الوصف</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف القيد"
                />
              </div>
            </div>

            {/* بنود القيد */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">بنود القيد</h4>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 ml-1" />
                  إضافة بند
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-[120px]">رمز الحساب</TableHead>
                    <TableHead className="text-right">البيان</TableHead>
                    <TableHead className="text-right w-[150px]">مدين</TableHead>
                    <TableHead className="text-right w-[150px]">دائن</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={line.accountCode}
                          onChange={(e) => updateLine(index, "accountCode", e.target.value)}
                          placeholder="1111"
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, "description", e.target.value)}
                          placeholder="البيان"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.debit || ""}
                          onChange={(e) => updateLine(index, "debit", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={line.credit || ""}
                          onChange={(e) => updateLine(index, "credit", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="font-mono"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeLine(index)}
                          disabled={formData.lines.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={2} className="text-left">الإجمالي</TableCell>
                    <TableCell className={`font-mono ${isBalanced ? "text-green-500" : "text-red-500"}`}>
                      {totalDebit.toLocaleString()}
                    </TableCell>
                    <TableCell className={`font-mono ${isBalanced ? "text-green-500" : "text-red-500"}`}>
                      {totalCredit.toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              
              {/* رسالة التوازن */}
              <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                isBalanced 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-red-500/10 text-red-500"
              }`}>
                {isBalanced ? (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>القيد متوازن</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5" />
                    <span>القيد غير متوازن - الفرق: {Math.abs(totalDebit - totalCredit).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="outline" onClick={handleSave}>
              حفظ كمسودة
            </Button>
            <Button onClick={handleSave} disabled={!isBalanced}>
              حفظ وترحيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
