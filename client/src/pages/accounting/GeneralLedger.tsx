import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Search,
  BookOpen,
  Calendar,
  Download,
  Printer,
  Filter,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface LedgerEntry {
  id: number;
  date: string;
  entryNumber: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AccountLedger {
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number;
  entries: LedgerEntry[];
  closingBalance: number;
}

// بيانات تجريبية
const mockLedgers: AccountLedger[] = [
  {
    accountCode: "1112",
    accountName: "النقدية بالبنك",
    accountType: "أصول",
    openingBalance: 1000000,
    closingBalance: 800000,
    entries: [
      { id: 1, date: "2024-01-15", entryNumber: "JE-2024-0001", description: "رصيد افتتاحي", reference: "REF-001", debit: 1000000, credit: 0, balance: 1000000 },
      { id: 2, date: "2024-01-20", entryNumber: "JE-2024-0002", description: "تحصيل فواتير", reference: "INV-2024-001", debit: 250000, credit: 0, balance: 1250000 },
      { id: 3, date: "2024-01-28", entryNumber: "JE-2024-0004", description: "صرف رواتب يناير", reference: "PAY-2024-01", debit: 0, credit: 450000, balance: 800000 },
    ]
  },
  {
    accountCode: "1121",
    accountName: "مدينون تجاريون",
    accountType: "أصول",
    openingBalance: 2000000,
    closingBalance: 2600000,
    entries: [
      { id: 1, date: "2024-01-15", entryNumber: "JE-2024-0001", description: "رصيد افتتاحي", reference: "REF-001", debit: 2000000, credit: 0, balance: 2000000 },
      { id: 2, date: "2024-01-20", entryNumber: "JE-2024-0002", description: "تحصيل فواتير", reference: "INV-2024-001", debit: 0, credit: 250000, balance: 1750000 },
      { id: 3, date: "2024-02-01", entryNumber: "JE-2024-0005", description: "فواتير فبراير", reference: "REV-2024-02", debit: 850000, credit: 0, balance: 2600000 },
    ]
  },
  {
    accountCode: "211",
    accountName: "الدائنون",
    accountType: "التزامات",
    openingBalance: 1500000,
    closingBalance: 1575000,
    entries: [
      { id: 1, date: "2024-01-15", entryNumber: "JE-2024-0001", description: "رصيد افتتاحي", reference: "REF-001", debit: 0, credit: 1500000, balance: 1500000 },
      { id: 2, date: "2024-01-25", entryNumber: "JE-2024-0003", description: "شراء قطع غيار", reference: "PO-2024-015", debit: 0, credit: 75000, balance: 1575000 },
    ]
  },
  {
    accountCode: "521",
    accountName: "الرواتب",
    accountType: "مصروفات",
    openingBalance: 0,
    closingBalance: 450000,
    entries: [
      { id: 1, date: "2024-01-28", entryNumber: "JE-2024-0004", description: "رواتب يناير", reference: "PAY-2024-01", debit: 450000, credit: 0, balance: 450000 },
    ]
  },
  {
    accountCode: "41",
    accountName: "مبيعات الكهرباء",
    accountType: "إيرادات",
    openingBalance: 0,
    closingBalance: 850000,
    entries: [
      { id: 1, date: "2024-02-01", entryNumber: "JE-2024-0005", description: "إيرادات فبراير", reference: "REV-2024-02", debit: 0, credit: 850000, balance: 850000 },
    ]
  },
];

const accountsList = [
  { code: "1111", name: "النقدية بالصندوق" },
  { code: "1112", name: "النقدية بالبنك" },
  { code: "1121", name: "مدينون تجاريون" },
  { code: "113", name: "المخزون" },
  { code: "121", name: "الأراضي" },
  { code: "122", name: "المباني" },
  { code: "211", name: "الدائنون" },
  { code: "221", name: "قروض طويلة الأجل" },
  { code: "31", name: "رأس المال" },
  { code: "41", name: "مبيعات الكهرباء" },
  { code: "521", name: "الرواتب" },
  { code: "512", name: "مصروفات الصيانة" },
];

export default function GeneralLedger() {
  const [selectedAccount, setSelectedAccount] = useState<string>("1112");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-12-31");
  const [searchTerm, setSearchTerm] = useState("");

  // الحصول على دفتر الأستاذ للحساب المحدد
  const currentLedger = mockLedgers.find(l => l.accountCode === selectedAccount);

  // فلترة الحركات
  const filteredEntries = currentLedger?.entries.filter(entry => {
    const matchesSearch = searchTerm === "" ||
      entry.description.includes(searchTerm) ||
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const entryDate = new Date(entry.date);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const matchesDate = entryDate >= fromDate && entryDate <= toDate;
    
    return matchesSearch && matchesDate;
  }) || [];

  // حساب الإجماليات
  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-primary" />
            دفتر الأستاذ العام
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض حركات الحسابات التفصيلية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* فلاتر البحث */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب" />
                </SelectTrigger>
                <SelectContent>
                  {accountsList.map(acc => (
                    <SelectItem key={acc.code} value={acc.code}>
                      <span className="font-mono ml-2">{acc.code}</span>
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات الحساب */}
      {currentLedger && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="font-mono text-primary">{currentLedger.accountCode}</span>
                  {currentLedger.accountName}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  نوع الحساب: {currentLedger.accountType}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">الرصيد الافتتاحي</p>
                  <p className="text-lg font-bold font-mono">
                    {currentLedger.openingBalance.toLocaleString()} ر.س
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">الرصيد الختامي</p>
                  <p className={`text-lg font-bold font-mono ${
                    currentLedger.closingBalance >= currentLedger.openingBalance 
                      ? "text-green-500" 
                      : "text-red-500"
                  }`}>
                    {currentLedger.closingBalance.toLocaleString()} ر.س
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right w-[100px]">التاريخ</TableHead>
                  <TableHead className="text-right w-[130px]">رقم القيد</TableHead>
                  <TableHead className="text-right">البيان</TableHead>
                  <TableHead className="text-right w-[120px]">المرجع</TableHead>
                  <TableHead className="text-right w-[120px]">مدين</TableHead>
                  <TableHead className="text-right w-[120px]">دائن</TableHead>
                  <TableHead className="text-right w-[130px]">الرصيد</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* صف الرصيد الافتتاحي */}
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="font-medium">
                    الرصيد الافتتاحي
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-mono font-bold">
                    {currentLedger.openingBalance.toLocaleString()}
                  </TableCell>
                </TableRow>
                
                {/* حركات الحساب */}
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50">
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.entryNumber}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="font-mono text-sm">{entry.reference}</TableCell>
                    <TableCell className="font-mono text-green-500">
                      {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-red-500">
                      {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      {entry.balance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* صف الإجماليات */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={4} className="text-left">
                    إجمالي الحركات
                  </TableCell>
                  <TableCell className="font-mono text-green-500">
                    {totalDebit.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-mono text-red-500">
                    {totalCredit.toLocaleString()}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                
                {/* صف الرصيد الختامي */}
                <TableRow className="bg-primary/10 font-bold">
                  <TableCell colSpan={4} className="text-left">
                    الرصيد الختامي
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-mono text-lg">
                    {currentLedger.closingBalance.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ملخص الحركات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المدين</p>
                <p className="text-xl font-bold font-mono text-green-500">
                  {totalDebit.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
                <p className="text-xl font-bold font-mono text-red-500">
                  {totalCredit.toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الحركات</p>
                <p className="text-xl font-bold">{filteredEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
