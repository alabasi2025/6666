import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calculator, 
  Plus, 
  Search,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const accountTypes = [
  { value: "asset", label: "أصول", color: "text-blue-500" },
  { value: "liability", label: "خصوم", color: "text-red-500" },
  { value: "equity", label: "حقوق ملكية", color: "text-purple-500" },
  { value: "revenue", label: "إيرادات", color: "text-green-500" },
  { value: "expense", label: "مصروفات", color: "text-orange-500" },
];

export default function CustomAccounts() {
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    accountNumber: "",
    accountName: "",
    accountType: "asset" as "asset" | "liability" | "equity" | "revenue" | "expense",
    currency: "SAR",
    description: "",
  });

  // Business ID - يتم تعيينه افتراضياً للشركة الأولى
  const businessId = 1;

  const { data: accounts = [], refetch } = trpc.customSystem.accounts.list.useQuery({ businessId });
  const createAccount = trpc.customSystem.accounts.create.useMutation({
    onSuccess: () => {
      
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      
    },
  });

  const deleteAccount = trpc.customSystem.accounts.delete.useMutation({
    onSuccess: () => {
      
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      accountNumber: "",
      accountName: "",
      accountType: "asset",
      currency: "SAR",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount.mutate({ ...formData, businessId } as any);
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.accountName.includes(searchTerm) ||
      acc.accountNumber.includes(searchTerm)
  );

  const totalAssets = accounts
    .filter((a) => a.accountType === "asset")
    .reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);

  const totalLiabilities = accounts
    .filter((a) => a.accountType === "liability")
    .reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-7 w-7 text-primary" />
            الحسابات
          </h1>
          <p className="text-muted-foreground">إدارة الحسابات المالية</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة حساب جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">رقم الحساب *</Label>
                  <Input
                    id="accountNumber"
                    value={(formData as any).accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="1001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">نوع الحساب *</Label>
                  <Select
                    value={(formData as any).accountType}
                    onValueChange={(value: any) => setFormData({ ...formData, accountType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">اسم الحساب *</Label>
                <Input
                  id="accountName"
                  value={(formData as any).accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="الصندوق"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <Select
                  value={(formData as any).currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                    <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={(formData as any).description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الحساب..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createAccount.isPending}>
                  {createAccount.isPending ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحسابات</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصول</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {totalAssets.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الخصوم</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totalLiabilities.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الرقم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Accounts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الحساب</TableHead>
                <TableHead className="text-right">اسم الحساب</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead className="text-right">العملة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد حسابات
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => {
                  const typeInfo = accountTypes.find((t) => t.value === account.accountType);
                  const balance = parseFloat(account.balance || "0");
                  return (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.accountNumber}</TableCell>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell>
                        <span className={typeInfo?.color}>{typeInfo?.label}</span>
                      </TableCell>
                      <TableCell className={balance >= 0 ? "text-green-500" : "text-red-500"}>
                        {balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{account.currency}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAccount.mutate({ id: account.id } as any)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
