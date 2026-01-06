/**
 * شاشة محرك القيود المحاسبية
 * Auto Journal Engine Page
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Eye, RefreshCw, Calendar, Filter, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import EngineInfoDialog, { EngineInfo } from "@/components/engines/EngineInfoDialog";

const AUTO_JOURNAL_INFO: EngineInfo = {
  title: "محرك القيود المحاسبية التلقائي",
  description: "يعرض ويدير جميع القيود المحاسبية التي تم إنشاؤها تلقائياً من قبل النظام",
  process: `هذه الشاشة تعرض جميع القيود المحاسبية التي تم إنشاؤها تلقائياً عند حدوث عمليات مالية في النظام. 
يمكن للمستخدم:
- عرض جميع القيود التلقائية مع تفاصيلها
- فلترة القيود حسب التاريخ ونوع العملية
- عرض إحصائيات شاملة عن القيود (إجمالي القيود، المدين، الدائن)
- عرض تفاصيل كل قيد مع بنوده المحاسبية`,
  mechanism: `1. عند تحميل الصفحة، يتم جلب القيود التلقائية من قاعدة البيانات
2. يتم عرض الإحصائيات (إجمالي القيود، المدين، الدائن)
3. يمكن للمستخدم استخدام الفلاتر لتضييق البحث:
   - تاريخ البداية والنهاية
   - نوع القيد (تلقائي، فاتورة، دفعة، سند قبض، تحويل، إهلاك)
4. عند النقر على "عرض التفاصيل"، يتم جلب بنود القيد من قاعدة البيانات
5. يتم عرض تفاصيل القيد في نافذة منبثقة مع جميع البنود`,
  relatedScreens: [
    {
      name: "القيود اليومية",
      path: "/dashboard/accounting/journal-entries",
      description: "عرض جميع القيود المحاسبية (يدوية وتلقائية)"
    },
    {
      name: "كشف الحساب",
      path: "/dashboard/accounting/general-ledger",
      description: "عرض حركات الحسابات المحاسبية"
    },
    {
      name: "الفواتير",
      path: "/dashboard/customers/invoices",
      description: "عرض الفواتير التي تسبب في إنشاء القيود التلقائية"
    },
    {
      name: "المدفوعات",
      path: "/dashboard/customers/payments",
      description: "عرض المدفوعات التي تسبب في إنشاء القيود التلقائية"
    }
  ],
  businessLogic: `محرك القيود المحاسبية التلقائي يعمل في الخلفية تلقائياً عند:
1. إنشاء فاتورة جديدة:
   - مدين: حساب العملاء
   - دائن: حساب الإيرادات

2. استلام دفعة من عميل:
   - مدين: حساب الصندوق/البنك
   - دائن: حساب العملاء

3. شحن رصيد STS:
   - مدين: حساب البنك
   - دائن: حساب إيرادات مسبقة الدفع

4. استلام مخزون:
   - مدين: حساب المخزون
   - دائن: حساب الموردين

5. دفع مورد:
   - مدين: حساب الموردين
   - دائن: حساب البنك

6. صرف رواتب:
   - مدين: حساب مصروفات الرواتب
   - دائن: حساب البنك

7. استبدال عداد:
   - مدين: حساب تكلفة البضاعة المباعة
   - دائن: حساب المخزون

8. ترقية اشتراك:
   - مدين: حساب العملاء (التأمين المسترجع)
   - دائن: حساب إيرادات الاشتراك

9. إهلاك أصل:
   - مدين: حساب مصروفات الإهلاك
   - دائن: حساب الإهلاك المتراكم

جميع القيود يتم ترحيلها تلقائياً وتحديث أرصدة الحسابات.`
};

export default function AutoJournalEngine() {
  const { toast } = useToast();
  const [businessId] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "" as "" | "all" | "auto" | "invoice" | "payment" | "receipt" | "transfer" | "depreciation",
  });

  // جلب القيود التلقائية
  const { data: entries, refetch: refetchEntries, isLoading } = trpc.autoJournal.entries.list.useQuery({
    businessId,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    type: filters.type && filters.type !== "all" ? filters.type : undefined,
    limit: 50,
    offset: 0,
  });

  // جلب الإحصائيات
  const { data: stats, refetch: refetchStats } = trpc.autoJournal.stats.useQuery({
    businessId,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  });

  const utils = trpc.useUtils();

  const handleViewDetails = async (entryId: number) => {
    try {
      const entry = await utils.autoJournal.entries.getById.fetch({ id: entryId });
      setSelectedEntry(entry);
      setIsDetailsDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "فشل في جلب تفاصيل القيد",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchEntries();
    refetchStats();
    toast({
      title: "تم التحديث",
      description: "تم تحديث البيانات بنجاح",
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      auto: "تلقائي",
      invoice: "فاتورة",
      payment: "دفعة",
      receipt: "سند قبض",
      transfer: "تحويل",
      depreciation: "إهلاك",
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    if (status === "posted") {
      return <Badge className="bg-green-500">مرحل</Badge>;
    } else if (status === "draft") {
      return <Badge className="bg-yellow-500">مسودة</Badge>;
    } else if (status === "reversed") {
      return <Badge className="bg-red-500">معكوس</Badge>;
    }
    return <Badge>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">محرك القيود المحاسبية</h1>
          <p className="text-muted-foreground mt-2">
            عرض وإدارة القيود المحاسبية التلقائية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EngineInfoDialog info={AUTO_JOURNAL_INFO} />
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            تحديث
          </Button>
        </div>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي القيود</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.totalDebit).toLocaleString("ar-SA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ر.س
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.totalCredit).toLocaleString("ar-SA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ر.س
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle>الفلاتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>تاريخ البداية</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label>تاريخ النهاية</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label>نوع القيد</Label>
              <Select
                value={filters.type || undefined}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: (value || "") as typeof filters.type })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="auto">تلقائي</SelectItem>
                  <SelectItem value="invoice">فاتورة</SelectItem>
                  <SelectItem value="payment">دفعة</SelectItem>
                  <SelectItem value="receipt">سند قبض</SelectItem>
                  <SelectItem value="transfer">تحويل</SelectItem>
                  <SelectItem value="depreciation">إهلاك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilters({ startDate: "", endDate: "", type: "all" });
                  refetchEntries();
                }}
                variant="outline"
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة القيود */}
      <Card>
        <CardHeader>
          <CardTitle>القيود التلقائية</CardTitle>
          <CardDescription>عرض جميع القيود المحاسبية التي تم إنشاؤها تلقائياً</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !entries || entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد قيود محاسبية تلقائية
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القيد</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>المصدر</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>المدين</TableHead>
                  <TableHead>الدائن</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                    <TableCell>
                      {entry.entryDate
                        ? format(new Date(entry.entryDate), "yyyy-MM-dd", { locale: ar })
                        : "-"}
                    </TableCell>
                    <TableCell>{getTypeLabel(entry.type)}</TableCell>
                    <TableCell>
                      {entry.sourceModule && entry.sourceId
                        ? `${entry.sourceModule} #${entry.sourceId}`
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{entry.description || "-"}</TableCell>
                    <TableCell>
                      {Number(entry.totalDebit).toLocaleString("ar-SA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ر.س
                    </TableCell>
                    <TableCell>
                      {Number(entry.totalCredit).toLocaleString("ar-SA", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ر.س
                    </TableCell>
                    <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(entry.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* تفاصيل القيد */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل القيد المحاسبي</DialogTitle>
            <DialogDescription>
              {selectedEntry?.entryNumber} - {selectedEntry?.description}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم القيد</Label>
                  <p className="font-medium">{selectedEntry.entryNumber}</p>
                </div>
                <div>
                  <Label>التاريخ</Label>
                  <p className="font-medium">
                    {selectedEntry.entryDate
                      ? format(new Date(selectedEntry.entryDate), "yyyy-MM-dd", { locale: ar })
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label>النوع</Label>
                  <p className="font-medium">{getTypeLabel(selectedEntry.type)}</p>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div>{getStatusBadge(selectedEntry.status)}</div>
                </div>
                <div>
                  <Label>المصدر</Label>
                  <p className="font-medium">
                    {selectedEntry.sourceModule && selectedEntry.sourceId
                      ? `${selectedEntry.sourceModule} #${selectedEntry.sourceId}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label>الوصف</Label>
                  <p className="font-medium">{selectedEntry.description || "-"}</p>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">بنود القيد</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>كود الحساب</TableHead>
                      <TableHead>اسم الحساب</TableHead>
                      <TableHead>المدين</TableHead>
                      <TableHead>الدائن</TableHead>
                      <TableHead>الوصف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines && selectedEntry.lines.length > 0 ? (
                      selectedEntry.lines.map((line: any) => (
                        <TableRow key={line.id}>
                          <TableCell>{line.lineNumber}</TableCell>
                          <TableCell>{line.accountCode || "-"}</TableCell>
                          <TableCell>
                            {line.accountNameAr || line.accountNameEn || "-"}
                          </TableCell>
                          <TableCell>
                            {Number(line.debit || 0).toLocaleString("ar-SA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ر.س
                          </TableCell>
                          <TableCell>
                            {Number(line.credit || 0).toLocaleString("ar-SA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ر.س
                          </TableCell>
                          <TableCell>{line.description || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          لا توجد بنود
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

