/**
 * صفحة نظام الوسيط - Intermediary System Page
 * إدارة الحسابات الوسيطة بين الأنظمة الفرعية
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeftRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Link2,
  Unlink,
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

interface IntermediarySystemPageProps {
  businessId: number;
}

export function IntermediarySystemPage({ businessId }: IntermediarySystemPageProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("accounts");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // جلب الحسابات الوسيطة
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["intermediaryAccounts", businessId],
    queryFn: () => trpc.intermediarySystem.accounts.list.query({ businessId }),
  });

  // جلب الأنظمة الفرعية
  const { data: subSystems } = useQuery({
    queryKey: ["subSystems", businessId],
    queryFn: () => trpc.customSystem.subSystems.list.query({ businessId }),
  });

  // جلب الإحصائيات
  const { data: stats } = useQuery({
    queryKey: ["intermediaryStats", businessId],
    queryFn: () => trpc.intermediarySystem.accounts.stats.query({ businessId }),
  });

  // جلب الحركات غير المسواة
  const { data: unreconciledMovements } = useQuery({
    queryKey: ["unreconciledMovements", businessId],
    queryFn: () => trpc.intermediarySystem.movements.unreconciled.query({ businessId }),
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: (data: any) => trpc.intermediarySystem.accounts.create.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediaryAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["intermediaryStats"] });
      setIsAddDialogOpen(false);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (id: number) => trpc.intermediarySystem.accounts.delete.mutate({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intermediaryAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["intermediaryStats"] });
    },
  });

  const autoReconcileMutation = useMutation({
    mutationFn: () => trpc.intermediarySystem.reconciliations.autoReconcile.mutate({ businessId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unreconciledMovements"] });
      queryClient.invalidateQueries({ queryKey: ["intermediaryAccounts"] });
      alert(`تم تسوية ${data.reconciledCount} حركة تلقائياً`);
    },
  });

  // فلترة الحسابات
  const filteredAccounts = accounts?.filter((account: any) =>
    account.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // نموذج إضافة حساب
  const [newAccount, setNewAccount] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    description: "",
    currency: "SAR",
    accountType: "transfer" as const,
    mustBeZero: true,
    alertOnBalance: true,
    alertThreshold: "0",
    linkedSubSystems: [] as { subSystemId: number; canDebit: boolean; canCredit: boolean }[],
  });

  const handleAddAccount = () => {
    if (!newAccount.code || !newAccount.nameAr || newAccount.linkedSubSystems.length < 2) {
      alert("يرجى ملء جميع الحقول المطلوبة وربط نظامين فرعيين على الأقل");
      return;
    }
    createAccountMutation.mutate({
      businessId,
      ...newAccount,
    });
  };

  const toggleSubSystem = (subSystemId: number) => {
    const exists = newAccount.linkedSubSystems.find(s => s.subSystemId === subSystemId);
    if (exists) {
      setNewAccount({
        ...newAccount,
        linkedSubSystems: newAccount.linkedSubSystems.filter(s => s.subSystemId !== subSystemId),
      });
    } else {
      setNewAccount({
        ...newAccount,
        linkedSubSystems: [
          ...newAccount.linkedSubSystems,
          { subSystemId, canDebit: true, canCredit: true },
        ],
      });
    }
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      transfer: "تحويلات",
      settlement: "تسويات",
      clearing: "مقاصة",
      suspense: "معلقات",
      other: "أخرى",
    };
    return types[type] || type;
  };

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      transfer: "bg-blue-500",
      settlement: "bg-green-500",
      clearing: "bg-purple-500",
      suspense: "bg-yellow-500",
      other: "bg-gray-500",
    };
    return colors[type] || "bg-gray-500";
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <ArrowLeftRight className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">نظام الوسيط</h1>
            <p className="text-gray-400">إدارة الحسابات الوسيطة بين الأنظمة الفرعية</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => autoReconcileMutation.mutate()}
            disabled={autoReconcileMutation.isPending}
          >
            <Zap className="h-4 w-4 ml-2" />
            تسوية تلقائية
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب وسيط
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
                  إضافة حساب وسيط جديد
                </DialogTitle>
                <DialogDescription>
                  أنشئ حساب وسيط لربط الأنظمة الفرعية وتتبع التحويلات بينها
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* المعلومات الأساسية */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>كود الحساب *</Label>
                      <Input
                        placeholder="مثال: INT-001"
                        value={newAccount.code}
                        onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الحساب</Label>
                      <Select
                        value={newAccount.accountType}
                        onValueChange={(value: any) => setNewAccount({ ...newAccount, accountType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transfer">تحويلات بين الأنظمة</SelectItem>
                          <SelectItem value="settlement">تسويات</SelectItem>
                          <SelectItem value="clearing">مقاصة</SelectItem>
                          <SelectItem value="suspense">معلقات</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اسم الحساب بالعربية *</Label>
                      <Input
                        placeholder="مثال: حساب وسيط التحويلات"
                        value={newAccount.nameAr}
                        onChange={(e) => setNewAccount({ ...newAccount, nameAr: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>اسم الحساب بالإنجليزية</Label>
                      <Input
                        placeholder="Example: Transfer Intermediary"
                        value={newAccount.nameEn}
                        onChange={(e) => setNewAccount({ ...newAccount, nameEn: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>الوصف</Label>
                    <Textarea
                      placeholder="وصف الحساب الوسيط والغرض منه..."
                      value={newAccount.description}
                      onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* الأنظمة الفرعية المرتبطة */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-400 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    الأنظمة الفرعية المرتبطة (اختر نظامين على الأقل)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {subSystems?.map((sys: any) => {
                      const isSelected = newAccount.linkedSubSystems.some(s => s.subSystemId === sys.id);
                      return (
                        <div
                          key={sys.id}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10"
                              : "border-gray-700 hover:border-gray-600"
                          }`}
                          onClick={() => toggleSubSystem(sys.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox checked={isSelected} />
                            <div>
                              <p className="font-medium">{sys.nameAr}</p>
                              <p className="text-xs text-gray-500">{sys.code}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {newAccount.linkedSubSystems.length < 2 && (
                    <p className="text-sm text-yellow-500 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      يجب اختيار نظامين فرعيين على الأقل
                    </p>
                  )}
                </div>

                {/* الإعدادات */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-400 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div>
                        <p className="font-medium">يجب أن يتصفر الرصيد</p>
                        <p className="text-xs text-gray-500">تنبيه عند وجود رصيد غير صفري</p>
                      </div>
                      <Switch
                        checked={newAccount.mustBeZero}
                        onCheckedChange={(checked) => setNewAccount({ ...newAccount, mustBeZero: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div>
                        <p className="font-medium">تنبيه عند وجود رصيد</p>
                        <p className="text-xs text-gray-500">إرسال تنبيه عند تجاوز الحد</p>
                      </div>
                      <Switch
                        checked={newAccount.alertOnBalance}
                        onCheckedChange={(checked) => setNewAccount({ ...newAccount, alertOnBalance: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddAccount}
                  disabled={createAccountMutation.isPending}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  {createAccountMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">إجمالي الحسابات</p>
                <p className="text-2xl font-bold text-white">{stats?.totalAccounts || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">الحسابات النشطة</p>
                <p className="text-2xl font-bold text-white">{stats?.activeAccounts || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">حسابات برصيد معلق</p>
                <p className="text-2xl font-bold text-white">{stats?.nonZeroBalanceAccounts || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/30 border-red-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-300">إجمالي المعلقات</p>
                <p className="text-2xl font-bold text-white">
                  {parseFloat(stats?.totalPendingBalance || "0").toLocaleString()} ر.س
                </p>
              </div>
              <Clock className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="accounts">الحسابات الوسيطة</TabsTrigger>
          <TabsTrigger value="movements">الحركات</TabsTrigger>
          <TabsTrigger value="reconciliation">التسويات</TabsTrigger>
        </TabsList>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث في الحسابات..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Accounts List */}
          <div className="grid gap-4">
            {accountsLoading ? (
              <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
            ) : filteredAccounts?.length === 0 ? (
              <Card className="bg-gray-800/30 border-gray-700">
                <CardContent className="py-12 text-center">
                  <ArrowLeftRight className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">لا توجد حسابات وسيطة</p>
                  <p className="text-sm text-gray-500 mt-1">ابدأ بإنشاء حساب وسيط جديد</p>
                </CardContent>
              </Card>
            ) : (
              filteredAccounts?.map((account: any) => (
                <Card key={account.id} className="bg-gray-800/30 border-gray-700 hover:border-gray-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getAccountTypeColor(account.accountType)}`}>
                          <ArrowLeftRight className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{account.nameAr}</h3>
                            <Badge variant="outline" className="text-xs">
                              {account.code}
                            </Badge>
                            <Badge className={`text-xs ${getAccountTypeColor(account.accountType)}`}>
                              {getAccountTypeLabel(account.accountType)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{account.description || "بدون وصف"}</p>
                          
                          {/* الأنظمة المرتبطة */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {account.linkedSubSystems?.map((sys: any) => (
                              <Badge key={sys.subSystemId} variant="secondary" className="text-xs">
                                <Building2 className="h-3 w-3 ml-1" />
                                {sys.subSystemName || sys.subSystemCode}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* الرصيد */}
                        <div className="text-left">
                          <p className="text-sm text-gray-400">الرصيد</p>
                          <p className={`text-xl font-bold ${
                            parseFloat(account.balance) === 0
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}>
                            {parseFloat(account.balance || 0).toLocaleString()} {account.currency}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الحساب الوسيط</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف "{account.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteAccountMutation.mutate(account.id)}
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-4">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                حركات الحسابات الوسيطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحساب الوسيط</TableHead>
                    <TableHead>النظام الفرعي</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>المرجع</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      لا توجد حركات بعد
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reconciliation Tab */}
        <TabsContent value="reconciliation" className="space-y-4">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  الحركات غير المسواة
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => autoReconcileMutation.mutate()}
                  disabled={autoReconcileMutation.isPending}
                >
                  <Zap className="h-4 w-4 ml-2" />
                  تسوية تلقائية
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {unreconciledMovements?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-gray-400">جميع الحركات مسواة</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unreconciledMovements?.map((group: any) => (
                    <Card key={group.accountId} className="bg-gray-900/50 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{group.accountName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">مدين (إضافة)</p>
                            {group.debits.map((m: any) => (
                              <div key={m.id} className="p-2 rounded bg-green-900/20 border border-green-700/50 mb-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">{m.subSystemName}</span>
                                  <span className="text-green-400">+{parseFloat(m.amount).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">دائن (خصم)</p>
                            {group.credits.map((m: any) => (
                              <div key={m.id} className="p-2 rounded bg-red-900/20 border border-red-700/50 mb-2">
                                <div className="flex justify-between">
                                  <span className="text-sm">{m.subSystemName}</span>
                                  <span className="text-red-400">-{parseFloat(m.amount).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default IntermediarySystemPage;
