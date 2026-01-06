import { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  Loader2,
  FileText,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AccountOption = {
  id: number;
  accountCode: string;
  accountNameAr: string;
};

type StatementRow = {
  id: number;
  entryId: number;
  entryNumber: string | null;
  entryDate: string | Date | null;
  referenceType: string | null;
  referenceId: number | null;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
  status: string | null;
};

type AccountStatementProps = {
  subSystemId: number;
  businessId: number;
  accounts: AccountOption[];
};

export default function AccountStatement({ subSystemId, businessId, accounts }: AccountStatementProps) {
  const [accountId, setAccountId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statement, setStatement] = useState<StatementRow[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchStatement = async () => {
    if (!accountId) {
      toast.error("يرجى اختيار الحساب");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("/api/custom-system/v2/accounts/statement", {
        params: {
          accountId,
          subSystemId,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        },
      });
      setStatement(res.data.statement || []);
      if (!res.data.statement?.length) {
        toast.info("لا توجد حركات في الفترة المحددة");
      } else {
        toast.success("تم تحميل كشف الحساب بنجاح");
      }
    } catch (error) {
      console.error("فشل في جلب كشف الحساب", error);
      toast.error("تعذر جلب كشف الحساب");
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = accounts.find((a) => a.id === Number(accountId));

  // Calculate statistics
  const totalDebit = statement.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = statement.reduce((sum, row) => sum + row.credit, 0);
  const finalBalance = statement.length > 0 ? statement[statement.length - 1].balance : 0;
  const openingBalance = statement.length > 0 ? finalBalance - (totalDebit - totalCredit) : 0;

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html dir="rtl">
            <head>
              <title>كشف حساب - ${selectedAccount?.accountNameAr || ""}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #1e293b; color: white; }
                .header { text-align: center; margin-bottom: 30px; }
                .stats { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
                @media print { button { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>كشف حساب</h1>
                <h3>${selectedAccount?.accountCode || ""} - ${selectedAccount?.accountNameAr || ""}</h3>
                <p>من ${fromDate || "البداية"} إلى ${toDate || "النهاية"}</p>
              </div>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExportCSV = () => {
    if (statement.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const csvContent = [
      ["التاريخ", "رقم القيد", "المرجع", "الوصف", "مدين", "دائن", "الرصيد"],
      ...statement.map((row) => [
        row.entryDate ? new Date(row.entryDate).toLocaleDateString("ar-EG") : "-",
        row.entryNumber ?? `#${row.entryId}`,
        row.referenceType ? `${row.referenceType} ${row.referenceId ?? ""}` : "-",
        row.description ?? "-",
        row.debit.toLocaleString("ar-SA"),
        row.credit.toLocaleString("ar-SA"),
        row.balance.toLocaleString("ar-SA"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `كشف_حساب_${selectedAccount?.accountCode}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("تم تصدير الملف بنجاح");
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-sky-400" />
            كشف الحساب
          </CardTitle>
          <CardDescription className="text-slate-300">
            عرض تفصيلي لحركات الحساب مع الإحصائيات والتحليلات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                الحساب
              </Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white hover:bg-slate-750 transition-colors">
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-700">
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={String(acc.id)} className="hover:bg-slate-800">
                      {acc.accountCode} - {acc.accountNameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                من تاريخ
              </Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-750 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-200 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                إلى تاريخ
              </Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-750 transition-colors"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchStatement}
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white transition-all"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                عرض كشف الحساب
              </Button>
            </div>
          </div>

          {/* Selected Account Info */}
          {selectedAccount && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="text-slate-300">
                  <span className="text-sm">الحساب المختار:</span>
                  <div className="font-bold text-white text-lg mt-1">
                    {selectedAccount.accountCode} - {selectedAccount.accountNameAr}
                  </div>
                </div>
                {statement.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePrint}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      طباعة
                    </Button>
                    <Button
                      onClick={handleExportCSV}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      تصدير CSV
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {statement.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border-emerald-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-200 text-sm font-medium">إجمالي المدين</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {totalDebit.toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 border-amber-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-200 text-sm font-medium">إجمالي الدائن</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {totalCredit.toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className="bg-amber-500/20 p-3 rounded-full">
                  <TrendingDown className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border-blue-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm font-medium">الرصيد الافتتاحي</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {openingBalance.toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "bg-gradient-to-br border",
            finalBalance >= 0
              ? "from-sky-900/40 to-sky-800/20 border-sky-700/50"
              : "from-red-900/40 to-red-800/20 border-red-700/50"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    finalBalance >= 0 ? "text-sky-200" : "text-red-200"
                  )}>
                    الرصيد الختامي
                  </p>
                  <p className="text-2xl font-bold text-white mt-2">
                    {finalBalance.toLocaleString("ar-SA")}
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-full",
                  finalBalance >= 0 ? "bg-sky-500/20" : "bg-red-500/20"
                )}>
                  <Activity className={cn(
                    "h-6 w-6",
                    finalBalance >= 0 ? "text-sky-400" : "text-red-400"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statement Table */}
      {statement.length === 0 && !loading && (
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                لا توجد بيانات لعرضها
              </p>
              <p className="text-slate-500 text-sm mt-2">
                اختر الحساب وحدد الفترة ثم اضغط عرض كشف الحساب
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {statement.length > 0 && (
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-400" />
                الحركات التفصيلية
              </CardTitle>
              <div className="text-sm text-slate-400">
                عدد الحركات: <span className="font-bold text-white">{statement.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={printRef} className="rounded-lg border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-800/80">
                    <TableRow className="hover:bg-slate-800/80">
                      <TableHead className="text-right text-slate-200 font-semibold">التاريخ</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">رقم القيد</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">المرجع</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">الوصف</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">مدين</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">دائن</TableHead>
                      <TableHead className="text-right text-slate-200 font-semibold">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statement.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={cn(
                          "border-slate-800 hover:bg-slate-800/40 transition-colors",
                          index % 2 === 0 ? "bg-slate-900/20" : "bg-slate-900/40"
                        )}
                      >
                        <TableCell className="text-right text-white font-medium">
                          {row.entryDate ? new Date(row.entryDate).toLocaleDateString("ar-EG") : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sky-400 font-mono">
                          {row.entryNumber ?? `#${row.entryId}`}
                        </TableCell>
                        <TableCell className="text-right text-slate-300 text-sm">
                          {row.referenceType ? `${row.referenceType} ${row.referenceId ?? ""}` : "-"}
                        </TableCell>
                        <TableCell className="text-right text-slate-200 max-w-xs truncate">
                          {row.description ?? "-"}
                        </TableCell>
                        <TableCell className="text-right text-emerald-400 font-semibold font-mono">
                          {row.debit > 0 ? row.debit.toLocaleString("ar-SA") : "-"}
                        </TableCell>
                        <TableCell className="text-right text-amber-400 font-semibold font-mono">
                          {row.credit > 0 ? row.credit.toLocaleString("ar-SA") : "-"}
                        </TableCell>
                        <TableCell className={cn(
                          "text-right font-bold font-mono",
                          row.balance >= 0 ? "text-sky-400" : "text-red-400"
                        )}>
                          {row.balance.toLocaleString("ar-SA")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
