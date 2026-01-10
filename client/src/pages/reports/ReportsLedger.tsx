import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
  Search,
  Download,
  FileText,
} from "lucide-react";
import EngineInfoDialog from "@/components/engines/EngineInfoDialog";
import { resolvePageInfo } from "@/components/engines/pageInfoRegistry";
import { useLocation } from "wouter";

const PAGE_INFO = {
  title: "كشف حساب",
  description: "تقرير حركة الحساب لفترة محددة.",
  process: `1) اختيار الحساب والفترة:
   - اختيار الحساب من دليل الحسابات
   - تحديد تاريخ البداية والنهاية
   - عرض الحركات

2) عرض الحركات:
   - الحركات المدينة والدائنة
   - الرصيد الافتتاحي والختامي
   - إمكانية التصدير`,
  mechanism: `- استعلامات tRPC لكشف الحساب
- عرض البيانات في جدول
- إمكانية التصدير`,
  relatedScreens: [
    { name: "دفتر الأستاذ", path: "/dashboard/accounting/general-ledger", description: "دفتر الأستاذ العام" },
    { name: "ميزان المراجعة", path: "/dashboard/accounting/trial-balance", description: "ميزان المراجعة" },
  ],
  businessLogic: "تقرير شامل لحركة حساب معين مع إمكانية التصدير.",
};

export default function ReportsLedger() {
  const [location] = useLocation();
  const [accountId, setAccountId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const businessId = 1;

  const { data: accounts } = trpc.accounting.accounts.list.useQuery({
    businessId,
    limit: 1000,
  });

  const { data: ledgerData, isLoading } = trpc.accounting.reports.generalLedger.useQuery({
    businessId,
    accountId,
    startDate,
    endDate,
  }, { enabled: !!accountId });

  const pageInfo = resolvePageInfo(location);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            كشف حساب
          </h1>
          <p className="text-muted-foreground mt-2">
            تقرير حركة الحساب لفترة محددة
          </p>
        </div>
        <EngineInfoDialog info={pageInfo} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>معايير التقرير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>الحساب</Label>
              <Select
                value={accountId?.toString() || ""}
                onValueChange={(value) => setAccountId(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {(accounts?.data || []).map((account: any) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.code} - {account.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => {}} variant="outline" className="w-full">
                <Download className="h-4 w-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report */}
      {accountId && (
        <Card>
          <CardHeader>
            <CardTitle>كشف حساب</CardTitle>
            <CardDescription>
              {accounts?.data?.find((a: any) => a.id === accountId)?.nameAr || ""}
              {" - "}
              من {new Date(startDate).toLocaleDateString("ar-SA")} إلى {new Date(endDate).toLocaleDateString("ar-SA")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : ledgerData ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead className="text-left">مدين</TableHead>
                      <TableHead className="text-left">دائن</TableHead>
                      <TableHead className="text-left">الرصيد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerData.entries?.map((entry: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(entry.date).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell>{entry.reference || "-"}</TableCell>
                        <TableCell className="text-left">
                          {parseFloat(entry.debit || 0) > 0 ? parseFloat(entry.debit || 0).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-left">
                          {parseFloat(entry.credit || 0) > 0 ? parseFloat(entry.credit || 0).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-left font-medium">
                          {parseFloat(entry.balance || 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد بيانات
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

