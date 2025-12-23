// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

// Account type labels
const accountTypeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export default function TrialBalance() {
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Fetch trial balance
  const { data: trialBalance, isLoading, refetch } = trpc.accounting.trialBalance.useQuery({
    businessId: 1,
    asOfDate: asOfDate,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Group accounts by type
  const groupedAccounts = trialBalance?.accounts?.reduce((acc: any, account: any) => {
    const type = account.type || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(account);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ميزان المراجعة</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>كما في تاريخ:</Label>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleRefresh}>
                تحديث
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 ml-2" />
                تصدير
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trial Balance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="w-24">رقم الحساب</TableHead>
                <TableHead>اسم الحساب</TableHead>
                <TableHead className="text-left w-32">مدين</TableHead>
                <TableHead className="text-left w-32">دائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedAccounts).map(([type, accounts]: [string, any]) => (
                <>
                  {/* Type Header */}
                  <TableRow key={`header-${type}`} className="bg-primary/5">
                    <TableCell colSpan={4} className="font-bold text-primary">
                      {accountTypeLabels[type] || type}
                    </TableCell>
                  </TableRow>
                  
                  {/* Accounts */}
                  {accounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.code}</TableCell>
                      <TableCell>{account.nameAr}</TableCell>
                      <TableCell className="text-left font-mono">
                        {Number(account.debitBalance) > 0 ? Number(account.debitBalance).toLocaleString() : ""}
                      </TableCell>
                      <TableCell className="text-left font-mono">
                        {Number(account.creditBalance) > 0 ? Number(account.creditBalance).toLocaleString() : ""}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Type Subtotal */}
                  <TableRow key={`subtotal-${type}`} className="bg-muted/30 font-semibold">
                    <TableCell colSpan={2} className="text-left">
                      مجموع {accountTypeLabels[type] || type}
                    </TableCell>
                    <TableCell className="text-left font-mono">
                      {accounts.reduce((sum: number, a: any) => sum + Number(a.debitBalance || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-left font-mono">
                      {accounts.reduce((sum: number, a: any) => sum + Number(a.creditBalance || 0), 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </>
              ))}

              {/* Grand Total */}
              <TableRow className="bg-primary/10 font-bold text-lg">
                <TableCell colSpan={2} className="text-left">
                  الإجمالي
                </TableCell>
                <TableCell className="text-left font-mono">
                  {Number(trialBalance?.totalDebit || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-left font-mono">
                  {Number(trialBalance?.totalCredit || 0).toLocaleString()}
                </TableCell>
              </TableRow>

              {/* Balance Check */}
              <TableRow className={cn(
                "font-bold",
                trialBalance?.isBalanced ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                <TableCell colSpan={2} className="text-left">
                  {trialBalance?.isBalanced ? "✓ الميزان متوازن" : "✗ الميزان غير متوازن"}
                </TableCell>
                <TableCell colSpan={2} className="text-left font-mono">
                  الفرق: {Number(trialBalance?.difference || 0).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">إجمالي المدين</p>
            <p className="text-2xl font-bold font-mono text-success">
              {Number(trialBalance?.totalDebit || 0).toLocaleString()} ر.س
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
            <p className="text-2xl font-bold font-mono text-destructive">
              {Number(trialBalance?.totalCredit || 0).toLocaleString()} ر.س
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">عدد الحسابات</p>
            <p className="text-2xl font-bold">
              {trialBalance?.accounts?.length || 0} حساب
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
