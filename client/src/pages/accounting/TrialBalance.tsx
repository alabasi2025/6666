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
  Scale,
  Calendar,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
} from "lucide-react";

interface TrialBalanceAccount {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  level: number;
  debitBalance: number;
  creditBalance: number;
}

// بيانات تجريبية لميزان المراجعة
const mockTrialBalance: TrialBalanceAccount[] = [
  // الأصول
  { code: "1", name: "الأصول", type: "asset", level: 1, debitBalance: 15000000, creditBalance: 0 },
  { code: "11", name: "الأصول المتداولة", type: "asset", level: 2, debitBalance: 5000000, creditBalance: 0 },
  { code: "111", name: "النقدية", type: "asset", level: 3, debitBalance: 1500000, creditBalance: 0 },
  { code: "1111", name: "النقدية بالصندوق", type: "asset", level: 4, debitBalance: 500000, creditBalance: 0 },
  { code: "1112", name: "النقدية بالبنك", type: "asset", level: 4, debitBalance: 1000000, creditBalance: 0 },
  { code: "112", name: "المدينون", type: "asset", level: 3, debitBalance: 2500000, creditBalance: 0 },
  { code: "1121", name: "مدينون تجاريون", type: "asset", level: 4, debitBalance: 2000000, creditBalance: 0 },
  { code: "1122", name: "أوراق قبض", type: "asset", level: 4, debitBalance: 500000, creditBalance: 0 },
  { code: "113", name: "المخزون", type: "asset", level: 3, debitBalance: 1000000, creditBalance: 0 },
  { code: "12", name: "الأصول الثابتة", type: "asset", level: 2, debitBalance: 10000000, creditBalance: 0 },
  { code: "121", name: "الأراضي", type: "asset", level: 3, debitBalance: 3000000, creditBalance: 0 },
  { code: "122", name: "المباني", type: "asset", level: 3, debitBalance: 4000000, creditBalance: 0 },
  { code: "123", name: "المعدات", type: "asset", level: 3, debitBalance: 2000000, creditBalance: 0 },
  { code: "124", name: "المركبات", type: "asset", level: 3, debitBalance: 1000000, creditBalance: 0 },
  
  // الالتزامات
  { code: "2", name: "الالتزامات", type: "liability", level: 1, debitBalance: 0, creditBalance: 8000000 },
  { code: "21", name: "الالتزامات المتداولة", type: "liability", level: 2, debitBalance: 0, creditBalance: 3000000 },
  { code: "211", name: "الدائنون", type: "liability", level: 3, debitBalance: 0, creditBalance: 1500000 },
  { code: "212", name: "مصروفات مستحقة", type: "liability", level: 3, debitBalance: 0, creditBalance: 500000 },
  { code: "213", name: "قروض قصيرة الأجل", type: "liability", level: 3, debitBalance: 0, creditBalance: 1000000 },
  { code: "22", name: "الالتزامات طويلة الأجل", type: "liability", level: 2, debitBalance: 0, creditBalance: 5000000 },
  { code: "221", name: "قروض طويلة الأجل", type: "liability", level: 3, debitBalance: 0, creditBalance: 4000000 },
  { code: "222", name: "سندات مستحقة الدفع", type: "liability", level: 3, debitBalance: 0, creditBalance: 1000000 },
  
  // حقوق الملكية
  { code: "3", name: "حقوق الملكية", type: "equity", level: 1, debitBalance: 0, creditBalance: 7000000 },
  { code: "31", name: "رأس المال", type: "equity", level: 2, debitBalance: 0, creditBalance: 5000000 },
  { code: "32", name: "الأرباح المحتجزة", type: "equity", level: 2, debitBalance: 0, creditBalance: 2000000 },
  
  // الإيرادات
  { code: "4", name: "الإيرادات", type: "revenue", level: 1, debitBalance: 0, creditBalance: 12000000 },
  { code: "41", name: "مبيعات الكهرباء", type: "revenue", level: 2, debitBalance: 0, creditBalance: 10000000 },
  { code: "42", name: "رسوم التوصيل", type: "revenue", level: 2, debitBalance: 0, creditBalance: 1500000 },
  { code: "43", name: "إيرادات أخرى", type: "revenue", level: 2, debitBalance: 0, creditBalance: 500000 },
  
  // المصروفات
  { code: "5", name: "المصروفات", type: "expense", level: 1, debitBalance: 12000000, creditBalance: 0 },
  { code: "51", name: "مصروفات تشغيلية", type: "expense", level: 2, debitBalance: 6000000, creditBalance: 0 },
  { code: "511", name: "مصروفات الوقود", type: "expense", level: 3, debitBalance: 3000000, creditBalance: 0 },
  { code: "512", name: "مصروفات الصيانة", type: "expense", level: 3, debitBalance: 2000000, creditBalance: 0 },
  { code: "513", name: "المرافق", type: "expense", level: 3, debitBalance: 1000000, creditBalance: 0 },
  { code: "52", name: "مصروفات إدارية", type: "expense", level: 2, debitBalance: 5000000, creditBalance: 0 },
  { code: "521", name: "الرواتب", type: "expense", level: 3, debitBalance: 4000000, creditBalance: 0 },
  { code: "522", name: "مستلزمات مكتبية", type: "expense", level: 3, debitBalance: 1000000, creditBalance: 0 },
  { code: "53", name: "الإهلاك", type: "expense", level: 2, debitBalance: 1000000, creditBalance: 0 },
];

const typeConfig = {
  asset: { label: "أصول", color: "bg-blue-500/20 text-blue-400", icon: <Wallet className="h-4 w-4" /> },
  liability: { label: "التزامات", color: "bg-red-500/20 text-red-400", icon: <TrendingDown className="h-4 w-4" /> },
  equity: { label: "حقوق ملكية", color: "bg-purple-500/20 text-purple-400", icon: <Building2 className="h-4 w-4" /> },
  revenue: { label: "إيرادات", color: "bg-green-500/20 text-green-400", icon: <TrendingUp className="h-4 w-4" /> },
  expense: { label: "مصروفات", color: "bg-orange-500/20 text-orange-400", icon: <TrendingDown className="h-4 w-4" /> },
};

export default function TrialBalance() {
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  // فلترة الحسابات
  const filteredAccounts = mockTrialBalance.filter(acc => {
    const matchesLevel = selectedLevel === "all" || acc.level === parseInt(selectedLevel);
    const matchesType = selectedType === "all" || acc.type === selectedType;
    return matchesLevel && matchesType;
  });

  // حساب الإجماليات
  const totalDebit = filteredAccounts.reduce((sum, acc) => sum + acc.debitBalance, 0);
  const totalCredit = filteredAccounts.reduce((sum, acc) => sum + acc.creditBalance, 0);
  const isBalanced = totalDebit === totalCredit;

  // حساب إجماليات حسب النوع
  const summaryByType = {
    assets: mockTrialBalance.filter(a => a.type === "asset" && a.level === 1).reduce((s, a) => s + a.debitBalance, 0),
    liabilities: mockTrialBalance.filter(a => a.type === "liability" && a.level === 1).reduce((s, a) => s + a.creditBalance, 0),
    equity: mockTrialBalance.filter(a => a.type === "equity" && a.level === 1).reduce((s, a) => s + a.creditBalance, 0),
    revenue: mockTrialBalance.filter(a => a.type === "revenue" && a.level === 1).reduce((s, a) => s + a.creditBalance, 0),
    expenses: mockTrialBalance.filter(a => a.type === "expense" && a.level === 1).reduce((s, a) => s + a.debitBalance, 0),
  };

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Scale className="h-7 w-7 text-primary" />
            ميزان المراجعة
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض أرصدة جميع الحسابات
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 ml-2" />
            طباعة
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* حالة التوازن */}
      <Card className={`border-2 ${isBalanced ? "border-green-500/50 bg-green-500/5" : "border-red-500/50 bg-red-500/5"}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isBalanced ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <h3 className={`font-bold text-lg ${isBalanced ? "text-green-500" : "text-red-500"}`}>
                  {isBalanced ? "ميزان المراجعة متوازن" : "ميزان المراجعة غير متوازن!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isBalanced 
                    ? "إجمالي المدين يساوي إجمالي الدائن" 
                    : `الفرق: ${Math.abs(totalDebit - totalCredit).toLocaleString()} ر.س`}
                </p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">إجمالي المدين</p>
                <p className="text-2xl font-bold font-mono text-green-500">
                  {totalDebit.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
                <p className="text-2xl font-bold font-mono text-red-500">
                  {totalCredit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص حسب النوع */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Wallet className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الأصول</p>
                <p className="text-lg font-bold font-mono">
                  {(summaryByType.assets / 1000000).toFixed(1)}M
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
                <p className="text-sm text-muted-foreground">الالتزامات</p>
                <p className="text-lg font-bold font-mono">
                  {(summaryByType.liabilities / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Building2 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">حقوق الملكية</p>
                <p className="text-lg font-bold font-mono">
                  {(summaryByType.equity / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الإيرادات</p>
                <p className="text-lg font-bold font-mono">
                  {(summaryByType.revenue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingDown className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المصروفات</p>
                <p className="text-lg font-bold font-mono">
                  {(summaryByType.expenses / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="مستوى العرض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="1">المستوى الأول</SelectItem>
                <SelectItem value="2">المستوى الثاني</SelectItem>
                <SelectItem value="3">المستوى الثالث</SelectItem>
                <SelectItem value="4">المستوى الرابع</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الحساب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="asset">الأصول</SelectItem>
                <SelectItem value="liability">الالتزامات</SelectItem>
                <SelectItem value="equity">حقوق الملكية</SelectItem>
                <SelectItem value="revenue">الإيرادات</SelectItem>
                <SelectItem value="expense">المصروفات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول ميزان المراجعة */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>ميزان المراجعة كما في {asOfDate}</span>
            <Badge variant="outline">{filteredAccounts.length} حساب</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right w-[100px]">رمز الحساب</TableHead>
                <TableHead className="text-right">اسم الحساب</TableHead>
                <TableHead className="text-right w-[100px]">النوع</TableHead>
                <TableHead className="text-right w-[150px]">رصيد مدين</TableHead>
                <TableHead className="text-right w-[150px]">رصيد دائن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow 
                  key={account.code} 
                  className={`hover:bg-muted/50 ${account.level === 1 ? "bg-muted/30 font-bold" : ""}`}
                >
                  <TableCell 
                    className="font-mono"
                    style={{ paddingRight: `${(account.level - 1) * 16 + 16}px` }}
                  >
                    {account.code}
                  </TableCell>
                  <TableCell className={account.level === 1 ? "font-bold" : ""}>
                    {account.name}
                  </TableCell>
                  <TableCell>
                    <Badge className={typeConfig[account.type].color}>
                      {typeConfig[account.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-green-500">
                    {account.debitBalance > 0 ? account.debitBalance.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="font-mono text-red-500">
                    {account.creditBalance > 0 ? account.creditBalance.toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* صف الإجماليات */}
              <TableRow className="bg-primary/10 font-bold text-lg">
                <TableCell colSpan={3} className="text-left">
                  الإجمالي
                </TableCell>
                <TableCell className="font-mono text-green-500">
                  {totalDebit.toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-red-500">
                  {totalCredit.toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
