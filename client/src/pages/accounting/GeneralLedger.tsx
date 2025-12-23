// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GeneralLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Fetch accounts for selection
  const { data: accounts = [], isLoading: accountsLoading } = trpc.accounting.accounts.list.useQuery({
    businessId: 1,
  });

  // Fetch ledger entries
  const { data: ledgerData, isLoading: ledgerLoading, refetch } = trpc.accounting.generalLedger.useQuery({
    businessId: 1,
    accountId: selectedAccount ? parseInt(selectedAccount) : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }, {
    enabled: !!selectedAccount,
  });

  const handleSearch = () => {
    if (selectedAccount) {
      refetch();
    }
  };

  const selectedAccountData = accounts.find((a: any) => a.id.toString() === selectedAccount);

  if (accountsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>دفتر الأستاذ العام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>الحساب *</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc: any) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.code} - {acc.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} disabled={!selectedAccount}>
                <Search className="w-4 h-4 ml-2" />
                عرض
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      {selectedAccountData && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">رقم الحساب</p>
                <p className="font-mono font-bold">{selectedAccountData.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">اسم الحساب</p>
                <p className="font-bold">{selectedAccountData.nameAr}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">النوع</p>
                <p className="font-bold">
                  {selectedAccountData.type === "asset" && "أصول"}
                  {selectedAccountData.type === "liability" && "خصوم"}
                  {selectedAccountData.type === "equity" && "حقوق ملكية"}
                  {selectedAccountData.type === "revenue" && "إيرادات"}
                  {selectedAccountData.type === "expense" && "مصروفات"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className={cn(
                  "font-mono font-bold text-lg",
                  Number(selectedAccountData.currentBalance) >= 0 ? "text-success" : "text-destructive"
                )}>
                  {Number(selectedAccountData.currentBalance || 0).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ledger Table */}
      {selectedAccount && (
        <Card>
          <CardContent className="p-0">
            {ledgerLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : ledgerData?.entries?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>رقم القيد</TableHead>
                    <TableHead>البيان</TableHead>
                    <TableHead className="text-left">مدين</TableHead>
                    <TableHead className="text-left">دائن</TableHead>
                    <TableHead className="text-left">الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Opening Balance Row */}
                  <TableRow className="bg-muted/50">
                    <TableCell colSpan={3} className="font-bold">
                      الرصيد الافتتاحي
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-left font-mono font-bold">
                      {Number(ledgerData.openingBalance || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  
                  {ledgerData.entries.map((entry: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString("ar-SA") : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-primary">
                        {entry.entryNumber}
                      </TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                      <TableCell className="text-left font-mono text-success">
                        {Number(entry.debit) > 0 ? Number(entry.debit).toLocaleString() : ""}
                      </TableCell>
                      <TableCell className="text-left font-mono text-destructive">
                        {Number(entry.credit) > 0 ? Number(entry.credit).toLocaleString() : ""}
                      </TableCell>
                      <TableCell className={cn(
                        "text-left font-mono font-bold",
                        Number(entry.runningBalance) >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {Number(entry.runningBalance || 0).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Closing Balance Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={3}>الرصيد الختامي</TableCell>
                    <TableCell className="text-left font-mono">
                      {Number(ledgerData.totalDebit || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-left font-mono">
                      {Number(ledgerData.totalCredit || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className={cn(
                      "text-left font-mono",
                      Number(ledgerData.closingBalance) >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {Number(ledgerData.closingBalance || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                لا توجد حركات لهذا الحساب في الفترة المحددة
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedAccount && (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            اختر حساباً لعرض دفتر الأستاذ
          </CardContent>
        </Card>
      )}
    </div>
  );
}
