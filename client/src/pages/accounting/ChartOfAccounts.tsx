import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  Building2,
  Wrench,
  Package,
  ShoppingCart,
  Users,
  Receipt,
  Activity,
  FolderKanban,
  UserCog,
  Zap,
  Wallet,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

// تعريف الأنظمة الرئيسية
const systemModules = [
  { id: "assets", nameAr: "إدارة الأصول", icon: Building2, color: "bg-blue-500" },
  { id: "maintenance", nameAr: "الصيانة", icon: Wrench, color: "bg-orange-500" },
  { id: "inventory", nameAr: "المخزون", icon: Package, color: "bg-green-500" },
  { id: "procurement", nameAr: "المشتريات", icon: ShoppingCart, color: "bg-purple-500" },
  { id: "customers", nameAr: "العملاء", icon: Users, color: "bg-cyan-500" },
  { id: "billing", nameAr: "الفوترة", icon: Receipt, color: "bg-yellow-500" },
  { id: "scada", nameAr: "المراقبة والتحكم", icon: Activity, color: "bg-red-500" },
  { id: "projects", nameAr: "المشاريع", icon: FolderKanban, color: "bg-indigo-500" },
  { id: "hr", nameAr: "الموارد البشرية", icon: UserCog, color: "bg-pink-500" },
  { id: "operations", nameAr: "العمليات", icon: Zap, color: "bg-amber-500" },
  { id: "finance", nameAr: "المالية العامة", icon: Wallet, color: "bg-emerald-500" },
  { id: "general", nameAr: "عام", icon: MoreHorizontal, color: "bg-gray-500" },
];

// بيانات تجريبية للحسابات بالهيكل الجديد
const mockAccounts = [
  // إدارة الأصول
  {
    id: 1,
    code: "01",
    nameAr: "إدارة الأصول",
    systemModule: "assets",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 15000000,
    children: [
      {
        id: 2,
        code: "0101",
        nameAr: "الأصول الثابتة",
        systemModule: "assets",
        accountType: "sub",
        nature: "debit",
        isParent: true,
        level: 2,
        parentId: 1,
        currentBalance: 12000000,
        children: [
          { id: 3, code: "010101", nameAr: "المحولات الكهربائية", systemModule: "assets", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 2, currentBalance: 5000000, children: [] },
          { id: 4, code: "010102", nameAr: "خطوط النقل", systemModule: "assets", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 2, currentBalance: 4000000, children: [] },
          { id: 5, code: "010103", nameAr: "المعدات الثقيلة", systemModule: "assets", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 2, currentBalance: 3000000, children: [] },
        ],
      },
      {
        id: 6,
        code: "0102",
        nameAr: "الإهلاك المتراكم",
        systemModule: "assets",
        accountType: "sub",
        nature: "credit",
        isParent: true,
        level: 2,
        parentId: 1,
        currentBalance: 3000000,
        children: [
          { id: 7, code: "010201", nameAr: "إهلاك المحولات", systemModule: "assets", accountType: "detail", nature: "credit", isParent: false, level: 3, parentId: 6, currentBalance: 1500000, children: [] },
          { id: 8, code: "010202", nameAr: "إهلاك خطوط النقل", systemModule: "assets", accountType: "detail", nature: "credit", isParent: false, level: 3, parentId: 6, currentBalance: 1000000, children: [] },
          { id: 9, code: "010203", nameAr: "إهلاك المعدات", systemModule: "assets", accountType: "detail", nature: "credit", isParent: false, level: 3, parentId: 6, currentBalance: 500000, children: [] },
        ],
      },
    ],
  },
  // الصيانة
  {
    id: 10,
    code: "02",
    nameAr: "الصيانة",
    systemModule: "maintenance",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 2500000,
    children: [
      {
        id: 11,
        code: "0201",
        nameAr: "أوامر العمل",
        systemModule: "maintenance",
        accountType: "sub",
        nature: "debit",
        isParent: true,
        level: 2,
        parentId: 10,
        currentBalance: 1500000,
        children: [
          { id: 12, code: "020101", nameAr: "صيانة وقائية", systemModule: "maintenance", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 11, currentBalance: 800000, children: [] },
          { id: 13, code: "020102", nameAr: "صيانة تصحيحية", systemModule: "maintenance", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 11, currentBalance: 500000, children: [] },
          { id: 14, code: "020103", nameAr: "صيانة طارئة", systemModule: "maintenance", accountType: "detail", nature: "debit", isParent: false, level: 3, parentId: 11, currentBalance: 200000, children: [] },
        ],
      },
      {
        id: 15,
        code: "0202",
        nameAr: "قطع الغيار",
        systemModule: "maintenance",
        accountType: "sub",
        nature: "debit",
        isParent: false,
        level: 2,
        parentId: 10,
        currentBalance: 1000000,
        children: [],
      },
    ],
  },
  // المخزون
  {
    id: 16,
    code: "03",
    nameAr: "المخزون",
    systemModule: "inventory",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 5000000,
    children: [
      { id: 17, code: "0301", nameAr: "المستودع الرئيسي", systemModule: "inventory", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 16, currentBalance: 3000000, children: [] },
      { id: 18, code: "0302", nameAr: "مستودع قطع الغيار", systemModule: "inventory", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 16, currentBalance: 1500000, children: [] },
      { id: 19, code: "0303", nameAr: "مستودع المواد الاستهلاكية", systemModule: "inventory", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 16, currentBalance: 500000, children: [] },
    ],
  },
  // المشتريات
  {
    id: 20,
    code: "04",
    nameAr: "المشتريات",
    systemModule: "procurement",
    accountType: "main",
    nature: "credit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 3500000,
    children: [
      { id: 21, code: "0401", nameAr: "الموردين المحليين", systemModule: "procurement", accountType: "sub", nature: "credit", isParent: false, level: 2, parentId: 20, currentBalance: 2000000, children: [] },
      { id: 22, code: "0402", nameAr: "الموردين الدوليين", systemModule: "procurement", accountType: "sub", nature: "credit", isParent: false, level: 2, parentId: 20, currentBalance: 1500000, children: [] },
    ],
  },
  // العملاء
  {
    id: 23,
    code: "05",
    nameAr: "العملاء",
    systemModule: "customers",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 8000000,
    children: [
      { id: 24, code: "0501", nameAr: "العملاء السكنيين", systemModule: "customers", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 23, currentBalance: 3000000, children: [] },
      { id: 25, code: "0502", nameAr: "العملاء التجاريين", systemModule: "customers", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 23, currentBalance: 3500000, children: [] },
      { id: 26, code: "0503", nameAr: "العملاء الحكوميين", systemModule: "customers", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 23, currentBalance: 1500000, children: [] },
    ],
  },
  // الفوترة
  {
    id: 27,
    code: "06",
    nameAr: "الفوترة",
    systemModule: "billing",
    accountType: "main",
    nature: "credit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 12000000,
    children: [
      { id: 28, code: "0601", nameAr: "إيرادات الكهرباء", systemModule: "billing", accountType: "sub", nature: "credit", isParent: false, level: 2, parentId: 27, currentBalance: 10000000, children: [] },
      { id: 29, code: "0602", nameAr: "رسوم الخدمات", systemModule: "billing", accountType: "sub", nature: "credit", isParent: false, level: 2, parentId: 27, currentBalance: 1500000, children: [] },
      { id: 30, code: "0603", nameAr: "غرامات التأخير", systemModule: "billing", accountType: "sub", nature: "credit", isParent: false, level: 2, parentId: 27, currentBalance: 500000, children: [] },
    ],
  },
  // المشاريع
  {
    id: 31,
    code: "08",
    nameAr: "المشاريع",
    systemModule: "projects",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 25000000,
    children: [
      { id: 32, code: "0801", nameAr: "مشروع توسعة المحطة أ", systemModule: "projects", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 31, currentBalance: 15000000, children: [] },
      { id: 33, code: "0802", nameAr: "مشروع صيانة الشبكة", systemModule: "projects", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 31, currentBalance: 8000000, children: [] },
      { id: 34, code: "0803", nameAr: "مشروع الطاقة الشمسية", systemModule: "projects", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 31, currentBalance: 2000000, children: [] },
    ],
  },
  // الموارد البشرية
  {
    id: 35,
    code: "09",
    nameAr: "الموارد البشرية",
    systemModule: "hr",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 4500000,
    children: [
      { id: 36, code: "0901", nameAr: "الرواتب والأجور", systemModule: "hr", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 35, currentBalance: 3500000, children: [] },
      { id: 37, code: "0902", nameAr: "البدلات", systemModule: "hr", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 35, currentBalance: 700000, children: [] },
      { id: 38, code: "0903", nameAr: "التأمينات الاجتماعية", systemModule: "hr", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 35, currentBalance: 300000, children: [] },
    ],
  },
  // المالية العامة
  {
    id: 39,
    code: "10",
    nameAr: "المالية العامة",
    systemModule: "finance",
    accountType: "main",
    nature: "debit",
    isParent: true,
    level: 1,
    parentId: null,
    currentBalance: 6000000,
    children: [
      { id: 40, code: "1001", nameAr: "البنوك", systemModule: "finance", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 39, currentBalance: 4000000, children: [] },
      { id: 41, code: "1002", nameAr: "الصندوق", systemModule: "finance", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 39, currentBalance: 500000, children: [] },
      { id: 42, code: "1003", nameAr: "الاستثمارات", systemModule: "finance", accountType: "sub", nature: "debit", isParent: false, level: 2, parentId: 39, currentBalance: 1500000, children: [] },
    ],
  },
];

interface Account {
  id: number;
  code: string;
  nameAr: string;
  systemModule: string;
  accountType: string;
  nature: string;
  isParent: boolean;
  level: number;
  parentId: number | null;
  currentBalance: number;
  children: Account[];
}

// مكون عرض الحساب في الشجرة
function AccountTreeItem({ account, level = 0 }: { account: Account; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const systemModule = systemModules.find((s) => s.id === account.systemModule);
  const Icon = systemModule?.icon || FolderTree;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors ${
          level === 0 ? "bg-muted/30" : ""
        }`}
        style={{ paddingRight: `${level * 24 + 12}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {hasChildren ? (
          <button className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        <div className={`p-1.5 rounded ${systemModule?.color || "bg-gray-500"}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>

        <span className="font-mono text-sm text-muted-foreground">{account.code}</span>
        <span className="flex-1 font-medium">{account.nameAr}</span>

        <Badge variant={account.accountType === "main" ? "default" : account.accountType === "sub" ? "secondary" : "outline"}>
          {account.accountType === "main" ? "رئيسي" : account.accountType === "sub" ? "فرعي" : "تفصيلي"}
        </Badge>

        <Badge variant={account.nature === "debit" ? "default" : "secondary"} className="min-w-16 justify-center">
          {account.nature === "debit" ? "مدين" : "دائن"}
        </Badge>

        <span className={`font-mono text-sm min-w-32 text-left ${account.currentBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(account.currentBalance)}
        </span>

        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); toast.info("تعديل الحساب"); }}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {!hasChildren && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); toast.info("حذف الحساب"); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {account.children.map((child) => (
            <AccountTreeItem key={child.id} account={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartOfAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // فلترة الحسابات
  const filteredAccounts = mockAccounts.filter((account) => {
    const matchesSearch = account.nameAr.includes(searchTerm) || account.code.includes(searchTerm);
    const matchesModule = selectedModule === "all" || account.systemModule === selectedModule;
    return matchesSearch && matchesModule;
  });

  // حساب الإجماليات
  const totalDebit = mockAccounts
    .filter((a) => a.nature === "debit")
    .reduce((sum, a) => sum + a.currentBalance, 0);
  const totalCredit = mockAccounts
    .filter((a) => a.nature === "credit")
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* العنوان والإجراءات */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">شجرة الحسابات</h1>
          <p className="text-muted-foreground">الدليل المحاسبي الموحد - مُنظم حسب الأنظمة</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة حساب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>كود الحساب</Label>
                  <Input placeholder="مثال: 0101" />
                </div>
                <div className="space-y-2">
                  <Label>النظام</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النظام" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>اسم الحساب</Label>
                <Input placeholder="أدخل اسم الحساب" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الحساب</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">رئيسي</SelectItem>
                      <SelectItem value="sub">فرعي</SelectItem>
                      <SelectItem value="detail">تفصيلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>طبيعة الحساب</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطبيعة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">مدين</SelectItem>
                      <SelectItem value="credit">دائن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الحساب الأب</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب الأب (اختياري)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون (حساب رئيسي)</SelectItem>
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.code} - {account.nameAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea placeholder="وصف الحساب (اختياري)" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => { toast.success("تم إضافة الحساب بنجاح"); setIsAddDialogOpen(false); }}>
                  حفظ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي الأنظمة</p>
              <p className="text-3xl font-bold text-primary">{systemModules.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي الحسابات</p>
              <p className="text-3xl font-bold">{mockAccounts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي المدين</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalDebit)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalCredit)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* أدوات البحث والفلترة */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالكود أو الاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الأنظمة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنظمة</SelectItem>
                {systemModules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* شجرة الحسابات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            الدليل المحاسبي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg divide-y">
            {/* رأس الجدول */}
            <div className="flex items-center gap-2 py-3 px-3 bg-muted/50 font-medium text-sm">
              <span className="w-5" />
              <span className="w-8" />
              <span className="w-16">الكود</span>
              <span className="flex-1">اسم الحساب</span>
              <span className="w-20 text-center">النوع</span>
              <span className="w-16 text-center">الطبيعة</span>
              <span className="w-32 text-left">الرصيد</span>
              <span className="w-16" />
            </div>
            {/* الحسابات */}
            {filteredAccounts.map((account) => (
              <AccountTreeItem key={account.id} account={account} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
