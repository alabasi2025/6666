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
  accountTypeId?: number | null;
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

const defaultAccountTypes = [
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
  const [accountTypes, setAccountTypes] = useState<any[]>(defaultAccountTypes);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
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
  const [hasTransactions, setHasTransactions] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // ==================== جلب البيانات ====================
  
  useEffect(() => {
    fetchCurrencies();
    fetchSubSystems();
    fetchAccountSubTypes();
    fetchAccountTypes();
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

  const fetchAccountTypes = async () => {
    try {
      const response = await axios.get("/api/custom-system/v2/account-types", {
        params: { subSystemId, includeInactive: true },
      });
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setAccountTypes(response.data);
      } else {
        setAccountTypes(defaultAccountTypes);
      }
    } catch (err) {
      console.warn("فشل في تحميل أنواع الحسابات:", err);
      setAccountTypes(defaultAccountTypes);
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
      setHasTransactions(false);
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
      // اعتمد على الحقل level أولاً (2 = فرعي)، ثم احتياطياً على وجود parentAccountId
      const accountLevel = account.level && account.level > 1
        ? "sub"
        : account.parentAccountId && account.parentAccountId > 0
          ? "sub"
          : "main";
      setHasTransactions(!!(account.hasTransactions || (account.balances && account.balances.length > 0)));
      
      // إذا كان الحساب لديه accountTypeId، ابحث عن typeCode المقابل
      let accountTypeValue = account.accountType;
      if (account.accountTypeId) {
        const foundType = accountTypes.find((t: any) => t.id === account.accountTypeId);
        if (foundType) {
          accountTypeValue = foundType.typeCode || foundType.value || account.accountType;
        }
      }
      
      setFormData({
        subSystemId: account.subSystemId || 0,
        accountCode: account.accountCode,
        accountNameAr: account.accountNameAr,
        accountNameEn: account.accountNameEn || "",
        accountType: accountTypeValue,
        accountLevel: accountLevel,
        accountSubTypeId: account.accountSubTypeId || 0,
        parentAccountId: account.parentAccountId || 0,
        level: account.level || (accountLevel === "sub" ? 2 : 1),
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
      
      // ابحث عن accountTypeId من accountType (typeCode)
      let accountTypeId = null;
      const selectedType = accountTypes.find((t: any) => 
        (t.typeCode === formData.accountType) || (t.value === formData.accountType)
      );
      if (selectedType) {
        accountTypeId = selectedType.id || null;
      }
      
      const submitData: any = {
        ...formData,
        accountTypeId: accountTypeId,
        subSystemId: subSystemId || formData.subSystemId || null,
        accountSubTypeId: formData.accountLevel === "sub" ? formData.accountSubTypeId : null,
        parentAccountId: formData.parentAccountId > 0 ? formData.parentAccountId : null,
        currencies: formData.accountLevel === "sub" ? formData.currencies : [],
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

  const getAccountTypeInfoByAccount = (account: Account) => {
    if (account.accountTypeId) {
      const foundById = accountTypes.find((t: any) => t.id === account.accountTypeId);
      if (foundById) {
        return {
          label: foundById.typeNameAr || foundById.typeCode,
          color: foundById.color || "bg-slate-500",
          icon:
            foundById.icon ||
            (foundById.typeCode === "asset" ? PiggyBank :
              foundById.typeCode === "liability" ? CreditCard :
              foundById.typeCode === "equity" ? Building :
              foundById.typeCode === "revenue" ? Coins :
              foundById.typeCode === "expense" ? Wallet :
              PiggyBank),
          value: foundById.typeCode || account.accountType,
        };
      }
    }
    return getAccountTypeInfo(account.accountType);
  };

  const getAccountTypeInfo = (type: string) => {
    const found = accountTypes.find(
      (t: any) => t.typeCode === type || t.value === type
    );

    if (found) {
      return {
        label: found.typeNameAr || found.label || type,
        color: found.color || "bg-slate-500",
        icon:
          found.icon ||
          (found.typeCode === "asset" ? PiggyBank :
            found.typeCode === "liability" ? CreditCard :
            found.typeCode === "equity" ? Building :
            found.typeCode === "revenue" ? Coins :
            found.typeCode === "expense" ? Wallet :
            PiggyBank),
        value: found.typeCode || found.value || type,
      };
    }

    const fallback = defaultAccountTypes.find((t) => t.value === type) || defaultAccountTypes[0];
    return {
      label: fallback.label,
      color: fallback.color,
      icon: fallback.icon,
      value: fallback.value,
    };
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
    return filteredAccounts.filter(acc => !acc.parentAccountId || acc.parentAccountId === 0);
  }, [filteredAccounts]);

  const childrenMap = useMemo(() => {
    const map: Record<number, Account[]> = {};
    filteredAccounts.forEach(acc => {
      if (acc.parentAccountId) {
        if (!map[acc.parentAccountId]) map[acc.parentAccountId] = [];
        map[acc.parentAccountId].push(acc);
      }
    });
    Object.keys(map).forEach(k => {
      map[Number(k)] = map[Number(k)].sort((a, b) => a.accountCode.localeCompare(b.accountCode));
    });
    return map;
  }, [filteredAccounts]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isLocked = editMode && formData.accountLevel === "sub" && hasTransactions;

  // ==================== العرض ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
      {/* رأس الصفحة */}
      <Card className="mb-6 border-0 bg-gradient-to-r from-violet-100 via-purple-100 to-indigo-100 backdrop-blur-xl shadow-2xl">
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
      <Card className="mb-6 border-0 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 backdrop-blur-xl shadow-xl overflow-hidden">
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
                  const info = getAccountTypeInfo(type.typeCode || type.value);
                  const typeValue = info.value || type.value;
                  const count = accounts.filter(a => a.accountType === typeValue).length;
                  const Icon = info.icon || PiggyBank;
                  return (
                    <TabsTrigger 
                      key={typeValue} 
                      value={typeValue}
                      className="h-14 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:bg-violet-50/50 data-[state=active]:text-violet-700 transition-all"
                    >
                      <Icon className="h-4 w-4 ml-2" />
                      {info.label}
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
      <Card className="border-2 border-violet-300/50 bg-gradient-to-br from-blue-50 via-violet-50 to-purple-100 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none"></div>
        <CardContent className="p-0 relative z-10">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-800 border-b-4 border-violet-500">
                  <TableHead className="text-white font-bold text-base py-4">📋 رقم الحساب</TableHead>
                  <TableHead className="text-white font-bold text-base py-4">💼 اسم الحساب</TableHead>
                  <TableHead className="text-white font-bold text-base py-4">🏷️ النوع</TableHead>
                  <TableHead className="text-white font-bold text-base text-center py-4">📊 التصنيف</TableHead>
                  <TableHead className="text-white font-bold text-base text-center py-4">🔢 الترتيب</TableHead>
                  <TableHead className="text-white font-bold text-base text-center py-4">✅ الحالة</TableHead>
                  <TableHead className="text-white font-bold text-base text-center py-4">⚙️ الإجراءات</TableHead>
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
                  mainAccounts.map((account) => {
                    const typeInfo = getAccountTypeInfoByAccount(account);
                    const children = childrenMap[account.id] || [];
                    const isExpanded = expandedRows[account.id];
                    return (
                      <React.Fragment key={account.id}>
                        <TableRow 
                          className="bg-gradient-to-r from-blue-100 via-indigo-100 to-violet-100 hover:from-blue-200 hover:via-indigo-200 hover:to-violet-200 transition-all duration-300 group cursor-pointer border-b-4 border-violet-400 shadow-md hover:shadow-xl"
                          onClick={() => toggleRow(account.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {children.length > 0 ? (
                                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-lg shadow-violet-500/50 border border-violet-400">
                                  {isExpanded ? <ChevronDown className="h-5 w-5 text-white" /> : <ChevronRight className="h-5 w-5 text-white" />}
                                </div>
                              ) : (
                                <FolderTree className="h-6 w-6 text-indigo-600" />
                              )}
                              <span className="font-mono font-extrabold text-indigo-900 text-lg">
                                {account.accountCode}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-purple-600/40 border-2 border-violet-400">
                                <FolderTree className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <p className="font-extrabold text-slate-900 text-lg">{account.accountNameAr}</p>
                                {account.accountNameEn && (
                                  <p className="text-sm text-indigo-700 font-bold">{account.accountNameEn}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary"
                              className={cn(
                                "font-bold text-sm px-4 py-1 shadow-lg",
                                typeInfo.color,
                                "text-white border-2 border-white/20"
                              )}
                            >
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-gradient-to-r from-violet-700 to-purple-700 text-white hover:from-violet-800 hover:to-purple-800 shadow-lg shadow-purple-600/50 font-extrabold px-5 py-1 text-sm">
                              ⭐ رئيسي
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-indigo-800 font-mono font-bold text-base">
                              {account.displayOrder || account.level || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {account.isActive ? (
                              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/40 font-bold text-sm px-4">
                                <CheckCircle2 className="h-4 w-4 ml-1" />
                                نشط
                              </Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg">
                                <XCircle className="h-4 w-4 ml-1" />
                                غير نشط
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(account)}
                                className="h-10 w-10 text-violet-700 hover:text-violet-900 hover:bg-violet-200 shadow-lg hover:shadow-xl transition-all duration-300 border border-violet-300"
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(account)}
                                className="h-10 w-10 text-red-700 hover:text-red-900 hover:bg-red-200 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-300"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && children.map((child) => {
                          const childInfo = getAccountTypeInfoByAccount(child);
                          return (
                            <TableRow 
                              key={child.id}
                              className="bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 hover:from-amber-200 hover:via-orange-100 hover:to-yellow-200 transition-all duration-300 border-b-2 border-orange-300 shadow-sm hover:shadow-md"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2 pl-8">
                                  <div className="w-1.5 h-8 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full shadow-sm"></div>
                                  <FileText className="h-5 w-5 text-orange-600" />
                                  <span className="font-mono font-bold text-orange-900 text-base">{child.accountCode}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3 pl-6">
                                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 border-2 border-orange-300 shadow-lg shadow-orange-500/30">
                                    <FileText className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-base">{child.accountNameAr}</p>
                                    {child.accountNameEn && (
                                      <p className="text-xs text-orange-700 font-semibold">{child.accountNameEn}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="secondary"
                                  className={cn(
                                    "font-bold text-sm px-4 py-1 shadow-md",
                                    childInfo.color,
                                    "text-white border-2 border-white/30"
                                  )}
                                >
                                  {childInfo.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold px-4 shadow-lg shadow-orange-500/40">
                                  📄 فرعي
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-orange-800 font-mono font-bold text-base">
                                  {child.displayOrder || child.level || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {child.isActive ? (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 border-0 shadow-md font-bold">
                                    <CheckCircle2 className="h-4 w-4 ml-1" />
                                    نشط
                                  </Badge>
                                ) : (
                                  <Badge className="bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-md">
                                    <XCircle className="h-4 w-4 ml-1" />
                                    غير نشط
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDialog(child)}
                                    className="h-9 w-9 text-orange-700 hover:text-orange-900 hover:bg-orange-200 shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(child)}
                                    className="h-9 w-9 text-red-700 hover:text-red-900 hover:bg-red-200 shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900 border-4 border-violet-500">
          <DialogHeader className="px-6 py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-white/30 to-white/10 border-2 border-white/50 shadow-xl">
                <Calculator className="h-8 w-8" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-extrabold drop-shadow-lg">
                  {editMode ? "✏️ تعديل حساب" : "➕ إضافة حساب جديد"}
                </DialogTitle>
                <DialogDescription className="text-indigo-100 mt-1 font-semibold text-base">
                  {editMode ? "قم بتعديل بيانات الحساب بدقة" : "أدخل بيانات الحساب الجديد بدقة"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isLocked && (
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 text-amber-900 px-6 py-4 mx-6 mt-4 rounded-xl flex items-center gap-4 shadow-lg">
              <div className="p-2 rounded-full bg-amber-500">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-semibold">
                🔒 هذا حساب فرعي لديه معاملات سابقة؛ تم قفل الحقول لتجنب مشاكل بالبيانات.
              </div>
            </div>
          )}

          <ScrollArea className="max-h-[calc(90vh-180px)] bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-100">
            <div className="p-6 space-y-6">
              {/* القسم الأول: المعلومات الأساسية */}
              <Card className="border-2 border-violet-300 shadow-xl bg-gradient-to-br from-white to-violet-50">
                <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white pb-3 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/30">
                      <Info className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-lg">📋 المعلومات الأساسية</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* رقم الحساب */}
                  <div className="space-y-2">
                    <Label htmlFor="accountCode" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <Hash className="h-5 w-5 text-violet-600" />
                      رقم الحساب
                      <span className="text-red-600 text-lg">*</span>
                    </Label>
                    <Input
                      id="accountCode"
                      value={formData.accountCode}
                      onChange={(e) => handleInputChange("accountCode", e.target.value)}
                      disabled={isLocked}
                      placeholder="مثال: 1001"
                      className={cn(
                        "font-mono font-bold text-base h-12",
                        "border-2 border-violet-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 shadow-md",
                        isLocked && "bg-slate-100 text-slate-500"
                      )}
                    />
                    <p className="text-xs text-indigo-600 font-semibold">
                      🔢 رقم فريد للحساب
                    </p>
                  </div>

                  {/* رقم الترتيب */}
                  <div className="space-y-2">
                    <Label htmlFor="displayOrder" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <ArrowUpDown className="h-5 w-5 text-violet-600" />
                      رقم الترتيب
                    </Label>
                    <Input
                      id="displayOrder"
                      type="number"
                      min={1}
                      value={formData.displayOrder}
                      onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                      disabled={isLocked}
                      placeholder="1"
                      className="font-bold text-base h-12 border-2 border-violet-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 shadow-md"
                    />
                    <p className="text-xs text-indigo-600 font-semibold">📊 لترتيب عرض الحسابات</p>
                  </div>

                  {/* الحساب الأب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <FolderTree className="h-5 w-5 text-violet-600" />
                      الحساب الأب
                    </Label>
                    <Select
                      value={formData.parentAccountId.toString()}
                      onValueChange={(value) => handleInputChange("parentAccountId", parseInt(value))}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 border-2 border-violet-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 shadow-md font-semibold">
                        <SelectValue placeholder="🏠 بدون حساب أب" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-violet-300">
                        <SelectItem value="0" className="font-semibold">🏠 بدون حساب أب</SelectItem>
                        {accounts
                          // إظهار الحسابات الرئيسية فقط كحساب أب
                          .filter((acc) => acc.id !== currentAccountId && (!acc.parentAccountId || acc.parentAccountId === 0))
                          .map((acc) => (
                            <SelectItem key={acc.id} value={acc.id.toString()} className="font-medium">
                              📁 {acc.accountCode} - {acc.accountNameAr} (رئيسي)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-indigo-600 font-semibold">🌳 اختياري: لترتيب الشجرة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* اسم الحساب بالعربية */}
                  <div className="space-y-2">
                    <Label htmlFor="accountNameAr" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <FileText className="h-5 w-5 text-violet-600" />
                      اسم الحساب بالعربية
                      <span className="text-red-600 text-lg">*</span>
                    </Label>
                    <Input
                      id="accountNameAr"
                      value={formData.accountNameAr}
                      onChange={(e) => handleInputChange("accountNameAr", e.target.value)}
                      disabled={isLocked}
                      placeholder="مثال: صندوق التحصيل"
                      className="font-bold text-base h-12 border-2 border-violet-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 shadow-md"
                      dir="rtl"
                    />
                  </div>

                  {/* اسم الحساب بالإنجليزية */}
                  <div className="space-y-2">
                    <Label htmlFor="accountNameEn" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <FileText className="h-5 w-5 text-violet-600" />
                      اسم الحساب بالإنجليزية
                    </Label>
                    <Input
                      id="accountNameEn"
                      value={formData.accountNameEn}
                      onChange={(e) => handleInputChange("accountNameEn", e.target.value)}
                      disabled={isLocked}
                      placeholder="Example: Cash Box"
                      className="font-semibold text-base h-12 border-2 border-violet-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 shadow-md"
                      dir="ltr"
                    />
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* القسم الثاني: تصنيف الحساب */}
              <Card className="border-2 border-indigo-300 shadow-xl bg-gradient-to-br from-white to-indigo-50">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white pb-3 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/30">
                      <Layers className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-lg">🏷️ تصنيف الحساب</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* نوع الحساب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <Building2 className="h-5 w-5 text-indigo-600" />
                      نوع الحساب
                      <span className="text-red-600 text-lg">*</span>
                    </Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => {
                        handleInputChange("accountType", value);
                        handleInputChange("accountSubTypeId", 0);
                      }}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 border-2 border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 shadow-md font-semibold">
                        <SelectValue placeholder="🏢 اختر نوع الحساب" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-indigo-300">
                        {accountTypes.map((type) => {
                          const info = getAccountTypeInfo(type.typeCode || type.value);
                          const Icon = info.icon || PiggyBank;
                          return (
                            <SelectItem key={info.value} value={info.value} className="font-semibold">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1.5 rounded-lg shadow-sm", info.color)}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                {info.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* مستوى الحساب */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <FolderTree className="h-5 w-5 text-indigo-600" />
                      مستوى الحساب
                      <span className="text-red-600 text-lg">*</span>
                    </Label>
                    <Select
                      value={formData.accountLevel}
                      onValueChange={(value: "main" | "sub") => {
                        handleInputChange("accountLevel", value);
                        handleInputChange("level", value === "sub" ? 2 : 1);
                        if (value === "main") {
                          handleInputChange("accountSubTypeId", 0);
                          handleInputChange("currencies", []); // الحساب الرئيسي بلا عملات
                        }
                      }}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 border-2 border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 shadow-md font-semibold">
                        <SelectValue placeholder="📊 اختر مستوى الحساب" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-indigo-300">
                        <SelectItem value="main" className="font-bold">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
                              <FolderTree className="h-4 w-4 text-white" />
                            </div>
                            ⭐ حساب رئيسي
                          </div>
                        </SelectItem>
                        <SelectItem value="sub" className="font-bold">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-sm">
                              <FileText className="h-4 w-4 text-white" />
                            </div>
                            📄 حساب فرعي
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* نوع الحساب الفرعي - يظهر فقط للحسابات الفرعية */}
                {formData.accountLevel === "sub" && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <Wallet className="h-5 w-5 text-indigo-600" />
                      نوع الحساب الفرعي
                      <span className="text-red-600 text-lg">*</span>
                    </Label>
                    <Select
                      value={formData.accountSubTypeId.toString()}
                      onValueChange={(value) => handleInputChange("accountSubTypeId", parseInt(value))}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="h-12 border-2 border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-200 shadow-md font-semibold">
                        <SelectValue placeholder="💼 اختر النوع الفرعي" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-indigo-300">
                        <SelectItem value="0" className="font-medium text-slate-500">اختر النوع الفرعي</SelectItem>
                        {accountSubTypes.map((subType) => {
                          const Icon = accountSubTypeIcons[subType.code] || FileText;
                          return (
                            <SelectItem key={subType.id} value={subType.id.toString()} className="font-semibold">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-indigo-600" />
                                {subType.nameAr}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                </CardContent>
              </Card>

              {/* القسم الثالث: الإعدادات الإضافية */}
              <Card className="border-2 border-emerald-300 shadow-xl bg-gradient-to-br from-white to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white pb-3 pt-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/30">
                      <Settings2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-lg">⚙️ الإعدادات الإضافية</h3>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* المستوى */}
                  <div className="space-y-2">
                    <Label htmlFor="level" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <Layers className="h-5 w-5 text-emerald-600" />
                      المستوى
                    </Label>
                    <Input
                      id="level"
                      type="number"
                      min={1}
                      value={formData.level}
                      onChange={(e) => handleInputChange("level", parseInt(e.target.value) || 1)}
                      className="font-bold text-base h-12 border-2 border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 shadow-md"
                    />
                  </div>

                  {/* الوصف */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2 font-bold text-slate-900 text-base">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      الوصف
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      disabled={isLocked}
                      placeholder="وصف اختياري للحساب..."
                      className="font-medium text-base border-2 border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-200 min-h-[80px] shadow-md"
                    />
                  </div>
                </div>

                {/* مفاتيح التبديل */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={cn(
                    "p-5 transition-all cursor-pointer border-2 shadow-lg",
                    formData.isActive 
                      ? "bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-400" 
                      : "bg-gradient-to-br from-slate-100 to-gray-100 border-slate-300"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          formData.isActive ? "bg-emerald-500" : "bg-slate-400"
                        )}>
                          {formData.isActive ? (
                            <CheckCircle2 className="h-6 w-6 text-white" />
                          ) : (
                            <XCircle className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <Label className="font-extrabold text-base text-slate-900">✅ الحالة</Label>
                          <p className="text-sm font-semibold text-slate-600">
                            {formData.isActive ? "الحساب نشط" : "الحساب غير نشط"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                        className="data-[state=checked]:bg-emerald-600 scale-125"
                      />
                    </div>
                  </Card>

                  <Card className={cn(
                    "p-5 transition-all cursor-pointer border-2 shadow-lg",
                    formData.allowManualEntry 
                      ? "bg-gradient-to-br from-violet-50 to-purple-100 border-violet-400" 
                      : "bg-gradient-to-br from-slate-100 to-gray-100 border-slate-300"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-xl",
                          formData.allowManualEntry ? "bg-violet-500" : "bg-slate-400"
                        )}>
                          {formData.allowManualEntry ? (
                            <Unlock className="h-6 w-6 text-white" />
                          ) : (
                            <Lock className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div>
                          <Label className="font-extrabold text-base text-slate-900">🔓 القيد اليدوي</Label>
                          <p className="text-sm font-semibold text-slate-600">
                            {formData.allowManualEntry ? "مسموح" : "غير مسموح"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={formData.allowManualEntry}
                        onCheckedChange={(checked) => handleInputChange("allowManualEntry", checked)}
                        className="data-[state=checked]:bg-violet-600 scale-125"
                      />
                    </div>
                  </Card>
                </div>
                </CardContent>
              </Card>

              {/* القسم الرابع: العملات (فقط للحساب الفرعي) */}
              {formData.accountLevel === "sub" ? (
                <Card className="border-2 border-amber-300 shadow-xl bg-gradient-to-br from-white to-amber-50">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white pb-3 pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/30">
                          <Coins className="h-6 w-6" />
                        </div>
                        <h3 className="font-extrabold text-lg">💰 العملات المدعومة</h3>
                      </div>
                      {currencies.length > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleAddCurrency}
                          className="bg-white/30 hover:bg-white/50 text-white border-white/50 font-bold"
                        >
                          <Plus className="h-4 w-4 ml-1" />
                          إضافة عملة
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {currencies.length === 0 ? (
                    <div className="p-8 text-center bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl border-2 border-red-400 shadow-xl">
                      <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-rose-600 w-fit mx-auto mb-4 shadow-lg">
                        <AlertCircle className="h-12 w-12 text-white" />
                      </div>
                      <p className="font-extrabold text-red-900 text-xl">⚠️ لا توجد عملات متاحة</p>
                      <p className="text-base text-red-700 font-bold mt-2">
                        يرجى إضافة عملات من صفحة إدارة العملات أولاً
                      </p>
                    </div>
                  ) : formData.currencies.length === 0 ? (
                    <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-400 shadow-lg">
                      <Coins className="h-14 w-14 text-blue-400 mx-auto mb-4" />
                      <p className="font-bold text-blue-700 text-xl">💰 لا توجد عملات محددة</p>
                      <p className="text-base text-blue-600 font-semibold mt-2">
                        اضغط على "إضافة عملة" لتحديد العملات المدعومة
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.currencies.map((curr, index) => (
                        <Card key={index} className="border-2 border-amber-400 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 shadow-lg hover:shadow-xl transition-all hover:border-amber-500">
                          <CardContent className="p-5">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Select
                                  value={curr.currencyId.toString()}
                                  onValueChange={(value) => handleCurrencyChange(index, "currencyId", parseInt(value))}
                                >
                                  <SelectTrigger className="h-12 border-2 border-amber-300 focus:border-amber-600 focus:ring-4 focus:ring-amber-200 shadow-md font-bold">
                                    <SelectValue placeholder="💵 اختر العملة" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-2 border-amber-300">
                                    <SelectItem value="0" className="font-medium text-slate-500">اختر العملة</SelectItem>
                                    {currencies.map((currency) => (
                                      <SelectItem key={currency.id} value={currency.id.toString()} className="font-bold">
                                        {currency.nameAr} ({currency.code})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-3 bg-emerald-100 px-4 py-2 rounded-lg border-2 border-emerald-300">
                                <Label className="text-sm text-emerald-800 font-bold">⭐ افتراضي</Label>
                                <Switch
                                  checked={curr.isDefault}
                                  onCheckedChange={(checked) => handleCurrencyChange(index, "isDefault", checked)}
                                  className="data-[state=checked]:bg-emerald-600 scale-125"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveCurrency(index)}
                                className="h-10 w-10 text-red-700 hover:text-red-900 hover:bg-red-200 shadow-lg transition-all"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-2 border-amber-200 bg-amber-50 shadow-md">
                  <CardContent className="py-5">
                    <div className="flex items-center gap-3 text-amber-700">
                      <Coins className="h-5 w-5" />
                      <p className="font-semibold text-sm">الحساب الرئيسي لا يرتبط بعملات. العملات تُضاف للحسابات الفرعية فقط.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-5 bg-gradient-to-r from-slate-100 via-gray-100 to-slate-100 border-t-4 border-violet-500 shadow-2xl">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseDialog}
              className="h-12 px-8 border-2 border-slate-400 text-slate-700 hover:bg-slate-200 hover:border-slate-500 font-bold text-base shadow-lg transition-all"
            >
              <X className="h-5 w-5 ml-2" />
              ❌ إلغاء
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || isLocked}
              className="h-12 px-8 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-purple-500/50 font-extrabold text-base transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 ml-2 animate-spin" />
                  ⏳ جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 ml-2" />
                  {isLocked ? "🔒 مقفل لوجود معاملات" : editMode ? "✏️ تحديث الحساب" : "➕ إضافة الحساب"}
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
