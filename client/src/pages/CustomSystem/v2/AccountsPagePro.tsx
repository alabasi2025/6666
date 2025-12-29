/**
 * النظام المخصص v3.0.0 - صفحة إدارة الحسابات الاحترافية
 * تصميم احترافي متكامل باستخدام Shadcn/ui
 */

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Calculator, 
  Plus, 
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Building2,
  Hash,
  FileText,
  Layers,
  Settings2,
  Coins,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Wallet,
  Building,
  CreditCard,
  PiggyBank,
  Users,
  Package,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Copy,
  Loader2,
  Save,
  X,
  Check,
  Star,
  Lock,
  Unlock
} from "lucide-react";
import { useAuth } from "../../../_core/hooks/useAuth";
import axios from "axios";
import { cn } from "@/lib/utils";

// ==================== الأنواع والواجهات ====================

interface Account {
  id: number;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string | null;
  accountType: string;
  accountLevel?: "main" | "sub";
  parentAccountId?: number | null;
  level: number;
  displayOrder?: number;
  isActive: boolean;
  allowManualEntry: boolean;
  description?: string;
}

interface Currency {
  id: number;
  code: string;
  nameAr: string;
  nameEn?: string | null;
  symbol?: string | null;
  isBaseCurrency: boolean;
  isActive: boolean;
  decimalPlaces: number;
}

interface SubSystem {
  id: number;
  systemNameAr: string;
}

interface AccountSubType {
  id: number;
  code: string;
  nameAr: string;
  nameEn: string | null;
  accountType: string;
}

interface AccountFormData {
  subSystemId: number;
  accountCode: string;
  accountNameAr: string;
  accountNameEn: string;
  accountType: string;
  accountLevel: "main" | "sub";
  accountSubTypeId: number;
  parentAccountId: number;
  level: number;
  displayOrder: number;
  description: string;
  isActive: boolean;
  allowManualEntry: boolean;
  requiresCostCenter: boolean;
  requiresParty: boolean;
  currencies: { currencyId: number; isDefault: boolean }[];
}

// ==================== الثوابت ====================

const initialFormData: AccountFormData = {
  subSystemId: 0,
  accountCode: "",
  accountNameAr: "",
  accountNameEn: "",
  accountType: "asset",
  accountLevel: "main",
  accountSubTypeId: 0,
  parentAccountId: 0,
  level: 1,
  displayOrder: 0,
  description: "",
  isActive: true,
  allowManualEntry: true,
  requiresCostCenter: false,
  requiresParty: false,
  currencies: [],
};

const accountTypes = [
  { value: "asset", label: "أصول", color: "bg-emerald-500", icon: PiggyBank },
  { value: "liability", label: "التزامات", color: "bg-red-500", icon: CreditCard },
  { value: "equity", label: "حقوق ملكية", color: "bg-purple-500", icon: Building },
  { value: "revenue", label: "إيرادات", color: "bg-blue-500", icon: Coins },
  { value: "expense", label: "مصروفات", color: "bg-orange-500", icon: Wallet },
];

const accountSubTypeIcons: Record<string, any> = {
  cash: Wallet,
  bank: Building,
  wallet: CreditCard,
  exchange: Coins,
  warehouse: Package,
  supplier: Users,
  customer: Users,
  general: FileText,
};

// ==================== المكون الرئيسي ====================

interface AccountsPageProProps {
  subSystemId?: number;
}

export default function AccountsPagePro({ subSystemId }: AccountsPageProProps = {}) {
  const { user } = useAuth();
  
  // ==================== الحالات ====================
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [subSystems, setSubSystems] = useState<SubSystem[]>([]);
  const [accountSubTypes, setAccountSubTypes] = useState<AccountSubType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [currentTab, setCurrentTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // ==================== جلب البيانات ====================
  
  useEffect(() => {
    fetchCurrencies();
    fetchSubSystems();
    fetchAccountSubTypes();
    fetchAccounts();
  }, [subSystemId]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (subSystemId) {
        params.subSystemId = subSystemId;
      }
      const response = await axios.get("/api/custom-system/v2/accounts", { params });
      setAccounts(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في تحميل الحسابات");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/currencies", {
        params: { isActive: true },
      });
      if (response.data && Array.isArray(response.data)) {
        setCurrencies(response.data);
      }
    } catch (err: any) {
      console.error("خطأ في تحميل العملات:", err);
      setCurrencies([]);
    }
  };

  const fetchSubSystems = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/sub-systems", {
        params: { isActive: true },
      });
      setSubSystems(response.data);
    } catch (err: any) {
      console.error("فشل في تحميل الأنظمة الفرعية:", err);
    }
  };

  const fetchAccountSubTypes = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/account-sub-types", {
        params: { isActive: true },
      });
      setAccountSubTypes(response.data);
    } catch (err: any) {
      // الأنواع الافتراضية
      const defaultSubTypes: AccountSubType[] = [
        { id: 1, code: 'cash', nameAr: 'صندوق', nameEn: 'Cash', accountType: 'asset' },
        { id: 2, code: 'bank', nameAr: 'بنك', nameEn: 'Bank', accountType: 'asset' },
        { id: 3, code: 'wallet', nameAr: 'محفظة', nameEn: 'Wallet', accountType: 'asset' },
        { id: 4, code: 'exchange', nameAr: 'صراف', nameEn: 'Exchange', accountType: 'asset' },
        { id: 5, code: 'warehouse', nameAr: 'مخزن', nameEn: 'Warehouse', accountType: 'asset' },
        { id: 6, code: 'supplier', nameAr: 'مورد', nameEn: 'Supplier', accountType: 'liability' },
        { id: 7, code: 'customer', nameAr: 'عميل', nameEn: 'Customer', accountType: 'revenue' },
        { id: 8, code: 'general', nameAr: 'عام', nameEn: 'General', accountType: 'asset' },
      ];
      setAccountSubTypes(defaultSubTypes);
    }
  };

  // ==================== معالجات الأحداث ====================

  const handleOpenDialog = (account?: Account) => {
    if (account) {
      setEditMode(true);
      setCurrentAccountId(account.id);
      fetchAccountDetails(account.id);
    } else {
      setEditMode(false);
      setCurrentAccountId(null);
      setFormData({
        ...initialFormData,
        subSystemId: subSystemId || 0,
        accountCode: "",
        displayOrder: accounts.length + 1,
      });
      setOpenDialog(true);
    }
  };

  const fetchAccountDetails = async (accountId: number) => {
    try {
      const response = await axios.get(`/api/custom-system/v2/accounts/${accountId}`);
      const account = response.data;
      const accountLevel = account.parentAccountId && account.parentAccountId > 0 ? "sub" : "main";
      
      setFormData({
        subSystemId: account.subSystemId || 0,
        accountCode: account.accountCode,
        accountNameAr: account.accountNameAr,
        accountNameEn: account.accountNameEn || "",
        accountType: account.accountType,
        accountLevel: accountLevel,
        accountSubTypeId: account.accountSubTypeId || 0,
        parentAccountId: account.parentAccountId || 0,
        level: account.level,
        displayOrder: account.displayOrder || 0,
        description: account.description || "",
        isActive: account.isActive,
        allowManualEntry: account.allowManualEntry,
        requiresCostCenter: account.requiresCostCenter,
        requiresParty: account.requiresParty,
        currencies: account.currencies || [],
      });
      setOpenDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في جلب تفاصيل الحساب");
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentAccountId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddCurrency = () => {
    setFormData((prev) => ({
      ...prev,
      currencies: [...prev.currencies, { currencyId: 0, isDefault: false }],
    }));
  };

  const handleRemoveCurrency = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      currencies: prev.currencies.filter((_, i) => i !== index),
    }));
  };

  const handleCurrencyChange = (index: number, field: string, value: any) => {
    const newCurrencies = [...formData.currencies];
    newCurrencies[index] = {
      ...newCurrencies[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      currencies: newCurrencies,
    }));
  };

  const handleSubmit = async () => {
    // التحقق من صحة البيانات
    if (!formData.accountCode.trim()) {
      setError("رقم الحساب مطلوب");
      return;
    }
    if (!formData.accountNameAr.trim()) {
      setError("اسم الحساب بالعربية مطلوب");
      return;
    }

    try {
      setSaving(true);
      const submitData: any = {
        ...formData,
        subSystemId: subSystemId || formData.subSystemId || null,
        accountSubTypeId: formData.accountLevel === "sub" ? formData.accountSubTypeId : null,
        parentAccountId: formData.parentAccountId > 0 ? formData.parentAccountId : null,
        displayOrder: formData.displayOrder || 0,
      };

      if (editMode && currentAccountId) {
        await axios.put(`/api/custom-system/v2/accounts/${currentAccountId}`, submitData);
        setSuccess("تم تحديث الحساب بنجاح");
      } else {
        await axios.post("/api/custom-system/v2/accounts", submitData);
        setSuccess("تم إضافة الحساب بنجاح");
      }
      handleCloseDialog();
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حفظ الحساب");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return;
    
    try {
      await axios.delete(`/api/custom-system/v2/accounts/${accountToDelete.id}`);
      setSuccess(`تم حذف الحساب "${accountToDelete.accountNameAr}" بنجاح`);
      fetchAccounts();
    } catch (err: any) {
      setError(err.response?.data?.error || "فشل في حذف الحساب");
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  // ==================== الدوال المساعدة ====================

  const getAccountTypeInfo = (type: string) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  const filteredAccounts = useMemo(() => {
    let filtered = accounts;
    
    // فلترة حسب التبويب
    if (currentTab !== "all") {
      filtered = filtered.filter(acc => acc.accountType === currentTab);
    }
    
    // فلترة حسب البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(acc => 
        acc.accountCode.toLowerCase().includes(term) ||
        acc.accountNameAr.toLowerCase().includes(term) ||
        (acc.accountNameEn && acc.accountNameEn.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [accounts, currentTab, searchTerm]);

  const mainAccounts = useMemo(() => {
    return accounts.filter(acc => !acc.parentAccountId || acc.parentAccountId === 0);
  }, [accounts]);

  // ==================== العرض ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      {/* رأس الصفحة */}
      <Card className="mb-6 border-0 bg-white/95 backdrop-blur-xl shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/30">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  دليل الحسابات
                </CardTitle>
                <CardDescription className="text-slate-500 mt-1">
                  إدارة شاملة للحسابات المحاسبية
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAccounts}
                className="border-violet-200 text-violet-600 hover:bg-violet-50 hover:border-violet-300 transition-all duration-300"
              >
                <RefreshCw className={cn("h-4 w-4 ml-2", loading && "animate-spin")} />
                تحديث
              </Button>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:shadow-purple-500/50"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة حساب
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* رسائل التنبيه */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 flex-1">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-500 hover:text-red-700 hover:bg-red-100">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
          <p className="text-emerald-700 flex-1">{success}</p>
          <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* التبويبات والبحث */}
      <Card className="mb-6 border-0 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-100">
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full md:w-auto">
              <TabsList className="h-14 bg-transparent rounded-none border-b-0 p-0 w-full md:w-auto justify-start">
                <TabsTrigger 
                  value="all" 
                  className="h-14 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-violet-50/50 data-[state=active]:text-violet-700 transition-all"
                >
                  الكل
                  <Badge variant="secondary" className="mr-2 bg-slate-100">{accounts.length}</Badge>
                </TabsTrigger>
                {accountTypes.map((type) => {
                  const count = accounts.filter(a => a.accountType === type.value).length;
                  const Icon = type.icon;
                  return (
                    <TabsTrigger 
                      key={type.value} 
                      value={type.value}
                      className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-violet-50/50 data-[state=active]:text-violet-700 transition-all"
                    >
                      <Icon className="h-4 w-4 ml-2" />
                      {type.label}
                      {count > 0 && <Badge variant="secondary" className="mr-2 bg-slate-100">{count}</Badge>}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
            <div className="p-4 md:p-0 md:pl-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="بحث في الحسابات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 w-full md:w-64 border-slate-200 focus:border-violet-300 focus:ring-violet-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول الحسابات */}
      <Card className="border-0 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-600 hover:to-purple-600">
                  <TableHead className="text-white font-bold">رقم الحساب</TableHead>
                  <TableHead className="text-white font-bold">اسم الحساب</TableHead>
                  <TableHead className="text-white font-bold">النوع</TableHead>
                  <TableHead className="text-white font-bold text-center">التصنيف</TableHead>
                  <TableHead className="text-white font-bold text-center">الترتيب</TableHead>
                  <TableHead className="text-white font-bold text-center">الحالة</TableHead>
                  <TableHead className="text-white font-bold text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
                        <p className="text-slate-500">جاري تحميل الحسابات...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-4 rounded-full bg-slate-100">
                          <Calculator className="h-10 w-10 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">لا توجد حسابات</p>
                        <p className="text-slate-400 text-sm">ابدأ بإضافة حساب جديد</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog()}
                          className="mt-2 border-violet-200 text-violet-600 hover:bg-violet-50"
                        >
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة حساب
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => {
                    const typeInfo = getAccountTypeInfo(account.accountType);
                    const isMain = !account.parentAccountId || account.parentAccountId === 0;
                    return (
                      <TableRow 
                        key={account.id}
                        className="hover:bg-violet-50/50 transition-colors group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              typeInfo.color
                            )} />
                            <span className="font-mono font-bold text-violet-700">
                              {account.accountCode}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-all",
                              isMain 
                                ? "bg-gradient-to-br from-violet-100 to-purple-100" 
                                : "bg-slate-100"
                            )}>
                              {isMain ? (
                                <FolderTree className="h-4 w-4 text-violet-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-slate-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">{account.accountNameAr}</p>
                              {account.accountNameEn && (
                                <p className="text-xs text-slate-400">{account.accountNameEn}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "font-medium",
                              typeInfo.color,
                              "text-white border-0"
                            )}
                          >
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={isMain ? "default" : "outline"}
                            className={cn(
                              isMain 
                                ? "bg-violet-100 text-violet-700 hover:bg-violet-100" 
                                : "border-slate-300 text-slate-600"
                            )}
                          >
                            {isMain ? "رئيسي" : "فرعي"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-slate-500 font-mono">
                            {account.displayOrder || account.level || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {account.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                              <CheckCircle2 className="h-3 w-3 ml-1" />
                              نشط
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                              <XCircle className="h-3 w-3 ml-1" />
                              غير نشط
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(account)}
                              className="h-8 w-8 text-violet-600 hover:text-violet-700 hover:bg-violet-100"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(account)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* نافذة إضافة/تعديل الحساب */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {editMode ? "تعديل حساب" : "إضافة حساب جديد"}
                </DialogTitle>
                <DialogDescription className="text-violet-100 mt-1">
                  {editMode ? "قم بتعديل بيانات الحساب" : "أدخل بيانات الحساب الجديد"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* القسم الأول: المعلومات الأساسية */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-violet-700">
                  <Info className="h-5 w-5" />
                  <h3 className="font-bold">المعلومات الأساسية</h3>
                </div>
                <Separator className="bg-violet-100" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* رقم الحساب */}
                  <div className="space-y-2">
                    <Label htmlFor="accountCode" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-violet-500" />
                      رقم الحساب
                      {!editMode && <span className="text-red-500">*</span>}
                      {editMode && <Lock className="h-3 w-3 text-slate-400" />}
                    </Label>
                    <Input
                      id="accountCode"
                      value={formData.accountCode}
                      onChange={(e) => handleInputChange("accountCode", e.target.value)}
                      disabled={editMode}
                      placeholder="مثال: 1001"
                      className={cn(
                        "font-mono",
                        editMode 
                          ? "bg-slate-50 border-dashed border-slate-300 text-slate-500" 
                          : "border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                      )}
                    />
                    <p className="text-xs text-slate-500">
                      {editMode ? "لا يمكن تعديل رقم الحساب" : "رقم فريد للحساب"}
                    </p>
                  </div>

                  {/* رقم الترتيب */}
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder" className="flex items-center gap-2">
                      <ArrowUpDown className="h-4 w-4 text-violet-500" />
                      رقم الترتيب
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                      placeholder="1"
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                    />
                    <p className="text-xs text-slate-500">لترتيب عرض الحسابات</p>
                  </div>

                  {/* الحساب الأب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-violet-500" />
                      الحساب الأب
                    </Label>
                    <Select
                      value={formData.parentAccountId.toString()}
                      onValueChange={(value) => handleInputChange("parentAccountId", parseInt(value))}
                    >
                      <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                        <SelectValue placeholder="بدون حساب أب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">بدون حساب أب</SelectItem>
                        {accounts
                          .filter((acc) => acc.id !== currentAccountId)
                          .map((acc) => {
                            const isMain = !acc.parentAccountId || acc.parentAccountId === 0;
                            return (
                              <SelectItem key={acc.id} value={acc.id.toString()}>
                                {acc.accountCode} - {acc.accountNameAr}
                                {isMain && " (رئيسي)"}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">اختياري: لترتيب الشجرة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* اسم الحساب بالعربية */}
                  <div className="space-y-2">
                    <Label htmlFor="accountNameAr" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      اسم الحساب بالعربية
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="accountNameAr"
                      value={formData.accountNameAr}
                      onChange={(e) => handleInputChange("accountNameAr", e.target.value)}
                      placeholder="مثال: صندوق التحصيل"
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                      dir="rtl"
                    />
                  </div>

                  {/* اسم الحساب بالإنجليزية */}
                  <div className="space-y-2">
                    <Label htmlFor="accountNameEn" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      اسم الحساب بالإنجليزية
                    </Label>
                    <Input
                      id="accountNameEn"
                      value={formData.accountNameEn}
                      onChange={(e) => handleInputChange("accountNameEn", e.target.value)}
                      placeholder="Example: Cash Box"
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* القسم الثاني: تصنيف الحساب */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-violet-700">
                  <Layers className="h-5 w-5" />
                  <h3 className="font-bold">تصنيف الحساب</h3>
                </div>
                <Separator className="bg-violet-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* نوع الحساب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-violet-500" />
                      نوع الحساب
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => {
                        handleInputChange("accountType", value);
                        handleInputChange("accountSubTypeId", 0);
                      }}
                    >
                      <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                        <SelectValue placeholder="اختر نوع الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1 rounded", type.color)}>
                                  <Icon className="h-3 w-3 text-white" />
                                </div>
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* مستوى الحساب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-violet-500" />
                      مستوى الحساب
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.accountLevel}
                      onValueChange={(value: "main" | "sub") => {
                        handleInputChange("accountLevel", value);
                        if (value === "main") {
                          handleInputChange("accountSubTypeId", 0);
                        }
                      }}
                    >
                      <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                        <SelectValue placeholder="اختر مستوى الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">
                          <div className="flex items-center gap-2">
                            <FolderTree className="h-4 w-4 text-violet-500" />
                            حساب رئيسي
                          </div>
                        </SelectItem>
                        <SelectItem value="sub">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            حساب فرعي
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* نوع الحساب الفرعي - يظهر فقط للحسابات الفرعية */}
                {formData.accountLevel === "sub" && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-violet-500" />
                      نوع الحساب الفرعي
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.accountSubTypeId.toString()}
                      onValueChange={(value) => handleInputChange("accountSubTypeId", parseInt(value))}
                    >
                      <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                        <SelectValue placeholder="اختر النوع الفرعي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">اختر النوع الفرعي</SelectItem>
                        {accountSubTypes
                          .filter((subType) => subType.accountType === formData.accountType)
                          .map((subType) => {
                            const Icon = accountSubTypeIcons[subType.code] || FileText;
                            return (
                              <SelectItem key={subType.id} value={subType.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-violet-500" />
                                  {subType.nameAr}
                                </div>
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* القسم الثالث: الإعدادات الإضافية */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-violet-700">
                  <Settings2 className="h-5 w-5" />
                  <h3 className="font-bold">الإعدادات الإضافية</h3>
                </div>
                <Separator className="bg-violet-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* المستوى */}
                  <div className="space-y-2">
                    <Label htmlFor="level" className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-violet-500" />
                      المستوى
                    </Label>
                    <Input
                      id="level"
                      type="number"
                      min={1}
                      value={formData.level}
                      onChange={(e) => handleInputChange("level", parseInt(e.target.value) || 1)}
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-200"
                    />
                  </div>

                  {/* الوصف */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-violet-500" />
                      الوصف
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="وصف اختياري للحساب..."
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-200 min-h-[80px]"
                    />
                  </div>
                </div>

                {/* مفاتيح التبديل */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cn(
                    "p-4 transition-all cursor-pointer",
                    formData.isActive 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-slate-50 border-slate-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {formData.isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <Label className="font-medium">الحالة</Label>
                          <p className="text-xs text-slate-500">
                            {formData.isActive ? "الحساب نشط" : "الحساب غير نشط"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </Card>

                  <Card className={cn(
                    "p-4 transition-all cursor-pointer",
                    formData.allowManualEntry 
                      ? "bg-violet-50 border-violet-200" 
                      : "bg-slate-50 border-slate-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {formData.allowManualEntry ? (
                          <Unlock className="h-5 w-5 text-violet-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <Label className="font-medium">القيد اليدوي</Label>
                          <p className="text-xs text-slate-500">
                            {formData.allowManualEntry ? "مسموح" : "غير مسموح"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.allowManualEntry}
                        onCheckedChange={(checked) => handleInputChange("allowManualEntry", checked)}
                        className="data-[state=checked]:bg-violet-500"
                      />
                    </div>
                  </Card>
                </div>
              </div>

              {/* القسم الرابع: العملات */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-violet-700">
                    <Coins className="h-5 w-5" />
                    <h3 className="font-bold">العملات المدعومة</h3>
                  </div>
                  {currencies.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCurrency}
                      className="border-violet-200 text-violet-600 hover:bg-violet-50"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة عملة
                    </Button>
                  )}
                </div>
                <Separator className="bg-violet-100" />

                {currencies.length === 0 ? (
                  <div className="p-6 text-center bg-amber-50 rounded-xl border border-amber-200">
                    <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <p className="font-medium text-amber-700">لا توجد عملات متاحة</p>
                    <p className="text-sm text-amber-600 mt-1">
                      يرجى إضافة عملات من صفحة إدارة العملات أولاً
                    </p>
                  </div>
                ) : formData.currencies.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Coins className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-500">لا توجد عملات محددة</p>
                    <p className="text-sm text-slate-400 mt-1">
                      اضغط على "إضافة عملة" لتحديد العملات المدعومة
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.currencies.map((curr, index) => (
                      <Card key={index} className="p-4 border-violet-100 hover:border-violet-200 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Select
                              value={curr.currencyId.toString()}
                              onValueChange={(value) => handleCurrencyChange(index, "currencyId", parseInt(value))}
                            >
                              <SelectTrigger className="border-violet-200 focus:border-violet-400 focus:ring-violet-200">
                                <SelectValue placeholder="اختر العملة" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">اختر العملة</SelectItem>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.id} value={currency.id.toString()}>
                                    {currency.nameAr} ({currency.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm text-slate-500">افتراضي</Label>
                            <Switch
                              checked={curr.isDefault}
                              onCheckedChange={(checked) => handleCurrencyChange(index, "isDefault", checked)}
                              className="data-[state=checked]:bg-violet-500"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCurrency(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 bg-slate-50 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              <X className="h-4 w-4 ml-2" />
              إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/30"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  {editMode ? "تحديث" : "إضافة"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف الحساب "{accountToDelete?.accountNameAr}"؟
              <br />
              <span className="text-amber-600 font-medium">
                ملاحظة: لا يمكن حذف الحساب إذا كانت هناك حركات مالية عليه.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="m-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="m-0 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
